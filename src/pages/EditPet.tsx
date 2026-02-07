import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders, getUser } from '@/lib/auth';
import { speciesOptions, dogBreeds, catBreeds } from '@/data/mockData';

export default function EditPet() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pet, setPet] = useState<{
    id: string;
    name: string;
    species: string;
    breed: string;
    color: string;
    dateOfBirth: string | null;
    sex: string;
    neutered: boolean;
    notes: string | null;
    microchipNumber: string;
  } | null>(null);
  const [species, setSpecies] = useState('dog');
  const [form, setForm] = useState({
    name: '',
    breed: '',
    color: '',
    dateOfBirth: '',
    sex: '',
    neutered: false,
    notes: '',
  });
  const displayName = getUser()?.email?.split('@')[0] ?? 'User';
  const baseBreeds = species === 'dog' ? dogBreeds : species === 'cat' ? catBreeds : ['Other'];
  const breeds =
    form.breed && !baseBreeds.includes(form.breed)
      ? [form.breed, ...baseBreeds]
      : baseBreeds;

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
        if (!cancelled) {
          setPet(data);
          setSpecies(data.species ?? 'dog');
          setForm({
            name: data.name ?? '',
            breed: data.breed ?? '',
            color: data.color ?? '',
            dateOfBirth: data.dateOfBirth ?? '',
            sex: data.sex ?? '',
            neutered: Boolean(data.neutered),
            notes: data.notes ?? '',
          });
        }
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
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/pets/${pet.id}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          breed: form.breed.trim(),
          color: form.color.trim(),
          dateOfBirth: form.dateOfBirth || undefined,
          sex: form.sex || undefined,
          neutered: form.neutered,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to update pet.');
        setSaving(false);
        return;
      }
      window.location.href = `/pet-details?id=${pet.id}`;
    } catch {
      setError('Could not reach the server.');
      setSaving(false);
    }
  };

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
            <CardTitle className="font-display text-xl">Edit Pet</CardTitle>
            <CardDescription>
              Update details for {pet?.name}
              {pet?.microchipNumber && (
                <span className="ml-2 font-mono text-muted-foreground">
                  ({pet.microchipNumber})
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Pet Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breed">Breed *</Label>
                  <Select
                    value={form.breed}
                    onValueChange={(v) => setForm({ ...form, breed: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select breed" />
                    </SelectTrigger>
                    <SelectContent>
                      {breeds.length > 0 ? (
                        breeds.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="other">Other</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="color">Color/Markings *</Label>
                  <Input
                    id="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="pl-10"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex *</Label>
                  <Select
                    value={form.sex}
                    onValueChange={(v) => setForm({ ...form, sex: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="neutered"
                      checked={form.neutered}
                      onCheckedChange={(c) => setForm({ ...form, neutered: c as boolean })}
                    />
                    <Label htmlFor="neutered">Neutered/Spayed</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" asChild>
                  <Link to={`/pet-details?id=${pet?.id}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
