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
}
