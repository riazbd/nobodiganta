<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Photocard permissions (group `photocard`):
 *
 *  - `photocard.manage`   — build / edit templates in the Studio. Granted to
 *    supreme_admin / super_admin by default; any other role can be given it
 *    from Roles → Photocard.
 *
 *  - `photocard.download` — download a card from a saved template on the news
 *    list. Seeded as a baseline onto the content roles (+ admins) so it works
 *    out of the box.
 *
 * Both grants are ADDITIVE only (syncWithoutDetaching) — the seeder never
 * removes either permission from a role, so manual per-role changes made in
 * Roles → Photocard are always preserved on re-run.
 *
 * Idempotent and safe on production:
 *
 *     php artisan db:seed --class=PhotocardPermissionSeeder --force
 */
class PhotocardPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $manage   = Permission::updateOrCreate(['name' => 'photocard.manage'],   ['group' => 'photocard']);
        $download = Permission::updateOrCreate(['name' => 'photocard.download'], ['group' => 'photocard']);

        $adminNames = ['supreme_admin', 'super_admin'];

        // photocard.manage = admins by default (additive — UI grants to other
        // roles are preserved; we never strip it).
        foreach (Role::whereIn('name', $adminNames)->pluck('id') as $id) {
            Role::find($id)?->permissions()->syncWithoutDetaching([$manage->id]);
        }

        // photocard.download = baseline for content roles + admins (additive only).
        $downloadRoleIds = Role::whereIn('name', array_merge($adminNames, [
            'editor_in_chief', 'managing_editor', 'section_editor', 'reporter', 'photographer',
        ]))->pluck('id');
        foreach ($downloadRoleIds as $id) {
            Role::find($id)?->permissions()->syncWithoutDetaching([$download->id]);
        }
    }
}
