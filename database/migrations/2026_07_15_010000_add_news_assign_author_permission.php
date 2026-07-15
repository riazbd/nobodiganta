<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

/**
 * Assigning an article/opinion to another author (primary or co-author) now
 * requires the news.assign_author permission. Create it and grant it to the
 * editorial roles that manage bylines — reporters keep only their own.
 */
return new class extends Migration
{
    public function up(): void
    {
        $perm = Permission::firstOrCreate(
            ['name' => 'news.assign_author'],
            ['group' => 'news']
        );

        $roles = Role::whereIn('name', ['editor_in_chief', 'managing_editor', 'section_editor'])->get();
        foreach ($roles as $role) {
            $role->permissions()->syncWithoutDetaching([$perm->id]);
        }
    }

    public function down(): void
    {
        $perm = Permission::where('name', 'news.assign_author')->first();
        if ($perm) {
            $perm->roles()->detach();
            $perm->delete();
        }
    }
};
