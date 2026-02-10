import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PawPrint,
  ClipboardList,
  Search,
  AlertTriangle,
  UserCog,
  ArrowLeftRight,
  Headphones,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';

interface DashboardLayoutProps {
  children: ReactNode;
  userName?: string;
}

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/my-pets-timeline', label: 'My Pets', icon: PawPrint },
  { href: '/register', label: 'Register Pet', icon: ClipboardList },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/lost-pet', label: 'Report Lost', icon: AlertTriangle },
  { href: '/transfer-ownership', label: 'Transfer', icon: ArrowLeftRight },
  { href: '/transfer-requests', label: 'Transfer requests', icon: Inbox },
  { href: '/my-details', label: 'My Details', icon: UserCog },
  { href: '/ai-call-centre', label: 'AI Support', icon: Headphones },
];

export function DashboardLayout({ children, userName = 'User' }: DashboardLayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex min-h-screen flex-col">
      <Header isLoggedIn userName={userName} />
      
      <div className="container flex flex-1 gap-6 py-6">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-4 shadow-sm">
            <nav className="flex flex-col gap-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive(link.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>


        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>

      <Footer />
      <ChatWidget />
    </div>
  );
}
