import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '../generated/prisma/client';
import { AccountStatus, Role, SubRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminStatsResponse,
  PendingUserResponse,
} from './dto/pending-user.response';

const SUB_ROLE_LABELS: Record<SubRole, string> = {
  [SubRole.ADMIN]: 'Admin',
  [SubRole.SCOUT]: 'Scout',
  [SubRole.COACH]: 'Antrenör',
  [SubRole.PLAYER]: 'Oyuncu',
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listPending(): Promise<PendingUserResponse[]> {
    const users = await this.prisma.user.findMany({
      where: { status: AccountStatus.PENDING },
      orderBy: { createdAt: 'asc' },
    });
    return users.map(toPendingUser);
  }

  async getStats(): Promise<AdminStatsResponse> {
    const [totalStaff, activePlayers, pendingApprovals] = await Promise.all([
      this.prisma.user.count({
        where: { status: AccountStatus.ACTIVE, role: Role.CLUB },
      }),
      this.prisma.user.count({
        where: { status: AccountStatus.ACTIVE, role: Role.PLAYER },
      }),
      this.prisma.user.count({ where: { status: AccountStatus.PENDING } }),
    ]);
    return { totalStaff, activePlayers, pendingApprovals };
  }

  approve(id: string): Promise<void> {
    return this.setStatus(id, AccountStatus.ACTIVE);
  }

  reject(id: string): Promise<void> {
    return this.setStatus(id, AccountStatus.REJECTED);
  }

  /** Yalnizca PENDING durumdaki bir kullanicinin durumunu degistirir. */
  private async setStatus(id: string, status: AccountStatus): Promise<void> {
    const result = await this.prisma.user.updateMany({
      where: { id, status: AccountStatus.PENDING },
      data: { status },
    });

    if (result.count === 1) {
      return;
    }

    // Atomic update basarisizsa 404 ile daha once islenmis olma durumunu ayir.
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!user) {
      throw new NotFoundException('Kullanici bulunamadi');
    }
    throw new BadRequestException('Bu kullanici zaten islenmis');
  }
}

function toPendingUser(user: User): PendingUserResponse {
  return {
    id: user.id,
    name: user.displayName,
    email: user.email,
    role: SUB_ROLE_LABELS[user.subRole],
    date: user.createdAt.toISOString().slice(0, 10),
    status: 'Bekliyor',
  };
}
