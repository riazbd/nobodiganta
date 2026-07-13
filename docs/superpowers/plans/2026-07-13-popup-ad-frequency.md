# Popup Ad Frequency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the admin per-ad control over how the site-wide popup appears — triggers, frequency caps, and page/device targeting — enforced per visitor in the browser.

**Architecture:** A nullable JSON `popup_config` column on `ads` holds the rules, edited in the existing ad form and served with the `popupAd` prop. A pure helper module (`popupFrequency.js`) evaluates gates/caps against `localStorage`/`sessionStorage` state; `PopupAd.jsx` uses it to arm triggers and decide when to show.

**Tech Stack:** Laravel (pgsql) + Inertia/React 18, Vite. Ads admin in `resources/js/features/admin/pages/AdsManagement.jsx`.

## Global Constraints

- DB is PostgreSQL. Use `$table->json('popup_config')->nullable()`.
- No JS test runner exists in this repo (only phpunit). Pure JS logic is smoke-tested with `node`; UI/behaviour is verified by `npm run build` + driving the running app and inspecting `localStorage`/`sessionStorage`. Do NOT add a JS test framework.
- Admin form uses plain `adForm` state posted via `router.post/put` (NOT Inertia `useForm`); keys are camelCase and mapped to snake_case columns in `AdController::adAttributes`.
- Config keys/values exactly as in the spec: triggers `delay{enabled,seconds}` `scroll{enabled,percent}` `exit_intent{enabled}` `min_page_views{enabled,count}`; frequency `max_shows{enabled,count,per}` (per ∈ session|day|lifetime) `cooldown{enabled,minutes}` `on_dismiss{enabled,hours}` (0=forever) `on_click{enabled,days}`; targeting `pages` (all|home|article|category) `devices` (all|desktop|mobile).
- localStorage key `pa_popup_<adId>` = `{shows:number[], lastShown:number, dismissedAt:number|null, clickedAt:number|null}`. sessionStorage: `pa_popup_pv` (page views), `pa_popup_ses_<adId>` (session show count).
- Popup targeting device: viewport width ≤ 768 = mobile.

---

## File Structure

- `database/migrations/2026_07_13_100000_add_popup_config_to_ads_table.php` (new) — column + backfill.
- `app/Models/Ad.php` — fillable + cast.
- `app/Http/Controllers/Admin/AdController.php` — validate + map + return config.
- `app/Http/Middleware/HandleInertiaRequests.php` — share `config` in `popupAd`.
- `resources/js/lib/popupFrequency.js` (new) — pure logic + storage helpers + defaults.
- `resources/js/Components/PopupAd.jsx` — rewrite to use the helper + triggers.
- `resources/js/features/admin/pages/AdsManagement.jsx` — "Popup behaviour" form section.

---

## Task 1: Migration + model (popup_config column, backfill, cast)

**Files:**
- Create: `database/migrations/2026_07_13_100000_add_popup_config_to_ads_table.php`
- Modify: `app/Models/Ad.php` (`$fillable`, `$casts`)

**Interfaces:**
- Produces: `ads.popup_config` (json, nullable); `Ad::$popup_config` cast to array. The default config shape reused by Task 2/5.

- [ ] **Step 1: Write the migration.**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->json('popup_config')->nullable()->after('code');
        });

        // Backfill existing popup ad(s) with a safe default so they stop being aggressive.
        $default = [
            'triggers' => [
                'delay'          => ['enabled' => true,  'seconds' => 3],
                'scroll'         => ['enabled' => false, 'percent' => 50],
                'exit_intent'    => ['enabled' => false],
                'min_page_views' => ['enabled' => false, 'count' => 2],
            ],
            'frequency' => [
                'max_shows'  => ['enabled' => true,  'count' => 1, 'per' => 'session'],
                'cooldown'   => ['enabled' => false, 'minutes' => 30],
                'on_dismiss' => ['enabled' => false, 'hours' => 24],
                'on_click'   => ['enabled' => false, 'days' => 7],
            ],
            'targeting' => ['pages' => 'all', 'devices' => 'all'],
        ];
        DB::table('ads')->where('position', 'popup')->update(['popup_config' => json_encode($default)]);
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropColumn('popup_config');
        });
    }
};
```

- [ ] **Step 2: Add fillable + cast to the model.**

In `app/Models/Ad.php`, add `'popup_config'` to the end of `$fillable` (after `'sort_order'`), and add to `$casts`:

```php
        'popup_config' => 'array',
