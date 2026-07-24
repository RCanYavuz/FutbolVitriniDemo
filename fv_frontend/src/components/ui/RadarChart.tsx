

interface RadarData {
  label: string;
  value: number; // 1-20 scale
}

interface RadarChartProps {
  data: RadarData[];
  size?: number;
}

export default function RadarChart({ data, size = 300 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.75; // Leave room for labels
  const maxValue = 20;

  // Calculate polygon points based on data
  const calculatePoints = (scale: number) => {
    return data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
      // scale is the multiplier (1.0 for outer ring, or item.value / maxValue for the data polygon)
      const valueRadius = radius * scale;
      const x = center + valueRadius * Math.cos(angle);
      const y = center + valueRadius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Generate background spider web rings (e.g., 5 rings for 4, 8, 12, 16, 20)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  const dataPoints = data.map((item, i) => {
    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    const valueRadius = radius * (item.value / maxValue);
    return {
      x: center + valueRadius * Math.cos(angle),
      y: center + valueRadius * Math.sin(angle),
    };
  });
  const dataPolygonStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative flex items-center justify-center w-full aspect-square max-w-sm mx-auto">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background Rings */}
        {rings.map((ringScale, idx) => (
          <polygon
            key={idx}
            points={calculatePoints(ringScale)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border-standard opacity-50"
          />
        ))}

        {/* Spokes (Lines from center to outer ring) */}
        {data.map((_, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={`line-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border-standard opacity-50"
            />
          );
        })}

        {/* The Data Polygon */}
        <polygon
          points={dataPolygonStr}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="3"
          className="text-pitch-green fill-pitch-green/20"
        />

        {/* Data Points (Dots on the polygon) */}
        {dataPoints.map((p, i) => (
          <circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="currentColor"
            className="text-pitch-green"
          />
        ))}

        {/* Labels */}
        {data.map((item, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
          // Push labels a bit further out than the max radius
          const labelRadius = radius * 1.25;
          const x = center + labelRadius * Math.cos(angle);
          const y = center + labelRadius * Math.sin(angle);
          
          // Adjust text anchoring based on position
          let textAnchor: 'start' | 'middle' | 'end' = "middle";
          if (x < center - 10) textAnchor = "end";
          else if (x > center + 10) textAnchor = "start";

          return (
            <text
              key={`label-${i}`}
              x={x}
              y={y}
              fill="currentColor"
              fontSize="12"
              fontWeight="600"
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="text-on-surface"
            >
              {item.label}
              <tspan x={x} dy="16" fontSize="14" fill="currentColor" className="text-pitch-green font-bold">
                {item.value}
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}
