import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import type { EnvironmentVariables } from '../../config/env.validation';
import { AccountStatus } from '../../generated/prisma/enums';
import { UsersService } from '../../users/users.service';
import { ACCESS_TOKEN_COOKIE, getCookie } from '../cookies';
import type { JwtPayload } from '../token.service';

/** Once HttpOnly cookie'ye, yoksa Authorization: Bearer basligina bakar (Swagger/mobil icin). */
function extractJwt(req: Request): string | null {
  const fromCookie = getCookie(req, ACCESS_TOKEN_COOKIE);
  if (fromCookie) {
    return fromCookie;
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService<EnvironmentVariables, true>,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: extractJwt,
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.users.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Kullanici artik mevcut degil');
    }
    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Hesap aktif degil');
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      subRole: user.subRole,
    };
  }
}
