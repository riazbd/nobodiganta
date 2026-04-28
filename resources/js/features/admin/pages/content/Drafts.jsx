import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Search, Edit3, Trash2, Eye, Send, Loader2, AlertTriangle, X } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { Pagination } from '../../components/data/Pagination';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

function NewsTable({ filterStatus }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();
  
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/admin/news?format=json&status=${filterStatus}`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/admin/news/${id}/status`, {
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
      showToast(lang === 'bn' ? 'অনুমোদন করতে ব্যর্থ' : 'Failed to approve');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/admin/news/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
          'Accept': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Delete failed');
      showToast(lang === 'bn' ? 'সংবাদ মুছে ফেলা হয়েছে' : 'Article deleted');
      await fetchData();
    } catch (err) {
      showToast(lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ' : 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = articles.filter(a => {
    const title = (a.title || '').toLowerCase();
    const titleEn = (a.title_en || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return !searchQuery || title.includes(q) || titleEn.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusLabels = {
    draft: { bn: 'ড্রাফট', en: 'Drafts' },
    pending: { bn: 'মুলতুবি অনুমোদন', en: 'Pending Approval' },
    published: { bn: 'প্রকাশিত', en: 'Published' },
    scheduled: { bn: 'নির্ধারিত', en: 'Scheduled' },
  };

  const label = statusLabels[filterStatus] || { bn: filterStatus, en: filterStatus };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#e8001e]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 text-sm font-semibold">{error}</p>
        <button onClick={fetchData} className="mt-4 text-xs font-bold text-red-600 underline">Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">
            📰 {lang === 'bn' ? label.bn : label.en}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">
            {filtered.length} {lang === 'bn' ? 'টি সংবাদ পাওয়া গেছে' : 'articles found'}
          </p>
        </div>
      </div>

      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--card-border,#e8ebf4)]">
          <div className="flex items-center bg-[var(--body-bg,#f0f2f8)] border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.75 gap-2 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'খুঁজুন...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="border-none bg-transparent outline-none text-[12.5px] text-[var(--text-primary,#1a1d2e)] w-full placeholder:text-[var(--text-muted,#9ca3af)]"
            />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5" /></button>}
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted,#9ca3af)]">
            {lang === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি' : 'No articles found'}
          </div>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'শিরোনাম' : 'Title'}</th>
                  <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'লেখক' : 'Author'}</th>
                  <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'পাঠক' : 'Views'}</th>
                  <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'কাজ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(article => (
                  <tr key={article.id} className="hover:bg-[#fafbff] transition-colors">
                    <td className="px-4 py-3 border-b border-[#f3f4f6]">
                      <div className="font-semibold text-[var(--text-primary,#1a1d2e)] text-[13px]">{lang === 'bn' ? article.title : article.title_en || article.title}</div>
                    </td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] text-[var(--text-secondary,#6b7280)]">
                      {typeof article.author === 'object' ? article.author?.name : (article.author || '—')}
                    </td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] font-semibold font-['Inter']">{article.views > 0 ? article.views.toLocaleString('en-IN') : '—'}</td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] text-[var(--text-secondary,#6b7280)]">{new Date(article.published_at || article.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6]">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => window.open(`/admin/news/${article.id}`, '_blank')} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"><Eye className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" /></button>
                        <button onClick={() => router.visit(`/admin/news/${article.id}/edit`)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"><Edit3 className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" /></button>
                        {filterStatus === 'pending' && (
                          <button onClick={() => handleApprove(article.id)} disabled={submitting} className="p-1.5 rounded-md hover:bg-[#ecfdf5] transition-colors"><Send className="w-3.5 h-3.5 text-[#10b981]" /></button>
                        )}
                        <button onClick={() => handleDelete(article.id)} disabled={submitting} className="p-1.5 rounded-md hover:bg-[#fff0f2] transition-colors"><Trash2 className="w-3.5 h-3.5 text-[#e8001e]" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="px-5 py-3">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => setCurrentPage(p)} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Drafts() {
  return <NewsTable filterStatus="draft" />;
}

export function PendingApproval() { return <NewsTable filterStatus="pending" />; }
export function Published() { return <NewsTable filterStatus="published" />; }
