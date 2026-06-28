# Auto-purge trashed articles after N days — Design

**Date:** 2026-06-28
**Status:** Approved, ready for implementation plan

## Summary

Add an optional, configurable rule that permanently deletes (`forceDelete`)
articles that have sat in the Trash for more than N days, measured from
`deleted_at`. The feature is **disabled by default** and only activates when an
admin sets a positive day count.

This adds exactly what the original trash spec
(`2026-06-27-article-soft-delete-trash-design.md`) deliberately left out:
"Scheduled/auto purge of old trash."

## Decisions (from brainstorming)

- **Window:** configurable admin setting, not hardcoded.
- **Default:** OFF (`trash_auto_purge_days = 0`). Nothing is purged until an admin
  opts in. Avoids an irreversible bulk delete of existing old trash on day one.
- **Clock:** counted from `deleted_at` (time spent in trash), not `published_at`.
  Re-deleting a restored article resets its clock.
- **Schedule cadence:** daily (ample for a 30-day window).
- **Audit:** write one summary `AuditLog` entry per run when anything is purged,
  for traceability of the destructive action.

## Current behavior (verified)

- `articles` uses `SoftDeletes` (migration `2026_06_27_000000_add_soft_deletes_to_articles_table`).
  Trashed rows have `deleted_at` set and are excluded from all normal queries by
  the global scope.
- `ArticleController` already supports the full trash lifecycle:
  `trash()` (lists `Article::onlyTrashed()` ordered by `deleted_at desc`),
  `restore()`, `forceDelete(int $id)`, `bulkRestore()`, `bulkForceDelete()`.
  The bulk force-delete uses builder-level `->forceDelete()` on an
  `Article::onlyTrashed()->whereIn(...)` query (ArticleController.php:791-793).
- Each lifecycle action writes an `AuditLog` row (`article.force_deleted`,
  `article.bulk_force_deleted`, etc.) via `AuditLog::create([...])`.
- `Setting` model + admin `Settings.jsx` are fully generic: a settings row with
  `group = 'content'` and `type = 'number'` renders automatically in the Content
  tab (added in the auto-archive feature). Pattern reference: `auto_archive_days`
  (`2026_06_28_000000_add_auto_archive_days_setting`).
- Scheduling pattern: `routes/console.php` already runs
  `articles:auto-archive` (daily) and `stories:expire` (hourly).

## Components to build

### 1. Setting `trash_auto_purge_days`

New idempotent migration inserting a `settings` row (mirrors `auto_archive_days`):

- `key`: `trash_auto_purge_days`
- `group`: `content`
- `type`: `number`
- `value`: `'0'` (0 = disabled)
- `label_bn` / `label_en`: e.g. "ট্র্যাশ স্থায়ীভাবে মুছুন (দিন)" / "Auto-delete trash after (days)"
- `description_bn` / `description_en`: explain that trashed articles older than this
  many days are permanently deleted (irreversible); `0` disables the feature.
- `is_public`: `false`

`down()` deletes the row. `type = 'number'` so the admin renders a numeric input;
the command casts the value with `(int)`.

### 2. Console command `articles:purge-trash`

`App\Console\Commands\PurgeTrashedArticles` (signature `articles:purge-trash`),
modeled on `AutoArchiveArticles`:

```php
$days = (int) Setting::get('trash_auto_purge_days', 0);

if ($days <= 0) {
    $this->info('Trash auto-purge disabled (trash_auto_purge_days = 0).');
    return self::SUCCESS;
}

$query = Article::onlyTrashed()->where('deleted_at', '<=', now()->subDays($days));
$count = $query->count();

if ($count > 0) {
    $query->forceDelete();

    AuditLog::create([
        'user_id'     => null,                 // system action (no authenticated user)
        'event'       => 'article.auto_purged',
        'description' => "Auto-purged {$count} trashed articles older than {$days} days",
        'ip_address'  => null,
        'user_agent'  => 'scheduler',
    ]);
}

$this->info("Auto-purged {$count} trashed articles older than {$days} days.");
return self::SUCCESS;
```

Notes:
- Builder-level `forceDelete()` matches the existing `bulkForceDelete()` flow, so
  relation/pivot cleanup behaves identically to a manual permanent delete.
- `count()` is captured before `forceDelete()` for the audit description.
- `audit_logs.user_id` must accept `null` for the system entry. If the column is
  NOT nullable, fall back to logging the purge without an `AuditLog` row (still
  print the count) rather than inventing a fake user. To be confirmed during
  implementation by reading the `audit_logs` migration.

### 3. Schedule registration

Add to `routes/console.php`:

```php
Schedule::command('articles:purge-trash')->daily();
```

Runs daily; exits immediately when disabled.

## Testing

- **Command, enabled:** with `trash_auto_purge_days = 30`, a trashed article whose
  `deleted_at` is 31 days ago is force-deleted (row gone from DB, including
  `withTrashed()`); a trashed article 10 days old remains; a non-trashed article is
  untouched.
- **Command, disabled:** with `trash_auto_purge_days = 0`, no rows are deleted.
- **Audit:** after an enabled run that deletes ≥1 row, an `AuditLog` row with
  `event = 'article.auto_purged'` exists and its description contains the count.
- **Setting exists:** migration inserts `trash_auto_purge_days` with `value = '0'`,
  `group = 'content'`, `type = 'number'`.

## Out of scope

- No per-article exemption from purging (the rule is global).
- No change to manual restore / force-delete / bulk actions.
- No "deleted by" tracking (unchanged from the trash spec).
- No retroactive guard: when an admin enables the feature, the next daily run
  purges any trashed article already past the window. Intended; default-off makes
  it an explicit opt-in.
