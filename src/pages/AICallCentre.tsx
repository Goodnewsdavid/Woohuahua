import { Phone, Mic, MicOff, Shield, User, Building2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const callerTypes = [
  {
    id: 'owner',
    icon: User,
    title: 'Pet Owner',
    description: 'I own a registered pet or want to register one',
    color: 'bg-primary',
  },
  {
    id: 'organisation',
    icon: Building2,
    title: 'Authorised Organisation',
    description: 'Vet, shelter, council, or other authorised body',
    color: 'bg-secondary',
  },
  {
    id: 'emergency',
    icon: AlertTriangle,
    title: 'Emergency',
    description: 'Found an injured or lost pet, urgent situation',
    color: 'bg-warning',
  },
];

export default function AICallCentre() {
  const [showConsent, setShowConsent] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const handleCallClick = (typeId: string) => {
    setSelectedType(typeId);
    setShowConsent(true);
  };

  const handleConsentAccept = () => {
    setShowConsent(false);
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setSelectedType(null);
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-hero">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              AI Call Centre
            </h1>
            <p className="mt-2 text-muted-foreground">
              Speak with our AI assistant for immediate support
            </p>
          </div>

          {!isCallActive ? (
            <>
              {/* Caller Type Selection */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    How can we help you today?
                  </CardTitle>
                  <CardDescription>
                    Select your caller type to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {callerTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleCallClick(type.id)}
                        className="flex w-full items-center gap-4 rounded-xl border-2 border-border p-4 text-left transition-all hover:border-primary/30 hover:bg-muted/50"
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${type.color}`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{type.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Info */}
              <div className="mt-6 rounded-xl bg-muted/50 p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Our AI assistant can help with microchip lookups, registration questions,
                    and general support. For complex issues, you'll be connected to a human agent.
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Active Call UI */
            <Card className="border-2 overflow-hidden">
              <div className="bg-gradient-hero p-8 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-white/20">
                  <Phone className="h-12 w-12 text-white" />
                </div>
                <h2 className="font-display text-xl font-bold text-white">
                  Call in Progress
                </h2>
                <p className="mt-1 text-white/80">
                  {callerTypes.find((t) => t.id === selectedType)?.title} Support
                </p>
                <p className="mt-2 font-mono text-2xl text-white">00:00</p>
              </div>

              <CardContent className="p-6">
                <div className="mb-6 rounded-lg bg-muted/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    AI Assistant is listening...
                  </p>
                  <p className="mt-2 text-foreground">
                    "Hello! Thank you for calling Woo-Huahua Database. How can I assist you today?"
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={isMuted ? 'destructive' : 'outline'}
                    size="lg"
                    className="h-14 w-14 rounded-full p-0"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <MicOff className="h-6 w-6" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </Button>

                  <Button
                    variant="destructive"
                    size="lg"
                    className="h-14 px-8 rounded-full"
                    onClick={handleEndCall}
                  >
                    <Phone className="mr-2 h-5 w-5 rotate-[135deg]" />
                    End Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Consent Modal */}
      <Dialog open={showConsent} onOpenChange={setShowConsent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Call Recording Consent</DialogTitle>
            <DialogDescription className="pt-4">
              This call may be recorded for quality assurance and regulatory compliance purposes.
              By proceeding, you consent to the recording of this call.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong>What we record:</strong> Voice interactions for quality improvement.
              <br />
              <strong>How long we keep it:</strong> Recordings are stored securely for 90 days.
              <br />
              <strong>Your rights:</strong> You may request deletion under GDPR.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConsent(false)}>
              Cancel
            </Button>
            <Button onClick={handleConsentAccept}>
              I Consent, Start Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
