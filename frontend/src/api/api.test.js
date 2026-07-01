import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as api from "./api.js";

// ── helpers ───────────────────────────────────────────────────────────────────

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(status, text = `HTTP ${status}`) {
  return new Response(text, { status });
}

const fakeLocalStorage = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
  };
})();

describe("api module", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("localStorage", fakeLocalStorage);
    fakeLocalStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── register ───────────────────────────────────────────────────────────────

  describe("register", () => {
    it("sends POST /auth/register and returns response", async () => {
      const payload = { data: "User registered successfully", success: true };
      fetch.mockResolvedValueOnce(jsonResponse(payload, 201));

      const result = await api.register(
        "Jane",
        "Doe",
        "jane@example.com",
        "secret",
      );

      expect(fetch).toHaveBeenCalledOnce();
      const [url, opts] = fetch.mock.calls[0];
      expect(url).toMatch(/\/auth\/register$/);
      expect(opts.method).toBe("POST");
      const body = JSON.parse(opts.body);
      expect(body).toMatchObject({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        password: "secret",
      });
      expect(result).toEqual(payload);
    });

    it("throws when the server responds with an error", async () => {
      fetch.mockResolvedValueOnce(errorResponse(400, "Email already exists"));

      await expect(
        api.register("Jane", "Doe", "dup@example.com", "pw"),
      ).rejects.toThrow("Email already exists");
    });
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe("login", () => {
    it("stores user info in localStorage on success", async () => {
      const payload = {
        success: true,
        data: {
          token: "access.token",
          refreshToken: "refresh.token",
          email: "jane@example.com",
          firstName: "Jane",
          lastName: "Doe",
        },
      };
      fetch.mockResolvedValueOnce(jsonResponse(payload));

      await api.login("jane@example.com", "secret");

      expect(localStorage.getItem("email")).toBe("jane@example.com");
      expect(localStorage.getItem("firstName")).toBe("Jane");
      expect(localStorage.getItem("lastName")).toBe("Doe");
    });

    it("throws on invalid credentials", async () => {
      fetch.mockResolvedValueOnce(errorResponse(401, "Unauthorized"));

      await expect(api.login("bad@example.com", "wrong")).rejects.toThrow();
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe("logout", () => {
    it("clears localStorage after logout", async () => {
      localStorage.setItem("email", "jane@example.com");
      localStorage.setItem("firstName", "Jane");
      fetch.mockResolvedValueOnce(jsonResponse({ success: true, data: null }));

      await api.logout();

      expect(localStorage.getItem("email")).toBeNull();
      expect(localStorage.getItem("firstName")).toBeNull();
    });

    it("clears localStorage even when server call fails", async () => {
      localStorage.setItem("email", "jane@example.com");
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await api.logout(); // should not throw

      expect(localStorage.getItem("email")).toBeNull();
    });
  });

  // ── createApplication ──────────────────────────────────────────────────────

  describe("createApplication", () => {
    it("sends POST /applications with application body", async () => {
      const newApp = {
        company: "Acme Corp",
        role: "Software Engineer",
        status: "APPLIED",
      };
      const payload = { success: true, data: { id: 1, ...newApp } };
      fetch.mockResolvedValueOnce(jsonResponse(payload, 201));

      const result = await api.createApplication(newApp);

      const [url, opts] = fetch.mock.calls[0];
      expect(url).toMatch(/\/applications$/);
      expect(opts.method).toBe("POST");
      expect(JSON.parse(opts.body)).toMatchObject(newApp);
      expect(result.data.id).toBe(1);
    });
  });

  // ── getAllApplications ─────────────────────────────────────────────────────

  describe("getAllApplications", () => {
    it("fetches /applications with no query string when no params", async () => {
      fetch.mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: { content: [], totalElements: 0 },
        }),
      );

      await api.getAllApplications();

      const [url] = fetch.mock.calls[0];
      expect(url).toMatch(/\/applications$/);
    });

    it("appends status and company query params", async () => {
      fetch.mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: { content: [], totalElements: 0 },
        }),
      );

      await api.getAllApplications({ status: "INTERVIEW", company: "Google" });

      const [url] = fetch.mock.calls[0];
      expect(url).toContain("status=INTERVIEW");
      expect(url).toContain("company=Google");
    });

    it("appends pagination params", async () => {
      fetch.mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: { content: [], totalElements: 0 },
        }),
      );

      await api.getAllApplications({ page: 2, size: 20 });

      const [url] = fetch.mock.calls[0];
      expect(url).toContain("page=2");
      expect(url).toContain("size=20");
    });
  });

  // ── updateApplication ──────────────────────────────────────────────────────

  describe("updateApplication", () => {
    it("sends PUT /applications/:id", async () => {
      const update = {
        company: "Acme",
        role: "Lead Engineer",
        status: "INTERVIEW",
      };
      fetch.mockResolvedValueOnce(
        jsonResponse({ success: true, data: { id: 5, ...update } }),
      );

      await api.updateApplication(5, update);

      const [url, opts] = fetch.mock.calls[0];
      expect(url).toMatch(/\/applications\/5$/);
      expect(opts.method).toBe("PUT");
    });
  });

  // ── deleteApplication ──────────────────────────────────────────────────────

  describe("deleteApplication", () => {
    it("sends DELETE /applications/:id", async () => {
      fetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

      await api.deleteApplication(5);

      const [url, opts] = fetch.mock.calls[0];
      expect(url).toMatch(/\/applications\/5$/);
      expect(opts.method).toBe("DELETE");
    });
  });
});
