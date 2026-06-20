import { useState } from 'react';
import {
  Users, UserPlus, Edit3, Trash2, Mail, Phone, Search, X,
  MapPin, ChevronDown,
  Image as ImageIcon, Save, CheckCircle
} from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { router } from '@inertiajs/react';
import MediaLibraryModal from '../components/media/MediaLibraryModal';
import Icon from '../../../Components/Icon';

export default function Reporters({ reporters = [], districts = [], divisions = [], filters = {} }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [activeDistrict, setActiveDistrict] = useState(filters.district_id || '');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingReporter, setEditingReporter] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const emptyForm = {
    nameBn: '', nameEn: '', email: '',
    designationBn: '', designationEn: '',
    bioBn: '', bioEn: '',
    phone: '', image: '',
    isFeatured: false, sortOrder: 0,
    divisionId: '', districtId: '',
    facebook: '', twitter: '', linkedin: '',
    status: 'active',
    createLogin: false, password: '', password_confirmation: '',
  };

  const [formData, setFormData] = useState(emptyForm);

  const applyFilters = (search, districtId) => {
    const params = {};
    if (search) params.search = search;
    if (districtId) params.district_id = districtId;
    router.get(route('admin.reporters'), params, { preserveState: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters(searchQuery, activeDistrict);
  };

  const handleDistrictFilter = (districtId) => {
    setActiveDistrict(districtId);
    setShowDistrictDropdown(false);
    applyFilters(searchQuery, districtId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveDistrict('');
    router.get(route('admin.reporters'));
  };

  const openAddModal = () => {
    setEditingReporter(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (reporter) => {
    setEditingReporter(reporter);
    setFormData({
      nameBn: reporter.name || '',
      nameEn: reporter.nameEn || '',
      email: reporter.email || '',
      designationBn: reporter.designation || '',
      designationEn: reporter.designationEn || '',
      bioBn: reporter.bio || '',
      bioEn: reporter.bioEn || '',
      phone: reporter.phone || '',
      image: reporter.image || '',
      isFeatured: reporter.is_featured || false,
      sortOrder: reporter.sort_order || 0,
      divisionId: districts.find(d => d.id == reporter.district_id)?.division_id || '',
      districtId: reporter.district_id || '',
      facebook: reporter.social_links?.facebook || '',
      twitter: reporter.social_links?.twitter || '',
      linkedin: reporter.social_links?.linkedin || '',
      status: reporter.status || 'active',
      createLogin: false,
      password: '',
      password_confirmation: '',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.nameBn || !formData.nameEn) {
      showToast(lang === 'bn' ? 'নাম প্রয়োজন!' : 'Name required!', 'error');
      return;
    }
    if (formData.createLogin) {
      if (!formData.email) {
        showToast(lang === 'bn' ? 'লগইন অ্যাকাউন্টের জন্য ইমেইল প্রয়োজন!' : 'Email is required to create a login account!', 'error');
        return;
      }
      if (!editingReporter || formData.password) {
        if (formData.password.length < 8) {
          showToast(lang === 'bn' ? 'পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে!' : 'Password must be at least 8 characters!', 'error');
          return;
        }
        if (formData.password !== formData.password_confirmation) {
          showToast(lang === 'bn' ? 'পাসওয়ার্ড মেলেনি!' : 'Passwords do not match!', 'error');
          return;
        }
      }
    }

    const payload = {
      ...formData,
      socialLinks: { facebook: formData.facebook, twitter: formData.twitter, linkedin: formData.linkedin },
    };

    if (editingReporter) {
      router.put(route('admin.reporters.update', editingReporter.id), payload, {
        onSuccess: () => { setShowModal(false); showToast(lang === 'bn' ? 'সাংবাদিক হালনাগাদ হয়েছে' : 'Reporter updated'); },
        onError: (errors) => showToast(Object.values(errors)[0], 'error'),
      });
    } else {
      router.post(route('admin.reporters.store'), payload, {
        onSuccess: () => { setShowModal(false); showToast(lang === 'bn' ? 'সাংবাদিক যোগ হয়েছে' : 'Reporter added'); },
        onError: (errors) => showToast(Object.values(errors)[0], 'error'),
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      router.delete(route('admin.reporters.destroy', id), {
        onSuccess: () => showToast(lang === 'bn' ? 'সাংবাদিক মুছে ফেলা হয়েছে' : 'Reporter deleted'),
      });
    }
  };

  const activeDistrictName = activeDistrict
    ? (districts.find(d => d.id == activeDistrict)?.[lang === 'bn' ? 'name_bn' : 'name_en'] || '')
    : '';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali'] flex items-center gap-3">
            <Users className="w-7 h-7 text-[#263238]" />
            {lang === 'bn' ? 'সাংবাদিক ও লেখক ব্যবস্থাপনা' : 'Reporters & Writers Management'}
          </h1>
          <p className="text-sm text-[var(--text-muted,#9ca3af)] mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            {reporters.length} {lang === 'bn' ? 'জন সাংবাদিক নিবন্ধিত আছে' : 'reporters registered in the system'}
          </p>
        </div>
        <button onClick={openAddModal} className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow-lg hover:shadow-red-200 active:scale-95">
          <UserPlus className="w-4.5 h-4.5" /> {lang === 'bn' ? 'নতুন সাংবাদিক' : 'Add Reporter'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 gap-3 w-full max-w-md shadow-sm focus-within:border-[#263238] focus-within:ring-4 focus-within:ring-red-50 transition-all">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'নাম বা ইমেইল দিয়ে খুঁজুন...' : 'Search by name or email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none bg-transparent outline-none text-sm w-full focus:ring-0 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button type="button" onClick={() => { setSearchQuery(''); applyFilters('', activeDistrict); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* District filter */}
        <div className="relative">
          <button
            onClick={() => setShowDistrictDropdown(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm ${activeDistrict ? 'bg-[#263238] text-white border-[#263238]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#263238]'}`}
          >
            <MapPin className="w-4 h-4" />
            {activeDistrict ? activeDistrictName : (lang === 'bn' ? 'সব জেলা' : 'All Districts')}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDistrictDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDistrictDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDistrictDropdown(false)} />
              <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl w-56 max-h-72 overflow-y-auto py-2">
                <button
                  onClick={() => handleDistrictFilter('')}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50 ${!activeDistrict ? 'text-[#263238] bg-red-50/50' : 'text-gray-700'}`}
                >
                  {lang === 'bn' ? 'সব জেলা' : 'All Districts'}
                </button>
                <div className="border-t border-gray-100 my-1" />
                {districts.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleDistrictFilter(d.id)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between ${activeDistrict == d.id ? 'text-[#263238] font-bold bg-red-50/50' : 'text-gray-700'}`}
                  >
                    <span>{lang === 'bn' ? d.name_bn : d.name_en}</span>
                    {activeDistrict == d.id && <CheckCircle className="w-3.5 h-3.5 text-[#263238]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {(activeDistrict || searchQuery) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-500 hover:text-red-500 hover:border-red-200 transition-all"
          >
            <X className="w-3.5 h-3.5" /> {lang === 'bn' ? 'ফিল্টার মুছুন' : 'Clear filters'}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'সাংবাদিক' : 'Reporter'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'পদবী / জেলা' : 'Designation / District'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-center">{lang === 'bn' ? 'নিবন্ধ' : 'Articles'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'যোগাযোগ' : 'Contact'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-right">{lang === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reporters.length > 0 ? reporters.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        {r.image ? (
                          <img src={r.image} alt={r.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#263238] to-[#ff6b6b] flex items-center justify-center text-white text-lg font-bold shadow-md ring-2 ring-white">
                            {r.avatar}
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${r.status === 'active' ? 'bg-[#10b981]' : 'bg-gray-300'}`}></div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-[#263238] transition-colors flex items-center gap-2">
                          {lang === 'bn' ? r.name : r.nameEn}
                          {r.is_featured && <Badge variant="blue" className="text-[9px] px-1 py-0 uppercase">Staff</Badge>}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                          <span>ID: #{r.id}</span>
                          <span>•</span>
                          <span>{lang === 'bn' ? 'যোগদান:' : 'Joined:'} {r.joined}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[13px] font-semibold text-gray-700">
                      {lang === 'bn' ? (r.designation || 'নির্ধারিত নয়') : (r.designationEn || 'Not set')}
                    </div>
                    {r.district && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-[#263238]" />
                        <span className="text-[11px] text-[#263238] font-semibold">
                          {lang === 'bn' ? r.district.name_bn : r.district.name_en}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-1.5 mt-1.5">
                      {r.social_links?.facebook && <Icon name="facebook" size={14} className="text-gray-300" />}
                      {r.social_links?.twitter && <Icon name="twitter" size={14} className="text-gray-300" />}
                      {r.social_links?.linkedin && <Icon name="linkedin" size={14} className="text-gray-300" />}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex flex-col items-center justify-center min-w-[50px] h-11 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[14px] font-bold font-['Inter'] text-gray-900 leading-none">{r.articles}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{lang === 'bn' ? 'টি' : 'Posts'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[12px] text-gray-500 font-medium group-hover:text-gray-900 transition-colors">
                        <Mail className="w-3.5 h-3.5 text-[#263238]" />
                        {r.email || '—'}
                      </div>
                      {r.phone && (
                        <div className="flex items-center gap-2 text-[12px] text-gray-400 font-medium group-hover:text-gray-900 transition-colors">
                          <Phone className="w-3.5 h-3.5 text-gray-300" />
                          {r.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => openEditModal(r)} className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all" title={lang === 'bn' ? 'সম্পাদনা' : 'Edit'}>
                        <Edit3 className="w-4.5 h-4.5" />
                      </button>
                      <button onClick={() => handleDelete(r.id)} className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-[#263238] transition-all" title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}>
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center bg-gray-50/30">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">{lang === 'bn' ? 'কোন সাংবাদিক পাওয়া যায়নি' : 'No reporters found'}</h3>
                      <p className="text-xs text-gray-400 mt-1">{lang === 'bn' ? 'অনুগ্রহ করে নতুন সাংবাদিক যুক্ত করুন বা অন্যভাবে খুঁজুন।' : 'Please add a new reporter or try a different search query.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 transform transition-all animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                  {editingReporter ? <Edit3 className="w-5 h-5 text-blue-600" /> : <UserPlus className="w-5 h-5 text-[#263238]" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingReporter
                      ? (lang === 'bn' ? 'সাংবাদিক তথ্য সম্পাদনা' : 'Edit Reporter')
                      : (lang === 'bn' ? 'নতুন সাংবাদিক যুক্ত করুন' : 'Add New Reporter')}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Fill in the details for the public reporter profile.</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-gray-400 hover:text-gray-900">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">{lang === 'bn' ? 'প্রোফাইল ছবি' : 'Profile Image'}</label>
                    <div
                      onClick={() => setShowMediaLibrary(true)}
                      className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#263238]/30 hover:bg-red-50/20 transition-all overflow-hidden group relative"
                    >
                      {formData.image ? (
                        <>
                          <img src={formData.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-10 h-10 text-gray-300 group-hover:text-[#263238] mb-2 transition-colors" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{lang === 'bn' ? 'ছবি আপলোড' : 'Upload'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none" placeholder="example@mail.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none" placeholder="+880..." />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-2 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'} *</label>
                      <input type="text" value={formData.nameBn} onChange={e => setFormData({...formData, nameBn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'} *</label>
                      <input type="text" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'পদবী (বাংলা)' : 'Designation (Bangla)'}</label>
                      <input type="text" value={formData.designationBn} onChange={e => setFormData({...formData, designationBn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'পদবী (ইংরেজি)' : 'Designation (English)'}</label>
                      <input type="text" value={formData.designationEn} onChange={e => setFormData({...formData, designationEn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none" />
                    </div>
                  </div>

                  {/* Division → District selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#263238]" />
                        {lang === 'bn' ? 'বিভাগ' : 'Division'}
                      </label>
                      <select
                        value={formData.divisionId}
                        onChange={e => setFormData({...formData, divisionId: e.target.value, districtId: ''})}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none bg-white"
                      >
                        <option value="">{lang === 'bn' ? '— বিভাগ বাছুন —' : '— Select Division —'}</option>
                        {divisions.map(dv => (
                          <option key={dv.id} value={dv.id}>
                            {lang === 'bn' ? dv.name_bn : dv.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#263238]" />
                        {lang === 'bn' ? 'জেলা প্রতিনিধি' : 'District Representative'}
                      </label>
                      <select
                        value={formData.districtId}
                        onChange={e => setFormData({...formData, districtId: e.target.value})}
                        disabled={!formData.divisionId}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        <option value="">{lang === 'bn' ? '— জেলা বাছুন —' : '— Select District —'}</option>
                        {districts
                          .filter(d => !formData.divisionId || d.division_id == formData.divisionId)
                          .map(d => (
                            <option key={d.id} value={d.id}>
                              {lang === 'bn' ? d.name_bn : d.name_en}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'জীবনী (বাংলা)' : 'Bio (Bangla)'}</label>
                    <textarea rows="2" value={formData.bioBn} onChange={e => setFormData({...formData, bioBn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none resize-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1.5">Facebook</label>
                      <div className="relative">
                        <Icon name="facebook" size={14} className="absolute left-3 top-2.5 text-blue-600" />
                        <input type="text" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-blue-600" placeholder="https://..." />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1.5">Twitter</label>
                      <div className="relative">
                        <Icon name="twitter" size={14} className="absolute left-3 top-2.5 text-sky-500" />
                        <input type="text" value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-sky-500" placeholder="https://..." />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1.5">LinkedIn</label>
                      <div className="relative">
                        <Icon name="linkedin" size={14} className="absolute left-3 top-2.5 text-blue-700" />
                        <input type="text" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:border-blue-700" placeholder="https://..." />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 text-[#263238] focus:ring-[#263238] border-gray-300 rounded" />
                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#263238] transition-colors">{lang === 'bn' ? 'সেরা সাংবাদিক' : 'Feature Reporter'}</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'bn' ? 'ক্রম' : 'Order'}</label>
                        <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center text-xs outline-none focus:border-[#263238]" />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={formData.createLogin} onChange={e => setFormData({...formData, createLogin: e.target.checked})} className="w-4 h-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded" />
                      <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                        {editingReporter ? (lang === 'bn' ? 'লগইন পাসওয়ার্ড পরিবর্তন করুন' : 'Change Login Password') : (lang === 'bn' ? 'লগইন অ্যাকাউন্ট তৈরি করুন' : 'Create Login Account')}
                      </span>
                    </label>

                    {formData.createLogin && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'} *</label>
                          <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none" placeholder="••••••••" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">{lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'} *</label>
                          <input type="password" value={formData.password_confirmation} onChange={e => setFormData({...formData, password_confirmation: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none" placeholder="••••••••" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-[#263238] to-[#ff4d4d] text-white rounded-2xl py-4 text-base font-bold hover:shadow-xl hover:shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  {editingReporter
                    ? (lang === 'bn' ? 'তথ্য হালনাগাদ করুন' : 'Update Profile')
                    : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Profile')}
                </button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-white border border-gray-200 text-gray-600 rounded-2xl py-4 text-base font-bold hover:bg-gray-50 transition-all active:scale-95">
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={(m) => { setFormData({...formData, image: m.url}); setShowMediaLibrary(false); }}
        initialType="image"
      />
    </div>
  );
}
