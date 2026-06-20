import { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Edit3, Trash2, Eye, Send, Loader2, AlertTriangle, X, CheckCircle, Archive, ChevronDown, Plus, RotateCcw } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

const STATUS_MAP = {
  published: { bn: 'প্রকাশিত',         en: 'Published', variant: 'green'  },
  draft:     { bn: 'ড্রাফট',            en: 'Draft',     variant: 'gray'   },
  pending:   { bn: 'অনুমোদন অপেক্ষায়', en: 'Pending',   variant: 'orange' },
  scheduled: { bn: 'নির্ধারিত',         en: 'Scheduled', variant: 'purple' },
};

function Select({ value, onChange, children, className = '' }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`appearance-none border border-gray-100 rounded-xl px-3.5 py-2.5 pr-8 text-sm outline-none bg-gray-50 cursor-pointer focus:bg-white transition-all font-medium ${className}`}>
        {children}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function NewsTable({ articles, categories = [], authors = [], filters, pageTitle, pageLabel, fixedStatus }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const searchTimer = useRef(null);

  const [search,    setSearch]    = useState(filters?.search   || '');
  const [category,  setCategory]  = useState(filters?.category || 'all');
  const [edition,   setEdition]   = useState(filters?.edition  || 'all');
  const [author,    setAuthor]    = useState(filters?.author   || 'all');
  const [perPage,   setPerPage]   = useState(filters?.per_page || '20');
  const [selected,  setSelected]  = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const l = (bn, en) => lang === 'bn' ? bn : en;
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';


  const applyFilters = (overrides = {}) => {
    const p = { search, category, edition, author, per_page: perPage, page: 1, ...overrides };
    Object.keys(p).forEach(k => { if (p[k] === 'all' || p[k] === '' || p[k] == null) delete p[k]; });
    router.get(window.location.pathname, p, { preserveState: true, preserveScroll: true });
  };

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => applyFilters({ search: val }), 400);
  };

  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.news.transition-status', { article: id }), { status: newStatus }, {
      preserveScroll: true,
      onSuccess: () => showToast(l('অবস্থা আপডেট হয়েছে', 'Status updated')),
    });
  };

  const handleDelete = (id) => {
    setSubmitting(true);
    router.delete(route('admin.news.destroy', { article: id }), {
      onSuccess: () => { showToast(l('মুছে ফেলা হয়েছে', 'Article deleted')); setDeleteConfirm(null); },
      onFinish: () => setSubmitting(false),
      preserveScroll: true,
    });
  };

  const handleBulk = (action) => {
    if (!selected.length) return;
    if (action === 'delete') {
      if (!confirm(l(`${selected.length}টি সংবাদ মুছে ফেলতে চান?`, `Delete ${selected.length} articles?`))) return;
      router.post(route('admin.news.bulk-delete'), { article_ids: selected }, {
        onSuccess: () => { showToast(l('মুছে ফেলা হয়েছে', 'Deleted')); setSelected([]); },
      });
      return;
    }
    router.post(route('admin.news.bulk-status'), { article_ids: selected, status: action }, {
      onSuccess: () => { showToast(l('আপডেট হয়েছে', 'Updated')); setSelected([]); },
    });
  };

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === articles.data.length ? [] : articles.data.map(a => a.id));
  const hasActiveFilters = category !== 'all' || edition !== 'all' || author !== 'all' || search;

  return (
    <div className="p-6">
      <Head title={pageTitle} />

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali']">{pageLabel}</h1>
          <p className="text-sm text-gray-400 mt-1">{articles.total} {l('টি সংবাদ', 'articles')}</p>
        </div>
        <Link href={route('admin.news.write')}
          className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#c00] transition-all shadow-md">
          <Plus className="w-4 h-4" /> {l('নতুন সংবাদ', 'New Article')}
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 gap-2.5 flex-1 min-w-[220px] focus-within:border-[#263238]/40 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input type="text" placeholder={l('শিরোনাম খুঁজুন...', 'Search title...')}
              value={search} onChange={e => handleSearch(e.target.value)}
              className="border-none bg-transparent outline-none text-sm w-full placeholder:text-gray-400" />
            {search && <button onClick={() => handleSearch('')}><X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" /></button>}
          </div>

          <Select value={edition} onChange={v => { setEdition(v); applyFilters({ edition: v }); }}>
            <option value="all">{l('সব এডিশন', 'All Editions')}</option>
            <option value="bn">{l('শুধু বাংলা', 'Bangla Only')}</option>
            <option value="en">{l('শুধু ইংরেজি', 'English Only')}</option>
            <option value="both">{l('উভয়', 'Both')}</option>
          </Select>

          {categories.length > 0 && (
            <Select value={category} onChange={v => { setCategory(v); applyFilters({ category: v }); }} className="min-w-[150px]">
              <option value="all">{l('সব বিভাগ', 'All Categories')}</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{l(c.name_bn, c.name_en || c.name_bn)}</option>)}
            </Select>
          )}

          {authors.length > 0 && (
            <Select value={author} onChange={v => { setAuthor(v); applyFilters({ author: v }); }} className="min-w-[140px]">
              <option value="all">{l('সব লেখক', 'All Authors')}</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          )}

          {hasActiveFilters && (
            <button onClick={() => { setSearch(''); setCategory('all'); setEdition('all'); setAuthor('all'); applyFilters({ search: '', category: 'all', edition: 'all', author: 'all' }); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <RotateCcw className="w-3.5 h-3.5" /> {l('রিসেট', 'Reset')}
            </button>
          )}
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 flex-wrap animate-in slide-in-from-top-1 duration-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{selected.length} {l('টি নির্বাচিত', 'selected')}:</span>
            {fixedStatus !== 'published' && <button onClick={() => handleBulk('published')} className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-green-100">{l('প্রকাশ', 'Publish')}</button>}
            {fixedStatus !== 'draft'     && <button onClick={() => handleBulk('draft')}     className="bg-gray-50 text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-gray-100">{l('ড্রাফট', 'Draft')}</button>}
            {fixedStatus !== 'pending'   && <button onClick={() => handleBulk('pending')}   className="bg-orange-50 text-orange-600 border border-orange-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-orange-100">{l('রিভিউ', 'Review')}</button>}
            <button onClick={() => handleBulk('archived')} className="bg-blue-50 text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-blue-100">{l('আর্কাইভ', 'Archive')}</button>
            <button onClick={() => handleBulk('delete')}   className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-red-100">{l('মুছুন', 'Delete')}</button>
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
              <th className="px-4 py-3.5 text-left">{l('লেখক', 'Author')}</th>
              <th className="px-4 py-3.5 text-left">{l('অবস্থা', 'Status')}</th>
              <th className="px-4 py-3.5 text-left">{l('তারিখ', 'Date')}</th>
              <th className="px-5 py-3.5 text-right">{l('অ্যাকশন', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.data.length === 0 ? (
              <tr><td colSpan="8" className="py-20 text-center text-sm font-medium text-gray-400">{l('কোনো সংবাদ পাওয়া যায়নি', 'No articles found')}</td></tr>
            ) : articles.data.map(article => {
              const st = STATUS_MAP[article.status] || STATUS_MAP.draft;
              return (
                <tr key={article.id} className={`hover:bg-gray-50/50 transition-colors group ${selected.includes(article.id) ? 'bg-[#fff8f8]' : ''}`}>
                  <td className="px-5 py-3.5">
                    <input type="checkbox" checked={selected.includes(article.id)} onChange={() => toggleSelect(article.id)}
                      className="rounded border-gray-300 text-[#263238] focus:ring-[#263238]" />
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-[#263238] transition-colors leading-snug">
                      {/* Stable article identity (Bangla primary, English fallback) — independent of UI toggle. */}
                      {article.title || article.title_en}
                    </div>
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
                  <td className="px-4 py-3.5 text-xs font-medium text-gray-500 whitespace-nowrap">{article.author || '—'}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={st.variant} className="text-[9px] uppercase font-bold px-2 py-0.5">{l(st.bn, st.en)}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-gray-400 whitespace-nowrap">
                    {fmt(article.published_at || article.created_at)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      <Link href={route('admin.news.show', { article: article.id })}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-all">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={route('admin.news.edit', { article: article.id })}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-500 transition-all">
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      {article.status === 'pending' && (
                        <button onClick={() => handleStatusChange(article.id, 'published')}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-400 hover:text-green-600 transition-all">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {article.status === 'draft' && (
                        <button onClick={() => handleStatusChange(article.id, 'pending')}
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-400 hover:text-orange-600 transition-all">
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {article.status === 'published' && (
                        <button onClick={() => handleStatusChange(article.id, 'draft')}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setDeleteConfirm(article)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
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

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold">{l('সংবাদ মুছে ফেলুন?', 'Delete Article?')}</h3>
              <p className="text-sm text-gray-400 mt-1">{l('এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না', 'This action cannot be undone')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3.5 mb-5 text-sm font-semibold text-gray-700 line-clamp-2">
              {deleteConfirm.title || deleteConfirm.title_en}
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm.id)} disabled={submitting}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {l('হ্যাঁ, মুছুন', 'Yes, Delete')}
              </button>
              <button onClick={() => setDeleteConfirm(null)}
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

export default function Drafts({ articles, categories, authors, filters }) {
  const { lang } = useLanguage();
  return <NewsTable articles={articles} categories={categories} authors={authors} filters={filters} fixedStatus="draft"
    pageTitle={lang === 'bn' ? 'খসড়া সংবাদ' : 'Draft Articles'}
    pageLabel={lang === 'bn' ? 'খসড়া সংবাদ' : 'Drafts'} />;
}

export function PendingApproval({ articles, categories, authors, filters }) {
  const { lang } = useLanguage();
  return <NewsTable articles={articles} categories={categories} authors={authors} filters={filters} fixedStatus="pending"
    pageTitle={lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending Approval'}
    pageLabel={lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending Approval'} />;
}

export function Published({ articles, categories, authors, filters }) {
  const { lang } = useLanguage();
  return <NewsTable articles={articles} categories={categories} authors={authors} filters={filters} fixedStatus="published"
    pageTitle={lang === 'bn' ? 'প্রকাশিত সংবাদ' : 'Published Articles'}
    pageLabel={lang === 'bn' ? 'প্রকাশিত সংবাদ' : 'Published'} />;
}
