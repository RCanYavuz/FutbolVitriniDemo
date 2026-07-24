/**
 * Backend API istemcisi (fetch tabanli).
 *
 * - Ayni origin uzerinden `/api/v1` kullanir; dev'de Vite, uretimde nginx backend'e proxy'ler.
 *   Bu sayede HttpOnly cookie'ler ekstra CORS ayari olmadan calisir.
 * - 401 alindiginda bir kez `/auth/refresh` deneyip istegi tekrarlar (token rotation).
 * - Aglara ulasilamadiginda `ApiError.isNetworkError` true olur; cagiran taraf mock'a dusebilir.
 */

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

/** Bos Vite degiskeni de varsayilan ayni-origin API yoluna dusmelidir. */
export const API_BASE_URL = (configuredApiUrl || '/api/v1').replace(/\/+$/, '');

export class ApiError extends Error {
  /** HTTP durum kodu; ag hatasinda 0. */
  readonly status: number;
  readonly isNetworkError: boolean;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = status === 0;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Ic kullanim: 401 sonrasi tekrar denemede sonsuz donguyu engeller. */
  _retried?: boolean;
}

const REFRESH_EXCLUDED_PATHS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
]);

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    const message = (data as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  } catch {
    // govde JSON degil - varsayilan mesaja dus
  }
  return `Istek basarisiz (${response.status})`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, _retried = false } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Sunucuya ulasilamiyor', 0);
  }

  // 401 → tek seferlik refresh + tekrar dene. Logout, access token suresi dolsa da calismalidir.
  if (response.status === 401 && !_retried && !REFRESH_EXCLUDED_PATHS.has(path)) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, _retried: true });
    }
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

let refreshRequest: Promise<boolean> | null = null;

async function performRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Ayni anda birden cok istek 401 alirsa refresh token rotation'ini yaristirmamak
 * icin tek bir yenileme istegini paylastirir.
 */
function tryRefresh(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = performRefresh().finally(() => {
      refreshRequest = null;
    });
  }
  return refreshRequest;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
