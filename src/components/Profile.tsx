import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface UserData {
  email: string | undefined;
  created_at: string;
  user_metadata: {
    avatar_url: string | null;
    name: string | null;
  };
}

export function Profile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUser({
          email: data.user.email,
          created_at: data.user.created_at,
          user_metadata: {
            avatar_url: data.user.user_metadata?.avatar_url || null,
            name: data.user.user_metadata?.name || null
          }
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleDeactivateAccount = async () => {
    try {
      setIsDeactivating(true);
      const response = await fetch('/api/auth/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Wystąpił błąd podczas blokowania konta');
      }

      window.location.href = '/login';
    } catch (error) {
      console.error('Error deactivating account:', error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas blokowania konta');
    } finally {
      setIsDeactivating(false);
      setDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Separator />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const joinDate = new Date(user.created_at).toLocaleDateString();
  const userInitials = user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.user_metadata.avatar_url || undefined} />
              <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">Profil użytkownika</CardTitle>
              <CardDescription>Zarządzaj swoim kontem</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="text-base">{user.email}</p>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Data dołączenia</h3>
              <p className="text-base">{joinDate}</p>
            </div>
            <Separator />
            <div className="flex flex-col space-y-2">
              <Button variant="outline" asChild>
                <a href="/auth/reset-password">Zmień hasło</a>
              </Button>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Zablokuj konto</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Czy na pewno chcesz zablokować swoje konto?</DialogTitle>
                    <DialogDescription>
                      Ta akcja jest nieodwracalna. Twoje konto zostanie trwale zablokowane.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                      disabled={isDeactivating}
                    >
                      Anuluj
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeactivateAccount}
                      disabled={isDeactivating}
                    >
                      {isDeactivating ? 'Blokowanie...' : 'Zablokuj konto'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 