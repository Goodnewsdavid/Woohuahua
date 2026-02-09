import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PawPrint,
  Plus,
  Search,
  AlertTriangle,
  Headphones,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders } from '@/lib/auth';
import { isLoggedIn, getUser } from '@/lib/auth';
import { getDisplaySpecies } from '@/lib/pet';

type ApiPet = {
  id: string;
  microchipNumber: string;
  name: string;
  species: string;
  speciesOther?: string | null;
  breed: string;
  color: string;
  status: string;
  imageUrl: string | null;
  updatedAt: string;
};

const quickActions = [
  {
    icon: Plus,
    label: 'Register Pet',
    description: 'Add a new pet to the database',
    href: '/register',
    color: 'bg-primary',
  },
  {
    icon: Search,
    label: 'Search Database',
    description: 'Look up any microchip number',
    href: '/search',
    color: 'bg-secondary',
  },
  {
    icon: AlertTriangle,
    label: 'Report Lost Pet',
    description: 'Alert the network about a lost pet',
    href: '/lost-pet',
    color: 'bg-warning',
  },
  {
    icon: Headphones,
    label: 'AI Support',
    description: 'Get help from our AI assistant',
    href: '/ai-call-centre',
    color: 'bg-info',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const storedUser = getUser();
  const displayName = storedUser?.email?.split('@')[0] ?? 'User';
  const [pets, setPets] = useState<ApiPet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
      return;
    }
    if (storedUser?.role === 'AUTHORISED') {
      navigate('/authorised/search', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/pets'), { headers: getAuthHeaders() });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setPets(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(timestamp);
  };

  if (!isLoggedIn()) {
    return null;
  }

  return (
    <DashboardLayout userName={displayName}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="rounded-2xl bg-gradient-hero p-6 text-white lg:p-8">
          <h1 className="font-display text-2xl font-bold lg:text-3xl">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="mt-2 text-white/90">
            Manage your pets and keep their information up to date.
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <PawPrint className="h-4 w-4" />
              {loading ? '…' : `${pets.length} pet${pets.length !== 1 ? 's' : ''} registered`}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {pets.length > 0 ? 'Keep details up to date' : 'Register a pet to get started'}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.href}>
                  <Card className="card-hover h-full cursor-pointer border-2 border-transparent hover:border-primary/20">
                    <CardContent className="p-4">
                      <div
                        className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-foreground">{action.label}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* My Pets */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="font-display text-lg">My Pets</CardTitle>
                <CardDescription>Your registered pets</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-pets-timeline" className="flex items-center gap-1">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">Loading pets…</p>
                ) : pets.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No pets yet. <Link to="/register" className="text-primary underline">Register your first pet</Link>.
                  </p>
                ) : (
                  pets.map((pet) => (
                    <Link
                      key={pet.id}
                      to={`/pet-details?id=${pet.id}`}
                      className="flex items-center gap-4 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="h-14 w-14 overflow-hidden rounded-xl bg-muted">
                        {pet.imageUrl ? (
                          <img
                            src={pet.imageUrl}
                            alt={pet.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <PawPrint className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{pet.name}</h4>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                              pet.status === 'registered'
                                ? 'bg-success-light text-success dark:bg-green-900/30 dark:text-green-400'
                                : pet.status === 'lost'
                                ? 'bg-destructive-light text-destructive dark:bg-red-900/30 dark:text-red-400'
                                : pet.status === 'deceased'
                                ? 'bg-muted text-muted-foreground dark:bg-slate-700/50 dark:text-slate-300'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {pet.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pet.breed} • {getDisplaySpecies(pet.species, pet.speciesOther)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Chip: {pet.microchipNumber}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity — from pet updates */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest updates to your pets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="py-2 text-sm text-muted-foreground">Loading…</p>
                ) : pets.length === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">No activity yet.</p>
                ) : (
                  [...pets]
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map((pet) => (
                      <div key={pet.id} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-foreground">{pet.name} — details on file</p>
                          <p className="text-xs text-muted-foreground">
                            Last updated {formatTime(pet.updatedAt)}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
