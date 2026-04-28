<?php

namespace Database\Seeders;

use App\Models\Price;
use Illuminate\Database\Seeder;

class PriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $prices = [
            [
                'key' => 'gold_22k',
                'title_bn' => 'স্বর্ণ (২২ ক্যারেট)',
                'title_en' => 'Gold (22K)',
                'amount' => 114500.00,
                'unit' => 'ভরি',
                'trend' => 'up',
                'change' => 250.00,
                'sort_order' => 1,
            ],
            [
                'key' => 'gold_24k',
                'title_bn' => 'স্বর্ণ (২৪ ক্যারেট)',
                'title_en' => 'Gold (24K)',
                'amount' => 124700.00,
                'unit' => 'ভরি',
                'trend' => 'up',
                'change' => 300.00,
                'sort_order' => 2,
            ],
            [
                'key' => 'diesel',
                'title_bn' => 'ডিজেল',
                'title_en' => 'Diesel',
                'amount' => 109.00,
                'unit' => 'লিটার',
                'trend' => 'neutral',
                'change' => 0,
                'sort_order' => 3,
            ],
            [
                'key' => 'petrol',
                'title_bn' => 'পেট্রোল',
                'title_en' => 'Petrol',
                'amount' => 125.00,
                'unit' => 'লিটার',
                'trend' => 'neutral',
                'change' => 0,
                'sort_order' => 4,
            ],
        ];

        foreach ($prices as $price) {
            Price::updateOrCreate(['key' => $price['key']], $price);
        }
    }
}
