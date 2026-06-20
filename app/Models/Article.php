<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Reporter;
use App\Models\Ad;

class Article extends Model
{
    protected $fillable = [
        'title_bn', 'title_en',
        'subtitle_bn', 'subtitle_en',
        'body_bn', 'body_en',
        'slug_bn', 'slug_en',
        'excerpt_bn', 'excerpt_en',
        'edition', 'article_type', 'status',
        'is_breaking', 'is_featured', 'is_premium', 'is_exclusive', 'allow_comments',
        'category_id', 'author_id', 'secondary_author_id', 'approver_id',
        'is_guest_author',
        'guest_author_name_bn', 'guest_author_name_en',
        'guest_author_bio_bn', 'guest_author_bio_en',
        'guest_author_image',
        'video_provider',
        'video_url',
        'video_duration',
        'featured_image',
        'featured_image_alt_bn', 'featured_image_alt_en',
        'featured_image_caption_bn', 'featured_image_caption_en',
        'views', 'shares_count', 'read_time_bn', 'read_time_en',
        'meta_title_bn', 'meta_title_en',
        'meta_description_bn', 'meta_description_en',
        'division', 'district', 'upazila',
        'published_at', 'scheduled_at',
        'in_article_ad_id', 'in_article_ad_position',
    ];

    protected $casts = [
        'is_breaking' => 'boolean',
        'is_featured' => 'boolean',
        'is_exclusive' => 'boolean',
        'is_premium' => 'boolean',
        'allow_comments' => 'boolean',
        'views' => 'integer',
        'shares_count' => 'integer',
        'read_time_bn' => 'integer',
        'read_time_en' => 'integer',
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'in_article_ad_position' => 'integer',
    ];

    /**
     * Category this article belongs to
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function inArticleAd(): BelongsTo
    {
        return $this->belongsTo(Ad::class, 'in_article_ad_id');
    }

    /**
     * All categories this article belongs to (via pivot)
     */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'article_category')
                    ->withPivot('is_primary', 'sort_order')
                    ->withTimestamps()
                    ->orderBy('article_category.sort_order');
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
     * Approver
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    /**
     * Tags associated with this article
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)->withTimestamps()->withPivot('edition');
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
     * Record a share and increment cached count
     */
    public function recordShare(string $platform): void
    {
        \DB::table('article_shares')->insert([
            'article_id'  => $this->id,
            'platform'    => $platform,
            'created_at'  => now(),
        ]);
        $this->increment('shares_count');
    }

    /**
     * Get per-platform share counts
     */
    public function sharesByPlatform(): array
    {
        return \DB::table('article_shares')
            ->where('article_id', $this->id)
            ->selectRaw('platform, count(*) as total')
            ->groupBy('platform')
            ->pluck('total', 'platform')
            ->toArray();
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
        return $query->with(['category', 'categories', 'author', 'secondaryAuthor', 'approver', 'tags', 'inArticleAd']);
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
        if ($this->is_guest_author) {
            $name = $edition === 'en'
                ? ($this->guest_author_name_en ?: $this->guest_author_name_bn)
                : ($this->guest_author_name_bn ?: $this->guest_author_name_en);

            return [
                'id'          => 0,
                'name'        => $name ?: ($edition === 'en' ? 'Guest Author' : 'অতিথি লেখক'),
                'slug'        => null,
                'designation' => null,
                'bio'         => $edition === 'en' ? ($this->guest_author_bio_en ?: $this->guest_author_bio_bn) : ($this->guest_author_bio_bn ?: $this->guest_author_bio_en),
                'image'       => $this->guest_author_image ?: null,
                'is_guest'    => true,
            ];
        }

        if (!$this->author) {
            return [
                'id' => 0,
                'name' => $edition === 'bn' ? 'নব দিগন্ত ডেস্ক' : 'Nobo Digonto Desk',
                'slug' => 'nobodigonto-desk',
                'designation' => null,
                'image' => null,
            ];
        }

        // Try to find reporter profile for this user
        $reporter = Reporter::with('district')->where('user_id', $this->author_id)->first();

        if ($reporter) {
            return [
                'id' => $reporter->id,
                'name' => $reporter->getName($edition),
                'slug' => $reporter->slug,
                'designation' => $reporter->getDesignation($edition),
                'image' => $reporter->image ?: null,
                'district' => $reporter->district
                    ? ($edition === 'en' ? $reporter->district->name_en : $reporter->district->name_bn)
                    : null,
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

    protected function resolveInArticleAd(string $edition): ?array
    {
        if (!$this->relationLoaded('inArticleAd') || !$this->inArticleAd) return null;
        $ad = $this->inArticleAd;
        $now = now();
        $active = $ad->is_active
            && (!$ad->start_date || $ad->start_date->lte($now))
            && (!$ad->end_date   || $ad->end_date->gte($now));
        if (!$active) return null;
        return [
            'id'        => $ad->id,
            'type'      => $ad->type,
            'image'     => $ad->image,
            'video_url' => $ad->video_url,
            'link'      => $ad->link,
            'code'      => $ad->code,
            'title'     => $ad->getTitle($edition),
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
            'video_provider' => $this->video_provider,
            'video_url' => $this->video_url,
            'video_duration' => $this->video_duration,
            'is_breaking' => $this->is_breaking,
            'is_featured' => $this->is_featured,
            'is_premium' => $this->is_premium,
            'allow_comments' => $this->allow_comments,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->getName($edition),
                'slug' => $this->category->slug,
            ],
            'categories' => $this->relationLoaded('categories')
                ? $this->categories->map(fn($cat) => [
                    'id'         => $cat->id,
                    'name'       => $cat->getName($edition),
                    'slug'       => $cat->slug,
                    'is_primary' => (bool) $cat->pivot->is_primary,
                    'parent_id'  => $cat->parent_id,
                ])->values()->toArray()
                : [],
            'author' => $this->getAuthorData($edition),
            'secondary_author' => $this->secondaryAuthor ? [
                'id'   => $this->secondaryAuthor->id,
                'name' => $this->secondaryAuthor->name,
                'slug' => strtolower(str_replace(' ', '-', $this->secondaryAuthor->name)),
                'image' => $this->secondaryAuthor->profile_photo_url ?? null,
            ] : null,
            'approver' => $this->approver ? [
                'id'        => $this->approver->id,
                'name'      => $this->approver->name,
                // Edition-specific code name (falls back to name on the frontend).
                'code_name' => $edition === 'en' ? $this->approver->code_name_en : $this->approver->code_name_bn,
            ] : null,
            'featured_image' => $this->featured_image,
            'featured_image_alt' => $this->getFeaturedImageAlt($edition),
            'featured_image_caption' => $edition === 'en' 
                ? $this->featured_image_caption_en 
                : $this->featured_image_caption_bn,
            'views' => $this->views,
            'shares_count' => $this->shares_count ?? 0,
            'read_time' => $edition === 'en' ? $this->read_time_en : $this->read_time_bn,
            'meta_title' => $this->getMetaTitle($edition),
            'meta_description' => $this->getMetaDescription($edition),
            'published_at' => $this->published_at?->toIso8601String(),
            'status' => $this->status,
            'in_article_ad' => $this->resolveInArticleAd($edition),
            'in_article_ad_position' => $this->in_article_ad_position ?? 4,
            'tags' => $this->tags
                ->filter(fn($tag) => $tag->pivot->edition === $edition)
                ->map(fn($tag) => [
                    'id' => $tag->id,
                    'name' => $edition === 'en' && $tag->name_en ? $tag->name_en : $tag->name_bn,
                    'slug' => $tag->slug,
                ])->values(),
        ];
    }
}
