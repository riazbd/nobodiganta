<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories (for admin)
     */
    public function index()
    {
        if (!auth()->user()->hasPermission('category.view')) {
            abort(403);
        }

        $categories = Category::with(['parent', 'children'])
            ->ordered()
            ->get();

        return Inertia::render('features/admin/pages/categories/CategoryList', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created category (API endpoint)
     */
    public function store(Request $request)
    {
        if (!$request->user()->hasPermission('category.create')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'parent_id' => 'nullable|exists:categories,id',
            'name_bn' => 'nullable|required_if:edition,both,bn|string|max:255',
            'name_en' => 'nullable|required_if:edition,both,en|string|max:255',
            'slug' => 'required|string|unique:categories,slug',
            'description_bn' => 'nullable|string',
            'description_en' => 'nullable|string',
            'meta_description_bn' => 'nullable|string',
            'meta_description_en' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'color_code' => 'nullable|string|max:7',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'edition' => 'required|in:both,bn,en',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['color_code'] = $validated['color'] ?? '#e8001e';

        $category = Category::create($validated);

        if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'success' => true,
                'category' => $category,
            ], 201);
        }

        return redirect()->route('admin.categories')
            ->with('success', 'Category created successfully');
    }

    /**
     * Update the specified category (API endpoint)
     */
    public function update(Request $request, Category $category)
    {
        if (!$request->user()->hasPermission('category.edit')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'parent_id' => 'nullable|exists:categories,id',
            'name_bn' => 'nullable|required_if:edition,both,bn|string|max:255',
            'name_en' => 'nullable|required_if:edition,both,en|string|max:255',
            'slug' => 'required|string|unique:categories,slug,' . $category->id,
            'description_bn' => 'nullable|string',
            'description_en' => 'nullable|string',
            'meta_description_bn' => 'nullable|string',
            'meta_description_en' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
            'color_code' => 'nullable|string|max:7',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'edition' => 'required|in:both,bn,en',
        ]);

        if (isset($validated['color'])) {
            $validated['color_code'] = $validated['color'];
        }

        $oldSlug = $category->slug;
        $category->update($validated);

        // If a location category's slug changed, re-derive string columns on all tagged articles
        if ($this->isLocationCategory($oldSlug) && $oldSlug !== $category->slug) {
            $articles = $category->articles()->with('categories')->get();
            $this->rederiveArticleLocations($articles);
        }

        if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'success' => true,
                'category' => $category,
            ]);
        }

        return redirect()->route('admin.categories')
            ->with('success', 'Category updated successfully');
    }

    /**
     * Remove the specified category (API endpoint)
     */
    public function destroy(Request $request, Category $category)
    {
        if (!$request->user()->hasPermission('category.delete')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($this->isLocationCategory($category->slug)) {
            // Location categories: clear article location data before deleting
            $articleIds = $category->articles()->pluck('articles.id')->toArray();
            $this->clearArticleLocations($articleIds);
        } else {
            // Editorial categories: block deletion if articles are tagged
            if ($category->articles()->exists()) {
                if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cannot delete category with existing articles',
                    ], 422);
                }
                return back()->withErrors(['category' => 'Cannot delete category with existing articles']);
            }
        }

        $category->delete();

        if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully',
            ]);
        }

        return redirect()->route('admin.categories')
            ->with('success', 'Category deleted successfully');
    }

    /**
     * Get all categories for public display (API endpoint)
     */
    public function publicIndex(Request $request)
    {
        $edition = $request->get('edition', 'bn');

        // Load all active categories in one query, build recursive tree in PHP
        $all = Category::active()
            ->editorial()
            ->forEdition($edition)
            ->ordered()
            ->get();

        $categories = $this->buildCategoryTree($all, null, $edition);

        return response()->json($categories);
    }

    private function buildCategoryTree($all, $parentId, string $edition): array
    {
        return $all
            ->filter(fn($c) => $c->parent_id === $parentId)
            ->values()
            ->map(fn($c) => [
                'id'             => $c->id,
                'name_bn'        => $c->name_bn,
                'name_en'        => $c->name_en,
                'slug'           => $c->slug,
                'edition'        => $c->edition,
                'description_bn' => $c->getDescription('bn'),
                'description_en' => $c->getDescription('en'),
                'icon'           => $c->icon,
                'color'          => $c->color,
                'children'       => $this->buildCategoryTree($all, $c->id, $edition),
            ])
            ->toArray();
    }

    /**
     * Get all categories for admin (no edition filtering)
     */
    public function adminIndex()
    {
        $categories = Category::withCount('articles')
            ->ordered()
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'parent_id' => $category->parent_id,
                    'name_bn' => $category->name_bn,
                    'name_en' => $category->name_en,
                    'slug' => $category->slug,
                    'edition' => $category->edition,
                    'is_active' => $category->is_active,
                    'color' => $category->color,
                    'description_bn' => $category->description_bn,
                    'description_en' => $category->description_en,
                    'article_count' => $category->articles_count,
                ];
            });

        return response()->json($categories);
    }

    /**
     * Reorder categories (update sort_order)
     */
    public function reorder(Request $request)
    {
        if (!$request->user()->hasPermission('category.edit')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.sort_order' => 'required|integer',
        ]);

        foreach ($validated['categories'] as $item) {
            Category::where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Toggle category active status
     */
    public function toggleStatus(Category $category)
    {
        if (!auth()->user()->hasPermission('category.edit')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $becomingInactive = $category->is_active;
        $category->update(['is_active' => !$category->is_active]);

        // Deactivating a location category removes articles from public location pages
        if ($becomingInactive && $this->isLocationCategory($category->slug)) {
            $articleIds = $category->articles()->pluck('articles.id')->toArray();
            $this->clearArticleLocations($articleIds);
        }

        return response()->json([
            'success' => true,
            'is_active' => $category->is_active,
        ]);
    }

    private function isLocationCategory(string $slug): bool
    {
        return str_starts_with($slug, 'division-')
            || str_starts_with($slug, 'district-')
            || str_starts_with($slug, 'upazila-');
    }

    private function clearArticleLocations(array $articleIds): void
    {
        if (empty($articleIds)) return;

        $locationCatIds = Category::where(function ($q) {
            $q->where('slug', 'saradesh')
              ->orWhere('slug', 'like', 'division-%')
              ->orWhere('slug', 'like', 'district-%')
              ->orWhere('slug', 'like', 'upazila-%');
        })->pluck('id')->toArray();

        Article::whereIn('id', $articleIds)->update([
            'division' => null,
            'district' => null,
            'upazila'  => null,
        ]);

        DB::table('article_category')
            ->whereIn('article_id', $articleIds)
            ->whereIn('category_id', $locationCatIds)
            ->delete();
    }

    private function rederiveArticleLocations(\Illuminate\Support\Collection $articles): void
    {
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

            $article->update([
                'division' => $division,
                'district' => $district,
                'upazila'  => $upazila,
            ]);
        }
    }

    /**
     * Bulk update categories
     */
    public function bulkUpdate(Request $request)
    {
        if (!$request->user()->hasPermission('category.edit')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,id',
            'is_active' => 'nullable|boolean',
            'edition' => 'nullable|in:both,bn,en',
        ]);

        $updateData = [];
        if (isset($validated['is_active'])) {
            $updateData['is_active'] = $validated['is_active'];
        }
        if (isset($validated['edition'])) {
            $updateData['edition'] = $validated['edition'];
        }

        // Collect location categories being deactivated before the batch update
        $locationCatsBeingDeactivated = [];
        if (isset($validated['is_active']) && $validated['is_active'] === false) {
            $locationCatsBeingDeactivated = Category::whereIn('id', $validated['category_ids'])
                ->where('is_active', true)
                ->where(function ($q) {
                    $q->where('slug', 'like', 'division-%')
                      ->orWhere('slug', 'like', 'district-%')
                      ->orWhere('slug', 'like', 'upazila-%');
                })
                ->get();
        }

        Category::whereIn('id', $validated['category_ids'])->update($updateData);

        // Clear location data for articles tagged to any of the deactivated location categories
        foreach ($locationCatsBeingDeactivated as $locationCat) {
            $articleIds = $locationCat->articles()->pluck('articles.id')->toArray();
            $this->clearArticleLocations($articleIds);
        }

        return back()->with('success', count($validated['category_ids']) . ' categories updated');
    }
}
