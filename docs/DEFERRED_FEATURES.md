# Deferred Features

Features that are **intentionally parked** — either fully implemented but dormant,
or partially built with a clear path to completion. Keep this list updated as items
are activated or finished.

_Last updated: 2026-06-22_

---

## 1. Breaking News — Web Push (Phase 2)

**Status:** Sending logic implemented and wired, but **dormant** behind a config flag.
The breaking-news system itself (admin control center, severity bar, polling,
`/breaking`, auto-expiry, article-flag sync) is fully active — only the push layer
is off.

**Done**
- Queued job `SendBreakingPush` — VAPID/WebPush send to active subscribers, once-only
  via `push_sent_at`, deactivates expired subscriptions, severity emoji, scheduled
  (delayed) dispatch. → [`app/Jobs/SendBreakingPush.php`](../app/Jobs/SendBreakingPush.php)
- Dispatch wiring on create/update/reactivate, gated by config. → [`app/Http/Controllers/Admin/BreakingNewsController.php`](../app/Http/Controllers/Admin/BreakingNewsController.php)
- Master switch `services.webpush.breaking_push_enabled` (`BREAKING_PUSH_ENABLED`, default `false`). → [`config/services.php`](../config/services.php)
- `breaking_news.push_enabled` / `push_sent_at` columns + admin toggle (labeled "activates later").
- Service worker push/click handlers + queue table (`create_jobs_table`) already exist.

**Remaining to make it work end-to-end**
1. **Register push routes** — `PushController` is imported in `routes/web.php` but has **no routes**. The client ([`resources/js/lib/pwa.js`](../resources/js/lib/pwa.js)) calls these (currently 404):
   - `GET  /api/push/vapid-public-key`
   - `POST /api/push/subscribe`
   - `POST /api/push/unsubscribe`
2. **Generate + set VAPID keys** — `WEBPACK_VAPID_PUBLIC_KEY`, `WEBPACK_VAPID_PRIVATE_KEY`, `WEBPACK_VAPID_SUBJECT` in `.env` (`web-push generate-vapid-keys`). Not currently set.
3. **Opt-in UI** — `subscribeToPushNotifications()` exists in pwa.js but **nothing calls it**; add an "Enable notifications" prompt/toggle.
4. **Queue worker** — run `php artisan queue:work` (queue is `database`).
5. Flip `BREAKING_PUSH_ENABLED=true`.

---

## 2. Dashboard Traffic — Retention & Scale

**Status:** Traffic tracking is live (`page_views` + `TrackPageView` middleware powering
real today-visitors / 7-day chart). No cleanup yet.

**Done** → [`app/Http/Middleware/TrackPageView.php`](../app/Http/Middleware/TrackPageView.php), `page_views` table.

**Remaining**
- **Pruning** — `page_views` grows unbounded; add a scheduled command to delete rows
  older than N days (e.g. 90).
- **High-volume batching** — currently one INSERT per public pageview. At scale, batch
  writes (queue/buffer) or aggregate into a daily counter table.

---

## 3. Ad Revenue — Billing / Payments

**Status:** Ad Panel has slot pricing (flat + CPM) and computes contract value, but there is
**no billing/invoicing/payments** system. The dashboard "ad revenue" tile was swapped to
real **Total Views** because revenue can't be genuine without collected-payment data.

**Remaining (a real module)**
- Invoices/payments per booking, paid/unpaid status, collected-vs-contracted revenue.
- Then the dashboard can show real earned revenue instead of contract value only.
- Files today: [`app/Http/Controllers/Admin/AdController.php`](../app/Http/Controllers/Admin/AdController.php), `ad_slots`, `ads` (price/cpm_rate).

---

## 4. Newsletter

**Status:** Hidden from the UI as a "future feature" — sidebar item and dashboard quick
action are commented out; `NewsletterController` exists. Not wired into the product.

**Remaining:** subscriber capture, compose/send pipeline, then unhide the menu.

---

## 5. Nav Dropdowns — `:has()` Fallback

**Status:** Public nav dropdowns flip on the right edge and **scroll vertically** within the
viewport. The vertical-scroll rule uses CSS `:has()` (all current evergreen browsers).

**Remaining:** a JS fallback for very old browsers (they simply won't scroll — menus behave
as before). → [`resources/css/app.css`](../resources/css/app.css) (`.nav-sub-dropdown:not(:has(...))`).

---

## 6. User/Reporter Delete — FK Hardening (optional)

**Status:** Deleting a user/reporter reassigns articles to a successor and detaches
media/stories/templates (null-on-delete). Handled at the controller layer.

**Remaining (belt-and-suspenders):** `articles.author_id` is still `cascade` at the schema
level. A migration switching it to `restrict` would guard against accidental data loss from
any non-UI deletion path. Not required for current flows.

---

## 7. Role-Based Dashboards (cleanup)

**Status:** Only `Dashboard.jsx` is rendered. Role-specific dashboard components
(`SuperAdminDashboard`, `EditorInChiefDashboard`, `ReporterDashboard`, …) exist but are
**unused**.

**Remaining:** either wire per-role dashboards in `DashboardController`, or remove the dead
components.

---

## 8. Article Format Types (editorial labels)

**Status:** The article `article_type` column supports several format values, but only
**News** and **Video** have real public behaviour (Video shows the video fields in the
editor and renders a player + feeds video sections). These format labels are **stored
only** and have **no public layout, badge, or behaviour** — so they were removed from the
Write News "Format" dropdown:

- `feature` — Feature
- `interview` — Interview
- `explainer` — Explainer
- `liveblog` — Live Blog (implies live-updating coverage — not built)
- `sponsored` — Sponsored (implies sponsored-content styling/disclosure — not built)

Note: `opinion` and `photo` are **not** dead — they have their own dedicated editors
(Opinions manager, Photo Gallery manager) and were removed from the News editor only to
avoid duplicate/confusing creation paths.

**Done**
- Trimmed the Format dropdown to News + Video. → [`resources/js/features/admin/pages/content/WriteNews.jsx`](../resources/js/features/admin/pages/content/WriteNews.jsx)
- Backend validation still accepts all the old values, so existing articles edit without breaking.

**Remaining to activate any of these**
1. Give the format real public behaviour (a card/article badge, a dedicated layout, or a
   filterable section) — e.g. a "Sponsored" disclosure label, a live-blog timeline.
2. Re-add the option(s) to the Format dropdown.
3. (Liveblog) build the live-update mechanism if that's the intent.
