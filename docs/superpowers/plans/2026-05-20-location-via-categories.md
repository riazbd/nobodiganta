# Location-via-Categories Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the separate division/district/upazila location picker in WriteNews with pure category-based location tagging, where selecting a child category auto-selects all ancestors, and string columns are auto-derived on the backend.

**Architecture:** The `division`, `district`, `upazila` string columns on `articles` become a server-side derived cache — written automatically from whichever location categories (`division-*`, `district-*`, `upazila-*`) are present in the selected categories. The public `/saradesh` pages and admin filters are untouched because they query string columns, which remain accurate. Category selection gains ancestor auto-expansion both on the frontend (UX) and backend (safety net), so an article tagged `upazila-tongi` automatically also appears under `district-gazipur` and `division-dhaka` queries.

**Tech Stack:** Laravel 11 (PHP 8.2), React 18, Inertia.js, Tailwind CSS

---

## File Map

| File | Change |
|---|---|
| `app/Http/Controllers/ArticleController.php` | Remove location validation; add `expandCategoriesWithAncestors()`; replace `syncLocationCategory()` + `deriveLocationFromCategories()` with `deriveAndSyncLocation()`; update `store()`, `update()`, `edit()` |
| `resources/js/features/admin/pages/content/WriteNews.jsx` | Remove Location SidebarSection; remove location state/effects/form fields; update `toggleCategory` to auto-select ancestor categories |
| `database/seeders/DatabaseSeeder.php` | No change needed |
| Public `LocationController`, `Location.jsx`, `AllNews.jsx` | No change needed |

---

## Task 1: Backend — Rewrite category sync + auto-derive location strings

**Files:**
- Modify: `app/Http/Controllers/ArticleController.php`

### Step 1: Remove `syncLocationCategory()` and `deriveLocationFromCategories()` — replace with two focused methods

In `ArticleController.php`, delete lines 631–696 (both old methods) and replace with:

```php
    private function expandCategoriesWithAncestors(array $categoryIds): array
    {
        if (empty($categoryIds)) return [];

        $allIds = array_values(array_unique($categoryIds));
        $toProcess = $allIds;

        while (!empty($toProcess)) {
            $parentIds = Category::whereIn('id', $toProcess)
                ->whereNotNull('parent_id')
                ->pluck('parent_id')
                ->unique()
                ->toArray();

            $newParents = array_values(array_diff($parentIds, $allIds));
            if (empty($newParents)) break;

            $allIds = array_values(array_unique(array_merge($allIds, $newParents)));
            $toProcess = $newParents;
        }

        return $allIds;
    }

    private function deriveAndSyncLocation(Article $article, array $expandedCategoryIds): void
    {
        if (empty($expandedCategoryIds)) {
            $article->update(['division' => null, 'district' => null, 'upazila' => null]);
            return;
        }

        $locationCats = Category::whereIn('id', $expandedCategoryIds)
            ->where(function ($q) {
                $q->where('slug', 'like', 'division-%')
                  ->orWhere('slug', 'like', 'district-%')
                  ->orWhere('slug', 'like', 'upazila-%');
            })
            ->get(['slug']);

        $division = null;
        $district = null;
        $upazila  = null;

        foreach ($locationCats as $cat) {
            if (str_starts_with($cat->slug, 'upazila-')) {
                $upazila = substr($cat->slug, 8);
            } elseif (str_starts_with($cat->slug, 'district-')) {
                $district = substr($cat->slug, 9);
            } elseif (str_starts_with($cat->slug, 'division-')) {
                $division = substr($cat->slug, 9);
            }
        }

        $article->update([
            'division' => $division,
            'district' => $district,
            'upazila'  => $upazila,
        ]);
    }
```

- [ ] Open `app/Http/Controllers/ArticleController.php`
- [ ] Delete the `syncLocationCategory()` method body (lines 631–651)
- [ ] Delete the `deriveLocationFromCategories()` method body (lines 653–696)
- [ ] Paste both new methods above (`expandCategoriesWithAncestors` and `deriveAndSyncLocation`) in their place

---

### Step 2: Update `syncCategoryPivot()` to accept the already-expanded ID list

Replace the current `syncCategoryPivot()` (lines 619–629) with:

```php
    private function syncCategoryPivot(Article $article, array $expandedIds, int $primaryId): void
    {
        $pivotData = [];
        foreach ($expandedIds as $i => $catId) {
            $pivotData[$catId] = [
                'is_primary' => $catId === $primaryId,
                'sort_order' => $catId === $primaryId ? 0 : $i + 1,
            ];
        }
        $article->categories()->sync($pivotData);
    }
```

