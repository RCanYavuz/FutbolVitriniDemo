import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import type { EnvironmentVariables } from '../config/env.validation';
import type { Role, SubRole } from '../generated/prisma/enums';

export interface JwtPayload {
  /** user id */
  sub: string;
  username: string;
  role: Role;
  subRole: SubRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh token'lar yuksek entropili oldugu icin bcrypt yerine SHA-256 kullaniyoruz.
 * (bcrypt girdiyi 72 bayta kirpar; JWT'ler daha uzun oldugu icin farkli token'lar ayni
 * hash'i uretip rotasyonu bozabilirdi.)
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function refreshTokenMatches(
  token: string,
  storedHash: string,
): boolean {
  const a = Buffer.from(hashRefreshToken(token), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Access/refresh JWT'lerini uretir ve dogrular. Veritabanindan bagimsizdir. */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async issueTokens(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_ACCESS_SECRET', { infer: true }),
        expiresIn: this.config.get('JWT_ACCESS_TTL', { infer: true }),
        jwtid: randomUUID(),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
        expiresIn: this.config.get('JWT_REFRESH_TTL', { infer: true }),
        // Ayni kullanici icin ayni saniyede uretilen token'lar bile benzersiz olmali.
        // Aksi halde CAS tabanli refresh rotation ayni hash'i yeniden yazabilir.
        jwtid: randomUUID(),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(token, {
        secret: this.config.get('JWT_REFRESH_SECRET', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException(
        'Refresh token gecersiz veya suresi dolmus',
      );
    }
  }
}
