// ─── Unified element model ─────────────────────────────────────────────────────
// Both the renderer and the on-canvas editor consume this, so geometry & drawing
// can never drift. Every element is a box {x, y, w, h} in canvas (top-left) coords.

import { loadImage, drawImageFit, formatDateBn, hexToRgba, makeGradient, roundRectPath } from './templates/utils.js';
import { fontStack } from './fonts.js';
import { GENERAL_ICONS } from './icons.js';

// ── Dynamic field (token) system ────────────────────────────────────────────────
// Any text/image value may contain {{token}} placeholders that resolve at render
// time from the live system context (all public settings + the current article).
// This is what gives "complete flexibility": each value is literal OR system-driven.

export function buildContext(data, settings) {
  const s = settings || {};
  const host = (typeof window !== 'undefined' && window.location) ? window.location.host : '';
  const ctx = {
    ...s,                                   // every public setting becomes a token
    title:          data?.title || '',
    title_en:       data?.title_en || data?.title || '',
    excerpt:        data?.excerpt || '',
    category:       data?.category?.name || '',
    date:           formatDateBn(data?.published_at) || '',
    featured_image: data?.featured_image || '',
    site_logo:      s.site_logo || '/logo.png',
    site_url:       (s.site_url || host || 'nobodigonto.news').replace(/^https?:\/\//, ''),
  };
  // Ad Manager: {{ad:position}} → that position's active ad image (s.ads = {position: url}).
  for (const [pos, url] of Object.entries(s.ads || {})) ctx[`ad:${pos}`] = url;
  return ctx;
}

const TOKEN_RE = /\{\{\s*([\w.:-]+)\s*\}\}/g;
export function resolveTokens(str, ctx) {
  if (!str) return '';
  return String(str).replace(TOKEN_RE, (_, k) => (ctx?.[k] ?? ''));
}
// Resolve an image url that may itself be a {{token}} (e.g. {{site_logo}}).
export function resolveUrl(url, ctx) {
  if (!url) return null;
  if (TOKEN_RE.test(url)) { const r = resolveTokens(url, ctx); return r || null; }
  return url;
}

// ── Text helpers ──────────────────────────────────────────────────────────────
function lineHeightOf(el) { return el.lineHeight || Math.round((el.size || 30) * 1.3); }
function maxLinesOf(el)   { return el.maxLines || 1; }
function textHeight(el)   { return lineHeightOf(el) * maxLinesOf(el); }

function textValue(key, el, ctx) {
  if (key === 'headline') {
    if (el.source === 'custom') return resolveTokens(el.customText, ctx);
    if (el.source === 'title_en') return ctx.title_en;
    return ctx.title || ctx.title_en;
  }
  if (key === 'urlText')  return (el.text ? resolveTokens(el.text, ctx) : ctx.site_url).replace(/^https?:\/\//, '');
  if (key === 'dateText') return el.text ? resolveTokens(el.text, ctx) : ctx.date;
  return resolveTokens(el.text, ctx);
}

function drawTextBox(ctx, el, text) {
  if (!text) return;
  const size = el.size || 30, lh = lineHeightOf(el), ml = maxLinesOf(el);
  const width = el.width || 600, align = el.align || 'left';
  ctx.font = `${el.weight || 700} ${size}px ${fontStack(el.font)}`;
  ctx.fillStyle = el.color || '#ffffff';
  ctx.textBaseline = 'top';
  ctx.textAlign = align;
  if (el.shadow?.enabled) {
    ctx.shadowColor = hexToRgba(el.shadow.color || '#000', 100);
    ctx.shadowBlur = el.shadow.blur || 0;
    ctx.shadowOffsetX = el.shadow.x || 0; ctx.shadowOffsetY = el.shadow.y || 0;
  }
  const drawX = align === 'center' ? el.x + width / 2 : align === 'right' ? el.x + width : el.x;

  const words = String(text).split(' ');
  let line = '', cy = el.y, count = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > width && line !== '') {
      ctx.fillText(line, drawX, cy);
      line = words[i]; cy += lh; count++;
      if (count >= ml - 1) {
        const rest = words.slice(i + 1).join(' ');
        let last = line + (rest ? ' ' + rest : ''); const full = last;
        while (ctx.measureText(last + '…').width > width && last.length > 0) last = last.slice(0, -1);
        ctx.fillText(last + (last !== full ? '…' : ''), drawX, cy);
        line = ''; break;
      }
    } else { line = test; }
  }
  if (line) ctx.fillText(line, drawX, cy);
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  ctx.textBaseline = 'alphabetic';
}

