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
        // withTrashed(): the Article model gained SoftDeletes in a later
        // migration (deleted_at). On a fresh migrate this runs before that
        // column exists, so disable the soft-delete scope to avoid querying
        // a not-yet-existing column. No rows are soft-deleted at this point.
        Article::withTrashed()
            ->where('is_breaking', true)
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
