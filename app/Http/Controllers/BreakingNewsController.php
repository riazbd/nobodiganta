<?php

namespace App\Http\Controllers;

use App\Models\BreakingNews;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BreakingNewsController extends Controller
{
    /**
     * Live breaking items for the current edition (polled by the public ticker).
     * Cheap + cacheable via ETag so unchanged polls return 304.
     */
    public function index(Request $request)
    {
        $edition = str_starts_with($request->path(), 'en') ? 'en' : 'bn';

        $news = BreakingNews::active($edition)
            ->ordered()
            ->with('article.category')
            ->limit(15)
            ->get()
            ->map(fn($b) => $b->toPublicArray($edition))
            ->values();

        $etag = '"' . md5($news->toJson()) . '"';
        if (trim($request->headers->get('If-None-Match', '')) === $etag) {
            return response('', 304)->header('ETag', $etag)->header('Cache-Control', 'public, max-age=15');
        }

        return response()
            ->json(['success' => true, 'news' => $news])
            ->header('ETag', $etag)
            ->header('Cache-Control', 'public, max-age=15');
    }

    /**
     * Public breaking-news archive page (recent items for the edition).
     */
    public function page(Request $request)
    {
        $edition = str_starts_with($request->path(), 'en') ? 'en' : 'bn';

        $items = BreakingNews::with('article.category')
            ->whereIn('edition', [$edition, 'both'])
            ->orderByDesc('created_at')
            ->paginate(30)
            ->through(fn($b) => array_merge($b->toPublicArray($edition), [
                'created_at' => $b->created_at?->toIso8601String(),
                'is_active' => $b->is_active && !$b->isExpired(),
            ]));

        return Inertia::render('Breaking', [
            'items' => $items,
            'edition' => $edition,
        ]);
    }
}
