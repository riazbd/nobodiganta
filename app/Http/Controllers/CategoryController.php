<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
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

        $category->update($validated);

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

        // Prevent deletion if category has articles
        if ($category->articles()->exists()) {
            if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with existing articles',
                ], 422);
            }
            return back()->withErrors([
                'category' => 'Cannot delete category with existing articles'
            ]);
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

        $category->update(['is_active' => !$category->is_active]);

        return response()->json([
            'success' => true,
            'is_active' => $category->is_active,
        ]);
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

        Category::whereIn('id', $validated['category_ids'])
            ->update($updateData);

        return back()->with('success', count($validated['category_ids']) . ' categories updated');
    }
}
