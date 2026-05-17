<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::dropIfExists('prayer_times');
        Schema::dropIfExists('weathers');
    }
    public function down(): void
    {
        Schema::create('prayer_times', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->string('fajr'); $table->string('sunrise');
            $table->string('dhuhr'); $table->string('asr');
            $table->string('maghrib'); $table->string('sunset');
            $table->string('isha'); $table->string('isha_end')->nullable();
            $table->timestamps();
        });
        Schema::create('weathers', function (Blueprint $table) {
            $table->id(); $table->string('city_bn'); $table->string('city_en');
            $table->date('date'); $table->float('temp_c'); $table->string('condition_bn');
            $table->string('condition_en'); $table->integer('humidity');
            $table->float('wind_kph'); $table->float('max_temp_c'); $table->float('min_temp_c');
            $table->string('icon')->nullable(); $table->timestamps();
        });
    }
};
