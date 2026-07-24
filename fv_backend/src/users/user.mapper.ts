import type { User } from '../generated/prisma/client';
import { Role, SubRole } from '../generated/prisma/enums';
import type {
  UserResponse,
  UserRoleResponse,
  UserSubRoleResponse,
} from './dto/user.response';

const ROLE_RESPONSES: Record<Role, UserRoleResponse> = {
  [Role.ADMIN]: 'admin',
  [Role.CLUB]: 'club',
  [Role.PLAYER]: 'player',
};

const SUB_ROLE_RESPONSES: Record<SubRole, UserSubRoleResponse> = {
  [SubRole.ADMIN]: 'admin',
  [SubRole.SCOUT]: 'scout',
  [SubRole.COACH]: 'coach',
  [SubRole.PLAYER]: 'player',
};

/**
 * Prisma User kaydini frontend'in bekledigi guvenli User sekline cevirir.
 * passwordHash / refreshTokenHash gibi hassas alanlari disarida birakir.
 */
export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.displayName,
    role: ROLE_RESPONSES[user.role],
    subRole: SUB_ROLE_RESPONSES[user.subRole],
    avatarUrl: user.avatarUrl,
    position: user.position,
    preferredFoot:
      user.preferredFoot === 'left' ||
      user.preferredFoot === 'right' ||
      user.preferredFoot === 'both'
        ? user.preferredFoot
        : null,
    birthDate: user.birthDate?.toISOString().slice(0, 10) ?? null,
    currentClub: user.currentClub,
    organization: user.organization,
    expertise: user.expertise,
  };
}
