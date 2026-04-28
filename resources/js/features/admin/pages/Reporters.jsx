import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Edit3, Trash2, Mail, Phone, Search, X, 
  Globe, User, SortAsc, 
  Image as ImageIcon, Save, CheckCircle
} from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { router } from '@inertiajs/react';
import MediaLibraryModal from '../components/media/MediaLibraryModal';
import Icon from '../../../Components/Icon';

export default function Reporters({ reporters = [], filters = {} }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showModal, setShowModal] = useState(false);
  const [editingReporter, setEditingReporter] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nameBn: '',
    nameEn: '',
    email: '',
    designationBn: '',
    designationEn: '',
    bioBn: '',
    bioEn: '',
    phone: '',
    image: '',
    isFeatured: false,
    sortOrder: 0,
    facebook: '',
    twitter: '',
    linkedin: '',
    status: 'active',
  });

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.reporters'), { search: searchQuery }, { preserveState: true });
  };

  const openAddModal = () => {
    setEditingReporter(null);
    setFormData({
      nameBn: '',
      nameEn: '',
      email: '',
      designationBn: '',
      designationEn: '',
      bioBn: '',
      bioEn: '',
      phone: '',
      image: '',
      isFeatured: false,
      sortOrder: 0,
      facebook: '',
      twitter: '',
      linkedin: '',
      status: 'active',
    });
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
      facebook: reporter.social_links?.facebook || '',
      twitter: reporter.social_links?.twitter || '',
      linkedin: reporter.social_links?.linkedin || '',
      status: reporter.status || 'active',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.nameBn || !formData.nameEn) {
      showToast(lang === 'bn' ? 'নাম প্রয়োজন!' : 'Name required!');
      return;
    }

    const payload = {
      ...formData,
      socialLinks: {
        facebook: formData.facebook,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
      }
    };

    if (editingReporter) {
      router.put(route('admin.reporters.update', editingReporter.id), payload, {
        onSuccess: () => {
          setShowModal(false);
          showToast(lang === 'bn' ? 'সাংবাদিক হালনাগাদ হয়েছে' : 'Reporter updated');
        }
      });
    } else {
      router.post(route('admin.reporters.store'), payload, {
        onSuccess: () => {
          setShowModal(false);
          showToast(lang === 'bn' ? 'সাংবাদিক যোগ হয়েছে' : 'Reporter added');
        }
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      router.delete(route('admin.reporters.destroy', id), {
        onSuccess: () => showToast(lang === 'bn' ? 'সাংবাদিক মুছে ফেলা হয়েছে' : 'Reporter deleted')
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali'] flex items-center gap-3">
            <Users className="w-7 h-7 text-[#e8001e]" /> 
            {lang === 'bn' ? 'সাংবাদিক ও লেখক ব্যবস্থাপনা' : 'Reporters & Writers Management'}
          </h1>
          <p className="text-sm text-[var(--text-muted,#9ca3af)] mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
            {reporters.length} {lang === 'bn' ? 'জন সাংবাদিক নিবন্ধিত আছে' : 'reporters registered in the system'}
          </p>
        </div>
        <button onClick={openAddModal} className="bg-[#e8001e] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#b8001a] transition-all shadow-lg hover:shadow-red-200 active:scale-95">
          <UserPlus className="w-4.5 h-4.5" /> {lang === 'bn' ? 'নতুন সাংবাদিক' : 'Add Reporter'}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 gap-3 w-full max-w-md shadow-sm focus-within:border-[#e8001e] focus-within:ring-4 focus-within:ring-red-50 transition-all">
          <Search className="w-4.5 h-4.5 text-gray-400" />
          <input 
            type="text" 
            placeholder={lang === 'bn' ? 'নাম বা ইমেইল দিয়ে খুঁজুন...' : 'Search by name or email...'} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="border-none bg-transparent outline-none text-sm w-full focus:ring-0 placeholder:text-gray-400" 
          />
          {searchQuery && (
            <button type="button" onClick={() => { setSearchQuery(''); router.get(route('admin.reporters')); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2">
           <Badge variant="gray" className="py-1.5 px-3 rounded-lg border border-gray-100 bg-white text-gray-600">
             {lang === 'bn' ? 'সর্টিং: ডিফল্ট' : 'Sorting: Default'}
           </Badge>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'সাংবাদিক' : 'Reporter'}</th>
                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-6 py-4 border-b border-gray-100 text-left">{lang === 'bn' ? 'পদবী' : 'Designation'}</th>
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
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e8001e] to-[#ff6b6b] flex items-center justify-center text-white text-lg font-bold shadow-md ring-2 ring-white">
                            {r.avatar}
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${r.status === 'active' ? 'bg-[#10b981]' : 'bg-gray-300'}`}></div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-[#e8001e] transition-colors flex items-center gap-2">
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
                      {lang === 'bn' ? (r.designation || 'নির্ধারিত নয়') : (r.designationEn || 'Not set')}
                    </div>
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
                        <Mail className="w-3.5 h-3.5 text-[#e8001e]" /> 
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
                      <button 
                        onClick={() => openEditModal(r)} 
                        className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                        title={lang === 'bn' ? 'সম্পাদনা' : 'Edit'}
                      >
                        <Edit3 className="w-4.5 h-4.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)} 
                        className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-[#e8001e] transition-all"
                        title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                      >
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
                      <h3 className="text-sm font-bold text-gray-900">{lang === 'bn' ? 'কোন সাংবাদিক পাওয়া যায়নি' : 'No reporters found'}</h3>
                      <p className="text-xs text-gray-400 mt-1">{lang === 'bn' ? 'অনুগ্রহ করে নতুন সাংবাদিক যুক্ত করুন বা অন্যভাবে খুঁজুন।' : 'Please add a new reporter or try a different search query.'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl my-8 transform transition-all animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                  {editingReporter ? <Edit3 className="w-5 h-5 text-blue-600" /> : <UserPlus className="w-5 h-5 text-[#e8001e]" />}
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
                {/* Left Column: Image & Basic */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">{lang === 'bn' ? 'প্রোফাইল ছবি' : 'Profile Image'}</label>
                    <div 
                      onClick={() => setShowMediaLibrary(true)}
                      className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#e8001e]/30 hover:bg-red-50/20 transition-all overflow-hidden group relative"
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
                          <ImageIcon className="w-10 h-10 text-gray-300 group-hover:text-[#e8001e] mb-2 transition-colors" />
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
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none" placeholder="example@mail.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                        <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none" placeholder="+880..." />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Name, Bio, Links */}
                <div className="md:col-span-2 space-y-6">
                  {/* Names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'} *</label>
                      <input type="text" value={formData.nameBn} onChange={e => setFormData({...formData, nameBn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'নাম (ইংরেজি)' : 'Name (English)'} *</label>
                      <input type="text" value={formData.nameEn} onChange={e => setFormData({...formData, nameEn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none" />
                    </div>
                  </div>

                  {/* Designations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'পদবী (বাংলা)' : 'Designation (Bangla)'}</label>
                      <input type="text" value={formData.designationBn} onChange={e => setFormData({...formData, designationBn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'পদবী (ইংরেজি)' : 'Designation (English)'}</label>
                      <input type="text" value={formData.designationEn} onChange={e => setFormData({...formData, designationEn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none" />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">{lang === 'bn' ? 'জীবনী (বাংলা)' : 'Bio (Bangla)'}</label>
                    <textarea rows="2" value={formData.bioBn} onChange={e => setFormData({...formData, bioBn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-4 focus:ring-[#e8001e]/5 focus:border-[#e8001e] transition-all outline-none resize-none" />
                  </div>

                  {/* Social Links */}
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

                  {/* Settings */}
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 text-[#e8001e] focus:ring-[#e8001e] border-gray-300 rounded" />
                      <span className="text-sm font-bold text-gray-700 group-hover:text-[#e8001e] transition-colors">{lang === 'bn' ? 'সেরা সাংবাদিক' : 'Feature Reporter'}</span>
                    </label>
                    <div className="flex items-center gap-3">
                       <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'bn' ? 'ক্রম' : 'Order'}</label>
                       <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-center text-xs outline-none focus:border-[#e8001e]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-10">
                <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-[#e8001e] to-[#ff4d4d] text-white rounded-2xl py-4 text-base font-bold hover:shadow-xl hover:shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2">
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
