import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import SignupPage from "./SignupPage";
import * as api from "../../api/api";

vi.mock("../../api/api");

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={["/signup"]}>
      <SignupPage />
    </MemoryRouter>,
  );
}

describe("SignupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all registration fields", () => {
    renderSignup();

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // there are two password fields — just check at least one is present
    expect(screen.getAllByLabelText(/password/i).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });

  it("shows error when passwords do not match", async () => {
    renderSignup();

    await userEvent.type(screen.getByLabelText(/first name/i), "Jane");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");

    const [passwordField, confirmField] = screen.getAllByLabelText(/password/i);
    await userEvent.type(passwordField, "secret123");
    await userEvent.type(confirmField, "different");

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i }),
    );

    await waitFor(() =>
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument(),
    );
    expect(api.register).not.toHaveBeenCalled();
  });

  it("calls register API with correct values on valid submit", async () => {
    api.register.mockResolvedValueOnce({
      data: "User registered successfully",
    });
    renderSignup();

    await userEvent.type(screen.getByLabelText(/first name/i), "Jane");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");

    const [passwordField, confirmField] = screen.getAllByLabelText(/password/i);
    await userEvent.type(passwordField, "secret123");
    await userEvent.type(confirmField, "secret123");

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i }),
    );

    await waitFor(() =>
      expect(api.register).toHaveBeenCalledWith(
        "Jane",
        "Doe",
        "jane@example.com",
        "secret123",
      ),
    );
  });

  it("shows API error message when registration fails", async () => {
    api.register.mockRejectedValueOnce(new Error("Email already exists"));
    renderSignup();

    await userEvent.type(screen.getByLabelText(/first name/i), "Jane");
    await userEvent.type(screen.getByLabelText(/last name/i), "Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "dup@example.com");

    const [passwordField, confirmField] = screen.getAllByLabelText(/password/i);
    await userEvent.type(passwordField, "secret123");
    await userEvent.type(confirmField, "secret123");

    await userEvent.click(
      screen.getByRole("button", { name: /create account/i }),
    );

    await waitFor(() =>
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument(),
    );
  });

  it("has a link back to the login page", () => {
    renderSignup();

    // Multiple "Sign in" links exist (Appbar + footer) — check at least one points to /login
    const links = screen.getAllByRole("link", { name: /sign in/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links.some((l) => l.getAttribute("href") === "/login")).toBe(true);
  });
});
