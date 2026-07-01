import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import LoginPage from "./LoginPage";
import * as api from "../../api/api";

vi.mock("../../api/api");

// react-router's useNavigate needs a Router context
function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders email and password fields and a sign-in button", () => {
    renderLogin();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("calls login API with entered credentials on submit", async () => {
    api.login.mockResolvedValueOnce({ data: { token: "t" } });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "secret123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(api.login).toHaveBeenCalledWith("jane@example.com", "secret123");
  });

  it("shows error message on failed login", async () => {
    api.login.mockRejectedValueOnce(new Error("Unauthorized"));
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "bad@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrongpw");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/invalid email or password/i),
      ).toBeInTheDocument(),
    );
  });

  it("does not show error before form is submitted", () => {
    renderLogin();

    expect(
      screen.queryByText(/invalid email or password/i),
    ).not.toBeInTheDocument();
  });

  it("has a link to the sign-up page", () => {
    renderLogin();

    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });
});
