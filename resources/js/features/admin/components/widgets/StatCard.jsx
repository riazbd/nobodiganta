export function StatCard({ icon: Icon, label, value, change, changeUp, linkText, onLinkClick, color = 'red' }) {
  const colorMap = {
    red: { icon: 'bg-[#fff0f2]', text: 'text-[#e8001e]' },
    blue: { icon: 'bg-[#eff6ff]', text: 'text-[#3b82f6]' },
    green: { icon: 'bg-[#ecfdf5]', text: 'text-[#10b981]' },
    orange: { icon: 'bg-[#fffbeb]', text: 'text-[#f59e0b]' },
    purple: { icon: 'bg-[#f5f3ff]', text: 'text-[#8b5cf6]' },
    cyan: { icon: 'bg-[#ecfeff]', text: 'text-[#06b6d4]' },
  };
  const c = colorMap[color] || colorMap.red;

  return (
    <div className={`bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl p-5 shadow-sm relative overflow-hidden cursor-default transition-all hover:-translate-y-0.5 hover:shadow-md`}>
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-tr-xl rounded-bl-[80px] opacity-[0.07] bg-[var(--${color},#e8001e)]`} />
      <div className={`w-10.5 h-10.5 rounded-lg ${c.icon} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div className="text-[11.5px] text-[var(--text-muted,#9ca3af)] font-medium mb-1.25">{label}</div>
      <div className="text-2xl font-bold text-[var(--text-primary,#1a1d2e)] leading-none mb-2 font-['Inter']">{value}</div>
      {change && (
        <div className={`text-[11.5px] font-semibold flex items-center gap-1 ${changeUp ? 'text-[#10b981]' : 'text-[#e8001e]'}`}>
          {changeUp ? '▲' : '▼'} {change}
        </div>
      )}
      {linkText && onLinkClick && (
        <button onClick={onLinkClick} className="text-[11.5px] text-[#e8001e] font-semibold inline-flex items-center gap-1 mt-1.5 hover:underline">
          {linkText} →
        </button>
      )}
    </div>
  );
}

export function MiniStat({ icon: Icon, value, label, change, changeColor, iconBg }) {
  return (
    <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl px-4.5 py-3.75 flex items-center gap-3.5 shadow-sm transition-all hover:shadow-md">
      <div className={`w-11.5 h-11.5 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5.25 h-5.25" />
      </div>
      <div>
        <div className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] leading-none font-['Inter']">{value}</div>
        <div className="text-[11.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{label}</div>
        {change && <div className={`text-[11px] font-semibold mt-0.5 ${changeColor === 'green' ? 'text-[#10b981]' : changeColor === 'red' ? 'text-[#e8001e]' : 'text-[#3b82f6]'}`}>{change}</div>}
      </div>
    </div>
  );
}
