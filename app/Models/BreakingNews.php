<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BreakingNews extends Model
{
    protected $table = 'breaking_news';

    protected $fillable = [
        'article_id', 'headline_bn', 'headline_en', 'link',
        'severity', 'priority', 'is_pinned', 'edition',
        'starts_at', 'expires_at', 'is_active',
        'push_enabled', 'push_sent_at', 'views', 'clicks', 'created_by',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_active' => 'boolean',
        'push_enabled' => 'boolean',
        'priority' => 'integer',
        'views' => 'integer',
        'clicks' => 'integer',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'push_sent_at' => 'datetime',
    ];

    public const SEVERITIES = ['just_in', 'breaking', 'urgent', 'live'];

    protected static function booted(): void
    {
        // A new item with no explicit "Expires at" auto-expires after the
        // configured default window (measured from its start time, or now).
        // Explicit expiry always wins; 0 hours disables the default.
        static::creating(function (self $b) {
            if ($b->expires_at === null) {
                $hours = static::defaultExpiryHours();
                if ($hours > 0) {
                    $base = $b->starts_at ? $b->starts_at->copy() : now();
                    $b->expires_at = $base->addHours($hours);
                }
            }
        });
    }

    /** Default auto-expiry window in hours (admin setting; 24 = one day, 0 = off). */
    public static function defaultExpiryHours(): int
    {
        return (int) (Setting::where('key', 'breaking_default_expiry_hours')->value('value') ?? 24);
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Currently-live items: active, started, not expired, for the edition.
     */
    public function scopeActive($query, ?string $edition = null)
    {
        $now = now();
        $query->where('is_active', true)
            ->where(fn($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', $now));

        if ($edition === 'bn' || $edition === 'en') {
            $query->whereIn('edition', [$edition, 'both']);
        }

        return $query;
    }

    /**
     * Display order: pinned first, then severity weight, then manual priority,
     * then most recent.
     */
    public function scopeOrdered($query)
    {
        return $query
            ->orderByDesc('is_pinned')
            ->orderByRaw("CASE severity WHEN 'urgent' THEN 4 WHEN 'live' THEN 3 WHEN 'breaking' THEN 2 ELSE 1 END DESC")
            ->orderByDesc('priority')
            ->orderByDesc('created_at');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Keep a linked breaking_news row in sync with an article's is_breaking flag.
     * Toggling the flag on creates/reactivates a row; toggling off expires it.
     */
    public static function syncForArticle(Article $article): void
    {
        $existing = static::where('article_id', $article->id)->first();

        if ($article->is_breaking && $article->status === 'published') {
            if ($existing) {
                if (!$existing->is_active) {
                    $hours = static::defaultExpiryHours();
                    $existing->update([
                        'is_active'  => true,
                        'expires_at' => $hours > 0 ? now()->addHours($hours) : null,
                    ]);
                }
            } else {
                static::create([
                    'article_id' => $article->id,
                    'severity' => 'breaking',
                    'edition' => $article->edition ?? 'both',
                    'is_active' => true,
                    'created_by' => $article->author_id,
                ]);
            }
        } elseif ($existing && $existing->is_active) {
            // Flag removed / unpublished → retire the breaking item.
            $existing->update(['is_active' => false]);
        }
    }

    public function toPublicArray(string $edition = 'bn'): array
    {
        $article = $this->article;

        $title = $edition === 'en'
            ? ($this->headline_en ?: $this->headline_bn)
            : ($this->headline_bn ?: $this->headline_en);

        $catSlug = null;
        $slug = null;
        $url = $this->link;

        if ($article) {
            if (!$title) {
                $title = $edition === 'en' ? ($article->title_en ?: $article->title_bn) : $article->title_bn;
            }
            $catSlug = $article->category->slug ?? null;
            $slug = $edition === 'en' && $article->slug_en ? $article->slug_en : $article->slug_bn;
            if (!$url && $catSlug && $slug) {
                $url = ($edition === 'en' ? '/en/' : '/') . $catSlug . '/' . $slug;
            }
        }

        return [
            'id' => $this->id,
            'title' => $title,
            'severity' => $this->severity,
            'url' => $url,
            'category_slug' => $catSlug,
            'slug' => $slug,
            'is_pinned' => $this->is_pinned,
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
