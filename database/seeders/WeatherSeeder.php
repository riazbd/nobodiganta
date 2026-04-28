<?php

namespace Database\Seeders;

use App\Models\Weather;
use Illuminate\Database\Seeder;

class WeatherSeeder extends Seeder
{
    public function run(): void
    {
        Weather::updateOrCreate(
            ['city_en' => 'Dhaka', 'date' => now()->toDateString()],
            [
                'city_bn' => 'ঢাকা',
                'temp_c' => 32,
                'condition_bn' => 'রৌদ্রোজ্জ্বল',
                'condition_en' => 'Sunny',
                'humidity' => 65,
                'wind_kph' => 12,
                'max_temp_c' => 35,
                'min_temp_c' => 26,
                'icon' => 'sun',
            ]
        );
    }
}