```

- [ ] **Step 3: Run the migration.**

Run: `php artisan migrate`
Expected: migrates `...add_popup_config_to_ads_table` with no error.

- [ ] **Step 4: Verify column + backfill.**

Run: `php artisan tinker --execute="\$a=App\Models\Ad::where('position','popup')->first(); echo json_encode(\$a?->popup_config);"`
Expected: prints the default config JSON (or `null` if no popup ad exists yet — acceptable).

- [ ] **Step 5: Commit.**

```bash
git add database/migrations/2026_07_13_100000_add_popup_config_to_ads_table.php app/Models/Ad.php
git commit -m "feat(ads): add popup_config column with safe backfill"
```

---

## Task 2: Serve + validate the config (backend wiring)

**Files:**
- Modify: `app/Http/Middleware/HandleInertiaRequests.php` (~lines 104-112, the `popupAd` array)
- Modify: `app/Http/Controllers/Admin/AdController.php` (`validateAd`, `adAttributes`, `mapAd`)

**Interfaces:**
- Consumes: `Ad::$popup_config` (Task 1).
- Produces: `popupAd.config` on the public side; `popupConfig` accepted by store/update and returned by `mapAd` as `popupConfig`.

- [ ] **Step 1: Share config with the public popup.**

In `HandleInertiaRequests.php`, inside the `'popupAd' => $popupAd ? [ ... ]` array, add after the `'code'` line:

```php
                'config'    => $popupAd->popup_config,
```

- [ ] **Step 2: Validate the config on save.**

In `AdController::validateAd`, add these rules to the `$request->validate([...])` array (bounded so bad values can't break behaviour):

```php
            'popupConfig' => 'nullable|array',
            'popupConfig.triggers.delay.enabled' => 'nullable|boolean',
            'popupConfig.triggers.delay.seconds' => 'nullable|integer|min:0|max:120',
            'popupConfig.triggers.scroll.enabled' => 'nullable|boolean',
            'popupConfig.triggers.scroll.percent' => 'nullable|integer|min:1|max:100',
            'popupConfig.triggers.exit_intent.enabled' => 'nullable|boolean',
            'popupConfig.triggers.min_page_views.enabled' => 'nullable|boolean',
            'popupConfig.triggers.min_page_views.count' => 'nullable|integer|min:1|max:50',
            'popupConfig.frequency.max_shows.enabled' => 'nullable|boolean',
            'popupConfig.frequency.max_shows.count' => 'nullable|integer|min:1|max:50',
            'popupConfig.frequency.max_shows.per' => 'nullable|in:session,day,lifetime',
            'popupConfig.frequency.cooldown.enabled' => 'nullable|boolean',
            'popupConfig.frequency.cooldown.minutes' => 'nullable|integer|min:1|max:10080',
            'popupConfig.frequency.on_dismiss.enabled' => 'nullable|boolean',
            'popupConfig.frequency.on_dismiss.hours' => 'nullable|integer|min:0|max:8760',
            'popupConfig.frequency.on_click.enabled' => 'nullable|boolean',
            'popupConfig.frequency.on_click.days' => 'nullable|integer|min:0|max:365',
            'popupConfig.targeting.pages' => 'nullable|in:all,home,article,category',
            'popupConfig.targeting.devices' => 'nullable|in:all,desktop,mobile',
