import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, PawPrint, Calendar, Info, ImageIcon, X, CreditCard, Ticket } from 'lucide-react';
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
import { speciesOptions, dogBreeds, catBreeds, rabbitBreeds, ferretBreeds, getBreedsForOtherSpecies, hasKnownBreedsForOtherSpecies } from '@/data/mockData';
import { sanitizeMicrochipInput, validateMicrochip } from '@/lib/microchip';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders, getUser } from '@/lib/auth';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    microchipNumber: '',
    petName: '',
    species: '',
    speciesOther: '',
    breed: '',
    color: '',
    dateOfBirth: '',
    sex: '',
    neutered: false,
    notes: '',
    imageUrl: '',
  });

  const breeds =
    formData.species === 'dog'
      ? dogBreeds
      : formData.species === 'cat'
        ? catBreeds
        : formData.species === 'rabbit'
          ? rabbitBreeds
          : formData.species === 'ferret'
            ? ferretBreeds
            : formData.species === 'other'
              ? getBreedsForOtherSpecies(formData.speciesOther)
              : [];
  const displayName = getUser()?.email?.split('@')[0] ?? 'User';
  const paymentSuccess = searchParams.get('payment') === 'success';
  const paymentCancelled = searchParams.get('payment') === 'cancelled';
  const sessionId = searchParams.get('session_id')?.trim() ?? '';

  const fetchCredits = async () => {
    try {
      const res = await fetch(apiUrl('/api/payments/credits'), { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        return typeof data.credits === 'number' ? data.credits : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await fetchCredits();
      if (!cancelled) {
        setCredits(c);
        setCreditsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // When returning from Stripe with session_id, confirm the payment so we get a credit
  // (needed for local dev where the webhook cannot be reached)
  useEffect(() => {
    if (!paymentSuccess || !sessionId || credits !== 0) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl(`/api/payments/confirm-session?session_id=${encodeURIComponent(sessionId)}`), {
          headers: getAuthHeaders(),
        });
        if (res.ok && !cancelled) {
          const c = await fetchCredits();
          setCredits(c);
        }
      } catch {
        // ignore; we still have the 2s/5s polling below as fallback (e.g. webhook)
      }
    })();
    return () => { cancelled = true; };
  }, [paymentSuccess, sessionId, credits]);

  useEffect(() => {
    if (!paymentSuccess || credits !== 0) return;
    const t1 = setTimeout(async () => {
      const c = await fetchCredits();
      setCredits((prev) => (prev === 0 ? c : prev));
    }, 2000);
    const t2 = setTimeout(async () => {
      const c = await fetchCredits();
      setCredits((prev) => (prev === 0 ? c : prev));
    }, 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [paymentSuccess, credits]);

  const handleRedeemPromo = async () => {
    const code = promoCode.trim();
    if (!code) return;
    setPromoError(null);
    setPromoLoading(true);
    try {
      const res = await fetch(apiUrl('/api/payments/redeem-promo'), {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPromoError(data.error ?? 'Invalid or expired code.');
        setPromoLoading(false);
        return;
      }
      const newCredits = typeof data.credits === 'number' ? data.credits : await fetchCredits();
      setCredits(newCredits);
      setPromoCode('');
      setPromoError(null);
    } catch {
      setPromoError('Something went wrong. Please try again.');
    }
    setPromoLoading(false);
  };

  const handlePayThenRegister = async () => {
    setError(null);
    setPayLoading(true);
    try {
      const res = await fetch(apiUrl('/api/payments/create-checkout-session'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Could not start payment.');
        setPayLoading(false);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError('Invalid response from server.');
    } catch {
      setError('Network error. Please try again.');
    }
    setPayLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    if (!chosen.type.startsWith('image/')) {
      setError('Please choose an image file (JPEG, PNG, GIF, or WebP).');
      return;
    }
    if (chosen.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', chosen);
      const res = await fetch(apiUrl('/api/upload'), {
        method: 'POST',
        headers: { Authorization: getAuthHeaders().Authorization ?? '' },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Upload failed.');
        return;
      }
      if (data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: apiUrl(data.url) }));
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/pets'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          microchipNumber: formData.microchipNumber,
          petName: formData.petName,
          species: formData.species,
          speciesOther: formData.species === 'other' ? formData.speciesOther.trim() || undefined : undefined,
          breed: formData.breed,
          color: formData.color,
          dateOfBirth: formData.dateOfBirth || undefined,
          sex: formData.sex,
          neutered: formData.neutered,
          notes: formData.notes || undefined,
          imageUrl: formData.imageUrl || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 402 && data.code === 'PAYMENT_REQUIRED') {
          setCredits(0);
          setError(data.error ?? 'Payment required to register a pet.');
        } else {
          setError(data.error || 'Registration failed.');
        }
        setIsLoading(false);
        return;
      }
      navigate('/thank-you?type=register');
    } catch {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  const step1Chip = validateMicrochip(formData.microchipNumber);
  const isStep1Valid =
    step1Chip.valid &&
    formData.petName &&
    formData.species &&
    (formData.species !== 'other' || formData.speciesOther.trim());

  const isStep2Valid =
    formData.breed &&
    formData.color &&
    formData.dateOfBirth &&
    formData.sex;

  if (creditsLoading) {
    return (
      <DashboardLayout userName={displayName}>
        <div className="mx-auto max-w-2xl py-12 text-center text-muted-foreground">Loading…</div>
      </DashboardLayout>
    );
  }

  if (credits !== null && credits < 1) {
    return (
      <DashboardLayout userName={displayName}>
        <div className="mx-auto max-w-2xl">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="font-display text-xl">Register a microchip</CardTitle>
                  <CardDescription>
                    £24.99 per pet — lifetime access to update your pet&apos;s details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentCancelled && (
                <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  Payment was cancelled. You can pay when you&apos;re ready to register a pet.
                </div>
              )}
              {paymentSuccess && (
                <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
                  Payment successful. You can now register your pet below.
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
              )}
              <p className="text-sm text-muted-foreground">
                It&apos;s a legal requirement to have cats and dogs microchipped. After your vet or rescue chips your pet,
                you need to register the chip number to yourself. Pay once per pet to register with us and get lifetime
                access to update details.
              </p>
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  Have a promo code?
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. FAMILY25"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(null); }}
                    className="flex-1"
                    maxLength={32}
                    disabled={promoLoading}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={promoLoading || !promoCode.trim()}
                    onClick={handleRedeemPromo}
                  >
                    {promoLoading ? 'Applying…' : 'Apply'}
                  </Button>
                </div>
                {promoError && (
                  <p className="text-sm text-destructive">{promoError}</p>
                )}
              </div>
              <Button
                size="lg"
                className="w-full"
                disabled={payLoading}
                onClick={handlePayThenRegister}
              >
                {payLoading ? 'Redirecting to payment…' : 'Pay £24.99 and register a pet'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={displayName}>
      <div className="mx-auto max-w-2xl">
        {paymentSuccess && (
          <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
            Payment received. Complete the form below to register your pet.
          </div>
        )}
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Register Your Pet</CardTitle>
                <CardDescription>
                  Add a new pet to the Woo-Huahua Database
                </CardDescription>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-6 flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                1
              </div>
              <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                2
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-lg bg-info-light p-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 shrink-0 text-info" />
                      <p className="text-sm text-info">
                        Accepts ISO 15-digit, AVID format (e.g. AVID*012*345*678), Trovan, or hex.
                        Max 16 characters. Found on your pet&apos;s microchip certificate or from your vet.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="microchipNumber">Microchip Number *</Label>
                    <Input
                      id="microchipNumber"
                      placeholder="e.g., 977200009123456 or AVID*012*345*678"
                      value={formData.microchipNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, microchipNumber: sanitizeMicrochipInput(e.target.value) })
                      }
                      maxLength={16}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.microchipNumber.length}/16 (Defra-compliant format)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="petName">Pet Name *</Label>
                    <Input
                      id="petName"
                      placeholder="e.g., Bella"
                      value={formData.petName}
                      onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="species">Species *</Label>
                    <Select
                      value={formData.species}
                      onValueChange={(value) => setFormData({ ...formData, species: value, speciesOther: value === 'other' ? formData.speciesOther : '', breed: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select species" />
                      </SelectTrigger>
                      <SelectContent>
                        {speciesOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.species === 'other' && (
                      <div className="pt-1">
                        <Label htmlFor="speciesOther" className="text-muted-foreground font-normal">
                          Specify species (e.g. Hamster, Bird, Guinea pig) *
                        </Label>
                        <Input
                          id="speciesOther"
                          placeholder="e.g., Hamster"
                          value={formData.speciesOther}
                          onChange={(e) => setFormData({ ...formData, speciesOther: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    disabled={!isStep1Valid}
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="breed">Breed *</Label>
                      {formData.species === 'other' && !hasKnownBreedsForOtherSpecies(formData.speciesOther) ? (
                        <>
                          <Input
                            id="breed"
                            placeholder="e.g., Standard Grey, Short-haired"
                            value={formData.breed}
                            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            No breed list for this species. Enter the breed or type (e.g. Mixed, Other).
                          </p>
                        </>
                      ) : (
                        <Select
                          value={formData.breed}
                          onValueChange={(value) => setFormData({ ...formData, breed: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select breed" />
                          </SelectTrigger>
                          <SelectContent>
                            {breeds.length > 0 ? (
                              breeds.map((breed) => (
                                <SelectItem key={breed} value={breed}>
                                  {breed}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="other">Other</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color/Markings *</Label>
                      <Input
                        id="color"
                        placeholder="e.g., Golden, Black and White"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          className="pl-10"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex *</Label>
                      <Select
                        value={formData.sex}
                        onValueChange={(value) => setFormData({ ...formData, sex: value })}
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
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="neutered"
                      checked={formData.neutered}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, neutered: checked as boolean })
                      }
                    />
                    <Label htmlFor="neutered">Neutered/Spayed</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Pet photo (optional)</Label>
                    {formData.imageUrl ? (
                      <div className="relative inline-block">
                        <img
                          src={formData.imageUrl}
                          alt="Pet preview"
                          className="h-32 w-32 rounded-xl border border-border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                          aria-label="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 transition-colors hover:bg-muted/50">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          disabled={uploading}
                          onChange={handleImageUpload}
                        />
                        {uploading ? (
                          <span className="text-sm text-muted-foreground">Uploading…</span>
                        ) : (
                          <>
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">Choose a photo</span>
                            <span className="text-xs text-muted-foreground">JPEG, PNG, GIF or WebP, max 5MB</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any distinguishing features, health conditions, or important information..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      size="lg"
                      disabled={!isStep2Valid || isLoading}
                    >
                      {isLoading ? 'Registering...' : 'Register Pet'}
                      {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
