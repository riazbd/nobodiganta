/**
 * Social sharing utilities.
 * All share functions open a popup window on desktop or redirect on mobile.
 */

/**
 * Share on Facebook
 */
export function shareOnFacebook(url, title) {
  const encoded = encodeURIComponent(url);
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    '_blank',
    'width=600,height=400,noopener,noreferrer'
  );
}

/**
 * Share on WhatsApp (opens app on mobile, Web on desktop)
 */
export function shareOnWhatsApp(url, title) {
  const text = encodeURIComponent(`${title} ${url}`);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const base = isMobile ? 'whatsapp://send' : 'https://web.whatsapp.com/send';
  window.open(`${base}?text=${text}`, '_blank', 'noopener,noreferrer');
}

/**
 * Share on Telegram
 */
export function shareOnTelegram(url, title) {
  const encoded = encodeURIComponent(url);
  const textEncoded = encodeURIComponent(title);
  window.open(
    `https://t.me/share/url?url=${encoded}&text=${textEncoded}`,
    '_blank',
    'width=600,height=400,noopener,noreferrer'
  );
}

/**
 * Share on Twitter/X
 */
export function shareOnTwitter(url, title) {
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  window.open(
    `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`,
    '_blank',
    'width=600,height=400,noopener,noreferrer'
  );
}

/**
 * Share on LinkedIn
 */
export function shareOnLinkedIn(url, title) {
  const encoded = encodeURIComponent(url);
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    '_blank',
    'width=600,height=400,noopener,noreferrer'
  );
}

/**
 * Copy URL to clipboard
 * @returns {Promise<boolean>} true if successful
 */
export async function copyToClipboard(url) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = url;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  } catch {
    return false;
  }
}
