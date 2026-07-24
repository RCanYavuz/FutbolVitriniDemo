import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ACCESS_TOKEN_COOKIE, resolveCookieSecure } from './auth/cookies';
import type { EnvironmentVariables } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<EnvironmentVariables, true>);
  const cookieSecure = resolveCookieSecure(
    config.get('NODE_ENV', { infer: true }),
    config.get('COOKIE_SECURE', { infer: true }),
  );

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.use(cookieParser());
  app.use(helmet());

  // Reverse proxy (nginx/Traefik) arkasindayken secure cookie ve gercek istemci IP'si icin.
  app.set('trust proxy', 1);

  app.enableCors({
    origin: config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const swaggerPath = config.get('SWAGGER_PATH', { infer: true });
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Futbol Vitrini API')
    .setDescription('Oyuncu vitrini platformunun REST API dokumantasyonu')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addCookieAuth(ACCESS_TOKEN_COOKIE)
    .build();

  SwaggerModule.setup(
    swaggerPath,
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
    {
      swaggerOptions: { persistAuthorization: true },
    },
  );

  const port = config.get('PORT', { infer: true });
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`API hazir: http://localhost:${port}/api/v1`);
  logger.log(`Swagger: http://localhost:${port}/${swaggerPath}`);
  if (!cookieSecure) {
    logger.warn(
      'Guvenlik uyarisi: cookie"ler Secure bayragi olmadan gonderiliyor.',
    );
  }
}

void bootstrap();
