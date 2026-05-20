# Photo Card Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow admins to generate and download a branded photo card image for any article from the news list, with an extensible template architecture that supports multiple templates and future dashboard-based template creation.

**Architecture:** All rendering is client-side via HTML5 Canvas API — no server-side image processing. Templates are JS modules registered in a central engine registry; the modal asks the engine for available templates and renders a preview before download. The registry pattern means adding a new template is one file + one import, with zero changes to the modal or engine. Future DB-driven templates will plug into the same registry at runtime.

**Tech Stack:** React 18, HTML5 Canvas 2D API, Inertia.js (`usePage`), Lucide icons, Tailwind CSS

---

## File Map

| File | Role |
|---|---|
| `resources/js/features/admin/components/photocard/PhotoCardEngine.js` | Template registry — register, get, list templates |
| `resources/js/features/admin/components/photocard/templates/utils.js` | Pure canvas helpers — `loadImage`, `drawImageCover`, `wrapText`, `formatDateBn` |
| `resources/js/features/admin/components/photocard/templates/classicDark.js` | Template 1 "Classic Dark" matching the reference image (with logo/date swapped) |
| `resources/js/features/admin/components/photocard/templates/index.js` | Registers all templates into the engine on import |
| `resources/js/features/admin/components/photocard/PhotoCardModal.jsx` | Modal: template picker tabs, live canvas preview, download PNG button |
| `app/Http/Controllers/ArticleController.php` | Add `featured_image` field to `index()` article list transform |
| `resources/js/features/admin/pages/content/AllNews.jsx` | Add photo card icon button to article action row + modal state |

---

## Task 1: Core Engine + Canvas Utilities

**Files:**
- Create: `resources/js/features/admin/components/photocard/PhotoCardEngine.js`
- Create: `resources/js/features/admin/components/photocard/templates/utils.js`

### Step 1: Create the template registry engine

```js
// resources/js/features/admin/components/photocard/PhotoCardEngine.js

const registry = new Map();

/**
 * Register a template. Call this once per template module.
 * template shape: { id, name, nameBn, width, height, render }
 */
export function registerTemplate(template) {
  registry.set(template.id, template);
}

/** Get one template by id, or null */
export function getTemplate(id) {
  return registry.get(id) ?? null;
}

/** Return all registered templates in insertion order */
export function getAllTemplates() {
  return Array.from(registry.values());
}

/**
 * Render a template onto an offscreen canvas and return the canvas.
 * @param {string} templateId
 * @param {object} article  — { title, title_en, featured_image, published_at, slug }
 * @param {object} settings — { site_logo, site_url, site_name }
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderToCanvas(templateId, article, settings) {
  const template = getTemplate(templateId);
  if (!template) throw new Error(`Template "${templateId}" not found`);

  const canvas = document.createElement('canvas');
  canvas.width  = template.width;
  canvas.height = template.height;

  await template.render(canvas, article, settings);
  return canvas;
}

/**
 * Render and trigger a PNG download.
 * @returns {Promise<void>}
 */
export async function downloadCard(templateId, article, settings) {
  const canvas = await renderToCanvas(templateId, article, settings);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Canvas toBlob failed'));
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${article.slug || 'photocard'}-${templateId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}
```

- [ ] Create `resources/js/features/admin/components/photocard/PhotoCardEngine.js` with the content above

---

### Step 2: Create canvas utility helpers

```js
// resources/js/features/admin/components/photocard/templates/utils.js

/** Load a URL as an HTMLImageElement. Returns null on failure (graceful). */
export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src + (src.includes('?') ? '&' : '?') + '_cb=' + Date.now();
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
    const testLine  = line ? line + ' ' + words[i] : words[i];
    const measured  = ctx.measureText(testLine).width;

    if (measured > maxWidth && line !== '') {
      ctx.fillText(line, x, cy);
      line = words[i];
      cy  += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1) {
        // Remaining words on last allowed line
        const rest = words.slice(i + 1).join(' ');
        const lastLine = line + (rest ? ' ' + rest : '');
        // Truncate with ellipsis if needed
        let truncated = lastLine;
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

/**
 * Format ISO date string as "১৬ অক্টোবর ২০২৫" (Bengali)
 */
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
```

- [ ] Create `resources/js/features/admin/components/photocard/templates/utils.js` with the content above

---

### Step 3: Commit

```bash
git add resources/js/features/admin/components/photocard/
git commit -m "feat: photocard engine registry + canvas utility helpers"
```

