import { useState } from 'react';
import { Search as SearchIcon, Shield, Info, Check, X } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface CheckResult {
  isValid: boolean;
  manufacturer?: string;
  country?: string;
  format?: string;
}

export default function MicrochipChecker() {
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);

    // Mock chip validation
    setTimeout(() => {
      setIsChecking(false);
      // Check if it's a valid 15-digit number starting with 977 (UK standard)
      if (microchipNumber.startsWith('977') && microchipNumber.length === 15) {
        setResult({
          isValid: true,
          manufacturer: 'UK Microchip Standard',
          country: 'United Kingdom',
          format: 'ISO 11784/11785 FDX-B',
        });
      } else if (microchipNumber.length === 15) {
        setResult({
          isValid: true,
          manufacturer: 'International Standard',
          country: 'Various',
          format: 'ISO 11784/11785 FDX-B',
        });
      } else {
        setResult({
          isValid: false,
        });
      }
    }, 1000);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-secondary">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Microchip Checker
            </h1>
            <p className="mt-2 text-muted-foreground">
              Verify the format and origin of a microchip number
            </p>
          </div>

          {/* Checker Form */}
          <Card className="border-2 mb-6">
            <CardContent className="pt-6">
              <form onSubmit={handleCheck} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="microchip">Microchip Number</Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="microchip"
                      placeholder="Enter microchip number"
                      className="pl-10 text-lg font-mono"
                      value={microchipNumber}
                      onChange={(e) => {
                        setMicrochipNumber(e.target.value.replace(/\D/g, '').slice(0, 15));
                        setResult(null);
                      }}
                      maxLength={15}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {microchipNumber.length}/15 digits
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="aqua"
                  className="w-full"
                  size="lg"
                  disabled={microchipNumber.length < 10 || isChecking}
                >
                  {isChecking ? 'Checking...' : 'Verify Microchip'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <Card
              className={`animate-fade-in border-2 ${
                result.isValid ? 'border-success bg-success-light' : 'border-destructive bg-destructive-light'
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      result.isValid ? 'bg-success' : 'bg-destructive'
                    }`}
                  >
                    {result.isValid ? (
                      <Check className="h-6 w-6 text-success-foreground" />
                    ) : (
                      <X className="h-6 w-6 text-destructive-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {result.isValid ? 'Valid Microchip Format' : 'Invalid Format'}
                    </h3>
                    {result.isValid ? (
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>
                          <strong>Number:</strong>{' '}
                          <span className="font-mono">{microchipNumber}</span>
                        </p>
                        <p>
                          <strong>Format:</strong> {result.format}
                        </p>
                        <p>
                          <strong>Standard:</strong> {result.manufacturer}
                        </p>
                        <p>
                          <strong>Origin:</strong> {result.country}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">
                        The microchip number you entered doesn't match a valid format.
                        Please check and try again.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <div className="mt-6 rounded-xl bg-info-light p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-info" />
              <div>
                <p className="text-sm font-medium text-info">About Microchip Numbers</p>
                <p className="mt-1 text-sm text-info/80">
                  UK microchips typically start with 977 and are 15 digits long. This checker
                  validates the format but does not search the database. Use the{' '}
                  <a href="/search" className="underline">
                    Search
                  </a>{' '}
                  function to look up registration details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
