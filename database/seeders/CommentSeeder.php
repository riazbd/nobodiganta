<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $articles = Article::all();
        $users = User::where('role', 'user')->get();
        
        if ($articles->isEmpty()) {
            return;
        }

        $sampleComments = [
            [
                'bn' => 'খুবই চমৎকার প্রতিবেদন। এ ধরনের সংবাদ আরও আসা উচিত।',
                'en' => 'Excellent report. More of such news should be published.',
            ],
            [
                'bn' => 'আমি এই মতামতের সাথে একমত নই। বিষয়টি আরও গভীরভাবে দেখা দরকার।',
                'en' => 'I do not agree with this opinion. The matter needs to be looked into more deeply.',
            ],
            [
                'bn' => 'তথ্যবহুল সংবাদ। ধন্যবাদ নব দিগন্ত।',
                'en' => 'Informative news. Thank you, Nobo Digonto.',
            ],
            [
                'bn' => 'এই ঘটনার সুষ্ঠু তদন্ত দাবি করছি।',
                'en' => 'I demand a fair investigation into this incident.',
            ],
            [
                'bn' => 'বাংলাদেশের অগ্রযাত্রায় এটি একটি মাইলফলক।',
                'en' => 'This is a milestone in the progress of Bangladesh.',
            ],
            [
                'bn' => 'সাধারণ মানুষের দুর্ভোগ কমানোর উদ্যোগ নেওয়া হোক।',
                'en' => 'Initiatives should be taken to reduce the suffering of common people.',
            ],
        ];

        foreach ($articles as $article) {
            // Add 2-5 comments per article
            $count = rand(2, 5);
            for ($i = 0; $i < $count; $i++) {
                $isRegistered = (bool)rand(0, 1);
                $commentData = $sampleComments[array_rand($sampleComments)];
                $body = rand(0, 1) ? $commentData['bn'] : $commentData['en'];
                
                $comment = Comment::create([
                    'article_id' => $article->id,
                    'user_id' => $isRegistered && $users->isNotEmpty() ? $users->random()->id : null,
                    'name' => !$isRegistered ? 'Anonymous User ' . rand(1, 100) : null,
                    'email' => !$isRegistered ? 'anon' . rand(1, 1000) . '@example.com' : null,
                    'body' => $body,
                    'status' => rand(0, 10) > 2 ? 'approved' : 'pending',
                    'ip_address' => '127.0.0.' . rand(1, 255),
                    'created_at' => now()->subDays(rand(0, 10))->subHours(rand(0, 23)),
                ]);

                // Add a reply to some comments
                if (rand(0, 10) > 7) {
                    Comment::create([
                        'article_id' => $article->id,
                        'parent_id' => $comment->id,
                        'user_id' => $users->isNotEmpty() ? $users->random()->id : null,
                        'name' => 'Reply User',
                        'email' => 'reply@example.com',
                        'body' => 'আপনার সাথে একমত।',
                        'status' => 'approved',
                        'ip_address' => '127.0.0.' . rand(1, 255),
                        'created_at' => $comment->created_at->addHours(rand(1, 5)),
                    ]);
                }
            }
        }
    }
}