- [ ] Commit

---

## Task 2: Classic Dark Template

**Files:**
- Create: `resources/js/features/admin/components/photocard/templates/classicDark.js`
- Create: `resources/js/features/admin/components/photocard/templates/index.js`

**Template layout (1080×1080 px) — with logo/date SWAPPED from reference:**
```
┌──────────────────────────────────┐ y=0
│   Article featured image         │
│   (cover-fit, full width)        │
│                                  │
│         [ LOGO centered ]        │ y≈530 (was date position)
│   ── gradient fade (y=500→600) ──│
├──────────────────────────────────┤ y=600
│   Dark red→black gradient        │
│                                  │
│   Headline text (bold, white)    │ y≈648
│   (wraps 2-3 lines, 62px)        │
│                                  │
│   বিস্তারিত কমেন্ট ...          │ y≈978
│   site-url.com          [DATE]   │ y≈1018 (date was logo position)
└──────────────────────────────────┘ y=1080
```

### Step 1: Create the classicDark template

```js
// resources/js/features/admin/components/photocard/templates/classicDark.js

import {
  loadImage, drawImageCover, wrapText, formatDateBn, waitForFonts,
} from './utils.js';

const W = 1080;
const H = 1080;
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

    // ── 1. Load assets ──────────────────────────────────────────────────────
    const [articleImg, logoImg] = await Promise.all([
      loadImage(article.featured_image),
      loadImage(settings?.site_logo),
    ]);

    // ── 2. Article image (cover-fit, top 600px) ──────────────────────────────
    if (articleImg) {
      drawImageCover(ctx, articleImg, 0, 0, W, IMAGE_H);
    } else {
      // Fallback: dark placeholder
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, IMAGE_H);
    }

    // ── 3. Gradient fade at image bottom (y=490→600) ─────────────────────────
    const fadeGrad = ctx.createLinearGradient(0, 490, 0, IMAGE_H);
    fadeGrad.addColorStop(0, 'rgba(15,2,2,0)');
    fadeGrad.addColorStop(1, 'rgba(15,2,2,0.88)');
    ctx.fillStyle = fadeGrad;
    ctx.fillRect(0, 490, W, IMAGE_H - 490);

    // ── 4. Logo centered on image (was: date position) ───────────────────────
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

    // ── 8. Date bottom-right (was: logo position) ─────────────────────────────
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
```

- [ ] Create `resources/js/features/admin/components/photocard/templates/classicDark.js` with the content above

---

### Step 2: Create the template index (registers all templates)

```js
// resources/js/features/admin/components/photocard/templates/index.js

import { registerTemplate } from '../PhotoCardEngine.js';
import { classicDark }      from './classicDark.js';

// Register all built-in templates here.
// To add a new template: import it and call registerTemplate().
registerTemplate(classicDark);

export { classicDark };
```

- [ ] Create `resources/js/features/admin/components/photocard/templates/index.js` with the content above

---

### Step 3: Commit

```bash
git add resources/js/features/admin/components/photocard/templates/
git commit -m "feat: add Classic Dark photocard template (logo/date swapped per spec)"
```

- [ ] Commit

---

## Task 3: PhotoCard Modal Component

**Files:**
- Create: `resources/js/features/admin/components/photocard/PhotoCardModal.jsx`

The modal:
- Imports `templates/index.js` (side-effect: registers all templates)
- Renders a preview canvas (scaled to 400px wide via CSS)
- Shows template tabs if >1 template exists
- Has a "Download PNG" button that renders at full 1080×1080

### Step 1: Create the modal

