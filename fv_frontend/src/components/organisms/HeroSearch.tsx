/**
 * HeroSearch — Anasayfa hero alanı (gradient bg + arama + trendler).
 */

import { Trophy, Users, TrendingUp } from 'lucide-react';
import SearchBar from '../molecules/SearchBar';
import TrendTags from './TrendTags';
import type { PlayerFilter } from '../../lib/validations/player';

interface HeroSearchProps {
  filters: PlayerFilter;
  onSearch: (updates: Partial<PlayerFilter>) => void;
  totalPlayers: number;
}

export default function HeroSearch({ filters, onSearch, totalPlayers }: HeroSearchProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-tactical-blue/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-display-lg text-on-surface mb-3">
            Futbolun{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-tactical-blue">
              Vitrini
            </span>
          </h1>
          <p className="text-body-lg text-text-muted max-w-2xl mx-auto">
            Yetenekleri keşfet, karşılaştır ve takımına en uygun oyuncuyu bul.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-on-surface tabular-nums">{totalPlayers}</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Oyuncu</div>
            </div>
          </div>
          <div className="w-px h-8 bg-border-standard" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-tactical-blue/15 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-tactical-blue" />
            </div>
            <div>
              <div className="text-lg font-bold text-on-surface">50+</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Lig</div>
            </div>
          </div>
          <div className="w-px h-8 bg-border-standard" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-on-surface">AI</div>
              <div className="text-[10px] text-text-muted uppercase tracking-wider">Puanlama</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-4xl mx-auto mb-6">
          <SearchBar filters={filters} onSearch={onSearch} />
        </div>

        {/* Trend Tags */}
        <div className="max-w-4xl mx-auto flex justify-center">
          <TrendTags filters={filters} onApply={onSearch} />
        </div>
      </div>
    </section>
  );
}
