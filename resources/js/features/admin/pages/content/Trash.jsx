import { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Search, Trash2, X, Loader2, AlertTriangle, RotateCcw, ChevronDown, Trash as TrashIcon,
} from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

const STATUS_MAP = {
  published: { bn: 'প্রকাশিত',         en: 'Published', variant: 'green'  },
  draft:     { bn: 'ড্রাফট',            en: 'Draft',     variant: 'gray'   },
  pending:   { bn: 'অনুমোদন অপেক্ষায়', en: 'Pending',   variant: 'orange' },
  archived:  { bn: 'আর্কাইভড',          en: 'Archived',  variant: 'blue'   },
};

export default function Trash({ articles, filters }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const searchTimer = useRef(null);

  const [search,    setSearch]    = useState(filters?.search   || '');
  const [perPage,   setPerPage]   = useState(filters?.per_page || '20');
  const [selected,  setSelected]  = useState([]);
  const [submitting, setSubmitting] = useState(false);
  // { mode: 'single', article } | { mode: 'bulk' }
  const [forceConfirm, setForceConfirm] = useState(null);

  const l = (bn, en) => lang === 'bn' ? bn : en;
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const applyFilters = (overrides = {}) => {
    const p = { search, per_page: perPage, page: 1, ...overrides };
    Object.keys(p).forEach(k => { if (p[k] === '' || p[k] == null) delete p[k]; });
    router.get(route('admin.news.trash'), p, { preserveState: true, preserveScroll: true });
  };

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => applyFilters({ search: val }), 400);
  };

  const handleRestore = (id) => {
    router.post(route('admin.news.restore', { id }), {}, {
      preserveScroll: true,
      onSuccess: () => { showToast(l('সংবাদ ফিরিয়ে আনা হয়েছে', 'Article restored')); setSelected(prev => prev.filter(i => i !== id)); },
    });
  };

  const handleForceDelete = (id) => {
    setSubmitting(true);
    router.delete(route('admin.news.force-delete', { id }), {
      preserveScroll: true,
      onSuccess: () => { showToast(l('স্থায়ীভাবে মুছে ফেলা হয়েছে', 'Permanently deleted')); setForceConfirm(null); setSelected(prev => prev.filter(i => i !== id)); },
      onFinish: () => setSubmitting(false),
    });
  };

  const handleBulkRestore = () => {
    if (!selected.length) return;
    router.post(route('admin.news.bulk-restore'), { article_ids: selected }, {
      preserveScroll: true,
      onSuccess: () => { showToast(l('ফিরিয়ে আনা হয়েছে', 'Restored')); setSelected([]); },
    });
  };

  const handleBulkForceDelete = () => {
    if (!selected.length) return;
    setSubmitting(true);
    router.post(route('admin.news.bulk-force-delete'), { article_ids: selected }, {
      preserveScroll: true,
      onSuccess: () => { showToast(l('স্থায়ীভাবে মুছে ফেলা হয়েছে', 'Permanently deleted')); setForceConfirm(null); setSelected([]); },
      onFinish: () => setSubmitting(false),
    });
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === articles.data.length ? [] : articles.data.map(a => a.id));

  return (
    <div className="p-6">
      <Head title={l('ট্র্যাশ', 'Trash')} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] flex items-center gap-2.5">
            <TrashIcon className="w-6 h-6 text-[#263238]" />
            {l('ট্র্যাশ', 'Trash')}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {articles.total} {l('টি মুছে ফেলা সংবাদ', 'deleted articles')}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 gap-2.5 flex-1 min-w-[220px] focus-within:border-[#263238]/40 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={l('শিরোনাম খুঁজুন...', 'Search title...')}
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="border-none bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
            />
            {search && <button onClick={() => handleSearch('')}><X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" /></button>}
          </div>
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 flex-wrap animate-in slide-in-from-top-1 duration-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{selected.length} {l('টি নির্বাচিত', 'selected')}:</span>
            <button onClick={handleBulkRestore} className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-green-100 transition-colors flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> {l('ফিরিয়ে আনুন', 'Restore')}
            </button>
            <button onClick={() => setForceConfirm({ mode: 'bulk' })} className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> {l('স্থায়ীভাবে মুছুন', 'Delete Permanently')}
            </button>
            <button onClick={() => setSelected([])} className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2">{l('বাতিল', 'Cancel')}</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <th className="px-5 py-3.5 text-left w-10">
                <input type="checkbox" checked={selected.length === articles.data.length && articles.data.length > 0}
                  onChange={toggleAll} className="rounded border-gray-300 text-[#263238] focus:ring-[#263238]" />
              </th>
              <th className="px-4 py-3.5 text-left">{l('শিরোনাম', 'Title')}</th>
              <th className="px-4 py-3.5 text-left">{l('বিভাগ', 'Category')}</th>
              <th className="px-4 py-3.5 text-left">{l('এডিশন', 'Edition')}</th>
              <th className="px-4 py-3.5 text-left">{l('অবস্থা', 'Status')}</th>
              <th className="px-4 py-3.5 text-left">{l('মুছে ফেলা হয়েছে', 'Deleted')}</th>
              <th className="px-5 py-3.5 text-right">{l('অ্যাকশন', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.data.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-20 text-center">
                  <TrashIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-400">{l('ট্র্যাশ খালি', 'Trash is empty')}</p>
                </td>
              </tr>
            ) : articles.data.map(article => {
              const st = STATUS_MAP[article.status] || STATUS_MAP.draft;
              return (
                <tr key={article.id} className={`hover:bg-gray-50/50 transition-colors group ${selected.includes(article.id) ? 'bg-[#fff8f8]' : ''}`}>
                  <td className="px-5 py-3.5">
                    <input type="checkbox" checked={selected.includes(article.id)} onChange={() => toggleSelect(article.id)}
                      className="rounded border-gray-300 text-[#263238] focus:ring-[#263238]" />
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="font-semibold text-gray-800 text-sm line-clamp-2 leading-snug">
                      {/* Stable article identity (Bangla primary, English fallback) — independent of UI toggle. */}
                      {article.title || article.title_en}
                    </div>
                    <span className="text-[10px] text-gray-400">{article.author || '—'}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    {article.category ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: article.category?.color_code || '#263238' }} />
                        <span className="text-xs font-medium text-gray-600 truncate max-w-[90px]">
                          {l(article.category?.name, article.category?.name_en || article.category?.name)}
                        </span>
                      </div>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      article.edition === 'both' ? 'bg-gray-100 text-gray-600' :
                      article.edition === 'bn'   ? 'bg-[#eceff1] text-[#263238]' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {article.edition === 'both' ? 'BN+EN' : article.edition?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={st.variant} className="text-[9px] uppercase font-bold px-2 py-0.5">{l(st.bn, st.en)}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-gray-400 whitespace-nowrap">{fmt(article.deleted_at)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => handleRestore(article.id)}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-all" title={l('ফিরিয়ে আনুন', 'Restore')}>
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button onClick={() => setForceConfirm({ mode: 'single', article })}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all" title={l('স্থায়ীভাবে মুছুন', 'Delete Permanently')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="px-5 py-3.5 border-t border-gray-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{articles.from}–{articles.to} / {articles.total} {l('টি', 'results')}</span>
            <div className="relative">
              <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value, page: 1 }); }}
                className="appearance-none border border-gray-100 rounded-lg px-3 py-1.5 pr-7 text-xs font-medium outline-none bg-gray-50 cursor-pointer">
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} {l('টি', '/page')}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {articles.last_page > 1 && (
            <div className="flex items-center gap-1">
              {articles.links.map((link, i) =>
                link.url ? (
                  <a key={i} href={link.url} dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${link.active ? 'bg-[#263238] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    onClick={e => { e.preventDefault(); router.get(link.url, {}, { preserveState: true }); }}
                  />
                ) : (
                  <span key={i} dangerouslySetInnerHTML={{ __html: link.label }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-200 cursor-not-allowed" />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Permanent delete confirmation */}
      {forceConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold">{l('স্থায়ীভাবে মুছে ফেলবেন?', 'Delete Permanently?')}</h3>
              <p className="text-sm text-gray-400 mt-1">{l('এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না', 'This action cannot be undone')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3.5 mb-5 text-sm font-semibold text-gray-700 line-clamp-2">
              {forceConfirm.mode === 'bulk'
                ? l(`${selected.length}টি সংবাদ স্থায়ীভাবে মুছে ফেলা হবে`, `${selected.length} articles will be permanently deleted`)
                : (forceConfirm.article.title || forceConfirm.article.title_en)}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => forceConfirm.mode === 'bulk' ? handleBulkForceDelete() : handleForceDelete(forceConfirm.article.id)}
                disabled={submitting}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {l('হ্যাঁ, মুছুন', 'Yes, Delete')}
              </button>
              <button onClick={() => setForceConfirm(null)}
                className="flex-1 bg-white border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-bold hover:bg-gray-50">
                {l('বাতিল', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
