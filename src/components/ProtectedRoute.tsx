import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '@/lib/auth';

type Props = { children: React.ReactNode };

/**
 * Wraps pages that require authentication. Redirects to /login if not logged in.
 */
export function ProtectedRoute({ children }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (!isLoggedIn()) {
    return null;
  }

  return <>{children}</>;
}
