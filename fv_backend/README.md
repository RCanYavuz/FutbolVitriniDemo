# fv_backend

Futbol Vitrini REST API — NestJS 11 + Prisma 7 + PostgreSQL.

## Kurulum

Node.js 22 onerilir.

```bash
cp .env.example .env      # DATABASE_URL ve JWT sirlarini ayarla
npm install
npm run prisma:deploy     # migration'lari uygula
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/docs`

## Komutlar

| Komut | Aciklama |
| --- | --- |
| `npm run start:dev` | Watch modunda calistirir |
| `npm run build` | `prisma generate` + `nest build` |
| `npm test` | Jest unit testleri |
| `npm run test:e2e` | Uctan uca testler (calisan bir PostgreSQL ister) |
| `npm run prisma:migrate` | Yeni migration olusturur (gelistirme) |
| `npm run prisma:deploy` | Bekleyen migration'lari uygular (uretim) |
| `npm run prisma:studio` | Prisma Studio |
| `npm run db:seed` | Ornek veri yukler |

## Klasor yapisi

```
src/
├── auth/          Kayit, giris, refresh rotation, JWT stratejisi, cookie yardimcilari
├── users/         Kullanici profili
├── players/       Oyuncu profilleri (CRUD, filtreleme, sayfalama, sahiplik kontrolu)
├── health/        Terminus tabanli /health (Docker healthcheck)
├── prisma/        Global PrismaService (@prisma/adapter-pg)
├── common/        @Public(), @CurrentUser() gibi paylasilan parcalar
├── config/        Ortam degiskeni dogrulamasi (class-validator)
└── generated/     Prisma tarafindan uretilir - git'e girmez
```

## Prisma 7 notlari

- Generator `prisma-client` (yeni nesil) ve `moduleFormat = "cjs"`; NestJS CommonJS'e
  derledigi icin bu sart. `PrismaClient` bir driver adapter ister
  (`@prisma/adapter-pg`), ayri bir query engine binary'si yoktur.
- Uretilen istemci `./x.js` seklinde uzantili import yazar. Bu yuzden:
  - Jest'te `moduleNameMapper` ile `.js` uzantisi soyuluyor,
  - seed betigi `ts-node` yerine `tsx` ile calisiyor.
- Veritabani baglantisi `prisma.config.ts` uzerinden `DATABASE_URL`'den okunur.

## Kimlik dogrulama

Iki mod ayni anda desteklenir:

- **HttpOnly cookie** (`fv_access_token`, `fv_refresh_token`) — tarayici istemcileri icin,
  XSS'e karsi token'i JavaScript'ten erisilemez tutar.
- **`Authorization: Bearer <token>`** — Swagger "Try it out" ve mobil istemciler icin;
  `accessToken` login ve refresh yanitinda da doner.

Kayit yaniti HTTP 201 ile `{ status: "pending", message }` doner ve token uretmez;
kullanici ancak yonetici onayindan sonra giris yapabilir.

Refresh token'in SHA-256 ozeti `users.refreshTokenHash` alaninda tutulur; her yenilemede
rotasyona ugrar, `logout` ile temizlenir.

Yeni endpoint'ler varsayilan olarak korumalidir (global `JwtAuthGuard`); herkese acik
olmasi gerekenleri `@Public()` ile isaretleyin.
