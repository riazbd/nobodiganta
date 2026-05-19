<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            SettingSeeder::class,
            DefaultCategoriesSeeder::class,
            TestUsersSeeder::class,
            ReporterSeeder::class,
            TestDataSeeder::class,
            OpinionSeeder::class,
            MediaSeeder::class,
            VideoSeeder::class,
            CommentSeeder::class,
            AdSeeder::class,
            SubscriptionSeeder::class,
            AuditLogSeeder::class,
            StockSeeder::class,
            CricketMatchSeeder::class,
            PriceSeeder::class,
            PollSeeder::class,
            HoroscopeSeeder::class,
            EpaperSeeder::class,
            NewsletterSeeder::class,
            MoreArticlesSeeder::class,
            HomepageSectionSeeder::class,
            StoriesSeeder::class,
            SaradeshArticleSeeder::class,
        ]);
    }
}
