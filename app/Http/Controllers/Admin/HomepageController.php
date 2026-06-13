<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\HomepageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomepageController extends Controller
{
    public function index()
    {
        if (!auth()->user()->hasPermission('homepage.layout.edit')) abort(403);

        return Inertia::render('features/admin/pages/homepage/HomepageLayout', $this->indexProps());
    }

    /**
     * Shared props for the homepage layout page — used by index() and by the
     * mutating endpoints (store/update/destroy/reorder) so they can render the
     * page directly instead of round-tripping through a redirect + GET.
     */
    private function indexProps(): array
    {
        $sections = HomepageSection::with('category')->orderBy('sort_order')->get();

        $allCategories = Category::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'parent_id', 'name_bn', 'name_en']);

        return [
            'sections' => $sections,
            'categories' => $this->flattenCategoryTree($allCategories),
        ];
    }

    /**
     * Flatten the category tree (any depth) into an ordered list with a depth marker
     * and parent_id, so the admin UI can render a collapsible/searchable tree.
     */
    private function flattenCategoryTree($all): array
    {
        $byParent = $all->groupBy(fn($cat) => $cat->parent_id ?? 0);

        $out = [];
        $visit = function (?int $parentId, int $depth) use (&$visit, &$out, $byParent) {
            foreach ($byParent->get($parentId ?? 0, collect()) as $cat) {
                $out[] = [
                    'id'        => $cat->id,
                    'parent_id' => $cat->parent_id,
                    'name_bn'   => $cat->name_bn,
                    'name_en'   => $cat->name_en,
                    'depth'     => $depth,
                ];
                $visit($cat->id, $depth + 1);
            }
        };
        $visit(null, 0);

        return $out;
    }

    /**
     * Articles for the special-feature picker grid — filtered by category
     * (including all descendants) and/or a title search.
     */
    public function articles(Request $request)
    {
        if (!auth()->user()->hasPermission('homepage.layout.edit')) abort(403);

        $query = Article::published()->with('category');

        if ($request->filled('category_id')) {
            $categoryIds = Category::descendantIds((int) $request->category_id);
            $categoryIds[] = (int) $request->category_id;
            $query->whereIn('category_id', $categoryIds);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title_bn', 'like', '%' . $search . '%')
                  ->orWhere('title_en', 'like', '%' . $search . '%');
            });
        }

        $perPage = min((int) $request->input('per_page', 24), 50);
        $articles = $query->orderByDesc('published_at')->paginate($perPage);

        return response()->json([
            'data' => $articles->getCollection()->map(fn($a) => [
                'id'             => $a->id,
                'title_bn'       => $a->title_bn,
                'title_en'       => $a->title_en,
                'excerpt_bn'     => $a->excerpt_bn,
                'excerpt_en'     => $a->excerpt_en,
                'featured_image' => $a->featured_image,
                'category_bn'    => $a->category?->name_bn,
                'category_en'    => $a->category?->name_en,
            ])->values(),
            'current_page' => $articles->currentPage(),
            'has_more'     => $articles->hasMorePages(),
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('homepage.layout.edit')) abort(403);

        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'type'        => 'required|in:category,special_feature,videos,stories,trending',
            'layout'      => 'required|string',
            'item_count'  => 'required|integer|min:1|max:20',
            'edition'     => 'required|in:bn,en,both',
            'sort_order'  => 'integer',
            'is_active'   => 'boolean',
            'title_bn'    => 'nullable|string|max:200',
            'title_en'    => 'nullable|string|max:200',
            'config'      => 'nullable|array',
        ]);

        if (empty($validated['sort_order'])) {
            $validated['sort_order'] = (HomepageSection::max('sort_order') ?? 0) + 1;
        }

        if ($validated['type'] === 'special_feature') {
            $validated['edition'] = 'both';
        }

        HomepageSection::create($validated);

        return Inertia::render('features/admin/pages/homepage/HomepageLayout', $this->indexProps());
    }

    public function update(Request $request, HomepageSection $section)
    {
        if (!auth()->user()->hasPermission('homepage.layout.edit')) abort(403);

        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'type'        => 'required|in:category,special_feature,videos,stories,trending',
            'layout'      => 'required|string',
            'item_count'  => 'required|integer|min:1|max:20',
            'edition'     => 'required|in:bn,en,both',
            'sort_order'  => 'integer',
            'is_active'   => 'boolean',
            'title_bn'    => 'nullable|string|max:200',
            'title_en'    => 'nullable|string|max:200',
            'config'      => 'nullable|array',
        ]);

        if ($validated['type'] === 'special_feature') {
            $validated['edition'] = 'both';
        }

        $section->update($validated);

        return Inertia::render('features/admin/pages/homepage/HomepageLayout', $this->indexProps());
    }

    public function destroy(HomepageSection $section)
    {
        if (!auth()->user()->hasPermission('homepage.layout.edit')) abort(403);
        $section->delete();
        return Inertia::render('features/admin/pages/homepage/HomepageLayout', $this->indexProps());
    }

    public function uploadBanner(Request $request)
    {
        if (!auth()->user()->hasPermission('homepage.layout.edit')) abort(403);

        $request->validate([
            'file' => 'required|file|image|max:5120',
        ]);

        $path = $request->file('file')->store('homepage', 'public');

        return response()->json(['url' => '/storage/' . $path]);
    }

    public function deleteBanner(Request $request)
    {
        if (!auth()->user()->hasPermission('homepage.layout.edit')) abort(403);

        $url = $request->input('url');
        $path = preg_replace('#^/storage/#', '', (string) $url);
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }

        return response()->json(['ok' => true]);
    }

    public function reorder(Request $request)
    {
        if (!auth()->user()->hasPermission('homepage.layout.edit')) abort(403);

        $orders = $request->input('orders', []);
        DB::transaction(function () use ($orders) {
            foreach ($orders as $id => $order) {
                HomepageSection::where('id', $id)->update(['sort_order' => $order]);
            }
        });

        return Inertia::render('features/admin/pages/homepage/HomepageLayout', $this->indexProps());
    }
}
