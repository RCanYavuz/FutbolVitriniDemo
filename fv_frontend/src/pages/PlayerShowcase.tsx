import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

/* FM Style Coloring Function */
function getFMColorClass(value: number): string {
  if (value >= 16) return 'text-emerald-400 font-bold';
  if (value >= 11) return 'text-yellow-400 font-semibold';
  if (value >= 6) return 'text-orange-500 font-medium';
  return 'text-red-500';
}

const mockPlayer = {
  name: 'Kerem Yılmaz',
  position: 'Sol Kanat / Forvet',
  age: 21,
  nationality: 'Türkiye',
  club: 'Fenerbahçe U19',
  avatarUrl: 'https://ui-avatars.com/api/?name=Kerem+Yilmaz&background=7c3aed&color=fff&size=200',
  
  physical: [
    { label: 'Hızlanma', value: 16 },
    { label: 'Çeviklik', value: 15 },
    { label: 'Denge', value: 12 },
    { label: 'Sıçrama', value: 10 },
    { label: 'Doğal Kondisyon', value: 14 },
    { label: 'Hız', value: 17 },
    { label: 'Dayanıklılık', value: 13 },
    { label: 'Güç', value: 11 },
  ],
  
  mental: [
    { label: 'Agresiflik', value: 11 },
    { label: 'Sezgi', value: 13 },
    { label: 'Cesaret', value: 12 },
    { label: 'Soğukkanlılık', value: 14 },
    { label: 'Konsantrasyon', value: 12 },
    { label: 'Karar Verme', value: 13 },
    { label: 'Kararlılık', value: 16 },
    { label: 'Yaratıcılık', value: 15 },
    { label: 'Liderlik', value: 8 },
    { label: 'Topsuz Oyun', value: 14 },
    { label: 'Pozisyon Alma', value: 11 },
    { label: 'Takım Oyunu', value: 12 },
    { label: 'Vizyon', value: 13 },
    { label: 'Çalışma Oranı', value: 14 },
  ],

  technical: [
    { label: 'Bitiricilik', value: 15 },
    { label: 'İlk Dokunuş', value: 14 },
    { label: 'Pas', value: 13 },
    { label: 'Orta', value: 12 },
    { label: 'Çalım', value: 16 },
    { label: 'Kafa Vuruşu', value: 9 },
    { label: 'Uzak Şut', value: 13 },
    { label: 'Adam Markajı', value: 7 },
    { label: 'Müdahale', value: 8 },
    { label: 'Teknik', value: 15 },
  ],

  radarData: [
    { subject: 'Hız', A: 85, fullMark: 100 },
    { subject: 'Şut', A: 78, fullMark: 100 },
    { subject: 'Pas', A: 75, fullMark: 100 },
    { subject: 'Savunma', A: 45, fullMark: 100 },
    { subject: 'Fizik', A: 68, fullMark: 100 },
  ],
};

const StatRow = ({ label, value }: { label: string; value: number }) => (
  <div className="flex justify-between items-center py-1.5 border-b border-border-standard/30 last:border-0 hover:bg-surface-secondary/50 px-2 rounded transition-colors">
    <span className="text-sm text-text-muted">{label}</span>
    <span className={`text-sm tabular-nums ${getFMColorClass(value)}`}>
      {value}
    </span>
  </div>
);

export default function PlayerShowcase() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-pitch-black p-4 lg:p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-surface-primary rounded-2xl border border-border-standard p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
          
          <img 
            src={mockPlayer.avatarUrl} 
            alt={mockPlayer.name}
            className="w-24 h-24 rounded-full border-2 border-violet-500/50 shadow-[0_0_15px_rgba(124,58,237,0.3)] z-10"
          />
          <div className="text-center md:text-left z-10">
            <h1 className="text-3xl font-bold text-on-surface mb-1">{mockPlayer.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm">
              <span className="text-violet-300 font-medium px-2 py-0.5 bg-violet-500/10 rounded border border-violet-500/20">
                {mockPlayer.position}
              </span>
              <span className="text-text-muted">{mockPlayer.club}</span>
              <span className="text-text-muted">{mockPlayer.age} Yaş</span>
              <span className="text-text-muted">{mockPlayer.nationality}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* RADAR CHART PANEL (Left-most, spans 1) */}
          <div className="bg-surface-primary border border-border-standard rounded-2xl p-6 flex flex-col shadow-lg">
            <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-violet-500 rounded-full" />
              Genel Profil
            </h3>
            <div className="w-full aspect-square relative bg-surface-container-high/30 rounded-xl overflow-hidden border border-border-standard/50">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockPlayer.radarData}>
                  <PolarGrid stroke="#2C3A47" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#919EAB', fontSize: 12, fontWeight: 500 }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name={mockPlayer.name}
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ATTRIBUTES 3 COLUMNS (Spans 3) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* FİZİKSEL */}
            <div className="bg-surface-primary border border-border-standard rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-border-standard pb-3">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                Fiziksel
              </h3>
              <div className="flex flex-col">
                {mockPlayer.physical.map(stat => (
                  <StatRow key={stat.label} label={stat.label} value={stat.value} />
                ))}
              </div>
            </div>

            {/* ZİHİNSEL */}
            <div className="bg-surface-primary border border-border-standard rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-border-standard pb-3">
                <span className="w-1.5 h-5 bg-tactical-blue rounded-full" />
                Zihinsel
              </h3>
              <div className="flex flex-col">
                {mockPlayer.mental.map(stat => (
                  <StatRow key={stat.label} label={stat.label} value={stat.value} />
                ))}
              </div>
            </div>

            {/* TEKNİK */}
            <div className="bg-surface-primary border border-border-standard rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-border-standard pb-3">
                <span className="w-1.5 h-5 bg-orange-500 rounded-full" />
                Teknik
              </h3>
              <div className="flex flex-col">
                {mockPlayer.technical.map(stat => (
                  <StatRow key={stat.label} label={stat.label} value={stat.value} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
