<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('video_url')->nullable()->after('video_provider');
            $table->string('video_duration', 10)->nullable()->after('video_url');
        });

        // Data migration: Move URLs from subtitle_en/subtitle_bn to video_url for video articles
        DB::table('articles')
            ->where('article_type', 'video')
            ->whereNotNull('subtitle_en')
            ->update([
                'video_url' => DB::raw('subtitle_en'),
                'video_duration' => '03:45' // Set default duration for migrated items
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn(['video_url', 'video_duration']);
        });
    }
};
