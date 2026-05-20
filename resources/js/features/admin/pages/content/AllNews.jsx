import { useState, useCallback, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
  Search, Plus, Eye, Edit3, Trash2, Send, ChevronDown, X, Loader2,
  AlertTriangle, Globe, CheckCircle, User, ArrowUpDown, ArrowUp, ArrowDown,
  Filter, RotateCcw
} from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { usePermission } from '../../hooks/usePermission';

const STATUS_MAP = {
  published: { bn: 'প্রকাশিত',         en: 'Published', variant: 'green'  },
  draft:     { bn: 'ড্রাফট',            en: 'Draft',     variant: 'gray'   },
  pending:   { bn: 'অনুমোদন অপেক্ষায়', en: 'Pending',   variant: 'orange' },
  scheduled: { bn: 'নির্ধারিত',         en: 'Scheduled', variant: 'purple' },
  archived:  { bn: 'আর্কাইভড',          en: 'Archived',  variant: 'blue'   },
};

const TYPE_OPTIONS = [
  { value: 'all',       bn: 'সব ধরন',     en: 'All Types'   },
  { value: 'news',      bn: 'সংবাদ',       en: 'News'        },
  { value: 'feature',   bn: 'ফিচার',       en: 'Feature'     },
  { value: 'opinion',   bn: 'মতামত',       en: 'Opinion'     },
  { value: 'interview', bn: 'সাক্ষাৎকার', en: 'Interview'   },
  { value: 'explainer', bn: 'ব্যাখ্যামূলক', en: 'Explainer' },
  { value: 'video',     bn: 'ভিডিও',       en: 'Video'       },
  { value: 'photo',     bn: 'ফটো এসে',    en: 'Photo Essay'  },
  { value: 'liveblog',  bn: 'লাইভ ব্লগ',  en: 'Live Blog'   },
  { value: 'sponsored', bn: 'স্পনসরড',    en: 'Sponsored'   },
];

