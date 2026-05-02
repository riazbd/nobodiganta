/**
 * Robustly extracts YouTube Video ID from various URL formats
 */
export function getYoutubeId(url) {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regex);
  return match ? match[1] : null;
}

/**
 * Extracts Vimeo ID from URL
 */
export function getVimeoId(url) {
  if (!url) return null;
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Detects the video provider based on URL
 */
export function detectVideoProvider(url) {
  if (!url) return 'html5';
  const u = url.toLowerCase();
  
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('vimeo.com')) return 'vimeo';
  if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
  if (u.includes('dailymotion.com') || u.includes('dai.ly')) return 'dailymotion';
  
  // Check for direct video extensions
  if (/\.(mp4|webm|ogg|mov)$/.test(u)) return 'html5';
  
  return 'html5'; // Default fallback
}

/**
 * Generates a universal embed configuration
 * Returns { type: 'iframe' | 'video', src: string, provider: string }
 */
export function getUniversalEmbedConfig(url, providerHint = null) {
  if (!url) return null;
  
  const provider = providerHint || detectVideoProvider(url);
  let origin = '';
  try {
    if (typeof window !== 'undefined') origin = window.location.origin.replace(/\/$/, '');
  } catch (e) {}

  if (provider === 'youtube') {
    const id = getYoutubeId(url);
    if (!id) return null;
    const query = new URLSearchParams({ rel: 0, enablejsapi: 1, origin: origin }).toString();
    return { type: 'iframe', src: `https://www.youtube.com/embed/${id}?${query}`, provider };
  }

  if (provider === 'vimeo') {
    const id = getVimeoId(url);
    if (!id) return null;
    return { type: 'iframe', src: `https://player.vimeo.com/video/${id}?badge=0&autopause=0&player_id=0&app_id=58479`, provider };
  }

  if (provider === 'facebook') {
    const query = new URLSearchParams({ href: url, show_text: 'false', t: '0' }).toString();
    return { type: 'iframe', src: `https://www.facebook.com/plugins/video.php?${query}`, provider };
  }

  if (provider === 'dailymotion') {
    const match = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/);
    const id = match ? match[1] : null;
    if (!id) return null;
    return { type: 'iframe', src: `https://www.dailymotion.com/embed/video/${id}?autoplay=0&mute=0`, provider };
  }

  // Default to HTML5 video tag
  return { type: 'video', src: url, provider: 'html5' };
}
