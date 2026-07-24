import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  Footprints,
  Brain,
  Zap,
  Crosshair,
  Filter,
} from 'lucide-react';
import { useScoutingStore } from '../../store/scoutingStore';
import type {
  FMStatRange,
  TechnicalStats,
  MentalStats,
  PhysicalStats,
} from '../../store/scoutingStore';
import type { Position } from '../../store/types';

/* ═══════════════════════════════════════════════════════════════════
   STAT LABEL MAPS (Türkçe)
   ═══════════════════════════════════════════════════════════════════ */
const TECHNICAL_LABELS: Record<keyof TechnicalStats, string> = {
  finishing: 'Bitiricilik',
  firstTouch: 'İlk Dokunuş',
  passing: 'Pas',
  crossing: 'Orta',
  dribbling: 'Çalım',
  heading: 'Kafa Vuruşu',
  longShots: 'Uzak Şut',
  marking: 'Adam Markajı',
  tackling: 'Müdahale',
  technique: 'Teknik',
};

const MENTAL_LABELS: Record<keyof MentalStats, string> = {
  aggression: 'Agresiflik',
  anticipation: 'Sezgi',
  bravery: 'Cesaret',
  composure: 'Soğukkanlılık',
  concentration: 'Konsantrasyon',
  decisions: 'Karar Verme',
  determination: 'Kararlılık',
  flair: 'Yaratıcılık',
  leadership: 'Liderlik',
  offTheBall: 'Topsuz Oyun',
  positioning: 'Pozisyon Alma',
  teamwork: 'Takım Oyunu',
  vision: 'Vizyon',
  workRate: 'Çalışma Oranı',
};

const PHYSICAL_LABELS: Record<keyof PhysicalStats, string> = {
  acceleration: 'Hızlanma',
  agility: 'Çeviklik',
  balance: 'Denge',
  jumpingReach: 'Sıçrama',
  naturalFitness: 'Doğal Kondisyon',
  pace: 'Hız',
  stamina: 'Dayanıklılık',
  strength: 'Güç',
};

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'GK', label: 'Kaleci' },
  { value: 'DF', label: 'Defans' },
  { value: 'MF', label: 'Orta Saha' },
  { value: 'FW', label: 'Forvet' },
];

const FOOT_OPTIONS = [
  { value: 'any' as const, label: 'Farketmez' },
  { value: 'right' as const, label: 'Sağ' },
  { value: 'left' as const, label: 'Sol' },
  { value: 'both' as const, label: 'Her İkisi' },
];

/* ═══════════════════════════════════════════════════════════════════
   FM RANGE SLIDER (1–20)
   ═══════════════════════════════════════════════════════════════════ */
interface FMSliderProps {
  label: string;
  range: FMStatRange;
  onChange: (range: FMStatRange) => void;
}

