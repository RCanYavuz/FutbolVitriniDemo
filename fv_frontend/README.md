# fv_frontend

Futbol Vitrini arayuzu — "Sahibinden.com"un gelismis filtreleme/pazar yeri mantigi ile
"Football Manager" tarzi detayli analitigi harmanlayan scouting platformu.

React 19 + TypeScript + Vite + Tailwind CSS 4 + Zustand.

## Kurulum

Node.js 22 onerilir (Vite 8 icin en az `20.19` veya `22.12` gerekir).

```bash
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

Kimlik dogrulama, kayit, oyuncu listesi ve admin onay akisi gercek backend API'sine
baglidir. Giris yalniz ag hatasinda sabit demo hesaplara duser; oyuncu ve admin
okumalari basarisiz olursa ornek veri gosterilir. Yeni kayit her zaman backend
gerektirir. `/api` istekleri dev sunucusunda
`VITE_DEV_API_PROXY` adresine (varsayilan `http://localhost:3000`) proxy'lenir; uretimde
ayni isi nginx yapar.

## Komutlar

| Komut | Aciklama |
| --- | --- |
| `npm run dev` | Gelistirme sunucusu |
| `npm run build` | Tip kontrolu + uretim derlemesi |
| `npm run preview` | Derlenmis ciktinin onizlemesi |
| `npm run lint` | ESLint (`lint:fix` ile otomatik duzeltme) |
| `npm run typecheck` | Sadece tip kontrolu |
| `npm test` | Vitest (`test:watch`, `test:coverage`) |

## Test hesaplari

| Rol | Kullanici | Sifre | Yonlendirilen sayfa |
| --- | --- | --- | --- |
| Admin | `admin` | `admin123` | `/admin` |
| Scout | `scout` | `scout123` | `/club` |
| Antrenor | `coach` | `coach123` | `/club` (antrenor gorunumu) |
| Futbolcu | `player` | `player123` | `/player-profile` |

Bilgiler giris ekranindaki yardim kartinda da listelenir. Docker yigininda
`RUN_SEED=true` oldugunda hesaplar PostgreSQL'e idempotent olarak eklenir; backend
erisilemezse ayni bilgiler offline fallback icin kullanilir.

## Rotalar

| Yol | Erisim | Icerik |
| --- | --- | --- |
| `/login`, `/register` | herkese acik | Rol secimli giris, kayit |
| `/` | oturum | Role gore panele yonlendirir |
| `/admin` | admin | Yonetim paneli |
| `/club` | club | Scout: filtre + AI eslesme + oyuncu izgarasi · Antrenor: takim paneli |
| `/coach` | club/coach | Antrenor panelinin eski, desteklenen adresi |
| `/scouting-hub`, `/scouting-hub/showcase` | club/scout | Eski adresler + oyuncu vitrini |
| `/player-profile` | player | Futbolcu paneli |
| `/analytics` | player | Profil analitigi (Recharts) |
| `/settings` | oturum | Profil ayarlari |
| `/messages`, `/premium` | oturum | Mesajlasma, abonelik planlari |

## Klasor yapisi

```
src/
├── pages/            Rota seviyesindeki ekranlar (admin/, player/ alt klasorleri dahil)
├── components/
│   ├── layout/       AppLayout, TopNavBar, DashboardSidebar, ProtectedRoute
│   ├── scouting/     Filtre kenar cubugu, oyuncu karti/izgarasi, karsilastirma
│   └── ui/           Paylasilan gorsel parcalar
├── store/            Zustand store'lari (authStore, scoutingStore) + fallback mockData
├── lib/              API istemcileri, dogrulama ve navigation yardimcilari
└── test/             Vitest kurulum dosyasi
```

`doc/` altinda mimari ve ozellik notlari, `designs/` altinda ekran tasarimlari bulunur.

## Formlar ve aksiyonlar

Calisan formlar (dogrulamalari ve hata mesajlariyla birlikte):

| Form | Dogrulama |
| --- | --- |
| Giris | Kullanici/parola kontrolu, hata mesaji, role gore yonlendirme |
| Kayit | Zorunlu alanlar, e-posta formati, parola >= 8 karakter + tekrar eslesmesi, opsiyonel http(s) avatar adresi, futbolcu icin mevki/ayak/yas (10-60) |
| Profil ayarlari | Ad-soyad vb. degisince kaydetme cubugu; guvenlik sekmesinde parola degistirme dogrulamasi |
| Antrenor performans girisi | Oyuncu ve uc puanlama zorunlu, ortalama hesaplanir, form sifirlanir |
| Mesaj gonderme | Bos mesaj engellenir |

Dogrulama kurallari [src/lib/validation.ts](src/lib/validation.ts) icinde toplandi.
Kayit formu sunucu dogrulama hatalarini da kullaniciya gosterir.

**Backend gerektiren 12 aksiyon** (rapor olusturma, foto yukleme, 2FA, mesaj eki, sohbet
arama vb.) `disabled` ve "Bu islem backend baglantisindan sonra aktiflesecek" ipucuyla
isaretlendi — bkz. [src/lib/pending.ts](src/lib/pending.ts). Ozellik gelistirildiginde
`disabled` ve `title` kaldirilip `onClick` baglanmali.

## Bilinmesi gerekenler

- **Kimlik dogrulama API'ye bagli.** `src/store/authStore.ts`, `/api/v1/auth/*` ve
  `/api/v1/users/me` uclarini kullanir; sayfa yenilenince HttpOnly cookie ile oturumu
  geri yukler. Yalniz ag hatasinda sabit offline hesaplara geri doner.
- **Roller birebir uyumlu.** Arayuzun `admin | club | player` rolleri ve
  `admin | scout | coach | player` alt rolleri backend tarafinda da bulunur.
- **Oyuncu ve admin verileri API'den gelir.** Oyuncu listesi yuklenemezse ornek oyuncular,
  admin paneli yuklenemezse ornek istatistik ve basvurular gosterilir.
- **Ikonlar ve fontlar CDN'den geliyor** (Material Symbols + Google Fonts). Internete
  kapali bir ortamda ikonlar yazi olarak gorunur; gerekirse fontlari `public/` altina
  alip kendiniz servis edin.
- **`GlobalDashboard.tsx` rota disinda.** Onceki bir iterasyondan kalma; silinmedi ama
  hicbir yerden erisilmiyor.
