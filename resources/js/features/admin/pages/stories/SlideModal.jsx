// resources/js/features/admin/pages/stories/SlideModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';

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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-semibold">{isEdit ? 'স্লাইড সম্পাদনা' : 'নতুন স্লাইড'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">মিডিয়া আইডি (ছবি / ভিডিও) *</label>
                        <input type="number" required value={form.media_id}
                            onChange={e => setForm(f => ({ ...f, media_id: e.target.value }))}
                            placeholder="media.id"
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        />
                        <p className="text-gray-500 text-xs mt-1">মিডিয়া লাইব্রেরি থেকে আইডি কপি করুন</p>
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">টেক্সট ওভারলে (বাংলা)</label>
                        <input type="text" value={form.text_overlay_bn}
                            onChange={e => setForm(f => ({ ...f, text_overlay_bn: e.target.value }))}
                            placeholder="ছবির উপর টেক্সট..."
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">টেক্সট ওভারলে (ইংরেজি)</label>
                        <input type="text" value={form.text_overlay_en}
                            onChange={e => setForm(f => ({ ...f, text_overlay_en: e.target.value }))}
                            placeholder="Text overlay in English..."
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">সংযুক্ত নিবন্ধ আইডি (ঐচ্ছিক)</label>
                        <input type="number" value={form.linked_article_id}
                            onChange={e => setForm(f => ({ ...f, linked_article_id: e.target.value }))}
                            placeholder="article.id (optional)"
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">সময়কাল (সেকেন্ড) — শুধু ছবির জন্য</label>
                        <input type="number" min="1" max="30" value={form.duration}
                            onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 bg-gray-700 text-gray-300 text-sm py-2.5 rounded-lg hover:bg-gray-600 transition-colors">
                            বাতিল
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 bg-indigo-600 text-white text-sm py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
