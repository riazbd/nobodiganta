import { useState } from 'react';
import { FileText, Calendar, Eye, Download, Upload, Search, X as XIcon, Trash2 } from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { router } from '@inertiajs/react';
import { useAdminNavigation } from '../contexts/AdminNavigationContext';

export default function EPaperManager({ editions = [] }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    edition: 'bn',
    pdf_url: '',
    label_bn: '',
    label_en: '',
  });

  const handleSubmit = () => {
    router.post(route('admin.epaper-manager.store'), formData, {
      onSuccess: () => {
        setShowModal(false);
        showToast('E-Paper saved');
      }
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">📄 {lang === 'bn' ? 'ই-পেপার ম্যানেজার' : 'E-Paper Manager'}</h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'ই-পেপার আপলোড ও ব্যবস্থাপনা' : 'E-paper upload and management'}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#e8001e] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#b8001a] transition-colors">
          <Upload className="w-4 h-4" /> {lang === 'bn' ? 'আপলোড' : 'Upload'}
        </button>
      </div>

      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'লেবেল' : 'Label'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'কাজ' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {editions.map(ep => (
              <tr key={ep.id} className="hover:bg-[#fafbff] transition-colors">
                <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" />{ep.date}</td>
                <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] uppercase">{ep.edition}</td>
                <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] font-semibold font-['Inter']">{lang === 'bn' ? ep.label_bn : ep.label_en}</td>
                <td className="px-4 py-3 border-b border-[#f3f4f6]">
                  <div className="flex items-center gap-1.5">
                    <a href={ep.pdf_url} target="_blank" className="p-1.5 rounded-md hover:bg-gray-100"><Eye className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" /></a>
                    <button onClick={() => { if(confirm('Delete?')) router.delete(route('admin.epaper-manager.destroy', ep.id)) }} className="p-1.5 rounded-md hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="font-bold mb-4">Add E-Paper Edition</h3>
            <div className="space-y-4">
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border rounded p-2" />
              <select value={formData.edition} onChange={e => setFormData({...formData, edition: e.target.value})} className="w-full border rounded p-2">
                <option value="bn">Bangla</option>
                <option value="en">English</option>
              </select>
              <input type="url" placeholder="PDF URL" value={formData.pdf_url} onChange={e => setFormData({...formData, pdf_url: e.target.value})} className="w-full border rounded p-2" />
              <input type="text" placeholder="Label BN" value={formData.label_bn} onChange={e => setFormData({...formData, label_bn: e.target.value})} className="w-full border rounded p-2" />
              <input type="text" placeholder="Label EN" value={formData.label_en} onChange={e => setFormData({...formData, label_en: e.target.value})} className="w-full border rounded p-2" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
