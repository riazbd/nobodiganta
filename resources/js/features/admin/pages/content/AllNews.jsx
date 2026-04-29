import { useState, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Filter, Plus, Eye, Edit3, Trash2, Send, ChevronDown, X, Loader2, AlertTriangle, Globe, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { Pagination } from '../../components/data/Pagination';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { usePermission } from '../../hooks/usePermission';
import { PERMISSIONS } from '../../api/permissions';

export default function AllNews({ articles, categories, filters }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { hasPermission } = usePermission();

  // Filters from URL/Props
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
  
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Debounced search / filter update
  const applyFilters = useCallback((newFilters) => {
    router.get(route('admin.news'), {
      ...filters,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    }, { preserveState: true, preserveScroll: true });
  }, [filters]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    // Real-time search with Inertia might be slow, but for now it's okay for 20 items per page
    // For better UX, we could use a debounce here.
  };

  const handleSearchSubmit = (e) => {
     if (e.key === 'Enter') applyFilters({ search: searchQuery });
  };

  const statusMap = {
    published: { textBn: 'প্রকাশিত', textEn: 'Published', variant: 'green' },
    draft: { textBn: 'ড্রাফট', textEn: 'Draft', variant: 'gray' },
    pending: { textBn: 'অনুমোদন অপেক্ষায়', textEn: 'Pending', variant: 'orange' },
    scheduled: { textBn: 'নির্ধারিত', textEn: 'Scheduled', variant: 'purple' },
    archived: { textBn: 'আর্কাইভড', textEn: 'Archived', variant: 'blue' },
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Actions
  const handleDelete = (articleId) => {
    setSubmitting(true);
    router.delete(route('admin.news.destroy', { article: articleId }), {
      onSuccess: () => {
        showToast(lang === 'bn' ? 'সংবাদ মুছে ফেলা হয়েছে' : 'Article deleted');
        setDeleteConfirm(null);
      },
      onFinish: () => setSubmitting(false),
    });
  };

  const handleApprove = (articleId) => {
    router.patch(route('admin.news.transition-status', { article: articleId }), { status: 'published' }, {
      onSuccess: () => showToast(lang === 'bn' ? 'সংবাদ প্রকাশিত হয়েছে' : 'Article published'),
    });
  };

  const handleBulkAction = (status) => {
    if (selectedArticles.length === 0) return;
    
    if (status === 'delete') {
       if (confirm(lang === 'bn' ? 'নির্বাচিত সংবাদগুলো মুছে ফেলতে চান?' : 'Delete selected articles?')) {
          router.post(route('admin.news.bulk-delete'), { article_ids: selectedArticles }, {
            onSuccess: () => {
               showToast(lang === 'bn' ? 'নির্বাচিত সংবাদ মুছে ফেলা হয়েছে' : 'Selected articles deleted');
               setSelectedArticles([]);
            }
          });
       }
       return;
    }

    router.post(route('admin.news.bulk-status'), { 
      article_ids: selectedArticles, 
      status: status 
    }, {
      onSuccess: () => {
        showToast(lang === 'bn' ? 'নির্বাচিত সংবাদ আপডেট করা হয়েছে' : 'Selected articles updated');
        setSelectedArticles([]);
      }
    });
  };

  const toggleSelect = (id) => {
    setSelectedArticles(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedArticles.length === articles.data.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.data.map(a => a.id));
    }
  };

  return (
    <div className="p-6">
      <Head title={lang === 'bn' ? 'সব সংবাদ' : 'All News'} />

      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] flex items-center gap-3">
            <Globe className="w-7 h-7 text-[#e8001e]" /> 
            {lang === 'bn' ? 'সংবাদ ব্যবস্থাপনা' : 'News Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            {lang === 'bn' ? 'পোর্টালের সকল সংবাদ এখান থেকে পরিচালনা করুন' : 'Manage all portal news articles from here'}
          </p>
        </div>
        <Link 
          href={route('admin.news.write')} 
          className="bg-[#e8001e] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#c00] transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" /> {lang === 'bn' ? 'নতুন সংবাদ' : 'New Article'}
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 gap-3 flex-1 min-w-[280px] focus-within:border-[#e8001e]/30 focus-within:bg-white transition-all">
            <Search className="w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'শিরোনাম বা লেখক দিয়ে খুঁজুন...' : 'Search by title or author...'}
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleSearchSubmit}
              className="border-none bg-transparent outline-none text-sm text-gray-700 w-full placeholder:text-gray-400"
            />
            {searchQuery && <button onClick={() => { setSearchQuery(''); applyFilters({ search: '' }); }}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>}
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); applyFilters({ status: e.target.value }); }}
              className="w-full appearance-none border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 cursor-pointer focus:bg-white transition-all font-medium"
            >
              <option value="all">{lang === 'bn' ? 'সব অবস্থা (Status)' : 'All Status'}</option>
              <option value="published">{lang === 'bn' ? 'প্রকাশিত' : 'Published'}</option>
              <option value="draft">{lang === 'bn' ? 'ড্রাফট' : 'Draft'}</option>
              <option value="pending">{lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending'}</option>
              <option value="scheduled">{lang === 'bn' ? 'নির্ধারিত' : 'Scheduled'}</option>
              <option value="archived">{lang === 'bn' ? 'আর্কাইভড' : 'Archived'}</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); applyFilters({ category: e.target.value }); }}
              className="w-full appearance-none border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 cursor-pointer focus:bg-white transition-all font-medium"
            >
              <option value="all">{lang === 'bn' ? 'সব বিভাগ' : 'All Categories'}</option>
              {categories.map(c => (
                <option key={c.id} value={c.slug}>{lang === 'bn' ? c.name_bn : (c.name_en || c.name_bn)}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Bulk Actions UI */}
        {selectedArticles.length > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{selectedArticles.length} {lang === 'bn' ? 'টি নির্বাচিত' : 'Selected'}:</span>
            <div className="flex gap-2">
               <button onClick={() => handleBulkAction('published')} className="bg-green-50 text-green-600 border border-green-100 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-green-100 transition-colors">
                 {lang === 'bn' ? 'প্রকাশ করুন' : 'Publish'}
               </button>
               <button onClick={() => handleBulkAction('draft')} className="bg-gray-50 text-gray-600 border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-gray-100 transition-colors">
                 {lang === 'bn' ? 'ড্রাফট করুন' : 'Move to Draft'}
               </button>
               <button onClick={() => handleBulkAction('archived')} className="bg-blue-50 text-blue-600 border border-blue-100 rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-blue-100 transition-colors">
                 {lang === 'bn' ? 'আর্কাইভ করুন' : 'Archive'}
               </button>
               <button onClick={() => setSelectedArticles([])} className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2">
                 {lang === 'bn' ? 'বাতিল' : 'Cancel'}
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
              <th className="px-6 py-4 text-left w-10">
                <input 
                  type="checkbox" 
                  checked={selectedArticles.length === articles.data.length && articles.data.length > 0} 
                  onChange={toggleAll} 
                  className="rounded border-gray-300 text-[#e8001e] focus:ring-[#e8001e]" 
                />
              </th>
              <th className="px-4 py-4 text-left">{lang === 'bn' ? 'সংবাদ ও তথ্য' : 'Article & Info'}</th>
              <th className="px-4 py-4 text-left">{lang === 'bn' ? 'বিভাগ' : 'Category'}</th>
              <th className="px-4 py-4 text-left">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
              <th className="px-4 py-4 text-left">{lang === 'bn' ? 'পাঠক ও সময়' : 'Stats & Time'}</th>
              <th className="px-6 py-4 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.data.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-20 text-gray-400 font-medium">{lang === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি' : 'No articles found in this view'}</td></tr>
            ) : (
              articles.data.map(article => {
                const status = statusMap[article.status] || statusMap.draft;
                return (
                  <tr key={article.id} className="hover:bg-[#fafbff] transition-colors group">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedArticles.includes(article.id)} 
                        onChange={() => toggleSelect(article.id)} 
                        className="rounded border-gray-300 text-[#e8001e] focus:ring-[#e8001e]" 
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1 max-w-md">
                        <div className="font-bold text-[#1a1d2e] text-sm group-hover:text-[#e8001e] transition-colors line-clamp-1">
                          {lang === 'bn' ? article.title : (article.title_en || article.title)}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                           <span className="flex items-center gap-1"><User className="w-3 h-3" /> {article.author}</span>
                           {article.edition && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px]">{article.edition}</span>}
                        </div>
                        <div className="flex gap-1.5 mt-1">
                           {article.is_breaking && <Badge variant="red" className="text-[8px] py-0 px-1.5">BREAKING</Badge>}
                           {article.is_featured && <Badge variant="blue" className="text-[8px] py-0 px-1.5">FEATURED</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {article.category && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: article.category.color_code || '#e8001e' }} />
                          <span className="text-xs font-bold text-gray-600">
                            {lang === 'bn' ? article.category.name : article.category.name_en}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={status.variant} className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5">
                        {lang === 'bn' ? status.textBn : status.textEn}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                             <Eye className="w-3 h-3 text-blue-500" /> {article.views?.toLocaleString() || 0}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                             {formatDate(article.published_at || article.created_at)}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={route('admin.news.show', { article: article.id })}
                          className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={route('admin.news.edit', { article: article.id })}
                          className="p-2 rounded-xl hover:bg-green-50 text-gray-400 hover:text-green-600 transition-all"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        {article.status === 'pending' && (
                          <button 
                            onClick={() => handleApprove(article.id)}
                            className="p-2 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-orange-600 transition-all"
                            title="Approve & Publish"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => setDeleteConfirm(article)}
                          className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        
        {/* Pagination Integration */}
        {articles.links && articles.links.length > 3 && (
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
             <div className="text-xs text-gray-400 font-medium">
                Showing {articles.from} to {articles.to} of {articles.total} results
             </div>
             <div className="flex gap-1">
                {articles.links.map((link, i) => (
                   <Link
                      key={i}
                      href={link.url || '#'}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                         link.active 
                            ? 'bg-[#e8001e] text-white' 
                            : link.url ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
                      }`}
                   />
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-gray-100 scale-in-center">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{lang === 'bn' ? 'সংবাদ মুছে ফেলুন?' : 'Delete Article?'}</h3>
              <p className="text-sm text-gray-500 mt-2">
                {lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই সংবাদটি স্থায়ীভাবে মুছে ফেলতে চান?' : 'Are you sure you want to permanently delete this article?'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100 text-left">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Title</div>
              <div className="text-sm font-bold text-gray-700 line-clamp-2">
                {lang === 'bn' ? deleteConfirm.title : (deleteConfirm.title_en || deleteConfirm.title)}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={submitting}
                className="flex-1 bg-red-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-200"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {lang === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-white border border-gray-200 text-gray-600 rounded-xl py-3 text-sm font-bold hover:bg-gray-50 transition-all"
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
