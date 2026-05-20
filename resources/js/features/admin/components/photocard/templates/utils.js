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
 * Draw an image into a rect using cover-fit (crops to fill, centered).
 */
export function drawImageCover(ctx, img, x, y, w, h) {
  if (!img) return;
  const scale = Math.max(w / img.width, h / img.height);
  const sw    = img.width  * scale;
  const sh    = img.height * scale;
  const ox    = x - (sw - w) / 2;
  const oy    = y - (sh - h) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, ox, oy, sw, sh);
  ctx.restore();
}

/**
 * Draw text with automatic line wrapping.
 * Returns the y position after the last line.
 */
export function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  if (!text) return y;
  const words = text.split(' ');
  let line = '';
  let cy   = y;
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? line + ' ' + words[i] : words[i];
    const measured = ctx.measureText(testLine).width;

    if (measured > maxWidth && line !== '') {
      ctx.fillText(line, x, cy);
      line = words[i];
      cy  += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1) {
        const rest     = words.slice(i + 1).join(' ');
        const lastLine = line + (rest ? ' ' + rest : '');
        let truncated  = lastLine;
        while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1);
        }
        ctx.fillText(truncated + (truncated !== lastLine ? '...' : ''), x, cy);
        return cy + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, cy);
  return cy + lineHeight;
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

/** Ensure all fonts needed by templates are ready */
export async function waitForFonts() {
  if (document.fonts?.ready) await document.fonts.ready;
}