function SortIcon({ column, sortBy, sortDir }) {
  if (sortBy !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30 inline" />;
  return sortDir === 'asc'
    ? <ArrowUp className="w-3 h-3 ml-1 text-[#263238] inline" />
    : <ArrowDown className="w-3 h-3 ml-1 text-[#263238] inline" />;
}

export default function AllNews({ articles, categories, authors = [], divisions = [], locationTree = null, filters }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { hasPermission } = usePermission();
  const searchTimer = useRef(null);

  const [search,       setSearch]       = useState(filters.search       || '');
  const [status,       setStatus]       = useState(filters.status       || 'all');
  const [category,     setCategory]     = useState(filters.category     || 'all');
  const [edition,      setEdition]      = useState(filters.edition      || 'all');
  const [articleType,  setArticleType]  = useState(filters.article_type || 'all');
  const [author,       setAuthor]       = useState(filters.author       || 'all');
  const [division,     setDivision]     = useState(filters.division     || '');
  const [district,     setDistrict]     = useState(filters.district     || '');
  const [locCategory,  setLocCategory]  = useState(filters.location_category || '');
  const [dateFrom,     setDateFrom]     = useState(filters.date_from    || '');
  const [dateTo,       setDateTo]       = useState(filters.date_to      || '');
  const [perPage,      setPerPage]      = useState(filters.per_page     || '20');
  const [sortBy,       setSortBy]       = useState(filters.sort_by      || 'created_at');
  const [sortDir,      setSortDir]      = useState(filters.sort_dir     || 'desc');
  const [showFilters,  setShowFilters]  = useState(false);
  const [selected,     setSelected]     = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [dists,        setDists]        = useState([]);

  useEffect(() => {
    if (division) {
      window.axios.get(`/api/location/districts/${division}`)
        .then(r => setDists(r.data))
        .catch(() => setDists([]));
    }
  }, [division]);

  const buildParams = (overrides = {}) => {
    const p = {
      search, status, category, edition,
      article_type: articleType, author,
      division, district, location_category: locCategory,
      date_from: dateFrom, date_to: dateTo,
      per_page: perPage, sort_by: sortBy, sort_dir: sortDir,
      page: 1,
      ...overrides,
    };
    Object.keys(p).forEach(k => { if (p[k] === 'all' || p[k] === '' || p[k] == null) delete p[k]; });
    return p;
  };

  const applyFilters = useCallback((overrides = {}) => {
    router.get(route('admin.news'), buildParams(overrides), { preserveState: true, preserveScroll: true });
  }, [search, status, category, edition, articleType, author, division, district, locCategory, dateFrom, dateTo, perPage, sortBy, sortDir]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => applyFilters({ search: val }), 400);
  };

  const handleSort = (col) => {
    const dir = sortBy === col && sortDir === 'desc' ? 'asc' : 'desc';
    setSortBy(col); setSortDir(dir);
    applyFilters({ sort_by: col, sort_dir: dir });
  };

  const handleDivisionChange = (val) => {
    setDivision(val);
    setDistrict('');
    setDists([]);
    if (val) {
      window.axios.get(`/api/location/districts/${val}`)
        .then(r => setDists(r.data))
        .catch(() => setDists([]));
    }
    applyFilters({ division: val, district: '' });
  };

  const resetFilters = () => {
    setSearch(''); setStatus('all'); setCategory('all'); setEdition('all');
    setArticleType('all'); setAuthor('all'); setDivision(''); setDistrict(''); setDists([]);
    setLocCategory(''); setDateFrom(''); setDateTo('');
    setPerPage('20'); setSortBy('created_at'); setSortDir('desc');
    router.get(route('admin.news'), {}, { preserveState: true });
  };

  const hasActiveFilters = status !== 'all' || category !== 'all' || edition !== 'all' ||
    articleType !== 'all' || author !== 'all' || division || district || locCategory || dateFrom || dateTo;

  const handleDelete = (id) => {
    setSubmitting(true);
    router.delete(route('admin.news.destroy', { article: id }), {
      onSuccess: () => { showToast(lang === 'bn' ? 'সংবাদ মুছে ফেলা হয়েছে' : 'Article deleted'); setDeleteConfirm(null); },
      onFinish: () => setSubmitting(false),
    });
  };

  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.news.transition-status', { article: id }), { status: newStatus }, {
      preserveScroll: true,
      onSuccess: () => showToast(lang === 'bn' ? 'অবস্থা আপডেট হয়েছে' : 'Status updated'),
    });
  };

  const handleBulk = (action) => {
    if (!selected.length) return;
    if (action === 'delete') {
      if (!confirm(lang === 'bn' ? `${selected.length}টি সংবাদ মুছে ফেলতে চান?` : `Delete ${selected.length} articles?`)) return;
      router.post(route('admin.news.bulk-delete'), { article_ids: selected }, {
        onSuccess: () => { showToast(lang === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted'); setSelected([]); },
      });
      return;
    }
    router.post(route('admin.news.bulk-status'), { article_ids: selected, status: action }, {
      onSuccess: () => { showToast(lang === 'bn' ? 'আপডেট হয়েছে' : 'Updated'); setSelected([]); },
    });
  };

  const toggleSelect = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === articles.data.length ? [] : articles.data.map(a => a.id));

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const l = (bn, en) => lang === 'bn' ? bn : en;

  return (
    <div className="p-6">
      <Head title={l('সব সংবাদ', 'All News')} />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-[#263238]" />
            {l('সংবাদ ব্যবস্থাপনা', 'News Management')}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {articles.total} {l('টি সংবাদ', 'articles')}
          </p>
        </div>
        <Link
          href={route('admin.news.write')}
          className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#c00] transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> {l('নতুন সংবাদ', 'New Article')}
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-4">

        {/* Row 1 */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 gap-2.5 flex-1 min-w-[220px] focus-within:border-[#263238]/40 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={l('শিরোনাম বা লেখক খুঁজুন...', 'Search by title or author...')}
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="border-none bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
            />
            {search && <button onClick={() => handleSearch('')}><X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" /></button>}
          </div>

          {/* Status */}
          <Select value={status} onChange={v => { setStatus(v); applyFilters({ status: v }); }}>
            <option value="all">{l('সব অবস্থা', 'All Status')}</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{l(v.bn, v.en)}</option>)}
          </Select>

          {/* Edition */}
          <Select value={edition} onChange={v => { setEdition(v); applyFilters({ edition: v }); }}>
            <option value="all">{l('সব এডিশন', 'All Editions')}</option>
            <option value="bn">{l('শুধু বাংলা', 'Bangla Only')}</option>
            <option value="en">{l('শুধু ইংরেজি', 'English Only')}</option>
            <option value="both">{l('উভয়', 'Both')}</option>
          </Select>

          {/* Category */}
          <Select value={category} onChange={v => { setCategory(v); applyFilters({ category: v }); }} className="min-w-[150px]">
            <option value="all">{l('সব বিভাগ', 'All Categories')}</option>
            {categories.map(c => <option key={c.id} value={c.slug}>{l(c.name_bn, c.name_en || c.name_bn)}</option>)}
          </Select>

          {/* More filters toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 border rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${showFilters || hasActiveFilters ? 'border-[#263238] text-[#263238] bg-[#eceff1]' : 'border-gray-100 text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            {l('আরো', 'More')}
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#263238]" />}
          </button>

          {hasActiveFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <RotateCcw className="w-3.5 h-3.5" /> {l('রিসেট', 'Reset')}
            </button>
          )}
        </div>

        {/* Row 2: expanded filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 items-center mt-3 pt-3 border-t border-gray-50">
            {/* Article Type */}
            <Select value={articleType} onChange={v => { setArticleType(v); applyFilters({ article_type: v }); }}>
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{l(o.bn, o.en)}</option>)}
            </Select>

            {/* Author */}
            <Select value={author} onChange={v => { setAuthor(v); applyFilters({ author: v }); }} className="min-w-[150px]">
              <option value="all">{l('সব লেখক', 'All Authors')}</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>

            {/* Division */}
            <Select value={division} onChange={handleDivisionChange} className="min-w-[140px]">
              <option value="">{l('সব বিভাগ', 'All Divisions')}</option>
              {divisions.map(d => <option key={d.id} value={d.slug}>{l(d.name_bn, d.name_en)}</option>)}
            </Select>

            {/* District */}
            <Select value={district} onChange={v => { setDistrict(v); applyFilters({ district: v }); }} className="min-w-[140px]">
              <option value="">{l('সব জেলা', 'All Districts')}</option>
              {dists.map(d => <option key={d.id} value={d.slug}>{l(d.name_bn, d.name_en)}</option>)}
            </Select>

            {/* Date range */}
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); applyFilters({ date_from: e.target.value }); }}
              className="border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-gray-50 focus:bg-white transition-all cursor-pointer"
            />
            <span className="text-gray-300 text-sm">–</span>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); applyFilters({ date_to: e.target.value }); }}
              className="border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm outline-none bg-gray-50 focus:bg-white transition-all cursor-pointer"
            />

          </div>
        )}

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 animate-in slide-in-from-top-1 duration-200 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {selected.length} {l('টি নির্বাচিত', 'selected')}:
            </span>
            <button onClick={() => handleBulk('published')} className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-green-100 transition-colors">{l('প্রকাশ', 'Publish')}</button>
            <button onClick={() => handleBulk('draft')}     className="bg-gray-50 text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-gray-100 transition-colors">{l('ড্রাফট', 'Draft')}</button>
            <button onClick={() => handleBulk('pending')}   className="bg-orange-50 text-orange-600 border border-orange-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-orange-100 transition-colors">{l('রিভিউ', 'Send for Review')}</button>
            <button onClick={() => handleBulk('archived')}  className="bg-blue-50 text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-blue-100 transition-colors">{l('আর্কাইভ', 'Archive')}</button>
            <button onClick={() => handleBulk('delete')}    className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-red-100 transition-colors">{l('মুছুন', 'Delete')}</button>
            <button onClick={() => setSelected([])} className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2">{l('বাতিল', 'Cancel')}</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100">
              <th className="px-5 py-3.5 text-left w-10">
                <input type="checkbox" checked={selected.length === articles.data.length && articles.data.length > 0}
                  onChange={toggleAll} className="rounded border-gray-300 text-[#263238] focus:ring-[#263238]" />
              </th>
              <Th onClick={() => handleSort('title_bn')} sortable>
                {l('সংবাদ', 'Article')} <SortIcon column="title_bn" sortBy={sortBy} sortDir={sortDir} />
              </Th>
              <Th>{l('বিভাগ', 'Category')}</Th>
              <Th>{l('এডিশন', 'Edition')}</Th>
              <Th>{l('অবস্থা', 'Status')}</Th>
              <Th onClick={() => handleSort('views')} sortable>
                {l('পাঠক', 'Views')} <SortIcon column="views" sortBy={sortBy} sortDir={sortDir} />
              </Th>
              <Th onClick={() => handleSort('created_at')} sortable>
                {l('তারিখ', 'Date')} <SortIcon column="created_at" sortBy={sortBy} sortDir={sortDir} />
              </Th>
              <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {l('অ্যাকশন', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.data.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-20">
                  <Globe className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-400">{l('কোনো সংবাদ পাওয়া যায়নি', 'No articles found')}</p>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} className="mt-2 text-xs text-[#263238] hover:underline">{l('ফিল্টার রিসেট করুন', 'Reset filters')}</button>
                  )}
                </td>
              </tr>
            ) : articles.data.map(article => {
              const st = STATUS_MAP[article.status] || STATUS_MAP.draft;
              return (
                <tr key={article.id} className={`hover:bg-[#fafbff] transition-colors group ${selected.includes(article.id) ? 'bg-[#fff8f8]' : ''}`}>
                  <td className="px-5 py-3.5">
                    <input type="checkbox" checked={selected.includes(article.id)} onChange={() => toggleSelect(article.id)}
                      className="rounded border-gray-300 text-[#263238] focus:ring-[#263238]" />
                  </td>

                  {/* Article */}
                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="font-semibold text-[#1a1d2e] text-sm group-hover:text-[#263238] transition-colors line-clamp-2 leading-snug">
                      {l(article.title, article.title_en || article.title)}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <User className="w-3 h-3" /> {article.author || '—'}
                      </span>
                      {article.article_type && article.article_type !== 'news' && (
                        <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">{article.article_type}</span>
                      )}
                      {article.is_breaking && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">BREAKING</span>}
                      {article.is_featured && <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">FEATURED</span>}
                      {article.is_premium  && <span className="text-[8px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">PREMIUM</span>}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    {article.category ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: article.category.color_code || '#263238' }} />
                        <span className="text-xs font-medium text-gray-600 truncate max-w-[100px]">
                          {l(article.category.name, article.category.name_en || article.category.name)}
                        </span>
                      </div>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>

                  {/* Edition */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      article.edition === 'both' ? 'bg-gray-100 text-gray-600' :
                      article.edition === 'bn'   ? 'bg-[#eceff1] text-[#263238]' :
                                                   'bg-blue-50 text-blue-600'
                    }`}>
                      {article.edition === 'both' ? 'BN+EN' : article.edition?.toUpperCase()}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <Badge variant={st.variant} className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5">
                      {l(st.bn, st.en)}
                    </Badge>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3.5 text-xs font-semibold text-gray-500">
                    {(article.views || 0).toLocaleString()}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-[11px] text-gray-400 whitespace-nowrap">
                    {fmt(article.published_at || article.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={route('admin.news.show', { article: article.id })}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all" title={l('দেখুন', 'View')}>
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link href={route('admin.news.edit', { article: article.id })}
                        className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-all" title={l('সম্পাদনা', 'Edit')}>
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      {article.status === 'pending' && (
                        <button onClick={() => handleStatusChange(article.id, 'published')}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-all" title={l('অনুমোদন', 'Approve')}>
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {article.status === 'draft' && (
                        <button onClick={() => handleStatusChange(article.id, 'pending')}
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-all" title={l('রিভিউতে পাঠান', 'Submit for Review')}>
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      {article.status === 'published' && (
                        <button onClick={() => handleStatusChange(article.id, 'draft')}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all" title={l('আনপাবলিশ', 'Unpublish')}>
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => setDeleteConfirm(article)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all" title={l('মুছুন', 'Delete')}>
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
            <span className="text-xs text-gray-400">
              {articles.from}–{articles.to} / {articles.total} {l('টি', 'results')}
            </span>
            <div className="relative">
              <select
                value={perPage}
                onChange={e => { setPerPage(e.target.value); applyFilters({ per_page: e.target.value, page: 1 }); }}
                className="appearance-none border border-gray-100 rounded-lg px-3 py-1.5 pr-7 text-xs font-medium outline-none bg-gray-50 cursor-pointer"
              >
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} {l('টি', '/page')}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {articles.last_page > 1 && (
            <div className="flex items-center gap-1">
              {articles.links.map((link, i) =>
                link.url ? (
                  <Link key={i} href={link.url} dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${link.active ? 'bg-[#263238] text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  />
                ) : (
                  <span key={i} dangerouslySetInnerHTML={{ __html: link.label }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-200 cursor-not-allowed"
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 border border-gray-100">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{l('সংবাদ মুছে ফেলুন?', 'Delete Article?')}</h3>
              <p className="text-sm text-gray-400 mt-1">{l('এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না', 'This action cannot be undone')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3.5 mb-5 text-sm font-semibold text-gray-700 line-clamp-2 border border-gray-100">
              {l(deleteConfirm.title, deleteConfirm.title_en || deleteConfirm.title)}
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm.id)} disabled={submitting}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {l('হ্যাঁ, মুছুন', 'Yes, Delete')}
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-white border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-bold hover:bg-gray-50 transition-all">
                {l('বাতিল', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small helper components to keep the JSX concise
function Select({ value, onChange, children, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`appearance-none border border-gray-100 rounded-xl px-3.5 py-2.5 pr-8 text-sm outline-none bg-gray-50 cursor-pointer focus:bg-white transition-all font-medium ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Th({ children, onClick, sortable }) {
  const cls = 'px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400';
  if (sortable && onClick) {
    return <th className={cls}><button onClick={onClick} className="flex items-center hover:text-gray-600 transition-colors">{children}</button></th>;
  }
  return <th className={cls}>{children}</th>;
}
