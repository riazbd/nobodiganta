<?php
// app/Models/Story.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Story extends Model
{
    use HasFactory;
    protected $fillable = [
        'title_bn', 'title_en', 'slug',
        'cover_media_id', 'status', 'edition',
        'expires_at', 'published_at',
        'created_by', 'published_by', 'view_count',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'published_at' => 'datetime',
        'view_count' => 'integer',
    ];

    public function coverMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_media_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function slides(): HasMany
    {
        return $this->hasMany(StorySlide::class)->orderBy('sort_order');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeForEdition($query, string $edition)
    {
        if ($edition === 'bn' || $edition === 'en') {
            return $query->whereIn('edition', [$edition, 'both']);
        }
        return $query;
    }

    public function getTitle(string $edition = 'bn'): string
    {
        if ($edition === 'en' && $this->title_en) return $this->title_en;
        return $this->title_bn;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function publish(User $by): void
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
            'published_by' => $by->id,
        ]);
    }

    public function restore(User $by): void
    {
        $this->update([
            'status' => 'published',
            'published_at' => now(),
            'published_by' => $by->id,
            'expires_at' => null,
        ]);
    }

    public function toAPIArray(string $edition = 'bn'): array
    {
        return [
            'id' => $this->id,
            'title' => $this->getTitle($edition),
            'title_bn' => $this->title_bn,
            'title_en' => $this->title_en,
            'slug' => $this->slug,
            'cover' => $this->coverMedia?->getUrl(),
            'cover_thumbnail' => $this->coverMedia?->getThumbnailUrl(),
            'cover_media_id' => $this->cover_media_id,
            'status' => $this->status,
            'edition' => $this->edition,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'published_at' => $this->published_at?->toIso8601String(),
            'view_count' => $this->view_count,
            'slides_count' => $this->slides_count ?? $this->slides()->count(),
            'slides' => $this->relationLoaded('slides')
                ? $this->slides->map(fn($s) => $s->toAPIArray($edition))->values()
                : [],
        ];
    }
}
