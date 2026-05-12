import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Upload, Image as ImageIcon, Trash2, Grid, List, Search, X, Plus, Copy, ExternalLink, Loader2, FileText, CheckCircle, Image } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';

export default function MediaLibraryModal({ isOpen, onClose, onSelect, initialType = '' }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  
  const [media, setMedia] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [editionFilter, setEditionFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null); // { url, name, isVideo }

  const [uploadData, setUploadData] = useState({
    edition: 'both', 
    alt_text_bn: '', alt_text_en: '', 
    caption_bn: '', caption_en: '',
    credit_bn: '', credit_en: '',
    source_link: '', license_type: 'internal'
  });

  const EDITIONS = [
    { value: 'all', label: lang === 'bn' ? 'সব সংস্করণ' : 'All Editions', color: 'gray' },
    { value: 'bn', label: lang === 'bn' ? 'বাংলা' : 'Bangla', color: 'blue' },
    { value: 'en', label: lang === 'bn' ? 'ইংরেজি' : 'English', color: 'green' },
    { value: 'both', label: lang === 'bn' ? 'দুই সংস্করণ' : 'Both', color: 'purple' },
  ];

  const TYPES = [
    { value: '', label: lang === 'bn' ? 'সব ধরন' : 'All Types' },
    { value: 'image', label: lang === 'bn' ? 'ছবি' : 'Images' },
    { value: 'video', label: lang === 'bn' ? 'ভিডিও' : 'Videos' },
  ];

  const fetchMedia = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        edition: editionFilter,
        type: typeFilter,
        search: searchQuery
      });
      const response = await window.axios.get(`/admin/api/media?${params.toString()}`);
      const data = response.data;
      setMedia(data.data || []);
      setPagination(data);
    } catch (err) {
      showToast(lang === 'bn' ? 'মিডিয়া লোড করতে সমস্যা হয়েছে' : 'Failed to load media', 'error');
    } finally {
      setLoading(false);
    }
  }, [editionFilter, typeFilter, searchQuery, lang, showToast]);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, fetchMedia]);

  const handleDelete = (id) => {
    if (confirm(lang === 'bn' ? 'এই মিডিয়া মুছে ফেলতে চান?' : 'Delete this media?')) {
      router.delete(route('admin.media.destroy', { media: id }), {
        onSuccess: () => {
          showToast(lang === 'bn' ? 'মিডিয়া মুছে ফেলা হয়েছে' : 'Media deleted');
          setSelectedItem(null);
          fetchMedia(pagination.current_page || 1);
        },
        onError: () => showToast(lang === 'bn' ? 'মুছতে সমস্যা হয়েছে' : 'Failed to delete', 'error'),
      });
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    router.put(route('admin.media.update', { media: selectedItem.id }), editData, {
      onSuccess: () => {
        showToast(lang === 'bn' ? 'মিডিয়া তথ্য আপডেট করা হয়েছে' : 'Media updated successfully');
        setIsEditing(false);
        fetchMedia(pagination.current_page || 1);
      },
      onError: () => showToast(lang === 'bn' ? 'আপডেট ব্যর্থ হয়েছে' : 'Update failed', 'error'),
    });
  };

  const startEditing = (item) => {
    setSelectedItem(item);
    setEditData({
      alt_text_bn: item.alt_text_bn || '',
      alt_text_en: item.alt_text_en || '',
      caption_bn: item.caption_bn || '',
      caption_en: item.caption_en || '',
      credit_bn: item.credit_bn || '',
      credit_en: item.credit_en || '',
      source_link: item.source_link || '',
      license_type: item.license_type || 'internal',
      edition: item.edition || 'both',
    });
    setIsEditing(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (uploadPreview?.url) URL.revokeObjectURL(uploadPreview.url);
    setUploadPreview({
      url: URL.createObjectURL(file),
      name: file.name,
      isVideo: file.type.startsWith('video/'),
    });
  };

  const closeUploadForm = () => {
    if (uploadPreview?.url) URL.revokeObjectURL(uploadPreview.url);
    setUploadPreview(null);
    setShowUploadForm(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.entries(uploadData).forEach(([key, val]) => {
        if (val !== '') formData.append(key, val);
      });

      const res = await window.axios.post('/admin/media', formData);
      const data = res.data;

      if (data.success) {
        showToast(lang === 'bn' ? 'মিডিয়া আপলোড সফল হয়েছে' : 'Media uploaded successfully');
        if (uploadPreview?.url) URL.revokeObjectURL(uploadPreview.url);
        setUploadPreview(null);
        setShowUploadForm(false);
        setUploadData({
          edition: 'both', alt_text_bn: '', alt_text_en: '',
          caption_bn: '', caption_en: '', credit_bn: '',
          credit_en: '', source_link: '', license_type: 'internal'
        });
        if (e.target.file) e.target.file.value = '';
        fetchMedia(1);
      } else {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : (data.message || (lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed'));
        showToast(errMsg, 'error');
      }
    } catch (err) {
      showToast(err.message || (lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const getEditionBadge = (edition) => {
    const ed = EDITIONS.find(e => e.value === edition);
    if (!ed || edition === 'all') return null;
    const colors = { blue: 'bg-blue-100 text-blue-700', green: 'bg-green-100 text-green-700', purple: 'bg-purple-100 text-purple-700' };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors[ed.color]}`}>{ed.label}</span>;
  };

  const asset = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return '/' + path.replace(/^\//, '');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 font-['Noto_Sans_Bengali']">
              <Image className="w-6 h-6 text-[#263238]" />
              {lang === 'bn' ? 'মিডিয়া লাইব্রেরি' : 'Media Library'}
            </h2>
            <div className="h-5 w-px bg-gray-200 mx-2 hidden sm:block"></div>
            <p className="text-sm text-gray-500 hidden sm:block">{pagination.total || 0} {lang === 'bn' ? 'টি ফাইল' : 'files found'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowUploadForm(!showUploadForm)} className="bg-[#263238] text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-[#1a2428] transition-all">
              <Upload className="w-4 h-4" /> {lang === 'bn' ? 'আপলোড' : 'Upload'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Main List Area */}
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-100">
            {/* Filters */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 gap-1">
                {EDITIONS.map((ed) => (
                  <button
                    key={ed.value}
                    onClick={() => setEditionFilter(ed.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      editionFilter === ed.value ? 'bg-white shadow-sm text-[#263238]' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {ed.label}
                  </button>
                ))}
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-[#263238]"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>

              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 gap-2 flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={lang === 'bn' ? 'মিডিয়া খুঁজুন...' : 'Search media...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-none bg-transparent outline-none text-sm w-full focus:ring-0 p-0"
                />
              </div>

              <div className="flex ml-auto border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-[#263238]' : 'text-gray-400 hover:bg-gray-50'}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-[#263238]' : 'text-gray-400 hover:bg-gray-50'}`}><List className="w-4 h-4" /></button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#263238]" />
                </div>
              ) : media.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {media.map(item => {
                      const isVid = item.mime_type?.startsWith('video/');
                      return (
                        <div
                          key={item.id}
                          className={`group relative rounded-xl overflow-hidden bg-white border cursor-pointer transition-all hover:shadow-md ${selectedItem?.id === item.id ? 'ring-2 ring-[#263238] border-transparent shadow-md' : 'border-gray-100'}`}
                          onClick={() => { setSelectedItem(item); setIsEditing(false); }}
                        >
                          {isVid ? (
                            <div className="w-full h-32 bg-gray-900 flex flex-col items-center justify-center gap-1">
                              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                              </div>
                              <span className="text-white/60 text-[10px] uppercase font-bold">{item.mime_type?.split('/')[1]}</span>
                            </div>
                          ) : (
                            <img src={item.thumbnail_url || item.url} className="w-full h-32 object-cover" />
                          )}
                          <div className="p-2 border-t border-gray-50">
                            <div className="text-[11px] font-medium text-gray-700 truncate">{item.original_name}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {media.map(item => {
                      const isVid = item.mime_type?.startsWith('video/');
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedItem?.id === item.id ? 'bg-red-50' : ''}`}
                          onClick={() => { setSelectedItem(item); setIsEditing(false); }}
                        >
                          {isVid ? (
                            <div className="w-12 h-12 rounded bg-gray-900 flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          ) : (
                            <img src={item.thumbnail_url || item.url} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                          )}
                          <div className="text-sm font-medium text-gray-700 flex-1 truncate">{item.original_name}</div>
                          {getEditionBadge(item.edition)}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 italic">Empty Library</div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 border-t border-gray-100 bg-white">
               {pagination.last_page > 1 && (
                  <div className="flex items-center justify-center gap-1.5">
                    {pagination.links?.filter(l => l.url).map((link, i) => (
                      <button
                        key={i}
                        onClick={() => fetchMedia(new URL(link.url).searchParams.get('page'))}
                        className={`px-3 py-1 rounded text-[11px] font-bold ${link.active ? 'bg-[#263238] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
               )}
            </div>
          </div>

          {/* Side Info / Editor Area */}
          <div className="w-full lg:w-80 bg-gray-50 flex flex-col min-h-0">
             {selectedItem ? (
               <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-5">
                 {!isEditing ? (
                   <div className="space-y-5">
                     <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
                       {selectedItem.mime_type?.startsWith('video/') ? (
                         <video src={selectedItem.url} controls className="w-full max-h-48 bg-black" />
                       ) : (
                         <img src={selectedItem.url || asset('storage/' + selectedItem.file_path)} className="w-full h-auto max-h-48 object-contain bg-gray-50" />
                       )}
                     </div>
                     
                     <div className="space-y-3 font-['Noto_Sans_Bengali']">
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase">Alt Text (BN/EN)</label>
                         <p className="text-xs text-gray-700">{selectedItem.alt_text_bn || '-'}</p>
                         <p className="text-xs text-gray-400 italic">{selectedItem.alt_text_en || '-'}</p>
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase">Caption (BN/EN)</label>
                         <p className="text-xs text-gray-700">{selectedItem.caption_bn || '-'}</p>
                         <p className="text-xs text-gray-400 italic">{selectedItem.caption_en || '-'}</p>
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase">Credit (BN/EN)</label>
                         <p className="text-xs text-gray-700 font-bold">{selectedItem.credit_bn || '-'}</p>
                         <p className="text-xs text-gray-400 italic">{selectedItem.credit_en || '-'}</p>
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase">Source & License</label>
                         <div className="flex flex-wrap gap-2 mt-1">
                           <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold uppercase">{selectedItem.license_type || 'internal'}</span>
                           {selectedItem.source_link && <a href={selectedItem.source_link} target="_blank" className="text-[10px] text-gray-400 hover:text-[#263238] underline truncate max-w-[150px]">{selectedItem.source_link}</a>}
                         </div>
                       </div>
                     </div>

                     <div className="pt-4 space-y-2">
                       <button 
                         onClick={() => { onSelect(selectedItem); onClose(); }}
                         className="w-full py-2.5 bg-[#263238] text-white rounded-xl text-sm font-bold shadow-lg shadow-red-100 hover:bg-[#1a2428] transition-all"
                       >
                         {lang === 'bn' ? 'ব্যবহার করুন' : 'Insert Asset'}
                       </button>
                       <button onClick={() => startEditing(selectedItem)} className="w-full py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50">Edit Metadata</button>
                       <button onClick={() => handleDelete(selectedItem.id)} className="w-full py-2 text-red-500 text-xs font-bold hover:underline flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" /> Delete Permanent</button>
                     </div>
                   </div>
                 ) : (
                   <form onSubmit={handleUpdate} className="space-y-3 font-['Noto_Sans_Bengali']">
                     <h4 className="text-sm font-bold border-b pb-2">Edit Metadata</h4>
                     <div className="grid grid-cols-2 gap-2">
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Alt (BN)</label>
                         <input type="text" value={editData.alt_text_bn} onChange={e => setEditData({...editData, alt_text_bn: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238]" />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Alt (EN)</label>
                         <input type="text" value={editData.alt_text_en} onChange={e => setEditData({...editData, alt_text_en: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238]" />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cap (BN)</label>
                         <input type="text" value={editData.caption_bn} onChange={e => setEditData({...editData, caption_bn: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238]" />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Cap (EN)</label>
                         <input type="text" value={editData.caption_en} onChange={e => setEditData({...editData, caption_en: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238]" />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Credit (BN)</label>
                         <input type="text" value={editData.credit_bn} onChange={e => setEditData({...editData, credit_bn: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238]" />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Credit (EN)</label>
                         <input type="text" value={editData.credit_en} onChange={e => setEditData({...editData, credit_en: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238]" />
                       </div>
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Source Link</label>
                       <input type="text" value={editData.source_link} onChange={e => setEditData({...editData, source_link: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238]" placeholder="https://" />
                     </div>
                     <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">License</label>
                       <select value={editData.license_type} onChange={e => setEditData({...editData, license_type: e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-xs outline-none">
                          <option value="internal">Staff</option>
                          <option value="creative_commons">CC</option>
                          <option value="stock">Stock</option>
                          <option value="licensed">Licensed</option>
                       </select>
                     </div>
                     <div className="flex gap-2 pt-2">
                       <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 text-xs font-bold text-gray-500">Cancel</button>
                       <button type="submit" className="flex-1 py-2 bg-green-500 text-white rounded-lg text-xs font-bold shadow-md">Save</button>
                     </div>
                   </form>
                 )}
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                 <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                 <p className="text-sm">Select an item to view details or insert it.</p>
               </div>
             )}
          </div>
        </div>

        {/* Upload Overlay */}
        {showUploadForm && (
           <div className="absolute inset-0 bg-white/95 z-[20] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
              <div className="max-w-xl w-full">
                <div className="flex items-center justify-between mb-8">
                   <div>
                     <h3 className="text-2xl font-bold text-gray-800 font-['Noto_Sans_Bengali']">{lang === 'bn' ? 'মিডিয়া আপলোড' : 'Upload New Media'}</h3>
                   </div>
                   <button onClick={closeUploadForm} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                </div>

                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#263238]/40 transition-all">
                    <input type="file" name="file" accept="image/*,video/*" onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                    {uploadPreview ? (
                      <div className="relative">
                        {uploadPreview.isVideo ? (
                          <video src={uploadPreview.url} className="w-full max-h-52 object-contain bg-black" controls />
                        ) : (
                          <img src={uploadPreview.url} alt="preview" className="w-full max-h-52 object-contain bg-gray-50" />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-3 py-1.5 truncate">
                          {uploadPreview.name}
                        </div>
                        <div className="absolute top-2 right-2 bg-[#263238] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 pointer-events-none">
                          {lang === 'bn' ? 'পরিবর্তন করতে ক্লিক করুন' : 'Click to change'}
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 text-center">
                        <Upload className="w-10 h-10 text-[#263238] mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-700">{lang === 'bn' ? 'ফাইল সিলেক্ট করুন' : 'Click to browse'}</p>
                        <p className="text-xs text-gray-400 mt-1">Image or Video</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Alt Text (BN)</label>
                      <input type="text" value={uploadData.alt_text_bn} onChange={e => setUploadData({ ...uploadData, alt_text_bn: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#263238] outline-none" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Alt Text (EN)</label>
                      <input type="text" value={uploadData.alt_text_en} onChange={e => setUploadData({ ...uploadData, alt_text_en: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#263238] outline-none" />
                    </div>
                    
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Caption (BN)</label>
                      <input type="text" value={uploadData.caption_bn} onChange={e => setUploadData({ ...uploadData, caption_bn: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#263238] outline-none" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Caption (EN)</label>
                      <input type="text" value={uploadData.caption_en} onChange={e => setUploadData({ ...uploadData, caption_en: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#263238] outline-none" />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Credit (BN)</label>
                      <input type="text" value={uploadData.credit_bn} onChange={e => setUploadData({ ...uploadData, credit_bn: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#263238] outline-none" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Credit (EN)</label>
                      <input type="text" value={uploadData.credit_en} onChange={e => setUploadData({ ...uploadData, credit_en: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#263238] outline-none" />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Source Link</label>
                      <input type="text" value={uploadData.source_link} onChange={e => setUploadData({ ...uploadData, source_link: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#263238] outline-none" placeholder="https://" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">License Type</label>
                      <select value={uploadData.license_type} onChange={e => setUploadData({ ...uploadData, license_type: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-[#263238] outline-none">
                        <option value="internal">{lang === 'bn' ? 'নিজস্ব (Internal)' : 'Internal'}</option>
                        <option value="stock">{lang === 'bn' ? 'স্টক ইমেজ (Stock)' : 'Stock Image'}</option>
                        <option value="creative_commons">{lang === 'bn' ? 'ক্রিয়েটিভ কমন্স' : 'Creative Commons'}</option>
                        <option value="licensed">{lang === 'bn' ? 'লাইসেন্সকৃত' : 'Licensed'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={closeUploadForm} className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={uploading} className="flex-[2] py-3 bg-[#263238] text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-[#1a2428] disabled:opacity-50 flex items-center justify-center gap-2">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === 'bn' ? 'আপলোড শুরু করুন' : 'Start Upload')}
                    </button>
                  </div>
                </form>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
