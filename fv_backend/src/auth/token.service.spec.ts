import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Role, SubRole } from '../generated/prisma/enums';
import { TokenService } from './token.service';

describe('TokenService', () => {
  it('ayni payload icin access ve refresh tokenlarina benzersiz jti ekler', async () => {
    const jwt = {
      signAsync: jest
        .fn()
        .mockImplementation((_payload: unknown, options: { jwtid?: string }) =>
          Promise.resolve(options.jwtid),
        ),
    };
    const values: Record<string, string> = {
      JWT_ACCESS_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL: '7d',
    };
    const config = {
      get: jest.fn((key: string) => values[key]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    const tokens = await moduleRef.get(TokenService).issueTokens({
      sub: 'u1',
      username: 'scout',
      role: Role.CLUB,
      subRole: SubRole.SCOUT,
    });

    expect(tokens.accessToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(tokens.refreshToken).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(tokens.accessToken).not.toBe(tokens.refreshToken);
  });
});
