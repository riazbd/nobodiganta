<?php

namespace Database\Seeders;

use App\Models\PhotocardTemplate;
use Illuminate\Database\Seeder;

class PhotocardTemplateSeeder extends Seeder
{
    public function run(): void
    {
        // "Classic Dark" in the canonical box-based config schema (see schema.js).
        // Every element is a box {x,y,width,height} so it can be moved/resized on canvas.
        PhotocardTemplate::updateOrCreate(
            ['slug' => 'classic-dark'],
            [
                'name_bn'       => 'ক্লাসিক ডার্ক',
                'name_en'       => 'Classic Dark',
                'canvas_preset' => 'square',
                'is_active'     => true,
                'sort_order'    => 0,
                'config'        => [
                    'canvas' => ['width' => 1080, 'height' => 1080],

                    'background' => [
                        'type' => 'solid', 'color' => '#000000',
                        'gradientFrom' => '#0a0a0a', 'gradientMid' => null, 'gradientMidPos' => 50,
                        'gradientTo' => '#2a0505', 'gradientAngle' => 180,
                        'imageUrl' => null, 'imageOpacity' => 100,
                    ],

                    'photo' => [
                        'enabled' => true,
                        'x' => 0, 'y' => 0, 'width' => 1080, 'height' => 560, 'radius' => 0,
                        'overlayColor' => '#000000', 'overlayOpacity' => 18,
                        'fade' => ['enabled' => true, 'color' => '#000000', 'opacity' => 72, 'height' => 180],
                    ],

                    'panel' => [
                        'enabled' => true,
                        'x' => 0, 'y' => 560, 'width' => 1080, 'height' => 520,
                        'type' => 'gradient', 'color' => '#1a0303',
                        'gradientFrom' => '#0a0a0a', 'gradientMid' => '#1a0303', 'gradientMidPos' => 30,
                        'gradientTo' => '#2a0505', 'gradientAngle' => 180,
                        'feather' => ['enabled' => true, 'height' => 120],
                    ],

                    'logo' => [
                        'enabled' => true, 'source' => 'site', 'imageUrl' => null,
                        'x' => 480, 'y' => 500, 'size' => 120,
                        'shape' => 'circle', 'borderColor' => '#ffffff', 'borderWidth' => 4, 'radius' => 12,
                    ],

                    'headline' => [
                        'enabled' => true, 'source' => 'title', 'customText' => '',
                        'font' => 'SolaimanLipi', 'size' => 50, 'weight' => 900, 'color' => '#ffffff',
                        'align' => 'center', 'x' => 50, 'y' => 700, 'width' => 980, 'lineHeight' => 88, 'maxLines' => 3,
                        'shadow' => ['enabled' => false, 'color' => '#000000', 'blur' => 8, 'x' => 0, 'y' => 2],
                    ],

                    'cta' => [
                        'enabled' => true, 'text' => 'বিস্তারিত কমেন্টে ...',
                        'font' => 'SolaimanLipi', 'size' => 30, 'weight' => 700, 'color' => '#dddddd',
                        'align' => 'left', 'x' => 44, 'y' => 952, 'width' => 700,
                    ],

                    'urlText' => [
                        'enabled' => true, 'text' => '',
                        'font' => 'SolaimanLipi', 'size' => 28, 'weight' => 500, 'color' => '#cccccc',
                        'align' => 'left', 'x' => 44, 'y' => 1004, 'width' => 600,
                    ],

                    'dateText' => [
                        'enabled' => true,
                        'font' => 'SolaimanLipi', 'size' => 28, 'weight' => 500, 'color' => '#cccccc',
                        'align' => 'right', 'x' => 480, 'y' => 1004, 'width' => 556,
                    ],

                    'adBanner' => [
                        'enabled' => false,
                        'x' => 0, 'y' => 960, 'width' => 1080, 'height' => 120,
                        'bgType' => 'solid', 'bgColor' => '#ffcc00',
                        'gradientFrom' => '#ffcc00', 'gradientTo' => '#ff8800', 'gradientAngle' => 90,
                        'imageUrl' => null,
                        'text' => '', 'textColor' => '#000000', 'textSize' => 32,
                        'textFont' => 'SolaimanLipi', 'textWeight' => 700, 'textAlign' => 'center',
                    ],

                    'layers' => [],
                ],
            ]
        );

        // ── Starter template #2: "Amar Barta style" (white header + red panel + social bar) ──
        PhotocardTemplate::updateOrCreate(
            ['slug' => 'amar-barta-style'],
            [
                'name_bn' => 'আমার বার্তা স্টাইল', 'name_en' => 'Amar Barta Style',
                'canvas_preset' => 'portrait', 'is_active' => true, 'sort_order' => 1,
                'config' => [
                    'canvas' => ['width' => 1080, 'height' => 1350],
                    'background' => ['type' => 'solid', 'color' => '#ffffff', 'gradientFrom' => '#ffffff', 'gradientMid' => null, 'gradientMidPos' => 50, 'gradientTo' => '#eeeeee', 'gradientAngle' => 180, 'imageUrl' => null, 'imageOpacity' => 100],
                    'photo' => ['enabled' => true, 'x' => 0, 'y' => 156, 'width' => 1080, 'height' => 620, 'radius' => 0, 'overlayColor' => '#000000', 'overlayOpacity' => 0, 'fade' => ['enabled' => false, 'color' => '#000000', 'opacity' => 60, 'height' => 160]],
                    'panel' => ['enabled' => true, 'x' => 0, 'y' => 776, 'width' => 1080, 'height' => 440, 'type' => 'solid', 'color' => '#ed1c24', 'gradientFrom' => '#ed1c24', 'gradientMid' => null, 'gradientMidPos' => 50, 'gradientTo' => '#c20a12', 'gradientAngle' => 180, 'feather' => ['enabled' => false, 'height' => 0]],
                    'logo' => ['enabled' => true, 'source' => 'site', 'imageUrl' => null, 'x' => 590, 'y' => 10, 'size' => 150, 'shape' => 'square', 'borderColor' => '#ffffff', 'borderWidth' => 0, 'radius' => 0],
                    'headline' => ['enabled' => true, 'source' => 'title', 'customText' => '', 'font' => 'SolaimanLipi', 'size' => 52, 'weight' => 800, 'color' => '#ffffff', 'align' => 'center', 'x' => 60, 'y' => 846, 'width' => 960, 'lineHeight' => 68, 'maxLines' => 3, 'shadow' => ['enabled' => false, 'color' => '#000000', 'blur' => 8, 'x' => 0, 'y' => 2]],
                    'cta' => ['enabled' => true, 'text' => '...বিস্তারিত কমেন্টে...', 'font' => 'SolaimanLipi', 'size' => 30, 'weight' => 700, 'color' => '#ffffff', 'align' => 'center', 'x' => 60, 'y' => 1150, 'width' => 960],
                    'urlText' => ['enabled' => true, 'text' => '{{site_url}}', 'font' => 'SolaimanLipi', 'size' => 28, 'weight' => 600, 'color' => '#222222', 'align' => 'left', 'x' => 86, 'y' => 60, 'width' => 460],
                    'dateText' => ['enabled' => false, 'font' => 'SolaimanLipi', 'size' => 28, 'weight' => 500, 'color' => '#888888', 'align' => 'right', 'x' => 600, 'y' => 60, 'width' => 440],
                    'adBanner' => ['enabled' => false, 'x' => 0, 'y' => 960, 'width' => 1080, 'height' => 120, 'bgType' => 'solid', 'bgColor' => '#ffcc00', 'gradientFrom' => '#ffcc00', 'gradientTo' => '#ff8800', 'gradientAngle' => 90, 'imageUrl' => null, 'text' => '', 'textColor' => '#000000', 'textSize' => 32, 'textFont' => 'SolaimanLipi', 'textWeight' => 700, 'textAlign' => 'center'],
                    'layers' => [
                        ['id' => 'ico1', 'type' => 'icon', 'icon' => 'globe', 'color' => '#222222', 'x' => 44, 'y' => 52, 'size' => 34, 'rotation' => 0, 'opacity' => 100],
                        ['id' => 'div1', 'type' => 'rect', 'color' => '#ed1c24', 'x' => 0, 'y' => 148, 'width' => 1080, 'height' => 6, 'radius' => 0, 'rotation' => 0, 'opacity' => 100],
                        ['id' => 'soc1', 'type' => 'social', 'x' => 0, 'y' => 1216, 'width' => 1080, 'height' => 134, 'bg' => '#f2f2f2', 'style' => 'badge', 'iconColor' => '', 'glyphColor' => '#ffffff', 'labelColor' => '#333333', 'showLabels' => true, 'size' => 36, 'gap' => 44, 'font' => 'SolaimanLipi', 'align' => 'center', 'opacity' => 100, 'source' => 'manual', 'platforms' => ['facebook', 'instagram', 'tiktok', 'linkedin']],
                    ],
                ],
            ]
        );

        // ── Starter template #3: "Community + Ad style" (dark, logo overlap, bottom ad banner) ──
        PhotocardTemplate::updateOrCreate(
            ['slug' => 'community-ad-style'],
            [
                'name_bn' => 'কমিউনিটি + অ্যাড স্টাইল', 'name_en' => 'Community + Ad Style',
                'canvas_preset' => 'portrait', 'is_active' => true, 'sort_order' => 2,
                'config' => [
                    'canvas' => ['width' => 1080, 'height' => 1350],
                    'background' => ['type' => 'solid', 'color' => '#0d0d0d', 'gradientFrom' => '#0d0d0d', 'gradientMid' => null, 'gradientMidPos' => 50, 'gradientTo' => '#000000', 'gradientAngle' => 180, 'imageUrl' => null, 'imageOpacity' => 100],
                    'photo' => ['enabled' => true, 'x' => 0, 'y' => 0, 'width' => 1080, 'height' => 870, 'radius' => 0, 'overlayColor' => '#000000', 'overlayOpacity' => 10, 'fade' => ['enabled' => true, 'color' => '#0d0d0d', 'opacity' => 90, 'height' => 300]],
                    'panel' => ['enabled' => true, 'x' => 0, 'y' => 870, 'width' => 1080, 'height' => 480, 'type' => 'solid', 'color' => '#0d0d0d', 'gradientFrom' => '#0d0d0d', 'gradientMid' => null, 'gradientMidPos' => 50, 'gradientTo' => '#000000', 'gradientAngle' => 180, 'feather' => ['enabled' => true, 'height' => 200]],
                    'logo' => ['enabled' => true, 'source' => 'site', 'imageUrl' => null, 'x' => 475, 'y' => 805, 'size' => 130, 'shape' => 'circle', 'borderColor' => '#ffffff', 'borderWidth' => 3, 'radius' => 12],
                    'headline' => ['enabled' => true, 'source' => 'title', 'customText' => '', 'font' => 'SolaimanLipi', 'size' => 48, 'weight' => 800, 'color' => '#ffffff', 'align' => 'center', 'x' => 60, 'y' => 960, 'width' => 960, 'lineHeight' => 62, 'maxLines' => 3, 'shadow' => ['enabled' => false, 'color' => '#000000', 'blur' => 8, 'x' => 0, 'y' => 2]],
                    'cta' => ['enabled' => false, 'text' => '...বিস্তারিত কমেন্টে...', 'font' => 'SolaimanLipi', 'size' => 30, 'weight' => 700, 'color' => '#dddddd', 'align' => 'center', 'x' => 60, 'y' => 1130, 'width' => 960],
                    'urlText' => ['enabled' => false, 'text' => '', 'font' => 'SolaimanLipi', 'size' => 28, 'weight' => 500, 'color' => '#cccccc', 'align' => 'left', 'x' => 44, 'y' => 1140, 'width' => 600],
                    'dateText' => ['enabled' => false, 'font' => 'SolaimanLipi', 'size' => 28, 'weight' => 500, 'color' => '#cccccc', 'align' => 'right', 'x' => 480, 'y' => 1140, 'width' => 556],
                    'adBanner' => ['enabled' => true, 'x' => 0, 'y' => 1160, 'width' => 1080, 'height' => 190, 'bgType' => 'solid', 'bgColor' => '#b30000', 'gradientFrom' => '#b30000', 'gradientTo' => '#7a0000', 'gradientAngle' => 90, 'imageUrl' => null, 'text' => 'এখানে আপনার বিজ্ঞাপন ছবি বসান', 'textColor' => '#ffffff', 'textSize' => 30, 'textFont' => 'SolaimanLipi', 'textWeight' => 700, 'textAlign' => 'center'],
                    'layers' => [],
                ],
            ]
        );
    }
}
