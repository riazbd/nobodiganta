import { TrendingUp, DollarSign, BarChart3, CreditCard, Download } from 'lucide-react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { GroupedBarChart } from '../../components/charts/BarChart';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function RevenueReport() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <TrendingUp className="w-5 h-5 text-[#10b981]" />
            {lang === 'bn' ? 'রাজস্ব রিপোর্ট' : 'Revenue Report'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'আয়, বিজ্ঞাপন ও সাবস্ক্রিপশন বিশ্লেষণ' : 'Revenue, ads and subscription analysis'}</p>
        </div>
        <button onClick={() => showToast(lang === 'bn' ? 'রিপোর্ট এক্সপোর্ট হচ্ছে...' : 'Exporting report...')} className="bg-[#e8001e] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#b8001a] transition-colors">
          <Download className="w-4 h-4" /> {lang === 'bn' ? 'এক্সপোর্ট' : 'Export'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={DollarSign} label={lang === 'bn' ? 'মোট রাজস্ব' : 'Total Revenue'} value="৳ ১.২৬ কোটি" change="22.1%" changeUp={true} color="green" />
        <StatCard icon={BarChart3} label={lang === 'bn' ? 'বিজ্ঞাপন আয়' : 'Ad Revenue'} value="৳ ৮৪ লাখ" change="18.5%" changeUp={true} color="red" />
        <StatCard icon={CreditCard} label={lang === 'bn' ? 'সাবস্ক্রিপশন আয়' : 'Subscription Revenue'} value="৳ ৪২ লাখ" change="28.3%" changeUp={true} color="blue" />
        <StatCard icon={TrendingUp} label={lang === 'bn' ? 'গড় মাসিক বৃদ্ধি' : 'Avg Monthly Growth'} value="15.2%" change="3.1%" changeUp={true} color="purple" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#e8001e]" />
              {lang === 'bn' ? 'মাসিক রাজস্ব' : 'Monthly Revenue'}
            </h3>
            <div className="flex gap-4 items-center">
              <div className="text-xs text-[var(--text-muted,#9ca3af)] flex items-center gap-1"><span className="w-2 h-2 bg-[#e8001e] rounded-sm inline-block" />{lang === 'bn' ? 'বিজ্ঞাপন' : 'Ads'}</div>
              <div className="text-xs text-[var(--text-muted,#9ca3af)] flex items-center gap-1"><span className="w-2 h-2 bg-[#3b82f6] rounded-sm inline-block" />{lang === 'bn' ? 'সাবস্ক্রিপশন' : 'Subscriptions'}</div>
              <select className="border border-[var(--card-border,#e8ebf4)] rounded-md px-2 py-1 text-xs outline-none bg-[#fafafa]">
                <option>২০২৬</option><option>২০২৫</option>
              </select>
            </div>
          </div>
          <div className="p-5">
            {(() => {
              const mockData = {
                labels: ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন'],
                labelsEn: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                ads: [45, 52, 38, 65, 48, 72],
                subscriptions: [32, 41, 45, 52, 58, 61]
              };
              const activeLabels = lang === 'bn' ? mockData.labels : mockData.labelsEn;
              
              return (
                <>
                  <GroupedBarChart 
                    data1={mockData.ads} 
                    data2={mockData.subscriptions} 
                    labels={activeLabels} 
                    color1="#e8001e" 
                    color2="#3b82f6" 
                    height={160} 
                  />
                  <div className="flex mt-1.5">
                    {activeLabels.map((l, i) => (
                      <div key={i} className="flex-1 text-center text-[10px] text-[var(--text-muted,#9ca3af)]">{l}</div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#10b981]" />
              {lang === 'bn' ? 'আয়ের উৎস' : 'Revenue Sources'}
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {[
              { labelBn: 'ডিসপ্লে বিজ্ঞাপন', labelEn: 'Display Ads', amount: '৳ ৪৫ লাখ', pct: 35.7, color: '#e8001e' },
              { labelBn: 'সাবস্ক্রিপশন', labelEn: 'Subscriptions', amount: '৳ ৪২ লাখ', pct: 33.3, color: '#3b82f6' },
              { labelBn: 'স্পনসরড কন্টেন্ট', labelEn: 'Sponsored Content', amount: '৳ ২২ লাখ', pct: 17.5, color: '#10b981' },
              { labelBn: 'অ্যাফিলিয়েট', labelEn: 'Affiliate', amount: '৳ ১০ লাখ', pct: 7.9, color: '#f59e0b' },
              { labelBn: 'অন্যান্য', labelEn: 'Other', amount: '৳ ৭ লাখ', pct: 5.6, color: '#8b5cf6' },
            ].map((src, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.25">
                  <span className="text-[var(--text-secondary,#6b7280)]">{lang === 'bn' ? src.labelBn : src.labelEn}</span>
                  <span className="font-bold text-[var(--text-primary,#1a1d2e)]">{src.amount}</span>
                </div>
                <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${src.pct}%`, backgroundColor: src.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
