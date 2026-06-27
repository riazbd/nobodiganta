<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Default auto-expiry window (hours) for breaking items that are created
     * without an explicit "Expires at". 24 = items auto-clear after one day.
     * 0 disables the default (items then never time-expire unless set manually).
     * Idempotent so it's safe on production.
     */
    public function up(): void
    {
        if (DB::table('settings')->where('key', 'breaking_default_expiry_hours')->exists()) {
            return;
        }

        DB::table('settings')->insert([
            'key'            => 'breaking_default_expiry_hours',
            'value'          => '24',
            'group'          => 'breaking',
            'type'           => 'number',
            'label_bn'       => 'ডিফল্ট মেয়াদ (ঘণ্টা)',
            'label_en'       => 'Default expiry (hours)',
            'description_bn' => 'মেয়াদ না দিলে ব্রেকিং আইটেম কত ঘণ্টা পর স্বয়ংক্রিয়ভাবে মুছে যাবে। ২৪ = এক দিন। ০ দিলে স্বয়ংক্রিয় মেয়াদ বন্ধ।',
            'description_en' => 'Hours after which a breaking item auto-expires when no explicit expiry is set. 24 = one day. 0 disables the default.',
            'is_public'      => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'breaking_default_expiry_hours')->delete();
    }
};
