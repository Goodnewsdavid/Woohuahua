import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { apiUrl } from '@/lib/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!tokenFromUrl) {
      toast({ title: 'Invalid link', description: 'No reset token found. Request a new link from Forgot password.', variant: 'destructive' });
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenFromUrl) {
      toast({ title: 'Invalid link', description: 'Request a new reset link from the Forgot password page.', variant: 'destructive' });
      return;
    }
    if (formData.password.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenFromUrl, password: formData.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: 'Reset failed', description: data.error ?? 'Please try again.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      setSuccess(true);
      toast({ title: 'Password updated', description: data.message });
    } catch {
      toast({ title: 'Error', description: 'Could not reach the server.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Layout hideChat>
        <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
          <div className="mx-auto w-full max-w-md">
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle className="font-display text-2xl">Password updated</CardTitle>
                <CardDescription>You can now sign in with your new password.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideChat>
      <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-hero">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="font-display text-2xl">Set new password</CardTitle>
              <CardDescription>
                Enter your new password below. It must be at least 8 characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!tokenFromUrl ? (
                <div className="flex flex-col items-center gap-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
                  <AlertCircle className="h-10 w-10 text-amber-600" />
                  <p className="text-center text-sm text-muted-foreground">
                    This link is missing a reset token. Go to Forgot password and request a new link.
                  </p>
                  <Button asChild>
                    <Link to="/forgot-password">Forgot password</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={8}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update password'}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              )}
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
