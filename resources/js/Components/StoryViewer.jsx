// resources/js/Components/StoryViewer.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link, router } from '@inertiajs/react';

export default function StoryViewer({ stories, initialIndex = 0, onClose }) {
    const [storyIndex, setStoryIndex] = useState(initialIndex);
    const [slideIndex, setSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const currentStory = stories[storyIndex];
    const currentSlide = currentStory?.slides?.[slideIndex];
    const isVideo = currentSlide?.is_video;
    const duration = (currentSlide?.duration ?? 5) * 1000;

    const goNextSlide = useCallback(() => {
        if (slideIndex < (currentStory.slides?.length ?? 0) - 1) {
            setSlideIndex(s => s + 1);
            setProgress(0);
        } else if (storyIndex < stories.length - 1) {
            setStoryIndex(s => s + 1);
            setSlideIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    }, [slideIndex, storyIndex, currentStory, stories.length, onClose]);

    const goPrevSlide = useCallback(() => {
        if (slideIndex > 0) {
            setSlideIndex(s => s - 1);
            setProgress(0);
        } else if (storyIndex > 0) {
            setStoryIndex(s => s - 1);
            setSlideIndex(0);
            setProgress(0);
        }
    }, [slideIndex, storyIndex]);

    // Auto-advance timer for photo slides
    useEffect(() => {
        if (isVideo) return;
        clearInterval(timerRef.current);
        startTimeRef.current = Date.now();
        setProgress(0);

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const pct = Math.min((elapsed / duration) * 100, 100);
            setProgress(pct);
            if (pct >= 100) {
                clearInterval(timerRef.current);
                goNextSlide();
            }
        }, 50);

        return () => clearInterval(timerRef.current);
    }, [slideIndex, storyIndex, isVideo, duration, goNextSlide]);

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowRight') goNextSlide();
            if (e.key === 'ArrowLeft') goPrevSlide();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goNextSlide, goPrevSlide, onClose]);

    if (!currentStory || !currentSlide) return null;

    const totalSlides = currentStory.slides?.length ?? 0;

    return createPortal(
        <div className="fixed inset-0 bg-black flex items-center justify-center" style={{ zIndex: 9800 }}>
            {/* Story container — mobile-style portrait */}
            <div className="relative w-full max-w-sm h-full max-h-[90vh] bg-black overflow-hidden rounded-lg select-none">

                {/* Progress bars */}
                <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
                    {currentStory.slides?.map((_, i) => (
                        <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-none"
                                style={{
                                    width: i < slideIndex ? '100%' : i === slideIndex ? `${progress}%` : '0%',
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-7 left-3 right-3 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50">
                            {currentStory.cover_thumbnail ? (
                                <img src={currentStory.cover_thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-white text-xs font-semibold leading-none">{currentStory.title}</p>
                            <p className="text-white/60 text-[10px] mt-0.5">{slideIndex + 1} / {totalSlides}</p>
                        </div>
                    </div>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        router.get('/stories');
                    }} className="text-white/80 hover:text-white text-xl leading-none p-1">✕</button>
                </div>

                {/* Slide media */}
                <div className="w-full h-full">
                    {isVideo ? (
                        <video
                            key={currentSlide.id}
                            src={currentSlide.media_url}
                            className="w-full h-full object-cover"
                            autoPlay
                            playsInline
                            muted={false}
                            onEnded={goNextSlide}
                        />
                    ) : (
                        <img
                            key={currentSlide.id}
                            src={currentSlide.media_url}
                            alt={currentSlide.text_overlay ?? ''}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                {/* Text overlay + article link */}
                <div className="absolute bottom-6 left-4 right-4 z-20">
                    {currentSlide.text_overlay && (
                        <p className="text-white text-sm font-semibold mb-3 leading-snug drop-shadow">
                            {currentSlide.text_overlay}
                        </p>
                    )}
                    {currentSlide.linked_article && (
                        <Link
                            href={`/${currentSlide.linked_article.category_slug}/${currentSlide.linked_article.slug}`}
                            className="inline-block bg-white/20 border border-white/40 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
                        >
                            পুরো খবর পড়ুন →
                        </Link>
                    )}
                </div>

                {/* Tap zones */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={goPrevSlide} />
                <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={goNextSlide} />

                {/* Story navigation arrows (desktop) */}
                {storyIndex > 0 && (
                    <button
                        onClick={() => { setStoryIndex(s => s - 1); setSlideIndex(0); setProgress(0); }}
                        className="absolute left-[-48px] top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-2xl hidden md:block"
                    >‹</button>
                )}
                {storyIndex < stories.length - 1 && (
                    <button
                        onClick={() => { setStoryIndex(s => s + 1); setSlideIndex(0); setProgress(0); }}
                        className="absolute right-[-48px] top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-2xl hidden md:block"
                    >›</button>
                )}
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    , document.body);
}