- [ ] Replace `syncCategoryPivot()` with the version above

---

### Step 3: Update `store()` — remove location validation + fields, wire new methods

**Remove** these three lines from the `$request->validate([...])` array in `store()`:

```php
            'division' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'upazila' => 'nullable|string|max:100',
```

**Remove** these three lines from the `Article::create([...])` call:

```php
            'division' => $validated['division'] ?? null,
            'district' => $validated['district'] ?? null,
            'upazila' => $validated['upazila'] ?? null,
```

**Replace** the two method calls after `Article::create()`:

```php
        // OLD — delete these two lines:
        $this->syncCategoryPivot($article, $categoryIds, $primaryId);
        $this->syncLocationCategory($article, $validated);

        // NEW — replace with these three lines:
        $expandedIds = $this->expandCategoriesWithAncestors($categoryIds);
        $this->syncCategoryPivot($article, $expandedIds, $primaryId);
        $this->deriveAndSyncLocation($article, $expandedIds);
```

- [ ] Remove the three location validation lines from `store()`
- [ ] Remove the three location fields from `Article::create()` in `store()`
- [ ] Replace the old two-call block with the new three-call block in `store()`

---

### Step 4: Update `update()` — same changes as store()

**Remove** from `$request->validate([...])` in `update()`:

```php
            'division' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'upazila' => 'nullable|string|max:100',
```

**Remove** from `$article->update([...])`:

```php
            'division' => $validated['division'] ?? null,
            'district' => $validated['district'] ?? null,
            'upazila' => $validated['upazila'] ?? null,
```

**Replace** the two calls after `$article->update()`:

```php
        // OLD — delete these two lines:
        $this->syncCategoryPivot($article, $categoryIds, $primaryId);
        $this->syncLocationCategory($article, $validated);

        // NEW — replace with these three lines:
        $expandedIds = $this->expandCategoriesWithAncestors($categoryIds);
        $this->syncCategoryPivot($article, $expandedIds, $primaryId);
        $this->deriveAndSyncLocation($article, $expandedIds);
```

- [ ] Remove the three location validation lines from `update()`
- [ ] Remove the three location fields from `$article->update()` in `update()`
- [ ] Replace the old two-call block with the new three-call block in `update()`

---

### Step 5: Update `edit()` — remove location fields from returned article data

In `edit()`, find the returned article array and remove:

```php
                'division' => $article->division,
                'district' => $article->district,
                'upazila' => $article->upazila,
```

- [ ] Remove those three lines from the `edit()` return array

---

### Step 6: Verify the controller compiles

Run:
```bash
php artisan route:list --name=admin.news
```

Expected: the route list prints without PHP errors.

- [ ] Run the command and confirm no errors

---

### Step 7: Commit

```bash
git add app/Http/Controllers/ArticleController.php
git commit -m "refactor: derive location strings from categories, auto-expand ancestors in pivot"
```

- [ ] Commit

---

## Task 2: Frontend — Remove location picker, add ancestor auto-select in category tree

**Files:**
- Modify: `resources/js/features/admin/pages/content/WriteNews.jsx`

### Step 1: Remove location-related imports and state

**In the import at line 6**, remove `MapPin` from the lucide-react import:

```js
// Before:
import {
  Save, Send, Eye, Image as ImageIcon, X, Plus, Type, Tag, FileText,
  Settings, ChevronRight, Newspaper, Globe, Clock, CheckCircle,
  FolderTree, Trash2, Languages, Loader2, Video, Users, Search, Target, MapPin
} from 'lucide-react';

// After:
import {
  Save, Send, Eye, Image as ImageIcon, X, Plus, Type, Tag, FileText,
  Settings, ChevronRight, Newspaper, Globe, Clock, CheckCircle,
  FolderTree, Trash2, Languages, Loader2, Video, Users, Search, Target
} from 'lucide-react';
```

**Delete the four location state lines (lines 77–80):**

```js
// DELETE these four lines:
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState(null);
```

**Delete the three fetch functions (lines 82–107):**

```js
// DELETE fetchDivisions, fetchDistricts, fetchUpazilas functions entirely
```

**Delete the `fetchDivisions` useEffect (line 109):**

```js
// DELETE:
  useEffect(() => { fetchDivisions(); }, []);
```

**Delete the `divisions` + `form.data.division` useEffect (lines 234–254):**

```js
// DELETE the entire useEffect that starts with:
  useEffect(() => {
    if (divisions.length > 0 && form.data.division) {
```

