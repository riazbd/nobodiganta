# Article Soft-Delete & Trash System

**Date:** 2026-06-27
**Status:** Approved (design)

## Problem

Deleting an article in the admin panel currently performs a **hard delete**
(`$article->delete()` on a model with no soft-delete support, plus a bulk
hard-delete). There is no way to recover an article that was deleted by
mistake.

## Goal

Make article deletion recoverable: deleted articles move to a **Trash**, from
which they can be **restored**, or **permanently deleted**. Trash is purged
manually only (no scheduled auto-delete).

## Decisions (confirmed)

- **Permanent delete:** Yes — Trash offers both Restore and Delete Permanently
  (per-row and bulk).
- **Auto-purge:** No — manual removal only.
- **Permission for restore & permanent delete:** Same as the existing delete
  permission (`news.delete`, with `news.delete.own` for an author's own
  articles).
- **Deleted-by tracking:** Out of scope — SoftDeletes records only `deleted_at`.

## Approach

Use Laravel's `SoftDeletes` trait, following the existing precedent in this
codebase (the `ads` table already uses soft deletes via
`2026_06_11_101031_add_soft_deletes_to_ads_table.php`).

Adding the trait does three things automatically:
1. `$article->delete()` becomes a soft delete (sets `deleted_at`).
2. A global scope **excludes trashed rows from every existing query** — public
   site (home, category, article, search, tag, author, regional) and admin
   (AllNews, drafts, published, pending). No changes needed in those queries.
3. Provides `restore()`, `forceDelete()`, `withTrashed()`, `onlyTrashed()`.

## Changes

### 1. Migration

New migration adding `$table->softDeletes();` to the `articles` table
(`down()` drops it). Mirrors the ads soft-delete migration.

### 2. Model — `app/Models/Article.php`

- `use Illuminate\Database\Eloquent\SoftDeletes;` and add the trait to the class.
- Cast `deleted_at` to `datetime` (if a `$casts` array is present; otherwise
  rely on the trait default).

### 3. Existing delete flow — `ArticleController`

No logic change required:
- `destroy()` — `$article->delete()` now soft-deletes. Audit event stays
  `article.deleted` (now meaning "moved to trash").
- `bulkDestroy()` — `Article::whereIn(...)->delete()` now soft-deletes.

### 4. New controller methods — `ArticleController`

- `trash(Request $request)` — paginated `Article::onlyTrashed()->with(['category','author'])`
  ordered by `deleted_at desc`, transformed to a payload including
  `id, title, title_en, status, edition, category, author, deleted_at,
  created_at`. Renders `features/admin/pages/content/Trash`. Supports the same
  `search` filter used by other status views, plus `per_page`.
- `restore(Request $request, int $id)` — `Article::onlyTrashed()->findOrFail($id)`,
  permission check (`news.delete`, or `news.delete.own` when
  `author_id === auth id`), `->restore()`, audit `article.restored`.
- `forceDelete(Request $request, int $id)` — same lookup + permission check,
  `->forceDelete()`, audit `article.force_deleted`.
- `bulkRestore(Request $request)` — validates `article_ids` against trashed
  rows, restores them, audit `article.bulk_restored`.
- `bulkForceDelete(Request $request)` — validates and force-deletes, audit
  `article.bulk_force_deleted`.

Restore/force-delete take an `int $id` (not route-model binding), because the
default binding's global scope excludes trashed rows; lookups use
`onlyTrashed()`.

### 5. Routes — `routes/web.php` (admin group)

Fixed paths registered alongside the other status views (before the dynamic
`/news/{article}` routes):

- `GET    /news/trash`              → `trash`          → `news.trash`
- `POST   /news/bulk-restore`       → `bulkRestore`    → `news.bulk-restore`
- `POST   /news/bulk-force-delete`  → `bulkForceDelete`→ `news.bulk-force-delete`
- `POST   /news/{id}/restore`       → `restore`        → `news.restore` (whereNumber)
- `DELETE /news/{id}/force`         → `forceDelete`    → `news.force-delete` (whereNumber)

### 6. Frontend

**New page — `resources/js/features/admin/pages/content/Trash.jsx`**
Modeled on `AllNews.jsx` but trimmed:
- Columns: checkbox, Article (title + author), Category, Edition, Status,
  Deleted (date), Actions.
- Per-row actions: **Restore** (`router.post(news.restore)`), **Delete
  Permanently** (opens confirm modal → `router.delete(news.force-delete)`).
- Bulk actions: Restore selected, Delete permanently selected.
- Empty state: "Trash is empty."
- Reuses the `Select`, `Th`, pagination, and toast patterns from AllNews.

**Navigation wire-up:**
- `Sidebar.jsx` — add `{ id: 'news-trash', label: 'trash', permission: PERMISSIONS.NEWS_DELETE }`
  as the last child under the News group.
- `lib/routes.js` — add `newsTrash: '/admin/news/trash'` under `admin`.
- `app.jsx` — add `'trash': 'news-trash'` to the `news/` sub-path map so the
  sidebar highlights correctly.
- `Topbar.jsx` — add a `news-trash` breadcrumb entry (`{ bn: 'ট্র্যাশ', en: 'Trash' }`).
- `adminTranslations.js` + `locales/{bn,en}/admin.js` — add a `trash` label
  (bn: `ট্র্যাশ`, en: `Trash`).

**AllNews delete modal copy** — `AllNews.jsx`: change the delete confirmation
from "This action cannot be undone" to wording indicating the article moves to
Trash and can be restored (bn + en).

### 7. Edge cases & verification

- **Public/admin queries:** Confirm no query uses `withTrashed()` that would
  now leak trashed rows; the global scope handles exclusion otherwise.
- **Slug uniqueness:** Trashed articles keep their slug. Verify whether the
  `articles` table has a unique index on `slug_bn`/`slug_en`; if so, note that
  re-creating an article with an identical slug while a trashed copy exists
  could collide. Existing slug-generation behavior is unchanged by this work;
  document the finding, no fix unless a real collision is observed.
- **Relations:** `category`/`author` are nullable in the payload; restore of an
  article whose category was removed still works.

## Out of Scope

- Scheduled/auto purge of old trash.
- "Deleted by" user tracking.
- Soft-delete for other content types (opinions, videos, etc.).

## Testing

Manual flow: delete an article in AllNews → it disappears from AllNews and the
public site → appears in Trash → Restore → reappears in AllNews/public →
delete again → Delete Permanently → gone from Trash and DB.

If a backend test suite is present, add a feature test covering: soft delete
sets `deleted_at` and hides the article from the index; restore clears it;
force delete removes the row.
