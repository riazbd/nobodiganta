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
     * The two top-tier admin roles (identical power; supreme is just the hidden
     * one). Only these two may edit a privileged role. Everyone else is locked
     * out of them entirely (they can't even be listed — see index()).
     */
    private const PRIVILEGED_ROLES = ['supreme_admin', 'super_admin'];

    /**
     * Guard role edits against privilege escalation. A non-top-tier actor may
     * not touch a privileged role, and may not grant a role any permission the
     * actor does not personally hold — otherwise anyone with user.role.manage
     * (e.g. editor_in_chief) could grant their own role full admin powers. Both
     * super and supreme admins are exempt.
     */
    private function guardRoleEscalation(Role $role, array $grantingPermissions = []): void
    {
        $actor = auth()->user();
        if (in_array($actor->role, self::PRIVILEGED_ROLES, true)) {
            return;
        }

        if (in_array($role->name, self::PRIVILEGED_ROLES, true)) {
            abort(403, 'Only a Supreme Admin can modify this role.');
        }

        $beyondActor = array_diff($grantingPermissions, $actor->permissions);
        if (! empty($beyondActor)) {
            abort(403, 'You cannot grant permissions you do not hold yourself.');
        }
    }

    /**
     * Display the roles management page.
     */
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('user.role.manage')) {
            abort(403);
        }

        $perPage = $request->get('per_page', 15);
        $query = Role::with('permissions')
            ->orderBy('level', 'desc');

        if (auth()->user()->role !== 'supreme_admin') {
            $query->where('name', '!=', 'supreme_admin');
        }

        $roles = $query->paginate($perPage)
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

        $this->guardRoleEscalation($role);

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

        if ($role->name === 'supreme_admin') {
            return back()->with('error', __('The Supreme Admin role cannot be deleted.'));
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

        // Block editing privileged roles and granting perms beyond the actor's own.
        $this->guardRoleEscalation($role, $validated['permissions']);

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
