export function ReporterCard({ reporters = [], lang = 'bn' }) {
  const avBgColors = ['bg-[#fff0f2]', 'bg-[#eff6ff]', 'bg-[#ecfdf5]', 'bg-[#f5f3ff]', 'bg-[#fef9ee]'];
  const perfColors = { high: 'text-[#10b981]', medium: 'text-[#f59e0b]', low: 'text-[#e8001e]' };
  const icons = ['✍️', '📡', '⚽', '💹', '💻', '🏏', '🎭', '📰'];

  return (
    <div className="space-y-0">
      {reporters.map((r, i) => (
        <div key={r.id} className="flex items-center gap-3 py-2.25 border-b border-[#f3f4f6] last:border-0">
          <div className={`w-9 h-9 rounded-lg ${avBgColors[i % avBgColors.length]} flex items-center justify-center flex-shrink-0 text-lg`}>
            {icons[i % icons.length]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[var(--text-primary,#1a1d2e)]">{r.name}</div>
            <div className="text-[11px] text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? r.specialization : (r.specializationEn || r.specialization)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-[var(--text-primary,#1a1d2e)] font-['Inter']">{r.articles}</div>
            <div className="text-[10.5px] text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'সংবাদ' : 'News'}</div>
          </div>
          <div className="ml-2">
            <div className={`text-[11px] font-semibold ${r.performance >= 90 ? 'text-[#10b981]' : r.performance >= 80 ? 'text-[#f59e0b]' : 'text-[#e8001e]'}`}>
              ▲ {r.performance}%
            </div>
            <div className="text-[10px] text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'পারফরম্যান্স' : 'Performance'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
