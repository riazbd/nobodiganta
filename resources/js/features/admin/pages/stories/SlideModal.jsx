// resources/js/features/admin/pages/stories/SlideModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Save } from 'lucide-react';

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
    const [saving, setSaving] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);

        const url = isEdit
            ? route('admin.stories.slides.update', { story: storyId, slide: slide.id })
            : route('admin.stories.slides.store', { story: storyId });

        const method = isEdit ? 'put' : 'post';

        router[method](url, form, {
            onSuccess: () => { onSaved(); onClose(); },
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="fixed inset-0 z-[9900] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-[#1a1d2e] font-bold text-base">{isEdit ? 'স্লাইড সম্পাদনা' : 'নতুন স্লাইড'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className={labelCls}>মিডিয়া আইডি (ছবি / ভিডিও) *</label>
                        <input type="number" required value={form.media_id}
                            onChange={e => setForm(f => ({ ...f, media_id: e.target.value }))}
                            placeholder="media.id"
                            className={inputCls}
                        />
                        <p className="text-gray-400 text-xs mt-1">মিডিয়া লাইব্রেরি থেকে আইডি কপি করুন</p>
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
                    <div>
                        <label className={labelCls}>সংযুক্ত নিবন্ধ আইডি (ঐচ্ছিক)</label>
                        <input type="number" value={form.linked_article_id}
                            onChange={e => setForm(f => ({ ...f, linked_article_id: e.target.value }))}
                            placeholder="article.id"
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={labelCls}>সময়কাল (সেকেন্ড) — শুধু ছবির জন্য</label>
                        <input type="number" min="1" max="30" value={form.duration}
                            onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}
                            className={inputCls}
                        />
                    </div>

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
        </div>
    );
}
