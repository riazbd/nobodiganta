import { HardDrive, Database, MemoryStick } from 'lucide-react';

export function ServerHealth({ data, lang = 'bn' }) {
  if (!data) return null;

  const diskUsed = data.disk ?? 0;
  const diskColor = diskUsed > 85 ? '#ef4444' : diskUsed > 70 ? '#f59e0b' : '#10b981';

  const rows = [
    { label: lang === 'bn' ? 'ডেটাবেস' : 'Database', value: data.dbSize, icon: Database },
    { label: lang === 'bn' ? 'মেমরি (অ্যাপ)' : 'Memory (app)', value: data.memory, icon: MemoryStick },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">{lang === 'bn' ? 'সিস্টেম স্বাস্থ্য' : 'System Health'}</h3>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#10b981]">● {lang === 'bn' ? 'অনলাইন' : 'Online'}</span>
      </div>

      {/* Disk usage — real */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.25">
          <span className="text-[var(--text-muted,#9ca3af)] flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" /> {lang === 'bn' ? 'ডিস্ক ব্যবহার' : 'Disk Usage'}
          </span>
          <span className="font-bold text-[var(--text-primary,#1a1d2e)]">{diskUsed}%</span>
        </div>
        <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${diskUsed}%`, backgroundColor: diskColor }} />
        </div>
        {data.diskFree && (
          <div className="text-[10.5px] text-[var(--text-muted,#9ca3af)] mt-1">
            {lang === 'bn' ? 'খালি' : 'Free'}: {data.diskFree} / {data.diskTotal}
          </div>
        )}
      </div>

      {/* DB size + app memory — real */}
      <div className="space-y-2 border-t border-[#f3f4f6] pt-3">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted,#9ca3af)] flex items-center gap-1.5">
              <r.icon className="w-3.5 h-3.5" /> {r.label}
            </span>
            <span className="font-bold text-[var(--text-primary,#1a1d2e)]">{r.value || '—'}</span>
          </div>
        ))}
      </div>

      {data.phpVersion && (
        <div className="text-[10.5px] text-[var(--text-muted,#9ca3af)] border-t border-[#f3f4f6] pt-2.5 mt-3">
          PHP {data.phpVersion}
        </div>
      )}
    </div>
  );
}