```

- [ ] **Step 3: Persist the config.**

In `AdController::adAttributes`, add to the returned array (after `'sort_order'`):

```php
            'popup_config' => $v['popupConfig'] ?? ($ad->popup_config ?? null),
```

- [ ] **Step 4: Return the config to the admin form.**

In `AdController::mapAd`, add to the returned array (after `'endDate'`):

```php
            'popupConfig' => $ad->popup_config,
```

- [ ] **Step 5: Build + verify round-trip.**

Run: `php artisan route:clear && php artisan config:clear`
Then check the public payload:
Run: `php artisan tinker --execute="\$a=App\Models\Ad::where('position','popup')->first(); echo json_encode(\$a?->popup_config['frequency']['max_shows'] ?? null);"`
Expected: prints `{"enabled":true,"count":1,"per":"session"}` (from Task 1 backfill).

- [ ] **Step 6: Commit.**

```bash
git add app/Http/Middleware/HandleInertiaRequests.php app/Http/Controllers/Admin/AdController.php
git commit -m "feat(ads): validate, persist and serve popup_config"
```

---

## Task 3: popupFrequency.js helper (pure logic + storage)

**Files:**
- Create: `resources/js/lib/popupFrequency.js`
- Test: `resources/js/lib/popupFrequency.test.mjs` (temporary Node smoke test; removed at end of task)

**Interfaces:**
- Produces (consumed by Task 4):
  - `mergePopupConfig(config): FullConfig` — deep-merges over `DEFAULT_POPUP_CONFIG`.
  - `pageMatches(pages: string, url: string): boolean`
  - `deviceMatches(devices: string): boolean` (uses `window.innerWidth`)
  - `capsAllow(config, state, now): boolean` — pure; evaluates enabled caps.
  - `readState(adId): State`, `recordShow(adId)`, `recordDismiss(adId)`, `recordClick(adId)`
  - `bumpPageViews(): number`, `getPageViews(): number`
  - `sessionShows(adId): number`

- [ ] **Step 1: Write the failing Node smoke test.**

Create `resources/js/lib/popupFrequency.test.mjs`:

```js
import assert from 'node:assert';
import { mergePopupConfig, pageMatches, capsAllow } from './popupFrequency.js';

// mergePopupConfig fills defaults
const m = mergePopupConfig({ triggers: { delay: { seconds: 9 } } });
assert.equal(m.triggers.delay.seconds, 9);
assert.equal(m.triggers.delay.enabled, true);
assert.equal(m.frequency.max_shows.per, 'session');

// pageMatches
assert.equal(pageMatches('all', '/anything'), true);
assert.equal(pageMatches('home', '/'), true);
assert.equal(pageMatches('home', '/politics/x'), false);
assert.equal(pageMatches('article', '/politics/some-slug'), true);
assert.equal(pageMatches('category', '/politics'), true);

// capsAllow: lifetime max 2 -> blocked at 2 shows
const cfg = mergePopupConfig({ frequency: { max_shows: { enabled: true, count: 2, per: 'lifetime' } } });
const now = Date.now();
assert.equal(capsAllow(cfg, { shows: [1, 2], lastShown: 2, dismissedAt: null, clickedAt: null }, now), false);
assert.equal(capsAllow(cfg, { shows: [1], lastShown: 1, dismissedAt: null, clickedAt: null }, now), true);

// cooldown 30 min
const cd = mergePopupConfig({ frequency: { max_shows: { enabled: false }, cooldown: { enabled: true, minutes: 30 } } });
assert.equal(capsAllow(cd, { shows: [now], lastShown: now, dismissedAt: null, clickedAt: null }, now + 10 * 60000), false);
assert.equal(capsAllow(cd, { shows: [now], lastShown: now, dismissedAt: null, clickedAt: null }, now + 40 * 60000), true);

