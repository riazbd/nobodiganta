import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { PenLine, Eye, Edit3, Trash2, Send, Search, X, Loader2, AlertTriangle, ChevronDown, CheckCircle, RotateCcw } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

function Select({ value, onChange, children, className = '' }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className={`appearance-none border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.75 pr-8 text-xs outline-none bg-white cursor-pointer focus:border-[#e8001e] transition-all ${className}`}>
        {children}
      </select>
      <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

export default function OpinionList({ opinions, authors = [], filters }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const searchTimer = useRef(null);

  const [search,    setSearch]    = useState(filters?.search   || '');
  const [status,    setStatus]    = useState(filters?.status   || 'all');
  const [edition,   setEdition]   = useState(filters?.edition  || 'all');
  const [author,    setAuthor]    = useState(filters?.author   || 'all');
  const [perPage,   setPerPage]   = useState(filters?.per_page || '20');
  const [selected,  setSelected]  = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const l = (bn, en) => lang === 'bn' ? bn : en;
  const fmt = (d) => d ? new Date(d).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const applyFilters = (overrides = {}) => {
    const p = { search, status, edition, author, per_page: perPage, page: 1, ...overrides };
    Object.keys(p).forEach(k => { if (p[k] === 'all' || p[k] === '' || p[k] == null) delete p[k]; });
    router.get('/admin/opinions', p, { preserveState: true, preserveScroll: true });
  };

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => applyFilters({ search: val }), 400);
  };

  const handleStatusChange = (id, newStatus) => {
    router.patch(`/admin/opinions/${id}/status`, { status: newStatus }, {
      preserveScroll: true,
      onSuccess: () => showToast(l('অবস্থা আপডেট হয়েছে', 'Status updated')),
    });
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    router.delete(`/admin/opinions/${deleteConfirm.id}`, {
      onSuccess: () => { showToast(l('মুছে ফেলা হয়েছে', 'Deleted')); setDeleteConfirm(null); },
      onFinish: () => setSubmitting(false),
    });
  };

  const handleBulk = (action) => {
    if (!selected.length) return;
    if (action === 'delete') {
      if (!confirm(l(`${selected.length}টি মতামত মুছে ফেলতে চান?`, `Delete ${selected.length} opinions?`))) return;
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
  const toggleAll = () => setSelected(selected.length === opinions.data.length ? [] : opinions.data.map(o => o.id));
  const hasActiveFilters = status !== 'all' || edition !== 'all' || author !== 'all' || search;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali'] flex items-center gap-2">
            <PenLine className="w-5 h-5 text-[#e8001e]" />
            {l('মতামত কলাম', 'Opinion Column')}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">
            {opinions.total} {l('টি মতামত', 'opinion pieces')}
          </p>
        </div>
        <button
          onClick={() => router.visit('/admin/opinions/write')}
          className="bg-[#e8001e] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#b8001a] transition-colors"
        >
          <PenLine className="w-4 h-4" /> {l('নতুন মতামত', 'New Opinion')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-4 mb-4.5">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center bg-[var(--body-bg,#f0f2f8)] border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.75 gap-2 flex-1 min-w-[200px] focus-within:border-[#e8001e]/40 focus-within:bg-white transition-all">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)] flex-shrink-0" />
            <input type="text" placeholder={l('মতামত খুঁজুন...', 'Search opinions...')}
              value={search} onChange={e => handleSearch(e.target.value)}
              className="border-none bg-transparent outline-none text-[12.5px] w-full placeholder:text-[var(--text-muted,#9ca3af)]" />
            {search && <button onClick={() => handleSearch('')}><X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" /></button>}
          </div>

          <Select value={status} onChange={v => { setStatus(v); applyFilters({ status: v }); }}>
            <option value="all">{l('সব অবস্থা', 'All Status')}</option>
            <option value="published">{l('প্রকাশিত', 'Published')}</option>
            <option value="pending">{l('অপেক্ষমাণ', 'Pending')}</option>
            <option value="draft">{l('ড্রাফট', 'Draft')}</option>
          </Select>

          <Select value={edition} onChange={v => { setEdition(v); applyFilters({ edition: v }); }}>
            <option value="all">{l('সব এডিশন', 'All Editions')}</option>
            <option value="bn">{l('বাংলা', 'Bangla')}</option>
            <option value="en">{l('ইংরেজি', 'English')}</option>
            <option value="both">{l('উভয়', 'Both')}</option>
          </Select>

          {authors.length > 0 && (
            <Select value={author} onChange={v => { setAuthor(v); applyFilters({ author: v }); }} className="min-w-[140px]">
              <option value="all">{l('সব লেখক', 'All Authors')}</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
          )}

          {hasActiveFilters && (
            <button onClick={() => { setSearch(''); setStatus('all'); setEdition('all'); setAuthor('all'); applyFilters({ search: '', status: 'all', edition: 'all', author: 'all' }); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <RotateCcw className="w-3.5 h-3.5" /> {l('রিসেট', 'Reset')}
            </button>
          )}
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--card-border,#e8ebf4)] flex-wrap animate-in slide-in-from-top-1 duration-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{selected.length} {l('টি নির্বাচিত', 'selected')}:</span>
            <button onClick={() => handleBulk('published')} className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-green-100">{l('প্রকাশ', 'Publish')}</button>
            <button onClick={() => handleBulk('draft')}     className="bg-gray-50 text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-gray-100">{l('ড্রাফট', 'Draft')}</button>
            <button onClick={() => handleBulk('archived')}  className="bg-blue-50 text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-blue-100">{l('আর্কাইভ', 'Archive')}</button>
            <button onClick={() => handleBulk('delete')}    className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-red-100">{l('মুছুন', 'Delete')}</button>
            <button onClick={() => setSelected([])} className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2">{l('বাতিল', 'Cancel')}</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider">
              <th className="px-4 py-3 text-left w-10">
                <input type="checkbox" checked={selected.length === opinions.data.length && opinions.data.length > 0}
                  onChange={toggleAll} className="rounded accent-[#e8001e] cursor-pointer" />
              </th>
              <th className="px-4 py-3 text-left">{l('শিরোনাম', 'Title')}</th>
              <th className="px-4 py-3 text-left">{l('লেখক', 'Author')}</th>
              <th className="px-4 py-3 text-left">{l('তারিখ', 'Date')}</th>
              <th className="px-4 py-3 text-left">{l('অবস্থা', 'Status')}</th>
              <th className="px-4 py-3 text-left">{l('কাজ', 'Actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border,#e8ebf4)]">
            {opinions.data.length === 0 ? (
              <tr><td colSpan="6" className="p-10 text-center text-sm text-[var(--text-muted,#9ca3af)]">{l('কোনো কলাম পাওয়া যায়নি', 'No opinion pieces found')}</td></tr>
            ) : opinions.data.map(op => (
              <tr key={op.id} className={`hover:bg-[#fafbff] transition-colors group ${selected.includes(op.id) ? 'bg-[#fff8f8]' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(op.id)} onChange={() => toggleSelect(op.id)}
                    className="rounded accent-[#e8001e] cursor-pointer" />
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-[var(--text-primary,#1a1d2e)] text-[13px] group-hover:text-[#e8001e] transition-colors line-clamp-1">
                    {l(op.title, op.title_en || op.title)}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {op.edition === 'both' && <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">BN+EN</span>}
                    {op.edition === 'bn'   && <span className="text-[9px] px-1.5 py-0.5 bg-[#fff0f2] text-[#e8001e] rounded-full font-medium">বাংলা</span>}
                    {op.edition === 'en'   && <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">EN</span>}
                    {op.is_exclusive && <span className="text-[9px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold">🔥 EXCLUSIVE</span>}
                    {op.is_guest && <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">{l('অতিথি', 'Guest')}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-[12.5px] text-[var(--text-secondary,#6b7280)]">
                  {op.author || '—'}
                </td>
                <td className="px-4 py-3 text-[12px] text-[var(--text-muted,#9ca3af)]">{fmt(op.published_at || op.created_at)}</td>
                <td className="px-4 py-3">
                  <Badge variant={op.status === 'published' ? 'green' : op.status === 'pending' ? 'orange' : 'gray'} className="text-[9px] uppercase font-bold px-2 py-0.5">
                    {op.status === 'published' ? l('প্রকাশিত', 'Published') :
                     op.status === 'pending'   ? l('অপেক্ষায়', 'Pending') : l('ড্রাফট', 'Draft')}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => router.visit(`/admin/opinions/${op.id}/edit`)}
                      className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {op.status === 'pending' && (
                      <button onClick={() => handleStatusChange(op.id, 'published')}
                        className="p-1.5 rounded-md hover:bg-green-50 text-green-400 hover:text-green-600 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {op.status === 'draft' && (
                      <button onClick={() => handleStatusChange(op.id, 'pending')}
                        className="p-1.5 rounded-md hover:bg-orange-50 text-orange-400 hover:text-orange-600 transition-colors">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {op.status === 'published' && (
                      <button onClick={() => handleStatusChange(op.id, 'draft')}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <Send className="w-3.5 h-3.5 rotate-180" />
                      </button>
                    )}
                    <button onClick={() => setDeleteConfirm(op)}
                      className="p-1.5 rounded-md hover:bg-[#fff0f2] text-gray-400 hover:text-[#e8001e] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="px-4 py-3 border-t border-[var(--card-border,#e8ebf4)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted,#9ca3af)]">
              {opinions.from}–{opinions.to} / {opinions.total} {l('টি', 'results')}
            </span>
            <div className="relative">
              <select value={perPage} onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value, page: 1 }); }}
                className="appearance-none border border-[var(--card-border,#e8ebf4)] rounded-lg px-2.5 py-1 pr-6 text-xs outline-none bg-white cursor-pointer">
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} {l('টি', '/page')}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {opinions.last_page > 1 && (
            <div className="flex items-center gap-1">
              {opinions.links.map((link, i) =>
                link.url ? (
                  <a key={i} href={link.url} dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${link.active ? 'bg-[#e8001e] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                    onClick={e => { e.preventDefault(); router.get(link.url, {}, { preserveState: true }); }}
                  />
                ) : (
                  <span key={i} dangerouslySetInnerHTML={{ __html: link.label }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-gray-200 cursor-not-allowed" />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold">{l('মুছে ফেলুন?', 'Delete Opinion?')}</h3>
                <p className="text-xs text-[var(--text-muted,#9ca3af)]">{l('এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না', 'This action cannot be undone')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={submitting}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {l('মুছে ফেলুন', 'Delete')}
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-white border border-gray-200 rounded-lg py-2 text-sm font-semibold hover:bg-gray-50">
                {l('বাতিল', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
