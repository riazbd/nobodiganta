<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('epapers', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('edition')->default('bn'); // bn, en
            $table->string('pdf_url')->nullable();
            $table->string('thumbnail_url')->nullable();
            $table->string('label_bn')->nullable();
            $table->string('label_en')->nullable();
            $table->timestamps();

            $table->unique(['date', 'edition']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('epapers');
    }
};