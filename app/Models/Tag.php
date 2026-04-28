<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $fillable = [
        'name_bn',
        'name_en',
        'slug',
        'description_bn',
        'description_en',
        'article_count',
    ];

    protected $casts = [
        'article_count' => 'integer',
    ];

    /**
     * Articles with this tag
     */
    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class)->withTimestamps();
    }

    /**
     * Get tag name based on edition
     */
    public function getName(string $edition = 'bn'): string
    {
        return $edition === 'en' && $this->name_en 
            ? $this->name_en 
            : $this->name_bn;
    }

    /**
     * Get tag description based on edition
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
     * Increment article count
     */
    public function incrementArticleCount()
    {
        $this->increment('article_count');
    }

    /**
     * Decrement article count
     */
    public function decrementArticleCount()
    {
        $this->decrement('article_count');
    }
}
