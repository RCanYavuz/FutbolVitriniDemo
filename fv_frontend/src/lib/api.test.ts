import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL, ApiError, api } from './api';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('api istemcisi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('bos VITE_API_URL icin ayni-origin /api/v1 yolunu kullanir', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ ok: true }));

    await api.get<{ ok: boolean }>('/health');

    expect(API_BASE_URL).toBe('/api/v1');
    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/health',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('ag hatasini mock fallback icin ayirt edilebilir hale getirir', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(api.get('/players')).rejects.toMatchObject({
      status: 0,
      isNetworkError: true,
    } satisfies Partial<ApiError>);
  });

  it('auth disi 401 sonrasi refresh edip istegi bir kez tekrarlar', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ message: 'Token suresi doldu' }, 401))
      .mockResolvedValueOnce(jsonResponse({ user: {}, accessToken: 'yenilendi' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'u1' }));

    await expect(api.get<{ id: string }>('/users/me')).resolves.toEqual({ id: 'u1' });

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/api/v1/auth/refresh',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('paralel 401 yanitlarinda tek refresh istegini paylastirir', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ message: 'Token suresi doldu' }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: 'Token suresi doldu' }, 401))
      .mockResolvedValueOnce(jsonResponse({ user: {}, accessToken: 'yenilendi' }))
      .mockResolvedValueOnce(jsonResponse({ value: 1 }))
      .mockResolvedValueOnce(jsonResponse({ value: 2 }));

    const results = await Promise.all([
      api.get<{ value: number }>('/admin/stats'),
      api.get<{ value: number }>('/admin/pending-users'),
    ]);

    expect(results).toEqual([{ value: 1 }, { value: 2 }]);
    const refreshCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([url]) => url === '/api/v1/auth/refresh');
    expect(refreshCalls).toHaveLength(1);
  });

  it('login 401 yanitini refresh denemeden API hatasi olarak dondurur', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: 'Kullanici adi veya parola hatali' }, 401),
    );

    await expect(
      api.post('/auth/login', { username: 'scout', password: 'yanlis' }),
    ).rejects.toMatchObject({
      status: 401,
      message: 'Kullanici adi veya parola hatali',
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('access token suresi dolmus logout istegini refresh sonrasi tamamlar', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ message: 'Token suresi doldu' }, 401))
      .mockResolvedValueOnce(jsonResponse({ user: {}, accessToken: 'yenilendi' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(api.post<void>('/auth/logout')).resolves.toBeUndefined();

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/api/v1/auth/refresh',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
