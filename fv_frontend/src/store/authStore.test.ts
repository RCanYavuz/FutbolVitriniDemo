import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../lib/api';
import { authApi } from '../lib/auth.api';
import { MOCK_CREDENTIALS, useAuthStore } from './authStore';

const initialState = useAuthStore.getState();

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState(initialState, true);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('baslangicta oturum acik degildir', () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('backend basariliysa donen kullaniciyla oturum acar', async () => {
    const backendUser = {
      id: 'srv-1',
      name: 'Ahmet Yılmaz',
      role: 'club',
      subRole: 'scout',
      avatarUrl: '',
    } as const;
    vi.spyOn(authApi, 'login').mockResolvedValue({ ...backendUser });

    const ok = await useAuthStore.getState().login('scout', 'scout123');

    expect(ok).toBe(true);
    expect(useAuthStore.getState().user).toEqual(backendUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('gecerli mock bilgileri kullanilsa bile backend 401 hatasinda fallback yapmaz', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(new ApiError('Kullanici adi veya parola hatali', 401));

    const ok = await useAuthStore.getState().login('scout', 'scout123');

    expect(ok).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().loginError).toBe('Kullanici adi veya parola hatali');
  });

  it('backend kapaliyken (ag hatasi) mock hesaba duser', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(new ApiError('Sunucuya ulasilamiyor', 0));

    const ok = await useAuthStore.getState().login('scout', 'scout123');

    expect(ok).toBe(true);
    expect(useAuthStore.getState().user?.subRole).toBe('scout');
  });

  it('mock fallback kullanici adinda backend gibi buyuk/kucuk harf ayirmaz', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(new ApiError('Sunucuya ulasilamiyor', 0));

    const ok = await useAuthStore.getState().login('Scout', 'scout123');

    expect(ok).toBe(true);
    expect(useAuthStore.getState().user?.subRole).toBe('scout');
  });

  it('backend kapaliyken yanlis mock parolasi giris yaptirmaz', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue(new ApiError('Sunucuya ulasilamiyor', 0));

    const ok = await useAuthStore.getState().login('scout', 'yanlis');

    expect(ok).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('logout backend cagirir ve yerel oturumu temizler', async () => {
    const logoutSpy = vi.spyOn(authApi, 'logout').mockResolvedValue();
    vi.spyOn(authApi, 'login').mockResolvedValue({
      id: 'srv-1',
      name: 'Admin',
      role: 'admin',
      subRole: 'admin',
      avatarUrl: '',
    });

    await useAuthStore.getState().login('admin', 'admin123');
    await useAuthStore.getState().logout();

    expect(logoutSpy).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('initialize cookie oturumunu geri yukler', async () => {
    vi.spyOn(authApi, 'me').mockResolvedValue({
      id: 'srv-9',
      name: 'Arda Güler',
      role: 'player',
      subRole: 'player',
      avatarUrl: '',
    });

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isInitializing).toBe(false);
    expect(useAuthStore.getState().user?.role).toBe('player');
  });

  it('initialize oturum yoksa misafir birakir', async () => {
    vi.spyOn(authApi, 'me').mockRejectedValue(new ApiError('Yetkisiz', 401));

    await useAuthStore.getState().initialize();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isInitializing).toBe(false);
  });

  it('clearError sadece hatayi siler', () => {
    useAuthStore.setState({ loginError: 'bir hata' });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().loginError).toBeNull();
  });

  it('hasRole ve hasSubRole oturumdaki kullaniciya gore yanit verir', () => {
    useAuthStore.setState({
      user: { id: 'x', name: 'X', role: 'club', subRole: 'coach', avatarUrl: '' },
      isAuthenticated: true,
    });

    expect(useAuthStore.getState().hasRole('club')).toBe(true);
    expect(useAuthStore.getState().hasRole('admin')).toBe(false);
    expect(useAuthStore.getState().hasSubRole('coach')).toBe(true);
  });

  it('mock hesap listesi 4 rolu kapsar', () => {
    expect(MOCK_CREDENTIALS.map((c) => c.username)).toEqual(['admin', 'scout', 'coach', 'player']);
  });
});
