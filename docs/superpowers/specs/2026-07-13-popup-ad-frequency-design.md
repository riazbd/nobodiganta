# Admin-Controlled Popup Ad Frequency — Design

**Date:** 2026-07-13
**Status:** Approved, pending implementation plan

## Problem

The site-wide popup ad (`PopupAd.jsx`) shows on **every** page load and every
Inertia navigation, with no controls. This is too aggressive. The admin needs
full, flexible control over when the popup appears, how often, at what interval,
and on which pages/devices.

## Current state

- The popup is the single active `Ad` with `position = 'popup'` (first by
  `sort_order`), loaded in `HandleInertiaRequests` and shared as the `popupAd`
  prop.
- `PopupAd.jsx` sets `visible = true` on mount and on every `page.url` change —
  no frequency logic. Impressions/clicks report via `adService`.
- Ads are managed in `resources/js/features/admin/pages/AdsManagement.jsx`
  (plain `adForm` state → `AdController` validate/store). Position select already
  includes `popup`.

## Goals

- Admin controls, per popup ad, for: triggers (when it appears), frequency caps
  (how many / how often), and targeting (which pages / devices).
- Per-visitor enforcement (no login) via browser storage.
- Backward safe: the existing popup ad stops being aggressive immediately.

## Non-goals

- Server-side per-user frequency tracking (visitors are anonymous; use
  `localStorage`/`sessionStorage`).
- A/B testing, geo targeting, multiple simultaneous popups.

## Decisions (from brainstorming)

1. Config lives **on the popup ad record** (one JSON column), edited in the
   existing ad form.
2. Include **all** triggers (delay, scroll depth, exit intent, min page views)
   and **all** caps (max shows per period, cooldown, stop-after-dismiss,
   stop-after-click), plus **page + device targeting**.
3. Backfill the current popup ad with a safe default (`delay 3s`,
   `max 1 / session`).

## Data model

Add a nullable JSON column `popup_config` to `ads` (mirrors
`homepage_sections.config`). All keys optional; the frontend applies defaults for
anything missing. Canonical shape:

```json
{
  "triggers": {
    "delay":          { "enabled": true,  "seconds": 3 },
    "scroll":         { "enabled": false, "percent": 50 },
    "exit_intent":    { "enabled": false },
    "min_page_views": { "enabled": false, "count": 2 }
  },
  "frequency": {
    "max_shows":  { "enabled": true,  "count": 1, "per": "session" },
    "cooldown":   { "enabled": false, "minutes": 30 },
    "on_dismiss": { "enabled": false, "hours": 24 },
    "on_click":   { "enabled": false, "days": 7 }
  },
  "targeting": { "pages": "all", "devices": "all" }
}
```

- `frequency.max_shows.per`: `session` | `day` | `lifetime`.
- `frequency.on_dismiss.hours`: `0` means suppress forever after a close.
- `targeting.pages`: `all` | `home` | `article` | `category`.
- `targeting.devices`: `all` | `desktop` | `mobile`.

## Behaviour semantics

**Gates — ALL must pass before the popup can arm on a given page:**

1. `popupAd` exists and is active + within start/end date (existing server logic).
2. `targeting.pages` matches the current route.
3. `targeting.devices` matches the current device (viewport ≤ 768px = mobile).
4. `triggers.min_page_views` reached (session page-view counter ≥ count), if enabled.
5. Frequency caps allow, evaluating enabled caps together (AND):
   - `max_shows`: shows recorded in the period < count.
   - `cooldown`: `now − lastShown ≥ minutes`.
   - `on_dismiss`: not within `hours` of `dismissedAt` (or ever, if hours = 0 and dismissed).
   - `on_click`: not within `days` of `clickedAt`.

**Triggers — OR / first-to-fire.** Among enabled `delay` / `scroll` /
`exit_intent`, whichever condition occurs first shows the popup. If none are
enabled, show immediately (delay 0). `min_page_views` is a gate, not a firing
event. Re-evaluate on every Inertia navigation.

**On show:** append `now` to `shows`, set `lastShown`; count one impression
(existing). **On dismiss:** set `dismissedAt`. **On click:** set `clickedAt`
(plus existing click tracking).

## Per-visitor tracking

