import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Calendar, Key, Loader2, AlertCircle, User, Phone, MapPin, Pencil, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { isLoggedIn, getUser, getAuthHeaders } from '@/lib/auth';
import { apiUrl } from '@/lib/api';

type Profile = {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  postcode: string | null;
};

export default function MyDetails() {
  const navigate = useNavigate();
  const storedUser = getUser();
  const displayName = storedUser?.email?.split('@')[0] ?? 'User';
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', postcode: '' });

  const fetchProfile = async () => {
    try {
      const res = await fetch(apiUrl('/api/auth/me'), { headers: getAuthHeaders() });
      if (res.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to load profile.');
        return;
      }
      setProfile(data);
      setForm({
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        postcode: data.postcode ?? '',
      });
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
      return;
    }
    fetchProfile();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch(apiUrl('/api/auth/me'), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          firstName: form.firstName.trim() || null,
          lastName: form.lastName.trim() || null,
          phone: form.phone.trim() || null,
          postcode: form.postcode.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: 'Update failed', description: data.error ?? 'Please try again.', variant: 'destructive' });
        setSaving(false);
        return;
      }
      setProfile(data);
      setForm({
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
        phone: data.phone ?? '',
        postcode: data.postcode ?? '',
      });
      setEditing(false);
      toast({ title: 'Profile updated', description: 'Your details have been saved.' });
    } catch {
      toast({ title: 'Error', description: 'Could not reach the server.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn()) return null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const fullName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email.split('@')[0]
    : displayName;

  return (
    <DashboardLayout userName={fullName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Details</h1>
          <p className="mt-1 text-muted-foreground">View and edit your account information.</p>
        </div>

        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="flex items-center gap-3 py-6">
              <AlertCircle className="h-10 w-10 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-foreground">Something went wrong</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && profile && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="font-display text-lg">Profile</CardTitle>
                  <CardDescription>Your personal details. You can edit these.</CardDescription>
                </div>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setForm({ firstName: profile.firstName ?? '', lastName: profile.lastName ?? '', phone: profile.phone ?? '', postcode: profile.postcode ?? '' }); }}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          placeholder="First name"
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                          disabled={saving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          placeholder="Last name"
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                          disabled={saving}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+44 7700 900000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        disabled={saving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Postcode</Label>
                      <Input
                        id="postcode"
                        placeholder="e.g. SW1A 1AA"
                        value={form.postcode}
                        onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                        disabled={saving}
                      />
                    </div>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save changes'}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium text-foreground">
                          {[profile.firstName, profile.lastName].filter(Boolean).join(' ') || '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">{profile.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Postcode</p>
                        <p className="font-medium text-foreground">{profile.postcode || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Account</CardTitle>
                  <CardDescription>Account status and security.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="font-medium text-foreground">{profile.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Email verified</span>
                    {profile.emailVerified ? (
                      <Badge variant="default" className="bg-green-600">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Not verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member since</p>
                      <p className="font-medium text-foreground">{formatDate(profile.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Security</CardTitle>
                  <CardDescription>Manage your password.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <Link to="/forgot-password">
                      <Key className="h-4 w-4" />
                      Change password
                    </Link>
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    You’ll receive a link by email to set a new password.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
