<?php
// database/migrations/2026_05_08_100000_create_stories_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->string('title_bn');
            $table->string('title_en')->nullable();
            $table->string('slug')->unique();
            $table->foreignId('cover_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->enum('status', ['draft', 'published', 'expired', 'archived'])->default('draft');
            $table->enum('edition', ['bn', 'en', 'both'])->default('bn');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamps();

            $table->index('status');
            $table->index('edition');
            $table->index('published_at');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};
