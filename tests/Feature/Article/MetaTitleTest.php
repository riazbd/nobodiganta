<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MetaTitleTest extends TestCase
{
    use RefreshDatabase;

    public function test_article_page_server_renders_meta_title_override(): void
    {
        $cat = Category::create(['name_bn' => 'টেস্ট', 'slug' => 'meta-test']);
        $article = Article::factory()->create([
            'category_id'   => $cat->id,
            'title_bn'      => 'সাধারণ শিরোনাম',
            'meta_title_bn' => 'কাস্টম মেটা শিরোনাম',
        ]);

        $resp = $this->get("/{$cat->slug}/{$article->slug_bn}");

        $resp->assertOk();
        // The admin Meta Title override must appear server-side (in <title> / og:title).
        $resp->assertSee('কাস্টম মেটা শিরোনাম', false);
    }

    public function test_article_page_server_renders_headline_when_no_override(): void
    {
        $cat = Category::create(['name_bn' => 'টেস্ট', 'slug' => 'meta-test-2']);
        $article = Article::factory()->create([
            'category_id'   => $cat->id,
            'title_bn'      => 'শুধু শিরোনাম',
            'meta_title_bn' => null,
        ]);

        $resp = $this->get("/{$cat->slug}/{$article->slug_bn}");

        $resp->assertOk();
        $resp->assertSee('শুধু শিরোনাম', false);
    }
}
