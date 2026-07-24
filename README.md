# Futbol Vitrini

Oyuncu vitrini platformu. React (Vite) tabanli bir arayuz, NestJS + Prisma + PostgreSQL
tabanli bir REST API ve Portainer ile repodan deploy edilebilen Docker yapilandirmasi.

```
futbolvitrini/
├── fv_frontend/          React + TypeScript + Vite (nginx ile servis edilir)
├── fv_backend/           NestJS + TypeScript + Prisma + PostgreSQL
├── docker-compose.yml    Uretim yigini (db + backend + frontend)
├── docker-compose.dev.yml Gelistirme icin sadece veritabani + Adminer
└── .env.example          Compose degiskenleri
```

## Teknoloji secimleri

| Katman | Secim | Not |
| --- | --- | --- |
| Frontend | React 19 + TypeScript + Vite 8 | Tailwind CSS 4 + Zustand + React Router · uretimde nginx ile statik servis |
| Backend | NestJS 11 + Express adapter | Fastify'a gecis gerekirse tek dosyalik degisiklik |
| Veritabani | PostgreSQL 17 | |
| ORM | Prisma 7 (`prisma-client` generator + `@prisma/adapter-pg`) | Rust query engine yok, WASM query compiler |
| API | REST + Swagger/OpenAPI | `/docs` |
| Auth | JWT, HttpOnly cookie **ve** Bearer | Cookie tarayici icin, Bearer Swagger/mobil icin |
| Validation | Global `ValidationPipe` (whitelist + forbidNonWhitelisted) | |
| Test | Backend: Jest · Frontend: Vitest | |
| Deploy | Docker multi-stage + compose | Portainer "Repository" stack'i ile uyumlu |

### Onerilen eklemeler (istege bagli)

- Reverse proxy olarak **Traefik veya Caddy** — Let's Encrypt sertifikasini otomatik yonetir.
  Compose'daki `frontend` servisini bu proxy'nin arkasina alman yeterli.
- **Sentry / OpenTelemetry** — uretimde hata ve istek izleme.
- **GitHub Actions** — `npm ci && npm test && docker build` ile CI, ardindan registry'ye push
  (Portainer'i registry'den image cekecek sekilde kurmak repodan build etmekten hizlidir).
- **S3 uyumlu depolama** (MinIO) — oyuncu foto/video yuklemeleri gundeme geldiginde.

## Hizli baslangic (yerel gelistirme)

Node.js 22 onerilir (Vite 8 icin en az `20.19` veya `22.12` gerekir).

```bash
# 1) Veritabani
cp .env.example .env
docker compose -f docker-compose.dev.yml up -d      # postgres :5432, adminer :8081
# 5432 doluysa: POSTGRES_PORT=5433 docker compose -f docker-compose.dev.yml up -d

# 2) Backend
cd fv_backend
cp .env.example .env            # DATABASE_URL'i kullandigin porta gore duzelt
npm install
npm run prisma:deploy           # migration'lari uygula
npm run db:seed                 # 4 demo hesabi + 2 bekleyen basvuru + 12 oyuncu
npm run start:dev               # http://localhost:3000/api/v1  ·  /docs

# 3) Frontend
cd ../fv_frontend
cp .env.example .env
npm install
npm run dev                     # http://localhost:5173  (/api istekleri backend'e proxy'lenir)
```

> Arayuz kimlik dogrulama, oyuncu listesi, kayit ve admin islemlerinde gercek API'yi
> kullanir. Yalnizca giris ag hatasinda sabit demo hesaplara duser; oyuncu ve admin
> okumalari basarisiz olursa ornek veri gosterilir. Yeni kayit her zaman backend
> gerektirir. Hesaplar ve rota tablosu icin
> [fv_frontend/README.md](fv_frontend/README.md).

## Tum yigini Docker ile calistirma

```bash
cp .env.example .env            # POSTGRES_PASSWORD ve JWT sirlarini doldur
docker compose up -d --build
# http://localhost:8080        arayuz
# http://localhost:8080/docs   Swagger
# docker compose ps            db, backend ve frontend health durumlari
```

Frontend'deki nginx `/api` ve `/docs` isteklerini backend'e proxy'ler; backend disariya
hic port acmaz. Tarayici ile API ayni origin'de oldugu icin HttpOnly cookie'ler ek CORS
ayari gerektirmez. Backend baslamadan once migration ve, `RUN_SEED=true` ise, idempotent
seed otomatik calisir. Temiz bir veritabaninda su gercek hesaplarla giris yapilabilir:

| Rol | Kullanici | Parola |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Scout | `scout` | `scout123` |
| Antrenor | `coach` | `coach123` |
| Futbolcu | `player` | `player123` |

