// resources/js/features/admin/pages/stories/Form.jsx
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Save, Send, Plus, Trash2, Edit2, PlaySquare } from 'lucide-react';
import SlideModal from './SlideModal';

const inputCls = 'w-full bg-gray-50 border border-gray-200 text-[#1a1d2e] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#263238] focus:bg-white transition-all';
const labelCls = 'text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block';

export default function StoryForm({ story, can }) {
    const isEdit = !!story;
    const [form, setForm] = useState({
        title_bn: story?.title_bn ?? '',
        title_en: story?.title_en ?? '',
        cover_media_id: story?.cover_media_id ?? '',
        edition: story?.edition ?? 'bn',
        expires_at: story?.expires_at ? story.expires_at.substring(0, 16) : '',
    });
    const [slides, setSlides] = useState(story?.slides ?? []);
    const [showSlideModal, setShowSlideModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        if (isEdit) {
            router.put(route('admin.stories.update', story.id), form, {
                onFinish: () => setSaving(false),
            });
        } else {
            router.post(route('admin.stories.store'), form, {
                onFinish: () => setSaving(false),
            });
        }
    };

    const handlePublish = () => {
        if (!confirm('এই স্টোরি প্রকাশ করবেন?')) return;
        router.post(route('admin.stories.publish', story.id));
    };

    const handleDeleteSlide = (slide) => {
        if (!confirm('এই স্লাইড মুছবেন?')) return;
        router.delete(route('admin.stories.slides.destroy', { story: story.id, slide: slide.id }), {
            onSuccess: () => setSlides(s => s.filter(sl => sl.id !== slide.id)),
            preserveScroll: true,
        });
    };

    const refreshSlides = () => {
        router.reload({ only: ['story'], onSuccess: (page) => {
            setSlides(page.props.story?.slides ?? []);
        }});
    };

    return (
        <>
            <Head title={isEdit ? 'স্টোরি সম্পাদনা' : 'নতুন স্টোরি'} />
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-2.5 mb-6">
                    <PlaySquare className="w-6 h-6 text-[#263238]" />
                    {isEdit ? 'স্টোরি সম্পাদনা' : 'নতুন স্টোরি'}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: metadata */}
                    <div className="space-y-4">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-4">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-50 pb-2">স্টোরি তথ্য</h2>

                            <div>
                                <label className={labelCls}>শিরোনাম (বাংলা) *</label>
                                <input type="text" value={form.title_bn}
                                    onChange={e => setForm(f => ({ ...f, title_bn: e.target.value }))}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>শিরোনাম (ইংরেজি)</label>
                                <input type="text" value={form.title_en}
                                    onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))}
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>কভার মিডিয়া আইডি</label>
                                <input type="number" value={form.cover_media_id}
                                    onChange={e => setForm(f => ({ ...f, cover_media_id: e.target.value }))}
                                    placeholder="media.id"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>ভাষা</label>
                                <select value={form.edition}
                                    onChange={e => setForm(f => ({ ...f, edition: e.target.value }))}
                                    className={inputCls}>
                                    <option value="bn">বাংলা</option>
                                    <option value="en">English</option>
                                    <option value="both">উভয়</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>মেয়াদ শেষ (ঐচ্ছিক)</label>
                                <input type="datetime-local" value={form.expires_at}
                                    onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                                    className={inputCls}
                                />
                            </div>
                        </div>

                        <button onClick={handleSave} disabled={saving}
                            className="w-full bg-[#263238] hover:bg-[#1a2428] text-white text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 font-bold shadow-sm">
                            <Save className="w-4 h-4" />
                            {saving ? 'সংরক্ষণ হচ্ছে...' : 'ড্রাফট সংরক্ষণ'}
                        </button>

                        {can.publish && isEdit && story.status === 'draft' && (
                            <button onClick={handlePublish}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold">
                                <Send className="w-4 h-4" /> প্রকাশ করুন
                            </button>
                        )}
                    </div>

                    {/* Right: slide builder */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                            <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-3">
                                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">স্লাইডসমূহ</h2>
                                {isEdit && (
                                    <button onClick={() => { setEditingSlide(null); setShowSlideModal(true); }}
                                        className="text-[#263238] text-xs font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                                        <Plus className="w-3.5 h-3.5" /> স্লাইড যোগ করুন
                                    </button>
                                )}
                            </div>

                            {!isEdit && (
                                <p className="text-gray-400 text-sm text-center py-8">
                                    প্রথমে ড্রাফট সংরক্ষণ করুন, তারপর স্লাইড যোগ করুন।
                                </p>
                            )}

                            <div className="space-y-2">
                                {slides.map((slide, i) => (
                                    <div key={slide.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                                        <span className="text-gray-400 text-xs font-bold w-5 flex-shrink-0">{i + 1}</span>
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                            {slide.media_thumbnail
                                                ? <img src={slide.media_thumbnail} alt="" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                                    {slide.is_video ? '▶' : '🖼'}
                                                  </div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[#1a1d2e] text-xs font-semibold">
                                                স্লাইড {i + 1} · {slide.is_video ? 'ভিডিও' : `ছবি · ${slide.duration}সে`}
                                            </p>
                                            {slide.text_overlay && (
                                                <p className="text-gray-500 text-xs truncate">{slide.text_overlay}</p>
                                            )}
                                        </div>
                                        <button onClick={() => { setEditingSlide(slide); setShowSlideModal(true); }}
                                            className="text-gray-500 hover:text-[#263238] p-1.5 hover:bg-gray-200 rounded transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleDeleteSlide(slide)}
                                            className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}

                                {isEdit && slides.length === 0 && (
                                    <p className="text-gray-400 text-sm text-center py-8">
                                        এখনো কোনো স্লাইড নেই।
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showSlideModal && (
                <SlideModal
                    storyId={story.id}
                    slide={editingSlide}
                    onClose={() => { setShowSlideModal(false); setEditingSlide(null); }}
                    onSaved={refreshSlides}
                />
            )}
        </>
    );
}
