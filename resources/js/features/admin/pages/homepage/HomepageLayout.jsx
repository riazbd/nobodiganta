import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { LayoutDashboard, Plus, Edit3, Trash2, X, Save, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

// ─── defaults ────────────────────────────────────────────────────────────────
const SF_CONFIG_DEFAULTS = {
  section_bg:        '#ffffff',
  header_bg:         '#1a56db',
  header_text_color: '#ffffff',
  badge_bg:          '#1a56db',
  badge_text_color:  '#ffffff',
  badge_label_bn:    'বিশেষ',
  badge_label_en:    'Special',
  show_badge:        true,
  show_excerpt:      true,
};

const SF_LAYOUTS = [
  {
    value: 'hero_list',
    label: 'হিরো + তালিকা',
    labelEn: 'Hero + List',
    preview: '╔══════╦═══╗\n║      ║ ▬ ║\n║ HERO ║ ▬ ║\n║      ║ ▬ ║\n╚══════╩═══╝',
  },
  {
    value: 'hero_grid',
    label: 'হিরো + গ্রিড',
    labelEn: 'Hero + Grid',
    preview: '╔══════╦═╦═╗\n║      ║▬║▬║\n║ HERO ╠═╬═╣\n║      ║▬║▬║\n╚══════╩═╩═╝',
  },
  {
    value: 'full_grid',
    label: 'পূর্ণ গ্রিড',
    labelEn: 'Full Grid',
    preview: '╔═══╦═══╦═══╗\n║ ▬ ║ ▬ ║ ▬ ║\n╠═══╬═══╬═══╣\n║ ▬ ║ ▬ ║ ▬ ║\n╚═══╩═══╩═══╝',
  },
  {
    value: 'big_hero',
    label: 'বড় হিরো',
    labelEn: 'Big Hero',
    preview: '╔═════════════╗\n║    HERO     ║\n╠═══╦═══╦════╣\n║ ▬ ║ ▬ ║ ▬  ║\n╚═══╩═══╩════╝',
  },
];

const LAYOUT_LABELS = {
  featured_left: 'Featured Left',
  grid:          'Grid',
  list:          'List',
  video_grid:    'Video Grid',
  hero_list:     'Hero + List',
  hero_grid:     'Hero + Grid',
  full_grid:     'Full Grid',
  big_hero:      'Big Hero',
};

const EMPTY_FORM = () => ({
  category_id: '',
  type:        'category',
  layout:      'grid',
  item_count:  8,
  edition:     'both',
  is_active:   true,
  title_bn:    '',
  title_en:    '',
  config:      { ...SF_CONFIG_DEFAULTS },
});

// ─── ColorPicker ─────────────────────────────────────────────────────────────
function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
        <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 cursor-pointer">
          <input
            type="color"
            value={value || '#ffffff'}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ minWidth: 28, minHeight: 28 }}
          />
          <div className="w-full h-full rounded-lg" style={{ background: value || '#ffffff' }} />
        </div>
        <input
          type="text"
          value={value || '#ffffff'}
          onChange={e => onChange(e.target.value)}
          maxLength={7}
          className="flex-1 text-sm font-mono outline-none bg-transparent min-w-0"
          placeholder="#ffffff"
        />
      </div>
    </div>
  );
}

// ─── ToggleSwitch ─────────────────────────────────────────────────────────────
function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#1a56db]' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

