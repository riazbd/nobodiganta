<?php

namespace Database\Seeders;

use App\Models\Poll;
use App\Models\PollOption;
use Illuminate\Database\Seeder;

class PollSeeder extends Seeder
{
    public function run(): void
    {
        Poll::query()->update(['is_active' => false]);

        $polls = [
            [
                'poll' => [
                    'question_bn'    => 'অটোরিকশা ও মোটরসাইকেলে কর আরোপের পরিকল্পনা করেছে সরকার। এই সিদ্ধান্ত যৌক্তিক বলে মনে করেন?',
                    'question_en'    => 'The government plans to impose taxes on auto-rickshaws and motorcycles. Do you think this decision is justified?',
                    'is_active'      => true,
                    'start_date'     => now()->subDays(3),
                    'end_date'       => now()->addDays(7),
                    'total_votes'    => 4256,
                    'featured_image' => 'https://images.prothomalo.com/prothomalo-bangla%2F2024-01%2Fautorickshaw.jpg',
                ],
                'options' => [
                    ['option_bn' => 'হ্যাঁ',        'option_en' => 'Yes',        'votes' => 1840],
                    ['option_bn' => 'না',            'option_en' => 'No',         'votes' => 2138],
                    ['option_bn' => 'মন্তব্য নেই', 'option_en' => 'No comment', 'votes' =>  278],
                ],
            ],
            [
                'poll' => [
                    'question_bn'    => 'বাংলাদেশে আগামী জাতীয় নির্বাচন কি নির্ধারিত সময়ে হওয়া উচিত?',
                    'question_en'    => 'Should the next national election in Bangladesh be held on schedule?',
                    'is_active'      => false,
                    'start_date'     => now()->subDays(14),
                    'end_date'       => now()->subDays(2),
                    'total_votes'    => 8740,
                    'featured_image' => null,
                ],
                'options' => [
                    ['option_bn' => 'হ্যাঁ',        'option_en' => 'Yes',        'votes' => 5820],
                    ['option_bn' => 'না',            'option_en' => 'No',         'votes' => 2310],
                    ['option_bn' => 'মন্তব্য নেই', 'option_en' => 'No comment', 'votes' =>  610],
                ],
            ],
            [
                'poll' => [
                    'question_bn'    => 'দ্রব্যমূল্যের ঊর্ধ্বগতি নিয়ন্ত্রণে সরকারের পদক্ষেপ কি যথেষ্ট?',
                    'question_en'    => 'Are the government\'s measures to control rising commodity prices sufficient?',
                    'is_active'      => false,
                    'start_date'     => now()->subDays(25),
                    'end_date'       => now()->subDays(10),
                    'total_votes'    => 6132,
                    'featured_image' => null,
                ],
                'options' => [
                    ['option_bn' => 'হ্যাঁ',        'option_en' => 'Yes',        'votes' =>  980],
                    ['option_bn' => 'না',            'option_en' => 'No',         'votes' => 4752],
                    ['option_bn' => 'মন্তব্য নেই', 'option_en' => 'No comment', 'votes' =>  400],
                ],
            ],
        ];

        foreach ($polls as $entry) {
            $poll = Poll::updateOrCreate(
                ['question_en' => $entry['poll']['question_en']],
                $entry['poll']
            );

            foreach ($entry['options'] as $opt) {
                $poll->options()->updateOrCreate(
                    ['option_en' => $opt['option_en']],
                    $opt
                );
            }
        }
    }
}
