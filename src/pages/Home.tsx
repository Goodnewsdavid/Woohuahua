import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PawPrint,
  Shield,
  Phone,
  CheckCircle,
  ArrowRight,
  Dog,
  Cat,
  Rabbit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { sanitizeMicrochipInput, validateMicrochip } from '@/lib/microchip';
import { Layout } from '@/components/layout/Layout';
import { isLoggedIn, getUser } from '@/lib/auth';

const features = [
  {
    icon: PawPrint,
    title: 'Easy Registration',
    description: 'Register your pet\'s microchip in minutes with our simple online process.',
  },
  {
    icon: Search,
    title: 'Instant Lookup',
    description: 'Search any UK microchip database to find pet information quickly.',
  },
  {
    icon: Shield,
    title: 'DEFRA Compliant',
    description: 'Fully compliant with UK government regulations for pet identification.',
  },
  {
    icon: Phone,
    title: '24/7 Support',
    description: 'Our AI-powered support and human agents are available around the clock.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Create Account',
    description: 'Sign up for free and verify your identity.',
  },
  {
    step: '02',
    title: 'Add Pet Details',
    description: 'Enter your pet\'s microchip number and information.',
  },
  {
    step: '03',
    title: 'Stay Connected',
    description: 'Keep details updated for quick reunification if lost.',
  },
];

const stats = [
  { value: '2M+', label: 'Pets Registered' },
  { value: '500K+', label: 'Reunifications' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

// Hero carousel images (high-quality pet photos, Unsplash)
const heroSlides = [
  { src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=80', alt: 'Happy dog' },
  { src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1600&q=80', alt: 'Cat' },
  { src: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1600&q=80', alt: 'Dog outdoors' },
  { src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=80', alt: 'Pet' },
];
const HERO_AUTO_ADVANCE_MS = 5000;

export default function Home() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const userName = getUser()?.email?.split('@')[0] ?? '';
  const [chipCheck, setChipCheck] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length);
    }, HERO_AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, []);

  const handleChipCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chipCheck.trim();
    if (validateMicrochip(trimmed).valid) {
      navigate(`/search?microchip=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <Layout>
      {/* Hero Section with image carousel */}
      <section className="relative overflow-hidden py-20 lg:py-28" aria-label="Hero">
        {/* Sliding background images */}
        <div className="absolute inset-0">
          {heroSlides.map((slide, i) => (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === heroIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
              }`}
              aria-hidden={i !== heroIndex}
            >
              <img
                src={slide.src}
                alt=""
                className="h-full w-full object-cover"
                fetchPriority={i === 0 ? 'high' : undefined}
              />
            </div>
          ))}
          {/* Dark overlay so text stays readable */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-primary/85 via-primary/75 to-primary/90" />
        </div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Shield className="h-4 w-4" />
              DEFRA & AMBDO Compliant Database
            </div>

            <h1 className="mb-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {loggedIn ? (
                <>Welcome back, {userName || 'there'}!</>
              ) : (
                <>
                  Keep Your Pet Safe with{' '}
                  <span className="relative">
                    Woo-Huahua
                    <svg
                      className="absolute -bottom-2 left-0 h-3 w-full"
                      viewBox="0 0 200 12"
                      fill="none"
                    >
                      <path
                        d="M2 8.5C50 3 100 3 198 8.5"
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </>
              )}
            </h1>

            <p className="mb-8 text-lg text-white/90 sm:text-xl">
              {loggedIn
                ? "Manage your pets, search the database, and keep your details up to date."
                : "The UK's trusted microchip database for pet registration and reunification. Register, search, and protect your beloved pets with our DEFRA-compliant platform."}
            </p>

            {/* Chip Check - prominently on home page (Defra Reg 7) */}
            <form onSubmit={handleChipCheck} className="mb-10 flex flex-col gap-3 sm:flex-row sm:max-w-xl sm:mx-auto">
              <Input
                type="text"
                placeholder="Check microchip number (e.g. 977200009123456)"
                value={chipCheck}
                onChange={(e) => setChipCheck(sanitizeMicrochipInput(e.target.value))}
                maxLength={16}
                className="h-12 bg-white/95 text-foreground placeholder:text-muted-foreground border-0"
              />
              <Button type="submit" size="lg" variant="secondary" className="h-12 shrink-0" disabled={!validateMicrochip(chipCheck).valid}>
                <Search className="mr-2 h-5 w-5" />
                Check Chip
              </Button>
            </form>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {loggedIn ? (
                <>
                  <Button size="xl" variant="hero-outline" asChild>
                    <Link to="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="hero-outline" asChild>
                    <Link to="/my-pets-timeline">
                      <PawPrint className="mr-2 h-5 w-5" />
                      My Pets
                    </Link>
                  </Button>
                  <Button size="xl" variant="hero-outline" asChild>
                    <Link to="/register">Register Pet</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="xl" variant="hero-outline" asChild>
                    <Link to="/signup">
                      Register Your Pet
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="xl" variant="hero-outline" asChild>
                    <Link to="/search">Search Database</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Carousel dots */}
            <div className="mt-10 flex justify-center gap-2" role="tablist" aria-label="Hero slides">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === heroIndex}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setHeroIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === heroIndex ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>

            {/* Floating pet icons */}
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className="flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm" style={{ animationDelay: '0s' }}>
                <Dog className="h-8 w-8 text-white" />
              </div>
              <div className="flex h-20 w-20 animate-float items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm" style={{ animationDelay: '0.5s' }}>
                <Cat className="h-10 w-10 text-white" />
              </div>
              <div className="flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm" style={{ animationDelay: '1s' }}>
                <Rabbit className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card py-8">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold text-primary lg:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground lg:text-4xl">
              Everything You Need for Pet Protection
            </h2>
            <p className="text-lg text-muted-foreground">
              Our comprehensive platform makes microchip registration and pet protection simple and reliable.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="card-hover border-2 border-transparent hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-surface">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-surface py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground lg:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in three simple steps and ensure your pet is always protected.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full -translate-x-1/2 bg-gradient-to-r from-primary/50 to-secondary/50 md:block" />
                )}
                <div className="relative rounded-2xl bg-card p-8 text-center shadow-lg">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-hero font-display text-xl font-bold text-white">
                    {step.step}
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="overflow-hidden rounded-3xl bg-gradient-hero p-8 lg:p-12">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 font-display text-3xl font-bold text-white lg:text-4xl">
                {loggedIn ? 'Need Help?' : 'Ready to Protect Your Pet?'}
              </h2>
              <p className="mb-8 text-lg text-white/90">
                {loggedIn
                  ? "Register a new pet, search the database, or contact our support team."
                  : "Join over 2 million pet owners who trust Woo-Huahua Database for their pet's safety."}
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                {loggedIn ? (
                  <>
                    <Button size="lg" variant="hero-outline" asChild>
                      <Link to="/dashboard">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="hero-outline" asChild>
                      <Link to="/register">Register Pet</Link>
                    </Button>
                    <Button size="lg" variant="hero-outline" asChild>
                      <Link to="/contact">Contact Us</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" variant="hero-outline" asChild>
                      <Link to="/signup">
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="hero-outline" asChild>
                      <Link to="/contact">Contact Us</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Banner */}
      <section className="border-t border-border bg-muted/50 py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              DEFRA Approved Database
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              AMBDO Compliant
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              UK Government Standards
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
