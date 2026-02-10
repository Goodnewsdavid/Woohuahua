import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  Calendar,
  ArrowRight,
  Info,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders, getUser } from '@/lib/auth';

type PetOption = { id: string; name: string; microchipNumber: string; notes: string | null };

export default function LostPet() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<PetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    petId: '',
    lastSeenDate: '',
    lastSeenLocation: '',
    lastSeenPostcode: '',
    description: '',
    rewardOffered: false,
    notifyVets: true,
    notifyCouncil: true,
  });
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
        if (!cancelled)
          setPets(
            (Array.isArray(data) ? data : []).map((p: PetOption) => ({
              id: p.id,
              name: p.name,
              microchipNumber: p.microchipNumber,
              notes: p.notes ?? null,
            }))
          );
      } catch {
        if (!cancelled) setError('Could not reach the server.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.petId) return;
    setError(null);
    setSubmitting(true);
    try {
      const pet = pets.find((p) => p.id === formData.petId);
      const lostNote = [
        '[LOST REPORT]',
        `Last seen: ${formData.lastSeenDate || 'Unknown'} at ${formData.lastSeenLocation || 'Unknown'}`,
        formData.lastSeenPostcode && `Postcode: ${formData.lastSeenPostcode}`,
        formData.description && `Description: ${formData.description}`,
        formData.rewardOffered && 'Reward offered for safe return.',
      ]
        .filter(Boolean)
        .join('. ');
      const newNotes = pet?.notes ? `${pet.notes}\n\n${lostNote}` : lostNote;

      const res = await fetch(apiUrl(`/api/pets/${formData.petId}`), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: 'lost',
          notes: newNotes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to submit report.');
        setSubmitting(false);
        return;
      }
      navigate('/thank-you?type=lost');
    } catch {
      setError('Could not reach the server.');
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout userName={displayName}>
      <div className="container py-4 px-3 sm:py-8 sm:px-4 md:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-4 text-center sm:mb-8">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-warning sm:mb-4 sm:h-16 sm:w-16 sm:rounded-2xl">
              <AlertTriangle className="h-6 w-6 text-warning-foreground sm:h-8 sm:w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Report a Lost Pet
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
              Mark one of your registered pets as lost and alert the network
            </p>
          </div>

          {/* Alert */}
          <div className="mb-4 rounded-lg border border-warning/20 bg-warning-light p-3 sm:mb-6 sm:rounded-xl sm:p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-medium text-warning">Important</p>
                <p className="text-sm text-foreground/80">
                  Filing a lost pet report will mark the pet as lost in our database.
                  Only pets you have registered can be reported.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive sm:mb-6 sm:p-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-muted-foreground sm:py-12">Loading your pets...</div>
          ) : pets.length === 0 ? (
            <Card className="border-2">
              <CardContent className="py-8 text-center sm:py-12">
                <p className="text-muted-foreground mb-4">
                  You have no registered pets. Register a pet first, then you can report them as lost.
                </p>
                <Button asChild>
                  <a href="/register">Register a Pet</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2">
              <CardHeader className="px-4 pb-2 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
                <CardTitle className="font-display text-lg">Select Pet & Last Seen</CardTitle>
                <CardDescription>
                  Choose the pet that is lost and provide last seen details
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="petId">Which pet is lost? *</Label>
                    <Select
                      value={formData.petId}
                      onValueChange={(v) => setFormData({ ...formData, petId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pet" />
                      </SelectTrigger>
                      <SelectContent>
                        {pets.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.microchipNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="mb-4 font-semibold text-foreground">Last Seen Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="lastSeenDate">Date Last Seen *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="lastSeenDate"
                            type="date"
                            className="pl-10"
                            value={formData.lastSeenDate}
                            onChange={(e) =>
                              setFormData({ ...formData, lastSeenDate: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastSeenPostcode">Postcode *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="lastSeenPostcode"
                            placeholder="e.g., SW1A 1AA"
                            className="pl-10"
                            value={formData.lastSeenPostcode}
                            onChange={(e) =>
                              setFormData({ ...formData, lastSeenPostcode: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="lastSeenLocation">Location Description *</Label>
                      <Input
                        id="lastSeenLocation"
                        placeholder="e.g., Near the park on Oak Street"
                        value={formData.lastSeenLocation}
                        onChange={(e) =>
                          setFormData({ ...formData, lastSeenLocation: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="description">Additional Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Identifying features, temperament, health conditions..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-border pt-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="rewardOffered"
                        checked={formData.rewardOffered}
                        onCheckedChange={(c) =>
                          setFormData({ ...formData, rewardOffered: c as boolean })
                        }
                      />
                      <Label htmlFor="rewardOffered">Reward offered for safe return</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="notifyVets"
                        checked={formData.notifyVets}
                        onCheckedChange={(c) =>
                          setFormData({ ...formData, notifyVets: c as boolean })
                        }
                      />
                      <Label htmlFor="notifyVets">Notify local veterinary practices</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="notifyCouncil"
                        checked={formData.notifyCouncil}
                        onCheckedChange={(c) =>
                          setFormData({ ...formData, notifyCouncil: c as boolean })
                        }
                      />
                      <Label htmlFor="notifyCouncil">Notify local council animal services</Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting || !formData.petId}
                  >
                    {submitting ? 'Submitting Report...' : 'Submit Lost Pet Report'}
                    {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
