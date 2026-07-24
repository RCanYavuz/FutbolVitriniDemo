import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useScoutingStore } from '../../store/scoutingStore';
import { useAuthStore } from '../../store/authStore';

export default function TopNavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchQuery = useScoutingStore((s) => s.searchQuery);
  const setSearchQuery = useScoutingStore((s) => s.setSearchQuery);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const linkBase =
    'h-full flex items-center px-3 py-2 transition-all duration-200 text-body-md';
  const activeClass =
    'text-primary font-bold border-b-2 border-primary';
  const inactiveClass =
    'text-text-muted hover:text-on-surface hover:bg-surface-secondary rounded-lg';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const subRoleLabel: Record<string, string> = {
    admin: 'Admin',
    scout: 'Scout',
    coach: 'Antrenör',
    player: 'Futbolcu',
  };

  const navLinks = () => {
    if (!user) return [];
    if (user.subRole === 'scout') {
      return [
        { to: '/club', label: 'Panel' },
        { to: '/club/search', label: 'Keşif Paneli' },
        { to: '/scouting-hub/showcase', label: 'Player Showcase' },
        { to: '/messages', label: 'Mesajlar' },
        { to: '/premium', label: 'Premium' },
      ];
    }
    if (user.subRole === 'coach') {
      return [
        { to: '/club', label: 'Antrenör Paneli' },
        { to: '/messages', label: 'Mesajlar' },
        { to: '/premium', label: 'Premium' },
      ];
    }
    if (user.role === 'player') {
      return [
        { to: '/player-profile', label: 'My Dashboard' },
        { to: '/analytics', label: 'Analizler' },
        { to: '/messages', label: 'Mesajlar' },
        { to: '/premium', label: 'Premium' },
      ];
    }
    if (user.role === 'admin') {
      // Admin platformu yoneten taraftir; Premium (abonelik) bir musteri
      // ozelligidir, admin navigasyonunda yer almaz.
      return [
        { to: '/admin', label: 'Admin Dashboard' },
        { to: '/messages', label: 'Mesajlar' },
      ];
    }
    return [];
  };

  const links = navLinks();

  return (
    <nav className="bg-surface-container border-b border-border-standard flex-shrink-0 z-50 sticky top-0">
      <div className="flex justify-between items-center w-full px-4 lg:px-lg h-16 max-w-[1440px] mx-auto">
        {/* Left: Brand + Mobile Hamburger */}
        <div className="flex items-center gap-4 lg:gap-lg">
          <button
            className="lg:hidden p-2 text-text-muted hover:text-on-surface"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-pitch-green text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              sports_soccer
            </span>
            <span className="text-headline-md font-bold text-pitch-green tracking-tight">
              Futbol Vitrini
            </span>
            {user && (
              <span className="text-xs font-medium text-text-muted bg-surface-secondary px-2 py-0.5 rounded-full ml-1">
                {subRoleLabel[user.subRole]}
              </span>
            )}
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 h-full">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end
                className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-3">
          {user?.subRole === 'scout' && (
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">
                search
              </span>
              <input
                className="bg-surface-primary border border-border-standard rounded-full py-1.5 pl-10 pr-4 text-on-surface focus:outline-none focus:border-tactical-blue w-56 lg:w-64 text-sm"
                placeholder="Oyuncu, kulüp ara..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {user && (
            <NavLink
              to="/settings"
              title="Profil ayarlari"
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-surface-secondary transition-colors"
            >
              {user.avatarUrl && (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-border-standard">
                  <img alt={user.name} className="w-full h-full object-cover" src={user.avatarUrl} />
                </div>
              )}
              <span className="hidden sm:block text-sm text-on-surface font-medium">{user.name}</span>
            </NavLink>
          )}

          <button
            onClick={handleLogout}
            className="text-accent-red hover:bg-surface-secondary px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border-standard bg-surface-container px-4 py-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg transition-colors ${isActive ? 'text-primary font-bold bg-surface-secondary' : 'text-text-muted hover:text-on-surface hover:bg-surface-secondary'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
