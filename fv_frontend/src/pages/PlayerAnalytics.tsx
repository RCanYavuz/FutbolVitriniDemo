import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PENDING_CLASS, PENDING_HINT } from '../lib/pending';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';

const trafficData = [
  { date: 'Oct 1', views: 12 },
  { date: 'Oct 4', views: 18 },
  { date: 'Oct 8', views: 35 },
  { date: 'Oct 11', views: 28 },
  { date: 'Oct 15', views: 55 },
  { date: 'Oct 18', views: 48 },
  { date: 'Oct 20', views: 62 },
  { date: 'Oct 22', views: 58 },
  { date: 'Oct 25', views: 72 },
  { date: 'Oct 28', views: 68 },
  { date: 'Today', views: 78 },
];

const radarDataYou = [
  { axis: 'Pace', you: 88, avg: 72 },
  { axis: 'Shooting', you: 79, avg: 68 },
  { axis: 'Passing', you: 82, avg: 70 },
  { axis: 'Physical', you: 74, avg: 75 },
  { axis: 'Dribbling', you: 91, avg: 65 },
];

const aiTips = [
  {
    icon: 'smart_display',
    title: 'Add Match Highlights',
    description:
      'Profiles with at least one recent match video receive 40% more scout engagement. Consider uploading your best moments from last weekend.',
    cta: 'UPLOAD VIDEO',
  },
];

export default function PlayerAnalytics() {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState<'7D' | '30D' | '3M'>('30D');

  return (
    // Ust gezinme AppLayout'tan geliyor; sayfa yalnizca kendi icerigini render eder.
    <div className="flex flex-1 overflow-hidden h-full">
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-[1160px] mx-auto px-4 lg:px-lg py-lg">
          <h1 className="text-headline-lg text-on-surface mb-lg">
            Your Insights Dashboard
          </h1>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg mb-lg">
            {/* Profile Views */}
            <div className="bg-surface-primary border border-border-standard rounded-xl p-5 relative overflow-hidden group hover:border-pitch-green/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-label-sm text-text-muted uppercase tracking-wider">
                  Profile Views This Week
                </span>
                <span className="material-symbols-outlined text-text-muted text-lg">visibility</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-display-lg text-on-surface">1,248</span>
                <span className="text-pitch-green text-sm font-semibold flex items-center gap-0.5 mb-2">
                  <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  14%
                </span>
              </div>
              <div className="mt-3 w-full bg-surface-secondary rounded-full h-1.5">
                <div className="bg-tactical-blue h-1.5 rounded-full" style={{ width: '72%' }} />
              </div>
            </div>

            {/* Search Appearances */}
            <div className="bg-surface-primary border border-border-standard rounded-xl p-5 relative overflow-hidden group hover:border-tactical-blue/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-label-sm text-text-muted uppercase tracking-wider">
                  Search Appearances
                </span>
                <span className="material-symbols-outlined text-text-muted text-lg">
                  manage_search
                </span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-display-lg text-on-surface">432</span>
                <span className="text-text-muted text-sm mb-2">Top 10% in Division</span>
              </div>
              <p className="text-label-xs text-text-muted mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">info</span>
                Included in 12 scout lists
              </p>
            </div>

            {/* Profile Completion */}
            <div className="bg-surface-primary border border-pitch-green/20 rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-label-sm text-text-muted uppercase tracking-wider">
                  Profile Completion
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-text-muted leading-relaxed">
                    You're almost ready to be scouted perfectly.
                  </p>
                  <button
                    onClick={() => navigate('/settings')}
                    className="text-tactical-blue text-sm font-semibold mt-2 hover:text-secondary transition-colors"
                  >
                    Complete Profile
                  </button>
                </div>
                {/* Circular progress */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke="#2C3A47"
                      strokeWidth="6"
                    />
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke="#00E676"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34 * 0.85} ${2 * Math.PI * 34 * 0.15}`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-pitch-green text-lg font-bold">
                    85%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Overview */}
          <div className="bg-surface-primary border border-border-standard rounded-xl p-6 mb-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-headline-md text-on-surface">Traffic Overview</h2>
                <p className="text-label-sm text-text-muted mt-1">
                  Profile engagement over the last 30 days
                </p>
              </div>
              <div className="flex bg-surface-secondary rounded-lg border border-border-standard p-0.5">
                {(['7D', '30D', '3M'] as const).map((period) => (
                  <button
                    key={period}
                    className={`px-3 py-1.5 rounded-md text-label-sm transition-all ${
                      timePeriod === period
                        ? 'bg-surface-primary text-on-surface shadow-sm font-semibold'
                        : 'text-text-muted hover:text-on-surface'
                    }`}
                    onClick={() => setTimePeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00B0FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00B0FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2C3A47" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    stroke="#919EAB"
                    tick={{ fontSize: 11, fontFamily: 'Inter' }}
                  />
                  <YAxis
                    stroke="#919EAB"
                    tick={{ fontSize: 11, fontFamily: 'Inter' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#212B36',
                      border: '1px solid #2C3A47',
                      borderRadius: '8px',
                      color: '#d7e4f2',
                      fontFamily: 'Inter',
                      fontSize: '13px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#00B0FF"
                    strokeWidth={2}
                    fill="url(#colorViews)"
                    dot={{ fill: '#0B0F12', stroke: '#00B0FF', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#00B0FF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row: Radar + AI Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            {/* Attribute Analysis */}
            <div className="lg:col-span-7 bg-surface-primary border border-border-standard rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-headline-md text-on-surface">Attribute Analysis</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-pitch-green" />
                    <span className="text-label-xs text-text-muted">You</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-text-muted/40 border border-text-muted/60" />
                    <span className="text-label-xs text-text-muted">League Avg</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center min-h-[280px]">
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarDataYou} cx="50%" cy="50%" outerRadius="68%">
                    <PolarGrid stroke="#2C3A47" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fill: '#d7e4f2', fontSize: 11, fontFamily: 'Inter' }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      dataKey="avg"
                      stroke="#919EAB"
                      fill="rgba(145, 158, 171, 0.1)"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                    />
                    <Radar
                      dataKey="you"
                      stroke="#00E676"
                      fill="rgba(0, 230, 118, 0.15)"
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scout AI Tips */}
            <div className="lg:col-span-5 bg-surface-primary border border-tactical-blue/20 rounded-xl p-6">
              <h2 className="text-headline-md text-on-surface flex items-center gap-2 mb-5">
                <span
                  className="material-symbols-outlined text-tactical-blue"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                Scout AI Tips
              </h2>
              <div className="space-y-5">
                {aiTips.map((tip, i) => (
                  <div
                    key={i}
                    className="bg-surface-secondary border border-border-standard rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-tactical-blue mt-0.5">
                        {tip.icon}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-on-surface mb-1">{tip.title}</h4>
                        <p className="text-label-sm text-text-muted leading-relaxed mb-3">
                          {tip.description}
                        </p>
                        <button
                          type="button"
                          disabled
                          title={PENDING_HINT}
                          className={`text-pitch-green text-label-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity ${PENDING_CLASS}`}
                        >
                          {tip.cta}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
