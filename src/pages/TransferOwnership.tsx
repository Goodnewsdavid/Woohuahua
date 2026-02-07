import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders, getUser } from '@/lib/auth';

export default function TransferOwnership() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pet, setPet] = useState<{ id: string; name: string; microchipNumber: string } | null>(null);
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [outgoing, setOutgoing] = useState<{ id: string; petName: string; toEmail: string; status: string; createdAt: string }[]>([]);
  const displayName = getUser()?.email?.split('@')[0] ?? 'User';

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('No pet specified.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/pets/${id}`), { headers: getAuthHeaders() });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (!cancelled) setError(data.error ?? 'Failed to load pet.');
          return;
        }
        const data = await res.json();
        if (!cancelled) setPet({ id: data.id, name: data.name, microchipNumber: data.microchipNumber });
      } catch {
        if (!cancelled) setError('Could not reach the server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pet) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl(`/api/pets/${pet.id}/transfer`), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newOwnerEmail: newOwnerEmail.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Transfer failed.');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setNewOwnerEmail('');
      loadOutgoing();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadOutgoing = async () => {
    try {
      const res = await fetch(apiUrl('/api/transfers'), { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setOutgoing(data.outgoing ?? []);
    } catch {
      setOutgoing([]);
    }
  };

  useEffect(() => {
    if (getAuthHeaders().Authorization) loadOutgoing();
  }, []);

  if (loading) {
    return (
      <DashboardLayout userName={displayName}>
        <div className="py-12 text-center text-muted-foreground">Loading pet...</div>
      </DashboardLayout>
    );
  }

  if (error && !pet) {
    return (
      <DashboardLayout userName={displayName}>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to="/my-pets-timeline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to My Pets
            </Link>
          </Button>
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout userName={displayName}>
        <div className="space-y-6">
          <Card className="border-2 border-success/30 bg-success-light/30">
            <CardContent className="py-12 text-center">
              <h2 className="font-display text-xl font-semibold text-success">
                Transfer request sent
              </h2>
              <p className="mt-2 text-muted-foreground">
                {newOwnerEmail} will see the request in their account and can accept or reject. You can see the status below.
              </p>
              <Button className="mt-6" asChild>
                <Link to="/transfer-ownership">Continue</Link>
              </Button>
            </CardContent>
          </Card>
          {outgoing.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your transfer requests</CardTitle>
                <CardDescription>Status of transfers you started</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {outgoing.slice(0, 5).map((t) => (
                    <li key={t.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <span>{t.petName} → {t.toEmail}</span>
                      <span className={`rounded-full px-2 py-0.5 font-medium ${
                        t.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        t.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'
                      }`}>{t.status}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={displayName}>
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to={`/pet-details?id=${pet?.id}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Pet Details
          </Link>
        </Button>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="font-display text-xl">Transfer Ownership</CardTitle>
            <CardDescription>
              Send a transfer request to a new owner. They must have an account (identified by email) and will see the request in-app; ownership only changes when they accept.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newOwnerEmail">New owner email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="newOwnerEmail"
                    type="email"
                    placeholder="newowner@example.com"
                    className="pl-10"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  The new owner must already have an account and verified email.
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                <p>
                  The receiver will get a notification and can accept or reject. The pet only moves to their account when they accept.
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting || !newOwnerEmail.trim()}>
                  {submitting ? 'Sending...' : 'Send transfer request'}
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/pet-details?id=${pet?.id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {outgoing.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your transfer requests</CardTitle>
              <CardDescription>Status visible to you</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {outgoing.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span>{t.petName} → {t.toEmail}</span>
                    <span className={`rounded-full px-2 py-0.5 font-medium ${
                      t.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                      t.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-muted text-muted-foreground'
                    }`}>{t.status}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