// ─── SpecialFeatureConfigPanel ────────────────────────────────────────────────
function SpecialFeatureConfigPanel({ formData, setFormData, lang }) {
  const cfg = formData.config || { ...SF_CONFIG_DEFAULTS };
  const setConfig = (key, val) => setFormData(f => ({ ...f, config: { ...(f.config || SF_CONFIG_DEFAULTS), [key]: val } }));
  const setLayout = (val) => setFormData(f => ({ ...f, layout: val }));

  return (
    <div className="space-y-6">

      {/* ── Active toggle at top so it's never missed ── */}
      <ToggleSwitch
        label={lang === 'bn' ? 'সেকশন সক্রিয় (হোমপেজে দেখাবে)' : 'Section Active (show on homepage)'}
        checked={formData.is_active}
        onChange={v => setFormData(f => ({ ...f, is_active: v }))}
      />

      {/* ── Layout ── */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">
          {lang === 'bn' ? 'লেআউট' : 'Layout'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SF_LAYOUTS.map(l => (
            <button
              key={l.value}
              type="button"
              onClick={() => setLayout(l.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                formData.layout === l.value
                  ? 'border-[#1a56db] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <pre className="text-[9px] leading-tight font-mono text-gray-500 mb-1.5 overflow-hidden">{l.preview}</pre>
              <div className="text-xs font-bold text-gray-700">{lang === 'bn' ? l.label : l.labelEn}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Titles ── */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
          {lang === 'bn' ? 'শিরোনাম' : 'Title'}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">বাংলা</label>
            <input
              type="text"
              placeholder="বিশেষ প্রতিবেদন"
              value={formData.title_bn || ''}
              onChange={e => setFormData(f => ({ ...f, title_bn: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a56db] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">English</label>
            <input
              type="text"
              placeholder="Special Feature"
              value={formData.title_en || ''}
              onChange={e => setFormData(f => ({ ...f, title_en: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#1a56db] outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── Section Background ── */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
          {lang === 'bn' ? 'সেকশন ব্যাকগ্রাউন্ড' : 'Section Background'}
        </label>
        <ColorPicker label="" value={cfg.section_bg} onChange={v => setConfig('section_bg', v)} />
      </div>

      {/* ── Header Colors ── */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
          {lang === 'bn' ? 'হেডার রঙ' : 'Header Colors'}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker label={lang === 'bn' ? 'হেডার ব্যাকগ্রাউন্ড' : 'Background'} value={cfg.header_bg} onChange={v => setConfig('header_bg', v)} />
          <ColorPicker label={lang === 'bn' ? 'হেডার লেখার রঙ' : 'Text Color'} value={cfg.header_text_color} onChange={v => setConfig('header_text_color', v)} />
        </div>
      </div>

      {/* ── Badge ── */}
      <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
        <ToggleSwitch
          label={lang === 'bn' ? 'ব্যাজ দেখাবে' : 'Show Badge'}
          checked={cfg.show_badge !== false}
          onChange={v => setConfig('show_badge', v)}
        />
        {cfg.show_badge !== false && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{lang === 'bn' ? 'ব্যাজ লেখা (বাংলা)' : 'Badge (Bangla)'}</label>
                <input
                  type="text"
                  placeholder="বিশেষ"
                  value={cfg.badge_label_bn || ''}
                  onChange={e => setConfig('badge_label_bn', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#1a56db] outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{lang === 'bn' ? 'ব্যাজ লেখা (ইংরেজি)' : 'Badge (English)'}</label>
                <input
                  type="text"
                  placeholder="Special"
                  value={cfg.badge_label_en || ''}
                  onChange={e => setConfig('badge_label_en', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#1a56db] outline-none bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker label={lang === 'bn' ? 'ব্যাজ ব্যাকগ্রাউন্ড' : 'Badge Background'} value={cfg.badge_bg} onChange={v => setConfig('badge_bg', v)} />
              <ColorPicker label={lang === 'bn' ? 'ব্যাজ লেখার রঙ' : 'Badge Text'} value={cfg.badge_text_color} onChange={v => setConfig('badge_text_color', v)} />
            </div>
          </>
        )}
      </div>

      {/* ── Content Options ── */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          {lang === 'bn' ? 'কন্টেন্ট অপশন' : 'Content Options'}
        </label>
        <ToggleSwitch
          label={lang === 'bn' ? 'সারসংক্ষেপ দেখাবে (এক্সার্পট)' : 'Show Excerpt'}
          checked={cfg.show_excerpt !== false}
          onChange={v => setConfig('show_excerpt', v)}
        />
      </div>

      {/* ── Item Count ── */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
          {lang === 'bn' ? 'কতটি আর্টিকেল দেখাবে' : 'Number of Articles'}
        </label>
        <input
          type="number"
          min={1}
          max={12}
          value={formData.item_count}
          onChange={e => setFormData(f => ({ ...f, item_count: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#1a56db] outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          {lang === 'bn' ? 'হিরো লেআউটে ১টি হিরো + বাকিগুলো সাইডে' : 'In hero layouts: 1 hero + rest in side/grid'}
        </p>
      </div>

      {/* ── Live Preview ── */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
          {lang === 'bn' ? 'লাইভ প্রিভিউ' : 'Live Preview'}
        </label>
        <div className="rounded-xl overflow-hidden border border-gray-200" style={{ background: cfg.section_bg || '#fff' }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: cfg.header_bg || '#1a56db' }}>
            {cfg.show_badge !== false && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: cfg.badge_bg || '#1a56db', color: cfg.badge_text_color || '#fff' }}
              >
                {lang === 'bn' ? (cfg.badge_label_bn || 'বিশেষ') : (cfg.badge_label_en || 'Special')}
              </span>
            )}
            <span className="font-bold text-sm" style={{ color: cfg.header_text_color || '#fff' }}>
              {lang === 'bn' ? (formData.title_bn || 'বিশেষ প্রতিবেদন') : (formData.title_en || 'Special Feature')}
            </span>
          </div>
          <div className="px-4 py-3 text-xs text-gray-400 text-center">
            {lang === 'bn' ? `আর্টিকেল এখানে দেখাবে (${formData.layout || 'hero_list'} লেআউট)` : `Articles appear here (${formData.layout || 'hero_list'} layout)`}
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomepageLayout({ sections: initialSections = [], categories = [] }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [sections, setSections] = useState(initialSections);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM());

  const openAddModal = () => {
    setEditingSection(null);
    setFormData(EMPTY_FORM());
    setShowModal(true);
  };

  const openEditModal = (s) => {
    setEditingSection(s);
    setFormData({
      category_id: s.category_id || '',
      type:        s.type,
      layout:      s.layout || (s.type === 'special_feature' ? 'hero_list' : 'grid'),
      item_count:  s.item_count,
      edition:     s.edition,
      is_active:   s.is_active,
      title_bn:    s.title_bn || '',
      title_en:    s.title_en || '',
      config:      s.config ? { ...SF_CONFIG_DEFAULTS, ...s.config } : { ...SF_CONFIG_DEFAULTS },
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
      item_count:  parseInt(formData.item_count, 10),
      config:      formData.type === 'special_feature' ? formData.config : null,
    };
    if (editingSection) {
      router.put(route('admin.homepage-layout.update', editingSection.id), payload, {
        onSuccess: () => { setShowModal(false); setSaving(false); showToast('Section updated'); },
        onError:   () => { setSaving(false); showToast('Failed to save', 'error'); },
      });
    } else {
      router.post(route('admin.homepage-layout.store'), payload, {
        onSuccess: () => { setShowModal(false); setSaving(false); showToast('Section added'); },
        onError:   () => { setSaving(false); showToast('Failed to save', 'error'); },
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
      onError: () => { setSections(sections); showToast('Reorder failed', 'error'); },
    });
  };

  const sectionTitle = (section) => {
    if (section.type === 'videos')          return lang === 'bn' ? 'ভিডিও' : 'Videos';
    if (section.type === 'trending')         return lang === 'bn' ? 'ট্রেন্ডিং' : 'Trending';
    if (section.type === 'special_feature') {
      return lang === 'bn'
        ? (section.title_bn || 'বিশেষ প্রতিবেদন')
        : (section.title_en || section.title_bn || 'Special Feature');
    }
    if (section.category) return lang === 'bn' ? section.category.name_bn : (section.category.name_en || section.category.name_bn);
    return section.type.toUpperCase();
  };

  return (
    <div className="p-6">
      <Head title="Homepage Layout" />

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-[#263238]" />
            {lang === 'bn' ? 'হোমপেজ লেআউট' : 'Homepage Layout'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {lang === 'bn' ? 'হোমপেজের সেকশন ও বিন্যাস পরিচালনা করুন' : 'Manage homepage sections, order, and layout styles'}
          </p>
        </div>
        <button onClick={openAddModal} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow-lg active:scale-95">
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
            <div key={section.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:border-[#263238]/30 transition-all">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="p-1 rounded text-gray-300 hover:text-[#263238] hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                  <ChevronUp size={16} />
                </button>
                <button onClick={() => handleMove(index, 'down')} disabled={index === sections.length - 1} className="p-1 rounded text-gray-300 hover:text-[#263238] hover:bg-red-50 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400 text-sm flex-shrink-0">
                {index + 1}
              </div>

              {/* Color swatch for special_feature */}
              {section.type === 'special_feature' && section.config?.header_bg && (
                <div className="w-3 h-9 rounded-full flex-shrink-0" style={{ background: section.config.header_bg }} />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{sectionTitle(section)}</h3>
                  {section.type === 'special_feature' && (
                    <Badge variant="blue" className="text-[10px]">বিশেষ প্রতিবেদন</Badge>
                  )}
                  <Badge variant={section.edition === 'both' ? 'blue' : 'gray'} className="text-[10px]">
                    {section.edition.toUpperCase()}
                  </Badge>
                  {!section.is_active && (
                    <Badge variant="gray" className="text-[10px]">{lang === 'bn' ? 'নিষ্ক্রিয়' : 'Inactive'}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 uppercase tracking-wider font-medium">
                  <span>Layout: <span className="text-gray-600">{LAYOUT_LABELS[section.layout] || section.layout}</span></span>
                  <span>Items: <span className="text-gray-600">{section.item_count}</span></span>
                </div>
              </div>

              <CheckCircle2 size={18} className={section.is_active ? 'text-green-400' : 'text-gray-200'} />

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

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl my-8">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="text-lg font-bold">
                {editingSection
                  ? (lang === 'bn' ? 'সেকশন সম্পাদনা' : 'Edit Section')
                  : (lang === 'bn' ? 'নতুন সেকশন যোগ করুন' : 'Add New Section')}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={18} /></button>
            </div>

            <div className="p-8 space-y-6">

              {/* Type selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  {lang === 'bn' ? 'কন্টেন্ট উৎস' : 'Source Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={e => {
                    const type = e.target.value;
                    const layout = type === 'special_feature' ? 'hero_list' : 'grid';
                    setFormData(f => ({ ...f, type, category_id: '', layout, edition: type === 'special_feature' ? 'both' : f.edition }));
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#263238] outline-none"
                >
                  <option value="category">{lang === 'bn' ? 'ক্যাটাগরি আর্টিকেল' : 'Category Articles'}</option>
                  <option value="special_feature">{lang === 'bn' ? 'বিশেষ প্রতিবেদন' : 'Special Feature'}</option>
                  <option value="videos">{lang === 'bn' ? 'সর্বশেষ ভিডিও' : 'Latest Videos'}</option>
                  <option value="trending">{lang === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}</option>
                </select>
              </div>

              {/* Category selector */}
              {formData.type === 'category' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    {lang === 'bn' ? 'ক্যাটাগরি বেছে নিন' : 'Select Category'}
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#263238] outline-none"
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

              {/* Special Feature full config */}
              {formData.type === 'special_feature' && (
                <SpecialFeatureConfigPanel formData={formData} setFormData={setFormData} lang={lang} />
              )}

              {/* Standard layout + count for non-special sections */}
              {formData.type !== 'special_feature' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                      {lang === 'bn' ? 'লেআউট স্টাইল' : 'Layout Style'}
                    </label>
                    <select
                      value={formData.layout}
                      onChange={e => setFormData(f => ({ ...f, layout: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#263238] outline-none"
                    >
                      <option value="featured_left">Featured Left</option>
                      <option value="grid">Grid</option>
                      <option value="list">List</option>
                      <option value="video_grid">Video Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                      {lang === 'bn' ? 'আইটেম সংখ্যা' : 'Item Count'}
                    </label>
                    <input
                      type="number" min={1} max={20}
                      value={formData.item_count}
                      onChange={e => setFormData(f => ({ ...f, item_count: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#263238] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Edition + Active (non-special only) */}
              {formData.type !== 'special_feature' && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                      {lang === 'bn' ? 'সংস্করণ' : 'Edition'}
                    </label>
                    <select
                      value={formData.edition}
                      onChange={e => setFormData(f => ({ ...f, edition: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#263238] outline-none"
                    >
                      <option value="both">{lang === 'bn' ? 'বাংলা ও ইংরেজি' : 'Both BN & EN'}</option>
                      <option value="bn">{lang === 'bn' ? 'শুধু বাংলা' : 'Bangla Only'}</option>
                      <option value="en">{lang === 'bn' ? 'শুধু ইংরেজি' : 'English Only'}</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={e => setFormData(f => ({ ...f, is_active: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#263238] focus:ring-[#263238]"
                      />
                      <span className="text-sm font-bold text-gray-700">{lang === 'bn' ? 'সক্রিয়' : 'Active'}</span>
                    </label>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full bg-[#263238] text-white rounded-2xl py-3.5 text-sm font-bold shadow-lg transition-all hover:bg-[#1a2428] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
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
