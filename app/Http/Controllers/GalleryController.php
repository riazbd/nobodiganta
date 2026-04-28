<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GalleryController extends Controller
{
    /**
     * Get gallery items with optional filtering
     * GET /api/gallery?tab=:tab&edition=:bn|en&page=:n
     */
    public function index(Request $request)
    {
        $tab = $request->input('tab', 'latest');
        $edition = $request->input('edition', 'bn');
        $perPage = $request->input('per_page', 12);

        // Build query for images only
        $query = Media::where('mime_type', 'like', 'image/%')
            ->forEdition($edition)
            ->latest();

        // If not 'latest', filter by alt_text_bn/caption_bn as category
        if ($tab !== 'latest') {
            $query->where(function ($q) use ($tab) {
                $q->where('alt_text_bn', 'like', '%' . $tab . '%')
                  ->orWhere('alt_text_en', 'like', '%' . $tab . '%')
                  ->orWhere('caption_bn', 'like', '%' . $tab . '%')
                  ->orWhere('caption_en', 'like', '%' . $tab . '%');
            });
        }

        $media = $query->paginate($perPage);

        // Transform to gallery format
        $items = $media->map(function ($item) use ($edition) {
            return [
                'id' => $item->id,
                'src' => $item->url,
                'thumbnail' => $item->thumbnail_url,
                'caption' => $item->getCaption($edition),
                'alt_text' => $item->getAltText($edition),
                'date' => $item->created_at->toISOString(),
                'width' => $item->width,
                'height' => $item->height,
                'edition' => $item->edition,
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
