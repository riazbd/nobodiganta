<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Media items are shared library assets — when their uploader is deleted the
     * file must be preserved (it may be used across many articles). Switch the
     * uploader FK from cascade-delete to null-on-delete so the media survives and
     * the uploader is simply detached, rather than the row being wiped.
     */
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('media', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        Schema::table('media', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
