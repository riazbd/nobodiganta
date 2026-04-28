<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;

class SitemapController extends Controller
{
    /**
     * Main sitemap index
     */
    public function index()
    {
        return response()->view('sitemaps.index', [
            'lastModified' => Article::latest()->first()?->updated_at ?? now(),
        ])->header('Content-Type', 'text/xml');
    }

    /**
     * Bangla edition sitemap (Google News)
     * Lists articles from last 2 days, Bangla edition
     */
    public function bangla()
    {
        $articles = Article::published()
            ->forEdition('bn')
            ->where('published_at', '>=', now()->subDays(2))
            ->latest()
            ->limit(1000)
            ->with(['category', 'author'])
            ->get();

        return response()->view('sitemaps.bangla', [
            'articles' => $articles,
        ])->header('Content-Type', 'text/xml');
    }

    /**
     * English edition sitemap (Google News)
     * Lists articles from last 2 days, English edition
     */
    public function english()
    {
        $articles = Article::published()
            ->forEdition('en')
            ->where('published_at', '>=', now()->subDays(2))
            ->latest()
            ->limit(1000)
            ->with(['category', 'author'])
            ->get();

        return response()->view('sitemaps.english', [
            'articles' => $articles,
        ])->header('Content-Type', 'text/xml');
    }

    /**
     * Full sitemap (all articles, all editions)
     */
    public function full()
    {
        $articles = Article::published()
            ->latest()
            ->limit(50000)
            ->with(['category'])
            ->get();

        return response()->view('sitemaps.full', [
            'articles' => $articles,
        ])->header('Content-Type', 'text/xml');
    }

    /**
     * Category sitemap
     */
    public function categories()
    {
        $categories = Category::active()
            ->ordered()
            ->get();

        return response()->view('sitemaps.categories', [
            'categories' => $categories,
        ])->header('Content-Type', 'text/xml');
    }
}
