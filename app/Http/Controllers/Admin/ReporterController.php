<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reporter;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'createLogin' => 'boolean',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if (!empty($validated['createLogin']) && !empty($validated['email'])) {
            $existingUser = User::where('email', $validated['email'])->first();
            if ($existingUser) {
                return back()->withErrors(['email' => __('A user with this email already exists.')])->withInput();
            }
        }

        DB::transaction(function () use ($validated) {
            $userId = null;

            if (!empty($validated['createLogin']) && !empty($validated['email']) && !empty($validated['password'])) {
                $reporterRole = \App\Models\Role::where('name', 'reporter')->first();

                $user = User::create([
                    'name' => $validated['nameEn'],
                    'email' => $validated['email'],
                    'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                    'role' => 'reporter',
                    'role_id' => $reporterRole?->id,
                    'email_verified_at' => now(),
                ]);

                $userId = $user->id;
            }

            Reporter::create([
                'name_bn' => $validated['nameBn'],
                'name_en' => $validated['nameEn'],
                'slug' => $this->generateUniqueSlug($validated['nameEn']),
                'email' => $validated['email'] ?? null,
                'designation_bn' => $validated['designationBn'] ?? null,
                'designation_en' => $validated['designationEn'] ?? null,
                'bio_bn' => $validated['bioBn'] ?? null,
                'bio_en' => $validated['bioEn'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'image' => $validated['image'] ?? null,
                'is_featured' => $validated['isFeatured'] ?? false,
                'sort_order' => $validated['sortOrder'] ?? 0,
                'social_links' => $validated['socialLinks'] ?? null,
                'is_active' => true,
                'user_id' => $userId,
            ]);
        });

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
            'createLogin' => 'boolean',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        // Check email conflicts before starting transaction
        if (!empty($validated['createLogin']) && !empty($validated['email']) && !$reporter->user_id && !empty($validated['password'])) {
            $existingUser = User::where('email', $validated['email'])->first();
            if ($existingUser) {
                return back()->withErrors(['email' => __('A user with this email already exists.')])->withInput();
            }
        }

        DB::transaction(function () use ($validated, $reporter) {
            $userId = $reporter->user_id;

            if (!empty($validated['createLogin']) && !empty($validated['email'])) {
                if ($userId) {
                    if (!empty($validated['password'])) {
                        $user = User::find($userId);
                        $user?->update(['password' => \Illuminate\Support\Facades\Hash::make($validated['password'])]);
                    }
                } else if (!empty($validated['password'])) {
                    $reporterRole = \App\Models\Role::where('name', 'reporter')->first();
                    $user = User::create([
                        'name' => $validated['nameEn'],
                        'email' => $validated['email'],
                        'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                        'role' => 'reporter',
                        'role_id' => $reporterRole?->id,
                        'email_verified_at' => now(),
                    ]);
                    $userId = $user->id;
                }
            }

            $reporter->update([
                'name_bn' => $validated['nameBn'],
                'name_en' => $validated['nameEn'],
                'email' => $validated['email'] ?? null,
                'designation_bn' => $validated['designationBn'] ?? null,
                'designation_en' => $validated['designationEn'] ?? null,
                'bio_bn' => $validated['bioBn'] ?? null,
                'bio_en' => $validated['bioEn'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'image' => $validated['image'] ?? null,
                'is_featured' => $validated['isFeatured'] ?? $reporter->is_featured,
                'is_active' => ($validated['status'] ?? ($reporter->is_active ? 'active' : 'inactive')) === 'active',
                'sort_order' => $validated['sortOrder'] ?? $reporter->sort_order,
                'social_links' => $validated['socialLinks'] ?? $reporter->social_links,
                'user_id' => $userId,
            ]);
        });

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
