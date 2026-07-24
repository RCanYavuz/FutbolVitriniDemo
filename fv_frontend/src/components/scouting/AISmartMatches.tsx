import { useScoutingStore } from '../../store/scoutingStore';

export default function AISmartMatches() {
  const players = useScoutingStore((s) => s.players);
  const aiMatches = players.filter((p) => p.matchPercentage);

  if (aiMatches.length === 0) return null;

  return (
    <section className="mb-lg">
      <h3 className="text-headline-md text-on-surface mb-md flex items-center gap-2">
        <span
          className="material-symbols-outlined text-tactical-blue"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          bolt
        </span>
        AI Smart Matches
      </h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {aiMatches.map((player) => (
          <div
            key={player.id}
            className="min-w-[300px] md:min-w-[400px] bg-surface-primary border border-tactical-blue/30 rounded-xl p-4 flex gap-4 snap-start ai-glow relative overflow-hidden"
          >
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-tactical-blue/10 rounded-bl-full -z-0" />

            <img
              className="w-20 h-20 rounded-lg object-cover z-10 border border-border-standard flex-shrink-0"
              src={player.imageUrl}
              alt={player.name}
            />
            <div className="flex-1 z-10 min-w-0">
              <div className="flex justify-between items-start mb-1 gap-2">
                <h4 className="text-body-lg font-bold text-on-surface truncate">
                  {player.name}
                </h4>
                <span className="bg-tactical-blue/20 text-tactical-blue text-label-xs px-2 py-1 rounded border border-tactical-blue/50 whitespace-nowrap flex-shrink-0">
                  {player.matchPercentage}% MATCH
                </span>
              </div>
              <p className="text-text-muted text-label-sm mb-2">
                {player.position} • {player.age}y • {player.team}
              </p>
              <p className="text-on-surface text-sm leading-relaxed line-clamp-2">
                {player.aiReasoning}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
