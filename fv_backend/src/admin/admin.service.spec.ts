import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AccountStatus, Role, SubRole } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      updateMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = moduleRef.get(AdminService);
  });

  it('bekleyen kullanicilari panel seklinde (Turkce rol etiketi + tarih) doner', async () => {
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'u1',
        displayName: 'Caner Erkin',
        email: 'caner@player.com',
        subRole: SubRole.PLAYER,
        role: Role.PLAYER,
        createdAt: new Date('2026-07-23T10:00:00Z'),
      },
    ]);

    const [row] = await service.listPending();

    expect(row).toEqual({
      id: 'u1',
      name: 'Caner Erkin',
      email: 'caner@player.com',
      role: 'Oyuncu',
      date: '2026-07-23',
      status: 'Bekliyor',
    });
  });

  it('approve PENDING kullaniciyi ACTIVE yapar', async () => {
    await service.approve('u1');

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'u1', status: AccountStatus.PENDING },
      data: { status: AccountStatus.ACTIVE },
    });
  });

  it('reject PENDING kullaniciyi REJECTED yapar', async () => {
    await service.reject('u1');

    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'u1', status: AccountStatus.PENDING },
      data: { status: AccountStatus.REJECTED },
    });
  });

  it('olmayan kullanicida 404', async () => {
    prisma.user.updateMany.mockResolvedValue({ count: 0 });
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.approve('yok')).rejects.toThrow(NotFoundException);
  });

  it('zaten islenmis kullanicida 400', async () => {
    prisma.user.updateMany.mockResolvedValue({ count: 0 });
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      status: AccountStatus.ACTIVE,
    });
    await expect(service.approve('u1')).rejects.toThrow(BadRequestException);
  });
});
