import { useState, useEffect, useMemo, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { LayoutDashboard, Plus, Edit3, Trash2, X, Save, ChevronUp, ChevronDown, ChevronRight, CheckCircle2, Upload, Image as ImageIcon, RefreshCw, Search, Eye } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import SpecialFeatureSection, { SF_DEFAULTS } from '../../../../Components/specialFeature/SpecialFeatureSection';

// ─── defaults ────────────────────────────────────────────────────────────────
const SF_CONFIG_DEFAULTS = {
  ...SF_DEFAULTS,
  manual_articles: [],
};

const SF_LAYOUTS = [
  {
    value: 'banner_split',
    label: 'হিরো + কলাম',
    labelEn: 'Hero + Columns',
    preview: '╔══════╦═╦═╦═╦═╗\n║      ║▬║▬║▬║▬║\n║ HERO ║▬║▬║▬║▬║\n║      ║▬║▬║▬║▬║\n╚══════╩═╩═╩═╩═╝',
  },
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
  banner_split:  'Hero + Columns',
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
const HEX6 = /^#[0-9a-fA-F]{6}$/;

function ColorPicker({ label, value, onChange }) {
  const [text, setText] = useState(value || '#ffffff');

  // Keep local text in sync when prop changes from outside (e.g. config reset)
  useEffect(() => { setText(value || '#ffffff'); }, [value]);

  const handleTextChange = (v) => {
    setText(v);
    if (HEX6.test(v)) onChange(v); // only propagate valid 6-digit hex
  };

  const displayColor = HEX6.test(text) ? text : (HEX6.test(value) ? value : '#ffffff');

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
        <div className="relative w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 cursor-pointer">
          <input
            type="color"
            value={displayColor}
            onChange={e => { setText(e.target.value); onChange(e.target.value); }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ minWidth: 28, minHeight: 28 }}
          />
          <div className="w-full h-full rounded-lg" style={{ background: displayColor }} />
        </div>
        <input
          type="text"
          value={text}
          onChange={e => handleTextChange(e.target.value)}
          maxLength={7}
          className={`flex-1 text-sm font-mono outline-none bg-transparent min-w-0 ${text && !HEX6.test(text) ? 'text-red-500' : ''}`}
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

// ─── CategoryTreeSelect ────────────────────────────────────────────────────────
// A collapsible, searchable tree dropdown for picking a single category at any depth.
function CategoryTreeSelect({ categories, value, onChange, lang, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(() => new Set());
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const name = (c) => (lang === 'bn' ? c.name_bn : (c.name_en || c.name_bn));

  const byId = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const childrenOf = useMemo(() => {
    const map = new Map();
    categories.forEach(c => {
      const p = c.parent_id || 0;
      if (!map.has(p)) map.set(p, []);
      map.get(p).push(c);
    });
    return map;
  }, [categories]);

  const q = search.trim().toLowerCase();
  const matchedIds = useMemo(() => {
    if (!q) return null;
    return new Set(categories.filter(c => name(c).toLowerCase().includes(q)).map(c => c.id));
  }, [q, categories, lang]);

  // When searching, auto-reveal matches and all of their ancestors.
  const visibleSet = useMemo(() => {
    if (!matchedIds) return null;
    const vis = new Set();
    matchedIds.forEach(id => {
      let cur = byId.get(id);
      while (cur) {
        vis.add(cur.id);
        cur = cur.parent_id ? byId.get(cur.parent_id) : null;
      }
    });
    return vis;
  }, [matchedIds, byId]);

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renderNode = (cat, depth) => {
    if (visibleSet && !visibleSet.has(cat.id)) return null;
    const children = childrenOf.get(cat.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = visibleSet ? true : expanded.has(cat.id);
    const isMatch = !matchedIds || matchedIds.has(cat.id);
    return (
      <div key={cat.id}>
        <div className="flex items-center gap-0.5" style={{ paddingLeft: depth * 14 }}>
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(cat.id)}
              className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : <span className="w-5 flex-shrink-0" />}
          <button
            type="button"
            onClick={() => { onChange(String(cat.id)); setOpen(false); setSearch(''); }}
            className={`flex-1 text-left text-sm py-1.5 px-1.5 rounded-lg truncate transition-colors ${
              String(value) === String(cat.id)
                ? 'font-bold text-[#1a56db] bg-blue-50'
                : isMatch ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            {name(cat)}
          </button>
        </div>
        {hasChildren && isExpanded && children.map(c => renderNode(c, depth + 1))}
      </div>
    );
  };

  const roots = childrenOf.get(0) || [];
  const selectedCat = byId.get(Number(value));

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-left bg-white flex items-center justify-between focus:border-[#1a56db] outline-none"
      >
        <span className={selectedCat ? 'text-gray-900 truncate' : 'text-gray-400'}>
          {selectedCat ? name(selectedCat) : (placeholder || (lang === 'bn' ? '— ক্যাটাগরি বেছে নিন —' : '— Select a category —'))}
        </span>
        <ChevronDown size={14} className="text-gray-400 flex-shrink-0 ml-2" />
      </button>
      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto p-2">
          <div className="relative mb-2">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'bn' ? 'ক্যাটাগরি খুঁজুন...' : 'Search category...'}
              className="w-full border border-gray-200 rounded-lg pl-8 pr-2.5 py-1.5 text-sm outline-none focus:border-[#1a56db]"
            />
          </div>
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
              className="w-full text-left text-xs font-bold text-red-500 px-2 py-1.5 hover:bg-red-50 rounded-lg mb-1"
            >
              {lang === 'bn' ? '✕ নির্বাচন বাতিল করুন' : '✕ Clear selection'}
            </button>
          )}
          {roots.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-3">{lang === 'bn' ? 'কোনো ক্যাটাগরি নেই' : 'No categories'}</div>
          )}
          {roots.map(c => renderNode(c, 0))}
        </div>
      )}
    </div>
  );
}

// ─── Article picker thumbnail ────────────────────────────────────────────────
function PreviewThumb({ article, className = '' }) {
  return article.featured_image
    ? <img src={article.featured_image} alt="" className={`w-full h-full object-cover ${className}`} />
    : <div className={`w-full h-full bg-gray-200 flex items-center justify-center text-gray-300 ${className}`}><ImageIcon size={16} /></div>;
}

// ─── SpecialFeatureConfigPanel ────────────────────────────────────────────────
function SpecialFeatureConfigPanel({ formData, setFormData, lang, categories = [] }) {
  const { showToast } = useToast();
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingBannerEn, setUploadingBannerEn] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [gridArticles, setGridArticles] = useState([]);
  const [gridLoading, setGridLoading] = useState(false);
  const [gridSearch, setGridSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const cfg = formData.config || { ...SF_CONFIG_DEFAULTS };
  const setConfig = (key, val) => setFormData(f => ({ ...f, config: { ...(f.config || SF_CONFIG_DEFAULTS), [key]: val } }));
  const setLayout = (val) => setFormData(f => ({ ...f, layout: val }));
  const manualArticles = cfg.manual_articles || [];
  const itemCount = Math.max(1, parseInt(formData.item_count, 10) || 1);

  // Only the first layout is offered for now — force it so older sections saved
  // with a different layout get migrated to it automatically.
  useEffect(() => {
    if (formData.layout !== SF_LAYOUTS[0].value) setLayout(SF_LAYOUTS[0].value);
  }, [formData.layout]);

  // Fetch the article grid for the selected category (and its subcategories), filterable by title.
  useEffect(() => {
    let cancelled = false;
    setGridLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await window.axios.get(route('admin.homepage-layout.articles'), {
          params: {
            category_id: formData.category_id || undefined,
            search: gridSearch.trim() || undefined,
            per_page: 24,
          },
          headers: { Accept: 'application/json' },
        });
        if (!cancelled) setGridArticles(res.data?.data || []);
      } catch {
        if (!cancelled) setGridArticles([]);
      } finally {
        if (!cancelled) setGridLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [formData.category_id, gridSearch]);

  // Trim hand-picked selections if the item count is reduced below the current selection.
  useEffect(() => {
    if (manualArticles.length > itemCount) {
      setConfig('manual_articles', manualArticles.slice(0, itemCount));
    }
  }, [itemCount]);

  const toggleArticle = (article) => {
    const exists = manualArticles.some(a => a.id === article.id);
    if (exists) {
      setConfig('manual_articles', manualArticles.filter(a => a.id !== article.id));
      return;
    }
    if (manualArticles.length >= itemCount) {
      showToast(
        lang === 'bn'
          ? `সর্বোচ্চ ${itemCount}টি আর্টিকেল বেছে নেওয়া যাবে (সেকশন সেটিংসে নির্ধারিত)`
          : `You can select up to ${itemCount} articles (set in section settings)`,
        'error'
      );
      return;
    }
    setConfig('manual_articles', [...manualArticles, {
      id: article.id,
      title_bn: article.title_bn,
      title_en: article.title_en,
      excerpt_bn: article.excerpt_bn,
      excerpt_en: article.excerpt_en,
      featured_image: article.featured_image,
    }]);
  };

  const removeManualArticle = (id) => setConfig('manual_articles', manualArticles.filter(a => a.id !== id));

  const moveManualArticle = (index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= manualArticles.length) return;
    const arr = [...manualArticles];
    [arr[index], arr[next]] = [arr[next], arr[index]];
    setConfig('manual_articles', arr);
  };

  const onCategoryChange = (id) => {
    setFormData(f => ({ ...f, category_id: id }));
    if (manualArticles.length) setConfig('manual_articles', []);
  };

  // Articles shown in the live preview: hand-picked first, otherwise the latest from
  // the selected category (or site-wide latest, already returned when no category is set).
  const previewItems = (manualArticles.length ? manualArticles : gridArticles).slice(0, itemCount);

  // Map admin article shape (title_bn/title_en/excerpt_bn/excerpt_en) to the shape
  // the shared SpecialFeatureSection expects (title/title_en/excerpt/excerpt_en).
  const previewSectionItems = previewItems.map(a => ({
    id: a.id,
    title: a.title_bn,
    title_en: a.title_en,
    excerpt: a.excerpt_bn,
    excerpt_en: a.excerpt_en,
    featured_image: a.featured_image,
  }));

  const handleBannerUpload = async (file) => {
    if (!file) return;
    setUploadingBanner(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await window.axios.post(route('admin.homepage-layout.upload-banner'), data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.url) {
        setConfig('banner_image', res.data.url);
        showToast(lang === 'bn' ? 'ব্যানার আপলোড হয়েছে' : 'Banner uploaded');
      }
    } catch {
      showToast(lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed', 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleBannerRemove = async () => {
    if (!cfg.banner_image) return;
    if (!confirm(lang === 'bn' ? 'ব্যানার ছবি মুছে ফেলবেন?' : 'Remove banner image?')) return;
    setUploadingBanner(true);
    try {
      await window.axios.delete(route('admin.homepage-layout.delete-banner'), { data: { url: cfg.banner_image } });
    } catch {
      // ignore — still clear locally so the section can be saved without the stale image
    } finally {
      setConfig('banner_image', null);
      setUploadingBanner(false);
    }
  };

  const handleBannerEnUpload = async (file) => {
    if (!file) return;
    setUploadingBannerEn(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await window.axios.post(route('admin.homepage-layout.upload-banner'), data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.url) {
        setConfig('banner_image_en', res.data.url);
        showToast(lang === 'bn' ? 'ইংরেজি ব্যানার আপলোড হয়েছে' : 'English banner uploaded');
      }
    } catch {
      showToast(lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed', 'error');
    } finally {
      setUploadingBannerEn(false);
    }
  };

  const handleBannerEnRemove = async () => {
    if (!cfg.banner_image_en) return;
    if (!confirm(lang === 'bn' ? 'ইংরেজি ব্যানার ছবি মুছে ফেলবেন?' : 'Remove English banner image?')) return;
    setUploadingBannerEn(true);
    try {
      await window.axios.delete(route('admin.homepage-layout.delete-banner'), { data: { url: cfg.banner_image_en } });
    } catch {
      // ignore — still clear locally so the section can be saved without the stale image
    } finally {
      setConfig('banner_image_en', null);
      setUploadingBannerEn(false);
    }
  };

  const handleBgImageUpload = async (file) => {
    if (!file) return;
    setUploadingBg(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await window.axios.post(route('admin.homepage-layout.upload-banner'), data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.url) {
        setConfig('bg_image', res.data.url);
        showToast(lang === 'bn' ? 'ব্যাকগ্রাউন্ড ছবি আপলোড হয়েছে' : 'Background image uploaded');
      }
    } catch {
      showToast(lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed', 'error');
    } finally {
      setUploadingBg(false);
    }
  };

  const handleBgImageRemove = async () => {
    if (!cfg.bg_image) return;
    if (!confirm(lang === 'bn' ? 'ব্যাকগ্রাউন্ড ছবি মুছে ফেলবেন?' : 'Remove background image?')) return;
    setUploadingBg(true);
    try {
      await window.axios.delete(route('admin.homepage-layout.delete-banner'), { data: { url: cfg.bg_image } });
    } catch {
      // ignore — still clear locally so the section can be saved without the stale image
    } finally {
      setConfig('bg_image', null);
      setUploadingBg(false);
    }
  };

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
          {SF_LAYOUTS.slice(0, 1).map(l => (
            <div key={l.value} className="p-3 rounded-xl border-2 border-[#1a56db] bg-blue-50 text-left">
              <pre className="text-[9px] leading-tight font-mono text-gray-500 mb-1.5 overflow-hidden">{l.preview}</pre>
              <div className="text-xs font-bold text-gray-700">{lang === 'bn' ? l.label : l.labelEn}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {lang === 'bn'
            ? 'এই গ্রিড শুধু আর্টিকেলগুলো কীভাবে সাজানো হবে তা নির্ধারণ করে — নিচের ব্যানার ছবি অপশনটি (চালু থাকলে) সব লেআউটেই সেকশনের সবার উপরে দেখাবে।'
            : 'This grid only controls how the articles are arranged — the Banner Image option below (if enabled) appears above every layout, not just one.'}
        </p>
      </div>

      {/* ── Content Source ── */}
      <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          {lang === 'bn' ? 'কন্টেন্টের উৎস' : 'Content Source'}
        </label>
        <p className="text-xs text-gray-400">
          {lang === 'bn'
            ? 'প্রথমে একটি ক্যাটাগরি বেছে নিন (এর সাব-ক্যাটাগরিসহ)। নিচের গ্রিড থেকে নির্দিষ্ট আর্টিকেল বেছে নিতে পারেন (প্রথমটি হিরো)। কিছু না বেছে নিলে এই ক্যাটাগরি থেকে সর্বশেষ আর্টিকেলগুলো দেখাবে। কোনো ক্যাটাগরি না থাকলে সর্বশেষ প্রকাশিত আর্টিকেল দেখাবে।'
            : 'First pick a category (including its subcategories). You can hand-pick specific articles from the grid below (first = hero). If none are picked, the latest articles from this category are shown. With no category, the latest published articles site-wide are used.'}
        </p>

        {/* Category selector */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
            {lang === 'bn' ? 'ক্যাটাগরি' : 'Category'}
          </label>
          <CategoryTreeSelect
            categories={categories}
            value={formData.category_id || ''}
            onChange={onCategoryChange}
            lang={lang}
            placeholder={lang === 'bn' ? '— কোনো ক্যাটাগরি না (সর্বশেষ আর্টিকেল) —' : '— No category (latest articles) —'}
          />
        </div>

        {/* Article grid picker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              {lang === 'bn' ? 'আর্টিকেল বেছে নিন' : 'Pick Articles'}
            </label>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${manualArticles.length >= itemCount ? 'bg-blue-100 text-[#1a56db]' : 'bg-gray-100 text-gray-500'}`}>
              {manualArticles.length}/{itemCount}
            </span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={gridSearch}
              onChange={e => setGridSearch(e.target.value)}
              placeholder={lang === 'bn' ? 'শিরোনাম দিয়ে খুঁজুন...' : 'Search by title...'}
              className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:border-[#1a56db] outline-none bg-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto p-2 bg-white border border-gray-200 rounded-xl">
            {gridLoading && (
              <div className="col-span-3 text-center text-xs text-gray-400 py-6">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
            )}
            {!gridLoading && gridArticles.length === 0 && (
              <div className="col-span-3 text-center text-xs text-gray-400 py-6">{lang === 'bn' ? 'কোনো আর্টিকেল পাওয়া যায়নি' : 'No articles found'}</div>
            )}
            {!gridLoading && gridArticles.map(a => {
              const selIndex = manualArticles.findIndex(m => m.id === a.id);
              const selected = selIndex !== -1;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleArticle(a)}
                  className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${selected ? 'border-[#1a56db]' : 'border-transparent hover:border-gray-200'}`}
                >
                  <div className="aspect-[4/3]">
                    <PreviewThumb article={a} />
                  </div>
                  <div className="p-1.5 text-[11px] leading-tight line-clamp-2 bg-white">
                    {lang === 'bn' ? (a.title_bn || a.title_en) : (a.title_en || a.title_bn)}
                  </div>
                  {selected && (
                    <span className="absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#1a56db] text-white shadow">
                      {selIndex === 0 ? (lang === 'bn' ? 'হিরো' : 'HERO') : selIndex + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400">
            {manualArticles.length === 0
              ? (lang === 'bn'
                  ? 'কিছু বেছে নেওয়া হয়নি — সর্বশেষ আর্টিকেলগুলো স্বয়ংক্রিয়ভাবে দেখাবে।'
                  : 'Nothing selected — the latest articles will be shown automatically.')
              : (lang === 'bn'
                  ? `${manualArticles.length}টি আর্টিকেল বেছে নেওয়া হয়েছে। প্রথমটি হিরো হিসেবে দেখাবে।`
                  : `${manualArticles.length} article(s) selected. The first one is shown as the hero.`)}
          </p>

          {/* Selected articles — reorderable */}
          {manualArticles.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {manualArticles.map((a, i) => (
                <div key={a.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                  <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                    <PreviewThumb article={a} />
                  </div>
                  <span className="flex-1 text-sm truncate">{lang === 'bn' ? a.title_bn : (a.title_en || a.title_bn)}</span>
                  {i === 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#1a56db] flex-shrink-0">
                      {lang === 'bn' ? 'হিরো' : 'HERO'}
                    </span>
                  )}
                  <button type="button" onClick={() => moveManualArticle(i, -1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                    <ChevronUp size={14} />
                  </button>
                  <button type="button" onClick={() => moveManualArticle(i, 1)} disabled={i === manualArticles.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                    <ChevronDown size={14} />
                  </button>
                  <button type="button" onClick={() => removeManualArticle(a.id)} className="p-1 text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Banner Image ── */}
      <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
        <ToggleSwitch
          label={lang === 'bn' ? 'ব্যানার ছবি দেখাবে' : 'Show Banner Image'}
          checked={cfg.show_banner !== false}
          onChange={v => setConfig('show_banner', v)}
        />
        <p className="text-xs text-gray-400">
          {lang === 'bn'
            ? 'সেকশনের সবার উপরে একটি পূর্ণ-প্রস্থ ব্যানার ছবি (যেমন ইভেন্ট গ্রাফিক্স, লোগো, শিরোনাম সহ ডিজাইন)। প্রস্তাবিত অনুপাত ৪:১ (যেমন ১৬০০×৪০০ পিক্সেল) — এতে ছবিটি মোবাইলেও বেশি জায়গা না নিয়ে সুন্দর দেখাবে।'
            : 'A full-width image shown at the very top of the section — e.g. an event graphic with title/branding baked in. Recommended aspect ratio: 4:1 (e.g. 1600×400px) — keeps it impactful on desktop without taking up too much space on mobile.'}
        </p>
        {cfg.show_banner !== false && (
          <div className="space-y-4">
            {/* Bangla banner */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                {lang === 'bn' ? 'বাংলা ব্যানার' : 'Bangla Banner'}
              </span>
              {cfg.banner_image ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-white">
                  <img src={cfg.banner_image} alt="Bangla banner" className="w-full h-auto block" />
                  <button
                    type="button"
                    onClick={handleBannerRemove}
                    disabled={uploadingBanner}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow disabled:opacity-50"
                    title={lang === 'bn' ? 'মুছুন' : 'Remove'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                  <ImageIcon size={24} className="text-gray-300" />
                  <span className="text-sm text-gray-400">{lang === 'bn' ? 'কোনো ব্যানার নেই' : 'No banner uploaded'}</span>
                </div>
              )}
              <label className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border text-sm font-bold transition-all ${uploadingBanner ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : 'border-[#1a56db] text-[#1a56db] hover:bg-[#1a56db] hover:text-white'}`}>
                {uploadingBanner ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                {lang === 'bn' ? 'ব্যানার আপলোড করুন' : 'Upload Banner'}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  disabled={uploadingBanner}
                  onChange={e => handleBannerUpload(e.target.files[0])}
                />
              </label>
            </div>

            {/* English banner */}
            <div className="space-y-2 pt-3 border-t border-gray-200">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                {lang === 'bn' ? 'ইংরেজি ব্যানার' : 'English Banner'}
              </span>
              <p className="text-xs text-gray-400">
                {lang === 'bn'
                  ? 'ইংরেজি এডিশনের জন্য আলাদা ব্যানার। খালি রাখলে ইংরেজি এডিশনে বাংলা ব্যানারটিই দেখাবে।'
                  : 'A separate banner for the English edition. If left empty, the Bangla banner is shown in the English edition.'}
              </p>
              {cfg.banner_image_en ? (
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-white">
                  <img src={cfg.banner_image_en} alt="English banner" className="w-full h-auto block" />
                  <button
                    type="button"
                    onClick={handleBannerEnRemove}
                    disabled={uploadingBannerEn}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow disabled:opacity-50"
                    title={lang === 'bn' ? 'মুছুন' : 'Remove'}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                  <ImageIcon size={24} className="text-gray-300" />
                  <span className="text-sm text-gray-400">{lang === 'bn' ? 'কোনো ব্যানার নেই' : 'No banner uploaded'}</span>
                </div>
              )}
              <label className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border text-sm font-bold transition-all ${uploadingBannerEn ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : 'border-[#1a56db] text-[#1a56db] hover:bg-[#1a56db] hover:text-white'}`}>
                {uploadingBannerEn ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                {lang === 'bn' ? 'ব্যানার আপলোড করুন' : 'Upload Banner'}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  disabled={uploadingBannerEn}
                  onChange={e => handleBannerEnUpload(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        )}
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
      <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          {lang === 'bn' ? 'সেকশন ব্যাকগ্রাউন্ড' : 'Section Background'}
        </label>

        {/* Type selector */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'solid', label: lang === 'bn' ? 'একরঙা' : 'Solid' },
            { value: 'gradient', label: lang === 'bn' ? 'গ্র্যাডিয়েন্ট' : 'Gradient' },
            { value: 'image', label: lang === 'bn' ? 'ছবি' : 'Image' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setConfig('bg_type', opt.value)}
              className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                (cfg.bg_type || 'solid') === opt.value
                  ? 'border-[#1a56db] bg-blue-50 text-[#1a56db]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Solid */}
        {(cfg.bg_type || 'solid') === 'solid' && (
          <ColorPicker label="" value={cfg.section_bg} onChange={v => setConfig('section_bg', v)} />
        )}

        {/* Gradient */}
        {cfg.bg_type === 'gradient' && (
          <div className="space-y-3">
            <div
              className="h-10 rounded-xl border border-gray-200"
              style={{ background: `linear-gradient(${cfg.gradient_angle ?? 135}deg, ${cfg.gradient_from || '#1a56db'}, ${cfg.gradient_to || '#ffffff'})` }}
            />
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker label={lang === 'bn' ? 'রঙ ১' : 'Color 1'} value={cfg.gradient_from} onChange={v => setConfig('gradient_from', v)} />
              <ColorPicker label={lang === 'bn' ? 'রঙ ২' : 'Color 2'} value={cfg.gradient_to} onChange={v => setConfig('gradient_to', v)} />
            </div>
            <div>
              <label className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{lang === 'bn' ? 'কোণ (অ্যাঙ্গেল)' : 'Angle'}</span>
                <span className="font-mono font-bold text-gray-700">{cfg.gradient_angle ?? 135}°</span>
              </label>
              <input
                type="range"
                min={0}
                max={360}
                step={15}
                value={cfg.gradient_angle ?? 135}
                onChange={e => setConfig('gradient_angle', parseInt(e.target.value, 10))}
                className="w-full accent-[#1a56db]"
              />
            </div>
          </div>
        )}

        {/* Image */}
        {cfg.bg_type === 'image' && (
          <div className="space-y-3">
            {cfg.bg_image ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-white">
                <img src={cfg.bg_image} alt="Background" className="w-full h-32 object-cover block" />
                <button
                  type="button"
                  onClick={handleBgImageRemove}
                  disabled={uploadingBg}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow disabled:opacity-50"
                  title={lang === 'bn' ? 'মুছুন' : 'Remove'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                <ImageIcon size={24} className="text-gray-300" />
                <span className="text-sm text-gray-400">{lang === 'bn' ? 'কোনো ছবি নেই' : 'No image uploaded'}</span>
              </div>
            )}
            <label className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border text-sm font-bold transition-all ${uploadingBg ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : 'border-[#1a56db] text-[#1a56db] hover:bg-[#1a56db] hover:text-white'}`}>
              {uploadingBg ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
              {lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                disabled={uploadingBg}
                onChange={e => handleBgImageUpload(e.target.files[0])}
              />
            </label>
            <div>
              <label className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{lang === 'bn' ? 'ওভারলে অপাসিটি (লেখা পড়ার সুবিধার জন্য)' : 'Overlay Opacity (for text readability)'}</span>
                <span className="font-mono font-bold text-gray-700">{cfg.bg_overlay_opacity ?? 40}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={cfg.bg_overlay_opacity ?? 40}
                onChange={e => setConfig('bg_overlay_opacity', parseInt(e.target.value, 10))}
                className="w-full accent-[#1a56db]"
              />
            </div>
          </div>
        )}

        {/* Content theme */}
        <div className="pt-1">
          <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
            {lang === 'bn' ? 'কন্টেন্ট থিম' : 'Content Theme'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'light', label: lang === 'bn' ? 'লাইট (গাঢ় লেখা)' : 'Light (dark text)' },
              { value: 'dark', label: lang === 'bn' ? 'ডার্ক (সাদা লেখা)' : 'Dark (white text)' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setConfig('content_theme', opt.value)}
                className={`py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                  (cfg.content_theme || 'light') === opt.value
                    ? 'border-[#1a56db] bg-blue-50 text-[#1a56db]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {lang === 'bn'
              ? 'গ্র্যাডিয়েন্ট বা ছবির ব্যাকগ্রাউন্ড গাঢ় হলে "ডার্ক" থিম বেছে নিন যাতে আর্টিকেলের শিরোনাম পড়া যায়।'
              : 'Choose "Dark" when your gradient or image background is dark, so article titles stay readable.'}
          </p>
        </div>
      </div>

      {/* ── Title Bar (header) ── */}
      <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
        <ToggleSwitch
          label={lang === 'bn' ? 'শিরোনাম বার দেখাবে' : 'Show Title Bar'}
          checked={cfg.show_header !== false}
          onChange={v => setConfig('show_header', v)}
        />
        <p className="text-xs text-gray-400">
          {lang === 'bn'
            ? 'যদি ব্যানার ছবিতে আগেই শিরোনাম থাকে, এই বারটি বন্ধ রাখতে পারেন।'
            : 'If your banner image already has a title baked in, you can turn this bar off.'}
        </p>
        {cfg.show_header !== false && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <ColorPicker label={lang === 'bn' ? 'হেডার ব্যাকগ্রাউন্ড' : 'Background'} value={cfg.header_bg} onChange={v => setConfig('header_bg', v)} />
              <ColorPicker label={lang === 'bn' ? 'হেডার লেখার রঙ' : 'Text Color'} value={cfg.header_text_color} onChange={v => setConfig('header_text_color', v)} />
            </div>

            {/* Badge */}
            <div className="p-3 bg-white rounded-xl space-y-3">
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
          </>
        )}
      </div>

      {/* ── Columns (banner_split only) ── */}
      {formData.layout === 'banner_split' && (
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
            {lang === 'bn' ? 'কলাম সংখ্যা' : 'Number of Columns'}
          </label>
          <div className="flex gap-2">
            {[2, 3, 4].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setConfig('list_columns', n)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                  (cfg.list_columns || 3) === n
                    ? 'border-[#1a56db] bg-blue-50 text-[#1a56db]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {lang === 'bn' ? 'হিরোর পাশে লেখার তালিকা কতটি কলামে ভাগ হবে' : 'How many text-link columns appear next to the hero card'}
          </p>
        </div>
      )}

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
          {lang === 'bn'
            ? '১টি হিরো + বাকিগুলো লিস্ট/গ্রিড/কলামে। এটি কেবল ক্যাটাগরি বা সর্বশেষ-আর্টিকেল ফলব্যাক ব্যবহার হলে প্রযোজ্য — নির্দিষ্ট আর্টিকেল বেছে নিলে ঠিক সেগুলোই দেখাবে।'
            : '1 hero + the rest fill the list/grid/columns. Only applies when using the category or latest-articles fallback — hand-picked articles are shown exactly as selected.'}
        </p>
      </div>

      {/* ── Live Preview ── */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
          {lang === 'bn' ? 'লাইভ প্রিভিউ' : 'Live Preview'}
        </label>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#1a56db] text-[#1a56db] text-sm font-bold hover:bg-blue-50 transition-colors"
        >
          <Eye size={16} />
          {lang === 'bn' ? 'লাইভ প্রিভিউ দেখুন' : 'Show Live Preview'}
        </button>
        <p className="text-xs text-gray-400 mt-1">
          {manualArticles.length === 0 && !formData.category_id
            ? (lang === 'bn' ? `${LAYOUT_LABELS[formData.layout] || formData.layout} লেআউটে সর্বশেষ আর্টিকেল দিয়ে প্রিভিউ দেখানো হবে।` : `The preview will show the ${LAYOUT_LABELS[formData.layout] || formData.layout} layout with the latest articles.`)
            : (lang === 'bn' ? `${LAYOUT_LABELS[formData.layout] || formData.layout} লেআউটে বাস্তব আর্টিকেল দিয়ে প্রিভিউ দেখানো হবে।` : `The preview will show the ${LAYOUT_LABELS[formData.layout] || formData.layout} layout with real articles.`)}
        </p>
      </div>

      {/* ── Live Preview Modal ── */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[110] bg-gray-900/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          onClick={() => setShowPreview(false)}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Eye size={18} /> {lang === 'bn' ? 'লাইভ প্রিভিউ' : 'Live Preview'}
              </h3>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={18} /></button>
            </div>
            <div className="p-4 sm:p-6 bg-gray-100 rounded-b-3xl">
              {gridLoading && previewSectionItems.length === 0 ? (
                <div className="px-4 py-12 text-sm text-gray-400 text-center">{lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</div>
              ) : previewSectionItems.length === 0 ? (
                <div className="px-4 py-12 text-sm text-gray-400 text-center">{lang === 'bn' ? 'দেখানোর জন্য কোনো আর্টিকেল নেই' : 'No articles available to preview'}</div>
              ) : (
                <SpecialFeatureSection
                  section={{
                    title_bn: formData.title_bn,
                    title_en: formData.title_en,
                    type: 'special_feature',
                    layout: formData.layout,
                    config: cfg,
                    items: previewSectionItems,
                  }}
                  lang={lang}
                />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HomepageLayout({ sections: initialSections = [], categories = [] }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [sections, setSections] = useState(initialSections);
  useEffect(() => { setSections(initialSections); }, [initialSections]);
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
      layout:      s.layout || (s.type === 'special_feature' ? 'banner_split' : 'grid'),
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

  // Close modal on Escape
  useEffect(() => {
    if (!showModal) return;
    const onEsc = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [showModal]);

  const handleMove = (index, direction) => {
    const originalSections = sections; // capture before mutation for rollback
    const newSections = [...sections];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newSections.length) return;
    [newSections[index], newSections[swapIndex]] = [newSections[swapIndex], newSections[index]];
    setSections(newSections);
    const orders = {};
    newSections.forEach((s, i) => { orders[s.id] = i + 1; });
    router.post(route('admin.homepage-layout.reorder'), { orders }, {
      onError: () => { setSections(originalSections); showToast('Reorder failed', 'error'); },
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
                  {lang === 'bn' ? 'সেকশনের ধরন' : 'Section Type'}
                </label>
                <select
                  value={formData.type}
                  onChange={e => {
                    const type = e.target.value;
                    const layout = type === 'special_feature' ? 'banner_split' : 'grid';
                    setFormData(f => ({ ...f, type, category_id: '', layout, edition: type === 'special_feature' ? 'both' : f.edition }));
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-[#263238] outline-none"
                >
                  <option value="category">{lang === 'bn' ? 'ক্যাটাগরি আর্টিকেল' : 'Category Articles'}</option>
                  <option value="special_feature">{lang === 'bn' ? 'বিশেষ প্রতিবেদন' : 'Special Feature'}</option>
                  <option value="videos">{lang === 'bn' ? 'সর্বশেষ ভিডিও' : 'Latest Videos'}</option>
                  <option value="trending">{lang === 'bn' ? 'ট্রেন্ডিং' : 'Trending'}</option>
                </select>
                {formData.type === 'special_feature' && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {lang === 'bn'
                      ? 'এই সেকশনের কন্টেন্ট নিচে কনফিগার করুন — নির্দিষ্ট আর্টিকেল বেছে নিন, অথবা একটি ক্যাটাগরি থেকে স্বয়ংক্রিয়ভাবে আনুন।'
                      : 'Configure this section\'s content below — hand-pick specific articles, or pull automatically from a category.'}
                  </p>
                )}
              </div>

              {/* Category selector */}
              {formData.type === 'category' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    {lang === 'bn' ? 'ক্যাটাগরি বেছে নিন' : 'Select Category'}
                  </label>
                  <CategoryTreeSelect
                    categories={categories}
                    value={formData.category_id}
                    onChange={id => setFormData(f => ({ ...f, category_id: id }))}
                    lang={lang}
                  />
                </div>
              )}

              {/* Special Feature full config */}
              {formData.type === 'special_feature' && (
                <SpecialFeatureConfigPanel formData={formData} setFormData={setFormData} lang={lang} categories={categories} />
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
