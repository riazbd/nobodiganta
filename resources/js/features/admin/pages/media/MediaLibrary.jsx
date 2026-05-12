import { useState, useEffect, useRef } from 'react';
import { Upload, Image, Trash2, Grid, List, Search, X, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { usePage, router } from '@inertiajs/react';

const EDITIONS = (lang) => [
  { value: 'all',  label: lang === 'bn' ? 'সব সংস্করণ' : 'All Editions' },
  { value: 'bn',   label: lang === 'bn' ? 'বাংলা'       : 'Bangla'       },
  { value: 'en',   label: lang === 'bn' ? 'ইংরেজি'     : 'English'      },
  { value: 'both', label: lang === 'bn' ? 'উভয়'         : 'Both'         },
];

const TYPES = (lang) => [
  { value: '',      label: lang === 'bn' ? 'সব ধরন' : 'All Types' },
  { value: 'image', label: lang === 'bn' ? 'ছবি'    : 'Images'    },
  { value: 'video', label: lang === 'bn' ? 'ভিডিও'  : 'Videos'   },
];

function EditionBadge({ edition }) {
  const colors = { bn: 'bg-blue-100 text-blue-700', en: 'bg-green-100 text-green-700', both: 'bg-purple-100 text-purple-700' };
  if (!edition || edition === 'all') return null;
  return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors[edition] || ''}`}>{edition.toUpperCase()}</span>;
}

function VideoThumb({ className }) {
  return (
    <div className={`bg-gray-900 flex flex-col items-center justify-center gap-1 ${className}`}>
      <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
      </div>
      <span className="text-white/50 text-[10px] font-bold uppercase">VIDEO</span>
    </div>
  );
}

export default function MediaLibrary({ onSelect = null }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { props } = usePage();
  const media      = props.media?.data || [];
  const pagination = props.media || {};

  const [viewMode,       setViewMode]       = useState('grid');
  const [editionFilter,  setEditionFilter]  = useState(props.filters?.edition || 'all');
  const [typeFilter,     setTypeFilter]     = useState(props.filters?.type    || '');
  const [searchQuery,    setSearchQuery]    = useState(props.filters?.search  || '');
  const [selectedItems,  setSelectedItems]  = useState([]);
  const [selectedMedia,  setSelectedMedia]  = useState(null);
  const [isEditing,      setIsEditing]      = useState(false);
  const [editData,       setEditData]       = useState({});
  const [showUploadModal,setShowUploadModal]= useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [uploadPreview,  setUploadPreview]  = useState(null); // { url, name, isVideo }
  const [uploadData,     setUploadData]     = useState({
    edition: 'both', alt_text_bn: '', alt_text_en: '',
    caption_bn: '', caption_en: '', credit_bn: '', credit_en: '',
    source_link: '', license_type: 'internal',
  });

  // Skip the first render so we don't double-load on mount
  const mounted = useRef(false);
  const searchTimer = useRef(null);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const params = {};
    if (editionFilter !== 'all') params.edition = editionFilter;
    if (typeFilter)              params.type     = typeFilter;
    if (searchQuery)             params.search   = searchQuery;
    router.get(route('admin.media'), params, { preserveState: true, replace: true });
  }, [editionFilter, typeFilter]); // search handled separately with debounce

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const params = {};
      if (editionFilter !== 'all') params.edition = editionFilter;
      if (typeFilter)              params.type     = typeFilter;
      if (val)                     params.search   = val;
      router.get(route('admin.media'), params, { preserveState: true, replace: true });
    }, 400);
  };

  // ── CRUD via axios ────────────────────────────────────────────────────────

  const reload = () => router.reload({ only: ['media'] });

  const handleDelete = async (id) => {
    if (!confirm(lang === 'bn' ? 'এই মিডিয়া মুছে ফেলতে চান?' : 'Delete this media?')) return;
    try {
      await window.axios.delete(route('admin.media.destroy', { media: id }));
      showToast(lang === 'bn' ? 'মিডিয়া মুছে ফেলা হয়েছে' : 'Media deleted');
      setSelectedMedia(null);
      setSelectedItems(prev => prev.filter(i => i !== id));
      reload();
    } catch {
      showToast(lang === 'bn' ? 'মুছতে সমস্যা হয়েছে' : 'Failed to delete', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedItems.length) return;
    if (!confirm(lang === 'bn' ? `${selectedItems.length} টি মিডিয়া মুছে ফেলতে চান?` : `Delete ${selectedItems.length} items?`)) return;
    try {
      await window.axios.post(route('admin.media.bulk-delete'), { media_ids: selectedItems });
      showToast(lang === 'bn' ? 'নির্বাচিত মিডিয়া মুছে ফেলা হয়েছে' : 'Selected media deleted');
      setSelectedItems([]);
      reload();
    } catch {
      showToast(lang === 'bn' ? 'মুছতে সমস্যা হয়েছে' : 'Failed to delete', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await window.axios.put(route('admin.media.update', { media: selectedMedia.id }), editData);
      showToast(lang === 'bn' ? 'মিডিয়া তথ্য আপডেট হয়েছে' : 'Media updated');
      setSelectedMedia(prev => ({ ...prev, ...res.data.media }));
      setIsEditing(false);
      reload();
    } catch {
      showToast(lang === 'bn' ? 'আপডেট ব্যর্থ হয়েছে' : 'Update failed', 'error');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(uploadData).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    try {
      await window.axios.post(route('admin.media.store'), fd);
      showToast(lang === 'bn' ? 'আপলোড সফল হয়েছে' : 'Upload successful');
      closeUploadModal();
      reload();
    } catch (err) {
      const msg = err.response?.data?.errors?.file?.[0]
        || err.response?.data?.message
        || (lang === 'bn' ? 'আপলোড ব্যর্থ হয়েছে' : 'Upload failed');
      showToast(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  // ── Upload preview ────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (uploadPreview?.url) URL.revokeObjectURL(uploadPreview.url);
    setUploadPreview({ url: URL.createObjectURL(file), name: file.name, isVideo: file.type.startsWith('video/') });
  };

  const closeUploadModal = () => {
    if (uploadPreview?.url) URL.revokeObjectURL(uploadPreview.url);
    setUploadPreview(null);
    setShowUploadModal(false);
    setUploadData({ edition: 'both', alt_text_bn: '', alt_text_en: '', caption_bn: '', caption_en: '', credit_bn: '', credit_en: '', source_link: '', license_type: 'internal' });
  };

  // ── Selection ─────────────────────────────────────────────────────────────

  const toggleSelectAll = () => setSelectedItems(selectedItems.length === media.length && media.length > 0 ? [] : media.map(i => i.id));
  const toggleSelect    = (id) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const startEditing = (item) => {
    setEditData({
      alt_text_bn: item.alt_text_bn  || '', alt_text_en: item.alt_text_en || '',
      caption_bn:  item.caption_bn   || '', caption_en:  item.caption_en  || '',
      credit_bn:   item.credit_bn    || '', credit_en:   item.credit_en   || '',
      source_link: item.source_link  || '', license_type: item.license_type || 'internal',
      edition:     item.edition      || 'both',
    });
    setIsEditing(true);
  };

  const copyUrl = (url) => { navigator.clipboard.writeText(url); showToast(lang === 'bn' ? 'URL কপি হয়েছে' : 'URL copied'); };

  const editions = EDITIONS(lang);
  const types    = TYPES(lang);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1d2e] flex items-center gap-2">
            <Image className="w-5 h-5 text-[#263238]" />
            {lang === 'bn' ? 'মিডিয়া লাইব্রেরি' : 'Media Library'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{pagination.total || 0} {lang === 'bn' ? 'টি মিডিয়া' : 'items'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleSelectAll}
            className={`px-3 py-2 text-xs font-medium border rounded-lg transition-colors ${selectedItems.length === media.length && media.length > 0 ? 'bg-[#263238] text-white border-[#263238]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            {selectedItems.length === media.length && media.length > 0
              ? (lang === 'bn' ? 'সব বাতিল' : 'Deselect All')
              : (lang === 'bn' ? 'সব সিলেক্ট' : 'Select All')}
          </button>
          {selectedItems.length > 0 && (
            <button onClick={handleBulkDelete}
              className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-100 transition-colors">
              <Trash2 className="w-4 h-4" /> {lang === 'bn' ? 'মুছুন' : 'Delete'} ({selectedItems.length})
            </button>
          )}
          <div className="flex border border-gray-200 rounded-md overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-[#263238] text-white' : 'bg-white text-gray-400'}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-[#263238] text-white' : 'bg-white text-gray-400'}`}><List className="w-4 h-4" /></button>
          </div>
          <button onClick={() => setShowUploadModal(true)}
            className="bg-[#263238] text-white rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1a2428] transition-colors">
            <Upload className="w-4 h-4" /> {lang === 'bn' ? 'আপলোড' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-1">
          {editions.map(ed => (
            <button key={ed.value} onClick={() => setEditionFilter(ed.value)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${editionFilter === ed.value ? 'bg-[#263238] text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
              {ed.label}
            </button>
          ))}
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-[#263238]">
          {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 gap-2 flex-1 max-w-xs focus-within:border-[#263238] transition-colors">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input type="text" placeholder={lang === 'bn' ? 'মিডিয়া খুঁজুন...' : 'Search media...'}
            value={searchQuery} onChange={e => handleSearchChange(e.target.value)}
            className="border-none bg-transparent outline-none text-sm w-full" />
          {searchQuery && <button onClick={() => handleSearchChange('')}><X className="w-4 h-4 text-gray-400" /></button>}
        </div>
      </div>

      {/* Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map(item => {
            const isVid = item.mime_type?.startsWith('video/');
            return (
              <div key={item.id}
                className={`group relative rounded-lg overflow-hidden bg-white border cursor-pointer transition-all hover:shadow-md ${selectedItems.includes(item.id) ? 'ring-2 ring-[#263238] border-transparent' : 'border-gray-200'}`}
                onClick={() => setSelectedMedia(item)}>
                {isVid
                  ? <VideoThumb className="w-full h-32" />
                  : <img src={item.thumbnail_url} alt={item.alt_text_bn || item.original_name} className="w-full h-32 object-cover transition-transform group-hover:scale-105" />}

                <button onClick={e => { e.stopPropagation(); toggleSelect(item.id); }}
                  className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center z-10 transition-all ${selectedItems.includes(item.id) ? 'bg-[#263238] border-[#263238]' : 'bg-white/80 border-white/50 opacity-0 group-hover:opacity-100'}`}>
                  {selectedItems.includes(item.id) && <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3"><path d="M20 6L9 17l-5-5"/></svg>}
                </button>

                <div className="absolute top-2 left-8"><EditionBadge edition={item.edition} /></div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end pointer-events-none">
                  <div className="p-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-[10px] font-semibold truncate">{item.caption_bn || item.alt_text_bn || item.original_name}</div>
                    <div className="text-white/60 text-[9px]">{item.formatted_size || ''}</div>
                  </div>
                </div>

                <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            );
          })}
          {media.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 text-sm">
              {lang === 'bn' ? 'কোনো মিডিয়া নেই।' : 'No media found.'}
            </div>
          )}
        </div>
      ) : (
        /* List */
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-[11px] font-semibold text-gray-400 uppercase px-4 py-3 text-left">{lang === 'bn' ? 'ফাইল' : 'File'}</th>
                <th className="text-[11px] font-semibold text-gray-400 uppercase px-4 py-3 text-left">{lang === 'bn' ? 'নাম' : 'Name'}</th>
                <th className="text-[11px] font-semibold text-gray-400 uppercase px-4 py-3 text-left">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</th>
                <th className="text-[11px] font-semibold text-gray-400 uppercase px-4 py-3 text-left">{lang === 'bn' ? 'আকার' : 'Size'}</th>
                <th className="text-[11px] font-semibold text-gray-400 uppercase px-4 py-3 text-left">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="text-[11px] font-semibold text-gray-400 uppercase px-4 py-3 text-left">{lang === 'bn' ? 'কাজ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {media.map(item => {
                const isVid = item.mime_type?.startsWith('video/');
                return (
                  <tr key={item.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedMedia(item)}>
                    <td className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedItems.includes(item.id)}
                          onChange={e => { e.stopPropagation(); toggleSelect(item.id); }}
                          onClick={e => e.stopPropagation()}
                          className="rounded border-gray-300 text-[#263238] focus:ring-[#263238]" />
                        {isVid
                          ? <div className="w-12 h-8 rounded bg-gray-900 flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          : <img src={item.thumbnail_url} alt="" className="w-12 h-8 object-cover rounded flex-shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm truncate max-w-[200px]">{item.original_name}</td>
                    <td className="px-4 py-3 border-b border-gray-100"><EditionBadge edition={item.edition} /></td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-400">{item.formatted_size || ''}</td>
                    <td className="px-4 py-3 border-b border-gray-100 text-sm text-gray-400">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</td>
                    <td className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-1">
                        <button onClick={e => { e.stopPropagation(); copyUrl(item.url); }} className="p-1.5 rounded hover:bg-gray-100 transition-colors" title="Copy URL"><Copy className="w-3.5 h-3.5 text-gray-500" /></button>
                        <a href={item.url} target="_blank" rel="noopener" onClick={e => e.stopPropagation()} className="p-1.5 rounded hover:bg-gray-100 transition-colors"><ExternalLink className="w-3.5 h-3.5 text-gray-500" /></a>
                        <button onClick={e => { e.stopPropagation(); handleDelete(item.id); }} className="p-1.5 rounded hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {media.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">{lang === 'bn' ? 'কোনো মিডিয়া নেই।' : 'No media found.'}</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {pagination.links?.map((link, i) => (
            <button key={i} onClick={() => link.url && router.get(link.url)} disabled={!link.url}
              className={`px-3 py-1.5 rounded-md text-sm ${link.active ? 'bg-[#263238] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'} ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
              dangerouslySetInnerHTML={{ __html: link.label }} />
          ))}
        </div>
      )}

      {/* ── Detail modal ── */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => { setSelectedMedia(null); setIsEditing(false); }}>
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold truncate pr-8">{selectedMedia.original_name}</h3>
              <button onClick={() => { setSelectedMedia(null); setIsEditing(false); }} className="p-1.5 hover:bg-gray-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: preview + meta */}
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  {selectedMedia.mime_type?.startsWith('video/')
                    ? <video src={selectedMedia.url} controls className="w-full max-h-56 bg-black" />
                    : <img src={selectedMedia.url} alt={selectedMedia.original_name} className="w-full max-h-56 object-contain" />}
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-gray-400">{lang === 'bn' ? 'আকার' : 'Size'}</span><span className="font-medium">{selectedMedia.formatted_size}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">{lang === 'bn' ? 'ধরন' : 'Type'}</span><span className="font-medium">{selectedMedia.mime_type}</span></div>
                  {selectedMedia.width && <div className="flex justify-between"><span className="text-gray-400">{lang === 'bn' ? 'মাপ' : 'Dimensions'}</span><span className="font-medium">{selectedMedia.width} × {selectedMedia.height}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-400">{lang === 'bn' ? 'তারিখ' : 'Date'}</span><span className="font-medium">{new Date(selectedMedia.created_at).toLocaleString()}</span></div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => copyUrl(selectedMedia.url)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                    <Copy className="w-4 h-4" /> {lang === 'bn' ? 'URL কপি' : 'Copy URL'}
                  </button>
                  <a href={selectedMedia.url} target="_blank" rel="noopener" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                    <ExternalLink className="w-4 h-4" /> {lang === 'bn' ? 'দেখুন' : 'View'}
                  </a>
                </div>
              </div>

              {/* Right: info / edit */}
              <div className="space-y-3">
                {!isEditing ? (
                  <>
                    {[
                      { label: lang === 'bn' ? 'অল্ট টেক্সট (বাং)' : 'Alt (BN)', val: selectedMedia.alt_text_bn },
                      { label: lang === 'bn' ? 'অল্ট টেক্সট (ইং)' : 'Alt (EN)', val: selectedMedia.alt_text_en },
                      { label: lang === 'bn' ? 'ক্যাপশন (বাং)'    : 'Caption (BN)', val: selectedMedia.caption_bn },
                      { label: lang === 'bn' ? 'ক্যাপশন (ইং)'    : 'Caption (EN)', val: selectedMedia.caption_en },
                      { label: lang === 'bn' ? 'ক্রেডিট (বাং)'   : 'Credit (BN)',  val: selectedMedia.credit_bn },
                      { label: lang === 'bn' ? 'ক্রেডিট (ইং)'   : 'Credit (EN)',  val: selectedMedia.credit_en },
                      { label: lang === 'bn' ? 'সোর্স'           : 'Source',       val: selectedMedia.source_link },
                      { label: lang === 'bn' ? 'লাইসেন্স'        : 'License',      val: selectedMedia.license_type?.toUpperCase() },
                    ].map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{label}</p>
                        <p className="text-sm text-gray-700 border-b border-gray-100 pb-1.5">{val || '-'}</p>
                      </div>
                    ))}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</p>
                      <EditionBadge edition={selectedMedia.edition} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => startEditing(selectedMedia)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
                        {lang === 'bn' ? 'এডিট' : 'Edit'}
                      </button>
                      {onSelect && (
                        <button onClick={() => { onSelect(selectedMedia); setSelectedMedia(null); }} className="flex-[2] py-2 bg-[#263238] text-white rounded-lg text-sm font-semibold hover:bg-[#1a2428]">
                          {lang === 'bn' ? 'নির্বাচন করুন' : 'Select'}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleUpdate} className="space-y-3">
                    {[
                      { label: 'Alt (BN)', key: 'alt_text_bn' }, { label: 'Alt (EN)', key: 'alt_text_en' },
                      { label: 'Caption (BN)', key: 'caption_bn', textarea: true }, { label: 'Caption (EN)', key: 'caption_en', textarea: true },
                      { label: 'Credit (BN)', key: 'credit_bn' }, { label: 'Credit (EN)', key: 'credit_en' },
                      { label: 'Source Link', key: 'source_link' },
                    ].map(({ label, key, textarea }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium mb-1">{label}</label>
                        {textarea
                          ? <textarea rows={2} value={editData[key]} onChange={e => setEditData({ ...editData, [key]: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#263238]" />
                          : <input type="text" value={editData[key]} onChange={e => setEditData({ ...editData, [key]: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#263238]" />}
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'লাইসেন্স' : 'License'}</label>
                      <select value={editData.license_type} onChange={e => setEditData({ ...editData, license_type: e.target.value })} className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#263238]">
                        <option value="internal">Internal / Staff</option>
                        <option value="creative_commons">Creative Commons</option>
                        <option value="stock">Stock Photo</option>
                        <option value="licensed">Licensed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-2">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</label>
                      <div className="flex gap-2">
                        {['bn', 'en', 'both'].map(v => (
                          <button key={v} type="button" onClick={() => setEditData({ ...editData, edition: v })}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${editData.edition === v ? 'bg-[#263238] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {v.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">{lang === 'bn' ? 'বাতিল' : 'Cancel'}</button>
                      <button type="submit" className="flex-[2] py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">{lang === 'bn' ? 'সেভ করুন' : 'Save'}</button>
                    </div>
                  </form>
                )}
                <div className="pt-3 border-t border-gray-100">
                  <button onClick={() => handleDelete(selectedMedia.id)} className="w-full flex items-center justify-center gap-1.5 py-2 text-red-600 text-sm font-semibold hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" /> {lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Media'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload modal ── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={closeUploadModal}>
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{lang === 'bn' ? 'মিডিয়া আপলোড' : 'Upload Media'}</h2>
              <button onClick={closeUploadModal} className="p-1.5 hover:bg-gray-100 rounded-md"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* File picker with preview */}
              <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#263238]/40 transition-all">
                <input type="file" name="file" accept="image/*,video/*" onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" required />
                {uploadPreview ? (
                  <div className="relative">
                    {uploadPreview.isVideo
                      ? <video src={uploadPreview.url} className="w-full max-h-48 bg-black" controls />
                      : <img src={uploadPreview.url} alt="preview" className="w-full max-h-48 object-contain bg-gray-50" />}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-3 py-1.5 truncate">{uploadPreview.name}</div>
                    <div className="absolute top-2 right-2 bg-[#263238] text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none z-20">
                      {lang === 'bn' ? 'পরিবর্তন করতে ক্লিক করুন' : 'Click to change'}
                    </div>
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <Upload className="w-10 h-10 text-[#263238] mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-700">{lang === 'bn' ? 'ছবি বা ভিডিও বেছে নিন' : 'Click to browse'}</p>
                    <p className="text-xs text-gray-400 mt-1">Max 100MB</p>
                  </div>
                )}
              </div>

              {/* Edition */}
              <div>
                <label className="block text-sm font-medium mb-2">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</label>
                <div className="flex gap-2">
                  {['bn', 'en', 'both'].map(v => (
                    <button key={v} type="button" onClick={() => setUploadData({ ...uploadData, edition: v })}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${uploadData.edition === v ? 'bg-[#263238] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: lang === 'bn' ? 'অল্ট টেক্সট (বাং)' : 'Alt Text (BN)', key: 'alt_text_bn' },
                  { label: lang === 'bn' ? 'অল্ট টেক্সট (ইং)' : 'Alt Text (EN)', key: 'alt_text_en' },
                  { label: lang === 'bn' ? 'ক্যাপশন (বাং)'    : 'Caption (BN)',  key: 'caption_bn' },
                  { label: lang === 'bn' ? 'ক্যাপশন (ইং)'    : 'Caption (EN)',  key: 'caption_en' },
                  { label: lang === 'bn' ? 'ক্রেডিট (বাং)'   : 'Credit (BN)',   key: 'credit_bn'  },
                  { label: lang === 'bn' ? 'ক্রেডিট (ইং)'   : 'Credit (EN)',   key: 'credit_en'  },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1">{label}</label>
                    <input type="text" value={uploadData[key]} onChange={e => setUploadData({ ...uploadData, [key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#263238]" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'সোর্স লিঙ্ক' : 'Source Link'}</label>
                  <input type="text" value={uploadData.source_link} onChange={e => setUploadData({ ...uploadData, source_link: e.target.value })}
                    placeholder="https://" className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#263238]" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">{lang === 'bn' ? 'লাইসেন্স' : 'License'}</label>
                  <select value={uploadData.license_type} onChange={e => setUploadData({ ...uploadData, license_type: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#263238]">
                    <option value="internal">Staff / Internal</option>
                    <option value="stock">Stock Photo</option>
                    <option value="creative_commons">Creative Commons</option>
                    <option value="licensed">Licensed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeUploadModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">{lang === 'bn' ? 'বাতিল' : 'Cancel'}</button>
                <button type="submit" disabled={uploading}
                  className="flex-[2] py-2.5 bg-[#263238] text-white rounded-xl text-sm font-bold hover:bg-[#1a2428] disabled:opacity-50 flex items-center justify-center gap-2">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> {lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}</> : (lang === 'bn' ? 'আপলোড করুন' : 'Upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
