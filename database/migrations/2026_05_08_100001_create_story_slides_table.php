<?php
// database/migrations/2026_05_08_100001_create_story_slides_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('story_slides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('story_id')->constrained('stories')->cascadeOnDelete();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->foreignId('media_id')->constrained('media');
            $table->string('text_overlay_bn')->nullable();
            $table->string('text_overlay_en')->nullable();
            $table->foreignId('linked_article_id')->nullable()->constrained('articles')->nullOnDelete();
            $table->unsignedTinyInteger('duration')->default(5);
            $table->timestamps();

            $table->index(['story_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('story_slides');
    }
};
