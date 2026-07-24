import { useEffect, useState } from 'react';
import FilterSidebar from '../components/scouting/FilterSidebar';
import AISmartMatches from '../components/scouting/AISmartMatches';
import PlayerGrid from '../components/scouting/PlayerGrid';
import ComparisonDrawer from '../components/scouting/ComparisonDrawer';
import { useScoutingStore } from '../store/scoutingStore';

export default function ScoutingHub() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const loadPlayers = useScoutingStore((state) => state.loadPlayers);
  const isLoadingPlayers = useScoutingStore((state) => state.isLoadingPlayers);
  const playersError = useScoutingStore((state) => state.playersError);

  useEffect(() => {
    void loadPlayers();
  }, [loadPlayers]);

  return (
    <div className="flex flex-1 overflow-hidden max-w-[1440px] mx-auto w-full relative h-full">
      {/* Desktop Sidebar */}
      <FilterSidebar className="hidden lg:flex" />

      {/* Mobile Filter Overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] z-10">
            <FilterSidebar className="flex" />
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
        <div className="flex-1 overflow-y-auto p-4 lg:p-lg">
          {playersError && (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300"
            >
              {playersError}
            </p>
          )}
          {isLoadingPlayers && (
            <p role="status" className="mb-4 text-sm text-text-muted">
              Oyuncular yükleniyor...
            </p>
          )}

          {/* Mobile filter toggle */}
          <button
            className="lg:hidden mb-4 flex items-center gap-2 bg-surface-primary border border-border-standard rounded-lg px-4 py-2 text-text-muted hover:text-on-surface transition-colors"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <span className="material-symbols-outlined text-tactical-blue">
              tune
            </span>
            Filters
          </button>

          <AISmartMatches />
          <PlayerGrid />
        </div>

        <ComparisonDrawer />
      </main>
    </div>
  );
}
