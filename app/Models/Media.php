<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Media extends Model
{
    protected $fillable = [
        'user_id',
        'original_name',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
        'width',
        'height',
        'alt_text_bn',
        'alt_text_en',
        'caption_bn',
        'caption_en',
        'credit_bn',
        'credit_en',
        'source_link',
        'license_type',
        'thumbnails',
        'is_webp',
        'edition',
        'category',
    ];

    protected $casts = [
        'thumbnails' => 'array',
        'is_webp' => 'boolean',
        'file_size' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    protected $appends = [
        'url',
        'thumbnail_url',
        'formatted_size',
    ];

    /**
     * User who uploaded the media
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get alt text based on edition
     */
    public function getAltText(string $edition = 'bn'): string
    {
        return $edition === 'en' && $this->alt_text_en 
            ? $this->alt_text_en 
            : ($this->alt_text_bn ?: $this->original_name);
    }

    /**
     * Get caption based on edition
     */
    public function getCaption(string $edition = 'bn'): ?string
    {
        return $edition === 'en' && $this->caption_en 
            ? $this->caption_en 
            : $this->caption_bn;
    }

    /**
     * Scope: Filter by edition
     */
    public function scopeForEdition($query, string $edition)
    {
        return $query->where(function ($q) use ($edition) {
            $q->where('edition', 'both')
              ->orWhere('edition', $edition);
        });
    }

    /**
     * Scope: Filter by media type
     */
    public function scopeOfType($query, string $type)
    {
        if ($type === 'image') {
            return $query->where('mime_type', 'like', 'image/%');
        } elseif ($type === 'video') {
            return $query->where('mime_type', 'like', 'video/%');
        }
        return $query;
    }

    /**
     * Convert to array for API responses
     */
    public function toAPIArray(string $edition = 'bn'): array
    {
        return [
            'id' => $this->id,
            'original_name' => $this->original_name,
            'file_name' => $this->file_name,
            'url' => $this->url,
            'thumbnail_url' => $this->thumbnail_url,
            'mime_type' => $this->mime_type,
            'file_size' => $this->file_size,
            'formatted_size' => $this->formatted_size,
            'width' => $this->width,
            'height' => $this->height,
            'alt_text' => $this->getAltText($edition),
            'alt_text_bn' => $this->alt_text_bn,
            'alt_text_en' => $this->alt_text_en,
            'caption' => $this->getCaption($edition),
            'caption_bn' => $this->caption_bn,
            'caption_en' => $this->caption_en,
            'edition' => $this->edition,
            'is_image' => str_starts_with($this->mime_type, 'image/'),
            'is_video' => str_starts_with($this->mime_type, 'video/'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    /**
     * Get file size in human-readable format
     */
    public function getFormattedSizeAttribute(): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->file_size;
        $unit = 0;

        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }

        return round($size, 2) . ' ' . $units[$unit];
    }

    /**
     * Get full URL for the media
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    /**
     * Get thumbnail URL (if exists)
     */
    public function getThumbnailUrlAttribute(?string $size = 'medium'): ?string
    {
        $size = $size ?: 'medium';
        if (!$this->thumbnails || !isset($this->thumbnails[$size])) {
            return $this->url;
        }

        return asset('storage/' . $this->thumbnails[$size]);
    }
}
