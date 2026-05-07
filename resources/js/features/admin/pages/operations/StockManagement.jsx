import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { TrendingUp, Plus, Edit3, Trash2, X, Save, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

export default function StockManagement({ stocks = [] }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name_bn: '',
    name_en: '',
    value: '',
    change: '',
    is_up: true,
    sort_order: 0
  });

  const openAddModal = () => {
    setEditingStock(null);
    setForm({ name_bn: '', name_en: '', value: '', change: '', is_up: true, sort_order: 0 });
    setShowModal(true);
  };

  const openEditModal = (stock) => {
    setEditingStock(stock);
    setForm({
      name_bn: stock.name_bn,
      name_en: stock.name_en,
      value: stock.value,
      change: stock.change,
      is_up: stock.is_up,
      sort_order: stock.sort_order
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    setSaving(true);
    if (editingStock) {
      router.put(route('admin.stocks.update', editingStock.id), form, {
        onSuccess: () => { setSaving(false); setShowModal(false); showToast('Stock updated'); },
        onError: () => setSaving(false)
      });
    } else {
      router.post(route('admin.stocks.store'), form, {
        onSuccess: () => { setSaving(false); setShowModal(false); showToast('Stock added'); },
        onError: () => setSaving(false)
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure?')) {
      router.delete(route('admin.stocks.destroy', id), {
        onSuccess: () => showToast('Stock deleted')
      });
    }
  };

  return (
    <div className="p-6">
      <Head title="Stock Management" />
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-[#263238]" /> 
            {lang === 'bn' ? 'শেয়ার বাজার ব্যবস্থাপনা' : 'Stock Market Management'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{lang === 'bn' ? 'লাইভ স্টক আপডেট পরিচালনা করুন' : 'Manage live stock market updates'}</p>
        </div>
        <button onClick={openAddModal} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow-lg active:scale-95">
          <Plus size={18} /> {lang === 'bn' ? 'নতুন স্টক' : 'Add Stock'}
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <th className="px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'নাম' : 'Name'}</th>
              <th className="px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'মান' : 'Value'}</th>
              <th className="px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'পরিবর্তন' : 'Change'}</th>
              <th className="px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'ট্রেন্ড' : 'Trend'}</th>
              <th className="px-6 py-4 border-b border-gray-100 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {stocks.map(stock => (
              <tr key={stock.id} className="hover:bg-gray-50/30 transition-colors group font-Inter">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{lang === 'bn' ? stock.name_bn : stock.name_en}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">{stock.name_en}</div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-700">{stock.value}</td>
                <td className={`px-6 py-4 font-bold ${stock.is_up === true ? 'text-green-600' : stock.is_up === false ? 'text-red-600' : 'text-gray-500'}`}>
                  {stock.change}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={stock.is_up === true ? 'green' : stock.is_up === false ? 'red' : 'gray'}>
                    {stock.is_up === true ? 'UP' : stock.is_up === false ? 'DOWN' : 'NEUTRAL'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEditModal(stock)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(stock.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <TrendingUp className="text-[#263238]" size={22} />
                 {editingStock ? 'Edit Stock' : 'Add New Stock'}
               </h3>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Name (BN)</label>
                    <input type="text" value={form.name_bn} onChange={e => setForm({...form, name_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Name (EN)</label>
                    <input type="text" value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Current Value</label>
                    <input type="text" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" placeholder="e.g. 6,245.32" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Change</label>
                    <input type="text" value={form.change} onChange={e => setForm({...form, change: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" placeholder="▲ 1.24%" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Trend</label>
                  <div className="flex gap-4">
                     {['up', 'down', 'neutral'].map(t => (
                       <label key={t} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="trend" checked={t === 'up' ? form.is_up === true : t === 'down' ? form.is_up === false : form.is_up === null} onChange={() => setForm({...form, is_up: t === 'up' ? true : t === 'down' ? false : null})} className="text-[#263238] focus:ring-[#263238]" />
                          <span className="text-sm font-bold capitalize">{t}</span>
                       </label>
                     ))}
                  </div>
               </div>
               <button onClick={handleSubmit} disabled={saving} className="w-full bg-[#263238] text-white rounded-2xl py-4 text-base font-bold shadow-lg transition-all hover:bg-[#1a2428] active:scale-95 flex items-center justify-center gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  Save Stock
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
