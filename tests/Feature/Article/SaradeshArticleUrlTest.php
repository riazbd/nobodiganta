<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The /saradesh/{x} URL space is shared between location divisions
 * (/saradesh/{division}) and articles whose primary category is সারাদেশ
 * (/saradesh/{slug}). The division route is declared before the article
 * catch-all, so it must disambiguate: real division slug -> location page,
 * anything else -> the article page.
 */
class SaradeshArticleUrlTest extends TestCase
{
    use RefreshDatabase;

    private function makeSaradeshTree(): array
    {
        $saradesh = Category::firstOrCreate(['slug' => 'saradesh'], ['name_bn' => 'সারাদেশ']);
        $division = Category::firstOrCreate(
            ['slug' => 'division-rajshahi'],
            ['name_bn' => 'রাজশাহী', 'parent_id' => $saradesh->id]
        );

        return [$saradesh, $division];
    }

    public function test_saradesh_article_opens_instead_of_empty_location_page(): void
    {
        [$saradesh] = $this->makeSaradeshTree();

        $article = Article::factory()->create([
            'category_id' => $saradesh->id,
            'slug_bn'     => 'natorer-boraigrame-jomoj-tin-bon',
        ]);

        $this->get("/saradesh/{$article->slug_bn}")
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Article')
                ->where('article.id', $article->id));
    }

    public function test_real_division_slug_still_renders_location_page(): void
    {
        $this->makeSaradeshTree();

        $this->get('/saradesh/rajshahi')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Location')
                ->where('level', 'division')
                ->where('division', 'rajshahi'));
    }

    public function test_unknown_saradesh_slug_404s_as_missing_article(): void
    {
        $this->makeSaradeshTree();

        $this->get('/saradesh/this-slug-does-not-exist')->assertStatus(404);
    }
}
