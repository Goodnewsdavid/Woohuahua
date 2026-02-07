import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, PawPrint, Calendar, Info } from 'lucide-react';
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
import { speciesOptions, dogBreeds, catBreeds } from '@/data/mockData';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders, getUser } from '@/lib/auth';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  });

  const breeds = formData.species === 'dog' ? dogBreeds : formData.species === 'cat' ? catBreeds : [];
  const displayName = getUser()?.email?.split('@')[0] ?? 'User';

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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
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

  return (
    <DashboardLayout userName={displayName}>
      <div className="mx-auto max-w-2xl">
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
