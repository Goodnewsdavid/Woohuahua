import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Shield, Info } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
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
import { sanitizeMicrochipInput, validateMicrochip } from '@/lib/microchip';
import { apiUrl } from '@/lib/api';

type SearchResult = {
  microchipNumber: string;
  petName: string;
  species: string;
  breed: string;
  status: string;
  registeredDatabase: string;
  ownerContactAvailable: boolean;
};

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const qMicrochip = searchParams.get('microchip')?.trim() ?? '';
  const [microchipNumber, setMicrochipNumber] = useState(qMicrochip);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (qMicrochip && validateMicrochip(qMicrochip).valid) {
      setMicrochipNumber(qMicrochip);
      setSearched(true);
      setError(null);
      setIsSearching(true);
      fetch(apiUrl(`/api/search?microchip=${encodeURIComponent(qMicrochip)}`))
        .then((res) => res.json().catch(() => ({})))
        .then((data) => {
          if (data.status === 'ERROR' && data.error) {
            setError(data.error);
            setResults([]);
          } else {
            setResults(data.found && Array.isArray(data.results) ? data.results : []);
          }
        })
        .catch(() => {
          setResults([]);
          setError('Could not reach the server.');
        })
        .finally(() => setIsSearching(false));
    }
  }, [qMicrochip]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSearching(true);
    setSearched(true);
    setResults(null);
    try {
      const res = await fetch(apiUrl(`/api/search?microchip=${encodeURIComponent(microchipNumber.trim())}`));
      const data = await res.json().catch(() => ({}));
      if (data.status === 'ERROR' && data.error) {
        setError(data.error);
        setResults([]);
        return;
      }
      setResults(data.found && Array.isArray(data.results) ? data.results : []);
    } catch {
      setResults([]);
      setError('Could not reach the server.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero">
              <SearchIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Search Microchip Database
            </h1>
            <p className="mt-2 text-muted-foreground">
              Search across all UK-compliant microchip databases
            </p>
          </div>

          {/* Search Form */}
          <Card className="border-2 mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="microchip">Microchip Number</Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="microchip"
                      placeholder="e.g. 977200009123456 or AVID*012*345*678"
                      className="pl-10 text-lg"
                      value={microchipNumber}
                      onChange={(e) => setMicrochipNumber(sanitizeMicrochipInput(e.target.value))}
                      maxLength={16}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {microchipNumber.length}/16 (Defra format: digits, A-F, or AVID*)
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!validateMicrochip(microchipNumber).valid || isSearching}
                >
                  {isSearching ? 'Searching...' : 'Search Database'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Info Banner */}
          <div className="mb-6 rounded-xl bg-info-light p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-info" />
              <div>
                <p className="text-sm font-medium text-info">Live Search</p>
                <p className="text-sm text-info/80">
                  Search our database for pets registered with Woo-Huahua. Accepts ISO 15-digit, AVID format, Trovan, or hex (max 16 chars).
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          {searched && !isSearching && (
            <div className="animate-fade-in">
              {results && results.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Search Results</CardTitle>
                    <CardDescription>
                      Found {results.length} matching record(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-border p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">
                                {result.petName}
                              </h3>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                                  result.status === 'registered'
                                    ? 'bg-success-light text-success'
                                    : result.status === 'lost'
                                    ? 'bg-destructive-light text-destructive'
                                    : result.status === 'deceased'
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-warning-light text-warning'
                                }`}
                              >
                                {result.status}
                              </span>
                            </div>
                            <div className="grid gap-1 text-sm text-muted-foreground">
                              <p>
                                <span className="font-medium">Microchip:</span>{' '}
                                {result.microchipNumber}
                              </p>
                              <p>
                                <span className="font-medium">Species:</span>{' '}
                                {result.species}
                              </p>
                              <p>
                                <span className="font-medium">Breed:</span>{' '}
                                {result.breed}
                              </p>
                              <p>
                                <span className="font-medium">Database:</span>{' '}
                                {result.registeredDatabase}
                              </p>
                            </div>
                          </div>
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-light">
                            <Shield className="h-5 w-5 text-success" />
                          </div>
                        </div>

                        {result.ownerContactAvailable && (
                          <div className="mt-4 rounded-lg bg-muted/50 p-3">
                            <p className="text-sm text-muted-foreground">
                              Owner contact information is available. To request contact,
                              please use the appropriate channel (vet, police, or council).
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <SearchIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      No Results Found
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      We couldn't find any records matching microchip number:{' '}
                      <span className="font-mono font-medium">{microchipNumber}</span>
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      This microchip is not registered with Woo-Huahua. To check other UK-compliant databases (Reg 7(2)(b)), use one of the following:
                    </p>
                    <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground space-y-1">
                      <li>
                        <a
                          href="https://www.gov.uk/get-your-dog-cat-microchipped"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          GOV.UK – Get your dog or cat microchipped
                        </a>
                        {' '}(list of compliant databases)
                      </li>
                      <li>
                        <a
                          href="https://www.check-a-chip.co.uk"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          check-a-chip.co.uk
                        </a>
                        {' '}(chip look-up across databases)
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-muted-foreground">
                      If this pet should be on our database, you can{' '}
                      <Link to="/register" className="text-primary hover:underline">
                        register them here
                      </Link>
                      .
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
