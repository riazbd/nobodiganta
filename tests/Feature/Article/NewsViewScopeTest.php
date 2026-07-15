<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Reporters may only view their OWN news in the admin listings, and the
 * Breaking News admin page is reserved for users who can manage breaking news
 * (news.breaking) — reporters must not reach it.
 */
class NewsViewScopeTest extends TestCase
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

    public function test_reporter_role_has_view_own_but_not_view_all(): void
    {
        $role = Role::where('name', 'reporter')->firstOrFail();
        $perms = $role->permissions()->pluck('name')->all();

        $this->assertContains('news.view.own', $perms);
        $this->assertNotContains('news.view', $perms);
    }

    public function test_reporter_sees_only_their_own_articles_in_all_news(): void
    {
        $reporter = $this->userWithRole('reporter');
        $other    = $this->userWithRole('reporter');
        $c = $this->category();

        $mine     = Article::factory()->create(['author_id' => $reporter->id, 'category_id' => $c->id]);
        $notMine  = Article::factory()->create(['author_id' => $other->id,    'category_id' => $c->id]);

        $this->actingAs($reporter)
            ->get(route('admin.news'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('articles.data', 1)
                ->where('articles.data.0.id', $mine->id));
    }

    public function test_editor_in_chief_sees_all_articles_in_all_news(): void
    {
        $editor = $this->userWithRole('editor_in_chief');
        $r      = $this->userWithRole('reporter');
        $c = $this->category();

        Article::factory()->create(['author_id' => $editor->id, 'category_id' => $c->id]);
        Article::factory()->create(['author_id' => $r->id,      'category_id' => $c->id]);

        $this->actingAs($editor)
            ->get(route('admin.news'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('articles.data', 2));
    }

    public function test_reporter_sees_only_their_own_articles_in_drafts(): void
    {
        $reporter = $this->userWithRole('reporter');
        $other    = $this->userWithRole('reporter');
        $c = $this->category();

        $mine = Article::factory()->draft()->create(['author_id' => $reporter->id, 'category_id' => $c->id]);
        Article::factory()->draft()->create(['author_id' => $other->id, 'category_id' => $c->id]);

        $this->actingAs($reporter)
            ->get(route('admin.news.drafts'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('articles.data', 1)
                ->where('articles.data.0.id', $mine->id));
    }

    public function test_reporter_sees_only_their_own_pending_articles(): void
    {
        $reporter = $this->userWithRole('reporter');
        $other    = $this->userWithRole('reporter');
        $c = $this->category();

        $mine = Article::factory()->create([
            'author_id' => $reporter->id, 'category_id' => $c->id, 'status' => 'pending',
        ]);
        Article::factory()->create([
            'author_id' => $other->id, 'category_id' => $c->id, 'status' => 'pending',
        ]);

        $this->actingAs($reporter)
            ->get(route('admin.news.pending'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('articles.data', 1)
                ->where('articles.data.0.id', $mine->id));
    }

    public function test_editor_in_chief_sees_all_pending_articles(): void
    {
        $editor = $this->userWithRole('editor_in_chief');
        $r      = $this->userWithRole('reporter');
        $c = $this->category();

        Article::factory()->create(['author_id' => $editor->id, 'category_id' => $c->id, 'status' => 'pending']);
        Article::factory()->create(['author_id' => $r->id,      'category_id' => $c->id, 'status' => 'pending']);

        $this->actingAs($editor)
            ->get(route('admin.news.pending'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('articles.data', 2));
    }

    public function test_reporter_sees_only_their_own_articles_in_trash(): void
    {
        $reporter = $this->userWithRole('reporter');
        $other    = $this->userWithRole('reporter');
        $c = $this->category();

        $mine = Article::factory()->create(['author_id' => $reporter->id, 'category_id' => $c->id]);
        $mine->delete();
        $theirs = Article::factory()->create(['author_id' => $other->id, 'category_id' => $c->id]);
        $theirs->delete();

        $this->actingAs($reporter)
            ->get(route('admin.news.trash'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('articles.data', 1)
                ->where('articles.data.0.id', $mine->id));
    }

    public function test_reporter_cannot_open_breaking_news_page(): void
    {
        $reporter = $this->userWithRole('reporter');

        $this->actingAs($reporter)
            ->get(route('admin.breaking'))
            ->assertForbidden();
    }

    public function test_editor_in_chief_can_open_breaking_news_page(): void
    {
        $editor = $this->userWithRole('editor_in_chief');

        $this->actingAs($editor)
            ->get(route('admin.breaking'))
            ->assertOk();
    }
}
