import { Topbar } from "./Topbar";
import { useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
}

interface TopbarWrapperProps {
  initialUser?: {
    name: string;
    email: string;
  } | null;
}

export function TopbarWrapper({ initialUser }: TopbarWrapperProps) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const checkUser = async () => {
    try {
      const response = await fetch("/api/auth/me");

      if (!response.ok) {
        // Użytkownik nie jest zalogowany lub wystąpił inny błąd
        setUser(null);
        return;
      }

      const data = await response.json();
      setUser({
        name: data.user.name || data.user.email,
        email: data.user.email,
      });
    } catch (err) {
      // Logujemy tylko nieoczekiwane błędy, nie status 401
      if (err instanceof Error && !err.message.includes("401")) {
        console.error("Unexpected error fetching user:", err);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialUser) {
      checkUser();
    }
  }, [initialUser]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Error during logout:", data.error);
        return;
      }

      // Zamiast używać router.push, używamy window.location
      window.location.href = "/login";
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  };

  if (isLoading) {
    return null; // lub możesz zwrócić loader/spinner
  }

  if (!user) {
    return null;
  }

  return <Topbar user={user} onLogout={handleLogout} />;
}
