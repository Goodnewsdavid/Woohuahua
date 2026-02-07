import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailSent() {
  const location = useLocation();
  const state = location.state as { email?: string; verificationUrl?: string } | null;
  const email = state?.email ?? '';
  const verificationUrl = state?.verificationUrl ?? '';

  return (
    <Layout hideChat>
      <div className="container flex min-h-[calc(100vh-12rem)] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-hero">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="font-display text-2xl">Check your email</CardTitle>
              <CardDescription>
                We’ve sent a verification link to
                {email ? (
                  <span className="mt-1 block font-medium text-foreground">{email}</span>
                ) : (
                  ' your email address'
                )}.
                Click the link to verify your account, then sign in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationUrl && (
                <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-3 text-center text-sm text-muted-foreground">
                  <p className="mb-2 font-medium text-foreground">No email yet? Use this link to verify now:</p>
                  <a
                    href={verificationUrl}
                    className="text-primary hover:underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {verificationUrl}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                <span>After verifying, you can sign in to your account.</span>
              </div>
              <Button className="w-full" size="lg" asChild>
                <Link to="/login">
                  Go to sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
