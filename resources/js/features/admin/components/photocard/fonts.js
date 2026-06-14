// ─── Photocard font registry ──────────────────────────────────────────────────
// Curated fonts the client can pick. Already-loaded fonts (Bengali maateen +
// English Google fonts in app.blade.php) render immediately; the rest are loaded
// on demand by injecting a Google Fonts stylesheet, then awaited before render.

export const FONTS = [
  // Bengali — these render Bengali AND English text.
  { name: 'SolaimanLipi',     label: 'SolaimanLipi (সোলায়মান)', lang: 'bn', preloaded: true },
  { name: 'Kalpurush',        label: 'Kalpurush (কালপুরুষ)',     lang: 'bn', preloaded: true },
  { name: 'Noto Sans Bengali',label: 'Noto Sans Bengali',        lang: 'bn', google: 'Noto+Sans+Bengali:wght@400;500;600;700;800;900' },
  { name: 'Hind Siliguri',    label: 'Hind Siliguri',            lang: 'bn', google: 'Hind+Siliguri:wght@300;400;500;600;700' },
  { name: 'Anek Bangla',      label: 'Anek Bangla',              lang: 'bn', google: 'Anek+Bangla:wght@400;500;600;700;800' },
  { name: 'Baloo Da 2',       label: 'Baloo Da 2 (rounded)',     lang: 'bn', google: 'Baloo+Da+2:wght@400;500;600;700;800' },
  { name: 'Tiro Bangla',      label: 'Tiro Bangla (serif)',      lang: 'bn', google: 'Tiro+Bangla:ital@0;1' },
  { name: 'Galada',           label: 'Galada (display)',         lang: 'bn', google: 'Galada' },

  // English ONLY — for the English edition. (No Bengali glyphs.)
  { name: 'Playfair Display', label: 'Playfair Display',         lang: 'en', preloaded: true },
  { name: 'Merriweather',     label: 'Merriweather',             lang: 'en', preloaded: true },
  { name: 'Montserrat',       label: 'Montserrat',               lang: 'en', google: 'Montserrat:wght@400;500;600;700;800;900' },
  { name: 'Poppins',          label: 'Poppins',                  lang: 'en', google: 'Poppins:wght@400;500;600;700;800;900' },
  { name: 'Roboto',           label: 'Roboto',                   lang: 'en', google: 'Roboto:wght@400;500;700;900' },
  { name: 'Oswald',           label: 'Oswald (condensed)',       lang: 'en', google: 'Oswald:wght@400;500;600;700' },
];

const FONT_BY_NAME = Object.fromEntries(FONTS.map(f => [f.name, f]));

// Always include a Bengali-capable fallback chain so missing glyphs still render.
export function fontStack(name) {
  if (!name) name = 'SolaimanLipi';
  return `'${name}', 'SolaimanLipi', 'Noto Sans Bengali', 'Hind Siliguri', sans-serif`;
}

const injected = new Map(); // spec -> Promise (resolves when the stylesheet has loaded)

function injectGoogle(googleSpec) {
  if (injected.has(googleSpec)) return injected.get(googleSpec);
  const p = new Promise(resolve => {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${googleSpec}&display=swap`;
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
  injected.set(googleSpec, p);
  return p;
}

/**
 * Ensure a font is loaded & ready for canvas use at the given weight.
 * Resolves even on failure (graceful — falls back to the stack).
 */
export async function ensureFont(name, weight = 700) {
  const meta = FONT_BY_NAME[name];
  try {
    // Wait for the @font-face rule to be registered BEFORE asking the FontFaceSet
    // to load it — otherwise document.fonts.load resolves instantly with no match.
    if (meta?.google) await injectGoogle(meta.google);
    if (document.fonts?.load) {
      await Promise.all([
        document.fonts.load(`${weight} 64px '${name}'`, 'নমুনা'),
        document.fonts.load(`${weight} 64px '${name}'`, 'Sample'),
      ]);
    }
  } catch {
    /* ignore — fontStack() fallback covers it */
  }
}

/** Ensure every font referenced anywhere in a config is loaded before rendering. */
export async function ensureConfigFonts(config) {
  if (!config) return;
  const wanted = new Set();
  const add = (n, w) => { if (n) wanted.add(`${n}::${w || 700}`); };

  add(config.headline?.font, config.headline?.weight);
  add(config.cta?.font, config.cta?.weight);
  add(config.urlText?.font, config.urlText?.weight);
  add(config.dateText?.font, config.dateText?.weight);
  add(config.adBanner?.textFont, config.adBanner?.textWeight);
  (config.layers || []).forEach(l => { if (l.type === 'text') add(l.font, l.weight); });

  await Promise.all([...wanted].map(k => {
    const [n, w] = k.split('::');
    return ensureFont(n, Number(w));
  }));
}
