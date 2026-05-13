// resources/js/features/admin/pages/stories/SlideModal.jsx
import { useState } from 'react';
import { X, Save, Image as ImageIcon, Search } from 'lucide-react';
import MediaLibraryModal from '../../components/media/MediaLibraryModal';

const inputCls = 'w-full bg-gray-50 border border-gray-200 text-[#1a1d2e] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#263238] focus:bg-white transition-all';
const labelCls = 'text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block';

export default function SlideModal({ storyId, slide = null, onClose, onSaved }) {
    const isEdit = !!slide;
    const [form, setForm] = useState({
        media_id: slide?.media_id ?? '',
        text_overlay_bn: slide?.text_overlay_bn ?? '',
        text_overlay_en: slide?.text_overlay_en ?? '',
        linked_article_id: slide?.linked_article?.id ?? '',
        duration: slide?.duration ?? 5,
    });
    const [mediaPreview, setMediaPreview] = useState(
        slide?.media_thumbnail || slide?.media_url || null
    );
    const [isVideo, setIsVideo] = useState(slide?.is_video ?? false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [articleSearch, setArticleSearch] = useState(slide?.linked_article?.title ?? '');
    const [articleResults, setArticleResults] = useState([]);
    const [searchingArticles, setSearchingArticles] = useState(false);

    const handleMediaSelect = (media) => {
        const video = media.mime_type?.startsWith('video') || media.type === 'video';
        setForm(f => ({ ...f, media_id: media.id }));
        setMediaPreview(media.thumbnail_url || media.url);
        setIsVideo(video);
        setShowMediaPicker(false);
    };

    const searchArticles = async (q) => {
        setArticleSearch(q);
        if (q.length < 2) { setArticleResults([]); return; }
        setSearchingArticles(true);
        try {
            const res = await window.axios.get('/admin/api/articles', { params: { search: q, limit: 8 } });
            setArticleResults(res.data.data ?? res.data ?? []);
        } catch {
            setArticleResults([]);
        } finally {
            setSearchingArticles(false);
        }
    };

    const selectArticle = (article) => {
        setForm(f => ({ ...f, linked_article_id: article.id }));
        setArticleSearch(article.title_bn || article.title);
        setArticleResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.media_id) { setError('মিডিয়া বেছে নিন।'); return; }
        setSaving(true);
        setError(null);

        const url = isEdit
            ? route('admin.stories.slides.update', { story: storyId, slide: slide.id })
            : route('admin.stories.slides.store', { story: storyId });
        const method = isEdit ? 'put' : 'post';

        try {
            const res = await window.axios[method](url, form);
            onSaved(res.data.slide);
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message
                || Object.values(err.response?.data?.errors ?? {}).flat().join(' ')
                || 'সংরক্ষণ করতে সমস্যা হয়েছে।';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9900] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-[#1a1d2e] font-bold text-base">{isEdit ? 'স্লাইড সম্পাদনা' : 'নতুন স্লাইড'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
                    )}

                    {/* Media picker */}
                    <div>
                        <label className={labelCls}>মিডিয়া (ছবি / ভিডিও) *</label>
                        {mediaPreview ? (
                            <div className="relative rounded-xl overflow-hidden border border-gray-200 mb-2 bg-black">
                                {isVideo ? (
                                    <div className="w-full h-36 flex flex-col items-center justify-center gap-2 bg-gray-900">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                        <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Video</span>
                                    </div>
                                ) : (
                                    <img src={mediaPreview} alt="slide" className="w-full h-36 object-cover" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => setShowMediaPicker(true)}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-bold"
                                >
                                    পরিবর্তন করুন
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowMediaPicker(true)}
                                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center gap-2 text-gray-400 hover:border-[#263238] hover:text-[#263238] transition-colors mb-2"
                            >
                                <ImageIcon className="w-7 h-7" />
                                <span className="text-xs font-semibold">মিডিয়া লাইব্রেরি থেকে বেছে নিন</span>
                            </button>
                        )}
                        {mediaPreview && (
                            <button type="button" onClick={() => setShowMediaPicker(true)}
                                className="text-xs text-gray-400 hover:text-[#263238] underline">
                                মিডিয়া পরিবর্তন করুন
                            </button>
                        )}
                    </div>

                    <div>
                        <label className={labelCls}>টেক্সট ওভারলে (বাংলা)</label>
                        <input type="text" value={form.text_overlay_bn}
                            onChange={e => setForm(f => ({ ...f, text_overlay_bn: e.target.value }))}
                            placeholder="ছবির উপর টেক্সট..."
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>টেক্সট ওভারলে (ইংরেজি)</label>
                        <input type="text" value={form.text_overlay_en}
                            onChange={e => setForm(f => ({ ...f, text_overlay_en: e.target.value }))}
                            placeholder="Text overlay in English..."
                            className={inputCls}
                        />
                    </div>

                    {/* Article search */}
                    <div>
                        <label className={labelCls}>সংযুক্ত নিবন্ধ (ঐচ্ছিক)</label>
                        <div className="relative">
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 gap-2 focus-within:border-[#263238] focus-within:bg-white transition-all">
                                <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={articleSearch}
                                    onChange={e => searchArticles(e.target.value)}
                                    placeholder="নিবন্ধ খুঁজুন..."
                                    className="border-none bg-transparent outline-none text-sm w-full"
                                />
                                {form.linked_article_id && (
                                    <button type="button" onClick={() => {
                                        setForm(f => ({ ...f, linked_article_id: '' }));
                                        setArticleSearch('');
                                    }} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                                )}
                            </div>
                            {articleResults.length > 0 && (
                                <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                                    {articleResults.map(a => (
                                        <button
                                            key={a.id}
                                            type="button"
                                            onClick={() => selectArticle(a)}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-50 last:border-0 text-[#1a1d2e]"
                                        >
                                            {a.title_bn || a.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {searchingArticles && (
                                <div className="text-xs text-gray-400 mt-1">খুঁজছে...</div>
                            )}
                        </div>
                    </div>

                    {!isVideo && (
                        <div>
                            <label className={labelCls}>সময়কাল (সেকেন্ড)</label>
                            <input type="number" min="1" max="30" value={form.duration}
                                onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}
                                className={inputCls}
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-2 border-t border-gray-50">
                        <button type="button" onClick={onClose}
                            className="flex-1 bg-gray-100 text-gray-700 text-sm py-2.5 rounded-xl hover:bg-gray-200 transition-colors font-semibold">
                            বাতিল
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 bg-[#263238] text-white text-sm py-2.5 rounded-xl hover:bg-[#1a2428] transition-colors disabled:opacity-50 font-bold flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" />
                            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                        </button>
                    </div>
                </form>
            </div>

            <MediaLibraryModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={handleMediaSelect}
            />
        </div>
    );
}
