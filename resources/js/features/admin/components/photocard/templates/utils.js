/** Load a URL as an HTMLImageElement. Returns null on failure (graceful). */
export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Draw an image into a box with a chosen fit mode.
 *  - cover   : fill box, crop overflow (default)
 *  - contain : whole image visible inside box (letterboxed), aspect kept
 *  - stretch : fill box exactly (aspect may distort)
 * zoom/offX/offY further reposition the crop (cover/contain).
 */
export function drawImageFit(ctx, img, x, y, w, h, fit = 'cover', zoom = 1, offX = 0, offY = 0) {
  if (!img) return;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (fit === 'stretch') { ctx.drawImage(img, x, y, w, h); ctx.restore(); return; }
  const z = zoom > 0 ? zoom : 1;
  const base = fit === 'contain' ? Math.min(w / img.width, h / img.height) : Math.max(w / img.width, h / img.height);
  const scale = base * z;
  const sw = img.width * scale, sh = img.height * scale;
  const slackX = sw - w, slackY = sh - h;
  const ox = x - slackX / 2 + (offX / 100) * (slackX / 2);
  const oy = y - slackY / 2 + (offY / 100) * (slackY / 2);
  ctx.drawImage(img, ox, oy, sw, sh);
  ctx.restore();
}

const BN_MONTHS = [
  'জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন',
  'জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর',
];
const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];

/** Convert western digit string to Bengali digits */
export function toBnDigits(str) {
  return String(str).replace(/\d/g, d => BN_DIGITS[parseInt(d)]);
}

/** Format ISO date string as "১৬ অক্টোবর ২০২৫" (Bengali) */
export function formatDateBn(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const day   = toBnDigits(d.getDate());
  const month = BN_MONTHS[d.getMonth()];
  const year  = toBnDigits(d.getFullYear());
  return `${day} ${month} ${year}`;
}

// ─── Config-renderer helpers ───────────────────────────────────────────────────

/**
 * Convert any color (#rgb / #rrggbb / #rrggbbaa / rgb() / rgba()) to an rgba()
 * string, multiplied by an extra opacity% (so existing opacity controls still work
 * AND colors can carry their own alpha).
 */
export function hexToRgba(color, opacityPct = 100) {
  const m = Math.max(0, Math.min(100, opacityPct)) / 100;
  if (!color) return `rgba(0,0,0,${m})`;
  const c = String(color).trim();
  if (c.startsWith('rgb')) {
    const n = (c.match(/[\d.]+/g) || []).map(Number);
    const [r = 0, g = 0, b = 0, a = 1] = n;
    return `rgba(${r},${g},${b},${a * m})`;
  }
  let h = c.replace('#', '');
  if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
  let a = 1;
  if (h.length === 8) { a = (parseInt(h.slice(6, 8), 16) || 0) / 255; h = h.slice(0, 6); }
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${a * m})`;
}

/**
 * Build a linear gradient across a rect, given an angle in degrees.
 * Supports an optional mid stop. `g` = { gradientFrom, gradientMid, gradientMidPos, gradientTo, gradientAngle }
 */
export function makeGradient(ctx, x, y, w, h, g) {
  const angle = ((g.gradientAngle ?? 180) % 360) * Math.PI / 180;
  const cx = x + w / 2, cy = y + h / 2;
  const len = Math.abs(w * Math.sin(angle)) + Math.abs(h * Math.cos(angle));
  const dx = Math.sin(angle) * len / 2;
  const dy = -Math.cos(angle) * len / 2;
  const grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
  grad.addColorStop(0, g.gradientFrom || '#000000');
  if (g.gradientMid) grad.addColorStop(Math.max(0, Math.min(1, (g.gradientMidPos ?? 50) / 100)), g.gradientMid);
  grad.addColorStop(1, g.gradientTo || '#000000');
  return grad;
}

/** Trace a rounded-rect path (does not fill/stroke). */
export function roundRectPath(ctx, x, y, w, h, r) {
  const rad = Math.max(0, Math.min(r || 0, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y,     x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x,     y + h, rad);
  ctx.arcTo(x,     y + h, x,     y,     rad);
  ctx.arcTo(x,     y,     x + w, y,     rad);
  ctx.closePath();
}
