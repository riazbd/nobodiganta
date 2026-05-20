import {
  loadImage, drawImageCover, wrapText, formatDateBn, waitForFonts,
} from './utils.js';

const W       = 1080;
const H       = 1080;
const IMAGE_H = 600;

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

    // ── 1. Load assets ───────────────────────────────────────────────────────
    const [articleImg, logoImg] = await Promise.all([
      loadImage(article.featured_image),
      loadImage(settings?.site_logo),
    ]);

    // ── 2. Article image (cover-fit, top 600px) ──────────────────────────────
    if (articleImg) {
      drawImageCover(ctx, articleImg, 0, 0, W, IMAGE_H);
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, IMAGE_H);
    }

    // ── 3. Gradient fade at image bottom (y=490→600) ─────────────────────────
    const fadeGrad = ctx.createLinearGradient(0, 490, 0, IMAGE_H);
    fadeGrad.addColorStop(0, 'rgba(15,2,2,0)');
    fadeGrad.addColorStop(1, 'rgba(15,2,2,0.88)');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, 490, W, IMAGE_H - 490);

    // ── 4. Logo centered on image — swapped from date position ───────────────
    if (logoImg) {
      const maxLogoW = 220;
      const maxLogoH = 68;
      const ratio    = Math.min(maxLogoW / logoImg.width, maxLogoH / logoImg.height);
      const lw       = logoImg.width  * ratio;
      const lh       = logoImg.height * ratio;
      const lx       = (W - lw) / 2;
      const ly       = IMAGE_H - 96;
      ctx.drawImage(logoImg, lx, ly, lw, lh);
    }

    // ── 5. Dark bottom section (y=600→1080) ──────────────────────────────────
    const darkGrad = ctx.createLinearGradient(0, IMAGE_H, 0, H);
    darkGrad.addColorStop(0, '#1a0404');
    darkGrad.addColorStop(1, '#0d0101');
    ctx.fillStyle = darkGrad;
    ctx.fillRect(0, IMAGE_H, W, H - IMAGE_H);

    // ── 6. Headline ───────────────────────────────────────────────────────────
    const title = article.title || article.title_en || '';
    ctx.fillStyle = '#ffffff';
    ctx.font      = `900 62px 'Noto Sans Bengali', 'Hind Siliguri', sans-serif`;
    ctx.textAlign = 'left';
    wrapText(ctx, title, 44, 660, W - 88, 82, 4);

    // ── 7. CTA text (bottom-left) ─────────────────────────────────────────────
    ctx.fillStyle = '#cccccc';
    ctx.font      = `500 26px 'Noto Sans Bengali', sans-serif`;
    ctx.fillText('বিস্তারিত কমেন্ট ...', 44, 978);

    const siteUrl = settings?.site_url || settings?.site_name || '';
    if (siteUrl) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font      = `500 22px 'Noto Sans Bengali', sans-serif`;
      ctx.fillText(siteUrl.replace(/^https?:\/\//, ''), 44, 1018);
    }

    // ── 8. Date bottom-right — swapped from logo position ────────────────────
    const dateBn = formatDateBn(article.published_at);
    if (dateBn) {
      ctx.fillStyle = '#cccccc';
      ctx.font      = `500 26px 'Noto Sans Bengali', sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(dateBn, W - 44, 1018);
      ctx.textAlign = 'left';
    }
  },
};
