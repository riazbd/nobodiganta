<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SaradeshArticleSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::where('email', 'editor@nobodigonto.com')->first()
            ?? User::where('role', 'editor_in_chief')->first()
            ?? User::first();

        $cats = Category::all()->keyBy('slug');

        // slug values MUST match bdLocations.js exactly
        $articles = [

            // ══════════════════════════════════════════════════════════════════
            // ঢাকা বিভাগ
            // ══════════════════════════════════════════════════════════════════
            [
                'division' => 'dhaka', 'district' => 'narayanganj', 'upazila' => 'bandar',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'নারায়ণগঞ্জের বন্দরে শ্রমিক অসন্তোষ, গার্মেন্টস কারখানা বন্ধ',
                'title_en' => 'Worker unrest in Bandar, Narayanganj — garments factories shut down',
                'excerpt_bn' => 'বন্দর উপজেলার তিনটি গার্মেন্টস কারখানায় বেতন বৃদ্ধির দাবিতে শ্রমিকরা কর্মবিরতি পালন করছেন।',
                'excerpt_en' => 'Workers in three garment factories in Bandar upazila are on strike demanding salary hikes.',
                'body_bn' => '<p>নারায়ণগঞ্জের বন্দর উপজেলায় তিনটি বড় গার্মেন্টস কারখানায় শ্রমিক অসন্তোষ দেখা দিয়েছে। প্রায় ৪ হাজার শ্রমিক বেতন বৃদ্ধি ও বকেয়া পরিশোধের দাবিতে সোমবার থেকে কর্মবিরতিতে রয়েছেন।</p><h3>শ্রমিকদের দাবি</h3><p>শ্রমিকরা জানান, তিন মাস ধরে ওভারটাইমের টাকা পাচ্ছেন না। পাশাপাশি বেতন বাড়ানোর দাবিও করছেন তারা।</p><p>কারখানা মালিকপক্ষ জানিয়েছে, আলোচনার মাধ্যমে সমস্যার সমাধান করা হবে।</p>',
                'body_en' => '<p>Worker unrest has broken out in three large garment factories in Bandar upazila, Narayanganj. Around 4,000 workers have been on strike since Monday, demanding salary increases and payment of arrears.</p><h3>Workers\' Demands</h3><p>Workers say they have not received overtime pay for three months and are demanding a wage increase.</p>',
                'h' => 10, 'views' => 8400, 'featured' => false, 'breaking' => true,
            ],
            [
                'division' => 'dhaka', 'district' => 'narayanganj', 'upazila' => 'sonargaon',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'সোনারগাঁওয়ে লোকশিল্প উৎসব শুরু, দেশ-বিদেশ থেকে পর্যটকদের ভিড়',
                'title_en' => 'Folk art festival begins in Sonargaon, tourists arrive from home and abroad',
                'excerpt_bn' => 'ঐতিহাসিক সোনারগাঁওয়ে তিন দিনব্যাপী লোকশিল্প মেলা শুরু হয়েছে।',
                'excerpt_en' => 'A three-day folk art fair has begun in historic Sonargaon.',
                'body_bn' => '<p>ঐতিহাসিক নগরী সোনারগাঁওয়ে তিন দিনব্যাপী লোকশিল্প ও কারুশিল্প উৎসব শুরু হয়েছে। দেশের বিভিন্ন প্রান্ত থেকে আসা শিল্পীরা মসলিন, নকশিকাঁথা, মাটির পাত্র ও বাঁশ-বেতের কাজ প্রদর্শন করছেন।</p><p>বাংলাদেশ পর্যটন করপোরেশন জানিয়েছে, উৎসব উপলক্ষে প্রতিদিন গড়ে ১০ হাজার দর্শনার্থী আসছেন।</p>',
                'body_en' => '<p>A three-day folk and handicraft festival has begun in the historic city of Sonargaon. Artists from across the country are displaying muslin, nakshi kantha, earthenware, and bamboo crafts.</p>',
                'h' => 24, 'views' => 12300, 'featured' => true, 'breaking' => false,
            ],
            [
                'division' => 'dhaka', 'district' => 'gazipur', 'upazila' => 'gazipur-sadar',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'গাজীপুরে নতুন শিল্পনগরী স্থাপনে সরকারের অনুমোদন',
                'title_en' => 'Government approves new industrial zone in Gazipur',
                'excerpt_bn' => 'গাজীপুর সদরে পাঁচশো একর জমিতে নতুন বিশেষ অর্থনৈতিক অঞ্চল গড়ে উঠবে।',
                'excerpt_en' => 'A new special economic zone will be built on 500 acres in Gazipur Sadar.',
                'body_bn' => '<p>সরকার গাজীপুর সদর উপজেলায় একটি নতুন বিশেষ অর্থনৈতিক অঞ্চল স্থাপনের অনুমোদন দিয়েছে। ৫০০ একর জমিতে গড়ে ওঠা এই শিল্পনগরীতে প্রায় ৫০টি কারখানা স্থাপন করা যাবে বলে আশা করা হচ্ছে।</p><p>বেজার নির্বাহী চেয়ারম্যান জানান, এই অঞ্চলে ১ লাখেরও বেশি মানুষের কর্মসংস্থান হবে।</p>',
                'body_en' => '<p>The government has approved a new special economic zone in Gazipur Sadar upazila. The industrial park, to be built on 500 acres, is expected to host about 50 factories and create employment for over 100,000 people.</p>',
                'h' => 36, 'views' => 9700, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'dhaka', 'district' => 'gazipur', 'upazila' => 'sreepur',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'শ্রীপুরে ভয়াবহ অগ্নিকাণ্ড, তিনটি গার্মেন্টস ভবন পুড়ে ছাই',
                'title_en' => 'Devastating fire in Sreepur, three garment buildings gutted',
                'excerpt_bn' => 'শ্রীপুরে ভোররাতের আগুনে কোটি টাকার পণ্য ভস্মীভূত হয়েছে।',
                'excerpt_en' => 'A fire in the early hours in Sreepur destroyed goods worth crores of taka.',
                'body_bn' => '<p>গাজীপুরের শ্রীপুরে ভোররাতে ভয়াবহ অগ্নিকাণ্ডে তিনটি গার্মেন্টস ভবন পুড়ে গেছে। ফায়ার সার্ভিসের ছয়টি ইউনিট তিন ঘণ্টা চেষ্টার পর আগুন নিয়ন্ত্রণে আনে।</p><p>প্রাথমিক তদন্তে বৈদ্যুতিক শর্ট সার্কিট থেকে আগুনের সূত্রপাত বলে ধারণা করা হচ্ছে। কোনো হতাহতের খবর পাওয়া যায়নি।</p>',
                'body_en' => '<p>A devastating fire in Sreepur, Gazipur, in the early hours gutted three garment buildings. Six fire service units controlled the blaze after three hours of effort.</p><p>Initial investigation suggests the fire started from an electrical short circuit. No casualties were reported.</p>',
                'h' => 6, 'views' => 16200, 'featured' => false, 'breaking' => true,
            ],
            [
                'division' => 'dhaka', 'district' => 'manikganj', 'upazila' => 'shibalaya',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'মানিকগঞ্জের শিবালয়ে যমুনায় বন্যার পানি বাড়ছে, কৃষকরা উদ্বিগ্ন',
                'title_en' => 'Flood water rising in Jamuna at Shivalaya, Manikganj — farmers worried',
                'excerpt_bn' => 'শিবালয় উপজেলার নদী তীরবর্তী এলাকায় বন্যার পানি প্রবেশ করছে।',
                'excerpt_en' => 'Flood water is entering riverside areas of Shivalaya upazila.',
                'body_bn' => '<p>মানিকগঞ্জের শিবালয় উপজেলায় যমুনা নদীর পানি বিপদসীমার উপর দিয়ে প্রবাহিত হচ্ছে। ১২টি গ্রামে পানি ঢুকে পড়েছে এবং কয়েক হাজার পরিবার পানিবন্দী হয়ে পড়েছে।</p><h3>কৃষির ক্ষতি</h3><p>মাঠের আমন ধান তলিয়ে যাওয়ায় কৃষকরা দিশেহারা। জেলা প্রশাসন ত্রাণ বিতরণ শুরু করেছে।</p>',
                'body_en' => '<p>The Jamuna river in Shivalaya upazila, Manikganj, is flowing above the danger level. Flood water has entered 12 villages and thousands of families are marooned.</p><h3>Agricultural Damage</h3><p>Farmers are distressed as their aman paddy fields go underwater. The district administration has begun distributing relief.</p>',
                'h' => 18, 'views' => 11100, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'dhaka', 'district' => 'tangail', 'upazila' => 'mirzapur',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'টাঙ্গাইলের মির্জাপুরে কুমুদিনী হাসপাতালের শতবর্ষ পালিত',
                'title_en' => 'Kumudini Hospital in Mirzapur, Tangail celebrates centenary',
                'excerpt_bn' => 'দেশের ঐতিহ্যবাহী কুমুদিনী হাসপাতাল শতবর্ষ উদযাপন করছে।',
                'excerpt_en' => 'The historic Kumudini Hospital in Bangladesh celebrates its centennial.',
                'body_bn' => '<p>টাঙ্গাইলের মির্জাপুরে অবস্থিত ঐতিহাসিক কুমুদিনী হাসপাতাল এ বছর তার শতবর্ষ পূর্ণ করল। ১৯৩৮ সালে প্রতিষ্ঠিত এই হাসপাতালটি গ্রামীণ জনগোষ্ঠীর স্বাস্থ্যসেবায় শতাব্দী ধরে অগ্রণী ভূমিকা পালন করে আসছে।</p><p>অনুষ্ঠানে স্বাস্থ্য প্রতিমন্ত্রী ও স্থানীয় সংসদ সদস্য উপস্থিত ছিলেন।</p>',
                'body_en' => '<p>The historic Kumudini Hospital in Mirzapur, Tangail, completed its centenary this year. Founded in 1938, the hospital has played a leading role in providing healthcare to rural communities for a century.</p>',
                'h' => 48, 'views' => 7800, 'featured' => false, 'breaking' => false,
            ],

            // ══════════════════════════════════════════════════════════════════
            // চট্টগ্রাম বিভাগ
            // ══════════════════════════════════════════════════════════════════
            [
                'division' => 'chittagong', 'district' => 'cox-bazar', 'upazila' => 'teknaf',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'টেকনাফে রোহিঙ্গা ক্যাম্পে অগ্নিকাণ্ড, শত পরিবার গৃহহারা',
                'title_en' => 'Fire in Rohingya camp in Teknaf, hundreds of families homeless',
                'excerpt_bn' => 'টেকনাফের রোহিঙ্গা ক্যাম্পে ভয়াবহ আগুনে কয়েকশো ঘর পুড়ে গেছে।',
                'excerpt_en' => 'A devastating fire in a Rohingya camp in Teknaf has burnt down hundreds of shelters.',
                'body_bn' => '<p>কক্সবাজারের টেকনাফ উপজেলায় একটি রোহিঙ্গা শরণার্থী ক্যাম্পে ভয়াবহ অগ্নিকাণ্ডে কয়েকশো পরিবার গৃহহারা হয়ে পড়েছে। মঙ্গলবার বিকেলে আগুন লাগে এবং দ্রুত ছড়িয়ে পড়ে।</p><p>জাতিসংঘের শরণার্থী সংস্থা ইউএনএইচসিআর ও বিভিন্ন এনজিও ত্রাণ কার্যক্রম শুরু করেছে।</p>',
                'body_en' => '<p>A devastating fire in a Rohingya refugee camp in Teknaf upazila, Cox\'s Bazar, has left hundreds of families homeless. The fire broke out Tuesday afternoon and spread rapidly.</p><p>UNHCR and various NGOs have begun relief operations.</p>',
                'h' => 8, 'views' => 19600, 'featured' => true, 'breaking' => true,
            ],
            [
                'division' => 'chittagong', 'district' => 'cox-bazar', 'upazila' => 'maheshkhali',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'মহেশখালীতে এলএনজি টার্মিনাল সম্প্রসারণ কাজ শুরু',
                'title_en' => 'LNG terminal expansion work begins in Maheshkhali',
                'excerpt_bn' => 'দেশের শক্তি নিরাপত্তা নিশ্চিতে মহেশখালীতে নতুন এলএনজি টার্মিনাল স্থাপনের কাজ শুরু।',
                'excerpt_en' => 'Work begins on a new LNG terminal in Maheshkhali to ensure the country\'s energy security.',
                'body_bn' => '<p>কক্সবাজারের মহেশখালীতে দেশের দ্বিতীয় এলএনজি (তরলীকৃত প্রাকৃতিক গ্যাস) টার্মিনাল নির্মাণের কাজ শুরু হয়েছে। পেট্রোবাংলা ও একটি বিদেশি কোম্পানির যৌথ উদ্যোগে এই প্রকল্প বাস্তবায়িত হচ্ছে।</p><p>প্রকল্পটি সম্পন্ন হলে দেশের গ্যাস সংকট অনেকটাই কমবে বলে আশা করা হচ্ছে।</p>',
                'body_en' => '<p>Work has begun on Bangladesh\'s second LNG (liquefied natural gas) terminal in Maheshkhali, Cox\'s Bazar, being implemented jointly by Petrobangla and a foreign company.</p>',
                'h' => 56, 'views' => 8900, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'chittagong', 'district' => 'chittagong', 'upazila' => 'sitakunda',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'সীতাকুণ্ডে শিপব্রেকিং ইয়ার্ডে বিস্ফোরণ, ৫ শ্রমিক আহত',
                'title_en' => 'Explosion at ship-breaking yard in Sitakunda, 5 workers injured',
                'excerpt_bn' => 'সীতাকুণ্ডের শিপব্রেকিং ইয়ার্ডে গ্যাস সিলিন্ডার বিস্ফোরণে পাঁচ শ্রমিক আহত হয়েছেন।',
                'excerpt_en' => 'Five workers were injured in a gas cylinder explosion at a ship-breaking yard in Sitakunda.',
                'body_bn' => '<p>চট্টগ্রামের সীতাকুণ্ড উপজেলার একটি শিপব্রেকিং ইয়ার্ডে গ্যাস সিলিন্ডার বিস্ফোরণে পাঁচ শ্রমিক গুরুতর আহত হয়েছেন। আহতদের চট্টগ্রাম মেডিকেল কলেজ হাসপাতালে ভর্তি করা হয়েছে।</p><p>শ্রম পরিদপ্তর ঘটনার তদন্ত শুরু করেছে।</p>',
                'body_en' => '<p>Five workers were seriously injured in a gas cylinder explosion at a ship-breaking yard in Sitakunda upazila, Chittagong. The injured were admitted to Chittagong Medical College Hospital.</p>',
                'h' => 12, 'views' => 13400, 'featured' => false, 'breaking' => true,
            ],
            [
                'division' => 'chittagong', 'district' => 'comilla', 'upazila' => 'comilla-sadar',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'কুমিল্লায় ময়নামতি প্রত্নতাত্ত্বিক স্থানে নতুন খনন, বৌদ্ধ স্থাপত্যের সন্ধান',
                'title_en' => 'New excavation at Mainamati archaeological site in Comilla reveals Buddhist architecture',
                'excerpt_bn' => 'ময়নামতিতে নতুন খননে সপ্তম শতাব্দীর বৌদ্ধ মন্দিরের অবশেষ পাওয়া গেছে।',
                'excerpt_en' => 'New excavations at Mainamati have uncovered remains of a 7th-century Buddhist temple.',
                'body_bn' => '<p>কুমিল্লা সদরের ময়নামতি প্রত্নতাত্ত্বিক এলাকায় নতুন খননে সপ্তম শতাব্দীর একটি বৌদ্ধ মন্দিরের অবশেষ আবিষ্কৃত হয়েছে। বাংলাদেশ প্রত্নতত্ত্ব অধিদপ্তরের একটি দল এই খনন কাজ পরিচালনা করছে।</p><p>আবিষ্কৃত নিদর্শনগুলো ময়নামতি জাদুঘরে সংরক্ষণ করা হবে।</p>',
                'body_en' => '<p>New excavations at the Mainamati archaeological site in Comilla Sadar have uncovered remains of a 7th-century Buddhist temple. A team from the Bangladesh Department of Archaeology is leading the excavation.</p>',
                'h' => 72, 'views' => 7200, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'chittagong', 'district' => 'feni', 'upazila' => 'sonagazi',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'ফেনীর সোনাগাজীতে মুহুরী সেচ প্রকল্প সংস্কার কাজ শেষ',
                'title_en' => 'Muhuri irrigation project renovation completed in Sonagazi, Feni',
                'excerpt_bn' => 'মুহুরী সেচ প্রকল্পের সংস্কার কাজ শেষ হওয়ায় কৃষকরা উপকৃত হবেন।',
                'excerpt_en' => 'Farmers will benefit as renovation of the Muhuri irrigation project is completed.',
                'body_bn' => '<p>ফেনীর সোনাগাজী উপজেলায় মুহুরী সেচ প্রকল্পের দীর্ঘ প্রতীক্ষিত সংস্কার কাজ শেষ হয়েছে। নতুন সংস্কারের ফলে আরও ১৫ হাজার হেক্টর জমিতে সেচ সুবিধা পাওয়া যাবে।</p><p>স্থানীয় কৃষকরা এই উন্নয়নকে স্বাগত জানিয়েছেন।</p>',
                'body_en' => '<p>The long-awaited renovation of the Muhuri Irrigation Project in Sonagazi upazila, Feni, has been completed. The renovation will extend irrigation facilities to an additional 15,000 hectares of land.</p>',
                'h' => 96, 'views' => 6100, 'featured' => false, 'breaking' => false,
            ],

            // ══════════════════════════════════════════════════════════════════
            // রাজশাহী বিভাগ
            // ══════════════════════════════════════════════════════════════════
            [
                'division' => 'rajshahi', 'district' => 'rajshahi', 'upazila' => 'godagari',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'রাজশাহীর গোদাগাড়ীতে পদ্মার ভাঙনে ৫০টি পরিবার উচ্ছেদ',
                'title_en' => 'River erosion by Padma in Godagari, Rajshahi displaces 50 families',
                'excerpt_bn' => 'গোদাগাড়ীতে পদ্মার তীব্র ভাঙনে ঘরবাড়ি ও ফসলি জমি নদীগর্ভে বিলীন হচ্ছে।',
                'excerpt_en' => 'Homes and farmland in Godagari are being swallowed by the Padma river.',
                'body_bn' => '<p>রাজশাহীর গোদাগাড়ী উপজেলায় পদ্মা নদীর তীব্র ভাঙনে কমপক্ষে ৫০টি পরিবার তাদের বাড়িঘর হারিয়েছে। গত দুই সপ্তাহে প্রায় ৩০ একর ফসলি জমি নদীগর্ভে চলে গেছে।</p><p>পানি উন্নয়ন বোর্ড জানিয়েছে, জিও-ব্যাগ ফেলে ভাঙন রোধের চেষ্টা চলছে।</p>',
                'body_en' => '<p>At least 50 families have lost their homes to severe Padma river erosion in Godagari upazila, Rajshahi. Around 30 acres of farmland has been swallowed by the river in the past two weeks.</p>',
                'h' => 20, 'views' => 10300, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'rajshahi', 'district' => 'chapainawabganj', 'upazila' => 'shibganj-chapai',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'চাঁপাইনবাবগঞ্জের শিবগঞ্জে আমের বাম্পার ফলন, বাগান মালিকদের মুখে হাসি',
                'title_en' => 'Bumper mango crop in Shibganj, Chapainawabganj — orchard owners delighted',
                'excerpt_bn' => 'এবার অনুকূল আবহাওয়ায় আমের বাম্পার ফলন হওয়ায় কৃষকরা লাভবান হচ্ছেন।',
                'excerpt_en' => 'Farmers are profiting from a bumper mango harvest thanks to favourable weather this season.',
                'body_bn' => '<p>চাঁপাইনবাবগঞ্জের শিবগঞ্জ উপজেলায় এবার আমের রেকর্ড ফলন হয়েছে। হিমসাগর, ল্যাংড়া ও ফজলি আমের ভালো উৎপাদনে বাগান মালিকরা খুশি।</p><p>স্থানীয় আড়তে প্রতি মণ আম ৮০০ থেকে ১২০০ টাকায় বিক্রি হচ্ছে, যা কৃষকদের লাভজনক মূল্য।</p>',
                'body_en' => '<p>Shibganj upazila in Chapainawabganj has seen a record mango harvest this year. Orchard owners are pleased with good yields of Himsagar, Langra, and Fazli varieties.</p>',
                'h' => 60, 'views' => 9100, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'rajshahi', 'district' => 'bogura', 'upazila' => 'bogura-sadar',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'বগুড়ায় ঐতিহাসিক মহাস্থানগড়ে নতুন পর্যটন কেন্দ্র উদ্বোধন',
                'title_en' => 'New tourism centre inaugurated at historic Mahasthangarh in Bogura',
                'excerpt_bn' => 'উপমহাদেশের প্রাচীনতম শহর মহাস্থানগড়ে আধুনিক পর্যটন সুবিধা চালু হল।',
                'excerpt_en' => 'Modern tourist facilities open at Mahasthangarh, one of the oldest cities in the subcontinent.',
                'body_bn' => '<p>বগুড়া সদরের কাছে অবস্থিত ঐতিহাসিক মহাস্থানগড়ে একটি আধুনিক পর্যটন কেন্দ্র উদ্বোধন করা হয়েছে। নতুন কেন্দ্রে মিউজিয়াম, ক্যাফেটেরিয়া এবং গাইডেড ট্যুর সুবিধা রয়েছে।</p><p>প্রত্নতত্ত্ব অধিদপ্তর জানিয়েছে, এই উন্নয়নে পর্যটক সংখ্যা তিনগুণ বাড়বে বলে আশা করা হচ্ছে।</p>',
                'body_en' => '<p>A modern tourism centre has been inaugurated at the historic Mahasthangarh near Bogura Sadar. The new centre includes a museum, cafeteria, and guided tour facilities.</p>',
                'h' => 84, 'views' => 7600, 'featured' => false, 'breaking' => false,
            ],

            // ══════════════════════════════════════════════════════════════════
            // খুলনা বিভাগ
            // ══════════════════════════════════════════════════════════════════
            [
                'division' => 'khulna', 'district' => 'bagerhat', 'upazila' => 'mongla',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'মোংলা বন্দরে পণ্য আমদানি-রপ্তানিতে নতুন রেকর্ড',
                'title_en' => 'Mongla port sets new record for import-export cargo',
                'excerpt_bn' => 'মোংলা বন্দর এ বছর ইতিহাসে প্রথমবারের মতো ১ হাজার কোটি টাকার রাজস্ব অর্জন করেছে।',
                'excerpt_en' => 'Mongla port has for the first time earned Tk 1,000 crore in revenue this year.',
                'body_bn' => '<p>মোংলা বন্দরে এ বছর পণ্য আমদানি-রপ্তানিতে নতুন রেকর্ড স্থাপিত হয়েছে। এই অর্থবছরে বন্দর দিয়ে ১ কোটি ৫০ লাখ টন পণ্য পরিবহন হয়েছে।</p><p>পদ্মা সেতু চালুর পর মোংলা বন্দরের ব্যবহার উল্লেখযোগ্যভাবে বেড়েছে বলে বন্দর কর্তৃপক্ষ জানিয়েছে।</p>',
                'body_en' => '<p>Mongla Port has set new records in import-export cargo this year, handling 15 million tonnes of goods. Port authorities say Mongla\'s traffic has increased significantly since the Padma Bridge opened.</p>',
                'h' => 40, 'views' => 10800, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'khulna', 'district' => 'bagerhat', 'upazila' => 'sarankhola',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'সুন্দরবনের শরণখোলায় বাঘের আক্রমণে জেলে নিখোঁজ',
                'title_en' => 'Fisherman missing after tiger attack in Sharankhola, Sundarbans',
                'excerpt_bn' => 'সুন্দরবনে মাছ ধরতে গিয়ে বাঘের আক্রমণের শিকার হন এক জেলে।',
                'excerpt_en' => 'A fisherman was attacked by a tiger while fishing in the Sundarbans.',
                'body_bn' => '<p>সুন্দরবন সংলগ্ন বাগেরহাটের শরণখোলা উপজেলায় মাছ ধরতে গিয়ে বাঘের আক্রমণে একজন জেলে নিখোঁজ হয়েছেন। বন বিভাগ ও কোস্ট গার্ড উদ্ধার অভিযান পরিচালনা করছে।</p><p>স্থানীয়রা জানান, প্রতি বছর সুন্দরবনে কয়েকজন জেলে বাঘের হামলার শিকার হন।</p>',
                'body_en' => '<p>A fisherman has gone missing after a tiger attack in Sharankhola upazila, Bagerhat, near the Sundarbans. Forest department and Coast Guard are conducting search and rescue operations.</p>',
                'h' => 14, 'views' => 15700, 'featured' => true, 'breaking' => false,
            ],
            [
                'division' => 'khulna', 'district' => 'jessore', 'upazila' => 'jhikargachha',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'যশোরের ঝিকরগাছায় গোলাপ চাষে সফল তরুণ উদ্যোক্তা',
                'title_en' => 'Young entrepreneur succeeds in rose cultivation in Jhikargachha, Jessore',
                'excerpt_bn' => 'ঝিকরগাছায় বাণিজ্যিক গোলাপ চাষ করে কোটিপতি হয়েছেন তরুণ উদ্যোক্তা রফিকুল।',
                'excerpt_en' => 'Young entrepreneur Rafiqul has become a millionaire through commercial rose cultivation in Jhikargachha.',
                'body_bn' => '<p>যশোরের ঝিকরগাছা উপজেলায় বাণিজ্যিকভাবে গোলাপ চাষ করে সাফল্য পেয়েছেন তরুণ উদ্যোক্তা রফিকুল ইসলাম। তিন বছর আগে মাত্র ২ বিঘা জমি দিয়ে শুরু করে এখন তিনি ৪০ বিঘা জমিতে গোলাপ চাষ করছেন।</p><p>ঢাকাসহ বিভিন্ন শহরে তার গোলাপ রপ্তানি হচ্ছে। বার্ষিক আয় এখন প্রায় ৫০ লাখ টাকা।</p>',
                'body_en' => '<p>Young entrepreneur Rafiqul Islam has found success in commercial rose cultivation in Jhikargachha upazila, Jessore. He started with just 2 bighas three years ago and now cultivates roses on 40 bighas, earning around Tk 50 lakh annually.</p>',
                'h' => 108, 'views' => 8300, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'khulna', 'district' => 'satkhira', 'upazila' => 'shyamnagar',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'সাতক্ষীরার শ্যামনগরে ঘূর্ণিঝড়ের ক্ষয়ক্ষতি পুনর্বাসনে বিলম্ব',
                'title_en' => 'Cyclone rehabilitation slow in Shyamnagar, Satkhira',
                'excerpt_bn' => 'ঘূর্ণিঝড়ে ক্ষতিগ্রস্ত শ্যামনগরের পরিবারগুলো এখনও সরকারি সহায়তার অপেক্ষায়।',
                'excerpt_en' => 'Cyclone-affected families in Shyamnagar are still awaiting government assistance.',
                'body_bn' => '<p>সাতক্ষীরার শ্যামনগর উপজেলায় গত ঘূর্ণিঝড়ে ক্ষতিগ্রস্ত হাজার হাজার পরিবার এখনও পুনর্বাসনের অপেক্ষায় রয়েছেন। ঘূর্ণিঝড়ের দুই মাস পরেও অনেকে ভাঙা ঘরে বাস করছেন।</p><p>জেলা ত্রাণ কর্মকর্তা জানান, বরাদ্দের অর্থ মাঠ পর্যায়ে পৌঁছানো এখনও সম্পন্ন হয়নি।</p>',
                'body_en' => '<p>Thousands of families in Shyamnagar upazila, Satkhira, are still waiting for rehabilitation two months after the last cyclone. The district relief officer says disbursement of allocated funds at the field level is still incomplete.</p>',
                'h' => 32, 'views' => 9900, 'featured' => false, 'breaking' => false,
            ],

            // ══════════════════════════════════════════════════════════════════
            // বরিশাল বিভাগ
            // ══════════════════════════════════════════════════════════════════
            [
                'division' => 'barishal', 'district' => 'bhola', 'upazila' => 'charfasson',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'ভোলার চরফ্যাশনে মেঘনার ভাঙনে বিদ্যালয় বিলীন, পাঠদান বন্ধ',
                'title_en' => 'Meghna erosion wipes out school in Charfasson, Bhola — classes suspended',
                'excerpt_bn' => 'মেঘনার তীব্র ভাঙনে চরফ্যাশনের একটি সরকারি প্রাথমিক বিদ্যালয় নদীতে বিলীন হয়ে গেছে।',
                'excerpt_en' => 'Severe Meghna erosion has swallowed a government primary school in Charfasson.',
                'body_bn' => '<p>ভোলার চরফ্যাশন উপজেলায় মেঘনা নদীর তীব্র ভাঙনে একটি সরকারি প্রাথমিক বিদ্যালয় নদীগর্ভে চলে গেছে। বিদ্যালয়টিতে প্রায় ৩৫০ শিক্ষার্থী পড়ত।</p><p>জেলা প্রাথমিক শিক্ষা অফিস অস্থায়ী ব্যবস্থায় পাঠদান চালু রাখার উদ্যোগ নিয়েছে।</p>',
                'body_en' => '<p>A government primary school in Charfasson upazila, Bhola, has been swallowed by the Meghna river due to severe erosion. The school had around 350 students.</p>',
                'h' => 22, 'views' => 11500, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'barishal', 'district' => 'barishal', 'upazila' => 'wazirpur',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'বরিশালের উজিরপুরে নৌকা বাইচে উৎসবের আমেজ',
                'title_en' => 'Boat race in Wazirpur, Barishal creates festive atmosphere',
                'excerpt_bn' => 'উজিরপুরে বার্ষিক নৌকা বাইচ উৎসবে হাজার হাজার দর্শনার্থীর ভিড় জমেছে।',
                'excerpt_en' => 'Thousands of spectators have gathered for the annual boat race festival in Wazirpur.',
                'body_bn' => '<p>বরিশালের উজিরপুর উপজেলায় বার্ষিক নৌকা বাইচ প্রতিযোগিতা অনুষ্ঠিত হয়েছে। কীর্তনখোলা নদীতে ৫০টি নৌকা প্রতিযোগিতায় অংশ নিয়েছে।</p><p>এই বছর প্রতিযোগিতায় প্রথম স্থান অধিকার করেছে মুলাদীর "সোনার তরী" নৌকাটি।</p>',
                'body_en' => '<p>The annual boat race competition was held in Wazirpur upazila, Barishal. Fifty boats competed on the Kirtankhola river. This year\'s winner was the "Sonar Tori" boat from Muladi.</p>',
                'h' => 120, 'views' => 13200, 'featured' => true, 'breaking' => false,
            ],
            [
                'division' => 'barishal', 'district' => 'patuakhali', 'upazila' => 'kalapara',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'পটুয়াখালীর কলাপাড়ায় পায়রা বন্দরের কার্যক্রম পূর্ণগতিতে চলছে',
                'title_en' => 'Payra port in Kalapara, Patuakhali running at full capacity',
                'excerpt_bn' => 'পায়রা সমুদ্রবন্দর পূর্ণ কার্যক্ষমতায় চলায় দক্ষিণাঞ্চলের অর্থনীতিতে নতুন গতি এসেছে।',
                'excerpt_en' => 'Payra seaport\'s full operation is giving new momentum to the southern region\'s economy.',
                'body_bn' => '<p>পটুয়াখালীর কলাপাড়ায় অবস্থিত পায়রা সমুদ্রবন্দর এখন পূর্ণ সক্ষমতায় কার্যক্রম পরিচালনা করছে। এ বছর বন্দরে ৩০০টিরও বেশি বিদেশি জাহাজ নোঙর করেছে।</p><p>পদ্মা সেতুর কারণে এখন ঢাকার সাথে সরাসরি সড়ক যোগাযোগ থাকায় বন্দরের ব্যবহার আরও বেড়েছে।</p>',
                'body_en' => '<p>The Payra seaport in Kalapara, Patuakhali, is now operating at full capacity. More than 300 foreign ships have anchored at the port this year. Direct road connectivity to Dhaka via the Padma Bridge has further boosted traffic.</p>',
                'h' => 72, 'views' => 8700, 'featured' => false, 'breaking' => false,
            ],

            // ══════════════════════════════════════════════════════════════════
            // সিলেট বিভাগ
            // ══════════════════════════════════════════════════════════════════
            [
                'division' => 'sylhet', 'district' => 'sylhet', 'upazila' => 'gowainghat',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'সিলেটের গোয়াইনঘাটে জাফলং-এ পর্যটকের রেকর্ড ভিড়',
                'title_en' => 'Record tourist crowd at Jaflong in Gowainghat, Sylhet',
                'excerpt_bn' => 'ঈদের ছুটিতে জাফলংয়ে অভূতপূর্ব পর্যটক সমাগম, ভ্রমণকারীরা উপভোগ করছেন।',
                'excerpt_en' => 'Unprecedented tourist footfall at Jaflong during Eid holidays.',
                'body_bn' => '<p>সিলেটের গোয়াইনঘাট উপজেলায় অবস্থিত জাফলংয়ে এবারের ঈদের ছুটিতে রেকর্ড সংখ্যক পর্যটক এসেছেন। স্থানীয় প্রশাসন জানায়, শুধু ঈদের দিনেই ৩০ হাজারের বেশি পর্যটক জাফলং ভ্রমণ করেছেন।</p><p>স্বচ্ছ পানি, পাথরের সৌন্দর্য আর মেঘালয়ের পাহাড়ের সমন্বয়ে জাফলং দেশের অন্যতম সেরা পর্যটন গন্তব্য।</p>',
                'body_en' => '<p>Jaflong in Gowainghat upazila, Sylhet, saw a record number of tourists during this Eid holiday. Local administration says over 30,000 tourists visited Jaflong on Eid day alone.</p>',
                'h' => 30, 'views' => 18900, 'featured' => true, 'breaking' => false,
            ],
            [
                'division' => 'sylhet', 'district' => 'sunamganj', 'upazila' => 'tahirpur',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'সুনামগঞ্জের তাহিরপুরে টাঙ্গুয়ার হাওরে অবৈধ মাছ শিকার বন্ধে অভিযান',
                'title_en' => 'Drive against illegal fishing in Tanguar Haor in Tahirpur, Sunamganj',
                'excerpt_bn' => 'রামসার সাইট টাঙ্গুয়ার হাওরে অবৈধ মাছ শিকারিদের বিরুদ্ধে যৌথ অভিযান শুরু।',
                'excerpt_en' => 'Joint operation launched against illegal fishermen at the Ramsar site Tanguar Haor.',
                'body_bn' => '<p>সুনামগঞ্জের তাহিরপুর উপজেলায় বিশ্বখ্যাত রামসার সাইট টাঙ্গুয়ার হাওরে অবৈধ মাছ শিকার বন্ধে যৌথ অভিযান শুরু হয়েছে। মৎস্য বিভাগ, কোস্ট গার্ড ও পুলিশ একযোগে এই অভিযান পরিচালনা করছে।</p><p>প্রথম দিনেই ২০টি অবৈধ নৌকা জব্দ ও ৩০ জন মাছ শিকারিকে আটক করা হয়েছে।</p>',
                'body_en' => '<p>A joint operation has begun against illegal fishing in Tanguar Haor, the famous Ramsar site in Tahirpur upazila, Sunamganj. Fisheries, Coast Guard, and police are conducting the crackdown jointly.</p>',
                'h' => 44, 'views' => 7400, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'sylhet', 'district' => 'moulvibazar', 'upazila' => 'sreemangal',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'শ্রীমঙ্গলে চা উৎপাদনে রেকর্ড, প্রথমবার ১০ কোটি কেজি ছাড়াল',
                'title_en' => 'Tea production in Sreemangal breaks record, crosses 100 million kg for first time',
                'excerpt_bn' => 'এবার চায়ের রাজধানীতে চা উৎপাদন ইতিহাসের সর্বোচ্চ পর্যায়ে পৌঁছেছে।',
                'excerpt_en' => 'Tea production in the tea capital has reached an all-time high this season.',
                'body_bn' => '<p>মৌলভীবাজারের শ্রীমঙ্গল উপজেলায় এ বছর চা উৎপাদনে নতুন রেকর্ড হয়েছে। প্রথমবারের মতো দেশে ১০ কোটি কেজির বেশি চা উৎপাদিত হয়েছে।</p><p>চা বোর্ড জানিয়েছে, অনুকূল আবহাওয়া ও আধুনিক চাষাবাদ পদ্ধতি ব্যবহারের কারণে এই সাফল্য সম্ভব হয়েছে।</p>',
                'body_en' => '<p>Tea production in Sreemangal upazila, Moulvibazar, has broken all records this year, crossing 100 million kilograms for the first time. The Tea Board attributes this to favorable weather and modern cultivation methods.</p>',
                'h' => 66, 'views' => 9200, 'featured' => false, 'breaking' => false,
            ],

            // ══════════════════════════════════════════════════════════════════
            // রংপুর বিভাগ
            // ══════════════════════════════════════════════════════════════════
            [
                'division' => 'rangpur', 'district' => 'kurigram', 'upazila' => 'ulipur',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'কুড়িগ্রামের উলিপুরে ব্রহ্মপুত্রের ভাঙনে শতাধিক পরিবার গৃহহারা',
                'title_en' => 'Over 100 families homeless as Brahmaputra erodes Ulipur, Kurigram',
                'excerpt_bn' => 'ব্রহ্মপুত্রের ভাঙনে উলিপুরের চর এলাকার শতাধিক পরিবার বাস্তুহারা হয়েছে।',
                'excerpt_en' => 'Over 100 families in char areas of Ulipur have been displaced by Brahmaputra erosion.',
                'body_bn' => '<p>কুড়িগ্রামের উলিপুর উপজেলায় ব্রহ্মপুত্র নদের তীব্র ভাঙনে শতাধিক পরিবার বাস্তুহারা হয়ে পড়েছে। গত এক সপ্তাহে প্রায় ৫০ একর জমি নদীতে বিলীন হয়েছে।</p><p>পানি উন্নয়ন বোর্ড জানিয়েছে, ব্লক ফেলে ভাঙন রোধের কাজ চলছে।</p>',
                'body_en' => '<p>More than 100 families have been displaced by severe Brahmaputra river erosion in Ulipur upazila, Kurigram. Around 50 acres of land has been lost to the river in the past week.</p>',
                'h' => 16, 'views' => 11700, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'rangpur', 'district' => 'dinajpur', 'upazila' => 'parbatipur',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'দিনাজপুরের পার্বতীপুরে কয়লাখনিতে দুর্ঘটনা, একজন শ্রমিক নিখোঁজ',
                'title_en' => 'Accident at coal mine in Parbatipur, Dinajpur — one worker missing',
                'excerpt_bn' => 'বড়পুকুরিয়া কয়লাখনিতে দুর্ঘটনায় একজন শ্রমিক নিখোঁজ।',
                'excerpt_en' => 'One worker is missing after an accident at Barapukuria Coal Mine.',
                'body_bn' => '<p>দিনাজপুরের পার্বতীপুর উপজেলায় বড়পুকুরিয়া কয়লাখনিতে দুর্ঘটনায় একজন শ্রমিক নিখোঁজ হয়েছেন। খনির অভ্যন্তরে পাথর ধসে এই দুর্ঘটনা ঘটে বলে কর্তৃপক্ষ জানিয়েছে।</p><p>উদ্ধার অভিযান শুরু হয়েছে।</p>',
                'body_en' => '<p>One worker is missing after a rockfall accident at Barapukuria Coal Mine in Parbatipur upazila, Dinajpur. Rescue operations are underway.</p>',
                'h' => 6, 'views' => 14100, 'featured' => false, 'breaking' => true,
            ],
            [
                'division' => 'rangpur', 'district' => 'gaibandha', 'upazila' => 'gobindaganj',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'গাইবান্ধার গোবিন্দগঞ্জে আখ চাষিরা ন্যায্যমূল্য পাচ্ছেন না, ক্ষুব্ধ কৃষকরা',
                'title_en' => 'Sugarcane farmers in Gobindaganj, Gaibandha not getting fair prices — anger grows',
                'excerpt_bn' => 'গোবিন্দগঞ্জের আখ চাষিরা মিল কর্তৃপক্ষের বিরুদ্ধে কম দাম দেওয়ার অভিযোগ করছেন।',
                'excerpt_en' => 'Sugarcane farmers in Gobindaganj are accusing mill authorities of paying below fair prices.',
                'body_bn' => '<p>গাইবান্ধার গোবিন্দগঞ্জ উপজেলার আখ চাষিরা সরকার নির্ধারিত মূল্যের চেয়ে কম দামে আখ বিক্রি করতে বাধ্য হচ্ছেন বলে অভিযোগ করেছেন। স্থানীয় চিনিকল কর্তৃপক্ষ প্রতি মণ আখে নির্ধারিত দামের চেয়ে ৫০ টাকা কম দিচ্ছে।</p><p>কৃষকরা জেলা প্রশাসকের কাছে অভিযোগ দিয়েছেন।</p>',
                'body_en' => '<p>Sugarcane farmers in Gobindaganj upazila, Gaibandha, complain they are being forced to sell cane at below the government-set price. Local sugar mill authorities are paying Tk 50 less per maund than the fixed rate.</p>',
                'h' => 52, 'views' => 7800, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'rangpur', 'district' => 'nilphamari', 'upazila' => 'saidpur',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'নীলফামারীর সৈয়দপুরে বিমানবন্দর সম্প্রসারণ কাজ শুরু',
                'title_en' => 'Airport expansion work begins in Saidpur, Nilphamari',
                'excerpt_bn' => 'সৈয়দপুর বিমানবন্দরকে আন্তর্জাতিক বিমানবন্দরে উন্নীত করার কাজ শুরু হয়েছে।',
                'excerpt_en' => 'Work to upgrade Saidpur Airport to an international airport has begun.',
                'body_bn' => '<p>নীলফামারীর সৈয়দপুর বিমানবন্দরকে আন্তর্জাতিক মানে উন্নীত করার কাজ আনুষ্ঠানিকভাবে শুরু হয়েছে। নতুন টার্মিনাল ভবন ও রানওয়ে সম্প্রসারণের কাজ তিন বছরের মধ্যে সম্পন্ন হবে।</p><p>এই উন্নয়ন উত্তরাঞ্চলের পর্যটন ও ব্যবসা বাণিজ্যে নতুন গতি দেবে বলে আশা করা হচ্ছে।</p>',
                'body_en' => '<p>Work to upgrade Saidpur Airport in Nilphamari to international standard has officially begun. Construction of a new terminal and runway extension is to be completed within three years.</p>',
                'h' => 78, 'views' => 10200, 'featured' => false, 'breaking' => false,
            ],

            // ══════════════════════════════════════════════════════════════════
            // ময়মনসিংহ বিভাগ
            // ══════════════════════════════════════════════════════════════════
            [
                'division' => 'mymensingh', 'district' => 'mymensingh', 'upazila' => 'trishal',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'ময়মনসিংহের ত্রিশালে জাতীয় কবি কাজী নজরুলের জন্মজয়ন্তী পালিত',
                'title_en' => 'National poet Kazi Nazrul\'s birth anniversary celebrated in Trishal, Mymensingh',
                'excerpt_bn' => 'ত্রিশালে জাতীয় কবির জন্মজয়ন্তীতে বর্ণাঢ্য অনুষ্ঠানের আয়োজন।',
                'excerpt_en' => 'A colourful programme marks the birth anniversary of the national poet in Trishal.',
                'body_bn' => '<p>ময়মনসিংহের ত্রিশাল উপজেলায় জাতীয় কবি কাজী নজরুল ইসলামের ১২৫তম জন্মজয়ন্তী বর্ণাঢ্যভাবে পালিত হয়েছে। ত্রিশালে নজরুল কিশোর বয়সে বসবাস করেছিলেন। সে স্মৃতিতে এখানে নজরুল স্মৃতি কেন্দ্র প্রতিষ্ঠিত হয়েছে।</p><p>সারাদেশ থেকে নজরুল প্রেমী ও সাহিত্যানুরাগীরা এ অনুষ্ঠানে যোগ দেন।</p>',
                'body_en' => '<p>The 125th birth anniversary of national poet Kazi Nazrul Islam was celebrated with great fanfare in Trishal upazila, Mymensingh, where Nazrul spent part of his youth. The Nazrul Memorial Centre here drew lovers of literature from across the country.</p>',
                'h' => 90, 'views' => 12400, 'featured' => true, 'breaking' => false,
            ],
            [
                'division' => 'mymensingh', 'district' => 'jamalpur', 'upazila' => 'islampur',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'জামালপুরের ইসলামপুরে যমুনার ভাঙনে কয়েকশো একর জমি বিলীন',
                'title_en' => 'Hundreds of acres of land lost to Jamuna erosion in Islampur, Jamalpur',
                'excerpt_bn' => 'ইসলামপুরে যমুনার ভাঙনে কৃষি জমি ও বসতভিটা হারাচ্ছেন স্থানীয়রা।',
                'excerpt_en' => 'Locals in Islampur are losing farmland and homesteads to Jamuna erosion.',
                'body_bn' => '<p>জামালপুরের ইসলামপুর উপজেলায় যমুনা নদীর ভাঙনে প্রতিদিন কৃষি জমি নদীগর্ভে বিলীন হচ্ছে। এ বছর ইতিমধ্যে ৩০০ একরের বেশি জমি নদীতে চলে গেছে।</p><p>ক্ষতিগ্রস্তরা সরকারি সহায়তার দাবি জানিয়েছেন।</p>',
                'body_en' => '<p>Agricultural land is disappearing into the Jamuna river daily in Islampur upazila, Jamalpur. More than 300 acres of land have been lost to the river this year.</p>',
                'h' => 26, 'views' => 9600, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'mymensingh', 'district' => 'netrokona', 'upazila' => 'durgapur-netrokona',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'নেত্রকোণার দুর্গাপুরে বিরিশিরি আদিবাসী সাংস্কৃতিক উৎসব অনুষ্ঠিত',
                'title_en' => 'Birishiri indigenous cultural festival held in Durgapur, Netrokona',
                'excerpt_bn' => 'গারো ও হাজং সম্প্রদায়ের ঐতিহ্যবাহী সংস্কৃতি উদযাপনে মিলেছে হাজারো মানুষ।',
                'excerpt_en' => 'Thousands gathered to celebrate the cultural heritage of Garo and Hajong communities.',
                'body_bn' => '<p>নেত্রকোণার দুর্গাপুর উপজেলায় বিরিশিরিতে তিন দিনব্যাপী আদিবাসী সাংস্কৃতিক উৎসব সমাপ্ত হয়েছে। গারো, হাজং, কোচ ও অন্যান্য আদিবাসী সম্প্রদায়ের ঐতিহ্যবাহী নৃত্য, সঙ্গীত ও হস্তশিল্প প্রদর্শিত হয়েছে।</p><p>দেশ-বিদেশ থেকে পর্যটক ও গবেষকরা এই উৎসবে অংশ নেন।</p>',
                'body_en' => '<p>A three-day indigenous cultural festival concluded in Birishiri, Durgapur upazila, Netrokona. Traditional dances, music, and crafts of Garo, Hajong, Koch, and other indigenous communities were displayed.</p>',
                'h' => 100, 'views' => 8100, 'featured' => false, 'breaking' => false,
            ],
            [
                'division' => 'mymensingh', 'district' => 'sherpur', 'upazila' => 'nalitabari',
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'শেরপুরের নালিতাবাড়ীতে হাতির দলের আক্রমণে ফসল বিনষ্ট',
                'title_en' => 'Elephant herd destroys crops in Nalitabari, Sherpur',
                'excerpt_bn' => 'ভারত থেকে আসা হাতির দল নালিতাবাড়ীর ফসলি জমিতে হামলা চালিয়েছে।',
                'excerpt_en' => 'An elephant herd from India has attacked cropland in Nalitabari.',
                'body_bn' => '<p>শেরপুরের নালিতাবাড়ী উপজেলায় ভারত থেকে আসা বুনো হাতির দল কৃষকদের ফসলি জমিতে হামলা চালিয়েছে। প্রায় ৩০টি হাতির দল রাতের আঁধারে গ্রামে ঢুকে ধান, কলা ও সবজি ক্ষেত বিনষ্ট করেছে।</p><p>বন বিভাগ হাতি তাড়াতে বনরক্ষীদের পাঠিয়েছে।</p>',
                'body_en' => '<p>A herd of wild elephants from India raided farmland in Nalitabari upazila, Sherpur. A group of around 30 elephants entered villages at night and destroyed rice, banana, and vegetable fields.</p>',
                'h' => 18, 'views' => 16300, 'featured' => false, 'breaking' => false,
            ],
        ];

        $cat = $cats['bangladesh'] ?? $cats->first();
        $subCat = $cats['countrywide'] ?? null;

        foreach ($articles as $idx => $item) {
            $slugBase = Str::slug($item['title_bn']);
            $slug = $slugBase . '-sd' . ($idx + 1);

            if (Article::where('slug_bn', $slug)->exists()) continue;

            $a = Article::create([
                'author_id'      => $author->id,
                'category_id'    => $cat->id,
                'title_bn'       => $item['title_bn'],
                'title_en'       => $item['title_en'] ?? null,
                'slug_bn'        => $slug,
                'slug_en'        => $item['title_en'] ? Str::slug($item['title_en']) . '-sd' . ($idx + 1) : null,
                'excerpt_bn'     => $item['excerpt_bn'],
                'excerpt_en'     => $item['excerpt_en'] ?? null,
                'body_bn'        => $item['body_bn'],
                'body_en'        => $item['body_en'] ?? null,
                'edition'        => $item['title_en'] ? 'both' : 'bn',
                'status'         => 'published',
                'is_featured'    => $item['featured'],
                'is_breaking'    => $item['breaking'],
                'views'          => $item['views'],
                'allow_comments' => true,
                'published_at'   => now()->subHours($item['h']),
                'featured_image' => 'https://picsum.photos/seed/sd' . ($idx + 1) . '/800/500',
                'division'       => $item['division'],
                'district'       => $item['district'],
                'upazila'        => $item['upazila'],
            ]);

            $a->categories()->syncWithoutDetaching([
                $cat->id => ['is_primary' => true, 'sort_order' => 0],
            ]);

            if ($subCat) {
                $a->categories()->syncWithoutDetaching([
                    $subCat->id => ['is_primary' => false, 'sort_order' => 1],
                ]);
            }
        }

        $this->command->info('✅ ' . count($articles) . ' saradesh location articles seeded.');
    }
}
