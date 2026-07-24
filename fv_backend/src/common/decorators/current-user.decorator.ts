import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Role, SubRole } from '../../generated/prisma/enums';

/** JwtStrategy tarafindan dogrulanip request'e yazilan kimlik. */
export interface AuthUser {
  id: string;
  username: string;
  role: Role;
  subRole: SubRole;
}

/** Oturumdaki kullaniciyi (veya tek bir alanini) verir. */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthUser }>();
    return data ? request.user?.[data] : request.user;
  },
);
