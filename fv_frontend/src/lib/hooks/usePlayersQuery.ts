/**
 * TanStack Query wrapper — oyuncu verisi çekme ve cache yönetimi.
 *
 * Mevcut `lib/players.api.ts` istemcisini kullanır; backend kapalıysa
 * mockPlayers'a düşer (scoutingStore'daki mevcut pattern korunur).
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { playersApi } from '../players.api';
import { mockPlayers } from '../../store/mockData';
import type { Player } from '../../store/types';
import type { PlayerFilter } from '../validations/player';

/* ═══════════════════════════════════════════════════════════════════
   QUERY KEYS
   ═══════════════════════════════════════════════════════════════════ */

export const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (filters: Partial<PlayerFilter>) => [...playerKeys.lists(), filters] as const,
};

/* ═══════════════════════════════════════════════════════════════════
   MOCK MARKET VALUE (aiScore'dan türetilmiş)
   ═══════════════════════════════════════════════════════════════════ */

export function computeMarketValue(aiScore: number): number {
  const base = aiScore * 1.2;
  if (base >= 10) return +(base * 1.5).toFixed(1);
  if (base >= 8) return +(base * 0.8).toFixed(1);
  return +(base * 0.3).toFixed(1);
}

export function formatMarketValue(valueMillion: number): string {
  if (valueMillion >= 1) return `€${valueMillion.toFixed(1)}M`;
  return `€${(valueMillion * 1000).toFixed(0)}K`;
}

/* ═══════════════════════════════════════════════════════════════════
   CLIENT-SIDE FILTER & SORT
   ═══════════════════════════════════════════════════════════════════ */

function applyFilters(players: Player[], filters: PlayerFilter): Player[] {
  return players.filter((p) => {
    // Metin araması
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const matches =
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Mevki filtresi
    if (filters.positions.length > 0 && !filters.positions.includes(p.position)) {
      return false;
    }

    // Yaş aralığı
    if (p.age < filters.ageMin || p.age > filters.ageMax) {
      return false;
    }

    // Piyasa değeri aralığı
    const playerValue = computeMarketValue(p.aiScore);
    if (playerValue < filters.valueMin || playerValue > filters.valueMax) {
      return false;
    }

    return true;
  });
}

function applySorting(players: Player[], sort: PlayerFilter['sort']): Player[] {
  const sorted = [...players];
  switch (sort) {
    case 'rating':
      return sorted.sort((a, b) => b.aiScore - a.aiScore);
    case 'age':
      return sorted.sort((a, b) => a.age - b.age);
    case 'value':
      return sorted.sort((a, b) => computeMarketValue(b.aiScore) - computeMarketValue(a.aiScore));
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    default:
      return sorted;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN HOOK
   ═══════════════════════════════════════════════════════════════════ */

interface UsePlayersQueryResult {
  /** Filtrelenmiş ve sıralanmış oyuncu listesi */
  players: Player[];
  /** Tüm oyuncular (filtresiz — vitrin için) */
  allPlayers: Player[];
  /** Toplam oyuncu sayısı */
  total: number;
  /** Yükleniyor mu */
  isLoading: boolean;
  /** Hata mesajı */
  error: string | null;
  /** Backend'e ulaşılamadı, mock veri gösteriliyor */
  isFallback: boolean;
}

export function usePlayersQuery(
  filters: PlayerFilter,
  options?: Partial<UseQueryOptions<Player[], Error>>,
): UsePlayersQueryResult {
  const query = useQuery<Player[], Error>({
    queryKey: playerKeys.all,
    queryFn: async () => {
      try {
        const players = await playersApi.listAll();
        return players;
      } catch {
        // Backend kapalı — mock verilere düş
        return mockPlayers;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
    placeholderData: mockPlayers,
    ...options,
  });

  const allPlayers = query.data ?? mockPlayers;
  const isFallback = allPlayers === mockPlayers && !query.isLoading;

  // Client-side filtreleme ve sıralama
  const filtered = applyFilters(allPlayers, filters);
  const sorted = applySorting(filtered, filters.sort);

  return {
    players: sorted,
    allPlayers,
    total: sorted.length,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    isFallback,
  };
}
