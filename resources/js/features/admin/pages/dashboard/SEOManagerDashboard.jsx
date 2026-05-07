import { Search, TrendingUp, BarChart3, Globe, Share2, Target, Eye, Link, FileText, Megaphone, Calendar } from 'lucide-react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { LineChart } from '../../components/charts/LineChart';
import { GroupedBarChart } from '../../components/charts/BarChart';
import { TrafficSource } from '../../components/widgets/TrafficSource';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function SEOManagerDashboard() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <Search className="w-5 h-5 text-[#263238]" />
            {lang === 'bn' ? 'এসইও ম্যানেজার ড্যাশবোর্ড' : 'SEO Manager Dashboard'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'কন্টেন্ট অপ্টিমাইজেশন ও সোশ্যাল ডিস্ট্রিবিউশন' : 'Content optimization and social distribution'}</p>
        </div>
        <div className="text-xs text-[var(--text-muted,#9ca3af)] bg-white border border-[var(--card-border,#e8ebf4)] px-3.5 py-1.75 rounded-lg flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'সোমবার, ০৬ এপ্রিল ২০২৬' : 'Monday, 06 April 2026'}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={Search} label={lang === 'bn' ? 'SEO স্কোর' : 'SEO Score'} value="87/100" change="5.2%" changeUp={true} linkText={lang === 'bn' ? 'বিস্তারিত দেখুন →' : 'View details →'} onLinkClick={() => onNavigate?.('seo')} color="green" />
        <StatCard icon={Globe} label={lang === 'bn' ? 'অর্গানিক ট্র্যাফিক' : 'Organic Traffic'} value="1,24,500" change="12.8%" changeUp={true} linkText={lang === 'bn' ? 'বিশ্লেষণ →' : 'Analyze →'} onLinkClick={() => onNavigate?.('traffic')} color="blue" />
        <StatCard icon={Share2} label={lang === 'bn' ? 'সোশ্যাল শেয়ার' : 'Social Shares'} value="45,230" change="8.4%" changeUp={true} linkText={lang === 'bn' ? 'সোশ্যাল →' : 'Social →'} onLinkClick={() => showToast(lang === 'bn' ? 'সোশ্যাল মিডিয়া ড্যাশবোর্ড' : 'Social media dashboard')} color="purple" />
        <StatCard icon={Target} label={lang === 'bn' ? 'কীওয়ার্ড র‍্যাংকিং' : 'Keyword Rankings'} value="342" change="23" changeUp={true} linkText={lang === 'bn' ? 'রিপোর্ট →' : 'Report →'} onLinkClick={() => onNavigate?.('seo')} color="orange" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <MiniStat icon={Eye} value="62.4%" label={lang === 'bn' ? 'CTR হার' : 'CTR Rate'} change={lang === 'bn' ? '▲ ৩.২%' : '▲ 3.2%'} changeColor="green" iconBg="bg-[#eff6ff]" />
        <MiniStat icon={Link} value="1,240" label={lang === 'bn' ? 'ব্যাকলিঙ্ক' : 'Backlinks'} change={lang === 'bn' ? '▲ ৪৫ নতুন' : '▲ 45 new'} changeColor="green" iconBg="bg-[#ecfdf5]" />
        <MiniStat icon={FileText} value="18" label={lang === 'bn' ? 'SEO সমস্যা' : 'SEO Issues'} change={lang === 'bn' ? '▲ ৫ জরুরি' : '▲ 5 urgent'} changeColor="red" iconBg="bg-[#eceff1]" />
        <MiniStat icon={Megaphone} value="156" label={lang === 'bn' ? 'সোশ্যাল পোস্ট' : 'Social Posts'} change={lang === 'bn' ? '▲ ২৪ এই সপ্তাহে' : '▲ 24 this week'} changeColor="green" iconBg="bg-[#f5f3ff]" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10b981]" />
              {lang === 'bn' ? 'অর্গানিক ট্র্যাফিক' : 'Organic Traffic'}
            </h3>
            <select className="border border-[var(--card-border,#e8ebf4)] rounded-md px-2 py-1 text-xs outline-none bg-[#fafafa]">
              <option>{lang === 'bn' ? 'এই সপ্তাহ' : 'This Week'}</option>
              <option>{lang === 'bn' ? 'এই মাস' : 'This Month'}</option>
              <option>{lang === 'bn' ? 'এই বছর' : 'This Year'}</option>
            </select>
          </div>
          <div className="px-5 pt-2.5">
            <LineChart 
              data={[4500, 5200, 4800, 7200, 6100, 8400, 7900]} 
              labels={lang === 'bn' ? ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'] : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']} 
              color="#10b981" 
              gradientId="gGreen" 
            />
          </div>
        </div>
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#3b82f6]" />
              {lang === 'bn' ? 'ট্র্যাফিকের উৎস' : 'Traffic Sources'}
            </h3>
          </div>
          <div className="p-5">
            <TrafficSource items={[]} />
          </div>
        </div>
      </div>

      {/* SEO Audit Queue */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden mb-4.5">
        <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Search className="w-4 h-4 text-[#263238]" />
            {lang === 'bn' ? 'SEO অডিট কিউ' : 'SEO Audit Queue'}
          </h3>
          <button onClick={() => onNavigate?.('seo')} className="bg-[#263238] text-white text-[11px] font-semibold px-3 py-1.25 rounded-md hover:bg-[#1a2428] transition-colors">
            {lang === 'bn' ? 'সব দেখুন' : 'View All'}
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'আর্টিকেল' : 'Article'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'সমস্যা' : 'Issue'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'গুরুত্ব' : 'Priority'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'কাজ' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {[
              { titleBn: 'সংসদে পাস হলো নতুন সাইবার আইন', titleEn: 'New Cyber Law Passed', issueBn: 'মেটা ডেসক্রিপশন নেই', issueEn: 'Missing meta description', priority: 'high' },
              { titleBn: 'বোরো ধানের বাম্পার ফলন', titleEn: 'Bumper Boro Rice Harvest', issueBn: 'H1 ট্যাগ ডুপ্লিকেট', issueEn: 'Duplicate H1 tag', priority: 'medium' },
              { titleBn: 'মেট্রোরেলের নতুন লাইন', titleEn: 'New Metro Rail Line', issueBn: 'ইমেজ অল্ট টেক্সট নেই', issueEn: 'Missing image alt text', priority: 'low' },
            ].map((item, i) => (
              <tr key={i} className="hover:bg-[#fafbff] transition-colors">
                <td className="px-4 py-2.75 text-[12.5px] border-b border-[#f3f4f6]">
                  <div className="font-semibold text-[var(--text-primary,#1a1d2e)]">{lang === 'bn' ? item.titleBn : item.titleEn}</div>
                </td>
                <td className="px-4 py-2.75 text-[12.5px] text-[var(--text-secondary,#6b7280)] border-b border-[#f3f4f6]">{lang === 'bn' ? item.issueBn : item.issueEn}</td>
                <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    item.priority === 'high' ? 'bg-[#eceff1] text-[#263238]' :
                    item.priority === 'medium' ? 'bg-[#fffbeb] text-[#f59e0b]' :
                    'bg-[#f3f4f6] text-[#6b7280]'
                  }`}>
                    {item.priority === 'high' ? (lang === 'bn' ? 'জরুরি' : 'High') : item.priority === 'medium' ? (lang === 'bn' ? 'মাঝারি' : 'Medium') : (lang === 'bn' ? 'নিম্ন' : 'Low')}
                  </span>
                </td>
                <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                  <button onClick={() => showToast(lang === 'bn' ? 'SEO ঠিক করা হচ্ছে...' : 'Fixing SEO...')} className="bg-[#263238] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md hover:bg-[#1a2428] transition-colors">
                    {lang === 'bn' ? 'ঠিক করুন' : 'Fix'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
