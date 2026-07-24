import { Navigate, useLocation } from 'react-router-dom';
import { getDefaultPath } from '../../lib/navigation';
import { useAuthStore } from '../../store/authStore';
import type { UserRole, UserSubRole } from '../../store/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Broad role-based access (admin | club | player) */
  allowedRoles?: UserRole[];
  /** Granular sub-role access (admin | scout | coach | player) */
  allowedSubRoles?: UserSubRole[];
}

/**
 * Route guard that checks authentication and role-based authorization.
 *
 * - If user is not authenticated → redirect to /login
 * - If user's role/subRole is not in the allowed list → redirect to their own dashboard
 * - Otherwise → render children
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  allowedSubRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  /* ── Not authenticated ── */
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* ── Role check ── */
  const roleOk = !allowedRoles || allowedRoles.includes(user.role);
  const subRoleOk = !allowedSubRoles || allowedSubRoles.includes(user.subRole);

  if (!roleOk || !subRoleOk) {
    // Redirect unauthorized users to their default dashboard
    return <Navigate to={getDefaultPath(user.role)} replace />;
  }

  return <>{children}</>;
}
