<?php

namespace Database\Seeders;

use App\Models\PhotocardTemplate;
use Illuminate\Database\Seeder;

class PhotocardTemplateSeeder extends Seeder
{
    /**
     * Photocard starter templates — kept in exact sync with the live DB
     * (regenerated from the studio-saved templates).
     */
    public function run(): void
    {
        foreach (json_decode(self::DATA, true) as $t) {
            PhotocardTemplate::updateOrCreate(
                ['slug' => $t['slug']],
                [
                    'name_bn'       => $t['name_bn'],
                    'name_en'       => $t['name_en'],
                    'canvas_preset' => $t['canvas_preset'],
                    'is_active'     => $t['is_active'],
                    'sort_order'    => $t['sort_order'],
                    'config'        => $t['config'],
                ]
            );
        }
    }

    private const DATA = <<<'JSON'
[
    {
        "slug": "classic-dark",
        "name_bn": "ক্লাসিক ডার্ক",
        "name_en": "Classic Dark",
        "canvas_preset": "square",
        "is_active": true,
        "sort_order": 0,
        "config": {
            "canvas": {
                "width": 1080,
                "height": 1080
            },
            "background": {
                "type": "solid",
                "color": "#000000",
                "gradientFrom": "#0a0a0a",
                "gradientMid": null,
                "gradientMidPos": 50,
                "gradientTo": "#2a0505",
                "gradientAngle": 180,
                "imageUrl": null,
                "imageOpacity": 100
            },
            "photo": {
                "enabled": true,
                "x": 0,
                "y": 0,
                "width": 1080,
                "height": 560,
                "radius": 0,
                "overlayColor": "#000000",
                "overlayOpacity": 18,
                "fade": {
                    "enabled": true,
                    "color": "#000000",
                    "opacity": 72,
                    "height": 180
                }
            },
            "panel": {
                "enabled": true,
                "x": 0,
                "y": 560,
                "width": 1080,
                "height": 520,
                "type": "gradient",
                "color": "#1a0303",
                "gradientFrom": "#0a0a0a",
                "gradientMid": "#1a0303",
                "gradientMidPos": 30,
                "gradientTo": "#2a0505",
                "gradientAngle": 180,
                "feather": {
                    "enabled": true,
                    "height": 120
                }
            },
            "logo": {
                "enabled": true,
                "source": "site",
                "imageUrl": null,
                "x": 480,
                "y": 500,
                "size": 120,
                "shape": "circle",
                "borderColor": "#ffffff",
                "borderWidth": 4,
                "radius": 12
            },
            "headline": {
                "enabled": true,
                "source": "title",
                "customText": "",
                "font": "SolaimanLipi",
                "size": 50,
                "weight": 900,
                "color": "#ffffff",
                "align": "center",
                "x": 50,
                "y": 700,
                "width": 980,
                "lineHeight": 88,
                "maxLines": 3,
                "shadow": {
                    "enabled": false,
                    "color": "#000000",
                    "blur": 8,
                    "x": 0,
                    "y": 2
                }
            },
            "cta": {
                "enabled": true,
                "text": "বিস্তারিত কমেন্টে ...",
                "font": "SolaimanLipi",
                "size": 30,
                "weight": 700,
                "color": "#dddddd",
                "align": "left",
                "x": 44,
                "y": 952,
                "width": 700
            },
            "urlText": {
                "enabled": true,
                "text": "",
                "font": "SolaimanLipi",
                "size": 28,
                "weight": 500,
                "color": "#cccccc",
                "align": "left",
                "x": 44,
                "y": 1004,
                "width": 600
            },
            "dateText": {
                "enabled": true,
                "font": "SolaimanLipi",
                "size": 28,
                "weight": 500,
                "color": "#cccccc",
                "align": "right",
                "x": 480,
                "y": 1004,
                "width": 556
            },
            "adBanner": {
                "enabled": false,
                "x": 0,
                "y": 960,
                "width": 1080,
                "height": 120,
                "bgType": "solid",
                "bgColor": "#ffcc00",
                "gradientFrom": "#ffcc00",
                "gradientTo": "#ff8800",
                "gradientAngle": 90,
                "imageUrl": null,
                "text": "",
                "textColor": "#000000",
                "textSize": 32,
                "textFont": "SolaimanLipi",
                "textWeight": 700,
                "textAlign": "center"
            },
            "layers": []
        }
    },
    {
        "slug": "amar-barta-style",
        "name_bn": "আমার বার্তা স্টাইল",
        "name_en": "Amar Barta Style",
        "canvas_preset": "portrait",
        "is_active": true,
        "sort_order": 1,
        "config": {
            "canvas": {
                "width": 1080,
                "height": 1350
            },
            "background": {
                "type": "solid",
                "color": "#ffffff",
                "gradientFrom": "#ffffff",
                "gradientMid": null,
                "gradientMidPos": 50,
                "gradientTo": "#eeeeee",
                "gradientAngle": 180,
                "imageUrl": null,
                "imageOpacity": 100,
                "fit": "cover"
            },
            "photo": {
                "enabled": true,
                "x": 0,
                "y": 101,
                "width": 1080,
                "height": 811,
                "radius": 0,
                "fit": "cover",
                "zoom": 1,
                "offsetX": 0,
                "offsetY": 0,
                "overlayColor": "#000000",
                "overlayOpacity": 0,
                "fade": {
                    "enabled": false,
                    "color": "#000000",
                    "opacity": 60,
                    "height": 160
                }
            },
            "panel": {
                "enabled": true,
                "x": 0,
                "y": 912,
                "width": 1080,
                "height": 348,
                "type": "solid",
                "color": "#9B0B02",
                "gradientFrom": "#ed1c24",
                "gradientMid": null,
                "gradientMidPos": 50,
                "gradientTo": "#c20a12",
                "gradientAngle": 180,
                "feather": {
                    "enabled": true,
                    "height": 99
                }
            },
            "logo": {
                "enabled": true,
                "source": "site",
                "imageUrl": null,
                "x": 847,
                "y": 0,
                "width": 190,
                "height": 86,
                "shape": "square",
                "fit": "contain",
                "zoom": 1,
                "offsetX": 0,
                "offsetY": 0,
                "borderColor": "#ffffff",
                "borderWidth": 0,
                "radius": 0,
                "size": 150
            },
            "headline": {
                "enabled": true,
                "source": "title",
                "customText": null,
                "font": "SolaimanLipi",
                "size": 51,
                "weight": 800,
                "color": "#ffffff",
                "align": "center",
                "x": 60,
                "y": 951,
                "width": 960,
                "lineHeight": 66,
                "maxLines": 3,
                "shadow": {
                    "enabled": false,
                    "color": "#000000",
                    "blur": 8,
                    "x": 0,
                    "y": 2
                }
            },
            "cta": {
                "enabled": true,
                "text": "...বিস্তারিত কমেন্টে...",
                "font": "SolaimanLipi",
                "size": 30,
                "weight": 700,
                "color": "#ffffff",
                "align": "center",
                "x": 60,
                "y": 1196,
                "width": 960
            },
            "urlText": {
                "enabled": true,
                "text": "{{site_url}}",
                "font": "SolaimanLipi",
                "size": 28,
                "weight": 600,
                "color": "#222222",
                "align": "left",
                "x": 86,
                "y": 60,
                "width": 460
            },
            "dateText": {
                "enabled": false,
                "font": "SolaimanLipi",
                "size": 28,
                "weight": 500,
                "color": "#888888",
                "align": "right",
                "x": 600,
                "y": 60,
                "width": 440
            },
            "adBanner": {
                "enabled": false,
                "x": 0,
                "y": 960,
                "width": 1080,
                "height": 120,
                "bgType": "solid",
                "bgColor": "#ffcc00",
                "gradientFrom": "#ffcc00",
                "gradientTo": "#ff8800",
                "gradientAngle": 90,
                "imageUrl": null,
                "fit": "cover",
                "text": null,
                "textColor": "#000000",
                "textSize": 32,
                "textFont": "SolaimanLipi",
                "textWeight": 700,
                "textAlign": "center"
            },
            "layers": [
                {
                    "id": "ico1",
                    "type": "icon",
                    "icon": "globe",
                    "color": "#222222",
                    "x": 44,
                    "y": 52,
                    "size": 34,
                    "rotation": 0,
                    "opacity": 100,
                    "width": 34,
                    "height": 34
                },
                {
                    "id": "div1",
                    "type": "rect",
                    "color": "#ca3e02",
                    "x": 0,
                    "y": 96,
                    "width": 1080,
                    "height": 5,
                    "radius": 0,
                    "rotation": 0,
                    "opacity": 98
                },
                {
                    "id": "soc1",
                    "type": "social",
                    "x": 0,
                    "y": 1260,
                    "width": 1080,
                    "height": 90,
                    "bg": "#9B0B02",
                    "style": "badge",
                    "iconColor": "#ffffff",
                    "glyphColor": "#3a3636",
                    "labelColor": "#ffffff",
                    "showLabels": true,
                    "size": 43,
                    "gap": 78,
                    "font": "SolaimanLipi",
                    "align": "center",
                    "opacity": 100,
                    "source": "manual",
                    "platforms": [
                        "facebook",
                        "instagram",
                        "tiktok",
                        "linkedin"
                    ]
                },
                {
                    "id": "Lmqeditye0",
                    "type": "rect",
                    "color": "#f95610",
                    "x": 0,
                    "y": 1260,
                    "width": 1080,
                    "height": 5,
                    "radius": 0,
                    "rotation": 0,
                    "opacity": 45
                }
            ]
        }
    },
    {
        "slug": "community-ad-style",
        "name_bn": "কমিউনিটি + অ্যাড স্টাইল",
        "name_en": "Community + Ad Style",
        "canvas_preset": "portrait",
        "is_active": true,
        "sort_order": 2,
        "config": {
            "canvas": {
                "width": 1080,
                "height": 1355
            },
            "background": {
                "type": "solid",
                "color": "rgba(13,13,13,0.00)",
                "gradientFrom": "#0d0d0d",
                "gradientMid": null,
                "gradientMidPos": 50,
                "gradientTo": "#000000",
                "gradientAngle": 180,
                "imageUrl": null,
                "imageOpacity": 100,
                "fit": "cover"
            },
            "photo": {
                "enabled": true,
                "x": 0,
                "y": 0,
                "width": 1080,
                "height": 1201,
                "radius": 0,
                "fit": "stretch",
                "zoom": 1,
                "offsetX": 0,
                "offsetY": 0,
                "overlayColor": "#000000",
                "overlayOpacity": 10,
                "fade": {
                    "enabled": true,
                    "color": "#0d0d0d",
                    "opacity": 90,
                    "height": 300
                }
            },
            "panel": {
                "enabled": true,
                "x": 0,
                "y": 657,
                "width": 1080,
                "height": 693,
                "type": "gradient",
                "color": "rgba(31,37,65,0.69)",
                "gradientFrom": "rgba(39,45,79,0.72)",
                "gradientMid": null,
                "gradientMidPos": 50,
                "gradientTo": "rgba(39,54,83,0.59)",
                "gradientAngle": 180,
                "feather": {
                    "enabled": true,
                    "height": 500
                }
            },
            "logo": {
                "enabled": true,
                "source": "site",
                "imageUrl": null,
                "x": 444,
                "y": 675,
                "width": 211,
                "height": 130,
                "shape": "square",
                "fit": "contain",
                "zoom": 1,
                "offsetX": 0,
                "offsetY": 0,
                "borderColor": "#ffffff",
                "borderWidth": 3,
                "radius": 12,
                "size": 130
            },
            "headline": {
                "enabled": true,
                "source": "title",
                "customText": null,
                "font": "Hind Siliguri",
                "size": 74,
                "weight": 800,
                "color": "#ffffff",
                "align": "center",
                "x": 30,
                "y": 857,
                "width": 1020,
                "lineHeight": 98,
                "maxLines": 3,
                "shadow": {
                    "enabled": false,
                    "color": "#000000",
                    "blur": 8,
                    "x": 0,
                    "y": 2
                }
            },
            "cta": {
                "enabled": false,
                "text": "...বিস্তারিত কমেন্টে...",
                "font": "SolaimanLipi",
                "size": 30,
                "weight": 700,
                "color": "#dddddd",
                "align": "center",
                "x": 60,
                "y": 1130,
                "width": 960
            },
            "urlText": {
                "enabled": false,
                "text": null,
                "font": "SolaimanLipi",
                "size": 28,
                "weight": 500,
                "color": "#cccccc",
                "align": "left",
                "x": 44,
                "y": 1140,
                "width": 600
            },
            "dateText": {
                "enabled": false,
                "font": "SolaimanLipi",
                "size": 28,
                "weight": 500,
                "color": "#cccccc",
                "align": "right",
                "x": 480,
                "y": 1140,
                "width": 556
            },
            "adBanner": {
                "enabled": true,
                "x": 0,
                "y": 1184,
                "width": 1080,
                "height": 166,
                "bgType": "solid",
                "bgColor": "rgba(255,255,255,0.00)",
                "gradientFrom": "#b30000",
                "gradientTo": "#7a0000",
                "gradientAngle": 90,
                "imageUrl": "https://placehold.co/728x90/e8001e/white?text=bKash+Offer",
                "fit": "stretch",
                "text": null,
                "textColor": "#ffffff",
                "textSize": 30,
                "textFont": "SolaimanLipi",
                "textWeight": 700,
                "textAlign": "center"
            },
            "layers": []
        }
    }
]
JSON;
}