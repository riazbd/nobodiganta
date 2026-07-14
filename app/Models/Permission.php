<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'group',
    ];

    /**
     * Keep super_admin holding every permission. Permissions are only ever
     * created by seeders/migrations, and each one previously had to remember to
     * grant itself to super_admin by hand (see PhotocardPermissionSeeder) — a
     * forgotten grant left super_admin silently missing it. Auto-attaching on
     * create removes that footgun. supreme_admin bypasses checks entirely, so it
     * needs nothing here; this is non-destructive (only adds, never strips).
     */
    protected static function booted(): void
    {
        static::created(function (Permission $permission) {
            Role::where('name', 'super_admin')->first()
                ?->permissions()->syncWithoutDetaching([$permission->id]);
        });
    }

    /**
     * Roles that have this permission.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permission');
    }
}
