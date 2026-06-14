// ─── Photocard config schema ──────────────────────────────────────────────────
// One canonical shape, shared by the renderer (dynamicRenderer.js), the element
// model (elements.js) and the Studio editor. Every visible thing is a BOX
// (x, y, width, height in top-left coords) so it can be moved & resized on canvas.
// Keep in sync with database/seeders/PhotocardTemplateSeeder.php.

export const CANVAS_PRESETS = {
  square:    { label: 'Square 1080×1080',     width: 1080, height: 1080 },
  story:     { label: 'Story 1080×1920',      width: 1080, height: 1920 },
  landscape: { label: 'Landscape 1200×630',   width: 1200, height: 630 },
  portrait:  { label: 'Portrait 1080×1350',   width: 1080, height: 1350 },
  custom:    { label: 'Custom…',              width: 1080, height: 1080 },
};

// Sample data used for live preview inside the Studio (no real article needed).
export const SAMPLE_DATA = {
  title: 'এখানে আপনার সংবাদের শিরোনাম দেখা যাবে — তিন লাইন পর্যন্ত',
  title_en: 'Your headline preview appears here — up to three lines long',
  featured_image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80',
  published_at: new Date().toISOString(),
  slug: 'preview',
};

export function defaultConfig() {
  return {
    canvas: { width: 1080, height: 1080, radius: 0 },

    background: {
      type: 'gradient', color: '#111111',
      gradientFrom: '#0a0a0a', gradientMid: null, gradientMidPos: 50,
      gradientTo: '#2a0505', gradientAngle: 180,
      imageUrl: null, imageOpacity: 100, fit: 'cover',
    },

    photo: {
      enabled: true,
      x: 0, y: 0, width: 1080, height: 560, radius: 0,
      fit: 'cover', zoom: 1, offsetX: 0, offsetY: 0,
      overlayColor: '#000000', overlayOpacity: 18,
      fade: { enabled: true, color: '#000000', opacity: 72, height: 180 },
    },

    panel: {
      enabled: true,
      x: 0, y: 560, width: 1080, height: 520,
      type: 'gradient', color: '#1a0303',
      gradientFrom: '#0a0a0a', gradientMid: '#1a0303', gradientMidPos: 30,
      gradientTo: '#2a0505', gradientAngle: 180,
      // Smooth blend: the panel's top color fades UP into the photo above it.
      feather: { enabled: true, height: 120 },
    },

    logo: {
      enabled: true, source: 'site', imageUrl: null,
      x: 480, y: 500, width: 120, height: 120,   // free box (x,y = top-left)
      shape: 'circle', fit: 'contain', zoom: 1, offsetX: 0, offsetY: 0,
      borderColor: '#ffffff', borderWidth: 4, radius: 12,
    },

    headline: {
      enabled: true, source: 'title', customText: '',
      font: 'SolaimanLipi', size: 50, weight: 900, color: '#ffffff',
      align: 'center', x: 50, y: 700, width: 980, lineHeight: 88, maxLines: 3,
      shadow: { enabled: false, color: '#000000', blur: 8, x: 0, y: 2 },
    },

    cta: {
      enabled: true, text: 'বিস্তারিত কমেন্টে ...',
      font: 'SolaimanLipi', size: 30, weight: 700, color: '#dddddd',
      align: 'left', x: 44, y: 952, width: 700,
    },

    urlText: {
      enabled: true, text: '', // empty => settings.site_url
      font: 'SolaimanLipi', size: 28, weight: 500, color: '#cccccc',
      align: 'left', x: 44, y: 1004, width: 600,
    },

    dateText: {
      enabled: true,
      font: 'SolaimanLipi', size: 28, weight: 500, color: '#cccccc',
      align: 'right', x: 480, y: 1004, width: 556,
    },

    adBanner: {
      enabled: false,
      x: 0, y: 960, width: 1080, height: 120,
      bgType: 'solid', bgColor: '#ffcc00',
      gradientFrom: '#ffcc00', gradientTo: '#ff8800', gradientAngle: 90,
      imageUrl: null, fit: 'cover',
      text: '', textColor: '#000000', textSize: 32,
      textFont: 'SolaimanLipi', textWeight: 700, textAlign: 'center',
    },

    layers: [],
  };
}

let layerSeq = 0;
export function makeLayer(type) {
  const id = `L${Date.now().toString(36)}${(layerSeq++).toString(36)}`;
  if (type === 'text') {
    return { id, type: 'text', text: 'নতুন টেক্সট', font: 'SolaimanLipi', size: 40,
             weight: 700, color: '#ffffff', align: 'left', x: 80, y: 200, width: 600,
             lineHeight: 52, maxLines: 4, rotation: 0, opacity: 100,
             shadow: { enabled: false, color: '#000000', blur: 8, x: 0, y: 2 } };
  }
  if (type === 'image') {
    return { id, type: 'image', imageUrl: null, x: 80, y: 200, width: 240, height: 240,
             radius: 0, rotation: 0, opacity: 100, fit: 'cover', zoom: 1, offsetX: 0, offsetY: 0 };
  }
  if (type === 'icon') {
    return { id, type: 'icon', icon: 'globe', color: '#222222', x: 80, y: 200, width: 64, height: 64, rotation: 0, opacity: 100 };
  }
  if (type === 'social') {
    return { id, type: 'social', x: 0, y: 980, width: 1080, height: 90,
             bg: '#f5f5f5', style: 'badge', iconColor: '', glyphColor: '#ffffff',
             labelColor: '#333333', showLabels: true,
             size: 34, gap: 36, font: 'SolaimanLipi', align: 'center', opacity: 100,
             source: 'manual', platforms: ['facebook', 'instagram', 'tiktok', 'linkedin'] };
  }
  return { id, type: 'rect', color: '#e8001e', x: 80, y: 200, width: 300, height: 100,
           radius: 0, rotation: 0, opacity: 100 };
}

// Deep-merge a stored config onto fresh defaults so older/partial configs stay valid.
export function normalizeConfig(stored) {
  const base = defaultConfig();
  if (!stored || typeof stored !== 'object') return base;

  // Legacy migration: logo/icon used to be square (`size`); convert to free box.
  const s = JSON.parse(JSON.stringify(stored));
  if (s.logo && s.logo.size != null && s.logo.width == null) { s.logo.width = s.logo.size; s.logo.height = s.logo.size; }
  if (Array.isArray(s.layers)) s.layers.forEach(l => {
    if (l && l.type === 'icon' && l.size != null && l.width == null) { l.width = l.size; l.height = l.size; }
  });

  const merge = (d, s) => {
    if (Array.isArray(d)) return Array.isArray(s) ? s : d;
    if (d && typeof d === 'object') {
      const out = { ...d };
      for (const k of Object.keys(d)) if (s && k in s) out[k] = merge(d[k], s[k]);
      if (s) for (const k of Object.keys(s)) if (!(k in out)) out[k] = s[k];
      return out;
    }
    return s === undefined ? d : s;
  };
  return merge(base, s);
}
