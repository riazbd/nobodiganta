import { router } from '@inertiajs/react';
import { TrendingUp, Banknote, BarChart3, Briefcase, Megaphone, Layers, Users, MousePointerClick, Clock, Info } from 'lucide-react';
import { StatCard } from '../../components/widgets/StatCard';
import { GroupedBarChart } from '../../components/charts/BarChart';
import { useLanguage } from '../../hooks/useLanguage';

export default function RevenueReport({ cards = {}, monthly = {}, bySlot = [], byClient = [], occupancy = [], topAds = [], expiringSoon = [] }) {
  const { lang } = useLanguage();
  const bn = lang === 'bn';

  const fmtNum = (n) => {
    const s = Number(n ?? 0).toLocaleString('en-IN');
    return bn ? s.replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d]) : s;
  };
  const taka = (n) => '৳ ' + fmtNum(Math.round(n ?? 0));

  return (
    <div>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <Banknote className="w-5 h-5 text-[#10b981]" />
            {bn ? 'বুকড রাজস্ব (বিজ্ঞাপন)' : 'Booked Revenue (Ads)'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{bn ? 'বিজ্ঞাপন বুকিং থেকে প্রকৃত চুক্তিমূল্য' : 'Real contracted value from ad bookings'}</p>
        </div>
        <button onClick={() => router.visit('/admin/ads')} className="bg-[#263238] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#1a2428] transition-colors">
          <Megaphone className="w-4 h-4" /> {bn ? 'অ্যাড প্যানেল' : 'Ad Panel'}
        </button>
      </div>

      <div className="bg-[#eff6ff] border border-[#bfdbfe] text-[#1e40af] rounded-lg px-4 py-2.5 mb-5 text-[12px] flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{bn
          ? 'এটি বুকড/চুক্তিবদ্ধ মূল্য — পেমেন্ট সংগ্রহের ব্যবস্থা এখনও সক্রিয় নয়, তাই এটি সংগৃহীত নগদ অর্থ নয়।'
          : 'These are booked/contracted values — there is no payment-collection system yet, so this is not collected cash.'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={Banknote} label={bn ? 'সক্রিয় বুকড মূল্য' : 'Active Booked Value'} value={taka(cards.activeBooked)} color="green" />
        <StatCard icon={TrendingUp} label={bn ? 'এই মাসের বুকিং' : 'Booked This Month'} value={taka(cards.bookedThisMonth)} change={cards.bookedTrend?.change} changeUp={cards.bookedTrend?.up} color="blue" />
        <StatCard icon={Briefcase} label={bn ? 'সক্রিয় ক্যাম্পেইন' : 'Active Campaigns'} value={fmtNum(cards.activeCampaigns)} color="red" />
        <StatCard icon={Layers} label={bn ? 'স্লট অকুপেন্সি' : 'Slot Occupancy'} value={`${cards.occupancy ?? 0}%`} color="orange" />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4.5 mb-4.5">
        {/* Monthly booked trend */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#263238]" />
              {bn ? 'মাসিক বুকিং (৬ মাস)' : 'Monthly Bookings (6 mo)'}
            </h3>
            <div className="text-xs text-[var(--text-muted,#9ca3af)] flex items-center gap-1">
              <span className="w-2 h-2 bg-[#263238] rounded-sm inline-block" />{bn ? 'বুকড মূল্য (৳)' : 'Booked value (৳)'}
            </div>
          </div>
          <div className="p-5">
            {(monthly.booked?.some(v => v > 0)) ? (
              <>
                <GroupedBarChart data1={monthly.booked} labels={bn ? monthly.labels : monthly.labelsEn} color1="#263238" height={170} />
                <div className="flex mt-1.5">
                  {(bn ? monthly.labels : monthly.labelsEn)?.map((l, i) => (
                    <div key={i} className="flex-1 text-center text-[10px] text-[var(--text-muted,#9ca3af)]">{l}</div>
                  ))}
                </div>
              </>
            ) : <div className="py-14 text-center text-[12.5px] text-[var(--text-muted,#9ca3af)]">{bn ? 'এই সময়ে কোনো বুকিং নেই' : 'No bookings in this period'}</div>}
          </div>
        </div>

        {/* Revenue by slot */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#10b981]" />
              {bn ? 'স্লট অনুযায়ী মূল্য' : 'Value by Slot'}
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {bySlot.length === 0 && <div className="text-[12.5px] text-[var(--text-muted,#9ca3af)] py-3 text-center">{bn ? 'কোনো সক্রিয় বুকিং নেই' : 'No active bookings'}</div>}
            {bySlot.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.25">
                  <span className="text-[var(--text-secondary,#6b7280)] truncate pr-2">{bn ? s.name : s.nameEn}</span>
                  <span className="font-bold text-[var(--text-primary,#1a1d2e)] flex-shrink-0">{taka(s.value)}</span>
                </div>
                <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.pct}%`, backgroundColor: '#263238' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4.5 mb-4.5">
        {/* Top advertisers */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3b82f6]" />
            {bn ? 'শীর্ষ বিজ্ঞাপনদাতা' : 'Top Advertisers'}
          </h3>
          <div className="space-y-2.5">
            {byClient.length === 0 && <div className="text-[12.5px] text-[var(--text-muted,#9ca3af)] py-3">{bn ? 'ডেটা নেই' : 'No data'}</div>}
            {byClient.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${i === 0 ? 'bg-[#eceff1] text-[#263238]' : 'bg-[var(--body-bg,#f0f2f8)] text-[var(--text-muted,#9ca3af)]'}`}>{fmtNum(i + 1)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--text-primary,#1a1d2e)] truncate">{c.name}</div>
                  <div className="text-[10.5px] text-[var(--text-muted,#9ca3af)]">{fmtNum(c.campaigns)} {bn ? 'ক্যাম্পেইন' : 'campaigns'}</div>
                </div>
                <span className="text-xs font-semibold font-['Inter'] text-[#10b981]">{taka(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Slot occupancy */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#f59e0b]" />
            {bn ? 'ইনভেন্টরি অকুপেন্সি' : 'Inventory Occupancy'}
          </h3>
          <div className="space-y-3">
            {occupancy.length === 0 && <div className="text-[12.5px] text-[var(--text-muted,#9ca3af)] py-3">{bn ? 'কোনো স্লট নেই' : 'No slots'}</div>}
            {occupancy.map((s, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-xs text-[var(--text-secondary,#6b7280)] flex-1 truncate">{bn ? s.name : s.nameEn}</span>
                <div className="w-20 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.pct >= 100 ? '#ef4444' : '#10b981' }} />
                </div>
                <span className="text-[11px] font-bold font-['Inter'] w-12 text-right">{fmtNum(s.occupied)}/{fmtNum(s.capacity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top ads by clicks */}
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-[#263238]" />
            {bn ? 'পারফর্মিং বিজ্ঞাপন' : 'Performing Ads'}
          </h3>
          <div className="space-y-2.5">
            {topAds.length === 0 && <div className="text-[12.5px] text-[var(--text-muted,#9ca3af)] py-3">{bn ? 'ডেটা নেই' : 'No data'}</div>}
            {topAds.map((a, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[var(--text-primary,#1a1d2e)] truncate">{a.title}</div>
                  <div className="text-[10.5px] text-[var(--text-muted,#9ca3af)]">{fmtNum(a.clicks)} {bn ? 'ক্লিক' : 'clicks'} · {fmtNum(a.impressions)} {bn ? 'ইম্প্রেশন' : 'impr'}</div>
                </div>
                <span className="text-xs font-semibold font-['Inter'] text-[#3b82f6]">{a.ctr}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expiring soon */}
      {expiringSoon.length > 0 && (
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden mb-4.5">
          <div className="px-5 py-4 border-b border-[var(--card-border,#e8ebf4)]">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f59e0b]" />
              {bn ? 'শীঘ্রই মেয়াদ শেষ (১৪ দিন)' : 'Expiring Soon (14 days)'}
            </h3>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {[bn ? 'বিজ্ঞাপন' : 'Ad', bn ? 'ক্লায়েন্ট' : 'Client', bn ? 'মেয়াদ শেষ' : 'Ends', bn ? 'বাকি' : 'Left', bn ? 'মূল্য' : 'Value'].map((h, i) => (
                  <th key={i} className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-2.5 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expiringSoon.map((a, i) => (
                <tr key={i} className="hover:bg-[#fafbff] transition-colors">
                  <td className="px-4 py-2.75 text-[12.5px] font-semibold text-[var(--text-primary,#1a1d2e)] border-b border-[#f3f4f6]">{a.title}</td>
                  <td className="px-4 py-2.75 text-[12.5px] text-[var(--text-secondary,#6b7280)] border-b border-[#f3f4f6]">{a.client || '—'}</td>
                  <td className="px-4 py-2.75 text-[12.5px] text-[var(--text-secondary,#6b7280)] border-b border-[#f3f4f6] font-['Inter']">{a.endDate}</td>
                  <td className="px-4 py-2.75 border-b border-[#f3f4f6]">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${a.daysLeft <= 3 ? 'bg-[#fef2f2] text-[#ef4444]' : 'bg-[#fffbeb] text-[#f59e0b]'}`}>
                      {fmtNum(a.daysLeft)} {bn ? 'দিন' : 'days'}
                    </span>
                  </td>
                  <td className="px-4 py-2.75 text-[12.5px] font-semibold text-[#10b981] border-b border-[#f3f4f6]">{taka(a.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
