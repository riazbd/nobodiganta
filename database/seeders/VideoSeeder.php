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
                'title_bn' => 'প্রকৃতির স্নিগ্ধতা: সুন্দরবনের অপরূপ দৃশ্য',
                'title_en' => 'Nature Bliss: Beautiful Scenes of Sundarbans',
                'body_bn' => '<p>সুন্দরবনের প্রাকৃতিক সৌন্দর্য আমাদের মুগ্ধ করে। দেখুন এই ভিডিওতে।</p>',
                'body_en' => '<p>The natural beauty of Sundarbans is truly mesmerizing. Watch it in this video.</p>',
                'featured_image' => 'https://picsum.photos/seed/v1/800/450',
                'video_url' => 'https://www.youtube.com/watch?v=y881t8ilMyc', 
            ],
            [
                'title_bn' => 'সাজেক ভ্যালি: মেঘের দেশ থেকে ঘুরে আসা',
                'title_en' => 'Sajek Valley: A Journey to the Land of Clouds',
                'body_bn' => '<p>মেঘের ওপর দিয়ে হাঁটার অভিজ্ঞতা পেতে হলে সাজেক ভ্যালি সেরা।</p>',
                'body_en' => '<p>For an experience of walking on clouds, Sajek Valley is the best destination.</p>',
                'featured_image' => 'https://picsum.photos/seed/v2/800/450',
                'video_url' => 'https://youtu.be/q_6O7qX-Osw',
            ],
            [
                'title_bn' => 'মেট্রোরেলে যাত্রা: ঢাকার নতুন দিগন্ত',
                'title_en' => 'Journey by Metro Rail: A New Era for Dhaka',
                'body_bn' => '<p>ঢাকার মেট্রোরেল ভ্রমণের এক দারুণ অভিজ্ঞতা। দেখুন এই শর্ট ভিডিওতে।</p>',
                'body_en' => '<p>A wonderful experience of traveling by Dhaka Metro Rail. Watch this short video.</p>',
                'featured_image' => 'https://picsum.photos/seed/v3/800/450',
                'video_url' => 'https://www.youtube.com/shorts/EngW7tLk6R8',
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
                'video_url' => $v['video_url'],
                'video_duration' => '02:30',
                'status' => 'published',
                'edition' => 'both',
                'allow_comments' => true,
                'category_id' => $category->id,
                'author_id' => $author->id,
                'published_at' => now(),
            ]);
        }
    }
}
