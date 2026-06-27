import { useState, useEffect } from 'react';
import { Video, Play, Eye, Trash2, Edit3, Plus, Search, X, Loader2, Image as ImageIcon, Upload } from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { useAdminNavigation } from '../contexts/AdminNavigationContext';
import { router } from '@inertiajs/react';
import MediaLibraryModal from '../components/media/MediaLibraryModal';
import { detectVideoProvider } from '../../../lib/video';

export default function Videos({ initialVideos = [], filters = {} }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();
  
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [editionFilter, setEditionFilter] = useState(filters.edition || 'all');
  const [localVideos, setLocalVideos] = useState(initialVideos);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const [formData, setFormData] = useState({
    titleBn: '',
    titleEn: '',
    videoUrl: '',
    videoProvider: 'youtube',
    videoDuration: '',
    thumbnail: '',
    edition: 'both',
  });

  const EDITIONS = [
    { value: 'all', label: lang === 'bn' ? 'সব সংস্করণ' : 'All Editions', color: 'gray' },
    { value: 'bn', label: lang === 'bn' ? 'বাংলা' : 'Bangla', color: 'blue' },
    { value: 'en', label: lang === 'bn' ? 'ইংরেজি' : 'English', color: 'green' },
    { value: 'both', label: lang === 'bn' ? 'দুই সংস্করণ' : 'Both', color: 'purple' },
  ];

  useEffect(() => {
    setLocalVideos(initialVideos);
  }, [initialVideos]);

  // Search & Filter logic
  useEffect(() => {
    const timer = setTimeout(() => {
      router.get(route('admin.videos'), { 
        search: searchQuery,
        edition: editionFilter !== 'all' ? editionFilter : undefined
      }, { preserveState: true, replace: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, editionFilter]);

  const handleOpenCreate = () => {
    setEditingVideo(null);
    setFormData({ 
      titleBn: '', 
      titleEn: '', 
      videoUrl: '', 
      videoDuration: '', 
      thumbnail: '', 
      edition: 'both', 
      videoProvider: 'youtube' 
    });
    setShowModal(true);
  };

  const handleOpenEdit = (video) => {
    setEditingVideo(video);
    setFormData({
      titleBn: video.title,
      titleEn: video.titleEn || '',
      videoUrl: video.video_url || '',
      videoProvider: video.video_provider || 'youtube',
      videoDuration: video.duration || '',
      thumbnail: video.thumbnail || '',
      edition: video.edition || 'both',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (confirm(lang === 'bn' ? 'ভিডিওটি মুছে ফেলতে চান?' : 'Delete this video?')) {
      router.delete(route('admin.videos.destroy', { article: id }), {
        onSuccess: () => showToast(lang === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted successfully'),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const url = editingVideo 
      ? route('admin.videos.update', { article: editingVideo.id })
      : route('admin.videos.store');
    
    const method = editingVideo ? 'PUT' : 'POST';

    try {
      if (editingVideo) {
        await window.axios.put(url, formData);
      } else {
        await window.axios.post(url, formData);
      }
      showToast(lang === 'bn' ? 'সফল হয়েছে' : 'Success');
      setShowModal(false);
      router.reload();
    } catch (err) {
      showToast('Error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onThumbnailSelect = (media) => {
    setFormData({ ...formData, thumbnail: media.url });
    setShowMediaLibrary(false);
  };

  // Direct video upload from PC → stored via the media endpoint, then used as a
  // self-hosted (local) video played by the native HTML5 player.
  const handleVideoUpload = async (file) => {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      showToast(lang === 'bn' ? 'ফাইলের সাইজ ১০০MB এর বেশি হতে পারবে না' : 'File size must not exceed 100MB', 'error');
      return;
    }
    setUploadingVideo(true);
    setVideoProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('edition', formData.edition || 'both');
      fd.append('license_type', 'internal');
      const res = await window.axios.post('/admin/media', fd, {
        timeout: 0,
        onUploadProgress: (e) => { if (e.total) setVideoProgress(Math.round((e.loaded * 100) / e.total)); },
      });
      const data = res.data;
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, videoUrl: data.url, videoProvider: 'local' }));
        showToast(lang === 'bn' ? 'ভিডিও আপলোড সফল হয়েছে' : 'Video uploaded successfully');
      } else {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : (data.message || data.error || (lang === 'bn' ? 'ভিডিও আপলোড ব্যর্থ হয়েছে' : 'Video upload failed'));
        showToast(errMsg, 'error');
      }
    } catch (err) {
      const msg = err.response?.status === 413
        ? (lang === 'bn'
            ? 'ফাইলটি সার্ভারের অনুমোদিত সীমার চেয়ে বড়। সার্ভারের আপলোড লিমিট (php.ini) বাড়াতে হবে।'
            : 'File is larger than the server allows. The server upload limit (php.ini) needs to be raised.')
        : (err.response?.data?.message || err.message || (lang === 'bn' ? 'ভিডিও আপলোড ব্যর্থ হয়েছে' : 'Video upload failed'));
      showToast(msg, 'error');
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
    }
  };

  const getEditionBadge = (edition) => {
    const ed = EDITIONS.find(e => e.value === edition);
    if (!ed || edition === 'all') return null;
    const colors = { blue: 'bg-blue-100 text-blue-700', green: 'bg-green-100 text-green-700', purple: 'bg-purple-100 text-purple-700' };
    return <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors[ed.color]}`}>{ed.label}</span>;
  };

  return (
    <div className="font-['Noto_Sans_Bengali']">
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)]">🎬 {lang === 'bn' ? 'ভিডিও ব্যবস্থাপনা' : 'Video Management'}</h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{localVideos.length} {lang === 'bn' ? 'টি ভিডিও' : 'videos'}</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-[#263238] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#1a2428] transition-colors">
          <Plus className="w-4 h-4" /> {lang === 'bn' ? 'নতুন ভিডিও' : 'New Video'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 gap-2 flex-1 max-w-sm shadow-sm">
          <Search className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" />
          <input 
            type="text" 
            placeholder={lang === 'bn' ? 'ভিডিও খুঁজুন...' : 'Search videos...'} 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="border-none bg-transparent outline-none text-sm w-full focus:outline-none focus:ring-0" 
          />
          {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" /></button>}
        </div>

        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-1 shadow-sm">
          {EDITIONS.map((ed) => (
            <button
              key={ed.value}
              onClick={() => setEditionFilter(ed.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                editionFilter === ed.value ? 'bg-[#263238] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {ed.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {localVideos.map(video => (
          <div key={video.id} className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden group flex flex-col">
            <div className="relative">
              {video.thumbnail ? (
                <img src={video.thumbnail} alt="" className="w-full h-44 object-cover" />
              ) : (
                <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => window.open(video.video_url, '_blank')}>
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-[#263238] ml-0.5" />
                </div>
              </div>
              <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                {getEditionBadge(video.edition)}
              </div>
              {video.duration && video.duration !== '00:00' && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-wider">{video.duration}</div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-[var(--text-primary,#1a1d2e)] mb-3 line-clamp-2 leading-snug">{lang === 'bn' ? video.title : (video.titleEn || video.title)}</h3>
              <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="blue">{lang === 'bn' ? (video.category || 'ভিডিও') : (video.categoryEn || 'Video')}</Badge>
                  <span className="text-[10px] text-[var(--text-muted,#9ca3af)] flex items-center gap-1 font-semibold uppercase tracking-tight">
                    <Eye className="w-3 h-3" /> {video.views.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenEdit(video)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title={lang === 'bn' ? 'সম্পাদনা' : 'Edit'}>
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(video.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#263238] transition-colors" title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editingVideo ? (lang === 'bn' ? 'ভিডিও আপডেট' : 'Edit Video') : (lang === 'bn' ? 'নতুন ভিডিও যোগ' : 'Add New Video')}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {(formData.edition === 'both' || formData.edition === 'bn') && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{lang === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (BN)'}</label>
                  <input required type="text" value={formData.titleBn} onChange={e => setFormData({...formData, titleBn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#263238] outline-none" />
                </div>
              )}
              {(formData.edition === 'both' || formData.edition === 'en') && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{lang === 'bn' ? 'শিরোনাম (ইংরেজি)' : 'Title (EN)'}</label>
                  <input required type="text" value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#263238] outline-none" />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{lang === 'bn' ? 'ভিডিও লিঙ্ক (YouTube/Vimeo/FB)' : 'Video URL'}</label>
                <input 
                  required 
                  type="url" 
                  value={formData.videoUrl} 
                  onChange={e => {
                    const url = e.target.value;
                    const provider = detectVideoProvider(url);
                    setFormData({...formData, videoUrl: url, videoProvider: provider});
                  }} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#263238] outline-none"
                  placeholder="Paste video URL..."
                />
                {/* Direct upload from PC (self-hosted, native player) */}
                <div className="flex items-center gap-2 mt-2">
                  <label className={`inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${uploadingVideo ? 'opacity-60 cursor-wait border-gray-200 text-gray-400' : 'border-[#263238] text-[#263238] hover:bg-[#263238] hover:text-white'}`}>
                    {uploadingVideo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploadingVideo ? `${videoProgress}%` : (lang === 'bn' ? 'পিসি থেকে আপলোড' : 'Upload from PC')}
                    <input
                      type="file"
                      accept="video/*"
                      className="sr-only"
                      disabled={uploadingVideo}
                      onChange={(e) => { handleVideoUpload(e.target.files[0]); e.target.value = ''; }}
                    />
                  </label>
                  <span className="text-[10px] text-gray-400">{lang === 'bn' ? 'অথবা উপরে লিঙ্ক (সর্বোচ্চ ১০০MB)' : 'or paste a link (max 100MB)'}</span>
                </div>
                {formData.videoUrl && (formData.videoProvider === 'local' || formData.videoProvider === 'html5') && (
                  <video src={formData.videoUrl} controls className="w-full mt-2 rounded-lg bg-black max-h-40" />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{lang === 'bn' ? 'ভিডিওর দৈর্ঘ্য' : 'Duration (e.g. 05:20)'}</label>
                <input type="text" value={formData.videoDuration} onChange={e => setFormData({...formData, videoDuration: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#263238] outline-none" placeholder="00:00" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{lang === 'bn' ? 'ভিডিও সোর্স' : 'Provider'}</label>
                <div className="flex flex-wrap gap-2">
                  {['youtube', 'vimeo', 'facebook', 'dailymotion', 'local'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, videoProvider: p })}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        formData.videoProvider === p ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</label>
                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                  {EDITIONS.filter(e => e.value !== 'all').map((ed) => (
                    <button
                      key={ed.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, edition: ed.value })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        formData.edition === ed.value ? 'bg-white shadow-sm text-[#263238]' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {ed.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{lang === 'bn' ? 'থাম্বনেইল' : 'Thumbnail'}</label>
                <div className="flex gap-2">
                  <div className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 bg-gray-50 truncate">
                    {formData.thumbnail || (lang === 'bn' ? 'কোনো ছবি নেই' : 'No image selected')}
                  </div>
                  <button type="button" onClick={() => setShowMediaLibrary(true)} className="px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold transition-colors">
                    {lang === 'bn' ? 'ব্রাউজ' : 'Browse'}
                  </button>
                </div>
                {formData.thumbnail && (
                  <div className="mt-2 relative inline-block">
                    <img src={formData.thumbnail} alt="" className="w-24 h-16 object-cover rounded-lg border border-gray-100 shadow-sm" />
                    <button onClick={() => setFormData({...formData, thumbnail: ''})} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">{lang === 'bn' ? 'বাতিল' : 'Cancel'}</button>
                <button type="submit" disabled={loading} className="flex-[2] py-3 bg-[#263238] text-white rounded-xl text-sm font-bold shadow-lg shadow-red-50 hover:bg-[#1a2428] disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Video')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaLibraryModal 
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={onThumbnailSelect}
        initialType="image"
      />
    </div>
  );
}

