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
        Schema::create('live_blog_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->string('headline_bn')->nullable();
            $table->string('headline_en')->nullable();
            $table->text('body_bn');
            $table->text('body_en');
            $table->string('author_name_bn')->nullable();
            $table->string('author_name_en')->nullable();
            $table->boolean('is_key_event')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('live_blog_updates');
    }
};
