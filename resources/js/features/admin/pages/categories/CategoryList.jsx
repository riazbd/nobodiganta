import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Check, Loader2, AlertTriangle, FolderTree } from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

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
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      // Transform snake_case to camelCase
      const transformed = data.map(c => ({
        id: c.id,
        parentId: c.parent_id,
        nameBn: c.name_bn || '',
        nameEn: c.name_en || '',
        slug: c.slug || '',
        edition: c.edition || 'both',
        isActive: c.is_active !== false,
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

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name_bn: catNameBn,
          name_en: catNameEn,
          slug: catSlug,
          edition: catEdition,
          parent_id: catParentId || null,
          color: catColor,
          description_bn: catDescBn,
          description_en: catDescEn,
          meta_description_bn: catMetaBn,
          meta_description_en: catMetaEn,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Server error' }));
        throw new Error(err.message || 'Request failed');
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

  const handleToggleStatus = async (cat) => {
    try {
      const res = await fetch(`/admin/categories/${cat.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
          'Accept': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to toggle status');
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
      const res = await fetch(`/admin/categories/${cat.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
          'Accept': 'application/json',
        },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        if (err?.message) throw new Error(err.message);
        if (cat.articleCount > 0) throw new Error(lang === 'bn' ? 'বিভাগে আর্টিকেল আছে, মুছে ফেলা যাবে না' : 'Cannot delete category with articles');
        throw new Error('Delete failed');
      }
      setDeleteConfirm(null);
      showToast(lang === 'bn' ? 'বিভাগ মুছে ফেলা হয়েছে' : 'Category deleted');
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      showToast(err.message || (lang === 'bn' ? 'মুছে ফেলতে ব্যর্থ' : 'Failed to delete'));
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
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{categories.length} {lang === 'bn' ? 'টি বিভাগ ও উপ-বিভাগ' : 'categories & subcategories'}</p>
        </div>
        <button onClick={openAddModal} className="bg-[#263238] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#1a2428] transition-colors">
          <Plus className="w-4 h-4" /> {lang === 'bn' ? 'নতুন বিভাগ' : 'New Category'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'নাম' : 'Name'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'স্লাগ' : 'Slug'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'আর্টিকেল' : 'Articles'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'স্টেটাস' : 'Status'}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'কাজ' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-sm text-[var(--text-muted,#9ca3af)]">
                  {lang === 'bn' ? 'কোনো বিভাগ পাওয়া যায়নি' : 'No categories found'}
                </td>
              </tr>
            ) : (
              categories
                .filter(c => !c.parentId)
                .map(mainCat => (
                  <React.Fragment key={mainCat.id}>
                    {/* Main Category Row */}
                    <tr className="hover:bg-[#fafbff] transition-colors border-l-4 border-l-transparent group">
                      <td className="px-4 py-3 border-b border-[#f3f4f6]">
                        <div className="font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: mainCat.color }} />
                          {lang === 'bn' ? (mainCat.nameBn || mainCat.nameEn) : (mainCat.nameEn || mainCat.nameBn)}
                          <EditionBadge edition={mainCat.edition} />
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] font-mono text-[var(--text-secondary,#6b7280)]">{mainCat.slug}</td>
                      <td className="px-4 py-3 border-b border-[#f3f4f6]">
                        <Badge variant="blue">{mainCat.articleCount || 0}</Badge>
                      </td>
                      <td className="px-4 py-3 border-b border-[#f3f4f6]">
                        <StatusButton cat={mainCat} onToggle={handleToggleStatus} />
                      </td>
                      <td className="px-4 py-3 border-b border-[#f3f4f6]">
                        <ActionButtons onEdit={() => openEditModal(mainCat)} onDelete={() => setDeleteConfirm(mainCat)} />
                      </td>
                    </tr>

                    {/* Subcategories */}
                    {categories
                      .filter(sub => sub.parentId === mainCat.id)
                      .map(subCat => (
                        <tr key={subCat.id} className="hover:bg-[#fafbff] transition-colors bg-gray-50/20">
                          <td className="px-4 py-3 border-b border-[#f3f4f6] pl-10">
                            <div className="flex items-center gap-2 text-[var(--text-primary,#1a1d2e)]">
                              <span className="text-gray-300">↳</span>
                              <span className="text-[13px] font-semibold">{lang === 'bn' ? (subCat.nameBn || subCat.nameEn) : (subCat.nameEn || subCat.nameBn)}</span>
                              <EditionBadge edition={subCat.edition} />
                            </div>
                          </td>
                          <td className="px-4 py-3 border-b border-[#f3f4f6] text-[11px] font-mono text-gray-400">{subCat.slug}</td>
                          <td className="px-4 py-3 border-b border-[#f3f4f6]">
                            <Badge variant="gray" className="text-[10px] scale-90 opacity-70">{subCat.articleCount || 0}</Badge>
                          </td>
                          <td className="px-4 py-3 border-b border-[#f3f4f6]">
                            <StatusButton cat={subCat} onToggle={handleToggleStatus} size="sm" />
                          </td>
                          <td className="px-4 py-3 border-b border-[#f3f4f6]">
                            <ActionButtons onEdit={() => openEditModal(subCat)} onDelete={() => setDeleteConfirm(subCat)} size="sm" />
                          </td>
                        </tr>
                      ))
                    }
                  </React.Fragment>
                ))
            )}
          </tbody>
        </table>
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
                  <select 
                    value={catParentId} 
                    onChange={(e) => setCatParentId(e.target.value)} 
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238] bg-white"
                  >
                    <option value="">{lang === 'bn' ? 'কোনটিই নয় (প্রধান)' : 'None (Main Category)'}</option>
                    {categories
                      .filter(c => !editingCat || c.id !== editingCat.id)
                      .map(c => {
                        const name = lang === 'bn' ? c.nameBn : (c.nameEn || c.nameBn);
                        return (
                          <option key={c.id} value={c.id}>
                            {c.parentId ? `↳ ${name}` : name}
                          </option>
                        );
                      })
                    }
                  </select>
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
  if (edition === 'both') return <span className="text-[9px] px-1.5 py-0.5 bg-[#ecfdf5] text-[#10b981] rounded-full font-black uppercase ml-1">Both</span>;
  if (edition === 'bn') return <span className="text-[9px] px-1.5 py-0.5 bg-[#eceff1] text-[#263238] rounded-full font-black uppercase ml-1">বাংলা</span>;
  return <span className="text-[9px] px-1.5 py-0.5 bg-[#eff6ff] text-[#3b82f6] rounded-full font-black uppercase ml-1">EN</span>;
}

function StatusButton({ cat, onToggle, size = 'md' }) {
  return (
    <button
      onClick={() => onToggle(cat)}
      className={`font-bold rounded-full transition-all active:scale-95 ${size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-3 py-1'} ${
        cat.isActive
          ? 'bg-green-50 text-green-600 hover:bg-green-100'
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
      }`}
    >
      {cat.isActive ? 'Active' : 'Inactive'}
    </button>
  );
}

function ActionButtons({ onEdit, onDelete, size = 'md' }) {
  const iconSize = size === 'sm' ? 14 : 16;
  return (
    <div className="flex items-center gap-1">
      <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
        <Edit3 size={iconSize} />
      </button>
      <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500">
        <Trash2 size={iconSize} />
      </button>
    </div>
  );
}
