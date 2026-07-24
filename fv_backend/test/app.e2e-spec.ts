import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('Response body bir nesne olmali');
  }
  return value as Record<string, unknown>;
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    throw new TypeError('Response body bir dizi olmali');
  }
  return value.map(asRecord);
}

/**
 * Bu testler calisan bir PostgreSQL ve uygulanmis seed ister:
 *   docker compose -f docker-compose.dev.yml up -d
 *   npm run prisma:deploy && npm run db:seed && npm run test:e2e
 */
describe('Futbol Vitrini API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/v1/health -> 200', () => {
    return request(app.getHttpServer()).get('/api/v1/health').expect(200);
  });

  it('GET /api/v1/players herkese acik ve nested stats doner', () => {
    return request(app.getHttpServer())
      .get('/api/v1/players')
      .expect(200)
      .expect((res) => {
        const items = asRecord(res.body).items;
        expect(Array.isArray(items)).toBe(true);
        if (Array.isArray(items) && items.length > 0) {
          expect(items[0]).toHaveProperty('stats.pace');
          expect(items[0]).toHaveProperty('metrics.sprintSpeed');
        }
      });
  });

  it('GET /api/v1/users/me token olmadan 401', () => {
    return request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
  });

  it('gecersiz govde ile kayit 400', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        username: 'x',
        email: 'gecersiz',
        displayName: 'A',
        password: '123',
        role: 'player',
      })
      .expect(400);
  });

  it('seed kullanicisi scout/scout123 ile giris -> cookie ile /users/me -> logout', async () => {
    const agent = request.agent(app.getHttpServer());

    const login = await agent
      .post('/api/v1/auth/login')
      .send({ username: 'scout', password: 'scout123' })
      .expect(200);

    expect(asRecord(login.body).user).toMatchObject({
      role: 'club',
      subRole: 'scout',
      name: 'Ahmet Yılmaz',
    });

    const me = await agent.get('/api/v1/users/me').expect(200);
    expect(me.body).toMatchObject({ role: 'club', subRole: 'scout' });

    await agent.post('/api/v1/auth/logout').expect(204);
    await agent.get('/api/v1/users/me').expect(401);
  });

  it('oyuncu profilini kaydeder; onaydan once giremez, onaydan sonra profilini gorur', async () => {
    const username = `e2e${Date.now()}`;
    const email = `${username}@fv.local`;
    const agent = request.agent(app.getHttpServer());

    const reg = await agent
      .post('/api/v1/auth/register')
      .send({
        username,
        email,
        displayName: 'E2E Aday',
        password: 'GucluParola1',
        role: 'player',
        position: 'FW',
        preferredFoot: 'left',
        birthDate: '2005-02-25',
        currentClub: 'Fenerbahce U19',
        avatarUrl: 'https://example.com/e2e.png',
      })
      .expect(201);

    expect(asRecord(reg.body).status).toBe('pending');

    // Onaylanmadigi icin giris 403
    await agent
      .post('/api/v1/auth/login')
      .send({ username, password: 'GucluParola1' })
      .expect(403);

    const admin = request.agent(app.getHttpServer());
    await admin
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);
    const pending = await admin.get('/api/v1/admin/pending-users').expect(200);
    const player = asRecordArray(pending.body).find(
      (candidate) => candidate.email === email,
    );
    expect(typeof player?.id).toBe('string');
    await admin
      .post(`/api/v1/admin/users/${String(player?.id)}/approve`)
      .expect(204);

    const login = await agent
      .post('/api/v1/auth/login')
      .send({ username, password: 'GucluParola1' })
      .expect(200);
    expect(asRecord(login.body).user).toMatchObject({
      position: 'FW',
      preferredFoot: 'left',
      birthDate: '2005-02-25',
      currentClub: 'Fenerbahce U19',
    });
  });

  it('admin onay tablosunu gorebilir, scout goremez (403)', async () => {
    const scout = request.agent(app.getHttpServer());
    await scout
      .post('/api/v1/auth/login')
      .send({ username: 'scout', password: 'scout123' });
    await scout.get('/api/v1/admin/pending-users').expect(403);

    const admin = request.agent(app.getHttpServer());
    await admin
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    await admin.get('/api/v1/admin/pending-users').expect(200);
  });

  it('antrenor kaydi onaylandiktan sonra coach alt roluyle giris yapar', async () => {
    const suffix = Date.now();
    const username = `coach${suffix}`;
    const email = `${username}@fv.local`;

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        username,
        email,
        displayName: 'E2E Antrenor',
        password: 'GucluParola1',
        role: 'club',
        subRole: 'coach',
        organization: 'Bursaspor',
        expertise: 'Teknik Direktor',
      })
      .expect(201);

    const admin = request.agent(app.getHttpServer());
    await admin
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);

    const pending = await admin.get('/api/v1/admin/pending-users').expect(200);
    const coach = asRecordArray(pending.body).find(
      (candidate) => candidate.email === email,
    );
    expect(coach).toBeDefined();
    expect(coach?.role).toBe('Antrenör');
    expect(typeof coach?.id).toBe('string');

    await admin
      .post(`/api/v1/admin/users/${String(coach?.id)}/approve`)
      .expect(204);

    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ username, password: 'GucluParola1' })
      .expect(200);

    expect(asRecord(login.body).user).toMatchObject({
      role: 'club',
      subRole: 'coach',
      organization: 'Bursaspor',
      expertise: 'Teknik Direktor',
    });
  });
});
