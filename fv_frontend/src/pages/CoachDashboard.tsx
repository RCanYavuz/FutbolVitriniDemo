import { useState } from 'react';
import { PENDING_CLASS, PENDING_HINT } from '../lib/pending';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const weeklyData = [
  { week: 'W1', physical: 62, tactical: 58 },
  { week: 'W2', physical: 68, tactical: 62 },
  { week: 'W3', physical: 72, tactical: 65 },
  { week: 'W4', physical: 65, tactical: 70 },
  { week: 'W5', physical: 78, tactical: 72 },
  { week: 'W6', physical: 82, tactical: 76 },
  { week: 'W7', physical: 75, tactical: 80 },
  { week: 'W8', physical: 80, tactical: 78 },
  { week: 'W9', physical: 85, tactical: 82 },
  { week: 'W10', physical: 78, tactical: 85 },
  { week: 'W11', physical: 84, tactical: 88 },
  { week: 'W12', physical: 87, tactical: 90 },
];

const pitchPositions = [
  { id: 'gk', label: 'GK', x: 200, y: 50 },
  { id: 'cb1', label: 'CB', x: 130, y: 160 },
  { id: 'cb2', label: 'CB', x: 270, y: 160 },
  { id: 'lb', label: 'LB', x: 50, y: 220 },
  { id: 'rb', label: 'RB', x: 350, y: 220 },
  { id: 'cm', label: 'CM', x: 200, y: 320 },
  { id: 'lm', label: 'LM', x: 80, y: 380 },
  { id: 'rm', label: 'RM', x: 320, y: 380 },
  { id: 'cam', label: 'CAM', x: 200, y: 420 },
  { id: 'st', label: 'ST', x: 200, y: 520 },
];

const ratingValues = [1, 3, 5, 7, 9, 10];

const targetPlayers = [
  { id: '1', label: 'K. Arslan (CM) - #08' },
  { id: '2', label: 'M. Demir (ST) - #09' },
  { id: '3', label: 'A. Yilmaz (CB) - #04' },
];

