import { Cpu, MemoryStick, HardDrive, Activity } from 'lucide-react';

export function ServerHealth({ data, lang = 'bn' }) {
  if (!data) return null;

  const metrics = [
    { label: 'CPU ব্যবহার', labelEn: 'CPU Usage', value: data.cpu, color: data.cpu > 80 ? '#f59e0b' : '#10b981', icon: Cpu },
    { label: 'মেমরি (RAM)', labelEn: 'Memory (RAM)', value: data.memory, color: data.memory > 80 ? '#f59e0b' : '#3b82f6', icon: MemoryStick },
    { label: 'ডিস্ক স্পেস', labelEn: 'Disk Space', value: data.disk, color: '#10b981', icon: HardDrive },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">{lang === 'bn' ? 'সিস্টেম স্বাস্থ্য' : 'System Health'}</h3>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#10b981]">● {lang === 'bn' ? 'অনলাইন' : 'Online'}</span>
      </div>
      <div className="space-y-3">
        {metrics.map((m, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1.25">
              <span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? m.label : m.labelEn}</span>
              <span className="font-bold text-[var(--text-primary,#1a1d2e)]">{m.value}%</span>
            </div>
            <div className="h-1.25 bg-[#f3f4f6] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${m.value}%`, backgroundColor: m.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-[var(--text-muted,#9ca3af)] border-t border-[#f3f4f6] pt-2.5 mt-3">
        <span>{lang === 'bn' ? 'আপটাইম' : 'Uptime'}: <strong className="text-[#10b981]">{lang === 'bn' ? data.uptime : (data.uptimeEn || data.uptime)}</strong></span>
        <span>{lang === 'bn' ? 'লেটেন্সি' : 'Latency'}: <strong className="text-[var(--text-primary,#1a1d2e)]">{lang === 'bn' ? data.latency : (data.latencyEn || data.latency)}</strong></span>
      </div>
    </div>
  );
}
