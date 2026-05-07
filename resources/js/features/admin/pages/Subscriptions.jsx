import { useState, useEffect } from 'react';
import { CreditCard, UserPlus, Search, X, Edit3, Trash2, Calendar, DollarSign, User as UserIcon, ShieldCheck, Clock, Filter, Check, MoreVertical } from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { router } from '@inertiajs/react';

export default function Subscriptions({ subscriptions = {}, filters = {}, users = [], stats = {} }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [planFilter, setPlanFilter] = useState(filters.plan || 'all');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const localSubs = subscriptions.data || [];

  // Form state
  const [formData, setFormData] = useState({
    user_id: '',
    plan: 'digital',
    price_bdt: 100,
    starts_at: new Date().toISOString().split('T')[0],
    ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_method: 'bkash',
    payment_reference: '',
    is_active: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search || planFilter !== filters.plan || statusFilter !== filters.status) {
        router.get(route('admin.subscriptions'), { 
          search: searchQuery, 
          plan: planFilter,
          status: statusFilter
        }, { preserveState: true, replace: true });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, planFilter, statusFilter]);

  const openAddModal = () => {
    setEditingSub(null);
    setFormData({
      user_id: '',
      plan: 'digital',
      price_bdt: 100,
      starts_at: new Date().toISOString().split('T')[0],
      ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      payment_method: 'bkash',
      payment_reference: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (sub) => {
    setEditingSub(sub);
    setFormData({
      user_id: sub.user_id,
      plan: sub.plan,
      price_bdt: sub.price_bdt,
      starts_at: sub.starts_at?.split('T')[0] || '',
      ends_at: sub.ends_at?.split('T')[0] || '',
      payment_method: sub.payment_method || '',
      payment_reference: sub.payment_reference || '',
      is_active: sub.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.user_id && !editingSub) {
      showToast(lang === 'bn' ? 'ব্যবহারকারী নির্বাচন করুন' : 'Select a user', 'error');
      return;
    }

    if (editingSub) {
      router.put(route('admin.subscriptions.update', editingSub.id), formData, {
        onSuccess: () => {
          setShowModal(false);
          showToast(lang === 'bn' ? 'সদস্যপদ হালনাগাদ হয়েছে' : 'Subscription updated');
        }
      });
    } else {
      router.post(route('admin.subscriptions.store'), formData, {
        onSuccess: () => {
          setShowModal(false);
          showToast(lang === 'bn' ? 'নতুন সদস্য যোগ হয়েছে' : 'Subscription created');
        }
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      router.delete(route('admin.subscriptions.destroy', id), {
        onSuccess: () => showToast(lang === 'bn' ? 'সদস্যপদ মুছে ফেলা হয়েছে' : 'Subscription deleted')
      });
    }
  };

  const toggleStatus = (id) => {
    router.patch(route('admin.subscriptions.toggle', id), {}, {
      onSuccess: () => showToast(lang === 'bn' ? 'অবস্থা পরিবর্তন হয়েছে' : 'Status updated')
    });
  };

  const getPlanLabel = (plan) => {
    const labels = {
      free: lang === 'bn' ? 'ফ্রি' : 'Free',
      digital: lang === 'bn' ? 'ডিজিটাল' : 'Digital',
      premium: lang === 'bn' ? 'প্রিমিয়াম' : 'Premium',
      annual_digital: lang === 'bn' ? 'বার্ষিক ডিজিটাল' : 'Annual Digital',
      annual_premium: lang === 'bn' ? 'বার্ষিক প্রিমিয়াম' : 'Annual Premium',
    };
    return labels[plan] || plan;
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-[#263238]" /> 
            {lang === 'bn' ? 'সদস্যপদ ব্যবস্থাপনা' : 'Subscription Management'}
          </h1>
          <div className="flex items-center gap-4 mt-2">
             <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase">
                <ShieldCheck size={14} className="text-green-500" />
                {lang === 'bn' ? 'সক্রিয় সদস্য:' : 'Active Members:'} {stats.total_active || 0}
             </div>
             <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase">
                <DollarSign size={14} className="text-blue-500" />
                {lang === 'bn' ? 'মোট আয়:' : 'Total Revenue:'} ৳{(stats.total_revenue || 0).toLocaleString()}
             </div>
          </div>
        </div>
        <button onClick={openAddModal} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow-lg active:scale-95">
          <UserPlus className="w-4.5 h-4.5" /> {lang === 'bn' ? 'নতুন সদস্য' : 'Add Member'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-[#263238]">
               <UserIcon size={24} />
            </div>
            <div>
               <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'bn' ? 'মোট গ্রাহক' : 'Total Subscribers'}</div>
               <div className="text-2xl font-bold text-gray-900">{subscriptions.total || 0}</div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
               <ShieldCheck size={24} />
            </div>
            <div>
               <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'bn' ? 'প্রিমিয়াম' : 'Premium Users'}</div>
               <div className="text-2xl font-bold text-gray-900">{stats.premium_count || 0}</div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
               <Clock size={24} />
            </div>
            <div>
               <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{lang === 'bn' ? 'গড় রাজস্ব' : 'Avg. ARPU'}</div>
               <div className="text-2xl font-bold text-gray-900">৳{(stats.total_active ? Math.round(stats.total_revenue / stats.total_active) : 0)}</div>
            </div>
         </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 gap-3 w-full max-w-md shadow-sm focus-within:border-[#263238] focus-within:ring-4 focus-within:ring-red-50 transition-all">
          <Search className="w-4.5 h-4.5 text-gray-400" />
          <input 
            type="text" 
            placeholder={lang === 'bn' ? 'সদস্য বা রেফারেন্স দিয়ে খুঁজুন...' : 'Search by member or reference...'} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="border-none bg-transparent outline-none text-sm w-full focus:ring-0 placeholder:text-gray-400" 
          />
          {searchQuery && <button type="button" onClick={() => setSearchQuery('')}><X size={16} className="text-gray-400" /></button>}
        </div>

        <div className="flex items-center gap-4">
           <div className="flex bg-gray-100 p-1 rounded-xl">
              {['all', 'digital', 'premium', 'annual_premium'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setPlanFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${planFilter === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {p === 'all' ? (lang === 'bn' ? 'সব' : 'All') : p.split('_').pop().toUpperCase()}
                </button>
              ))}
           </div>
           <select 
             value={statusFilter} 
             onChange={e => setStatusFilter(e.target.value)}
             className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-[#263238]"
           >
              <option value="all">{lang === 'bn' ? 'সব অবস্থা' : 'All Status'}</option>
              <option value="active">{lang === 'bn' ? 'সক্রিয়' : 'Active'}</option>
              <option value="inactive">{lang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}</option>
           </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'সদস্য' : 'Member'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'প্ল্যান' : 'Plan'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'পরিশোধ' : 'Payment'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'সময়কাল' : 'Validity'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {localSubs.length > 0 ? localSubs.map(sub => (
                <tr key={sub.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                        {sub.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm group-hover:text-[#263238] transition-colors">{sub.user?.name}</div>
                        <div className="text-[11px] text-gray-400 font-medium">{sub.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={sub.plan.includes('premium') ? 'blue' : 'gray'} className="text-[10px] px-2 py-0.5">
                       {getPlanLabel(sub.plan)}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-gray-900">৳{parseFloat(sub.price_bdt).toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 flex items-center gap-1">
                       <span className="text-blue-500">{sub.payment_method}</span>
                       <span>•</span>
                       <span className="truncate max-w-[80px]">{sub.payment_reference}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                       <div className="text-[11px] text-gray-600 font-semibold flex items-center gap-1.5">
                          <Check size={10} className="text-green-500" />
                          {new Date(sub.starts_at).toLocaleDateString()}
                       </div>
                       <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
                          <X size={10} className="text-red-400" />
                          {new Date(sub.ends_at).toLocaleDateString()}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <Badge variant={sub.is_active ? 'green' : 'red'}>
                        {sub.is_active ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'বন্ধ' : 'Inactive')}
                     </Badge>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => toggleStatus(sub.id)} className={`p-2 rounded-lg transition-colors ${sub.is_active ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                         <ShieldCheck size={18} />
                      </button>
                      <button onClick={() => openEditModal(sub)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(sub.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic">
                    <CreditCard size={48} className="mx-auto mb-4 opacity-10" />
                    {lang === 'bn' ? 'কোন সদস্যপদ পাওয়া যায়নি' : 'No subscriptions found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {subscriptions.last_page > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Page {subscriptions.current_page} of {subscriptions.last_page}
            </div>
            <div className="flex items-center gap-1">
              {subscriptions.links.map((link, i) => (
                <button
                  key={i}
                  disabled={!link.url || link.active}
                  onClick={() => router.get(link.url, { search: searchQuery, plan: planFilter, status: statusFilter }, { preserveState: true })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    link.active 
                    ? 'bg-[#263238] text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30'
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 transform transition-all animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <CreditCard className="text-[#263238]" size={22} />
                 {editingSub ? (lang === 'bn' ? 'সদস্যপদ সম্পাদনা' : 'Edit Subscription') : (lang === 'bn' ? 'নতুন সদস্য যোগ' : 'Add New Subscription')}
               </h3>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-8">
               {!editingSub && (
                 <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'ব্যবহারকারী' : 'User'} *</label>
                    <select value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]">
                       <option value="">Select User</option>
                       {users.map(u => (
                         <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                       ))}
                    </select>
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'প্ল্যান' : 'Plan'}</label>
                    <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]">
                       <option value="digital">Digital (Monthly)</option>
                       <option value="premium">Premium (Monthly)</option>
                       <option value="annual_digital">Digital (Annual)</option>
                       <option value="annual_premium">Premium (Annual)</option>
                       <option value="free">Free</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'মূল্য (টাকা)' : 'Price (BDT)'}</label>
                    <input type="number" value={formData.price_bdt} onChange={e => setFormData({...formData, price_bdt: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'শুরু তারিখ' : 'Start Date'}</label>
                    <input type="date" value={formData.starts_at} onChange={e => setFormData({...formData, starts_at: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'শেষ তারিখ' : 'End Date'}</label>
                    <input type="date" value={formData.ends_at} onChange={e => setFormData({...formData, ends_at: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}</label>
                    <select value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]">
                       <option value="bkash">bKash</option>
                       <option value="nagad">Nagad</option>
                       <option value="sslcommerz">SSLCommerz</option>
                       <option value="card">Card</option>
                       <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'রেফারেন্স (TrxID)' : 'Reference (TrxID)'}</label>
                    <input type="text" value={formData.payment_reference} onChange={e => setFormData({...formData, payment_reference: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={handleSubmit} className="flex-1 bg-[#263238] text-white rounded-2xl py-4 text-base font-bold shadow-lg shadow-red-100 transition-all hover:bg-[#1a2428] active:scale-95">
                    {editingSub ? (lang === 'bn' ? 'হালনাগাদ করুন' : 'Update Subscription') : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Subscription')}
                  </button>
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-50 text-gray-600 rounded-2xl py-4 text-base font-bold transition-all hover:bg-gray-100 active:scale-95">
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
