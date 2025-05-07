"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopbarProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  onLogout: () => void;
}

export function Topbar({ user, onLogout }: TopbarProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-black" data-testid="topbar">
      <div className="flex h-14 items-center justify-end pr-[50px]">
        <nav className="flex items-center gap-6">
          <a
            href="/generate"
            className="font-medium text-white/70 hover:text-white transition-colors"
            data-testid="generate-link"
          >
            Generowanie
          </a>
          <a
            href="/flashcard"
            className="font-medium text-white/70 hover:text-white transition-colors"
            data-testid="flashcards-link"
          >
            Moje Fiszki
          </a>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none" data-testid="user-menu-trigger">
              <div className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount data-testid="user-menu-content">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none" data-testid="user-name">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground" data-testid="user-email">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="profile-menu-item">
                <a href="/profile" className="w-full">
                  Profil
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout} data-testid="logout-menu-item">
                Wyloguj się
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
