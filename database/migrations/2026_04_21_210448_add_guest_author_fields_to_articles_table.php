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
            $table->string('guest_author_name_bn')->nullable()->after('author_id');
            $table->string('guest_author_name_en')->nullable()->after('guest_author_name_bn');
            $table->text('guest_author_bio_bn')->nullable()->after('guest_author_name_en');
            $table->text('guest_author_bio_en')->nullable()->after('guest_author_bio_bn');
            $table->string('guest_author_image')->nullable()->after('guest_author_bio_en');
            $table->boolean('is_guest_author')->default(false)->after('guest_author_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn([
                'guest_author_name_bn',
                'guest_author_name_en',
                'guest_author_bio_bn',
                'guest_author_bio_en',
                'guest_author_image',
                'is_guest_author'
            ]);
        });
    }
};
