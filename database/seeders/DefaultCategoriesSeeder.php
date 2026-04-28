<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class DefaultCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $parents = [
            [
                'name_bn' => 'বাংলাদেশ', 'name_en' => 'Bangladesh', 'slug' => 'bangladesh',
                'edition' => 'both', 'sort_order' => 1, 'color' => '#e8001e', 'color_code' => '#e8001e',
                'meta_description_bn' => 'বাংলাদেশের সর্বশেষ সংবাদ এবং ব্রেকিং নিউজ।',
                'meta_description_en' => 'Latest news and breaking updates from Bangladesh.',
            ],
            [
                'name_bn' => 'আন্তর্জাতিক', 'name_en' => 'International', 'slug' => 'international',
                'edition' => 'both', 'sort_order' => 2, 'color' => '#0055a5', 'color_code' => '#0055a5',
                'meta_description_bn' => 'বিশ্ব রাজনীতি এবং আন্তর্জাতিক খবরের আপডেট।',
                'meta_description_en' => 'Updates on world politics and international news.',
            ],
            [
                'name_bn' => 'রাজনীতি', 'name_en' => 'Politics', 'slug' => 'politics',
                'edition' => 'both', 'sort_order' => 3, 'color' => '#6b21a8', 'color_code' => '#6b21a8',
                'meta_description_bn' => 'বাংলাদেশের অভ্যন্তরীণ রাজনীতির সকল খবর।',
                'meta_description_en' => 'All news regarding internal politics of Bangladesh.',
            ],
            [
                'name_bn' => 'অর্থনীতি', 'name_en' => 'Economy', 'slug' => 'economy',
                'edition' => 'both', 'sort_order' => 4, 'color' => '#059669', 'color_code' => '#059669',
                'meta_description_bn' => 'শেয়ার বাজার এবং জাতীয় অর্থনীতির খবর।',
                'meta_description_en' => 'News on stock market and national economy.',
            ],
            [
                'name_bn' => 'খেলাধুলা', 'name_en' => 'Sports', 'slug' => 'sports',
                'edition' => 'both', 'sort_order' => 5, 'color' => '#dc2626', 'color_code' => '#dc2626',
                'meta_description_bn' => 'দেশী ও বিদেশের খেলার খবর।',
                'meta_description_en' => 'Local and international sports updates.',
            ],
            [
                'name_bn' => 'বিনোদন', 'name_en' => 'Entertainment', 'slug' => 'entertainment',
                'edition' => 'both', 'sort_order' => 6, 'color' => '#d946ef', 'color_code' => '#d946ef',
                'meta_description_bn' => 'সিনেমা, সঙ্গীত এবং বিনোদন জগতের খবর।',
                'meta_description_en' => 'News from the world of movies, music, and entertainment.',
            ],
            [
                'name_bn' => 'মতামত', 'name_en' => 'Opinion', 'slug' => 'opinion',
                'edition' => 'both', 'sort_order' => 7, 'color' => '#f59e0b', 'color_code' => '#f59e0b',
                'meta_description_bn' => 'বিশ্লেষণধর্মী এবং সমসাময়িক মতামত।',
                'meta_description_en' => 'Analytical and contemporary opinion pieces.',
            ],
            [
                'name_bn' => 'প্রযুক্তি', 'name_en' => 'Technology', 'slug' => 'technology',
                'edition' => 'both', 'sort_order' => 8, 'color' => '#0ea5e9', 'color_code' => '#0ea5e9',
                'meta_description_bn' => 'নতুন আবিষ্কার এবং তথ্যপ্রযুক্তি খবরের আপডেট।',
                'meta_description_en' => 'Latest discoveries and IT news updates.',
            ],
            [
                'name_bn' => 'লাইফস্টাইল', 'name_en' => 'Lifestyle', 'slug' => 'lifestyle',
                'edition' => 'both', 'sort_order' => 9, 'color' => '#f97316', 'color_code' => '#f97316',
                'meta_description_bn' => 'জীবনযাত্রা, স্বাস্থ্য ও সংস্কৃতির খবর।',
                'meta_description_en' => 'News on life, health and culture.',
            ],
            [
                'name_bn' => 'ইসলামী জীবন', 'name_en' => null, 'slug' => 'islamic-life',
                'edition' => 'bn', 'sort_order' => 15, 'color' => '#059669', 'color_code' => '#059669',
                'meta_description_bn' => 'ইসলামী রীতিনীতি এবং জীবন যাপনের দিকনির্দেশনা।',
                'meta_description_en' => null,
            ],
            [
                'name_bn' => 'রাশিফল', 'name_en' => null, 'slug' => 'horoscope',
                'edition' => 'bn', 'sort_order' => 16, 'color' => '#8b5cf6', 'color_code' => '#8b5cf6',
                'meta_description_bn' => 'দৈনন্দিন এবং সাপ্তাহিক রাশিফল।',
                'meta_description_en' => null,
            ],
        ];

        foreach ($parents as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], array_merge($cat, ['is_active' => true]));
        }

        // ── Subcategories ──────────────────────────────────────────────
        $subcategories = [
            'bangladesh' => [
                ['name_bn' => 'জাতীয়',   'name_en' => 'National',    'slug' => 'national',    'sort_order' => 1],
                ['name_bn' => 'সারাদেশ',  'name_en' => 'Countrywide', 'slug' => 'countrywide', 'sort_order' => 2],
                ['name_bn' => 'ঢাকা',     'name_en' => 'Dhaka',       'slug' => 'dhaka-news',  'sort_order' => 3],
                ['name_bn' => 'চট্টগ্রাম','name_en' => 'Chattogram',  'slug' => 'chattogram',  'sort_order' => 4],
            ],
            'international' => [
                ['name_bn' => 'এশিয়া',   'name_en' => 'Asia',         'slug' => 'asia',        'sort_order' => 1],
                ['name_bn' => 'মধ্যপ্রাচ্য','name_en' => 'Middle East','slug' => 'middle-east', 'sort_order' => 2],
                ['name_bn' => 'ইউরোপ',   'name_en' => 'Europe',       'slug' => 'europe',      'sort_order' => 3],
                ['name_bn' => 'আমেরিকা', 'name_en' => 'Americas',     'slug' => 'americas',    'sort_order' => 4],
            ],
            'politics' => [
                ['name_bn' => 'সরকার',         'name_en' => 'Government', 'slug' => 'government',  'sort_order' => 1],
                ['name_bn' => 'বিরোধী দল',    'name_en' => 'Opposition', 'slug' => 'opposition',  'sort_order' => 2],
                ['name_bn' => 'নির্বাচন',      'name_en' => 'Election',   'slug' => 'election',    'sort_order' => 3],
            ],
            'economy' => [
                ['name_bn' => 'শেয়ার বাজার',  'name_en' => 'Stock Market', 'slug' => 'stock-market', 'sort_order' => 1],
                ['name_bn' => 'ব্যাংক ও বীমা', 'name_en' => 'Banking',      'slug' => 'banking',      'sort_order' => 2],
                ['name_bn' => 'বাণিজ্য',       'name_en' => 'Trade',        'slug' => 'trade',        'sort_order' => 3],
                ['name_bn' => 'কৃষি',          'name_en' => 'Agriculture',  'slug' => 'agriculture',  'sort_order' => 4],
            ],
            'sports' => [
                ['name_bn' => 'ক্রিকেট',  'name_en' => 'Cricket',  'slug' => 'cricket-news',  'sort_order' => 1],
                ['name_bn' => 'ফুটবল',   'name_en' => 'Football', 'slug' => 'football-news', 'sort_order' => 2],
                ['name_bn' => 'অন্যান্য', 'name_en' => 'Others',   'slug' => 'other-sports',  'sort_order' => 3],
            ],
            'entertainment' => [
                ['name_bn' => 'সিনেমা',  'name_en' => 'Cinema', 'slug' => 'cinema',      'sort_order' => 1],
                ['name_bn' => 'সংগীত',  'name_en' => 'Music',  'slug' => 'music',       'sort_order' => 2],
                ['name_bn' => 'টেলিভিশন','name_en' => 'TV',    'slug' => 'television',  'sort_order' => 3],
            ],
            'technology' => [
                ['name_bn' => 'উদ্ভাবন',     'name_en' => 'Innovation', 'slug' => 'innovation', 'sort_order' => 1],
                ['name_bn' => 'সাইবার নিরাপত্তা','name_en' => 'Cybersecurity', 'slug' => 'cybersecurity', 'sort_order' => 2],
                ['name_bn' => 'কৃত্রিম বুদ্ধিমত্তা','name_en' => 'AI', 'slug' => 'artificial-intelligence', 'sort_order' => 3],
            ],
            'lifestyle' => [
                ['name_bn' => 'স্বাস্থ্য',  'name_en' => 'Health',    'slug' => 'health',    'sort_order' => 1],
                ['name_bn' => 'ভ্রমণ',     'name_en' => 'Travel',    'slug' => 'travel',    'sort_order' => 2],
                ['name_bn' => 'রন্ধনশালা', 'name_en' => 'Food',      'slug' => 'food',      'sort_order' => 3],
            ],
        ];

        foreach ($subcategories as $parentSlug => $children) {
            $parent = Category::where('slug', $parentSlug)->first();
            if (!$parent) continue;
            foreach ($children as $child) {
                Category::updateOrCreate(
                    ['slug' => $child['slug']],
                    array_merge($child, [
                        'parent_id'  => $parent->id,
                        'edition'    => 'both',
                        'is_active'  => true,
                        'color_code' => $parent->color_code,
                    ])
                );
            }
        }

        $this->command->info('✅ Categories & subcategories seeded successfully!');
    }
}
