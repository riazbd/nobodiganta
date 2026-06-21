import { FileText, Camera, Megaphone, Search, Megaphone as Bullhorn, Trash2 } from 'lucide-react';

const quickActions = [
  { id: 'write', icon: FileText, labelBn: 'নতুন সংবাদ', labelEn: 'New Article', toastBn: 'নতুন সংবাদ এডিটর খুলছে...', toastEn: 'Opening article editor...' },
  { id: 'upload', icon: Camera, labelBn: 'মিডিয়া', labelEn: 'Media', toastBn: 'মিডিয়া লাইব্রেরি খুলছে...', toastEn: 'Opening media library...' },
  { id: 'breaking', icon: Megaphone, labelBn: 'ব্রেকিং নিউজ', labelEn: 'Breaking News', toastBn: 'ব্রেকিং নিউজ খুলছে...', toastEn: 'Opening breaking news...' },
  { id: 'seo', icon: Search, labelBn: 'SEO রিপোর্ট', labelEn: 'SEO Report', toastBn: 'SEO রিপোর্ট খুলছে...', toastEn: 'Opening SEO report...' },
  { id: 'ads', icon: Bullhorn, labelBn: 'বিজ্ঞাপন প্যানেল', labelEn: 'Ad Panel', toastBn: 'বিজ্ঞাপন প্যানেল খুলছে...', toastEn: 'Opening ad panel...' },
  { id: 'cache', icon: Trash2, labelBn: 'ক্যাশ ক্লিয়ার', labelEn: 'Clear Cache', toastBn: 'ক্যাশ পরিষ্কার হচ্ছে...', toastEn: 'Clearing cache...' },
];

export function QuickActions({ onAction, showToast, lang }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {quickActions.map(action => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            onClick={() => {
              showToast?.(lang === 'bn' ? action.toastBn : action.toastEn);
              onAction?.(action.id);
            }}
            className="bg-[var(--body-bg,#f0f2f8)] border border-[var(--card-border,#e8ebf4)] rounded-lg p-3.5 flex flex-col items-center gap-2 cursor-pointer transition-all hover:border-[#263238] hover:bg-[#eceff1] text-center group"
          >
            <div className="w-9.5 h-9.5 rounded-lg bg-white flex items-center justify-center text-lg shadow-sm transition-all group-hover:bg-[#263238]">
              <Icon className="w-4.5 h-4.5 text-[var(--text-secondary,#6b7280)] transition-colors group-hover:text-white" />
            </div>
            <span className="text-[11.5px] font-semibold text-[var(--text-secondary,#6b7280)] transition-colors group-hover:text-[#263238]">
              {lang === 'bn' ? action.labelBn : action.labelEn}
            </span>
          </button>
        );
      })}
    </div>
  );
}
