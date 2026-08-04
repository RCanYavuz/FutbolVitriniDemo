/**
 * PlayerListRow — Sahibinden ilan listesi satırı (tablo/list görünümü).
 *
 * Kompakt tek satır formatında oyuncu bilgilerini gösterir.
 */
import { useState } from 'react';
import {
  MapPin,
  Calendar,
  Star,
  Banknote,
  Eye,
  GitCompareArrows,
  Bookmark,
  Share2,
  Check,
} from 'lucide-react';
import Badge from '../atoms/Badge';
import ImageWithFallback from '../atoms/ImageWithFallback';
import { useScoutingStore } from '../../store/scoutingStore';
import { positionVariant } from '../atoms/badge-utils';
import type { Player } from '../../store/types';
import { computeMarketValue, formatMarketValue } from '../../lib/hooks/usePlayersQuery';

interface PlayerListRowProps {
  player: Player;
  onQuickView?: (playerId: string) => void;
  onCompare?: (playerId: string) => void;
}

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

export default function PlayerListRow({
  player,
  onQuickView,
  onCompare,
}: PlayerListRowProps) {
  const { bookmarkedPlayers, toggleBookmark } = useScoutingStore();
  const isBookmarked = bookmarkedPlayers.includes(player.id);
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/player/${player.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const fmRating = computeFMOverall(player);
  const value = computeMarketValue(player.aiScore);
  const avatarUrl = player.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=1f2b36&color=d7e4f2&bold=true&size=64`;

  return (
    <div className="group flex items-center gap-4 px-4 py-3 bg-surface-primary border border-border-standard rounded-xl hover:border-emerald-500/30 transition-all duration-200">
      {/* Avatar + Rating */}
      <div className="relative flex-shrink-0">
        <ImageWithFallback
          src={avatarUrl}
          alt={player.name}
          loading="lazy"
          className="w-10 h-10 rounded-lg object-cover border border-border-standard/60"
        />
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded text-[9px] font-black flex items-center justify-center shadow ${ratingColor(fmRating)}`}
        >
          {fmRating}
        </div>
      </div>

      {/* Name + Team */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-on-surface truncate group-hover:text-emerald-300 transition-colors">
            {player.name}
          </h4>
          <Badge variant={positionVariant(player.position)} size="sm">
            {player.position}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-text-muted">
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {player.team}
          </span>
        </div>
      </div>

      {/* Age */}
      <div className="hidden sm:flex items-center gap-1 text-xs text-text-muted">
        <Calendar className="w-3 h-3" />
        <span className="tabular-nums">{player.age}</span>
      </div>

      {/* Value */}
      <div className="hidden md:flex items-center gap-1 text-xs">
        <Banknote className="w-3.5 h-3.5 text-emerald-500/70" />
        <span className="font-semibold text-on-surface tabular-nums">{formatMarketValue(value)}</span>
      </div>

      {/* AI Score */}
      <div className="flex items-center gap-1 text-xs">
        <Star className="w-3 h-3 text-emerald-400" />
        <span className="font-bold text-emerald-400 tabular-nums">{player.aiScore.toFixed(1)}</span>
      </div>

      {/* Actions */}
      <div className={`flex items-center gap-1 transition-opacity ${isBookmarked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleBookmark(player.id); }}
          className={`p-1.5 rounded-md transition-all ${isBookmarked ? 'text-emerald-400 bg-emerald-500/20' : 'text-text-muted hover:text-emerald-400 hover:bg-emerald-500/10'}`}
          title="Favorilere Ekle"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="p-1.5 rounded-md text-text-muted hover:text-tactical-blue hover:bg-sky-500/10 transition-all"
          title="Bağlantıyı Kopyala"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
        {onQuickView && (
          <button
            type="button"
            onClick={() => onQuickView(player.id)}
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
            onClick={() => onCompare(player.id)}
            className="p-1.5 rounded-md text-text-muted hover:text-tactical-blue hover:bg-sky-500/10 transition-all"
            title="Karşılaştır"
            aria-label="Karşılaştır"
          >
            <GitCompareArrows className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
