<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    protected $fillable = [
        'article_id',
        'user_id',
        'parent_id',
        'name',
        'email',
        'ip_address',
        'body',
        'status',
        'is_flagged',
        'flag_reason',
        'moderated_at',
        'moderated_by',
        'upvotes',
    ];

    protected $casts = [
        'is_flagged' => 'boolean',
        'moderated_at' => 'datetime',
        'upvotes' => 'integer',
    ];

    /**
     * Article this comment belongs to
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * User who wrote this comment (if registered)
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Parent comment (for threaded replies)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Child comments (replies)
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')->orderBy('created_at');
    }

    /**
     * Moderator who reviewed this comment
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    /**
     * Get commenter name (user name or anonymous name)
     */
    public function getCommenterNameAttribute(): string
    {
        if ($this->user) {
            return $this->user->name;
        }
        return $this->name ?: 'Anonymous';
    }

    /**
     * Scope: Only approved comments
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope: Pending moderation
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope: Flagged comments
     */
    public function scopeFlagged($query)
    {
        return $query->where('is_flagged', true);
    }

    /**
     * Scope: Top-level comments only (no replies)
     */
    public function scopeParents($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope: Order by newest first
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope: Order by most upvoted
     */
    public function scopeMostUpvoted($query)
    {
        return $query->orderBy('upvotes', 'desc');
    }

    /**
     * Approve comment
     */
    public function approve(?User $moderator = null): void
    {
        $this->update([
            'status' => 'approved',
            'moderated_at' => now(),
            'moderated_by' => $moderator?->id,
            'is_flagged' => false,
            'flag_reason' => null,
        ]);
    }

    /**
     * Mark as spam
     */
    public function markAsSpam(?User $moderator = null): void
    {
        $this->update([
            'status' => 'spam',
            'moderated_at' => now(),
            'moderated_by' => $moderator?->id,
        ]);
    }

    /**
     * Flag for review
     */
    public function flag(string $reason): void
    {
        $this->update([
            'is_flagged' => true,
            'flag_reason' => $reason,
        ]);
    }

    /**
     * Increment upvotes
     */
    public function incrementUpvotes(): void
    {
        $this->increment('upvotes');
    }
}
