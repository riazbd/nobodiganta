<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan',
        'price_bdt',
        'starts_at',
        'ends_at',
        'is_active',
        'payment_method',
        'payment_reference',
        'cancelled_at',
    ];

    protected $casts = [
        'price_bdt' => 'decimal:2',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * User who owns this subscription
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if subscription is currently active
     */
    public function isActive(): bool
    {
        return $this->is_active && 
               $this->starts_at && 
               $this->ends_at && 
               now()->between($this->starts_at, $this->ends_at);
    }

    /**
     * Check if subscription has expired
     */
    public function isExpired(): bool
    {
        return $this->ends_at && now()->gt($this->ends_at);
    }

    /**
     * Check if subscription is premium (includes e-paper + ad-free)
     */
    public function isPremium(): bool
    {
        return in_array($this->plan, ['premium', 'annual_premium']);
    }

    /**
     * Check if subscription includes digital access
     */
    public function hasDigitalAccess(): bool
    {
        return in_array($this->plan, [
            'digital', 'premium', 
            'annual_digital', 'annual_premium'
        ]);
    }

    /**
     * Get plan display name
     */
    public function getPlanName(string $lang = 'bn'): string
    {
        $names = [
            'bn' => [
                'free' => 'বিনামূল্যে',
                'digital' => 'ডিজিটাল',
                'premium' => 'প্রিমিয়াম',
                'annual_digital' => 'বার্ষিক ডিজিটাল',
                'annual_premium' => 'বার্ষিক প্রিমিয়াম',
            ],
            'en' => [
                'free' => 'Free',
                'digital' => 'Digital',
                'premium' => 'Premium',
                'annual_digital' => 'Annual Digital',
                'annual_premium' => 'Annual Premium',
            ],
        ];

        return $names[$lang][$this->plan] ?? $this->plan;
    }

    /**
     * Scope: Only active subscriptions
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Not expired
     */
    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('ends_at')
              ->orWhere('ends_at', '>', now());
        });
    }

    /**
     * Scope: Premium plans only
     */
    public function scopePremium($query)
    {
        return $query->whereIn('plan', ['premium', 'annual_premium']);
    }
}
