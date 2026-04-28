<?php

namespace Database\Seeders;

use App\Models\Epaper;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class EpaperSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 0; $i < 30; $i++) {
            $date = Carbon::now()->subDays($i);
            Epaper::create([
                'date' => $date->toDateString(),
                'edition' => 'bn',
                'pdf_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'thumbnail_url' => 'https://placehold.co/400x566/cccccc/000000?text=E-Paper+' . $date->format('d+M'),
                'label_bn' => $date->locale('bn')->translatedFormat('j F Y'),
                'label_en' => $date->format('j F Y'),
            ]);
            
            Epaper::create([
                'date' => $date->toDateString(),
                'edition' => 'en',
                'pdf_url' => 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'thumbnail_url' => 'https://placehold.co/400x566/cccccc/000000?text=E-Paper+(EN)+' . $date->format('d+M'),
                'label_bn' => $date->locale('bn')->translatedFormat('j F Y') . ' (English)',
                'label_en' => $date->format('j F Y') . ' (English)',
            ]);
        }
    }
}
