<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutoArchiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_auto_archive_days_setting_exists_and_defaults_to_zero(): void
    {
        $this->assertDatabaseHas('settings', [
            'key'   => 'auto_archive_days',
            'group' => 'content',
            'type'  => 'number',
        ]);
        $this->assertSame(0, (int) Setting::get('auto_archive_days', 99));
    }

    public function test_command_archives_old_published_articles_when_enabled(): void
    {
        Setting::where('key', 'auto_archive_days')->update(['value' => '30']);

        $old    = Article::factory()->create(['published_at' => now()->subDays(31)]);
        $recent = Article::factory()->create(['published_at' => now()->subDays(10)]);

        $this->artisan('articles:auto-archive')->assertExitCode(0);

        $this->assertEquals('archived', $old->fresh()->status);
        $this->assertEquals('published', $recent->fresh()->status);
    }

    public function test_command_is_noop_when_disabled(): void
    {
        // setting stays at default '0'
        $old = Article::factory()->create(['published_at' => now()->subDays(365)]);

        $this->artisan('articles:auto-archive')->assertExitCode(0);

        $this->assertEquals('published', $old->fresh()->status);
    }
}
