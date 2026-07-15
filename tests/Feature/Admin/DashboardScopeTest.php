<?php

namespace Tests\Feature\Admin;

use App\Models\Article;
use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The admin dashboard shows site-wide statistics only to users who can view
 * analytics (analytics.view). Reporters (analytics.view.own) get a dashboard
 * scoped to their OWN publication stats — never global figures.
 */
class DashboardScopeTest extends TestCase
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

    public function test_reporter_dashboard_is_scoped_to_own_articles(): void
    {
        $reporter = $this->userWithRole('reporter');
        $other    = $this->userWithRole('reporter');
        $c = Category::create(['name_bn' => 'টেস্ট', 'slug' => 'test-cat-' . uniqid()]);

        Article::factory()->count(2)->create(['author_id' => $reporter->id, 'category_id' => $c->id, 'status' => 'published']);
        Article::factory()->count(3)->create(['author_id' => $other->id,    'category_id' => $c->id, 'status' => 'published']);

        $this->actingAs($reporter)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('stats.published', 2)   // own only, not the 5 site-wide
                ->missing('serverHealth')        // global-only data must not leak
                ->missing('activities'));
    }

    public function test_editor_in_chief_gets_the_global_dashboard(): void
    {
        $editor = $this->userWithRole('editor_in_chief');

        $this->actingAs($editor)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('serverHealth')
                ->has('activities'));
    }
}
