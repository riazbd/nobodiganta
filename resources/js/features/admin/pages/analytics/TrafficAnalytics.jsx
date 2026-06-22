import { router } from '@inertiajs/react';
import { BarChart3, TrendingUp, Users, Eye, Globe, Smartphone, Monitor, Tablet, HelpCircle, Award, Search, Share2, Link as LinkIcon, Layers } from 'lucide-react';
import { StatCard } from '../../components/widgets/StatCard';
import { LineChart } from '../../components/charts/LineChart';
import { useLanguage } from '../../hooks/useLanguage';

const SRC_ICON = { Search, Facebook: Share2, Globe, Link: LinkIcon };
const DEV_ICON = { mobile: Smartphone, desktop: Monitor, tablet: Tablet, unknown: HelpCircle };

export default function TrafficAnalytics({ range = 7, hasData = false, cards = {}, trend = {}, sources = [], devices = [], topPages = [], edition = {} }) {
  const { lang } = useLanguage();

  const bn = lang === 'bn';
  const fmt = (n) => {
    const s = Number(n ?? 0).toLocaleString('en-IN');
    return bn ? s.replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]) : s;
  };
  const setRange = (r) => router.get('/admin/traffic', { range: r }, { preserveState: true, preserveScroll: true });

  const RangeSelect = () => (
    <select value={range} onChange={(e) => setRange(e.target.value)}
      className="border border-[var(--card-border,#e8ebf4)] rounded-md px-2 py-1 text-xs outline-none bg-[#fafafa]">
      <option value={7}>{bn ? 'গত ৭ দিন' : 'Last 7 days'}</option>
      <option value={30}>{bn ? 'গত ৩০ দিন' : 'Last 30 days'}</option>
      <option value={90}>{bn ? 'গত ৯০ দিন' : 'Last 90 days'}</option>
    </select>
  );

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <BarChart3 className="w-5 h-5 text-[#263238]" />
            {bn ? 'ট্র্যাফিক বিশ্লেষণ' : 'Traffic Analytics'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{bn ? 'সাইটের প্রকৃত ভিজিটর ডেটা থেকে' : 'From your site’s real visitor data'}</p>
        </div>
        <RangeSelect />
      </div>

      {!hasData && (
        <div className="bg-[#fffbeb] border border-[#fde68a] text-[#92400e] rounded-xl px-5 py-3.5 mb-5 text-[12.5px]">
          {bn
            ? 'এই সময়ের মধ্যে এখনও কোনো ট্র্যাফিক রেকর্ড হয়নি। সাইটে ভিজিট আসা শুরু হলে এখানে প্রকৃত ডেটা দেখা যাবে।'
            : 'No traffic recorded for this period yet. Real data appears here as visitors start arriving on the site.'}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={Users} label={bn ? 'আজকের ভিজিটর' : "Today's Visitors"} value={fmt(cards.todayVisitors)} change={cards.visitorsTrend?.change} changeUp={cards.visitorsTrend?.up} color="blue" />
        <StatCard icon={Eye} label={bn ? 'পেজভিউ' : 'Pageviews'} value={fmt(cards.pageviews)} change={cards.pageviewsTrend?.change} changeUp={cards.pageviewsTrend?.up} color="red" />
        <StatCard icon={Users} label={bn ? 'ইউনিক ভিজিটর' : 'Unique Visitors'} value={fmt(cards.uniques)} color="green" />
        <StatCard icon={TrendingUp} label={bn ? 'পেজ/ভিজিটর' : 'Pages / Visitor'} value={fmt(cards.pagesPerVisit)} color="purple" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#263238]" />
              {bn ? 'ট্র্যাফিক ট্রেন্ড' : 'Traffic Trend'}
            </h3>
            <RangeSelect />
          </div>
          <div className="px-5 pt-2.5">
            {(trend.pageViews?.length) ? (
              <LineChart
                data={trend.pageViews} data2={trend.uniqueVisitors}
                labels={bn ? trend.labels : trend.labelsEn}
                color="#263238" color2="#3b82f6"
                label1={bn ? 'পেজভিউ' : 'Pageviews'} label2={bn ? 'ভিজিটর' : 'Visitors'}
              />
            ) : <div className="py-16 text-center text-[12.5px] text-[var(--text-muted,#9ca3af)]">{bn ? 'ডেটা নেই' : 'No data'}</div>}
          </div>
        </div>

        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#3b82f6]" />
              {bn ? 'ট্র্যাফিকের উৎস' : 'Traffic Sources'}
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {sources.filter(s => s.count > 0).length === 0 && (
              <div className="text-[12.5px] text-[var(--text-muted,#9ca3af)] py-4 text-center">{bn ? 'রেফারার ডেটা নেই' : 'No referrer data'}</div>
            )}
            {sources.filter(s => s.count > 0).map((s, i) => {
              const Icon = SRC_ICON[s.icon] || Globe;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color + '15' }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[12.5px] font-semibold text-[var(--text-primary,#1a1d2e)]">{bn ? s.name : s.nameEn}</div>
                    <div className="h-1.25 bg-[#f3f4f6] rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary,#1a1d2e)] font-['Inter']">{s.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4.5 mb-4.5">
        {/* Devices */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#263238]" />
            {bn ? 'ডিভাইস' : 'Devices'}
          </h3>
          <div className="space-y-3">
            {devices.length === 0 && <div className="text-[12.5px] text-[var(--text-muted,#9ca3af)] py-3">{bn ? 'ডেটা নেই' : 'No data'}</div>}
            {devices.map((d, i) => {
              const Icon = DEV_ICON[d.key] || HelpCircle;
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" />
                  <span className="text-xs text-[var(--text-secondary,#6b7280)] flex-1">{bn ? d.labelBn : d.labelEn}</span>
                  <div className="w-24 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                  </div>
                  <span className="text-xs font-bold font-['Inter'] w-10 text-right">{d.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top pages */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#f59e0b]" />
            {bn ? 'শীর্ষ পৃষ্ঠা' : 'Top Pages'}
          </h3>
          <div className="space-y-2.5">
            {topPages.length === 0 && <div className="text-[12.5px] text-[var(--text-muted,#9ca3af)] py-3">{bn ? 'ডেটা নেই' : 'No data'}</div>}
            {topPages.map((p, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${i === 0 ? 'bg-[#eceff1] text-[#263238]' : 'bg-[var(--body-bg,#f0f2f8)] text-[var(--text-muted,#9ca3af)]'}`}>{fmt(i + 1)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--text-primary,#1a1d2e)] truncate">{bn ? p.titleBn : p.titleEn}</div>
                </div>
                <span className="text-xs font-semibold font-['Inter'] text-[#3b82f6]">{fmt(p.views)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edition split */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#3b82f6]" />
            {bn ? 'সংস্করণ বিভাজন' : 'Edition Split'}
          </h3>
          <div className="space-y-4">
            {[
              { label: bn ? 'বাংলা' : 'Bangla', pct: edition.bnPct ?? 0, count: edition.bn ?? 0, color: '#263238' },
              { label: bn ? 'ইংরেজি' : 'English', pct: edition.enPct ?? 0, count: edition.en ?? 0, color: '#3b82f6' },
            ].map((e, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.25">
                  <span className="text-[var(--text-secondary,#6b7280)]">{e.label}</span>
                  <span className="font-bold text-[var(--text-primary,#1a1d2e)] font-['Inter']">{fmt(e.count)} · {e.pct}%</span>
                </div>
                <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${e.pct}%`, backgroundColor: e.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
