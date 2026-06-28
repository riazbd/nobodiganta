# Article Auto-Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically move published articles to `archived` after a configurable number of days; archived articles are delisted from all public listings but stay readable by direct URL.

**Architecture:** A daily scheduled artisan command reads an `auto_archive_days` setting (0 = off) and bulk-updates eligible `published` articles to `archived`. Public listings already exclude `archived` via `scopePublished()`. A new `scopePublicReadable()` lets the single-article page serve `archived` articles to anyone (instead of 404).

**Tech Stack:** Laravel 11 (artisan commands, `routes/console.php` scheduler, Eloquent scopes), PHPUnit feature tests, Inertia/React admin settings page.

## Global Constraints

- `articles.status` enum is exactly: `draft`, `pending`, `published`, `archived` (no `scheduled`). Never introduce a new status value.
- The feature is OFF by default: `auto_archive_days` setting value is `'0'`; `0` (or less) disables auto-archiving entirely.
- Setting `type` must be `'number'` so the admin renders a numeric input; `Setting::get()` returns the raw string for `'number'`, so always cast with `(int)`.
- System/bulk status changes do NOT route through `App\Services\ArticleStatusWorkflow` (that is role/auth-gated). Use direct Eloquent updates, matching `App\Console\Commands\ExpireStories`.
- All listing queries stay on `scopePublished()`. Only the single-article page uses `scopePublicReadable()`.
- PHP runs via `php` (project PHP is `C:\wamp64\bin\php\php8.3.14`). Tests run with `php artisan test`.

---

### Task 1: Article test factory + `HasFactory`

The `Article` model has no factory and does not use `HasFactory`. Later tasks' tests need to create articles, categories, and authors cheaply. This task adds a minimal factory.

**Files:**
- Modify: `app/Models/Article.php` (add `HasFactory` trait)
- Create: `database/factories/ArticleFactory.php`
- Test: `tests/Feature/Article/ArticleFactoryTest.php`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `Article::factory()` returning a `published` article by default, with valid `category_id`, `author_id`, unique `slug_bn`, and `published_at = now()`.
  - States: `->archived()` (status `archived`), `->draft()` (status `draft`).
  - Override `published_at` / `status` per test via `->create([...])`.

- [ ] **Step 1: Write the failing test**

Create `tests/Feature/Article/ArticleFactoryTest.php`:

```php
<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_creates_published_article_with_relations(): void
    {
        $article = Article::factory()->create();

        $this->assertDatabaseHas('articles', ['id' => $article->id, 'status' => 'published']);
        $this->assertNotNull($article->category_id);
        $this->assertNotNull($article->author_id);
        $this->assertNotNull($article->published_at);
    }

    public function test_archived_state_sets_status(): void
    {
        $article = Article::factory()->archived()->create();
        $this->assertEquals('archived', $article->fresh()->status);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=ArticleFactoryTest`
Expected: FAIL — `Call to undefined method App\Models\Article::factory()`.

- [ ] **Step 3: Add `HasFactory` to the model**

In `app/Models/Article.php`, add the import near the other `use` lines (after line 6) and the trait use inside the class (alongside `use SoftDeletes;` at line 15):

```php
use Illuminate\Database\Eloquent\Factories\HasFactory;
```

```php
class Article extends Model
{
    use HasFactory, SoftDeletes;
```

- [ ] **Step 4: Create the factory**

Create `database/factories/ArticleFactory.php`:

