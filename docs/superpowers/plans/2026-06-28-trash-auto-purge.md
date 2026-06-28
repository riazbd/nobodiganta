# Trash Auto-Purge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permanently delete trashed articles after a configurable number of days in the trash, off by default.

**Architecture:** A daily scheduled artisan command reads a `trash_auto_purge_days` setting (0 = off) and builder-level `forceDelete()`s trashed articles whose `deleted_at` is older than N days, writing one summary audit-log entry per run. Mirrors the existing `articles:auto-archive` feature.

**Tech Stack:** Laravel 11 (artisan commands, `routes/console.php` scheduler, Eloquent SoftDeletes), PHPUnit feature tests.

## Global Constraints

- The feature is OFF by default: `trash_auto_purge_days` setting value is `'0'`; `0` (or less) disables purging entirely.
- Setting `type` must be `'number'` so the admin renders a numeric input; `Setting::get()` returns the raw string, so always cast with `(int)`.
- The purge window is measured from `articles.deleted_at` (time in trash), using `now()->subDays($days)`.
- Permanent deletion uses builder-level `forceDelete()` on an `Article::onlyTrashed()` query — identical to the existing `ArticleController::bulkForceDelete()` (no manual relation cleanup).
- System actions do NOT set an authenticated user: the audit entry uses `user_id => null` (the `audit_logs.user_id` column is nullable).
- PHP runs via `php`. Tests run with `php artisan test`.
- `Article` already has `HasFactory` + `ArticleFactory` (with `->draft()`/`->archived()` states) and `SoftDeletes` — do not re-add them.

---

### Task 1: `trash_auto_purge_days` setting migration

Insert the configurable, default-off setting. Idempotent, mirroring `database/migrations/2026_06_28_000000_add_auto_archive_days_setting.php`. Renders automatically in the admin Settings → Content tab (already wired by the auto-archive feature).

**Files:**
- Create: `database/migrations/2026_06_28_000100_add_trash_auto_purge_days_setting.php`
- Test: `tests/Feature/Article/TrashAutoPurgeTest.php` (new file, extended in Task 2)

**Interfaces:**
- Consumes: nothing.
- Produces: a `settings` row `key = 'trash_auto_purge_days'`, `value = '0'`, `group = 'content'`, `type = 'number'`. Read via `Setting::get('trash_auto_purge_days', 0)`.

- [ ] **Step 1: Write the failing test**

Create `tests/Feature/Article/TrashAutoPurgeTest.php`:

```php
<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrashAutoPurgeTest extends TestCase
{
    use RefreshDatabase;

    /** Create a trashed article whose deleted_at is $days ago. */
    private function trashedDaysAgo(int $days): Article
    {
        $article = Article::factory()->create();
        $article->delete(); // soft delete -> deleted_at = now()
        Article::withTrashed()->where('id', $article->id)
            ->update(['deleted_at' => now()->subDays($days)]);

        return $article;
    }

    public function test_setting_exists_and_defaults_to_zero(): void
    {
        $this->assertDatabaseHas('settings', [
            'key'   => 'trash_auto_purge_days',
            'group' => 'content',
            'type'  => 'number',
        ]);
        $this->assertSame(0, (int) Setting::get('trash_auto_purge_days', 99));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=TrashAutoPurgeTest`
Expected: FAIL — settings row not found (assertDatabaseHas fails).

- [ ] **Step 3: Create the migration**

Create `database/migrations/2026_06_28_000100_add_trash_auto_purge_days_setting.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Number of days a soft-deleted (trashed) article may sit in the trash
     * before it is permanently deleted. Measured from deleted_at. 0 disables
     * the feature (default). Idempotent for prod.
     */
    public function up(): void
    {
        if (DB::table('settings')->where('key', 'trash_auto_purge_days')->exists()) {
            return;
        }

        DB::table('settings')->insert([
            'key'            => 'trash_auto_purge_days',
            'value'          => '0',
            'group'          => 'content',
            'type'           => 'number',
            'label_bn'       => 'ট্র্যাশ স্থায়ীভাবে মুছুন (দিন)',
            'label_en'       => 'Auto-delete trash after (days)',
            'description_bn' => 'ট্র্যাশে থাকা প্রবন্ধ কত দিন পর স্থায়ীভাবে মুছে যাবে। এটি ফেরানো যায় না। ০ দিলে বন্ধ।',
            'description_en' => 'Days a trashed article stays before it is permanently deleted (irreversible). 0 disables it.',
            'is_public'      => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'trash_auto_purge_days')->delete();
    }
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=TrashAutoPurgeTest`
Expected: PASS (1 passing).

- [ ] **Step 5: Commit**

```bash
git add database/migrations/2026_06_28_000100_add_trash_auto_purge_days_setting.php tests/Feature/Article/TrashAutoPurgeTest.php
git commit -m "feat: add trash_auto_purge_days setting (off by default)"
```

---

### Task 2: `articles:purge-trash` command

The command that permanently deletes old trash, gated by the setting, with a summary audit entry. Models on `App\Console\Commands\AutoArchiveArticles`.

**Files:**
- Create: `app/Console/Commands/PurgeTrashedArticles.php`
- Test: extend `tests/Feature/Article/TrashAutoPurgeTest.php` (from Task 1)

