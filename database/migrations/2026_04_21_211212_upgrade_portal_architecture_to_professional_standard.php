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
        // 1. Articles: Add Professional Metadata
        Schema::table('articles', function (Blueprint $table) {
            $table->foreignId('secondary_author_id')->nullable()->constrained('users')->after('author_id');
            $table->boolean('is_exclusive')->default(false)->after('is_featured');
            $table->string('video_provider')->nullable()->after('article_type'); // youtube, vimeo, local
        });

        // 2. Categories: Add Theming & SEO
        Schema::table('categories', function (Blueprint $table) {
            $table->string('color_code', 7)->default('#e8001e')->after('slug');
            $table->text('meta_description_bn')->nullable()->after('description_en');
            $table->text('meta_description_en')->nullable()->after('meta_description_bn');
        });

        // 3. Media: Add Licensing & Attribution
        Schema::table('media', function (Blueprint $table) {
            $table->string('credit_bn')->nullable()->after('caption_en');
            $table->string('credit_en')->nullable()->after('credit_bn');
            $table->string('source_link')->nullable()->after('credit_en');
            $table->string('license_type')->default('internal')->after('source_link'); // internal, creative_commons, stock, user_submitted
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropForeign(['secondary_author_id']);
            $table->dropColumn(['secondary_author_id', 'is_exclusive', 'video_provider']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['color_code', 'meta_description_bn', 'meta_description_en']);
        });

        Schema::table('media', function (Blueprint $table) {
            $table->dropColumn(['credit_bn', 'credit_en', 'source_link', 'license_type']);
        });
    }
};
