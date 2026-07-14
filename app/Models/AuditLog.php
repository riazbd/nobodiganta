<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event',
        'auditable_type',
        'auditable_id',
        'description',
        'properties',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    /**
     * The user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Restrict a query to entries the given viewer is allowed to see. The
     * supreme admin is invisible across the whole panel, and its audit trail is
     * part of that secrecy — every other role (super admin included) must never
     * see an action performed by a supreme admin. Only a supreme admin sees them.
     * System entries (no user) are always kept.
     */
    public function scopeVisibleTo($query, ?User $viewer)
    {
        if ($viewer && $viewer->role === 'supreme_admin') {
            return $query;
        }

        return $query->whereDoesntHave('user', function ($q) {
            $q->where('role', 'supreme_admin');
        });
    }

    /**
     * The object that was audited.
     */
    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }
}
