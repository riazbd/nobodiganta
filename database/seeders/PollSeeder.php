<?php

namespace Database\Seeders;

use App\Models\Poll;
use App\Models\PollOption;
use Illuminate\Database\Seeder;

class PollSeeder extends Seeder
{
    public function run(): void
    {
        $poll = Poll::updateOrCreate(
            ['question_en' => 'What is the country\'s biggest challenge?'],
            [
                'question_bn' => 'দেশের সবচেয়ে বড় চ্যালেঞ্জ কোনটি?',
                'is_active' => true,
                'start_date' => now()->subDays(2),
                'end_date' => now()->addDays(5),
                'total_votes' => 12456,
            ]
        );

        $options = [
            ['option_bn' => 'অর্থনীতি', 'option_en' => 'Economy', 'votes' => 5400],
            ['option_bn' => 'নিরাপত্তা', 'option_en' => 'Security', 'votes' => 3200],
            ['option_bn' => 'শিক্ষা', 'option_en' => 'Education', 'votes' => 1856],
            ['option_bn' => 'স্বাস্থ্য', 'option_en' => 'Health', 'votes' => 2000],
        ];

        foreach ($options as $opt) {
            $poll->options()->updateOrCreate(
                ['option_en' => $opt['option_en']],
                $opt
            );
        }
    }
}
