/**
 * Accessible, lazy-loaded image with meaningful alt text enforcement.
 * alt is required — omitting it causes a console warning in development.
 * 
 * Props:
 * - src: Image URL
 * - alt: Alt text (required for accessibility)
 * - width/height: Dimensions
 * - priority: If true, uses fetchpriority="high" and eager loading (for LCP/hero images)
 * - sizes: Responsive sizes hint for browser
 */
export default function LazyImage({ 
  src, 
  alt, 
  width, 
  height, 
  style = {}, 
  className = '', 
  eager = false,
  priority = false,
  sizes = '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) {
  if (process.env.NODE_ENV === 'development' && !alt) {
    console.warn('[LazyImage] Missing required alt text. Provide a descriptive alt or alt="" for decorative images.');
  }

  return (
    <img
      src={src || 'https://picsum.photos/seed/placeholder/800/450'}
      alt={alt || ''}
      width={width}
      height={height}
      loading={priority || eager ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      sizes={sizes}
      className={className}
      style={{ display: 'block', objectFit: 'cover', ...style }}
    />
  );
}
