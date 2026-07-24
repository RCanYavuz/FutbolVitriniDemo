import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { Position, Role, SubRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { PlayersService } from './players.service';

const owner: AuthUser = {
  id: 'owner-1',
  username: 'owner',
  role: Role.PLAYER,
  subRole: SubRole.PLAYER,
};
const stranger: AuthUser = {
  id: 'other-1',
  username: 'other',
  role: Role.CLUB,
  subRole: SubRole.SCOUT,
};
const admin: AuthUser = {
  id: 'admin-1',
  username: 'admin',
  role: Role.ADMIN,
  subRole: SubRole.ADMIN,
};

const dbPlayer = {
  id: 'player-1',
  name: 'Lucas Silva',
  age: 21,
  position: Position.FW,
  team: 'FC Porto B',
  aiScore: 8.9,
  matchPercentage: 94,
  aiReasoning: 'High-pressing striker.',
  imageUrl: 'https://example.com/lucas.png',
  pace: 93,
  passing: 72,
  defending: 28,
  physical: 78,
  tackling: 25,
  vision: 70,
  dribbling: 88,
  shooting: 85,
  sprintSpeed: 93,
  shotPower: 82,
  passingAcc: 78,
  ownerId: owner.id,
  createdAt: new Date(),
  updatedAt: new Date(),
};

interface FindManyArgs {
  where?: {
    position?: { in?: Position[] };
    aiScore?: { gte?: number };
    ownerId?: string;
  };
}

interface CreateArgs {
  data: {
    pace?: number;
    sprintSpeed?: number;
    ownerId?: string;
  };
}

describe('PlayersService', () => {
  let service: PlayersService;
  let prisma: {
    player: {
      findUnique: jest.Mock;
      findMany: jest.Mock<Promise<(typeof dbPlayer)[]>, [FindManyArgs]>;
      count: jest.Mock;
      create: jest.Mock<Promise<typeof dbPlayer>, [CreateArgs]>;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      player: {
        findUnique: jest.fn(),
        findMany: jest.fn<Promise<(typeof dbPlayer)[]>, [FindManyArgs]>(),
        count: jest.fn(),
        create: jest.fn<Promise<typeof dbPlayer>, [CreateArgs]>(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [PlayersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(PlayersService);
  });

  describe('findAll', () => {
    it('nested stats/metrics ile frontend seklinde doner', async () => {
      prisma.player.findMany.mockResolvedValue([dbPlayer]);
      prisma.player.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.total).toBe(1);
      expect(result.items[0]).toMatchObject({
        id: 'player-1',
        name: 'Lucas Silva',
        stats: { pace: 93, shooting: 85 },
        metrics: { sprintSpeed: 93 },
        matchPercentage: 94,
      });
      // Duz sutunlar disari sizmamali
      expect(
        (result.items[0] as unknown as Record<string, unknown>).pace,
      ).toBeUndefined();
      expect(prisma.player.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ aiScore: 'desc' }, { id: 'asc' }],
        }),
      );
    });

    it('filtreleri where kosuluna cevirir', async () => {
      prisma.player.findMany.mockResolvedValue([]);
      prisma.player.count.mockResolvedValue(0);

      await service.findAll({
        page: 1,
        limit: 20,
        positions: [Position.FW],
        minAiScore: 8,
        search: 'silva',
      });

      const { where } = prisma.player.findMany.mock.calls[0][0];
      expect(where).toMatchObject({
        position: { in: [Position.FW] },
        aiScore: { gte: 8 },
      });
    });

    it('ownerId verilirse sadece o kullanicinin oyuncularini sorgular', async () => {
      prisma.player.findMany.mockResolvedValue([]);
      prisma.player.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 20 }, owner.id);

      const { where } = prisma.player.findMany.mock.calls[0][0];
      expect(where).toMatchObject({ ownerId: owner.id });
    });
  });

  describe('findOne', () => {
    it('bulunamazsa 404', async () => {
      prisma.player.findUnique.mockResolvedValue(null);
      await expect(service.findOne('yok')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update / remove', () => {
    it('baskasinin oyuncusunu guncellemeye izin vermez', async () => {
      prisma.player.findUnique.mockResolvedValue(dbPlayer);

      await expect(
        service.update(dbPlayer.id, { name: 'Yeni' }, stranger),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.player.update).not.toHaveBeenCalled();
    });

    it('sahibi kendi oyuncusunu guncelleyebilir', async () => {
      prisma.player.findUnique.mockResolvedValue(dbPlayer);
      prisma.player.update.mockResolvedValue({ ...dbPlayer, name: 'Yeni' });

      const result = await service.update(dbPlayer.id, { name: 'Yeni' }, owner);

      expect(result.name).toBe('Yeni');
    });

    it('admin baskasinin oyuncusunu silebilir', async () => {
      prisma.player.findUnique.mockResolvedValue(dbPlayer);
      prisma.player.delete.mockResolvedValue(dbPlayer);

      await service.remove(dbPlayer.id, admin);

      expect(prisma.player.delete).toHaveBeenCalledWith({
        where: { id: dbPlayer.id },
      });
    });
  });

  describe('create', () => {
    it('nested stats/metrics alanlarini duz sutunlara acar', async () => {
      prisma.player.create.mockResolvedValue(dbPlayer);

      await service.create(
        {
          name: 'Lucas Silva',
          age: 21,
          position: Position.FW,
          team: 'FC Porto B',
          aiScore: 8.9,
          stats: {
            pace: 93,
            passing: 72,
            defending: 28,
            physical: 78,
            tackling: 25,
            vision: 70,
            dribbling: 88,
            shooting: 85,
          },
          metrics: { sprintSpeed: 93, shotPower: 82, passingAcc: 78 },
        },
        owner.id,
      );

      const { data } = prisma.player.create.mock.calls[0][0];
      expect(data).toMatchObject({
        pace: 93,
        sprintSpeed: 93,
        ownerId: owner.id,
      });
    });
  });
});
