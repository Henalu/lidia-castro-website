import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export function RequireAuth() {
  const { profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="section-shell px-5 text-sm text-on-surface-variant">Cargando acceso...</div>;
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RequireSuperadmin() {
  const { profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="section-shell px-5 text-sm text-on-surface-variant">Cargando acceso...</div>;
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (profile.role !== "superadmin") {
    return <Navigate to="/mi-cuenta" replace />;
  }

  return <Outlet />;
}
