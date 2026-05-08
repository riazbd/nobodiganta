# Photo & Video Stories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Instagram/Facebook-style Stories feature — circular bubble strip on the homepage, full-screen slide viewer, dedicated `/stories` page, and a full admin CRUD with permission-gated publish and optional auto-expiry.

**Architecture:** Dedicated `stories` + `story_slides` tables (no Article model coupling). Six new permissions in `RolePermissionSeeder`. Public rendering via `StoriesController`, admin CRUD via `Admin\StoryController` + `Admin\StorySlideController`. Frontend: `StoryStrip` bubble row, `StoryViewer` full-screen overlay, `Stories.jsx` public page, three admin pages.

**Tech Stack:** Laravel 11, Eloquent, Inertia.js, React 18, Tailwind CSS, Laravel Scheduler (auto-expiry)

---

## File Map

**Create:**
- `database/migrations/2026_05_08_100000_create_stories_table.php`
- `database/migrations/2026_05_08_100001_create_story_slides_table.php`
- `app/Models/Story.php`
- `app/Models/StorySlide.php`
- `app/Http/Controllers/StoriesController.php`
- `app/Http/Controllers/Admin/StoryController.php`
- `app/Http/Controllers/Admin/StorySlideController.php`
- `app/Console/Commands/ExpireStories.php`
- `resources/js/Pages/Stories.jsx`
- `resources/js/Components/StoryStrip.jsx`
- `resources/js/Components/StoryViewer.jsx`
- `resources/js/features/admin/pages/stories/Index.jsx`
- `resources/js/features/admin/pages/stories/Form.jsx`
- `resources/js/features/admin/pages/stories/SlideModal.jsx`
- `tests/Feature/StoriesPublicTest.php`
- `tests/Feature/Admin/StoryControllerTest.php`

**Modify:**
- `database/seeders/RolePermissionSeeder.php` — add `stories` permission group
- `app/Models/HomepageSection.php` — document `stories` type (no migration needed, type is varchar)
- `app/Http/Controllers/NewsController.php` — handle `stories` section type
- `routes/web.php` — add public + admin stories routes
- `app/Console/Kernel.php` — register `stories:expire` command

---

## Task 1: Create `stories` Migration

**Files:**
- Create: `database/migrations/2026_05_08_100000_create_stories_table.php`

- [ ] **Step 1: Create the migration file**

```php
<?php
// database/migrations/2026_05_08_100000_create_stories_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->string('title_bn');
            $table->string('title_en')->nullable();
            $table->string('slug')->unique();
            $table->foreignId('cover_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->enum('status', ['draft', 'published', 'expired', 'archived'])->default('draft');
            $table->enum('edition', ['bn', 'en', 'both'])->default('bn');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamps();

            $table->index('status');
            $table->index('edition');
            $table->index('published_at');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};
```

- [ ] **Step 2: Run migration**

```bash
php artisan migrate --path=database/migrations/2026_05_08_100000_create_stories_table.php
```

Expected: `DONE` with no errors.

- [ ] **Step 3: Commit**

```bash
git add database/migrations/2026_05_08_100000_create_stories_table.php
git commit -m "feat: add stories table migration"
```

---

## Task 2: Create `story_slides` Migration

**Files:**
- Create: `database/migrations/2026_05_08_100001_create_story_slides_table.php`

- [ ] **Step 1: Create the migration file**

```php
<?php
// database/migrations/2026_05_08_100001_create_story_slides_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('story_slides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained('stories')->cascadeOnDelete();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->foreignId('media_id')->constrained('media');
            $table->string('text_overlay_bn')->nullable();
            $table->string('text_overlay_en')->nullable();
            $table->foreignId('linked_article_id')->nullable()->constrained('articles')->nullOnDelete();
            $table->unsignedTinyInteger('duration')->default(5);
            $table->timestamps();

            $table->index(['story_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('story_slides');
    }
};
```

- [ ] **Step 2: Run migration**

```bash
php artisan migrate --path=database/migrations/2026_05_08_100001_create_story_slides_table.php
```

Expected: `DONE` with no errors.

- [ ] **Step 3: Commit**

```bash
git add database/migrations/2026_05_08_100001_create_story_slides_table.php
git commit -m "feat: add story_slides table migration"
```

---

## Task 3: Create `Story` Model

**Files:**
- Create: `app/Models/Story.php`

- [ ] **Step 1: Create the model**

```php
<?php
// app/Models/Story.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Story extends Model
{
    protected $fillable = [
        'title_bn', 'title_en', 'slug',
        'cover_media_id', 'status', 'edition',
        'expires_at', 'published_at',
        'created_by', 'published_by', 'view_count',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'published_at' => 'datetime',
        'view_count' => 'integer',
    ];

    public function coverMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_media_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function slides(): HasMany
    {
        return $this->hasMany(StorySlide::class)->orderBy('sort_order');
    }

    // --- Scopes ---

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeForEdition($query, string $edition)
    {
        if ($edition === 'bn' || $edition === 'en') {
            return $query->whereIn('edition', [$edition, 'both']);
        }
        return $query;
    }

    // --- Helpers ---

    public function getTitle(string $edition = 'bn'): string
    {
        if ($edition === 'en' && $this->title_en) return $this->title_en;
        return $this->title_bn;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function publish(User $by): void
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
            'published_by' => $by->id,
        ]);
    }

    public function restore(User $by): void
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
            'published_by' => $by->id,
            'expires_at' => null,
        ]);
    }

    public function toAPIArray(string $edition = 'bn'): array
    {
        return [
            'id' => $this->id,
            'title' => $this->getTitle($edition),
            'title_bn' => $this->title_bn,
            'title_en' => $this->title_en,
            'slug' => $this->slug,
            'cover' => $this->coverMedia?->getUrl(),
            'cover_thumbnail' => $this->coverMedia?->getThumbnailUrl(),
            'cover_media_id' => $this->cover_media_id,
            'status' => $this->status,
            'edition' => $this->edition,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'published_at' => $this->published_at?->toIso8601String(),
            'view_count' => $this->view_count,
            'slides_count' => $this->slides_count ?? $this->slides()->count(),
            'slides' => $this->relationLoaded('slides')
                ? $this->slides->map(fn($s) => $s->toAPIArray($edition))->values()
                : [],
        ];
    }
}
```

- [ ] **Step 2: Write a basic unit test**

