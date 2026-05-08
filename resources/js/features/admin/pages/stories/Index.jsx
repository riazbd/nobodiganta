// resources/js/features/admin/pages/stories/Index.jsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PlaySquare, Search, Plus } from 'lucide-react';

const STATUS_TABS = [
    { key: '', label: 'সব' },
    { key: 'published', label: 'প্রকাশিত' },
    { key: 'draft', label: 'ড্রাফট' },
    { key: 'expired', label: 'মেয়াদোত্তীর্ণ' },
    { key: 'archived', label: 'আর্কাইভ' },
];

const STATUS_COLORS = {
    published: 'bg-green-50 text-green-700 border border-green-200',
    draft:     'bg-yellow-50 text-yellow-700 border border-yellow-200',
    expired:   'bg-red-50 text-red-700 border border-red-200',
    archived:  'bg-gray-100 text-gray-500 border border-gray-200',
};

const STATUS_LABELS = {
    published: 'প্রকাশিত',
    draft:     'ড্রাফট',
    expired:   'মেয়াদোত্তীর্ণ',
    archived:  'আর্কাইভ',
};

export default function StoriesIndex({ stories, filters, can }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (params) => {
        router.get(route('admin.stories'), { ...filters, ...params }, { preserveState: true });
    };

    const handlePublish = (story) => {
        if (!confirm('এই স্টোরি প্রকাশ করবেন?')) return;
        router.post(route('admin.stories.publish', story.id), {}, { preserveScroll: true });
    };

    const handleRestore = (story) => {
        if (!confirm('এই স্টোরি পুনরায় প্রকাশ করবেন?')) return;
        router.post(route('admin.stories.restore', story.id), {}, { preserveScroll: true });
    };

    const handleDelete = (story) => {
        if (!confirm('এই স্টোরি মুছে ফেলবেন?')) return;
        router.delete(route('admin.stories.destroy', story.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title="স্টোরিজ ম্যানেজমেন্ট" />
            <div className="p-6 max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-[#1a1d2e] flex items-center gap-2.5">
                        <PlaySquare className="w-6 h-6 text-[#263238]" />
                        স্টোরিজ ম্যানেজমেন্ট
                    </h1>
                    {can.create && (
                        <Link href={route('admin.stories.create')}
                            className="bg-[#263238] hover:bg-[#1a2428] text-white text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm font-bold">
                            <Plus className="w-4 h-4" /> নতুন স্টোরি
                        </Link>
                    )}
                </div>

                {/* Filter bar */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-4">
                    {/* Search */}
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 gap-2.5 mb-3 focus-within:border-[#263238]/40 focus-within:bg-white transition-all">
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilter({ search, page: 1 })}
                            placeholder="স্টোরি খুঁজুন..."
                            className="border-none bg-transparent outline-none text-sm w-full placeholder:text-gray-400 text-[#1a1d2e]"
                        />
                    </div>

                    {/* Status tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {STATUS_TABS.map(tab => (
                            <button key={tab.key}
                                onClick={() => applyFilter({ status: tab.key, page: 1 })}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                    (filters.status ?? '') === tab.key
                                        ? 'bg-[#263238] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stories list */}
                <div className="space-y-2">
                    {stories.data?.length === 0 && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-sm">
                            কোনো স্টোরি নেই।
                        </div>
                    )}
                    {stories.data?.map(story => (
                        <div key={story.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                {story.cover_thumbnail
                                    ? <img src={story.cover_thumbnail} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[#1a1d2e] text-sm font-semibold truncate">{story.title_bn}</p>
                                <p className="text-gray-400 text-xs mt-0.5">
                                    {story.slides_count}টি স্লাইড · {story.creator_name}
                                    {story.expires_at && ` · মেয়াদ: ${new Date(story.expires_at).toLocaleDateString('bn-BD')}`}
                                </p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[story.status]}`}>
                                {STATUS_LABELS[story.status]}
                            </span>
                            <div className="flex gap-2 flex-shrink-0">
                                <Link href={route('admin.stories.edit', story.id)}
                                    className="text-gray-600 hover:text-[#263238] text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg transition-colors font-medium">
                                    সম্পাদনা
                                </Link>
                                {can.publish && story.status === 'draft' && (
                                    <button onClick={() => handlePublish(story)}
                                        className="text-green-700 text-xs px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium">
                                        প্রকাশ
                                    </button>
                                )}
                                {can.restore && story.status === 'expired' && (
                                    <button onClick={() => handleRestore(story)}
                                        className="text-blue-700 text-xs px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                        পুনরায় প্রকাশ
                                    </button>
                                )}
                                {can.delete && (
                                    <button onClick={() => handleDelete(story)}
                                        className="text-red-600 text-xs px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium">
                                        মুছুন
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {stories.links && stories.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {stories.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    link.active
                                        ? 'bg-[#263238] text-white'
                                        : link.url
                                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                preserveScroll
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
