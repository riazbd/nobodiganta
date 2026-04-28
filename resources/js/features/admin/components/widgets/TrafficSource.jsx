export function TrafficSource({ items = [], lang = 'bn' }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: item.color + '15' }}>
            <span className="text-sm">{item.icon === 'Facebook' ? '🔵' : item.icon === 'Search' ? '🔍' : item.icon === 'Globe' ? '🌐' : item.icon === 'Smartphone' ? '📱' : item.icon === 'Twitter' ? '🐦' : '🔗'}</span>
          </div>
          <div className="flex-1">
            <div className="text-[12.5px] font-semibold text-[var(--text-primary,#1a1d2e)]">{lang === 'bn' ? item.name : (item.nameEn || item.name)}</div>
            <div className="h-1.25 bg-[#f3f4f6] rounded-full overflow-hidden mt-1">
              <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
            </div>
          </div>
          <span className="text-xs font-bold text-[var(--text-primary,#1a1d2e)] font-['Inter']">{item.pct}%</span>
        </div>
      ))}
      <div className="mt-3.5 pt-3 border-t border-[#f3f4f6]">
        <div className="text-xs text-[var(--text-muted,#9ca3af)] mb-2">{lang === 'bn' ? 'ডিভাইস বিভাজন' : 'Device Breakdown'}</div>
        <div className="flex rounded overflow-hidden h-5">
          <div className="flex-[62] bg-[#e8001e] flex items-center justify-center text-[10px] text-white font-bold">{lang === 'bn' ? 'মোবাইল ৬২%' : 'Mobile 62%'}</div>
          <div className="flex-[25] bg-[#3b82f6] flex items-center justify-center text-[10px] text-white font-bold">{lang === 'bn' ? 'ডেস্কটপ ২৫%' : 'Desktop 25%'}</div>
          <div className="flex-[13] bg-[#f59e0b] flex items-center justify-center text-[10px] text-white font-bold">{lang === 'bn' ? 'ট্যাব ১৩%' : 'Tablet 13%'}</div>
        </div>
      </div>
    </div>
  );
}
