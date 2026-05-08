import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import PageSidebar from '../Components/PageSidebar';
import StoryViewer from '../Components/StoryViewer';

export default function Stories({ stories }) {
    const { lang } = useApp();
    const [activeIndex, setActiveIndex] = useState(null);

    const items = stories?.data ?? stories ?? [];

    return (
        <>
            <Head title={lang === 'bn' ? 'স্টোরিজ' : 'Stories'} />

            <div className="g-side">
                <div>
                    <div className="sec-hdr">
                        <div className="sec-ttl">{lang === 'bn' ? 'সকল স্টোরিজ' : 'All Stories'}</div>
                    </div>

                    {items.length === 0 ? (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>
                            {lang === 'bn' ? 'এখনো কোনো স্টোরি নেই।' : 'No stories yet.'}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                            {items.map((story, index) => (
                                <button
                                    key={story.id}
                                    onClick={() => setActiveIndex(index)}
                                    style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
                                >
                                    <div style={{ aspectRatio: '9/16', borderRadius: 10, overflow: 'hidden', position: 'relative', background: '#222' }}>
                                        {story.cover ? (
                                            <img
                                                src={story.cover}
                                                alt={story.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#3b82f6,#7c3aed)' }} />
                                        )}
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 50%)' }} />
                                        <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 10 }}>
                                            {story.slides_count}{lang === 'bn' ? 'টি' : ''}
                                        </div>
                                        <p style={{ position: 'absolute', bottom: 6, left: 6, right: 6, color: '#fff', fontSize: 10, fontWeight: 700, lineHeight: 1.3, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {story.title}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {stories?.links && stories.links.length > 3 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
                            {stories.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: 6,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        background: link.active ? 'var(--red)' : '#f0f0f0',
                                        color: link.active ? '#fff' : '#333',
                                        textDecoration: 'none',
                                        pointerEvents: link.url ? 'auto' : 'none',
                                        opacity: link.url ? 1 : 0.4,
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    preserveScroll
                                />
                            ))}
                        </div>
                    )}
                </div>

                <PageSidebar />
            </div>

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
