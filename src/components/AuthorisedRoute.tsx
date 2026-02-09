import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, getUser } from '@/lib/auth';

type Props = { children: React.ReactNode };

/** Reg 7(1)(e): Only users with role AUTHORISED (e.g. dog wardens, vets) can access. */
export function AuthorisedRoute({ children }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
      return;
    }
    const user = getUser();
    if (user?.role !== 'AUTHORISED') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  if (!isLoggedIn() || getUser()?.role !== 'AUTHORISED') {
    return null;
  }

  return <>{children}</>;
}
