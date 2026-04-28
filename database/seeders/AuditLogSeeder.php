<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\User;
use App\Models\Article;
use Illuminate\Database\Seeder;

class AuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $articles = Article::all();

        if ($users->isEmpty()) {
            return;
        }

        $events = [
            ['event' => 'login', 'description' => 'User logged into the admin panel'],
            ['event' => 'article.created', 'description' => 'Created a new news article'],
            ['event' => 'article.updated', 'description' => 'Updated article content and SEO metadata'],
            ['event' => 'article.published', 'description' => 'Published article to the live site'],
            ['event' => 'role.updated', 'description' => 'Updated permissions for Reporter role'],
            ['event' => 'settings.updated', 'description' => 'Changed site maintenance mode settings'],
            ['event' => 'media.uploaded', 'description' => 'Uploaded new images to the media library'],
            ['event' => 'comment.approved', 'description' => 'Approved reader comment on article'],
            ['event' => 'ad.created', 'description' => 'Created a new banner advertisement'],
        ];

        for ($i = 0; $i < 50; $i++) {
            $user = $users->random();
            $eventData = $events[array_rand($events)];
            
            $properties = null;
            if (str_contains($eventData['event'], 'updated')) {
                $properties = [
                    'old' => ['status' => 'draft'],
                    'new' => ['status' => 'published']
                ];
            }

            AuditLog::create([
                'user_id' => $user->id,
                'event' => $eventData['event'],
                'description' => $eventData['description'],
                'properties' => $properties,
                'ip_address' => '192.168.1.' . rand(10, 254),
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'created_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
            ]);
        }
    }
}
