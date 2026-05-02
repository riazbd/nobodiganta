import { getUniversalEmbedConfig } from '../../lib/video';

export default function VideoPlayer({ src, provider = null, title = '', poster }) {
  const config = getUniversalEmbedConfig(src, provider);
  
  if (!config) return null;

  if (config.type === 'iframe') {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-sm">
        <iframe
          src={config.src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-sm">
      <video
        src={config.src}
        poster={poster}
        controls
        className="w-full h-full"
      >
        <track kind="captions" />
        {title && <p className="sr-only">{title}</p>}
      </video>
    </div>
  );
}

