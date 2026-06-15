<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Adds the dedicated `photocard.manage` permission (separate from the media
 * gallery) and grants it to every role that can currently reach the studio.
 *
 * This seeder is ADDITIVE and IDEMPOTENT — it only firstOrCreate's the
 * permission and syncWithoutDetaching's it onto the relevant roles, so it
 * never wipes existing role permissions and is safe to run on production:
 *
 *     php artisan db:seed --class=PhotocardPermissionSeeder --force
 */
class PhotocardPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $perm = Permission::firstOrCreate(
            ['name' => 'photocard.manage'],
            ['group' => 'media']
        );

        // Keep current behaviour: any role that already reaches the studio via
        // `media.gallery.manage` keeps access (this also covers custom roles).
        $roleIds = collect();
        $gallery = Permission::where('name', 'media.gallery.manage')->first();
        if ($gallery) {
            $roleIds = $gallery->roles()->pluck('roles.id');
        }

        // Plus the standard editorial + photographer roles, by name, as a fallback.
        $byName = Role::whereIn('name', [
            'editor_in_chief', 'managing_editor', 'section_editor', 'photographer',
        ])->pluck('id');

        $roleIds = $roleIds->merge($byName)->unique();

        foreach ($roleIds as $id) {
            Role::find($id)?->permissions()->syncWithoutDetaching([$perm->id]);
        }
    }
}