// on_dismiss forever (hours 0)
const dm = mergePopupConfig({ frequency: { max_shows: { enabled: false }, on_dismiss: { enabled: true, hours: 0 } } });
assert.equal(capsAllow(dm, { shows: [], lastShown: 0, dismissedAt: now, clickedAt: null }, now + 999999999), false);

console.log('popupFrequency OK');
```

- [ ] **Step 2: Run it to verify it fails.**

Run: `node resources/js/lib/popupFrequency.test.mjs`
Expected: FAIL — `Cannot find module ... popupFrequency.js`.

- [ ] **Step 3: Implement the helper.**

Create `resources/js/lib/popupFrequency.js`:

```js
// Per-visitor popup frequency logic. Pure functions (mergePopupConfig,
// pageMatches, capsAllow) are storage-free and unit-tested; the record*/read*
// helpers wrap localStorage/sessionStorage and are verified by driving the app.

export const DEFAULT_POPUP_CONFIG = {
  triggers: {
    delay:          { enabled: true,  seconds: 0 },
    scroll:         { enabled: false, percent: 50 },
    exit_intent:    { enabled: false },
    min_page_views: { enabled: false, count: 2 },
  },
  frequency: {
    max_shows:  { enabled: false, count: 1, per: 'session' },
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

// Pure cap evaluation. `state` = {shows:number[], lastShown, dismissedAt, clickedAt}.
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
  let n = getPageViews() + 1;
  try { sessionStorage.setItem('pa_popup_pv', String(n)); } catch {}
  return n;
}
export function getPageViews() {
  try { return parseInt(sessionStorage.getItem('pa_popup_pv') || '0', 10) || 0; } catch { return 0; }
}
```

- [ ] **Step 4: Run the test to verify it passes.**

Run: `node resources/js/lib/popupFrequency.test.mjs`
Expected: prints `popupFrequency OK`.

- [ ] **Step 5: Remove the temporary test file.**

Run: `rm resources/js/lib/popupFrequency.test.mjs`
(The pure logic is validated; the file isn't part of a runner.)

- [ ] **Step 6: Commit.**

```bash
git add resources/js/lib/popupFrequency.js
git commit -m "feat(ads): popup frequency helper (triggers, caps, storage)"
```

---

## Task 4: Rewrite PopupAd.jsx to use the config

**Files:**
- Modify: `resources/js/Components/PopupAd.jsx` (the top component; keep `PopupAdContent` and `AdCode` unchanged)

**Interfaces:**
- Consumes: `popupAd.config` (Task 2), all exports from `popupFrequency.js` (Task 3).

- [ ] **Step 1: Replace the imports and the `PopupAd` function body.**

At the top of `PopupAd.jsx`, add to the imports:

```js
import { mergePopupConfig, pageMatches, deviceMatches, capsAllow, readState, sessionShows, recordShow, recordDismiss, recordClick, bumpPageViews, getPageViews } from '../lib/popupFrequency';
```

Replace the whole `export default function PopupAd() { ... }` (through its closing `}` before `function PopupAdContent`) with:

```js
export default function PopupAd() {
  const page = usePage();
  const popupAd = page.props.popupAd;
  const url = page.url;

  const [visible, setVisible] = useState(false);
  const tracked = useRef(false);

  useEffect(() => {
    if (!popupAd?.id) return;
    setVisible(false);
    tracked.current = false;
    const cfg = mergePopupConfig(popupAd.config);
    const pv = bumpPageViews();

    // Gates: targeting + min page views + frequency caps.
    if (!pageMatches(cfg.targeting.pages, url)) return;
    if (!deviceMatches(cfg.targeting.devices)) return;
    if (cfg.triggers.min_page_views.enabled && pv < cfg.triggers.min_page_views.count) return;
    const state = { ...readState(popupAd.id), sessionShows: sessionShows(popupAd.id) };
    if (!capsAllow(cfg, state, Date.now())) return;

    // Arm triggers (OR / first-to-fire). Cleanup removes all on unmount/navigation.
    let done = false;
    const cleanups = [];
    const fire = () => {
      if (done) return;
      done = true;
      cleanups.forEach(fn => fn());
      recordShow(popupAd.id);
      setVisible(true);
    };
    const t = cfg.triggers;
    const anyTrigger = t.delay.enabled || t.scroll.enabled || t.exit_intent.enabled;

    if (!anyTrigger || t.delay.enabled) {
      const id = setTimeout(fire, (anyTrigger ? t.delay.seconds : 0) * 1000);
      cleanups.push(() => clearTimeout(id));
    }
    if (t.scroll.enabled) {
      const onScroll = () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (h > 0 && (window.scrollY / h) * 100 >= t.scroll.percent) fire();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener('scroll', onScroll));
    }
    if (t.exit_intent.enabled) {
      const onLeave = (e) => { if (e.clientY <= 0) fire(); };
      document.addEventListener('mouseout', onLeave);
      cleanups.push(() => document.removeEventListener('mouseout', onLeave));
    }
    return () => cleanups.forEach(fn => fn());
  }, [popupAd, url]);

  useEffect(() => {
    if (visible && popupAd?.id && !tracked.current) {
      tracked.current = true;
      trackImpression(popupAd.id);
    }
  }, [visible, popupAd]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => { if (e.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!popupAd || !visible) return null;

  const dismiss = () => { recordDismiss(popupAd.id); setVisible(false); };
  const onAdClick = () => { recordClick(popupAd.id); trackClick(popupAd.id); };

  return (
    <div className="popup-ad-overlay" onClick={dismiss} role="dialog" aria-modal="true" aria-label="Advertisement">
      <div className="popup-ad-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-ad-close" onClick={dismiss} aria-label="Close">×</button>
        <PopupAdContent ad={popupAd} onClick={onAdClick} />
      </div>
    </div>
  );
}
```

(Note: the `dismiss` const is referenced by the Esc effect via closure at call time — it is defined before render returns; keep the Esc handler calling `dismiss()`.)

- [ ] **Step 2: Build.**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 3: Drive the app to verify behaviour.**

With the app running, and the popup ad configured (default from Task 1 = delay 3s, max 1/session):
- Load a page → popup appears after ~3s. Reload / navigate → does NOT reappear (max 1/session).
- In devtools, `sessionStorage.clear()` then reload → appears again.
- `localStorage.getItem('pa_popup_<id>')` shows a `shows` array and `lastShown`.
Expected: matches the above. (Other triggers/caps are exercised in Task 5 after the admin UI exists to set them.)

- [ ] **Step 4: Commit.**

```bash
git add resources/js/Components/PopupAd.jsx
git commit -m "feat(ads): drive popup visibility from admin frequency config"
```

---

## Task 5: Admin "Popup behaviour" form section

**Files:**
- Modify: `resources/js/features/admin/pages/AdsManagement.jsx` (`emptyAd`, `openEditAd`, and the ad modal form JSX)

**Interfaces:**
- Consumes: `mapAd().popupConfig` (Task 2) on edit; produces `adForm.popupConfig` posted to store/update.

- [ ] **Step 1: Add a default config constant + seed `emptyAd`.**

Near the top of the component file (module scope, above the component), add:

```js
const DEFAULT_POPUP_CFG = {
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
```

In `emptyAd`, add a field: `popupConfig: DEFAULT_POPUP_CFG,` (after `sortOrder: 0,`).

- [ ] **Step 2: Load config when editing.**

In `openEditAd`, add to the `setAdForm({ ... })` object (after `sortOrder`):

```js
      popupConfig: ad.popupConfig || DEFAULT_POPUP_CFG,
```

- [ ] **Step 3: Add a helper to update nested config in state.**

Inside the component (near `submitAd`), add:

```js
  const setCfg = (path, value) => setAdForm(prev => {
    const cfg = JSON.parse(JSON.stringify(prev.popupConfig || DEFAULT_POPUP_CFG));
    const keys = path.split('.');
    let o = cfg;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = value;
    return { ...prev, popupConfig: cfg };
  });
```

- [ ] **Step 4: Render the "Popup behaviour" section.**

In the ad modal form, immediately after the Active checkbox line (`<label ...> {l('সক্রিয়', 'Active')}</label>`), insert (only shows for popup position):

```jsx
          {adForm.position === 'popup' && (() => {
            const c = adForm.popupConfig || DEFAULT_POPUP_CFG;
            const row = 'flex items-center gap-2 text-sm text-gray-700';
            const num = 'w-20 border rounded px-2 py-1 text-sm';
            const sel = 'border rounded px-2 py-1 text-sm';
            return (
              <div className="mt-4 border-t pt-4 space-y-4">
                <div className="font-bold text-sm text-[#263238]">{l('পপ-আপ আচরণ', 'Popup behaviour')}</div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-gray-400">{l('ট্রিগার', 'Triggers')}</div>
                  <label className={row}><input type="checkbox" checked={c.triggers.delay.enabled} onChange={e => setCfg('triggers.delay.enabled', e.target.checked)} /> {l('লোডের পর দেরি (সেকেন্ড)', 'Delay after load (sec)')}
                    <input type="number" min="0" max="120" value={c.triggers.delay.seconds} onChange={e => setCfg('triggers.delay.seconds', +e.target.value)} className={num} /></label>
                  <label className={row}><input type="checkbox" checked={c.triggers.scroll.enabled} onChange={e => setCfg('triggers.scroll.enabled', e.target.checked)} /> {l('স্ক্রল গভীরতা (%)', 'Scroll depth (%)')}
                    <input type="number" min="1" max="100" value={c.triggers.scroll.percent} onChange={e => setCfg('triggers.scroll.percent', +e.target.value)} className={num} /></label>
                  <label className={row}><input type="checkbox" checked={c.triggers.exit_intent.enabled} onChange={e => setCfg('triggers.exit_intent.enabled', e.target.checked)} /> {l('এক্সিট ইনটেন্ট', 'Exit intent')}</label>
                  <label className={row}><input type="checkbox" checked={c.triggers.min_page_views.enabled} onChange={e => setCfg('triggers.min_page_views.enabled', e.target.checked)} /> {l('সর্বনিম্ন পেজ ভিউ', 'Min page views')}
                    <input type="number" min="1" max="50" value={c.triggers.min_page_views.count} onChange={e => setCfg('triggers.min_page_views.count', +e.target.value)} className={num} /></label>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-gray-400">{l('ফ্রিকোয়েন্সি', 'Frequency')}</div>
                  <label className={row}><input type="checkbox" checked={c.frequency.max_shows.enabled} onChange={e => setCfg('frequency.max_shows.enabled', e.target.checked)} /> {l('সর্বোচ্চ বার', 'Max shows')}
                    <input type="number" min="1" max="50" value={c.frequency.max_shows.count} onChange={e => setCfg('frequency.max_shows.count', +e.target.value)} className={num} />
                    <select value={c.frequency.max_shows.per} onChange={e => setCfg('frequency.max_shows.per', e.target.value)} className={sel}>
                      <option value="session">{l('প্রতি সেশন', 'per session')}</option>
                      <option value="day">{l('প্রতি দিন', 'per day')}</option>
                      <option value="lifetime">{l('সর্বমোট', 'lifetime')}</option>
                    </select></label>
                  <label className={row}><input type="checkbox" checked={c.frequency.cooldown.enabled} onChange={e => setCfg('frequency.cooldown.enabled', e.target.checked)} /> {l('কুলডাউন (মিনিট)', 'Cooldown (min)')}
                    <input type="number" min="1" max="10080" value={c.frequency.cooldown.minutes} onChange={e => setCfg('frequency.cooldown.minutes', +e.target.value)} className={num} /></label>
                  <label className={row}><input type="checkbox" checked={c.frequency.on_dismiss.enabled} onChange={e => setCfg('frequency.on_dismiss.enabled', e.target.checked)} /> {l('বন্ধ করার পর থামুন (ঘণ্টা, ০=চিরতরে)', 'Stop after dismiss (hrs, 0=forever)')}
                    <input type="number" min="0" max="8760" value={c.frequency.on_dismiss.hours} onChange={e => setCfg('frequency.on_dismiss.hours', +e.target.value)} className={num} /></label>
                  <label className={row}><input type="checkbox" checked={c.frequency.on_click.enabled} onChange={e => setCfg('frequency.on_click.enabled', e.target.checked)} /> {l('ক্লিকের পর থামুন (দিন)', 'Stop after click (days)')}
                    <input type="number" min="0" max="365" value={c.frequency.on_click.days} onChange={e => setCfg('frequency.on_click.days', +e.target.value)} className={num} /></label>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-gray-400">{l('টার্গেটিং', 'Targeting')}</div>
                  <label className={row}>{l('পেজ', 'Pages')}
                    <select value={c.targeting.pages} onChange={e => setCfg('targeting.pages', e.target.value)} className={sel}>
                      <option value="all">{l('সব', 'all')}</option><option value="home">{l('হোম', 'home')}</option>
                      <option value="article">{l('আর্টিকেল', 'article')}</option><option value="category">{l('ক্যাটাগরি', 'category')}</option>
                    </select></label>
                  <label className={row}>{l('ডিভাইস', 'Devices')}
                    <select value={c.targeting.devices} onChange={e => setCfg('targeting.devices', e.target.value)} className={sel}>
                      <option value="all">{l('সব', 'all')}</option><option value="desktop">{l('ডেস্কটপ', 'desktop')}</option><option value="mobile">{l('মোবাইল', 'mobile')}</option>
                    </select></label>
                </div>
              </div>
            );
          })()}
```

- [ ] **Step 5: Build.**

Run: `npm run build`
Expected: builds with no errors.

- [ ] **Step 6: Drive the admin + public round-trip.**

- In the admin, edit the popup ad → the "Popup behaviour" section shows the backfilled values. Change e.g. delay to 0, max shows to 3/day, save.
- Reopen the ad → values persisted.
- On the public site, verify the new config takes effect (delay 0 → immediate; after 3 shows in a day it stops). Inspect `localStorage['pa_popup_<id>']`.
Expected: config persists and drives the popup.

- [ ] **Step 7: Commit.**

```bash
git add resources/js/features/admin/pages/AdsManagement.jsx
git commit -m "feat(ads): admin Popup behaviour controls (triggers, frequency, targeting)"
```

---

## Self-Review (against the spec)

- **Data model / migration / backfill** → Task 1. ✅
- **Serve config + validation + admin round-trip fields** → Task 2. ✅
- **Behaviour semantics (gates, OR triggers, caps, storage keys)** → Task 3 (pure logic + storage) + Task 4 (arming/gates in component). ✅
- **Per-visitor tracking (localStorage/sessionStorage, per ad id, session/day/lifetime)** → Task 3 helpers; session count injected in Task 4 via `sessionShows`. ✅
- **Admin UI (all triggers, caps, targeting; popup-only)** → Task 5. ✅
- **Testing/verification** → Node smoke test (Task 3) + build + drive-the-app steps (Tasks 4-5). ✅
- **Type/name consistency:** config keys, storage keys (`pa_popup_<id>`, `pa_popup_pv`, `pa_popup_ses_<id>`), `popupConfig` (camel, admin/controller) vs `popup_config` (column) vs `config` (public payload) used consistently across tasks. ✅
- **Placeholder scan:** all steps contain concrete code/commands; no TBD. ✅
- **Session-count note:** `capsAllow` reads `state.sessionShows` for `per:session`; Task 4 injects it via `sessionShows(adId)` — consistent. ✅
