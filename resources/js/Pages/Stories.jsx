// resources/js/Pages/Stories.jsx
import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import StoryViewer from '@/Components/StoryViewer';

export default function Stories({ stories, edition = 'bn' }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const items = stories.data ?? stories;

    return (
        <>
            <Head title={edition === 'en' ? 'All Stories' : 'সকল স্টোরিজ'} />
            <Header />

            <main className="min-h-screen bg-gray-950 py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-white text-2xl font-bold mb-1">
                        {edition === 'en' ? 'All Stories' : 'সকল স্টোরিজ'}
                    </h1>
                    <p className="text-gray-400 text-sm mb-8">
                        {edition === 'en' ? 'Stories' : 'স্টোরিজ'}
                    </p>

                    {items.length === 0 ? (
                        <p className="text-gray-500 text-center py-20">
                            {edition === 'en' ? 'No stories yet.' : 'এখনো কোনো স্টোরি নেই।'}
                        </p>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {items.map((story, index) => (
                                <button
                                    key={story.id}
                                    onClick={() => setActiveIndex(index)}
                                    className="group cursor-pointer text-left"
                                >
                                    <div className="aspect-[9/16] rounded-xl overflow-hidden relative bg-gray-800">
                                        {story.cover ? (
                                            <img
                                                src={story.cover}
                                                alt={story.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                                            {story.slides_count}{edition === 'en' ? '' : 'টি'}
                                        </div>
                                        <p className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold leading-tight line-clamp-2">
                                            {story.title}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {/* Pagination */}
                {stories.links && stories.links.length > 3 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {stories.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    link.active
                                        ? 'bg-indigo-600 text-white'
                                        : link.url
                                            ? 'bg-gray-800 text-gray-300 hover:text-white'
                                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                preserveScroll
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />

            {activeIndex !== null && (
                <StoryViewer
                    stories={items}
                    initialIndex={activeIndex}
                    onClose={() => setActiveIndex(null)}
                />
            )}
        </>
    );
}
