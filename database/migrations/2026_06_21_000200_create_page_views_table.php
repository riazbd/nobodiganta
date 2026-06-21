<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lightweight page-view log powering the dashboard's real traffic metrics
     * (today's unique visitors, 7-day chart, referrers). One row per public page
     * hit; visitor_hash is a daily-salted hash of IP+UA so the same person counts
     * once per day without storing PII.
     */
    public function up(): void
    {
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->string('path', 512)->nullable();
            $table->string('visitor_hash', 64)->index();
            $table->string('referrer_host')->nullable();
            $table->string('edition', 5)->nullable();
            $table->timestamp('created_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};
