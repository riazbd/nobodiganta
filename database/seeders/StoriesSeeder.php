<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\Story;
use App\Models\StorySlide;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class StoriesSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@nobodigonto.com')->first() ?? User::first();
        $editor = User::where('email', 'supreme@nobodigonto.com')->first() ?? $admin;

        // ── Seed video media records (mp4 URLs) ─────────────────────────────
        $videoPosters = [
            'https://picsum.photos/seed/vid1/600/900',
            'https://picsum.photos/seed/vid2/600/900',
            'https://picsum.photos/seed/vid3/600/900',
            'https://picsum.photos/seed/vid4/600/900',
        ];

        $sampleVideos = [
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        ];

        $videoMediaIds = [];
        foreach ($sampleVideos as $i => $url) {
            $media = Media::create([
                'user_id'       => $admin->id,
                'original_name' => 'story_video_' . ($i + 1) . '.mp4',
                'file_name'     => Str::uuid() . '.mp4',
                'file_path'     => $url,
                'mime_type'     => 'video/mp4',
                'file_size'     => 5000000,
                'alt_text_bn'   => 'ভিডিও স্টোরি ' . ($i + 1),
                'alt_text_en'   => 'Video story ' . ($i + 1),
                'caption_bn'    => 'ভিডিও ক্লিপ',
                'caption_en'    => 'Video clip',
                'credit_bn'     => 'নব দিগন্ত ভিডিও',
                'credit_en'     => 'Nobo Digonto Video',
                'license_type'  => 'internal',
                'edition'       => 'both',
            ]);
            $videoMediaIds[] = $media->id;
        }

        // Photo media — portrait 9:16 oriented images for stories
        $photoSrcs = [
            'https://picsum.photos/seed/story_ph1/600/900',
            'https://picsum.photos/seed/story_ph2/600/900',
            'https://picsum.photos/seed/story_ph3/600/900',
            'https://picsum.photos/seed/story_ph4/600/900',
            'https://picsum.photos/seed/story_ph5/600/900',
            'https://picsum.photos/seed/story_ph6/600/900',
            'https://picsum.photos/seed/story_ph7/600/900',
            'https://picsum.photos/seed/story_ph8/600/900',
            'https://picsum.photos/seed/story_ph9/600/900',
            'https://picsum.photos/seed/story_ph10/600/900',
            'https://picsum.photos/seed/story_ph11/600/900',
            'https://picsum.photos/seed/story_ph12/600/900',
        ];

        $photoMediaIds = [];
        $photoCaptions = [
            ['bn' => 'ঢাকার রাজপথে মানুষের ঢল', 'en' => 'Crowds on Dhaka streets'],
            ['bn' => 'সুন্দরবনের অপরূপ দৃশ্য', 'en' => 'Beautiful view of Sundarbans'],
            ['bn' => 'গ্রামীণ জীবনের চিত্র', 'en' => 'A glimpse of rural life'],
            ['bn' => 'ক্রিকেটে বাংলাদেশের জয়', 'en' => 'Bangladesh cricket victory'],
            ['bn' => 'সংসদ ভবনের সামনে'],
            ['bn' => 'পদ্মা সেতুর অপরূপ সৌন্দর্য', 'en' => 'Beauty of Padma Bridge'],
            ['bn' => 'ঢাকার যানজটে নাগরিক জীবন', 'en' => 'City life in Dhaka traffic'],
            ['bn' => 'পহেলা বৈশাখের আনন্দ', 'en' => 'Eid celebration in Dhaka'],
            ['bn' => 'বন্যায় ক্ষতিগ্রস্ত এলাকা', 'en' => 'Flood-affected areas'],
            ['bn' => 'নতুন প্রজন্মের স্বপ্ন', 'en' => 'Dreams of a new generation'],
            ['bn' => 'প্রকৃতির কোলে বাংলাদেশ', 'en' => 'Bangladesh in nature\'s lap'],
            ['bn' => 'কৃষকের মাঠ থেকে বাজার', 'en' => 'From farmer\'s field to market'],
        ];

        foreach ($photoSrcs as $i => $url) {
            $cap = $photoCaptions[$i];
            $media = Media::create([
                'user_id'       => $admin->id,
                'original_name' => 'story_photo_' . ($i + 1) . '.jpg',
                'file_name'     => Str::uuid() . '.jpg',
                'file_path'     => $url,
                'mime_type'     => 'image/jpeg',
                'file_size'     => 300000,
                'width'         => 600,
                'height'        => 900,
                'alt_text_bn'   => $cap['bn'],
                'alt_text_en'   => $cap['en'] ?? $cap['bn'],
                'caption_bn'    => $cap['bn'],
                'caption_en'    => $cap['en'] ?? $cap['bn'],
                'credit_bn'     => 'নব দিগন্ত ফটো',
                'credit_en'     => 'Nobo Digonto Photo',
                'license_type'  => 'internal',
                'edition'       => 'both',
            ]);
            $photoMediaIds[] = $media->id;
        }

        $p = $photoMediaIds;
        $v = $videoMediaIds;

        // ── Stories data ─────────────────────────────────────────────────────
        $stories = [

            // ── VIDEO STORIES ────────────────────────────────────────────────

            [
                'title_bn'  => 'ঢাকায় ভয়াবহ বন্যা: সরাসরি দৃশ্য',
                'title_en'  => 'Catastrophic Floods in Dhaka: Live Footage',
                'edition'   => 'both',
                'cover'     => $p[0],
                'hours_ago' => 2,
                'slides'    => [
                    [
                        'media_id'        => $v[0],
                        'text_overlay_bn' => 'ঢাকার রাস্তায় বুক সমান পানি',
                        'text_overlay_en' => 'Chest-deep water on Dhaka streets',
                        'duration'        => null,
                    ],
                    [
                        'media_id'        => $v[1],
                        'text_overlay_bn' => 'সেনাবাহিনীর উদ্ধার অভিযান শুরু',
                        'text_overlay_en' => 'Army launches rescue operations',
                        'duration'        => null,
                    ],
                    [
                        'media_id'        => $p[8],
                        'text_overlay_bn' => 'লক্ষাধিক পরিবার গৃহহীন',
                        'text_overlay_en' => 'Millions of families displaced',
                        'duration'        => 6,
                    ],
                ],
            ],

            [
                'title_bn'  => 'বিশ্বকাপ জয়ের আনন্দ — সরাসরি ক্যামেরায়',
                'title_en'  => 'World Cup Victory Celebrations Live',
                'edition'   => 'both',
                'cover'     => $p[3],
                'hours_ago' => 5,
                'slides'    => [
                    [
                        'media_id'        => $v[2],
                        'text_overlay_bn' => 'মাঠেই ঐতিহাসিক জয় উদযাপন',
                        'text_overlay_en' => 'Historic victory celebrations on the field',
                        'duration'        => null,
                    ],
                    [
                        'media_id'        => $v[3],
                        'text_overlay_bn' => 'ঢাকায় লক্ষো মানুষের উল্লাস',
                        'text_overlay_en' => 'Millions celebrate in Dhaka',
                        'duration'        => null,
                    ],
                    [
                        'media_id'        => $p[3],
                        'text_overlay_bn' => 'অধিনায়ক ট্রফি তুলে ধরলেন',
                        'text_overlay_en' => 'Captain lifts the trophy',
                        'duration'        => 7,
                    ],
                ],
            ],

            [
                'title_bn'  => 'সংসদে উত্তাল বিতর্ক: ভিডিও',
                'title_en'  => 'Parliament in Uproar: Video Report',
                'edition'   => 'both',
                'cover'     => $p[4],
                'hours_ago' => 8,
                'slides'    => [
                    [
                        'media_id'        => $v[0],
                        'text_overlay_bn' => 'বাজেট নিয়ে তুমুল বিতর্ক',
                        'text_overlay_en' => 'Heated debate over budget',
                        'duration'        => null,
                    ],
                    [
                        'media_id'        => $p[4],
                        'text_overlay_bn' => 'বিরোধী দলের ওয়াকআউট',
                        'text_overlay_en' => 'Opposition walks out',
                        'duration'        => 5,
                    ],
                    [
                        'media_id'        => $v[1],
                        'text_overlay_bn' => 'স্পিকারের বিশেষ নির্দেশনা',
                        'text_overlay_en' => 'Speaker issues special directive',
                        'duration'        => null,
                    ],
                ],
            ],

            [
                'title_bn'  => 'পদ্মা সেতুতে রেলের প্রথম যাত্রা',
                'title_en'  => 'First Train Journey on Padma Bridge',
                'edition'   => 'both',
                'cover'     => $p[5],
                'hours_ago' => 12,
                'slides'    => [
                    [
                        'media_id'        => $v[2],
                        'text_overlay_bn' => 'ঐতিহাসিক মুহূর্ত — প্রথম ট্রেন পার হলো',
                        'text_overlay_en' => 'Historic moment — first train crosses',
                        'duration'        => null,
                    ],
                    [
                        'media_id'        => $v[3],
                        'text_overlay_bn' => 'যাত্রীদের উচ্ছ্বাস',
                        'text_overlay_en' => 'Passengers overwhelmed with joy',
                        'duration'        => null,
                    ],
                ],
            ],

            // ── PHOTO STORIES ────────────────────────────────────────────────

            [
                'title_bn'  => 'ঈদুল আযহার আনন্দমুখর পরিবেশ',
                'title_en'  => 'Eid ul-Adha Festive Atmosphere',
                'edition'   => 'both',
                'cover'     => $p[7],
                'hours_ago' => 3,
                'slides'    => [
                    [
                        'media_id'        => $p[7],
                        'text_overlay_bn' => 'ঈদের সকালে নামাজের জামাত',
                        'text_overlay_en' => 'Eid morning prayers congregation',
                        'duration'        => 6,
                    ],
                    [
                        'media_id'        => $p[6],
                        'text_overlay_bn' => 'কোরবানির পশুর হাটে ভিড়',
                        'text_overlay_en' => 'Crowds at the livestock market',
                        'duration'        => 5,
                    ],
                    [
                        'media_id'        => $p[9],
                        'text_overlay_bn' => 'পরিবারের সঙ্গে আনন্দময় ঈদ',
                        'text_overlay_en' => 'Joyful Eid with family',
                        'duration'        => 5,
                    ],
                    [
                        'media_id'        => $p[10],
                        'text_overlay_bn' => 'গ্রামে গ্রামে ঈদের উৎসব',
                        'text_overlay_en' => 'Eid celebrations across villages',
                        'duration'        => 6,
                    ],
                ],
            ],

            [
                'title_bn'  => 'সুন্দরবন: শেষ রক্ষার লড়াই',
                'title_en'  => 'Sundarbans: The Last Battle',
                'edition'   => 'both',
                'cover'     => $p[1],
                'hours_ago' => 6,
                'slides'    => [
                    [
                        'media_id'        => $p[1],
                        'text_overlay_bn' => 'বিশ্বের বৃহত্তম ম্যানগ্রোভ বন',
                        'text_overlay_en' => 'World\'s largest mangrove forest',
                        'duration'        => 7,
                    ],
                    [
                        'media_id'        => $p[10],
                        'text_overlay_bn' => 'জলবায়ু পরিবর্তনে বিপন্ন বাস্তুতন্ত্র',
                        'text_overlay_en' => 'Ecosystem threatened by climate change',
                        'duration'        => 6,
                    ],
                    [
                        'media_id'        => $p[11],
                        'text_overlay_bn' => 'বাঘ রক্ষায় বনরক্ষীদের অভিযান',
                        'text_overlay_en' => 'Rangers on tiger conservation patrol',
                        'duration'        => 6,
                    ],
                    [
                        'media_id'        => $p[2],
                        'text_overlay_bn' => 'জেলেদের জীবন-জীবিকা হুমকিতে',
                        'text_overlay_en' => 'Fishermen\'s livelihoods at risk',
                        'duration'        => 5,
                    ],
                ],
            ],

            [
                'title_bn'  => 'ঢাকার বায়ু দূষণ: ছবিতে বাস্তবতা',
                'title_en'  => 'Dhaka Air Pollution: Reality in Pictures',
                'edition'   => 'both',
                'cover'     => $p[6],
                'hours_ago' => 10,
                'slides'    => [
                    [
                        'media_id'        => $p[6],
                        'text_overlay_bn' => 'ঢাকায় AQI ৩০০ ছাড়িয়ে গেছে',
                        'text_overlay_en' => 'Dhaka AQI crosses 300',
                        'duration'        => 6,
                    ],
                    [
                        'media_id'        => $p[0],
                        'text_overlay_bn' => 'মাস্ক পরে রাস্তায় নামছেন মানুষ',
                        'text_overlay_en' => 'People wearing masks on the streets',
                        'duration'        => 5,
                    ],
                    [
                        'media_id'        => $p[9],
                        'text_overlay_bn' => 'শিশু ও বৃদ্ধরা সবচেয়ে ঝুঁকিতে',
                        'text_overlay_en' => 'Children and elderly most at risk',
                        'duration'        => 6,
                    ],
                ],
            ],

            [
                'title_bn'  => 'নির্বাচন ২০২৬: ভোটের দিনের গল্প',
                'title_en'  => 'Election 2026: Story of Voting Day',
                'edition'   => 'both',
                'cover'     => $p[2],
                'hours_ago' => 14,
                'slides'    => [
                    [
                        'media_id'        => $p[2],
                        'text_overlay_bn' => 'ভোর থেকেই ভোটারদের লাইন',
                        'text_overlay_en' => 'Voters queue from dawn',
                        'duration'        => 6,
                    ],
                    [
                        'media_id'        => $p[5],
                        'text_overlay_bn' => 'মহিলা ভোটারদের বিশেষ উপস্থিতি',
                        'text_overlay_en' => 'Strong female voter turnout',
                        'duration'        => 5,
                    ],
                    [
                        'media_id'        => $p[4],
                        'text_overlay_bn' => 'ব্যালট পেপারে পছন্দের প্রতীক',
                        'text_overlay_en' => 'Marking preferred symbol on ballot',
                        'duration'        => 5,
                    ],
                    [
                        'media_id'        => $p[9],
                        'text_overlay_bn' => 'ফলাফল ঘোষণার অপেক্ষায়',
                        'text_overlay_en' => 'Awaiting the results announcement',
                        'duration'        => 6,
                    ],
                ],
            ],

            [
                'title_bn'  => 'কৃষকের স্বপ্ন: সোনার ধান',
                'title_en'  => 'Farmer\'s Dream: Golden Harvest',
                'edition'   => 'bn',
                'cover'     => $p[11],
                'hours_ago' => 18,
                'slides'    => [
                    [
                        'media_id'        => $p[11],
                        'text_overlay_bn' => 'বোরো মৌসুমে বাম্পার ফলন',
                        'text_overlay_en' => null,
                        'duration'        => 6,
                    ],
                    [
                        'media_id'        => $p[2],
                        'text_overlay_bn' => 'ধান কাটার উৎসবে মেতেছে গ্রামবাসী',
                        'text_overlay_en' => null,
                        'duration'        => 5,
                    ],
                    [
                        'media_id'        => $p[10],
                        'text_overlay_bn' => 'ন্যায্য দামের দাবিতে কৃষকরা',
                        'text_overlay_en' => null,
                        'duration'        => 5,
                    ],
                ],
            ],

            [
                'title_bn'  => 'তরুণ প্রজন্মের বিজ্ঞান উদ্ভাবন',
                'title_en'  => 'Young Generation\'s Science Innovations',
                'edition'   => 'both',
                'cover'     => $p[9],
                'hours_ago' => 22,
                'slides'    => [
                    [
                        'media_id'        => $p[9],
                        'text_overlay_bn' => 'আন্তর্জাতিক বিজ্ঞান প্রতিযোগিতায় সোনা',
                        'text_overlay_en' => 'Gold at international science competition',
                        'duration'        => 7,
                    ],
                    [
                        'media_id'        => $p[3],
                        'text_overlay_bn' => 'রোবোটিক্সে বাংলাদেশের সাফল্য',
                        'text_overlay_en' => 'Bangladesh\'s success in robotics',
                        'duration'        => 6,
                    ],
                    [
                        'media_id'        => $p[0],
                        'text_overlay_bn' => 'স্বপ্নীল ভবিষ্যতের দিকে এগিয়ে',
                        'text_overlay_en' => 'Moving towards a bright future',
                        'duration'        => 5,
                    ],
                ],
            ],
        ];

        // ── Create stories ───────────────────────────────────────────────────
        foreach ($stories as $data) {
            $slug = $this->generateSlug($data['title_bn']);

            $story = Story::create([
                'title_bn'     => $data['title_bn'],
                'title_en'     => $data['title_en'] ?? null,
                'slug'         => $slug,
                'cover_media_id' => $data['cover'],
                'status'       => 'published',
                'edition'      => $data['edition'],
                'published_at' => now()->subHours($data['hours_ago']),
                'created_by'   => $admin->id,
                'published_by' => $editor->id,
                'view_count'   => rand(200, 8000),
            ]);

            foreach ($data['slides'] as $order => $slide) {
                StorySlide::create([
                    'story_id'          => $story->id,
                    'sort_order'        => $order,
                    'media_id'          => $slide['media_id'],
                    'text_overlay_bn'   => $slide['text_overlay_bn'] ?? null,
                    'text_overlay_en'   => $slide['text_overlay_en'] ?? null,
                    'linked_article_id' => $slide['linked_article_id'] ?? null,
                    'duration'          => $slide['duration'] ?? 5,
                ]);
            }
        }
    }

    private function generateSlug(string $title): string
    {
        $base = preg_replace('/[^\p{L}\p{N}\s-]+/u', '', $title);
        $base = strtolower(preg_replace('/\s+/', '-', trim($base)));
        if ($base === '') $base = 'story-' . Str::random(6);
        $slug = $base;
        $counter = 1;
        while (Story::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $counter++;
        }
        return $slug;
    }
}
