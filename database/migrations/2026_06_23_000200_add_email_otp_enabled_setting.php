<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * The system-wide master switch for login 2FA, now managed from the
     * dashboard (System Settings → Security). Seeded once from the existing
     * EMAIL_OTP_ENABLED env value so behaviour doesn't change on deploy;
     * after that the DB setting is the single source of truth.
     *
     * Idempotent (firstOrCreate-style) so it is safe to run on production
     * without disturbing any other settings.
     */
    public function up(): void
    {
        $exists = DB::table('settings')->where('key', 'email_otp_enabled')->exists();
        if ($exists) {
            return;
        }

        $default = filter_var(env('EMAIL_OTP_ENABLED', false), FILTER_VALIDATE_BOOLEAN);

        DB::table('settings')->insert([
            'key'            => 'email_otp_enabled',
            'value'          => $default ? 'true' : 'false',
            'group'          => 'security',
            'type'           => 'boolean',
            'label_bn'       => 'ইমেইল OTP (টু-ফ্যাক্টর) — সিস্টেম-ব্যাপী',
            'label_en'       => 'Email OTP (Two-Factor) — System-wide',
            'description_bn' => 'চালু থাকলে যেসব ব্যবহারকারী নিজ অ্যাকাউন্টে 2FA চালু রেখেছেন তাদের লগইনে ইমেইলে পাঠানো কোড লাগবে। বন্ধ থাকলে কারো জন্যই 2FA কাজ করবে না।',
            'description_en' => 'Master switch. When on, users who have enabled 2FA on their own account must enter an emailed code at login. When off, 2FA is disabled for everyone.',
            'is_public'      => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'email_otp_enabled')->delete();
    }
};
