<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BreakingNewsController extends Controller
{
    /**
     * Server-Sent Events stream for breaking news.
     * Pushes updates every 30 seconds to connected clients.
     */
    public function stream(Request $request): StreamedResponse
    {
        $edition = str_starts_with($request->path(), 'en') ? 'en' : 'bn';

        $response = new StreamedResponse(function () use ($edition) {
            // Disable output buffering for real-time streaming
            if (ob_get_level()) {
                ob_end_clean();
            }

            $lastCount = 0;

            while (true) {
                // Check if client is still connected
                if (connection_aborted()) {
                    break;
                }

                // Fetch latest breaking news
                $breakingNews = Article::published()
                    ->forEdition($edition)
                    ->where('is_breaking', true)
                    ->latest('published_at')
                    ->limit(5)
                    ->get()
                    ->map(fn($article) => [
                        'id' => $article->id,
                        'title' => $edition === 'en' 
                            ? ($article->title_en ?? $article->title_bn) 
                            : $article->title_bn,
                        'slug' => $edition === 'en' && $article->slug_en 
                            ? $article->slug_en 
                            : $article->slug_bn,
                        'category_slug' => $article->category->slug,
                        'published_at' => $article->published_at?->toIso8601String(),
                    ]);

                // Only send if there are changes
                if ($breakingNews->count() !== $lastCount || $breakingNews->pluck('id')->toArray() !== $lastCount) {
                    echo "data: " . json_encode([
                        'success' => true,
                        'news' => $breakingNews,
                        'count' => $breakingNews->count(),
                    ]) . "\n\n";

                    $lastCount = $breakingNews->count();
                }

                // Flush output immediately
                if (ob_get_level()) {
                    ob_flush();
                }
                flush();

                // Wait 30 seconds before next update
                sleep(30);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable Nginx buffering
        ]);

        return $response;
    }

    /**
     * Get current breaking news (REST endpoint).
     */
    public function index(Request $request)
    {
        $edition = str_starts_with($request->path(), 'en') ? 'en' : 'bn';

        $breakingNews = Article::published()
            ->forEdition($edition)
            ->where('is_breaking', true)
            ->latest('published_at')
            ->limit(10)
            ->get()
            ->map(fn($article) => [
                'id' => $article->id,
                'title' => $edition === 'en' 
                    ? ($article->title_en ?? $article->title_bn) 
                    : $article->title_bn,
                'excerpt' => $edition === 'en' 
                    ? ($article->excerpt_en ?? $article->excerpt_bn) 
                    : $article->excerpt_bn,
                'slug' => $edition === 'en' && $article->slug_en 
                    ? $article->slug_en 
                    : $article->slug_bn,
                'category_slug' => $article->category->slug,
                'category_name' => $edition === 'en' 
                    ? ($article->category->name_en ?? $article->category->name_bn) 
                    : $article->category->name_bn,
                'published_at' => $article->published_at?->toIso8601String(),
            ]);

        return response()->json([
            'success' => true,
            'news' => $breakingNews,
        ]);
    }
}
