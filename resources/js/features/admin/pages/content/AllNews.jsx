import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Search, Filter, Plus, Eye, Edit3, Trash2, Send, ChevronDown, X, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { Pagination } from '../../components/data/Pagination';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { usePermission } from '../../hooks/usePermission';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';
import { PERMISSIONS } from '../../api/permissions';

export default function AllNews() {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { hasPermission } = usePermission();
  const { onNavigate } = useAdminNavigation();

  // State
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPage = 15;

  // Fetch data from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch articles
      const articlesRes = await fetch('/admin/news?format=json');
      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData.articles || []);
      }

      // Fetch categories
      const catRes = await fetch('/api/admin/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        const transformed = catData.map(c => ({
          id: c.id,
          nameBn: c.name_bn || '',
          nameEn: c.name_en || '',
          slug: c.slug || '',
        }));
        setCategories(transformed);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter articles
  const filtered = articles.filter(a => {
    const title = (a.title || '').toLowerCase();
    const titleEn = (a.title_en || '').toLowerCase();
    const author = (a.author || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = !searchQuery || title.includes(q) || titleEn.includes(q) || author.includes(q);
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || a.category?.slug === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusMap = {
    published: { textBn: 'প্রকাশিত', textEn: 'Published', variant: 'green' },
    draft: { textBn: 'ড্রাফট', textEn: 'Draft', variant: 'gray' },
    pending: { textBn: 'অনুমোদন অপেক্ষায়', textEn: 'Pending', variant: 'orange' },
    in_review: { textBn: 'পর্যালোচনাধীন', textEn: 'In Review', variant: 'blue' },
    scheduled: { textBn: 'নির্ধারিত', textEn: 'Scheduled', variant: 'purple' },
    archived: { textBn: 'আর্কাইভড', textEn: 'Archived', variant: 'blue' },
  };

  const getCategoryColor = (slug) => {
    const colors = {
      bangladesh: 'red', international: 'blue', politics: 'purple', economy: 'green',
      sports: 'red', entertainment: 'purple', opinion: 'orange', technology: 'cyan',
      lifestyle: 'pink', education: 'purple', health: 'green', environment: 'green',
      probash: 'orange', business: 'cyan', 'islamic-life': 'green', horoscope: 'purple',
    };
    return colors[slug] || 'blue';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Actions
  const handleDelete = async (article) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/admin/news/${article.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
          'Accept': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteConfirm(null);
      showToast(lang === 'bn' ? 'সংবাদ মুছে ফেলা হয়েছে' : 'Article deleted');
      await fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
      showToast(lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ' : 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (articleId) => {
    router.visit(`/admin/news/${articleId}/edit`);
  };

  const handleView = (articleId) => {
    // Navigate to the article preview page
    const article = articles.find(a => a.id === articleId);
    if (article) {
      const slug = article.slug || '';
      const catSlug = article.category?.slug || '';
      window.open(`/${catSlug}/${slug}`, '_blank');
    }
  };

  const handleApprove = async (articleId) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/admin/news/${articleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ status: 'published' }),
      });
      if (!res.ok) throw new Error('Approval failed');
      showToast(lang === 'bn' ? 'সংবাদ অনুমোদিত হয়েছে!' : 'Article approved!');
      await fetchData();
    } catch (err) {
      console.error('Error approving:', err);
      showToast(lang === 'bn' ? 'অনুমোদন করতে ব্যর্থ' : 'Failed to approve');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedArticles.length === 0) return;
    setSubmitting(true);
    try {
      let status;
      if (action === 'approve') status = 'published';
      else if (action === 'archive') status = 'archived';
      else if (action === 'draft') status = 'draft';

      if (status) {
        const res = await fetch('/admin/news/bulk-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ article_ids: selectedArticles, status }),
        });
        if (!res.ok) throw new Error('Bulk action failed');
      } else if (action === 'delete') {
        for (const id of selectedArticles) {
          await fetch(`/admin/news/${id}`, {
            method: 'DELETE',
            headers: {
              'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
              'Accept': 'application/json',
            },
          });
        }
      }
      showToast(`${selectedArticles.length} ${lang === 'bn' ? 'টি সংবাদ আপডেট হয়েছে' : 'articles updated'}`);
      setSelectedArticles([]);
      await fetchData();
    } catch (err) {
      console.error('Error bulk action:', err);
      showToast(lang === 'bn' ? 'বাল্ক অ্যাকশন ব্যর্থ' : 'Bulk action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedArticles(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedArticles.length === paginated.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(paginated.map(a => a.id));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#e8001e] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted,#9ca3af)]">
            {lang === 'bn' ? 'সংবাদ লোড হচ্ছে...' : 'Loading articles...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-red-700 mb-1">
          {lang === 'bn' ? 'ত্রুটি হয়েছে' : 'Error loading articles'}
        </h3>
        <p className="text-xs text-red-600 mb-4">{error}</p>
        <button onClick={fetchData} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">📰 {lang === 'bn' ? 'সব সংবাদ' : 'All News'}</h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'সকল সংবাদ পরিচালনা করুন' : 'Manage all articles'}</p>
        </div>
        <div className="flex items-center gap-2.5">
          {hasPermission(PERMISSIONS.NEWS_CREATE) && (
            <button onClick={() => onNavigate?.('news-write')} className="bg-[#e8001e] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#b8001a] transition-colors">
              <Plus className="w-4 h-4" /> {lang === 'bn' ? 'নতুন সংবাদ' : 'New Article'}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-4 mb-4.5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center bg-[var(--body-bg,#f0f2f8)] border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.75 gap-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'সংবাদ খুঁজুন...' : 'Search articles...'}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="border-none bg-transparent outline-none text-[12.5px] text-[var(--text-primary,#1a1d2e)] w-full placeholder:text-[var(--text-muted,#9ca3af)]"
            />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" /></button>}
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.75 pr-8 text-xs outline-none bg-[var(--body-bg,#f0f2f8)] cursor-pointer"
            >
              <option value="all">{lang === 'bn' ? 'সব অবস্থা' : 'All Status'}</option>
              <option value="published">{lang === 'bn' ? 'প্রকাশিত' : 'Published'}</option>
              <option value="draft">{lang === 'bn' ? 'ড্রাফট' : 'Draft'}</option>
              <option value="pending">{lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending'}</option>
              <option value="in_review">{lang === 'bn' ? 'পর্যালোচনাধীন' : 'In Review'}</option>
              <option value="scheduled">{lang === 'bn' ? 'নির্ধারিত' : 'Scheduled'}</option>
              <option value="archived">{lang === 'bn' ? 'আর্কাইভড' : 'Archived'}</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted,#9ca3af)] pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.75 pr-8 text-xs outline-none bg-[var(--body-bg,#f0f2f8)] cursor-pointer"
            >
              <option value="all">{lang === 'bn' ? 'সব বিভাগ' : 'All Categories'}</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{lang === 'bn' ? c.nameBn : c.nameEn}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted,#9ca3af)] pointer-events-none" />
          </div>
          <div className="text-xs text-[var(--text-muted,#9ca3af)] ml-auto">
            {filtered.length} {lang === 'bn' ? 'টি সংবাদ পাওয়া গেছে' : 'articles found'}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedArticles.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--card-border,#e8ebf4)]">
            <span className="text-xs text-[var(--text-muted,#9ca3af)]">{selectedArticles.length} {lang === 'bn' ? 'টি নির্বাচিত' : 'selected'}</span>
            <button onClick={() => handleBulkAction('approve')} disabled={submitting} className="bg-[#10b981] text-white text-[11px] font-semibold px-2.5 py-1 rounded-md hover:bg-[#059669] transition-colors disabled:opacity-50">
              {lang === 'bn' ? 'অনুমোদন' : 'Approve'}
            </button>
            <button onClick={() => handleBulkAction('archive')} disabled={submitting} className="bg-white text-[var(--text-secondary,#6b7280)] border border-[var(--card-border,#e8ebf4)] text-[11px] font-semibold px-2.5 py-1 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50">
              {lang === 'bn' ? 'আর্কাইভ' : 'Archive'}
            </button>
            <button onClick={() => handleBulkAction('draft')} disabled={submitting} className="bg-white text-[var(--text-secondary,#6b7280)] border border-[var(--card-border,#e8ebf4)] text-[11px] font-semibold px-2.5 py-1 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50">
              {lang === 'bn' ? 'ড্রাফট' : 'Draft'}
            </button>
            <button onClick={() => handleBulkAction('delete')} disabled={submitting} className="bg-white text-[#e8001e] border border-[#e8001e] text-[11px] font-semibold px-2.5 py-1 rounded-md hover:bg-[#fff0f2] transition-colors disabled:opacity-50">
              {lang === 'bn' ? 'মুছুন' : 'Delete'}
            </button>
            <button onClick={() => setSelectedArticles([])} disabled={submitting} className="text-[11px] text-[var(--text-muted,#9ca3af)] hover:text-[var(--text-primary,#1a1d2e)] transition-colors ml-2 disabled:opacity-50">
              {lang === 'bn' ? 'বাতিল' : 'Clear'}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left w-10">
                <input type="checkbox" checked={selectedArticles.length === paginated.length && paginated.length > 0} onChange={toggleAll} className="rounded" />
              </th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'শিরোনাম' : 'Title'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'বিভাগ' : 'Category'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'লেখক' : 'Author'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'পাঠক' : 'Views'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'কাজ' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-12 text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি' : 'No articles found'}</td></tr>
            ) : (
              paginated.map(article => {
                const status = statusMap[article.status] || statusMap.draft;
                return (
                  <tr key={article.id} className="hover:bg-[#fafbff] transition-colors">
                    <td className="px-4 py-3 border-b border-[#f3f4f6]">
                      <input type="checkbox" checked={selectedArticles.includes(article.id)} onChange={() => toggleSelect(article.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6]">
                      <div className="font-semibold text-[var(--text-primary,#1a1d2e)] text-[13px] truncate max-w-xs">
                        {lang === 'bn' ? (article.title || article.title_bn) : (article.title_en || article.title)}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {article.edition && <span className="text-[9px] px-1 py-0.5 rounded bg-gray-100 text-gray-500 font-bold uppercase">{article.edition}</span>}
                        {article.is_breaking && <Badge variant="red" className="text-[9px]">🔴 {lang === 'bn' ? 'ব্রেকিং' : 'Breaking'}</Badge>}
                        {article.is_exclusive && <Badge variant="orange" className="text-[9px]">🔥 {lang === 'bn' ? 'এক্সক্লুসিভ' : 'Exclusive'}</Badge>}
                        {article.is_featured && <Badge variant="blue" className="text-[9px]">⭐ {lang === 'bn' ? 'ফিচার্ড' : 'Featured'}</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6]">
                      {article.category && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: article.category.color_code || article.category.color || '#e8001e' }} />
                          <span className="text-xs font-medium">
                            {lang === 'bn' ? article.category.name : article.category.name_en || article.category.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] text-[var(--text-secondary,#6b7280)]">
                      {typeof article.author === 'object' ? article.author?.name : (article.author || '—')}
                    </td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] font-semibold font-['Inter']">{article.views > 0 ? article.views.toLocaleString('en-IN') : '—'}</td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6]">
                      <Badge variant={status.variant}>{lang === 'bn' ? status.textBn : status.textEn}</Badge>
                    </td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] text-[var(--text-secondary,#6b7280)]">{formatDate(article.published_at || article.created_at)}</td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6]">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleView(article.id)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title={lang === 'bn' ? 'দেখুন' : 'View'}>
                          <Eye className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" />
                        </button>
                        <button onClick={() => handleEdit(article.id)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title={lang === 'bn' ? 'সম্পাদনা' : 'Edit'}>
                          <Edit3 className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" />
                        </button>
                        {article.status === 'pending' && (
                          <button onClick={() => handleApprove(article.id)} disabled={submitting} className="p-1.5 rounded-md hover:bg-[#ecfdf5] transition-colors disabled:opacity-50" title={lang === 'bn' ? 'অনুমোদন' : 'Approve'}>
                            <Send className="w-3.5 h-3.5 text-[#10b981]" />
                          </button>
                        )}
                        <button onClick={() => setDeleteConfirm(article)} className="p-1.5 rounded-md hover:bg-[#fff0f2] transition-colors" title={lang === 'bn' ? 'মুছুন' : 'Delete'}>
                          <Trash2 className="w-3.5 h-3.5 text-[#e8001e]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-5 py-3">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg,#ffffff)] rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold">{lang === 'bn' ? 'সংবাদ মুছে ফেলুন?' : 'Delete Article?'}</h3>
                <p className="text-xs text-[var(--text-muted,#9ca3af)]">
                  {lang === 'bn' ? 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না' : 'This action cannot be undone'}
                </p>
              </div>
            </div>
            <div className="bg-[var(--body-bg,#f0f2f8)] rounded-lg p-3 mb-4">
              <div className="text-sm font-semibold truncate">
                {lang === 'bn' ? deleteConfirm.title : (deleteConfirm.title_en || deleteConfirm.title)}
              </div>
              <div className="text-xs text-[var(--text-muted,#9ca3af)] mt-1">
                {formatDate(deleteConfirm.published_at || deleteConfirm.created_at)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={submitting}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg py-2 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
