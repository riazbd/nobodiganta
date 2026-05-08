<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\HomepageSection;
use Illuminate\Database\Seeder;

class HomepageSectionSeeder extends Seeder
{
    /**
     * Homepage layout — dense newspaper editorial design.
     *
     * featured_left — 11 items:
     *   1 hero (left) + 2 stacked (center) + 5 list (right) + 3 bottom strip
     *
     * grid — 6 items: 2 rows × 3 columns
     *
     * list — 6 items: full-width rows with thumb + excerpt
     *
     * Cycle repeats every 6 sections for visual rhythm.
     * Video carousel placed after the 2nd category section.
     */
    public function run(): void
    {
        HomepageSection::truncate();

        // [layout, item_count]
        $cycle = [
            ['featured_left', 11],
            ['grid',           6],
            ['featured_left', 11],
            ['featured_left', 11],
            ['grid',           6],
            ['list',           6],
        ];

        $categories = Category::whereNull('parent_id')
            ->whereNotIn('slug', ['opinion', 'horoscope', 'video'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $sort = 1;

        // First 2 sections before video carousel
        foreach ($categories->take(2) as $i => $cat) {
            [$layout, $count] = $cycle[$i % count($cycle)];
            HomepageSection::create([
                'category_id' => $cat->id,
                'type'        => 'category',
                'layout'      => $layout,
                'item_count'  => $count,
                'sort_order'  => $sort++,
                'edition'     => 'both',
                'is_active'   => true,
            ]);
        }

        // Video carousel
        HomepageSection::create([
            'type'       => 'videos',
            'layout'     => 'video_grid',
            'item_count' => 8,
            'sort_order' => $sort++,
            'edition'    => 'both',
            'is_active'  => true,
        ]);

        // Remaining category sections
        foreach ($categories->skip(2) as $i => $cat) {
            $cycleIndex = ($i + 2) % count($cycle);
            [$layout, $count] = $cycle[$cycleIndex];
            HomepageSection::create([
                'category_id' => $cat->id,
                'type'        => 'category',
                'layout'      => $layout,
                'item_count'  => $count,
                'sort_order'  => $sort++,
                'edition'     => 'both',
                'is_active'   => true,
            ]);
        }
    }
}
