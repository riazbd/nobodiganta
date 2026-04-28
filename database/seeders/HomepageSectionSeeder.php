<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\HomepageSection;
use Illuminate\Database\Seeder;

class HomepageSectionSeeder extends Seeder
{
    /**
     * No more hardcoded strings. 
     * This builds the homepage layout by mapping to your actual Category tree.
     */
    public function run(): void
    {
        HomepageSection::truncate();

        $categories = Category::whereNull('parent_id')
            ->whereNotIn('slug', ['opinion', 'horoscope'])
            ->orderBy('sort_order')
            ->get();

        // Alternating layouts for visual variety
        $layouts = ['featured_left', 'grid', 'featured_left', 'list', 'grid', 'featured_left', 'list', 'grid'];

        foreach ($categories as $index => $category) {
            HomepageSection::create([
                'category_id' => $category->id,
                'type'        => 'category',
                'layout'      => $layouts[$index % count($layouts)],
                'item_count'  => 8,
                'sort_order'  => $index + 1,
                'edition'     => 'both',
                'is_active'   => true,
            ]);
        }

        HomepageSection::create([
            'type'       => 'videos',
            'layout'     => 'video_grid',
            'item_count' => 6,
            'sort_order' => $categories->count() + 1,
            'edition'    => 'both',
            'is_active'  => true,
        ]);
    }
}
