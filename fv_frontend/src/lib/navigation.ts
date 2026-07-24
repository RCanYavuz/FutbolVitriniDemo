import type { UserRole } from '../store/types';

/**
 * Bir rolun varsayilan panel adresini dondurur.
 *
 * Bilesen dosyalarindan ayri tutuluyor: react-refresh, bir modulun hem bilesen
 * hem yardimci fonksiyon disari acmasi durumunda hot reload'i devre disi birakiyor.
 */
export function getDefaultPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'club':
      return '/club';
    case 'player':
      return '/player-profile';
    default:
      return '/login';
  }
}
