import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { LayoutDashboard, Plus, Edit3, Trash2, X, Save, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

const LAYOUT_LABELS = {
  featured_left: 'Featured Left',
  grid: 'Grid',
  list: 'List',
  video_grid: 'Video Grid',
};

export default function HomepageLayout({ sections: initialSections = [], categories = [] }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [sections, setSections] = useState(initialSections);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    type: 'category',
    layout: 'grid',
    item_count: 8,
    edition: 'both',
    is_active: true,
  });

  const openAddModal = () => {
    setEditingSection(null);
    setFormData({ category_id: '', type: 'category', layout: 'grid', item_count: 8, edition: 'both', is_active: true });
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingSection(s);
    setFormData({
      category_id: s.category_id || '',
      type: s.type,
      layout: s.layout,
      item_count: s.item_count,
      edition: s.edition,
      is_active: s.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (formData.type === 'category' && !formData.category_id) {
      showToast(lang === 'bn' ? 'ক্যাটাগরি বেছে নিন' : 'Please select a category', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      ...formData,
      category_id: formData.category_id || null,
      item_count: parseInt(formData.item_count, 10),
    };
    if (editingSection) {
      router.put(route('admin.homepage-layout.update', editingSection.id), payload, {
        onSuccess: () => { setShowModal(false); setSaving(false); showToast('Section updated'); },
        onError: () => { setSaving(false); showToast('Failed to save', 'error'); },
      });
    } else {
      router.post(route('admin.homepage-layout.store'), payload, {
        onSuccess: () => { setShowModal(false); setSaving(false); showToast('Section added'); },
        onError: () => { setSaving(false); showToast('Failed to save', 'error'); },
      });
    }
  };

  const handleDelete = (section) => {
    if (!confirm(lang === 'bn' ? 'এই সেকশনটি মুছে ফেলবেন?' : 'Remove this section?')) return;
    router.delete(route('admin.homepage-layout.destroy', section.id), {
      onSuccess: () => showToast('Section removed'),
    });
  };

  const handleMove = (index, direction) => {
    const newSections = [...sections];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;

    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
    setSections(newSections);

    const orders = {};
    newSections.forEach((s, i) => { orders[s.id] = i + 1; });

    router.post(route('admin.homepage-layout.reorder'), { orders }, {
      onError: () => {
        setSections(sections); // revert on failure
        showToast('Reorder failed', 'error');
      },
    });
  };

  const sectionTitle = (section) => {
    if (section.type === 'videos') return lang === 'bn' ? 'ভিডিও' : 'Videos';
    if (section.type === 'trending') return lang === 'bn' ? 'ট্রেন্ডিং' : 'Trending';
    if (section.category) return lang === 'bn' ? section.category.name_bn : (section.category.name_en || section.category.name_bn);
    return section.type.toUpperCase();
  };

  return (
    <div className="p-6">
      <Head title="Homepage Layout" />

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-[#e8001e]" />
            {lang === 'bn' ? 'হোমপেজ লেআউট' : 'Homepage Layout'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lang === 'bn' ? 'হোমপেজের সেকশন ও বিন্যাস পরিচালনা করুন' : 'Manage homepage sections, order, and layout styles'}
          </p>
        </div>
        <button onClick={openAddModal} className="bg-[#e8001e] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#b8001a] transition-all shadow-lg active:scale-95">
          <Plus size={16} /> {lang === 'bn' ? 'নতুন সেকশন' : 'Add Section'}
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <LayoutDashboard size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-medium">{lang === 'bn' ? 'কোনো সেকশন নেই' : 'No sections yet'}</p>
          <p className="text-sm mt-1">{lang === 'bn' ? '"নতুন সেকশন" বাটনে ক্লিক করুন' : 'Click "Add Section" to get started'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:border-[#e8001e]/30 transition-all">
              {/* Order controls */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded text-gray-300 hover:text-[#e8001e] hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === sections.length - 1}
                  className="p-1 rounded text-gray-300 hover:text-[#e8001e] hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {/* Position badge */}
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-sm flex-shrink-0">
                {index + 1}
              </div>

              {/* Section info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{sectionTitle(section)}</h3>
                  <Badge variant={section.edition === 'both' ? 'blue' : 'gray'} className="text-[10px]">
                    {section.edition.toUpperCase()}
                  </Badge>
                  {!section.is_active && (
                    <Badge variant="gray" className="text-[10px]">
                      {lang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 uppercase tracking-wider font-medium">
                  <span>Layout: <span className="text-gray-600">{LAYOUT_LABELS[section.layout] || section.layout}</span></span>
                  <span>Items: <span className="text-gray-600">{section.item_count}</span></span>
                </div>
              </div>

              {/* Active indicator */}
              <CheckCircle2 size={18} className={section.is_active ? 'text-green-400' : 'text-gray-200'} />

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEditModal(section)} className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors" title="Edit">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDelete(section)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingSection
                  ? (lang === 'bn' ? 'সেকশন সম্পাদনা' : 'Edit Section')
                  : (lang === 'bn' ? 'নতুন সেকশন যোগ করুন' : 'Add New Section')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={18} /></button>
            </div>

            <div className="p-8 space-y-5">
              {/* Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {lang === 'bn' ? 'কন্টেন্ট উৎস' : 'Source Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value, category_id: '' })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e8001e] outline-none"
                >
                  <option value="category">{lang === 'bn' ? 'ক্যাটাগরি আর্টিকেল' : 'Category Articles'}</option>
                  <option value="videos">{lang === 'bn' ? 'সর্বশেষ ভিডিও' : 'Latest Videos'}</option>
                  <option value="trending">{lang === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}</option>
                </select>
              </div>

              {/* Category selector (only for type=category) */}
              {formData.type === 'category' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    {lang === 'bn' ? 'ক্যাটাগরি বেছে নিন' : 'Select Category'}
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e8001e] outline-none"
                  >
                    <option value="">{lang === 'bn' ? '— ক্যাটাগরি বেছে নিন —' : '— Select a category —'}</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {lang === 'bn' ? c.name_bn : (c.name_en || c.name_bn)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Layout */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    {lang === 'bn' ? 'লেআউট স্টাইল' : 'Layout Style'}
                  </label>
                  <select
                    value={formData.layout}
                    onChange={e => setFormData({ ...formData, layout: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e8001e] outline-none"
                  >
                    <option value="featured_left">Featured Left</option>
                    <option value="grid">Grid</option>
                    <option value="list">List</option>
                    <option value="video_grid">Video Grid</option>
                  </select>
                </div>

                {/* Item count */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    {lang === 'bn' ? 'আইটেম সংখ্যা' : 'Item Count'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.item_count}
                    onChange={e => setFormData({ ...formData, item_count: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e8001e] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                {/* Edition */}
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    {lang === 'bn' ? 'সংস্করণ' : 'Edition'}
                  </label>
                  <select
                    value={formData.edition}
                    onChange={e => setFormData({ ...formData, edition: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#e8001e] outline-none"
                  >
                    <option value="both">{lang === 'bn' ? 'বাংলা ও ইংরেজি' : 'Both BN & EN'}</option>
                    <option value="bn">{lang === 'bn' ? 'শুধু বাংলা' : 'Bangla Only'}</option>
                    <option value="en">{lang === 'bn' ? 'শুধু ইংরেজি' : 'English Only'}</option>
                  </select>
                </div>

                {/* Active toggle */}
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-[#e8001e] focus:ring-[#e8001e]"
                    />
                    <span className="text-sm font-bold text-gray-700">{lang === 'bn' ? 'সক্রিয়' : 'Active'}</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-[#e8001e] text-white rounded-2xl py-3.5 text-sm font-bold shadow-lg transition-all hover:bg-[#b8001a] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save size={16} />
                {saving
                  ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                  : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