```jsx
// resources/js/features/admin/components/photocard/PhotoCardModal.jsx

import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { X, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import {
  getAllTemplates,
  renderToCanvas,
  downloadCard,
} from '../PhotoCardEngine.js';

// Side-effect import — registers all built-in templates into the engine
import './templates/index.js';

export default function PhotoCardModal({ article, onClose }) {
  const { props } = usePage();
  const settings  = props.settings || {};

  const templates = getAllTemplates();
  const [selectedId,   setSelectedId]   = useState(templates[0]?.id ?? '');
  const [rendering,    setRendering]    = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const canvasRef = useRef(null);

  // Re-render preview whenever template or article changes
  useEffect(() => {
    if (!selectedId || !canvasRef.current) return;
    let cancelled = false;

    setRendering(true);
    setPreviewError(false);

    renderToCanvas(selectedId, article, settings)
      .then(offscreen => {
        if (cancelled || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width  = offscreen.width;
        canvasRef.current.height = offscreen.height;
        ctx.drawImage(offscreen, 0, 0);
      })
      .catch(() => { if (!cancelled) setPreviewError(true); })
      .finally(() => { if (!cancelled) setRendering(false); });

    return () => { cancelled = true; };
  }, [selectedId, article?.id]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadCard(selectedId, article, settings);
    } catch (err) {
      console.error('PhotoCard download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            <span className="font-bold text-sm text-gray-800">ফটো কার্ড ডাউনলোড</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template picker — only shown when >1 template */}
        {templates.length > 1 && (
          <div className="flex gap-2 px-5 pt-4 overflow-x-auto">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  selectedId === t.id
                    ? 'bg-[#263238] text-white border-[#263238]'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {t.nameBn || t.name}
              </button>
            ))}
          </div>
        )}

        {/* Preview */}
        <div className="px-5 py-4">
          <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
            {rendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
            {previewError && !rendering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                <ImageIcon className="w-10 h-10" />
                <span className="text-xs">প্রিভিউ লোড করা সম্ভব হয়নি</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{ display: rendering || previewError ? 'none' : 'block' }}
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            প্রিভিউ — ডাউনলোড হবে 1080×1080 PNG
          </p>
        </div>

        {/* Article title preview */}
        <div className="px-5 pb-2">
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {article.title}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            বাতিল
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || rendering}
            className="flex-1 py-2.5 rounded-xl bg-[#263238] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1a2428] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> তৈরি হচ্ছে...</>
              : <><Download className="w-4 h-4" /> PNG ডাউনলোড</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Create `resources/js/features/admin/components/photocard/PhotoCardModal.jsx` with the content above

---

### Step 2: Build and verify no errors

```bash
npm run build 2>&1 | tail -6
```

Expected: `✓ built in Xs` with no errors.

- [ ] Run build and confirm clean

---

### Step 3: Commit

```bash
git add resources/js/features/admin/components/photocard/PhotoCardModal.jsx
git commit -m "feat: PhotoCardModal with live canvas preview and PNG download"
```

- [ ] Commit

---

## Task 4: Wire Into AllNews — Button + Backend Field

**Files:**
- Modify: `app/Http/Controllers/ArticleController.php` — add `featured_image` to index transform
- Modify: `resources/js/features/admin/pages/content/AllNews.jsx` — add photo card state + button + modal

### Step 1: Add `featured_image` to ArticleController::index() transform

In `app/Http/Controllers/ArticleController.php`, find the `index()` method's `transform` callback (around line 100–126). Add `featured_image` to the returned array:

```php
// Find this block inside the $articles->getCollection()->transform(function ($article) { block:
                'author'        => $article->author?->name,
                'author_id'     => $article->author_id,
                'views'         => $article->views,
                'published_at'  => $article->published_at?->toIso8601String(),
                'created_at'    => $article->created_at->toIso8601String(),
```

Replace with:

```php
                'author'         => $article->author?->name,
                'author_id'      => $article->author_id,
                'views'          => $article->views,
                'featured_image' => $article->featured_image,
                'published_at'   => $article->published_at?->toIso8601String(),
                'created_at'     => $article->created_at->toIso8601String(),
```

- [ ] Add `'featured_image' => $article->featured_image,` to the article list transform in `ArticleController::index()`

---

### Step 2: Verify backend compiles

```bash
php artisan route:list --name=admin.news 2>&1 | head -3
```

Expected: route list prints without PHP errors.

- [ ] Run and confirm no errors

---

### Step 3: Add photo card button and modal to AllNews.jsx

**3a — Add import at the top of AllNews.jsx:**

Find the existing lucide-react import block and add `Image as ImageIcon` if not present. Then add the modal import after all existing imports:

```js
// After the existing lucide-react import line, add ImageIcon if missing:
import {
  Search, Plus, Eye, Edit3, Trash2, Send, ChevronDown, X, Loader2,
  AlertTriangle, Globe, CheckCircle, User, ArrowUpDown, ArrowUp, ArrowDown,
  Filter, RotateCcw, Image as ImageIcon   // ← add ImageIcon
} from 'lucide-react';