```php
<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ArticleFactory extends Factory
{
    protected $model = Article::class;

    public function definition(): array
    {
        $title = $this->faker->sentence();

        return [
            'title_bn'     => $title,
            'body_bn'      => $this->faker->paragraph(),
            'slug_bn'      => Str::slug($title) . '-' . uniqid(),
            'edition'      => 'both',
            'article_type' => 'news',
            'status'       => 'published',
            'category_id'  => fn () => Category::firstOrCreate(
                ['slug' => 'test-category'],
                ['name_bn' => 'টেস্ট বিভাগ']
            )->id,
            'author_id'    => User::factory(),
            'published_at' => now(),
        ];
    }

    public function archived(): static
    {
        return $this->state(fn () => ['status' => 'archived']);
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => 'draft', 'published_at' => null]);
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `php artisan test --filter=ArticleFactoryTest`
Expected: PASS (2 passing).

- [ ] **Step 6: Commit**

```bash
git add app/Models/Article.php database/factories/ArticleFactory.php tests/Feature/Article/ArticleFactoryTest.php
git commit -m "test: add Article factory and HasFactory trait"
```

---

### Task 2: `auto_archive_days` setting migration

Insert the configurable, default-off setting. Idempotent, mirroring `database/migrations/2026_06_27_000300_add_breaking_default_expiry_setting.php`.

**Files:**
- Create: `database/migrations/2026_06_28_000000_add_auto_archive_days_setting.php`
- Test: `tests/Feature/Article/AutoArchiveTest.php` (new file, extended in Task 4)

**Interfaces:**
- Consumes: nothing.
- Produces: a `settings` row `key = 'auto_archive_days'`, `value = '0'`, `group = 'content'`, `type = 'number'`. Read via `Setting::get('auto_archive_days', 0)`.

- [ ] **Step 1: Write the failing test**

Create `tests/Feature/Article/AutoArchiveTest.php`:

```php
<?php

