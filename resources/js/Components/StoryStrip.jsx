// resources/js/Components/StoryStrip.jsx
import { useState, useRef } from 'react';
import StoryViewer from './StoryViewer';

export default function StoryStrip({ stories = [], title = 'স্টোরিজ' }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const scrollRef = useRef(null);

    if (!stories.length) return null;

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
        }
    };

    return (
        <>
            <div className="stories-strip px-4 py-3">
                {title && (
                    <p className="text-base font-bold text-gray-800 mb-3">
                        {title}
                    </p>
                )}
                <div className="relative">
                    {/* Prev */}
                    <button
                        onClick={() => scroll(-1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-md transition-all"
                    >‹</button>

                    <div ref={scrollRef} className="flex flex-nowrap gap-3 overflow-x-auto pb-2 px-1" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
                        {stories.map((story, index) => (
                            <button
                                key={story.id}
                                onClick={() => setActiveIndex(index)}
                                className="flex-shrink-0 cursor-pointer group w-24"
                            >
                                <div className="aspect-[9/16] rounded-xl overflow-hidden relative bg-gray-800 ring-2 ring-transparent group-hover:ring-indigo-500 transition-all duration-200">
                                    {story.cover_thumbnail ? (
                                        <img
                                            src={story.cover_thumbnail}
                                            alt={story.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" />
                                    <p className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold leading-tight line-clamp-2">
                                        {story.title}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Next */}
                    <button
                        onClick={() => scroll(1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-md transition-all"
                    >›</button>
                </div>
            </div>

            {activeIndex !== null && (
                <StoryViewer
                    stories={stories}
                    initialIndex={activeIndex}
                    onClose={() => setActiveIndex(null)}
                />
            )}
        </>
    );
}
