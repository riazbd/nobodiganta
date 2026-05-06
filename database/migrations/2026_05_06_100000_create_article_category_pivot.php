<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create the pivot table
        Schema::create('article_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->boolean('is_primary')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['article_id', 'category_id']);
            $table->index(['article_id', 'is_primary']);
            $table->index(['category_id', 'is_primary']);
        });

        // 2. Seed pivot from existing category_id (primary entries)
        DB::statement("
            INSERT INTO article_category (article_id, category_id, is_primary, sort_order, created_at, updated_at)
            SELECT id, category_id, TRUE, 0, NOW(), NOW()
            FROM articles
            WHERE category_id IS NOT NULL
        ");

        // 3. Seed pivot from existing subcategory_id (secondary entries)
        DB::statement("
            INSERT INTO article_category (article_id, category_id, is_primary, sort_order, created_at, updated_at)
            SELECT id, subcategory_id, FALSE, 1, NOW(), NOW()
            FROM articles
            WHERE subcategory_id IS NOT NULL
            ON CONFLICT (article_id, category_id) DO NOTHING
        ");

        // 4. Drop subcategory_id column
        Schema::table('articles', function (Blueprint $table) {
            $table->dropIndex(['subcategory_id', 'status']);
            $table->dropForeign(['subcategory_id']);
            $table->dropColumn('subcategory_id');
        });
    }

    public function down(): void
    {
        // Re-add subcategory_id
        Schema::table('articles', function (Blueprint $table) {
            $table->foreignId('subcategory_id')
                ->nullable()
                ->after('category_id')
                ->constrained('categories')
                ->onDelete('set null');
            $table->index(['subcategory_id', 'status']);
        });

        // Restore subcategory_id from pivot (first non-primary category per article)
        DB::statement("
            UPDATE articles SET subcategory_id = ac.category_id
            FROM (
                SELECT DISTINCT ON (article_id) article_id, category_id
                FROM article_category
                WHERE is_primary = FALSE
                ORDER BY article_id, sort_order
            ) ac
            WHERE articles.id = ac.article_id AND articles.subcategory_id IS NULL
        ");

        Schema::dropIfExists('article_category');
    }
};
