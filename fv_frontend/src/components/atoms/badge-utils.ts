/**
 * Badge utility — pozisyon kodundan badge varyantını döndüren yardımcı.
 *
 * react-refresh kuralı gereği Badge.tsx'ten ayrı dosyada.
 */

type BadgeVariant = 'gk' | 'df' | 'mf' | 'fw' | 'default' | 'gold';

const POSITION_VARIANT_MAP: Record<string, BadgeVariant> = {
  GK: 'gk',
  DF: 'df',
  MF: 'mf',
  FW: 'fw',
};

/** Pozisyon kodundan doğru badge varyantını döndürür. */
export function positionVariant(position: string): BadgeVariant {
  return POSITION_VARIANT_MAP[position] ?? 'default';
}
