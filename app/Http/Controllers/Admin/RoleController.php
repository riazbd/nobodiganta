<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    /**
     * Display the roles management page.
     */
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('user.role.manage')) {
            abort(403);
        }

        $perPage = $request->get('per_page', 15);
        $roles = Role::with('permissions')
            ->orderBy('level', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $roles->getCollection()->transform(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'label_en' => $role->label_en,
                'label_bn' => $role->label_bn,
                'level' => $role->level,
                'permissions' => $role->permissions->pluck('name')->toArray(),
                'permission_count' => $role->permissions->count(),
                'user_count' => \App\Models\User::where('role', $role->name)->count(),
                'created_at' => $role->created_at->format('Y-m-d H:i'),
            ];
        });

        $allPermissions = Permission::orderBy('group')->get()->groupBy('group')->map(function ($perms) {
            return $perms->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'group' => $p->group,
            ])->values();
        });

        return Inertia::render('features/admin/pages/system/Roles', [
            'roles' => $roles,
            'allPermissions' => $allPermissions,
            'filters' => $request->only(['per_page']),
        ]);
    }

    /**
     * Store a new role.
     */
    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('user.role.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'label_en' => ['required', 'string', 'max:255'],
            'label_bn' => ['required', 'string', 'max:255'],
            'level' => ['required', 'integer', 'min:0'],
        ]);

        $role = Role::create($validated);

        return back()->with('success', __('Role created successfully.'));
    }

    /**
     * Update a role.
     */
    public function update(Request $request, Role $role)
    {
        if (!auth()->user()->hasPermission('user.role.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'label_en' => ['required', 'string', 'max:255'],
            'label_bn' => ['required', 'string', 'max:255'],
            'level' => ['required', 'integer', 'min:0'],
        ]);

        $role->update($validated);

        return back()->with('success', __('Role updated successfully.'));
    }

    /**
     * Delete a role.
     */
    public function destroy(Role $role)
    {
        if (!auth()->user()->hasPermission('user.role.manage')) {
            abort(403);
        }

        // Prevent deleting super_admin
        if ($role->name === 'super_admin') {
            return back()->with('error', __('The Super Admin role cannot be deleted.'));
        }

        // Prevent deleting roles that have users
        $userCount = \App\Models\User::where('role', $role->name)->count();
        if ($userCount > 0) {
            return back()->with('error', __('Cannot delete role that has :count user(s). Reassign users first.', ['count' => $userCount]));
        }

        $role->delete();

        return back()->with('success', __('Role deleted successfully.'));
    }

    /**
     * Sync permissions for a role.
     */
    public function syncPermissions(Request $request, Role $role)
    {
        if (!auth()->user()->hasPermission('user.role.manage')) {
            abort(403);
        }

        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $permissionIds = Permission::whereIn('name', $validated['permissions'])->pluck('id')->toArray();

        $role->permissions()->sync($permissionIds);

        return back()->with('success', __('Permissions updated successfully.'));
    }

    /**
     * Get all permissions grouped (for the permission picker UI).
     */
    public function permissions()
    {
        if (!auth()->user()->hasPermission('user.role.manage')) {
            abort(403);
        }

        $permissions = Permission::orderBy('group')->get()->groupBy('group')->map(function ($perms) {
            return $perms->map(fn ($p) => [
                'name' => $p->name,
                'label' => $this->formatPermissionLabel($p->name),
            ])->values();
        });

        return response()->json($permissions);
    }

    /**
     * Format a permission name into a human-readable label.
     */
    private function formatPermissionLabel(string $name): string
    {
        // e.g. "news.view.own" -> "News View Own"
        return ucwords(str_replace(['.', '_'], ' ', $name));
    }
}
