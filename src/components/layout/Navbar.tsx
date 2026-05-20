import { CalendarDays, LogOut, Menu, QrCode, Ticket, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isAuthenticated, isOrganiser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <CalendarDays className="size-5 text-primary" />
          <span>EventFlow</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/events" className="text-muted-foreground transition-colors hover:text-foreground">
            Events
          </Link>
          {isAuthenticated && (
            <Link to="/tickets" className="text-muted-foreground transition-colors hover:text-foreground">
              My Tickets
            </Link>
          )}
          {isOrganiser && (
            <>
              <Link to="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
                Dashboard
              </Link>
              <Link to="/events/new" className="text-muted-foreground transition-colors hover:text-foreground">
                Create Event
              </Link>
            </>
          )}
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-9 rounded-full p-0">
                  <Avatar className="size-8">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/tickets" className="cursor-pointer">
                    <Ticket className="mr-2 size-4" /> My Tickets
                  </Link>
                </DropdownMenuItem>
                {isOrganiser && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <User className="mr-2 size-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/events/new" className="cursor-pointer">
                        <CalendarDays className="mr-2 size-4" /> Create Event
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile menu button — placeholder for sheet */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
