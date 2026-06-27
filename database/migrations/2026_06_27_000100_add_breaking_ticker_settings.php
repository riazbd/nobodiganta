<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Settings for the TV-style breaking-news ticker (alert/flash ⇄ scroll
     * cadence + feed limit). All public so the front-end ticker can read them
     * from the shared Inertia `settings` prop. Idempotent: only inserts rows
     * that don't already exist, so it's safe to run on production.
     */
    private function rows(): array
    {
        $now = now();
        return [
            [
                'key' => 'breaking_ticker_enabled', 'value' => 'true',
                'group' => 'breaking', 'type' => 'boolean',
                'label_bn' => 'ব্রেকিং টিকার চালু', 'label_en' => 'Breaking ticker enabled',
                'description_bn' => 'সাইটের নিচে ব্রেকিং নিউজ বার দেখানো হবে কিনা।',
                'description_en' => 'Master switch for the breaking-news bar at the bottom of the site.',
                'is_public' => true,
            ],
            [
                'key' => 'breaking_alert_enabled', 'value' => 'true',
                'group' => 'breaking', 'type' => 'boolean',
                'label_bn' => 'অ্যালার্ট (ফ্ল্যাশ) ফেজ চালু', 'label_en' => 'Alert (flash) phase enabled',
                'description_bn' => 'চালু থাকলে জরুরি/ব্রেকিং শিরোনাম বড় করে ফ্ল্যাশ দেখাবে, তারপর স্ক্রল করবে। বন্ধ থাকলে শুধু স্ক্রল করবে।',
                'description_en' => 'When on, Urgent/Breaking headlines flash large, then the bar scrolls. When off, it only scrolls.',
                'is_public' => true,
            ],
            [
                'key' => 'breaking_alert_seconds', 'value' => '5',
                'group' => 'breaking', 'type' => 'number',
                'label_bn' => 'প্রতি অ্যালার্ট শিরোনামের সময় (সেকেন্ড)', 'label_en' => 'Seconds per alert headline',
                'description_bn' => 'ফ্ল্যাশ ফেজে প্রতিটি শিরোনাম কত সেকেন্ড দেখাবে।',
                'description_en' => 'How long each headline is shown during the flash phase.',
                'is_public' => true,
            ],
            [
                'key' => 'breaking_alert_cycles', 'value' => '1',
                'group' => 'breaking', 'type' => 'number',
                'label_bn' => 'অ্যালার্ট চক্রের সংখ্যা', 'label_en' => 'Alert cycles',
                'description_bn' => 'স্ক্রলে যাওয়ার আগে অ্যালার্ট শিরোনামগুলো কতবার দেখানো হবে।',
                'description_en' => 'How many times to cycle through the alert headlines before scrolling.',
                'is_public' => true,
            ],
            [
                'key' => 'breaking_scroll_seconds', 'value' => '30',
                'group' => 'breaking', 'type' => 'number',
                'label_bn' => 'স্ক্রল ফেজের সময় (সেকেন্ড)', 'label_en' => 'Scroll phase seconds',
                'description_bn' => 'অ্যালার্টে ফিরে যাওয়ার আগে কত সেকেন্ড স্ক্রল করবে।',
                'description_en' => 'How long the bar scrolls before returning to the alert phase.',
                'is_public' => true,
            ],
            [
                'key' => 'breaking_max_items', 'value' => '15',
                'group' => 'breaking', 'type' => 'number',
                'label_bn' => 'সর্বোচ্চ আইটেম', 'label_en' => 'Max items',
                'description_bn' => 'টিকারে সর্বোচ্চ কতটি ব্রেকিং আইটেম দেখানো হবে।',
                'description_en' => 'Maximum number of breaking items shown in the ticker.',
                'is_public' => true,
            ],
        ];
    }

    public function up(): void
    {
        foreach ($this->rows() as $row) {
            if (DB::table('settings')->where('key', $row['key'])->exists()) {
                continue;
            }
            DB::table('settings')->insert($row + ['created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        DB::table('settings')->whereIn('key', array_column($this->rows(), 'key'))->delete();
    }
};
