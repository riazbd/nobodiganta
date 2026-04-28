<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdController extends Controller
{
    /**
     * Display a listing of ads
     */
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('business.ads.view')) {
            abort(403);
        }

        $query = Ad::query();

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('title_bn', 'like', "%{$request->search}%")
                  ->orWhere('title_en', 'like', "%{$request->search}%")
                  ->orWhere('position', 'like', "%{$request->search}%");
            });
        }

        $ads = $query->orderBy('sort_order')->orderBy('created_at', 'desc')->get();

        return Inertia::render('features/admin/pages/AdsManagement', [
            'ads' => $ads->map(fn($ad) => [
                'id' => $ad->id,
                'title' => $ad->title_bn,
                'titleEn' => $ad->title_en,
                'image' => $ad->image,
                'link' => $ad->link,
                'position' => $ad->position,
                'type' => $ad->type,
                'isActive' => $ad->is_active,
                'impressions' => $ad->impressions,
                'clicks' => $ad->clicks,
                'ctr' => $ad->impressions > 0 ? round(($ad->clicks / $ad->impressions) * 100, 2) : 0,
                'startDate' => $ad->start_date?->format('Y-m-d'),
                'endDate' => $ad->end_date?->format('Y-m-d'),
                'sortOrder' => $ad->sort_order,
                'code' => $ad->code,
            ]),
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Store a newly created ad
     */
    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'titleBn' => 'required|string|max:255',
            'titleEn' => 'required|string|max:255',
            'image' => 'nullable|string',
            'link' => 'nullable|url',
            'position' => 'required|string',
            'type' => 'required|in:image,google_ad,html',
            'code' => 'nullable|string',
            'startDate' => 'nullable|date',
            'endDate' => 'nullable|date|after_or_equal:startDate',
            'isActive' => 'boolean',
            'sortOrder' => 'integer',
        ]);

        Ad::create([
            'title_bn' => $validated['titleBn'],
            'title_en' => $validated['titleEn'],
            'image' => $validated['image'],
            'link' => $validated['link'],
            'position' => $validated['position'],
            'type' => $validated['type'],
            'code' => $validated['code'],
            'start_date' => $validated['startDate'],
            'end_date' => $validated['endDate'],
            'is_active' => $validated['isActive'] ?? true,
            'sort_order' => $validated['sortOrder'] ?? 0,
        ]);

        return back()->with('success', 'Ad created successfully');
    }

    /**
     * Update the specified ad
     */
    public function update(Request $request, Ad $ad)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'titleBn' => 'required|string|max:255',
            'titleEn' => 'required|string|max:255',
            'image' => 'nullable|string',
            'link' => 'nullable|url',
            'position' => 'required|string',
            'type' => 'required|in:image,google_ad,html',
            'code' => 'nullable|string',
            'startDate' => 'nullable|date',
            'endDate' => 'nullable|date|after_or_equal:startDate',
            'isActive' => 'boolean',
            'sortOrder' => 'integer',
        ]);

        $ad->update([
            'title_bn' => $validated['titleBn'],
            'title_en' => $validated['titleEn'],
            'image' => $validated['image'],
            'link' => $validated['link'],
            'position' => $validated['position'],
            'type' => $validated['type'],
            'code' => $validated['code'],
            'start_date' => $validated['startDate'],
            'end_date' => $validated['endDate'],
            'is_active' => $validated['isActive'] ?? $ad->is_active,
            'sort_order' => $validated['sortOrder'] ?? $ad->sort_order,
        ]);

        return back()->with('success', 'Ad updated successfully');
    }

    /**
     * Remove the specified ad
     */
    public function destroy(Ad $ad)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $ad->delete();

        return back()->with('success', 'Ad deleted successfully');
    }

    /**
     * Toggle active status
     */
    public function toggleStatus(Ad $ad)
    {
        if (!auth()->user()->hasPermission('business.ads.manage')) {
            abort(403);
        }

        $ad->update(['is_active' => !$ad->is_active]);

        return back()->with('success', 'Ad status updated');
    }
}
