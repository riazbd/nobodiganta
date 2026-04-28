<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Reporter;

class Article extends Model
{
    protected $fillable = [
        'title_bn', 'title_en',
        'subtitle_bn', 'subtitle_en',
        'body_bn', 'body_en',
        'slug_bn', 'slug_en',
        'excerpt_bn', 'excerpt_en',
        'edition', 'article_type', 'status',
        'is_breaking', 'is_featured', 'is_premium', 'is_exclusive',
        'category_id', 'subcategory_id', 'author_id', 'secondary_author_id',
        'is_guest_author',
        'guest_author_name_bn', 'guest_author_name_en',
        'guest_author_bio_bn', 'guest_author_bio_en',
        'guest_author_image',
        'video_provider',
        'featured_image',
        'featured_image_alt_bn', 'featured_image_alt_en',
        'featured_image_caption_bn', 'featured_image_caption_en',
        'views', 'read_time_bn', 'read_time_en',
        'meta_title_bn', 'meta_title_en',
        'meta_description_bn', 'meta_description_en',
        'division', 'district',
        'published_at', 'scheduled_at',
    ];

    protected $casts = [
        'is_breaking' => 'boolean',
        'is_featured' => 'boolean',
        'is_exclusive' => 'boolean',
        'is_premium' => 'boolean',
        'views' => 'integer',
        'read_time_bn' => 'integer',
        'read_time_en' => 'integer',
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
    ];

