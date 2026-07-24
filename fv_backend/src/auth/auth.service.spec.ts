import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import {
  AccountStatus,
  Position,
  Role,
  SubRole,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { hashRefreshToken, TokenService } from './token.service';

interface UserCreateArgs {
  data: {
    username: string;
    email: string;
    role: Role;
    subRole: SubRole;
    status: AccountStatus;
    passwordHash: string;
    organization?: string | null;
    expertise?: string | null;
    avatarUrl: string;
    position?: Position | null;
    preferredFoot?: string | null;
    birthDate?: Date | null;
    currentClub?: string | null;
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock<Promise<unknown>, [UserCreateArgs]>;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let tokens: { issueTokens: jest.Mock; verifyRefreshToken: jest.Mock };

  const activeUser = {
    id: 'u1',
    username: 'scout',
    email: 'scout@fv.com',
    displayName: 'Ahmet',
    role: Role.CLUB,
    subRole: SubRole.SCOUT,
    avatarUrl: '',
    status: AccountStatus.ACTIVE,
    organization: null,
    expertise: null,
    position: null,
    preferredFoot: null,
    birthDate: null,
    currentClub: null,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn<Promise<unknown>, [UserCreateArgs]>(),
        update: jest.fn().mockResolvedValue({}),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    tokens = {
      issueTokens: jest.fn().mockResolvedValue({
        accessToken: 'access.jwt',
        refreshToken: 'refresh.jwt',
      }),
      verifyRefreshToken: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: TokenService, useValue: tokens },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('kullanici adi cakisirsa 409', async () => {
      prisma.user.findFirst.mockResolvedValue({
        username: 'scout',
        email: 'x@y.com',
      });

      await expect(
        service.register({
          username: 'scout',
          email: 'yeni@fv.com',
          displayName: 'X',
          password: 'parola1234',
          role: 'player',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('oyuncu kaydinda PENDING + PLAYER rolu ile olusturur', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(activeUser);

      await service.register({
        username: 'ARDA',
        email: 'Arda@FV.com',
        displayName: 'Arda',
        password: 'parola1234',
        role: 'player',
        position: Position.FW,
        preferredFoot: 'left',
        birthDate: '2005-02-25',
        currentClub: 'Fenerbahce U19',
        avatarUrl: 'https://example.com/arda.png',
      });

      const data = prisma.user.create.mock.calls[0][0].data;
      expect(data.username).toBe('arda');
      expect(data.email).toBe('arda@fv.com');
      expect(data.role).toBe(Role.PLAYER);
      expect(data.subRole).toBe(SubRole.PLAYER);
      expect(data.status).toBe(AccountStatus.PENDING);
      expect(data.passwordHash).not.toBe('parola1234');
      expect(data.position).toBe(Position.FW);
      expect(data.preferredFoot).toBe('left');
      expect(data.birthDate).toEqual(new Date('2005-02-25T00:00:00.000Z'));
      expect(data.currentClub).toBe('Fenerbahce U19');
      expect(data.avatarUrl).toBe('https://example.com/arda.png');
    });

    it('kulup kaydinda CLUB + SCOUT ve organizasyon bilgisi kaydeder', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(activeUser);

      await service.register({
        username: 'kulup',
        email: 'kulup@fv.com',
        displayName: 'Kulup',
        password: 'parola1234',
        role: 'club',
        organization: 'Bursaspor',
        expertise: 'A Takim Scout',
        position: Position.FW,
        preferredFoot: 'left',
        birthDate: '2005-02-25',
        currentClub: 'Gonderilmemeli',
      });

      const data = prisma.user.create.mock.calls[0][0].data;
      expect(data.role).toBe(Role.CLUB);
      expect(data.subRole).toBe(SubRole.SCOUT);
      expect(data.organization).toBe('Bursaspor');
      expect(data.position).toBeNull();
      expect(data.preferredFoot).toBeNull();
      expect(data.birthDate).toBeNull();
      expect(data.currentClub).toBeNull();
    });

    it('antrenor secimini COACH alt roluyle kaydeder', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(activeUser);

      await service.register({
        username: 'antrenor',
        email: 'antrenor@fv.com',
        displayName: 'Antrenor',
        password: 'parola1234',
        role: 'club',
        subRole: 'coach',
        organization: 'Bursaspor',
        expertise: 'Teknik Direktor',
      });

      expect(prisma.user.create.mock.calls[0][0].data.subRole).toBe(
        SubRole.COACH,
      );
    });

    it('oyuncu yas siniri disindaki dogum tarihini reddeder', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.register({
          username: 'cocuk',
          email: 'cocuk@fv.com',
          displayName: 'Cocuk',
          password: 'parola1234',
          role: 'player',
          position: Position.FW,
          preferredFoot: 'left',
          birthDate: new Date().toISOString().slice(0, 10),
        }),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('eszamanli unique constraint yarisi 409 doner', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockRejectedValue({ code: 'P2002' });

      await expect(
        service.register({
          username: 'arda',
          email: 'arda@fv.com',
          displayName: 'Arda',
          password: 'parola1234',
          role: 'player',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('bilinmeyen kullanicida 401', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ username: 'yok', password: 'parola1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('PENDING hesap giris yapamaz (403)', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...activeUser,
        status: AccountStatus.PENDING,
        passwordHash: await hash('parola1234', 4),
      });

      await expect(
        service.login({ username: 'scout', password: 'parola1234' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('dogru parolayla giris yapar, frontend user seklini ve refresh ozetini kaydeder', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...activeUser,
        passwordHash: await hash('parola1234', 4),
      });

      const result = await service.login({
        username: 'scout',
        password: 'parola1234',
      });

      expect(result.user).toEqual({
        id: 'u1',
        name: 'Ahmet',
        role: 'club',
        subRole: 'scout',
        avatarUrl: '',
        position: null,
        preferredFoot: null,
        birthDate: null,
        currentClub: null,
        organization: null,
        expertise: null,
      });
      expect(result.tokens.accessToken).toBe('access.jwt');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { refreshTokenHash: hashRefreshToken('refresh.jwt') },
      });
    });
  });

  describe('refresh', () => {
    it('cookie yoksa 401', async () => {
      await expect(service.refresh(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('kayittaki hash ile eslesmeyen token reddedilir', async () => {
      tokens.verifyRefreshToken.mockResolvedValue({ sub: 'u1' });
      prisma.user.findUnique.mockResolvedValue({
        ...activeUser,
        refreshTokenHash: hashRefreshToken('baska.token'),
      });

      await expect(service.refresh('refresh.jwt')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('refresh token hashini compare-and-swap ile atomik yeniler', async () => {
      const currentHash = hashRefreshToken('refresh.jwt');
      tokens.verifyRefreshToken.mockResolvedValue({ sub: 'u1' });
      prisma.user.findUnique.mockResolvedValue({
        ...activeUser,
        refreshTokenHash: currentHash,
      });

      await service.refresh('refresh.jwt');

      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { id: 'u1', refreshTokenHash: currentHash },
        data: { refreshTokenHash: hashRefreshToken('refresh.jwt') },
      });
    });

    it('baska istek once rotate ettiyse ayni refresh tokeni reddeder', async () => {
      tokens.verifyRefreshToken.mockResolvedValue({ sub: 'u1' });
      prisma.user.findUnique.mockResolvedValue({
        ...activeUser,
        refreshTokenHash: hashRefreshToken('refresh.jwt'),
      });
      prisma.user.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.refresh('refresh.jwt')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  it('logout refresh ozetini temizler', async () => {
    await service.logout('u1');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { refreshTokenHash: null },
    });
  });
});
