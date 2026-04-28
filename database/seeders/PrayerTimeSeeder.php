<?php

namespace Database\Seeders;

use App\Models\PrayerTime;
use Illuminate\Database\Seeder;

class PrayerTimeSeeder extends Seeder
{
    public function run(): void
    {
        PrayerTime::updateOrCreate(
            ['date' => now()->toDateString()],
            [
                'fajr' => '04:30 AM',
                'sunrise' => '05:45 AM',
                'dhuhr' => '12:15 PM',
                'asr' => '04:00 PM',
                'maghrib' => '06:15 PM',
                'sunset' => '06:15 PM',
                'isha' => '07:30 PM',
                'isha_end' => '11:45 PM',
            ]
        );
    }
}
