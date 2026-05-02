<?php

namespace App\Observers;

use App\Models\Article;

class ArticleObserver
{
    /**
     * Handle the Article "saving" event.
     */
    public function saving(Article $article): void
    {
        // Auto-populate meta_description_bn
        if (empty($article->meta_description_bn)) {
            $article->meta_description_bn = $this->generateMetaDescription($article, 'bn');
        }

        // Auto-populate meta_description_en
        if (empty($article->meta_description_en)) {
            $article->meta_description_en = $this->generateMetaDescription($article, 'en');
        }
    }

    /**
     * Generate a meta description from excerpt or body
     */
    private function generateMetaDescription(Article $article, string $edition): ?string
    {
        $excerpt = $edition === 'en' ? $article->excerpt_en : $article->excerpt_bn;
        
        if (!empty($excerpt)) {
            return $excerpt;
        }

        $body = $edition === 'en' ? $article->body_en : $article->body_bn;
        
        if (empty($body)) {
            return null;
        }

        $plain = strip_tags($body);
        return mb_strlen($plain) > 160 
            ? mb_substr($plain, 0, 157) . '...' 
            : $plain;
    }

    /**
     * Handle the Article "created" event.
     */
    public function created(Article $article): void
    {
        //
    }

    /**
     * Handle the Article "updated" event.
     */
    public function updated(Article $article): void
    {
        //
    }

    /**
     * Handle the Article "deleted" event.
     */
    public function deleted(Article $article): void
    {
        //
    }

    /**
     * Handle the Article "restored" event.
     */
    public function restored(Article $article): void
    {
        //
    }

    /**
     * Handle the Article "force deleted" event.
     */
    public function forceDeleted(Article $article): void
    {
        //
    }
}
