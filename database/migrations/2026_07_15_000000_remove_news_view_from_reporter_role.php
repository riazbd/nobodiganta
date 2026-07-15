<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

/**
 * Reporters must only see their OWN news. They already hold `news.view.own`;
 * the extra `news.view` (view ALL) was granted in error and let them see every
 * author's articles and reach the breaking-news page. Detach it from the
 * reporter role so all existing reporter users are corrected in place.
 */
return new class extends Migration
{
    public function up(): void
    {
        $role = Role::where('name', 'reporter')->first();
        $perm = Permission::where('name', 'news.view')->first();

        if ($role && $perm) {
            $role->permissions()->detach($perm->id);
        }
    }

    public function down(): void
    {
        $role = Role::where('name', 'reporter')->first();
        $perm = Permission::where('name', 'news.view')->first();

        if ($role && $perm) {
            $role->permissions()->syncWithoutDetaching([$perm->id]);
        }
    }
};
