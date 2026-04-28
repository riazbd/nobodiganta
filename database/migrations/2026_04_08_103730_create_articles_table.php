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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            
            // Bilingual content
            $table->string('title_bn');
            $table->string('title_en')->nullable();
            $table->string('subtitle_bn')->nullable();
            $table->string('subtitle_en')->nullable();
            $table->longText('body_bn');
            $table->longText('body_en')->nullable();
            
            // SEO slugs
            $table->string('slug_bn')->unique();
            $table->string('slug_en')->nullable()->unique();
            
            // Excerpts for cards/meta
            $table->text('excerpt_bn')->nullable();
            $table->text('excerpt_en')->nullable();
            
            // Edition & type
            $table->enum('edition', ['both', 'bn', 'en'])->default('both');
            $table->enum('article_type', [
                'news', 'feature', 'opinion', 'interview', 
                'explainer', 'video', 'photo', 'liveblog', 'sponsored'
            ])->default('news');
            $table->enum('status', ['draft', 'pending', 'published', 'scheduled', 'archived'])->default('draft');
            
            // Flags
            $table->boolean('is_breaking')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_premium')->default(false); // Behind paywall
            
            // Relationships
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            
            // Media
            $table->string('featured_image')->nullable();
            $table->string('featured_image_alt_bn')->nullable();
            $table->string('featured_image_alt_en')->nullable();
            $table->string('featured_image_caption_bn')->nullable();
            $table->string('featured_image_caption_en')->nullable();
            
            // Analytics
            $table->unsignedBigInteger('views')->default(0);
            $table->integer('read_time_bn')->nullable(); // Minutes
            $table->integer('read_time_en')->nullable();
            
            // SEO overrides
            $table->string('meta_title_bn')->nullable();
            $table->string('meta_title_en')->nullable();
            $table->text('meta_description_bn')->nullable();
            $table->text('meta_description_en')->nullable();
            
            // Publishing
            $table->timestamp('published_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['status', 'published_at']);
            $table->index(['category_id', 'status']);
            $table->index(['author_id', 'status']);
            $table->index(['edition', 'status']);
            $table->index(['is_breaking', 'is_featured']);
            $table->index(['is_premium', 'status']);
            $table->index(['article_type', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
