/**
 * HomePage — Futbol Vitrini anasayfa.
 *
 * Sahibinden.com marketplace UX/UI felsefesini temel alan,
 * herkese açık oyuncu vitrini sayfası.
 *
 * Bileşen hiyerarşisi:
 * - HeroSearch (arama + trendler)
 * - MarketplaceLayout
 *   - HomeFilterSidebar (sol panel)
 *   - ShowcaseGrid (ana içerik)
 */

import { useFilterParams } from '../lib/hooks/useFilterParams';
import { usePlayersQuery } from '../lib/hooks/usePlayersQuery';
import TopNavBar from '../components/layout/TopNavBar';
import HeroSearch from '../components/organisms/HeroSearch';
import HomeFilterSidebar from '../components/organisms/HomeFilterSidebar';
import ShowcaseGrid from '../components/organisms/ShowcaseGrid';
import MarketplaceLayout from '../components/templates/MarketplaceLayout';

/* ═══════════════════════════════════════════════════════════════════
   ERROR BOUNDARY FALLBACK
   ═══════════════════════════════════════════════════════════════════ */

function ErrorFallback({ error }: { error: string | null }) {
  return (
    <div className="min-h-screen bg-pitch-black flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-headline-md text-on-surface mb-2">Bir şeyler yanlış gitti</h2>
        <p className="text-text-muted text-sm mb-6">
          {error || 'Sayfa yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-pitch-black font-bold text-sm rounded-xl transition-colors"
        >
          Sayfayı Yenile
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function HomePage() {
  const {
    filters,
    setFilter,
    setFilters,
    togglePosition,
    resetFilters,
    activeCount,
  } = useFilterParams();

  const {
    players,
    allPlayers,
    total,
    isLoading,
    error,
  } = usePlayersQuery(filters);

  // Fatal error — show fallback
  if (error && players.length === 0) {
    return <ErrorFallback error={error} />;
  }

  return (
    <div className="h-screen bg-pitch-black flex flex-col overflow-y-auto scroll-smooth">
      {/* ── Top Navigation Bar ── */}
      <TopNavBar />

      {/* ── Hero Section ── */}
      <HeroSearch
        filters={filters}
        onSearch={setFilters}
        totalPlayers={allPlayers.length}
      />

      {/* ── Main Content (Sidebar + Grid) ── */}
      <div className="h-screen flex-shrink-0">
        <MarketplaceLayout
          filterCount={activeCount}
          sidebar={
            <HomeFilterSidebar
              filters={filters}
              activeCount={activeCount}
              onFilterChange={setFilter}
              onTogglePosition={togglePosition}
              onReset={resetFilters}
            />
          }
        >
          <ShowcaseGrid
            players={players}
            allPlayers={allPlayers}
            total={total}
            isLoading={isLoading}
            filters={filters}
            onFilterChange={setFilter}
          />
        </MarketplaceLayout>
      </div>
    </div>
  );
}
