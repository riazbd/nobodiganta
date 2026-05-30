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
            $table->foreignId('in_article_ad_id')
                  ->nullable()
                  ->constrained('ads')
                  ->nullOnDelete()
                  ->after('allow_comments');
            $table->unsignedTinyInteger('in_article_ad_position')
                  ->default(4)
                  ->after('in_article_ad_id');
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropForeign(['in_article_ad_id']);
            $table->dropColumn(['in_article_ad_id', 'in_article_ad_position']);
        });
    }
};
