import { X, Combine } from 'lucide-react';
import { PENDING_CLASS, PENDING_HINT } from '../../lib/pending';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { useScoutingStore } from '../../store/scoutingStore';

/* Mock comparison data for Recharts */
const mockComparisonData = [
  { stat: 'Hız', player1: 85, player2: 78, fullMark: 100 },
  { stat: 'Şut', player1: 75, player2: 82, fullMark: 100 },
  { stat: 'Pas', player1: 80, player2: 88, fullMark: 100 },
  { stat: 'Savunma', player1: 45, player2: 65, fullMark: 100 },
  { stat: 'Fizik', player1: 70, player2: 80, fullMark: 100 },
  { stat: 'Teknik', player1: 88, player2: 84, fullMark: 100 },
];

export default function ComparisonDrawer() {
  const { comparisonSelection, clearComparison, drawerOpen, closeDrawer } = useScoutingStore();
  const players = useScoutingStore((s) => s.players);

  // For this phase, we're assuming the drawer displays when it's opened and there are players selected
  const isOpen = drawerOpen && comparisonSelection.length > 0;

  const selectedPlayers = comparisonSelection
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean);

  // We need at least 1 player to show something, ideally 2 for comparison
  const p1 = selectedPlayers[0] || null;
  const p2 = selectedPlayers[1] || null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-pitch-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeDrawer}
      />

      {/* Slide-in Drawer from Right */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-surface-primary border-l border-border-standard shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border-standard">
          <div className="flex items-center gap-2 text-on-surface">
            <Combine className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-bold">Oyuncu Kıyaslaması</h3>
          </div>
          <button
            className="p-1.5 rounded-lg text-text-muted hover:text-on-surface hover:bg-surface-secondary transition-colors"
            onClick={closeDrawer}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {p1 && (
            <div className="space-y-6">
              
              {/* Selected Players Tags */}
              <div className="flex flex-wrap items-center gap-4 border-b border-border-standard/50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-sm font-semibold text-on-surface">{p1.name}</span>
                </div>
                {p2 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-on-surface">{p2.name}</span>
                  </div>
                )}
              </div>

              {/* Radar Chart Overlap */}
              <div className="bg-surface-container-high/30 rounded-xl border border-border-standard/50 p-4 w-full aspect-square relative">
                <h4 className="text-xs text-text-muted font-medium mb-2 uppercase tracking-wider text-center">Yetenek Poligonu</h4>
                <ResponsiveContainer width="100%" height="90%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={mockComparisonData}>
                    <PolarGrid stroke="#2C3A47" />
                    <PolarAngleAxis 
                      dataKey="stat" 
                      tick={{ fill: '#d7e4f2', fontSize: 11, fontWeight: 500 }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#161D24', border: '1px solid #2C3A47', borderRadius: '8px' }}
                      itemStyle={{ color: '#d7e4f2', fontSize: '12px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                    
                    <Radar
                      name={p1.name}
                      dataKey="player1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />

                    {p2 && (
                      <Radar
                        name={p2.name}
                        dataKey="player2"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                    )}
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Data Table */}
              {p2 && (
                <div className="bg-surface-container rounded-xl border border-border-standard overflow-hidden">
                  <div className="grid grid-cols-3 bg-surface-secondary py-2 px-3 border-b border-border-standard text-xs font-semibold text-text-muted text-center">
                    <div>{p1.name}</div>
                    <div className="text-[10px] uppercase tracking-wider">Metrik</div>
                    <div>{p2.name}</div>
                  </div>
                  <div className="flex flex-col">
                    {[
                      { label: 'AI Puanı', v1: p1.aiScore.toFixed(1), v2: p2.aiScore.toFixed(1) },
                      { label: 'Yaş', v1: p1.age, v2: p2.age },
                      { label: 'Boy', v1: '1.82m', v2: '1.78m' }, // Mock
                      { label: 'Ayak', v1: 'Sağ', v2: 'Sol' }, // Mock
                    ].map((row, i) => (
                      <div key={i} className="grid grid-cols-3 py-2 px-3 text-sm border-b border-border-standard/30 last:border-0 hover:bg-surface-secondary/50">
                        <div className="text-center font-mono text-violet-400">{row.v1}</div>
                        <div className="text-center text-text-muted text-xs">{row.label}</div>
                        <div className="text-center font-mono text-emerald-400">{row.v2}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {!p1 && (
            <div className="h-full flex flex-col items-center justify-center text-text-muted text-center space-y-4">
              <Combine className="w-12 h-12 text-border-standard" />
              <p>Kıyaslamak için oyuncu seçin.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-border-standard bg-surface-container flex gap-3">
          <button
            className="flex-1 py-2.5 rounded-lg border border-border-standard text-text-muted hover:text-on-surface hover:bg-surface-secondary transition-colors text-sm font-semibold"
            onClick={clearComparison}
          >
            Seçimi Temizle
          </button>
          <button
            type="button"
            disabled
            title={PENDING_HINT}
            className={`flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors text-sm font-semibold shadow-[0_0_15px_rgba(124,58,237,0.4)] ${PENDING_CLASS}`}
          >
            Rapor Oluştur
          </button>
        </div>
      </div>
    </>
  );
}
