import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Catches React errors so the app shows a message instead of a blank page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[hsl(var(--background))] p-6">
          <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">
            Something went wrong
          </h1>
          <p className="max-w-md text-center text-sm text-[hsl(var(--muted-foreground))]">
            {this.state.error.message}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
          >
            Back to home
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
