<?php
namespace Tests\Feature\Admin;

use App\Models\Story;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoryControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    private function makeUserWithPermission(string $permission): User
    {
        $perm = \App\Models\Permission::firstOrCreate(['name' => $permission, 'group' => 'stories']);
        $role = \App\Models\Role::firstOrCreate(
            ['name' => 'test_role_' . md5($permission)],
            ['label_en' => 'Test Role', 'label_bn' => 'পরীক্ষা রোল', 'level' => 1]
        );
        $role->permissions()->syncWithoutDetaching([$perm->id]);
        $user = User::factory()->create(['role_id' => $role->id]);
        return $user;
    }

    public function test_index_requires_stories_view_any_permission(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->get(route('admin.stories'))
            ->assertStatus(403);
    }

    public function test_index_returns_ok_with_permission(): void
    {
        $user = $this->makeUserWithPermission('stories.view_any');
        $this->actingAs($user)
            ->get(route('admin.stories'))
            ->assertStatus(200);
    }

    public function test_store_creates_draft_story(): void
    {
        $user = $this->makeUserWithPermission('stories.create');
        $this->actingAs($user)
            ->postJson(route('admin.stories.store'), [
                'title_bn' => 'পরীক্ষামূলক স্টোরি',
                'edition' => 'bn',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('stories', [
            'title_bn' => 'পরীক্ষামূলক স্টোরি',
            'status' => 'draft',
            'created_by' => $user->id,
        ]);
    }

    public function test_publish_requires_publish_permission(): void
    {
        $creator = $this->makeUserWithPermission('stories.create');
        $story = Story::factory()->create(['created_by' => $creator->id, 'status' => 'draft']);

        $this->actingAs($creator)
            ->postJson(route('admin.stories.publish', $story))
            ->assertStatus(403);
    }

    public function test_publish_sets_status_to_published(): void
    {
        $editor = $this->makeUserWithPermission('stories.publish');
        $story = Story::factory()->create(['status' => 'draft', 'created_by' => $editor->id]);

        $this->actingAs($editor)
            ->postJson(route('admin.stories.publish', $story))
            ->assertStatus(200);

        $this->assertEquals('published', $story->fresh()->status);
    }

    public function test_restore_requires_restore_expired_permission(): void
    {
        $editor = $this->makeUserWithPermission('stories.publish');
        $story = Story::factory()->create(['status' => 'expired', 'created_by' => $editor->id]);

        $this->actingAs($editor)
            ->postJson(route('admin.stories.restore', $story))
            ->assertStatus(403);
    }

    public function test_restore_sets_status_to_published(): void
    {
        $editor = $this->makeUserWithPermission('stories.restore_expired');
        $story = Story::factory()->create(['status' => 'expired', 'created_by' => $editor->id]);

        $this->actingAs($editor)
            ->postJson(route('admin.stories.restore', $story))
            ->assertStatus(200);

        $this->assertEquals('published', $story->fresh()->status);
    }

    public function test_update_requires_create_permission_for_own_story(): void
    {
        $user = $this->makeUserWithPermission('stories.view_any');
        $story = Story::factory()->create(['created_by' => $user->id]);

        $this->actingAs($user)
            ->putJson(route('admin.stories.update', $story), [
                'title_bn' => 'আপডেট শিরোনাম',
                'edition' => 'bn',
            ])
            ->assertStatus(403);
    }

    public function test_update_rejects_past_expires_at(): void
    {
        $user = $this->makeUserWithPermission('stories.edit');
        $story = Story::factory()->create(['created_by' => $user->id]);

        $this->actingAs($user)
            ->putJson(route('admin.stories.update', $story), [
                'title_bn' => 'আপডেট শিরোনাম',
                'edition' => 'bn',
                'expires_at' => now()->subDay()->toIso8601String(),
            ])
            ->assertStatus(422);
    }
}
