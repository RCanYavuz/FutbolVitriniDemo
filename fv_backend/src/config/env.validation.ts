import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  // Ortam degiskenleri her zaman string gelir; sayiya cevrilmesi gerekiyor.
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  PORT = 3000;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @MinLength(32, {
    message: 'JWT_ACCESS_SECRET en az 32 karakter olmalidir',
  })
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @MinLength(32, {
    message: 'JWT_REFRESH_SECRET en az 32 karakter olmalidir',
  })
  JWT_REFRESH_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_ACCESS_TTL = '15m';

  @IsString()
  @IsOptional()
  JWT_REFRESH_TTL = '7d';

  /// Virgulle ayrilmis origin listesi, orn: "http://localhost:5173,https://futbolvitrini.com"
  @IsString()
  @IsOptional()
  CORS_ORIGINS = 'http://localhost:5173';

  /// Cookie'lerin gecerli oldugu domain. Bos birakilirsa istek host'u kullanilir.
  @IsString()
  @IsOptional()
  COOKIE_DOMAIN?: string;

  /// Cookie Secure bayragini acikca kontrol eder. Verilmezse NODE_ENV=production kullanilir.
  @IsIn(['true', 'false'])
  @IsOptional()
  COOKIE_SECURE?: 'true' | 'false';

  @IsString()
  @IsOptional()
  SWAGGER_PATH = 'docs';
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n  - ');
    throw new Error(`Gecersiz ortam degiskenleri:\n  - ${details}`);
  }

  return validated;
}