function FMSlider({ label, range, onChange }: FMSliderProps) {
  const isActive = range.min > 1 || range.max < 20;
  const percentage = ((range.min - 1) / 19) * 100;
  const width = ((range.max - range.min) / 19) * 100;

  return (
    <div className="group py-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium transition-colors ${isActive ? 'text-emerald-400' : 'text-text-muted'}`}>
          {label}
        </span>
        <span className={`text-[10px] font-mono tabular-nums transition-colors ${isActive ? 'text-emerald-400 font-bold' : 'text-text-muted/60'}`}>
          {range.min} – {range.max}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-5 flex items-center">
        {/* Background track */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-surface-container-high" />

        {/* Active range */}
        <div
          className="absolute h-1 rounded-full bg-emerald-500/60 transition-all"
          style={{ left: `${percentage}%`, width: `${width}%` }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={1}
          max={20}
          step={1}
          value={range.min}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= range.max) onChange({ ...range, min: v });
          }}
          className="fm-range-slider absolute inset-x-0"
          style={{ zIndex: 2 }}
        />

        {/* Max slider */}
        <input
          type="range"
          min={1}
          max={20}
          step={1}
          value={range.max}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= range.min) onChange({ ...range, max: v });
          }}
          className="fm-range-slider absolute inset-x-0"
          style={{ zIndex: 3 }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ACCORDION SECTION
   ═══════════════════════════════════════════════════════════════════ */
interface AccordionProps {
  title: string;
  icon: React.ReactNode;
  activeCount: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Accordion({ title, icon, activeCount, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border-standard/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-high/40 hover:bg-surface-container-high/70 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-emerald-400">{icon}</span>
          <span className="text-sm font-semibold text-on-surface">{title}</span>
          {activeCount > 0 && (
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted" />
        )}
      </button>

      {open && (
        <div className="px-4 py-3 bg-surface-container-low/30 space-y-0.5 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FILTER SIDEBAR
   ═══════════════════════════════════════════════════════════════════ */
interface FilterSidebarProps {
  className?: string;
}

export default function FilterSidebar({ className = '' }: FilterSidebarProps) {
  const filters = useScoutingStore((s) => s.filters);
  const setAgeRange = useScoutingStore((s) => s.setAgeRange);
  const togglePosition = useScoutingStore((s) => s.togglePosition);
  const setPreferredFoot = useScoutingStore((s) => s.setPreferredFoot);
  const setMinAiScore = useScoutingStore((s) => s.setMinAiScore);
  const setTechnicalStat = useScoutingStore((s) => s.setTechnicalStat);
  const setMentalStat = useScoutingStore((s) => s.setMentalStat);
  const setPhysicalStat = useScoutingStore((s) => s.setPhysicalStat);
  const resetFilters = useScoutingStore((s) => s.resetFilters);

  /* Count active (non-default) filters per category */
  const countActive = (stats: TechnicalStats | MentalStats | PhysicalStats) =>
    // Bu arayuzlerin index imzasi yok, bu yuzden Object.values any[] doner.
    (Object.values(stats) as FMStatRange[]).filter((r) => r.min > 1 || r.max < 20).length;

  const techActive = countActive(filters.technicalStats);
  const mentActive = countActive(filters.mentalStats);
  const physActive = countActive(filters.physicalStats);
  const totalActive =
    techActive +
    mentActive +
    physActive +
    (filters.preferredFoot !== 'any' ? 1 : 0) +
    (filters.ageRange[0] !== 16 || filters.ageRange[1] !== 35 ? 1 : 0) +
    (filters.positions.length < 4 ? 1 : 0) +
    (filters.minAiScore > 5 ? 1 : 0);

  return (
    <aside
      className={`bg-surface-primary border-r border-border-standard w-[320px] flex-shrink-0 flex flex-col h-full ${className}`}
    >
      {/* ── Header ── */}
      <div className="p-5 border-b border-border-standard flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Filter className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-on-surface tracking-tight">Filtreler</h2>
            {totalActive > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {totalActive}
              </span>
            )}
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-emerald-400 transition-colors"
            title="Sıfırla"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Sıfırla
          </button>
        </div>
      </div>

      {/* ── Scrollable Filters ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-5">

        {/* ── Age Range ── */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-on-surface uppercase tracking-wider">
              Yaş Aralığı
            </label>
            <span className="text-xs font-mono text-emerald-400 tabular-nums">
              {filters.ageRange[0]} – {filters.ageRange[1]}
            </span>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <span className="text-[10px] text-text-muted block mb-1">Min</span>
              <input
                type="number"
                min={14}
                max={filters.ageRange[1]}
                value={filters.ageRange[0]}
                onChange={(e) =>
                  setAgeRange([Number(e.target.value), filters.ageRange[1]])
                }
                className="w-full bg-surface-container-high border border-border-standard rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-text-muted block mb-1">Max</span>
              <input
                type="number"
                min={filters.ageRange[0]}
                max={45}
                value={filters.ageRange[1]}
                onChange={(e) =>
                  setAgeRange([filters.ageRange[0], Number(e.target.value)])
                }
                className="w-full bg-surface-container-high border border-border-standard rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Position ── */}
        <div>
          <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-2.5">
            Mevki
          </label>
          <div className="grid grid-cols-2 gap-2">
            {POSITIONS.map(({ value, label }) => {
              const active = filters.positions.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => togglePosition(value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
                      : 'bg-surface-container-high/40 border-border-standard text-text-muted hover:text-on-surface hover:border-surface-bright'
                  }`}
                >
                  {value} — {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Preferred Foot ── */}
        <div>
          <label className="text-xs font-semibold text-on-surface uppercase tracking-wider block mb-2.5">
            Tercih Edilen Ayak
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {FOOT_OPTIONS.map(({ value, label }) => {
              const active = filters.preferredFoot === value;
              return (
                <button
                  key={value}
                  onClick={() => setPreferredFoot(value)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-surface-container-high/40 border-border-standard text-text-muted hover:text-on-surface'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── AI Score Min ── */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              Min AI Puan
            </label>
            <span className="text-sm font-bold text-emerald-400 tabular-nums">
              {filters.minAiScore.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={10}
            step={0.1}
            value={filters.minAiScore}
            onChange={(e) => setMinAiScore(Number(e.target.value))}
            className="fm-range-slider w-full"
          />
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-border-standard to-transparent" />

        {/* ═══ TECHNICAL STATS ACCORDION ═══ */}
        <Accordion
          title="Teknik Yetenekler"
          icon={<SlidersHorizontal className="w-4 h-4" />}
          activeCount={techActive}
          defaultOpen
        >
          {(Object.keys(TECHNICAL_LABELS) as (keyof TechnicalStats)[]).map((key) => (
            <FMSlider
              key={key}
              label={TECHNICAL_LABELS[key]}
              range={filters.technicalStats[key]}
              onChange={(r) => setTechnicalStat(key, r)}
            />
          ))}
        </Accordion>

        {/* ═══ MENTAL STATS ACCORDION ═══ */}
        <Accordion
          title="Zihinsel Yetenekler"
          icon={<Brain className="w-4 h-4" />}
          activeCount={mentActive}
        >
          {(Object.keys(MENTAL_LABELS) as (keyof MentalStats)[]).map((key) => (
            <FMSlider
              key={key}
              label={MENTAL_LABELS[key]}
              range={filters.mentalStats[key]}
              onChange={(r) => setMentalStat(key, r)}
            />
          ))}
        </Accordion>

        {/* ═══ PHYSICAL STATS ACCORDION ═══ */}
        <Accordion
          title="Fiziksel Yetenekler"
          icon={<Zap className="w-4 h-4" />}
          activeCount={physActive}
        >
          {(Object.keys(PHYSICAL_LABELS) as (keyof PhysicalStats)[]).map((key) => (
            <FMSlider
              key={key}
              label={PHYSICAL_LABELS[key]}
              range={filters.physicalStats[key]}
              onChange={(r) => setPhysicalStat(key, r)}
            />
          ))}
        </Accordion>

        {/* ── Preferred Foot icon (bottom spacer) ── */}
        <div className="flex items-center justify-center py-4 text-text-muted/30">
          <Footprints className="w-5 h-5" />
        </div>
      </div>
    </aside>
  );
}
