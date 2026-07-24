import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useScoutingStore } from '../store/scoutingStore';
import { mockPlayers } from '../store/mockData';
import { PENDING_HINT, PENDING_CLASS } from '../lib/pending';

const followedUpdates = [
  {
    id: '1',
    player: 'Kerem Yılmaz',
    action: '2 gol attı',
    match: 'Fenerbahçe U-19 vs Galatasaray U-19',
    time: '2 saat önce',
    imageUrl: mockPlayers[10]?.imageUrl || mockPlayers[0].imageUrl,
  },
  {
    id: '2',
    player: 'Liam Davies',
    action: 'maçın adamı seçildi',
    match: 'Swansea City U-21 vs Cardiff U-21',
    time: 'Dün',
    imageUrl: mockPlayers[1].imageUrl,
  },
];

const trendingSearches = [
  'İstanbul\'da U-19 Sol Kanat',
  'Sözleşmesi 2025\'te Bitecek Stoperler',
  'Yüksek xG\'li U-21 Forvetler',
];

const upcomingMatches = [
  { month: 'EKİ', day: 24, title: 'U-19 Derbisi', desc: 'Gözlemde: 3 Oyuncu' },
  { month: 'EKİ', day: 28, title: 'Bölgesel Kupa Finali', desc: 'Hedef: Defansif Orta Sahalar' },
];

