import type { Player } from '../store/types';
import { api } from './api';

export interface PaginatedPlayers {
  items: Player[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

const PAGE_LIMIT = 100;

function listPage(page: number): Promise<PaginatedPlayers> {
  return api.get<PaginatedPlayers>(`/players?page=${page}&limit=${PAGE_LIMIT}`);
}

/** Oyuncu listeleme ucuna ince sarmalayici. */
export const playersApi = {
  list(page = 1): Promise<PaginatedPlayers> {
    return listPage(page);
  },

  /** Client-side filtrelerin tum veri kumesinde calismasi icin sayfalari birlestirir. */
  async listAll(): Promise<Player[]> {
    const firstPage = await listPage(1);
    const items = [...firstPage.items];

    for (let page = 2; page <= firstPage.pageCount; page += 1) {
      const nextPage = await listPage(page);
      items.push(...nextPage.items);
    }

    return items;
  },
};
