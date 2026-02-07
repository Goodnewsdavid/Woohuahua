import { useState } from 'react';
import { MessageCircle, X, Send, AlertTriangle, ClipboardList, Search, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { apiUrl } from '@/lib/api';
import { getAuthHeaders } from '@/lib/auth';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickActions = [
  { icon: AlertTriangle, label: 'Lost Pet', action: 'lost_pet' },
  { icon: ClipboardList, label: 'Register', action: 'register' },
  { icon: Search, label: 'Search', action: 'search' },
  { icon: Phone, label: 'Contact', action: 'contact' },
];

const GREETING =
  "Hello! I'm the Woo-Huahua assistant. How can I help you today with your microchip registration or pet search?";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: GREETING, sender: 'bot', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [humanEscalationRequested, setHumanEscalationRequested] = useState(false);

  const sendMessage = async (content: string, escalate = false) => {
    if (!content.trim()) return;
    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: content.trim(),
          sessionId: sessionId || undefined,
          requestHumanEscalation: escalate,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data.error || 'Something went wrong. Please try again.';
        setError(msg);
        return;
      }

      if (data.sessionId) setSessionId(data.sessionId);
      if (data.humanEscalationRequested) setHumanEscalationRequested(true);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply || 'I could not generate a response. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setError('Connection failed. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading || humanEscalationRequested) return;
    sendMessage(input);
  };

  const handleEscalate = () => {
    if (isLoading || humanEscalationRequested) return;
    sendMessage('User requested connection to a human agent.', true);
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      lost_pet: 'I want to report a lost pet',
      register: 'I need help registering my pet',
      search: 'I want to search for a microchip',
      contact: 'I need to speak to someone',
    };
    const message = actionMessages[action];
    if (message) setInput(message);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
          'bg-gradient-hero text-primary-foreground hover:scale-105',
          isOpen && 'rotate-90'
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-all duration-300',
          isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        )}
      >
        <div className="bg-gradient-hero p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white">Woo-Huahua Assistant</h3>
                <p className="text-xs text-white/80">Usually responds instantly</p>
              </div>
            </div>
            <Link
              to="/chat"
              className="text-xs text-white/90 underline hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              Full page
            </Link>
          </div>
        </div>

        <div className="border-b border-border bg-info-light px-4 py-2">
          <p className="text-xs text-info">
            This is an automated assistant for the microchip database. I can connect you to a human agent if needed.
          </p>
        </div>

        <div className="h-72 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border bg-muted/30 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.action}
                  onClick={() => handleQuickAction(action.action)}
                  disabled={isLoading || humanEscalationRequested}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full border-primary/30 text-primary hover:bg-primary/10"
            onClick={handleEscalate}
            disabled={isLoading || humanEscalationRequested}
          >
            <Phone className="mr-2 h-4 w-4" />
            {humanEscalationRequested ? 'Human agent requested' : 'Connect to human agent'}
          </Button>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                humanEscalationRequested
                  ? 'A human agent will respond shortly.'
                  : 'Type your message...'
              }
              className="flex-1"
              disabled={isLoading || humanEscalationRequested}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading || humanEscalationRequested}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
