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

        $now = now()->toDateTimeString();

        // 2. Seed pivot from existing category_id (primary entries)
        DB::table('articles')
            ->whereNotNull('category_id')
            ->select('id', 'category_id')
            ->orderBy('id')
            ->each(function ($row) use ($now) {
                DB::table('article_category')->insertOrIgnore([
                    'article_id'  => $row->id,
                    'category_id' => $row->category_id,
                    'is_primary'  => true,
                    'sort_order'  => 0,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);
            });

        // 3. Seed pivot from existing subcategory_id (secondary entries)
        // insertOrIgnore() skips duplicates on both MySQL and PostgreSQL
        DB::table('articles')
            ->whereNotNull('subcategory_id')
            ->select('id', 'subcategory_id')
            ->orderBy('id')
            ->each(function ($row) use ($now) {
                DB::table('article_category')->insertOrIgnore([
                    'article_id'  => $row->id,
                    'category_id' => $row->subcategory_id,
                    'is_primary'  => false,
                    'sort_order'  => 1,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);
            });

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

        // Restore subcategory_id from pivot (lowest sort_order non-primary per article)
        DB::table('article_category')
            ->where('is_primary', false)
            ->orderBy('article_id')
            ->orderBy('sort_order')
            ->select('article_id', 'category_id')
            ->get()
            ->unique('article_id')
            ->each(function ($row) {
                DB::table('articles')
                    ->where('id', $row->article_id)
                    ->whereNull('subcategory_id')
                    ->update(['subcategory_id' => $row->category_id]);
            });

        Schema::dropIfExists('article_category');
    }
};
