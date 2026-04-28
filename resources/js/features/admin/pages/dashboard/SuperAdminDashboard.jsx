import { Newspaper, Users, MessageSquare, CreditCard, Shield, Activity, TrendingUp, Zap, Globe, Server, Database, Lock, Eye, Clock, CalendarDays, Award } from 'lucide-react';
import { StatCard, MiniStat } from '../../components/widgets/StatCard';
import { LineChart } from '../../components/charts/LineChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { CategoryBar } from '../../components/widgets/CategoryBar';
import { QuickActions } from '../../components/widgets/QuickActions';
import { ActivityFeed } from '../../components/widgets/ActivityFeed';
import { ServerHealth } from '../../components/widgets/ServerHealth';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function SuperAdminDashboard({ 
  stats = {}, 
  miniStats = {}, 
  contentStatus = {}, 
  categoryBreakdown = [], 
  recentArticles = [], 
  traffic = {}, 
  activities = [], 
  serverHealth = {}, 
  schedule = [] 
}) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();

  const s = stats || {};
  const ms = miniStats || {};
  const cs = contentStatus || { total: 0, published: {count:0, pct:0}, draft:{count:0, pct:0}, pending:{count:0, pct:0}, archived:{count:0, pct:0} };

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5 row-anim">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">🛠️ {lang === 'bn' ? 'সুপার এডমিন ড্যাশবোর্ড' : 'Super Admin Dashboard'}</h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'সিস্টেম প্রশাসন ও প্রযুক্তিগত তদারকি' : 'Full system administration and technical oversight'}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.75 bg-[#eff6ff] text-[#3b82f6] rounded-lg text-xs font-bold flex items-center gap-1.5 border border-[#bfdbfe]">
            <Shield size={14} /> System Secure
          </div>
          <div className="text-xs text-[var(--text-muted,#9ca3af)] bg-white border border-[var(--card-border,#e8ebf4)] px-3.5 py-1.75 rounded-lg flex items-center gap-1.5">
             📅 <span>{new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5 row-anim">
        <StatCard icon={Users} label={lang === 'bn' ? 'মোট ব্যবহারকারী' : 'Total Users'} value="1,248" change="+12" changeUp={true} linkText={lang === 'bn' ? 'ইউজার দেখুন →' : 'Users →'} onLinkClick={() => onNavigate?.('users')} color="blue" />
        <StatCard icon={CreditCard} label={lang === 'bn' ? 'মাসিক আয়' : 'Monthly Revenue'} value={lang === 'bn' ? '৳ ৩.৪ লাখ' : '৳ 3.4L'} change="14.2%" changeUp={true} linkText={lang === 'bn' ? 'রিপোর্ট →' : 'Revenue →'} onLinkClick={() => onNavigate?.('revenue')} color="green" />
        <StatCard icon={Database} label={lang === 'bn' ? 'ডাটাবেস সাইজ' : 'DB Size'} value="1.2 GB" change="Optimal" changeUp={true} linkText={lang === 'bn' ? 'অপ্টিমাইজ →' : 'Optimize →'} onLinkClick={() => showToast('Optimizing DB...')} color="orange" />
        <StatCard icon={Zap} label={lang === 'bn' ? 'সিস্টেম লোড' : 'System Load'} value="0.24" change="Low" changeUp={true} linkText={lang === 'bn' ? 'সার্ভার →' : 'Server →'} onLinkClick={() => showToast('Server logs...')} color="red" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5 row-anim">
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold">{lang === 'bn' ? '📊 সিস্টেম ট্র্যাফিক' : '📊 System Traffic'}</h3>
          </div>
          <div className="px-5 pt-2.5 pb-5">
            <LineChart
              data={traffic.pageViews || []}
              labels={lang === 'bn' ? (traffic.labels || []) : (traffic.labelsEn || [])}
              color="#3b82f6"
              gradientId="gBlue"
            />
          </div>
        </div>
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden flex flex-col justify-center items-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-4 border border-green-100">
               <Shield size={32} />
            </div>
            <h4 className="font-bold text-lg mb-1">System Health</h4>
            <p className="text-xs text-gray-400 mb-6 uppercase tracking-widest font-semibold">Stability Score: 99.9%</p>
            <div className="w-full space-y-3">
               <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-500 flex items-center gap-2"><Server size={14} /> Backend</span>
                  <Badge variant="green">Online</Badge>
               </div>
               <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                  <span className="text-gray-500 flex items-center gap-2"><Database size={14} /> Database</span>
                  <Badge variant="green">Connected</Badge>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Globe size={14} /> Frontend</span>
                  <Badge variant="green">Live</Badge>
               </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr_320px] gap-4.5 mb-5 row-anim">
         <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
               <h3 className="text-sm font-bold">{lang === 'bn' ? '🗂️ বিভাগ অনুযায়ী কন্টেন্ট' : '🗂️ Content by Category'}</h3>
            </div>
            <div className="p-5">
               <CategoryBar items={categoryBreakdown} lang={lang} />
            </div>
         </div>
         <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
               <h3 className="text-sm font-bold">{lang === 'bn' ? '📈 অডিট লগ সারসংক্ষেপ' : '📈 Audit Log Summary'}</h3>
            </div>
            <div className="p-4 pt-1.5">
               <ActivityFeed items={activities} lang={lang} />
            </div>
         </div>
         <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
            <div className="p-5">
               <ServerHealth data={serverHealth} lang={lang} />
            </div>
         </div>
      </div>
    </div>
  );
}