export default function CoachDashboard() {
  const [selectedPosition, setSelectedPosition] = useState('cm');
  const [technicalRating, setTechnicalRating] = useState<number | null>(7);
  const [physicalRating, setPhysicalRating] = useState<number | null>(null);
  const [mentalRating, setMentalRating] = useState<number | null>(null);

  /* ── Performans girisi formu ── */
  const [targetPlayer, setTargetPlayer] = useState('');
  const [coachNotes, setCoachNotes] = useState('');
  const [entryFeedback, setEntryFeedback] = useState<{
    type: 'error' | 'success';
    message: string;
  } | null>(null);

  const handleEntrySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!targetPlayer) {
      setEntryFeedback({ type: 'error', message: 'Once bir oyuncu seciniz.' });
      return;
    }
    if (technicalRating === null || physicalRating === null || mentalRating === null) {
      setEntryFeedback({ type: 'error', message: 'Uc puanlamayi da doldurunuz.' });
      return;
    }

    const player = targetPlayers.find((p) => p.id === targetPlayer);
    const average = ((technicalRating + physicalRating + mentalRating) / 3).toFixed(1);

    // TODO: backend hazir oldugunda POST /api/v1/evaluations cagrilacak.
    setEntryFeedback({
      type: 'success',
      message: `${player?.label} icin ortalama ${average}/10 kaydedildi (demo: sunucuya gonderilmedi).`,
    });

    setTargetPlayer('');
    setCoachNotes('');
    setTechnicalRating(null);
    setPhysicalRating(null);
    setMentalRating(null);
  };

  return (
    <main className="flex-1 max-w-[1440px] mx-auto w-full px-md lg:px-gutter py-lg grid grid-cols-1 lg:grid-cols-12 gap-lg overflow-y-auto h-full">
      {/* Header */}
      <header className="lg:col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 gap-4">
        <div>
          <h1 className="text-headline-lg text-on-surface uppercase tracking-tight mb-1">
            Squad Monitoring Workspace
          </h1>
          <p className="text-body-md text-text-muted">
            Real-time analytical performance tracking and data entry.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pitch-green" />
            <span className="text-label-sm text-text-muted uppercase">
              Physical
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-tactical-blue" />
            <span className="text-label-sm text-text-muted uppercase">
              Tactical
            </span>
          </div>
        </div>
      </header>

      {/* Performance Trends Chart */}
      <section className="lg:col-span-12 bg-surface-primary border border-border-standard rounded-lg p-lg relative">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-headline-md text-on-surface">
            Performance Trends (12 Weeks)
          </h2>
          <div className="text-right">
            <span className="block text-data-metric text-pitch-green">
              87.4%
            </span>
            <span className="text-label-sm text-text-muted uppercase">
              Peak Physical
            </span>
          </div>
        </div>
        <div className="w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid stroke="#2C3A47" strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                stroke="#919EAB"
                tick={{ fontSize: 12, fontFamily: 'Inter' }}
              />
              <YAxis
                stroke="#919EAB"
                tick={{ fontSize: 12, fontFamily: 'Inter' }}
                domain={[50, 100]}
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
                labelStyle={{ color: '#d7e4f2', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="physical"
                stroke="#00E676"
                strokeWidth={2}
                dot={{ fill: '#0B0F12', stroke: '#00E676', strokeWidth: 2, r: 4 }}
                name="Physical"
              />
              <Line
                type="monotone"
                dataKey="tactical"
                stroke="#00B0FF"
                strokeWidth={2}
                dot={{ fill: '#0B0F12', stroke: '#00B0FF', strokeWidth: 2, r: 4 }}
                name="Tactical"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Tactical Map View */}
      <section className="lg:col-span-7 bg-surface-primary border border-border-standard rounded-lg p-lg flex flex-col min-h-[480px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-headline-md text-on-surface">
            Tactical Map View
          </h2>
          <button
            type="button"
            disabled
            title={PENDING_HINT}
            className={`text-tactical-blue hover:text-secondary transition-colors text-sm font-semibold flex items-center gap-1 ${PENDING_CLASS}`}
          >
            <span className="material-symbols-outlined text-sm">
              filter_list
            </span>
            Filter Roles
          </button>
        </div>
        <div className="flex-1 bg-surface-container rounded border border-border-standard relative flex items-center justify-center p-4">
          <svg
            className="bg-[#121c22] w-full h-full"
            viewBox="0 0 400 600"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Field */}
            <rect className="pitch-lines" x="20" y="20" width="360" height="560" />
            <line className="pitch-lines" x1="20" x2="380" y1="300" y2="300" />
            <circle className="pitch-lines" cx="200" cy="300" r="50" />
            <circle cx="200" cy="300" fill="#2C3A47" r="2" />
            <rect className="pitch-lines" x="100" y="20" width="200" height="90" />
            <rect className="pitch-lines" x="100" y="490" width="200" height="90" />
            <rect className="pitch-lines" x="150" y="20" width="100" height="30" />
            <rect className="pitch-lines" x="150" y="550" width="100" height="30" />
            <circle cx="200" cy="80" fill="#2C3A47" r="2" />
            <circle cx="200" cy="520" fill="#2C3A47" r="2" />
            <path className="pitch-lines" d="M 160 110 A 50 50 0 0 0 240 110" />
            <path className="pitch-lines" d="M 160 490 A 50 50 0 0 1 240 490" />

            {/* Player Markers */}
            {pitchPositions.map((pos) => (
              <g
                key={pos.id}
                className="cursor-pointer"
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedPosition(pos.id)}
              >
                <circle
                  className={`player-marker ${
                    selectedPosition === pos.id ? 'selected' : ''
                  }`}
                  cx="0"
                  cy="0"
                  r={selectedPosition === pos.id ? 16 : 14}
                />
                <text className="marker-text" x="0" y="0">
                  {pos.label}
                </text>
                {selectedPosition === pos.id && (
                  <circle
                    cx="0"
                    cy="0"
                    r="22"
                    fill="none"
                    stroke="#00E676"
                    strokeWidth="1"
                    strokeDasharray="4"
                    opacity="0.8"
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Info Panel */}
          <div className="absolute bottom-4 left-4 bg-surface-secondary border border-border-standard p-3 rounded shadow-lg">
            <div className="text-label-sm text-pitch-green uppercase mb-1">
              Selected Focus
            </div>
            <div className="text-body-lg font-bold text-on-surface">
              {pitchPositions.find((p) => p.id === selectedPosition)?.label ||
                'CM'}{' '}
              Position
            </div>
            <div className="text-mono-data text-label-sm text-text-muted mt-1">
              Click a position to focus
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Form */}
      <section className="lg:col-span-5 bg-surface-primary border border-border-standard rounded-lg p-lg flex flex-col min-h-[480px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-headline-md text-on-surface">
            New Performance Entry
          </h2>
          <span className="material-symbols-outlined text-tactical-blue">
            analytics
          </span>
        </div>
        <form className="flex-1 flex flex-col gap-5" onSubmit={handleEntrySubmit} noValidate>
          {/* Player Select */}
          <div>
            <label
              htmlFor="target-player"
              className="block text-label-sm text-text-muted uppercase mb-2"
            >
              Target Player
            </label>
            <div className="relative">
              <select
                id="target-player"
                value={targetPlayer}
                onChange={(e) => {
                  setTargetPlayer(e.target.value);
                  setEntryFeedback(null);
                }}
                className="w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md appearance-none focus:outline-none focus:border-tactical-blue transition-colors"
              >
                <option value="">Select Player...</option>
                {targetPlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 text-text-muted pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Rating Segments */}
          <div className="space-y-4">
            {/* Technical */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-label-sm text-text-muted uppercase">
                  Technical Rating
                </label>
                <span
                  className={`text-mono-data text-label-xs ${
                    technicalRating !== null
                      ? 'text-pitch-green'
                      : 'text-text-muted'
                  }`}
                >
                  {technicalRating !== null ? `${technicalRating}/10` : '--/10'}
                </span>
              </div>
              <div className="flex rounded-lg overflow-hidden border border-border-standard">
                {ratingValues.map((v) => (
                  <button
                    key={`tech-${v}`}
                    type="button"
                    className={`flex-1 py-2 text-mono-data text-sm transition-all ${
                      technicalRating === v
                        ? 'bg-pitch-green text-pitch-black font-bold'
                        : 'bg-surface-container hover:bg-surface-secondary text-text-muted'
                    } ${v < 10 ? 'border-r border-border-standard' : ''}`}
                    onClick={() => setTechnicalRating(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Physical */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-label-sm text-text-muted uppercase">
                  Physical Intensity
                </label>
                <span
                  className={`text-mono-data text-label-xs ${
                    physicalRating !== null
                      ? 'text-pitch-green'
                      : 'text-text-muted'
                  }`}
                >
                  {physicalRating !== null ? `${physicalRating}/10` : '--/10'}
                </span>
              </div>
              <div className="flex rounded-lg overflow-hidden border border-border-standard">
                {ratingValues.map((v) => (
                  <button
                    key={`phys-${v}`}
                    type="button"
                    className={`flex-1 py-2 text-mono-data text-sm transition-all ${
                      physicalRating === v
                        ? 'bg-pitch-green text-pitch-black font-bold'
                        : 'bg-surface-container hover:bg-surface-secondary text-text-muted'
                    } ${v < 10 ? 'border-r border-border-standard' : ''}`}
                    onClick={() => setPhysicalRating(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Mental */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="text-label-sm text-text-muted uppercase">
                  Mental Sharpness
                </label>
                <span
                  className={`text-mono-data text-label-xs ${
                    mentalRating !== null
                      ? 'text-pitch-green'
                      : 'text-text-muted'
                  }`}
                >
                  {mentalRating !== null ? `${mentalRating}/10` : '--/10'}
                </span>
              </div>
              <div className="flex rounded-lg overflow-hidden border border-border-standard">
                {ratingValues.map((v) => (
                  <button
                    key={`ment-${v}`}
                    type="button"
                    className={`flex-1 py-2 text-mono-data text-sm transition-all ${
                      mentalRating === v
                        ? 'bg-pitch-green text-pitch-black font-bold'
                        : 'bg-surface-container hover:bg-surface-secondary text-text-muted'
                    } ${v < 10 ? 'border-r border-border-standard' : ''}`}
                    onClick={() => setMentalRating(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="flex-1 flex flex-col">
            <label
              htmlFor="coach-notes"
              className="block text-label-sm text-text-muted uppercase mb-2"
            >
              Coach Notes
            </label>
            <textarea
              id="coach-notes"
              value={coachNotes}
              onChange={(e) => setCoachNotes(e.target.value)}
              className="flex-1 w-full bg-surface-container border border-border-standard rounded-lg p-3 text-on-surface text-body-md focus:outline-none focus:border-tactical-blue transition-colors resize-none placeholder:text-text-muted/50 min-h-[80px]"
              placeholder="Observe transition speed in defensive phases..."
            />
          </div>

          {entryFeedback && (
            <p
              role={entryFeedback.type === 'error' ? 'alert' : 'status'}
              className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2.5 border ${
                entryFeedback.type === 'error'
                  ? 'text-accent-red bg-accent-red/10 border-accent-red/20'
                  : 'text-pitch-green bg-pitch-green/10 border-pitch-green/20'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {entryFeedback.type === 'error' ? 'error' : 'check_circle'}
              </span>
              {entryFeedback.message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-pitch-green text-pitch-black text-body-lg font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">memory</span>
            Log Entry &amp; Update AI Metrics
          </button>
        </form>
      </section>
    </main>
  );
}
