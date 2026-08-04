import { create } from 'zustand';
import { ApiError } from '../lib/api';
import { authApi } from '../lib/auth.api';
import type { MockCredential, User, UserRole, UserSubRole } from './types';

/* ─── Mock Credentials ─────────────────────────────────────────────
   Backend'e ulasilamadiginda (offline / testler) bu hesaplarla giris yapilir.
   Backend seed'i de ayni kullanici adi + parolalari icerir, boylece davranis
   cevrimici ve cevrimdisi ayni kalir. */
export const MOCK_CREDENTIALS: MockCredential[] = [
  {
    username: 'admin',
    password: 'admin123',
    user: {
      id: 'u-admin-001',
      name: 'Sistem Yöneticisi',
      role: 'admin',
      subRole: 'admin',
      avatarUrl: 'https://ui-avatars.com/api/?name=Sistem+Yonetici&background=FF4842&color=fff&bold=true',
    },
  },
  {
    username: 'scout',
    password: 'scout123',
    user: {
      id: 'u-scout-001',
      name: 'Ahmet Yılmaz',
      role: 'club',
      subRole: 'scout',
      organization: 'FC Porto B',
      avatarUrl: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=00B0FF&color=fff&bold=true',
    },
  },
  {
    username: 'coach',
    password: 'coach123',
    user: {
      id: 'u-coach-001',
      name: 'Fatih Terim',
      role: 'club',
      subRole: 'coach',
      avatarUrl: 'https://ui-avatars.com/api/?name=Fatih+Terim&background=00E676&color=000&bold=true',
    },
  },
  {
    username: 'player',
    password: 'player123',
    user: {
      id: 'u-player-001',
      name: 'Arda Güler',
      role: 'player',
      subRole: 'player',
      avatarUrl: 'https://ui-avatars.com/api/?name=Arda+Guler&background=00E676&color=000&bold=true',
    },
  },
];

const INVALID_CREDENTIALS_MESSAGE = 'Geçersiz kullanıcı adı veya şifre.';

/* ─── Auth State ───────────────────────────────────────────────── */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  loginError: string | null;
  /** Sayfa acilisinda cookie'den oturumu geri yukler. */
  initialize: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
  hasSubRole: (subRole: UserSubRole) => boolean;
}

/** Backend erisilemezken mock hesaplara duser. */
function loginWithMock(username: string, password: string): User | null {
  const match = MOCK_CREDENTIALS.find(
    (c) => c.username === username.toLowerCase() && c.password === password,
  );
  return match?.user ?? null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  loginError: null,

  initialize: async () => {
    try {
      const user = await authApi.me();
      set({ user, isAuthenticated: true });
    } catch {
      // Oturum yok ya da backend kapali - misafir olarak devam
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isInitializing: false });
    }
  },

  login: async (username, password) => {
    try {
      const user = await authApi.login({ username, password });
      set({ user, isAuthenticated: true, loginError: null });
      return true;
    } catch (error) {
      // Backend'e ulasilamiyorsa mock hesaplara dus (offline / test)
      if (error instanceof ApiError && error.isNetworkError) {
        const mockUser = loginWithMock(username, password);
        if (mockUser) {
          set({ user: mockUser, isAuthenticated: true, loginError: null });
          return true;
        }
      }

      const message =
        error instanceof ApiError && !error.isNetworkError
          ? error.message
          : INVALID_CREDENTIALS_MESSAGE;
      set({ loginError: message });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Cikis her durumda yerel oturumu temizler
    }
    set({ user: null, isAuthenticated: false, loginError: null });
  },

  clearError: () => set({ loginError: null }),

  hasRole: (role) => get().user?.role === role,

  hasSubRole: (subRole) => get().user?.subRole === subRole,
}));
