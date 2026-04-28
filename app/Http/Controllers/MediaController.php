<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class MediaController extends Controller
{
    /**
     * Display media library
     */
    public function index(Request $request)
    {
        if (!$request->user()->hasPermission('media.view')) {
            abort(403);
        }

        $edition = $request->input('edition', 'all');
        $type = $request->input('type');
        $search = $request->input('search');

        $query = Media::latest()
            ->when($edition !== 'all', function ($query) use ($edition) {
                return $query->forEdition($edition);
            })
            ->when($type, function ($query, $type) {
                return $query->ofType($type);
            })
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('original_name', 'like', "%{$search}%")
                      ->orWhere('alt_text_bn', 'like', "%{$search}%")
                      ->orWhere('alt_text_en', 'like', "%{$search}%")
                      ->orWhere('caption_bn', 'like', "%{$search}%")
                      ->orWhere('caption_en', 'like', "%{$search}%");
                });
            });

        $media = $query->paginate(24);

        return Inertia::render('features/admin/pages/media/MediaLibrary', [
            'media' => $media,
            'filters' => $request->only(['edition', 'type', 'search']),
        ]);
    }

    /**
     * API for media listing (for modals/pickers)
     */
    public function apiIndex(Request $request)
    {
        if (!$request->user()->hasPermission('media.view')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $edition = $request->input('edition', 'all');
        $type = $request->input('type');
        $search = $request->input('search');

        $query = Media::latest()
            ->when($edition !== 'all', function ($query) use ($edition) {
                return $query->forEdition($edition);
            })
            ->when($type, function ($query, $type) {
                return $query->ofType($type);
            })
            ->when($search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('original_name', 'like', "%{$search}%")
                      ->orWhere('alt_text_bn', 'like', "%{$search}%")
                      ->orWhere('alt_text_en', 'like', "%{$search}%")
                      ->orWhere('caption_bn', 'like', "%{$search}%")
                      ->orWhere('caption_en', 'like', "%{$search}%");
                });
            });

        return response()->json($query->paginate(30));
    }

    /**
     * Upload new media file
     */
    public function store(Request $request)
    {
        if (!$request->user()->hasPermission('media.upload')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'alt_text_bn' => 'nullable|string|max:255',
            'alt_text_en' => 'nullable|string|max:255',
            'caption_bn' => 'nullable|string|max:500',
            'caption_en' => 'nullable|string|max:500',
            'credit_bn' => 'nullable|string|max:255',
            'credit_en' => 'nullable|string|max:255',
            'source_link' => 'nullable|string|max:255',
            'license_type' => 'required|string|max:50',
            'edition' => 'required|in:bn,en,both',
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::uuid() . '.' . $extension;
        $filePath = $file->storeAs('media', $fileName, 'public');

        // Get image dimensions if it's an image
        $width = null;
        $height = null;
        $thumbnails = [];
        $isWebp = false;

        if (str_starts_with($mimeType, 'image/')) {
            try {
                $manager = new ImageManager(new Driver());
                $image = $manager->read(Storage::disk('public')->path($filePath));

                $width = $image->width();
                $height = $image->height();

                // Convert to WebP for better compression
                $webpFileName = Str::uuid() . '.webp';
                $webpFilePath = 'media/' . $webpFileName;

                $image->toWebp(85)->save(Storage::disk('public')->path($webpFilePath));
                $isWebp = true;

                // Generate thumbnails
                $thumbnails = $this->generateThumbnails($image, $webpFileName);

                // Replace original upload with WebP version
                Storage::disk('public')->delete($filePath);
                $filePath = $webpFilePath;
                $fileName = $webpFileName;
                $mimeType = 'image/webp';
                $fileSize = Storage::disk('public')->size($webpFilePath);
            } catch (\Exception $e) {
                // Image processing failed — keep the original uploaded file as-is.
                // Clean up any partially-written WebP file.
                if (isset($webpFilePath) && Storage::disk('public')->exists($webpFilePath)) {
                    Storage::disk('public')->delete($webpFilePath);
                }
            }
        }

        $media = Media::create([
            'user_id' => Auth::id(),
            'original_name' => $originalName,
            'file_name' => $fileName,
            'file_path' => $filePath,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
            'width' => $width,
            'height' => $height,
            'alt_text_bn' => $request->input('alt_text_bn'),
            'alt_text_en' => $request->input('alt_text_en'),
            'caption_bn' => $request->input('caption_bn'),
            'caption_en' => $request->input('caption_en'),
            'credit_bn' => $request->input('credit_bn'),
            'credit_en' => $request->input('credit_en'),
            'source_link' => $request->input('source_link'),
            'license_type' => $request->input('license_type', 'internal'),
            'thumbnails' => $thumbnails,
            'is_webp' => $isWebp,
            'edition' => $request->input('edition', 'both'),
        ]);

        return response()->json([
            'success' => true,
            'media' => $media,
            'url' => $media->url,
        ], 201);
    }

    /**
     * Update media metadata
     */
    public function update(Request $request, Media $media)
    {
        if (!$request->user()->hasPermission('media.edit')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'alt_text_bn' => 'nullable|string|max:255',
            'alt_text_en' => 'nullable|string|max:255',
            'caption_bn' => 'nullable|string|max:500',
            'caption_en' => 'nullable|string|max:500',
            'credit_bn' => 'nullable|string|max:255',
            'credit_en' => 'nullable|string|max:255',
            'source_link' => 'nullable|string|max:255',
            'license_type' => 'required|string|max:50',
            'edition' => 'required|in:bn,en,both',
        ]);

        $media->update($validated);

        return response()->json([
            'success' => true,
            'media' => $media,
        ]);
    }

    /**
     * Delete media file
     */
    public function destroy(Request $request, Media $media)
    {
        if (!$request->user()->hasPermission('media.delete')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Delete file from storage
        Storage::disk('public')->delete($media->file_path);

        // Delete thumbnails
        if ($media->thumbnails) {
            foreach ($media->thumbnails as $thumbnailPath) {
                Storage::disk('public')->delete($thumbnailPath);
            }
        }

        $media->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Generate thumbnails in different sizes
     */
    protected function generateThumbnails($image, $baseFileName): array
    {
        $thumbnails = [];
        $sizes = [
            'thumbnail' => ['width' => 150, 'height' => 150],
            'small' => ['width' => 300, 'height' => null],
            'medium' => ['width' => 600, 'height' => null],
            'large' => ['width' => 1200, 'height' => null],
        ];

        foreach ($sizes as $sizeName => $dimensions) {
            $thumbFileName = "{$sizeName}_{$baseFileName}";
            $thumbPath = 'media/' . $thumbFileName;

            $thumb = clone $image;

            if ($sizeName === 'thumbnail') {
                // Square crop for thumbnail
                $thumb->cover($dimensions['width'], $dimensions['height']);
            } else {
                // Resize maintaining aspect ratio
                $thumb->resize($dimensions['width'], $dimensions['height'], function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                });
            }

            $thumb->toWebp(80)->save(Storage::disk('public')->path($thumbPath));
            $thumbnails[$sizeName] = $thumbPath;
        }

        return $thumbnails;
    }

    /**
     * Bulk delete media
     */
    public function bulkDestroy(Request $request)
    {
        if (!$request->user()->hasPermission('media.delete')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'media_ids' => 'required|array',
            'media_ids.*' => 'exists:media,id',
        ]);

        $media = Media::whereIn('id', $validated['media_ids'])->get();

        foreach ($media as $item) {
            Storage::disk('public')->delete($item->file_path);
            if ($item->thumbnails) {
                foreach ($item->thumbnails as $thumbnailPath) {
                    Storage::disk('public')->delete($thumbnailPath);
                }
            }
            $item->delete();
        }

        return response()->json([
            'success' => true,
            'deleted' => count($validated['media_ids']),
        ]);
    }
}
