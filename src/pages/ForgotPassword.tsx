import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { apiUrl } from '@/lib/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: 'Please enter your email', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setDone(false);
    setResetUrl('');
    try {
      const res = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: 'Request failed', description: data.error ?? 'Please try again.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      setDone(true);
      if (data.resetUrl) setResetUrl(data.resetUrl);
      toast({ title: 'Check your email', description: data.message });
    } catch {
      toast({ title: 'Error', description: 'Could not reach the server. Is the backend running?', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout hideChat>
      <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-hero">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="font-display text-2xl">Forgot password?</CardTitle>
              <CardDescription>
                Enter your email and we’ll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!done ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send reset link'}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    If an account exists with that email, you’ll receive a reset link. Check your inbox (and spam).
                  </p>
                  {resetUrl && (
                    <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-3 text-center text-sm text-muted-foreground">
                      <p className="mb-2 font-medium text-foreground">For development: use this link to reset now</p>
                      <a
                        href={resetUrl}
                        className="text-primary hover:underline break-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {resetUrl}
                      </a>
                    </div>
                  )}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/login" className="flex items-center justify-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back to sign in
                    </Link>
                  </Button>
                </div>
              )}
              {!done && (
                <div className="mt-4 text-center">
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-primary hover:underline inline-flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
