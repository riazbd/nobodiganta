<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Setting;
use App\Models\Article;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $path = $request->path();
        $edition = ($path === 'en' || str_starts_with($path, 'en/')) ? 'en' : 'bn';

        // Share edition with Blade so <html lang=""> can be set server-side
        view()->share('htmlEdition', $edition);

        // Load public settings
        $publicSettings = Setting::where('is_public', true)->get()->mapWithKeys(function ($setting) {
            return [$setting->key => $setting->value];
        });

        // Load breaking news globally
        $globalBreakingNews = Article::published()
            ->forEdition($edition)
            ->breaking()
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($article) => [
                'title' => $edition === 'en' ? $article->title_en : $article->title_bn,
                'slug' => $edition === 'en' ? $article->slug_en : $article->slug_bn,
                'category_slug' => $article->category->slug ?? 'news',
            ]);

        // Load header ad globally
        $headerAd = \App\Models\Ad::active()->position('header')->first();

        // Load header articles globally (3 latest with images)
        $headerArticles = Article::published()
            ->forEdition($edition)
            ->whereNotNull('featured_image')
            ->with('category')
            ->latest()
            ->limit(3)
            ->get()
            ->map(fn($a) => [
                'id'             => $a->id,
                'title'          => $edition === 'en' ? ($a->title_en ?: $a->title_bn) : $a->title_bn,
                'slug'           => $edition === 'en' ? ($a->slug_en ?: $a->slug_bn) : $a->slug_bn,
                'featured_image' => $a->featured_image,
                'published_at'   => $a->published_at,
                'category'       => $a->category ? ['name' => $a->category->name, 'slug' => $a->category->slug] : null,
            ]);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id'          => $user->id,
                    'name'        => $user->name,
                    'email'       => $user->email,
                    'role'        => $user->role ?? 'reporter',
                    'role_id'     => $user->role_id,
                    'permissions' => $user->permissions,
                ] : null,
            ],
            'settings' => $publicSettings,
            'globalBreakingNews' => $globalBreakingNews,
            'headerArticles' => $headerArticles,
            'headerAd' => $headerAd ? [
                'id'    => $headerAd->id,
                'image' => $headerAd->image,
                'link'  => $headerAd->link,
                'title' => $headerAd->getTitle($edition),
                'type'  => $headerAd->type,
                'code'  => $headerAd->code ?? null,
            ] : null,
            'edition' => $edition,
        ];
    }
}
