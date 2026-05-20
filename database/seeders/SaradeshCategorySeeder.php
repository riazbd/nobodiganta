<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use Illuminate\Database\Seeder;

class SaradeshCategorySeeder extends Seeder
{
    public function run(): void
    {
        $saradesh = Category::firstOrCreate(
            ['slug' => 'saradesh'],
            [
                'name_bn'        => 'সারাদেশ',
                'name_en'        => 'All Regions',
                'edition'        => 'both',
                'sort_order'     => 99,
                'color'          => '#263238',
                'is_active'      => true,
                'description_bn' => 'বাংলাদেশের বিভাগ, জেলা ও উপজেলা ভিত্তিক সংবাদ',
                'description_en' => 'News by division, district, and upazila across Bangladesh',
            ]
        );

        $order = 1;
        foreach (Division::orderBy('name_en')->get() as $div) {
            $divCat = Category::firstOrCreate(
                ['slug' => 'division-' . $div->slug],
                [
                    'parent_id'   => $saradesh->id,
                    'name_bn'     => $div->name_bn,
                    'name_en'     => $div->name_en,
                    'edition'     => 'both',
                    'sort_order'  => $order++,
                    'color'       => '#455a64',
                    'is_active'   => true,
                ]
            );

            $distOrder = 1;
            foreach (District::where('division_id', $div->id)->orderBy('name_en')->get() as $dist) {
                $distCat = Category::firstOrCreate(
                    ['slug' => 'district-' . $dist->slug],
                    [
                        'parent_id'   => $divCat->id,
                        'name_bn'     => $dist->name_bn,
                        'name_en'     => $dist->name_en,
                        'edition'     => 'both',
                        'sort_order'  => $distOrder++,
                        'color'       => '#607d8b',
                        'is_active'   => true,
                    ]
                );

                $upaOrder = 1;
                foreach (Upazila::where('district_id', $dist->id)->orderBy('name_en')->get() as $upa) {
                    Category::firstOrCreate(
                        ['slug' => 'upazila-' . $upa->slug],
                        [
                            'parent_id'   => $distCat->id,
                            'name_bn'     => $upa->name_bn,
                            'name_en'     => $upa->name_en,
                            'edition'     => 'both',
                            'sort_order'  => $upaOrder++,
                            'color'       => '#78909c',
                            'is_active'   => true,
                        ]
                    );
                }
            }
        }

        $total = Category::count();
        echo "Saradesh category hierarchy seeded. Total categories: {$total}" . PHP_EOL;
    }
}
