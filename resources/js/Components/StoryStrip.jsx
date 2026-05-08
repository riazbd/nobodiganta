// resources/js/Components/StoryStrip.jsx
import { useState } from 'react';
import StoryViewer from './StoryViewer';

export default function StoryStrip({ stories = [], title = 'স্টোরিজ' }) {
    const [activeIndex, setActiveIndex] = useState(null);

    if (!stories.length) return null;

    return (
        <>
            <div className="stories-strip bg-gray-900 px-4 py-3 rounded-lg">
                {title && (
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-medium">
                        {title}
                    </p>
                )}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {stories.map((story, index) => (
                        <button
                            key={story.id}
                            onClick={() => setActiveIndex(index)}
                            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
                        >
                            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600">
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-900">
                                    {story.cover_thumbnail ? (
                                        <img
                                            src={story.cover_thumbnail}
                                            alt={story.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                                    )}
                                </div>
                            </div>
                            <span className="text-gray-300 text-[10px] max-w-[70px] text-center line-clamp-1">
                                {story.title}
                            </span>
                        </button>
                    ))}
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
