import type { UserRole } from '../store/types';

/**
 * Bir rolun varsayilan panel adresini dondurur.
 *
 * Bilesen dosyalarindan ayri tutuluyor: react-refresh, bir modulun hem bilesen
 * hem yardimci fonksiyon disari acmasi durumunda hot reload'i devre disi birakiyor.
 */
export function getDefaultPath(_role?: UserRole): string {
  // Tüm kullanıcılar giriş yaptıktan sonra anasayfaya (vitrin) yönlendirilecek.
  return '/vitrin';
}
