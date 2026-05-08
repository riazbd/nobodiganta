<?php
// app/Models/StorySlide.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorySlide extends Model
{
    protected $fillable = [
        'story_id', 'sort_order', 'media_id',
        'text_overlay_bn', 'text_overlay_en',
        'linked_article_id', 'duration',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'duration' => 'integer',
    ];

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function linkedArticle(): BelongsTo
    {
        return $this->belongsTo(Article::class, 'linked_article_id');
    }

    public function getTextOverlay(string $edition = 'bn'): ?string
    {
        if ($edition === 'en' && $this->text_overlay_en) return $this->text_overlay_en;
        return $this->text_overlay_bn;
    }

    public function isVideo(): bool
    {
        return $this->media && str_contains($this->media->mime_type ?? '', 'video');
    }

    public function toAPIArray(string $edition = 'bn'): array
    {
        return [
            'id' => $this->id,
            'sort_order' => $this->sort_order,
            'media_url' => $this->media?->url,
            'media_thumbnail' => $this->media?->thumbnail_url,
            'is_video' => $this->isVideo(),
            'text_overlay' => $this->getTextOverlay($edition),
            'duration' => $this->duration,
            'linked_article' => $this->linkedArticle ? [
                'id' => $this->linkedArticle->id,
                'title' => $this->linkedArticle->getTitle($edition),
                'slug' => $this->linkedArticle->getSlug($edition),
                'category_slug' => $this->linkedArticle->category?->slug,
            ] : null,
        ];
    }
}
