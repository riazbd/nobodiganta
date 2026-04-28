<?php

namespace Database\Seeders;

use App\Models\Newsletter;
use Illuminate\Database\Seeder;

class NewsletterSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'subject_bn' => 'সাপ্তাহিক সংবাদ সংকলন',
                'subject_en' => 'Weekly News Digest',
                'sent_at' => now()->subDays(2),
                'recipients' => 12450,
                'opened' => 8920,
                'clicked' => 3240,
                'status' => 'sent',
            ],
            [
                'subject_bn' => 'ক্রিকেট বিশেষ সংখ্যা',
                'subject_en' => 'Cricket Special Edition',
                'sent_at' => now()->subDays(5),
                'recipients' => 11800,
                'opened' => 7650,
                'clicked' => 2890,
                'status' => 'sent',
            ],
            [
                'subject_bn' => 'প্রযুক্তি সাপ্তাহিক',
                'subject_en' => 'Technology Weekly',
                'status' => 'draft',
            ],
        ];

        foreach ($data as $d) {
            Newsletter::create($d);
        }
    }
}
