<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code_name_bn',
        'code_name_en',
        'email',
        'password',
        'profile_photo_path',
        'role',
        'role_id',
        'two_factor_enabled',
        'last_login_at',
        'email_verified_at',
    ];

    /**
     * Get the URL to the user's profile photo.
     */
    public function getProfilePhotoUrlAttribute(): string
    {
        return $this->profile_photo_path
            ? asset('storage/' . $this->profile_photo_path)
            : 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&color=7F9CF5&background=EBF4FF';
    }

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'two_factor_enabled' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * The role assigned to this user.
     */
    public function roleRelation(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function reporter(): HasOne
    {
        return $this->hasOne(\App\Models\Reporter::class);
    }

    /**
     * Articles this user is the primary author of.
     */
    public function articlesAuthored(): HasMany
    {
        return $this->hasMany(Article::class, 'author_id');
    }

    /**
     * How much bylined editorial work (articles) would be orphaned if this user
     * were deleted. Drives whether a reassignment successor is required. Only
     * articles count: they carry public authorship. Everything else — stories,
     * media, photocard templates — is preserved and detached via null-on-delete,
     * not reassigned.
     */
    public function contentCount(): int
    {
        return $this->articlesAuthored()->count();
    }

    /**
     * Reassign this user's authored work to a successor before deletion.
     *
     * Only articles are transferred — they are publicly bylined and carry
     * ongoing editorial responsibility (and author_id is cascade-delete, so a
     * successor is required). Co-author (secondary) credit is cleared to avoid
     * the same user being both primary and secondary author. Stories, media and
     * photocard templates are intentionally left alone — their FKs null-on-delete,
     * preserving the content without faking authorship.
     */
    public function reassignContent(?User $target): void
    {
        Article::where('secondary_author_id', $this->id)->update(['secondary_author_id' => null]);

        if ($target) {
            Article::where('author_id', $this->id)->update(['author_id' => $target->id]);
        }
    }

    /**
     * Get permissions through the user's role.
     */
    public function getPermissionsAttribute(): array
    {
        $role = $this->roleRelation;
        if (! $role) {
            return [];
        }

        // Cache permissions on the model to avoid N+1
        if (! $this->relationLoaded('roleRelation.permissions')) {
            $role->load('permissions');
        }

        return $role->permissions->pluck('name')->toArray();
    }

    /**
     * The single highest role. It is the only unconditional wildcard — exempt
     * from both permission checks and login 2FA. Every other role (including
     * super_admin) is governed by its assigned permissions.
     */
    public function isSupremeAdmin(): bool
    {
        return $this->role === 'supreme_admin'
            || ($this->roleRelation && $this->roleRelation->name === 'supreme_admin');
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isSupremeAdmin()) {
            return true;
        }

        return in_array($permission, $this->permissions, true);
    }

    /**
     * Check if user has a minimum role level.
     */
    public function hasRole(string $minRole): bool
    {
        $role = $this->roleRelation;
        if (! $role) {
            return false;
        }

        $minRoleModel = Role::where('name', $minRole)->first();
        if (! $minRoleModel) {
            return false;
        }

        return $role->level >= $minRoleModel->level;
    }

    /**
     * User's subscriptions
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get user's active subscription
     */
    public function activeSubscription(): ?Subscription
    {
        return $this->subscriptions()
            ->active()
            ->notExpired()
            ->latest('starts_at')
            ->first();
    }

    /**
     * Check if user has premium subscription
     */
    public function hasPremiumSubscription(): bool
    {
        $subscription = $this->activeSubscription();
        return $subscription && $subscription->isPremium();
    }

    /**
     * Check if user has any paid subscription
     */
    public function hasPaidSubscription(): bool
    {
        $subscription = $this->activeSubscription();
        return $subscription && $subscription->plan !== 'free';
    }
}