- [ ] Remove `MapPin` from the lucide-react import
- [ ] Delete the four location state variables
- [ ] Delete `fetchDivisions`, `fetchDistricts`, `fetchUpazilas` functions
- [ ] Delete the `useEffect(() => { fetchDivisions(); }, [])` line
- [ ] Delete the `useEffect` that watches `divisions` and `form.data.division`

---

### Step 2: Remove location fields from the form initial state

In the `useForm({...})` call (around line 132), remove:

```js
    division: '',
    district: '',
    upazila: '',
```

- [ ] Remove those three lines from `useForm({...})`

---

### Step 3: Remove location fields from the article edit `useEffect`

In the `useEffect` that calls `form.setData({...})` when `article` exists (around line 182), remove:

```js
        division: article.division || '',
        district: article.district || '',
        upazila: article.upazila || '',
```

- [ ] Remove those three lines from the edit `useEffect`

---

### Step 4: Update `toggleCategory` to auto-select all ancestors when checking

Replace the `toggleCategory` function inside `renderCategoryRow` (currently lines 476–485) with:

```js
    const toggleCategory = () => {
      if (isChecked) {
        const newCategories = form.data.categories.filter(id => id !== cat.id);
        let newPrimary = form.data.primaryCategory;
        if (isPrimary) newPrimary = newCategories.length > 0 ? String(newCategories[0]) : '';
        form.setData({ ...form.data, categories: newCategories, primaryCategory: newPrimary });
      } else {
        // Collect this category + all ancestors by walking up parentId chain
        const newCategories = [...form.data.categories];
        if (!newCategories.includes(cat.id)) newCategories.push(cat.id);

        let parentId = cat.parentId;
        while (parentId) {
          if (!newCategories.includes(parentId)) newCategories.push(parentId);
          const parent = categories.find(c => c.id === parentId);
          parentId = parent?.parentId ?? null;
        }

        let newPrimary = form.data.primaryCategory;
        if (!newPrimary) newPrimary = String(cat.id);

        const isOpinion = cat.slug === 'opinion' || cat.nameBn === 'মতামত';
        const newArticleType = isOpinion ? 'opinion' : form.data.articleType;

        form.setData({ ...form.data, categories: newCategories, primaryCategory: newPrimary, articleType: newArticleType });
      }
    };
```

- [ ] Replace the old `toggleCategory` with the new version above

---

### Step 5: Remove the Location SidebarSection from the JSX

Delete the entire `<SidebarSection>` block for Location (lines 986–1062):

```jsx
// DELETE this entire block:
          <SidebarSection title={lang === 'bn' ? 'অবস্থান (Location)' : 'Location'} icon={MapPin} defaultOpen={false}>
            ...
          </SidebarSection>
```

- [ ] Delete the Location SidebarSection

---

### Step 6: Verify no broken references remain

Search for any remaining references to `divisions`, `districts`, `upazilas`, `fetchDivisions`, `MapPin`, `form.data.division` inside `WriteNews.jsx`. There should be none.

Run:
```bash
npx eslint resources/js/features/admin/pages/content/WriteNews.jsx --no-eslintrc -c "{\"rules\":{\"no-undef\":\"error\"}}" 2>&1 | head -30
```

Or just build:
```bash
npm run build 2>&1 | tail -20
```

Expected: no errors referencing `divisions`, `districts`, `MapPin`, `fetchDivisions`.

- [ ] Run the build check and confirm no errors

---

### Step 7: Commit

```bash
git add resources/js/features/admin/pages/content/WriteNews.jsx
git commit -m "feat: remove location picker from WriteNews; auto-select ancestor categories on check"
```

- [ ] Commit

---

## Task 3: Backfill — Re-derive location strings for all existing articles

Existing articles may have string columns set from old manual picker, or have location categories in the pivot but stale strings. This one-time command syncs everything.

**Files:**
- Create: `app/Console/Commands/BackfillArticleLocations.php`

### Step 1: Create the Artisan command

