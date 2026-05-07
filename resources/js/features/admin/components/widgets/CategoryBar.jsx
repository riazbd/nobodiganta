export function CategoryBar({ items = [], lang = 'bn' }) {
  const colorMap = {
    red: '#263238', blue: '#3b82f6', green: '#10b981', orange: '#f59e0b',
    purple: '#8b5cf6', cyan: '#06b6d4', amber: '#f59e0b',
  };

  return (
    <div className="space-y-3.25">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="text-[12.5px] font-medium text-[var(--text-secondary,#6b7280)] w-24 flex-shrink-0">{lang === 'bn' ? item.name : (item.nameEn || item.name)}</span>
          <div className="flex-1 h-1.75 bg-[#f3f4f6] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.pct}%`, backgroundColor: colorMap[item.color] || '#263238' }} />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary,#1a1d2e)] font-['Inter'] w-8 text-right">{item.pct}%</span>
          <span className="text-[11px] text-[var(--text-muted,#9ca3af)] w-14 text-right">{item.count}{lang === 'bn' ? 'টি' : ''}</span>
        </div>
      ))}
    </div>
  );
}
