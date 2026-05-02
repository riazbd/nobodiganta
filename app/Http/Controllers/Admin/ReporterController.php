<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reporter;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ReporterController extends Controller
{
    /**
     * Display a listing of reporters
     */
    public function index(Request $request)
    {
        if (!$request->user()->hasPermission('reporter.view')) {
            abort(403);
        }

        $query = Reporter::with('user')->withCount('articles');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name_bn', 'like', "%{$request->search}%")
                  ->orWhere('name_en', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        $reporters = $query->orderBy('sort_order')->orderBy('name_en')->get();

        return Inertia::render('features/admin/pages/Reporters', [
            'reporters' => $reporters->map(function($r) {
                return [
                    'id' => $r->id,
                    'name' => $r->name_bn,
                    'nameEn' => $r->name_en,
                    'slug' => $r->slug,
                    'designation' => $r->designation_bn,
                    'designationEn' => $r->designation_en,
                    'bio' => $r->bio_bn,
                    'bioEn' => $r->bio_en,
                    'email' => $r->email,
                    'phone' => $r->phone,
                    'image' => $r->image ?: ($r->user ? $r->user->profile_photo_url : null),
                    'avatar' => mb_substr($r->name_bn, 0, 1),
                    'articles' => $r->articles_count,
                    'performance' => rand(70, 98), // Mock performance for now
                    'joined' => $r->created_at->format('Y-m-d'),
                    'status' => $r->is_active ? 'active' : 'inactive',
                    'is_featured' => $r->is_featured,
                    'social_links' => $r->social_links,
                    'sort_order' => $r->sort_order,
                    'user_id' => $r->user_id,
                ];
            }),
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Store a newly created reporter
     */
    public function store(Request $request)
    {
        if (!$request->user()->hasPermission('reporter.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'nameBn' => 'required|string|max:255',
            'nameEn' => 'required|string|max:255',
            'email' => 'nullable|email|unique:reporters,email',
            'designationBn' => 'nullable|string|max:255',
            'designationEn' => 'nullable|string|max:255',
            'bioBn' => 'nullable|string',
            'bioEn' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'image' => 'nullable|string',
            'isFeatured' => 'boolean',
            'sortOrder' => 'integer',
            'socialLinks' => 'nullable|array',
        ]);

        $reporter = Reporter::create([
            'name_bn' => $validated['nameBn'],
            'name_en' => $validated['nameEn'],
            'slug' => $this->generateUniqueSlug($validated['nameEn']),
            'email' => $validated['email'],
            'designation_bn' => $validated['designationBn'],
            'designation_en' => $validated['designationEn'],
            'bio_bn' => $validated['bioBn'],
            'bio_en' => $validated['bioEn'],
            'phone' => $validated['phone'],
            'image' => $validated['image'],
            'is_featured' => $validated['isFeatured'] ?? false,
            'sort_order' => $validated['sortOrder'] ?? 0,
            'social_links' => $validated['socialLinks'] ?? null,
            'is_active' => true,
        ]);

        return back()->with('success', 'Reporter created successfully');
    }

    /**
     * Update the specified reporter
     */
    public function update(Request $request, Reporter $reporter)
    {
        if (!$request->user()->hasPermission('reporter.edit')) {
            abort(403);
        }

        $validated = $request->validate([
            'nameBn' => 'required|string|max:255',
            'nameEn' => 'required|string|max:255',
            'email' => 'nullable|email|unique:reporters,email,' . $reporter->id,
            'designationBn' => 'nullable|string|max:255',
            'designationEn' => 'nullable|string|max:255',
            'bioBn' => 'nullable|string',
            'bioEn' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'image' => 'nullable|string',
            'isFeatured' => 'boolean',
            'status' => 'string|in:active,inactive',
            'sortOrder' => 'integer',
            'socialLinks' => 'nullable|array',
        ]);

        $reporter->update([
            'name_bn' => $validated['nameBn'],
            'name_en' => $validated['nameEn'],
            'email' => $validated['email'],
            'designation_bn' => $validated['designationBn'],
            'designation_en' => $validated['designationEn'],
            'bio_bn' => $validated['bioBn'],
            'bio_en' => $validated['bioEn'],
            'phone' => $validated['phone'],
            'image' => $validated['image'],
            'is_featured' => $validated['isFeatured'] ?? $reporter->is_featured,
            'is_active' => ($validated['status'] ?? ($reporter->is_active ? 'active' : 'inactive')) === 'active',
            'sort_order' => $validated['sortOrder'] ?? $reporter->sort_order,
            'social_links' => $validated['socialLinks'] ?? $reporter->social_links,
        ]);

        return back()->with('success', 'Reporter updated successfully');
    }

    /**
     * Remove the specified reporter
     */
    public function destroy(Request $request, Reporter $reporter)
    {
        if (!$request->user()->hasPermission('reporter.delete')) {
            abort(403);
        }

        $reporter->delete();

        return back()->with('success', 'Reporter deleted successfully');
    }

    /**
     * Generate unique slug for reporter
     */
    protected function generateUniqueSlug(string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (Reporter::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        return $slug;
    }
}
