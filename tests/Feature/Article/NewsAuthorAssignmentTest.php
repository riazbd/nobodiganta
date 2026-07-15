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
 * Assigning an article/opinion to someone other than yourself (primary author
 * or co-author) requires the news.assign_author permission. Without it, the
 * byline is forced to the current user and any foreign co-author is dropped —
 * enforced on the server, so bypassing the UI does not help.
 */
class NewsAuthorAssignmentTest extends TestCase
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

    private function newsPayload(Category $c, array $overrides = []): array
    {
        return array_merge([
            'titleBn'         => 'byline-test',
            'bodyBn'          => 'বডি কনটেন্ট',
            'edition'         => 'bn',
            'articleType'     => 'news',
            'status'          => 'draft',
            'categories'      => [$c->id],
            'primaryCategory' => $c->id,
        ], $overrides);
    }

    public function test_editor_in_chief_role_has_assign_author_permission(): void
    {
        $role = Role::where('name', 'editor_in_chief')->firstOrFail();
        $this->assertContains('news.assign_author', $role->permissions()->pluck('name')->all());
    }

    public function test_reporter_role_lacks_assign_author_permission(): void
    {
        $role = Role::where('name', 'reporter')->firstOrFail();
        $this->assertNotContains('news.assign_author', $role->permissions()->pluck('name')->all());
    }

    public function test_reporter_cannot_set_a_different_primary_author_on_store(): void
    {
        $reporter = $this->userWithRole('reporter');
        $victim   = $this->userWithRole('reporter');
        $c = $this->category();

        $this->actingAs($reporter)
            ->post(route('admin.news.store'), $this->newsPayload($c, ['authorId' => $victim->id]));

        $this->assertDatabaseHas('articles', [
            'title_bn'  => 'byline-test',
            'author_id' => $reporter->id,
        ]);
    }

    public function test_reporter_cannot_set_a_coauthor_on_store(): void
    {
        $reporter = $this->userWithRole('reporter');
        $other    = $this->userWithRole('reporter');
        $c = $this->category();

        $this->actingAs($reporter)
            ->post(route('admin.news.store'), $this->newsPayload($c, ['secondaryAuthorId' => $other->id]));

        $this->assertDatabaseHas('articles', [
            'title_bn'            => 'byline-test',
            'secondary_author_id' => null,
        ]);
    }

    public function test_editor_can_set_a_different_primary_author_on_store(): void
    {
        $editor = $this->userWithRole('editor_in_chief');
        $author = $this->userWithRole('reporter');
        $c = $this->category();

        $this->actingAs($editor)
            ->post(route('admin.news.store'), $this->newsPayload($c, ['authorId' => $author->id]));

        $this->assertDatabaseHas('articles', [
            'title_bn'  => 'byline-test',
            'author_id' => $author->id,
        ]);
    }

    public function test_editor_can_set_a_coauthor_on_store(): void
    {
        $editor = $this->userWithRole('editor_in_chief');
        $co     = $this->userWithRole('reporter');
        $c = $this->category();

        $this->actingAs($editor)
            ->post(route('admin.news.store'), $this->newsPayload($c, ['secondaryAuthorId' => $co->id]));

        $this->assertDatabaseHas('articles', [
            'title_bn'            => 'byline-test',
            'secondary_author_id' => $co->id,
        ]);
    }

    public function test_reporter_cannot_reassign_author_on_update(): void
    {
        $reporter = $this->userWithRole('reporter');
        $victim   = $this->userWithRole('reporter');
        $c = $this->category();
        $article = Article::factory()->draft()->create([
            'author_id'   => $reporter->id,
            'category_id' => $c->id,
        ]);

        $this->actingAs($reporter)
            ->put(route('admin.news.update', ['article' => $article->id]),
                $this->newsPayload($c, ['authorId' => $victim->id]));

        $this->assertDatabaseHas('articles', [
            'id'        => $article->id,
            'author_id' => $reporter->id,
        ]);
    }

    public function test_reporter_cannot_set_coauthor_on_opinion_store(): void
    {
        Category::create(['name_bn' => 'মতামত', 'slug' => 'opinion']);
        $reporter = $this->userWithRole('reporter');
        $other    = $this->userWithRole('reporter');

        $this->actingAs($reporter)
            ->post(route('admin.opinions.store'), [
                'titleBn'           => 'op-byline',
                'bodyBn'            => 'বডি কনটেন্ট',
                'edition'           => 'bn',
                'status'            => 'draft',
                'secondaryAuthorId' => $other->id,
            ]);

        $this->assertDatabaseHas('articles', [
            'title_bn'            => 'op-byline',
            'secondary_author_id' => null,
        ]);
    }
}