```php
<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Console\Command;

class BackfillArticleLocations extends Command
{
    protected $signature = 'articles:backfill-locations {--dry-run : Show what would change without saving}';
    protected $description = 'Re-derive division/district/upazila from location categories on each article';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $updated = 0;
        $skipped = 0;

        Article::with(['categories' => function ($q) {
            $q->where(function ($q2) {
                $q2->where('slug', 'like', 'division-%')
                   ->orWhere('slug', 'like', 'district-%')
                   ->orWhere('slug', 'like', 'upazila-%');
            });
        }])->chunkById(200, function ($articles) use ($dryRun, &$updated, &$skipped) {
            foreach ($articles as $article) {
                $division = null;
                $district = null;
                $upazila  = null;

                foreach ($article->categories as $cat) {
                    if (str_starts_with($cat->slug, 'upazila-')) {
                        $upazila = substr($cat->slug, 8);
                    } elseif (str_starts_with($cat->slug, 'district-')) {
                        $district = substr($cat->slug, 9);
                    } elseif (str_starts_with($cat->slug, 'division-')) {
                        $division = substr($cat->slug, 9);
                    }
                }

                $changed = $article->division !== $division
                    || $article->district !== $district
                    || $article->upazila  !== $upazila;

                if (!$changed) { $skipped++; continue; }

                $this->line("Article #{$article->id}: division={$division} district={$district} upazila={$upazila}");

                if (!$dryRun) {
                    $article->update([
                        'division' => $division,
                        'district' => $district,
                        'upazila'  => $upazila,
                    ]);
                }
                $updated++;
            }
        });

        $this->info("Done. Updated: {$updated}, unchanged: {$skipped}" . ($dryRun ? ' (dry run)' : ''));
        return 0;
    }
}
```

- [ ] Create `app/Console/Commands/BackfillArticleLocations.php` with the content above

---

### Step 2: Dry-run to preview changes

```bash
php artisan articles:backfill-locations --dry-run
```

Expected: lists articles whose string columns differ from what their categories imply.

- [ ] Run dry-run and review output

---

### Step 3: Run the real backfill

```bash
php artisan articles:backfill-locations
```

Expected: `Done. Updated: N, unchanged: M` with no errors.

- [ ] Run the backfill

---

### Step 4: Commit

```bash
git add app/Console/Commands/BackfillArticleLocations.php
git commit -m "feat: add artisan command to backfill article location strings from categories"
```

- [ ] Commit

---

## Task 4: Smoke test — end-to-end verification

No new files. Manual + quick CLI checks.

### Step 1: Verify article create with location category

1. Open `/admin/news/write`
2. In the Categories section, expand **সারাদেশ → ঢাকা বিভাগ → গাজীপুর জেলা → শ্রীপুর উপজেলা**
3. Check **শ্রীপুর উপজেলা**
4. Verify that **গাজীপুর জেলা**, **ঢাকা বিভাগ**, and **সারাদেশ** are also automatically checked
5. Save the article as draft

- [ ] Confirm ancestor auto-check works in the UI

---

### Step 2: Verify string columns are derived correctly

```bash
php artisan tinker --execute="
\$a = App\Models\Article::latest()->first();
echo 'division=' . \$a->division . ' district=' . \$a->district . ' upazila=' . \$a->upazila;
"
```

Expected: `division=dhaka district=gazipur upazila=sreepur` (matching the category you selected).

- [ ] Confirm string columns are populated correctly

---

### Step 3: Verify article appears on the public location page

Visit `/saradesh/dhaka/gazipur/sreepur` — the article should appear.

- [ ] Confirm article appears on the upazila public page
- [ ] Visit `/saradesh/dhaka/gazipur` — same article should appear (district level)
- [ ] Visit `/saradesh/dhaka` — same article should appear (division level)
- [ ] Visit `/saradesh` — same article should appear (country level)

---

### Step 4: Verify editing an article changes location correctly

1. Edit the article — change category from **শ্রীপুর উপজেলা** to a different district, e.g. **নারায়ণগঞ্জ জেলা**
2. Save
3. Run tinker:

```bash
php artisan tinker --execute="
\$a = App\Models\Article::latest()->first();
echo 'division=' . \$a->division . ' district=' . \$a->district . ' upazila=' . \$a->upazila;
"
```

Expected: `district=narayanganj` (old `upazila=sreepur` is gone — no stale categories).

- [ ] Confirm location update clears old values correctly

---

### Step 5: Final commit tag

```bash
git tag location-via-categories-complete
```

- [ ] Tag the completed feature

---

## Self-review checklist

- [x] **Spec coverage:** Location picker removed ✓ | Ancestor auto-select in UI ✓ | Backend derives string columns from categories ✓ | Stale categories fixed (full `sync()` not `syncWithoutDetaching`) ✓ | Backfill for existing data ✓ | Public pages untouched ✓
- [x] **No placeholders:** All code is complete and runnable
- [x] **Type consistency:** `expandCategoriesWithAncestors()` returns `array`, passed to `syncCategoryPivot()` as first arg and `deriveAndSyncLocation()` as second arg — consistent throughout
- [x] **Dead code removed:** `syncLocationCategory()` and `deriveLocationFromCategories()` both deleted
- [x] **Primary category unaffected:** The `$primaryId` check in `syncCategoryPivot` is unchanged — ancestors are added as non-primary (sort_order > 0)
