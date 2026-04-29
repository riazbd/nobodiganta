import { Head, Link, router } from '@inertiajs/react';
import { 
  ArrowLeft, Edit, Trash2, Globe, Eye, 
  Clock, User, Tag as TagIcon, Calendar, 
  AlertCircle, CheckCircle, FileText, Share2,
  ExternalLink, BarChart3, MessageSquare
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { Badge } from '../../components/feedback/Badge';

const STATUS_CONFIG = {
  published: { color: 'green', labelBn: 'প্রকাশিত', labelEn: 'Published' },
  draft: { color: 'gray', labelBn: 'খসড়া', labelEn: 'Draft' },
  pending: { color: 'orange', labelBn: 'অপেক্ষমাণ', labelEn: 'Pending' },
  archived: { color: 'red', labelBn: 'আর্কাইভ', labelEn: 'Archived' },
};

export default function ViewArticle({ article }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();

  const status = STATUS_CONFIG[article.status] || STATUS_CONFIG.draft;

  const handleDelete = () => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি এই সংবাদটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this article?')) {
      router.delete(route('admin.news.destroy', { article: article.id }), {
        onSuccess: () => showToast(lang === 'bn' ? 'সংবাদটি মুছে ফেলা হয়েছে' : 'Article deleted successfully'),
        onError: () => showToast(lang === 'bn' ? 'মুছতে সমস্যা হয়েছে' : 'Failed to delete article', 'error')
      });
    }
  };

  const toggleStatus = (newStatus) => {
    router.patch(route('admin.news.transition-status', { article: article.id }), { status: newStatus }, {
      onSuccess: () => showToast(lang === 'bn' ? 'অবস্থা পরিবর্তন করা হয়েছে' : 'Status updated successfully'),
      onError: () => showToast(lang === 'bn' ? 'পরিবর্তন ব্যর্থ হয়েছে' : 'Status update failed', 'error')
    });
  };

  if (!article) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Head title={lang === 'bn' ? `সংবাদ দেখুন: ${article.title_bn}` : `View Article: ${article.title_en}`} />

      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href={route('admin.news')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 font-['Noto_Sans_Bengali']">
                {lang === 'bn' ? 'সংবাদ বিবরণ' : 'Article Details'}
              </h1>
              <Badge variant={status.color} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                {lang === 'bn' ? status.labelBn : status.labelEn}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
               <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(article.created_at).toLocaleDateString()}</span>
               <span className="flex items-center gap-1.5"><User size={14} /> {article.author?.name}</span>
               <span className="flex items-center gap-1.5"><Eye size={14} /> {article.views || 0} {lang === 'bn' ? 'ভিউ' : 'Views'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a 
            href={route('article', { category: article.category?.slug, slug: article.slug_bn || article.slug_en })} 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ExternalLink className="w-4.5 h-4.5" /> {lang === 'bn' ? 'সাইটে দেখুন' : 'Live Preview'}
          </a>
          
          <Link
            href={route('admin.news.edit', { article: article.id })}
            className="bg-white border border-gray-200 text-blue-600 rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm"
          >
            <Edit className="w-4.5 h-4.5" /> {lang === 'bn' ? 'এডিট করুন' : 'Edit Article'}
          </Link>

          <button
            onClick={handleDelete}
            className="bg-white border border-gray-200 text-red-600 rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
          >
            <Trash2 className="w-4.5 h-4.5" /> {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Article View Card */}
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            {article.featured_image && (
              <div className="w-full h-80 relative group">
                 <img 
                    src={article.featured_image} 
                    alt="Featured" 
                    className="w-full h-full object-cover"
                 />
                 <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs italic">{lang === 'bn' ? article.featured_image_caption_bn : article.featured_image_caption_en}</p>
                 </div>
              </div>
            )}

            <div className="p-8">
              {/* Bangla Content */}
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-2">
                   <span className="w-8 h-px bg-red-500"></span>
                   <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Bangla Edition</span>
                </div>
                <h2 className="text-3xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] leading-tight">
                   {article.title_bn}
                </h2>
                {article.subtitle_bn && (
                  <p className="text-lg text-gray-500 font-medium italic border-l-4 border-gray-200 pl-4">
                    {article.subtitle_bn}
                  </p>
                )}
                <div 
                  className="prose prose-lg max-w-none text-gray-700 font-['Noto_Sans_Bengali'] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.body_bn }}
                />
              </div>

              <hr className="border-gray-100 my-10" />

              {/* English Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                   <span className="w-8 h-px bg-blue-500"></span>
                   <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">English Edition</span>
                </div>
                <h2 className="text-2xl font-bold text-[#1a1d2e] leading-tight">
                   {article.title_en || 'No English Title Provided'}
                </h2>
                {article.subtitle_en && (
                  <p className="text-base text-gray-500 font-medium italic border-l-4 border-gray-200 pl-4">
                    {article.subtitle_en}
                  </p>
                )}
                <div 
                  className="prose prose-base max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.body_en || '<i>No English body content provided.</i>' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Sidebar Meta Area */}
        <div className="space-y-6">
           {/* Sidebar Actions */}
           <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                 <AlertCircle size={16} className="text-red-500" />
                 {lang === 'bn' ? 'অ্যাকশন ও স্ট্যাটাস' : 'Actions & Status'}
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                 {article.status !== 'published' && (
                   <button 
                     onClick={() => toggleStatus('published')}
                     className="w-full py-2.5 bg-green-50 text-green-600 rounded-xl text-xs font-bold hover:bg-green-100 transition-all flex items-center justify-center gap-2"
                   >
                      <CheckCircle size={14} /> {lang === 'bn' ? 'প্রকাশ করুন' : 'Publish Article'}
                   </button>
                 )}
                 {article.status !== 'pending' && article.status !== 'published' && (
                   <button 
                     onClick={() => toggleStatus('pending')}
                     className="w-full py-2.5 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold hover:bg-orange-100 transition-all flex items-center justify-center gap-2"
                   >
                      <Clock size={14} /> {lang === 'bn' ? 'অনুমোদনের জন্য পাঠান' : 'Submit for Review'}
                   </button>
                 )}
                 {article.status !== 'draft' && (
                   <button 
                     onClick={() => toggleStatus('draft')}
                     className="w-full py-2.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                   >
                      <FileText size={14} /> {lang === 'bn' ? 'খসড়া হিসেবে রাখুন' : 'Move to Draft'}
                   </button>
                 )}
              </div>
           </div>

           {/* Classification Meta */}
           <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-3">
                 {lang === 'bn' ? 'সংবাদ শ্রেণিবিভাগ' : 'Classification'}
              </h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Category</label>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: article.category?.color_code }}></div>
                       <span className="text-sm font-bold text-gray-700">{lang === 'bn' ? article.category?.name_bn : article.category?.name_en}</span>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Author</label>
                    <div className="flex items-center gap-2.5">
                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {article.author?.name?.charAt(0)}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700">{article.author?.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{article.author?.role}</span>
                       </div>
                    </div>
                 </div>

                 {article.tags && article.tags.length > 0 && (
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Tags</label>
                      <div className="flex flex-wrap gap-1.5">
                         {article.tags.map(tag => (
                           <Badge key={tag.id} variant="gray" className="text-[10px] px-2 py-0.5">
                              #{lang === 'bn' ? tag.name_bn : tag.name_en}
                           </Badge>
                         ))}
                      </div>
                   </div>
                 )}

                 <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className={`p-3 rounded-2xl border ${article.is_breaking ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                       <p className={`text-[9px] font-bold uppercase ${article.is_breaking ? 'text-red-500' : 'text-gray-400'}`}>Breaking</p>
                       <p className="text-xs font-bold mt-0.5">{article.is_breaking ? 'YES' : 'NO'}</p>
                    </div>
                    <div className={`p-3 rounded-2xl border ${article.is_featured ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                       <p className={`text-[9px] font-bold uppercase ${article.is_featured ? 'text-blue-500' : 'text-gray-400'}`}>Featured</p>
                       <p className="text-xs font-bold mt-0.5">{article.is_featured ? 'YES' : 'NO'}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Stats / Performance */}
           <div className="bg-[#1a1d2e] text-white rounded-3xl p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold flex items-center gap-2 text-white/90">
                 <BarChart3 size={16} className="text-blue-400" />
                 {lang === 'bn' ? 'পারফরম্যান্স স্ট্যাটস' : 'Performance Stats'}
              </h3>

              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Views</p>
                    <p className="text-xl font-bold mt-1">{article.views || 0}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Comments</p>
                    <p className="text-xl font-bold mt-1 flex items-center gap-1.5">
                       {article.comments_count || 0}
                       <MessageSquare size={14} className="text-green-400" />
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Shares</p>
                    <p className="text-xl font-bold mt-1 flex items-center gap-1.5">
                       {article.shares_count || 0}
                       <Share2 size={14} className="text-blue-400" />
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Edition</p>
                    <p className="text-xl font-bold mt-1 uppercase text-blue-400">{article.edition}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
