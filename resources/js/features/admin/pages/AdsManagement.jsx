import { useState } from 'react';
import { Megaphone, Plus, Edit3, Trash2, ToggleLeft, ToggleRight, Eye, Search, X, Image as ImageIcon, ExternalLink, Calendar, TrendingUp, BarChart } from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { router } from '@inertiajs/react';
import MediaLibraryModal from '../components/media/MediaLibraryModal';

export default function AdsManagement({ ads = [], filters = {} }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    titleBn: '',
    titleEn: '',
    image: '',
    video_url: '',
    link: '',
    position: 'home_top',
    type: 'image',
    code: '',
    startDate: '',
    endDate: '',
    isActive: true,
    sortOrder: 0,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    router.get(route('admin.ads'), { search: searchQuery }, { preserveState: true });
  };

  const toggleStatus = (id) => {
    router.patch(route('admin.ads.toggle', id), {}, {
      onSuccess: () => showToast(lang === 'bn' ? 'অবস্থা পরিবর্তন হয়েছে' : 'Status updated')
    });
  };

  const openAddModal = () => {
    setEditingAd(null);
    setFormData({
      titleBn: '',
      titleEn: '',
      image: '',
      video_url: '',
      link: '',
      position: 'home_top',
      type: 'image',
      code: '',
      startDate: '',
      endDate: '',
      isActive: true,
      sortOrder: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setFormData({
      titleBn: ad.title || '',
      titleEn: ad.titleEn || '',
      image: ad.image || '',
      video_url: ad.video_url || '',
      link: ad.link || '',
      position: ad.position || 'home_top',
      type: ad.type || 'image',
      code: ad.code || '',
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      isActive: ad.isActive,
      sortOrder: ad.sortOrder || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.titleBn || !formData.titleEn) {
      showToast(lang === 'bn' ? 'শিরোনাম আবশ্যক' : 'Title is required');
      return;
    }

    if (editingAd) {
      router.put(route('admin.ads.update', editingAd.id), formData, {
        onSuccess: () => {
          setShowModal(false);
          showToast(lang === 'bn' ? 'বিজ্ঞাপন হালনাগাদ হয়েছে' : 'Ad updated');
        }
      });
    } else {
      router.post(route('admin.ads.store'), formData, {
        onSuccess: () => {
          setShowModal(false);
          showToast(lang === 'bn' ? 'বিজ্ঞাপন যোগ হয়েছে' : 'Ad created');
        }
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      router.delete(route('admin.ads.destroy', id), {
        onSuccess: () => showToast(lang === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Ad deleted')
      });
    }
  };

  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] flex items-center gap-3">
            <Megaphone className="w-7 h-7 text-[#e8001e]" /> 
            {lang === 'bn' ? 'বিজ্ঞাপন ব্যবস্থাপনা' : 'Ads Management'}
          </h1>
          <div className="flex items-center gap-4 mt-2">
             <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase">
                <TrendingUp size={14} className="text-green-500" />
                {lang === 'bn' ? 'মোট ইমপ্রেশন:' : 'Total Impressions:'} {totalImpressions.toLocaleString()}
             </div>
             <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase">
                <BarChart size={14} className="text-blue-500" />
                {lang === 'bn' ? 'মোট ক্লিক:' : 'Total Clicks:'} {totalClicks.toLocaleString()}
             </div>
          </div>
        </div>
        <button onClick={openAddModal} className="bg-[#e8001e] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#b8001a] transition-all shadow-lg active:scale-95">
          <Plus className="w-4.5 h-4.5" /> {lang === 'bn' ? 'নতুন বিজ্ঞাপন' : 'New Ad'}
        </button>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 gap-3 w-full max-w-md shadow-sm focus-within:border-[#e8001e] focus-within:ring-4 focus-within:ring-red-50 transition-all">
          <Search className="w-4.5 h-4.5 text-gray-400" />
          <input 
            type="text" 
            placeholder={lang === 'bn' ? 'বিজ্ঞাপন খুঁজুন...' : 'Search ads...'} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="border-none bg-transparent outline-none text-sm w-full focus:ring-0 placeholder:text-gray-400" 
          />
          {searchQuery && <button type="button" onClick={() => { setSearchQuery(''); router.get(route('admin.ads')); }}><X size={16} className="text-gray-400" /></button>}
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {ads.length > 0 ? ads.map(ad => (
          <div key={ad.id} className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all group ${!ad.isActive ? 'opacity-70 bg-gray-50/50' : 'border-gray-100 hover:border-red-100 hover:shadow-md'}`}>
            <div className="flex flex-col md:flex-row">
              {/* Ad Preview Area */}
              <div className="w-full md:w-48 h-32 bg-gray-100 flex-shrink-0 relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-50">
                {ad.image ? (
                  <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <ImageIcon size={24} />
                    <span className="text-[10px] font-bold uppercase">{ad.type}</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                   <Badge variant={ad.isActive ? 'green' : 'gray'} className="text-[9px] px-1.5 py-0">
                     {ad.isActive ? 'ACTIVE' : 'INACTIVE'}
                   </Badge>
                </div>
              </div>

              {/* Ad Info Area */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#e8001e] transition-colors">{lang === 'bn' ? ad.title : ad.titleEn}</h3>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter mt-1 flex items-center gap-2">
                       <span className="text-[#e8001e]">{ad.position}</span>
                       {ad.link && (
                         <a href={ad.link} target="_blank" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            <ExternalLink size={10} /> Link
                         </a>
                       )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <div className="text-sm font-bold text-gray-900 font-Inter">{ad.impressions.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase">{lang === 'bn' ? 'ইমপ্রেশন' : 'Impressions'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <div className="text-sm font-bold text-gray-900 font-Inter">{ad.clicks.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase">{lang === 'bn' ? 'ক্লিক' : 'Clicks'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <div className="text-sm font-bold text-[#e8001e] font-Inter">{ad.ctr}%</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase">CTR</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                     <Calendar size={12} />
                     {ad.startDate || 'No start'} — {ad.endDate || 'No end'}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleStatus(ad.id)} className={`p-2 rounded-lg transition-colors ${ad.isActive ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                       {ad.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => openEditModal(ad)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(ad.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <Megaphone size={48} className="mx-auto mb-4 opacity-10" />
            <h3 className="text-gray-900 font-bold">No ads found</h3>
            <p className="text-sm text-gray-400 mt-1">Add your first advertisement to start tracking revenue.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 transform transition-all animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <Megaphone className="text-[#e8001e]" size={22} />
                 {editingAd ? (lang === 'bn' ? 'বিজ্ঞাপন সম্পাদনা' : 'Edit Ad') : (lang === 'bn' ? 'নতুন বিজ্ঞাপন যোগ' : 'Add New Ad')}
               </h3>
               <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'} *</label>
                    <input type="text" value={formData.titleBn} onChange={e => setFormData({...formData, titleBn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'} *</label>
                    <input type="text" value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'অবস্থান' : 'Position'}</label>
                    <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]">
                       <option value="header">Header</option>
                       <option value="home_top">Home Top</option>
                       <option value="between_sections">Between Sections</option>
                       <option value="sidebar_top">Sidebar Top</option>
                       <option value="sidebar_middle">Sidebar Middle</option>
                       <option value="category_middle">Category Middle</option>
                       <option value="article_bottom">Article Bottom</option>
                       <option value="home_bottom">Home Bottom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'টাইপ' : 'Type'}</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]">
                       <option value="image">Image Banner</option>
                       <option value="google_ad">Google AdSense</option>
                       <option value="video">Video Ad</option>
                       <option value="script">Javascript / Script</option>
                       <option value="html">Custom HTML</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'ক্রম' : 'Order'}</label>
                    <input type="number" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
               </div>

               {formData.type === 'image' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'ব্যানার ছবি' : 'Banner Image'}</label>
                      <div onClick={() => setShowMediaLibrary(true)} className="w-full h-14 border border-gray-200 border-dashed rounded-xl flex items-center px-4 gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <ImageIcon size={18} className="text-gray-400" />
                        <span className="text-xs text-gray-500 truncate">{formData.image || 'Choose from media library...'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'লিঙ্ক' : 'Link'}</label>
                      <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" placeholder="https://..." />
                    </div>
                 </div>
               )}

               {formData.type === 'video' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'পোস্টার ছবি' : 'Poster Image'}</label>
                      <div onClick={() => setShowMediaLibrary(true)} className="w-full h-14 border border-gray-200 border-dashed rounded-xl flex items-center px-4 gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <ImageIcon size={18} className="text-gray-400" />
                        <span className="text-xs text-gray-500 truncate">{formData.image || 'Choose from media library...'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'ভিডিও লিঙ্ক (MP4/YouTube)' : 'Video URL'} *</label>
                      <input type="url" value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" placeholder="https://..." required />
                    </div>
                 </div>
               )}

               {(formData.type === 'html' || formData.type === 'google_ad' || formData.type === 'script') && (
                 <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'কোড' : 'Ad Code / HTML / JS'}</label>
                    <textarea rows="6" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e] font-mono" placeholder={formData.type === 'script' ? '<script>\n  // Your JS code here\n</script>' : '<div class="my-ad">...</div>'} />
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'শুরু তারিখ' : 'Start Date'}</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'শেষ তারিখ' : 'End Date'}</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#e8001e]" />
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={handleSubmit} className="flex-1 bg-[#e8001e] text-white rounded-2xl py-4 text-base font-bold shadow-lg shadow-red-100 transition-all hover:bg-[#b8001a] active:scale-95">
                    {editingAd ? (lang === 'bn' ? 'হালনাগাদ করুন' : 'Update Ad') : (lang === 'bn' ? 'বিজ্ঞাপন সংরক্ষণ করুন' : 'Save Ad')}
                  </button>
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-50 text-gray-600 rounded-2xl py-4 text-base font-bold transition-all hover:bg-gray-100 active:scale-95">
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