namespace Tests\Feature\Article;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutoArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_auto_archive_days_setting_exists_and_defaults_to_zero(): void
    {
        $this->assertDatabaseHas('settings', [
            'key'   => 'auto_archive_days',
            'group' => 'content',
            'type'  => 'number',
        ]);
        $this->assertSame(0, (int) Setting::get('auto_archive_days', 99));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=AutoArchiveTest`
Expected: FAIL — settings row not found (assertDatabaseHas fails).

- [ ] **Step 3: Create the migration**

Create `database/migrations/2026_06_28_000000_add_auto_archive_days_setting.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Number of days after publish when a published article is auto-archived.
     * Archived articles are delisted from public listings but remain readable
     * by direct URL. 0 disables the feature (default). Idempotent for prod.
     */
    public function up(): void
    {
        if (DB::table('settings')->where('key', 'auto_archive_days')->exists()) {
            return;
        }

        DB::table('settings')->insert([
            'key'            => 'auto_archive_days',
            'value'          => '0',
            'group'          => 'content',
            'type'           => 'number',
            'label_bn'       => 'স্বয়ংক্রিয় আর্কাইভ (দিন)',
            'label_en'       => 'Auto-archive after (days)',
            'description_bn' => 'প্রকাশের কত দিন পর প্রবন্ধ স্বয়ংক্রিয়ভাবে আর্কাইভ হবে। আর্কাইভ হলে তালিকায় দেখাবে না, তবে সরাসরি লিংকে পড়া যাবে। ০ দিলে বন্ধ।',
            'description_en' => 'Days after publishing when an article auto-archives. Archived items are hidden from listings but still readable by direct link. 0 disables it.',
            'is_public'      => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'auto_archive_days')->delete();
    }
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test --filter=AutoArchiveTest`
Expected: PASS (1 passing).

- [ ] **Step 5: Commit**

```bash
git add database/migrations/2026_06_28_000000_add_auto_archive_days_setting.php tests/Feature/Article/AutoArchiveTest.php
git commit -m "feat: add auto_archive_days setting (off by default)"
```

---

### Task 3: `scopePublicReadable` + readable archived article page

Add a scope that includes `published` and `archived` (with a valid past `published_at`), and switch the single-article lookup to it so archived articles render for everyone instead of 404. Listings stay on `scopePublished()`.

**Files:**
- Modify: `app/Models/Article.php` (add scope after `scopePublished`, ~line 252)
- Modify: `app/Http/Controllers/NewsController.php:374` (article lookup)
- Test: `tests/Feature/Article/ArchivedVisibilityTest.php`

**Interfaces:**
- Consumes: `Article::factory()`, `->archived()`, `->draft()` from Task 1.
- Produces: `Article::scopePublicReadable($query)` — `whereIn('status', ['published','archived'])` + `whereNotNull('published_at')` + `where('published_at','<=', now())`.

- [ ] **Step 1: Write the failing test**

Create `tests/Feature/Article/ArchivedVisibilityTest.php`:

```php
<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArchivedVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private function urlFor(Article $article): string
    {
        $slug = Category::find($article->category_id)->slug;
        return route('article', ['category' => $slug, 'slug' => $article->slug_bn]);
    }

    public function test_guest_can_read_archived_article_by_direct_url(): void
    {
        $article = Article::factory()->archived()->create(['published_at' => now()->subDays(40)]);

        $this->get($this->urlFor($article))->assertStatus(200);
    }

    public function test_guest_gets_404_for_draft_article(): void
    {
        $article = Article::factory()->draft()->create();

        $this->get($this->urlFor($article))->assertStatus(404);
    }

    public function test_archived_article_is_excluded_from_published_scope(): void
    {
        $published = Article::factory()->create();
        $archived  = Article::factory()->archived()->create();

        $ids = Article::published()->pluck('id');

        $this->assertTrue($ids->contains($published->id));
        $this->assertFalse($ids->contains($archived->id));
    }

    public function test_public_readable_scope_includes_published_and_archived_only(): void
    {
        $published = Article::factory()->create();
        $archived  = Article::factory()->archived()->create();
        $draft     = Article::factory()->draft()->create();

        $ids = Article::publicReadable()->pluck('id');

        $this->assertTrue($ids->contains($published->id));
        $this->assertTrue($ids->contains($archived->id));
        $this->assertFalse($ids->contains($draft->id));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=ArchivedVisibilityTest`
Expected: FAIL — `Call to undefined method ...::publicReadable()`, and the archived-URL test returns 404 (current behavior).

- [ ] **Step 3: Add the scope**

In `app/Models/Article.php`, immediately after `scopePublished()` (after the closing brace at line 252), add:

```php
    /**
     * Scope: Publicly readable by direct URL — published OR archived.
     * Archived articles stay reachable by link but are excluded from
     * listings (listings use scopePublished()). Draft/pending excluded.
     */
    public function scopePublicReadable($query)
    {
        return $query->whereIn('status', ['published', 'archived'])
                     ->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
    }
```

- [ ] **Step 4: Use the scope on the article page**

In `app/Http/Controllers/NewsController.php`, in `article()` (line 374), change the main lookup from `Article::published()` to `Article::publicReadable()`:

```php
        $article = Article::publicReadable()
            ->forEdition($edition)
            ->where($slugMatch)
            ->withRelations()
            ->first();
```

Leave the staff-preview fallback below it unchanged — it still covers draft/pending for logged-in staff.

- [ ] **Step 5: Run test to verify it passes**

Run: `php artisan test --filter=ArchivedVisibilityTest`
Expected: PASS (4 passing).

- [ ] **Step 6: Commit**

```bash
git add app/Models/Article.php app/Http/Controllers/NewsController.php tests/Feature/Article/ArchivedVisibilityTest.php
git commit -m "feat: archived articles readable by direct URL, still delisted"
```

---

### Task 4: `articles:auto-archive` command

The command that performs the archiving, gated by the setting. Models on `App\Console\Commands\ExpireStories`.

**Files:**
- Create: `app/Console/Commands/AutoArchiveArticles.php`
- Test: extend `tests/Feature/Article/AutoArchiveTest.php` (from Task 2)

**Interfaces:**
- Consumes: `Setting::get('auto_archive_days', 0)`; `Article::factory()` from Task 1.
- Produces: artisan command signature `articles:auto-archive`.

- [ ] **Step 1: Write the failing tests**

Add these methods to `tests/Feature/Article/AutoArchiveTest.php` (keep the existing test and the imports; add `use App\Models\Article;` at the top):

```php
    public function test_command_archives_old_published_articles_when_enabled(): void
    {
        Setting::where('key', 'auto_archive_days')->update(['value' => '30']);

        $old    = Article::factory()->create(['published_at' => now()->subDays(31)]);
        $recent = Article::factory()->create(['published_at' => now()->subDays(10)]);

        $this->artisan('articles:auto-archive')->assertExitCode(0);

        $this->assertEquals('archived', $old->fresh()->status);
        $this->assertEquals('published', $recent->fresh()->status);
    }

    public function test_command_is_noop_when_disabled(): void
    {
        // setting stays at default '0'
        $old = Article::factory()->create(['published_at' => now()->subDays(365)]);

        $this->artisan('articles:auto-archive')->assertExitCode(0);

        $this->assertEquals('published', $old->fresh()->status);
    }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `php artisan test --filter=AutoArchiveTest`
Expected: FAIL — `Command "articles:auto-archive" is not defined`.

- [ ] **Step 3: Create the command**

Create `app/Console/Commands/AutoArchiveArticles.php`:

```php
<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Setting;
use Illuminate\Console\Command;

class AutoArchiveArticles extends Command
{
    protected $signature = 'articles:auto-archive';
    protected $description = 'Archive published articles older than the configured auto_archive_days window';

    public function handle(): int
    {
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
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `php artisan test --filter=AutoArchiveTest`
Expected: PASS (3 passing).

- [ ] **Step 5: Commit**

```bash
git add app/Console/Commands/AutoArchiveArticles.php tests/Feature/Article/AutoArchiveTest.php
git commit -m "feat: add articles:auto-archive command"
```

---

### Task 5: Schedule the command + admin "Content" settings tab

Wire the command into the daily scheduler and give the new `content` settings group a proper tab label/icon. These are config/UI touches verified by inspection rather than unit tests.

**Files:**
- Modify: `routes/console.php` (append schedule line)
- Modify: `resources/js/features/admin/pages/system/Settings.jsx` (add `content` to `TAB_META`, ~line 122)

**Interfaces:**
- Consumes: `articles:auto-archive` command (Task 4); `auto_archive_days` setting with `group = 'content'` (Task 2).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Register the schedule**

In `routes/console.php`, after the existing `Schedule::command('stories:expire')->hourly();` line, add:

```php
// Auto-archive published articles older than the configured window (daily; no-op when disabled)
Schedule::command('articles:auto-archive')->daily();
```

- [ ] **Step 2: Verify the schedule is registered**

Run: `php artisan schedule:list`
Expected: output lists both `stories:expire` and `articles:auto-archive`.

- [ ] **Step 3: Add the admin tab metadata**

In `resources/js/features/admin/pages/system/Settings.jsx`, add `FileText` to the lucide-react import block (lines 3-7), then add a `content` entry to the `TAB_META` object (after the `breaking` entry, ~line 122):

Import edit — add `FileText` to the existing import list:

```jsx
  Scale, HelpCircle, Lock, Zap, FileText
```

TAB_META edit:

```jsx
    breaking: { labelBn: 'ব্রেকিং', labelEn: 'Breaking', icon: Zap },
    content: { labelBn: 'কনটেন্ট', labelEn: 'Content', icon: FileText },
```

- [ ] **Step 4: Build the front-end to verify no syntax errors**

Run: `npm run build`
Expected: build completes without errors; `Settings.jsx` compiles.

- [ ] **Step 5: Commit**

```bash
git add routes/console.php resources/js/features/admin/pages/system/Settings.jsx
git commit -m "feat: schedule articles:auto-archive daily + admin Content settings tab"
```

---

## Self-Review

**Spec coverage:**
- Configurable, default-off setting → Task 2 (+ admin tab Task 5). ✓
- Console command archives `published → archived` past N days → Task 4. ✓
- Archived delisted from listings → existing `scopePublished()`, verified in Task 3 test `test_archived_article_is_excluded_from_published_scope`. ✓
- Archived readable by direct URL for everyone → Task 3. ✓
- Daily schedule → Task 5. ✓
- Draft/pending still 404 for guests → Task 3 `test_guest_gets_404_for_draft_article`. ✓
- Indexable (no noindex), views still increment → no code added (verified by leaving `article()` rendering/`incrementViews()` untouched). ✓

**Type consistency:** `scopePublicReadable`/`Article::publicReadable()`, `articles:auto-archive`, `auto_archive_days`, `group = 'content'`, `type = 'number'` used identically across tasks. ✓

**Placeholder scan:** none. ✓

## Execution Handoff

Two execution options:

1. **Subagent-Driven (recommended)** — a fresh subagent per task with review between tasks.
2. **Inline Execution** — execute tasks in this session with checkpoints.
