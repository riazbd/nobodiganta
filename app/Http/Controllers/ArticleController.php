<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\Services\ArticleStatusWorkflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ArticleController extends Controller
{
    /**
     * Display a listing of articles (admin)
     */
    public function index(Request $request)
    {
        if (!$request->user()->hasPermission('news.view')) {
            abort(403);
        }

        $status = $request->input('status');
        $edition = $request->input('edition', 'both');
        $category = $request->input('category');
        $search = $request->input('search');
        $articleType = $request->input('article_type');

        $query = Article::with(['category', 'author', 'tags'])
            ->latest();

        // Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // Filter by article type
        if ($articleType) {
            $query->where('article_type', $articleType);
        }

        // Filter by edition
        if ($edition !== 'both') {
            $query->where(function ($q) use ($edition) {
                $q->where('edition', 'both')
                  ->orWhere('edition', $edition);
            });
        }

        // Filter by category
        if ($category) {
            $query->where('category_id', $category);
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title_bn', 'like', "%{$search}%")
                  ->orWhere('title_en', 'like', "%{$search}%")
                  ->orWhere('slug_bn', 'like', "%{$search}%")
                  ->orWhere('slug_en', 'like', "%{$search}%");
            });
        }

        $articles = $query->limit(500)->get()->map(function ($article) {
            return [
                'id' => $article->id,
                'title' => $article->title_bn,
                'title_en' => $article->title_en,
                'slug' => $article->slug_bn,
                'slug_en' => $article->slug_en,
                'status' => $article->status,
                'edition' => $article->edition,
                'article_type' => $article->article_type,
                'is_breaking' => $article->is_breaking,
                'is_featured' => $article->is_featured,
                'is_premium' => $article->is_premium,
                'category' => $article->category ? [
                    'id' => $article->category->id,
                    'name' => $article->category->name_bn,
                    'name_en' => $article->category->name_en,
                    'slug' => $article->category->slug,
                ] : null,
                'author' => $article->author?->name,
                'views' => $article->views,
                'published_at' => $article->published_at?->toIso8601String(),
                'created_at' => $article->created_at->toIso8601String(),
            ];
        });

        // If JSON format requested, return JSON response
        if ($request->get('format') === 'json' || $request->expectsJson()) {
            $categories = Category::active()->ordered()->get(['id', 'name_bn', 'name_en', 'slug'])
                ->map(fn($c) => [
                    'id' => $c->id,
                    'name_bn' => $c->name_bn,
                    'name_en' => $c->name_en,
                    'slug' => $c->slug,
                ]);

            return response()->json([
                'articles' => $articles,
                'categories' => $categories,
            ]);
        }

        $categories = Category::active()->ordered()->get(['id', 'name_bn', 'slug']);

        return Inertia::render('features/admin/pages/content/AllNews', [
            'articles' => $articles,
            'categories' => $categories,
            'filters' => $request->only(['status', 'edition', 'category', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new article
     */
    public function create()
    {
        if (!auth()->user()->hasPermission('news.create')) {
            abort(403);
        }

        $categories = Category::active()->ordered()->get(['id', 'name_bn', 'name_en', 'slug']);
        $authors = User::whereIn('role', ['admin', 'editor', 'reporter'])
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('features/admin/pages/content/WriteNews', [
            'categories' => $categories,
            'authors' => $authors,
            'article' => null,
        ]);
    }

    /**
     * Store a newly created article
     */
    public function store(Request $request)
    {
        if (!$request->user()->hasPermission('news.create')) {
            abort(403);
        }

        $validated = $request->validate([
            // Content
            'titleBn' => 'nullable|required_if:edition,both,bn|string|max:255',
            'titleEn' => 'nullable|required_if:edition,both,en|string|max:255',
            'subtitleBn' => 'nullable|string',
            'subtitleEn' => 'nullable|string',
            'bodyBn' => 'nullable|required_if:edition,both,bn|string',
            'bodyEn' => 'nullable|required_if:edition,both,en|string',

            // Slugs
            'slugBn' => 'nullable|string|max:255',
            'slugEn' => 'nullable|string|max:255',

            // Excerpts
            'excerptBn' => 'nullable|string',
            'excerptEn' => 'nullable|string',

            // Edition & Type
            'edition' => 'required|in:both,bn,en',
            'articleType' => 'required|in:news,feature,opinion,interview,explainer,video,photo,liveblog,sponsored',
            'status' => 'required|in:draft,pending,scheduled,published,archived',

            // Flags
            'isBreaking' => 'boolean',
            'isFeatured' => 'boolean',
            'isPremium' => 'boolean',
            'isExclusive' => 'boolean',

            // Category (can be ID or slug)
            'category' => 'required',
            'subcategory' => 'nullable',
            'authorId' => 'nullable|exists:users,id',
            'secondaryAuthorId' => 'nullable|exists:users,id',

            // Media
            'featuredImage' => 'nullable|string',
            'featuredImageAltBn' => 'nullable|string|max:255',
            'featuredImageAltEn' => 'nullable|string|max:255',

            // Guest Author
            'isGuestAuthor' => 'boolean',
            'guestAuthorNameBn' => 'nullable|string|max:255',
            'guestAuthorNameEn' => 'nullable|string|max:255',
            'guestAuthorBioBn' => 'nullable|string',
            'guestAuthorBioEn' => 'nullable|string',
            'guestAuthorImage' => 'nullable|string',

            // SEO
            'metaTitleBn' => 'nullable|string|max:255',
            'metaTitleEn' => 'nullable|string|max:255',
            'metaDescBn' => 'nullable|string|max:500',
            'metaDescEn' => 'nullable|string|max:500',

            // Publishing
            'scheduledAt' => 'nullable|date|after:now',

            // Tags
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',

            // Notifications
            'sendPushNotification' => 'boolean',
        ]);

        // Resolve category from slug or ID
        $category = Category::where('slug', $validated['category'])
            ->orWhere('id', $validated['category'])
            ->first();

        if (!$category) {
            return back()->withErrors(['category' => 'Invalid category'])->withInput();
        }

        // Resolve subcategory
        $subcategoryId = null;
        if (!empty($validated['subcategory'])) {
            $sub = Category::where('parent_id', $category->id)
                ->where(function($q) use ($validated) {
                    $q->where('slug', $validated['subcategory'])
                      ->orWhere('id', $validated['subcategory']);
                })->first();
            $subcategoryId = $sub?->id;
        }

        // Auto-generate slugs if not provided
        $slugBn = $validated['slugBn'] ?? $this->generateSlug($validated['titleBn'], 'slug_bn');
        $slugEn = $validated['slugEn'] ?? ($validated['titleEn'] ? $this->generateSlug($validated['titleEn'], 'slug_en') : null);

        // Determine published_at and scheduled_at
        $publishedAt = null;
        $scheduledAt = null;

        if ($validated['status'] === 'published') {
            $publishedAt = now();
        } elseif ($validated['status'] === 'scheduled' && !empty($validated['scheduledAt'])) {
            $scheduledAt = $validated['scheduledAt'];
            $validated['status'] = 'scheduled';
        }

        // Create article
        $article = Article::create([
            'title_bn' => $validated['titleBn'],
            'title_en' => $validated['titleEn'] ?? null,
            'subtitle_bn' => $validated['subtitleBn'] ?? null,
            'subtitle_en' => $validated['subtitleEn'] ?? null,
            'body_bn' => $validated['bodyBn'],
            'body_en' => $validated['bodyEn'] ?? null,
            'slug_bn' => $slugBn,
            'slug_en' => $slugEn,
            'excerpt_bn' => $validated['excerptBn'] ?? null,
            'excerpt_en' => $validated['excerptEn'] ?? null,
            'edition' => $validated['edition'],
            'article_type' => $validated['articleType'],
            'status' => $validated['status'],
            'is_breaking' => $validated['isBreaking'] ?? false,
            'is_featured' => $validated['isFeatured'] ?? false,
            'is_premium' => $validated['isPremium'] ?? false,
            'is_exclusive' => $validated['isExclusive'] ?? false,
            'category_id' => $category->id,
            'subcategory_id' => $subcategoryId,
            'author_id' => $validated['authorId'] ?? Auth::id(),
            'secondary_author_id' => $validated['secondaryAuthorId'] ?? null,
            'is_guest_author' => $validated['isGuestAuthor'] ?? false,
            'guest_author_name_bn' => $validated['guestAuthorNameBn'] ?? null,
            'guest_author_name_en' => $validated['guestAuthorNameEn'] ?? null,
            'guest_author_bio_bn' => $validated['guestAuthorBioBn'] ?? null,
            'guest_author_bio_en' => $validated['guestAuthorBioEn'] ?? null,
            'guest_author_image' => $validated['guestAuthorImage'] ?? null,
            'featured_image' => $validated['featuredImage'] ?? null,
            'featured_image_alt_bn' => $validated['featuredImageAltBn'] ?? null,
            'featured_image_alt_en' => $validated['featuredImageAltEn'] ?? null,
            'meta_title_bn' => $validated['metaTitleBn'] ?? null,
            'meta_title_en' => $validated['metaTitleEn'] ?? null,
            'meta_description_bn' => $validated['metaDescBn'] ?? null,
            'meta_description_en' => $validated['metaDescEn'] ?? null,
            'published_at' => $publishedAt,
            'scheduled_at' => $scheduledAt,
        ]);

        // Sync tags
        if (!empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = \App\Models\Tag::firstOrCreate(
                    ['slug' => \Illuminate\Support\Str::slug($tagName)],
                    ['name_bn' => $tagName, 'name_en' => $tagName]
                );
                $tagIds[] = $tag->id;
            }
            $article->tags()->sync($tagIds);
        } else {
            $article->tags()->sync([]);
        }

        // Handle push notification for breaking news
        if ($article->is_breaking && ($validated['sendPushNotification'] ?? false)) {
            // TODO: Dispatch push notification job
            // BreakingNewsNotification::dispatch($article);
        }

        if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'success' => true,
                'article' => $article->load(['category', 'author', 'tags']),
            ], 201);
        }

        return redirect()->route('admin.news')
            ->with('success', 'Article created successfully');
    }

    /**
     * Display the specified article
     */
    public function show(Article $article)
    {
        return Inertia::render('features/admin/pages/content/ViewArticle', [
            'article' => $article->load(['category', 'author', 'tags']),
        ]);
    }

    /**
     * Show the form for editing the specified article
     */
    public function edit(Article $article)
    {
        if (!auth()->user()->hasPermission('news.edit')) {
            // Check if it's their own article and they have edit.own
            if (!($article->author_id === auth()->id() && auth()->user()->hasPermission('news.edit.own'))) {
                abort(403);
            }
        }

        $categories = Category::active()->ordered()->get(['id', 'name_bn', 'name_en', 'slug']);
        $authors = User::whereIn('role', ['admin', 'editor', 'reporter'])
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('features/admin/pages/content/WriteNews', [
            'categories' => $categories,
            'authors' => $authors,
            'article' => [
                'id' => $article->id,
                'titleBn' => $article->title_bn,
                'titleEn' => $article->title_en,
                'subtitleBn' => $article->subtitle_bn,
                'subtitleEn' => $article->subtitle_en,
                'bodyBn' => $article->body_bn,
                'bodyEn' => $article->body_en,
                'slugBn' => $article->slug_bn,
                'slugEn' => $article->slug_en,
                'excerptBn' => $article->excerpt_bn,
                'excerptEn' => $article->excerpt_en,
                'edition' => $article->edition,
                'articleType' => $article->article_type,
                'status' => $article->status,
                'isBreaking' => $article->is_breaking,
                'isFeatured' => $article->is_featured,
                'isExclusive' => $article->is_exclusive,
                'isPremium' => $article->is_premium,
                'category' => $article->category_id,
                'subcategory' => $article->subcategory_id,
                'authorId' => $article->author_id,
                'secondaryAuthorId' => $article->secondary_author_id,
                'isGuestAuthor' => (bool)$article->is_guest_author,
                'guestAuthorNameBn' => $article->guest_author_name_bn,
                'guestAuthorNameEn' => $article->guest_author_name_en,
                'guestAuthorBioBn' => $article->guest_author_bio_bn,
                'guestAuthorBioEn' => $article->guest_author_bio_en,
                'guestAuthorImage' => $article->guest_author_image,
                'featuredImage' => $article->featured_image,
                'featuredImageAltBn' => $article->featured_image_alt_bn,
                'featuredImageAltEn' => $article->featured_image_alt_en,
                'metaTitleBn' => $article->meta_title_bn,
                'metaTitleEn' => $article->meta_title_en,
                'metaDescBn' => $article->meta_description_bn,
                'metaDescEn' => $article->meta_description_en,
                'scheduledAt' => $article->scheduled_at?->format('Y-m-d\TH:i'),
            ],
        ]);
    }

    /**
     * Update the specified article
     */
    public function update(Request $request, Article $article)
    {
        if (!$request->user()->hasPermission('news.edit')) {
             if (!($article->author_id === auth()->id() && $request->user()->hasPermission('news.edit.own'))) {
                abort(403);
            }
        }

        $validated = $request->validate([
            // Content
            'titleBn' => 'nullable|required_if:edition,both,bn|string|max:255',
            'titleEn' => 'nullable|required_if:edition,both,en|string|max:255',
            'subtitleBn' => 'nullable|string',
            'subtitleEn' => 'nullable|string',
            'bodyBn' => 'nullable|required_if:edition,both,bn|string',
            'bodyEn' => 'nullable|required_if:edition,both,en|string',
            
            // Slugs
            'slugBn' => 'nullable|string|max:255',
            'slugEn' => 'nullable|string|max:255',
            
            // Excerpts
            'excerptBn' => 'nullable|string',
            'excerptEn' => 'nullable|string',
            
            // Edition & Type
            'edition' => 'required|in:both,bn,en',
            'articleType' => 'required|in:news,feature,opinion,interview,explainer,video,photo,liveblog,sponsored',
            'status' => 'required|in:draft,pending,scheduled,published,archived',
            
            // Flags
            'isBreaking' => 'boolean',
            'isFeatured' => 'boolean',
            'isPremium' => 'boolean',
            'isExclusive' => 'boolean',
            
            // Category (can be ID or slug)
            'category' => 'required',
            'subcategory' => 'nullable',
            'authorId' => 'nullable|exists:users,id',
            'secondaryAuthorId' => 'nullable|exists:users,id',
            
            // Media
            'featuredImage' => 'nullable|string',
            'featuredImageAltBn' => 'nullable|string|max:255',
            'featuredImageAltEn' => 'nullable|string|max:255',

            // Guest Author
            'isGuestAuthor' => 'boolean',
            'guestAuthorNameBn' => 'nullable|string|max:255',
            'guestAuthorNameEn' => 'nullable|string|max:255',
            'guestAuthorBioBn' => 'nullable|string',
            'guestAuthorBioEn' => 'nullable|string',
            'guestAuthorImage' => 'nullable|string',

            // SEO
            'metaTitleBn' => 'nullable|string|max:255',
            'metaTitleEn' => 'nullable|string|max:255',
            'metaDescBn' => 'nullable|string|max:500',
            'metaDescEn' => 'nullable|string|max:500',
            
            // Publishing
            'scheduledAt' => 'nullable|date',

            // Tags
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',

            // Notifications
            'sendPushNotification' => 'boolean',
        ]);

        // Resolve category from slug or ID
        $category = Category::where('slug', $validated['category'])
            ->orWhere('id', $validated['category'])
            ->first();

        if (!$category) {
            return back()->withErrors(['category' => 'Invalid category'])->withInput();
        }

        // Resolve subcategory
        $subcategoryId = null;
        if (!empty($validated['subcategory'])) {
            $sub = Category::where('parent_id', $category->id)
                ->where(function($q) use ($validated) {
                    $q->where('slug', $validated['subcategory'])
                      ->orWhere('id', $validated['subcategory']);
                })->first();
            $subcategoryId = $sub?->id;
        }

        // Auto-generate slugs if not provided or changed
        $slugBn = $validated['slugBn'] ?? $this->generateSlug($validated['titleBn'], 'slug_bn', $article->id);
        $slugEn = $validated['slugEn'] ?? ($validated['titleEn'] ? $this->generateSlug($validated['titleEn'], 'slug_en', $article->id) : $article->slug_en);

        // Update published_at when status changes to published
        $publishedAt = $article->published_at;
        $scheduledAt = $article->scheduled_at;

        if ($validated['status'] === 'published' && !$publishedAt) {
            $publishedAt = now();
        } elseif ($validated['status'] === 'scheduled' && !empty($validated['scheduledAt'])) {
            $scheduledAt = $validated['scheduledAt'];
            $publishedAt = null; // Unpublish if rescheduling
        }

        // Update article
        $article->update([
            'title_bn' => $validated['titleBn'],
            'title_en' => $validated['titleEn'] ?? null,
            'subtitle_bn' => $validated['subtitleBn'] ?? null,
            'subtitle_en' => $validated['subtitleEn'] ?? null,
            'body_bn' => $validated['bodyBn'],
            'body_en' => $validated['bodyEn'] ?? null,
            'slug_bn' => $slugBn,
            'slug_en' => $slugEn,
            'excerpt_bn' => $validated['excerptBn'] ?? null,
            'excerpt_en' => $validated['excerptEn'] ?? null,
            'edition' => $validated['edition'],
            'article_type' => $validated['articleType'],
            'status' => $validated['status'],
            'is_breaking' => $validated['isBreaking'] ?? false,
            'is_featured' => $validated['isFeatured'] ?? false,
            'is_premium' => $validated['isPremium'] ?? false,
            'is_exclusive' => $validated['isExclusive'] ?? false,
            'category_id' => $category->id,
            'subcategory_id' => $subcategoryId,
            'author_id' => $validated['authorId'] ?? $article->author_id,
            'secondary_author_id' => $validated['secondaryAuthorId'] ?? null,
            'is_guest_author' => $validated['isGuestAuthor'] ?? false,
            'guest_author_name_bn' => $validated['guestAuthorNameBn'] ?? null,
            'guest_author_name_en' => $validated['guestAuthorNameEn'] ?? null,
            'guest_author_bio_bn' => $validated['guestAuthorBioBn'] ?? null,
            'guest_author_bio_en' => $validated['guestAuthorBioEn'] ?? null,
            'guest_author_image' => $validated['guestAuthorImage'] ?? null,
            'featured_image' => $validated['featuredImage'] ?? null,
            'featured_image_alt_bn' => $validated['featuredImageAltBn'] ?? null,
            'featured_image_alt_en' => $validated['featuredImageAltEn'] ?? null,
            'meta_title_bn' => $validated['metaTitleBn'] ?? null,
            'meta_title_en' => $validated['metaTitleEn'] ?? null,
            'meta_description_bn' => $validated['metaDescBn'] ?? null,
            'meta_description_en' => $validated['metaDescEn'] ?? null,
            'published_at' => $publishedAt,
            'scheduled_at' => $scheduledAt,
        ]);

        // Sync tags
        if (!empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = \App\Models\Tag::firstOrCreate(
                    ['slug' => \Illuminate\Support\Str::slug($tagName)],
                    ['name_bn' => $tagName, 'name_en' => $tagName]
                );
                $tagIds[] = $tag->id;
            }
            $article->tags()->sync($tagIds);
        } else {
            $article->tags()->sync([]);
        }

        // Handle push notification for breaking news
        if ($article->is_breaking && ($validated['sendPushNotification'] ?? false) && $article->wasChanged('status')) {
            // TODO: Dispatch push notification job
            // BreakingNewsNotification::dispatch($article);
        }

        if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'success' => true,
                'article' => $article->fresh()->load(['category', 'author', 'tags']),
            ]);
        }

        return redirect()->route('admin.news')
            ->with('success', 'Article updated successfully');
    }

    /**
     * Remove the specified article
     */
    public function destroy(Request $request, Article $article)
    {
        if (!$request->user()->hasPermission('news.delete')) {
            if (!($article->author_id === auth()->id() && $request->user()->hasPermission('news.delete.own'))) {
                abort(403);
            }
        }

        $article->delete();

        if ($request->expectsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'success' => true,
                'message' => 'Article deleted successfully',
            ]);
        }

        return redirect()->route('admin.news')
            ->with('success', 'Article deleted successfully');
    }

    /**
     * Generate unique slug
     */
    protected function generateSlug(string $title, string $column, ?int $excludeId = null): string
    {
        // Unicode-friendly slugify: keep letters, numbers, spaces and dashes
        $slug = mb_strtolower($title, 'UTF-8');
        $slug = preg_replace('/[^\p{L}\p{N}\s-]+/u', '', $slug);
        $slug = preg_replace('/\s+/u', '-', $slug);
        $slug = preg_replace('/-+/u', '-', $slug);
        $slug = trim($slug, '-');

        // Fallback for empty slug
        if (empty($slug)) {
            $slug = Str::random(8);
        }

        $originalSlug = $slug;
        $counter = 1;

        $query = Article::where($column, $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $query = Article::where($column, $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
            $counter++;
        }

        return $slug;
    }

    /**
     * Bulk update article status
     */
    public function bulkUpdateStatus(Request $request)
    {
        if (!$request->user()->hasPermission('news.approve') && !$request->user()->hasPermission('news.publish')) {
            abort(403);
        }

        $validated = $request->validate([
            'article_ids' => 'required|array',
            'article_ids.*' => 'exists:articles,id',
            'status' => 'required|in:draft,pending,published,archived',
        ]);

        $updateData = [];
        if ($validated['status'] === 'published') {
            $updateData['published_at'] = now();
        }

        Article::whereIn('id', $validated['article_ids'])
            ->update(array_merge($updateData, ['status' => $validated['status']]));

        return back()->with('success', count($validated['article_ids']) . ' articles updated');
    }

    /**
     * Publish scheduled articles (called by scheduler)
     */
    public function publishScheduled()
    {
        $count = Article::where('status', 'scheduled')
            ->where('scheduled_at', '<=', now())
            ->update([
                'status' => 'published',
                'published_at' => now(),
            ]);

        return response()->json(['published' => $count]);
    }

    /**
     * Transition article status (with workflow validation)
     */
    public function transitionStatus(Request $request, Article $article)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,pending,scheduled,published,archived',
        ]);

        $result = ArticleStatusWorkflow::transition($article, $validated['status']);

        if ($result['success']) {
            return response()->json($result);
        }

        return response()->json($result, 403);
    }

    /**
     * Get allowed transitions for an article
     */
    public function getAllowedTransitions(Article $article)
    {
        $transitions = ArticleStatusWorkflow::getAllowedTransitions($article);

        return response()->json([
            'current_status' => $article->status,
            'allowed_transitions' => $transitions,
            'transitions_with_labels' => array_map(function ($status) {
                return [
                    'status' => $status,
                    'label_bn' => ArticleStatusWorkflow::getStatusLabel($status, 'bn'),
                    'label_en' => ArticleStatusWorkflow::getStatusLabel($status, 'en'),
                    'color' => ArticleStatusWorkflow::getStatusColor($status),
                ];
            }, $transitions),
        ]);
    }
}
