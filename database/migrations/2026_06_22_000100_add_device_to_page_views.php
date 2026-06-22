<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Device class (mobile / tablet / desktop) parsed from the user-agent at
     * collection time, so Traffic Analytics can show a real device breakdown.
     * Populated going forward; older rows stay null and are bucketed as "unknown".
     */
    public function up(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->string('device', 10)->nullable()->after('edition');
        });
    }

    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->dropColumn('device');
        });
    }
};
