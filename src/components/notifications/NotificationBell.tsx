import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders } from '@/lib/auth';

type IncomingItem = {
  id: string;
  petId: string;
  petName: string;
  microchipNumber: string;
  species: string;
  fromEmail: string;
  fromName: string | null;
  status: string;
  createdAt: string;
};

export function NotificationBell() {
  const [incoming, setIncoming] = useState<IncomingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchTransfers = async () => {
    if (!getAuthHeaders().Authorization) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/transfers'), { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setIncoming(data.incoming ?? []);
    } catch {
      setIncoming([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const pendingCount = incoming.length;

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) fetchTransfers();
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={pendingCount ? `${pendingCount} notification${pendingCount !== 1 ? 's' : ''} to respond to` : 'Notifications'}
        >
          <Bell className="h-5 w-5 text-foreground" />
          {pendingCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white"
              aria-hidden
            >
              {pendingCount > 99 ? '99+' : pendingCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          <p className="text-xs text-muted-foreground">
            {pendingCount === 0
              ? 'No pending requests to respond to'
              : `${pendingCount} pending transfer request${pendingCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <ScrollArea className="h-full max-h-[280px]">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Loading…
            </div>
          ) : incoming.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              You're all caught up.
            </div>
          ) : (
            <ul className="py-2">
              {incoming.map((item) => (
                <li key={item.id} className="border-b border-border/50 last:border-0">
                  <Link
                    to="/transfer-requests"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          Transfer: {item.petName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          From {item.fromName ?? item.fromEmail}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full justify-center" asChild>
            <Link to="/transfer-requests" onClick={() => setOpen(false)}>
              View all
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
