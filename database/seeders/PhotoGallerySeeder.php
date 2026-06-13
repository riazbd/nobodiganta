<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PhotoGallerySeeder extends Seeder
{
    public function run(): void
    {
        $author = User::where('email', 'editor@nobodigonto.com')->first()
            ?? User::first();

        if (!$author) return;

        $category = Category::whereIn('slug', ['photo', 'gallery', 'bangladesh'])
            ->first()
            ?? Category::first();

        $galleries = [
            [
                'title_bn' => 'পদ্মা সেতু উদ্বোধনের স্মরণীয় মুহূর্ত',
                'title_en' => 'Memorable Moments of Padma Bridge Inauguration',
                'cover'    => 'https://picsum.photos/seed/padma-cover/800/500',
                'photos'   => [
                    ['url' => 'https://picsum.photos/seed/padma1/800/500', 'caption_bn' => 'পদ্মা সেতুর উদ্বোধনী অনুষ্ঠান', 'caption_en' => 'Padma Bridge inauguration ceremony'],
                    ['url' => 'https://picsum.photos/seed/padma2/800/500', 'caption_bn' => 'সেতুর উপর দিয়ে প্রথম যান চলাচল', 'caption_en' => 'First vehicles crossing the bridge'],
                    ['url' => 'https://picsum.photos/seed/padma3/800/500', 'caption_bn' => 'আলোকসজ্জায় পদ্মা সেতু', 'caption_en' => 'Padma Bridge illuminated at night'],
                    ['url' => 'https://picsum.photos/seed/padma4/800/500', 'caption_bn' => 'উদ্বোধনে উৎসবমুখর জনতা', 'caption_en' => 'Jubilant crowd at the inauguration'],
                ],
                'days_ago' => 5,
            ],
            [
                'title_bn' => 'ঢাকার ব্যস্ত জীবন: একটি আলোকচিত্র প্রতিবেদন',
                'title_en' => 'Busy Life in Dhaka: A Photo Essay',
                'cover'    => 'https://picsum.photos/seed/dhaka-cover/800/500',
                'photos'   => [
                    ['url' => 'https://picsum.photos/seed/dhaka1/800/500', 'caption_bn' => 'সকালের ঢাকা', 'caption_en' => 'Morning Dhaka'],
                    ['url' => 'https://picsum.photos/seed/dhaka2/800/500', 'caption_bn' => 'ফুটপাথের দোকানি', 'caption_en' => 'Street vendors'],
                    ['url' => 'https://picsum.photos/seed/dhaka3/800/500', 'caption_bn' => 'যানজটে আটকে পড়া যাত্রী', 'caption_en' => 'Commuters stuck in traffic'],
                    ['url' => 'https://picsum.photos/seed/dhaka4/800/500', 'caption_bn' => 'বুড়িগঙ্গার তীরে নৌকা', 'caption_en' => 'Boats on the Buriganga river'],
                    ['url' => 'https://picsum.photos/seed/dhaka5/800/500', 'caption_bn' => 'সন্ধ্যার আলোয় ঢাকা', 'caption_en' => 'Dhaka at dusk'],
                ],
                'days_ago' => 10,
            ],
            [
                'title_bn' => 'বাংলাদেশের প্রকৃতি: সুন্দরবন থেকে পার্বত্য চট্টগ্রাম',
                'title_en' => 'Nature of Bangladesh: Sundarbans to Chittagong Hills',
                'cover'    => 'https://picsum.photos/seed/nature-cover/800/500',
                'photos'   => [
                    ['url' => 'https://picsum.photos/seed/nature1/800/500', 'caption_bn' => 'সুন্দরবনের গহীনে', 'caption_en' => 'Deep in the Sundarbans'],
                    ['url' => 'https://picsum.photos/seed/nature2/800/500', 'caption_bn' => 'রয়েল বেঙ্গল টাইগার', 'caption_en' => 'Royal Bengal Tiger'],
                    ['url' => 'https://picsum.photos/seed/nature3/800/500', 'caption_bn' => 'পার্বত্য চট্টগ্রামের পাহাড়', 'caption_en' => 'Hills of Chittagong Hill Tracts'],
                    ['url' => 'https://picsum.photos/seed/nature4/800/500', 'caption_bn' => 'কক্সবাজার সমুদ্র সৈকত', 'caption_en' => "Cox's Bazar sea beach"],
                    ['url' => 'https://picsum.photos/seed/nature5/800/500', 'caption_bn' => 'হাওরের বিস্তীর্ণ জলরাশি', 'caption_en' => 'Vast waters of Haor'],
                    ['url' => 'https://picsum.photos/seed/nature6/800/500', 'caption_bn' => 'চা বাগানের সবুজ দৃশ্য', 'caption_en' => 'Green scenery of tea garden'],
                ],
                'days_ago' => 15,
            ],
            [
                'title_bn' => 'ঈদ উৎসব ২০২৫: আনন্দের রঙিন মুহূর্ত',
                'title_en' => 'Eid Festival 2025: Colorful Moments of Joy',
                'cover'    => 'https://picsum.photos/seed/eid-cover/800/500',
                'photos'   => [
                    ['url' => 'https://picsum.photos/seed/eid1/800/500', 'caption_bn' => 'ঈদের নামাজ', 'caption_en' => 'Eid prayers'],
                    ['url' => 'https://picsum.photos/seed/eid2/800/500', 'caption_bn' => 'কোলাকুলিতে ঈদ শুভেচ্ছা', 'caption_en' => 'Greeting with Eid embrace'],
                    ['url' => 'https://picsum.photos/seed/eid3/800/500', 'caption_bn' => 'শিশুদের আনন্দ', 'caption_en' => "Children's joy"],
                    ['url' => 'https://picsum.photos/seed/eid4/800/500', 'caption_bn' => 'ঐতিহ্যবাহী পোশাকে নারীরা', 'caption_en' => 'Women in traditional attire'],
                ],
                'days_ago' => 20,
            ],
            [
                'title_bn' => 'বন্যা পরিস্থিতি ২০২৫: মাঠ পর্যায়ের চিত্র',
                'title_en' => 'Flood Situation 2025: Ground Level Images',
                'cover'    => 'https://picsum.photos/seed/flood-cover/800/500',
                'photos'   => [
                    ['url' => 'https://picsum.photos/seed/flood1/800/500', 'caption_bn' => 'প্লাবিত এলাকায় নৌকায় উদ্ধার অভিযান', 'caption_en' => 'Rescue operation by boat in flooded area'],
                    ['url' => 'https://picsum.photos/seed/flood2/800/500', 'caption_bn' => 'আশ্রয়কেন্দ্রে বাস্তুচ্যুত মানুষ', 'caption_en' => 'Displaced people in shelter'],
                    ['url' => 'https://picsum.photos/seed/flood3/800/500', 'caption_bn' => 'ত্রাণ বিতরণ কার্যক্রম', 'caption_en' => 'Relief distribution program'],
                    ['url' => 'https://picsum.photos/seed/flood4/800/500', 'caption_bn' => 'বন্যার জল সরে যাওয়ার পর ক্ষয়ক্ষতির চিত্র', 'caption_en' => 'Damage after floodwaters recede'],
                    ['url' => 'https://picsum.photos/seed/flood5/800/500', 'caption_bn' => 'পুনর্বাসনের কাজ শুরু', 'caption_en' => 'Rehabilitation work begins'],
                ],
                'days_ago' => 3,
            ],
        ];

        foreach ($galleries as $g) {
            $photosJson = json_encode($g['photos'], JSON_UNESCAPED_UNICODE);
            $slugBn     = Str::slug($g['title_en']);
            $slugEn     = $slugBn . '-en';

            if (Article::where('slug_bn', $slugBn)->exists()) continue;

            Article::create([
                'title_bn'       => $g['title_bn'],
                'title_en'       => $g['title_en'],
                'slug_bn'        => $slugBn,
                'slug_en'        => $slugEn,
                'featured_image' => $g['cover'],
                'body_bn'        => $photosJson,
                'body_en'        => $photosJson,
                'article_type'   => 'photo',
                'status'         => 'published',
                'edition'        => 'both',
                'category_id'    => $category?->id ?? 1,
                'author_id'      => $author->id,
                'published_at'   => now()->subDays($g['days_ago']),
            ]);
        }
    }
}
