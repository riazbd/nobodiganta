import { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Edit3, Search, X, Loader2, Image as ImageIcon, Save } from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { router } from '@inertiajs/react';
import MediaLibraryModal from '../components/media/MediaLibraryModal';

const EMPTY_PHOTO = { url: '', caption_bn: '', caption_en: '' };

const EMPTY_FORM = () => ({
  title_bn: '',
  title_en: '',
  cover: '',
  edition: 'both',
  photos: [{ ...EMPTY_PHOTO }],
});

const EDITIONS = [
  { value: 'all',  labelBn: 'সব সংস্করণ', labelEn: 'All Editions' },
  { value: 'bn',   labelBn: 'বাংলা',       labelEn: 'Bangla' },
  { value: 'en',   labelBn: 'ইংরেজি',      labelEn: 'English' },
  { value: 'both', labelBn: 'দুই সংস্করণ', labelEn: 'Both' },
];

export default function Photos({ initialPhotos = [], filters = {} }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery]   = useState(filters.search || '');
  const [editionFilter, setEditionFilter] = useState(filters.edition || 'all');
  const [photos, setPhotos]             = useState(initialPhotos);
  const [loading, setLoading]           = useState(false);
  const [showModal, setShowModal]       = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM());
  const [errors, setErrors]             = useState({});

  // Media library modal state: null | 'cover' | number (photo index)
  const [mediaTarget, setMediaTarget]   = useState(null);

  useEffect(() => { setPhotos(initialPhotos); }, [initialPhotos]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.get(route('admin.photos'), {
        search:  searchQuery || undefined,
        edition: editionFilter !== 'all' ? editionFilter : undefined,
      }, { preserveState: true, replace: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, editionFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM());
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (photo) => {
    setEditingId(photo.id);
    setForm({
      title_bn: photo.title_bn || '',
      title_en: photo.title_en || '',
      cover:    photo.cover    || '',
      edition:  photo.edition  || 'both',
      photos:   photo.photos?.length ? photo.photos : [{ ...EMPTY_PHOTO }],
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => { if (loading) return; setShowModal(false); setEditingId(null); };

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const updatePhoto = (idx, field, val) => {
    setForm(f => ({
      ...f,
      photos: f.photos.map((p, i) => i === idx ? { ...p, [field]: val } : p),
    }));
  };

  const addPhoto    = () => setForm(f => ({ ...f, photos: [...f.photos, { ...EMPTY_PHOTO }] }));
  const removePhoto = (idx) => setForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));

  const movePhoto = (idx, dir) => {
    const next = [...form.photos];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setForm(f => ({ ...f, photos: next }));
  };

  const handleMediaSelect = (media) => {
    if (mediaTarget === 'cover') {
      setField('cover', media.url);
    } else if (typeof mediaTarget === 'number') {
      updatePhoto(mediaTarget, 'url', media.url);
    }
    setMediaTarget(null);
  };

  const handleSubmit = () => {
    setLoading(true);
    setErrors({});
    const payload = form;
    if (editingId) {
      router.put(route('admin.photos.update', { article: editingId }), payload, {
        onSuccess: () => { setLoading(false); closeModal(); showToast(lang === 'bn' ? 'আপডেট হয়েছে' : 'Updated'); },
        onError:   (errs) => { setLoading(false); setErrors(errs); },
      });
    } else {
      router.post(route('admin.photos.store'), payload, {
        onSuccess: () => { setLoading(false); closeModal(); showToast(lang === 'bn' ? 'গ্যালারি তৈরি হয়েছে' : 'Gallery created'); },
        onError:   (errs) => { setLoading(false); setErrors(errs); },
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm(lang === 'bn' ? 'এই ফটো গ্যালারিটি মুছে ফেলবেন?' : 'Delete this photo gallery?')) {
      router.delete(route('admin.photos.destroy', { article: id }), {
        onSuccess: () => showToast(lang === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted'),
      });
    }
  };

  const edLabel = (val) => {
    const ed = EDITIONS.find(e => e.value === val);
    return ed ? (lang === 'bn' ? ed.labelBn : ed.labelEn) : val;
  };

  return (
    <div className="font-['Noto_Sans_Bengali']">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1d2e] flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {lang === 'bn' ? 'ফটো গ্যালারি' : 'Photo Gallery'}
          </h1>
          <p className="text-[12.5px] text-gray-400 mt-0.5">{photos.length} {lang === 'bn' ? 'টি গ্যালারি' : 'galleries'}</p>
        </div>
        <button onClick={openCreate} className="bg-[#263238] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#1a2428] transition-colors">
          <Plus className="w-4 h-4" /> {lang === 'bn' ? 'নতুন গ্যালারি' : 'New Gallery'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 flex-1 max-w-sm shadow-sm">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder={lang === 'bn' ? 'গ্যালারি খুঁজুন...' : 'Search galleries...'}
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="border-none bg-transparent outline-none text-sm w-full" />
          {searchQuery && <button onClick={() => setSearchQuery('')}><X className="w-4 h-4 text-gray-400" /></button>}
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 gap-1 shadow-sm">
          {EDITIONS.map(ed => (
            <button key={ed.value} onClick={() => setEditionFilter(ed.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${editionFilter === ed.value ? 'bg-[#263238] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              {lang === 'bn' ? ed.labelBn : ed.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery grid */}
      {photos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Camera size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">{lang === 'bn' ? 'কোনো ফটো গ্যালারি নেই' : 'No photo galleries yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {photos.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden group flex flex-col">
              <div className="relative">
                {p.cover ? (
                  <img src={p.cover} alt="" className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {p.photo_count} {lang === 'bn' ? 'ছবি' : 'photos'}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
                  {lang === 'bn' ? p.title_bn : (p.title_en || p.title_bn)}
                </h3>
                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue">{edLabel(p.edition)}</Badge>
                    <span className="text-[10px] text-gray-400">{p.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Camera size={20} />
                {editingId ? (lang === 'bn' ? 'গ্যালারি সম্পাদনা' : 'Edit Gallery') : (lang === 'bn' ? 'নতুন ফটো গ্যালারি' : 'New Photo Gallery')}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Titles */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">শিরোনাম (বাংলা) *</label>
                  <input type="text" value={form.title_bn} onChange={e => setField('title_bn', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238] ${errors.title_bn ? 'border-red-400' : 'border-gray-200'}`} />
                  {errors.title_bn && <p className="text-red-500 text-xs mt-1">{errors.title_bn}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title (English)</label>
                  <input type="text" value={form.title_en} onChange={e => setField('title_en', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#263238]" />
                </div>
              </div>

              {/* Edition */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{lang === 'bn' ? 'সংস্করণ' : 'Edition'}</label>
                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                  {EDITIONS.filter(e => e.value !== 'all').map(ed => (
                    <button key={ed.value} type="button" onClick={() => setField('edition', ed.value)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.edition === ed.value ? 'bg-white shadow-sm text-[#263238]' : 'text-gray-400 hover:text-gray-600'}`}>
                      {lang === 'bn' ? ed.labelBn : ed.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <ImageIcon size={12} /> {lang === 'bn' ? 'কভার ছবি' : 'Cover Image'}
                </label>
                {form.cover ? (
                  <div className="relative mb-2">
                    <img src={form.cover} alt="cover" className="w-full h-32 object-cover rounded-xl border border-gray-100" />
                    <button type="button" onClick={() => setField('cover', '')}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow text-gray-500 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ) : null}
                <button type="button" onClick={() => setMediaTarget('cover')}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:border-[#263238] hover:text-[#263238] transition-colors flex items-center justify-center gap-2">
                  <ImageIcon size={15} />
                  {form.cover ? (lang === 'bn' ? 'কভার পরিবর্তন করুন' : 'Change Cover') : (lang === 'bn' ? 'মিডিয়া লাইব্রেরি থেকে কভার বেছে নিন' : 'Select Cover from Media Library')}
                </button>
              </div>

              {/* Photos list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase">{lang === 'bn' ? 'ছবিসমূহ' : 'Photos'} *</label>
                  <button type="button" onClick={addPhoto} className="text-xs font-bold text-[#263238] hover:underline">
                    + {lang === 'bn' ? 'ছবি যোগ করুন' : 'Add Photo'}
                  </button>
                </div>
                {errors.photos && <p className="text-red-500 text-xs mb-2">{errors.photos}</p>}

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {form.photos.map((photo, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex gap-2 items-start">
                        {/* Thumbnail preview */}
                        <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border border-gray-200" onClick={() => setMediaTarget(idx)}>
                          {photo.url ? (
                            <img src={photo.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={16} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <button type="button" onClick={() => setMediaTarget(idx)}
                            className="text-xs text-[#263238] font-bold hover:underline">
                            {photo.url ? (lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change photo') : (lang === 'bn' ? 'ছবি বেছে নিন' : 'Select photo')}
                          </button>
                          <input type="text" value={photo.caption_bn} onChange={e => updatePhoto(idx, 'caption_bn', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238] bg-white"
                            placeholder={lang === 'bn' ? 'ক্যাপশন (বাংলা)' : 'Caption (BN)'} />
                          <input type="text" value={photo.caption_en} onChange={e => updatePhoto(idx, 'caption_en', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238] bg-white"
                            placeholder="Caption (EN)" />
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button type="button" onClick={() => movePhoto(idx, -1)} disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs leading-none">▲</button>
                          <button type="button" onClick={() => movePhoto(idx, 1)} disabled={idx === form.photos.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs leading-none">▼</button>
                          {form.photos.length > 1 && (
                            <button type="button" onClick={() => removePhoto(idx)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="w-full bg-[#263238] text-white rounded-xl py-3.5 text-sm font-bold shadow-lg hover:bg-[#1a2428] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                {editingId ? (lang === 'bn' ? 'আপডেট করুন' : 'Update Gallery') : (lang === 'bn' ? 'গ্যালারি প্রকাশ করুন' : 'Publish Gallery')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={handleMediaSelect}
        initialType="image"
      />
    </div>
  );
}
