<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weather', function (Blueprint $table) {
            $table->id();
            $table->string('city_bn');
            $table->string('city_en');
            $table->date('date');
            $table->integer('temp_c');
            $table->string('condition_bn');
            $table->string('condition_en');
            $table->integer('humidity');
            $table->integer('wind_kph');
            $table->integer('max_temp_c');
            $table->integer('min_temp_c');
            $table->string('icon')->default('sun');
            $table->timestamps();

            $table->unique(['city_en', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weather');
    }
};