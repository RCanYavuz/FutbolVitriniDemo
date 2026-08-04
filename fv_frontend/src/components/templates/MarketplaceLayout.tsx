/**
 * MarketplaceLayout — Sahibinden tarzı 2-sütunlu layout template.
 *
 * - Sol: FilterSidebar (320px, sticky, scrollable)
 * - Sağ: Ana içerik alanı (flex-1)
 * - Mobilde: Sidebar drawer olarak açılır
 */

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface MarketplaceLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  /** Sidebar'daki aktif filtre sayısı (mobil badge) */
  filterCount?: number;
}

export default function MarketplaceLayout({
  sidebar,
  children,
  filterCount = 0,
}: MarketplaceLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full">

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:block w-[320px] flex-shrink-0 h-full overflow-y-auto sidebar-scrollable">
        {sidebar}
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] z-50 lg:hidden animate-slide-in-left overflow-y-auto">
            {sidebar}
          </div>
        </>
      )}

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* ── Mobile Filter FAB ── */}
      <button
        type="button"
        className="fixed bottom-6 right-6 z-30 lg:hidden flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-pitch-black font-bold text-sm px-4 py-3 rounded-full shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
        onClick={() => setMobileOpen(true)}
        aria-label="Filtreleri aç"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtreler
        {filterCount > 0 && (
          <span className="bg-pitch-black/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {filterCount}
          </span>
        )}
      </button>
    </div>
  );
}
