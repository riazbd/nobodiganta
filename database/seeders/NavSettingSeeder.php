<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class NavSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key'            => 'nav_max_visible',
                'value'          => '7',
                'group'          => 'navigation',
                'type'           => 'integer',
                'label_bn'       => 'নেভিগেশন বারে সর্বোচ্চ বিভাগ সংখ্যা',
                'label_en'       => 'Max Categories in Nav Bar',
                'description_bn' => 'এই সংখ্যার বেশি বিভাগ "আরও" বাটনে চলে যাবে। ০ মানে স্বয়ংক্রিয়।',
                'description_en' => 'Categories beyond this count collapse into the "More" button. 0 means auto (fit by width).',
                'is_public'      => true,
            ],
            [
                'key'            => 'nav_more_label_bn',
                'value'          => 'আরও',
                'group'          => 'navigation',
                'type'           => 'text',
                'label_bn'       => '"আরও" বাটনের বাংলা লেখা',
                'label_en'       => '"More" Button Label (BN)',
                'description_bn' => 'ডেস্কটপ নেভিগেশনে অতিরিক্ত বিভাগের বাটনের লেখা',
                'description_en' => 'Label for the overflow dropdown button in desktop nav',
                'is_public'      => true,
            ],
            [
                'key'            => 'nav_more_label_en',
                'value'          => 'More',
                'group'          => 'navigation',
                'type'           => 'text',
                'label_bn'       => '"আরও" বাটনের ইংরেজি লেখা',
                'label_en'       => '"More" Button Label (EN)',
                'description_bn' => 'ইংরেজি সংস্করণে অতিরিক্ত বিভাগের বাটনের লেখা',
                'description_en' => 'Label for the overflow dropdown button in English edition',
                'is_public'      => true,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
