<?php

namespace Database\Seeders;

use App\Models\Ad;
use Illuminate\Database\Seeder;

class AdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ads = [
            [
                'title_bn' => 'হেডার বিজ্ঞাপন',
                'title_en' => 'Header Ad',
                'image' => 'https://placehold.co/728x90/333333/ffffff?text=Header+Ad',
                'link' => 'https://example.com',
                'position' => 'header',
                'type' => 'image',
                'is_active' => true,
                'sort_order' => 0,
                'impressions' => 5000,
                'clicks' => 450,
            ],
            [
                'title_bn' => 'বিকাশ পেমেন্ট অফার',
                'title_en' => 'bKash Payment Offer',
                'image' => 'https://placehold.co/728x90/e8001e/white?text=bKash+Offer',
                'link' => 'https://www.bkash.com',
                'position' => 'home_top',
                'type' => 'image',
                'is_active' => true,
                'sort_order' => 1,
                'impressions' => 1250,
                'clicks' => 85,
            ],
            [
                'title_bn' => 'নতুন স্মার্টফোন লাউঞ্জ',
                'title_en' => 'New Smartphone Launch',
                'image' => 'https://placehold.co/300x250/1a1d2e/white?text=Smartphone+Ad',
                'link' => 'https://example.com/mobile',
                'position' => 'sidebar_top',
                'type' => 'image',
                'is_active' => true,
                'sort_order' => 2,
                'impressions' => 850,
                'clicks' => 42,
            ],
            [
                'title_bn' => 'বিপিএল টিকেট বুকিং',
                'title_en' => 'BPL Ticket Booking',
                'image' => 'https://placehold.co/970x250/0055a5/white?text=BPL+Tickets',
                'link' => 'https://example.com/bpl',
                'position' => 'category_middle',
                'type' => 'image',
                'is_active' => true,
                'sort_order' => 3,
                'impressions' => 2100,
                'clicks' => 156,
            ],
            [
                'title_bn' => 'গ্রামীণফোন ইন্টারনেট প্যাক',
                'title_en' => 'Grameenphone Internet Pack',
                'image' => 'https://placehold.co/300x600/00aced/white?text=GP+Internet',
                'link' => 'https://www.grameenphone.com',
                'position' => 'sidebar_middle',
                'type' => 'image',
                'is_active' => true,
                'sort_order' => 4,
                'impressions' => 640,
                'clicks' => 28,
            ],
            [
                'title_bn' => 'দারাজ মেগা সেল',
                'title_en' => 'Daraz Mega Sale',
                'image' => 'https://placehold.co/728x90/f68b1e/white?text=Daraz+Sale',
                'link' => 'https://www.daraz.com.bd',
                'position' => 'article_bottom',
                'type' => 'image',
                'is_active' => true,
                'sort_order' => 5,
                'impressions' => 1500,
                'clicks' => 90,
            ],
        ];

        foreach ($ads as $ad) {
            Ad::create($ad);
        }
    }
}