// Add after existing imports:
import { lazy, Suspense } from 'react';
const PhotoCardModal = lazy(() => import('../../components/photocard/PhotoCardModal.jsx'));
```

- [ ] Add `Image as ImageIcon` to the lucide-react import in AllNews.jsx
- [ ] Add `lazy`, `Suspense` import from React
- [ ] Add lazy `PhotoCardModal` import

**3b — Add `photoCardArticle` state** (near the other `useState` declarations at the top of the component):

```js
const [photoCardArticle, setPhotoCardArticle] = useState(null);
```

- [ ] Add `photoCardArticle` state

**3c — Add photo card button to the article action cell** (inside the existing `<div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 ...">` block, before the delete button):

```jsx
<button
  onClick={() => setPhotoCardArticle(article)}
  className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-all"
  title="ফটো কার্ড ডাউনলোড"
>
  <ImageIcon className="w-4 h-4" />
</button>
```

- [ ] Add the photo card button before the delete button in the action cell

**3d — Add modal render** at the bottom of the JSX return (before the final closing `</div>`):

```jsx
{/* Photo Card Modal */}
{photoCardArticle && (
  <Suspense fallback={null}>
    <PhotoCardModal
      article={photoCardArticle}
      onClose={() => setPhotoCardArticle(null)}
    />
  </Suspense>
)}
```

- [ ] Add the modal JSX before the closing `</div>` of the component return

---

### Step 4: Build and verify

```bash
npm run build 2>&1 | tail -6
```

Expected: `✓ built in Xs` with no errors.

- [ ] Run build and confirm clean

---

### Step 5: Commit

```bash
git add app/Http/Controllers/ArticleController.php \
        resources/js/features/admin/pages/content/AllNews.jsx
git commit -m "feat: wire photo card download button into AllNews article rows"
```

- [ ] Commit

---

## Task 5: Smoke Test

No new files. Manual verification only.

### Step 1: Open AllNews, hover an article row

Navigate to `/admin/news`. Hover over any article row. Verify:
- The purple image icon appears in the action buttons (alongside view/edit/delete)
- Clicking the icon opens the Photo Card Modal

- [ ] Photo card icon visible on hover

### Step 2: Check the modal preview renders

With the modal open:
- Verify the preview canvas shows the article image, headline, and dark bottom section
- Logo appears centered on the image (near its bottom)
- Date appears bottom-right of the dark section
- Article title appears in the "বিস্তারিত কমেন্ট ..." area

- [ ] Preview renders correctly

### Step 3: Test an article without a featured image

Open photo card modal for an article with no featured image. Verify:
- Modal opens without crashing
- Dark placeholder renders instead of a broken image
- Headline and date still appear

- [ ] Graceful fallback for missing image

### Step 4: Download the PNG

Click "PNG ডাউনলোড". Verify:
- Browser downloads a `.png` file
- File is 1080×1080 pixels
- File name is `{article-slug}-classic-dark.png`
- Image matches the preview (no blank/broken areas)

- [ ] PNG downloads at 1080×1080

### Step 5: Final commit

```bash
git add .
git commit -m "feat: complete photo card generator — canvas engine, Classic Dark template, AllNews integration"
```

- [ ] Final commit

---

## Future Extension Guide (no code needed now)

**Adding a new template:**
1. Create `templates/yourTemplate.js` — same shape as `classicDark.js`
2. Add `import { yourTemplate } from './yourTemplate.js'; registerTemplate(yourTemplate);` to `templates/index.js`
3. Done — the modal automatically shows the new template tab

**Loading templates from DB (future):**
- Add a `GET /api/admin/photocard-templates` endpoint returning template configs
- In the modal `useEffect`, fetch templates and call `registerTemplate()` for each one
- DB templates use a `renderer` field (e.g. `"classicDark"`) to map to a render function; template-specific colors/sizes come from a `config` JSON column

---

## Self-Review

- [x] **Backend change covered**: `featured_image` added to `ArticleController::index()` transform (Task 4 Step 1)
- [x] **All template positions correct**: logo at image center-bottom, date at dark-section bottom-right (swapped per spec)
- [x] **Graceful failures**: `loadImage` returns `null` on error; template renders dark placeholder; download error is caught
- [x] **Type consistency**: `renderToCanvas(id, article, settings)` → `downloadCard(id, article, settings)` — same signature throughout
- [x] **Lazy loading**: `PhotoCardModal` is code-split via `React.lazy` — no canvas code loaded until first click
- [x] **Future-ready registry**: `registerTemplate` / `getAllTemplates` / `getTemplate` are the only engine surface area needed to add more templates or DB-driven templates
- [x] **Bengali font**: `waitForFonts()` called inside every `render()` before any canvas text draw
- [x] **No placeholders**: every step has complete runnable code
