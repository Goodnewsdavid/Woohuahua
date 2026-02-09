import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Hash, Heart, Info, PawPrint, Flower2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders, getUser } from '@/lib/auth';
import { getDemoPetById, type ApiPet } from '@/data/demoPets';
import { getCondolenceMessage } from '@/lib/condolence';
import { getDisplaySpecies } from '@/lib/pet';

function formatDate(dateString: string | null) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function petStatusBadgeClass(status: string): string {
  if (status === 'registered') return 'bg-success-light text-success dark:bg-green-900/30 dark:text-green-400';
  if (status === 'lost') return 'bg-destructive-light text-destructive dark:bg-red-900/30 dark:text-red-400';
  if (status === 'deceased') return 'bg-muted text-muted-foreground dark:bg-slate-700/50 dark:text-slate-300';
  return 'bg-muted text-muted-foreground';
}

function PetDetailContent({
  pet,
  isDemo,
  onReportDeceased,
  reportingDeceased,
}: {
  pet: ApiPet;
  isDemo: boolean;
  onReportDeceased?: () => Promise<void>;
  reportingDeceased?: boolean;
}) {
  const isDeceased = pet.status === 'deceased';
  const { heading, quote } = getCondolenceMessage(pet.name);

  return (
    <div className="space-y-6">
      {/* Condolence message when pet is deceased */}
      {isDeceased && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
              <Flower2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">{heading}</p>
              <p className="text-sm text-muted-foreground italic">&ldquo;{quote}&rdquo;</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with image and name */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-surface border-b border-border">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-32 w-32 shrink-0 overflow-hidden rounded-xl border-2 border-border bg-card sm:h-40 sm:w-40">
              {pet.imageUrl ? (
                <img
                  src={pet.imageUrl}
                  alt={pet.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-5xl">
                  🐾
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="font-display text-2xl">{pet.name}</CardTitle>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${petStatusBadgeClass(pet.status)}`}
                >
                  {pet.status}
                </span>
                {isDemo && (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    Sample data
                  </span>
                )}
              </div>
              <CardDescription className="mt-1">
                {pet.breed} • {getDisplaySpecies(pet.species, (pet as { speciesOther?: string | null }).speciesOther)} • {pet.sex === 'male' ? 'Male' : 'Female'} •{' '}
                {pet.neutered ? 'Neutered' : 'Not neutered'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* All details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Info className="h-5 w-5" />
            Full details
          </CardTitle>
          <CardDescription>Complete information for this pet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Identification</h4>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    Microchip number
                  </dt>
                  <dd className="font-mono font-medium">{pet.microchipNumber}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{pet.name}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Species</dt>
                  <dd className="font-medium capitalize">{getDisplaySpecies(pet.species, (pet as { speciesOther?: string | null }).speciesOther)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Breed</dt>
                  <dd className="font-medium">{pet.breed}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Color</dt>
                  <dd className="font-medium">{pet.color}</dd>
                </div>
              </dl>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Profile & dates</h4>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    Sex
                  </dt>
                  <dd className="font-medium">{pet.sex === 'male' ? 'Male' : 'Female'}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Neutered</dt>
                  <dd className="font-medium">{pet.neutered ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Date of birth
                  </dt>
                  <dd className="font-medium">{formatDate(pet.dateOfBirth)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <PawPrint className="h-4 w-4" />
                    Registered
                  </dt>
                  <dd className="font-medium">{formatDate(pet.registeredDate)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-2">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium capitalize">{pet.status}</dd>
                </div>
              </dl>
            </div>
          </div>
          {pet.notes && (
            <div className="space-y-2 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-foreground">Notes</h4>
              <p className="text-sm text-muted-foreground">{pet.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isDemo && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to={`/edit-pet?id=${pet.id}`}>Edit details</Link>
          </Button>
          {!isDeceased && (
            <>
              <Button variant="outline" asChild>
                <Link to="/lost-pet">Report lost</Link>
              </Button>
              <Button
                variant="outline"
                className="text-muted-foreground hover:text-muted-foreground"
                disabled={reportingDeceased}
                onClick={onReportDeceased}
              >
                {reportingDeceased ? 'Updating…' : 'Report as deceased'}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function PetDetails() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const [pet, setPet] = useState<ApiPet | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const [reportingDeceased, setReportingDeceased] = useState(false);
  const displayName = getUser()?.email?.split('@')[0] ?? 'User';

  const isDemoId = id.startsWith('demo-');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('No pet specified.');
      return;
    }
    if (id.startsWith('demo-')) {
      const demo = getDemoPetById(id);
      if (demo) {
        setPet(demo);
      } else {
        setError('Pet not found.');
      }
      setLoading(false);
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
        if (!cancelled) setPet(data);
      } catch {
        if (!cancelled) setError('Could not reach the server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout userName={displayName}>
        <div className="py-12 text-center text-muted-foreground">Loading pet details...</div>
      </DashboardLayout>
    );
  }

  if (error || !pet) {
    return (
      <DashboardLayout userName={displayName}>
        <div className="space-y-4">
          <Button variant="ghost" asChild>
            <Link to="/my-pets-timeline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to My Pets
            </Link>
          </Button>
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error ?? 'Pet not found.'}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleReportDeceased = async () => {
    if (!pet || pet.status === 'deceased') return;
    setReportingDeceased(true);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/pets/${pet.id}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'deceased' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to update.');
      }
      const updated = await res.json();
      setPet(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setReportingDeceased(false);
    }
  };

  return (
    <DashboardLayout userName={displayName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" asChild>
            <Link to="/my-pets-timeline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to My Pets
            </Link>
          </Button>
        </div>
        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        <PetDetailContent
          pet={pet}
          isDemo={isDemoId}
          onReportDeceased={isDemoId ? undefined : handleReportDeceased}
          reportingDeceased={reportingDeceased}
        />
      </div>
    </DashboardLayout>
  );
}
