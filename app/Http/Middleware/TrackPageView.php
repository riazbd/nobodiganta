<?php

namespace App\Http\Middleware;

use App\Models\PageView;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackPageView
{
    /**
     * Record a page view for public (non-admin) GET pages, so the dashboard can
     * report real traffic. Failures here must never break the page.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        try {
            if ($this->shouldTrack($request, $response)) {
                $this->record($request);
            }
        } catch (\Throwable) {
            // tracking is best-effort — swallow any error
        }

        return $response;
    }

    private function shouldTrack(Request $request, Response $response): bool
    {
        if (! $request->isMethod('GET')) {
            return false;
        }

        $path = $request->path();
        foreach (['admin', 'api', 'storage', 'build', 'sitemap', 'login', 'register'] as $prefix) {
            if ($path === $prefix || str_starts_with($path, $prefix . '/')) {
                return false;
            }
        }

        // Skip Inertia partial reloads (filter/sort fetches) to avoid double counting.
        if ($request->headers->has('X-Inertia-Partial-Component')) {
            return false;
        }

        $status = $response->getStatusCode();
        if ($status >= 400) {
            return false;
        }

        return true;
    }

    private function record(Request $request): void
    {
        // Daily salt makes the hash unique-per-day per visitor without storing PII.
        $salt = now()->toDateString();
        $hash = hash('sha256', $request->ip() . '|' . (string) $request->userAgent() . '|' . $salt);

        $referer = $request->headers->get('referer');
        $refHost = $referer ? parse_url($referer, PHP_URL_HOST) : null;

        PageView::create([
            'path' => mb_substr($request->path(), 0, 512),
            'visitor_hash' => $hash,
            'referrer_host' => $refHost ? mb_substr($refHost, 0, 255) : null,
            'edition' => str_starts_with($request->path(), 'en') ? 'en' : 'bn',
            'created_at' => now(),
        ]);
    }
}
