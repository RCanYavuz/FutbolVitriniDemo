import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../generated/prisma/enums';

export const ROLES_KEY = 'roles';

/** Endpoint'i yalnizca belirtilen rollere acar. RolesGuard ile birlikte kullanilir. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
