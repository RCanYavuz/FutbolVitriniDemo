/**
 * ShowcaseGrid — Ana içerik alanı (Vitrindekiler + listing grid).
 *
 * - Üst kısımda "Vitrindekiler" (ilk 4 featured kart)
 * - Sonuç header (X oyuncu + sort dropdown + view toggle)
 * - Grid/List modunda oyuncu kartları
 * - Skeleton loader & empty state
 */

import {
  ArrowUpDown,
  SearchX,
  Users,
  Sparkles,
} from 'lucide-react';
import ViewToggle from '../atoms/ViewToggle';
import SkeletonCard from '../atoms/SkeletonCard';
import MarketplacePlayerCard from '../molecules/PlayerCard';
import PlayerListRow from '../molecules/PlayerListRow';
import type { Player } from '../../store/types';
import type { PlayerFilter } from '../../lib/validations/player';
import { SORT_OPTIONS } from '../../lib/validations/player';

/* ═══════════════════════════════════════════════════════════════════
   SORT LABELS
   ═══════════════════════════════════════════════════════════════════ */

const SORT_LABELS: Record<(typeof SORT_OPTIONS)[number], string> = {
  rating: 'En Yüksek Puan',
  age: 'Yaş (Küçükten)',
  value: 'Piyasa Değeri',
  name: 'İsim (A-Z)',
};

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

interface ShowcaseGridProps {
  players: Player[];
  allPlayers: Player[];
  total: number;
  isLoading: boolean;
  filters: PlayerFilter;
  onFilterChange: <K extends keyof PlayerFilter>(key: K, value: PlayerFilter[K]) => void;
}

export default function ShowcaseGrid({
  players,
  allPlayers,
  total,
  isLoading,
  filters,
  onFilterChange,
}: ShowcaseGridProps) {
  // Top 4 oyuncu vitrinde gösterilir (sadece filtresiz ilk yüklemede)
  const featuredPlayers = allPlayers.slice(0, 4);
  const showFeatured = filters.query === '' && filters.positions.length === 0 && filters.status === 'all';

  return (
    <div className="flex-1 min-w-0">

      {/* ═══ VİTRİNDEKİLER ═══ */}
      {showFeatured && !isLoading && (
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-headline-md text-on-surface">Vitrindekiler</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {featuredPlayers.map((player) => (
              <MarketplacePlayerCard
                key={player.id}
                player={player}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ RESULTS HEADER ═══ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <Users className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm text-text-muted">
            <span className="text-on-surface font-bold text-base tabular-nums">{total}</span>{' '}
            oyuncu bulundu
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <ViewToggle
            value={filters.view}
            onChange={(mode) => onFilterChange('view', mode)}
          />

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            <select
              className="bg-surface-container-high border border-border-standard/60 text-on-surface text-xs font-medium rounded-lg px-2.5 py-1.5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all appearance-none cursor-pointer pr-6"
              value={filters.sort}
              onChange={(e) => onFilterChange('sort', e.target.value as PlayerFilter['sort'])}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {SORT_LABELS[opt]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ═══ LOADING ═══ */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* ═══ PLAYER CARDS ═══ */}
      {!isLoading && players.length > 0 && (
        <div
          className={
            filters.view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-8'
              : 'flex flex-col gap-3 pb-8'
          }
        >
          {players.map((player, index) => (
            <div
              key={player.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
            >
              {filters.view === 'grid' ? (
                <MarketplacePlayerCard player={player} />
              ) : (
                <PlayerListRow player={player} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ EMPTY STATE ═══ */}
      {!isLoading && players.length === 0 && (
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
