import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  AlertCircle,
  Inbox,
  FileText,
  Ticket,
  Menu,
  X,
  LogOut,
  Search,
} from "lucide-react";
import { clearAuth, getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/pets", label: "Pets", icon: PawPrint },
  { href: "/admin/promo", label: "Promo codes", icon: Ticket },
  { href: "/admin/disputes", label: "Disputes & Complaints", icon: AlertCircle },
  { href: "/admin/escalations", label: "AI Escalations", icon: Inbox },
  { href: "/admin/logs", label: "Audit Logs", icon: FileText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  // Desktop: sidebar open by default. Mobile: closed; close when resizing to mobile
  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 768);
    const onResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  const handleSignOut = () => {
    clearAuth();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-14 min-w-0 items-center gap-2 px-3 sm:gap-4 sm:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Button
            variant="outline"
            className="min-w-0 flex-1 gap-2 rounded-lg border-border bg-muted/50 text-muted-foreground sm:max-w-md"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="hidden truncate text-sm sm:inline">Search or jump... (Ctrl+K)</span>
          </Button>
          <span className="hidden min-w-0 truncate text-sm text-muted-foreground sm:max-w-[180px] md:inline">
            {getUser()?.email ?? "Admin"}
          </span>
          <Button variant="ghost" size="icon" className="shrink-0" onClick={handleSignOut} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex min-w-0">
        {/* Sidebar: overlay on mobile, inline on md+ */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <div
                className="fixed inset-0 z-20 bg-black/50 md:hidden"
                aria-hidden
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-border bg-card shadow-lg md:relative md:top-0 md:h-auto md:w-auto md:shadow-none"
              >
                <nav className="flex flex-col gap-1 p-3">
                {adminNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link key={item.href} to={item.href}>
                      <span
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {/* Command palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search or navigate..." />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Pages">
            {adminNav.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => {
                  navigate(item.href);
                  setCommandOpen(false);
                }}
              >
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
