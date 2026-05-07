import { PenLine, FileText, Clock, TrendingUp, Send, Edit3, ListChecks, CalendarDays, Calendar, Newspaper, MessageSquare, Award } from 'lucide-react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function ReporterDashboard() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();

  const myArticles = [].filter(a => a.author === 'সানাউল্লাহ মাহমুদ' || a.author === 'Sanaullah Mahmud');
  const publishedCount = myArticles.filter(a => a.status === 'published').length;
  const draftCount = myArticles.filter(a => a.status === 'draft').length;
  const pendingCount = myArticles.filter(a => a.status === 'pending' || a.status === 'in_review').length;
  const totalViews = myArticles.reduce((sum, a) => sum + a.views, 0);

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">✍️ {lang === 'bn' ? 'সাংবাদিক ড্যাশবোর্ড' : 'Reporter Dashboard'}</h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'আমার সংবাদ, অ্যাসাইনমেন্ট ও পারফরম্যান্স' : 'My [], assignments and performance'}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => onNavigate?.('news-write')} className="bg-[#263238] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#1a2428] transition-colors">
            <PenLine className="w-4 h-4" /> {lang === 'bn' ? 'নতুন লিখুন' : 'Write New'}
          </button>
          <div className="text-xs text-[var(--text-muted,#9ca3af)] bg-white border border-[var(--card-border,#e8ebf4)] px-3.5 py-1.75 rounded-lg flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'সোমবার, ০৬ এপ্রিল ২০২৬' : 'Monday, 06 April 2026'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={FileText} label={lang === 'bn' ? 'মোট সংবাদ' : 'Total Articles'} value={String(myArticles.length)} change={lang === 'bn' ? 'এই মাসে' : 'This month'} changeUp={true} color="blue" />
        <StatCard icon={Send} label={lang === 'bn' ? 'প্রকাশিত' : 'Published'} value={String(publishedCount)} change={lang === 'bn' ? 'সক্রিয়' : 'Active'} changeUp={true} color="green" />
        <StatCard icon={Clock} label={lang === 'bn' ? 'ড্রাফট' : 'Drafts'} value={String(draftCount)} change={lang === 'bn' ? 'সংরক্ষিত' : 'Saved'} changeUp={false} color="orange" />
        <StatCard icon={TrendingUp} label={lang === 'bn' ? 'মোট পাঠক' : 'Total Views'} value={totalViews > 0 ? totalViews.toLocaleString('en-IN') : '0'} change="12.4%" changeUp={true} color="purple" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <MiniStat icon={ListChecks} value={String(pendingCount)} label={lang === 'bn' ? 'পর্যালোচনাধীন' : 'In Review'} change={lang === 'bn' ? '▲ অপেক্ষায়' : '▲ Waiting'} changeColor="orange" iconBg="bg-[#fffbeb]" />
        <MiniStat icon={CalendarDays} value="3" label={lang === 'bn' ? 'অ্যাসাইনমেন্ট' : 'Assignments'} change={lang === 'bn' ? '▲ ১ জরুরি' : '▲ 1 urgent'} changeColor="red" iconBg="bg-[#eff6ff]" />
        <MiniStat icon={MessageSquare} value="12" label={lang === 'bn' ? 'এডিটর ফিডব্যাক' : 'Editor Feedback'} change={lang === 'bn' ? '▲ ৩ নতুন' : '▲ 3 new'} changeColor="blue" iconBg="bg-[#ecfeff]" />
        <MiniStat icon={Award} value="98%" label={lang === 'bn' ? 'পারফরম্যান্স' : 'Performance'} change={lang === 'bn' ? '▲ শীর্ষে' : '▲ Top'} changeColor="green" iconBg="bg-[#ecfdf5]" />
      </div>

      {/* My Articles */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden mb-4.5">
        <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
          <h3 className="text-sm font-bold">{lang === 'bn' ? '📰 আমার সংবাদ' : '📰 My Articles'}</h3>
          <div className="flex gap-2">
            <div className="flex border border-[var(--card-border,#e8ebf4)] rounded-md overflow-hidden">
              <button className="px-3 py-1 text-[11.5px] font-semibold bg-[#263238] text-white">{lang === 'bn' ? 'সব' : 'All'}</button>
              <button className="px-3 py-1 text-[11.5px] font-semibold text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'ড্রাফট' : 'Drafts'}</button>
              <button className="px-3 py-1 text-[11.5px] font-semibold text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'প্রকাশিত' : 'Published'}</button>
            </div>
          </div>
        </div>
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
            {[].slice(0, 6).map(article => {
              const statusMap = {
                published: { text: lang === 'bn' ? 'প্রকাশিত' : 'Published', variant: 'green' },
                draft: { text: lang === 'bn' ? 'ড্রাফট' : 'Draft', variant: 'gray' },
                pending: { text: lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending', variant: 'orange' },
                in_review: { text: lang === 'bn' ? 'পর্যালোচনাধীন' : 'In Review', variant: 'blue' },
              };
              const status = statusMap[article.status] || statusMap.draft;
              return (
                <tr key={article.id} className="hover:bg-[#fafbff] transition-colors">
                  <td className="px-4 py-2.75 text-[12.5px] border-b border-[#f3f4f6]">
                    <div className="font-semibold text-[var(--text-primary,#1a1d2e)] text-[13px]">{lang === 'bn' ? article.titleBn : article.titleEn}</div>
                    <div className="text-[11px] text-[var(--text-muted,#9ca3af)] mt-0.5">{article.date}</div>
                  </td>
                  <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                    <Badge variant={article.category === 'politics' ? 'red' : article.category === 'sports' ? 'green' : 'blue'}>
                      {lang === 'bn' ? article.categoryBn : article.categoryEn}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.75 text-[12.5px] font-semibold font-['Inter'] border-b border-[#f3f4f6]">{article.views > 0 ? article.views.toLocaleString('en-IN') : '—'}</td>
                  <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                    <Badge variant={status.variant}>{status.text}</Badge>
                  </td>
                  <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                    <button onClick={() => showToast(lang === 'bn' ? 'সম্পাদনা পেজ খুলছে...' : 'Opening edit page...')} className="bg-white border border-[var(--card-border,#e8ebf4)] rounded px-2.25 py-1 text-[11px] cursor-pointer hover:bg-gray-50 transition-colors">
                      <Edit3 className="w-3 h-3 inline mr-1" />{lang === 'bn' ? 'সম্পাদনা' : 'Edit'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Todo */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
          <h3 className="text-sm font-bold">{lang === 'bn' ? '✅ আমার কাজের তালিকা' : '✅ My Todo List'}</h3>
        </div>
        <div className="p-4 pt-1.5">
          <div className="space-y-0">
            {[].map(todo => (
              <div key={todo.id} className="flex items-center gap-2.5 py-2.25 border-b border-[#f3f4f6] last:border-0">
                <div className={`w-4.5 h-4.5 border-2 rounded flex items-center justify-center flex-shrink-0 ${todo.done ? 'bg-[#10b981] border-[#10b981] text-white' : 'border-[var(--card-border,#e8ebf4)]'}`}>
                  {todo.done && '✓'}
                </div>
                <span className={`text-[12.5px] flex-1 font-medium ${todo.done ? 'line-through text-[var(--text-muted,#9ca3af)]' : 'text-[var(--text-primary,#1a1d2e)]'}`}>
                  {lang === 'bn' ? todo.text : todo.textEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
