export default function VideoPlayer({ src, provider = 'youtube', title = '', poster }) {
  if (!src) return null;

  const isYoutube = provider === 'youtube' || src.includes('youtu');
  const isVimeo = provider === 'vimeo' || src.includes('vimeo');

  if (isYoutube) {
    let videoId = '';
    try {
      if (src.includes('embed/')) {
        videoId = src.split('embed/')[1].split('?')[0];
      } else {
        const url = new URL(src);
        videoId = url.searchParams.get('v') || url.pathname.replace('/', '');
      }
    } catch {
      videoId = src.split('/').pop().split('?')[0];
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-sm">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  if (isVimeo) {
    let videoId = '';
    try {
      videoId = src.split('/').pop().split('?')[0];
    } catch {
      videoId = src;
    }
    const embedUrl = `https://player.vimeo.com/video/${videoId}`;
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-sm">
        <iframe
          src={embedUrl}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg bg-black shadow-sm">
      <video
        src={src}
        poster={poster}
        controls
        className="w-full"
      >
        <track kind="captions" />
        {title && <p className="sr-only">{title}</p>}
      </video>
    </div>
  );
}
