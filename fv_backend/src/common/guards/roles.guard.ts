import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AuthUser } from '../decorators/current-user.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { Role } from '../../generated/prisma/enums';

/**
 * @Roles(...) ile isaretlenen endpoint'lerde kullanicinin rolunu dogrular.
 * Global JwtAuthGuard'dan sonra calisir, bu yuzden request.user hazir olur.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Bu islem icin yetkiniz yok');
    }

    return true;
  }
}
