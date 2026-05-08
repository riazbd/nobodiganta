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
            [
                'title_bn' => 'ভিডিও প্রোমো বিজ্ঞাপন',
                'title_en' => 'Video Promo Ad',
                'video_url' => 'https://www.youtube.com/watch?v=y881t8ilMyc',
                'image' => 'https://placehold.co/800/450/000000/ffffff?text=Video+Poster',
                'position' => 'home_bottom',
                'type' => 'video',
                'is_active' => true,
                'sort_order' => 6,
                'impressions' => 300,
                'clicks' => 25,
            ],
            [
                'title_bn' => 'গুগল অ্যাডসেন্স উদাহরণ',
                'title_en' => 'Google AdSense Example',
                'code' => '<div style="background:#fff8e1; border:1px solid #ffca28; padding:20px; text-align:center;"><b>Google AdSense Placeholder</b><br/>Your AdSense script would go here.</div>',
                'position' => 'sidebar_top',
                'type' => 'google_ad',
                'is_active' => true,
                'sort_order' => 7,
                'impressions' => 1000,
                'clicks' => 50,
            ],
            [
                'title_bn' => 'কাস্টম জেএস বিজ্ঞাপন',
                'title_en' => 'Custom JS Ad',
                'code' => '<div id="js-ad-test" style="padding:10px; border:1px solid #ddd; text-align:center;">JS Loading...</div><script>document.getElementById("js-ad-test").innerHTML = "<b>JS Ad Loaded Successfully</b>";</script>',
                'position' => 'sidebar_middle',
                'type' => 'script',
                'is_active' => true,
                'sort_order' => 8,
                'impressions' => 150,
                'clicks' => 5,
            ],
            [
                'title_bn' => 'মিড হোম লিডারবোর্ড',
                'title_en' => 'Mid Home Leaderboard',
                'image' => 'https://placehold.co/728x90/263238/white?text=Mid+Home+Advertisement',
                'link' => 'https://example.com/mid-home',
                'position' => 'mid_home',
                'type' => 'image',
                'is_active' => true,
                'sort_order' => 9,
                'impressions' => 0,
                'clicks' => 0,
            ],
            [
                'title_bn' => 'সেকশন মধ্যবর্তী বিজ্ঞাপন ১',
                'title_en' => 'Between Sections Ad 1',
                'image' => 'https://placehold.co/728x90/4ade80/white?text=Between+Sections+1',
                'link' => 'https://example.com/promo1',
                'position' => 'between_sections',
                'type' => 'image',
                'is_active' => true,
                'sort_order' => 9,
                'impressions' => 200,
                'clicks' => 10,
            ],
            [
                'title_bn' => 'সেকশন মধ্যবর্তী বিজ্ঞাপন ২',
                'title_en' => 'Between Sections Ad 2',
                'image' => 'https://placehold.co/728x90/60a5fa/white?text=Between+Sections+2',
                'link' => 'https://example.com/promo2',
                'position' => 'between_sections',
                'type' => 'image',
                'is_active' => true,
                'sort_order' => 10,
                'impressions' => 180,
                'clicks' => 8,
            ],
            [
                'title_bn' => 'হোমপেজ বটম ব্যানার',
                'title_en' => 'Homepage Bottom Billboard',
                'image' => 'https://placehold.co/970x250/1e293b/white?text=Bottom+Billboard',
                'link' => 'https://example.com/bottom',
                'position' => 'home_bottom',
                'type' => 'image',
                'is_active' => true,
                'sort_order' => 11,
                'impressions' => 500,
                'clicks' => 30,
            ],
        ];

        foreach ($ads as $ad) {
            Ad::create($ad);
        }
    }
}
