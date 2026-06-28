<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Number of days after publish when a published article is auto-archived.
     * Archived articles are delisted from public listings but remain readable
     * by direct URL. 0 disables the feature (default). Idempotent for prod.
     */
    public function up(): void
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

    public function down(): void
    {
        DB::table('settings')->where('key', 'auto_archive_days')->delete();
    }
};
