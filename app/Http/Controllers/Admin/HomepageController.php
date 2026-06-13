<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\HomepageSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HomepageController extends Controller
{
    public function index()
    {
        if (!auth()->user()->hasPermission('system.settings')) abort(403);

        $sections = HomepageSection::with('category')->orderBy('sort_order')->get();
        $categories = Category::whereNull('parent_id')->orderBy('sort_order')->get();

        return Inertia::render('features/admin/pages/homepage/HomepageLayout', [
            'sections' => $sections,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('system.settings')) abort(403);

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

        return back()->with('success', 'Section added to homepage');
    }

    public function update(Request $request, HomepageSection $section)
    {
        if (!auth()->user()->hasPermission('system.settings')) abort(403);

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

        return back()->with('success', 'Homepage section updated');
    }

    public function destroy(HomepageSection $section)
    {
        if (!auth()->user()->hasPermission('system.settings')) abort(403);
        $section->delete();
        return back()->with('success', 'Section removed from homepage');
    }

    public function reorder(Request $request)
    {
        if (!auth()->user()->hasPermission('system.settings')) abort(403);

        $orders = $request->input('orders', []);
        DB::transaction(function () use ($orders) {
            foreach ($orders as $id => $order) {
                HomepageSection::where('id', $id)->update(['sort_order' => $order]);
            }
        });

        return back()->with('success', 'Layout reordered');
    }
}
