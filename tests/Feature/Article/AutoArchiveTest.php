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
}
