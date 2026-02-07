import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, getUser } from "@/lib/auth";

type Props = { children: React.ReactNode };

/**
 * Wraps admin pages. Redirects to /admin/login if not logged in,
 * or to / if logged in but not ADMIN.
 */
export function AdminRoute({ children }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    const user = getUser();
    if (user?.role !== "ADMIN") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  if (!isLoggedIn()) return null;
  if (getUser()?.role !== "ADMIN") return null;

  return <>{children}</>;
}
