import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { DollarSign, Plus, Edit3, Trash2, X, Save, Search, RefreshCw } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

export default function PriceManagement({ prices = [] }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    key: '',
    title_bn: '',
    title_en: '',
    amount: '',
    currency: 'BDT',
    unit: '',
    trend: 'neutral',
    change: 0,
    sort_order: 0
  });

  const openAddModal = () => {
    setEditingPrice(null);
    setForm({ key: '', title_bn: '', title_en: '', amount: '', currency: 'BDT', unit: '', trend: 'neutral', change: 0, sort_order: 0 });
    setShowModal(true);
  };

  const openEditModal = (price) => {
    setEditingPrice(price);
    setForm({
      key: price.key,
      title_bn: price.title_bn,
      title_en: price.title_en,
      amount: price.amount,
      currency: price.currency,
      unit: price.unit || '',
      trend: price.trend,
      change: price.change,
      sort_order: price.sort_order
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    setSaving(true);
    if (editingPrice) {
      router.put(route('admin.prices.update', editingPrice.id), form, {
        onSuccess: () => { setSaving(false); setShowModal(false); showToast('Price updated'); },
        onError: () => setSaving(false)
      });
    } else {
      router.post(route('admin.prices.store'), form, {
        onSuccess: () => { setSaving(false); setShowModal(false); showToast('Price added'); },
        onError: () => setSaving(false)
      });
    }
  };

  return (
    <div className="p-6">
      <Head title="Commodity Prices" />
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-[#e8001e]" /> 
            {lang === 'bn' ? 'পণ্য ও বাজার দর' : 'Commodity Prices'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{lang === 'bn' ? 'স্বর্ণ, জ্বালানি ও অন্যান্য দর পরিচালনা করুন' : 'Manage gold, fuel and other market rates'}</p>
        </div>
        <button onClick={openAddModal} className="bg-[#e8001e] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#b8001a] transition-all shadow-lg active:scale-95">
          <Plus size={18} /> {lang === 'bn' ? 'নতুন এন্ট্রি' : 'Add Price'}
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              <th className="px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'পণ্য' : 'Commodity'}</th>
              <th className="px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'মূল্য' : 'Amount'}</th>
              <th className="px-6 py-4 border-b border-gray-100">{lang === 'bn' ? 'ট্রেন্ড' : 'Trend'}</th>
              <th className="px-6 py-4 border-b border-gray-100 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {prices.map(price => (
              <tr key={price.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{lang === 'bn' ? price.title_bn : price.title_en}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">{price.key}</div>
                </td>
                <td className="px-6 py-4">
                   <div className="font-bold text-gray-900">{parseFloat(price.amount).toLocaleString()} {price.currency}</div>
                   <div className="text-[10px] text-gray-400 font-bold uppercase">/{price.unit}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={price.trend === 'up' ? 'green' : price.trend === 'down' ? 'red' : 'gray'}>
                    {price.trend.toUpperCase()} ({price.change})
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => openEditModal(price)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"><Edit3 size={16} /></button>
                      <button onClick={() => { if(confirm('Delete?')) router.delete(route('admin.prices.destroy', price.id)) }} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
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
                 <DollarSign className="text-[#e8001e]" size={22} />
                 {editingPrice ? 'Edit Price' : 'Add New Price'}
               </h3>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-5">
               {!editingPrice && (
                 <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">System Key (Unique)</label>
                    <input type="text" value={form.key} onChange={e => setForm({...form, key: e.target.value.toLowerCase().replace(/\s+/g, '_')})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e] font-mono" placeholder="e.g. gold_22k" />
                 </div>
               )}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Title (BN)</label>
                    <input type="text" value={form.title_bn} onChange={e => setForm({...form, title_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Title (EN)</label>
                    <input type="text" value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Amount</label>
                    <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Unit</label>
                    <input type="text" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" placeholder="vori/ltr" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Trend</label>
                    <select value={form.trend} onChange={e => setForm({...form, trend: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]">
                       <option value="up">Up</option>
                       <option value="down">Down</option>
                       <option value="neutral">Neutral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Change</label>
                    <input type="number" value={form.change} onChange={e => setForm({...form, change: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
               </div>
               <button onClick={handleSubmit} disabled={saving} className="w-full bg-[#e8001e] text-white rounded-2xl py-4 text-base font-bold shadow-lg transition-all hover:bg-[#b8001a] active:scale-95 flex items-center justify-center gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  Save Price
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
