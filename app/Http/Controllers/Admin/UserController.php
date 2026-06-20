<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display the users management page with data.
     */
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('user.view')) {
            abort(403);
        }

        $query = User::with(['roleRelation', 'reporter']);

        if (auth()->user()->role !== 'supreme_admin') {
            $query->where('role', '!=', 'supreme_admin');
        }

        // Sort
        $sortField = 'created_at';
        $sortDir = 'desc';
        if ($request->filled('sort')) {
            $sortMap = [
                'created_at_desc' => ['created_at', 'desc'],
                'created_at_asc' => ['created_at', 'asc'],
                'name_asc' => ['name', 'asc'],
                'name_desc' => ['name', 'desc'],
                'last_login_desc' => ['last_login_at', 'desc'],
                'role_asc' => ['role', 'asc'],
            ];
            if (isset($sortMap[$request->sort])) {
                [$sortField, $sortDir] = $sortMap[$request->sort];
            }
        }
        $query->orderBy($sortField, $sortDir);

        // Search (name or email)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->filled('status')) {
            match ($request->status) {
                'active' => $query->whereNotNull('email_verified_at'),
                'inactive' => $query->whereNull('email_verified_at'),
                'verified' => $query->whereNotNull('email_verified_at'),
                'unverified' => $query->whereNull('email_verified_at'),
                default => null,
            };
        }

        // Date range filter (created_at)
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to . ' 23:59:59');
        }

        // Last login filter
        if ($request->filled('last_login')) {
            match ($request->last_login) {
                'today' => $query->whereDate('last_login_at', today()),
                'week' => $query->where('last_login_at', '>=', now()->startOfWeek()),
                'month' => $query->where('last_login_at', '>=', now()->startOfMonth()),
                'year' => $query->where('last_login_at', '>=', now()->startOfYear()),
                'never' => $query->whereNull('last_login_at'),
                default => null,
            };
        }

        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage)->withQueryString();
        $users->getCollection()->transform(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'code_name_bn' => $user->code_name_bn,
            'code_name_en' => $user->code_name_en,
            'email' => $user->email,
            'role' => $user->role,
            'role_label' => $user->roleRelation?->label_en ?? $user->role,
            'role_label_bn' => $user->roleRelation?->label_bn ?? $user->role,
            'status' => $user->email_verified_at ? 'active' : 'inactive',
            'last_login' => $user->last_login_at?->diffForHumans(),
            'created_at' => $user->created_at?->format('Y-m-d H:i'),
            'profile_photo_url' => $user->profile_photo_path
                ? asset('storage/' . $user->profile_photo_path)
                : ($user->reporter?->image ?: null),
        ]);

        $rolesQuery = Role::orderBy('level', 'desc');
        if (auth()->user()->role !== 'supreme_admin') {
            $rolesQuery->where('name', '!=', 'supreme_admin');
        }

        return Inertia::render('features/admin/pages/system/Users', [
            'users' => $users,
            'roles' => $rolesQuery->get(['id', 'name', 'label_en', 'label_bn', 'level']),
            'filters' => request()->only(['search', 'role', 'status', 'date_from', 'date_to', 'last_login', 'per_page', 'sort']),
        ]);
    }

    /**
     * Store a new user.
     */
    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('user.create')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code_name_bn' => ['nullable', 'string', 'max:100'],
            'code_name_en' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'string', 'exists:roles,name'],
            'photo' => ['nullable', 'file', 'image', 'max:2048'],
        ]);

        if (auth()->user()->role !== 'supreme_admin' && $validated['role'] === 'supreme_admin') {
            abort(403, 'Unauthorized action.');
        }

        $role = Role::where('name', $validated['role'])->first();

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('profile-photos', 'public');
        }

        $user = User::create([
            'name' => $validated['name'],
            'code_name_bn' => $validated['code_name_bn'] ?? null,
            'code_name_en' => $validated['code_name_en'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'role_id' => $role?->id,
            'email_verified_at' => now(),
            'profile_photo_path' => $photoPath,
        ]);

        return back()->with('success', __('User created successfully.'));
    }

    /**
     * Update an existing user.
     */
    public function update(Request $request, User $user)
    {
        if (!auth()->user()->hasPermission('user.edit')) {
            abort(403);
        }

        if ($user->role === 'supreme_admin' && auth()->user()->role !== 'supreme_admin') {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code_name_bn' => ['nullable', 'string', 'max:100'],
            'code_name_en' => ['nullable', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['required', 'string', 'exists:roles,name'],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        if (auth()->user()->role !== 'supreme_admin' && $validated['role'] === 'supreme_admin') {
            abort(403, 'Unauthorized action.');
        }

        $user->name = $validated['name'];
        $user->code_name_bn = $validated['code_name_bn'] ?? null;
        $user->code_name_en = $validated['code_name_en'] ?? null;
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        $role = Role::where('name', $validated['role'])->first();
        $user->role_id = $role?->id;

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return back()->with('success', __('User updated successfully.'));
    }

    /**
     * Delete a user.
     */
    public function destroy(User $user)
    {
        if (!auth()->user()->hasPermission('user.delete')) {
            abort(403);
        }

        if ($user->role === 'supreme_admin') {
            return back()->with('error', __('The Supreme Admin user cannot be deleted.'));
        }

        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return back()->with('error', __('You cannot delete your own account.'));
        }

        $user->delete();

        return back()->with('success', __('User deleted successfully.'));
    }

    /**
     * Assign a role to a user.
     */
    public function assignRole(Request $request, User $user)
    {
        if (!auth()->user()->hasPermission('user.role.assign')) {
            abort(403);
        }

        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $role = Role::where('name', $validated['role'])->first();

        $user->update([
            'role' => $validated['role'],
            'role_id' => $role?->id,
        ]);

        return back()->with('success', __('Role updated successfully.'));
    }

    /**
     * Toggle user status (activate/deactivate).
     */
    public function toggleStatus(User $user)
    {
        if (!auth()->user()->hasPermission('user.edit')) {
            abort(403);
        }

        // Prevent self-deactivation
        if ($user->id === auth()->id()) {
            return back()->with('error', __('You cannot deactivate your own account.'));
        }

        if ($user->email_verified_at) {
            $user->email_verified_at = null;
        } else {
            $user->email_verified_at = now();
        }

        $user->save();

        return back()->with('success', __('User status updated.'));
    }

    /**
     * Upload or remove a user's profile photo.
     */
    public function uploadPhoto(Request $request, User $user)
    {
        if (!auth()->user()->hasPermission('user.edit')) {
            abort(403);
        }

        if ($request->has('remove')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $user->update(['profile_photo_path' => null]);
            return response()->json(['url' => null]);
        }

        $request->validate([
            'photo' => ['required', 'file', 'image', 'max:2048'],
        ]);

        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $path = $request->file('photo')->store('profile-photos', 'public');
        $user->update(['profile_photo_path' => $path]);

        return response()->json(['url' => asset('storage/' . $path)]);
    }
}
