<?php

namespace Tests\Feature\Article;

use App\Models\Article;
use App\Models\AuditLog;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrashAutoPurgeTest extends TestCase
{
    use RefreshDatabase;

    /** Create a trashed article whose deleted_at is $days ago. */
    private function trashedDaysAgo(int $days): Article
    {
        $article = Article::factory()->create();
        $article->delete(); // soft delete -> deleted_at = now()
        Article::withTrashed()->where('id', $article->id)
            ->update(['deleted_at' => now()->subDays($days)]);

        return $article;
    }

    public function test_setting_exists_and_defaults_to_zero(): void
    {
        $this->assertDatabaseHas('settings', [
            'key'   => 'trash_auto_purge_days',
            'group' => 'content',
            'type'  => 'number',
        ]);
        $this->assertSame(0, (int) Setting::get('trash_auto_purge_days', 99));
    }

    public function test_command_purges_old_trash_when_enabled(): void
    {
        Setting::where('key', 'trash_auto_purge_days')->update(['value' => '30']);

        $old    = $this->trashedDaysAgo(31);
        $recent = $this->trashedDaysAgo(10);
        $live   = Article::factory()->create(); // not trashed

        $this->artisan('articles:purge-trash')->assertExitCode(0);

        $this->assertNull(Article::withTrashed()->find($old->id));        // gone from DB entirely
        $this->assertNotNull(Article::withTrashed()->find($recent->id));  // still in trash
        $this->assertNotNull(Article::find($live->id));                   // untouched
    }

    public function test_command_writes_audit_entry_with_count(): void
    {
        Setting::where('key', 'trash_auto_purge_days')->update(['value' => '30']);
        $this->trashedDaysAgo(40);

        $this->artisan('articles:purge-trash')->assertExitCode(0);

        $log = AuditLog::where('event', 'article.auto_purged')->first();
        $this->assertNotNull($log);
        $this->assertNull($log->user_id);
        $this->assertStringContainsString('1', $log->description);
    }

    public function test_command_is_noop_when_disabled(): void
    {
        // setting stays at default '0'
        $old = $this->trashedDaysAgo(365);

        $this->artisan('articles:purge-trash')->assertExitCode(0);

        $this->assertNotNull(Article::withTrashed()->find($old->id));
        $this->assertSame(0, AuditLog::where('event', 'article.auto_purged')->count());
    }
}
