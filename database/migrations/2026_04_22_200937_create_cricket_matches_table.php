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
        Schema::create('cricket_matches', function (Blueprint $table) {
            $table->id();
            $table->string('series_bn');
            $table->string('series_en');
            $table->enum('status', ['live', 'upcoming', 'completed'])->default('upcoming');
            $table->string('status_text_bn')->nullable();
            $table->string('status_text_en')->nullable();
            $table->json('teams'); // Store team names, scores, wickets, overs
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cricket_matches');
    }
};
