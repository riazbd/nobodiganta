import {
  loadImage, drawImageCover, wrapText, formatDateBn, waitForFonts,
} from './utils.js';

const W       = 1080;
const H       = 1080;
const IMAGE_H = 560;

export const classicDark = {
  id:     'classic-dark',
  name:   'Classic Dark',
  nameBn: 'ক্লাসিক ডার্ক',
  width:  W,
  height: H,

  async render(canvas, article, settings) {
    await waitForFonts();

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    // ── 1. Load assets ────────────────────────────────────────────────────────
    const [articleImg, logoImg] = await Promise.all([
      loadImage(article.featured_image),
      loadImage('/logo.png'),
    ]);

    // ── 2. Top photo area (full cover) ────────────────────────────────────────
    if (articleImg) {
      drawImageCover(ctx, articleImg, 0, 0, W, IMAGE_H);
    } else {
      ctx.fillStyle = '#2a4a2a';
      ctx.fillRect(0, 0, W, IMAGE_H);
    }

    // ── 3. Thin dark overlay on the photo ────────────────────────────────────
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, W, IMAGE_H);

    // ── 4. Gradient fade at bottom of photo ──────────────────────────────────
    const fadeGrad = ctx.createLinearGradient(0, IMAGE_H - 180, 0, IMAGE_H);
    fadeGrad.addColorStop(0, 'rgba(0,0,0,0)');
    fadeGrad.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, IMAGE_H - 180, W, 180);

    // ── 5. Dark bottom panel (draw BEFORE logo) ───────────────────────────────
    const panelGrad = ctx.createLinearGradient(0, IMAGE_H, 0, H);
    panelGrad.addColorStop(0,   '#0a0a0a');
    panelGrad.addColorStop(0.3, '#1a0303');
    panelGrad.addColorStop(1,   '#2a0505');
    ctx.fillStyle = panelGrad;
    ctx.fillRect(0, IMAGE_H, W, H - IMAGE_H);

    // ── 6. Logo straddling the boundary ──────────────────────────────────────
    let logoBottomY = IMAGE_H;

    if (logoImg) {
      const maxLogoW = 160;
      const maxLogoH = 160;

      const ratio = Math.min(
        maxLogoW / logoImg.width,
        maxLogoH / logoImg.height
      );

      const lw = logoImg.width * ratio;
      const lh = logoImg.height * ratio;

      const lx = (W - lw) / 2;
      const ly = IMAGE_H - lh / 2;

      const cx = lx + lw / 2;
      const cy = ly + lh / 2;
      const radius = Math.min(lw, lh) / 2;

      logoBottomY = ly + lh;

      // White border ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // Clipped circular logo
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, lx, ly, lw, lh);
      ctx.restore();
    }

    // ── 7. Headline ───────────────────────────────────────────────────────────
    const headlineY = logoBottomY + 120;

    const title = article.title || article.title_en || '';
    ctx.fillStyle = '#ffffff';
    ctx.font      = `900 58px 'SolaimanLipi', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif`;
    ctx.textAlign = 'center';

    wrapTextCenter(ctx, title, W / 2, headlineY, W - 100, 88, 3);

    // ── 8. Bottom footer row ──────────────────────────────────────────────────
    const footerY = H - 56;

    // CTA bottom-left
    ctx.fillStyle = '#dddddd';
    ctx.font      = `700 30px 'SolaimanLipi', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('বিস্তারিত কমেন্টে ...', 44, footerY - 40);

    // Site URL bottom-left below CTA
    const siteUrl = settings?.site_url || 'nobodigonto.news';
    if (siteUrl) {
      ctx.fillStyle = '#cccccc';
      ctx.font      = `500 28px 'SolaimanLipi', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(siteUrl.replace(/^https?:\/\//, ''), 44, footerY);
    }

    // Date bottom-right
    const dateBn = formatDateBn(article.published_at);
    if (dateBn) {
      ctx.fillStyle = '#cccccc';
      ctx.font      = `500 28px 'SolaimanLipi', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(dateBn, W - 44, footerY);
      ctx.textAlign = 'left';
    }
  },
};

// ── Center-aligned wrapText variant ──────────────────────────────────────────
function wrapTextCenter(ctx, text, cx, y, maxWidth, lineHeight, maxLines = 3) {
  if (!text) return y;
  const words = text.split(' ');
  let line  = '';
  let curY  = y;
  let count = 0;

  for (let i = 0; i < words.length; i++) {
    const test     = line ? line + ' ' + words[i] : words[i];
    const measured = ctx.measureText(test).width;

    if (measured > maxWidth && line !== '') {
      ctx.fillText(line, cx, curY);
      line = words[i];
      curY += lineHeight;
      count++;
      if (count >= maxLines - 1) {
        const rest = words.slice(i + 1).join(' ');
        let last   = line + (rest ? ' ' + rest : '');
        while (ctx.measureText(last + '...').width > maxWidth && last.length > 0) {
          last = last.slice(0, -1);
        }
        ctx.fillText(last + (last !== line + (rest ? ' ' + rest : '') ? '...' : ''), cx, curY);
        return curY + lineHeight;
      }
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, cx, curY);
  return curY + lineHeight;
}