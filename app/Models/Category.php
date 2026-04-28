<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Category extends Model
{
    protected $fillable = [
        'parent_id',
        'name_bn',
        'name_en',
        'slug',
        'description_bn',
        'description_en',
        'meta_description_bn',
        'meta_description_en',
        'icon',
        'color',
        'color_code',
        'sort_order',
        'is_active',
        'edition',
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Parent category (for subcategories)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Child categories (subcategories)
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order');
    }

    /**
     * Articles in this category
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class)->where('status', 'published');
    }

    /**
     * Get category name based on edition
     */
    public function getName(string $edition = 'bn'): string
    {
        return $edition === 'en' && $this->name_en 
            ? $this->name_en 
            : $this->name_bn;
    }

    /**
     * Get category description based on edition
     */
    public function getDescription(string $edition = 'bn'): ?string
    {
        if (!$this->description_bn && !$this->description_en) {
            return null;
        }
        
        return $edition === 'en' && $this->description_en 
            ? $this->description_en 
            : $this->description_bn;
    }

    /**
     * Scope: Only active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
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
     * Scope: Top-level categories (no parent)
     */
    public function scopeParents($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope: Order by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name_bn');
    }
}
