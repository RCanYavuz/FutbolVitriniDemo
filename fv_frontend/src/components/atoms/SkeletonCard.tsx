/**
 * SkeletonCard — Yükleniyor durumunda gösterilen oyuncu kartı iskeleti.
 */

interface SkeletonCardProps {
  featured?: boolean;
}

export default function SkeletonCard({ featured = false }: SkeletonCardProps) {
  return (
    <div
      className={`
        bg-surface-primary border rounded-xl overflow-hidden animate-pulse
        ${featured ? 'border-amber-500/20' : 'border-border-standard'}
      `}
    >
      {/* Avatar & Header */}
      <div className="p-4 pb-3 flex items-start gap-3.5">
        <div className="w-14 h-14 rounded-xl bg-surface-container-high flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-surface-container-high rounded" />
          <div className="h-3 w-1/2 bg-surface-container-high rounded" />
          <div className="h-3 w-2/3 bg-surface-container-high rounded" />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-3 space-y-2">
        <div className="h-2 w-full bg-surface-container-high rounded" />
        <div className="h-2 w-4/5 bg-surface-container-high rounded" />
        <div className="h-2 w-3/5 bg-surface-container-high rounded" />
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-standard/60 px-4 py-2.5 flex justify-between">
        <div className="h-3 w-16 bg-surface-container-high rounded" />
        <div className="h-3 w-12 bg-surface-container-high rounded" />
      </div>
    </div>
  );
}
