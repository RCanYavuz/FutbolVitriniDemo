import {
  MapPin,
  Calendar,
  TrendingUp,
  Banknote,
  Star,
} from 'lucide-react';
import type { Player } from '../../store/types';

/* ═══════════════════════════════════════════════════════════════════
   FM-STYLE OVERALL RATING (1–20)
   Derived from the player's stats (0-100 scale) → normalized to 1–20
   ═══════════════════════════════════════════════════════════════════ */
function computeFMOverall(player: Player): number {
  const s = player.stats;
  const avg =
    (s.pace + s.passing + s.defending + s.physical + s.tackling + s.vision + s.dribbling + s.shooting) / 8;
  return Math.round((avg / 100) * 20);
}

/** Mock market value from aiScore */
function marketValue(aiScore: number): string {
  const base = aiScore * 1.2;
  if (base >= 10) return `€${(base * 1.5).toFixed(1)}M`;
  if (base >= 8) return `€${(base * 0.8).toFixed(1)}M`;
  return `€${(base * 0.3).toFixed(1)}M`;
}

/** Color for FM-style rating badge */
function ratingColor(rating: number): string {
  if (rating >= 17) return 'bg-emerald-500 text-white';
  if (rating >= 14) return 'bg-emerald-600/80 text-emerald-50';
  if (rating >= 10) return 'bg-emerald-900/60 text-emerald-300';
  return 'bg-surface-container-high text-text-muted';
}

/* ═══════════════════════════════════════════════════════════════════
   POSITION BADGE
   ═══════════════════════════════════════════════════════════════════ */
const POS_STYLE: Record<string, string> = {
  GK: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  DF: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  MF: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  FW: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

/* ═══════════════════════════════════════════════════════════════════
   COMPACT STAT BAR
   ═══════════════════════════════════════════════════════════════════ */
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
   PLAYER CARD
   ═══════════════════════════════════════════════════════════════════ */
interface PlayerCardProps {
  player: Player;
  onCardClick?: (playerId: string) => void;
}

export default function PlayerCard({ player, onCardClick }: PlayerCardProps) {
  const fmRating = computeFMOverall(player);
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1f2b36&color=d7e4f2&bold=true&size=128`;

  /* Key stats per position */
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
      onClick={() => onCardClick?.(player.id)}
      className="group relative bg-surface-primary border border-border-standard rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_24px_rgba(16,185,129,0.08)] hover:-translate-y-0.5"
    >
      {/* ── Top Section: Avatar + Info ── */}
      <div className="p-4 pb-3 flex items-start gap-3.5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt={player.name}
            className="w-14 h-14 rounded-xl object-cover border border-border-standard/60 group-hover:border-emerald-500/30 transition-colors"
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
          <h4 className="text-sm font-bold text-on-surface truncate group-hover:text-emerald-300 transition-colors">
            {player.name}
          </h4>

          <div className="flex items-center gap-2 mt-1">
            {/* Position badge */}
            <span
              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${POS_STYLE[player.position] || POS_STYLE.FW}`}
            >
              {player.position}
            </span>

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

      {/* ── Bottom Bar: Value + AI Score ── */}
      <div className="border-t border-border-standard/60 px-4 py-2.5 flex items-center justify-between bg-surface-container-low/30">
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <Banknote className="w-3.5 h-3.5 text-emerald-500/70" />
          <span className="font-semibold text-on-surface">{marketValue(player.aiScore)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-[11px]">
            <Star className="w-3 h-3 text-emerald-400" />
            <span className="font-bold text-emerald-400 tabular-nums">{player.aiScore.toFixed(1)}</span>
          </div>
          <TrendingUp className="w-3 h-3 text-emerald-500/50" />
        </div>
      </div>
    </div>
  );
}
