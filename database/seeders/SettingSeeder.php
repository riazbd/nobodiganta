<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General
            [
                'key' => 'site_name',
                'value' => 'প্রথম প্রভাতী',
                'group' => 'general',
                'type' => 'text',
                'label_bn' => 'সাইটের নাম',
                'label_en' => 'Site Name',
                'is_public' => true,
            ],
            [
                'key' => 'site_tagline',
                'value' => 'সঠিক সংবাদ সবার আগে',
                'group' => 'general',
                'type' => 'text',
                'label_bn' => 'সাইট ট্যাগলাইন',
                'label_en' => 'Site Tagline',
                'is_public' => true,
            ],
            [
                'key' => 'site_logo',
                'value' => null,
                'group' => 'general',
                'type' => 'image',
                'label_bn' => 'সাইট লোগো',
                'label_en' => 'Site Logo',
                'description_bn' => 'হেডারে প্রদর্শিত হবে (PNG বা SVG, প্রস্তাবিত আকার: ২৪০×৬০ পিক্সেল)',
                'description_en' => 'Displayed in header (PNG or SVG, recommended: 240×60 px)',
                'is_public' => true,
            ],
            [
                'key' => 'site_favicon',
                'value' => null,
                'group' => 'general',
                'type' => 'image',
                'label_bn' => 'ফেভিকন',
                'label_en' => 'Favicon',
                'description_bn' => 'ব্রাউজার ট্যাবে প্রদর্শিত আইকন (ICO বা PNG, ৩২×৩২ পিক্সেল)',
                'description_en' => 'Browser tab icon (ICO or PNG, 32×32 px)',
                'is_public' => true,
            ],
            [
                'key' => 'contact_email',
                'value' => 'info@provati.com',
                'group' => 'general',
                'type' => 'text',
                'label_bn' => 'যোগাযোগ ইমেইল',
                'label_en' => 'Contact Email',
                'is_public' => true,
            ],
            [
                'key' => 'contact_phone',
                'value' => '+880 1234 567890',
                'group' => 'general',
                'type' => 'text',
                'label_bn' => 'যোগাযোগ ফোন',
                'label_en' => 'Contact Phone',
                'is_public' => true,
            ],
            [
                'key' => 'free_article_limit',
                'value' => '10',
                'group' => 'general',
                'type' => 'integer',
                'label_bn' => 'ফ্রি আর্টিকেল লিমিট',
                'label_en' => 'Free Article Limit',
                'is_public' => false,
            ],

            // SEO
            [
                'key' => 'meta_title',
                'value' => 'প্রথম প্রভাতী - নির্ভরযোগ্য সংবাদ মাধ্যম',
                'group' => 'seo',
                'type' => 'text',
                'label_bn' => 'মেটা টাইটেল',
                'label_en' => 'Meta Title',
                'is_public' => true,
            ],
            [
                'key' => 'meta_description',
                'value' => 'প্রথম প্রভাতী বাংলাদেশের অন্যতম শীর্ষস্থানীয় অনলাইন সংবাদ মাধ্যম।',
                'group' => 'seo',
                'type' => 'textarea',
                'label_bn' => 'মেটা বর্ণনা',
                'label_en' => 'Meta Description',
                'is_public' => true,
            ],

            // Social
            [
                'key' => 'facebook_url',
                'value' => 'https://facebook.com/prothomprovati',
                'group' => 'social',
                'type' => 'text',
                'label_bn' => 'ফেসবুক লিঙ্ক',
                'label_en' => 'Facebook URL',
                'is_public' => true,
            ],
            [
                'key' => 'twitter_url',
                'value' => 'https://twitter.com/prothomprovati',
                'group' => 'social',
                'type' => 'text',
                'label_bn' => 'টুইটার লিঙ্ক',
                'label_en' => 'Twitter URL',
                'is_public' => true,
            ],
            [
                'key' => 'youtube_url',
                'value' => 'https://youtube.com/prothomprovati',
                'group' => 'social',
                'type' => 'text',
                'label_bn' => 'ইউটিউব লিঙ্ক',
                'label_en' => 'YouTube URL',
                'is_public' => true,
            ],

            // System
            [
                'key' => 'maintenance_mode',
                'value' => 'false',
                'group' => 'system',
                'type' => 'boolean',
                'label_bn' => 'মেইনটেন্যান্স মোড',
                'label_en' => 'Maintenance Mode',
                'is_public' => false,
            ],
            [
                'key' => 'allow_registration',
                'value' => 'true',
                'group' => 'system',
                'type' => 'boolean',
                'label_bn' => 'রেজিস্ট্রেশন অনুমোদন',
                'label_en' => 'Allow Registration',
                'is_public' => false,
            ],
            [
                'key' => 'comment_approval',
                'value' => 'true',
                'group' => 'system',
                'type' => 'boolean',
                'label_bn' => 'মন্তব্য অনুমোদন প্রয়োজন',
                'label_en' => 'Comment Approval Required',
                'is_public' => false,
            ],

            // Legal
            [
                'key' => 'editor_name_bn',
                'value' => 'মোহাম্মদ রহমান',
                'group' => 'legal',
                'type' => 'text',
                'label_bn' => 'সম্পাদকের নাম (বাংলা)',
                'label_en' => 'Editor Name (BN)',
                'is_public' => true,
            ],
            [
                'key' => 'editor_name_en',
                'value' => 'Mohammad Rahman',
                'group' => 'legal',
                'type' => 'text',
                'label_bn' => 'সম্পাদকের নাম (ইংরেজি)',
                'label_en' => 'Editor Name (EN)',
                'is_public' => true,
            ],
            [
                'key' => 'publisher_name_bn',
                'value' => 'প্রভাতী মিডিয়া লিমিটেড',
                'group' => 'legal',
                'type' => 'text',
                'label_bn' => 'প্রকাশকের নাম (বাংলা)',
                'label_en' => 'Publisher Name (BN)',
                'is_public' => true,
            ],
            [
                'key' => 'publisher_name_en',
                'value' => 'Provati Media Ltd.',
                'group' => 'legal',
                'type' => 'text',
                'label_bn' => 'প্রকাশকের নাম (ইংরেজি)',
                'label_en' => 'Publisher Name (EN)',
                'is_public' => true,
            ],
            [
                'key' => 'office_address_bn',
                'value' => '১২৩, মতিঝিল, ঢাকা-১০০০',
                'group' => 'legal',
                'type' => 'textarea',
                'label_bn' => 'অফিসের ঠিকানা (বাংলা)',
                'label_en' => 'Office Address (BN)',
                'is_public' => true,
            ],
            [
                'key' => 'office_address_en',
                'value' => '123, Motijheel, Dhaka-1000',
                'group' => 'legal',
                'type' => 'textarea',
                'label_bn' => 'অফিসের ঠিকানা (ইংরেজি)',
                'label_en' => 'Office Address (EN)',
                'is_public' => true,
            ],
            [
                'key' => 'reg_number_bn',
                'value' => 'বিএনপিসি-২০২৪-০০১২৩',
                'group' => 'legal',
                'type' => 'text',
                'label_bn' => 'নিবন্ধন নম্বর (বাংলা)',
                'label_en' => 'Reg Number (BN)',
                'is_public' => true,
            ],
            [
                'key' => 'reg_number_en',
                'value' => 'BNPC-2024-00123',
                'group' => 'legal',
                'type' => 'text',
                'label_bn' => 'নিবন্ধন নম্বর (ইংরেজি)',
                'label_en' => 'Reg Number (EN)',
                'is_public' => true,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
