import { useState, useEffect } from 'react';
import { Upload, Image, Trash2, Grid, List, Search, X, Plus, Copy, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { usePage, router } from '@inertiajs/react';

export default function MediaLibrary({ onSelect = null }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { props } = usePage();
  const media = props.media?.data || [];
  const pagination = props.media || {};
  
  const [viewMode, setViewMode] = useState('grid');
  const [editionFilter, setEditionFilter] = useState(props.filters?.edition || 'all');
  const [typeFilter, setTypeFilter] = useState(props.filters?.type || '');
  const [searchQuery, setSearchQuery] = useState(props.filters?.search || '');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  // Fetch media with filters
  useEffect(() => {
    const params = {};
    if (editionFilter !== 'all') params.edition = editionFilter;
    if (typeFilter) params.type = typeFilter;
    if (searchQuery) params.search = searchQuery;
    router.get(route('admin.media'), params, { preserveState: true, replace: true });
  }, [editionFilter, typeFilter, searchQuery]);

  const handleDelete = (id) => {
    if (confirm(lang === 'bn' ? 'এই মিডিয়া মুছে ফেলতে চান?' : 'Delete this media?')) {
      router.delete(route('admin.media.destroy', { media: id }), {
        onSuccess: () => {
          showToast(lang === 'bn' ? 'মিডিয়া মুছে ফেলা হয়েছে' : 'Media deleted');
          setSelectedMedia(null);
          setSelectedItems(prev => prev.filter(item => item !== id));
        },
        onError: () => showToast(lang === 'bn' ? 'মুছতে সমস্যা হয়েছে' : 'Failed to delete', 'error'),
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (confirm(lang === 'bn' ? `${selectedItems.length} টি মিডিয়া মুছে ফেলতে চান?` : `Delete ${selectedItems.length} items?`)) {
      router.post(route('admin.media.bulk-delete'), { media_ids: selectedItems }, {
        onSuccess: () => {
          showToast(lang === 'bn' ? 'নির্বাচিত মিডিয়া মুছে ফেলা হয়েছে' : 'Selected media deleted');
          setSelectedItems([]);
          router.reload({ only: ['media'] });
        },
        onError: () => showToast(lang === 'bn' ? 'মুছতে সমস্যা হয়েছে' : 'Failed to delete', 'error'),
      });
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(route('admin.media.update', { media: selectedMedia.id }), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
          'Accept': 'application/json',
        },
        body: JSON.stringify(editData),
      });
      const data = await response.json();
      if (data.success) {
        showToast(lang === 'bn' ? 'মিডিয়া তথ্য আপডেট করা হয়েছে' : 'Media updated successfully');
        setIsEditing(false);
        router.reload({ only: ['media'] });
      }
    } catch (err) {
      showToast(lang === 'bn' ? 'আপডেট ব্যর্থ হয়েছে' : 'Update failed', 'error');
    }
  };

  const startEditing = (item) => {
    setSelectedMedia(item);
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

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('edition', uploadData.edition);
    if (uploadData.alt_text_bn) formData.append('alt_text_bn', uploadData.alt_text_bn);
    if (uploadData.alt_text_en) formData.append('alt_text_en', uploadData.alt_text_en);
    if (uploadData.caption_bn) formData.append('caption_bn', uploadData.caption_bn);
    if (uploadData.caption_en) formData.append('caption_en', uploadData.caption_en);
    if (uploadData.credit_bn) formData.append('credit_bn', uploadData.credit_bn);
    if (uploadData.credit_en) formData.append('credit_en', uploadData.credit_en);
    if (uploadData.source_link) formData.append('source_link', uploadData.source_link);
    formData.append('license_type', uploadData.license_type);

    try {
      const response = await fetch(route('admin.media.store'), {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
          'Accept': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        showToast(lang === 'bn' ? 'মিডিয়া আপলোড সফল হয়েছে' : 'Media uploaded successfully');
        setShowUploadModal(false);
        setUploadData({
          edition: 'both', alt_text_bn: '', alt_text_en: '',
          caption_bn: '', caption_en: '', credit_bn: '',
          credit_en: '', source_link: '', license_type: 'internal'
        });
        router.reload({ only: ['media'] });
      } else {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : (data.message || (lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed'));
        showToast(errMsg, 'error');
      }
    } catch (err) {
      showToast(lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    showToast(lang === 'bn' ? 'URL কপি হয়েছে' : 'URL copied');
  };

  const getEditionBadge = (edition) => {
    const ed = EDITIONS.find(e => e.value === edition);
    if (!ed || edition === 'all') return null;
    const colors = { blue: 'bg-blue-100 text-blue-700', green: 'bg-green-100 text-green-700', purple: 'bg-purple-100 text-purple-700' };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors[ed.color]}`}>{ed.label}</span>;
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">🖼️ {lang === 'bn' ? 'মিডিয়া লাইব্রেরি' : 'Media Library'}</h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{pagination.total || 0} {lang === 'bn' ? 'টি মিডিয়া' : 'media items'}</p>
        </div>
        <div className="flex items-center gap-2.5">
          {selectedItems.length > 0 && (
            <button onClick={handleBulkDelete} className="bg-red-50 text-[#e8001e] border border-red-100 rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-red-100 transition-colors">
              <Trash2 className="w-4 h-4" /> {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'} ({selectedItems.length})
            </button>
          )}
          <div className="flex border border-[var(--card-border,#e8ebf4)] rounded-md overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#e8001e] text-white' : 'bg-white text-[var(--text-muted,#9ca3af)]'}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#e8001e] text-white' : 'bg-white text-[var(--text-muted,#9ca3af)]'}`}><List className="w-4 h-4" /></button>
          </div>
          <button onClick={() => setShowUploadModal(true)} className="bg-[#e8001e] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#b8001a] transition-colors">
            <Upload className="w-4 h-4" /> {lang === 'bn' ? 'আপলোড' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4.5">
        {/* Edition Tabs */}
        <div className="flex items-center bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg p-1 gap-1">
          {EDITIONS.map((ed) => (
            <button
              key={ed.value}
              onClick={() => setEditionFilter(ed.value)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                editionFilter === ed.value
                  ? 'bg-[#e8001e] text-white'
                  : 'text-[var(--text-muted,#9ca3af)] hover:bg-gray-50'
              }`}
            >
              {ed.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-[12px] border border-[var(--card-border,#e8ebf4)] rounded-lg bg-white focus:outline-none focus:border-[#e8001e]"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Search */}
        <div className="flex items-center bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.5 gap-2 flex-1 max-w-xs">
          <Search className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'মিডিয়া খুঁজুন...' : 'Search media...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none bg-transparent outline-none text-sm w-full focus:outline-none focus:ring-0"
          />
          {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" /></button>}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map(item => (
            <div key={item.id} className={`group relative rounded-lg overflow-hidden bg-white border cursor-pointer transition-all ${selectedItems.includes(item.id) ? 'ring-2 ring-[#e8001e] border-transparent shadow-md' : 'border-[var(--card-border,#e8ebf4)]'}`} onClick={() => setSelectedMedia(item)}>
              {item.mime_type?.startsWith('image/') ? (
                <img src={item.thumbnail_url} alt={lang === 'bn' ? (item.alt_text_bn || item.original_name) : (item.alt_text_en || item.original_name)} className="w-full h-32 object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <button 
                onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }} 
                className={`absolute top-2 left-2 w-5 h-5 rounded border-2 transition-all flex items-center justify-center z-10 ${selectedItems.includes(item.id) ? 'bg-[#e8001e] border-[#e8001e] text-white' : 'bg-white/80 border-white/50 opacity-0 group-hover:opacity-100'}`}
              >
                {selectedItems.includes(item.id) && <Plus className="w-3.5 h-3.5 rotate-45" />}
              </button>

              <div className="absolute top-2 left-8">{getEditionBadge(item.edition)}</div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                <div className="p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-xs font-semibold truncate">{lang === 'bn' ? (item.caption_bn || item.alt_text_bn || item.original_name) : (item.caption_en || item.alt_text_en || item.original_name)}</div>
                  <div className="text-white/70 text-[10px] mt-0.5">{item.formatted_size || item.file_size}</div>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="absolute top-2 right-2 p-1.5 bg-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#fff0f2] z-10">
                <Trash2 className="w-3.5 h-3.5 text-[#e8001e]" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'ছবি' : 'Image'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'নাম' : 'Name'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'আকার' : 'Size'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{lang === 'bn' ? 'কাজ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {media.map(item => (
                <tr key={item.id} className={`hover:bg-[#fafbff] transition-colors cursor-pointer ${selectedItems.includes(item.id) ? 'bg-red-50/50' : ''}`} onClick={() => setSelectedMedia(item)}>
                  <td className="px-4 py-3 border-b border-[#f3f4f6]">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(item.id)} 
                        onChange={(e) => { e.stopPropagation(); toggleSelect(item.id); }} 
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-[#e8001e] focus:ring-[#e8001e]" 
                      />
                      {item.mime_type?.startsWith('image/') ? (
                        <img src={item.thumbnail_url} alt="" className="w-12 h-8 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <Image className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-[#f3f4f6] text-sm truncate max-w-[200px]">{item.original_name}</td>
                  <td className="px-4 py-3 border-b border-[#f3f4f6]">{getEditionBadge(item.edition)}</td>
                  <td className="px-4 py-3 border-b border-[#f3f4f6] text-sm text-[var(--text-muted,#9ca3af)]">{item.formatted_size || item.file_size}</td>
                  <td className="px-4 py-3 border-b border-[#f3f4f6] text-sm text-[var(--text-muted,#9ca3af)]">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-3 border-b border-[#f3f4f6]">
                    <div className="flex items-center gap-1">
                      <button onClick={() => copyUrl(item.url)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title={lang === 'bn' ? 'URL কপি' : 'Copy URL'}>
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <a href={item.url} target="_blank" rel="noopener" className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title={lang === 'bn' ? 'দেখুন' : 'View'}>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                      </a>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-md hover:bg-[#fff0f2] transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-[#e8001e]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {pagination.links?.map((link, i) => (
            <button
              key={i}
              onClick={() => link.url && router.get(link.url)}
              disabled={!link.url}
              className={`px-3 py-1.5 rounded-md text-sm ${link.active ? 'bg-[#e8001e] text-white' : 'bg-white border border-[var(--card-border,#e8ebf4)] text-gray-600 hover:bg-gray-50'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}

      {selectedMedia && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => { setSelectedMedia(null); setIsEditing(false); }}>
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold truncate pr-8 font-['Noto_Sans_Bengali']">{selectedMedia.original_name}</h3>
              <button onClick={() => { setSelectedMedia(null); setIsEditing(false); }} className="p-1.5 hover:bg-gray-100 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {selectedMedia.mime_type?.startsWith('image/') ? (
                  <img src={selectedMedia.url} alt={selectedMedia.original_name} className="w-full rounded-lg border border-[var(--card-border,#e8ebf4)] bg-gray-50 object-contain max-h-64" />
                ) : (
                  <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                
                <div className="bg-[var(--body-bg,#f0f2f8)] rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'আকার' : 'Size'}:</span> <span className="font-medium">{selectedMedia.formatted_size}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'টাইপ' : 'Type'}:</span> <span className="font-medium">{selectedMedia.mime_type}</span></div>
                  {selectedMedia.width && <div className="flex justify-between"><span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'রেজোলিউশন' : 'Resolution'}:</span> <span className="font-medium">{selectedMedia.width} × {selectedMedia.height}</span></div>}
                  <div className="flex justify-between"><span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'তারিখ' : 'Date'}:</span> <span className="font-medium">{new Date(selectedMedia.created_at).toLocaleString()}</span></div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => copyUrl(selectedMedia.url)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    <Copy className="w-4 h-4" /> {lang === 'bn' ? 'URL কপি' : 'Copy URL'}
                  </button>
                  <a href={selectedMedia.url} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    <ExternalLink className="w-4 h-4" /> {lang === 'bn' ? 'দেখুন' : 'View'}
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                {!isEditing ? (
                  <>
                    <div className="space-y-4 font-['Noto_Sans_Bengali']">
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">{lang === 'bn' ? 'অল্ট টেক্সট (বাংলা)' : 'Alt Text (BN)'}</label>
                        <p className="text-sm border-b border-gray-100 pb-2">{selectedMedia.alt_text_bn || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">{lang === 'bn' ? 'অল্ট টেক্সট (ইংরেজি)' : 'Alt Text (EN)'}</label>
                        <p className="text-sm border-b border-gray-100 pb-2">{selectedMedia.alt_text_en || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">{lang === 'bn' ? 'ক্যাপশন (বাংলা)' : 'Caption (BN)'}</label>
                        <p className="text-sm border-b border-gray-100 pb-2">{selectedMedia.caption_bn || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">{lang === 'bn' ? 'ক্যাপশন (ইংরেজি)' : 'Caption (EN)'}</label>
                        <p className="text-sm border-b border-gray-100 pb-2">{selectedMedia.caption_en || '-'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">{lang === 'bn' ? 'ক্রেডিট (বাংলা)' : 'Credit (BN)'}</label>
                          <p className="text-sm border-b border-gray-100 pb-2">{selectedMedia.credit_bn || '-'}</p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">{lang === 'bn' ? 'ক্রেডিট (ইংরেজি)' : 'Credit (EN)'}</label>
                          <p className="text-sm border-b border-gray-100 pb-2">{selectedMedia.credit_en || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">{lang === 'bn' ? 'সোর্স লিঙ্ক' : 'Source Link'}</label>
                        <p className="text-sm border-b border-gray-100 pb-2 truncate">{selectedMedia.source_link || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">{lang === 'bn' ? 'লাইসেন্স' : 'License'}</label>
                        <p className="text-sm border-b border-gray-100 pb-2 uppercase">{selectedMedia.license_type || 'internal'}</p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</label>
                        <div className="mt-1">{getEditionBadge(selectedMedia.edition)}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <button onClick={() => startEditing(selectedMedia)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">{lang === 'bn' ? 'এডিট করুন' : 'Edit'}</button>
                      {onSelect && (
                        <button onClick={() => { onSelect(selectedMedia); setSelectedMedia(null); }} className="flex-[2] py-2 bg-[#e8001e] text-white rounded-lg text-sm font-semibold hover:bg-[#b8001a] transition-colors">{lang === 'bn' ? 'নির্বাচন করুন' : 'Select'}</button>
                      )}
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleUpdate} className="space-y-3 font-['Noto_Sans_Bengali']">
                    <div>
                      <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'অল্ট টেক্সট (বাংলা)' : 'Alt Text (BN)'}</label>
                      <input type="text" value={editData.alt_text_bn} onChange={e => setEditData({...editData, alt_text_bn: e.target.value})} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm focus:border-[#e8001e] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'অল্ট টেক্সট (ইংরেজি)' : 'Alt Text (EN)'}</label>
                      <input type="text" value={editData.alt_text_en} onChange={e => setEditData({...editData, alt_text_en: e.target.value})} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm focus:border-[#e8001e] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'ক্যাপশন (বাংলা)' : 'Caption (BN)'}</label>
                      <textarea value={editData.caption_bn} onChange={e => setEditData({...editData, caption_bn: e.target.value})} rows={2} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm focus:border-[#e8001e] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'ক্যাপশন (ইংরেজি)' : 'Caption (EN)'}</label>
                      <textarea value={editData.caption_en} onChange={e => setEditData({...editData, caption_en: e.target.value})} rows={2} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm focus:border-[#e8001e] outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'ক্রেডিট (বাংলা)' : 'Credit (BN)'}</label>
                        <input type="text" value={editData.credit_bn} onChange={e => setEditData({...editData, credit_bn: e.target.value})} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm focus:border-[#e8001e] outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'ক্রেডিট (ইংরেজি)' : 'Credit (EN)'}</label>
                        <input type="text" value={editData.credit_en} onChange={e => setEditData({...editData, credit_en: e.target.value})} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm focus:border-[#e8001e] outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'সোর্স লিঙ্ক' : 'Source Link'}</label>
                      <input type="text" value={editData.source_link} onChange={e => setEditData({...editData, source_link: e.target.value})} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm focus:border-[#e8001e] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'লাইসেন্স' : 'License'}</label>
                      <select value={editData.license_type} onChange={e => setEditData({...editData, license_type: e.target.value})} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm focus:border-[#e8001e] outline-none">
                        <option value="internal">Internal / Staff</option>
                        <option value="creative_commons">Creative Commons</option>
                        <option value="stock">Stock Photo (Licensed)</option>
                        <option value="user_submitted">User Submitted</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</label>
                      <div className="flex gap-2">
                        {EDITIONS.filter(e => e.value !== 'all').map((ed) => (
                          <button
                            key={ed.value}
                            type="button"
                            onClick={() => setEditData({ ...editData, edition: ed.value })}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-medium transition-all ${
                              editData.edition === ed.value ? 'bg-[#e8001e] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {ed.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">{lang === 'bn' ? 'বাতিল' : 'Cancel'}</button>
                      <button type="submit" className="flex-[2] py-2 bg-[#10b981] text-white rounded-lg text-sm font-semibold hover:bg-[#059669] transition-colors">{lang === 'bn' ? 'সেভ করুন' : 'Save Changes'}</button>
                    </div>
                  </form>
                )}
                
                <div className="pt-4 border-t border-gray-100">
                   <button onClick={() => handleDelete(selectedMedia.id)} className="w-full flex items-center justify-center gap-1.5 py-2 text-[#e8001e] text-sm font-semibold hover:bg-[#fff0f2] rounded-lg transition-colors">
                     <Trash2 className="w-4 h-4" /> {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Media'}
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{lang === 'bn' ? 'মিডিয়া আপলোড' : 'Upload Media'}</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-1.5 hover:bg-gray-100 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{lang === 'bn' ? 'ফাইল নির্বাচন করুন' : 'Select File'}</label>
                <input type="file" name="file" accept="image/*,video/*" className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2" required />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</label>
                <div className="flex gap-2">
                  {EDITIONS.filter(e => e.value !== 'all').map((ed) => (
                    <button
                      key={ed.value}
                      type="button"
                      onClick={() => setUploadData({ ...uploadData, edition: ed.value })}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        uploadData.edition === ed.value
                          ? 'bg-[#e8001e] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {ed.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{lang === 'bn' ? 'অল্ট টেক্সট (বাংলা)' : 'Alt Text (Bangla)'}</label>
                  <input type="text" value={uploadData.alt_text_bn} onChange={e => setUploadData({ ...uploadData, alt_text_bn: e.target.value })} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{lang === 'bn' ? 'অল্ট টেক্সট (ইংরেজি)' : 'Alt Text (English)'}</label>
                  <input type="text" value={uploadData.alt_text_en} onChange={e => setUploadData({ ...uploadData, alt_text_en: e.target.value })} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{lang === 'bn' ? 'ক্যাপশন (বাংলা)' : 'Caption (Bangla)'}</label>
                  <input type="text" value={uploadData.caption_bn} onChange={e => setUploadData({ ...uploadData, caption_bn: e.target.value })} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{lang === 'bn' ? 'ক্যাপশন (ইংরেজি)' : 'Caption (English)'}</label>
                  <input type="text" value={uploadData.caption_en} onChange={e => setUploadData({ ...uploadData, caption_en: e.target.value })} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{lang === 'bn' ? 'ক্রেডিট (বাংলা)' : 'Credit (Bangla)'}</label>
                  <input type="text" value={uploadData.credit_bn} onChange={e => setUploadData({ ...uploadData, credit_bn: e.target.value })} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{lang === 'bn' ? 'ক্রেডিট (ইংরেজি)' : 'Credit (English)'}</label>
                  <input type="text" value={uploadData.credit_en} onChange={e => setUploadData({ ...uploadData, credit_en: e.target.value })} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">{lang === 'bn' ? 'সোর্স লিঙ্ক' : 'Source Link'}</label>
                  <input type="text" value={uploadData.source_link} onChange={e => setUploadData({ ...uploadData, source_link: e.target.value })} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm" placeholder="https://" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{lang === 'bn' ? 'লাইসেন্স' : 'License Type'}</label>
                  <select value={uploadData.license_type} onChange={e => setUploadData({ ...uploadData, license_type: e.target.value })} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 text-sm">
                    <option value="internal">Staff/Internal</option>
                    <option value="stock">Stock Photo</option>
                    <option value="creative_commons">Creative Commons</option>
                    <option value="licensed">Licensed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 border border-[var(--card-border,#e8ebf4)] rounded-lg text-sm hover:bg-gray-50">{lang === 'bn' ? 'বাতিল' : 'Cancel'}</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-[#e8001e] text-white rounded-lg text-sm font-semibold hover:bg-[#b8001a] disabled:opacity-50">
                  {uploading ? (lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') : (lang === 'bn' ? 'আপলোড করুন' : 'Upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
