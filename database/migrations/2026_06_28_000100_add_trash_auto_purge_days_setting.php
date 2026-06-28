<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Number of days a soft-deleted (trashed) article may sit in the trash
     * before it is permanently deleted. Measured from deleted_at. 0 disables
     * the feature (default). Idempotent for prod.
     */
    public function up(): void
    {
        if (DB::table('settings')->where('key', 'trash_auto_purge_days')->exists()) {
            return;
        }

        DB::table('settings')->insert([
            'key'            => 'trash_auto_purge_days',
            'value'          => '0',
            'group'          => 'content',
            'type'           => 'number',
            'label_bn'       => 'ট্র্যাশ স্থায়ীভাবে মুছুন (দিন)',
            'label_en'       => 'Auto-delete trash after (days)',
            'description_bn' => 'ট্র্যাশে থাকা প্রবন্ধ কত দিন পর স্থায়ীভাবে মুছে যাবে। এটি ফেরানো যায় না। ০ দিলে বন্ধ।',
            'description_en' => 'Days a trashed article stays before it is permanently deleted (irreversible). 0 disables it.',
            'is_public'      => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'trash_auto_purge_days')->delete();
    }
};
