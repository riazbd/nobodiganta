<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Turn ads into bookings: link each to a client and a slot, and record the
     * agreed pricing (flat price and/or CPM rate).
     */
    public function up(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->after('id')->constrained('ad_clients')->nullOnDelete();
            $table->foreignId('slot_id')->nullable()->after('client_id')->constrained('ad_slots')->nullOnDelete();
            $table->string('pricing_model')->default('flat')->after('position'); // flat | cpm
            $table->decimal('price', 12, 2)->nullable()->after('pricing_model');  // agreed flat price
            $table->decimal('cpm_rate', 10, 2)->nullable()->after('price');       // agreed CPM rate
        });
    }

    public function down(): void
    {
        Schema::table('ads', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['slot_id']);
            $table->dropColumn(['client_id', 'slot_id', 'pricing_model', 'price', 'cpm_rate']);
        });
    }
};
