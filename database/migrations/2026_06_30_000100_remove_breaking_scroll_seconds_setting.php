<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The breaking bar no longer has a "scroll phase" — the scroll ticker always
     * runs and the alert is a separate banner that flashes in on an interval.
     * So breaking_scroll_seconds is dead; drop its row so it stops showing in the
     * admin Settings → Breaking tab. Forward-only cleanup, idempotent.
     */
    public function up(): void
    {
        DB::table('settings')->where('key', 'breaking_scroll_seconds')->delete();
    }

    public function down(): void
    {
        if (DB::table('settings')->where('key', 'breaking_scroll_seconds')->exists()) {
            return;
        }

        DB::table('settings')->insert([
            'key'            => 'breaking_scroll_seconds',
            'value'          => '30',
            'group'          => 'breaking',
            'type'           => 'number',
            'label_bn'       => 'স্ক্রল ফেজের সময় (সেকেন্ড)',
            'label_en'       => 'Scroll phase seconds',
            'description_bn' => 'অ্যালার্টে ফিরে যাওয়ার আগে কত সেকেন্ড স্ক্রল করবে।',
            'description_en' => 'How long the bar scrolls before returning to the alert phase.',
            'is_public'      => true,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }
};
