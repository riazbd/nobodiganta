<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('upazilas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('district_id')->constrained()->cascadeOnDelete();
            $table->string('slug');
            $table->string('name_bn');
            $table->string('name_en');
            $table->timestamps();

            $table->unique(['district_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('upazilas');
    }
};
