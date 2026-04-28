<?php

namespace Database\Seeders;

use App\Models\Horoscope;
use Illuminate\Database\Seeder;

class HoroscopeSeeder extends Seeder
{
    public function run(): void
    {
        $signs = [
            ['sign' => 'Aries', 'sign_bn' => 'মেষ'],
            ['sign' => 'Taurus', 'sign_bn' => 'বৃষ'],
            ['sign' => 'Gemini', 'sign_bn' => 'মিথুন'],
            ['sign' => 'Cancer', 'sign_bn' => 'কর্কট'],
            ['sign' => 'Leo', 'sign_bn' => 'সিংহ'],
            ['sign' => 'Virgo', 'sign_bn' => 'কন্যা'],
            ['sign' => 'Libra', 'sign_bn' => 'তুলা'],
            ['sign' => 'Scorpio', 'sign_bn' => 'বৃশ্চিক'],
            ['sign' => 'Sagittarius', 'sign_bn' => 'ধনু'],
            ['sign' => 'Capricorn', 'sign_bn' => 'মকর'],
            ['sign' => 'Aquarius', 'sign_bn' => 'কুম্ভ'],
            ['sign' => 'Pisces', 'sign_bn' => 'মীন'],
        ];

        foreach ($signs as $s) {
            Horoscope::updateOrCreate(
                ['sign' => $s['sign'], 'date' => now()->toDateString()],
                [
                    'sign_bn' => $s['sign_bn'],
                    'prediction_en' => "Today may bring positive energy your way. New opportunities are on the horizon — be ready to embrace them. Spending time with family will be fulfilling. Pay attention to your health.",
                    'prediction_bn' => "আজ আপনার দিনটি ইতিবাচক শক্তিতে পূর্ণ থাকতে পারে। নতুন সুযোগ আসতে পারে — সেগুলো গ্রহণ করতে প্রস্তুত থাকুন। পরিবারের সাথে সময় কাটানো আনন্দদায়ক হবে। নিজের স্বাস্থ্যের প্রতি খেয়াল রাখুন।",
                ]
            );
        }
    }
}
