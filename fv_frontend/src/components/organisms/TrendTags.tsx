/**
 * TrendTags — Quick-filter chip'leri (Hero section alt kısmı).
 *
 * Her chip tıklandığında URL searchParams'ı günceller.
 */

import { Zap, UserCheck, Shield, Target, Star } from 'lucide-react';
import Chip from '../atoms/Chip';
import type { PlayerFilter } from '../../lib/validations/player';

interface TrendTagsProps {
  filters: PlayerFilter;
  onApply: (updates: Partial<PlayerFilter>) => void;
}

interface TrendItem {
  label: string;
  icon: React.ReactNode;
  params: Partial<PlayerFilter>;
}

const TRENDS: TrendItem[] = [
  {
    label: 'Genç Yetenekler (U21)',
    icon: <Zap className="w-3.5 h-3.5" />,
    params: { ageMin: 16, ageMax: 21 },
  },
  {
    label: 'Serbest Oyuncular',
    icon: <UserCheck className="w-3.5 h-3.5" />,
    params: { status: 'free' },
  },
  {
    label: 'Stoperler',
    icon: <Shield className="w-3.5 h-3.5" />,
    params: { positions: ['DF'] },
  },
  {
    label: 'Gol Kralları',
    icon: <Target className="w-3.5 h-3.5" />,
    params: { positions: ['FW'], sort: 'rating' },
  },
  {
    label: 'En Değerliler',
    icon: <Star className="w-3.5 h-3.5" />,
    params: { sort: 'value' },
  },
];

/** Trend'in aktif olup olmadığını kontrol eder */
function isTrendActive(trend: TrendItem, filters: PlayerFilter): boolean {
  for (const [key, value] of Object.entries(trend.params)) {
    const filterKey = key as keyof PlayerFilter;
    const currentValue = filters[filterKey];
    if (Array.isArray(value) && Array.isArray(currentValue)) {
      if (value.length !== currentValue.length || !value.every((v) => currentValue.includes(v))) {
        return false;
      }
    } else if (currentValue !== value) {
      return false;
    }
  }
  return true;
}

export default function TrendTags({ filters, onApply }: TrendTagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs text-text-muted font-medium self-center mr-1">Trend:</span>
      {TRENDS.map((trend) => (
        <Chip
          key={trend.label}
          label={trend.label}
          icon={trend.icon}
          active={isTrendActive(trend, filters)}
          onClick={() => {
            // Aktifse kaldır (sıfırla), değilse uygula
            if (isTrendActive(trend, filters)) {
              // Reset only the params this trend touches
              const resetParams: Partial<PlayerFilter> = {};
              for (const key of Object.keys(trend.params)) {
                const filterKey = key as keyof PlayerFilter;
                if (filterKey === 'positions') (resetParams as Record<string, unknown>)[filterKey] = [];
                else if (filterKey === 'ageMin') resetParams.ageMin = 16;
                else if (filterKey === 'ageMax') resetParams.ageMax = 35;
                else if (filterKey === 'status') resetParams.status = 'all';
                else if (filterKey === 'sort') resetParams.sort = 'rating';
              }
              onApply(resetParams);
            } else {
              onApply(trend.params);
            }
          }}
        />
      ))}
    </div>
  );
}
