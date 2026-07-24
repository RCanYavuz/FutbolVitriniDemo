import type { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import type { EnvironmentVariables } from '../config/env.validation';
import type { TokenPair } from './token.service';

export const ACCESS_TOKEN_COOKIE = 'fv_access_token';
export const REFRESH_TOKEN_COOKIE = 'fv_refresh_token';

/** Refresh cookie'si sadece auth endpoint'lerine gonderilir (global prefix + URI versiyonu dahil). */
export const REFRESH_COOKIE_PATH = '/api/v1/auth';

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 dk
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 gun

function baseOptions(
  config: ConfigService<EnvironmentVariables, true>,
): CookieOptions {
  const nodeEnv: string = config.get('NODE_ENV', { infer: true });
  const isProd = nodeEnv === 'production';
  const secureOverride = config.get('COOKIE_SECURE', { infer: true });
  const isSecure = resolveCookieSecure(nodeEnv, secureOverride);

  return {
    httpOnly: true,
    // Docker localhost HTTP icin false; gercek uretim HTTPS deploy'unda true kullanilir.
    secure: isSecure,
    sameSite: isProd ? 'strict' : 'lax',
    domain: config.get('COOKIE_DOMAIN', { infer: true }) || undefined,
  };
}

/** COOKIE_SECURE override'i yoksa production varsayimini kullanan tek karar noktasi. */
export function resolveCookieSecure(
  nodeEnv: string,
  secureOverride: string | undefined,
): boolean {
  return secureOverride === undefined
    ? nodeEnv === 'production'
    : secureOverride === 'true';
}

/** cookie-parser'in `any` tipini HTTP sinirinda guvenli bir string'e daraltir. */
export function getCookie(req: Request, name: string): string | undefined {
  const cookies: unknown = req.cookies;
  if (typeof cookies !== 'object' || cookies === null) {
    return undefined;
  }

  const value = (cookies as Record<string, unknown>)[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function setAuthCookies(
  res: Response,
  tokens: TokenPair,
  config: ConfigService<EnvironmentVariables, true>,
) {
  const options = baseOptions(config);

  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...options,
    path: '/',
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...options,
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

export function clearAuthCookies(
  res: Response,
  config: ConfigService<EnvironmentVariables, true>,
) {
  const options = baseOptions(config);

  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...options, path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    ...options,
    path: REFRESH_COOKIE_PATH,
  });
}
