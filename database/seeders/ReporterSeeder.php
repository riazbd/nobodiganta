<?php

namespace Database\Seeders;

use App\Models\Reporter;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ReporterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reporters = [
            [
                'name_bn' => 'আনিসুল হক',
                'name_en' => 'Anisul Hoque',
                'designation_bn' => 'বিশেষ প্রতিনিধি',
                'designation_en' => 'Special Correspondent',
                'bio_bn' => 'আনিসুল হক একজন প্রখ্যাত বাংলাদেশী লেখক, নাট্যকার ও সাংবাদিক।',
                'bio_en' => 'Anisul Hoque is a renowned Bangladeshi author, playwright, and journalist.',
                'email' => 'anisul.hoque@provati.com',
            ],
            [
                'name_bn' => 'মতিউর রহমান',
                'name_en' => 'Matiur Rahman',
                'designation_bn' => 'সম্পাদক',
                'designation_en' => 'Editor',
                'bio_bn' => 'মতিউর রহমান একজন অভিজ্ঞ সাংবাদিক এবং সংবাদপত্রের সম্পাদক।',
                'bio_en' => 'Matiur Rahman is an experienced journalist and newspaper editor.',
                'email' => 'matiur.rahman@provati.com',
            ],
            [
                'name_bn' => 'তসলিমা নাসরিন',
                'name_en' => 'Taslima Nasrin',
                'designation_bn' => 'কলামিস্ট',
                'designation_en' => 'Columnist',
                'bio_bn' => 'তসলিমা নাসরিন একজন প্রখ্যাত কলামিস্ট এবং নারীবাদী লেখিকা।',
                'bio_en' => 'Taslima Nasrin is a prominent columnist and feminist writer.',
                'email' => 'taslima.nasrin@provati.com',
            ],
            [
                'name_bn' => 'জাহিদ হাসান',
                'name_en' => 'Zahid Hasan',
                'designation_bn' => 'ক্রীড়া সাংবাদিক',
                'designation_en' => 'Sports Journalist',
                'bio_bn' => 'জাহিদ হাসান ১০ বছরেরও বেশি সময় ধরে ক্রীড়া সাংবাদিকতায় নিয়োজিত।',
                'bio_en' => 'Zahid Hasan has been involved in sports journalism for over 10 years.',
                'email' => 'zahid.hasan@provati.com',
            ],
            [
                'name_bn' => 'ফারজানা রুপা',
                'name_en' => 'Farzana Rupa',
                'designation_bn' => 'সিনিয়র রিপোর্টার',
                'designation_en' => 'Senior Reporter',
                'bio_bn' => 'ফারজানা রুপা রাজনৈতিক ও সামাজিক ইস্যুতে অনুসন্ধানী প্রতিবেদন করে থাকেন।',
                'bio_en' => 'Farzana Rupa specializes in investigative reports on political and social issues.',
                'email' => 'farzana.rupa@provati.com',
            ],
        ];

        foreach ($reporters as $data) {
            // Create a user for each reporter if it doesn't exist
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name_en'],
                    'password' => bcrypt('password'),
                    'role' => 'reporter',
                ]
            );

            Reporter::updateOrCreate(
                ['slug' => Str::slug($data['name_en'])],
                array_merge($data, [
                    'user_id' => $user->id,
                    'is_active' => true,
                    'is_featured' => rand(0, 1),
                    'social_links' => [
                        'facebook' => 'https://facebook.com/' . Str::slug($data['name_en']),
                        'twitter' => 'https://twitter.com/' . Str::slug($data['name_en']),
                        'linkedin' => 'https://linkedin.com/in/' . Str::slug($data['name_en']),
                    ]
                ])
            );
        }
    }
}