`RUN_SEED` demo hesaplari ve verilerini olusturur. Internet'e acik gercek uretimde ilk
kurulumdan sonra `RUN_SEED=false` yapin ve demo hesaplarinin parolalarini degistirin veya
hesaplari kaldirin.

Onceki backend semasini iceren mevcut bir volume kullaniliyorsa migration eski
`users`/`players` tablolarini `users_legacy`/`players_legacy` adlariyla korur ve
uyumlu kayitlari yeni semaya aktarir. Migration'dan once ayrica veritabani yedegi
almak yine de onerilir.

## Portainer ile deploy

1. **Stacks → Add stack → Repository**
2. Repository URL: bu deponun adresi · Compose path: `docker-compose.yml`
3. **Environment variables** bolumune en az sunlari gir:

   | Degisken | Ornek |
   | --- | --- |
   | `POSTGRES_PASSWORD` | `openssl rand -hex 24` ciktisi |
   | `JWT_ACCESS_SECRET` | `openssl rand -hex 32` ciktisi |
   | `JWT_REFRESH_SECRET` | `openssl rand -hex 32` ciktisi |
   | `CORS_ORIGINS` | `https://futbolvitrini.com` |
   | `COOKIE_SECURE` | HTTPS kullanan deploy icin `true` |
   | `FRONTEND_PORT` | `8080` |
   | `RUN_SEED` | Ilk kurulum icin `true`, ardindan `false` |

4. `Deploy the stack`. Backend acilirken `prisma migrate deploy` otomatik calisir
   (`RUN_MIGRATIONS=false` ile kapatilabilir); `RUN_SEED=true` ise idempotent seed
   migration'dan sonra uygulanir.
5. Guncelleme: Portainer'da stack → **Pull and redeploy**.

> Gercek uretimde HTTPS kullanin ve `COOKIE_SECURE=true` ayarlayin. Yerel compose ornegi
> `http://localhost:8080` uzerinden girisin calismasi icin bunu `false` tutar; bu ayari
> internet'e acik HTTP yayin icin bir guvenlik cozumu olarak kullanmayin.

## API ozeti

Taban yol: `/api/v1` · Swagger: `/docs`

| Metod | Yol | Erisim |
| --- | --- | --- |
| POST | `/auth/register` | herkese acik |
| POST | `/auth/login` | herkese acik |
| POST | `/auth/refresh` | refresh cookie |
| POST | `/auth/logout` | oturum |
| GET | `/users/me` | oturum |
| GET | `/players` | herkese acik (filtreli, sayfali) |
| GET | `/players/me` | oturum (kendi profilleri) |
| GET | `/players/:id` | herkese acik |
| POST | `/players` | oturum |
| PATCH | `/players/:id` | sahibi veya admin |
| DELETE | `/players/:id` | sahibi veya admin |
| GET | `/admin/stats` | admin |
| GET | `/admin/pending-users` | admin |
| POST | `/admin/users/:id/approve` | admin |
| POST | `/admin/users/:id/reject` | admin |
| GET | `/health` | herkese acik (Docker healthcheck) |

## Testler

```bash
cd fv_backend  && npm test          # unit (Jest) - 31 test
cd fv_backend  && npm run test:e2e  # calisan, migration+seed uygulanmis PostgreSQL - 8 test
cd fv_frontend && npm test          # Vitest - 85 test
```

## Frontend-backend entegrasyonu

Backend `ADMIN | CLUB | PLAYER` rolleri ve `ADMIN | SCOUT | COACH | PLAYER` alt rolleriyle
arayuzun modelini karsilar. Giris/cikis ve cookie'den oturum yenileme, kayit, oyuncu
listesi ile admin istatistik/onay akisi API'ye baglidir. Mesajlasma, performans girisi,
profil ayarlari ve medya islemleri icin yeni backend endpoint'leri halen gerekir.

## Guvenlik notlari

- Access token 15 dk, refresh token 7 gun; her `refresh` cagrisinda refresh token yenilenir
  (rotation) ve eskisinin SHA-256 ozeti veritabaninda gecersiz kilinir.
- `logout` refresh ozetini siler, boylece calinmis token kullanilamaz.
- Parolalar bcrypt (12 tur) ile saklanir.
- `helmet`, global `ThrottlerGuard` (dakikada 120 istek; login/register icin daha dusuk)
  ve `whitelist: true` olan `ValidationPipe` varsayilan olarak aciktir.
- Endpoint'ler varsayilan olarak korumalidir; herkese acik olanlar `@Public()` ile isaretlenir.