`localStorage` key `pa_popup_<adId>` holds
`{ shows: number[] (timestamps), lastShown: number, dismissedAt: number|null,
clickedAt: number|null }`. Keying by ad id means a new popup campaign starts
everyone fresh.

- `per: session` counts use `sessionStorage` (cleared per tab session).
- `per: day` counts `shows` with timestamp ≥ local midnight.
- `per: lifetime` counts all `shows`.

A `sessionStorage` counter `pa_popup_pv` increments on each navigation to drive
`min_page_views`.

## Backend

- **Migration** `add_popup_config_to_ads_table`: add `popup_config` json nullable;
  in the same migration, backfill the current `position = 'popup'` ad(s) with the
  safe default config (`delay 3s`, `max 1/session`).
- **`Ad` model**: add `popup_config` to `$fillable`; cast to `array`.
- **`AdController`**: validate `popupConfig` as `nullable|array` with nested
  numeric/enum rules (bounded — seconds/percent/count/minutes/hours/days ranges,
  `per`/`pages`/`devices` in allowed sets); map into the `popup_config` column in
  `adAttributes`; include it in the ad resource returned to the admin.
- **`HandleInertiaRequests`**: add `'config' => $popupAd->popup_config` to the
  `popupAd` payload.

## Admin UI

In `AdsManagement.jsx`, add a **"Popup behaviour"** section to the ad form,
rendered only when `adForm.position === 'popup'`. `adForm` gains a `popupConfig`
object (initialised from the ad or the default). Grouped controls, each with an
enable checkbox + its inputs, bn/en labels consistent with the rest of the admin:

- **Triggers:** delay (sec), scroll depth (%), exit intent, min page views (count).
- **Frequency:** max shows (count + `per` select), cooldown (minutes),
  stop-after-dismiss (hours, 0 = forever), stop-after-click (days).
- **Targeting:** pages select, devices select.

`popupConfig` is included in the submit payload.

## Frontend logic

- New `resources/js/lib/popupFrequency.js` — pure, testable helpers:
  - `mergePopupConfig(config)` → full config with defaults applied.
  - `readState(adId)` / `writeState(adId, patch)` — storage access.
  - `pageMatches(pages, url)`, `deviceMatches(devices)`.
  - `capsAllow(config, state, now)` → boolean (evaluates all enabled caps).
  - `recordShow / recordDismiss / recordClick (adId)`.
  - `bumpPageViews()` / `getPageViews()`.
- Rewrite `PopupAd.jsx` to: read `popupAd.config`, bump page views on navigation,
  check gates via the helper, arm enabled triggers (timer / scroll listener /
  mouseout exit-intent), show on first fire, and record show/dismiss/click.
  Keep the existing render, impression, and click tracking.

## Files

- `database/migrations/2026_07_13_..._add_popup_config_to_ads_table.php` (new)
- `app/Models/Ad.php`
- `app/Http/Controllers/Admin/AdController.php`
- `app/Http/Middleware/HandleInertiaRequests.php`
- `resources/js/features/admin/pages/AdsManagement.jsx`
- `resources/js/lib/popupFrequency.js` (new)
- `resources/js/Components/PopupAd.jsx`

## Testing / verification

- `php artisan migrate` runs; existing popup ad has the default config.
- `npm run build` clean.
- Admin: configure each control, save, reopen form → values persist.
- Public (drive the running app, inspect `localStorage`/`sessionStorage`):
  - Delay: popup appears after N seconds; scroll: after X%; exit-intent: on
    mouse-leave (desktop); none enabled: immediate.
  - `max_shows` 1/session: shows once, not again on next navigation; new tab
    session resets. `per: day` / `lifetime` behave accordingly.
  - Cooldown suppresses within the window; dismiss and click suppress per config.
  - `targeting.pages`/`devices` restrict correctly; `min_page_views` gates.
- `popupFrequency.js` cap logic covered by lightweight tests if a JS runner is
  added; otherwise verified via the manual drive above (no JS test runner exists
  in this repo).

## Risks

- Trigger listeners (scroll/exit-intent) must be cleaned up on navigation/hide to
  avoid leaks or double-shows — handled in the `PopupAd` effect cleanup.
- Clock/timezone for `per: day` uses the visitor's local midnight (acceptable for
  ad frequency).
- Config validation must bound numeric inputs so a bad admin value can't produce
  pathological behaviour.
