import { Newspaper, Users, MessageSquare, TrendingUp, PenLine, FileText, Clock, BarChart3, CalendarDays, AlertTriangle, Calendar, FolderTree, Zap, Activity } from 'lucide-react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { LineChart } from '../../components/charts/LineChart';
import { QuickActions } from '../../components/widgets/QuickActions';
import { ActivityFeed } from '../../components/widgets/ActivityFeed';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function SectionEditorDashboard() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();

  const sectionArticles = [].filter(a => a.status === 'pending' || a.status === 'in_review');

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <FolderTree className="w-5 h-5 text-[#e8001e]" />
            {lang === 'bn' ? 'বিভাগীয় সম্পাদক ড্যাশবোর্ড' : 'Section Editor Dashboard'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'বিভাগ-নির্দিষ্ট কন্টেন্ট ব্যবস্থাপনা ও সাংবাদিক তত্ত্বাবধান' : 'Section-specific content management and reporter oversight'}</p>
        </div>
        <div className="text-xs text-[var(--text-muted,#9ca3af)] bg-white border border-[var(--card-border,#e8ebf4)] px-3.5 py-1.75 rounded-lg flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'সোমবার, ০৬ এপ্রিল ২০২৬' : 'Monday, 06 April 2026'}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={FileText} label={lang === 'bn' ? 'বিভাগীয় সংবাদ' : 'Section Articles'} value="156" change="8.2%" changeUp={true} linkText={t('viewAll')} onLinkClick={() => onNavigate?.('news')} color="blue" />
        <StatCard icon={AlertTriangle} label={lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending Review'} value={String(sectionArticles.length)} change={lang === 'bn' ? '▲ জরুরি' : '▲ Urgent'} changeUp={false} linkText={lang === 'bn' ? 'পর্যালোচনা →' : 'Review →'} onLinkClick={() => onNavigate?.('news-pending')} color="red" />
        <StatCard icon={Users} label={lang === 'bn' ? 'অধীনস্থ সাংবাদিক' : 'Assigned Reporters'} value="4" change={lang === 'bn' ? '২ জন সক্রিয়' : '2 active'} changeUp={true} linkText={lang === 'bn' ? 'টিম দেখুন →' : 'View team →'} onLinkClick={() => onNavigate?.('dashboard')} color="green" />
        <StatCard icon={TrendingUp} label={lang === 'bn' ? 'বিভাগের পাঠক' : 'Section Readers'} value="45,234" change="5.1%" changeUp={true} linkText={lang === 'bn' ? 'বিশ্লেষণ →' : 'Analyze →'} onLinkClick={() => onNavigate?.('traffic')} color="orange" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#3b82f6]" />
              {lang === 'bn' ? 'বিভাগীয় ট্র্যাফিক' : 'Section Traffic'}
            </h3>
          </div>
          <div className="px-5 pt-2.5">
            <LineChart data={[].pageViews} labels={lang === 'bn' ? [].labels : [].labelsEn} color="#3b82f6" gradientId="gBlue" />
          </div>
        </div>
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#e8001e]" />
              {lang === 'bn' ? 'দ্রুত কাজ' : 'Quick Actions'}
            </h3>
          </div>
          <div className="p-4.5">
            <QuickActions onAction={(id) => { if (id === 'write') onNavigate?.('news-write'); }} showToast={showToast} lang={lang} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-4.5 mb-5">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#8b5cf6]" />
              {lang === 'bn' ? 'সাম্প্রতিক কার্যক্রম' : 'Recent Activity'}
            </h3>
          </div>
          <div className="p-4 pt-1.5">
            <ActivityFeed items={[].slice(0, 4)} />
          </div>
        </div>
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#e8001e]" />
              {lang === 'bn' ? 'সাম্প্রতিক সংবাদ' : 'Recent Articles'}
            </h3>
          </div>
          <div className="p-4 pt-1.5 space-y-0">
            {[].slice(0, 5).map((article, i) => (
              <div key={article.id} className="flex gap-3 py-2.75 border-b border-[#f3f4f6] last:border-0 items-start">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${i === 0 ? 'bg-[#fff0f2] text-[#e8001e]' : 'bg-[var(--body-bg,#f0f2f8)] text-[var(--text-muted,#9ca3af)]'}`}>
                  {i + 1}
                </div>
                <div>
                  <div className="text-[12.5px] font-semibold text-[var(--text-primary,#1a1d2e)] leading-relaxed">{lang === 'bn' ? article.titleBn : article.titleEn}</div>
                  <div className="text-[11px] text-[var(--text-muted,#9ca3af)] mt-0.75 flex gap-2.5">
                    <span>{typeof article.author === 'object' ? article.author?.name : (article.author || '—')}</span>
                    <Badge variant={article.status === 'published' ? 'green' : article.status === 'pending' ? 'orange' : 'gray'}>
                      {article.status}
                    </Badge>
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

