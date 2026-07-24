import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Player } from '../store/types';
import { mockPlayers } from '../store/mockData';
import { api } from './api';
import { playersApi, type PaginatedPlayers } from './players.api';

function page(
  items: Player[],
  pageNumber: number,
  pageCount: number,
): PaginatedPlayers {
  return {
    items,
    total: 2,
    page: pageNumber,
    limit: 100,
    pageCount,
  };
}

describe('playersApi', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('birden cok API sayfasini client filtreleri icin birlestirir', async () => {
    const first = { ...mockPlayers[0], id: 'page-1' };
    const second = { ...mockPlayers[1], id: 'page-2' };
    const getSpy = vi
      .spyOn(api, 'get')
      .mockResolvedValueOnce(page([first], 1, 2))
      .mockResolvedValueOnce(page([second], 2, 2));

    await expect(playersApi.listAll()).resolves.toEqual([first, second]);
    expect(getSpy).toHaveBeenNthCalledWith(1, '/players?page=1&limit=100');
    expect(getSpy).toHaveBeenNthCalledWith(2, '/players?page=2&limit=100');
  });
});
