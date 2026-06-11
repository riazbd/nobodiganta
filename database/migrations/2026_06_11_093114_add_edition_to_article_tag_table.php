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
        Schema::table('article_tag', function (Blueprint $table) {
            $table->dropUnique(['article_id', 'tag_id']);
            $table->string('edition', 2)->default('bn')->after('tag_id');
        });

        \DB::table('article_tag')->whereNull('edition')->update(['edition' => 'bn']);

        Schema::table('article_tag', function (Blueprint $table) {
            $table->unique(['article_id', 'tag_id', 'edition']);
        });
    }

    public function down(): void
    {
        Schema::table('article_tag', function (Blueprint $table) {
            $table->dropUnique(['article_id', 'tag_id', 'edition']);
            $table->dropColumn('edition');
        });

        Schema::table('article_tag', function (Blueprint $table) {
            $table->unique(['article_id', 'tag_id']);
        });
    }
};
