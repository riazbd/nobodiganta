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
        Schema::table('media', function (Blueprint $table) {
            // Add edition column: 'bn' (Bangla), 'en' (English), 'both' (both editions)
            $table->string('edition', 10)->default('both')->after('is_webp');
            
            // Add index for edition filtering
            $table->index('edition');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropIndex(['edition']);
            $table->dropColumn('edition');
        });
    }
};
