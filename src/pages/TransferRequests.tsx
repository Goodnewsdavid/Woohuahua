import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Check, X, PawPrint } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders, getUser } from '@/lib/auth';

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

export default function TransferRequests() {
  const [incoming, setIncoming] = useState<IncomingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const displayName = getUser()?.email?.split('@')[0] ?? 'User';

  const load = async () => {
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
    load();
  }, []);

  const handleAccept = async (id: string) => {
    setActing(id);
    try {
      const res = await fetch(apiUrl(`/api/transfers/${id}`), {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: 'Error', description: data.error ?? 'Failed to accept.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Accepted', description: data.message ?? 'You are now the owner of this pet.' });
      load();
    } catch {
      toast({ title: 'Error', description: 'Request failed.', variant: 'destructive' });
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id: string) => {
    setActing(id);
    try {
      const res = await fetch(apiUrl(`/api/transfers/${id}`), {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: 'Error', description: data.error ?? 'Failed to reject.', variant: 'destructive' });
        return;
      }
      toast({ title: 'Rejected', description: 'Transfer request rejected.' });
      load();
    } catch {
      toast({ title: 'Error', description: 'Request failed.', variant: 'destructive' });
    } finally {
      setActing(null);
    }
  };

  return (
    <DashboardLayout userName={displayName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Transfer requests</h1>
          <p className="text-muted-foreground">
            Requests sent to you to take ownership of a pet. Accept or reject below.
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : incoming.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 font-medium">No pending requests</p>
              <p className="text-sm text-muted-foreground">
                When someone sends you a transfer request, it will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {incoming.map((t) => (
              <Card key={t.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PawPrint className="h-4 w-4" />
                    {t.petName}
                  </CardTitle>
                  <CardDescription>
                    {t.fromName ? `${t.fromName} (${t.fromEmail})` : t.fromEmail} wants to transfer this pet to you.
                    Microchip: {t.microchipNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!!acting}
                    onClick={() => handleAccept(t.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!acting}
                    onClick={() => handleReject(t.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  {acting === t.id && <span className="text-sm text-muted-foreground">Processing…</span>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
