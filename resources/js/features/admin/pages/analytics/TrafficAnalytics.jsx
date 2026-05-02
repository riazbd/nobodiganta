import { BarChart3, TrendingUp, Users, Clock, Globe, Smartphone, Monitor, Tablet, Calendar, Award, Map } from 'lucide-react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { LineChart } from '../../components/charts/LineChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { TrafficSource } from '../../components/widgets/TrafficSource';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function TrafficAnalytics() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <BarChart3 className="w-5 h-5 text-[#e8001e]" />
            {lang === 'bn' ? 'ট্র্যাফিক বিশ্লেষণ' : 'Traffic Analytics'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'ভিজিটর আচরণ ও ট্র্যাফিক প্যাটার্ন' : 'Visitor behavior and traffic patterns'}</p>
        </div>
        <div className="text-xs text-[var(--text-muted,#9ca3af)] bg-white border border-[var(--card-border,#e8ebf4)] px-3.5 py-1.75 rounded-lg flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'সোমবার, ০৬ এপ্রিল ২০২৬' : 'Monday, 06 April 2026'}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={Users} label={lang === 'bn' ? 'আজকের ভিজিটর' : "Today's Visitors"} value="3,24,150" change="8.7%" changeUp={true} color="blue" />
        <StatCard icon={BarChart3} label={lang === 'bn' ? 'পেজভিউ' : 'Pageviews'} value="12,45,670" change="12.3%" changeUp={true} color="red" />
        <StatCard icon={Clock} label={lang === 'bn' ? 'গড় সময়' : 'Avg Time'} value="4:48" change="0.3%" changeUp={true} color="green" />
        <StatCard icon={TrendingUp} label={lang === 'bn' ? 'বাউন্স রেট' : 'Bounce Rate'} value="32.1%" change="2.1%" changeUp={false} color="orange" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#e8001e]" />
              {lang === 'bn' ? 'ট্র্যাফিক ট্রেন্ড' : 'Traffic Trend'}
            </h3>
            <select className="border border-[var(--card-border,#e8ebf4)] rounded-md px-2 py-1 text-xs outline-none bg-[#fafafa]">
              <option>{lang === 'bn' ? 'এই সপ্তাহ' : 'This Week'}</option>
              <option>{lang === 'bn' ? 'এই মাস' : 'This Month'}</option>
              <option>{lang === 'bn' ? 'এই বছর' : 'This Year'}</option>
            </select>
          </div>
          <div className="px-5 pt-2.5">
            <LineChart data={[].pageViews} labels={lang === 'bn' ? [].labels : [].labelsEn} color="#e8001e" gradientId="gRed" />
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

      <div className="grid grid-cols-3 gap-4.5 mb-4.5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#e8001e]" />
            {lang === 'bn' ? 'ডিভাইস' : 'Devices'}
          </h3>
          <div className="space-y-3">
            {[
              { icon: Smartphone, labelBn: 'মোবাইল', labelEn: 'Mobile', pct: 62.4, color: '#e8001e' },
              { icon: Monitor, labelBn: 'ডেস্কটপ', labelEn: 'Desktop', pct: 25.1, color: '#3b82f6' },
              { icon: Tablet, labelBn: 'ট্যাবলেট', labelEn: 'Tablet', pct: 12.5, color: '#f59e0b' },
            ].map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" />
                  <span className="text-xs text-[var(--text-secondary,#6b7280)] flex-1">{lang === 'bn' ? d.labelBn : d.labelEn}</span>
                  <div className="w-24 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                  </div>
                  <span className="text-xs font-bold font-['Inter']">{d.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#f59e0b]" />
            {lang === 'bn' ? 'শীর্ষ পৃষ্ঠা' : 'Top Pages'}
          </h3>
          <div className="space-y-2.5">
            {[
              { titleBn: 'সংসদে সাইবার আইন পাস', titleEn: 'Cyber Law Passed', views: '45,234' },
              { titleBn: 'বাংলাদেশ বনাম শ্রীলঙ্কা', titleEn: 'Bangladesh vs Sri Lanka', views: '89,340' },
              { titleBn: 'মেটার বাংলা AI মডেল', titleEn: 'Meta Bengali AI Model', views: '23,450' },
              { titleBn: 'সুন্দরবনে বাঘ বৃদ্ধি', titleEn: 'Tiger Increase in Sundarbans', views: '42,100' },
              { titleBn: 'বোরো ধানের বাম্পার ফলন', titleEn: 'Bumper Boro Rice Harvest', views: '28,567' },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${i === 0 ? 'bg-[#fff0f2] text-[#e8001e]' : 'bg-[var(--body-bg,#f0f2f8)] text-[var(--text-muted,#9ca3af)]'}`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--text-primary,#1a1d2e)] truncate">{lang === 'bn' ? p.titleBn : p.titleEn}</div>
                </div>
                <span className="text-xs font-semibold font-['Inter'] text-[#3b82f6]">{p.views}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Map className="w-4 h-4 text-[#3b82f6]" />
            {lang === 'bn' ? 'ভৌগোলিক' : 'Geographic'}
          </h3>
          <div className="space-y-2.5">
            {[
              { countryBn: 'ঢাকা', countryEn: 'Dhaka', pct: 42.3 },
              { countryBn: 'চট্টগ্রাম', countryEn: 'Chittagong', pct: 18.7 },
              { countryBn: 'রাজশাহী', countryEn: 'Rajshahi', pct: 12.1 },
              { countryBn: 'সিলেট', countryEn: 'Sylhet', pct: 8.4 },
              { countryBn: 'খুলনা', countryEn: 'Khulna', pct: 6.2 },
              { countryBn: 'অন্যান্য', countryEn: 'Other', pct: 12.3 },
            ].map((loc, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-xs text-[var(--text-secondary,#6b7280)] w-20 flex-shrink-0">{lang === 'bn' ? loc.countryBn : loc.countryEn}</span>
                <div className="flex-1 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#e8001e]" style={{ width: `${loc.pct}%` }} />
                </div>
                <span className="text-xs font-bold font-['Inter']">{loc.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
