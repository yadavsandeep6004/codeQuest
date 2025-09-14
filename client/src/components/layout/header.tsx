import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";

export function Header() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-foreground">CodeQuest</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link href="/problems" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location.startsWith('/problems') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}>
              Problems
            </Link>
            <Link href="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === '/dashboard' || location === '/' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}>
              Dashboard
            </Link>
            <Link href="/submissions" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              location === '/submissions' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            }`}>
              Submissions
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === '/admin' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}>
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-secondary-foreground">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block" data-testid="text-username">
                {user.username}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
