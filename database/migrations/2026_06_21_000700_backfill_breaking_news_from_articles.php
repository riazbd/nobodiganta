<?php

use App\Models\Article;
use App\Models\BreakingNews;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Backfill the new breaking-news system from articles that were already
     * flagged is_breaking before the system existed (otherwise the public
     * ticker would be empty until each article is re-saved).
     */
    public function up(): void
    {
        Article::where('is_breaking', true)
            ->where('status', 'published')
            ->get()
            ->each(fn (Article $article) => BreakingNews::syncForArticle($article));
    }

    public function down(): void
    {
        // Remove only the auto-created (article-linked, no custom headline) rows.
        BreakingNews::whereNotNull('article_id')
            ->whereNull('headline_bn')
            ->whereNull('headline_en')
            ->delete();
    }
};
