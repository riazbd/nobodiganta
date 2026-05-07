import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
  FileText, Search, X, Filter, Calendar, User, 
  Terminal, Shield, Eye, Trash2, Clock, 
  ChevronRight, RefreshCw, AlertCircle, Info, Database
} from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { Pagination } from '../../components/data/Pagination';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

const EVENT_COLORS = {
  login: 'blue',
  'article.created': 'green',
  'article.updated': 'orange',
  'article.published': 'green',
  'role.updated': 'red',
  'settings.updated': 'purple',
  'media.uploaded': 'cyan',
  'comment.approved': 'green',
  'ad.created': 'indigo',
};

export default function AuditLog({ logs = {}, filters = {}, users = [], events = [] }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  
  const localLogs = logs.data || [];
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [eventFilter, setEventFilter] = useState(filters.event || 'all');
  const [userFilter, setUserFilter] = useState(filters.user_id || 'all');
  const [selectedLog, setSelectedLog] = useState(null);

  // Debounced filter application
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search || eventFilter !== filters.event || userFilter !== filters.user_id) {
        router.get(route('admin.audit-log'), { 
          search: searchQuery, 
          event: eventFilter,
          user_id: userFilter
        }, { preserveState: true, replace: true });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, eventFilter, userFilter]);

  const handlePageChange = (page) => {
    router.get(route('admin.audit-log'), { 
      ...filters, 
      page 
    }, { preserveState: true });
  };

  const handleClearLogs = (days = 30) => {
    const message = days === 0 
      ? (lang === 'bn' ? 'আপনি কি নিশ্চিত যে আপনি সব লগ মুছে ফেলতে চান?' : 'Are you sure you want to clear ALL logs?')
      : (lang === 'bn' ? `আপনি কি নিশ্চিত যে আপনি ${days} দিনের বেশি পুরনো লগ মুছে ফেলতে চান?` : `Are you sure you want to clear logs older than ${days} days?`);

    if (confirm(message)) {
      router.post(route('admin.audit-log.clear'), { days }, {
        onSuccess: () => showToast(lang === 'bn' ? 'লগ মুছে ফেলা হয়েছে' : 'Logs cleared successfully')
      });
    }
  };

  return (
    <div className="p-6">
      <Head title={lang === 'bn' ? 'অডিট লগ' : 'System Audit Log'} />

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] flex items-center gap-3">
            <Terminal className="w-7 h-7 text-[#263238]" /> 
            {lang === 'bn' ? 'সিস্টেম অডিট লগ' : 'System Audit Log'}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-blue-500" />
            {logs.total || 0} {lang === 'bn' ? 'টি অ্যাক্টিভিটি রেকর্ড করা হয়েছে' : 'activity records in database'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleClearLogs(30)}
            className="bg-white border border-gray-200 text-gray-600 rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <Clock className="w-4 h-4" /> {lang === 'bn' ? '৩০ দিনের পুরনো মুছুন' : 'Clear > 30 Days'}
          </button>
          <button
            onClick={() => handleClearLogs(0)}
            className="bg-white border border-gray-200 text-red-600 rounded-xl px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> {lang === 'bn' ? 'সব মুছুন' : 'Clear All'}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
          <input 
            type="text" 
            placeholder={lang === 'bn' ? 'বিবরণ বা ইউজার দিয়ে খুঁজুন...' : 'Search description or user...'} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none" 
          />
        </div>
        
        <select 
          value={eventFilter} 
          onChange={e => setEventFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#263238] min-w-[160px]"
        >
          <option value="all">{lang === 'bn' ? 'সব ইভেন্ট' : 'All Events'}</option>
          {events.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        <select 
          value={userFilter} 
          onChange={e => setUserFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#263238] min-w-[160px]"
        >
          <option value="all">{lang === 'bn' ? 'সব ইউজার' : 'All Users'}</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <button onClick={() => { setSearchQuery(''); setEventFilter('all'); setUserFilter('all'); }} className="p-2.5 text-gray-400 hover:text-[#263238] transition-colors" title="Reset Filters">
           <RefreshCw size={20} />
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'সময়' : 'Timestamp'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'ইউজার' : 'User'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'ইভেন্ট' : 'Event'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'বিবরণ' : 'Description'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'আইপি' : 'IP Address'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-['Inter']">
              {localLogs.length > 0 ? localLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-gray-900">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       <span className="text-[10px] text-gray-400 font-medium">{new Date(log.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                       <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                          {log.user?.name?.charAt(0) || 'S'}
                       </div>
                       <div className="text-xs font-bold text-gray-700">{log.user?.name || 'System'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={EVENT_COLORS[log.event] || 'gray'} className="text-[9px] px-1.5 py-0 uppercase tracking-tight font-bold">
                       {log.event}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] text-gray-600 font-medium line-clamp-1">{log.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">{log.ip_address}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-400 hover:text-[#263238] transition-all"
                    >
                       <Eye size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">
                    <Terminal size={48} className="mx-auto mb-4 opacity-10" />
                    {lang === 'bn' ? 'কোন লগ পাওয়া যায়নি' : 'No activity logs found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {logs.last_page > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Showing {logs.from} to {logs.to} of {logs.total} entries
            </div>
            <Pagination
              meta={logs}
              links={logs.links}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
           <div className="bg-[#0f1117] text-[#e0e0e0] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#1e2130] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="px-8 py-6 border-b border-[#1e2130] flex items-center justify-between bg-[#1a1d2e]/50">
                 <div className="flex items-center gap-3">
                    <Terminal className="text-[#263238]" size={22} />
                    <h3 className="text-xl font-bold font-['Inter']">Event Details</h3>
                 </div>
                 <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-[#1e2130] rounded-full transition-colors text-gray-500"><X size={24} /></button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Timestamp</label>
                       <div className="text-sm font-medium flex items-center gap-2">
                          <Calendar size={14} className="text-[#263238]" />
                          {new Date(selectedLog.created_at).toLocaleString()}
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Actor</label>
                       <div className="text-sm font-medium flex items-center gap-2">
                          <User size={14} className="text-blue-500" />
                          {selectedLog.user?.name} ({selectedLog.user?.email})
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Event Type</label>
                       <div className="mt-1">
                          <Badge variant={EVENT_COLORS[selectedLog.event] || 'gray'}>{selectedLog.event}</Badge>
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Network Origin</label>
                       <div className="text-[12px] font-mono bg-[#1a1d2e] px-2 py-1 rounded border border-[#2a2d3e]">
                          {selectedLog.ip_address}
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Action Description</label>
                    <div className="bg-[#1a1d2e] p-4 rounded-2xl border border-[#2a2d3e] text-sm leading-relaxed italic">
                       "{selectedLog.description}"
                    </div>
                 </div>

                 {selectedLog.properties && (
                   <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Payload / Changes</label>
                      <pre className="bg-[#1c1f2e] p-4 rounded-2xl border border-[#2a2d3e] text-[11px] font-mono text-[#a78bfa] overflow-x-auto overflow-y-auto max-h-[200px]">
                         {JSON.stringify(selectedLog.properties, null, 2)}
                      </pre>
                   </div>
                 )}

                 <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">User Agent</label>
                    <div className="text-[10px] text-gray-500 break-all bg-[#0a0b10] p-3 rounded-xl border border-[#1e2130]">
                       {selectedLog.user_agent}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
