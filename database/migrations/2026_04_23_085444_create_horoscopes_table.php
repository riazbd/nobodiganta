<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horoscopes', function (Blueprint $table) {
            $table->id();
            $table->string('sign'); // Aries, Taurus, etc.
            $table->string('sign_bn'); // মেষ, বৃষ, etc.
            $table->date('date');
            $table->text('prediction_en');
            $table->text('prediction_bn');
            $table->timestamps();

            $table->unique(['sign', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horoscopes');
    }
};