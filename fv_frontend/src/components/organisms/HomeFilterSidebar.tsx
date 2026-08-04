/**
 * HomeFilterSidebar — Sahibinden-style sol filtreleme paneli.
 *
 * Mevcut scouting/FilterSidebar'dan bağımsızdır.
 * Anasayfa'ya özel filtreler içerir ve URL state ile senkronize çalışır.
 */

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Filter,
  RotateCcw,
  X,
} from 'lucide-react';
import type { PlayerFilter, Position } from '../../lib/validations/player';
import { POSITIONS, POSITION_TREE } from '../../lib/validations/player';

/* ═══════════════════════════════════════════════════════════════════
   ACCORDION
   ═══════════════════════════════════════════════════════════════════ */

interface AccordionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Accordion({ title, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border-standard/60 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-container-high/40 hover:bg-surface-container-high/70 transition-colors"
      >
        <span className="text-sm font-semibold text-on-surface">{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted" />
        )}
      </button>
      {open && (
        <div className="px-4 py-3 bg-surface-container-low/30 space-y-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════════════ */

interface HomeFilterSidebarProps {
  filters: PlayerFilter;
  activeCount: number;
  onFilterChange: <K extends keyof PlayerFilter>(key: K, value: PlayerFilter[K]) => void;
  onTogglePosition: (pos: Position) => void;
  onReset: () => void;
  /** Mobilde sidebar'ı kapatma callback'i */
  onClose?: () => void;
  className?: string;
}

export default function HomeFilterSidebar({
  filters,
  activeCount,
  onFilterChange,
  onTogglePosition,
  onReset,
  onClose,
  className = '',
}: HomeFilterSidebarProps) {
  return (
    <aside
      className={`bg-surface-primary border-r border-border-standard flex flex-col h-full ${className}`}
    >
      {/* ── Header ── */}
      <div className="p-5 border-b border-border-standard flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <Filter className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-on-surface tracking-tight">Filtreler</h2>
            {activeCount > 0 && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-emerald-400 transition-colors"
              title="Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Sıfırla
            </button>
            {/* Close button for mobile */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1 text-text-muted hover:text-on-surface transition-colors"
                aria-label="Filtreleri kapat"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable Filters ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-5">

        {/* ── Kategori Ağacı (Mevkiler) ── */}
        <Accordion title="Mevki" defaultOpen>
          <div className="space-y-1">
            {POSITIONS.map((pos) => {
              const tree = POSITION_TREE[pos];
              const active = filters.positions.includes(pos);
              return (
                <div key={pos}>
                  <button
                    type="button"
                    onClick={() => onTogglePosition(pos)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'text-text-muted hover:text-on-surface hover:bg-surface-container-high/50'
                    }`}
                  >
                    <span>{tree.label}</span>
                    <span className="text-[10px] font-bold uppercase opacity-60">{pos}</span>
                  </button>
                  {/* Sub-positions (cosmetic — filters by parent position) */}
                  {active && tree.children.length > 0 && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {tree.children.map((sub) => (
                        <div
                          key={sub.value}
                          className="text-xs text-text-muted/70 px-3 py-1 flex items-center gap-2"
                        >
                          <div className="w-1 h-1 rounded-full bg-emerald-500/40" />
                          {sub.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Accordion>

        {/* ── Yaş Aralığı ── */}
        <Accordion title="Yaş Aralığı" defaultOpen>
          <div className="flex gap-3">
            <div className="flex-1">
              <span className="text-[10px] text-text-muted block mb-1">Min</span>
              <input
                type="number"
                min={10}
                max={filters.ageMax}
                value={filters.ageMin}
                onChange={(e) => onFilterChange('ageMin', Number(e.target.value))}
                className="w-full bg-surface-container-high border border-border-standard rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-text-muted block mb-1">Max</span>
              <input
                type="number"
                min={filters.ageMin}
                max={60}
                value={filters.ageMax}
                onChange={(e) => onFilterChange('ageMax', Number(e.target.value))}
                className="w-full bg-surface-container-high border border-border-standard rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>
        </Accordion>

        {/* ── Piyasa Değeri ── */}
        <Accordion title="Piyasa Değeri (€M)">
          <div className="flex gap-3">
            <div className="flex-1">
              <span className="text-[10px] text-text-muted block mb-1">Min (€M)</span>
              <input
                type="number"
                min={0}
                max={filters.valueMax}
                step={0.1}
                value={filters.valueMin}
                onChange={(e) => onFilterChange('valueMin', Number(e.target.value))}
                className="w-full bg-surface-container-high border border-border-standard rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-text-muted block mb-1">Max (€M)</span>
              <input
                type="number"
                min={filters.valueMin}
                step={0.1}
                value={filters.valueMax}
                onChange={(e) => onFilterChange('valueMax', Number(e.target.value))}
                className="w-full bg-surface-container-high border border-border-standard rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>
        </Accordion>

        {/* ── Baskın Ayak ── */}
        <Accordion title="Baskın Ayak">
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'any' as const, label: 'Farketmez' },
              { value: 'right' as const, label: 'Sağ Ayak' },
              { value: 'left' as const, label: 'Sol Ayak' },
              { value: 'both' as const, label: 'Her İkisi' },
            ].map(({ value, label }) => {
              const active = filters.preferredFoot === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onFilterChange('preferredFoot', value)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                      : 'bg-surface-container-high/40 border-border-standard text-text-muted hover:text-on-surface hover:border-surface-bright'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Accordion>

        {/* ── Oyuncu Statüsü ── */}
        <Accordion title="Kulüp Statüsü">
          <div className="space-y-1">
            {[
              { value: 'all' as const, label: 'Tümü' },
              { value: 'free' as const, label: 'Kulüpsüz / Serbest' },
              { value: 'loan' as const, label: 'Kiralık' },
              { value: 'sale' as const, label: 'Satılık' },
            ].map(({ value, label }) => {
              const active = filters.status === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onFilterChange('status', value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                      : 'text-text-muted hover:text-on-surface hover:bg-surface-container-high/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Accordion>

        {/* ── Sıralama ── */}
        <Accordion title="Sıralama">
          <div className="space-y-1">
            {[
              { value: 'rating' as const, label: 'En Yüksek Puan' },
              { value: 'age' as const, label: 'Yaş (Küçükten)' },
              { value: 'value' as const, label: 'Piyasa Değeri' },
              { value: 'name' as const, label: 'İsim (A-Z)' },
            ].map(({ value, label }) => {
              const active = filters.sort === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onFilterChange('sort', value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                      : 'text-text-muted hover:text-on-surface hover:bg-surface-container-high/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Accordion>
      </div>
    </aside>
  );
}
