"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  useEffect(() => {
    // Sprawdzamy czy użytkownik przyszedł ze strony rejestracji
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("registered") === "true") {
      setWelcomeMessage("Your account has been created successfully. Please sign in to continue.");
      // Usuwamy parametr z URL bez przeładowania strony
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true);
      setError(null);
      setWelcomeMessage(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sign in");
      }

      // Przekierowanie nastąpi przez middleware
      window.location.replace(new URL("/generate", window.location.origin).href);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="login-form-container">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Enter your email and password to sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
            data-testid="login-form"
          >
            {welcomeMessage && (
              <div className="p-3 text-sm text-green-500 bg-green-50 rounded-md" data-testid="welcome-message">
                {welcomeMessage}
              </div>
            )}
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md" data-testid="error-message">
                {error}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} type="email" data-testid="email-input" />
                  </FormControl>
                  <FormMessage data-testid="email-error" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your password" {...field} type="password" data-testid="password-input" />
                  </FormControl>
                  <FormMessage data-testid="password-error" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="submit-button">
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center">
          <a href="/forgot-password" className="text-primary hover:underline">
            Forgot your password?
          </a>
        </div>
        <div className="text-sm text-center">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-primary hover:underline">
            Sign up
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
