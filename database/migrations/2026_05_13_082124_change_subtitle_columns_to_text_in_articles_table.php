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
            $table->text('subtitle_bn')->nullable()->change();
            $table->text('subtitle_en')->nullable()->change();
            $table->text('video_url')->nullable()->change();
            $table->text('featured_image')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('subtitle_bn')->nullable()->change();
            $table->string('subtitle_en')->nullable()->change();
            $table->string('video_url')->nullable()->change();
            $table->string('featured_image')->nullable()->change();
        });
    }
};
