import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { EnvironmentVariables } from '../config/env.validation';
import { AuthService, type AuthResult } from './auth.service';
import {
  clearAuthCookies,
  getCookie,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from './cookies';
import { AuthResponse, RegisterResponse } from './dto/auth.response';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Yeni kullanici kaydi',
    description:
      'Hesap PENDING durumda olusturulur; admin onaylayana kadar giris yapilamaz.',
  })
  @ApiCreatedResponse({ type: RegisterResponse })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
    await this.auth.register(dto);
    return {
      status: 'pending',
      message:
        'Kaydiniz alindi. Hesabiniz yonetici onayindan sonra aktiflesecek.',
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Oturum acma (kullanici adi + parola)' })
  @ApiOkResponse({ type: AuthResponse })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    return this.respondWithAuth(await this.auth.login(dto), res);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Access token yenileme',
    description:
      'Refresh token HttpOnly cookie olarak gonderilir ve her cagrida yenilenir.',
  })
  @ApiOkResponse({ type: AuthResponse })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.auth.refresh(
      getCookie(req, REFRESH_TOKEN_COOKIE),
    );
    return this.respondWithAuth(result, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Oturumu kapatir ve refresh token"i gecersiz kilar',
  })
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      await this.auth.logout(userId);
    } finally {
      // DB gecici olarak hata verse bile tarayicidaki HttpOnly oturumu kapat.
      clearAuthCookies(res, this.config);
    }
  }

  /** Auth sonucunu cookie'lere yazip response govdesini olusturur. */
  private respondWithAuth(result: AuthResult, res: Response): AuthResponse {
    setAuthCookies(res, result.tokens, this.config);
    return { user: result.user, accessToken: result.tokens.accessToken };
  }
}
