import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Edit3, Trash2, Eye, Send, Loader2, AlertTriangle, X, CheckCircle, Clock, Archive } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

function NewsTable({ articles, filters, title, label }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters?.search || '');

  const handleStatusChange = (id, newStatus) => {
    router.patch(route('admin.news.transition-status', { article: id }), { status: newStatus }, {
      onSuccess: () => showToast(lang === 'bn' ? 'সংবাদের অবস্থা আপডেট করা হয়েছে' : 'Article status updated'),
      preserveScroll: true
    });
  };

  const handleDelete = (id) => {
    if (!confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে সংবাদটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this?')) return;
    router.delete(route('admin.news.destroy', { article: id }), {
      onSuccess: () => showToast(lang === 'bn' ? 'সংবাদ মুছে ফেলা হয়েছে' : 'Article deleted'),
      preserveScroll: true
    });
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
       router.get(window.location.pathname, { ...filters, search: searchQuery }, { preserveState: true });
    }
  };

  const statusMap = {
    published: { color: 'green', bn: 'প্রকাশিত', en: 'Published' },
    draft: { color: 'gray', bn: 'খসড়া', en: 'Draft' },
    pending: { color: 'orange', bn: 'অপেক্ষমাণ', en: 'Pending' },
    scheduled: { color: 'purple', bn: 'নির্ধারিত', en: 'Scheduled' },
  };

  return (
    <div className="p-6">
      <Head title={title} />
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali']">{label}</h1>
          <p className="text-sm text-gray-500 mt-1">{articles.total || 0} {lang === 'bn' ? 'টি সংবাদ পাওয়া গেছে' : 'articles found'}</p>
        </div>
        <Link href={route('admin.news.write')} className="bg-[#e8001e] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#c00] transition-all shadow-md">
           <Send className="w-4 h-4" /> {lang === 'bn' ? 'নতুন সংবাদ' : 'New Article'}
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
           <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2 gap-2 w-full max-w-xs focus-within:border-[#e8001e]/30 transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder={lang === 'bn' ? 'খুঁজুন...' : 'Search...'} 
                className="border-none bg-transparent outline-none text-sm w-full"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
           </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <th className="px-6 py-4 text-left">{lang === 'bn' ? 'শিরোনাম' : 'Title'}</th>
              <th className="px-4 py-4 text-left">{lang === 'bn' ? 'বিভাগ' : 'Category'}</th>
              <th className="px-4 py-4 text-left">{lang === 'bn' ? 'লেখক' : 'Author'}</th>
              <th className="px-4 py-4 text-left">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
              <th className="px-6 py-4 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {articles.data.map(article => {
              const st = statusMap[article.status] || statusMap.draft;
              return (
                <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-[#e8001e] transition-colors">
                      {lang === 'bn' ? article.title : (article.title_en || article.title)}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">{new Date(article.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="gray" className="text-[10px] px-2 py-0.5">{lang === 'bn' ? article.category?.name : article.category?.name_en}</Badge>
                  </td>
                  <td className="px-4 py-4 text-xs font-semibold text-gray-500">{article.author}</td>
                  <td className="px-4 py-4">
                    <Badge variant={st.color} className="text-[9px] uppercase font-bold px-2 py-0.5">{lang === 'bn' ? st.bn : st.en}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={route('admin.news.show', { article: article.id })} className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-500 rounded-lg transition-all" title="View"><Eye className="w-4 h-4" /></Link>
                      <Link href={route('admin.news.edit', { article: article.id })} className="p-2 hover:bg-green-50 text-gray-400 hover:text-green-500 rounded-lg transition-all" title="Edit"><Edit3 className="w-4 h-4" /></Link>
                      
                      {article.status === 'pending' && (
                        <button onClick={() => handleStatusChange(article.id, 'published')} className="p-2 hover:bg-green-50 text-green-400 hover:text-green-600 rounded-lg transition-all" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                      )}
                      
                      {article.status === 'draft' && (
                        <button onClick={() => handleStatusChange(article.id, 'pending')} className="p-2 hover:bg-orange-50 text-orange-400 hover:text-orange-600 rounded-lg transition-all" title="Submit"><Send className="w-4 h-4" /></button>
                      )}

                      {article.status === 'published' && (
                        <button onClick={() => handleStatusChange(article.id, 'draft')} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-all" title="Unpublish"><Archive className="w-4 h-4" /></button>
                      )}

                      <button onClick={() => handleDelete(article.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {articles.data.length === 0 && (
              <tr><td colSpan="5" className="py-20 text-center text-gray-400 font-medium">{lang === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি' : 'No articles found'}</td></tr>
            )}
          </tbody>
        </table>

        {articles.links && articles.links.length > 3 && (
           <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-center">
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
    </div>
  );
}

export default function Drafts({ articles, filters }) {
  const { lang } = useLanguage();
  return <NewsTable 
    articles={articles} 
    filters={filters} 
    title={lang === 'bn' ? 'খসড়া সংবাদ' : 'Draft Articles'} 
    label={lang === 'bn' ? 'খসড়া সংবাদ' : 'Drafts'}
  />;
}

export function PendingApproval({ articles, filters }) {
  const { lang } = useLanguage();
  return <NewsTable 
    articles={articles} 
    filters={filters} 
    title={lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending Approval'} 
    label={lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending Approval'}
  />;
}

export function Published({ articles, filters }) {
  const { lang } = useLanguage();
  return <NewsTable 
    articles={articles} 
    filters={filters} 
    title={lang === 'bn' ? 'প্রকাশিত সংবাদ' : 'Published Articles'} 
    label={lang === 'bn' ? 'প্রকাশিত সংবাদ' : 'Published'}
  />;
}
