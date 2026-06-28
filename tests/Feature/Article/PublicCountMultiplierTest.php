<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicCountMultiplierTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_count_multiplies_by_config(): void
    {
        config(['display.public_count_multiplier' => 9]);

        $this->assertSame(90, Article::publicCount(10));
        $this->assertSame(0, Article::publicCount(0));
        $this->assertSame(0, Article::publicCount(null));
    }

    public function test_multiplier_of_one_keeps_real_counts(): void
    {
        config(['display.public_count_multiplier' => 1]);

        $this->assertSame(7, Article::publicCount(7));
    }

    public function test_api_array_inflates_views_and_shares(): void
    {
        config(['display.public_count_multiplier' => 9]);

        $article = Article::factory()->create(['views' => 12, 'shares_count' => 4]);

        $arr = $article->toAPIArray('bn');

        $this->assertSame(108, $arr['views']);
        $this->assertSame(36, $arr['shares_count']);
        // Stored values are untouched.
        $this->assertSame(12, $article->fresh()->views);
        $this->assertSame(4, $article->fresh()->shares_count);
    }

    public function test_share_counts_total_matches_sum_of_inflated_platforms(): void
    {
        config(['display.public_count_multiplier' => 9]);

        $article = Article::factory()->create(['shares_count' => 0]);
        $article->recordShare('facebook');
        $article->recordShare('facebook');
        $article->recordShare('twitter');

        $data = $this->getJson(route('api.articles.shares', ['article' => $article->id]))
            ->assertOk()
            ->json();

        $this->assertSame(27, $data['total']);                 // 3 shares x9
        $this->assertSame(18, $data['platforms']['facebook']); // 2 x9
        $this->assertSame(9, $data['platforms']['twitter']);   // 1 x9
        $this->assertSame($data['total'], array_sum($data['platforms']));
    }
}
