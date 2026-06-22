<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Article;
use App\Models\Tag;
use Illuminate\Support\Str;

/**
 * Shared slug + tag handling for the article-backed controllers
 * (news articles and opinion pieces), so the logic lives in one place.
 */
trait ManagesArticleContent
{
    protected function generateSlug(string $title, string $column, ?int $excludeId = null): string
    {
        // Unicode-friendly slugify: keep letters, numbers, spaces and dashes.
        $slug = mb_strtolower($title, 'UTF-8');
        $slug = preg_replace('/[^\p{L}\p{N}\s-]+/u', '', $slug);
        $slug = preg_replace('/\s+/u', '-', $slug);
        $slug = preg_replace('/-+/u', '-', $slug);
        $slug = trim($slug, '-');

        if (empty($slug)) {
            $slug = Str::random(8);
        }

        $originalSlug = $slug;
        $counter = 1;

        $query = Article::where($column, $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $query = Article::where($column, $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
            $counter++;
        }

        return $slug;
    }

    protected function syncArticleTags(Article $article, array $tagsBn, array $tagsEn): void
    {
        $pivotData = [];

        foreach ($tagsBn as $name) {
            $name = trim($name);
            if (empty($name)) {
                continue;
            }
            $slug = $this->makeTagSlug($name);
            $tag = Tag::firstOrCreate(['slug' => $slug], ['name_bn' => $name, 'name_en' => null]);
            $pivotData[$tag->id . ':bn'] = ['tag_id' => $tag->id, 'edition' => 'bn'];
        }

        foreach ($tagsEn as $name) {
            $name = trim($name);
            if (empty($name)) {
                continue;
            }
            $slug = $this->makeTagSlug($name);
            $tag = Tag::firstOrCreate(['slug' => $slug], ['name_bn' => $name, 'name_en' => $name]);
            if ($tag->name_en === null) {
                $tag->update(['name_en' => $name]);
            }
            $pivotData[$tag->id . ':en'] = ['tag_id' => $tag->id, 'edition' => 'en'];
        }

        $article->tags()->detach();
        foreach ($pivotData as $entry) {
            $article->tags()->attach($entry['tag_id'], ['edition' => $entry['edition']]);
        }
    }

    protected function makeTagSlug(string $name): string
    {
        $slug = Str::slug($name);
        if (empty($slug)) {
            $slug = 'tag-' . substr(md5($name), 0, 8);
        }
        return $slug;
    }
}