// ── Social platforms (real vector brand icons, NOT emoji) ───────────────────────
// `path` = official simple-icons 24×24 SVG path; drawn with Path2D so it's a crisp
// vector logo with fully controllable colour.
export const SOCIAL_PLATFORMS = {
  facebook:  { color: '#1877f2', label: 'facebook',  path: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z' },
  instagram: { color: '#E4405F', label: 'instagram', path: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0Zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03Zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162ZM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4Zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439Z' },
  tiktok:    { color: '#000000', label: 'tiktok',    path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
  linkedin:  { color: '#0A66C2', label: 'linkedin',  path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z' },
  youtube:   { color: '#FF0000', label: 'youtube',   path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  x:         { color: '#000000', label: 'X',         path: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' },
  whatsapp:  { color: '#25D366', label: 'whatsapp',  path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.886 9.885' },
};

function drawIconPath(ctx, pathStr, cx, cy, targetSize, color) {
  if (!pathStr) return;
  const p = new Path2D(pathStr);
  const s = targetSize / 24;
  ctx.save();
  ctx.translate(cx - 12 * s, cy - 12 * s);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.fill(p);
  ctx.restore();
}

// Draw an icon filling a box (independent x/y scale → free resize, may stretch).
function drawIconBox(ctx, pathStr, x, y, w, h, color) {
  if (!pathStr) return;
  const p = new Path2D(pathStr);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(w / 24, h / 24);
  ctx.fillStyle = color;
  ctx.fill(p);
  ctx.restore();
}

// Full icon library for the Icon element: general icons + brand logos. name -> path.
export const ICON_PATHS = {
  ...GENERAL_ICONS,
  ...Object.fromEntries(Object.entries(SOCIAL_PLATFORMS).map(([k, v]) => [k, v.path])),
};

// When source==='auto', show only platforms that have a *_url in settings.
function socialPlatformsFor(el, context) {
  if (el.source === 'auto') {
    return Object.keys(SOCIAL_PLATFORMS).filter(p => context?.[`${p}_url`]);
  }
  return el.platforms || [];
}

// Apply a text-case style (mainly affects Latin; Bengali is unchanged).
function transformCase(s, mode) {
  s = String(s || '');
  switch (mode) {
    case 'upper':    return s.toUpperCase();
    case 'lower':    return s.toLowerCase();
    case 'title':    return s.replace(/\S+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case 'sentence': return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    default:         return s;
  }
}

function drawSocial(ctx, el, context) {
  const b = { x: el.x, y: el.y, w: el.width, h: el.height };
  if (el.bg && el.bg !== 'transparent') { ctx.fillStyle = el.bg; ctx.fillRect(b.x, b.y, b.w, b.h); }
  const r = (el.size || 34) / 2;
  const labelSize = el.labelSize || Math.round((el.size || 34) * 0.62); // independent label size
  const style = el.style || 'badge';            // 'badge' = circle + white icon · 'plain' = icon only
  const glyphColor = el.glyphColor || '#ffffff';
  ctx.textBaseline = 'middle';

  const items = socialPlatformsFor(el, context).map(p => ({ key: p, ...SOCIAL_PLATFORMS[p] })).filter(it => it.path);
  // Label = custom override (per platform) or the brand default, then case-transformed.
  const labelOf = (it) => transformCase((el.labels && el.labels[it.key]) || it.label, el.labelCase);
  ctx.font = `700 ${labelSize}px ${fontStack(el.font)}`;
  const widths = items.map(it => (r * 2) + (el.showLabels ? 8 + ctx.measureText(labelOf(it)).width : 0));
  const gap = el.gap ?? 36;
  const total = widths.reduce((a, w) => a + w, 0) + gap * Math.max(0, items.length - 1);

  let cx = el.align === 'left' ? b.x + 24 : el.align === 'right' ? b.x + b.w - total - 24 : b.x + (b.w - total) / 2;
  const cy = b.y + b.h / 2;

  items.forEach((it, i) => {
    if (style === 'plain') {
      // icon only, in badge/custom colour
      drawIconPath(ctx, it.path, cx + r, cy, r * 2, el.iconColor || it.color);
    } else {
      // coloured circle + icon on top
      ctx.beginPath(); ctx.arc(cx + r, cy, r, 0, 7);
      ctx.fillStyle = el.iconColor || it.color; ctx.fill();
      drawIconPath(ctx, it.path, cx + r, cy, r * 1.15, glyphColor);
    }
    if (el.showLabels) {
      ctx.fillStyle = el.labelColor || '#333';
      ctx.font = `700 ${labelSize}px ${fontStack(el.font)}`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(labelOf(it), cx + r * 2 + 8, cy + 1);
    }
    cx += widths[i] + gap;
  });
  ctx.textBaseline = 'alphabetic';
}

// ── Element registry (draw order) ──────────────────────────────────────────────
const TEXT_KEYS = ['headline', 'cta', 'urlText', 'dateText'];

const CORE_ELEMENTS = [
  ['photo', 'box', 'ছবি'], ['panel', 'box', 'প্যানেল'], ['adBanner', 'box', 'অ্যাড'], ['logo', 'logo', 'লোগো'],
  ['headline', 'text', 'শিরোনাম'], ['cta', 'text', 'CTA'], ['urlText', 'text', 'URL'], ['dateText', 'text', 'তারিখ'],
];

function layerLabel(l) {
  return l.type === 'text' ? (l.text || 'টেক্সট').slice(0, 12) : l.type === 'icon' ? (l.icon || 'icon') : l.type;
}

// Visible, drawable elements (used by renderer + editor). Skips disabled core + hidden layers.
export function listElements(config) {
  const out = [];
  for (const [key, type, label] of CORE_ELEMENTS) {
    if (config[key]?.enabled) out.push({ key, type, label, locked: !!config[key].locked });
  }
  (config.layers || []).forEach((l, i) => {
    if (!l.hidden) out.push({ key: `layers.${i}`, type: l.type, label: layerLabel(l), locked: !!l.locked });
  });
  return out;
}

// EVERY element incl. hidden/disabled — used by the Layer panel.
export function listAllElements(config) {
  const out = [];
  for (const [key, type, label] of CORE_ELEMENTS) {
    if (config[key]) out.push({ key, type, label, visible: !!config[key].enabled, locked: !!config[key].locked });
  }
  (config.layers || []).forEach((l, i) => {
    out.push({ key: `layers.${i}`, type: l.type, label: layerLabel(l), visible: !l.hidden, locked: !!l.locked, isLayer: true, index: i });
  });
  return out;
}

function getEl(config, key) {
  if (key.startsWith('layers.')) return config.layers[Number(key.split('.')[1])];
  return config[key];
}

/** Bounding box {x,y,w,h} for any element. */
export function elementBox(config, key) {
  const el = getEl(config, key);
  if (!el) return { x: 0, y: 0, w: 0, h: 0 };
  if (key === 'logo') return { x: el.x, y: el.y, w: el.width ?? el.size ?? 120, h: el.height ?? el.size ?? 120 };
  if (key.startsWith('layers.')) {
    if (el.type === 'text') return { x: el.x, y: el.y, w: el.width || 600, h: textHeight(el) };
    if (el.type === 'icon') return { x: el.x, y: el.y, w: el.width ?? el.size ?? 60, h: el.height ?? el.size ?? 60 };
    return { x: el.x, y: el.y, w: el.width, h: el.height };
  }
  if (TEXT_KEYS.includes(key)) return { x: el.x, y: el.y, w: el.width || 600, h: textHeight(el) };
  return { x: el.x, y: el.y, w: el.width, h: el.height }; // photo, panel, adBanner
}

function applyPatch(config, key, patch) {
  if (key.startsWith('layers.')) {
    const i = Number(key.split('.')[1]);
    return { ...config, layers: config.layers.map((l, idx) => idx === i ? { ...l, ...patch } : l) };
  }
  return { ...config, [key]: { ...config[key], ...patch } };
}

/**
 * Apply a new box {x,y,w,h} back to the config (immutable). Handles resize semantics.
 * `handle` (e.g. 'e','se','n'…) lets square elements (logo/icon) resize along the
 * dragged axis instead of always min() — so side handles work too.
 */
export function setElementBox(config, key, box, handle = null) {
  const el = getEl(config, key);
  const isText = key.startsWith('layers.') ? el.type === 'text' : TEXT_KEYS.includes(key);

  // logo & icon are now free boxes too (width/height independent) — drag any side.
  if (isText) {
    const old = elementBox(config, key);
    const scale = old.h > 0 ? box.h / old.h : 1;
    const patch = {
      x: Math.round(box.x), y: Math.round(box.y),
      width: Math.max(40, Math.round(box.w)),
      size: Math.max(8, Math.min(400, Math.round((el.size || 30) * scale))),
    };
    if (el.lineHeight) patch.lineHeight = Math.max(10, Math.round(el.lineHeight * scale));
    return applyPatch(config, key, patch);
  }
  // box elements (photo, panel, adBanner, logo, image/rect/icon layers)
  return applyPatch(config, key, {
    x: Math.round(box.x), y: Math.round(box.y),
    width: Math.max(2, Math.round(box.w)), height: Math.max(2, Math.round(box.h)),
  });
}

/** All external image URLs referenced by a config (for preloading). Tokens resolved. */
export function assetUrls(config, data, settings) {
  const ctx = buildContext(data, settings);
  const urls = [];
  if (config.background?.type === 'image') urls.push(resolveUrl(config.background.imageUrl, ctx));
  if (config.photo?.enabled && ctx.featured_image) urls.push(ctx.featured_image);
  if (config.logo?.enabled) urls.push(config.logo.source === 'custom' ? resolveUrl(config.logo.imageUrl, ctx) : ctx.site_logo);
  if (config.adBanner?.enabled) urls.push(resolveUrl(config.adBanner.imageUrl, ctx));
  (config.layers || []).forEach(l => { if (l.type === 'image') urls.push(resolveUrl(l.imageUrl, ctx)); });
  return urls.filter(Boolean);
}

// ── Drawing ─────────────────────────────────────────────────────────────────
function fillBox(ctx, x, y, w, h, spec, img) {
  if (spec.type === 'image' && img) {
    // paint base colour first so 'contain' letterbox isn't transparent
    ctx.fillStyle = spec.color || '#ffffff'; ctx.fillRect(x, y, w, h);
    drawImageFit(ctx, img, x, y, w, h, spec.fit || 'cover');
    if ((spec.imageOpacity ?? 100) < 100) { ctx.fillStyle = hexToRgba('#000', 100 - spec.imageOpacity); ctx.fillRect(x, y, w, h); }
    return;
  }
  ctx.fillStyle = spec.type === 'gradient' ? makeGradient(ctx, x, y, w, h, spec) : (spec.color || '#fff');
  ctx.fillRect(x, y, w, h);
}

/** Synchronous draw. `getImg(url)` returns a cached HTMLImageElement or null. */
export function drawConfig(canvas, config, data, settings, getImg) {
  const W = config.canvas?.width || 1080, H = config.canvas?.height || 1080;
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const context = buildContext(data, settings);

  // Round the whole card — corners stay transparent (PNG). Everything draws inside this clip.
  const cardRadius = config.canvas?.radius || 0;
  ctx.save();
  if (cardRadius > 0) { roundRectPath(ctx, 0, 0, W, H, cardRadius); ctx.clip(); }

  // Background
  fillBox(ctx, 0, 0, W, H, config.background || { type: 'solid', color: '#fff' },
    config.background?.type === 'image' ? getImg(resolveUrl(config.background.imageUrl, context)) : null);

  for (const { key, type } of listElements(config)) {
    const el = getEl(config, key);
    const b = elementBox(config, key);

    if (key === 'photo') {
      ctx.save(); roundRectPath(ctx, b.x, b.y, b.w, b.h, el.radius || 0); ctx.clip();
      const img = getImg(context.featured_image);
      if (img) drawImageFit(ctx, img, b.x, b.y, b.w, b.h, el.fit || 'cover', el.zoom, el.offsetX, el.offsetY);
      else { ctx.fillStyle = '#2a4a2a'; ctx.fillRect(b.x, b.y, b.w, b.h); }
      if ((el.overlayOpacity ?? 0) > 0) { ctx.fillStyle = hexToRgba(el.overlayColor, el.overlayOpacity); ctx.fillRect(b.x, b.y, b.w, b.h); }
      if (el.fade?.enabled) {
        const fh = el.fade.height || 0, fy = b.y + b.h - fh;
        const g = ctx.createLinearGradient(0, fy, 0, b.y + b.h);
        g.addColorStop(0, hexToRgba(el.fade.color, 0)); g.addColorStop(1, hexToRgba(el.fade.color, el.fade.opacity));
        ctx.fillStyle = g; ctx.fillRect(b.x, fy, b.w, fh);
      }
      ctx.restore();
    }
    else if (key === 'panel') {
      // Blend: the panel's top color fades up into the photo above it.
      if (el.feather?.enabled && el.feather.height > 0) {
        const topColor = el.type === 'gradient' ? (el.gradientFrom || el.color) : (el.color || '#000');
        const fh = Math.min(el.feather.height, b.y);
        const g = ctx.createLinearGradient(0, b.y - fh, 0, b.y);
        g.addColorStop(0, hexToRgba(topColor, 0));
        g.addColorStop(1, hexToRgba(topColor, 100));
        ctx.fillStyle = g;
        ctx.fillRect(b.x, b.y - fh, b.w, fh);
      }
      fillBox(ctx, b.x, b.y, b.w, b.h, el, null);
    }
    else if (key === 'adBanner') {
      // Always paint the banner background first, then the ad image on top (so
      // 'contain' shows the whole ad centred on the banner colour).
      if (el.bgType === 'gradient') { ctx.fillStyle = makeGradient(ctx, b.x, b.y, b.w, b.h, el); ctx.fillRect(b.x, b.y, b.w, b.h); }
      else { ctx.fillStyle = el.bgColor || '#ffcc00'; ctx.fillRect(b.x, b.y, b.w, b.h); }
      const img = getImg(resolveUrl(el.imageUrl, context));
      if (img) drawImageFit(ctx, img, b.x, b.y, b.w, b.h, el.fit || 'cover');
      const adText = resolveTokens(el.text, context);
      if (adText) {
        ctx.fillStyle = el.textColor || '#000'; ctx.font = `${el.textWeight || 700} ${el.textSize || 32}px ${fontStack(el.textFont)}`;
        ctx.textAlign = el.textAlign || 'center'; ctx.textBaseline = 'middle';
        const tx = el.textAlign === 'left' ? b.x + 24 : el.textAlign === 'right' ? b.x + b.w - 24 : b.x + b.w / 2;
        ctx.fillText(adText, tx, b.y + b.h / 2);
        ctx.textBaseline = 'alphabetic';
      }
    }
    else if (key === 'logo') {
      // Free box. circle → ellipse fitting the box; rect → rounded rectangle.
      const img = getImg(el.source === 'custom' ? resolveUrl(el.imageUrl, context) : context.site_logo);
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2, bw = el.borderWidth || 0;
      const isCircle = el.shape === 'circle';
      if (isCircle) {
        if (bw > 0) { ctx.beginPath(); ctx.ellipse(cx, cy, b.w / 2 + bw, b.h / 2 + bw, 0, 0, 7); ctx.fillStyle = el.borderColor || '#fff'; ctx.fill(); }
        if (img) { ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, b.w / 2, b.h / 2, 0, 0, 7); ctx.clip(); drawImageFit(ctx, img, b.x, b.y, b.w, b.h, 'cover', el.zoom, el.offsetX, el.offsetY); ctx.restore(); }
      } else {
        if (bw > 0) { roundRectPath(ctx, b.x - bw, b.y - bw, b.w + bw * 2, b.h + bw * 2, (el.radius || 0) + bw); ctx.fillStyle = el.borderColor || '#fff'; ctx.fill(); }
        if (img) { ctx.save(); roundRectPath(ctx, b.x, b.y, b.w, b.h, el.radius || 0); ctx.clip(); drawImageFit(ctx, img, b.x, b.y, b.w, b.h, el.fit || 'contain', el.zoom, el.offsetX, el.offsetY); ctx.restore(); }
      }
    }
    else if (type === 'text') {
      drawTextBox(ctx, el, textValue(key, el, context));
    }
    else if (type === 'image') {
      ctx.save(); ctx.globalAlpha = (el.opacity ?? 100) / 100;
      if (el.rotation) { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; ctx.translate(cx, cy); ctx.rotate(el.rotation * Math.PI / 180); ctx.translate(-cx, -cy); }
      const img = getImg(resolveUrl(el.imageUrl, context));
      if (img) { roundRectPath(ctx, b.x, b.y, b.w, b.h, el.radius || 0); ctx.clip(); drawImageFit(ctx, img, b.x, b.y, b.w, b.h, el.fit || 'cover', el.zoom, el.offsetX, el.offsetY); }
      else { ctx.fillStyle = '#33333344'; roundRectPath(ctx, b.x, b.y, b.w, b.h, el.radius || 0); ctx.fill(); }
      ctx.restore();
    }
    else if (type === 'rect') {
      ctx.save(); ctx.globalAlpha = (el.opacity ?? 100) / 100;
      if (el.rotation) { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; ctx.translate(cx, cy); ctx.rotate(el.rotation * Math.PI / 180); ctx.translate(-cx, -cy); }
      roundRectPath(ctx, b.x, b.y, b.w, b.h, el.radius || 0); ctx.fillStyle = el.color || '#000'; ctx.fill();
      ctx.restore();
    }
    else if (type === 'social') {
      ctx.save(); ctx.globalAlpha = (el.opacity ?? 100) / 100; drawSocial(ctx, el, context); ctx.restore();
    }
    else if (type === 'icon') {
      ctx.save(); ctx.globalAlpha = (el.opacity ?? 100) / 100;
      if (el.rotation) { const cx = b.x + b.w / 2, cy = b.y + b.h / 2; ctx.translate(cx, cy); ctx.rotate(el.rotation * Math.PI / 180); ctx.translate(-cx, -cy); }
      drawIconBox(ctx, ICON_PATHS[el.icon], b.x, b.y, b.w, b.h, el.color || '#222222');
      ctx.restore();
    }
  }
  ctx.restore(); // end card-radius clip
  return canvas;
}
