import { Camera, Image, Upload, TrendingUp, FileText, Eye, GalleryHorizontal, Clock, Calendar } from 'lucide-react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function PhotographerDashboard() {
  const { lang, t } = useLanguage();
  const { showToast } = showToast();
  const { onNavigate } = useAdminNavigation();

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <Camera className="w-5 h-5 text-[#e8001e]" />
            {lang === 'bn' ? 'ফটোগ্রাফার ড্যাশবোর্ড' : 'Photographer Dashboard'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'মিডিয়া আপলোড, গ্যালারি ও অ্যাসাইনমেন্ট' : 'Media upload, gallery and assignments'}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => showToast(lang === 'bn' ? 'মিডিয়া আপলোড খুলছে...' : 'Opening media upload...')} className="bg-[#e8001e] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#b8001a] transition-colors">
            <Upload className="w-4 h-4" /> {lang === 'bn' ? 'আপলোড' : 'Upload'}
          </button>
          <div className="text-xs text-[var(--text-muted,#9ca3af)] bg-white border border-[var(--card-border,#e8ebf4)] px-3.5 py-1.75 rounded-lg flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সোমবার, ০৬ এপ্রিল ২০২৬' : 'Monday, 06 April 2026'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={Image} label={lang === 'bn' ? 'মোট মিডিয়া' : 'Total Media'} value="2,340" change="156" changeUp={true} linkText={lang === 'bn' ? 'লাইব্রেরি দেখুন →' : 'View library →'} onLinkClick={() => onNavigate?.('media')} color="blue" />
        <StatCard icon={Upload} label={lang === 'bn' ? 'আজ আপলোড' : 'Uploaded Today'} value="23" change="8" changeUp={true} color="green" />
        <StatCard icon={Eye} label={lang === 'bn' ? 'ব্যবহৃত ছবি' : 'Images Used'} value="189" change="12" changeUp={true} color="purple" />
        <StatCard icon={Clock} label={lang === 'bn' ? 'অপেক্ষমান অ্যাসাইনমেন্ট' : 'Pending Assignments'} value="4" change="2" changeUp={false} color="orange" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <MiniStat icon={GalleryHorizontal} value="12" label={lang === 'bn' ? 'গ্যালারি' : 'Galleries'} change={lang === 'bn' ? '▲ ২ নতুন' : '▲ 2 new'} changeColor="green" iconBg="bg-[#f5f3ff]" />
        <MiniStat icon={TrendingUp} value="45K" label={lang === 'bn' ? 'মোট ভিউ' : 'Total Views'} change={lang === 'bn' ? '▲ ৮.২%' : '▲ 8.2%'} changeColor="green" iconBg="bg-[#ecfdf5]" />
        <MiniStat icon={FileText} value="8" label={lang === 'bn' ? 'লাইসেন্স মেয়াদোত্তীর্ণ' : 'License Expiring'} change={lang === 'bn' ? '▲ জরুরি' : '▲ Urgent'} changeColor="red" iconBg="bg-[#fffbeb]" />
        <MiniStat icon={Camera} value="6" label={lang === 'bn' ? 'অ্যাসাইনমেন্ট সম্পন্ন' : 'Assignments Done'} change={lang === 'bn' ? '▲ এই সপ্তাহে' : '▲ This week'} changeColor="green" iconBg="bg-[#eff6ff]" />
      </div>

      {/* Media Grid */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden mb-4.5">
        <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Image className="w-4 h-4 text-[#e8001e]" />
            {lang === 'bn' ? 'সাম্প্রতিক মিডিয়া' : 'Recent Media'}
          </h3>
          <button onClick={() => onNavigate?.('media')} className="bg-[#e8001e] text-white text-[11px] font-semibold px-3 py-1.25 rounded-md hover:bg-[#b8001a] transition-colors">
            {lang === 'bn' ? 'সব দেখুন' : 'View All'}
          </button>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4">
            {[].map(item => (
              <div key={item.id} className="group relative rounded-lg overflow-hidden cursor-pointer">
                <img src={item.url} alt={lang === 'bn' ? item.title : item.titleEn} className="w-full h-40 object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <div className="p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-xs font-semibold">{lang === 'bn' ? item.title : item.titleEn}</div>
                    <div className="text-white/70 text-[10px] mt-0.5">{item.size} · {item.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
