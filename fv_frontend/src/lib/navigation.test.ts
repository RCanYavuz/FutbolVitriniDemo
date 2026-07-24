import { describe, expect, it } from 'vitest';
import { getDefaultPath } from './navigation';

describe('getDefaultPath', () => {
  it('her rol icin kendi panelini dondurur', () => {
    expect(getDefaultPath('admin')).toBe('/admin');
    expect(getDefaultPath('club')).toBe('/club');
    expect(getDefaultPath('player')).toBe('/player-profile');
  });
});
