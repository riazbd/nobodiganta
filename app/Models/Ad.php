<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ad extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'slot_id',
        'title_bn',
        'title_en',
        'image',
        'video_url',
        'link',
        'position',
        'pricing_model',
        'price',
        'cpm_rate',
        'type',
        'code',
        'start_date',
        'end_date',
        'impressions',
        'clicks',
        'is_active',
        'sort_order',
        'popup_config',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'impressions' => 'integer',
        'clicks' => 'integer',
        'sort_order' => 'integer',
        'price' => 'decimal:2',
        'cpm_rate' => 'decimal:2',
        'popup_config' => 'array',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(AdClient::class, 'client_id');
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(AdSlot::class, 'slot_id');
    }

    /**
     * Monetary value of this booking. Flat = agreed price; CPM = delivered
     * impressions / 1000 × agreed CPM rate.
     */
    public function bookingValue(): float
    {
        if ($this->pricing_model === 'cpm') {
            return round(($this->impressions / 1000) * (float) $this->cpm_rate, 2);
        }
        return (float) ($this->price ?? 0);
    }

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
