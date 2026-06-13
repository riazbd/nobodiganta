<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PhotoController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('media.gallery.manage')) abort(403);

        $search  = $request->input('search');
        $edition = $request->input('edition', 'all');

        $query = Article::with(['category'])
            ->where('article_type', 'photo')
            ->where('status', 'published')
            ->latest();

        if ($edition && $edition !== 'all') {
            $query->where(function ($q) use ($edition) {
                $q->where('edition', 'both')->orWhere('edition', $edition);
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title_bn', 'like', "%{$search}%")
                  ->orWhere('title_en', 'like', "%{$search}%");
            });
        }

        $paginated = $query->paginate(24);
        $photos    = $paginated->getCollection()->map(function ($article) {
            $photos = $article->body_bn ? json_decode($article->body_bn, true) : [];
            return [
                'id'          => $article->id,
                'title_bn'    => $article->title_bn,
                'title_en'    => $article->title_en,
                'cover'       => $article->featured_image,
                'edition'     => $article->edition,
                'photo_count' => is_array($photos) ? count($photos) : 0,
                'photos'      => is_array($photos) ? $photos : [],
                'date'        => $article->created_at->format('Y-m-d'),
            ];
        });

        return Inertia::render('features/admin/pages/Photos', [
            'initialPhotos' => $photos,
            'pagination'    => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'total'        => $paginated->total(),
            ],
            'filters'       => $request->only(['search', 'edition']),
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('media.gallery.manage')) abort(403);

        $validated = $request->validate([
            'title_bn'            => 'required|string|max:255',
            'title_en'            => 'nullable|string|max:255',
            'cover'               => 'nullable|string',
            'edition'             => 'required|in:both,bn,en',
            'photos'              => 'required|array|min:1',
            'photos.*.url'        => 'required|string',
            'photos.*.caption_bn' => 'nullable|string|max:500',
            'photos.*.caption_en' => 'nullable|string|max:500',
        ]);

        $category  = Category::where('slug', 'photo')->orWhere('slug', 'gallery')->first();
        $slugBn    = $this->generateSlug($validated['title_bn'], 'slug_bn');
        $slugEn    = !empty($validated['title_en']) ? $this->generateSlug($validated['title_en'], 'slug_en') : null;
        $photosJson = json_encode($validated['photos'], JSON_UNESCAPED_UNICODE);

        Article::create([
            'title_bn'       => $validated['title_bn'],
            'title_en'       => $validated['title_en'] ?? null,
            'slug_bn'        => $slugBn,
            'slug_en'        => $slugEn,
            'featured_image' => $validated['cover'] ?? null,
            'body_bn'        => $photosJson,
            'body_en'        => $photosJson,
            'article_type'   => 'photo',
            'status'         => 'published',
            'edition'        => $validated['edition'],
            'category_id'    => $category ? $category->id : 1,
            'author_id'      => Auth::id(),
            'published_at'   => now(),
        ]);

        return back()->with('success', 'Photo gallery created');
    }

    public function update(Request $request, Article $article)
    {
        if (!auth()->user()->hasPermission('media.gallery.manage')) abort(403);
        if ($article->article_type !== 'photo') abort(404);

        $validated = $request->validate([
            'title_bn'            => 'required|string|max:255',
            'title_en'            => 'nullable|string|max:255',
            'cover'               => 'nullable|string',
            'edition'             => 'required|in:both,bn,en',
            'photos'              => 'required|array|min:1',
            'photos.*.url'        => 'required|string',
            'photos.*.caption_bn' => 'nullable|string|max:500',
            'photos.*.caption_en' => 'nullable|string|max:500',
        ]);

        $slugBn     = $this->generateSlug($validated['title_bn'], 'slug_bn', $article->id);
        $slugEn     = !empty($validated['title_en']) ? $this->generateSlug($validated['title_en'], 'slug_en', $article->id) : $article->slug_en;
        $photosJson = json_encode($validated['photos'], JSON_UNESCAPED_UNICODE);

        $article->update([
            'title_bn'       => $validated['title_bn'],
            'title_en'       => $validated['title_en'] ?? null,
            'slug_bn'        => $slugBn,
            'slug_en'        => $slugEn,
            'featured_image' => $validated['cover'] ?? null,
            'body_bn'        => $photosJson,
            'body_en'        => $photosJson,
            'edition'        => $validated['edition'],
        ]);

        return back()->with('success', 'Photo gallery updated');
    }

    public function destroy(Article $article)
    {
        if (!auth()->user()->hasPermission('media.gallery.manage')) abort(403);
        if ($article->article_type !== 'photo') abort(404);
        $article->delete();
        return back()->with('success', 'Photo gallery deleted');
    }

    protected function generateSlug(string $title, string $column, ?int $excludeId = null): string
    {
        $slug = mb_strtolower($title, 'UTF-8');
        $slug = preg_replace('/[^\p{L}\p{N}\s-]+/u', '', $slug);
        $slug = preg_replace('/\s+/u', '-', $slug);
        $slug = preg_replace('/-+/u', '-', $slug);
        $slug = trim($slug, '-');

        if (empty($slug)) {
            $slug = 'photo-' . Str::random(5);
        }

        $originalSlug = $slug;
        $counter      = 1;

        $query = Article::where($column, $slug);
        if ($excludeId) $query->where('id', '!=', $excludeId);

        while ($query->exists()) {
            $slug  = $originalSlug . '-' . $counter;
            $query = Article::where($column, $slug);
            if ($excludeId) $query->where('id', '!=', $excludeId);
            $counter++;
        }

        return $slug;
    }
}
