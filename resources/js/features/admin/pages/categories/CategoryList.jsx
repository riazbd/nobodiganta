import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Edit3, Trash2, X, Check, Loader2, AlertTriangle, FolderTree, GripVertical, Navigation, ChevronRight, Search } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';
import CategorySelect from '../../components/forms/CategorySelect';

// Depth-ordered flatten: parent, then its children (recursively), then next parent.
function flattenCategories(cats, parentId = null, depth = 0) {
  const out = [];
  cats
    .filter(c => (c.parentId || null) === parentId)
    .forEach(c => {
      out.push({ ...c, depth });
      out.push(...flattenCategories(cats, c.id, depth + 1));
    });
  return out;
}

// Ids of a category and all its descendants (to exclude from its own parent options).
function descendantIds(cats, id) {
  const ids = new Set([id]);
  let added = true;
  while (added) {
    added = false;
    cats.forEach(c => {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) { ids.add(c.id); added = true; }
    });
  }
  return ids;
}

export default function CategoryList() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();

  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [reordering, setReordering]       = useState(false);
  const [expanded, setExpanded]           = useState(() => new Set());
  const [catSearch, setCatSearch]         = useState('');
  const dragId   = useRef(null);
  const dragOver = useRef(null);

  // Form state
  const [catNameBn, setCatNameBn] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catEdition, setCatEdition] = useState('both');
  const [catColor, setCatColor] = useState('#6b7280');
  const [catDescBn, setCatDescBn] = useState('');
  const [catDescEn, setCatDescEn] = useState('');
  const [catMetaBn, setCatMetaBn] = useState('');
  const [catMetaEn, setCatMetaEn] = useState('');
  const [catParentId, setCatParentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const COLORS = [
    '#263238', '#0055a5', '#6b21a8', '#059669', '#dc2626', '#d946ef',
    '#f59e0b', '#0ea5e9', '#ec4899', '#8b5cf6', '#10b981', '#22c55e',
    '#f97316', '#14b8a6', '#6b7280', '#ef4444', '#3b82f6', '#84cc16',
  ];

  // Fetch categories from database
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await window.axios.get('/api/admin/categories');
      const data = res.data;
      // Transform snake_case to camelCase
      const transformed = data.map(c => ({
        id: c.id,
        parentId: c.parent_id,
        nameBn: c.name_bn || '',
        nameEn: c.name_en || '',
        slug: c.slug || '',
        edition: c.edition || 'both',
        isActive: c.is_active !== false,
        showInNav: c.show_in_nav !== false,
        color: c.color || '#6b7280',
        descriptionBn: c.description_bn || '',
        descriptionEn: c.description_en || '',
        metaDescriptionBn: c.meta_description_bn || '',
        metaDescriptionEn: c.meta_description_en || '',
        articleCount: c.article_count || 0,
      }));
      setCategories(transformed);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      showToast(lang === 'bn' ? 'বিভাগ লোড করতে ব্যর্থ হয়েছে' : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from names
  useEffect(() => {
    if (!editingCat) {
      const name = catNameEn || catNameBn;
      if (name && !catSlug) {
        setCatSlug(name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
      }
    }
  }, [catNameBn, catNameEn]);

  const resetForm = () => {
    setCatNameBn('');
    setCatNameEn('');
    setCatSlug('');
    setCatEdition('both');
    setCatColor('#6b7280');
    setCatDescBn('');
    setCatDescEn('');
    setCatMetaBn('');
    setCatMetaEn('');
    setCatParentId('');
    setEditingCat(null);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    setCatNameBn(cat.nameBn);
    setCatNameEn(cat.nameEn);
    setCatSlug(cat.slug);
    setCatEdition(cat.edition);
    setCatColor(cat.color);
    setCatDescBn(cat.descriptionBn || '');
    setCatDescEn(cat.descriptionEn || '');
    setCatMetaBn(cat.metaDescriptionBn || '');
    setCatMetaEn(cat.metaDescriptionEn || '');
    setCatParentId(cat.parentId || '');
    setShowModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const needsBn = catEdition === 'bn' || catEdition === 'both';
    const needsEn = catEdition === 'en' || catEdition === 'both';

    if (needsBn && !catNameBn.trim()) {
      showToast(lang === 'bn' ? 'বাংলা নাম প্রয়োজন!' : 'Bengali name required!');
      return;
    }
    if (needsEn && !catNameEn.trim()) {
      showToast(lang === 'bn' ? 'ইংরেজি নাম প্রয়োজন!' : 'English name required!');
      return;
    }
    if (!catSlug.trim()) {
      showToast(lang === 'bn' ? 'স্লাগ প্রয়োজন!' : 'Slug required!');
      return;
    }

    setSubmitting(true);
    try {
      const method = editingCat ? 'PUT' : 'POST';
      const url = editingCat ? `/admin/categories/${editingCat.id}` : '/admin/categories';

      const payload = {
        name_bn: catNameBn, name_en: catNameEn, slug: catSlug,
        edition: catEdition, parent_id: catParentId || null, color: catColor,
        description_bn: catDescBn, description_en: catDescEn,
        meta_description_bn: catMetaBn, meta_description_en: catMetaEn,
      };
      if (editingCat) {
        await window.axios.put(url, payload);
      } else {
        await window.axios.post(url, payload);
      }

      showToast(editingCat
        ? (lang === 'bn' ? 'বিভাগ আপডেট হয়েছে' : 'Category updated')
        : (lang === 'bn' ? 'বিভাগ যোগ হয়েছে' : 'Category added')
      );

      setShowModal(false);
      resetForm();
      await fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      showToast(err.message || (lang === 'bn' ? 'সংরক্ষণ করতে ব্যর্থ' : 'Failed to save'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleNav = async (cat) => {
    try {
      await window.axios.patch(`/admin/categories/${cat.id}/toggle-nav`);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, showInNav: !c.showInNav } : c));
    } catch {
      showToast(lang === 'bn' ? 'ব্যর্থ হয়েছে' : 'Failed to update');
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      await window.axios.patch(`/admin/categories/${cat.id}/toggle-status`);
      await fetchCategories();
      showToast(cat.isActive
        ? (lang === 'bn' ? 'বিভাগ নিষ্ক্রিয় হয়েছে' : 'Category deactivated')
        : (lang === 'bn' ? 'বিভাগ সক্রিয় হয়েছে' : 'Category activated')
      );
    } catch (err) {
      console.error('Error toggling status:', err);
      showToast(lang === 'bn' ? 'স্টেটাস পরিবর্তন করতে ব্যর্থ' : 'Failed to toggle status');
    }
  };

  const handleDelete = async (cat) => {
    try {
      await window.axios.delete(`/admin/categories/${cat.id}`);
      setDeleteConfirm(null);
      showToast(lang === 'bn' ? 'বিভাগ মুছে ফেলা হয়েছে' : 'Category deleted');
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      showToast(err.message || (lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ' : 'Failed to delete'));
    }
  };

  // ── Collapsible tree ─────────────────────────────────────────
  const childrenMap = useMemo(() => {
    const m = {};
    categories.forEach(c => { const k = c.parentId || 'root'; (m[k] = m[k] || []).push(c); });
    return m;
  }, [categories]);
  const hasKids = (id) => (childrenMap[id]?.length || 0) > 0;

  const nameOf = (c) => (lang === 'bn' ? (c.nameBn || c.nameEn) : (c.nameEn || c.nameBn)) || '';

  // Rows to show: collapsed tree, or (when searching) all matches + their ancestors.
  const visibleNodes = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    if (q) {
      const byId = {}; categories.forEach(c => { byId[c.id] = c; });
      const keep = new Set();
      categories.forEach(c => {
        if (nameOf(c).toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q)) {
          let cur = c;
          while (cur) { keep.add(cur.id); cur = cur.parentId ? byId[cur.parentId] : null; }
        }
      });
      return flattenCategories(categories).filter(n => keep.has(n.id));
    }
    const out = [];
    const walk = (parentId, depth) => {
      (childrenMap[parentId || 'root'] || []).forEach(c => {
        out.push({ ...c, depth });
        if (expanded.has(c.id)) walk(c.id, depth + 1);
      });
    };
    walk(null, 0);
    return out;
  }, [categories, expanded, catSearch, childrenMap, lang]);

  const toggleExpand = (id) => setExpanded(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const expandAll = () => setExpanded(new Set(categories.filter(c => hasKids(c.id)).map(c => c.id)));
  const collapseAll = () => setExpanded(new Set());

  // ── Drag-to-reorder (within the same sibling group, any depth) ─
  const onDragStart = (e, id) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragEnter = (id) => { dragOver.current = id; };

  const onDragEnd = async () => {
    const fromId = dragId.current;
    const toId   = dragOver.current;
    dragId.current = dragOver.current = null;

    if (!fromId || !toId || fromId === toId) return;

    const from = categories.find(c => c.id === fromId);
    const to   = categories.find(c => c.id === toId);
    if (!from || !to) return;

    // Only reorder within the same group: both top-level, or both under the same parent.
    const fromParent = from.parentId || null;
    const toParent   = to.parentId || null;
    if (fromParent !== toParent) return;

    // Reorder the affected group optimistically; keep everyone else as-is.
    const group  = categories.filter(c => (c.parentId || null) === fromParent);
    const others = categories.filter(c => (c.parentId || null) !== fromParent);
    const fromIdx = group.findIndex(c => c.id === fromId);
    const toIdx   = group.findIndex(c => c.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...group];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);

    const withOrder = reordered.map((c, i) => ({ ...c, sort_order: i + 1 }));
    setCategories([...withOrder, ...others]);

    // Persist to server
    setReordering(true);
    try {
      await window.axios.post('/admin/categories/reorder', {
        categories: withOrder.map(c => ({ id: c.id, sort_order: c.sort_order })),
      });
      showToast(lang === 'bn' ? 'ক্রম সংরক্ষিত হয়েছে' : 'Order saved');
    } catch {
      showToast(lang === 'bn' ? 'ক্রম সংরক্ষণ ব্যর্থ' : 'Failed to save order');
      await fetchCategories();
    } finally {
      setReordering(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#263238] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted,#9ca3af)]">
            {lang === 'bn' ? 'বিভাগ লোড হচ্ছে...' : 'Loading categories...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-red-700 mb-1">
          {lang === 'bn' ? 'ত্রুটি হয়েছে' : 'Error loading categories'}
        </h3>
        <p className="text-xs text-red-600 mb-4">{error}</p>
        <button onClick={fetchCategories} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
          {lang === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali'] flex items-center gap-3">
             <FolderTree className="w-7 h-7 text-[#263238]" />
             {lang === 'bn' ? 'বিভাগ ব্যবস্থাপনা' : 'Category Management'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75 flex items-center gap-2">
            {categories.length} {lang === 'bn' ? 'টি বিভাগ ও উপ-বিভাগ' : 'categories & subcategories'}
            {reordering && <span className="flex items-center gap-1 text-[#263238]"><Loader2 className="w-3 h-3 animate-spin" />{lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>}
          </p>
        </div>
        <button onClick={openAddModal} className="bg-[#263238] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#1a2428] transition-colors">
          <Plus className="w-4 h-4" /> {lang === 'bn' ? 'নতুন বিভাগ' : 'New Category'}
        </button>
      </div>

      {/* Toolbar: search + expand controls */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            value={catSearch}
            onChange={e => setCatSearch(e.target.value)}
            placeholder={lang === 'bn' ? 'বিভাগ খুঁজুন...' : 'Search categories...'}
            className="w-full pl-9 pr-8 py-2 text-sm border border-[var(--card-border,#e8ebf4)] rounded-lg outline-none focus:border-[#263238] bg-white"
          />
          {catSearch && (
            <button onClick={() => setCatSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          )}
        </div>
        <button onClick={expandAll} className="text-xs font-medium text-gray-500 hover:text-[#263238] px-2.5 py-2 rounded-lg hover:bg-gray-100 transition-colors">{lang === 'bn' ? 'সব খুলুন' : 'Expand all'}</button>
        <button onClick={collapseAll} className="text-xs font-medium text-gray-500 hover:text-[#263238] px-2.5 py-2 rounded-lg hover:bg-gray-100 transition-colors">{lang === 'bn' ? 'সব বন্ধ' : 'Collapse all'}</button>
      </div>

      {/* Tree */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        {visibleNodes.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-[var(--text-muted,#9ca3af)]">
            {catSearch ? (lang === 'bn' ? 'কিছু পাওয়া যায়নি' : 'No matches') : (lang === 'bn' ? 'কোনো বিভাগ নেই' : 'No categories yet')}
          </div>
        ) : (
          visibleNodes.map(cat => {
            const isMain = cat.depth === 0;
            const kids = hasKids(cat.id);
            const isOpen = !!catSearch || expanded.has(cat.id);
            return (
              <div
                key={cat.id}
                draggable
                onDragStart={e => onDragStart(e, cat.id)}
                onDragEnter={() => onDragEnter(cat.id)}
                onDragEnd={onDragEnd}
                onDragOver={e => e.preventDefault()}
                className={`group flex items-center gap-1.5 pr-3 border-b border-[#f4f5f7] last:border-b-0 hover:bg-[#fafbfc] transition-colors ${cat.isActive ? '' : 'opacity-60'}`}
                style={{ paddingLeft: 6 + cat.depth * 22 }}
              >
                <span className="w-4 flex-shrink-0 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" title={lang === 'bn' ? 'টেনে সাজান' : 'Drag to reorder'}>
                  <GripVertical size={14} />
                </span>

                {kids ? (
                  <button onClick={() => toggleExpand(cat.id)} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-[#263238] hover:bg-gray-100 flex-shrink-0" aria-label={isOpen ? 'Collapse' : 'Expand'}>
                    <ChevronRight size={15} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                ) : <span className="w-5 flex-shrink-0" />}

                {isMain && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#94a3b8' }} />}

                <button
                  onClick={() => (kids ? toggleExpand(cat.id) : openEditModal(cat))}
                  className="flex items-center gap-2 min-w-0 py-2.5 text-left"
                >
                  <span className={`truncate text-[var(--text-primary,#1a1d2e)] ${isMain ? 'font-semibold text-[14px]' : 'text-[13px]'}`}>{nameOf(cat)}</span>
                  {kids && <span className="text-[11px] text-gray-400 tabular-nums">{childrenMap[cat.id].length}</span>}
                  <EditionBadge edition={cat.edition} />
                </button>

                <div className="flex-1 min-w-[8px]" />

                <span className="hidden lg:block font-mono text-[11px] text-gray-300 group-hover:text-gray-400 truncate max-w-[200px] transition-colors">{cat.slug}</span>

                <span className="text-[12px] text-gray-400 tabular-nums w-8 text-right flex-shrink-0" title={lang === 'bn' ? 'আর্টিকেল' : 'Articles'}>{cat.articleCount || 0}</span>

                <button
                  onClick={() => handleToggleStatus(cat)}
                  title={cat.isActive ? (lang === 'bn' ? 'নিষ্ক্রিয় করুন' : 'Deactivate') : (lang === 'bn' ? 'সক্রিয় করুন' : 'Activate')}
                  className="w-6 h-6 flex items-center justify-center flex-shrink-0 rounded hover:bg-gray-100"
                >
                  <span className={`w-2 h-2 rounded-full ${cat.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                </button>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex-shrink-0">
                  {isMain && (
                    <button onClick={() => handleToggleNav(cat)} title={cat.showInNav ? (lang === 'bn' ? 'মেনু থেকে লুকান' : 'Hide from nav') : (lang === 'bn' ? 'মেনুতে দেখান' : 'Show in nav')} className={`p-1.5 rounded-lg transition-colors ${cat.showInNav ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'}`}>
                      <Navigation size={14} />
                    </button>
                  )}
                  <button onClick={() => openEditModal(cat)} title={lang === 'bn' ? 'সম্পাদনা' : 'Edit'} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => setDeleteConfirm(cat)} title={lang === 'bn' ? 'মুছুন' : 'Delete'} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg,#ffffff)] rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold">{lang === 'bn' ? 'বিভাগ মুছে ফেলুন?' : 'Delete Category?'}</h3>
                <p className="text-xs text-[var(--text-muted,#9ca3af)]">
                  {lang === 'bn' ? 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না' : 'This action cannot be undone'}
                </p>
              </div>
            </div>
            <div className="bg-[var(--body-bg,#f0f2f8)] rounded-lg p-3 mb-4">
              <div className="text-sm font-semibold">
                {lang === 'bn' ? deleteConfirm.nameBn : (deleteConfirm.nameEn || deleteConfirm.nameBn)}
              </div>
              <div className="text-xs text-[var(--text-muted,#9ca3af)] mt-1">
                {deleteConfirm.articleCount || 0} {lang === 'bn' ? 'টি আর্টিকেল' : 'articles'}
              </div>
            </div>
            {deleteConfirm.articleCount > 0 && (
              <p className="text-xs text-red-600 mb-3">
                {lang === 'bn' ? '⚠️ বিভাগে আর্টিকেল আছে। মুছে ফেললে আর্টিকেলগুলোও মুছে যাবে।' : '⚠️ Category has articles. Deleting will also remove associated articles.'}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={submitting}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg py-2 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg,#ffffff)] rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {editingCat
                  ? (lang === 'bn' ? 'বিভাগ সম্পাদনা করুন' : 'Edit Category')
                  : (lang === 'bn' ? 'নতুন বিভাগ যোগ করুন' : 'Add New Category')}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'বাংলা নাম' : 'Bengali Name'} *</label>
                  <input
                    type="text"
                    value={catNameBn}
                    onChange={(e) => setCatNameBn(e.target.value)}
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'ইংরেজি নাম' : 'English Name'}</label>
                  <input
                    type="text"
                    value={catNameEn}
                    onChange={(e) => setCatNameEn(e.target.value)}
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'স্লাগ' : 'Slug'} *</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''))}
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-[#263238]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'এডিশন' : 'Edition'}</label>
                  <select value={catEdition} onChange={(e) => setCatEdition(e.target.value)} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238] bg-white">
                    <option value="both">Both</option>
                    <option value="bn">Bangla</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'প্রধান বিভাগ' : 'Parent Category'}</label>
                  <CategorySelect
                    value={catParentId}
                    onChange={setCatParentId}
                    topOption={{ value: '', label: lang === 'bn' ? 'কোনটিই নয় (প্রধান বিভাগ)' : 'None (Main Category)' }}
                    items={(() => {
                      const exclude = editingCat ? descendantIds(categories, editingCat.id) : new Set();
                      return categories
                        .filter(c => !exclude.has(c.id))
                        .map(c => ({ value: c.id, label: lang === 'bn' ? (c.nameBn || c.nameEn) : (c.nameEn || c.nameBn), parentValue: c.parentId || null }));
                    })()}
                    placeholder={lang === 'bn' ? 'প্রধান বিভাগ নির্বাচন করুন' : 'Select parent category'}
                    searchPlaceholder={lang === 'bn' ? 'বিভাগ খুঁজুন...' : 'Search categories...'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{lang === 'bn' ? 'রঙ' : 'Color'}</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCatColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${catColor === color ? 'scale-110 ring-2 ring-offset-2 ring-[#263238]' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'বাংলা বিবরণ' : 'BN Description'}</label>
                  <textarea
                    value={catDescBn}
                    onChange={(e) => setCatDescBn(e.target.value)}
                    rows={2}
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'ইংরেজি বিবরণ' : 'EN Description'}</label>
                  <textarea
                    value={catDescEn}
                    onChange={(e) => setCatDescEn(e.target.value)}
                    rows={2}
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-[#263238] text-white rounded-xl py-3 text-sm font-bold hover:bg-[#1a2428] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editingCat ? (lang === 'bn' ? 'আপডেট করুন' : 'Update') : (lang === 'bn' ? 'যোগ করুন' : 'Add')}
              </button>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 bg-white border border-[var(--card-border,#e8ebf4)] rounded-xl py-3 text-sm font-bold hover:bg-gray-50 transition-all text-gray-500"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function EditionBadge({ edition }) {
  // "both" is the norm — show a tag only for the single-edition exceptions.
  if (edition === 'both') return null;
  return (
    <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-semibold flex-shrink-0">
      {edition === 'bn' ? 'বাংলা' : 'EN'}
    </span>
  );
}
