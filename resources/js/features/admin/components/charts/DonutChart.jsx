export function DonutChart({ segments, centerValue, centerLabel }) {
  const radius = 50;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-[130px] h-[130px] flex-shrink-0">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
          {segments.map((seg, i) => {
            const dashLength = (seg.pct / 100) * circumference;
            const dashOffset = -offset;
            offset += dashLength;
            return (
              <circle
                key={i}
                cx="65" cy="65" r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform="rotate(-90 65 65)"
              />
            );
          })}
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] leading-none font-['Inter']">{centerValue}</div>
          <div className="text-[9.5px] text-[var(--text-muted,#9ca3af)]">{centerLabel}</div>
        </div>
      </div>
      <div className="flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 mb-2.25 last:mb-0">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs text-[var(--text-secondary,#6b7280)] flex-1">{seg.name}</span>
            <span className="text-xs font-bold text-[var(--text-primary,#1a1d2e)] font-['Inter']">{seg.value}</span>
            <span className="text-[11px] text-[var(--text-muted,#9ca3af)]">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
