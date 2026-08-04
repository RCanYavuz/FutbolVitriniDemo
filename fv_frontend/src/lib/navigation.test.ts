import { describe, expect, it } from 'vitest';
import { getDefaultPath } from './navigation';

describe('getDefaultPath', () => {
  it('her rol icin anasayfayi (vitrin) dondurur', () => {
    expect(getDefaultPath('admin')).toBe('/vitrin');
    expect(getDefaultPath('club')).toBe('/vitrin');
    expect(getDefaultPath('player')).toBe('/vitrin');
    expect(getDefaultPath('unknown' as any)).toBe('/vitrin');
  });
});
