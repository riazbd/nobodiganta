<?php

namespace Database\Seeders;

use App\Models\Media;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MediaSeeder extends Seeder
{
    public function run(): void
    {
        $images = [
            ['alt' => 'Dhaka Skyline bangladesh', 'cap' => 'Modern Dhaka City', 'tab' => 'bangladesh'],
            ['alt' => 'Sundarbans nature', 'cap' => 'Mangrove forest in Bangladesh', 'tab' => 'nature'],
            ['alt' => 'Local people lifestyle', 'cap' => 'Villagers in rural Bangladesh', 'tab' => 'people'],
            ['alt' => 'Cricket match sports', 'cap' => 'Tigers playing at Mirpur', 'tab' => 'sports'],
            ['alt' => 'Special report photo', 'cap' => 'Investigation team at site', 'tab' => 'special'],
            ['alt' => 'Parliament building bangladesh', 'cap' => 'National Parliament', 'tab' => 'bangladesh'],
        ];

        foreach ($images as $index => $img) {
            Media::create([
                'user_id' => 1,
                'original_name' => 'img_' . ($index + 1) . '.jpg',
                'file_name' => Str::uuid() . '.jpg',
                'file_path' => 'https://picsum.photos/seed/' . $img['tab'] . $index . '/1200/800',
                'mime_type' => 'image/jpeg',
                'file_size' => 500000,
                'width' => 1200,
                'height' => 800,
                'alt_text_bn' => $img['alt'] . ' ' . $img['tab'],
                'alt_text_en' => $img['alt'],
                'caption_bn' => $img['cap'],
                'caption_en' => $img['cap'],
                'credit_bn' => 'স্টাফ রিপোর্টার',
                'credit_en' => 'Staff Reporter',
                'license_type' => 'internal',
                'edition' => 'both',
            ]);
        }
    }
}