    /**
     * Category this article belongs to
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Subcategory this article belongs to
     */
    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'subcategory_id');
    }

    /**
     * Primary Author
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Secondary Author (Co-author)
     */
    public function secondaryAuthor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'secondary_author_id');
    }

    /**
     * Tags associated with this article
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps();
    }

    /**
     * Get title based on edition
     */
    public function getTitle(string $edition = 'bn'): string
    {
        return $edition === 'en' && $this->title_en 
            ? $this->title_en 
            : $this->title_bn;
    }

    /**
     * Get subtitle based on edition
     */
    public function getSubtitle(string $edition = 'bn'): ?string
    {
        if (!$this->subtitle_bn && !$this->subtitle_en) {
            return null;
        }
        
        return $edition === 'en' && $this->subtitle_en 
            ? $this->subtitle_en 
            : $this->subtitle_bn;
    }

    /**
     * Get body content based on edition
     */
    public function getBody(string $edition = 'bn'): string
    {
        return $edition === 'en' && $this->body_en 
            ? $this->body_en 
            : $this->body_bn;
    }

    /**
     * Get excerpt based on edition
     */
    public function getExcerpt(string $edition = 'bn'): ?string
    {
        if ($this->excerpt_bn || $this->excerpt_en) {
            return $edition === 'en' && $this->excerpt_en 
                ? $this->excerpt_en 
                : $this->excerpt_bn;
        }
        
        // Fallback: strip HTML from body and truncate
        $body = $this->getBody($edition);
        $plain = strip_tags($body);
        return mb_strlen($plain) > 200 
            ? mb_substr($plain, 0, 200) . '...' 
            : $plain;
    }

    /**
     * Get slug based on edition
     */
    public function getSlug(string $edition = 'bn'): string
    {
        return $edition === 'en' && $this->slug_en 
            ? $this->slug_en 
            : $this->slug_bn;
    }

    /**
     * Get meta title based on edition
     */
    public function getMetaTitle(string $edition = 'bn'): ?string
    {
        $metaTitle = $edition === 'en' ? $this->meta_title_en : $this->meta_title_bn;
        return $metaTitle ?: $this->getTitle($edition);
    }

    /**
     * Get meta description based on edition
     */
    public function getMetaDescription(string $edition = 'bn'): ?string
    {
        $metaDesc = $edition === 'en' ? $this->meta_description_en : $this->meta_description_bn;
        return $metaDesc ?: $this->getExcerpt($edition);
    }

    /**
     * Get featured image alt text based on edition
     */
    public function getFeaturedImageAlt(string $edition = 'bn'): string
    {
        return $edition === 'en' && $this->featured_image_alt_en 
            ? $this->featured_image_alt_en 
            : ($this->featured_image_alt_bn ?: $this->getTitle($edition));
    }

    /**
     * Increment view count
     */
    public function incrementViews()
    {
        $this->increment('views');
    }

    /**
     * Scope: Only published articles
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                     ->whereNotNull('published_at')
                     ->where('published_at', '<=', now());
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
     * Scope: Breaking news only
     */
    public function scopeBreaking($query)
    {
        return $query->where('is_breaking', true);
    }

    /**
     * Scope: Featured only
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope: Order by published_at descending
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('published_at', 'desc');
    }

    /**
     * Scope: Filter by article type
     */
    public function scopeType($query, string $type)
    {
        return $query->where('article_type', $type);
    }

    /**
     * Scope: With category and author relationships
     */
    public function scopeWithRelations($query)
    {
        return $query->with(['category', 'subcategory', 'author', 'tags']);
    }

    /**
     * Live blog updates
     */
    public function updates(): HasMany
    {
        return $this->hasMany(LiveBlogUpdate::class)->latest();
    }

    /**
     * Get author data including reporter profile if available
     */
    public function getAuthorData(string $edition = 'bn'): array
    {
        if (!$this->author) {
            return [
                'id' => 0,
                'name' => 'Nobo Digonto Desk',
                'slug' => 'nobodigonto-desk',
            ];
        }

        // Try to find reporter profile for this user
        $reporter = Reporter::where('user_id', $this->author_id)->first();

        if ($reporter) {
            return [
                'id' => $reporter->id,
                'name' => $reporter->getName($edition),
                'slug' => $reporter->slug,
                'designation' => $reporter->getDesignation($edition),
                'image' => $reporter->image,
            ];
        }

        return [
            'id' => $this->author->id,
            'name' => $this->author->name,
            'slug' => strtolower(str_replace(' ', '-', $this->author->name)),
            'designation' => null,
            'image' => null,
        ];
    }

    /**
     * Convert to array for API responses
     */
    public function toAPIArray(string $edition = 'bn'): array
    {
        return [
            'id' => $this->id,
            'title' => $this->getTitle($edition),
            'subtitle' => $this->getSubtitle($edition),
            'body' => $this->getBody($edition),
            'slug' => $this->getSlug($edition),
            'excerpt' => $this->getExcerpt($edition),
            'edition' => $this->edition,
            'article_type' => $this->article_type,
            'is_breaking' => $this->is_breaking,
            'is_featured' => $this->is_featured,
            'is_premium' => $this->is_premium,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->getName($edition),
                'slug' => $this->category->slug,
            ],
            'subcategory' => $this->subcategory ? [
                'id' => $this->subcategory->id,
                'name' => $this->subcategory->getName($edition),
                'slug' => $this->subcategory->slug,
            ] : null,
            'author' => $this->getAuthorData($edition),
            'featured_image' => $this->featured_image,
            'featured_image_alt' => $this->getFeaturedImageAlt($edition),
            'featured_image_caption' => $edition === 'en' 
                ? $this->featured_image_caption_en 
                : $this->featured_image_caption_bn,
            'views' => $this->views,
            'read_time' => $edition === 'en' ? $this->read_time_en : $this->read_time_bn,
            'meta_title' => $this->getMetaTitle($edition),
            'meta_description' => $this->getMetaDescription($edition),
            'published_at' => $this->published_at?->toIso8601String(),
            'tags' => $this->tags->map(fn($tag) => [
                'id' => $tag->id,
                'name' => $edition === 'en' && $tag->name_en ? $tag->name_en : $tag->name_bn,
                'slug' => $tag->slug,
            ]),
        ];
    }
}
