<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArchivedVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private function urlFor(Article $article): string
    {
        $slug = Category::find($article->category_id)->slug;
        return route('article', ['category' => $slug, 'slug' => $article->slug_bn]);
    }

    public function test_guest_can_read_archived_article_by_direct_url(): void
    {
        $article = Article::factory()->archived()->create(['published_at' => now()->subDays(40)]);

        $this->get($this->urlFor($article))->assertStatus(200);
    }

    public function test_guest_gets_404_for_draft_article(): void
    {
        $article = Article::factory()->draft()->create();

        $this->get($this->urlFor($article))->assertStatus(404);
    }

    public function test_archived_article_is_excluded_from_published_scope(): void
    {
        $published = Article::factory()->create();
        $archived  = Article::factory()->archived()->create();

        $ids = Article::published()->pluck('id');

        $this->assertTrue($ids->contains($published->id));
        $this->assertFalse($ids->contains($archived->id));
    }

    public function test_public_readable_scope_includes_published_and_archived_only(): void
    {
        $published = Article::factory()->create();
        $archived  = Article::factory()->archived()->create();
        $draft     = Article::factory()->draft()->create();

        $ids = Article::publicReadable()->pluck('id');

        $this->assertTrue($ids->contains($published->id));
        $this->assertTrue($ids->contains($archived->id));
        $this->assertFalse($ids->contains($draft->id));
    }
}
