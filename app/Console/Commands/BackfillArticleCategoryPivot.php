<?php

namespace App\Console\Commands;

use App\Models\Article;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillArticleCategoryPivot extends Command
{
    protected $signature   = 'articles:backfill-pivot';
    protected $description = 'Ensure every article with a category_id has a matching row in the article_category pivot';

    public function handle(): int
    {
        $articles = Article::whereNotNull('category_id')
            ->whereNotExists(function ($q) {
                $q->select(DB::raw(1))
                  ->from('article_category')
                  ->whereColumn('article_category.article_id', 'articles.id')
                  ->whereColumn('article_category.category_id', 'articles.category_id');
            })
            ->get(['id', 'category_id']);

        if ($articles->isEmpty()) {
            $this->info('Nothing to backfill.');
            return 0;
        }

        $rows = $articles->map(fn($a) => [
            'article_id'  => $a->id,
            'category_id' => $a->category_id,
            'is_primary'  => true,
            'sort_order'  => 0,
        ])->toArray();

        DB::table('article_category')->insertOrIgnore($rows);

        $this->info("Backfilled pivot rows for {$articles->count()} articles.");
        return 0;
    }
}
