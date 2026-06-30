<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Gap (in minutes) the TV-style alert banner stays hidden between
     * appearances before it flashes in again — so the alert shows on an
     * interval instead of sitting on screen all day. Idempotent and isolated to
     * this one key, so it's safe to run on production without disturbing any
     * other (possibly admin-customized) settings.
     */
    public function up(): void
    {
        if (DB::table('settings')->where('key', 'breaking_alert_interval_minutes')->exists()) {
            return;
        }

        DB::table('settings')->insert([
            'key'            => 'breaking_alert_interval_minutes',
            'value'          => '5',
            'group'          => 'breaking',
            'type'           => 'number',
            'label_bn'       => 'অ্যালার্ট বিরতি (মিনিট)',
            'label_en'       => 'Alert interval (minutes)',
            'description_bn' => 'অ্যালার্ট ব্যানার একবার দেখানোর পর কত মিনিট লুকিয়ে থেকে আবার ফ্ল্যাশ করবে। এতে অ্যালার্ট সারাদিন স্থায়ীভাবে না থেকে নির্দিষ্ট বিরতিতে দেখা যাবে।',
            'description_en' => 'Minutes the alert banner stays hidden between appearances before it flashes again. Keeps the alert from sitting on screen all day — it shows on an interval instead.',
            'is_public'      => true,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'breaking_alert_interval_minutes')->delete();
    }
};
