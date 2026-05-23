<?php

namespace Database\Seeders;

use App\Models\Ad;
use Illuminate\Database\Seeder;

class HeroSidebarAdSeeder extends Seeder
{
    public function run(): void
    {
        Ad::create([
            'title_bn'    => 'হিরো সাইডবার শীর্ষ বিজ্ঞাপন',
            'title_en'    => 'Hero Sidebar Top Ad',
            'image'       => 'https://placehold.co/300x250/0055a5/ffffff?text=Hero+Sidebar+300x250',
            'link'        => 'https://example.com/hero-sidebar',
            'position'    => 'hero_sidebar_top',
            'type'        => 'image',
            'is_active'   => true,
            'sort_order'  => 0,
            'impressions' => 0,
            'clicks'      => 0,
        ]);
    }
}
