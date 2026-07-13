// Per-visitor popup frequency logic. Pure functions (mergePopupConfig,
// pageMatches, capsAllow) are storage-free and unit-tested; the record*/read*
// helpers wrap localStorage/sessionStorage and are verified by driving the app.

// Safe default applied to any missing keys — matches the migration/admin default
// so an unconfigured (null) popup ad is capped, never aggressive.
export const DEFAULT_POPUP_CONFIG = {
  triggers: {
    delay:          { enabled: true,  seconds: 3 },
    scroll:         { enabled: false, percent: 50 },
    exit_intent:    { enabled: false },
    min_page_views: { enabled: false, count: 2 },
  },
  frequency: {
    max_shows:  { enabled: true,  count: 1, per: 'session' },
    cooldown:   { enabled: false, minutes: 30 },
    on_dismiss: { enabled: false, hours: 24 },
    on_click:   { enabled: false, days: 7 },
  },
  targeting: { pages: 'all', devices: 'all' },
};

export function mergePopupConfig(config) {
  const c = config || {};
  const d = DEFAULT_POPUP_CONFIG;
  const t = c.triggers || {}, f = c.frequency || {}, g = c.targeting || {};
  return {
    triggers: {
      delay:          { ...d.triggers.delay,          ...(t.delay || {}) },
      scroll:         { ...d.triggers.scroll,         ...(t.scroll || {}) },
      exit_intent:    { ...d.triggers.exit_intent,    ...(t.exit_intent || {}) },
      min_page_views: { ...d.triggers.min_page_views, ...(t.min_page_views || {}) },
    },
    frequency: {
      max_shows:  { ...d.frequency.max_shows,  ...(f.max_shows || {}) },
      cooldown:   { ...d.frequency.cooldown,   ...(f.cooldown || {}) },
      on_dismiss: { ...d.frequency.on_dismiss, ...(f.on_dismiss || {}) },
      on_click:   { ...d.frequency.on_click,   ...(f.on_click || {}) },
    },
    targeting: { ...d.targeting, ...g },
  };
}

export function pageMatches(pages, url) {
  const path = (url || '/').split('?')[0].replace(/^\/en(?=\/|$)/, '') || '/';
  if (pages === 'all') return true;
  if (pages === 'home') return path === '/';
  const segs = path.split('/').filter(Boolean);
  if (pages === 'category') return segs.length === 1;   // /{category}
  if (pages === 'article')  return segs.length >= 2;    // /{category}/{slug}
  return true;
}

export function deviceMatches(devices) {
  if (devices === 'all' || typeof window === 'undefined') return true;
  const mobile = window.innerWidth <= 768;
  return devices === 'mobile' ? mobile : !mobile;
}

// Pure cap evaluation. `state` = {shows:number[], lastShown, dismissedAt, clickedAt, sessionShows?}.
export function capsAllow(config, state, now) {
  const f = config.frequency;
  const s = state || { shows: [], lastShown: 0, dismissedAt: null, clickedAt: null };
  const shows = s.shows || [];

  if (f.max_shows.enabled) {
    let count;
    if (f.max_shows.per === 'lifetime') count = shows.length;
    else if (f.max_shows.per === 'day') {
      const midnight = new Date(now); midnight.setHours(0, 0, 0, 0);
      count = shows.filter(t => t >= midnight.getTime()).length;
    } else count = s.sessionShows || 0; // 'session' — caller injects sessionShows
    if (count >= f.max_shows.count) return false;
  }
  if (f.cooldown.enabled && s.lastShown && now - s.lastShown < f.cooldown.minutes * 60000) return false;
  if (f.on_dismiss.enabled && s.dismissedAt) {
    if (f.on_dismiss.hours === 0) return false;
    if (now - s.dismissedAt < f.on_dismiss.hours * 3600000) return false;
  }
  if (f.on_click.enabled && s.clickedAt && now - s.clickedAt < f.on_click.days * 86400000) return false;
  return true;
}

// ── storage helpers ────────────────────────────────────────────────
const key = (adId) => `pa_popup_${adId}`;
const sesKey = (adId) => `pa_popup_ses_${adId}`;

export function readState(adId) {
  try { return JSON.parse(localStorage.getItem(key(adId))) || {}; } catch { return {}; }
}
function writeState(adId, patch) {
  const next = { ...readState(adId), ...patch };
  try { localStorage.setItem(key(adId), JSON.stringify(next)); } catch {}
  return next;
}
export function sessionShows(adId) {
  try { return parseInt(sessionStorage.getItem(sesKey(adId)) || '0', 10) || 0; } catch { return 0; }
}
export function recordShow(adId) {
  const st = readState(adId);
  const shows = (st.shows || []).concat(Date.now());
  writeState(adId, { shows, lastShown: Date.now() });
  try { sessionStorage.setItem(sesKey(adId), String(sessionShows(adId) + 1)); } catch {}
}
export function recordDismiss(adId) { writeState(adId, { dismissedAt: Date.now() }); }
export function recordClick(adId) { writeState(adId, { clickedAt: Date.now() }); }

export function bumpPageViews() {
  const n = getPageViews() + 1;
  try { sessionStorage.setItem('pa_popup_pv', String(n)); } catch {}
  return n;
}
export function getPageViews() {
  try { return parseInt(sessionStorage.getItem('pa_popup_pv') || '0', 10) || 0; } catch { return 0; }
}
