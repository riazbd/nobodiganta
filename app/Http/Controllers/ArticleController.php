<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\Models\AuditLog;
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

        $status      = $request->input('status');
        $edition     = $request->input('edition', 'all');
        $category    = $request->input('category');
        $search      = $request->input('search');
        $articleType = $request->input('article_type');
        $authorId    = $request->input('author');
        $division    = $request->input('division');
        $district    = $request->input('district');
        $locCategory = $request->input('location_category');
        $dateFrom    = $request->input('date_from');
        $dateTo      = $request->input('date_to');
        $sortBy      = in_array($request->input('sort_by'), ['created_at', 'published_at', 'views', 'title_bn']) ? $request->input('sort_by') : 'created_at';
        $sortDir     = $request->input('sort_dir') === 'asc' ? 'asc' : 'desc';
        $perPage     = in_array((int) $request->input('per_page'), [10, 20, 50, 100]) ? (int) $request->input('per_page') : 20;

        $query = Article::with(['category', 'author'])
            ->orderBy($sortBy, $sortDir);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($articleType && $articleType !== 'all') {
            $query->where('article_type', $articleType);
        }

        if ($edition && $edition !== 'all') {
            $query->where(function ($q) use ($edition) {
                $q->where('edition', 'both')->orWhere('edition', $edition);
            });
        }

        if ($category && $category !== 'all') {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category)->orWhere('id', $category);
            });
        }

        if ($authorId && $authorId !== 'all') {
            $query->where('author_id', $authorId);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title_bn', 'like', "%{$search}%")
                  ->orWhere('title_en', 'like', "%{$search}%")
                  ->orWhereHas('author', fn($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($division && $division !== 'all') {
            $query->where('division', $division);
        }

        if ($district && $district !== 'all') {
            $query->where('district', $district);
        }

        if ($locCategory) {
            $query->whereHas('categories', fn($q) => $q->where('slug', $locCategory));
        }

        $articles = $query->paginate($perPage)->withQueryString();

        $articles->getCollection()->transform(function ($article) {
            return [
                'id'           => $article->id,
                'title'        => $article->title_bn,
                'title_en'     => $article->title_en,
                'slug'         => $article->slug_bn,
                'slug_en'      => $article->slug_en,
                'status'       => $article->status,
                'edition'      => $article->edition,
                'article_type' => $article->article_type,
                'is_breaking'  => $article->is_breaking,
                'is_featured'  => $article->is_featured,
                'is_premium'   => $article->is_premium,
                'category'     => $article->category ? [
                    'id'         => $article->category->id,
                    'name'       => $article->category->name_bn,
                    'name_en'    => $article->category->name_en,
                    'slug'       => $article->category->slug,
                    'color_code' => $article->category->color_code,
                ] : null,
                'author'         => $article->author?->name,
                'author_id'      => $article->author_id,
                'views'          => $article->views,
                'featured_image' => $article->featured_image,
                'published_at'   => $article->published_at?->toIso8601String(),
                'created_at'     => $article->created_at->toIso8601String(),
            ];
        });

        $authors = User::whereIn('role', ['admin', 'editor', 'reporter'])
            ->orderBy('name')->get(['id', 'name']);

        if ($request->wantsJson()) {
            return response()->json(['articles' => $articles]);
        }

        $saradeshCat = Category::with(['children' => function ($q) {
            $q->withCount('articles')->with(['children' => function ($q2) {
                $q2->withCount('articles')->orderBy('sort_order');
            }])->orderBy('sort_order');
        }])->withCount('articles')->where('slug', 'saradesh')->first();

        return Inertia::render('features/admin/pages/content/AllNews', [
            'articles'      => $articles,
            'categories'    => Category::active()->editorial()->ordered()->get(['id', 'name_bn', 'name_en', 'slug']),
            'authors'       => $authors,
            'divisions'     => Category::whereHas('parent', fn($q) => $q->where('slug', 'saradesh'))
                ->orderBy('sort_order')
                ->get()
                ->map(fn($c) => [
                    'slug'    => str_replace('division-', '', $c->slug),
                    'name_bn' => $c->name_bn,
                    'name_en' => $c->name_en,
                ])
                ->toArray(),
            'locationTree'  => $saradeshCat,
            'filters'       => $request->only(['status', 'edition', 'category', 'search', 'article_type', 'author', 'date_from', 'date_to', 'sort_by', 'sort_dir', 'per_page', 'division', 'district', 'location_category']),
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

        $categories = Category::active()->ordered()->get(['id', 'name_bn', 'name_en', 'slug', 'parent_id']);
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
            'titleBn' => 'nullable|required_if:edition,both,bn|string|max:255',
            'titleEn' => 'nullable|required_if:edition,both,en|string|max:255',
            'subtitleBn' => 'nullable|string',
            'subtitleEn' => 'nullable|string',
            'bodyBn' => 'nullable|required_if:edition,both,bn|string',
            'bodyEn' => 'nullable|required_if:edition,both,en|string',
            'slugBn' => 'nullable|string|max:255',
            'slugEn' => 'nullable|string|max:255',
            'excerptBn' => 'nullable|string',
            'excerptEn' => 'nullable|string',
            'edition' => 'required|in:both,bn,en',
            'articleType' => 'required|in:news,feature,opinion,interview,explainer,video,photo,liveblog,sponsored',
            'status' => 'required|in:draft,pending,scheduled,published,archived',
            'isBreaking' => 'boolean',
            'isFeatured' => 'boolean',
            'isPremium' => 'boolean',
            'isExclusive' => 'boolean',
            'categories' => 'required|array|min:1',
            'categories.*' => 'integer|exists:categories,id',
            'primaryCategory' => 'required|integer|exists:categories,id',
            'authorId' => 'nullable|exists:users,id',
            'secondaryAuthorId' => 'nullable|exists:users,id',
            'featuredImage' => 'nullable|string',
            'featuredImageAltBn' => 'nullable|string|max:255',
            'featuredImageAltEn' => 'nullable|string|max:255',
            'featuredImageCaptionBn' => 'nullable|string|max:500',
            'featuredImageCaptionEn' => 'nullable|string|max:500',
            'isGuestAuthor' => 'boolean',
            'guestAuthorNameBn' => 'nullable|string|max:255',
            'guestAuthorNameEn' => 'nullable|string|max:255',
            'guestAuthorBioBn' => 'nullable|string',
            'guestAuthorBioEn' => 'nullable|string',
            'guestAuthorImage' => 'nullable|string',
            'metaTitleBn' => 'nullable|string|max:255',
            'metaTitleEn' => 'nullable|string|max:255',
            'metaDescBn' => 'nullable|string|max:500',
            'metaDescEn' => 'nullable|string|max:500',
            'scheduledAt' => 'nullable|date',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'sendPushNotification' => 'boolean',
            'allowComments' => 'boolean',
            'videoUrl' => 'nullable|url',
            'videoProvider' => 'nullable|string',
            'videoDuration' => 'nullable|string|max:10',
        ]);

        $categoryIds = $validated['categories'];
        $primaryId   = (int) $validated['primaryCategory'];

        if (!in_array($primaryId, $categoryIds)) {
            return back()->withErrors(['primaryCategory' => 'Primary category must be one of the selected categories'])->withInput();
        }

        $slugBn = $validated['slugBn'] ?? $this->generateSlug($validated['titleBn'] ?? '', 'slug_bn');
        $slugEn = $validated['slugEn'] ?? ($validated['titleEn'] ? $this->generateSlug($validated['titleEn'], 'slug_en') : null);

        $publishedAt = ($validated['status'] === 'published') ? now() : null;
        $scheduledAt = ($validated['status'] === 'scheduled') ? $validated['scheduledAt'] : null;

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
            'allow_comments' => $validated['allowComments'] ?? true,
            'video_url' => $validated['videoUrl'] ?? null,
            'video_provider' => $validated['videoProvider'] ?? null,
            'video_duration' => $validated['videoDuration'] ?? null,
            'category_id' => $primaryId,
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
            'featured_image_caption_bn' => $validated['featuredImageCaptionBn'] ?? null,
            'featured_image_caption_en' => $validated['featuredImageCaptionEn'] ?? null,
            'meta_title_bn' => $validated['metaTitleBn'] ?? null,
            'meta_title_en' => $validated['metaTitleEn'] ?? null,
            'meta_description_bn' => $validated['metaDescBn'] ?? null,
            'meta_description_en' => $validated['metaDescEn'] ?? null,
            'published_at' => $publishedAt,
            'scheduled_at' => $scheduledAt,
        ]);

        $expandedIds = $this->expandCategoriesWithAncestors($categoryIds);
        $this->syncCategoryPivot($article, $expandedIds, $primaryId);
        $this->deriveAndSyncLocation($article, $expandedIds);

        if (!empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                if (empty($tagName)) continue;
                $tag = Tag::firstOrCreate(
                    ['slug' => Str::slug($tagName)],
                    ['name_bn' => $tagName, 'name_en' => $tagName]
                );
                $tagIds[] = $tag->id;
            }
            $article->tags()->sync($tagIds);
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'event' => 'article.created',
            'description' => "Created article: {$article->title_bn}",
            'properties' => ['article_id' => $article->id],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true, 'article' => $article], 201);
        }

        return redirect()->route('admin.news.edit', $article)->with('success', 'Article created successfully');
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
            if (!($article->author_id === auth()->id() && auth()->user()->hasPermission('news.edit.own'))) {
                abort(403);
            }
        }

        $categories = Category::active()->ordered()->get(['id', 'name_bn', 'name_en', 'slug', 'parent_id']);
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
                'allowComments' => (bool)$article->allow_comments,
                'videoUrl' => $article->video_url,
                'videoProvider' => $article->video_provider,
                'videoDuration' => $article->video_duration,
                'categories' => $article->load('categories')->categories->pluck('id')->toArray(),
                'primaryCategory' => $article->category_id,
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
                'featuredImageCaptionBn' => $article->featured_image_caption_bn,
                'featuredImageCaptionEn' => $article->featured_image_caption_en,
                'metaTitleBn' => $article->meta_title_bn,
                'metaTitleEn' => $article->meta_title_en,
                'metaDescBn' => $article->meta_description_bn,
                'metaDescEn' => $article->meta_description_en,
                'scheduledAt' => $article->scheduled_at?->format('Y-m-d\TH:i'),
                'tags' => $article->tags->pluck('name_bn')->toArray(),
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
            'titleBn' => 'nullable|required_if:edition,both,bn|string|max:255',
            'titleEn' => 'nullable|required_if:edition,both,en|string|max:255',
            'subtitleBn' => 'nullable|string',
            'subtitleEn' => 'nullable|string',
            'bodyBn' => 'nullable|required_if:edition,both,bn|string',
            'bodyEn' => 'nullable|required_if:edition,both,en|string',
            'slugBn' => 'nullable|string|max:255',
            'slugEn' => 'nullable|string|max:255',
            'excerptBn' => 'nullable|string',
            'excerptEn' => 'nullable|string',
            'edition' => 'required|in:both,bn,en',
            'articleType' => 'required|in:news,feature,opinion,interview,explainer,video,photo,liveblog,sponsored',
            'status' => 'required|in:draft,pending,scheduled,published,archived',
            'isBreaking' => 'boolean',
            'isFeatured' => 'boolean',
            'isPremium' => 'boolean',
            'isExclusive' => 'boolean',
            'categories' => 'required|array|min:1',
            'categories.*' => 'integer|exists:categories,id',
            'primaryCategory' => 'required|integer|exists:categories,id',
            'authorId' => 'nullable|exists:users,id',
            'secondaryAuthorId' => 'nullable|exists:users,id',
            'featuredImage' => 'nullable|string',
            'featuredImageAltBn' => 'nullable|string|max:255',
            'featuredImageAltEn' => 'nullable|string|max:255',
            'featuredImageCaptionBn' => 'nullable|string|max:500',
            'featuredImageCaptionEn' => 'nullable|string|max:500',
            'isGuestAuthor' => 'boolean',
            'guestAuthorNameBn' => 'nullable|string|max:255',
            'guestAuthorNameEn' => 'nullable|string|max:255',
            'guestAuthorBioBn' => 'nullable|string',
            'guestAuthorBioEn' => 'nullable|string',
            'guestAuthorImage' => 'nullable|string',
            'metaTitleBn' => 'nullable|string|max:255',
            'metaTitleEn' => 'nullable|string|max:255',
            'metaDescBn' => 'nullable|string|max:500',
            'metaDescEn' => 'nullable|string|max:500',
            'scheduledAt' => 'nullable|date',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'sendPushNotification' => 'boolean',
            'allowComments' => 'boolean',
            'videoUrl' => 'nullable|url',
            'videoProvider' => 'nullable|string',
            'videoDuration' => 'nullable|string|max:10',
        ]);

        $categoryIds = $validated['categories'];
        $primaryId   = (int) $validated['primaryCategory'];

        if (!in_array($primaryId, $categoryIds)) {
            return back()->withErrors(['primaryCategory' => 'Primary category must be one of the selected categories']);
        }

        $slugBn = $validated['slugBn'] ?? $this->generateSlug($validated['titleBn'] ?? '', 'slug_bn', $article->id);
        $slugEn = $validated['slugEn'] ?? ($validated['titleEn'] ? $this->generateSlug($validated['titleEn'], 'slug_en', $article->id) : $article->slug_en);

        $publishedAt = $article->published_at;
        $scheduledAt = $article->scheduled_at;

        if ($validated['status'] === 'published' && !$publishedAt) {
            $publishedAt = now();
        } elseif ($validated['status'] === 'scheduled' && !empty($validated['scheduledAt'])) {
            $scheduledAt = $validated['scheduledAt'];
            $publishedAt = null;
        }

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
            'allow_comments' => $validated['allowComments'] ?? true,
            'video_url' => $validated['videoUrl'] ?? null,
            'video_provider' => $validated['videoProvider'] ?? null,
            'video_duration' => $validated['videoDuration'] ?? null,
            'category_id' => $primaryId,
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
            'featured_image_caption_bn' => $validated['featuredImageCaptionBn'] ?? null,
            'featured_image_caption_en' => $validated['featuredImageCaptionEn'] ?? null,
            'meta_title_bn' => $validated['metaTitleBn'] ?? null,
            'meta_title_en' => $validated['metaTitleEn'] ?? null,
            'meta_description_bn' => $validated['metaDescBn'] ?? null,
            'meta_description_en' => $validated['metaDescEn'] ?? null,
            'published_at' => $publishedAt,
            'scheduled_at' => $scheduledAt,
        ]);

        $expandedIds = $this->expandCategoriesWithAncestors($categoryIds);
        $this->syncCategoryPivot($article, $expandedIds, $primaryId);
        $this->deriveAndSyncLocation($article, $expandedIds);

        if (isset($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                if (empty($tagName)) continue;
                $tag = Tag::firstOrCreate(['slug' => Str::slug($tagName)], ['name_bn' => $tagName, 'name_en' => $tagName]);
                $tagIds[] = $tag->id;
            }
            $article->tags()->sync($tagIds);
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'event' => 'article.updated',
            'description' => "Updated article: {$article->title_bn}",
            'properties' => ['article_id' => $article->id],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($request->wantsJson() && !$request->header('X-Inertia')) {
            return response()->json(['success' => true, 'article' => $article->fresh()->load(['category', 'author', 'tags'])]);
        }

        return back()->with('success', 'Article updated successfully');
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

        $title = $article->title_bn;
        $article->delete();

        AuditLog::create([
            'user_id' => Auth::id(),
            'event' => 'article.deleted',
            'description' => "Deleted article: {$title}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'message' => 'Article deleted successfully']);
        }

        return back()->with('success', 'Article deleted successfully');
    }

    /**
     * Remove multiple articles
     */
    public function bulkDestroy(Request $request)
    {
        if (!$request->user()->hasPermission('news.delete')) {
            abort(403);
        }

        $validated = $request->validate([
            'article_ids' => 'required|array',
            'article_ids.*' => 'exists:articles,id',
        ]);

        $count = Article::whereIn('id', $validated['article_ids'])->count();
        Article::whereIn('id', $validated['article_ids'])->delete();

        AuditLog::create([
            'user_id' => Auth::id(),
            'event' => 'article.bulk_deleted',
            'description' => "Bulk deleted {$count} articles",
            'properties' => ['count' => $count],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', "{$count} articles deleted successfully");
    }

    private function syncCategoryPivot(Article $article, array $expandedIds, int $primaryId): void
    {
        $pivotData = [];
        foreach ($expandedIds as $i => $catId) {
            $pivotData[$catId] = [
                'is_primary' => $catId === $primaryId,
                'sort_order' => $catId === $primaryId ? 0 : $i + 1,
            ];
        }
        $article->categories()->sync($pivotData);
    }

    private function expandCategoriesWithAncestors(array $categoryIds): array
    {
        if (empty($categoryIds)) return [];

        $allIds    = array_values(array_unique($categoryIds));
        $toProcess = $allIds;

        while (!empty($toProcess)) {
            $parentIds = Category::whereIn('id', $toProcess)
                ->whereNotNull('parent_id')
                ->pluck('parent_id')
                ->unique()
                ->toArray();

            $newParents = array_values(array_diff($parentIds, $allIds));
            if (empty($newParents)) break;

            $allIds    = array_values(array_unique(array_merge($allIds, $newParents)));
            $toProcess = $newParents;
        }

        return $allIds;
    }

    private function deriveAndSyncLocation(Article $article, array $expandedCategoryIds): void
    {
        if (empty($expandedCategoryIds)) {
            $article->update(['division' => null, 'district' => null, 'upazila' => null]);
            return;
        }

        $locationCats = Category::whereIn('id', $expandedCategoryIds)
            ->where(function ($q) {
                $q->where('slug', 'like', 'division-%')
                  ->orWhere('slug', 'like', 'district-%')
                  ->orWhere('slug', 'like', 'upazila-%');
            })
            ->get(['slug']);

        $division = null;
        $district = null;
        $upazila  = null;

        foreach ($locationCats as $cat) {
            if (str_starts_with($cat->slug, 'upazila-')) {
                $upazila = substr($cat->slug, 8);
            } elseif (str_starts_with($cat->slug, 'district-')) {
                $district = substr($cat->slug, 9);
            } elseif (str_starts_with($cat->slug, 'division-')) {
                $division = substr($cat->slug, 9);
            }
        }

        $article->update([
            'division' => $division,
            'district' => $district,
            'upazila'  => $upazila,
        ]);
    }

    /**
     * Generate unique slug
     */
    protected function generateSlug(string $title, string $column, ?int $excludeId = null): string
    {
        $slug = mb_strtolower($title, 'UTF-8');
        $slug = preg_replace('/[^\p{L}\p{N}\s-]+/u', '', $slug);
        $slug = preg_replace('/\s+/u', '-', $slug);
        $slug = preg_replace('/-+/u', '-', $slug);
        $slug = trim($slug, '-');

        if (empty($slug)) $slug = Str::random(8);

        $originalSlug = $slug;
        $counter = 1;

        $query = Article::where($column, $slug);
        if ($excludeId) $query->where('id', '!=', $excludeId);

        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $query = Article::where($column, $slug);
            if ($excludeId) $query->where('id', '!=', $excludeId);
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

        $updateData = ['status' => $validated['status']];
        if ($validated['status'] === 'published') {
            $updateData['published_at'] = now();
        }

        Article::whereIn('id', $validated['article_ids'])->update($updateData);

        AuditLog::create([
            'user_id' => Auth::id(),
            'event' => 'article.bulk_status',
            'description' => "Bulk updated status to {$validated['status']} for " . count($validated['article_ids']) . " articles",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->with('success', count($validated['article_ids']) . ' articles updated');
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

        if ($request->wantsJson()) {
            return response()->json($result, $result['success'] ? 200 : 403);
        }

        return $result['success'] 
            ? back()->with('success', 'Status updated')
            : back()->withErrors(['status' => $result['message']]);
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

    public function apiSearch(Request $request)
    {
        $search = $request->input('search', '');
        $limit  = min((int) $request->input('limit', 8), 20);

        $articles = Article::published()
            ->when($search, fn($q) => $q->where(function ($q2) use ($search) {
                $q2->where('title_bn', 'like', '%' . $search . '%')
                   ->orWhere('title_en', 'like', '%' . $search . '%');
            }))
            ->with('category')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get()
            ->map(fn($a) => [
                'id'       => $a->id,
                'title_bn' => $a->title_bn,
                'title_en' => $a->title_en,
                'title'    => $a->title_bn,
                'slug'     => $a->slug,
                'category_slug' => $a->category?->slug,
            ]);

        return response()->json(['data' => $articles]);
    }
}
