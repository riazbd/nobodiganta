import { useState, useEffect } from 'react';
import { 
  MessageSquare, Check, X, Eye, Search, X as XIcon, 
  Loader2, Trash2, AlertTriangle, ShieldCheck, 
  ChevronRight, Calendar, User, Filter, MoreHorizontal, Clock
} from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { router } from '@inertiajs/react';

export default function Comments({ comments = {}, filters = {} }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState(filters.status || 'pending');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);

  const localComments = comments.data || [];
  const pagination = comments;

  // Real-time filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search || statusFilter !== filters.status) {
        router.get(route('admin.comments'), { 
          search: searchQuery,
          status: statusFilter,
        }, { preserveState: true, replace: true });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const handleAction = async (id, action) => {
    setProcessing(true);
    const url = action === 'approve' ? route('admin.comments.approve', id) : 
                action === 'spam' ? route('admin.comments.spam', id) : 
                route('admin.comments.destroy', id);
    
    const method = action === 'approve' || action === 'spam' ? 'patch' : 'delete';
    
    router[method](url, {}, {
      onSuccess: () => {
        showToast(lang === 'bn' ? 'কার্যকর হয়েছে' : 'Action successful');
      },
      onError: () => {
        showToast(lang === 'bn' ? 'ব্যর্থ হয়েছে' : 'Action failed', 'error');
      },
      onFinish: () => setProcessing(false),
    });
  };

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) return;
    setProcessing(true);
    
    router.post(route('admin.comments.bulk-action'), {
      comment_ids: selectedIds,
      action: action
    }, {
      onSuccess: () => {
        showToast(lang === 'bn' ? 'বাল্ক অ্যাকশন সফল' : 'Bulk action successful');
        setSelectedIds([]);
      },
      onError: () => {
        showToast(lang === 'bn' ? 'বাল্ক অ্যাকশন ব্যর্থ' : 'Bulk action failed', 'error');
      },
      onFinish: () => setProcessing(false),
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === localComments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(localComments.map(c => c.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-[#e8001e]" /> 
            {lang === 'bn' ? 'মন্তব্য মডারেশন' : 'Comment Moderation'}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            {pagination.total || 0} {lang === 'bn' ? 'টি মন্তব্য সিস্টেমে আছে' : 'total comments in system'}
          </p>
        </div>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { key: 'pending', label: lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending', color: 'bg-orange-500', icon: Clock },
          { key: 'approved', label: lang === 'bn' ? 'অনুমোদিত' : 'Approved', color: 'bg-green-500', icon: ShieldCheck },
          { key: 'spam', label: lang === 'bn' ? 'স্প্যাম' : 'Spam', color: 'bg-red-500', icon: AlertTriangle },
          { key: 'all', label: lang === 'bn' ? 'সব' : 'All', color: 'bg-blue-500', icon: MessageSquare },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`p-4 rounded-2xl border transition-all flex items-center gap-4 ${
              statusFilter === item.key 
              ? 'bg-white border-[#e8001e] shadow-lg shadow-red-50 ring-1 ring-[#e8001e]' 
              : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className={`p-2.5 rounded-xl ${item.color} text-white`}>
              <item.icon size={20} />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</div>
              <div className="text-lg font-bold text-gray-900">{statusFilter === item.key ? pagination.total : '...'}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
            <input 
              type="text" 
              placeholder={lang === 'bn' ? 'মন্তব্য বা নাম দিয়ে খুঁজুন...' : 'Search comments or names...'} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                <XIcon size={16} />
              </button>
            )}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
            <span className="text-xs font-bold text-gray-500 mr-2">{selectedIds.length} {lang === 'bn' ? 'টি নির্বাচিত' : 'selected'}</span>
            <button onClick={() => handleBulkAction('approve')} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 flex items-center gap-1.5">
              <Check size={14} /> {lang === 'bn' ? 'অনুমোদন' : 'Approve'}
            </button>
            <button onClick={() => handleBulkAction('spam')} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600 flex items-center gap-1.5">
              <AlertTriangle size={14} /> {lang === 'bn' ? 'স্প্যাম' : 'Spam'}
            </button>
            <button onClick={() => handleBulkAction('delete')} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 flex items-center gap-1.5">
              <Trash2 size={14} /> {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 border-b border-gray-100 text-left w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === localComments.length && localComments.length > 0} 
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-[#e8001e] focus:ring-[#e8001e] border-gray-300 rounded" 
                  />
                </th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'মন্তব্যকারী' : 'Commenter'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'মন্তব্য' : 'Comment'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'আর্টিকেল' : 'Article'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {localComments.length > 0 ? localComments.map(comment => (
                <tr key={comment.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(comment.id) ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-5">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(comment.id)} 
                      onChange={() => toggleSelect(comment.id)}
                      className="w-4 h-4 text-[#e8001e] focus:ring-[#e8001e] border-gray-300 rounded" 
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold shadow-sm">
                        {comment.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{comment.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                           <Calendar size={10} />
                           {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-md">
                    <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-2">{comment.body}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <Badge variant={
                         comment.status === 'approved' ? 'green' : 
                         comment.status === 'spam' ? 'red' : 'orange'
                       } className="text-[9px] px-1.5 py-0 uppercase tracking-tighter">
                         {comment.status}
                       </Badge>
                       {comment.is_flagged && (
                         <Badge variant="red" className="text-[9px] px-1.5 py-0 flex items-center gap-1">
                           <AlertTriangle size={8} /> Flagged
                         </Badge>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[12px] text-blue-600 font-semibold hover:underline cursor-pointer">
                       <span className="line-clamp-1">{comment.article?.title}</span>
                       <ChevronRight size={14} className="flex-shrink-0" />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      {comment.status !== 'approved' && (
                        <button 
                          onClick={() => handleAction(comment.id, 'approve')}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all"
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {comment.status !== 'spam' && (
                        <button 
                          onClick={() => handleAction(comment.id, 'spam')}
                          className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all"
                          title="Spam"
                        >
                          <AlertTriangle size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleAction(comment.id, 'reject')}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-gray-400 italic">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                    {lang === 'bn' ? 'কোন মন্তব্য পাওয়া যায়নি' : 'No comments found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {pagination.last_page > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Page {pagination.current_page} of {pagination.last_page}
            </div>
            <div className="flex items-center gap-1">
              {pagination.links.map((link, i) => (
                <button
                  key={i}
                  disabled={!link.url || link.active}
                  onClick={() => router.get(link.url, { status: statusFilter, search: searchQuery }, { preserveState: true })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    link.active 
                    ? 'bg-[#e8001e] text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {processing && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[10000] flex items-center justify-center">
           <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-[#e8001e] animate-spin" />
              <p className="text-sm font-bold text-gray-900">{lang === 'bn' ? 'প্রসেসিং হচ্ছে...' : 'Processing...'}</p>
           </div>
        </div>
      )}
    </div>
  );
}
