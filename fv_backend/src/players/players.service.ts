import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { Prisma } from '../generated/prisma/client';
import { Role } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import {
  PaginatedPlayersResponse,
  PlayerResponse,
} from './dto/player.response';
import { QueryPlayersDto } from './dto/query-players.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { toPlayerResponse } from './player.mapper';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: QueryPlayersDto,
    /** Verilirse yalnizca bu kullanicinin olusturdugu oyuncular doner. */
    ownerId?: string,
  ): Promise<PaginatedPlayersResponse> {
    const where = this.buildWhere(query, ownerId);

    const [players, total] = await Promise.all([
      this.prisma.player.findMany({
        where,
        // Esit puanlarda benzersiz ikinci anahtar sayfa sinirlarini kararlı tutar.
        orderBy: [{ aiScore: 'desc' }, { id: 'asc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.player.count({ where }),
    ]);

    return {
      items: players.map(toPlayerResponse),
      total,
      page: query.page,
      limit: query.limit,
      pageCount: Math.ceil(total / query.limit),
    };
  }

  async findOne(id: string): Promise<PlayerResponse> {
    return toPlayerResponse(await this.getOrThrow(id));
  }

  async create(dto: CreatePlayerDto, ownerId: string): Promise<PlayerResponse> {
    const player = await this.prisma.player.create({
      data: {
        name: dto.name,
        age: dto.age,
        position: dto.position,
        team: dto.team,
        aiScore: dto.aiScore,
        matchPercentage: dto.matchPercentage ?? null,
        aiReasoning: dto.aiReasoning ?? null,
        imageUrl: dto.imageUrl ?? '',
        ...dto.stats,
        ...dto.metrics,
        ownerId,
      },
    });
    return toPlayerResponse(player);
  }

  async update(
    id: string,
    dto: UpdatePlayerDto,
    user: AuthUser,
  ): Promise<PlayerResponse> {
    const existing = await this.getOrThrow(id);
    this.assertCanManage(existing.ownerId, user);

    const player = await this.prisma.player.update({
      where: { id },
      // Verilmeyen alanlar undefined kalir; Prisma bunlari degistirmez.
      data: {
        name: dto.name,
        age: dto.age,
        position: dto.position,
        team: dto.team,
        aiScore: dto.aiScore,
        matchPercentage: dto.matchPercentage,
        aiReasoning: dto.aiReasoning,
        imageUrl: dto.imageUrl,
        ...dto.stats,
        ...dto.metrics,
      },
    });
    return toPlayerResponse(player);
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const existing = await this.getOrThrow(id);
    this.assertCanManage(existing.ownerId, user);
    await this.prisma.player.delete({ where: { id } });
  }

  /* ── yardimcilar ─────────────────────────────────────────────── */

  private buildWhere(
    query: QueryPlayersDto,
    ownerId?: string,
  ): Prisma.PlayerWhereInput {
    return {
      ...(ownerId ? { ownerId } : {}),
      ...(query.positions?.length ? { position: { in: query.positions } } : {}),
      ...(query.minAiScore !== undefined
        ? { aiScore: { gte: query.minAiScore } }
        : {}),
      ...(query.minAge !== undefined || query.maxAge !== undefined
        ? { age: { gte: query.minAge, lte: query.maxAge } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { team: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private async getOrThrow(id: string) {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) {
      throw new NotFoundException('Oyuncu bulunamadi');
    }
    return player;
  }

  private assertCanManage(ownerId: string | null, user: AuthUser): void {
    if (user.role !== Role.ADMIN && ownerId !== user.id) {
      throw new ForbiddenException('Bu oyuncu profili uzerinde yetkiniz yok');
    }
  }
}
