/**
 * PlayerCard (Marketplace) — Sahibinden ilan kartı anatomisi.
 *
 * Mevcut scouting/PlayerCard'dan bağımsızdır; anasayfa vitrini için tasarlanmıştır.
 * `featured` prop'u ile öne çıkarılmış kartlar için altın border ve yıldız badge gösterir.
 */

import {
  MapPin,
  Calendar,
  Star,
  Eye,
  GitCompareArrows,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import Badge from '../atoms/Badge';
import { positionVariant } from '../atoms/badge-utils';
import type { Player } from '../../store/types';
import { computeMarketValue, formatMarketValue } from '../../lib/hooks/usePlayersQuery';

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function computeFMOverall(player: Player): number {
  const s = player.stats;
  const avg =
    (s.pace + s.passing + s.defending + s.physical + s.tackling + s.vision + s.dribbling + s.shooting) / 8;
  return Math.round((avg / 100) * 20);
}

function ratingColor(rating: number): string {
  if (rating >= 17) return 'bg-emerald-500 text-white';
  if (rating >= 14) return 'bg-emerald-600/80 text-emerald-50';
  if (rating >= 10) return 'bg-emerald-900/60 text-emerald-300';
  return 'bg-surface-container-high text-text-muted';
}

/** Oyuncu yaşından "Genç Yetenek" etiketleri */
function ageTag(age: number): string | null {
  if (age <= 18) return 'U19';
  if (age <= 21) return 'U21';
  if (age <= 23) return 'U23';
  return null;
}

/** Stat bar — mevki bazlı anahtar istatistikler */
function MiniStatBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 100) * 100;
  const fm = Math.round((value / 100) * 20);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-text-muted w-7 text-right font-medium shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1 rounded-full bg-surface-container-high overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-600 to-emerald-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono font-bold text-on-surface w-4 text-right tabular-nums">
        {fm}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

interface MarketplacePlayerCardProps {
  player: Player;
  featured?: boolean;
  onQuickView?: (playerId: string) => void;
  onCompare?: (playerId: string) => void;
}

export default function MarketplacePlayerCard({
  player,
  featured = false,
  onQuickView,
  onCompare,
}: MarketplacePlayerCardProps) {
  const fmRating = computeFMOverall(player);
  const value = computeMarketValue(player.aiScore);
  const tag = ageTag(player.age);

  const avatarUrl = player.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1f2b36&color=d7e4f2&bold=true&size=128`;

  const keyStats =
    player.position === 'FW'
      ? [
          { label: 'PAC', value: player.stats.pace },
          { label: 'SHT', value: player.stats.shooting },
          { label: 'DRI', value: player.stats.dribbling },
        ]
      : player.position === 'MF'
        ? [
            { label: 'PAS', value: player.stats.passing },
            { label: 'VIS', value: player.stats.vision },
            { label: 'DRI', value: player.stats.dribbling },
          ]
        : player.position === 'DF'
          ? [
              { label: 'TCK', value: player.stats.tackling },
              { label: 'DEF', value: player.stats.defending },
              { label: 'PHY', value: player.stats.physical },
            ]
          : [
              { label: 'PHY', value: player.stats.physical },
              { label: 'PAS', value: player.stats.passing },
              { label: 'VIS', value: player.stats.vision },
            ];

  return (
    <div
      className={`
        group relative bg-surface-primary border rounded-xl overflow-hidden
        transition-all duration-300 hover:-translate-y-0.5
        ${
          featured
            ? 'border-amber-500/30 hover:border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.06)] hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]'
            : 'border-border-standard hover:border-emerald-500/40 hover:shadow-[0_0_24px_rgba(16,185,129,0.08)]'
        }
      `}
    >
      {/* Featured ribbon */}
      {featured && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-lg shadow-lg">
            ⭐ Vitrin
          </div>
        </div>
      )}

      {/* ── Top Section: Avatar + Info ── */}
      <div className="p-4 pb-3 flex items-start gap-3.5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt={player.name}
            loading="lazy"
            className={`
              w-14 h-14 rounded-xl object-cover border transition-colors
              ${
                featured
                  ? 'border-amber-500/30 group-hover:border-amber-400/50'
                  : 'border-border-standard/60 group-hover:border-emerald-500/30'
              }
            `}
          />
          {/* FM Rating Badge */}
          <div
            className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shadow-lg ${ratingColor(fmRating)}`}
          >
            {fmRating}
          </div>
        </div>

        {/* Name + Meta */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-bold truncate transition-colors ${featured ? 'text-amber-200 group-hover:text-amber-100' : 'text-on-surface group-hover:text-emerald-300'}`}>
            {player.name}
          </h4>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge variant={positionVariant(player.position)}>{player.position}</Badge>

            {tag && (
              <Badge variant="gold" size="sm">{tag}</Badge>
            )}

            <span className="flex items-center gap-0.5 text-[11px] text-text-muted">
              <Calendar className="w-3 h-3" />
              {player.age}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-[11px] text-text-muted">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{player.team}</span>
          </div>
        </div>
      </div>

      {/* ── Key Stats ── */}
      <div className="px-4 pb-3 space-y-1.5">
        {keyStats.map((stat) => (
          <MiniStatBar key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* ── Bottom Bar: Value + Score + Actions ── */}
      <div className="border-t border-border-standard/60 px-4 py-2.5 flex items-center justify-between bg-surface-container-low/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <Banknote className="w-3.5 h-3.5 text-emerald-500/70" />
            <span className="font-semibold text-on-surface">{formatMarketValue(value)}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <Star className="w-3 h-3 text-emerald-400" />
            <span className="font-bold text-emerald-400 tabular-nums">{player.aiScore.toFixed(1)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onQuickView(player.id); }}
              className="p-1.5 rounded-md text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
              title="Hızlı İncele"
              aria-label="Hızlı İncele"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {onCompare && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onCompare(player.id); }}
              className="p-1.5 rounded-md text-text-muted hover:text-tactical-blue hover:bg-sky-500/10 transition-all"
              title="Karşılaştır"
              aria-label="Karşılaştır"
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
            </button>
          )}
          <TrendingUp className="w-3 h-3 text-emerald-500/50" />
        </div>
      </div>
    </div>
  );
}
