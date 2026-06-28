# Auto-archive published articles after N days — Design

**Date:** 2026-06-28
**Status:** Approved, ready for implementation plan

## Summary

Add an optional, configurable rule that automatically moves a published article to
`archived` once it has been live for more than N days. The feature is **disabled by
default** and only activates when an admin sets a positive day count.

Archived articles are **delisted from every public listing** but remain **readable by
anyone via their direct URL** (not a 404). Per decision, this readable-by-link behavior
applies to *all* archived articles, including those archived manually by editors.

## Decisions (from brainstorming)

- **Visibility model:** archived = removed from all public listings, but the article page
  remains open to everyone by direct link. Not a 404.
- **Auto vs manual archive:** unified — *all* archived articles become readable-by-link.
  This changes the previous manual-archive behavior (which used to 404 for the public and
  allow staff-only preview).
- **Window:** configurable admin setting, not hardcoded.
- **Default:** the feature is OFF by default (`auto_archive_days = 0`). Nothing is archived
  until an admin opts in, which also sidesteps any bulk-archive surprise on existing content.
- **Schedule cadence:** daily (ample for a 30-day window).
- **SEO:** archived articles stay indexable (no `noindex`), since they remain readable.

## Current behavior (verified)

- `articles.status` enum: `draft | pending | published | archived`; plus a `published_at`
  timestamp. (`scheduled` was removed in migration `2026_06_22_000200`.)
- `Article::scopePublished()` (app/Models/Article.php:247) requires
  `status = 'published' AND published_at IS NOT NULL AND published_at <= now()`. Every public
  listing (home, category, search, trending, tags, related) uses this scope, so archived
  articles are already excluded from listings.
- `NewsController::article()` (app/Http/Controllers/NewsController.php:374) looks the article
  up via `Article::published()`. If not found, logged-in staff may preview drafts/pending/
  archived. So today an archived article is a 404 for the public.
- `Setting` model + admin `Settings.jsx` page are fully generic: settings are grouped by
  `group` (one tab each) and rendered by `type`. Adding a row with `type = 'number'` yields a
  number input automatically. Pattern reference: `breaking_default_expiry_hours`
  (migration `2026_06_27_000300`).
- Scheduling pattern: `routes/console.php` already runs `Schedule::command('stories:expire')->hourly();`
  and `App\Console\Commands\ExpireStories` is the command template.

## Components to build

### 1. Setting `auto_archive_days`

New idempotent migration that inserts a `settings` row (mirrors the breaking-expiry setting):

- `key`: `auto_archive_days`
- `group`: `content`
- `type`: `number`
- `value`: `'0'` (0 = disabled)
- `label_bn` / `label_en`: e.g. "স্বয়ংক্রিয় আর্কাইভ (দিন)" / "Auto-archive after (days)"
- `description_bn` / `description_en`: explain that published articles older than this many
  days are auto-archived (delisted but still readable by link); `0` disables the feature.
- `is_public`: `false`

`down()` deletes the row.

Note: `type = 'number'` is required so the admin page renders a numeric input. `Setting::castValue`
does not special-case `'number'` (returns the raw string), so the command casts with `(int)`.
This matches how `breaking_default_expiry_hours` works.

### 2. Admin tab metadata (small UI touch)

In `resources/js/features/admin/pages/system/Settings.jsx`, add a `content` entry to
`TAB_META` (icon + bn/en label) so the new group renders with a proper tab label/icon instead
of the generic fallback. No other UI work — the field renders generically.

### 3. Console command `articles:auto-archive`

`App\Console\Commands\AutoArchiveArticles` (signature `articles:auto-archive`), modeled on
`ExpireStories`:

```php
$days = (int) Setting::get('auto_archive_days', 0);
if ($days <= 0) {
    $this->info('Auto-archive disabled (auto_archive_days = 0).');
    return self::SUCCESS;
}

$count = Article::where('status', 'published')
    ->whereNotNull('published_at')
    ->where('published_at', '<=', now()->subDays($days))
    ->update(['status' => 'archived']);

$this->info("Archived {$count} articles older than {$days} days.");
return self::SUCCESS;
```

System-level bulk update (no role/auth gate), consistent with `ExpireStories`. Does not route
through `ArticleStatusWorkflow` (that is user/role-driven and requires an authenticated actor).

### 4. Schedule registration

Add to `routes/console.php`:

```php
Schedule::command('articles:auto-archive')->daily();
```

Runs daily; exits immediately when the feature is disabled.

### 5. Public readability change

Make archived articles readable by direct URL for everyone:

- Add `Article::scopePublicReadable($query)`:
  `whereIn('status', ['published', 'archived'])` + `whereNotNull('published_at')` +
  `where('published_at', '<=', now())`.
- In `NewsController::article()`, use `Article::publicReadable()` instead of
  `Article::published()` for the main slug lookup.
- Leave all listing queries on `scopePublished()` so archived articles remain delisted.
- Draft/pending remain staff-preview-only (the existing `canPreview` fallback still covers
  them, since `publicReadable` excludes those statuses).

## Testing

- **Command, enabled:** with `auto_archive_days = 30`, an article whose `published_at` is 31
  days ago and `status = 'published'` becomes `archived`; one 10 days old stays `published`.
- **Command, disabled:** with `auto_archive_days = 0`, no articles change status.
- **Readable by link:** a guest requesting an archived article's direct URL gets `200` and the
  article renders.
- **Delisted:** an archived article does not appear in home / category / search / trending /
  tag listings.
- **Draft still hidden:** a guest requesting a draft/pending article still gets `404`.

## Out of scope

- No `noindex` / SEO suppression for archived articles.
- No per-article opt-out from auto-archiving (the rule is global).
- No change to view-count behavior (archived reads still increment views).
- No retroactive guard: when an admin enables the feature, the next daily run archives any
  published article already past the window. This is intended and accepted (default-off makes
  it an explicit opt-in).