```php
<?php
// tests/Feature/StoriesPublicTest.php

namespace Tests\Feature;

use App\Models\Story;
use App\Models\User;
use App\Models\Media;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoriesPublicTest extends TestCase
{
    use RefreshDatabase;

    public function test_story_get_title_returns_bangla_by_default(): void
    {
        $story = new Story(['title_bn' => 'বাংলা শিরোনাম', 'title_en' => 'English Title']);
        $this->assertEquals('বাংলা শিরোনাম', $story->getTitle());
    }

    public function test_story_get_title_returns_english_when_requested(): void
    {
        $story = new Story(['title_bn' => 'বাংলা শিরোনাম', 'title_en' => 'English Title']);
        $this->assertEquals('English Title', $story->getTitle('en'));
    }

    public function test_story_get_title_falls_back_to_bangla_when_english_missing(): void
    {
        $story = new Story(['title_bn' => 'বাংলা শিরোনাম', 'title_en' => null]);
        $this->assertEquals('বাংলা শিরোনাম', $story->getTitle('en'));
    }

    public function test_is_expired_returns_true_when_expires_at_is_past(): void
    {
        $story = new Story(['expires_at' => now()->subHour()]);
        $this->assertTrue($story->isExpired());
    }

    public function test_is_expired_returns_false_when_expires_at_is_future(): void
    {
        $story = new Story(['expires_at' => now()->addHour()]);
        $this->assertFalse($story->isExpired());
    }

    public function test_is_expired_returns_false_when_expires_at_is_null(): void
    {
        $story = new Story(['expires_at' => null]);
        $this->assertFalse($story->isExpired());
    }
}
```

- [ ] **Step 3: Run the tests**

```bash
php artisan test tests/Feature/StoriesPublicTest.php
```

