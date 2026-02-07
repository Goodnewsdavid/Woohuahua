import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders, getUser } from '@/lib/auth';
import { DEMO_PETS, type ApiPet } from '@/data/demoPets';

export default function MyPetsTimeline() {
  const [pets, setPets] = useState<ApiPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const displayName = getUser()?.email?.split('@')[0] ?? 'User';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/pets'), { headers: getAuthHeaders() });
        if (!res.ok) {
          if (!cancelled) setError('Failed to load pets.');
          return;
        }
        const data = await res.json();
        if (!cancelled) setPets(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError('Network error.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const displayPets = pets.length > 0 ? pets : DEMO_PETS;
  const showDemoBanner = !loading && !error && pets.length === 0;

  return (
    <DashboardLayout userName={displayName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">My Pets</h1>
            <p className="text-muted-foreground">
              Manage and view all your registered pets
            </p>
          </div>
          <Button asChild>
            <Link to="/register">
              <Plus className="h-4 w-4" />
              Register Pet
            </Link>
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading pets...</div>
        ) : (
          <>
            {showDemoBanner && (
              <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                Sample data — register a pet to see your own here.
              </div>
            )}
            {/* Pet Cards */}
            <div className="space-y-6">
              {displayPets.map((pet) => (
                <Card key={pet.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-surface border-b border-border">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-xl border-2 border-border bg-card">
                        {pet.imageUrl ? (
                          <img
                            src={pet.imageUrl}
                            alt={pet.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-2xl">
                            🐾
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="font-display">{pet.name}</CardTitle>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              pet.status === 'registered'
                                ? 'bg-success-light text-success'
                                : pet.status === 'lost'
                                ? 'bg-destructive-light text-destructive'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {pet.status}
                          </span>
                        </div>
                        <CardDescription>
                          {pet.breed} • {pet.sex === 'male' ? 'Male' : 'Female'} •{' '}
                          {pet.neutered ? 'Neutered' : 'Not Neutered'}
                        </CardDescription>
                      </div>
                      <Button variant="outline" asChild>
                        <Link to={`/pet-details?id=${pet.id}`}>
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Microchip</span>
                          <span className="font-mono font-medium">{pet.microchipNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date of Birth</span>
                          <span>{formatDate(pet.dateOfBirth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Registered</span>
                          <span>{formatDate(pet.registeredDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Color</span>
                          <span>{pet.color}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 text-sm font-medium text-foreground">
                          Recent Activity
                        </h4>
                        <p className="text-sm text-muted-foreground">No recent activity</p>
                      </div>
                    </div>
                    {!showDemoBanner && (
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/edit-pet?id=${pet.id}`}>Edit Details</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/transfer-ownership?id=${pet.id}`}>Transfer Ownership</Link>
                        </Button>
                        {pet.status !== 'lost' && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/lost-pet">Report Lost</Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {pets.length === 0 && !error && (
              <Card className="py-8 text-center">
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Register your first pet to see your own list here.
                  </p>
                  <Button asChild>
                    <Link to="/register">Register Your First Pet</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
