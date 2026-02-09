import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, LogOut, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sanitizeMicrochipInput, validateMicrochip } from '@/lib/microchip';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders, getUser, clearAuth } from '@/lib/auth';

type LookupResult = {
  found: boolean;
  keeper?: { fullName: string; address: string | null; phone: string | null; email: string };
  pet?: {
    microchipNumber: string;
    name: string;
    species: string;
    speciesOther?: string | null;
    breed: string;
    color: string;
    sex: string;
    dateOfBirth: string | null;
    status: string;
  };
  message?: string;
};

export default function AuthorisedSearch() {
  const user = getUser();
  const [microchip, setMicrochip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!validateMicrochip(microchip.trim()).valid) {
      setError('Please enter a valid microchip number (9–16 characters).');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        apiUrl(`/api/authorised/search?microchip=${encodeURIComponent(microchip.trim())}`),
        { headers: getAuthHeaders() }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Look-up failed.');
        setLoading(false);
        return;
      }
      setResult({
        found: data.found,
        keeper: data.keeper,
        pet: data.pet,
        message: data.message,
      });
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Authorised person look-up (Reg 7)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={() => { clearAuth(); window.location.href = '/login'; }}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="font-display text-xl">Microchip look-up</CardTitle>
              <CardDescription>
                Enter a microchip number to retrieve keeper and pet details (Reg 6). All look-ups are logged for compliance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="microchip">Microchip number</Label>
                  <Input
                    id="microchip"
                    placeholder="e.g. 977200009123456 or AVID*012*345*678"
                    value={microchip}
                    onChange={(e) => setMicrochip(sanitizeMicrochipInput(e.target.value))}
                    maxLength={16}
                  />
                </div>
                <Button type="submit" disabled={!validateMicrochip(microchip).valid || loading}>
                  {loading ? 'Searching...' : 'Look up'}
                  <SearchIcon className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
              )}

              {result && (
                <div className="rounded-lg border border-border p-4 space-y-4">
                  {result.found ? (
                    <>
                      <h3 className="font-semibold text-foreground">Keeper (Reg 6)</h3>
                      <dl className="grid gap-2 text-sm">
                        <div><dt className="text-muted-foreground">Name</dt><dd>{result.keeper?.fullName ?? '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Address</dt><dd>{result.keeper?.address ?? '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Phone</dt><dd>{result.keeper?.phone ?? '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Email</dt><dd>{result.keeper?.email ?? '—'}</dd></div>
                      </dl>
                      <h3 className="font-semibold text-foreground pt-2 border-t border-border">Pet</h3>
                      <dl className="grid gap-2 text-sm">
                        <div><dt className="text-muted-foreground">Microchip</dt><dd>{result.pet?.microchipNumber}</dd></div>
                        <div><dt className="text-muted-foreground">Name</dt><dd>{result.pet?.name}</dd></div>
                        <div><dt className="text-muted-foreground">Species / Breed</dt><dd>{result.pet ? (result.pet.species === 'other' && result.pet.speciesOther ? result.pet.speciesOther : result.pet.species.charAt(0).toUpperCase() + result.pet.species.slice(1)) : ''} – {result.pet?.breed}</dd></div>
                        <div><dt className="text-muted-foreground">Colour</dt><dd>{result.pet?.color}</dd></div>
                        <div><dt className="text-muted-foreground">Sex / DOB</dt><dd>{result.pet?.sex} – {result.pet?.dateOfBirth ?? '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Status</dt><dd className="capitalize">{result.pet?.status}</dd></div>
                      </dl>
                    </>
                  ) : (
                    <p className="text-muted-foreground">{result.message ?? 'No record found for this microchip.'}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/" className="underline hover:text-foreground">Back to home</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
