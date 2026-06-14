// ─── Config-driven photocard renderer ─────────────────────────────────────────
// Assets are cached module-wide and loading is separated from drawing, so the
// editor can redraw synchronously on every drag tick WITHOUT reloading images
// (this is what kills the canvas flicker).

import { loadImage } from './templates/utils.js';
import { ensureConfigFonts } from './fonts.js';
import { assetUrls, drawConfig } from './elements.js';

const cache = new Map();      // url -> HTMLImageElement | null
const inflight = new Map();   // url -> Promise

/** Synchronous cache lookup used during drawing. */
export function getImg(url) {
  if (!url) return null;
  const v = cache.get(url);
  return v instanceof HTMLImageElement ? v : null;
}

/** Load any not-yet-cached URLs. Resolves when all are settled. */
export async function ensureAssets(urls) {
  await Promise.all(urls.map(url => {
    if (!url || cache.has(url)) return null;
    if (inflight.has(url)) return inflight.get(url);
    const p = loadImage(url).then(img => { cache.set(url, img); inflight.delete(url); });
    inflight.set(url, p);
    return p;
  }));
}

/** Synchronous draw using whatever is currently cached. */
export function drawNow(canvas, config, data, settings) {
  return drawConfig(canvas, config, data, settings, getImg);
}

/** Full async render: ensure fonts + assets, then draw. For modal preview & download. */
export async function renderConfig(canvas, config, data = {}, settings = {}) {
  await Promise.all([ ensureConfigFonts(config), ensureAssets(assetUrls(config, data, settings)) ]);
  return drawNow(canvas, config, data, settings);
}

/**
 * Render to a fresh offscreen canvas and trigger a download.
 * opts: { type: 'png' | 'jpg' }  (jpg gets a white backdrop since it has no alpha)
 */
export async function downloadConfig(config, data, settings, filename, opts = {}) {
  const type = opts.type === 'jpg' ? 'jpg' : 'png';
  // Optional per-download corner-radius override (rounded vs square).
  const cfg = opts.radius != null ? { ...config, canvas: { ...config.canvas, radius: opts.radius } } : config;
  let canvas = document.createElement('canvas');
  await renderConfig(canvas, cfg, data, settings);

  if (type === 'jpg') {
    const flat = document.createElement('canvas');
    flat.width = canvas.width; flat.height = canvas.height;
    const fx = flat.getContext('2d');
    fx.fillStyle = '#ffffff'; fx.fillRect(0, 0, flat.width, flat.height);
    fx.drawImage(canvas, 0, 0);
    canvas = flat;
  }

  const mime = type === 'jpg' ? 'image/jpeg' : 'image/png';
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Canvas toBlob failed'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${filename || data?.slug || 'photocard'}.${type}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, mime, type === 'jpg' ? 0.92 : undefined);
  });
}
