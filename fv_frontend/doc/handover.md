# Agent Handover Document

FutbolVitrini frontend'i uzerinde calisacak bir sonraki gelistirici/agent icin ozet.

## Mevcut durum

React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Zustand ile yazilmis, rol tabanli
bir arayuz. Kimlik dogrulama, kayit, oyuncu listesi ve admin onay akisi backend'e
baglidir. Giris yalniz ag hatasinda sabit demo hesaplara duser; oyuncu/admin
okumalari basarisiz olursa ornek veri gosterilir. Kayit her zaman backend gerektirir.
Uygulama derleniyor, lint temiz, Vitest testleri geciyor ve Docker imaji uretimde
nginx ile servis ediliyor.

Dogrulanmis komutlar:

```bash
npm run build      # tsc -b && vite build  → hatasiz
npm run lint       # eslint .              → hatasiz
npm test           # vitest run            → 85 test gecer
```

## Incelenmesi gereken dosyalar

- `README.md` — rota tablosu, test hesaplari, bilinen kisitlar
- `src/lib/api.ts`, `src/lib/*.api.ts` — ortak fetch istemcisi ve API sarmalayicilari
- `src/store/authStore.ts`, `src/store/scoutingStore.ts` — API baglantisi + mock fallback
- `src/App.tsx` — rota tanimlari · `src/components/layout/ProtectedRoute.tsx` — rol kontrolu
- `src/lib/navigation.ts` — role gore varsayilan panel adresi
- `doc/architecture.md`, `doc/features.md` — sistem dokumantasyonu

## Bu oturumda yapilanlar

- Yukleme sirasinda olusan " copy" ikizleri ve eski `dist/` temizlendi
- Vite 5 → 8 (esbuild dev-server acigi) yukseltildi, Vitest + Testing Library eklendi
- TypeScript `strict` acildi, `@/*` yol takma adi tanimlandi
- ESLint hatalari giderildi: `getDefaultPath` `src/lib/navigation.ts`'e tasindi
  (react-refresh kurali), `any` kullanimlari tiplendi, `RegisterPage`'deki
  setState-in-effect dongusu kaldirildi
- Kirik `/vite.svg` favicon'u `/favicon.svg` ile degistirildi
- `/settings` (ProfileSettings) ve `/analytics` (PlayerAnalytics) rotalari baglandi;
  ust menu ve kenar cubuguna baglantilari eklendi
- Kayit ekranina giris sayfasindan baglanti eklendi (daha once erisilemiyordu)
- `ClubWorkspace` artik `ScoutingHub`'i kullaniyor; mobilde filtreler yeniden erisilebilir
- `ProfileSettings` sabit "Elias Sorensen" yerine oturumdaki kullaniciyi gosteriyor,
  breadcrumb'i var olmayan `/dashboard` yerine kullanicinin panelini isaret ediyor
- "Profili Duzenle" ve "Complete Profile" butonlari `/settings`'e baglandi
- Bos duran 3 form islevsellestirildi: kayit formu (alan bazli dogrulama), antrenor
  performans girisi (zorunluluk kontrolu + ortalama), profil ayarlarindaki parola
  degistirme sekmesi. Kurallar `src/lib/validation.ts`'te toplandi.
- Backend gerektiren 12 buton `disabled` + ipucu haline getirildi (`src/lib/pending.ts`)
- Form alanlarina eksik olan `htmlFor`/`id` baglantilari eklendi (erisilebilirlik)
- Giris/cikis, cookie'den oturum yenileme ve kayit gercek `/api/v1/auth/*` uclarina baglandi
- Kayit formuna zorunlu kullanici adi ve scout/antrenor hesap turu secimi eklendi.
  Futbolcu mevki, tercih edilen ayak, dogum tarihi ve guncel kulup alanlari API'ye
  gonderilip veritabaninda saklanir; yeni hesap `PENDING` olur ve admin onayi bekler.
- Oyuncu listesi `/api/v1/players`'dan, admin paneli istatistik/onay verileri
  `/api/v1/admin/*` uclarindan yukleniyor; ag hatasinda mevcut mock veriler korunuyor
- Backend ve frontend rol modelleri `admin | club | player` ile
  `admin | scout | coach | player` olarak eslesti

## Acik isler

- `GlobalDashboard.tsx` rota disinda; ya baglanmali ya da silinmeli. Uygulamada kalan
  tek islevsiz buton grubu (4 adet) bu erisilemez sayfada.
- `disabled` isaretli 12 aksiyon backend endpoint'i geldiginde baglanacak:
  rapor olusturma, profil fotografi yukleme/silme, medya dosyasi secme, 2FA,
  mesaj eki, sohbet arama/menuleri, rol filtreleme, video yukleme, herkese acik profil onizleme.
- Profil ayarlarindaki parola degisikligi ve antrenor performans girisi halen sadece
  yerel form davranisina sahip; ilgili backend endpoint'leri eklenmeli.
- Ikon/font CDN bagimliligi (bkz. README).

## Seed ve offline giris bilgileri

- **Admin**: `admin` / `admin123`
- **Scout**: `scout` / `scout123`
- **Antrenor**: `coach` / `coach123`
- **Futbolcu**: `player` / `player123`

Bu hesaplar backend seed'inde gercek kullanicilardir. Docker compose
`RUN_SEED=true` ile migration'dan sonra idempotent seed calistirir. Backend'e ag
baglantisi kurulamazsa ayni bilgiler frontend'in offline fallback'inde de calisir.
