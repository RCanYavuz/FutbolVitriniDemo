import { beforeEach, describe, expect, it, vi } from 'vitest';
import { playersApi } from '../lib/players.api';
import { mockPlayers } from './mockData';
import { useScoutingStore } from './scoutingStore';
import type { Player } from './types';

const initialState = useScoutingStore.getState();

const backendPlayer: Player = {
  ...mockPlayers[0],
  id: 'backend-player',
  name: 'Backend Oyuncusu',
};

describe('scoutingStore oyuncu yukleme', () => {
  beforeEach(() => {
    useScoutingStore.setState(initialState, true);
    vi.restoreAllMocks();
  });

  it('backend basariliysa oyuncu listesini yeniler', async () => {
    vi.spyOn(playersApi, 'listAll').mockResolvedValue([backendPlayer]);

    await useScoutingStore.getState().loadPlayers();

    expect(playersApi.listAll).toHaveBeenCalledOnce();
    expect(useScoutingStore.getState().players).toEqual([backendPlayer]);
    expect(useScoutingStore.getState().playersError).toBeNull();
    expect(useScoutingStore.getState().isLoadingPlayers).toBe(false);
  });

  it('istek basarisizsa mock oyunculari ve Turkce uyariyi korur', async () => {
    vi.spyOn(playersApi, 'listAll').mockRejectedValue(new Error('ag yok'));
    useScoutingStore.setState({ players: [] });

    await useScoutingStore.getState().loadPlayers();

    expect(useScoutingStore.getState().players).toEqual(mockPlayers);
    expect(useScoutingStore.getState().playersError).toBe(
      'Oyuncular sunucudan alınamadı. Örnek oyuncular gösteriliyor.',
    );
    expect(useScoutingStore.getState().isLoadingPlayers).toBe(false);
  });

  it('eszamanli yukleme cagrilarinda tek API istegini paylastirir', async () => {
    const listSpy = vi
      .spyOn(playersApi, 'listAll')
      .mockResolvedValue([backendPlayer]);

    await Promise.all([
      useScoutingStore.getState().loadPlayers(),
      useScoutingStore.getState().loadPlayers(),
    ]);

    expect(listSpy).toHaveBeenCalledOnce();
    expect(useScoutingStore.getState().players).toEqual([backendPlayer]);
  });
});
