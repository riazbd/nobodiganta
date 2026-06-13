<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Media;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GalleryController extends Controller
{
    /**
     * Get photo articles for the public gallery page
     * GET /api/gallery?edition=:bn|en&page=:n
     */
    public function index(Request $request)
    {
        $edition = $request->input('edition', 'bn');
        $perPage = $request->input('per_page', 12);

        $query = Article::published()
            ->forEdition($edition)
            ->type('photo')
            ->latest('published_at');

        $paginated = $query->paginate($perPage);

        $items = $paginated->map(function ($article) use ($edition) {
            $raw    = $edition === 'en' ? ($article->body_en ?: $article->body_bn) : $article->body_bn;
            $photos = $raw ? json_decode($raw, true) : [];
            if (!is_array($photos)) $photos = [];
            return [
                'id'          => $article->id,
                'title'       => $edition === 'en' && $article->title_en ? $article->title_en : $article->title_bn,
                'slug'        => $edition === 'en' && $article->slug_en ? $article->slug_en : $article->slug_bn,
                'cover'       => $article->featured_image,
                'photo_count' => count($photos),
                'photos'      => $photos,
                'date'        => $article->published_at?->toISOString(),
                'edition'     => $article->edition,
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'per_page'     => $paginated->perPage(),
                'total'        => $paginated->total(),
            ],
        ]);
    }

    /**
     * Get videos (files with video mime type)
     * GET /api/videos?featured=:bool&edition=:bn|en&page=:n
     */
    public function videos(Request $request)
    {
        $edition = $request->input('edition', 'bn');
        $perPage = $request->input('per_page', 12);

        $query = Media::where('mime_type', 'like', 'video/%')
            ->forEdition($edition)
            ->latest();

        $media = $query->paginate($perPage);

        // Transform to video format
        $items = $media->map(function ($item) use ($edition) {
            return [
                'id' => $item->id,
                'title' => $item->getAltText($edition),
                'src' => $item->url,
                'thumbnail' => $item->thumbnail_url,
                'duration' => null,
                'width' => $item->width,
                'height' => $item->height,
                'file_size' => $item->file_size,
                'edition' => $item->edition,
                'created_at' => $item->created_at->toISOString(),
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $media->currentPage(),
                'last_page' => $media->lastPage(),
                'per_page' => $media->perPage(),
                'total' => $media->total(),
            ],
        ]);
    }

    /**
     * Get gallery categories/stats
     * GET /api/gallery/categories
     */
    public function categories(Request $request)
    {
        $edition = $request->input('edition', 'bn');

        $categories = [
            ['id' => 'latest', 'name' => 'Latest', 'name_bn' => 'সর্বশেষ', 'count' => 0],
            ['id' => 'bangladesh', 'name' => 'Bangladesh', 'name_bn' => 'বাংলাদেশ', 'count' => 0],
            ['id' => 'nature', 'name' => 'Nature', 'name_bn' => 'প্রকৃতি', 'count' => 0],
            ['id' => 'people', 'name' => 'People', 'name_bn' => 'মানুষ', 'count' => 0],
            ['id' => 'sports', 'name' => 'Sports', 'name_bn' => 'ক্রীড়া', 'count' => 0],
            ['id' => 'special', 'name' => 'Special', 'name_bn' => 'বিশেষ', 'count' => 0],
        ];

        // Count images per edition
        $totalCount = Media::where('mime_type', 'like', 'image/%')
            ->forEdition($edition)
            ->count();

        $categories[0]['count'] = $totalCount;

        return response()->json([
            'categories' => $categories,
            'total' => $totalCount,
        ]);
    }

    /**
     * Get single media item
     * GET /api/media/{id}?edition=:bn|en
     */
    public function show(Request $request, int $id)
    {
        $edition = $request->input('edition', 'bn');

        $media = Media::findOrFail($id);

        // Check edition access
        if ($media->edition !== 'both' && $media->edition !== $edition) {
            return response()->json(['error' => 'Media not found for this edition'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $media->id,
                'src' => $media->url,
                'thumbnail' => $media->thumbnail_url,
                'caption' => $media->getCaption($edition),
                'alt_text' => $media->getAltText($edition),
                'width' => $media->width,
                'height' => $media->height,
                'file_size' => $media->file_size,
                'formatted_size' => $media->formatted_size,
                'mime_type' => $media->mime_type,
                'edition' => $media->edition,
                'created_at' => $media->created_at->toISOString(),
                'original_name' => $media->original_name,
            ],
        ]);
    }
}
