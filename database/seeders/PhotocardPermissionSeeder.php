<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Adds the dedicated `photocard.manage` permission (separate from the media
 * gallery) and keeps it ADMIN-ONLY: only supreme_admin / super_admin hold it.
 * (Those roles also bypass permission checks in code, but we attach it so the
 * Roles UI stays consistent.)
 *
 * Idempotent and safe to run on production — it converges to the admin-only
 * state every run (attaches to admins, detaches from everyone else) without
 * touching any other permission:
 *
 *     php artisan db:seed --class=PhotocardPermissionSeeder --force
 */
class PhotocardPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $perm = Permission::updateOrCreate(
            ['name' => 'photocard.manage'],
            ['group' => 'photocard']
        );

        // Grant only to the admin-level roles.
        $adminRoleIds = Role::whereIn('name', ['supreme_admin', 'super_admin'])->pluck('id');
        foreach ($adminRoleIds as $id) {
            Role::find($id)?->permissions()->syncWithoutDetaching([$perm->id]);
        }

        // Remove it from every non-admin role (corrects any earlier grant).
        $perm->roles()->detach(
            Role::whereNotIn('name', ['supreme_admin', 'super_admin'])->pluck('id')->toArray()
        );
    }
}
