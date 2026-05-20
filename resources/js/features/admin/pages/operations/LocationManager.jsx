import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Check, Loader2, AlertTriangle, ChevronDown, MapPin } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';

export default function LocationManager({ divisions: initialDivisions }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();

  const [divisions, setDivisions] = useState(initialDivisions || []);
  const [loading, setLoading] = useState(false);
  const [expandedDiv, setExpandedDiv] = useState(null);
  const [expandedDist, setExpandedDist] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('division'); // division | district | upazila
  const [editingItem, setEditingItem] = useState(null);
  const [parentDiv, setParentDiv] = useState(null);
  const [parentDist, setParentDist] = useState(null);

  // Form state
  const [formSlug, setFormSlug] = useState('');
  const [formBn, setFormBn] = useState('');
  const [formEn, setFormEn] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setFormSlug('');
    setFormBn('');
    setFormEn('');
    setEditingItem(null);
    setParentDiv(null);
    setParentDist(null);
  };

  const openAdd = (type, pDiv = null, pDist = null) => {
    resetForm();
    setModalType(type);
    setParentDiv(pDiv);
    setParentDist(pDist);
    setShowModal(true);
  };

  const openEdit = (item, type, pDiv = null, pDist = null) => {
    setModalType(type);
    setEditingItem(item);
    setParentDiv(pDiv);
    setParentDist(pDist);
    setFormSlug(item.slug || '');
    setFormBn(item.name_bn || '');
    setFormEn(item.name_en || '');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let url, method;

      if (editingItem) {
        if (modalType === 'division') {
          url = `/admin/locations/divisions/${editingItem.id}`;
          method = 'put';
        } else if (modalType === 'district') {
          url = `/admin/locations/districts/${editingItem.id}`;
          method = 'put';
        } else {
          url = `/admin/locations/upazilas/${editingItem.id}`;
          method = 'put';
        }
      } else {
        if (modalType === 'division') {
          url = '/admin/locations/divisions';
          method = 'post';
        } else if (modalType === 'district') {
          url = '/admin/locations/districts';
          method = 'post';
        } else {
          url = '/admin/locations/upazilas';
          method = 'post';
        }
      }

      const payload = { slug: formSlug, name_bn: formBn, name_en: formEn };
      if (modalType === 'district') {
        payload.division_id = editingItem ? editingItem.division_id : parentDiv?.id;
      } else if (modalType === 'upazila') {
        payload.district_id = editingItem ? editingItem.district_id : parentDist?.id;
      }

      await window.axios[method](url, payload);
      showToast(lang === 'bn' ? 'সংরক্ষিত হয়েছে' : 'Saved successfully');
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'ত্রুটি হয়েছে' : 'An error occurred');
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item, type) => {
    if (!confirm(lang === 'bn' ? 'নিশ্চিতভাবে মুছতে চান?' : 'Are you sure you want to delete?')) return;

    try {
      let url;
      if (type === 'division') url = `/admin/locations/divisions/${item.id}`;
      else if (type === 'district') url = `/admin/locations/districts/${item.id}`;
      else url = `/admin/locations/upazilas/${item.id}`;

      await window.axios.delete(url);
      showToast(lang === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted successfully');
      window.location.reload();
    } catch (err) {
      const msg = err.response?.data?.message || (lang === 'bn' ? 'ত্রুটি হয়েছে' : 'An error occurred');
      showToast(msg);
    }
  };

  const t = (bn, en) => lang === 'bn' ? bn : en;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('অবস্থান ব্যবস্থাপনা', 'Location Management')}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('বিভাগ, জেলা ও উপজেলা ব্যবস্থাপনা', 'Manage divisions, districts, and upazilas')}
          </p>
        </div>
        <button
          onClick={() => openAdd('division')}
          className="flex items-center gap-1.5 bg-[#263238] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#37474f] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('নতুন বিভাগ', 'Add Division')}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {divisions.map(div => (
          <div key={div.id} className="border-b border-gray-100 last:border-b-0">
            {/* Division row */}
            <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <button
                onClick={() => setExpandedDiv(expandedDiv === div.id ? null : div.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedDiv === div.id ? 'rotate-0' : '-rotate-90'}`} />
              </button>
              <MapPin className="w-4 h-4 text-[#263238] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-gray-900">{div.name_bn}</span>
                <span className="text-gray-400 mx-1.5">/</span>
                <span className="text-gray-600">{div.name_en}</span>
                <span className="text-gray-400 text-xs ml-2">({div.slug})</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{div.districts_count || 0} {t('জেলা', 'districts')}</span>
                <span className={`font-semibold ${div.article_count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                  {div.article_count} {t('নিবন্ধ', 'articles')}
                </span>
              </div>
              <button onClick={() => openAdd('district', div)} className="text-gray-400 hover:text-blue-600 p-1" title={t('জেলা যোগ', 'Add district')}>
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => openEdit(div, 'division')} className="text-gray-400 hover:text-amber-600 p-1" title={t('সম্পাদনা', 'Edit')}>
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(div, 'division')} className="text-gray-400 hover:text-red-600 p-1" title={t('মুছুন', 'Delete')}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Districts */}
            {expandedDiv === div.id && (
              <div className="bg-gray-50 pl-12">
                {div.districts?.map(dist => (
                  <div key={dist.id}>
                    <div className="flex items-center gap-3 px-5 py-2.5 border-t border-gray-100 hover:bg-white transition-colors">
                      <button
                        onClick={() => setExpandedDist(expandedDist === dist.id ? null : dist.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedDist === dist.id ? 'rotate-0' : '-rotate-90'}`} />
                      </button>
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800">{dist.name_bn}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-sm text-gray-600">{dist.name_en}</span>
                        <span className="text-gray-400 text-xs ml-2">({dist.slug})</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{dist.upazilas_count || 0} {t('উপজেলা', 'upazilas')}</span>
                        <span className={`font-semibold ${dist.article_count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                          {dist.article_count} {t('নিবন্ধ', 'articles')}
                        </span>
                      </div>
                      <button onClick={() => openAdd('upazila', div, dist)} className="text-gray-400 hover:text-blue-600 p-1" title={t('উপজেলা যোগ', 'Add upazila')}>
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => openEdit(dist, 'district', div)} className="text-gray-400 hover:text-amber-600 p-1">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(dist, 'district')} className="text-gray-400 hover:text-red-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Upazilas */}
                    {expandedDist === dist.id && (
                      <div className="bg-white pl-16">
                        {dist.upazilas?.map(upa => (
                          <div key={upa.id} className="flex items-center gap-3 px-5 py-2 border-t border-gray-50 hover:bg-gray-50 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-gray-700">{upa.name_bn}</span>
                              <span className="text-gray-400 mx-1">/</span>
                              <span className="text-sm text-gray-500">{upa.name_en}</span>
                              <span className="text-gray-400 text-xs ml-2">({upa.slug})</span>
                            </div>
                            <span className={`text-xs font-semibold ${upa.article_count > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                              {upa.article_count} {t('নিবন্ধ', 'articles')}
                            </span>
                            <button onClick={() => openEdit(upa, 'upazila', div, dist)} className="text-gray-400 hover:text-amber-600 p-1">
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleDelete(upa, 'upazila')} className="text-gray-400 hover:text-red-600 p-1">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(!dist.upazilas || dist.upazilas.length === 0) && (
                          <div className="px-5 py-3 text-xs text-gray-400 italic border-t border-gray-50">
                            {t('কোন উপজেলা নেই', 'No upazilas')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {(!div.districts || div.districts.length === 0) && (
                  <div className="px-5 py-3 text-xs text-gray-400 italic">
                    {t('কোন জেলা নেই', 'No districts')}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">
                {editingItem
                  ? (modalType === 'division' ? t('বিভাগ সম্পাদনা', 'Edit Division')
                    : modalType === 'district' ? t('জেলা সম্পাদনা', 'Edit District')
                    : t('উপজেলা সম্পাদনা', 'Edit Upazila'))
                  : (modalType === 'division' ? t('নতুন বিভাগ', 'New Division')
                    : modalType === 'district' ? t('নতুন জেলা', 'New District')
                    : t('নতুন উপজেলা', 'New Upazila'))}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                  {t('বাংলা নাম', 'Bangla Name')} *
                </label>
                <input
                  type="text"
                  value={formBn}
                  onChange={e => setFormBn(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#263238] focus:ring-1 focus:ring-[#263238]"
                  placeholder={t('বাংলায় নাম লিখুন', 'Enter Bangla name')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                  {t('ইংরেজি নাম', 'English Name')} *
                </label>
                <input
                  type="text"
                  value={formEn}
                  onChange={e => {
                    setFormEn(e.target.value);
                    if (!editingItem) setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''));
                  }}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#263238] focus:ring-1 focus:ring-[#263238]"
                  placeholder={t('ইংরেজিতে নাম লিখুন', 'Enter English name')}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Slug *</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={e => setFormSlug(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#263238] focus:ring-1 focus:ring-[#263238] font-mono"
                  placeholder="e.g. dhaka"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 bg-[#263238] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#37474f] transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingItem ? t('আপডেট', 'Update') : t('তৈরি করুন', 'Create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
