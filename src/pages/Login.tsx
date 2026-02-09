import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { apiUrl } from '@/lib/api';
import { TOKEN_KEY, USER_KEY } from '@/lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const verified = searchParams.get('verified');
    const verification = searchParams.get('verification');
    if (verified === '1') {
      toast({ title: 'Email verified', description: 'You can now sign in to your account.' });
      setSearchParams({}, { replace: true });
    } else if (verification === 'error') {
      toast({ title: 'Verification failed', description: 'The link was invalid or expired. Try signing in or sign up again.', variant: 'destructive' });
      setSearchParams({}, { replace: true });
    } else if (verification === 'expired') {
      toast({ title: 'Link expired', description: 'Verification links expire after 24 hours. Please sign up again or request a new link.', variant: 'destructive' });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({ title: 'Login failed', description: data.error ?? 'Invalid email or password.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      toast({ title: 'Welcome back!', description: 'You are now signed in.' });
      // Admins → admin dashboard; authorised persons → authorised search; others → dashboard
      if (data.user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.user?.role === 'AUTHORISED') {
        navigate('/authorised/search');
      } else {
        navigate('/dashboard');
      }
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
                <span className="text-2xl font-bold text-white">W</span>
              </div>
              <CardTitle className="font-display text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your Woo-Huahua account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
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

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </div>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Didn't receive the verification email?{' '}
                <Link to="/resend-verification" className="font-medium text-primary hover:underline">
                  Get verification link
                </Link>
              </p>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/authorised-login">Authorised Organisation Login</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/admin/login">Admin Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
