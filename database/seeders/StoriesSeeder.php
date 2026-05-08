<?php

namespace Database\Seeders;

use App\Models\Story;
use App\Models\StorySlide;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StoriesSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@nobodigonto.com')->first()
            ?? User::first();

        $editor = User::where('email', 'supreme@nobodigonto.com')->first()
            ?? $admin;

        // Media IDs available in the seeded DB
        $media = [1, 2, 3, 4, 5, 6];

        $stories = [
            [
                'title_bn' => 'ঢাকার বন্যা ২০২৬',
                'title_en' => 'Dhaka Floods 2026',
                'edition' => 'both',
                'slides' => [
                    [
                        'media_id' => $media[0],
                        'text_overlay_bn' => 'ঢাকার নিম্নাঞ্চলে বন্যার পানি প্রবেশ করেছে',
                        'text_overlay_en' => 'Floodwaters have entered low-lying areas of Dhaka',
                        'linked_article_id' => 37,
                        'duration' => 6,
                    ],
                    [
                        'media_id' => $media[1],
                        'text_overlay_bn' => 'হাজার হাজার পরিবার ক্ষতিগ্রস্ত',
                        'text_overlay_en' => 'Thousands of families affected',
                        'linked_article_id' => null,
                        'duration' => 5,
                    ],
                    [
                        'media_id' => $media[2],
                        'text_overlay_bn' => 'উদ্ধার কার্যক্রম পরিচালনা করছে সেনাবাহিনী',
                        'text_overlay_en' => 'Army conducting rescue operations',
                        'linked_article_id' => 37,
                        'duration' => 5,
                    ],
                ],
            ],
            [
                'title_bn' => 'নির্বাচন ২০২৬ হাইলাইটস',
                'title_en' => 'Election 2026 Highlights',
                'edition' => 'both',
                'slides' => [
                    [
                        'media_id' => $media[3],
                        'text_overlay_bn' => 'ভোটকেন্দ্রে দীর্ঘ লাইন',
                        'text_overlay_en' => 'Long queues at polling stations',
                        'linked_article_id' => 38,
                        'duration' => 6,
                    ],
                    [
                        'media_id' => $media[4],
                        'text_overlay_bn' => 'শান্তিপূর্ণভাবে ভোটগ্রহণ চলছে',
                        'text_overlay_en' => 'Voting proceeding peacefully',
                        'linked_article_id' => null,
                        'duration' => 5,
                    ],
                    [
                        'media_id' => $media[5],
                        'text_overlay_bn' => 'ফলাফল গণনা শুরু',
                        'text_overlay_en' => 'Vote counting begins',
                        'linked_article_id' => 38,
                        'duration' => 5,
                    ],
                    [
                        'media_id' => $media[0],
                        'text_overlay_bn' => 'বিজয়ীর উৎসব',
                        'text_overlay_en' => 'Victory celebrations',
                        'linked_article_id' => null,
                        'duration' => 7,
                    ],
                ],
            ],
            [
                'title_bn' => 'গাজায় যুদ্ধবিরতি',
                'title_en' => 'Gaza Ceasefire',
                'edition' => 'both',
                'slides' => [
                    [
                        'media_id' => $media[1],
                        'text_overlay_bn' => 'যুদ্ধবিরতি কার্যকর হয়েছে',
                        'text_overlay_en' => 'Ceasefire has come into effect',
                        'linked_article_id' => 39,
                        'duration' => 6,
                    ],
                    [
                        'media_id' => $media[2],
                        'text_overlay_bn' => 'বন্দি বিনিময় শুরু',
                        'text_overlay_en' => 'Prisoner exchange begins',
                        'linked_article_id' => 39,
                        'duration' => 5,
                    ],
                    [
                        'media_id' => $media[3],
                        'text_overlay_bn' => 'ফিলিস্তিনিরা ঘরে ফিরছেন',
                        'text_overlay_en' => 'Palestinians returning home',
                        'linked_article_id' => null,
                        'duration' => 6,
                    ],
                ],
            ],
            [
                'title_bn' => 'বিদ্যুৎ অগ্রযাত্রা',
                'title_en' => 'Power Progress',
                'edition' => 'bn',
                'slides' => [
                    [
                        'media_id' => $media[4],
                        'text_overlay_bn' => '৩০ হাজার মেগাওয়াট উৎপাদন সক্ষমতা অর্জন',
                        'text_overlay_en' => null,
                        'linked_article_id' => 35,
                        'duration' => 6,
                    ],
                    [
                        'media_id' => $media[5],
                        'text_overlay_bn' => 'সৌরশক্তিতে বিপ্লব আসছে',
                        'text_overlay_en' => null,
                        'linked_article_id' => null,
                        'duration' => 5,
                    ],
                    [
                        'media_id' => $media[0],
                        'text_overlay_bn' => 'গ্রামেও পৌঁছাচ্ছে বিদ্যুৎ',
                        'text_overlay_en' => null,
                        'linked_article_id' => 35,
                        'duration' => 5,
                    ],
                ],
            ],
            [
                'title_bn' => 'ঢাকার বায়ু দূষণ',
                'title_en' => 'Dhaka Air Pollution',
                'edition' => 'both',
                'slides' => [
                    [
                        'media_id' => $media[1],
                        'text_overlay_bn' => 'ঢাকা বিশ্বের অন্যতম দূষিত শহর',
                        'text_overlay_en' => 'Dhaka among the world\'s most polluted cities',
                        'linked_article_id' => 36,
                        'duration' => 6,
                    ],
                    [
                        'media_id' => $media[2],
                        'text_overlay_bn' => 'AQI প্রায়ই ২০০ ছাড়িয়ে যায়',
                        'text_overlay_en' => 'AQI frequently exceeds 200',
                        'linked_article_id' => null,
                        'duration' => 5,
                    ],
                    [
                        'media_id' => $media[3],
                        'text_overlay_bn' => 'সরকার কঠোর পদক্ষেপ নিচ্ছে',
                        'text_overlay_en' => 'Government taking strict measures',
                        'linked_article_id' => 36,
                        'duration' => 5,
                    ],
                ],
            ],
        ];

        foreach ($stories as $data) {
            $slug = $this->generateSlug($data['title_bn']);

            $story = Story::create([
                'title_bn' => $data['title_bn'],
                'title_en' => $data['title_en'],
                'slug' => $slug,
                'cover_media_id' => $data['slides'][0]['media_id'],
                'status' => 'published',
                'edition' => $data['edition'],
                'published_at' => now()->subHours(rand(1, 48)),
                'created_by' => $admin->id,
                'published_by' => $editor->id,
                'view_count' => rand(100, 5000),
            ]);

            foreach ($data['slides'] as $order => $slide) {
                StorySlide::create([
                    'story_id' => $story->id,
                    'sort_order' => $order,
                    'media_id' => $slide['media_id'],
                    'text_overlay_bn' => $slide['text_overlay_bn'],
                    'text_overlay_en' => $slide['text_overlay_en'] ?? null,
                    'linked_article_id' => $slide['linked_article_id'],
                    'duration' => $slide['duration'],
                ]);
            }
        }
    }

    private function generateSlug(string $title): string
    {
        $base = preg_replace('/[^\p{L}\p{N}\s-]+/u', '', $title);
        $base = strtolower(preg_replace('/\s+/', '-', trim($base)));
        $slug = $base;
        $counter = 1;

        while (Story::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $counter++;
        }

        return $slug;
    }
}
