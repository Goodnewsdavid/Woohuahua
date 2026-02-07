import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Admin uses the same login page as everyone else (http://localhost:8080/login).
 * This route just redirects to /login; after login, admins are sent to /admin/dashboard.
 */
export default function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/login", { replace: true });
  }, [navigate]);

  return null;
}
