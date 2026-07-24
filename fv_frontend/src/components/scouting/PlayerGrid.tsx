import { useState } from 'react';
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  SearchX,
  Users,
} from 'lucide-react';
import { useScoutingStore } from '../../store/scoutingStore';
import PlayerCard from './PlayerCard';

/* ═══════════════════════════════════════════════════════════════════
   PLAYER GRID
   ═══════════════════════════════════════════════════════════════════ */
export default function PlayerGrid() {
  const filteredPlayers = useScoutingStore((s) => s.filteredPlayers);
  const openDrawer = useScoutingStore((s) => s.openDrawer);
  const [sortBy, setSortBy] = useState<'rating' | 'age' | 'name'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const players = filteredPlayers();

  const sorted = [...players].sort((a, b) => {
    if (sortBy === 'rating') return b.aiScore - a.aiScore;
    if (sortBy === 'age') return a.age - b.age;
    return a.name.localeCompare(b.name);
  });

  const handleCardClick = (playerId: string) => {
    openDrawer(playerId);
  };

  return (
    <div className="flex-1 min-w-0">
      {/* ── Results Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <Users className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm text-text-muted">
            <span className="text-on-surface font-bold text-base tabular-nums">{sorted.length}</span>{' '}
            oyuncu bulundu
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-surface-container-high rounded-lg p-0.5 border border-border-standard/60">
            <button
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'text-text-muted hover:text-on-surface'
              }`}
              onClick={() => setViewMode('grid')}
              title="Grid görünümü"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'text-text-muted hover:text-on-surface'
              }`}
              onClick={() => setViewMode('list')}
              title="Liste görünümü"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            <select
              className="bg-surface-container-high border border-border-standard/60 text-on-surface text-xs font-medium rounded-lg px-2.5 py-1.5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer pr-6"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="rating">En Yüksek Puan</option>
              <option value="age">Yaş (Küçükten)</option>
              <option value="name">İsim (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Player Cards Grid ── */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8'
            : 'flex flex-col gap-3 pb-8'
        }
      >
        {sorted.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onCardClick={handleCardClick}
          />
        ))}
      </div>

      {/* ── Empty State ── */}
      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <div className="p-4 rounded-2xl bg-surface-container-high/40 mb-4">
            <SearchX className="w-8 h-8 text-emerald-500/40" />
          </div>
          <p className="text-base font-semibold text-on-surface mb-1">
            Sonuç bulunamadı
          </p>
          <p className="text-xs text-text-muted">
            Filtre kriterlerinizi genişletmeyi deneyin
          </p>
        </div>
      )}
    </div>
  );
}
