export function ActivityFeed({ items = [], lang = 'bn' }) {
  const iconBgMap = {
    publish: 'bg-[#fff0f2]',
    comment: 'bg-[#eff6ff]',
    traffic: 'bg-[#ecfdf5]',
    media: 'bg-[#f5f3ff]',
    subscription: 'bg-[#fef9ee]',
    review: 'bg-[#fff0f2]',
  };

  return (
    <div className="space-y-0">
      {items.map(item => (
        <div key={item.id} className="flex gap-3 py-2.5 border-b border-[#f3f4f6] last:border-0">
          <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgMap[item.type] || 'bg-gray-100'}`}>
            <span className="text-sm">{item.icon === 'FileText' ? '✍️' : item.icon === 'MessageSquare' ? '💬' : item.icon === 'TrendingUp' ? '📈' : item.icon === 'Image' ? '🖼️' : item.icon === 'CreditCard' ? '💳' : item.icon === 'Eye' ? '👁️' : '📝'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] text-[var(--text-secondary,#6b7280)] leading-relaxed" dangerouslySetInnerHTML={{ __html: lang === 'bn' ? item.text : (item.textEn || item.text) }} />
            <div className="text-[11px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? item.time : (item.timeEn || item.time)}</div>
          </div>
          {item.action && (
            <button className="text-[11px] font-semibold text-[#e8001e] bg-[#fff0f2] border-none rounded px-2.5 py-1 cursor-pointer whitespace-nowrap self-center transition-all hover:bg-[#e8001e] hover:text-white">
              {lang === 'bn' ? item.action : (item.actionEn || item.action)}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
