import { PenLine, FileText, Clock, TrendingUp, Send, Edit3, ListChecks } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function ReporterDashboard() {
  const { lang } = useLanguage();
  const { onNavigate } = useAdminNavigation();
  const { stats = {}, recentArticles = [] } = usePage().props;

  const total     = stats.total ?? 0;
  const published = stats.published ?? 0;
  const drafts    = stats.drafts ?? 0;
  const pending   = stats.pending ?? 0;
  const views     = stats.views ?? 0;

  const statusMap = {
    published: { text: lang === 'bn' ? 'প্রকাশিত' : 'Published', variant: 'green' },
    draft:     { text: lang === 'bn' ? 'ড্রাফট' : 'Draft', variant: 'gray' },
    pending:   { text: lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending', variant: 'orange' },
    archived:  { text: lang === 'bn' ? 'আর্কাইভড' : 'Archived', variant: 'blue' },
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">✍️ {lang === 'bn' ? 'সাংবাদিক ড্যাশবোর্ড' : 'Reporter Dashboard'}</h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'আমার সংবাদ ও পরিসংখ্যান' : 'My articles and statistics'}</p>
        </div>
        <button onClick={() => onNavigate?.('news-write')} className="bg-[#263238] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#1a2428] transition-colors">
          <PenLine className="w-4 h-4" /> {lang === 'bn' ? 'নতুন লিখুন' : 'Write New'}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={FileText} label={lang === 'bn' ? 'আমার মোট সংবাদ' : 'My Articles'} value={String(total)} color="blue" />
        <StatCard icon={Send} label={lang === 'bn' ? 'প্রকাশিত' : 'Published'} value={String(published)} color="green" />
        <StatCard icon={Clock} label={lang === 'bn' ? 'ড্রাফট' : 'Drafts'} value={String(drafts)} color="orange" />
        <StatCard icon={TrendingUp} label={lang === 'bn' ? 'আমার মোট পাঠক' : 'My Total Views'} value={views > 0 ? views.toLocaleString('en-IN') : '0'} color="purple" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <MiniStat icon={ListChecks} value={String(pending)} label={lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending Approval'} iconBg="bg-[#fffbeb]" />
      </div>

      {/* My Articles */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
          <h3 className="text-sm font-bold">{lang === 'bn' ? '📰 আমার সাম্প্রতিক সংবাদ' : '📰 My Recent Articles'}</h3>
          <button onClick={() => onNavigate?.('news-all')} className="text-[11.5px] font-semibold text-[#263238] hover:underline">{lang === 'bn' ? 'সব দেখুন' : 'View all'}</button>
        </div>
        {recentArticles.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-[var(--text-muted,#9ca3af)]">
            {lang === 'bn' ? 'এখনো কোনো সংবাদ লেখা হয়নি।' : 'No articles yet.'}
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'শিরোনাম' : 'Title'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'বিভাগ' : 'Category'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'পাঠক' : 'Views'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'কাজ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map(article => {
                const status = statusMap[article.status] || statusMap.draft;
                return (
                  <tr key={article.id} className="hover:bg-[#fafbff] transition-colors">
                    <td className="px-4 py-2.75 text-[12.5px] border-b border-[#f3f4f6]">
                      <div className="font-semibold text-[var(--text-primary,#1a1d2e)] text-[13px]">{lang === 'bn' ? article.titleBn : (article.titleEn || article.titleBn)}</div>
                      <div className="text-[11px] text-[var(--text-muted,#9ca3af)] mt-0.5">{article.time}</div>
                    </td>
                    <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                      <Badge variant="blue">{lang === 'bn' ? article.categoryBn : article.categoryEn}</Badge>
                    </td>
                    <td className="px-4 py-2.75 text-[12.5px] font-semibold font-['Inter'] border-b border-[#f3f4f6]">{article.views > 0 ? article.views.toLocaleString('en-IN') : '—'}</td>
                    <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </td>
                    <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                      <button onClick={() => router.visit(route('admin.news.edit', { article: article.id }))} className="bg-white border border-[var(--card-border,#e8ebf4)] rounded px-2.25 py-1 text-[11px] cursor-pointer hover:bg-gray-50 transition-colors">
                        <Edit3 className="w-3 h-3 inline mr-1" />{lang === 'bn' ? 'সম্পাদনা' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
