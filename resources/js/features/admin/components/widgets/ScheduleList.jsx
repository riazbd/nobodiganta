export function ScheduleList({ items = [], lang = 'bn' }) {
  const statusBadgeMap = {
    completed: { text: 'সম্পন্ন', textEn: 'Done', variant: 'green' },
    ongoing: { text: 'চলমান', textEn: 'Ongoing', variant: 'blue' },
    pending: { text: 'অপেক্ষায়', textEn: 'Pending', variant: 'orange' },
    scheduled: { text: 'নির্ধারিত', textEn: 'Scheduled', variant: 'gray' },
    live: { text: 'লাইভ', textEn: 'Live', variant: 'red' },
  };
  const dotColorMap = { completed: '#10b981', ongoing: '#3b82f6', pending: '#f59e0b', scheduled: '#8b5cf6', live: '#263238' };
  const badgeColorMap = { green: 'bg-[#ecfdf5] text-[#10b981]', blue: 'bg-[#eff6ff] text-[#3b82f6]', orange: 'bg-[#fffbeb] text-[#f59e0b]', gray: 'bg-[#f3f4f6] text-[#6b7280]', red: 'bg-[#eceff1] text-[#263238]' };

  return (
    <div className="space-y-0">
      {items.map(item => {
        const badge = statusBadgeMap[item.status] || statusBadgeMap.scheduled;
        return (
          <div key={item.id} className="flex gap-3 py-2.5 border-b border-[#f3f4f6] last:border-0 items-start">
            <div className="text-[11px] text-[var(--text-muted,#9ca3af)] w-12 flex-shrink-0 pt-0.5">{item.time}</div>
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: dotColorMap[item.status] }} />
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-[var(--text-primary,#1a1d2e)]">{lang === 'bn' ? item.title : (item.titleEn || item.title)}</div>
              <div className="text-[11px] text-[var(--text-muted,#9ca3af)] mt-0.5">{lang === 'bn' ? item.desc : (item.descEn || item.desc)}</div>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${badgeColorMap[badge.variant]}`}>
              {lang === 'bn' ? badge.text : badge.textEn}
            </span>
          </div>
        );
      })}
    </div>
  );
}
