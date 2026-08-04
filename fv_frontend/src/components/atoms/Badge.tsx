/**
 * Badge — Pozisyon, statü ve etiket gösterimi için tekrar kullanılabilir badge.
 */

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gk' | 'df' | 'mf' | 'fw' | 'default' | 'gold';
  size?: 'sm' | 'md';
  className?: string;
}

const VARIANT_STYLES: Record<string, string> = {
  gk: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  df: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  mf: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  fw: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  default: 'bg-surface-container-high text-text-muted border-border-standard',
  gold: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
};

const SIZE_STYLES: Record<string, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-bold uppercase border rounded
        ${VARIANT_STYLES[variant] || VARIANT_STYLES.default}
        ${SIZE_STYLES[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

