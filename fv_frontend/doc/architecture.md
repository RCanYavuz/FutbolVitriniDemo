# FutbolVitrini - Architecture Documentation

## Tech Stack
- **Framework**: React 19 (Vite 8)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 (`@theme` ile tanimli tasarim belirtecleri, `src/index.css`)
- **State Management**: Zustand
- **Routing**: React Router v7
- **Icons**: lucide-react + Material Symbols (CDN)
- **Charts**: Recharts
- **Test**: Vitest + Testing Library (jsdom)

## Directory Structure
- `src/pages/`: Rota seviyesindeki ekranlar; `admin/` ve `player/` alt klasorleri rol ozel sayfalar icin.
- `src/components/layout/`: `AppLayout` (TopNavBar + Outlet), `TopNavBar`, `DashboardSidebar`, `ProtectedRoute`.
- `src/components/scouting/`: Filtre kenar cubugu, oyuncu karti/izgarasi, AI eslesmeleri, karsilastirma cekmecesi.
- `src/store/`: `authStore`, `scoutingStore` ve `mockData`.
- `src/lib/`: Bilesenden bagimsiz yardimcilar. `navigation.ts` role gore varsayilan panel adresini verir —
  bilesen dosyalarindan ayri tutulur, cunku react-refresh bir modulun hem bilesen hem yardimci
  disari acmasi durumunda hot reload'i devre disi birakir.
- `src/test/`: Vitest kurulumu.

## State Management
Zustand kullanilir. `authStore` API tabanli kimlik dogrulama ve rol bilgisini,
`scoutingStore` API'den gelen oyuncularla arama/filtre durumunu ve karsilastirma
secimlerini tutar. Giris yalniz ag hatasinda demo hesaplara, oyuncu okumasi
basarisizsa ornek oyunculara geri doner. Store'lar React disindan da
(`useAuthStore.getState()`) erisilebildigi icin testlerde dogrudan surulebilir.

## Routing
`ProtectedRoute` iki seviyeli yetki kontrolu yapar:

- `allowedRoles` — genis rol (`admin | club | player`)
- `allowedSubRoles` — ince rol (`admin | scout | coach | player`)

Oturum yoksa `/login`'e, yetki yoksa `getDefaultPath(role)` ile kullanicinin kendi
paneline yonlendirir. Rota tablosunun tamami README'dedir.

## API katmani
`src/lib/api.ts`, cookie tasiyan ortak fetch istemcisidir. 401 yanitinda refresh token
rotation'ini tek bir paylasilan istekle dener ve asil istegi bir kez yineler.
`auth.api.ts`, `players.api.ts` ve `admin.api.ts` endpoint sarmalayicilarini icerir.

- Dev'de Vite `/api` isteklerini `VITE_DEV_API_PROXY` adresine proxy'ler.
- Uretimde ayni islemi frontend imajindaki nginx yapar (`nginx.conf.template`).
- Boylece tarayici ile API ayni origin'de olur ve backend'in HttpOnly cookie'leri
  ek CORS ayari olmadan calisir.
- Yeni kayit API zorunludur; giris ve salt-okunur vitrin/admin ekranlarinda sinirli
  offline fallback vardir.
