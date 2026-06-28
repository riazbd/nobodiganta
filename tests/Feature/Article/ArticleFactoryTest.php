<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_creates_published_article_with_relations(): void
    {
        $article = Article::factory()->create();

        $this->assertDatabaseHas('articles', ['id' => $article->id, 'status' => 'published']);
        $this->assertNotNull($article->category_id);
        $this->assertNotNull($article->author_id);
        $this->assertNotNull($article->published_at);
    }

    public function test_archived_state_sets_status(): void
    {
        $article = Article::factory()->archived()->create();
        $this->assertEquals('archived', $article->fresh()->status);
    }
}
