import { useAuthStore } from '../store/authStore';
import CoachDashboard from './CoachDashboard';
import GlobalDashboard from './GlobalDashboard';

/* ═══════════════════════════════════════════════════════════════════
   CLUB WORKSPACE
   Routes both scout and coach subRoles to their respective UIs.
   ═══════════════════════════════════════════════════════════════════ */
export default function ClubWorkspace() {
  const user = useAuthStore((s) => s.user);

  /* ── Coach view ── */
  if (user?.subRole === 'coach') {
    return <CoachDashboard />;
  }

  /* ── Scout view ──
     GlobalDashboard scout'un ana ekranidir (ozet, AI kesif, hizli erisim).
     Oyuncu arama/filtreleme/karsilastirma (ScoutingHub) ayri bir alt sayfaya
     tasindi, bkz. /club/search route'u App.tsx'te. */
  return <GlobalDashboard />;
}
