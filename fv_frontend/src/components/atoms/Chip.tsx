/**
 * Chip — Trend aramaları ve quick-filter toggle'ları için.
 */

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export default function Chip({
  label,
  active = false,
  onClick,
  icon,
  className = '',
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
        border transition-all duration-200 cursor-pointer select-none
        ${
          active
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.12)]'
            : 'bg-surface-container-high/50 border-border-standard/60 text-text-muted hover:text-on-surface hover:border-surface-bright hover:bg-surface-container-high'
        }
        ${className}
      `}
    >
      {icon && <span className="w-3.5 h-3.5 flex-shrink-0">{icon}</span>}
      {label}
    </button>
  );
}
