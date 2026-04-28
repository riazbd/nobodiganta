<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveBlogUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'article_id',
        'headline_bn',
        'headline_en',
        'body_bn',
        'body_en',
        'author_name_bn',
        'author_name_en',
        'is_key_event',
    ];

    protected $casts = [
        'is_key_event' => 'boolean',
    ];

    /**
     * The article this update belongs to.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * Get headline based on edition
     */
    public function getHeadline(string $edition = 'bn'): ?string
    {
        return $edition === 'en' ? $this->headline_en : $this->headline_bn;
    }

    /**
     * Get body based on edition
     */
    public function getBody(string $edition = 'bn'): string
    {
        return $edition === 'en' ? $this->body_en : $this->body_bn;
    }

    /**
     * Get author name based on edition
     */
    public function getAuthorName(string $edition = 'bn'): ?string
    {
        return $edition === 'en' ? $this->author_name_en : $this->author_name_bn;
    }
}
