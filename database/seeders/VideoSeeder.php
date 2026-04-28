<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class VideoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $category = Category::where('slug', 'video')->first();
        if (!$category) {
            $category = Category::create([
                'name_bn' => 'ভিডিও',
                'name_en' => 'Video',
                'slug' => 'video',
                'edition' => 'both',
                'is_active' => true,
            ]);
        }

        $author = User::where('role', 'super_admin')->first() ?: User::first();

        $videos = [
            [
                'title_bn' => 'সংসদে পাস হলো নতুন সাইবার নিরাপত্তা আইন',
                'title_en' => 'New Cyber Security Law Passed in Parliament',
                'body_bn' => '<p>সংসদে আজ নতুন সাইবার নিরাপত্তা আইন পাস হয়েছে। বিস্তারিত দেখুন ভিডিওতে।</p>',
                'body_en' => '<p>New Cyber Security Law passed in Parliament today. Watch the video for details.</p>',
                'featured_image' => 'https://picsum.photos/seed/v1/800/450',
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
            ],
            [
                'title_bn' => 'বাংলাদেশ-ভারত সিরিজের শেষ মুহূর্তের প্রস্তুতি',
                'title_en' => 'Last minute preparation for Bangladesh-India series',
                'body_bn' => '<p>বাংলাদেশ ও ভারতের মধ্যকার টেস্ট সিরিজের প্রস্তুতি চলছে পুরোদমে।</p>',
                'body_en' => '<p>Preparation is in full swing for the Test series between Bangladesh and India.</p>',
                'featured_image' => 'https://picsum.photos/seed/v2/800/450',
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            ],
            [
                'title_bn' => 'ঢাকার মেট্রোরেল সম্প্রসারণের নতুন পরিকল্পনা',
                'title_en' => 'New plan for Dhaka Metro Rail expansion',
                'body_bn' => '<p>রাজধানীর যানজট নিরসনে মেট্রোরেল সম্প্রসারণের নতুন পরিকল্পনা গ্রহণ করেছে সরকার।</p>',
                'body_en' => '<p>The government has adopted a new plan to expand the metro rail to alleviate traffic congestion in the capital.</p>',
                'featured_image' => 'https://picsum.photos/seed/v3/800/450',
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            ],
        ];

        foreach ($videos as $v) {
            Article::create([
                'title_bn' => $v['title_bn'],
                'title_en' => $v['title_en'],
                'slug_bn' => Str::slug($v['title_bn']),
                'slug_en' => Str::slug($v['title_en']),
                'body_bn' => $v['body_bn'],
                'body_en' => $v['body_en'],
                'featured_image' => $v['featured_image'],
                'article_type' => 'video',
                'video_provider' => 'youtube',
                'status' => 'published',
                'edition' => 'both',
                'category_id' => $category->id,
                'author_id' => $author->id,
                'published_at' => now(),
                // Store video URL in meta or a custom field if exists, 
                // for now using subtitle_en as a hack if no video_url column exists
                'subtitle_en' => $v['video_url'],
            ]);
        }
    }
}
