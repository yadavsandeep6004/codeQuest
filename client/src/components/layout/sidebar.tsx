import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  FileText, 
  HelpCircle, 
  BarChart3,
  Settings 
} from "lucide-react";

export function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const navigationItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      active: location === "/dashboard" || location === "/"
    },
    {
      href: "/problems",
      icon: FileText,
      label: "Problems",
      active: location.startsWith("/problems")
    },
    {
      href: "/mcq",
      icon: HelpCircle,
      label: "MCQ & Quizzes",
      active: location.startsWith("/mcq")
    },
    {
      href: "/submissions",
      icon: BarChart3,
      label: "Submissions",
      active: location === "/submissions"
    }
  ];

  if (user.role === 'admin') {
    navigationItems.push({
      href: "/admin",
      icon: Settings,
      label: "Admin Panel",
      active: location === "/admin"
    });
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-card border-r border-border">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
