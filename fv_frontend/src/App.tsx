import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { getDefaultPath } from './lib/navigation';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ClubWorkspace from './pages/ClubWorkspace';
import PlayerShowcase from './pages/PlayerShowcase';
import ScoutingHub from './pages/ScoutingHub';
import PlayerDashboard from './pages/player/PlayerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import MessagingHub from './pages/MessagingHub';
import PlayerAnalytics from './pages/PlayerAnalytics';
import PremiumPlans from './pages/PremiumPlans';
import ProfileSettings from './pages/ProfileSettings';
import { useAuthStore } from './store/authStore';

/* ─── Redirect Helper: "/" → role home ─────────────────────────── */
function RoleRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/vitrin" replace />;
  return <Navigate to={getDefaultPath(user.role)} replace />;
}

/* ─── Oturum yuklenirken kisa bir bekleme ekrani ───────────────── */
function SessionGate() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-black">
      <span className="material-symbols-outlined animate-spin text-pitch-green text-3xl">
        progress_activity
      </span>
    </div>
  );
}

/* ─── App ──────────────────────────────────────────────────────── */
export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const isInitializing = useAuthStore((s) => s.isInitializing);

  // Cookie'deki oturumu bir kez geri yuklemeyi dene (backend kapaliysa misafir olarak devam).
  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (isInitializing) {
    return <SessionGate />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated routes — with AppLayout (TopNavBar) */}
        <Route element={<AppLayout />}>
          {/* Public Showcase / Homepage */}
          <Route path="/vitrin" element={<HomePage />} />

          {/* Root redirect */}
          <Route path="/" element={<RoleRedirect />} />

          {/* ── Admin Routes ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Club Routes (Scout + Coach unified workspace) ── */}
          <Route
            path="/club"
            element={
              <ProtectedRoute allowedRoles={['club']}>
                <ClubWorkspace />
              </ProtectedRoute>
            }
          />

          {/* ── Legacy scout paths → redirect to /club ── */}
          <Route
            path="/scouting-hub"
            element={
              <ProtectedRoute allowedRoles={['club']} allowedSubRoles={['scout']}>
                <ClubWorkspace />
              </ProtectedRoute>
            }
          />

          {/* ── Scout oyuncu arama/filtreleme/karsilastirma (eskiden /club'daydi) ── */}
          <Route
            path="/club/search"
            element={
              <ProtectedRoute allowedRoles={['club']} allowedSubRoles={['scout']}>
                <ScoutingHub />
              </ProtectedRoute>
            }
          />

          <Route
            path="/scouting-hub/showcase"
            element={
              <ProtectedRoute allowedRoles={['club']} allowedSubRoles={['scout']}>
                <PlayerShowcase />
              </ProtectedRoute>
            }
          />

          {/* ── Legacy coach path → redirect to /club ── */}
          <Route
            path="/coach"
            element={
              <ProtectedRoute allowedRoles={['club']} allowedSubRoles={['coach']}>
                <ClubWorkspace />
              </ProtectedRoute>
            }
          />

          {/* ── Player Routes ── */}
          <Route
            path="/player-profile"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['player']}>
                <PlayerAnalytics />
              </ProtectedRoute>
            }
          />

          {/* ── Global Authenticated Routes ── */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagingHub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium"
            element={
              <ProtectedRoute>
                <PremiumPlans />
              </ProtectedRoute>
            }
          />

          {/* Catch all → redirect */}
          <Route path="*" element={<RoleRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
