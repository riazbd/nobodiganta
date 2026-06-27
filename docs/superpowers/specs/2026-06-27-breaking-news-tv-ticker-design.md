# Breaking News — TV-Style Two-Phase Ticker

**Date:** 2026-06-27
**Status:** Approved (design)

## Problem

The public breaking-news ticker only ever *scrolls*: a single continuous CSS
marquee of all active items, hard-capped at 15, with no editorial control. The
client wants a TV-news experience — a breaking headline flashes prominently and
repeats, then the ticker scrolls, then it flashes again, alternating — and
wants the timing/limits to be configurable ("kono limit dea nai").

## Decisions (confirmed)

- **Cadence:** alternate ALERT (flash) ⇄ SCROLL (marquee), looping.
- **Alert items:** Urgent + Breaking severity items get the flash; all active
  items still appear in the scroll phase. (Live / Just-In scroll only.)
- **Timing/limits:** admin-configurable settings.
- **Default timings:** alert 5s/headline, 1 cycle, 30s scroll, max 15 items.

## Current State (analysis)

- **Data/admin:** `breaking_news` table + `BreakingNews` model (severity
  `just_in/breaking/urgent/live`, priority, pin, edition, schedule window,
  push), full admin CRUD at `/admin/breaking`, auto-sync with `Article.is_breaking`.
- **Public delivery:** `resources/js/Components/BreakingTicker.jsx` — a single
  continuous marquee fixed to the bottom. Hydrated from `globalBreakingNews`
  (shared in `HandleInertiaRequests`) and polls `/api/breaking-news` every 25s
  (ETag-cached). Marquee CSS at `resources/css/app.css` (`.brk-*`, lines ~625-716).
  Each item's public payload already includes `severity`.
- **Dead code:** `resources/js/Components/ui/BreakingTicker.jsx` (SSE variant)
  is not imported anywhere.
- **Settings infra:** `Setting` model (`key`, `value`, `group`, `type`,
  `label_bn/en`, `description_bn/en`, `is_public`). Public settings are shared
  to the frontend via the Inertia `settings` prop. The admin Settings page
  (`features/admin/pages/system/Settings.jsx`) auto-builds tabs from the groups
  the backend returns and renders each field by `type` (currently
  text / textarea / boolean / image — no number type yet).

## Changes

### 1. Settings (admin-configurable)

New `breaking` group, all `is_public => true` so the ticker reads them from the
shared `settings` prop:

| Key | Type | Default | Meaning |
|---|---|---|---|
| `breaking_ticker_enabled` | boolean | `true` | master on/off for the ticker |
| `breaking_alert_enabled`  | boolean | `true` | enable the flash phase (off = pure scroll) |
| `breaking_alert_seconds`  | number  | `5`  | seconds each alert headline is shown |
| `breaking_alert_cycles`   | number  | `1`  | times to cycle alert headlines before scrolling |
| `breaking_scroll_seconds` | number  | `30` | scroll-phase duration before returning to alert |
| `breaking_max_items`      | number  | `15` | cap on items in the feed |

- Add an idempotent migration that inserts these rows if missing (pattern:
  `2026_06_23_000200_add_email_otp_enabled_setting.php`).
- Add the same rows to `SettingSeeder` for fresh installs.

### 2. Backend wiring

- Replace the hardcoded `->limit(15)` with the `breaking_max_items` setting
  (cast to int, sane fallback 15) in:
  - `app/Http/Middleware/HandleInertiaRequests.php` (~line 51)
  - `app/Http/Controllers/BreakingNewsController.php::index` (~line 22)
- No change to the `breaking_news` schema or admin breaking CRUD. `severity` is
  already present in `toPublicArray()`.

### 3. Public ticker rework — `Components/BreakingTicker.jsx`

Turn the component into a two-phase state machine driven by the settings:

- Read `settings` + `globalBreakingNews` from `useApp()`. Parse the six settings
  (with the defaults above) — booleans via `=== 'true'`/truthy, numbers via
  `parseInt` with fallback.
- If `breaking_ticker_enabled` is false → render nothing.
- Derive `alertItems` = items with `severity ∈ {breaking, urgent}`.
- Phase state `'alert' | 'scroll'` plus an alert index:
  - **Alert phase** (only when `breaking_alert_enabled` and `alertItems.length`):
    show one alert headline at a time, large & centered, flashing, advancing
    every `alert_seconds`. After `alert_cycles` full passes through `alertItems`,
    switch to scroll.
  - **Scroll phase:** the existing marquee of **all** items; after
    `scroll_seconds`, switch back to alert (if any alert items) else keep
    scrolling.
  - If alert disabled or no alert items → permanent scroll (today's behavior).
- Preserve: 25s polling of `/api/breaking-news` (ETag), dismiss-until-content-
  changes behavior, per-severity label/colors, click-through navigation.
- Timers are cleared on phase/deps change and unmount; phase resets when the
  item set signature changes.

### 4. CSS — `resources/css/app.css`

Add styles for the alert phase alongside the existing `.brk-*` marquee:
- A single centered headline (`.brk-alert` / `.brk-alert-text`) sized for the
  same fixed bottom bar, with a flash/pulse keyframe animation.
- Wrap flashing animations in `@media (prefers-reduced-motion: reduce)` to
  disable/soften them.
- Reuse the existing label + dismiss styling and bar geometry.

### 5. Admin Settings page — `Settings.jsx`

- Add a `number` case to `renderField` (numeric input; stores as string like
  other values). Falls back gracefully if absent, but we add it for a clean UX.
- Add a `TAB_META` entry for the `breaking` group (label bn/en + icon) so the
  tab reads nicely instead of the capitalized fallback.

### 6. Cleanup

- Delete the unused `resources/js/Components/ui/BreakingTicker.jsx`.

## Out of Scope

- No changes to the `breaking_news` schema, admin breaking CRUD, push, or
  scheduling.
- Alert severities stay fixed to {breaking, urgent} (not a setting) — can be
  exposed later if needed.
- Web-push remains dormant as today.

## Edge Cases

- No urgent/breaking items → skip alert, scroll only.
- Single total item → scroll loop duplication already handled; alert still
  flashes the one item.
- `prefers-reduced-motion` → no jarring flash.
- Mobile → alert headline truncates within the bar; existing responsive `.brk-*`
  rules extended for `.brk-alert`.
- Settings missing/garbage values → defaults via parse fallbacks.

## Testing

Manual: with an urgent/breaking item active, confirm the bar flashes that
headline for ~5s, then scrolls all items for ~30s, then flashes again. Toggle
`breaking_alert_enabled` off → continuous scroll. Toggle
`breaking_ticker_enabled` off → ticker hidden. Change `breaking_max_items` and
confirm the feed cap changes. Confirm dismiss hides until content changes, and
that reduced-motion disables flashing.
