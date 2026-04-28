<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prayer_times', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->string('fajr');
            $table->string('sunrise');
            $table->string('dhuhr');
            $table->string('asr');
            $table->string('maghrib');
            $table->string('sunset');
            $table->string('isha');
            $table->string('isha_end')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prayer_times');
    }
};