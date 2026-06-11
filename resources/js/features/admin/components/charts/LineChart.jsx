import {
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

/**
 * Beautiful line chart with smooth curves, animations, and polished styling.
 */
export function LineChart({
  data, data2, labels,
  color = '#263238', color2 = '#3b82f6',
  height = 260,
  label1 = 'Pageviews', label2 = 'Visitors',
}) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((v, i) => ({
    name: labels?.[i] || '',
    [label1]: v,
    ...(data2 ? { [label2]: data2[i] } : {}),
  }));

  const fmt = (v) => {
    if (v >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1a1d2e 0%, #2a2d3e 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(10px)',
        minWidth: '180px',
      }}>
        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
          {payload[0].payload.name}
        </div>
        {payload.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: i > 0 ? '4px' : 0 }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: entry.stroke,
              boxShadow: `0 0 8px ${entry.stroke}60`,
            }} />
            <span style={{ color: '#9ca3af', fontSize: '12px', flex: 1 }}>{entry.name}</span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: '13px', fontFamily: "'SolaimanLipi', sans-serif" }}>
              {entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const CustomDot = ({ cx, cy, stroke, payload, dataKey }) => {
    if (!cx || !cy) return null;
    const isActive = dataKey === label1;
    return (
      <g>
        <circle cx={cx} cy={cy} r="12" fill={stroke} opacity="0.1" />
        <circle cx={cx} cy={cy} r="4" fill="#fff" stroke={stroke} strokeWidth="2.5" />
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLineChart data={chartData} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />

        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: "'SolaimanLipi', sans-serif", fontWeight: 500 }}
          dy={8}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: "'SolaimanLipi', sans-serif", fontWeight: 500 }}
          tickFormatter={fmt}
          dx={-4}
          width={48}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }} />

        <Legend
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: '12px', paddingTop: '12px', fontWeight: 500 }}
        />

        {data2 && (
          <Line
            type="monotone"
            dataKey={label2}
            stroke={color2}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#fff', stroke: color2, strokeWidth: 3, filter: 'url(#glow)' }}
            animationDuration={1200}
            animationBegin={200}
          />
        )}

        <Line
          type="monotone"
          dataKey={label1}
          stroke={color}
          strokeWidth={3}
          dot={<CustomDot />}
          activeDot={{ r: 7, fill: '#fff', stroke: color, strokeWidth: 3, filter: 'url(#glow)' }}
          animationDuration={1000}
          animationBegin={0}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}
