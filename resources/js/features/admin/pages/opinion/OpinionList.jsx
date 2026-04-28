import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { PenLine, Eye, Edit3, Trash2, Send, Search, X, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function OpinionList({ opinions: initialOpinions, filters }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();

  const [opinions, setOpinions] = useState(initialOpinions || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
  const [editionFilter, setEditionFilter] = useState(filters?.edition || 'all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (editionFilter !== 'all') params.append('edition', editionFilter);
      
      const res = await fetch(`/admin/opinions?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      setOpinions(data.opinions);
    } catch (err) {
      console.error('Error fetching opinions:', err);
      showToast(lang === 'bn' ? 'তথ্য লোড করতে ব্যর্থ' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, statusFilter, editionFilter]);

  const handleEdit = (id) => {
    router.visit(`/admin/opinions/${id}/edit`);
  };

  const handleApprove = async (id) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/admin/opinions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        },
        body: JSON.stringify({ status: 'published' })
      });
      if (res.ok) {
        showToast(lang === 'bn' ? 'প্রকাশিত হয়েছে!' : 'Published!');
        fetchData();
      }
    } catch (err) {
      showToast(lang === 'bn' ? 'ব্যর্থ হয়েছে' : 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/admin/opinions/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
        }
      });
      if (res.ok) {
        showToast(lang === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted');
        setDeleteConfirm(null);
        fetchData();
      }
    } catch (err) {
      showToast(lang === 'bn' ? 'মুছতে ব্যর্থ' : 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">✍️ {lang === 'bn' ? 'মতামত কলাম' : 'Opinion Column'}</h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{opinions.length} {lang === 'bn' ? 'টি মতামত' : 'opinion pieces'}</p>
        </div>
        <button 
          onClick={() => router.visit('/admin/opinions/write')} 
          className="bg-[#e8001e] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#b8001a] transition-colors"
        >
          <PenLine className="w-4 h-4" /> {lang === 'bn' ? 'নতুন মতামত' : 'New Opinion'}
        </button>
      </div>

      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-4 mb-4.5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center bg-[var(--body-bg,#f0f2f8)] border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.75 gap-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'মতামত খুঁজুন...' : 'Search opinions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none bg-transparent outline-none text-[12.5px] text-[var(--text-primary,#1a1d2e)] w-full placeholder:text-[var(--text-muted,#9ca3af)]"
            />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" /></button>}
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.75 text-xs outline-none bg-white cursor-pointer"
          >
            <option value="all">{lang === 'bn' ? 'সব অবস্থা' : 'All Status'}</option>
            <option value="published">{lang === 'bn' ? 'প্রকাশিত' : 'Published'}</option>
            <option value="pending">{lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</option>
            <option value="draft">{lang === 'bn' ? 'ড্রাফট' : 'Draft'}</option>
          </select>

          <select
            value={editionFilter}
            onChange={(e) => setEditionFilter(e.target.value)}
            className="border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.75 text-xs outline-none bg-white cursor-pointer"
          >
            <option value="all">{lang === 'bn' ? 'সব এডিশন' : 'All Editions'}</option>
            <option value="bn">{lang === 'bn' ? 'বাংলা' : 'Bangla'}</option>
            <option value="en">{lang === 'bn' ? 'ইংরেজি' : 'English'}</option>
            <option value="both">{lang === 'bn' ? 'উভয়' : 'Both'}</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        {loading && (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#e8001e] mx-auto mb-2" />
            <span className="text-sm text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</span>
          </div>
        )}

        {!loading && (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'শিরোনাম' : 'Title'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'লেখক' : 'Author'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'কাজ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {opinions.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-sm text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'কোনো কলাম পাওয়া যায়নি' : 'No pieces found'}</td></tr>
              ) : (
                opinions.map(op => (
                  <tr key={op.id} className="hover:bg-[#fafbff] transition-colors">
                    <td className="px-4 py-3 border-b border-[#f3f4f6]">
                      <div className="font-semibold text-[var(--text-primary,#1a1d2e)] text-[13px]">
                        {lang === 'bn' ? (op.title || op.title_en) : (op.title_en || op.title)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {op.edition === 'both' && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">Both</span>}
                        {op.edition === 'bn' && <span className="text-[10px] px-1.5 py-0.5 bg-[#fff0f2] text-[#e8001e] rounded-full font-medium">বাংলা</span>}
                        {op.edition === 'en' && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">EN</span>}
                        {op.is_exclusive && <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold">🔥 EXCLUSIVE</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] text-[var(--text-secondary,#6b7280)]">
                      {typeof op.author === 'object' ? op.author?.name : (op.author || '—')}
                    </td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] text-[var(--text-muted,#9ca3af)]">{formatDate(op.published_at || op.created_at)}</td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6]">
                      <Badge variant={op.status === 'published' ? 'green' : op.status === 'pending' ? 'orange' : 'gray'}>
                        {op.status === 'published' ? (lang === 'bn' ? 'প্রকাশিত' : 'Published') : 
                         op.status === 'pending' ? (lang === 'bn' ? 'অপেক্ষায়' : 'Pending') : 
                         (lang === 'bn' ? 'ড্রাফট' : 'Draft')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 border-b border-[#f3f4f6]">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"><Eye className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" /></button>
                        <button onClick={() => handleEdit(op.id)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"><Edit3 className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" /></button>
                        {op.status === 'pending' && (
                          <button onClick={() => handleApprove(op.id)} disabled={submitting} className="p-1.5 rounded-md hover:bg-[#ecfdf5] transition-colors"><Send className="w-3.5 h-3.5 text-[#10b981]" /></button>
                        )}
                        <button onClick={() => setDeleteConfirm(op)} className="p-1.5 rounded-md hover:bg-[#fff0f2] transition-colors"><Trash2 className="w-3.5 h-3.5 text-[#e8001e]" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold">{lang === 'bn' ? 'মুছে ফেলুন?' : 'Delete Opinion?'}</h3>
                <p className="text-xs text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না' : 'This action cannot be undone'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={submitting} className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-white border border-gray-200 rounded-lg py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
