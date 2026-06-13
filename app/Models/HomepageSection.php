<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomepageSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'title_bn',
        'title_en',
        'category_id',
        'type',
        'layout',
        'item_count',
        'sort_order',
        'is_active',
        'edition',
        'config',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'config'    => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForEdition($query, $edition)
    {
        return $query->whereIn('edition', [$edition, 'both']);
    }

    public function getTitle(string $lang = 'bn'): string
    {
        if ($lang === 'en') {
            return $this->title_en
                ?: ($this->type === 'special_feature'
                    ? ($this->title_bn ?: 'Special Feature')
                    : ($this->category ? ($this->category->name_en ?: $this->category->name_bn) : 'Latest'))
                ?: 'Latest';
        }
        return $this->title_bn
            ?: ($this->category ? $this->category->name_bn : 'সর্বশেষ')
            ?: 'সর্বশেষ';
    }
}
