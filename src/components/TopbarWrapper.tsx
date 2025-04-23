import { Topbar } from './Topbar'
import { useEffect, useState } from 'react'

interface User {
  name: string;
  email: string;
}

export function TopbarWrapper() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.status === 401) {
          // Użytkownik nie jest zalogowany
          setUser(null);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUser({
          name: data.user.name || data.user.email,
          email: data.user.email
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Error during logout:', data.error);
        return;
      }

      // Przekierowanie do strony logowania nastąpi przez middleware
      window.location.href = '/login';
    } catch (err) {
      console.error('Unexpected error during logout:', err);
    }
  }

  if (isLoading) {
    return null; // lub możesz zwrócić loader/spinner
  }

  if (!user) {
    return null;
  }

  return <Topbar user={user} onLogout={handleLogout} />
} 