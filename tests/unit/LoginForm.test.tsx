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
  replaceState: vi.fn(),
};

Object.defineProperty(window, "location", {
  value: mockLocation,
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
    const { container } = render(<LoginForm />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full max-w-md mx-auto"
          data-slot="card"
        >
          <div
            class="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6"
            data-slot="card-header"
          >
            <div
              class="leading-none font-semibold"
              data-slot="card-title"
            >
              Welcome back
            </div>
            <div
              class="text-muted-foreground text-sm"
              data-slot="card-description"
            >
              Enter your email and password to sign in to your account
            </div>
          </div>
          <div
            class="px-6"
            data-slot="card-content"
          >
            <form
              class="space-y-4"
            >
              <div
                class="grid gap-2"
                data-slot="form-item"
              >
                <label
                  class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive"
                  data-error="false"
                  data-slot="form-label"
                  for=":r0:-form-item"
                >
                  Email
                </label>
                <input
                  aria-describedby=":r0:-form-item-description"
                  aria-invalid="false"
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  data-slot="form-control"
                  id=":r0:-form-item"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                  value=""
                />
              </div>
              <div
                class="grid gap-2"
                data-slot="form-item"
              >
                <label
                  class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 data-[error=true]:text-destructive"
                  data-error="false"
                  data-slot="form-label"
                  for=":r1:-form-item"
                >
                  Password
                </label>
                <input
                  aria-describedby=":r1:-form-item-description"
                  aria-invalid="false"
                  class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                  data-slot="form-control"
                  id=":r1:-form-item"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  value=""
                />
              </div>
              <button
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3 w-full"
                data-slot="button"
                type="submit"
              >
                Sign in
              </button>
            </form>
          </div>
          <div
            class="items-center px-6 [.border-t]:pt-6 flex flex-col space-y-4"
            data-slot="card-footer"
          >
            <div
              class="text-sm text-center"
            >
              <a
                class="text-primary hover:underline"
                href="/forgot-password"
              >
                Forgot your password?
              </a>
            </div>
            <div
              class="text-sm text-center"
            >
              Don't have an account?
               
              <a
                class="text-primary hover:underline"
                href="/register"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  it("displays welcome message when URL has registered=true parameter", async () => {
    mockLocation.search = "?registered=true";

    render(<LoginForm />);

    const welcomeMessage = await screen.findByText(
      "Your account has been created successfully. Please sign in to continue."
    );
    expect(welcomeMessage).toHaveClass("text-green-500", "bg-green-50");
    expect(window.history.replaceState).toHaveBeenCalled();
  });

  it("validates email existence", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    await user.type(passwordInput, "validPassword123");
    await user.click(submitButton);

    const emailErrorMessage = await screen.findByText("Please enter a valid email address.");
    expect(emailErrorMessage).toBeInTheDocument();

    await user.clear(emailInput);
    await user.type(emailInput, "valid@email.com");
    await user.click(submitButton);

    expect(emailErrorMessage).not.toBeInTheDocument();
  });

  it("validates password length", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    await user.type(emailInput, "valid@email.com");
    await user.type(passwordInput, "short");
    await user.click(submitButton);

    const passwordErrorMessage = await screen.findByText("Password must be at least 8 characters long.");
    expect(passwordErrorMessage).toBeInTheDocument();

    await user.clear(passwordInput);
    await user.type(passwordInput, "validPassword123");
    await user.click(submitButton);

    expect(passwordErrorMessage).not.toBeInTheDocument();
  });

  it("handles login error", async () => {
    const user = userEvent.setup();
    const errorMessage = "Invalid credentials";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: errorMessage }),
    });

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: "Sign in" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    const error = await screen.findByText(errorMessage);
    expect(error).toHaveClass("text-red-500", "bg-red-50");
    expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
  });
});
