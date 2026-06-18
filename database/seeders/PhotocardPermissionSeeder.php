<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Photocard permissions (group `photocard`):
 *
 *  - `photocard.manage`   — build / edit templates in the Studio. ADMIN-ONLY:
 *    only supreme_admin / super_admin hold it. The seeder converges to that
 *    state every run (attach to admins, detach from everyone else).
 *
 *  - `photocard.download` — download a card from a saved template on the news
 *    list. Seeded as a baseline onto the content roles (+ admins) so it works
 *    out of the box. This grant is ADDITIVE only (syncWithoutDetaching) — it
 *    never removes the permission, so manual per-role changes made in
 *    Roles → Photocard are preserved on re-run.
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

        // photocard.manage = admin-only (attach admins, detach the rest).
        foreach (Role::whereIn('name', $adminNames)->pluck('id') as $id) {
            Role::find($id)?->permissions()->syncWithoutDetaching([$manage->id]);
        }
        $manage->roles()->detach(
            Role::whereNotIn('name', $adminNames)->pluck('id')->toArray()
        );

        // photocard.download = baseline for content roles + admins (additive only).
        $downloadRoleIds = Role::whereIn('name', array_merge($adminNames, [
            'editor_in_chief', 'managing_editor', 'section_editor', 'reporter', 'photographer',
        ]))->pluck('id');
        foreach ($downloadRoleIds as $id) {
            Role::find($id)?->permissions()->syncWithoutDetaching([$download->id]);
        }
    }
}