Expected: 6 tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/Models/Story.php tests/Feature/StoriesPublicTest.php
git commit -m "feat: add Story model with bilingual helpers and scopes"
```

---

## Task 4: Create `StorySlide` Model

**Files:**
- Create: `app/Models/StorySlide.php`

- [ ] **Step 1: Create the model**

```php
<?php
// app/Models/StorySlide.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorySlide extends Model
{
    protected $fillable = [
        'story_id', 'sort_order', 'media_id',
        'text_overlay_bn', 'text_overlay_en',
        'linked_article_id', 'duration',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'duration' => 'integer',
    ];

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function linkedArticle(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'linked_article_id');
    }

    public function getTextOverlay(string $edition = 'bn'): ?string
    {
        if ($edition === 'en' && $this->text_overlay_en) return $this->text_overlay_en;
        return $this->text_overlay_bn;
    }

    public function isVideo(): bool
    {
        return $this->media && str_contains($this->media->mime_type ?? '', 'video');
    }

    public function toAPIArray(string $edition = 'bn'): array
    {
        return [
            'id' => $this->id,
            'sort_order' => $this->sort_order,
            'media_url' => $this->media?->getUrl(),
            'media_thumbnail' => $this->media?->getThumbnailUrl(),
            'is_video' => $this->isVideo(),
            'text_overlay' => $this->getTextOverlay($edition),
            'duration' => $this->duration,
            'linked_article' => $this->linkedArticle ? [
                'id' => $this->linkedArticle->id,
                'title' => $this->linkedArticle->getTitle($edition),
                'slug' => $this->linkedArticle->getSlug($edition),
                'category_slug' => $this->linkedArticle->category?->slug,
            ] : null,
        ];
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Models/StorySlide.php
git commit -m "feat: add StorySlide model"
```

---

## Task 5: Add Stories Permissions to RolePermissionSeeder

**Files:**
- Modify: `database/seeders/RolePermissionSeeder.php`

- [ ] **Step 1: Open the seeder and locate the `PERMISSIONS` constant**

Find the block that looks like:
```php
const PERMISSIONS = [
    'news' => [...],
    'video' => [...],
    // ...
];
```

- [ ] **Step 2: Add the `stories` group to the `PERMISSIONS` constant**

Add after the `'video'` group (or any logical place):

```php
'stories' => [
    'view_any',
    'create',
    'edit',
    'delete',
    'publish',
    'restore_expired',
],
```

- [ ] **Step 3: Find the role permission assignments and add stories permissions**

Locate where roles like `reporter`, `section_editor`, `managing_editor`, `editor_in_chief`, `super_admin` are assigned permission arrays. Add stories permissions to each:

**reporter** — add:
```php
'stories.view_any',
'stories.create',
```

**section_editor** — add:
```php
'stories.view_any',
'stories.create',
'stories.edit',
'stories.delete',
```

**managing_editor** — add:
```php
'stories.view_any',
'stories.create',
'stories.edit',
'stories.delete',
'stories.publish',
'stories.restore_expired',
```

**editor_in_chief** — add same as managing_editor:
```php
'stories.view_any',
'stories.create',
'stories.edit',
'stories.delete',
'stories.publish',
'stories.restore_expired',
```

**seo_manager** — add:
```php
'stories.view_any',
```

**photographer** — add:
```php
'stories.view_any',
'stories.create',
```

> Note: `supreme_admin` and `super_admin` already get all permissions via the `'all'` sentinel — no change needed for them.

- [ ] **Step 4: Re-run the seeder**

```bash
php artisan db:seed --class=RolePermissionSeeder
```

Expected: No errors. Output shows permissions created/updated.

- [ ] **Step 5: Verify in tinker**

```bash
php artisan tinker --execute="echo \App\Models\Permission::where('name','like','stories%')->count();"
```

Expected: `6`

- [ ] **Step 6: Commit**

```bash
git add database/seeders/RolePermissionSeeder.php
git commit -m "feat: add stories permissions to role permission seeder"
```

---

## Task 6: Add Routes

**Files:**
- Modify: `routes/web.php`

- [ ] **Step 1: Add public stories routes**

In `routes/web.php`, before the catch-all `/{category}/{slug}` route, add:

```php
// Stories (public)
Route::get('/stories', [\App\Http\Controllers\StoriesController::class, 'index'])->name('stories');
Route::get('/api/stories', [\App\Http\Controllers\StoriesController::class, 'apiIndex'])->name('api.stories');
```

Also add the English mirror (near the other `/en/` routes):

```php
Route::get('/en/stories', [\App\Http\Controllers\StoriesController::class, 'index'])->name('en.stories');
```

- [ ] **Step 2: Add admin stories routes**

Inside the `Route::prefix('admin')->name('admin.')->group(function () { ... })` block, add:

```php
// Stories
Route::get('/stories', [\App\Http\Controllers\Admin\StoryController::class, 'index'])->name('stories');
Route::get('/stories/create', [\App\Http\Controllers\Admin\StoryController::class, 'create'])->name('stories.create');
Route::post('/stories', [\App\Http\Controllers\Admin\StoryController::class, 'store'])->name('stories.store');
Route::get('/stories/{story}/edit', [\App\Http\Controllers\Admin\StoryController::class, 'edit'])->name('stories.edit');
Route::put('/stories/{story}', [\App\Http\Controllers\Admin\StoryController::class, 'update'])->name('stories.update');
Route::delete('/stories/{story}', [\App\Http\Controllers\Admin\StoryController::class, 'destroy'])->name('stories.destroy');
Route::post('/stories/{story}/publish', [\App\Http\Controllers\Admin\StoryController::class, 'publish'])->name('stories.publish');
Route::post('/stories/{story}/restore', [\App\Http\Controllers\Admin\StoryController::class, 'restore'])->name('stories.restore');

// Story Slides
Route::post('/stories/{story}/slides', [\App\Http\Controllers\Admin\StorySlideController::class, 'store'])->name('stories.slides.store');
Route::put('/stories/{story}/slides/{slide}', [\App\Http\Controllers\Admin\StorySlideController::class, 'update'])->name('stories.slides.update');
Route::delete('/stories/{story}/slides/{slide}', [\App\Http\Controllers\Admin\StorySlideController::class, 'destroy'])->name('stories.slides.destroy');
Route::post('/stories/{story}/slides/reorder', [\App\Http\Controllers\Admin\StorySlideController::class, 'reorder'])->name('stories.slides.reorder');
```

- [ ] **Step 3: Verify routes are registered**

```bash
php artisan route:list --name=stories
```

Expected: Lists all 12 stories routes with correct methods and URIs.

- [ ] **Step 4: Commit**

```bash
git add routes/web.php
git commit -m "feat: add public and admin stories routes"
```

---

## Task 7: Create Admin StoryController

**Files:**
- Create: `app/Http/Controllers/Admin/StoryController.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/Admin/StoryControllerTest.php

namespace Tests\Feature\Admin;

use App\Models\Story;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoryControllerTest extends TestCase
{
    use RefreshDatabase;

    private function makeUserWithPermission(string $permission): User
    {
        $user = User::factory()->create();
        // Attach permission directly for testing
        $perm = \App\Models\Permission::firstOrCreate(['name' => $permission, 'group' => 'stories']);
        $user->permissions()->attach($perm->id);
        return $user;
    }

    public function test_index_requires_stories_view_any_permission(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->get(route('admin.stories'))
            ->assertStatus(403);
    }

    public function test_index_returns_ok_with_permission(): void
    {
        $user = $this->makeUserWithPermission('stories.view_any');
        $this->actingAs($user)
            ->get(route('admin.stories'))
            ->assertStatus(200);
    }

    public function test_store_creates_draft_story(): void
    {
        $user = $this->makeUserWithPermission('stories.create');
        $this->actingAs($user)
            ->postJson(route('admin.stories.store'), [
                'title_bn' => 'পরীক্ষামূলক স্টোরি',
                'edition' => 'bn',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('stories', [
            'title_bn' => 'পরীক্ষামূলক স্টোরি',
            'status' => 'draft',
            'created_by' => $user->id,
        ]);
    }

    public function test_publish_requires_publish_permission(): void
    {
        $creator = $this->makeUserWithPermission('stories.create');
        $story = Story::factory()->create(['created_by' => $creator->id, 'status' => 'draft']);

        $this->actingAs($creator)
            ->postJson(route('admin.stories.publish', $story))
            ->assertStatus(403);
    }

    public function test_publish_sets_status_to_published(): void
    {
        $editor = $this->makeUserWithPermission('stories.publish');
        $story = Story::factory()->create(['status' => 'draft', 'created_by' => $editor->id]);

        $this->actingAs($editor)
            ->postJson(route('admin.stories.publish', $story))
            ->assertStatus(200);

        $this->assertEquals('published', $story->fresh()->status);
    }

    public function test_restore_requires_restore_expired_permission(): void
    {
        $editor = $this->makeUserWithPermission('stories.publish');
        $story = Story::factory()->create(['status' => 'expired', 'created_by' => $editor->id]);

        $this->actingAs($editor)
            ->postJson(route('admin.stories.restore', $story))
            ->assertStatus(403);
    }

    public function test_restore_sets_status_to_published(): void
    {
        $editor = $this->makeUserWithPermission('stories.restore_expired');
        $story = Story::factory()->create(['status' => 'expired', 'created_by' => $editor->id]);

        $this->actingAs($editor)
            ->postJson(route('admin.stories.restore', $story))
            ->assertStatus(200);

        $this->assertEquals('published', $story->fresh()->status);
    }
}
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
php artisan test tests/Feature/Admin/StoryControllerTest.php
```

Expected: All tests FAIL (controller doesn't exist yet).

- [ ] **Step 3: Create Story factory**

```php
<?php
// database/factories/StoryFactory.php

namespace Database\Factories;

use App\Models\Story;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class StoryFactory extends Factory
{
    protected $model = Story::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(4);
        return [
            'title_bn' => 'পরীক্ষা ' . $this->faker->word(),
            'title_en' => $title,
            'slug' => Str::slug($title) . '-' . $this->faker->unique()->numberBetween(1, 9999),
            'status' => 'draft',
            'edition' => 'bn',
            'expires_at' => null,
            'published_at' => null,
            'created_by' => User::factory(),
            'published_by' => null,
            'view_count' => 0,
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published', 'published_at' => now()]);
    }

    public function expired(): static
    {
        return $this->state(['status' => 'expired', 'expires_at' => now()->subHour()]);
    }
}
```

- [ ] **Step 4: Create the controller**

```php
<?php
// app/Http/Controllers/Admin/StoryController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class StoryController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('stories.view_any')) abort(403);

        $query = Story::with(['coverMedia', 'creator'])
            ->withCount('slides');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title_bn', 'like', '%' . $request->search . '%')
                  ->orWhere('title_en', 'like', '%' . $request->search . '%');
            });
        }

        $stories = $query->latest()->paginate(20)->through(fn($s) => [
            'id' => $s->id,
            'title_bn' => $s->title_bn,
            'title_en' => $s->title_en,
            'slug' => $s->slug,
            'status' => $s->status,
            'edition' => $s->edition,
            'slides_count' => $s->slides_count,
            'expires_at' => $s->expires_at?->toIso8601String(),
            'published_at' => $s->published_at?->toIso8601String(),
            'cover_thumbnail' => $s->coverMedia?->getThumbnailUrl(),
            'creator_name' => $s->creator?->name,
        ]);

        return Inertia::render('features/admin/pages/stories/Index', [
            'stories' => $stories,
            'filters' => $request->only(['status', 'search']),
            'can' => [
                'create' => auth()->user()->hasPermission('stories.create'),
                'publish' => auth()->user()->hasPermission('stories.publish'),
                'restore' => auth()->user()->hasPermission('stories.restore_expired'),
            ],
        ]);
    }

    public function create()
    {
        if (!auth()->user()->hasPermission('stories.create')) abort(403);

        return Inertia::render('features/admin/pages/stories/Form', [
            'story' => null,
            'can' => [
                'publish' => auth()->user()->hasPermission('stories.publish'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('stories.create')) abort(403);

        $validated = $request->validate([
            'title_bn' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'cover_media_id' => 'nullable|exists:media,id',
            'edition' => 'required|in:bn,en,both',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $slug = $this->generateSlug($validated['title_bn']);

        $story = Story::create([
            ...$validated,
            'slug' => $slug,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        if ($request->expectsJson()) {
            return response()->json(['story' => $story->toAPIArray()], 201);
        }

        return redirect()->route('admin.stories.edit', $story);
    }

    public function edit(Story $story)
    {
        if (!auth()->user()->hasPermission('stories.edit') &&
            !($story->created_by === auth()->id() && auth()->user()->hasPermission('stories.create'))) {
            abort(403);
        }

        $story->load(['coverMedia', 'slides.media', 'slides.linkedArticle.category']);

        return Inertia::render('features/admin/pages/stories/Form', [
            'story' => $story->toAPIArray(),
            'can' => [
                'publish' => auth()->user()->hasPermission('stories.publish'),
                'restore' => auth()->user()->hasPermission('stories.restore_expired'),
            ],
        ]);
    }

    public function update(Request $request, Story $story)
    {
        if (!auth()->user()->hasPermission('stories.edit') &&
            $story->created_by !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title_bn' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'cover_media_id' => 'nullable|exists:media,id',
            'edition' => 'required|in:bn,en,both',
            'expires_at' => 'nullable|date',
        ]);

        $story->update($validated);

        return response()->json(['story' => $story->fresh()->toAPIArray()]);
    }

    public function destroy(Story $story)
    {
        if (!auth()->user()->hasPermission('stories.delete')) abort(403);

        $story->delete();

        return response()->json(['ok' => true]);
    }

    public function publish(Story $story)
    {
        if (!auth()->user()->hasPermission('stories.publish')) abort(403);

        $story->publish(auth()->user());

        return response()->json(['story' => $story->toAPIArray()]);
    }

    public function restore(Story $story)
    {
        if (!auth()->user()->hasPermission('stories.restore_expired')) abort(403);

        $story->restore(auth()->user());

        return response()->json(['story' => $story->toAPIArray()]);
    }

    private function generateSlug(string $title, ?int $excludeId = null): string
    {
        $base = preg_replace('/[^\p{L}\p{N}\s-]+/u', '', $title);
        $base = preg_replace('/\s+/', '-', trim($base));
        $base = strtolower($base);
        $slug = $base;
        $counter = 1;

        while (Story::where('slug', $slug)->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))->exists()) {
            $slug = $base . '-' . $counter++;
        }

        return $slug;
    }
}
```

- [ ] **Step 5: Run the tests**

```bash
php artisan test tests/Feature/Admin/StoryControllerTest.php
```

Expected: All 7 tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Admin/StoryController.php database/factories/StoryFactory.php tests/Feature/Admin/StoryControllerTest.php
git commit -m "feat: add Admin StoryController with permission gates"
```

---

## Task 8: Create Admin StorySlideController

**Files:**
- Create: `app/Http/Controllers/Admin/StorySlideController.php`

- [ ] **Step 1: Create the controller**

```php
<?php
// app/Http/Controllers/Admin/StorySlideController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Story;
use App\Models\StorySlide;
use Illuminate\Http\Request;

class StorySlideController extends Controller
{
    private function canEdit(Story $story): bool
    {
        return auth()->user()->hasPermission('stories.edit') ||
               $story->created_by === auth()->id();
    }

    public function store(Request $request, Story $story)
    {
        if (!$this->canEdit($story)) abort(403);

        $validated = $request->validate([
            'media_id' => 'required|exists:media,id',
            'text_overlay_bn' => 'nullable|string|max:255',
            'text_overlay_en' => 'nullable|string|max:255',
            'linked_article_id' => 'nullable|exists:articles,id',
            'duration' => 'nullable|integer|min:1|max:30',
        ]);

        $maxOrder = $story->slides()->max('sort_order') ?? -1;

        $slide = $story->slides()->create([
            ...$validated,
            'sort_order' => $maxOrder + 1,
            'duration' => $validated['duration'] ?? 5,
        ]);

        $slide->load(['media', 'linkedArticle.category']);

        return response()->json(['slide' => $slide->toAPIArray()], 201);
    }

    public function update(Request $request, Story $story, StorySlide $slide)
    {
        if (!$this->canEdit($story)) abort(403);
        abort_unless($slide->story_id === $story->id, 404);

        $validated = $request->validate([
            'media_id' => 'sometimes|exists:media,id',
            'text_overlay_bn' => 'nullable|string|max:255',
            'text_overlay_en' => 'nullable|string|max:255',
            'linked_article_id' => 'nullable|exists:articles,id',
            'duration' => 'nullable|integer|min:1|max:30',
        ]);

        $slide->update($validated);
        $slide->load(['media', 'linkedArticle.category']);

        return response()->json(['slide' => $slide->toAPIArray()]);
    }

    public function destroy(Story $story, StorySlide $slide)
    {
        if (!$this->canEdit($story)) abort(403);
        abort_unless($slide->story_id === $story->id, 404);

        $slide->delete();

        // Re-index sort_order to keep sequential
        $story->slides()->orderBy('sort_order')->get()
            ->each(fn($s, $i) => $s->update(['sort_order' => $i]));

        return response()->json(['ok' => true]);
    }

    public function reorder(Request $request, Story $story)
    {
        if (!$this->canEdit($story)) abort(403);

        $validated = $request->validate([
            'slide_ids' => 'required|array',
            'slide_ids.*' => 'integer|exists:story_slides,id',
        ]);

        foreach ($validated['slide_ids'] as $order => $slideId) {
            StorySlide::where('id', $slideId)
                ->where('story_id', $story->id)
                ->update(['sort_order' => $order]);
        }

        return response()->json(['ok' => true]);
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Http/Controllers/Admin/StorySlideController.php
git commit -m "feat: add Admin StorySlideController with reorder support"
```

---

## Task 9: Create Public StoriesController

**Files:**
- Create: `app/Http/Controllers/StoriesController.php`

- [ ] **Step 1: Create the controller**

```php
<?php
// app/Http/Controllers/StoriesController.php

namespace App\Http\Controllers;

use App\Models\Story;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoriesController extends Controller
{
    public function index(Request $request)
    {
        $edition = $this->getEdition($request);

        $stories = Story::published()
            ->forEdition($edition)
            ->with(['coverMedia', 'slides.media', 'slides.linkedArticle.category'])
            ->withCount('slides')
            ->latest('published_at')
            ->paginate(24)
            ->through(fn($s) => $s->toAPIArray($edition));

        return Inertia::render('Stories', [
            'stories' => $stories,
            'edition' => $edition,
        ]);
    }

    public function apiIndex(Request $request)
    {
        $edition = $this->getEdition($request);
        $limit = min((int) $request->get('limit', 10), 20);

        $stories = Story::published()
            ->forEdition($edition)
            ->with(['coverMedia', 'slides.media', 'slides.linkedArticle.category'])
            ->withCount('slides')
            ->latest('published_at')
            ->limit($limit)
            ->get()
            ->map(fn($s) => $s->toAPIArray($edition));

        return response()->json(['stories' => $stories]);
    }

    protected function getEdition(Request $request): string
    {
        if (str_starts_with($request->path(), 'en/')) return 'en';
        return $request->query('edition') === 'en' ? 'en' : 'bn';
    }
}
```

- [ ] **Step 2: Add a public route test to StoriesPublicTest.php**

Open `tests/Feature/StoriesPublicTest.php` and add:

```php
public function test_stories_page_returns_200(): void
{
    Story::factory()->published()->create();

    $this->get(route('stories'))
        ->assertStatus(200);
}

public function test_api_stories_returns_json(): void
{
    Story::factory()->published()->count(3)->create();

    $this->getJson(route('api.stories'))
        ->assertStatus(200)
        ->assertJsonStructure(['stories']);
}

public function test_expired_stories_do_not_appear_publicly(): void
{
    Story::factory()->expired()->create();

    $response = $this->getJson(route('api.stories'));
    $response->assertJsonCount(0, 'stories');
}
```

- [ ] **Step 3: Run the tests**

```bash
php artisan test tests/Feature/StoriesPublicTest.php
```

Expected: All 9 tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/StoriesController.php tests/Feature/StoriesPublicTest.php
git commit -m "feat: add public StoriesController with edition support"
```

---

## Task 10: Add `stories` Type to HomepageSection + NewsController

**Files:**
- Modify: `app/Http/Controllers/NewsController.php`

- [ ] **Step 1: Find the homepage section loading code in NewsController@home**

Locate the block that iterates over `HomepageSection` records and builds section data. It will have a condition like:

```php
if ($section->type === 'videos') { ... }
if ($section->type === 'category') { ... }
```

- [ ] **Step 2: Add the `stories` type handler**

Add alongside the existing type handlers:

```php
if ($section->type === 'stories') {
    $items = \App\Models\Story::published()
        ->forEdition($edition)
        ->with(['coverMedia'])
        ->withCount('slides')
        ->latest('published_at')
        ->limit($section->item_count ?? 10)
        ->get()
        ->map(fn($s) => $s->toAPIArray($edition))
        ->values();

    $sectionData[] = [
        'type' => 'stories',
        'title' => $section->getTitle($edition),
        'sort_order' => $section->sort_order,
        'items' => $items,
    ];
    continue;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/NewsController.php
git commit -m "feat: handle stories section type in NewsController homepage"
```

---

## Task 11: Create `stories:expire` Console Command

**Files:**
- Create: `app/Console/Commands/ExpireStories.php`
- Modify: `app/Console/Kernel.php`

- [ ] **Step 1: Create the command**

```php
<?php
// app/Console/Commands/ExpireStories.php

namespace App\Console\Commands;

use App\Models\Story;
use Illuminate\Console\Command;

class ExpireStories extends Command
{
    protected $signature = 'stories:expire';
    protected $description = 'Mark published stories as expired when their expires_at has passed';

    public function handle(): int
    {
        $count = Story::where('status', 'published')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update(['status' => 'expired']);

        $this->info("Expired {$count} stories.");
        return self::SUCCESS;
    }
}
```

- [ ] **Step 2: Register in Kernel**

Open `app/Console/Kernel.php` and add inside the `schedule` method:

```php
$schedule->command('stories:expire')->hourly();
```

- [ ] **Step 3: Test the command manually**

```bash
php artisan stories:expire
```

Expected: `Expired 0 stories.` (no published stories with past expiry yet).

- [ ] **Step 4: Commit**

```bash
git add app/Console/Commands/ExpireStories.php app/Console/Kernel.php
git commit -m "feat: add stories:expire command scheduled hourly"
```

---

## Task 12: Frontend — `StoryStrip` Component

**Files:**
- Create: `resources/js/Components/StoryStrip.jsx`

- [ ] **Step 1: Create the component**

```jsx
// resources/js/Components/StoryStrip.jsx
import { useState } from 'react';
import StoryViewer from './StoryViewer';

export default function StoryStrip({ stories = [], title = 'স্টোরিজ' }) {
    const [activeIndex, setActiveIndex] = useState(null);

    if (!stories.length) return null;

    return (
        <>
            <div className="stories-strip bg-gray-900 px-4 py-3 rounded-lg">
                {title && (
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-medium">
                        {title}
                    </p>
                )}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {stories.map((story, index) => (
                        <button
                            key={story.id}
                            onClick={() => setActiveIndex(index)}
                            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
                        >
                            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-yellow-400 via-red-500 to-purple-600">
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-900">
                                    {story.cover_thumbnail ? (
                                        <img
                                            src={story.cover_thumbnail}
                                            alt={story.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                                    )}
                                </div>
                            </div>
                            <span className="text-gray-300 text-[10px] max-w-[70px] text-center line-clamp-1">
                                {story.title}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {activeIndex !== null && (
                <StoryViewer
                    stories={stories}
                    initialIndex={activeIndex}
                    onClose={() => setActiveIndex(null)}
                />
            )}
        </>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/Components/StoryStrip.jsx
git commit -m "feat: add StoryStrip component"
```

---

## Task 13: Frontend — `StoryViewer` Component

**Files:**
- Create: `resources/js/Components/StoryViewer.jsx`

- [ ] **Step 1: Create the component**

```jsx
// resources/js/Components/StoryViewer.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from '@inertiajs/react';

export default function StoryViewer({ stories, initialIndex = 0, onClose }) {
    const [storyIndex, setStoryIndex] = useState(initialIndex);
    const [slideIndex, setSlideIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const currentStory = stories[storyIndex];
    const currentSlide = currentStory?.slides?.[slideIndex];
    const isVideo = currentSlide?.is_video;
    const duration = (currentSlide?.duration ?? 5) * 1000;

    const goNextSlide = useCallback(() => {
        if (slideIndex < (currentStory.slides?.length ?? 0) - 1) {
            setSlideIndex(s => s + 1);
            setProgress(0);
        } else if (storyIndex < stories.length - 1) {
            setStoryIndex(s => s + 1);
            setSlideIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    }, [slideIndex, storyIndex, currentStory, stories.length, onClose]);

    const goPrevSlide = useCallback(() => {
        if (slideIndex > 0) {
            setSlideIndex(s => s - 1);
            setProgress(0);
        } else if (storyIndex > 0) {
            setStoryIndex(s => s - 1);
            setSlideIndex(0);
            setProgress(0);
        }
    }, [slideIndex, storyIndex]);

    // Auto-advance timer for photo slides
    useEffect(() => {
        if (isVideo) return;
        clearInterval(timerRef.current);
        startTimeRef.current = Date.now();
        setProgress(0);

        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const pct = Math.min((elapsed / duration) * 100, 100);
            setProgress(pct);
            if (pct >= 100) {
                clearInterval(timerRef.current);
                goNextSlide();
            }
        }, 50);

        return () => clearInterval(timerRef.current);
    }, [slideIndex, storyIndex, isVideo, duration, goNextSlide]);

    // Keyboard navigation
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'ArrowRight') goNextSlide();
            if (e.key === 'ArrowLeft') goPrevSlide();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [goNextSlide, goPrevSlide, onClose]);

    if (!currentStory || !currentSlide) return null;

    const totalSlides = currentStory.slides?.length ?? 0;

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Story container — mobile-style portrait */}
            <div className="relative w-full max-w-sm h-full max-h-[90vh] bg-black overflow-hidden rounded-lg select-none">

                {/* Progress bars */}
                <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
                    {currentStory.slides?.map((_, i) => (
                        <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-none"
                                style={{
                                    width: i < slideIndex ? '100%' : i === slideIndex ? `${progress}%` : '0%',
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-7 left-3 right-3 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/50">
                            {currentStory.cover_thumbnail ? (
                                <img src={currentStory.cover_thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-white text-xs font-semibold leading-none">{currentStory.title}</p>
                            <p className="text-white/60 text-[10px] mt-0.5">{slideIndex + 1} / {totalSlides}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none p-1">✕</button>
                </div>

                {/* Slide media */}
                <div className="w-full h-full">
                    {isVideo ? (
                        <video
                            key={currentSlide.id}
                            src={currentSlide.media_url}
                            className="w-full h-full object-cover"
                            autoPlay
                            playsInline
                            muted={false}
                            onEnded={goNextSlide}
                        />
                    ) : (
                        <img
                            key={currentSlide.id}
                            src={currentSlide.media_url}
                            alt={currentSlide.text_overlay ?? ''}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                {/* Text overlay + article link */}
                <div className="absolute bottom-6 left-4 right-4 z-20">
                    {currentSlide.text_overlay && (
                        <p className="text-white text-sm font-semibold mb-3 leading-snug drop-shadow">
                            {currentSlide.text_overlay}
                        </p>
                    )}
                    {currentSlide.linked_article && (
                        <Link
                            href={`/${currentSlide.linked_article.category_slug}/${currentSlide.linked_article.slug}`}
                            className="inline-block bg-white/20 border border-white/40 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full hover:bg-white/30 transition-colors"
                        >
                            পুরো খবর পড়ুন →
                        </Link>
                    )}
                </div>

                {/* Tap zones */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={goPrevSlide} />
                <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={goNextSlide} />

                {/* Story navigation arrows (desktop) */}
                {storyIndex > 0 && (
                    <button
                        onClick={() => { setStoryIndex(s => s - 1); setSlideIndex(0); setProgress(0); }}
                        className="absolute left-[-48px] top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-2xl hidden md:block"
                    >‹</button>
                )}
                {storyIndex < stories.length - 1 && (
                    <button
                        onClick={() => { setStoryIndex(s => s + 1); setSlideIndex(0); setProgress(0); }}
                        className="absolute right-[-48px] top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-2xl hidden md:block"
                    >›</button>
                )}
            </div>

            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/Components/StoryViewer.jsx
git commit -m "feat: add StoryViewer full-screen overlay with auto-advance and keyboard nav"
```

---

## Task 14: Frontend — Public `Stories.jsx` Page

**Files:**
- Create: `resources/js/Pages/Stories.jsx`

- [ ] **Step 1: Create the page**

```jsx
// resources/js/Pages/Stories.jsx
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Header from '@/Components/Header';
import Footer from '@/Components/Footer';
import StoryViewer from '@/Components/StoryViewer';

export default function Stories({ stories, edition = 'bn' }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const items = stories.data ?? stories;

    return (
        <>
            <Head title={edition === 'en' ? 'All Stories' : 'সকল স্টোরিজ'} />
            <Header />

            <main className="min-h-screen bg-gray-950 py-8 px-4">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-white text-2xl font-bold mb-1">
                        {edition === 'en' ? 'All Stories' : 'সকল স্টোরিজ'}
                    </h1>
                    <p className="text-gray-400 text-sm mb-8">
                        {edition === 'en' ? 'Stories' : 'স্টোরিজ'}
                    </p>

                    {items.length === 0 ? (
                        <p className="text-gray-500 text-center py-20">
                            {edition === 'en' ? 'No stories yet.' : 'এখনো কোনো স্টোরি নেই।'}
                        </p>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                            {items.map((story, index) => (
                                <button
                                    key={story.id}
                                    onClick={() => setActiveIndex(index)}
                                    className="group cursor-pointer text-left"
                                >
                                    <div className="aspect-[9/16] rounded-xl overflow-hidden relative bg-gray-800">
                                        {story.cover ? (
                                            <img
                                                src={story.cover}
                                                alt={story.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-700" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                                            {story.slides_count}{edition === 'en' ? '' : 'টি'}
                                        </div>
                                        <p className="absolute bottom-2 left-2 right-2 text-white text-[10px] font-semibold leading-tight line-clamp-2">
                                            {story.title}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {activeIndex !== null && (
                <StoryViewer
                    stories={items}
                    initialIndex={activeIndex}
                    onClose={() => setActiveIndex(null)}
                />
            )}
        </>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/Pages/Stories.jsx
git commit -m "feat: add public Stories page with 9:16 grid and viewer"
```

---

## Task 15: Frontend — Admin Stories Pages

**Files:**
- Create: `resources/js/features/admin/pages/stories/Index.jsx`
- Create: `resources/js/features/admin/pages/stories/Form.jsx`
- Create: `resources/js/features/admin/pages/stories/SlideModal.jsx`

- [ ] **Step 1: Create `Index.jsx`**

```jsx
// resources/js/features/admin/pages/stories/Index.jsx
import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

const STATUS_TABS = [
    { key: '', label: 'সব' },
    { key: 'published', label: 'প্রকাশিত' },
    { key: 'draft', label: 'ড্রাফট' },
    { key: 'expired', label: 'মেয়াদোত্তীর্ণ' },
    { key: 'archived', label: 'আর্কাইভ' },
];

const STATUS_COLORS = {
    published: 'bg-green-500/10 text-green-400',
    draft: 'bg-yellow-500/10 text-yellow-400',
    expired: 'bg-red-500/10 text-red-400',
    archived: 'bg-gray-500/10 text-gray-400',
};

const STATUS_LABELS = {
    published: 'প্রকাশিত',
    draft: 'ড্রাফট',
    expired: 'মেয়াদোত্তীর্ণ',
    archived: 'আর্কাইভ',
};

export default function StoriesIndex({ stories, filters, can }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (params) => {
        router.get(route('admin.stories'), { ...filters, ...params }, { preserveState: true });
    };

    const handlePublish = (story) => {
        if (!confirm('এই স্টোরি প্রকাশ করবেন?')) return;
        router.post(route('admin.stories.publish', story.id), {}, { preserveScroll: true });
    };

    const handleRestore = (story) => {
        if (!confirm('এই স্টোরি পুনরায় প্রকাশ করবেন?')) return;
        router.post(route('admin.stories.restore', story.id), {}, { preserveScroll: true });
    };

    const handleDelete = (story) => {
        if (!confirm('এই স্টোরি মুছে ফেলবেন?')) return;
        router.delete(route('admin.stories.destroy', story.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title="স্টোরিজ ম্যানেজমেন্ট" />
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-white">স্টোরিজ ম্যানেজমেন্ট</h1>
                    {can.create && (
                        <Link href={route('admin.stories.create')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                            + নতুন স্টোরি
                        </Link>
                    )}
                </div>

                {/* Status tabs */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {STATUS_TABS.map(tab => (
                        <button key={tab.key}
                            onClick={() => applyFilter({ status: tab.key, page: 1 })}
                            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                                (filters.status ?? '') === tab.key
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyFilter({ search, page: 1 })}
                    placeholder="স্টোরি খুঁজুন..."
                    className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 mb-4 outline-none focus:border-indigo-500"
                />

                {/* Stories list */}
                <div className="space-y-3">
                    {stories.data?.length === 0 && (
                        <p className="text-gray-500 text-center py-12">কোনো স্টোরি নেই।</p>
                    )}
                    {stories.data?.map(story => (
                        <div key={story.id} className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-700">
                                {story.cover_thumbnail
                                    ? <img src={story.cover_thumbnail} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-semibold truncate">{story.title_bn}</p>
                                <p className="text-gray-400 text-xs mt-0.5">
                                    {story.slides_count}টি স্লাইড · {story.creator_name}
                                    {story.expires_at && ` · মেয়াদ: ${new Date(story.expires_at).toLocaleDateString('bn-BD')}`}
                                </p>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[story.status]}`}>
                                {STATUS_LABELS[story.status]}
                            </span>
                            <div className="flex gap-2">
                                <Link href={route('admin.stories.edit', story.id)}
                                    className="text-gray-400 hover:text-white text-xs px-3 py-1.5 bg-gray-700 rounded-lg transition-colors">
                                    সম্পাদনা
                                </Link>
                                {can.publish && story.status === 'draft' && (
                                    <button onClick={() => handlePublish(story)}
                                        className="text-green-400 text-xs px-3 py-1.5 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors">
                                        প্রকাশ
                                    </button>
                                )}
                                {can.restore && story.status === 'expired' && (
                                    <button onClick={() => handleRestore(story)}
                                        className="text-blue-400 text-xs px-3 py-1.5 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                                        পুনরায় প্রকাশ
                                    </button>
                                )}
                                <button onClick={() => handleDelete(story)}
                                    className="text-red-400 text-xs px-3 py-1.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">
                                    মুছুন
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
```

- [ ] **Step 2: Create `SlideModal.jsx`**

```jsx
// resources/js/features/admin/pages/stories/SlideModal.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function SlideModal({ storyId, slide = null, onClose, onSaved }) {
    const isEdit = !!slide;
    const [form, setForm] = useState({
        media_id: slide?.media_id ?? '',
        text_overlay_bn: slide?.text_overlay_bn ?? '',
        text_overlay_en: slide?.text_overlay_en ?? '',
        linked_article_id: slide?.linked_article?.id ?? '',
        duration: slide?.duration ?? 5,
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);

        const url = isEdit
            ? route('admin.stories.slides.update', { story: storyId, slide: slide.id })
            : route('admin.stories.slides.store', { story: storyId });

        const method = isEdit ? 'put' : 'post';

        router[method](url, form, {
            onSuccess: () => { onSaved(); onClose(); },
            onFinish: () => setSaving(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-white font-semibold">{isEdit ? 'স্লাইড সম্পাদনা' : 'নতুন স্লাইড'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">মিডিয়া আইডি (ছবি / ভিডিও) *</label>
                        <input
                            type="number"
                            required
                            value={form.media_id}
                            onChange={e => setForm(f => ({ ...f, media_id: e.target.value }))}
                            placeholder="media.id"
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        />
                        <p className="text-gray-500 text-xs mt-1">মিডিয়া লাইব্রেরি থেকে আইডি কপি করুন</p>
                    </div>

                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">টেক্সট ওভারলে (বাংলা)</label>
                        <input
                            type="text"
                            value={form.text_overlay_bn}
                            onChange={e => setForm(f => ({ ...f, text_overlay_bn: e.target.value }))}
                            placeholder="ছবির উপর টেক্সট..."
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">টেক্সট ওভারলে (ইংরেজি)</label>
                        <input
                            type="text"
                            value={form.text_overlay_en}
                            onChange={e => setForm(f => ({ ...f, text_overlay_en: e.target.value }))}
                            placeholder="Text overlay in English..."
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">সংযুক্ত নিবন্ধ আইডি (ঐচ্ছিক)</label>
                        <input
                            type="number"
                            value={form.linked_article_id}
                            onChange={e => setForm(f => ({ ...f, linked_article_id: e.target.value }))}
                            placeholder="article.id (optional)"
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="text-gray-400 text-xs mb-1 block">সময়কাল (সেকেন্ড) — শুধু ছবির জন্য</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={form.duration}
                            onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 bg-gray-700 text-gray-300 text-sm py-2.5 rounded-lg hover:bg-gray-600 transition-colors">
                            বাতিল
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 bg-indigo-600 text-white text-sm py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Create `Form.jsx`**

```jsx
// resources/js/features/admin/pages/stories/Form.jsx
import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import SlideModal from './SlideModal';

export default function StoryForm({ story, can }) {
    const isEdit = !!story;
    const [form, setForm] = useState({
        title_bn: story?.title_bn ?? '',
        title_en: story?.title_en ?? '',
        cover_media_id: story?.cover_media_id ?? '',
        edition: story?.edition ?? 'bn',
        expires_at: story?.expires_at ? story.expires_at.substring(0, 16) : '',
    });
    const [slides, setSlides] = useState(story?.slides ?? []);
    const [showSlideModal, setShowSlideModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        if (isEdit) {
            router.put(route('admin.stories.update', story.id), form, {
                onFinish: () => setSaving(false),
            });
        } else {
            router.post(route('admin.stories.store'), form, {
                onFinish: () => setSaving(false),
            });
        }
    };

    const handlePublish = () => {
        if (!confirm('এই স্টোরি প্রকাশ করবেন?')) return;
        router.post(route('admin.stories.publish', story.id));
    };

    const handleDeleteSlide = (slide) => {
        if (!confirm('এই স্লাইড মুছবেন?')) return;
        router.delete(route('admin.stories.slides.destroy', { story: story.id, slide: slide.id }), {
            onSuccess: () => setSlides(s => s.filter(sl => sl.id !== slide.id)),
            preserveScroll: true,
        });
    };

    const refreshSlides = () => {
        router.reload({ only: ['story'], onSuccess: (page) => {
            setSlides(page.props.story?.slides ?? []);
        }});
    };

    return (
        <>
            <Head title={isEdit ? 'স্টোরি সম্পাদনা' : 'নতুন স্টোরি'} />
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-xl font-bold text-white mb-6">
                    {isEdit ? 'স্টোরি সম্পাদনা' : 'নতুন স্টোরি'}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: metadata */}
                    <div className="space-y-4">
                        <div className="bg-gray-800 rounded-xl p-4 space-y-4">
                            <h2 className="text-gray-300 text-sm font-semibold">স্টোরি তথ্য</h2>

                            <div>
                                <label className="text-gray-400 text-xs mb-1 block">শিরোনাম (বাংলা) *</label>
                                <input type="text" value={form.title_bn}
                                    onChange={e => setForm(f => ({ ...f, title_bn: e.target.value }))}
                                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-gray-400 text-xs mb-1 block">শিরোনাম (ইংরেজি)</label>
                                <input type="text" value={form.title_en}
                                    onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))}
                                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-gray-400 text-xs mb-1 block">কভার মিডিয়া আইডি</label>
                                <input type="number" value={form.cover_media_id}
                                    onChange={e => setForm(f => ({ ...f, cover_media_id: e.target.value }))}
                                    placeholder="media.id"
                                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-gray-400 text-xs mb-1 block">ভাষা</label>
                                <select value={form.edition}
                                    onChange={e => setForm(f => ({ ...f, edition: e.target.value }))}
                                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500">
                                    <option value="bn">বাংলা</option>
                                    <option value="en">English</option>
                                    <option value="both">উভয়</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-gray-400 text-xs mb-1 block">মেয়াদ শেষ (ঐচ্ছিক)</label>
                                <input type="datetime-local" value={form.expires_at}
                                    onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        <button onClick={handleSave} disabled={saving}
                            className="w-full bg-gray-700 text-gray-200 text-sm py-2.5 rounded-xl hover:bg-gray-600 transition-colors disabled:opacity-50">
                            {saving ? 'সংরক্ষণ হচ্ছে...' : 'ড্রাফট সংরক্ষণ'}
                        </button>

                        {can.publish && isEdit && story.status === 'draft' && (
                            <button onClick={handlePublish}
                                className="w-full bg-green-600 text-white text-sm py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                                প্রকাশ করুন
                            </button>
                        )}
                    </div>

                    {/* Right: slide builder */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-gray-300 text-sm font-semibold">স্লাইডসমূহ</h2>
                                {isEdit && (
                                    <button onClick={() => { setEditingSlide(null); setShowSlideModal(true); }}
                                        className="text-indigo-400 text-xs hover:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors">
                                        + স্লাইড যোগ করুন
                                    </button>
                                )}
                            </div>

                            {!isEdit && (
                                <p className="text-gray-500 text-sm text-center py-8">
                                    প্রথমে ড্রাফট সংরক্ষণ করুন, তারপর স্লাইড যোগ করুন।
                                </p>
                            )}

                            <div className="space-y-2">
                                {slides.map((slide, i) => (
                                    <div key={slide.id} className="bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                                        <span className="text-gray-500 text-xs w-5">{i + 1}</span>
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-600 flex-shrink-0">
                                            {slide.media_thumbnail
                                                ? <img src={slide.media_thumbnail} alt="" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                                                    {slide.is_video ? '▶' : '🖼'}
                                                  </div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs font-medium">
                                                স্লাইড {i + 1} · {slide.is_video ? 'ভিডিও' : `ছবি · ${slide.duration}সে`}
                                            </p>
                                            {slide.text_overlay && (
                                                <p className="text-gray-400 text-xs truncate">{slide.text_overlay}</p>
                                            )}
                                        </div>
                                        <button onClick={() => { setEditingSlide(slide); setShowSlideModal(true); }}
                                            className="text-gray-400 hover:text-white text-xs">✎</button>
                                        <button onClick={() => handleDeleteSlide(slide)}
                                            className="text-red-400 hover:text-red-300 text-xs">✕</button>
                                    </div>
                                ))}

                                {isEdit && slides.length === 0 && (
                                    <p className="text-gray-500 text-sm text-center py-6">
                                        এখনো কোনো স্লাইড নেই। উপরের বাটন দিয়ে যোগ করুন।
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showSlideModal && (
                <SlideModal
                    storyId={story.id}
                    slide={editingSlide}
                    onClose={() => { setShowSlideModal(false); setEditingSlide(null); }}
                    onSaved={refreshSlides}
                />
            )}
        </>
    );
}
```

- [ ] **Step 4: Commit**

```bash
git add resources/js/features/admin/pages/stories/Index.jsx resources/js/features/admin/pages/stories/Form.jsx resources/js/features/admin/pages/stories/SlideModal.jsx
git commit -m "feat: add admin Stories pages (Index, Form, SlideModal)"
```

---

## Task 16: Wire `StoryStrip` into Homepage

**Files:**
- Modify: `resources/js/Pages/Home.jsx`

- [ ] **Step 1: Import StoryStrip in Home.jsx**

At the top of `resources/js/Pages/Home.jsx`, add:

```js
import StoryStrip from '@/Components/StoryStrip';
```

- [ ] **Step 2: Find the section renderer in Home.jsx**

Locate the block that maps over `homepageData` sections and renders each section type. It will have conditions like:

```jsx
{section.type === 'videos' && <VideosSection ... />}
{section.type === 'category' && <CategorySection ... />}
```

- [ ] **Step 3: Add the stories section renderer**

Add alongside the existing section types:

```jsx
{section.type === 'stories' && (
    <div key={section.sort_order} className="my-6">
        <StoryStrip stories={section.items} title={section.title} />
    </div>
)}
```

- [ ] **Step 4: Build the frontend assets**

```bash
npm run build
```

Expected: Build completes with no errors.

- [ ] **Step 5: Commit**

```bash
git add resources/js/Pages/Home.jsx
git commit -m "feat: render StoryStrip in homepage sections"
```

---

## Verification Checklist

After all tasks are complete, verify end-to-end:

- [ ] `php artisan migrate:status` — stories and story_slides rows show as "Ran"
- [ ] `php artisan db:seed --class=RolePermissionSeeder` — runs without error, 6 stories.* permissions exist
- [ ] `php artisan route:list --name=stories` — all 12 routes appear
- [ ] Log in as reporter → `/admin/stories/create` → create story + slides → Publish button absent
- [ ] Log in as editor → visit draft story → Publish button visible → publish → story appears on `/stories`
- [ ] Visit `/stories` — 9:16 grid renders, clicking opens StoryViewer overlay
- [ ] StoryViewer: progress bars animate, photo slides auto-advance, video plays and advances on end, Escape closes, left/right taps work
- [ ] Add `stories` type section in HomepageSection admin → StoryStrip renders on homepage at correct position
- [ ] Set story expiry 1 minute in future → `php artisan stories:expire` → story disappears from public → visible in admin as expired → restore with editor account → story reappears on `/stories`
- [ ] `npm run build` — no TypeScript/build errors
