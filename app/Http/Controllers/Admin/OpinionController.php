<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OpinionController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('opinion.view')) {
            abort(403);
        }

        $status   = $request->input('status');
        $edition  = $request->input('edition', 'all');
        $search   = $request->input('search');
        $authorId = $request->input('author');
        $perPage  = in_array((int) $request->input('per_page'), [10, 20, 50, 100]) ? (int) $request->input('per_page') : 20;

        $query = Article::with(['author'])
            ->where(function ($q) {
                $q->where('article_type', 'opinion')
                  ->orWhereHas('category', function ($cq) {
                      $cq->where('slug', 'opinion')
                        ->orWhere('name_bn', 'মতামত');
                  });
            })
            ->latest();

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($edition && $edition !== 'all') {
            $query->where(function ($q) use ($edition) {
                $q->where('edition', 'both')->orWhere('edition', $edition);
            });
        }

        if ($authorId && $authorId !== 'all') {
            $query->where('author_id', $authorId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title_bn', 'like', "%{$search}%")
                  ->orWhere('title_en', 'like', "%{$search}%");
            });
        }

        $opinions = $query->paginate($perPage)->withQueryString();

        $opinions->getCollection()->transform(function ($article) {
            return [
                'id'           => $article->id,
                'title'        => $article->title_bn,
                'title_en'     => $article->title_en,
                'author'       => $article->is_guest_author
                    ? ($article->guest_author_name_bn ?: $article->guest_author_name_en)
                    : $article->author?->name,
                'author_id'    => $article->author_id,
                'is_guest'     => (bool) $article->is_guest_author,
                'is_exclusive' => (bool) $article->is_exclusive,
                'status'       => $article->status,
                'edition'      => $article->edition,
                'published_at' => $article->published_at?->toIso8601String(),
                'created_at'   => $article->created_at->toIso8601String(),
                'views'        => $article->views,
            ];
        });

        $authors = User::whereIn('role', ['admin', 'editor', 'reporter'])
            ->orderBy('name')->get(['id', 'name']);

        return Inertia::render('features/admin/pages/opinion/OpinionList', [
            'opinions' => $opinions,
            'authors'  => $authors,
            'filters' => $request->only(['status', 'edition', 'search', 'author', 'per_page']),
        ]);
    }

    public function create()
    {
        if (!auth()->user()->hasPermission('opinion.create')) {
            abort(403);
        }

        $authors = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('features/admin/pages/opinion/WriteOpinion', [
            'article' => null,
            'authors' => $authors,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('opinion.create')) {
            abort(403);
        }

        $validated = $this->validateOpinion($request);
        $category = Category::where('slug', 'opinion')->first();

        $slugBn = $validated['slugBn'] ? $this->generateSlug($validated['slugBn'], 'slug_bn') : ($validated['titleBn'] ? $this->generateSlug($validated['titleBn'], 'slug_bn') : null);
        $slugEn = $validated['slugEn'] ? $this->generateSlug($validated['slugEn'], 'slug_en') : ($validated['titleEn'] ? $this->generateSlug($validated['titleEn'], 'slug_en') : null);

        $article = Article::create([
            'title_bn' => $validated['titleBn'] ?? null,
            'title_en' => $validated['titleEn'] ?? null,
            'subtitle_bn' => $validated['subtitleBn'] ?? null,
            'subtitle_en' => $validated['subtitleEn'] ?? null,
            'body_bn' => $validated['bodyBn'] ?? null,
            'body_en' => $validated['bodyEn'] ?? null,
            'slug_bn' => $slugBn,
            'slug_en' => $slugEn,
            'excerpt_bn' => $validated['excerptBn'] ?? null,
            'excerpt_en' => $validated['excerptEn'] ?? null,
            'edition' => $validated['edition'],
            'article_type' => 'opinion',
            'is_exclusive' => $validated['isExclusive'] ?? false,
            'allow_comments' => $validated['allowComments'] ?? true,
            'video_url' => $validated['videoUrl'] ?? null,
            'video_provider' => $validated['videoProvider'] ?? null,
            'video_duration' => $validated['videoDuration'] ?? null,
            'category_id' => $category ? $category->id : 1,
            'author_id' => Auth::id(),
            'secondary_author_id' => $validated['secondaryAuthorId'] ?? null,
            'is_guest_author' => $validated['isGuestAuthor'] ?? false,
            'guest_author_name_bn' => $validated['guestAuthorNameBn'] ?? null,
            'guest_author_name_en' => $validated['guestAuthorNameEn'] ?? null,
            'guest_author_bio_bn' => $validated['guestAuthorBioBn'] ?? null,
            'guest_author_bio_en' => $validated['guestAuthorBioEn'] ?? null,
            'guest_author_image' => $validated['guestAuthorImage'] ?? null,
            'status' => $validated['status'] ?? 'draft',
            'featured_image' => $validated['featuredImage'] ?? null,
            'featured_image_alt_bn' => $validated['featuredImageAltBn'] ?? null,
            'featured_image_alt_en' => $validated['featuredImageAltEn'] ?? null,
            'published_at' => ($validated['status'] ?? 'draft') === 'published' ? now() : null,
        ]);

        return redirect()->route('admin.opinions')
            ->with('success', 'Opinion created successfully');
    }

    public function edit(Article $article)
    {
        if (!auth()->user()->hasPermission('opinion.edit')) {
            abort(403);
        }

        $authors = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('features/admin/pages/opinion/WriteOpinion', [
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
                'status' => $article->status,
                'featuredImage' => $article->featured_image,
                'isExclusive' => (bool)$article->is_exclusive,
                'allowComments' => (bool)$article->allow_comments,
                'secondaryAuthorId' => $article->secondary_author_id,
                'isGuestAuthor' => (bool)$article->is_guest_author,
                'guestAuthorNameBn' => $article->guest_author_name_bn,
                'guestAuthorNameEn' => $article->guest_author_name_en,
                'guestAuthorBioBn' => $article->guest_author_bio_bn,
                'guestAuthorBioEn' => $article->guest_author_bio_en,
                'guestAuthorImage' => $article->guest_author_image,
            ],
        ]);
    }

    public function update(Request $request, Article $article)
    {
        if (!auth()->user()->hasPermission('opinion.edit')) {
            abort(403);
        }

        $validated = $this->validateOpinion($request);

        $slugBn = $validated['slugBn'] ? $this->generateSlug($validated['slugBn'], 'slug_bn', $article->id) : ($validated['titleBn'] ? $this->generateSlug($validated['titleBn'], 'slug_bn', $article->id) : $article->slug_bn);
        $slugEn = $validated['slugEn'] ? $this->generateSlug($validated['slugEn'], 'slug_en', $article->id) : ($validated['titleEn'] ? $this->generateSlug($validated['titleEn'], 'slug_en', $article->id) : $article->slug_en);

        $newStatus = $validated['status'] ?? $article->status;

        $article->update([
            'title_bn' => $validated['titleBn'] ?? null,
            'title_en' => $validated['titleEn'] ?? null,
            'subtitle_bn' => $validated['subtitleBn'] ?? null,
            'subtitle_en' => $validated['subtitleEn'] ?? null,
            'body_bn' => $validated['bodyBn'] ?? null,
            'body_en' => $validated['bodyEn'] ?? null,
            'slug_bn' => $slugBn,
            'slug_en' => $slugEn,
            'excerpt_bn' => $validated['excerptBn'] ?? null,
            'excerpt_en' => $validated['excerptEn'] ?? null,
            'edition' => $validated['edition'],
            'article_type' => 'opinion',
            'featured_image' => $validated['featuredImage'] ?? null,
            'featured_image_alt_bn' => $validated['featuredImageAltBn'] ?? null,
            'featured_image_alt_en' => $validated['featuredImageAltEn'] ?? null,
            'is_exclusive' => $validated['isExclusive'] ?? false,
            'allow_comments' => $validated['allowComments'] ?? true,
            'secondary_author_id' => $validated['secondaryAuthorId'] ?? null,
            'is_guest_author' => $validated['isGuestAuthor'] ?? false,
            'guest_author_name_bn' => $validated['guestAuthorNameBn'] ?? null,
            'guest_author_name_en' => $validated['guestAuthorNameEn'] ?? null,
            'guest_author_bio_bn' => $validated['guestAuthorBioBn'] ?? null,
            'guest_author_bio_en' => $validated['guestAuthorBioEn'] ?? null,
            'guest_author_image' => $validated['guestAuthorImage'] ?? null,
            'status' => $newStatus,
            'published_at' => ($newStatus === 'published' && !$article->published_at) ? now() : $article->published_at,
        ]);

        return back()->with('success', 'Opinion updated successfully');
    }

    public function destroy(Article $article)
    {
        if (!auth()->user()->hasPermission('opinion.delete')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $article->delete();
        return response()->json(['success' => true]);
    }

    public function transitionStatus(Request $request, Article $article)
    {
        if (!auth()->user()->hasPermission('opinion.publish')) {
             return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:draft,pending,published,archived',
        ]);

        $article->update([
            'status' => $validated['status'],
            'published_at' => $validated['status'] === 'published' ? ($article->published_at ?? now()) : $article->published_at,
        ]);

        return response()->json(['success' => true]);
    }

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
            $slug = 'opinion-' . Str::random(5);
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

    protected function validateOpinion(Request $request)
    {
        return $request->validate([
            'titleBn' => 'nullable|required_if:edition,both,bn|string|max:255',
            'titleEn' => 'nullable|required_if:edition,both,en|string|max:255',
            'subtitleBn' => 'nullable|string|max:255',
            'subtitleEn' => 'nullable|string|max:255',
            'bodyBn' => 'nullable|required_if:edition,both,bn|string',
            'bodyEn' => 'nullable|required_if:edition,both,en|string',
            'slugBn' => 'nullable|string|max:255',
            'slugEn' => 'nullable|string|max:255',
            'excerptBn' => 'nullable|string',
            'excerptEn' => 'nullable|string',
            'edition' => 'required|in:both,bn,en',
            'featuredImage' => 'nullable|string',
            'featuredImageAltBn' => 'nullable|string|max:255',
            'featuredImageAltEn' => 'nullable|string|max:255',
            'status' => 'nullable|in:draft,pending,published,archived',
            'isExclusive' => 'boolean',
            'secondaryAuthorId' => 'nullable|exists:users,id',
            'isGuestAuthor' => 'boolean',
            'guestAuthorNameBn' => 'nullable|required_if:isGuestAuthor,true|string|max:255',
            'guestAuthorNameEn' => 'nullable|string|max:255',
            'guestAuthorBioBn' => 'nullable|string',
            'guestAuthorBioEn' => 'nullable|string',
            'guestAuthorImage' => 'nullable|string',
            'allowComments' => 'boolean',
            'videoUrl' => 'nullable|url',
            'videoProvider' => 'nullable|string',
            'videoDuration' => 'nullable|string|max:10',
        ]);
    }
}
