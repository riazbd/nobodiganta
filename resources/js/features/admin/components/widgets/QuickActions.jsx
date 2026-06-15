import { FileText, Camera, Megaphone, Smartphone, Mail, Search, Megaphone as Bullhorn, Trash2 } from 'lucide-react';

const quickActions = [
  { id: 'write', icon: FileText, labelBn: 'নতুন সংবাদ', labelEn: 'New Article', toastBn: 'নতুন সংবাদ এডিটর খুলছে...', toastEn: 'Opening article editor...' },
  { id: 'upload', icon: Camera, labelBn: 'ছবি আপলোড', labelEn: 'Upload Photo', toastBn: 'মিডিয়া আপলোড খুলছে...', toastEn: 'Opening media upload...' },
  { id: 'breaking', icon: Megaphone, labelBn: 'ব্রেকিং নিউজ', labelEn: 'Breaking News', toastBn: 'ব্রেকিং নিউজ সেটার...', toastEn: 'Opening breaking news setter...' },
  { id: 'push', icon: Smartphone, labelBn: 'পুশ নোটিফ', labelEn: 'Push Notif', toastBn: 'পুশ নোটিফিকেশন পাঠানো হচ্ছে...', toastEn: 'Sending push notification...' },
  // newsletter hidden from client for now — future feature
  // { id: 'newsletter', icon: Mail, labelBn: 'নিউজলেটার', labelEn: 'Newsletter', toastBn: 'নিউজলেটার কম্পোজার...', toastEn: 'Opening newsletter composer...' },
  { id: 'seo', icon: Search, labelBn: 'SEO চেক', labelEn: 'SEO Check', toastBn: 'SEO চেকার টুল...', toastEn: 'Opening SEO checker...' },
  { id: 'ads', icon: Bullhorn, labelBn: 'বিজ্ঞাপন স্লট', labelEn: 'Ad Slots', toastBn: 'বিজ্ঞাপন স্লট ম্যানেজার...', toastEn: 'Opening ad slot manager...' },
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
