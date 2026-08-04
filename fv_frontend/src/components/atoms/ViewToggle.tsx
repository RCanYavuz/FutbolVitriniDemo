/**
 * ViewToggle — Grid / List görünüm değiştirici.
 */

import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  value: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-surface-container-high rounded-lg p-0.5 border border-border-standard/60">
      <button
        type="button"
        className={`p-1.5 rounded-md transition-all ${
          value === 'grid'
            ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
            : 'text-text-muted hover:text-on-surface'
        }`}
        onClick={() => onChange('grid')}
        title="Grid görünümü"
        aria-label="Grid görünümü"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        className={`p-1.5 rounded-md transition-all ${
          value === 'list'
            ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
            : 'text-text-muted hover:text-on-surface'
        }`}
        onClick={() => onChange('list')}
        title="Liste görünümü"
        aria-label="Liste görünümü"
      >
        <List className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
