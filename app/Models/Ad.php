<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ad extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title_bn',
        'title_en',
        'image',
        'video_url',
        'link',
        'position',
        'type',
        'code',
        'start_date',
        'end_date',
        'impressions',
        'clicks',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'impressions' => 'integer',
        'clicks' => 'integer',
        'sort_order' => 'integer',
    ];

    /**
     * Scope: Only active ads
     */
    public function scopeActive($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where(function($q) use ($now) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', $now);
            })
            ->where(function($q) use ($now) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', $now);
            });
    }

    /**
     * Scope: Filter by position
     */
    public function scopePosition($query, string $position)
    {
        return $query->where('position', $position);
    }

    /**
     * Get title based on language
     */
    public function getTitle(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->title_en : $this->title_bn;
    }
}
