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
        Schema::create('prices', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'gold_22k', 'diesel'
            $table->string('title_bn');
            $table->string('title_en');
            $table->decimal('amount', 15, 2);
            $table->string('currency')->default('BDT');
            $table->string('unit')->nullable(); // vori, gram, litre
            $table->enum('trend', ['up', 'down', 'neutral'])->default('neutral');
            $table->decimal('change', 10, 2)->default(0);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prices');
    }
};
