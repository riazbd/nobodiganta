export function GroupedBarChart({ data1, data2, labels, color1 = '#263238', color2 = '#3b82f6', height = 180 }) {
  if (!data1 || data1.length === 0) return null;
  const allValues = [...data1, ...(data2 || [])];
  const maxVal = Math.max(...allValues) || 1;
  const chartHeight = height - 40;

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ paddingBottom: '20px' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <div key={i} className="flex items-center w-full">
            <div className="w-full border-t border-dashed border-[#f0f0f0]" />
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="relative flex gap-1 items-end h-full" style={{ paddingBottom: '20px' }}>
        {data1.map((val, i) => {
          const h1 = (val / maxVal) * chartHeight;
          const h2 = data2 ? ((data2[i] || 0) / maxVal) * chartHeight : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end group">
              <div className="flex gap-[3px] items-end w-full" style={{ height: `${chartHeight}px` }}>
                {/* Bar 1 */}
                <div className="relative flex-1 rounded-t-md cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-y-[1.02]"
                  style={{
                    height: `${Math.max(h1, 2)}px`,
                    background: `linear-gradient(180deg, ${color1} 0%, ${color1}dd 100%)`,
                    boxShadow: `0 -2px 8px ${color1}30`,
                  }}
                  title={`${labels?.[i] || ''}: ${val}`}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[var(--text-muted,#9ca3af)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {val}
                  </div>
                </div>
                {/* Bar 2 */}
                {data2 && (
                  <div className="relative flex-1 rounded-t-md cursor-pointer transition-all duration-200 hover:opacity-90 hover:scale-y-[1.02]"
                    style={{
                      height: `${Math.max(h2, 2)}px`,
                      background: `linear-gradient(180deg, ${color2} 0%, ${color2}dd 100%)`,
                      boxShadow: `0 -2px 8px ${color2}30`,
                    }}
                    title={`${labels?.[i] || ''}: ${data2[i] || 0}`}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[var(--text-muted,#9ca3af)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data2[i] || 0}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
