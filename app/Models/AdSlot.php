<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdSlot extends Model
{
    protected $fillable = [
        'key', 'name_bn', 'name_en', 'description', 'size', 'dimensions',
        'rate', 'rate_cpm', 'capacity', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'rate' => 'decimal:2',
        'rate_cpm' => 'decimal:2',
        'capacity' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function ads(): HasMany
    {
        return $this->hasMany(Ad::class, 'slot_id');
    }

    /**
     * Bookings currently occupying this slot (active + within their date range).
     */
    public function occupiedCount(): int
    {
        return $this->ads()->active()->count();
    }

    public function availableCount(): int
    {
        return max(0, $this->capacity - $this->occupiedCount());
    }

    public function getName(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->name_en : $this->name_bn;
    }
}
