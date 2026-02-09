import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { apiUrl } from '@/lib/api';

export default function ResendVerification() {
  const [email, setEmail] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setVerificationUrl('');
    try {
      const res = await fetch(apiUrl('/api/auth/resend-verification'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: 'Error', description: data.error ?? 'Something went wrong.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      toast({ title: data.message ?? 'Done' });
      if (data.verificationUrl) setVerificationUrl(data.verificationUrl);
      else setVerificationUrl('');
    } catch {
      toast({ title: 'Error', description: 'Could not reach the server.', variant: 'destructive' });
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
              <CardTitle className="font-display text-2xl">Get verification link</CardTitle>
              <CardDescription>
                Enter the email you used to sign up. We’ll send you a new verification link or show it here if email isn’t configured.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Get verification link'}
                </Button>
              </form>

              {verificationUrl && (
                <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-3 text-center text-sm text-muted-foreground">
                  <p className="mb-2 font-medium text-foreground">Use this link to verify your email:</p>
                  <a
                    href={verificationUrl}
                    className="inline-flex items-center gap-1 text-primary hover:underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open verification link <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                  <p className="mt-2 text-xs break-all text-muted-foreground">{verificationUrl}</p>
                </div>
              )}

              <div className="text-center text-sm">
                <Link to="/login" className="inline-flex items-center gap-1 text-primary hover:underline">
                  Back to sign in <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
