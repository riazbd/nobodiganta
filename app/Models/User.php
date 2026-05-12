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
        'email',
        'password',
        'profile_photo_path',
        'role',
        'role_id',
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
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        if (in_array($this->role, ['supreme_admin', 'super_admin']) || 
            ($this->roleRelation && in_array($this->roleRelation->name, ['supreme_admin', 'super_admin']))) {
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
