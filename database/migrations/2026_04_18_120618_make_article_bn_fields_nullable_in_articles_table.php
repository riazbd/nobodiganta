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
            $table->string('title_bn')->nullable()->change();
            $table->longText('body_bn')->nullable()->change();
            $table->string('slug_bn')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('title_bn')->nullable(false)->change();
            $table->longText('body_bn')->nullable(false)->change();
            $table->string('slug_bn')->nullable(false)->change();
        });
    }
};
