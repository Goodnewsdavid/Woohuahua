import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, PawPrint, Calendar, Info, ImageIcon, X, CreditCard } from 'lucide-react';
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
import { speciesOptions, dogBreeds, catBreeds, rabbitBreeds, ferretBreeds, otherBreeds } from '@/data/mockData';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders, getUser } from '@/lib/auth';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    microchipNumber: '',
    petName: '',
    species: '',
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
              ? otherBreeds
              : [];
  const displayName = getUser()?.email?.split('@')[0] ?? 'User';
  const paymentSuccess = searchParams.get('payment') === 'success';
  const paymentCancelled = searchParams.get('payment') === 'cancelled';

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

  const isStep1Valid =
    formData.microchipNumber.length >= 15 &&
    formData.petName &&
    formData.species;

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
                        The microchip number is usually 15 digits and can be found on your pet's
                        microchip certificate or obtained from your vet.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="microchipNumber">Microchip Number *</Label>
                    <Input
                      id="microchipNumber"
                      placeholder="e.g., 977200009123456"
                      value={formData.microchipNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, microchipNumber: e.target.value.replace(/\D/g, '').slice(0, 15) })
                      }
                      maxLength={15}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.microchipNumber.length}/15 digits
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
                      onValueChange={(value) => setFormData({ ...formData, species: value, breed: '' })}
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