export default function GlobalDashboard() {
  const [dismissed, setDismissed] = useState(false);
  const user = useAuthStore((s) => s.user);
  const setSearchQuery = useScoutingStore((s) => s.setSearchQuery);
  const navigate = useNavigate();
  const aiDiscovery = mockPlayers.find((p) => p.matchPercentage && p.matchPercentage >= 88) || mockPlayers[0];

  const goToSearch = (query?: string) => {
    if (query) setSearchQuery(query);
    navigate('/club/search');
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[1160px] mx-auto px-4 lg:px-lg py-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            {/* Welcome Banner */}
            <div className="lg:col-span-12 bg-surface-primary border border-pitch-green/20 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-pitch-green/5 blur-[80px] rounded-full pointer-events-none" />
              <h1 className="text-headline-lg text-on-surface relative z-10">
                Tekrar hoş geldin, {user?.name ?? 'Scout'}
              </h1>
              <p className="text-body-md text-pitch-green flex items-center gap-2 mt-2 relative z-10">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                Kayıtlı listelerinde 3 yeni eşleşme var
              </p>
            </div>

            {/* AI Weekly Discovery + Followed Updates */}
            <div className="lg:col-span-8 space-y-lg">
              {/* AI Weekly Discovery */}
              {!dismissed && (
                <div className="bg-surface-primary border border-tactical-blue/20 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <h2 className="text-headline-md text-tactical-blue">
                      AI Haftalık Keşif
                    </h2>
                    <span className="bg-surface-secondary text-text-muted text-label-xs px-3 py-1 rounded-full border border-border-standard uppercase tracking-wider">
                      Yüksek Potansiyel
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 px-6 pb-6">
                    <div className="w-full sm:w-40 h-40 rounded-lg bg-surface-secondary border border-border-standard flex-shrink-0 overflow-hidden">
                      <img
                        src={aiDiscovery.imageUrl}
                        alt={aiDiscovery.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-headline-md text-on-surface mb-1">
                        {aiDiscovery.name}
                      </h3>
                      <p className="text-body-md text-text-muted mb-4">
                        {aiDiscovery.age} yaş • {aiDiscovery.position === 'FW' ? 'Forvet' : aiDiscovery.position === 'MF' ? 'Orta Saha' : aiDiscovery.position === 'DF' ? 'Defans' : 'Kaleci'} • {aiDiscovery.team}
                      </p>
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                          { label: 'PACE', value: aiDiscovery.stats.pace },
                          { label: 'DRIBBLING', value: aiDiscovery.stats.dribbling },
                          { label: 'VISION', value: aiDiscovery.stats.vision },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className="bg-surface-secondary border border-border-standard rounded-lg p-3"
                          >
                            <div className="text-label-xs text-text-muted uppercase mb-1">
                              {s.label}
                            </div>
                            <div className="text-data-metric text-pitch-green">
                              {s.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setDismissed(true)}
                          className="px-5 py-2 bg-surface-secondary border border-border-standard rounded-lg text-sm text-text-muted hover:text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                          Kapat
                        </button>
                        <button
                          disabled
                          title={PENDING_HINT}
                          className={`px-5 py-2 bg-tactical-blue/10 border border-tactical-blue/30 rounded-lg text-sm text-tactical-blue hover:bg-tactical-blue/20 transition-colors font-medium ${PENDING_CLASS}`}
                        >
                          Kısa Listeye Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Followed Player Updates */}
              <div className="bg-surface-primary border border-border-standard rounded-xl p-6">
                <h2 className="text-headline-md text-on-surface flex items-center gap-2 mb-5">
                  <span className="material-symbols-outlined text-pitch-green">autorenew</span>
                  Takip Edilen Oyuncu Güncellemeleri
                </h2>
                <div className="space-y-4">
                  {followedUpdates.map((update) => (
                    <div
                      key={update.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-secondary transition-colors"
                    >
                      <img
                        src={update.imageUrl}
                        alt={update.player}
                        className="w-10 h-10 rounded-full object-cover border border-border-standard flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-on-surface">
                          <span className="text-pitch-green font-semibold">{update.player}</span>{' '}
                          {update.action}
                        </p>
                        <p className="text-label-xs text-text-muted mt-0.5">
                          {update.match} • {update.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar Widgets */}
            <div className="lg:col-span-4 space-y-lg">
              {/* Quick Actions */}
              <div className="bg-surface-primary border border-border-standard rounded-xl p-6">
                <h3 className="text-headline-md text-on-surface mb-4">Hızlı İşlemler</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled
                    title={PENDING_HINT}
                    className={`bg-surface-secondary border border-border-standard rounded-lg p-4 flex flex-col items-center gap-2 hover:border-pitch-green/50 hover:bg-surface-container-high transition-all group ${PENDING_CLASS}`}
                  >
                    <span className="material-symbols-outlined text-pitch-green text-2xl group-hover:scale-110 transition-transform">
                      add_circle
                    </span>
                    <span className="text-label-sm text-text-muted group-hover:text-on-surface transition-colors">
                      Yeni Rapor
                    </span>
                  </button>
                  <button
                    onClick={() => goToSearch()}
                    className="bg-surface-secondary border border-border-standard rounded-lg p-4 flex flex-col items-center gap-2 hover:border-tactical-blue/50 hover:bg-surface-container-high transition-all group"
                  >
                    <span className="material-symbols-outlined text-tactical-blue text-2xl group-hover:scale-110 transition-transform">
                      filter_list
                    </span>
                    <span className="text-label-sm text-text-muted group-hover:text-on-surface transition-colors">
                      Keşif Paneline Git
                    </span>
                  </button>
                </div>
              </div>

              {/* Trending Searches */}
              <div className="bg-surface-primary border border-border-standard rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-headline-md text-on-surface">Popüler Aramalar</h3>
                  <span className="material-symbols-outlined text-text-muted">trending_up</span>
                </div>
                <div className="space-y-3">
                  {trendingSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => goToSearch(search)}
                      className="block w-full text-left text-sm text-on-surface hover:text-pitch-green py-2 border-b border-border-standard last:border-0 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upcoming Matches */}
              <div className="bg-surface-primary border border-border-standard rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-headline-md text-on-surface">Yaklaşan Maçlar</h3>
                  <span className="material-symbols-outlined text-text-muted">calendar_today</span>
                </div>
                <div className="space-y-4">
                  {upcomingMatches.map((match, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className="flex-shrink-0 flex flex-col items-center border-l-2 border-tactical-blue pl-3">
                        <span className="text-label-xs text-tactical-blue uppercase">{match.month}</span>
                        <span className="text-data-metric text-on-surface">{match.day}</span>
                      </div>
                      <div>
                        <p className="text-sm text-on-surface font-semibold">{match.title}</p>
                        <p className="text-label-xs text-text-muted">{match.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
