import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../../src/components/auth/LoginForm";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const mockLocation = {
  pathname: "/",
  search: "",
  href: "http://localhost/",
  origin: "http://localhost",
};

Object.defineProperty(window, "location", {
  value: {
    ...mockLocation,
    replace: vi.fn(),
  },
  writable: true,
});

// Mock window.history
Object.defineProperty(window, "history", {
  value: {
    replaceState: vi.fn(),
  },
  writable: true,
});

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.search = "";
    mockLocation.href = "http://localhost/";
  });

  it("renders the login form with all necessary elements", () => {
    expect(screen.getByTestId("login-form-container")).toBeInTheDocument();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("handles login error", async () => {
    const user = userEvent.setup();
    const errorMessage = "Invalid credentials";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    });

    render(<LoginForm />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const submitButton = screen.getByTestId("submit-button");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    const error = await screen.findByTestId("error-message");
    expect(error).toHaveTextContent(errorMessage);
    expect(error).toHaveClass("text-red-500", "bg-red-50");
    expect(screen.getByTestId("submit-button")).toBeEnabled();
  });
});
