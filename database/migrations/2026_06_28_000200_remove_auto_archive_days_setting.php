<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The auto-archive feature was removed. Drop its setting row. Forward-only
     * cleanup: the original 2026_06_28_000000 migration that added it stays in
     * history (it was already deployed). Idempotent.
     */
    public function up(): void
    {
        DB::table('settings')->where('key', 'auto_archive_days')->delete();
    }

    public function down(): void
    {
        if (DB::table('settings')->where('key', 'auto_archive_days')->exists()) {
            return;
        }

        DB::table('settings')->insert([
            'key'            => 'auto_archive_days',
            'value'          => '0',
            'group'          => 'content',
            'type'           => 'number',
            'label_bn'       => 'স্বয়ংক্রিয় আর্কাইভ (দিন)',
            'label_en'       => 'Auto-archive after (days)',
            'description_bn' => 'প্রকাশের কত দিন পর প্রবন্ধ স্বয়ংক্রিয়ভাবে আর্কাইভ হবে। আর্কাইভ হলে তালিকায় দেখাবে না, তবে সরাসরি লিংকে পড়া যাবে। ০ দিলে বন্ধ।',
            'description_en' => 'Days after publishing when an article auto-archives. Archived items are hidden from listings but still readable by direct link. 0 disables it.',
            'is_public'      => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }
};
