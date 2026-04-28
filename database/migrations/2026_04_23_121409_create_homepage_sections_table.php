<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('homepage_sections', function (Blueprint $table) {
            $table->id();
            $table->string('title_bn')->nullable();
            $table->string('title_en')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type')->default('category'); // category, trending, most_read, videos
            $table->string('layout')->default('grid'); // grid, list, featured_left, sidebar_right
            $table->integer('item_count')->default(4);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->enum('edition', ['bn', 'en', 'both'])->default('both');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('homepage_sections');
    }
};