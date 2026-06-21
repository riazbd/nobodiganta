import { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Zap, Plus, Edit3, Trash2, X, Search, Pin, Clock, Radio, AlertTriangle, Power, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

const SEVERITIES = [
  { value: 'just_in',  bn: 'জাস্ট ইন',  en: 'Just In',  cls: 'bg-slate-100 text-slate-600' },
  { value: 'breaking', bn: 'ব্রেকিং',    en: 'Breaking', cls: 'bg-red-100 text-red-600' },
  { value: 'urgent',   bn: 'জরুরি',      en: 'Urgent',   cls: 'bg-amber-100 text-amber-700' },
  { value: 'live',     bn: 'লাইভ',       en: 'Live',     cls: 'bg-emerald-100 text-emerald-700' },
];
const sevMeta = (v) => SEVERITIES.find(s => s.value === v) || SEVERITIES[1];
const inp = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]';

export default function BreakingNews({ items = { active: [], scheduled: [], expired: [] } }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const l = (bn, en) => (lang === 'bn' ? bn : en);

  const [tab, setTab] = useState('active');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [results, setResults] = useState([]);
  const searchTimer = useRef(null);

  const empty = {
    mode: 'standalone', articleId: '', articleLabel: '',
    headlineBn: '', headlineEn: '', link: '',
    severity: 'breaking', edition: 'both', priority: 0,
    isPinned: false, startsAt: '', expiresAt: '', isActive: true, pushEnabled: false,
  };
  const [form, setForm] = useState(empty);

  const openAdd = () => { setEditing(null); setForm(empty); setResults([]); setModal(true); };
  const openEdit = (it) => {
    setEditing(it);
    setForm({
      mode: it.articleId ? 'article' : 'standalone',
      articleId: it.articleId || '', articleLabel: it.articleTitle || '',
      headlineBn: it.headlineBn || '', headlineEn: it.headlineEn || '', link: it.link || '',
      severity: it.severity, edition: it.edition, priority: it.priority || 0,
      isPinned: it.isPinned, startsAt: (it.startsAt || '').slice(0, 16), expiresAt: (it.expiresAt || '').slice(0, 16),
      isActive: it.isActive, pushEnabled: it.pushEnabled,
    });
    setResults([]); setModal(true);
  };

  const searchArticles = (q) => {
    clearTimeout(searchTimer.current);
    if (!q) { setResults([]); return; }
    searchTimer.current = setTimeout(() => {
      window.axios.get('/admin/api/articles', { params: { search: q, limit: 8 } })
        .then(r => setResults(r.data.data || [])).catch(() => setResults([]));
    }, 300);
  };

  const submit = () => {
    const payload = {
      articleId: form.mode === 'article' ? form.articleId : null,
      headlineBn: form.headlineBn, headlineEn: form.headlineEn, link: form.link,
      severity: form.severity, edition: form.edition, priority: Number(form.priority) || 0,
      isPinned: form.isPinned, startsAt: form.startsAt || null, expiresAt: form.expiresAt || null,
      isActive: form.isActive, pushEnabled: form.pushEnabled,
    };
    if (payload.mode !== 'article') payload.articleId = form.mode === 'article' ? form.articleId : null;
    const opts = { preserveScroll: true, onSuccess: () => { setModal(false); showToast(l('সংরক্ষিত হয়েছে', 'Saved')); }, onError: () => showToast(l('ত্রুটি ঘটেছে', 'Error / headline required'), 'error') };
    editing ? router.put(route('admin.breaking.update', editing.id), payload, opts)
            : router.post(route('admin.breaking.store'), payload, opts);
  };

  const expire = (it) => router.patch(route('admin.breaking.expire', it.id), {}, { preserveScroll: true, onSuccess: () => showToast(l('মেয়াদ শেষ', 'Expired')) });
  const reactivate = (it) => router.patch(route('admin.breaking.reactivate', it.id), {}, { preserveScroll: true, onSuccess: () => showToast(l('পুনরায় সক্রিয়', 'Reactivated')) });
  const remove = (it) => { if (confirm(l('মুছবেন?', 'Delete?'))) router.delete(route('admin.breaking.destroy', it.id), { preserveScroll: true, onSuccess: () => showToast(l('মুছে ফেলা হয়েছে', 'Deleted')) }); };

  const TABS = [
    { id: 'active', label: l('সক্রিয়', 'Active'), icon: Radio },
    { id: 'scheduled', label: l('নির্ধারিত', 'Scheduled'), icon: Clock },
    { id: 'expired', label: l('মেয়াদোত্তীর্ণ', 'Expired'), icon: AlertTriangle },
  ];
  const list = items[tab] || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Head title={l('ব্রেকিং নিউজ', 'Breaking News')} />

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-2.5"><Zap className="w-6 h-6 text-red-500" /> {l('ব্রেকিং নিউজ', 'Breaking News')}</h1>
        <button onClick={openAdd} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] shadow"><Plus className="w-4 h-4" /> {l('নতুন', 'New')}</button>
      </div>

      <div className="flex gap-1.5 mb-5 border-b border-gray-200">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === t.id ? 'border-[#263238] text-[#263238]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <t.icon className="w-4 h-4" /> {t.label} <span className="text-xs text-gray-400">({(items[t.id] || []).length})</span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.length === 0 && <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-sm">{l('কিছু নেই', 'Nothing here')}</div>}
        {list.map(it => {
          const sm = sevMeta(it.severity);
          return (
            <div key={it.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${sm.cls} flex-shrink-0`}>{l(sm.bn, sm.en)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {it.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                  <p className="text-sm font-semibold text-[#1a1d2e] truncate">{it.title || l('(শিরোনাম নেই)', '(no headline)')}</p>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {it.articleId ? l('আর্টিকেল-লিংকড', 'Article-linked') : l('স্ট্যান্ডঅ্যালোন', 'Standalone')} · {it.edition.toUpperCase()}
                  {it.startsAt && it.isScheduled && ` · ${l('শুরু', 'starts')} ${new Date(it.startsAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}`}
                  {it.expiresAt && ` · ${l('শেষ', 'expires')} ${new Date(it.expiresAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}`}
                  {it.pushEnabled && ` · 🔔 ${it.pushSentAt ? l('পাঠানো হয়েছে', 'sent') : l('সারিতে', 'queued')}`}
                  {it.creator && ` · ${it.creator}`}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(it)} className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"><Edit3 size={15} /></button>
                {it.isActive && !it.isExpired
                  ? <button onClick={() => expire(it)} title={l('মেয়াদ শেষ করুন', 'Expire')} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"><Power size={15} /></button>
                  : <button onClick={() => reactivate(it)} title={l('পুনরায় সক্রিয়', 'Reactivate')} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"><RotateCcw size={15} /></button>}
                <button onClick={() => remove(it)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8" onClick={e => e.stopPropagation()}>
            <div className="px-7 py-5 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2"><Zap className="text-red-500" size={20} /> {editing ? l('সম্পাদনা', 'Edit') : l('নতুন ব্রেকিং', 'New Breaking')}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-7 space-y-4">
              {/* Mode toggle */}
              <div className="flex gap-2">
                {['standalone', 'article'].map(m => (
                  <button key={m} onClick={() => setForm({ ...form, mode: m })} className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${form.mode === m ? 'bg-[#263238] text-white border-[#263238]' : 'bg-white text-gray-500 border-gray-200'}`}>
                    {m === 'standalone' ? l('স্ট্যান্ডঅ্যালোন', 'Standalone') : l('আর্টিকেল থেকে', 'From Article')}
                  </button>
                ))}
              </div>

              {form.mode === 'article' ? (
                <div className="relative">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase">{l('আর্টিকেল', 'Article')}</label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-3 gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input className="flex-1 py-2.5 text-sm outline-none" placeholder={l('আর্টিকেল খুঁজুন...', 'Search article...')}
                      defaultValue={form.articleLabel} onChange={e => searchArticles(e.target.value)} />
                  </div>
                  {results.length > 0 && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                      {results.map(a => (
                        <button key={a.id} onClick={() => { setForm({ ...form, articleId: a.id, articleLabel: a.title_bn }); setResults([]); }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 truncate">{a.title_bn}</button>
                      ))}
                    </div>
                  )}
                  {form.articleId && <p className="text-xs text-emerald-600 mt-1">✓ {form.articleLabel}</p>}
                  <p className="text-[11px] text-gray-400 mt-1">{l('শিরোনাম খালি রাখলে আর্টিকেলের টাইটেল ব্যবহার হবে।', 'Leave headline blank to use the article title.')}</p>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase">{l('শিরোনাম (বাংলা)', 'Headline (BN)')}</label><input value={form.headlineBn} onChange={e => setForm({ ...form, headlineBn: e.target.value })} className={inp} /></div>
                <div><label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase">{l('শিরোনাম (ইংরেজি)', 'Headline (EN)')}</label><input value={form.headlineEn} onChange={e => setForm({ ...form, headlineEn: e.target.value })} className={inp} /></div>
              </div>

              {form.mode === 'standalone' && (
                <div><label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase">{l('লিঙ্ক (ঐচ্ছিক)', 'Link (optional)')}</label><input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className={inp} placeholder="/category/slug or https://..." /></div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase">{l('গুরুত্ব', 'Severity')}</label>
                  <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className={inp}>{SEVERITIES.map(s => <option key={s.value} value={s.value}>{l(s.bn, s.en)}</option>)}</select>
                </div>
                <div><label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase">{l('এডিশন', 'Edition')}</label>
                  <select value={form.edition} onChange={e => setForm({ ...form, edition: e.target.value })} className={inp}><option value="both">{l('উভয়', 'Both')}</option><option value="bn">BN</option><option value="en">EN</option></select>
                </div>
                <div><label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase">{l('প্রায়োরিটি', 'Priority')}</label><input type="number" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={inp} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase">{l('শুরু (ঐচ্ছিক)', 'Starts at (optional)')}</label><input type="datetime-local" value={form.startsAt} onChange={e => setForm({ ...form, startsAt: e.target.value })} className={inp} /></div>
                <div><label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase">{l('মেয়াদ শেষ (ঐচ্ছিক)', 'Expires at (optional)')}</label><input type="datetime-local" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className={inp} /></div>
              </div>

              <div className="flex flex-wrap gap-5 pt-1">
                <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} /> {l('পিন করুন', 'Pin')}</label>
                <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> {l('সক্রিয়', 'Active')}</label>
                <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" checked={form.pushEnabled} onChange={e => setForm({ ...form, pushEnabled: e.target.checked })} /> {l('পুশ নোটিফিকেশন', 'Push notification')} <span className="text-[10px] text-gray-400">({l('ভবিষ্যতে সক্রিয় হবে', 'activates later')})</span></label>
              </div>

              <div className="flex gap-3 pt-3">
                <button onClick={submit} className="flex-1 bg-[#263238] text-white rounded-2xl py-3.5 text-sm font-bold hover:bg-[#1a2428]">{l('সংরক্ষণ করুন', 'Save')}</button>
                <button onClick={() => setModal(false)} className="flex-1 bg-gray-50 text-gray-600 rounded-2xl py-3.5 text-sm font-bold hover:bg-gray-100">{l('বাতিল', 'Cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
