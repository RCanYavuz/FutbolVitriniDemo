import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { AccountStatus, Role, SubRole } from '../generated/prisma/enums';
import type { User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toUserResponse } from '../users/user.mapper';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  hashRefreshToken,
  refreshTokenMatches,
  TokenService,
  type JwtPayload,
  type TokenPair,
} from './token.service';

const BCRYPT_ROUNDS = 12;
// Kullanici bulunamadiginda da compare cagirip zamanlama sizintisini azaltmak icin.
const DUMMY_HASH =
  '$2b$12$iSdPmyI3TUovqw9V/APnF.JKl7H5O7exr6PGmrvmcTQ2/Szm1o8Lm';
const MIN_PLAYER_AGE = 10;
const MAX_PLAYER_AGE = 60;

export interface AuthResult {
  user: ReturnType<typeof toUserResponse>;
  tokens: TokenPair;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  /** Yeni kayit olusturur. Hesap PENDING durumdadir; admin onaylayana kadar giris yapamaz. */
  async register(dto: RegisterDto): Promise<void> {
    const username = dto.username.toLowerCase();
    const email = dto.email.toLowerCase();

    const clash = await this.prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
      select: { username: true, email: true },
    });

    if (clash?.username === username) {
      throw new ConflictException('Bu kullanici adi zaten alinmis');
    }
    if (clash?.email === email) {
      throw new ConflictException('Bu e-posta adresi zaten kayitli');
    }

    const isClub = dto.role === 'club';
    const clubSubRole = dto.subRole === 'coach' ? SubRole.COACH : SubRole.SCOUT;
    const birthDate =
      !isClub && dto.birthDate ? parsePlayerBirthDate(dto.birthDate) : null;

    try {
      await this.prisma.user.create({
        data: {
          username,
          email,
          displayName: dto.displayName,
          passwordHash: await hash(dto.password, BCRYPT_ROUNDS),
          role: isClub ? Role.CLUB : Role.PLAYER,
          subRole: isClub ? clubSubRole : SubRole.PLAYER,
          avatarUrl: dto.avatarUrl?.trim() || buildAvatarUrl(dto.displayName),
          organization: isClub ? dto.organization?.trim() || null : null,
          expertise: isClub ? dto.expertise?.trim() || null : null,
          position: isClub ? null : (dto.position ?? null),
          preferredFoot: isClub ? null : (dto.preferredFoot ?? null),
          birthDate,
          currentClub: isClub ? null : dto.currentClub?.trim() || null,
          status: AccountStatus.PENDING,
        },
      });
    } catch (error) {
      // Eszamanli kayitlarda iki on kontrol de gecebilir; DB unique kisiti son sozu soyler.
      if (hasPrismaErrorCode(error, 'P2002')) {
        throw new ConflictException(
          'Bu kullanici adi veya e-posta adresi zaten kayitli',
        );
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username.toLowerCase() },
    });

    const passwordMatches = await compare(
      dto.password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Kullanici adi veya parola hatali');
    }

    this.assertActive(user);

    return this.buildAuthResult(user);
  }

  /** Refresh token'i dogrular, kullanir ve yerine yenisini uretir (rotation). */
  async refresh(refreshToken: string | undefined): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token bulunamadi');
    }

    const payload = await this.tokens.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (
      !user?.refreshTokenHash ||
      !refreshTokenMatches(refreshToken, user.refreshTokenHash)
    ) {
      throw new UnauthorizedException('Refresh token gecersiz');
    }

    this.assertActive(user);
    const currentRefreshHash = user.refreshTokenHash;

    return this.buildAuthResult(user, currentRefreshHash);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  private assertActive(user: User): void {
    if (user.status === AccountStatus.PENDING) {
      throw new ForbiddenException('Hesabiniz yonetici onayi bekliyor');
    }
    if (user.status === AccountStatus.REJECTED) {
      throw new ForbiddenException('Hesap basvurunuz reddedildi');
    }
  }

  /** Token cifti uretir, refresh ozetini kaydeder ve frontend'e uygun sonucu doner. */
  private async buildAuthResult(
    user: User,
    expectedRefreshHash?: string,
  ): Promise<AuthResult> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      subRole: user.subRole,
    };

    const tokens = await this.tokens.issueTokens(payload);

    const nextRefreshHash = hashRefreshToken(tokens.refreshToken);

    if (expectedRefreshHash !== undefined) {
      const rotated = await this.prisma.user.updateMany({
        where: { id: user.id, refreshTokenHash: expectedRefreshHash },
        data: { refreshTokenHash: nextRefreshHash },
      });
      if (rotated.count !== 1) {
        throw new UnauthorizedException(
          'Refresh token daha once kullanilmis veya gecersiz',
        );
      }
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: nextRefreshHash },
      });
    }

    return { user: toUserResponse(user), tokens };
  }
}

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === code
  );
}

function parsePlayerBirthDate(value: string): Date {
  const birthDate = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(birthDate.getTime())) {
    throw new BadRequestException('Gecerli bir dogum tarihi giriniz');
  }

  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDifference = today.getUTCMonth() - birthDate.getUTCMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }

  if (age < MIN_PLAYER_AGE || age > MAX_PLAYER_AGE) {
    throw new BadRequestException(
      `Yas ${MIN_PLAYER_AGE} ile ${MAX_PLAYER_AGE} arasinda olmalidir`,
    );
  }

  return birthDate;
}

/** displayName'den ui-avatars.com uzerinden bir avatar adresi uretir. */
function buildAvatarUrl(displayName: string): string {
  const name = encodeURIComponent(displayName);
  return `https://ui-avatars.com/api/?name=${name}&background=1f2b36&color=d7e4f2&bold=true`;
}
