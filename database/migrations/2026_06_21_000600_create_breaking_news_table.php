<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Dedicated breaking-news system. An item may link to an article OR stand
     * alone (quick headline). Lifecycle is driven by is_active + starts_at /
     * expires_at so breaking news auto-clears instead of lingering forever.
     */
    public function up(): void
    {
        Schema::create('breaking_news', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->nullable()->constrained('articles')->nullOnDelete();
            $table->string('headline_bn')->nullable();
            $table->string('headline_en')->nullable();
            $table->string('link')->nullable();
            $table->string('severity')->default('breaking'); // just_in | breaking | urgent | live
            $table->integer('priority')->default(0);
            $table->boolean('is_pinned')->default(false);
            $table->string('edition', 5)->default('both');    // bn | en | both
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('push_enabled')->default(false);  // push hooks (sending wired later)
            $table->timestamp('push_sent_at')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('clicks')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_active', 'expires_at']);
            $table->index('article_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('breaking_news');
    }
};
