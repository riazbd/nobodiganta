import Icon from '../Icon';

/**
 * Renders an article thumbnail inside a position:relative wrapper.
 * The wrapper fills its parent (width/height/aspectRatio can be passed explicitly).
 * Play button overlay is shown for video articles.
 */
export default function ArticleThumb({ src, alt = '', isVideo = false, width, height, aspectRatio, style = {} }) {
  const wrapStyle = {
    position: 'relative',
    overflow: 'hidden',
    display: 'block',
    flexShrink: width ? 0 : undefined,
    width,
    height,
    aspectRatio,
    ...style,
  };

  return (
    <div style={wrapStyle}>
      {src
        ? <img src={src} alt={alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <div className="ph" style={{ width: '100%', height: '100%' }}>📰</div>}
      {isVideo && <div className="play-btn"><Icon name="play" size={16} /></div>}
    </div>
  );
}
