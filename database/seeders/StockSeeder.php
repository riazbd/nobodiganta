<?php

namespace Database\Seeders;

use App\Models\Stock;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $stocks = [
            [
                'name_bn' => 'ডিএসইএক্স',
                'name_en' => 'DSEX',
                'value' => '৬,২৪৫.৩২',
                'change' => '▲ ১.২৪%',
                'is_up' => true,
                'sort_order' => 1,
            ],
            [
                'name_bn' => 'সিএসই',
                'name_en' => 'CSE',
                'value' => '১৮,৩৪২.১৫',
                'change' => '▲ ০.৮৭%',
                'is_up' => true,
                'sort_order' => 2,
            ],
            [
                'name_bn' => 'ডলার',
                'name_en' => 'USD',
                'value' => '১১০.৫০',
                'change' => '▼ ০.১২%',
                'is_up' => false,
                'sort_order' => 3,
            ],
            [
                'name_bn' => 'স্বর্ণ',
                'name_en' => 'Gold',
                'value' => '১,২৪,৫০০',
                'change' => '▲ ০.৫২%',
                'is_up' => true,
                'sort_order' => 4,
            ],
            [
                'name_bn' => 'ডিজেল',
                'name_en' => 'Diesel',
                'value' => '৮৯ টাকা',
                'change' => '—',
                'is_up' => null,
                'sort_order' => 5,
            ],
            [
                'name_bn' => 'পেট্রোল',
                'name_en' => 'Petrol',
                'value' => '১২৫ টাকা',
                'change' => '—',
                'is_up' => null,
                'sort_order' => 6,
            ],
        ];

        foreach ($stocks as $stock) {
            Stock::create($stock);
        }
    }
}
