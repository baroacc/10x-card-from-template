import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { User } from "@supabase/supabase-js";

interface ProfileProps {
  user: User;
}

export function Profile({ user }: ProfileProps) {
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const joinDate = new Date(user.created_at).toLocaleDateString();
  const userInitials = user.email?.charAt(0).toUpperCase() || "U";

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

      // Redirect to login page after successful deactivation
      window.location.href = '/login';
    } catch (error) {
      console.error('Error deactivating account:', error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas blokowania konta');
    } finally {
      setIsDeactivating(false);
      setDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.user_metadata?.avatar_url} />
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