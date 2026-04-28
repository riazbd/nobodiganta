<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class VideoController extends Controller
{
    /**
     * Display a listing of videos.
     */
    public function index(Request $request)
    {
        if (!auth()->user()->hasPermission('video.view')) {
            abort(403);
        }

        $search = $request->input('search');
        $edition = $request->input('edition', 'all');

        $query = Article::with(['author', 'category'])
            ->where('article_type', 'video')
            ->latest();

        if ($edition && $edition !== 'all') {
            $query->where(function ($q) use ($edition) {
                $q->where('edition', 'both')
                  ->orWhere('edition', $edition);
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title_bn', 'like', "%{$search}%")
                  ->orWhere('title_en', 'like', "%{$search}%");
            });
        }

        $videos = $query->get()->map(function ($article) {
            return [
                'id' => $article->id,
                'title' => $article->title_bn,
                'titleEn' => $article->title_en,
                'thumbnail' => $article->featured_image,
                'views' => $article->views,
                'category' => $article->category?->name_bn,
                'categoryEn' => $article->category?->name_en,
                'edition' => $article->edition,
                'video_provider' => $article->video_provider,
                'duration' => '00:00', // Placeholder
                'date' => $article->created_at->format('Y-m-d'),
                'video_url' => $article->subtitle_en, 
            ];
        });

        if ($request->expectsJson()) {
            return response()->json(['videos' => $videos]);
        }

        return Inertia::render('features/admin/pages/Videos', [
            'initialVideos' => $videos,
            'filters' => $request->only(['search', 'edition']),
        ]);
    }

    /**
     * Store a newly created video.
     */
    public function store(Request $request)
    {
        if (!auth()->user()->hasPermission('video.create')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'titleBn' => 'nullable|required_if:edition,both,bn|string|max:255',
            'titleEn' => 'nullable|required_if:edition,both,en|string|max:255',
            'videoUrl' => 'required|url',
            'videoProvider' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'edition' => 'required|in:both,bn,en',
        ]);

        $category = Category::where('slug', 'video')->first();

        $slugBn = isset($validated['titleBn']) ? $this->generateSlug($validated['titleBn'], 'slug_bn') : null;
        $slugEn = isset($validated['titleEn']) ? $this->generateSlug($validated['titleEn'], 'slug_en') : null;

        $article = Article::create([
            'title_bn' => $validated['titleBn'],
            'title_en' => $validated['titleEn'],
            'slug_bn' => $slugBn,
            'slug_en' => $slugEn,
            'featured_image' => $validated['thumbnail'],
            'article_type' => 'video',
            'video_provider' => $validated['videoProvider'] ?? 'youtube',
            'status' => 'published',
            'edition' => $validated['edition'],
            'category_id' => $category ? $category->id : 1,
            'author_id' => Auth::id(),
            'published_at' => now(),
            'subtitle_en' => $validated['videoUrl'],
        ]);

        return response()->json(['success' => true, 'video' => $article]);
    }

    /**
     * Update the specified video.
     */
    public function update(Request $request, Article $article)
    {
        if (!auth()->user()->hasPermission('video.edit')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'titleBn' => 'nullable|required_if:edition,both,bn|string|max:255',
            'titleEn' => 'nullable|required_if:edition,both,en|string|max:255',
            'videoUrl' => 'required|url',
            'videoProvider' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'edition' => 'required|in:both,bn,en',
        ]);

        $slugBn = isset($validated['titleBn']) ? $this->generateSlug($validated['titleBn'], 'slug_bn', $article->id) : $article->slug_bn;
        $slugEn = isset($validated['titleEn']) ? $this->generateSlug($validated['titleEn'], 'slug_en', $article->id) : $article->slug_en;

        $article->update([
            'title_bn' => $validated['titleBn'],
            'title_en' => $validated['titleEn'],
            'slug_bn' => $slugBn,
            'slug_en' => $slugEn,
            'featured_image' => $validated['thumbnail'],
            'subtitle_en' => $validated['videoUrl'],
            'video_provider' => $validated['videoProvider'] ?? 'youtube',
            'edition' => $validated['edition'],
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Remove the specified video.
     */
    public function destroy(Article $article)
    {
        if (!auth()->user()->hasPermission('video.delete')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $article->delete();
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
            $slug = 'video-' . Str::random(5);
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
}
