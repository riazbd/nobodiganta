<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublishPermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function userWithRole(string $roleName): User
    {
        $role = Role::where('name', $roleName)->firstOrFail();
        return User::factory()->create(['role' => $roleName, 'role_id' => $role->id]);
    }

    private function category(): Category
    {
        return Category::create(['name_bn' => 'টেস্ট', 'slug' => 'test-cat-' . uniqid()]);
    }

    private function payload(Category $c, string $status, string $title): array
    {
        return [
            'titleBn'         => $title,
            'titleEn'         => $title . '-en',
            'bodyBn'          => 'বডি কনটেন্ট',
            'bodyEn'          => 'body content',
            'edition'         => 'both',
            'articleType'     => 'news',
            'status'          => $status,
            'categories'      => [$c->id],
            'primaryCategory' => $c->id,
        ];
    }

    public function test_reporter_cannot_publish_via_store(): void
    {
        $reporter = $this->userWithRole('reporter');
        $c = $this->category();

        $this->actingAs($reporter)
            ->post(route('admin.news.store'), $this->payload($c, 'published', 'reporter-publish'))
            ->assertForbidden();

        $this->assertDatabaseMissing('articles', ['title_bn' => 'reporter-publish']);
    }

    public function test_reporter_can_save_draft_via_store(): void
    {
        $reporter = $this->userWithRole('reporter');
        $c = $this->category();

        $this->actingAs($reporter)
            ->post(route('admin.news.store'), $this->payload($c, 'draft', 'reporter-draft'));

        $this->assertDatabaseHas('articles', ['title_bn' => 'reporter-draft', 'status' => 'draft']);
    }

    public function test_reporter_can_submit_for_review_via_store(): void
    {
        $reporter = $this->userWithRole('reporter');
        $c = $this->category();

        $this->actingAs($reporter)
            ->post(route('admin.news.store'), $this->payload($c, 'pending', 'reporter-pending'));

        $this->assertDatabaseHas('articles', ['title_bn' => 'reporter-pending', 'status' => 'pending']);
    }

    public function test_editor_in_chief_can_publish_via_store(): void
    {
        $editor = $this->userWithRole('editor_in_chief');
        $c = $this->category();

        $this->actingAs($editor)
            ->post(route('admin.news.store'), $this->payload($c, 'published', 'editor-publish'));

        $this->assertDatabaseHas('articles', ['title_bn' => 'editor-publish', 'status' => 'published']);
    }

    public function test_reporter_cannot_publish_own_draft_via_update(): void
    {
        $reporter = $this->userWithRole('reporter');
        $c = $this->category();
        $article = Article::factory()->draft()->create([
            'author_id'   => $reporter->id,
            'category_id' => $c->id,
        ]);

        $this->actingAs($reporter)
            ->put(route('admin.news.update', ['article' => $article->id]), $this->payload($c, 'published', 'reporter-update-publish'))
            ->assertForbidden();

        $this->assertDatabaseHas('articles', ['id' => $article->id, 'status' => 'draft']);
    }

    private function opinionPayload(string $status, string $title): array
    {
        return [
            'titleBn' => $title,
            'titleEn' => $title . '-en',
            'bodyBn'  => 'বডি কনটেন্ট',
            'bodyEn'  => 'body content',
            'slugBn'  => $title,
            'slugEn'  => $title . '-en',
            'edition' => 'both',
            'status'  => $status,
        ];
    }

    public function test_reporter_cannot_publish_opinion_via_store(): void
    {
        Category::create(['name_bn' => 'মতামত', 'slug' => 'opinion']);
        $reporter = $this->userWithRole('reporter');

        $this->actingAs($reporter)
            ->post(route('admin.opinions.store'), $this->opinionPayload('published', 'op-publish'))
            ->assertForbidden();

        $this->assertDatabaseMissing('articles', ['title_bn' => 'op-publish']);
    }

    public function test_reporter_can_draft_opinion_via_store(): void
    {
        Category::create(['name_bn' => 'মতামত', 'slug' => 'opinion']);
        $reporter = $this->userWithRole('reporter');

        $this->actingAs($reporter)
            ->post(route('admin.opinions.store'), $this->opinionPayload('draft', 'op-draft'));

        $this->assertDatabaseHas('articles', ['title_bn' => 'op-draft', 'status' => 'draft']);
    }

    public function test_opinion_store_succeeds_without_slug_or_english_fields(): void
    {
        Category::create(['name_bn' => 'মতামত', 'slug' => 'opinion']);
        $reporter = $this->userWithRole('reporter');

        $this->actingAs($reporter)
            ->post(route('admin.opinions.store'), [
                'titleBn' => 'op-noslug',
                'bodyBn'  => 'বডি কনটেন্ট',
                'edition' => 'bn',
                'status'  => 'draft',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('articles', ['title_bn' => 'op-noslug', 'status' => 'draft']);
    }

    public function test_news_store_succeeds_without_english_fields(): void
    {
        $reporter = $this->userWithRole('reporter');
        $c = $this->category();

        $this->actingAs($reporter)
            ->post(route('admin.news.store'), [
                'titleBn'         => 'news-noen',
                'bodyBn'          => 'বডি কনটেন্ট',
                'edition'         => 'bn',
                'articleType'     => 'news',
                'status'          => 'draft',
                'categories'      => [$c->id],
                'primaryCategory' => $c->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('articles', ['title_bn' => 'news-noen', 'status' => 'draft']);
    }
}
