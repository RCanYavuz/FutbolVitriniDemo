/**
 * SearchBar — Kategorize arama barı (Hero section içinde kullanılır).
 *
 * Pozisyon dropdown + yaş aralığı + serbest metin araması.
 * Submit'te useFilterParams üzerinden URL'i günceller.
 */

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { PlayerFilter, Position } from '../../lib/validations/player';
import { POSITIONS, POSITION_TREE } from '../../lib/validations/player';

interface SearchBarProps {
  filters: PlayerFilter;
  onSearch: (updates: Partial<PlayerFilter>) => void;
}

export default function SearchBar({ filters, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(filters.query);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query });
  };

  const handlePositionChange = (position: string) => {
    if (position === '') {
      onSearch({ positions: [] });
    } else {
      onSearch({ positions: [position as Position] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Main search area */}
        <div className="flex-1 flex items-center bg-surface-primary/80 backdrop-blur-sm border border-border-standard rounded-xl overflow-hidden focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
          {/* Position dropdown */}
          <select
            className="bg-transparent border-r border-border-standard/60 text-sm text-on-surface px-3 py-3.5 outline-none cursor-pointer appearance-none min-w-[140px] font-medium"
            value={filters.positions[0] ?? ''}
            onChange={(e) => handlePositionChange(e.target.value)}
          >
            <option value="">Tüm Mevkiler</option>
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {POSITION_TREE[pos].label}
              </option>
            ))}
          </select>

          {/* Search input */}
          <div className="flex-1 flex items-center px-3">
            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Oyuncu adı, takım veya lig ara..."
              className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-text-muted/60 px-2 py-3.5 outline-none"
            />
          </div>

          {/* Search button */}
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-pitch-black font-bold text-sm px-6 py-3.5 transition-colors flex-shrink-0"
          >
            Ara
          </button>
        </div>

        {/* Advanced filters toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            showAdvanced
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-surface-primary/80 border-border-standard text-text-muted hover:text-on-surface hover:border-surface-bright'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtreler</span>
        </button>
      </div>

      {/* Advanced filters row */}
      {showAdvanced && (
        <div className="mt-3 flex flex-wrap gap-3 p-4 bg-surface-primary/60 backdrop-blur-sm border border-border-standard rounded-xl animate-fade-in">
          {/* Age range */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium">Yaş:</span>
            <input
              type="number"
              min={10}
              max={60}
              value={filters.ageMin}
              onChange={(e) => onSearch({ ageMin: Number(e.target.value) })}
              className="w-14 bg-surface-container-high border border-border-standard rounded-lg px-2 py-1.5 text-xs text-on-surface outline-none focus:border-emerald-500/50"
            />
            <span className="text-text-muted text-xs">—</span>
            <input
              type="number"
              min={10}
              max={60}
              value={filters.ageMax}
              onChange={(e) => onSearch({ ageMax: Number(e.target.value) })}
              className="w-14 bg-surface-container-high border border-border-standard rounded-lg px-2 py-1.5 text-xs text-on-surface outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* Preferred foot */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium">Ayak:</span>
            <select
              className="bg-surface-container-high border border-border-standard rounded-lg px-2 py-1.5 text-xs text-on-surface outline-none cursor-pointer appearance-none pr-6 focus:border-emerald-500/50"
              value={filters.preferredFoot}
              onChange={(e) => onSearch({ preferredFoot: e.target.value as PlayerFilter['preferredFoot'] })}
            >
              <option value="any">Farketmez</option>
              <option value="right">Sağ</option>
              <option value="left">Sol</option>
              <option value="both">Her İkisi</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-medium">Statü:</span>
            <select
              className="bg-surface-container-high border border-border-standard rounded-lg px-2 py-1.5 text-xs text-on-surface outline-none cursor-pointer appearance-none pr-6 focus:border-emerald-500/50"
              value={filters.status}
              onChange={(e) => onSearch({ status: e.target.value as PlayerFilter['status'] })}
            >
              <option value="all">Tümü</option>
              <option value="free">Serbest</option>
              <option value="loan">Kiralık</option>
              <option value="sale">Satılık</option>
            </select>
          </div>
        </div>
      )}
    </form>
  );
}
