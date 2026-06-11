<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reporter extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'district_id',
        'name_bn',
        'name_en',
        'slug',
        'designation_bn',
        'designation_en',
        'bio_bn',
        'bio_en',
        'image',
        'email',
        'phone',
        'social_links',
        'is_active',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'social_links' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Link to User account
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    /**
     * Articles written by this reporter
     * Note: This assumes we link articles to reporters directly or via user_id
     */
    public function articles(): HasMany
    {
        // If we want to link articles to reporters, we might need a reporter_id in articles table.
        // For now, if user_id is present, we can find articles by user_id.
        return $this->hasMany(Article::class, 'author_id', 'user_id');
    }

    /**
     * Get name based on language
     */
    public function getName(string $lang = 'bn'): string
    {
        return $lang === 'en' ? $this->name_en : $this->name_bn;
    }

    /**
     * Get designation based on language
     */
    public function getDesignation(string $lang = 'bn'): ?string
    {
        return $lang === 'en' ? $this->designation_en : $this->designation_bn;
    }

    /**
     * Get bio based on language
     */
    public function getBio(string $lang = 'bn'): ?string
    {
        return $lang === 'en' ? $this->bio_en : $this->bio_bn;
    }
}
