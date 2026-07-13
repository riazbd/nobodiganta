import { useState } from 'react';
import {
  Megaphone, Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Search, X,
  Image as ImageIcon, ExternalLink, Calendar, TrendingUp, BarChart3,
  DollarSign, Users, LayoutGrid, Building2, Clock, AlertTriangle, Layers,
} from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { router } from '@inertiajs/react';
import MediaLibraryModal from '../components/media/MediaLibraryModal';

const SLOT_SIZES = ['leaderboard', 'mrec', 'half-page', 'billboard', 'in-article', 'mobile-banner'];

const DEFAULT_POPUP_CFG = {
  triggers: {
    delay:          { enabled: true,  seconds: 3 },
    scroll:         { enabled: false, percent: 50 },
    exit_intent:    { enabled: false },
    min_page_views: { enabled: false, count: 2 },
  },
  frequency: {
    max_shows:  { enabled: true,  count: 1, per: 'session' },
    cooldown:   { enabled: false, minutes: 30 },
    on_dismiss: { enabled: false, hours: 24 },
    on_click:   { enabled: false, days: 7 },
  },
  targeting: { pages: 'all', devices: 'all' },
};

export default function AdsManagement({ ads = [], clients = [], slots = [], analytics = {}, filters = {} }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const l = (bn, en) => (lang === 'bn' ? bn : en);
  const money = (v) => `৳ ${Number(v || 0).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-IN')}`;
  const num = (v) => Number(v || 0).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-IN');

  const [tab, setTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  // ── Campaign (ad) modal ───────────────────────────────────────────────────
  const emptyAd = {
    titleBn: '', titleEn: '', image: '', video_url: '', link: '',
    clientId: '', slotId: '', position: 'home_top', type: 'image', code: '',
    pricingModel: 'flat', price: '', cpmRate: '',
    startDate: '', endDate: '', isActive: true, sortOrder: 0,
    popupConfig: DEFAULT_POPUP_CFG,
  };
  const [adModal, setAdModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [adForm, setAdForm] = useState(emptyAd);

  const openAddAd = () => { setEditingAd(null); setAdForm(emptyAd); setAdModal(true); };
  const openEditAd = (ad) => {
    setEditingAd(ad);
    setAdForm({
      titleBn: ad.title || '', titleEn: ad.titleEn || '', image: ad.image || '',
      video_url: ad.video_url || '', link: ad.link || '',
      clientId: ad.clientId || '', slotId: ad.slotId || '', position: ad.position || 'home_top',
      type: ad.type || 'image', code: ad.code || '',
      pricingModel: ad.pricingModel || 'flat', price: ad.price ?? '', cpmRate: ad.cpmRate ?? '',
      startDate: ad.startDate || '', endDate: ad.endDate || '', isActive: ad.isActive, sortOrder: ad.sortOrder || 0,
      popupConfig: ad.popupConfig || DEFAULT_POPUP_CFG,
    });
    setAdModal(true);
  };
  const setCfg = (path, value) => setAdForm(prev => {
    const cfg = JSON.parse(JSON.stringify(prev.popupConfig || DEFAULT_POPUP_CFG));
    const keys = path.split('.');
    let o = cfg;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = value;
    return { ...prev, popupConfig: cfg };
  });

  const submitAd = () => {
    if (!adForm.titleBn || !adForm.titleEn) { showToast(l('শিরোনাম আবশ্যক', 'Title is required'), 'error'); return; }
    const opts = { onSuccess: () => { setAdModal(false); showToast(l('সংরক্ষিত হয়েছে', 'Saved')); }, onError: () => showToast(l('ত্রুটি ঘটেছে', 'An error occurred'), 'error') };
    editingAd
      ? router.put(route('admin.ads.update', editingAd.id), adForm, opts)
      : router.post(route('admin.ads.store'), adForm, opts);
  };
  const toggleAd = (id) => router.patch(route('admin.ads.toggle', id), {}, { preserveScroll: true, onSuccess: () => showToast(l('অবস্থা পরিবর্তন হয়েছে', 'Status updated')) });
  const deleteAd = (id) => { if (confirm(l('আপনি কি নিশ্চিত?', 'Are you sure?'))) router.delete(route('admin.ads.destroy', id), { preserveScroll: true, onSuccess: () => showToast(l('মুছে ফেলা হয়েছে', 'Deleted')) }); };

  // ── Client modal ──────────────────────────────────────────────────────────
  const emptyClient = { name: '', contactPerson: '', email: '', phone: '', website: '', notes: '', isActive: true };
  const [clientModal, setClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientForm, setClientForm] = useState(emptyClient);
  const openAddClient = () => { setEditingClient(null); setClientForm(emptyClient); setClientModal(true); };
  const openEditClient = (c) => {
    setEditingClient(c);
    setClientForm({ name: c.name || '', contactPerson: c.contactPerson || '', email: c.email || '', phone: c.phone || '', website: c.website || '', notes: c.notes || '', isActive: c.isActive });
    setClientModal(true);
  };
  const submitClient = () => {
    if (!clientForm.name) { showToast(l('নাম আবশ্যক', 'Name is required'), 'error'); return; }
    const opts = { onSuccess: () => { setClientModal(false); showToast(l('সংরক্ষিত হয়েছে', 'Saved')); }, onError: () => showToast(l('ত্রুটি ঘটেছে', 'An error occurred'), 'error') };
    editingClient
      ? router.put(route('admin.ad-clients.update', editingClient.id), clientForm, opts)
      : router.post(route('admin.ad-clients.store'), clientForm, opts);
  };
  const deleteClient = (id) => { if (confirm(l('ক্লায়েন্ট মুছবেন? ক্যাম্পেইন থেকে যাবে কিন্তু আনলিংকড হবে।', 'Delete client? Campaigns stay but become unlinked.'))) router.delete(route('admin.ad-clients.destroy', id), { preserveScroll: true, onSuccess: () => showToast(l('মুছে ফেলা হয়েছে', 'Deleted')) }); };

  // ── Slot modal ────────────────────────────────────────────────────────────
  const emptySlot = { key: '', nameBn: '', nameEn: '', description: '', size: 'mrec', dimensions: '', rate: '', rateCpm: '', capacity: 1, isActive: true, sortOrder: 0 };
  const [slotModal, setSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState(emptySlot);
  const openAddSlot = () => { setEditingSlot(null); setSlotForm(emptySlot); setSlotModal(true); };
  const openEditSlot = (s) => {
    setEditingSlot(s);
    setSlotForm({ key: s.key || '', nameBn: s.name || '', nameEn: s.nameEn || '', description: s.description || '', size: s.size || 'mrec', dimensions: s.dimensions || '', rate: s.rate ?? '', rateCpm: s.rateCpm ?? '', capacity: s.capacity ?? 1, isActive: s.isActive, sortOrder: s.sortOrder || 0 });
    setSlotModal(true);
  };
  const submitSlot = () => {
    if (!slotForm.nameBn || !slotForm.nameEn) { showToast(l('নাম আবশ্যক', 'Name is required'), 'error'); return; }
    const opts = { onSuccess: () => { setSlotModal(false); showToast(l('সংরক্ষিত হয়েছে', 'Saved')); }, onError: (e) => showToast(e?.key || l('ত্রুটি ঘটেছে', 'An error occurred'), 'error') };
    editingSlot
      ? router.put(route('admin.ad-slots.update', editingSlot.id), slotForm, opts)
      : router.post(route('admin.ad-slots.store'), slotForm, opts);
  };
  const deleteSlot = (id) => { if (confirm(l('স্লট মুছবেন?', 'Delete slot?'))) router.delete(route('admin.ad-slots.destroy', id), { preserveScroll: true, onSuccess: () => showToast(l('মুছে ফেলা হয়েছে', 'Deleted')) }); };

  const handleSearch = (e) => { e.preventDefault(); router.get(route('admin.ads'), { search: searchQuery }, { preserveState: true }); };

  const TABS = [
    { id: 'overview', label: l('ওভারভিউ', 'Overview'), icon: BarChart3 },
    { id: 'campaigns', label: l('ক্যাম্পেইন', 'Campaigns'), icon: Megaphone },
    { id: 'clients', label: l('ক্লায়েন্ট', 'Clients'), icon: Building2 },
    { id: 'inventory', label: l('ইনভেন্টরি', 'Inventory'), icon: LayoutGrid },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] flex items-center gap-3">
          <Megaphone className="w-7 h-7 text-[#263238]" /> {l('বিজ্ঞাপন প্যানেল', 'Ad Panel')}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-[#263238] text-[#263238]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiTile icon={DollarSign} color="green" label={l('চলমান চুক্তি মূল্য', 'Active Contract Value')} value={money(analytics.activeContractValue)} />
            <KpiTile icon={TrendingUp} color="blue" label={l('এই মাসে বুকড', 'Booked This Month')} value={money(analytics.bookedThisMonth)} />
            <KpiTile icon={Megaphone} color="red" label={l('চলমান ক্যাম্পেইন', 'Active Campaigns')} value={num(analytics.activeCampaigns)} />
            <KpiTile icon={Layers} color="orange" label={l('সামগ্রিক অকুপেন্সি', 'Overall Occupancy')} value={`${analytics.overallOccupancy || 0}%`} sub={`${num(analytics.totalOccupied)} / ${num(analytics.totalCapacity)}`} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiTile icon={BarChart3} color="blue" label={l('মোট ইমপ্রেশন', 'Total Impressions')} value={num(analytics.totalImpressions)} />
            <KpiTile icon={ExternalLink} color="green" label={l('মোট ক্লিক', 'Total Clicks')} value={num(analytics.totalClicks)} />
            <KpiTile icon={TrendingUp} color="red" label={l('গড় CTR', 'Avg CTR')} value={`${analytics.avgCtr || 0}%`} />
            <KpiTile icon={Users} color="orange" label={l('ক্লায়েন্ট', 'Clients')} value={num(analytics.clientsCount)} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title={l('স্লট অকুপেন্সি', 'Slot Occupancy')}>
              <div className="space-y-3">
                {slots.map(s => (
                  <div key={s.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">{l(s.name, s.nameEn)}</span>
                      <span className="text-gray-400">{s.occupied}/{s.capacity} · {s.available} {l('খালি', 'free')}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.pct >= 100 ? '#ef4444' : s.pct >= 70 ? '#f59e0b' : '#10b981' }} />
                    </div>
                  </div>
                ))}
                {slots.length === 0 && <Empty text={l('কোনো স্লট নেই', 'No slots')} />}
              </div>
            </Card>

            <div className="grid grid-rows-2 gap-5">
              <Card title={l('স্লট অনুযায়ী আয়', 'Revenue by Slot')}>
                <BarList items={analytics.revenueBySlot} money={money} />
              </Card>
              <Card title={l('ক্লায়েন্ট অনুযায়ী আয়', 'Revenue by Client')}>
                <BarList items={analytics.revenueByClient} money={money} />
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card title={l('সেরা পারফর্মিং বিজ্ঞাপন', 'Top Performing Ads')}>
              <table className="w-full text-sm">
                <thead><tr className="text-[10px] uppercase text-gray-400 text-left"><th className="py-1.5">{l('শিরোনাম', 'Title')}</th><th>Impr.</th><th>Clicks</th><th>CTR</th></tr></thead>
                <tbody>
                  {(analytics.topAds || []).map((a, i) => (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="py-2 font-medium text-gray-700 truncate max-w-[160px]">{a.title}</td>
                      <td className="text-gray-500">{num(a.impressions)}</td>
                      <td className="text-gray-500">{num(a.clicks)}</td>
                      <td className="font-bold text-[#263238]">{a.ctr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(analytics.topAds || []).length === 0 && <Empty text={l('কোনো তথ্য নেই', 'No data')} />}
            </Card>

            <Card title={l('শীঘ্রই মেয়াদ শেষ', 'Expiring Soon')}>
              <div className="space-y-2">
                {(analytics.expiringSoon || []).map((a, i) => (
                  <div key={i} className="flex items-center justify-between bg-amber-50/60 border border-amber-100 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-800 truncate max-w-[180px]">{a.title}</div>
                      <div className="text-[11px] text-gray-400">{a.client || '—'} · {a.endDate}</div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1"><Clock className="w-3 h-3" /> {a.daysLeft} {l('দিন', 'd')}</span>
                  </div>
                ))}
                {(analytics.expiringSoon || []).length === 0 && <Empty text={l('৭ দিনের মধ্যে কিছু শেষ হচ্ছে না', 'Nothing expiring in 7 days')} />}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── CAMPAIGNS ────────────────────────────────────────────────────── */}
      {tab === 'campaigns' && (
        <div>
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 gap-3 w-full max-w-md shadow-sm">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder={l('বিজ্ঞাপন / ক্লায়েন্ট খুঁজুন...', 'Search ads / clients...')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="border-none bg-transparent outline-none text-sm w-full focus:ring-0" />
              {searchQuery && <button type="button" onClick={() => { setSearchQuery(''); router.get(route('admin.ads')); }}><X size={16} className="text-gray-400" /></button>}
            </form>
            <button onClick={openAddAd} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow"><Plus className="w-4 h-4" /> {l('নতুন ক্যাম্পেইন', 'New Campaign')}</button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {ads.length > 0 ? ads.map(ad => (
              <div key={ad.id} className={`bg-white border rounded-2xl shadow-sm overflow-hidden group ${!ad.isActive ? 'opacity-70 bg-gray-50/50' : 'border-gray-100 hover:shadow-md'}`}>
                <div className="flex">
                  <div className="w-40 h-auto bg-gray-100 flex-shrink-0 flex items-center justify-center border-r border-gray-50">
                    {ad.image ? <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-1 text-gray-400 py-8"><ImageIcon size={22} /><span className="text-[9px] font-bold uppercase">{ad.type}</span></div>}
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{l(ad.title, ad.titleEn)}</h3>
                        <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <Building2 className="w-3 h-3" />{ad.clientName || l('ক্লায়েন্ট নেই', 'No client')}
                          <span className="text-gray-300">·</span>
                          <span className="text-[#263238] font-semibold">{ad.slotName || ad.position}</span>
                        </div>
                      </div>
                      <Badge variant={ad.isActive ? 'green' : 'gray'} className="text-[9px] px-1.5 py-0">{ad.isActive ? 'ACTIVE' : 'OFF'}</Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-2 my-3">
                      <Mini label="Impr." value={num(ad.impressions)} />
                      <Mini label="Clicks" value={num(ad.clicks)} />
                      <Mini label="CTR" value={`${ad.ctr}%`} accent />
                      <Mini label={l('মূল্য', 'Value')} value={money(ad.value)} accent />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Calendar size={11} /> {ad.startDate || '—'} → {ad.endDate || '∞'}
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-bold uppercase">{ad.pricingModel === 'cpm' ? 'CPM' : l('ফ্ল্যাট', 'FLAT')}</span>
                      </span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => toggleAd(ad.id)} className={`p-1.5 rounded-lg ${ad.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>{ad.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}</button>
                        <button onClick={() => openEditAd(ad)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"><Edit3 size={15} /></button>
                        <button onClick={() => deleteAd(ad.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : <Empty full text={l('কোনো ক্যাম্পেইন নেই', 'No campaigns yet')} />}
          </div>
        </div>
      )}

      {/* ── CLIENTS ──────────────────────────────────────────────────────── */}
      {tab === 'clients' && (
        <div>
          <div className="flex justify-end mb-5">
            <button onClick={openAddClient} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] shadow"><Plus className="w-4 h-4" /> {l('নতুন ক্লায়েন্ট', 'New Client')}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clients.length > 0 ? clients.map(c => (
              <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#eceff1] flex items-center justify-center text-[#263238] font-bold flex-shrink-0">{c.name?.charAt(0)?.toUpperCase()}</div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{c.name}</h3>
                      <div className="text-[11px] text-gray-400">{c.adsCount} {l('ক্যাম্পেইন', 'campaigns')}</div>
                    </div>
                  </div>
                  <Badge variant={c.isActive ? 'green' : 'gray'} className="text-[9px] px-1.5 py-0">{c.isActive ? 'ACTIVE' : 'OFF'}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  {c.contactPerson && <div>👤 {c.contactPerson}</div>}
                  {c.email && <div className="truncate">✉ {c.email}</div>}
                  {c.phone && <div>☎ {c.phone}</div>}
                </div>
                <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => openEditClient(c)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"><Edit3 size={15} /></button>
                  <button onClick={() => deleteClient(c.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                </div>
              </div>
            )) : <Empty full text={l('কোনো ক্লায়েন্ট নেই', 'No clients yet')} />}
          </div>
        </div>
      )}

      {/* ── INVENTORY ────────────────────────────────────────────────────── */}
      {tab === 'inventory' && (
        <div>
          <div className="flex justify-end mb-5">
            <button onClick={openAddSlot} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] shadow"><Plus className="w-4 h-4" /> {l('নতুন স্লট', 'New Slot')}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {slots.length > 0 ? slots.map(s => (
              <div key={s.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{l(s.name, s.nameEn)}</h3>
                    <div className="text-[11px] text-gray-400 font-mono">{s.key} · {s.size}{s.dimensions ? ` · ${s.dimensions}` : ''}</div>
                  </div>
                  <Badge variant={s.isActive ? 'green' : 'gray'} className="text-[9px] px-1.5 py-0">{s.isActive ? 'ON' : 'OFF'}</Badge>
                </div>
                <div className="flex items-center gap-3 mb-3 text-xs">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1"><span className="text-gray-400">{l('অকুপেন্সি', 'Occupancy')}</span><span className="font-bold">{s.occupied}/{s.capacity}</span></div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.pct >= 100 ? '#ef4444' : s.pct >= 70 ? '#f59e0b' : '#10b981' }} /></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg px-3 py-2"><div className="text-gray-400 text-[10px] uppercase">{l('ফ্ল্যাট রেট', 'Flat Rate')}</div><div className="font-bold text-gray-800">{s.rate != null ? money(s.rate) : '—'}</div></div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2"><div className="text-gray-400 text-[10px] uppercase">CPM</div><div className="font-bold text-gray-800">{s.rateCpm != null ? money(s.rateCpm) : '—'}</div></div>
                </div>
                <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => openEditSlot(s)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"><Edit3 size={15} /></button>
                  <button onClick={() => deleteSlot(s.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                </div>
              </div>
            )) : <Empty full text={l('কোনো স্লট নেই', 'No slots yet')} />}
          </div>
        </div>
      )}

      {/* ── Campaign modal ───────────────────────────────────────────────── */}
      {adModal && (
        <Modal title={editingAd ? l('ক্যাম্পেইন সম্পাদনা', 'Edit Campaign') : l('নতুন ক্যাম্পেইন', 'New Campaign')} onClose={() => setAdModal(false)} wide>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={l('শিরোনাম (বাংলা)', 'Title (Bangla)') + ' *'}><input value={adForm.titleBn} onChange={e => setAdForm({ ...adForm, titleBn: e.target.value })} className={inp} /></Field>
            <Field label={l('শিরোনাম (ইংরেজি)', 'Title (English)') + ' *'}><input value={adForm.titleEn} onChange={e => setAdForm({ ...adForm, titleEn: e.target.value })} className={inp} /></Field>
            <Field label={l('ক্লায়েন্ট', 'Client')}>
              <select value={adForm.clientId} onChange={e => setAdForm({ ...adForm, clientId: e.target.value })} className={inp}>
                <option value="">{l('— কোনোটি না —', '— none —')}</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label={l('স্লট', 'Slot')}>
              <select value={adForm.slotId} onChange={e => setAdForm({ ...adForm, slotId: e.target.value })} className={inp}>
                <option value="">{l('— ম্যানুয়াল পজিশন —', '— manual position —')}</option>
                {slots.map(s => <option key={s.id} value={s.id}>{l(s.name, s.nameEn)} ({s.available} {l('খালি', 'free')})</option>)}
              </select>
            </Field>
            {!adForm.slotId && (
              <Field label={l('পজিশন', 'Position')}>
                <select value={adForm.position} onChange={e => setAdForm({ ...adForm, position: e.target.value })} className={inp}>
                  {['header', 'popup', 'home_top', 'mid_home', 'home_bottom', 'sidebar_top', 'sidebar_middle', 'in_article', 'article_bottom', 'category_middle', 'between_sections', 'photocard_top', 'photocard_bottom'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            )}
            <Field label={l('টাইপ', 'Type')}>
              <select value={adForm.type} onChange={e => setAdForm({ ...adForm, type: e.target.value })} className={inp}>
                <option value="image">Image Banner</option><option value="google_ad">Google AdSense</option><option value="video">Video Ad</option><option value="script">Javascript</option><option value="html">Custom HTML</option>
              </select>
            </Field>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Field label={l('মূল্য মডেল', 'Pricing Model')}>
              <select value={adForm.pricingModel} onChange={e => setAdForm({ ...adForm, pricingModel: e.target.value })} className={inp}>
                <option value="flat">{l('ফ্ল্যাট মূল্য', 'Flat price')}</option>
                <option value="cpm">CPM</option>
              </select>
            </Field>
            {adForm.pricingModel === 'flat' ? (
              <Field label={l('চুক্তি মূল্য (৳)', 'Agreed Price (৳)')}><input type="number" min="0" value={adForm.price} onChange={e => setAdForm({ ...adForm, price: e.target.value })} className={inp} placeholder="0" /></Field>
            ) : (
              <Field label={l('CPM রেট (৳)', 'CPM Rate (৳)')}><input type="number" min="0" value={adForm.cpmRate} onChange={e => setAdForm({ ...adForm, cpmRate: e.target.value })} className={inp} placeholder="0" /></Field>
            )}
            <Field label={l('ক্রম', 'Sort Order')}><input type="number" value={adForm.sortOrder} onChange={e => setAdForm({ ...adForm, sortOrder: e.target.value })} className={inp} /></Field>
          </div>

          {/* Creative */}
          {(adForm.type === 'image' || adForm.type === 'video') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Field label={adForm.type === 'video' ? l('পোস্টার ছবি', 'Poster Image') : l('ব্যানার ছবি', 'Banner Image')}>
                <div onClick={() => setShowMediaLibrary(true)} className="w-full h-11 border border-dashed border-gray-200 rounded-xl flex items-center px-4 gap-2 cursor-pointer hover:bg-gray-50"><ImageIcon size={16} className="text-gray-400" /><span className="text-xs text-gray-500 truncate">{adForm.image || l('মিডিয়া লাইব্রেরি থেকে নিন...', 'Choose from media...')}</span></div>
              </Field>
              {adForm.type === 'video'
                ? <Field label={l('ভিডিও URL', 'Video URL')}><input type="url" value={adForm.video_url} onChange={e => setAdForm({ ...adForm, video_url: e.target.value })} className={inp} placeholder="https://..." /></Field>
                : <Field label={l('লিঙ্ক', 'Link')}><input type="url" value={adForm.link} onChange={e => setAdForm({ ...adForm, link: e.target.value })} className={inp} placeholder="https://..." /></Field>}
            </div>
          )}
          {(adForm.type === 'html' || adForm.type === 'google_ad' || adForm.type === 'script') && (
            <Field label={l('কোড', 'Ad Code / HTML / JS')} className="mt-4"><textarea rows="5" value={adForm.code} onChange={e => setAdForm({ ...adForm, code: e.target.value })} className={`${inp} font-mono`} /></Field>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label={l('শুরু তারিখ', 'Start Date')}><input type="date" value={adForm.startDate} onChange={e => setAdForm({ ...adForm, startDate: e.target.value })} className={inp} /></Field>
            <Field label={l('শেষ তারিখ', 'End Date')}><input type="date" value={adForm.endDate} onChange={e => setAdForm({ ...adForm, endDate: e.target.value })} className={inp} /></Field>
          </div>
          <label className="flex items-center gap-2 mt-4 text-sm text-gray-600"><input type="checkbox" checked={adForm.isActive} onChange={e => setAdForm({ ...adForm, isActive: e.target.checked })} /> {l('সক্রিয়', 'Active')}</label>

          {adForm.position === 'popup' && (() => {
            const c = adForm.popupConfig || DEFAULT_POPUP_CFG;
            const row = 'flex items-center gap-2 text-sm text-gray-700 flex-wrap';
            const numCls = 'w-20 border rounded px-2 py-1 text-sm';
            const sel = 'border rounded px-2 py-1 text-sm';
            return (
              <div className="mt-4 border-t pt-4 space-y-4">
                <div className="font-bold text-sm text-[#263238]">{l('পপ-আপ আচরণ', 'Popup behaviour')}</div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-gray-400">{l('ট্রিগার', 'Triggers')}</div>
                  <label className={row}><input type="checkbox" checked={c.triggers.delay.enabled} onChange={e => setCfg('triggers.delay.enabled', e.target.checked)} /> {l('লোডের পর দেরি (সেকেন্ড)', 'Delay after load (sec)')}
                    <input type="number" min="0" max="120" value={c.triggers.delay.seconds} onChange={e => setCfg('triggers.delay.seconds', +e.target.value)} className={numCls} /></label>
                  <label className={row}><input type="checkbox" checked={c.triggers.scroll.enabled} onChange={e => setCfg('triggers.scroll.enabled', e.target.checked)} /> {l('স্ক্রল গভীরতা (%)', 'Scroll depth (%)')}
                    <input type="number" min="1" max="100" value={c.triggers.scroll.percent} onChange={e => setCfg('triggers.scroll.percent', +e.target.value)} className={numCls} /></label>
                  <label className={row}><input type="checkbox" checked={c.triggers.exit_intent.enabled} onChange={e => setCfg('triggers.exit_intent.enabled', e.target.checked)} /> {l('এক্সিট ইনটেন্ট', 'Exit intent')}</label>
                  <label className={row}><input type="checkbox" checked={c.triggers.min_page_views.enabled} onChange={e => setCfg('triggers.min_page_views.enabled', e.target.checked)} /> {l('সর্বনিম্ন পেজ ভিউ', 'Min page views')}
                    <input type="number" min="1" max="50" value={c.triggers.min_page_views.count} onChange={e => setCfg('triggers.min_page_views.count', +e.target.value)} className={numCls} /></label>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-gray-400">{l('ফ্রিকোয়েন্সি', 'Frequency')}</div>
                  <label className={row}><input type="checkbox" checked={c.frequency.max_shows.enabled} onChange={e => setCfg('frequency.max_shows.enabled', e.target.checked)} /> {l('সর্বোচ্চ বার', 'Max shows')}
                    <input type="number" min="1" max="50" value={c.frequency.max_shows.count} onChange={e => setCfg('frequency.max_shows.count', +e.target.value)} className={numCls} />
                    <select value={c.frequency.max_shows.per} onChange={e => setCfg('frequency.max_shows.per', e.target.value)} className={sel}>
                      <option value="session">{l('প্রতি সেশন', 'per session')}</option>
                      <option value="day">{l('প্রতি দিন', 'per day')}</option>
                      <option value="lifetime">{l('সর্বমোট', 'lifetime')}</option>
                    </select></label>
                  <label className={row}><input type="checkbox" checked={c.frequency.cooldown.enabled} onChange={e => setCfg('frequency.cooldown.enabled', e.target.checked)} /> {l('কুলডাউন (মিনিট)', 'Cooldown (min)')}
                    <input type="number" min="1" max="10080" value={c.frequency.cooldown.minutes} onChange={e => setCfg('frequency.cooldown.minutes', +e.target.value)} className={numCls} /></label>
                  <label className={row}><input type="checkbox" checked={c.frequency.on_dismiss.enabled} onChange={e => setCfg('frequency.on_dismiss.enabled', e.target.checked)} /> {l('বন্ধ করার পর থামুন (ঘণ্টা, ০=চিরতরে)', 'Stop after dismiss (hrs, 0=forever)')}
                    <input type="number" min="0" max="8760" value={c.frequency.on_dismiss.hours} onChange={e => setCfg('frequency.on_dismiss.hours', +e.target.value)} className={numCls} /></label>
                  <label className={row}><input type="checkbox" checked={c.frequency.on_click.enabled} onChange={e => setCfg('frequency.on_click.enabled', e.target.checked)} /> {l('ক্লিকের পর থামুন (দিন)', 'Stop after click (days)')}
                    <input type="number" min="0" max="365" value={c.frequency.on_click.days} onChange={e => setCfg('frequency.on_click.days', +e.target.value)} className={numCls} /></label>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-gray-400">{l('টার্গেটিং', 'Targeting')}</div>
                  <label className={row}>{l('পেজ', 'Pages')}
                    <select value={c.targeting.pages} onChange={e => setCfg('targeting.pages', e.target.value)} className={sel}>
                      <option value="all">{l('সব', 'all')}</option><option value="home">{l('হোম', 'home')}</option>
                      <option value="article">{l('আর্টিকেল', 'article')}</option><option value="category">{l('ক্যাটাগরি', 'category')}</option>
                    </select></label>
                  <label className={row}>{l('ডিভাইস', 'Devices')}
                    <select value={c.targeting.devices} onChange={e => setCfg('targeting.devices', e.target.value)} className={sel}>
                      <option value="all">{l('সব', 'all')}</option><option value="desktop">{l('ডেস্কটপ', 'desktop')}</option><option value="mobile">{l('মোবাইল', 'mobile')}</option>
                    </select></label>
                </div>
              </div>
            );
          })()}

          <ModalActions onCancel={() => setAdModal(false)} onSave={submitAd} l={l} />
        </Modal>
      )}

      {/* ── Client modal ─────────────────────────────────────────────────── */}
      {clientModal && (
        <Modal title={editingClient ? l('ক্লায়েন্ট সম্পাদনা', 'Edit Client') : l('নতুন ক্লায়েন্ট', 'New Client')} onClose={() => setClientModal(false)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={l('কোম্পানির নাম', 'Company Name') + ' *'}><input value={clientForm.name} onChange={e => setClientForm({ ...clientForm, name: e.target.value })} className={inp} /></Field>
            <Field label={l('যোগাযোগ ব্যক্তি', 'Contact Person')}><input value={clientForm.contactPerson} onChange={e => setClientForm({ ...clientForm, contactPerson: e.target.value })} className={inp} /></Field>
            <Field label={l('ইমেইল', 'Email')}><input type="email" value={clientForm.email} onChange={e => setClientForm({ ...clientForm, email: e.target.value })} className={inp} /></Field>
            <Field label={l('ফোন', 'Phone')}><input value={clientForm.phone} onChange={e => setClientForm({ ...clientForm, phone: e.target.value })} className={inp} /></Field>
            <Field label={l('ওয়েবসাইট', 'Website')}><input value={clientForm.website} onChange={e => setClientForm({ ...clientForm, website: e.target.value })} className={inp} placeholder="https://..." /></Field>
            <Field label={l('স্ট্যাটাস', 'Status')}>
              <select value={clientForm.isActive ? '1' : '0'} onChange={e => setClientForm({ ...clientForm, isActive: e.target.value === '1' })} className={inp}><option value="1">{l('সক্রিয়', 'Active')}</option><option value="0">{l('নিষ্ক্রিয়', 'Inactive')}</option></select>
            </Field>
          </div>
          <Field label={l('নোট', 'Notes')} className="mt-4"><textarea rows="3" value={clientForm.notes} onChange={e => setClientForm({ ...clientForm, notes: e.target.value })} className={inp} /></Field>
          <ModalActions onCancel={() => setClientModal(false)} onSave={submitClient} l={l} />
        </Modal>
      )}

      {/* ── Slot modal ───────────────────────────────────────────────────── */}
      {slotModal && (
        <Modal title={editingSlot ? l('স্লট সম্পাদনা', 'Edit Slot') : l('নতুন স্লট', 'New Slot')} onClose={() => setSlotModal(false)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={l('নাম (বাংলা)', 'Name (Bangla)') + ' *'}><input value={slotForm.nameBn} onChange={e => setSlotForm({ ...slotForm, nameBn: e.target.value })} className={inp} /></Field>
            <Field label={l('নাম (ইংরেজি)', 'Name (English)') + ' *'}><input value={slotForm.nameEn} onChange={e => setSlotForm({ ...slotForm, nameEn: e.target.value })} className={inp} /></Field>
            <Field label={l('কী (পজিশন)', 'Key (position)')}><input value={slotForm.key} onChange={e => setSlotForm({ ...slotForm, key: e.target.value })} className={`${inp} font-mono`} placeholder={l('খালি রাখলে অটো', 'auto if blank')} disabled={!!editingSlot} /></Field>
            <Field label={l('সাইজ', 'Size')}>
              <select value={slotForm.size} onChange={e => setSlotForm({ ...slotForm, size: e.target.value })} className={inp}>{SLOT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select>
            </Field>
            <Field label={l('ডাইমেনশন', 'Dimensions')}><input value={slotForm.dimensions} onChange={e => setSlotForm({ ...slotForm, dimensions: e.target.value })} className={inp} placeholder="728x90" /></Field>
            <Field label={l('ধারণক্ষমতা (মোট স্লট)', 'Capacity (total slots)') + ' *'}><input type="number" min="1" value={slotForm.capacity} onChange={e => setSlotForm({ ...slotForm, capacity: e.target.value })} className={inp} /></Field>
            <Field label={l('ফ্ল্যাট রেট (৳)', 'Flat Rate (৳)')}><input type="number" min="0" value={slotForm.rate} onChange={e => setSlotForm({ ...slotForm, rate: e.target.value })} className={inp} placeholder="0" /></Field>
            <Field label={l('CPM রেট (৳)', 'CPM Rate (৳)')}><input type="number" min="0" value={slotForm.rateCpm} onChange={e => setSlotForm({ ...slotForm, rateCpm: e.target.value })} className={inp} placeholder="0" /></Field>
          </div>
          <Field label={l('বিবরণ', 'Description')} className="mt-4"><input value={slotForm.description} onChange={e => setSlotForm({ ...slotForm, description: e.target.value })} className={inp} /></Field>
          <label className="flex items-center gap-2 mt-4 text-sm text-gray-600"><input type="checkbox" checked={slotForm.isActive} onChange={e => setSlotForm({ ...slotForm, isActive: e.target.checked })} /> {l('সক্রিয়', 'Active')}</label>
          <ModalActions onCancel={() => setSlotModal(false)} onSave={submitSlot} l={l} />
        </Modal>
      )}

      <MediaLibraryModal isOpen={showMediaLibrary} onClose={() => setShowMediaLibrary(false)} onSelect={(m) => { setAdForm(f => ({ ...f, image: m.url })); setShowMediaLibrary(false); }} initialType="image" />
    </div>
  );
}

// ── small presentational helpers ────────────────────────────────────────────
const inp = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238] disabled:bg-gray-50';

function KpiTile({ icon: Icon, label, value, sub, color = 'red' }) {
  const c = { red: 'bg-[#eceff1] text-[#263238]', blue: 'bg-[#eff6ff] text-[#3b82f6]', green: 'bg-[#ecfdf5] text-[#10b981]', orange: 'bg-[#fffbeb] text-[#f59e0b]' }[color];
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-lg ${c} flex items-center justify-center mb-2`}><Icon className="w-4.5 h-4.5" /></div>
      <div className="text-[11px] text-gray-400 font-medium">{label}</div>
      <div className="text-lg font-bold text-gray-900 leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="px-5 py-3.5 border-b border-gray-50"><h3 className="text-sm font-bold text-gray-800">{title}</h3></div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function BarList({ items = [], money }) {
  const max = Math.max(1, ...items.map(i => i.value));
  if (!items.length) return <Empty text="—" />;
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1"><span className="font-medium text-gray-700 truncate max-w-[160px]">{it.name}</span><span className="font-bold text-gray-800">{money(it.value)}</span></div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#263238]" style={{ width: `${(it.value / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function Mini({ label, value, accent }) {
  return (
    <div className="bg-gray-50 rounded-lg py-1.5 text-center">
      <div className={`text-xs font-bold ${accent ? 'text-[#263238]' : 'text-gray-800'}`}>{value}</div>
      <div className="text-[8px] font-bold text-gray-400 uppercase">{label}</div>
    </div>
  );
}

function Empty({ text, full }) {
  return <div className={`${full ? 'col-span-full py-16' : 'py-6'} text-center text-sm text-gray-400`}>{text}</div>;
}

function Field({ label, children, className = '' }) {
  return <div className={className}><label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{label}</label>{children}</div>;
}

function Modal({ title, children, onClose, wide }) {
  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-2xl'} my-8`} onClick={e => e.stopPropagation()}>
        <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2"><Megaphone className="text-[#263238]" size={20} /> {title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-7">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave, l }) {
  return (
    <div className="flex gap-3 mt-7">
      <button onClick={onSave} className="flex-1 bg-[#263238] text-white rounded-2xl py-3.5 text-sm font-bold hover:bg-[#1a2428] active:scale-95 transition-all">{l('সংরক্ষণ করুন', 'Save')}</button>
      <button onClick={onCancel} className="flex-1 bg-gray-50 text-gray-600 rounded-2xl py-3.5 text-sm font-bold hover:bg-gray-100 active:scale-95 transition-all">{l('বাতিল', 'Cancel')}</button>
    </div>
  );
}
