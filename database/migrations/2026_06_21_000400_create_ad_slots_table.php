<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Sellable ad inventory. Each slot maps to a serving position (key), carries
     * reference pricing (flat rate + optional CPM) and a capacity (total slots
     * available); occupancy is derived from active bookings (ads) in the slot.
     */
    public function up(): void
    {
        Schema::create('ad_slots', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();        // serving position, e.g. header, sidebar_top
            $table->string('name_bn');
            $table->string('name_en');
            $table->string('description')->nullable();
            $table->string('size')->default('mrec'); // leaderboard|mrec|half-page|billboard|in-article|mobile-banner
            $table->string('dimensions')->nullable(); // e.g. "728x90"
            $table->decimal('rate', 12, 2)->nullable();      // reference flat rate
            $table->decimal('rate_cpm', 10, 2)->nullable();  // reference CPM rate
            $table->unsignedInteger('capacity')->default(1); // total available slots
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed default slots from the positions already used across the site.
        $now = now();
        $defaults = [
            ['key' => 'header',          'name_bn' => 'হেডার ব্যানার',        'name_en' => 'Header Banner',        'size' => 'leaderboard',  'dimensions' => '728x90',  'capacity' => 2],
            ['key' => 'home_top',        'name_bn' => 'হোম — উপরে',           'name_en' => 'Home Top',             'size' => 'billboard',    'dimensions' => '970x250', 'capacity' => 1],
            ['key' => 'mid_home',        'name_bn' => 'হোম — মাঝে',           'name_en' => 'Home Middle',          'size' => 'billboard',    'dimensions' => '970x250', 'capacity' => 2],
            ['key' => 'home_bottom',     'name_bn' => 'হোম — নিচে',           'name_en' => 'Home Bottom',          'size' => 'leaderboard',  'dimensions' => '728x90',  'capacity' => 2],
            ['key' => 'sidebar_top',     'name_bn' => 'সাইডবার — উপরে',       'name_en' => 'Sidebar Top',          'size' => 'mrec',         'dimensions' => '300x250', 'capacity' => 3],
            ['key' => 'sidebar_middle',  'name_bn' => 'সাইডবার — মাঝে',       'name_en' => 'Sidebar Middle',       'size' => 'mrec',         'dimensions' => '300x250', 'capacity' => 3],
            ['key' => 'in_article',      'name_bn' => 'আর্টিকেলের ভেতরে',     'name_en' => 'In-Article',           'size' => 'in-article',   'dimensions' => '300x250', 'capacity' => 4],
            ['key' => 'article_bottom',  'name_bn' => 'আর্টিকেলের নিচে',      'name_en' => 'Article Bottom',       'size' => 'leaderboard',  'dimensions' => '728x90',  'capacity' => 2],
            ['key' => 'category_middle', 'name_bn' => 'ক্যাটাগরি — মাঝে',     'name_en' => 'Category Middle',      'size' => 'leaderboard',  'dimensions' => '728x90',  'capacity' => 2],
            ['key' => 'between_sections','name_bn' => 'সেকশনের মাঝে',         'name_en' => 'Between Sections',     'size' => 'billboard',    'dimensions' => '970x250', 'capacity' => 2],
        ];

        $sort = 0;
        foreach ($defaults as $d) {
            DB::table('ad_slots')->updateOrInsert(
                ['key' => $d['key']],
                array_merge($d, [
                    'is_active' => true,
                    'sort_order' => $sort++,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_slots');
    }
};
