<?php
// tests/Feature/StoriesPublicTest.php

namespace Tests\Feature;

use App\Models\Story;
use App\Models\User;
use App\Models\Media;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoriesPublicTest extends TestCase
{
    use RefreshDatabase;

    public function test_story_get_title_returns_bangla_by_default(): void
    {
        $story = new Story(['title_bn' => 'বাংলা শিরোনাম', 'title_en' => 'English Title']);
        $this->assertEquals('বাংলা শিরোনাম', $story->getTitle());
    }

    public function test_story_get_title_returns_english_when_requested(): void
    {
        $story = new Story(['title_bn' => 'বাংলা শিরোনাম', 'title_en' => 'English Title']);
        $this->assertEquals('English Title', $story->getTitle('en'));
    }

    public function test_story_get_title_falls_back_to_bangla_when_english_missing(): void
    {
        $story = new Story(['title_bn' => 'বাংলা শিরোনাম', 'title_en' => null]);
        $this->assertEquals('বাংলা শিরোনাম', $story->getTitle('en'));
    }

    public function test_is_expired_returns_true_when_expires_at_is_past(): void
    {
        $story = new Story(['expires_at' => now()->subHour()]);
        $this->assertTrue($story->isExpired());
    }

    public function test_is_expired_returns_false_when_expires_at_is_future(): void
    {
        $story = new Story(['expires_at' => now()->addHour()]);
        $this->assertFalse($story->isExpired());
    }

    public function test_is_expired_returns_false_when_expires_at_is_null(): void
    {
        $story = new Story(['expires_at' => null]);
        $this->assertFalse($story->isExpired());
    }
}
