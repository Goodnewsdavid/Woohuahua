import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, PawPrint, Search } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const thankYouContent = {
  register: {
    title: 'Pet Successfully Registered!',
    message:
      'Your pet has been added to the Woo-Huahua Database. You can now manage their details from your dashboard.',
    actions: [
      { label: 'View My Pets', href: '/my-pets-timeline', icon: PawPrint },
      { label: 'Register Another', href: '/register', icon: PawPrint },
    ],
  },
  lost: {
    title: 'Lost Pet Report Submitted',
    message:
      'Your report has been filed and local authorities, vets, and shelters have been notified. We hope for a swift reunion.',
    actions: [
      { label: 'View Dashboard', href: '/dashboard', icon: Home },
      { label: 'Search Database', href: '/search', icon: Search },
    ],
  },
  transfer: {
    title: 'Transfer Request Submitted',
    message:
      'The new owner will receive an email to confirm the transfer. The process will be complete once they accept.',
    actions: [
      { label: 'View My Pets', href: '/my-pets-timeline', icon: PawPrint },
      { label: 'Back to Dashboard', href: '/dashboard', icon: Home },
    ],
  },
  contact: {
    title: 'Message Sent Successfully',
    message:
      'Thank you for contacting us. Our team will review your message and respond within 24-48 hours.',
    actions: [
      { label: 'Back to Home', href: '/', icon: Home },
      { label: 'Search Database', href: '/search', icon: Search },
    ],
  },
  default: {
    title: 'Thank You!',
    message: 'Your request has been processed successfully.',
    actions: [
      { label: 'Back to Home', href: '/', icon: Home },
      { label: 'Go to Dashboard', href: '/dashboard', icon: PawPrint },
    ],
  },
};

export default function ThankYou() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'default';
  const content = thankYouContent[type as keyof typeof thankYouContent] || thankYouContent.default;

  return (
    <Layout>
      <div className="container flex min-h-[calc(100vh-16rem)] items-center justify-center py-12">
        <Card className="mx-auto max-w-lg border-2 text-center">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success-light">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            
            <h1 className="font-display text-2xl font-bold text-foreground">
              {content.title}
            </h1>
            
            <p className="mt-4 text-muted-foreground">
              {content.message}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {content.actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.href}
                    variant={index === 0 ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={action.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </Link>
                  </Button>
                );
              })}
            </div>

            <div className="mt-8 rounded-xl bg-gradient-surface p-4">
              <p className="text-sm text-muted-foreground">
                Need help? Our AI assistant is available 24/7 or you can{' '}
                <Link to="/contact" className="text-primary hover:underline">
                  contact our support team
                </Link>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
