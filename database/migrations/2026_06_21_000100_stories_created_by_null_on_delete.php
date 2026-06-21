<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Stories are ephemeral and never publicly bylined, so created_by is just
     * provenance ("who made it"), not transferable authorship. Switch it from
     * non-nullable + restrict to nullable + null-on-delete, so deleting a user
     * preserves their stories with the creator honestly detached, rather than
     * blocking the delete or crediting a successor who never made them.
     */
    public function up(): void
    {
        Schema::table('stories', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
        });
        Schema::table('stories', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->change();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('stories', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
        });
        Schema::table('stories', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable(false)->change();
            $table->foreign('created_by')->references('id')->on('users');
        });
    }
};
