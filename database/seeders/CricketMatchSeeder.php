<?php

namespace Database\Seeders;

use App\Models\CricketMatch;
use Illuminate\Database\Seeder;

class CricketMatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $matches = [
            [
                'series_bn' => 'বাংলাদেশ বনাম শ্রীলঙ্কা টেস্ট সিরিজ',
                'series_en' => 'Bangladesh vs Sri Lanka Test Series',
                'status' => 'live',
                'status_text_bn' => '৩য় দিন, মধ্যাহ্ন বিরতি',
                'status_text_en' => 'Day 3, Lunch Break',
                'teams' => [
                    [
                        'name_bn' => 'বাংলাদেশ',
                        'name_en' => 'Bangladesh',
                        'score' => 324,
                        'wickets' => 10,
                        'overs' => 92.4,
                    ],
                    [
                        'name_bn' => 'শ্রীলঙ্কা',
                        'name_en' => 'Sri Lanka',
                        'score' => 156,
                        'wickets' => 4,
                        'overs' => 45.2,
                    ],
                ],
                'sort_order' => 1,
            ],
            [
                'series_bn' => 'আইসিসি টি-টোয়েন্টি বিশ্বকাপ ২০২৪',
                'series_en' => 'ICC T20 World Cup 2024',
                'status' => 'upcoming',
                'status_text_bn' => 'শুরু হবে রাত ৮:৩০ মিনিটে',
                'status_text_en' => 'Starts at 8:30 PM',
                'teams' => [
                    [
                        'name_bn' => 'ভারত',
                        'name_en' => 'India',
                    ],
                    [
                        'name_bn' => 'পাকিস্তান',
                        'name_en' => 'Pakistan',
                    ],
                ],
                'sort_order' => 2,
            ],
        ];

        foreach ($matches as $match) {
            CricketMatch::updateOrCreate(
                ['series_en' => $match['series_en']],
                $match
            );
        }
    }
}
