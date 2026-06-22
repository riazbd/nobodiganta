import { router } from '@inertiajs/react';
import { Search, TrendingUp, Globe, FileText, AlertTriangle, CheckCircle2, Gauge, ExternalLink } from 'lucide-react';
import { StatCard } from '../../components/widgets/StatCard';
import { LineChart } from '../../components/charts/LineChart';
import { useLanguage } from '../../hooks/useLanguage';

export default function SeoReport({ range = 7, cards = {}, coverage = [], organic = {}, auditQueue = [] }) {
  const { lang } = useLanguage();
  const bn = lang === 'bn';

  const fmt = (n) => {
    const s = Number(n ?? 0).toLocaleString('en-IN');
    return bn ? s.replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]) : s;
  };
  const setRange = (r) => router.get('/admin/seo', { range: r }, { preserveState: true, preserveScroll: true });
  const editArticle = (id) => router.visit(`/admin/news/${id}/edit`);

  const score = cards.score ?? 0;
  const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <Search className="w-5 h-5 text-[#263238]" />
            {bn ? 'এসইও রিপোর্ট' : 'SEO Report'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{bn ? 'সাইটের অন-পেজ এসইও স্বাস্থ্য ও অর্গানিক ট্র্যাফিক' : 'On-site SEO health and organic traffic'}</p>
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value)}
          className="border border-[var(--card-border,#e8ebf4)] rounded-md px-2 py-1 text-xs outline-none bg-[#fafafa]">
          <option value={7}>{bn ? 'গত ৭ দিন' : 'Last 7 days'}</option>
          <option value={30}>{bn ? 'গত ৩০ দিন' : 'Last 30 days'}</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={Gauge} label={bn ? 'এসইও স্কোর' : 'SEO Score'} value={`${fmt(score)}/100`} color={score >= 80 ? 'green' : score >= 50 ? 'orange' : 'red'} />
        <StatCard icon={Globe} label={bn ? 'অর্গানিক ট্র্যাফিক' : 'Organic Traffic'} value={fmt(cards.organicTraffic)} color="blue" />
        <StatCard icon={TrendingUp} label={bn ? 'অর্গানিক শেয়ার' : 'Organic Share'} value={`${cards.organicShare ?? 0}%`} color="purple" />
        <StatCard icon={AlertTriangle} label={bn ? 'এসইও সমস্যা' : 'SEO Issues'} value={fmt(cards.issuesCount)} color="orange" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5">
        {/* Organic traffic trend */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10b981]" />
              {bn ? 'অর্গানিক (সার্চ) ট্র্যাফিক' : 'Organic (Search) Traffic'}
            </h3>
          </div>
          <div className="px-5 pt-2.5">
            {(organic.series?.some(v => v > 0)) ? (
              <LineChart data={organic.series} labels={bn ? organic.labels : organic.labelsEn} color="#10b981" label1={bn ? 'সার্চ ভিজিট' : 'Search visits'} />
            ) : <div className="py-16 text-center text-[12.5px] text-[var(--text-muted,#9ca3af)]">{bn ? 'এখনও কোনো সার্চ-রেফারড ভিজিট নেই' : 'No search-referred visits yet'}</div>}
          </div>
        </div>

        {/* Coverage */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3b82f6]" />
              {bn ? 'এসইও কভারেজ' : 'SEO Coverage'}
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {coverage.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.25">
                  <span className="text-[var(--text-secondary,#6b7280)]">{bn ? c.labelBn : c.labelEn}</span>
                  <span className="font-bold text-[var(--text-primary,#1a1d2e)] font-['Inter']">{fmt(c.count)}/{fmt(c.total)} · {c.pct}%</span>
                </div>
                <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.pct}%`, backgroundColor: c.color }} />
                </div>
              </div>
            ))}
            <div className="pt-1 text-[11px] text-[var(--text-muted,#9ca3af)]">
              {fmt(cards.articlesAudited)} {bn ? 'প্রকাশিত আর্টিকেল অডিট করা হয়েছে' : 'published articles audited'}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Audit Queue */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden mb-4.5">
        <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Search className="w-4 h-4 text-[#263238]" />
            {bn ? 'এসইও অডিট কিউ' : 'SEO Audit Queue'}
          </h3>
          <span className="text-[11px] text-[var(--text-muted,#9ca3af)]">{bn ? 'প্রকৃত আর্টিকেল সমস্যা' : 'Real article issues'}</span>
        </div>
        {auditQueue.length === 0 ? (
          <div className="px-5 py-10 text-center text-[12.5px] text-[#10b981] flex flex-col items-center gap-2">
            <CheckCircle2 className="w-7 h-7" />
            {bn ? 'কোনো এসইও সমস্যা পাওয়া যায়নি — সব আর্টিকেল ঠিক আছে।' : 'No SEO issues found — all articles look good.'}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[bn ? 'আর্টিকেল' : 'Article', bn ? 'সমস্যা' : 'Issue', bn ? 'গুরুত্ব' : 'Priority', bn ? 'কাজ' : 'Action'].map((h, i) => (
                  <th key={i} className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditQueue.map((item, i) => (
                <tr key={i} className="hover:bg-[#fafbff] transition-colors">
                  <td className="px-4 py-2.75 text-[12.5px] border-b border-[#f3f4f6]">
                    <div className="font-semibold text-[var(--text-primary,#1a1d2e)] truncate max-w-xs">{bn ? item.titleBn : item.titleEn}</div>
                  </td>
                  <td className="px-4 py-2.75 text-[12.5px] text-[var(--text-secondary,#6b7280)] border-b border-[#f3f4f6]">{bn ? item.issueBn : item.issueEn}</td>
                  <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      item.priority === 'high' ? 'bg-[#fef2f2] text-[#ef4444]' :
                      item.priority === 'medium' ? 'bg-[#fffbeb] text-[#f59e0b]' :
                      'bg-[#f3f4f6] text-[#6b7280]'
                    }`}>
                      {item.priority === 'high' ? (bn ? 'জরুরি' : 'High') : item.priority === 'medium' ? (bn ? 'মাঝারি' : 'Medium') : (bn ? 'নিম্ন' : 'Low')}
                    </span>
                  </td>
                  <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                    <button onClick={() => editArticle(item.id)} className="bg-[#263238] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md hover:bg-[#1a2428] transition-colors inline-flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> {bn ? 'ঠিক করুন' : 'Fix'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