**Interfaces:**
- Consumes: `Setting::get('trash_auto_purge_days', 0)`; `Article::factory()`, `Article::onlyTrashed()`, `Article::withTrashed()`; `AuditLog::create([...])`; the `trashedDaysAgo()` test helper from Task 1.
- Produces: artisan command signature `articles:purge-trash`; on a purge run, an `AuditLog` row with `event = 'article.auto_purged'`.

- [ ] **Step 1: Write the failing tests**

Add these methods to `tests/Feature/Article/TrashAutoPurgeTest.php` (the `Article`, `AuditLog`, `Setting` imports are already present from Task 1):

```php
    public function test_command_purges_old_trash_when_enabled(): void
    {
        Setting::where('key', 'trash_auto_purge_days')->update(['value' => '30']);

        $old    = $this->trashedDaysAgo(31);
        $recent = $this->trashedDaysAgo(10);
        $live   = Article::factory()->create(); // not trashed

        $this->artisan('articles:purge-trash')->assertExitCode(0);

        $this->assertNull(Article::withTrashed()->find($old->id));        // gone from DB entirely
        $this->assertNotNull(Article::withTrashed()->find($recent->id));  // still in trash
        $this->assertNotNull(Article::find($live->id));                   // untouched
    }

    public function test_command_writes_audit_entry_with_count(): void
    {
        Setting::where('key', 'trash_auto_purge_days')->update(['value' => '30']);
        $this->trashedDaysAgo(40);

        $this->artisan('articles:purge-trash')->assertExitCode(0);

        $log = AuditLog::where('event', 'article.auto_purged')->first();
        $this->assertNotNull($log);
        $this->assertNull($log->user_id);
        $this->assertStringContainsString('1', $log->description);
    }

    public function test_command_is_noop_when_disabled(): void
    {
        // setting stays at default '0'
        $old = $this->trashedDaysAgo(365);

        $this->artisan('articles:purge-trash')->assertExitCode(0);

        $this->assertNotNull(Article::withTrashed()->find($old->id));
        $this->assertSame(0, AuditLog::where('event', 'article.auto_purged')->count());
    }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test --filter=TrashAutoPurgeTest`
Expected: FAIL — `Command "articles:purge-trash" is not defined`.

- [ ] **Step 3: Create the command**

Create `app/Console/Commands/PurgeTrashedArticles.php`:

```php
<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Console\Command;

class PurgeTrashedArticles extends Command
{
    protected $signature = 'articles:purge-trash';
    protected $description = 'Permanently delete trashed articles older than the configured trash_auto_purge_days window';

    public function handle(): int
    {
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
                'user_id'     => null,
                'event'       => 'article.auto_purged',
                'description' => "Auto-purged {$count} trashed articles older than {$days} days",
                'ip_address'  => null,
                'user_agent'  => 'scheduler',
            ]);
        }

        $this->info("Auto-purged {$count} trashed articles older than {$days} days.");
        return self::SUCCESS;
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `php artisan test --filter=TrashAutoPurgeTest`
Expected: PASS (4 passing).

- [ ] **Step 5: Commit**

```bash
git add app/Console/Commands/PurgeTrashedArticles.php tests/Feature/Article/TrashAutoPurgeTest.php
git commit -m "feat: add articles:purge-trash command with audit log"
```

---

### Task 3: Schedule the command daily

Wire the command into the daily scheduler. Verified by inspection.

**Files:**
- Modify: `routes/console.php` (append schedule line)

**Interfaces:**
- Consumes: `articles:purge-trash` command (Task 2).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Register the schedule**

In `routes/console.php`, after the existing `Schedule::command('articles:auto-archive')->daily();` line, add:

```php
// Permanently delete trashed articles older than the configured window (daily; no-op when disabled)
Schedule::command('articles:purge-trash')->daily();
```

- [ ] **Step 2: Verify the schedule is registered**

Run: `php artisan schedule:list`
Expected: output lists `articles:purge-trash` alongside `articles:auto-archive` and `stories:expire`.

- [ ] **Step 3: Commit**

```bash
git add routes/console.php
git commit -m "feat: schedule articles:purge-trash daily"
```

---

## Self-Review

**Spec coverage:**
- Configurable, default-off setting → Task 1. ✓
- Daily command force-deletes trash past N days from `deleted_at` → Task 2 (`test_command_purges_old_trash_when_enabled`). ✓
- Builder-level `forceDelete()` like the bulk action → Task 2 command body. ✓
- Summary audit entry per run, `user_id` null → Task 2 (`test_command_writes_audit_entry_with_count`). ✓
- No-op when disabled → Task 2 (`test_command_is_noop_when_disabled`). ✓
- Daily schedule → Task 3. ✓
- Admin Content tab → no work needed (generic Settings render + Content tab already exist). ✓

**Type consistency:** `trash_auto_purge_days`, `articles:purge-trash`, `article.auto_purged`, `group = 'content'`, `type = 'number'` used identically across tasks. ✓

**Placeholder scan:** none. ✓

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent per task with review between tasks.
2. **Inline Execution** — execute tasks in this session with checkpoints.
