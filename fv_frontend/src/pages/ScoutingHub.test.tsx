import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { playersApi } from '../lib/players.api';
import { mockPlayers } from '../store/mockData';
import { useScoutingStore } from '../store/scoutingStore';
import ScoutingHub from './ScoutingHub';

vi.mock('../components/scouting/FilterSidebar', () => ({
  default: () => <aside>filtreler</aside>,
}));
vi.mock('../components/scouting/AISmartMatches', () => ({
  default: () => <section>akilli eslesmeler</section>,
}));
vi.mock('../components/scouting/PlayerGrid', () => ({
  default: () => <section>oyuncu listesi</section>,
}));
vi.mock('../components/scouting/ComparisonDrawer', () => ({
  default: () => <section>karsilastirma</section>,
}));

const initialState = useScoutingStore.getState();

describe('ScoutingHub', () => {
  beforeEach(() => {
    useScoutingStore.setState(initialState, true);
    vi.restoreAllMocks();
  });

  it('mount oldugunda oyunculari API uzerinden yukler', async () => {
    vi.spyOn(playersApi, 'listAll').mockResolvedValue(mockPlayers);

    render(<ScoutingHub />);

    await waitFor(() => expect(playersApi.listAll).toHaveBeenCalledOnce());
  });

  it('API hatasinda mock fallback uyarisini gosterir', async () => {
    vi.spyOn(playersApi, 'listAll').mockRejectedValue(new Error('sunucu kapali'));

    render(<ScoutingHub />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Örnek oyuncular gösteriliyor.',
    );
  });
});
