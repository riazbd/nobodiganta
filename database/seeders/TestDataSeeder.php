<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\Models\Reporter;
use App\Models\LiveBlogUpdate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::where('email', 'editor@nobodigonto.com')->first() ?: User::create([
            'name'     => 'Rahim Ahmed',
            'email'    => 'editor@nobodigonto.com',
            'password' => Hash::make('password123'),
            'role'     => 'editor_in_chief',
        ]);

        $reporters = Reporter::all();

        // ── Tags ──────────────────────────────────────────────────────────────
        $tagMap = [];
        $tagsData = [
            ['name_bn' => 'সাইবার নিরাপত্তা',   'name_en' => 'Cyber Security',     'slug' => 'cyber-security'],
            ['name_bn' => 'ক্রিকেট',              'name_en' => 'Cricket',            'slug' => 'cricket'],
            ['name_bn' => 'নির্বাচন',             'name_en' => 'Election',           'slug' => 'election'],
            ['name_bn' => 'বাজেট ২০২৫',          'name_en' => 'Budget 2025',        'slug' => 'budget-2025'],
            ['name_bn' => 'জলবায়ু পরিবর্তন',    'name_en' => 'Climate Change',     'slug' => 'climate-change'],
            ['name_bn' => 'কৃত্রিম বুদ্ধিমত্তা', 'name_en' => 'Artificial Intelligence', 'slug' => 'ai'],
            ['name_bn' => 'শেয়ার বাজার',         'name_en' => 'Stock Market',       'slug' => 'stock-market'],
            ['name_bn' => 'পদ্মা সেতু',           'name_en' => 'Padma Bridge',       'slug' => 'padma-bridge'],
            ['name_bn' => 'ঘূর্ণিঝড়',            'name_en' => 'Cyclone',            'slug' => 'cyclone'],
            ['name_bn' => 'ফুটবল',                'name_en' => 'Football',           'slug' => 'football'],
            ['name_bn' => 'রেমিট্যান্স',          'name_en' => 'Remittance',         'slug' => 'remittance'],
            ['name_bn' => 'বন্যা',                'name_en' => 'Flood',              'slug' => 'flood'],
            ['name_bn' => 'মেট্রোরেল',            'name_en' => 'Metro Rail',         'slug' => 'metro-rail'],
            ['name_bn' => 'বাংলাদেশ ক্রিকেট',   'name_en' => 'Bangladesh Cricket', 'slug' => 'bd-cricket'],
            ['name_bn' => 'গাজা',                 'name_en' => 'Gaza',               'slug' => 'gaza'],
            ['name_bn' => 'ডলার সংকট',           'name_en' => 'Dollar Crisis',      'slug' => 'dollar-crisis'],
            ['name_bn' => 'এআই প্রযুক্তি',       'name_en' => 'AI Technology',      'slug' => 'ai-technology'],
            ['name_bn' => 'সাকিব আল হাসান',      'name_en' => 'Shakib Al Hasan',    'slug' => 'shakib-al-hasan'],
        ];
        foreach ($tagsData as $t) {
            $tag = Tag::firstOrCreate(['slug' => $t['slug']], $t);
            $tagMap[$t['slug']] = $tag;
        }

        // ── Category lookup ───────────────────────────────────────────────────
        $cats = Category::all()->keyBy('slug');

        // helper: random reporter or fallback
        $authorId = fn() => $reporters->count() > 0
            ? ($reporters->random()->user_id ?? $author->id)
            : $author->id;

        // helper: build slug from bn title
        $slug = fn(string $bn, int $i) => Str::slug($bn) . '-' . $i;

        // ── Articles data ─────────────────────────────────────────────────────
        $articles = [

            // ════════ বাংলাদেশ ═══════════════════════════════════════════════
            [
                'category' => 'bangladesh', 'sub' => 'national',
                'title_bn' => 'পদ্মা সেতুতে দৈনিক টোল আদায়ে নতুন রেকর্ড, পার হয়েছে ৫০ কোটি টাকা',
                'title_en' => 'New toll collection record at Padma Bridge, surpasses Tk 50 crore',
                'excerpt_bn' => 'বাংলাদেশের সবচেয়ে বড় অবকাঠামো প্রকল্প পদ্মা সেতুতে একদিনে সর্বোচ্চ টোল আদায়ের রেকর্ড হয়েছে।',
                'excerpt_en' => 'A new single-day toll collection record has been set at Padma Bridge, Bangladesh\'s largest infrastructure project.',
                'body_bn' => $this->body_bn('পদ্মা সেতু', [
                    'বাংলাদেশের স্বপ্নের পদ্মা সেতুতে সম্প্রতি একদিনে রেকর্ড পরিমাণ টোল আদায় হয়েছে। গত ঈদুল আযহার ছুটিতে একটি মাত্র দিনে প্রায় ৫ কোটি ৮ লাখ টাকার টোল সংগ্রহ হয়েছে বলে জানিয়েছে বাংলাদেশ সেতু কর্তৃপক্ষ।',
                    'সেতু কর্তৃপক্ষের তথ্য অনুযায়ী, ওই দিন মোট ৩৬ হাজার যানবাহন পদ্মা সেতু পার হয়েছে। এর মধ্যে বাস, ট্রাক, মোটরসাইকেল এবং ব্যক্তিগত গাড়ি উল্লেখযোগ্য।',
                    '<h3>উদ্বোধনের পর থেকে আয়ের চিত্র</h3>',
                    '২০২২ সালের জুনে প্রধানমন্ত্রী শেখ হাসিনা পদ্মা সেতুর উদ্বোধন করেন। উদ্বোধনের পর থেকে এ পর্যন্ত সেতু থেকে মোট টোল আদায় হয়েছে প্রায় ১ হাজার ৩০০ কোটি টাকা।',
                    '<blockquote>পদ্মা সেতু কেবল একটি সেতু নয়, এটি বাংলাদেশের আত্মপ্রত্যয় ও সামর্থ্যের প্রতীক। — সেতু বিভাগের সচিব</blockquote>',
                    'বিশেষজ্ঞরা বলছেন, দক্ষিণাঞ্চলের সঙ্গে ঢাকার যোগাযোগ সহজ হওয়ায় ব্যবসা-বাণিজ্য ও যাত্রী পরিবহনে আমূল পরিবর্তন এসেছে। বরিশাল, খুলনা, ফরিদপুরসহ দক্ষিণের জেলাগুলো থেকে পণ্য পরিবহন এখন অনেক দ্রুত ও সাশ্রয়ী।',
                    '<h3>পর্যটন বৃদ্ধিতেও ভূমিকা</h3>',
                    'সেতু সংলগ্ন এলাকায় নতুন পর্যটনস্থল গড়ে উঠেছে। সুন্দরবনগামী পর্যটকের সংখ্যাও উল্লেখযোগ্যভাবে বেড়েছে বলে জানা গেছে।',
                ]),
                'body_en' => $this->body_en('Padma Bridge', [
                    'Bangladesh\'s iconic Padma Bridge has set a new single-day toll collection record, with approximately Tk 5.08 crore collected on a single day during the Eid-ul-Adha holiday season.',
                    'According to the Bangladesh Bridge Authority, a total of 36,000 vehicles crossed the bridge on that day, including buses, trucks, motorcycles, and private cars.',
                    '<h3>Revenue Since Inauguration</h3>',
                    'Inaugurated by Prime Minister Sheikh Hasina in June 2022, the bridge has collected a total of approximately Tk 1,300 crore in tolls since its opening.',
                    '<blockquote>The Padma Bridge is not just a bridge — it is a symbol of Bangladesh\'s confidence and capability. — Secretary, Bridge Division</blockquote>',
                    'Experts say that improved connectivity between southern Bangladesh and Dhaka has transformed trade, commerce, and passenger transport.',
                ]),
                'tags' => ['padma-bridge'],
                'is_featured' => true, 'is_breaking' => false,
                'hours_ago' => 2, 'views' => 18420,
            ],
            [
                'category' => 'bangladesh', 'sub' => 'national',
                'title_bn' => 'ঢাকায় নতুন মেট্রোরেল রুট উদ্বোধন, মতিঝিল থেকে গাজীপুর সরাসরি',
                'title_en' => 'New Metro Rail route inaugurated in Dhaka, direct Motijheel to Gazipur',
                'excerpt_bn' => 'রাজধানীর যানজট সমস্যা কমাতে মেট্রোরেলের নতুন রুট উদ্বোধন হয়েছে আজ।',
                'excerpt_en' => 'A new metro rail route has been inaugurated today to ease traffic congestion in the capital.',
                'body_bn' => $this->body_bn('মেট্রোরেল', [
                    'ঢাকার চিরন্তন যানজট সমস্যার সমাধানে আরও এক ধাপ এগিয়ে গেল বাংলাদেশ। আজ মতিঝিল থেকে গাজীপুর পর্যন্ত মেট্রোরেলের নতুন বর্ধিত রুটের আনুষ্ঠানিক উদ্বোধন হয়েছে।',
                    '<h3>কত সময় লাগবে?</h3>',
                    'এই রুটে মতিঝিল থেকে গাজীপুর পৌঁছাতে মাত্র ৩৫ মিনিট সময় লাগবে, যেখানে আগে সড়কপথে দুই থেকে তিন ঘণ্টা লেগে যেত।',
                    'ঢাকা ম্যাস ট্রানজিট কোম্পানি লিমিটেড (ডিএমটিসিএল)-এর তথ্যানুযায়ী, নতুন রুটে মোট ১৪টি স্টেশন থাকবে। প্রতিটি ট্রেনে সর্বোচ্চ ২,৩০০ যাত্রী বহন করা সম্ভব।',
                    '<blockquote>মেট্রোরেল আমাদের জীবনকে বদলে দেবে। এটি আমাদের সময় বাঁচাবে, দূষণ কমাবে। — যাত্রী মনিরুল ইসলাম</blockquote>',
                    'পরিবেশবিদরা বলছেন, এই মেট্রোরেল চালু হলে ঢাকায় প্রতিদিন প্রায় ৫ লাখ মানুষ ব্যক্তিগত গাড়ি ব্যবহার কমাবেন, যা বায়ুদূষণ কমাতে উল্লেখযোগ্য ভূমিকা রাখবে।',
                    '<h3>ভাড়ার তথ্য</h3>',
                    'নতুন রুটে ন্যূনতম ভাড়া ২০ টাকা এবং সর্বোচ্চ ভাড়া ১০০ টাকা নির্ধারণ করা হয়েছে।',
                ]),
                'body_en' => $this->body_en('Metro Rail', [
                    'Bangladesh has taken another step to solve Dhaka\'s perpetual traffic problem. A new extended metro rail route from Motijheel to Gazipur was officially inaugurated today.',
                    'The journey from Motijheel to Gazipur will now take only 35 minutes, compared to the 2-3 hours it previously took by road.',
                    '<h3>Route Details</h3>',
                    'The Dhaka Mass Transit Company Limited (DMTCL) said the new route has 14 stations, with each train capable of carrying up to 2,300 passengers.',
                    'Minimum fare is set at Tk 20 and maximum at Tk 100.',
                ]),
                'tags' => ['metro-rail'],
                'is_featured' => true, 'is_breaking' => true,
                'hours_ago' => 5, 'views' => 22100,
            ],
            [
                'category' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'ঘূর্ণিঝড় দানার আঘাতে উপকূলে ক্ষয়ক্ষতি, ১২ জেলায় দুর্যোগ পরিস্থিতি',
                'title_en' => 'Cyclone Dana hits coast, disaster situation in 12 districts',
                'excerpt_bn' => 'ঘূর্ণিঝড় দানা বাংলাদেশের উপকূলীয় অঞ্চলে আঘাত হানায় ব্যাপক ক্ষয়ক্ষতির খবর পাওয়া গেছে।',
                'excerpt_en' => 'Cyclone Dana has struck Bangladesh\'s coastal areas causing widespread damage.',
                'body_bn' => $this->body_bn('ঘূর্ণিঝড় দানা', [
                    'তীব্র গতিতে আঘাত হানা ঘূর্ণিঝড় দানা বাংলাদেশের দক্ষিণ-পশ্চিম উপকূলে ব্যাপক ক্ষয়ক্ষতি করেছে। বরগুনা, পটুয়াখালী, ভোলা এবং সাতক্ষীরাসহ ১২টি জেলায় দুর্যোগ পরিস্থিতি বিরাজ করছে।',
                    'দুর্যোগ ব্যবস্থাপনা অধিদপ্তরের তথ্যানুযায়ী, এ পর্যন্ত ৫ জনের মৃত্যু নিশ্চিত হয়েছে এবং অন্তত ৫০ জন আহত হয়েছেন। প্রায় ২ লাখ মানুষকে নিরাপদ আশ্রয়ে সরিয়ে নেওয়া হয়েছে।',
                    '<h3>যোগাযোগ বিচ্ছিন্ন</h3>',
                    'তীব্র ঝড়ো বৃষ্টিতে সড়ক যোগাযোগ বিচ্ছিন্ন হয়ে গেছে। বিদ্যুৎ সংযোগ বিচ্ছিন্ন থাকায় কয়েক লাখ মানুষ অন্ধকারে রয়েছেন।',
                    '<blockquote>আমার ঘর ভেঙে গেছে, সব হারিয়েছি। সরকারের কাছে সাহায্য চাই। — বরগুনার ক্ষতিগ্রস্ত বাসিন্দা</blockquote>',
                    'সরকার ক্ষতিগ্রস্ত এলাকায় জরুরি ত্রাণ সহায়তা পাঠিয়েছে। সেনাবাহিনী উদ্ধার কাজে নেমেছে।',
                    '<h3>ক্ষয়ক্ষতির পরিমাণ</h3>',
                    'প্রাথমিক হিসাবে প্রায় ৫ হাজার কোটি টাকার সম্পদ নষ্ট হয়েছে। ফসলের ক্ষতি হয়েছে সবচেয়ে বেশি।',
                ]),
                'body_en' => $this->body_en('Cyclone Dana', [
                    'Cyclone Dana has struck Bangladesh\'s southwestern coast with tremendous force, causing widespread damage across 12 districts including Barguna, Patuakhali, Bhola, and Satkhira.',
                    'According to the Department of Disaster Management, at least 5 people have died and 50 others are injured. Around 200,000 people have been evacuated to safe shelters.',
                    '<h3>Communications Disrupted</h3>',
                    'Road connectivity has been severed by heavy rains and storm surges. Millions are without electricity.',
                    'The government has dispatched emergency relief, and the military has been deployed for rescue operations.',
                ]),
                'tags' => ['cyclone', 'flood'],
                'is_featured' => true, 'is_breaking' => true,
                'hours_ago' => 1, 'views' => 45600,
            ],
            [
                'category' => 'bangladesh', 'sub' => 'dhaka-news',
                'title_bn' => 'ঢাকার বায়ু দূষণ বিশ্বের মধ্যে সবচেয়ে খারাপের তালিকায় শীর্ষে',
                'title_en' => 'Dhaka tops global list of worst air pollution cities',
                'excerpt_bn' => 'বিশ্বের সবচেয়ে দূষিত বায়ুর শহরের তালিকায় আবার শীর্ষে উঠে এসেছে ঢাকা।',
                'excerpt_en' => 'Dhaka has again topped the global list of cities with the worst air quality.',
                'body_bn' => $this->body_bn('বায়ু দূষণ', [
                    'আন্তর্জাতিক বায়ু মান পর্যবেক্ষণকারী সংস্থা আইকিউএয়ারের সর্বশেষ প্রতিবেদন অনুযায়ী, বাংলাদেশের রাজধানী ঢাকা আজ সকালে বিশ্বের সবচেয়ে দূষিত বায়ুর শহরের তালিকায় শীর্ষে উঠে এসেছে।',
                    'ঢাকার বায়ু মান সূচক (একিউআই) আজ ২৮০ রেকর্ড করা হয়েছে, যা "অত্যন্ত অস্বাস্থ্যকর" পর্যায়ের চেয়েও বেশি।',
                    '<h3>কারণ কী?</h3>',
                    '<ul><li>ইটভাটা থেকে ধোঁয়া</li><li>যানবাহনের কালো ধোঁয়া</li><li>নির্মাণকাজের ধুলা</li><li>শীতকালীন বাতাসের গতি কম থাকা</li></ul>',
                    '<blockquote>শিশু ও বয়স্কদের এই দিনগুলোতে বাইরে বের না হওয়ার পরামর্শ দেওয়া হচ্ছে। — স্বাস্থ্য অধিদপ্তরের পরিচালক</blockquote>',
                    'পরিবেশ বিশেষজ্ঞরা বলছেন, দীর্ঘমেয়াদে এই দূষণ মোকাবেলায় সরকারকে কঠোর আইন প্রণয়ন ও বাস্তবায়ন করতে হবে।',
                ]),
                'body_en' => $this->body_en('Air Pollution', [
                    'According to the latest report by air quality monitor IQAir, Dhaka ranked as the most polluted city in the world this morning.',
                    'Dhaka\'s Air Quality Index (AQI) was recorded at 280, which falls beyond the "Very Unhealthy" threshold.',
                    '<h3>What Are the Causes?</h3>',
                    '<ul><li>Brick kiln smoke</li><li>Vehicular emissions</li><li>Construction dust</li><li>Low wind speeds in winter</li></ul>',
                ]),
                'tags' => [],
                'is_featured' => false, 'is_breaking' => true,
                'hours_ago' => 3, 'views' => 31200,
            ],
            [
                'category' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'সারাদেশে বন্যায় ক্ষতিগ্রস্ত ৩০ লাখ মানুষ, ত্রাণ বিতরণ শুরু',
                'title_en' => 'Three million people affected by nationwide floods, relief distribution begins',
                'excerpt_bn' => 'দেশজুড়ে ভারী বর্ষণ ও উজান থেকে নেমে আসা ঢলে বন্যা পরিস্থিতির অবনতি হয়েছে।',
                'excerpt_en' => 'Heavy rainfall and onrushing upstream floods have worsened the flood situation across the country.',
                'body_bn' => $this->body_bn('বন্যা', [
                    'অবিরাম বৃষ্টি ও ভারত থেকে আসা ঢলে বাংলাদেশের উত্তর ও পূর্বাঞ্চলে ভয়াবহ বন্যা পরিস্থিতি তৈরি হয়েছে। সরকারি হিসেবে ইতোমধ্যে ৩০ লাখের বেশি মানুষ বন্যায় ক্ষতিগ্রস্ত হয়েছেন।',
                    'সুনামগঞ্জ, নেত্রকোনা, কিশোরগঞ্জ ও সিলেটে বন্যার পানি রেকর্ড উচ্চতায় পৌঁছেছে। হাওর অঞ্চলের বেশিরভাগ ঘরবাড়ি পানির নিচে ডুবে গেছে।',
                    '<h3>ত্রাণ কার্যক্রম</h3>',
                    'সরকার ১০০ কোটি টাকার জরুরি ত্রাণ বরাদ্দ দিয়েছে। সেনাবাহিনী ও নৌবাহিনীর পাশাপাশি বেসরকারি সংস্থাগুলোও ত্রাণ বিতরণ করছে।',
                    '<blockquote>প্রতি বছরই বন্যা হয়, কিন্তু এবার পানি এত দ্রুত বাড়ছে যে আমরা সরে যাওয়ার সময়ই পাইনি। — সুনামগঞ্জের বানভাসি</blockquote>',
                ]),
                'body_en' => $this->body_en('Floods', [
                    'Relentless rain and upstream floodwaters have created a catastrophic flood situation across northern and eastern Bangladesh. The government says more than 3 million people have already been affected.',
                    'Water levels in Sunamganj, Netrokona, Kishoreganj, and Sylhet have reached record highs. Most homes in the haor region are submerged.',
                    'The government has allocated Tk 1 billion in emergency relief, with the army and navy alongside NGOs distributing aid.',
                ]),
                'tags' => ['flood'],
                'is_featured' => false, 'is_breaking' => true,
                'hours_ago' => 8, 'views' => 28900,
            ],

            // ════════ আন্তর্জাতিক ════════════════════════════════════════════
            [
                'category' => 'international', 'sub' => 'middle-east',
                'title_bn' => 'গাজায় যুদ্ধবিরতির প্রস্তাবে ইসরাইলের সম্মতি, হামাস বলছে আলোচনা চলছে',
                'title_en' => 'Israel agrees to Gaza ceasefire proposal, Hamas says talks ongoing',
                'excerpt_bn' => 'দীর্ঘ কয়েক মাসের যুদ্ধের পর গাজায় সম্ভাব্য যুদ্ধবিরতির আলোচনায় নতুন অগ্রগতি হয়েছে।',
                'excerpt_en' => 'After months of war, new progress has been made in talks for a possible ceasefire in Gaza.',
                'body_bn' => $this->body_bn('গাজা যুদ্ধবিরতি', [
                    'দীর্ঘ আলোচনা ও মধ্যস্থতার পর গাজায় যুদ্ধবিরতির প্রস্তাবে ইসরাইল সম্মতি জানিয়েছে বলে মার্কিন কর্মকর্তারা জানিয়েছেন। তবে হামাস বলছে, আলোচনা এখনও চলছে এবং চূড়ান্ত সিদ্ধান্তে পৌঁছাতে আরও সময় লাগবে।',
                    'কাতার ও মিসরের মধ্যস্থতায় চলা এই আলোচনায় জিম্মি মুক্তি ও মানবিক সহায়তা প্রবেশের বিষয়টি মূল বিষয় হিসেবে রয়েছে।',
                    '<h3>মানবিক বিপর্যয়</h3>',
                    'জাতিসংঘের তথ্যানুযায়ী, গাজায় এ পর্যন্ত ৩৫ হাজারের বেশি মানুষ নিহত হয়েছেন। প্রায় ২০ লাখ মানুষ বাস্তুহারা হয়েছেন।',
                    '<blockquote>আমরা চাই এই যুদ্ধ শেষ হোক, কিন্তু টেকসই শান্তি প্রতিষ্ঠা না হলে আবার সংঘর্ষ শুরু হবে। — একজন ফিলিস্তিনি নেতা</blockquote>',
                    'বাংলাদেশ সরকার গাজায় স্থায়ী যুদ্ধবিরতির দাবি জানিয়ে জাতিসংঘে বিবৃতি দিয়েছে।',
                ]),
                'body_en' => $this->body_en('Gaza Ceasefire', [
                    'US officials say Israel has agreed to a Gaza ceasefire proposal after lengthy negotiations. However, Hamas said talks are still ongoing and a final decision will take more time.',
                    'The Qatar and Egypt-mediated talks focus on hostage releases and humanitarian access as the main issues.',
                    'According to the UN, more than 35,000 people have been killed in Gaza, with nearly 2 million displaced.',
                ]),
                'tags' => ['gaza'],
                'is_featured' => true, 'is_breaking' => true,
                'hours_ago' => 4, 'views' => 52300,
            ],
            [
                'category' => 'international', 'sub' => 'asia',
                'title_bn' => 'ভারতে সাধারণ নির্বাচনে বিজেপির জোট তৃতীয়বারের মতো সরকার গঠন করছে',
                'title_en' => 'BJP-led alliance forms government for third time in India general elections',
                'excerpt_bn' => 'ভারতের ১৮তম লোকসভা নির্বাচনে নরেন্দ্র মোদির নেতৃত্বে বিজেপি জোট সরকার গঠনের যোগ্য আসন পেয়েছে।',
                'excerpt_en' => 'Narendra Modi-led BJP alliance has secured seats to form government in India\'s 18th Lok Sabha elections.',
                'body_bn' => $this->body_bn('ভারত নির্বাচন', [
                    'ভারতের ১৮তম লোকসভা নির্বাচনের ফলাফলে নরেন্দ্র মোদির নেতৃত্বে এনডিএ জোট তৃতীয়বারের মতো কেন্দ্রীয় সরকার গঠন করতে যাচ্ছে। তবে এবার বিজেপি একক সংখ্যাগরিষ্ঠতা পায়নি এবং মিত্র দলগুলোর সমর্থনে সরকার গঠন করতে হচ্ছে।',
                    'নির্বাচন কমিশনের তথ্যানুযায়ী, ৫৪৩ আসনবিশিষ্ট লোকসভায় এনডিএ জোট ২৯৩টি আসন পেয়েছে, যা সংখ্যাগরিষ্ঠতার জন্য প্রয়োজনীয় ২৭২ আসনের বেশি।',
                    '<h3>বিরোধী জোটের পারফরম্যান্স</h3>',
                    'বিরোধী ইন্ডিয়া জোট ২৩৪টি আসন পেয়ে আগের তুলনায় শক্তিশালী অবস্থানে ফিরেছে। কংগ্রেস একা ৯৯টি আসন পেয়েছে।',
                    '<blockquote>ভারতের জনগণ আবার আমাদের বিশ্বাস করেছে। আমরা সবার জন্য উন্নয়ন করব। — নরেন্দ্র মোদি</blockquote>',
                ]),
                'body_en' => $this->body_en('India Elections', [
                    'In India\'s 18th Lok Sabha election results, Narendra Modi-led NDA alliance is forming the central government for the third time. However, BJP did not achieve an outright majority and needs coalition partners.',
                    'The Election Commission reports that the NDA alliance won 293 of 543 seats, surpassing the 272 needed for a majority.',
                    'The opposition INDIA coalition won 234 seats, returning to a stronger position than before.',
                ]),
                'tags' => ['election'],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 12, 'views' => 38700,
            ],
            [
                'category' => 'international', 'sub' => 'europe',
                'title_bn' => 'ইউক্রেনে রাশিয়ার বিমান হামলায় ব্যাপক ক্ষয়ক্ষতি, পশ্চিমা সহায়তার নতুন প্যাকেজ',
                'title_en' => 'Russia\'s air strikes cause major damage in Ukraine, new Western aid package announced',
                'excerpt_bn' => 'ইউক্রেনের একাধিক শহরে রাশিয়ার ড্রোন ও ক্ষেপণাস্ত্র হামলায় বহু মানুষ হতাহত হয়েছেন।',
                'excerpt_en' => 'Multiple Russian drone and missile strikes on Ukrainian cities have caused mass casualties.',
                'body_bn' => $this->body_bn('ইউক্রেন যুদ্ধ', [
                    'ইউক্রেনের কিইভ, খারকিভ ও জাপোরিঝিয়াসহ বেশ কয়েকটি শহরে রাশিয়ার রাতের ড্রোন ও ব্যালিস্টিক ক্ষেপণাস্ত্র হামলায় কমপক্ষে ১২ জন নিহত ও ৪৫ জন আহত হয়েছেন।',
                    'এই হামলার প্রতিক্রিয়ায় মার্কিন যুক্তরাষ্ট্র, যুক্তরাজ্য ও ইইউ মিলে ইউক্রেনকে নতুন সহায়তা প্যাকেজ দেওয়ার ঘোষণা দিয়েছে।',
                    '<h3>সহায়তার বিবরণ</h3>',
                    'নতুন প্যাকেজে ৩ বিলিয়ন ডলারের সামরিক সহায়তা রয়েছে, যার মধ্যে বিমান প্রতিরক্ষা ব্যবস্থা, গোলাবারুদ ও মানবিক সহায়তা অন্তর্ভুক্ত।',
                ]),
                'body_en' => $this->body_en('Ukraine War', [
                    'Russian overnight drone and ballistic missile strikes on Kyiv, Kharkiv, and Zaporizhzhia have killed at least 12 people and wounded 45.',
                    'In response, the US, UK, and EU have announced a new combined aid package for Ukraine worth $3 billion, including air defense systems and ammunition.',
                ]),
                'tags' => [],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 18, 'views' => 14500,
            ],

            // ════════ রাজনীতি ═════════════════════════════════════════════════
            [
                'category' => 'politics', 'sub' => 'government',
                'title_bn' => 'নতুন মন্ত্রিসভায় বড় রদবদল, ১৫ মন্ত্রীর পদে পরিবর্তন',
                'title_en' => 'Major cabinet reshuffle, 15 ministerial positions changed',
                'excerpt_bn' => 'সরকারের দ্বিতীয় বর্ষে প্রবেশ উপলক্ষে মন্ত্রিসভায় ব্যাপক পুনর্গঠন করা হয়েছে।',
                'excerpt_en' => 'A sweeping cabinet restructuring has been carried out marking the government\'s second year.',
                'body_bn' => $this->body_bn('মন্ত্রিসভা রদবদল', [
                    'সরকারের দ্বিতীয় বর্ষে পদার্পণ উপলক্ষে প্রধানমন্ত্রী মন্ত্রিসভায় বড় ধরনের পুনর্গঠন করেছেন। মোট ১৫ জন মন্ত্রীকে নতুন পদে নিয়োগ দেওয়া হয়েছে এবং ৫ জন বাদ পড়েছেন।',
                    'নতুন মন্ত্রিসভায় তরুণ টেকনোক্র্যাটদের প্রাধান্য দেওয়া হয়েছে বলে জানা গেছে। বেশ কয়েকজন পেশাদার বিশেষজ্ঞকেও মন্ত্রণালয়ের দায়িত্ব দেওয়া হয়েছে।',
                    '<h3>গুরুত্বপূর্ণ পরিবর্তন</h3>',
                    'অর্থ মন্ত্রণালয়, স্বাস্থ্য মন্ত্রণালয় ও শিক্ষা মন্ত্রণালয়ে নতুন মন্ত্রী নিয়োগ দেওয়া হয়েছে। এই তিনটি মন্ত্রণালয়কে সংস্কারের অগ্রাধিকার মন্ত্রণালয় হিসেবে চিহ্নিত করা হয়েছে।',
                    '<blockquote>নতুন মন্ত্রিসভা জনগণের প্রত্যাশা পূরণে আরও কার্যকর হবে বলে আমি বিশ্বাসী। — মন্ত্রিপরিষদ সচিব</blockquote>',
                ]),
                'body_en' => $this->body_en('Cabinet Reshuffle', [
                    'The Prime Minister has carried out a major cabinet reshuffle to mark the government\'s second year. A total of 15 ministers have been assigned new positions and 5 have been dropped.',
                    'The new cabinet reportedly emphasizes young technocrats and professional experts.',
                    'New ministers have been appointed to the Finance, Health, and Education ministries, identified as priority reform ministries.',
                ]),
                'tags' => [],
                'is_featured' => true, 'is_breaking' => false,
                'hours_ago' => 6, 'views' => 19800,
            ],
            [
                'category' => 'politics', 'sub' => 'opposition',
                'title_bn' => 'সংসদে বিরোধী দলের ওয়াকআউট, বিতর্কিত বিল প্রত্যাহারের দাবি',
                'title_en' => 'Opposition walkout from parliament, demands withdrawal of controversial bill',
                'excerpt_bn' => 'একটি বিতর্কিত সাইবার নিরাপত্তা বিলের প্রতিবাদে বিরোধী দলের সদস্যরা সংসদে ওয়াকআউট করেছেন।',
                'excerpt_en' => 'Opposition members have walked out of parliament in protest against a controversial cybersecurity bill.',
                'body_bn' => $this->body_bn('সংসদ ওয়াকআউট', [
                    'একটি বিতর্কিত সাইবার নিরাপত্তা আইন সংশোধনী বিলের প্রতিবাদে সংসদে বিরোধী দলের ২৪ জন সদস্য একযোগে ওয়াকআউট করেছেন।',
                    'বিরোধী দলের নেতা অভিযোগ করেছেন, এই বিলটি মত প্রকাশের স্বাধীনতাকে খর্ব করবে এবং সাংবাদিকতাকে আরও কঠিন করে তুলবে।',
                    '<h3>সরকারের অবস্থান</h3>',
                    'তথ্য ও যোগাযোগ প্রযুক্তি মন্ত্রী বলেছেন, এই আইনটি সাইবার অপরাধ দমনে এবং জাতীয় নিরাপত্তা রক্ষায় প্রয়োজনীয়।',
                    '<blockquote>এই বিল গণতন্ত্রের পরিপন্থী। আমরা এটি প্রত্যাহার না হওয়া পর্যন্ত আন্দোলন চালিয়ে যাব। — বিরোধীদলীয় নেতা</blockquote>',
                    'সুশীল সমাজ ও সাংবাদিক সংগঠনগুলোও বিলটির তীব্র সমালোচনা করেছে।',
                ]),
                'body_en' => $this->body_en('Parliament Walkout', [
                    '24 opposition members of parliament have walked out in protest against a controversial cybersecurity amendment bill.',
                    'The opposition leader alleged the bill would curtail freedom of expression and make journalism more difficult.',
                    'The ICT Minister maintained the law is necessary to combat cybercrime and protect national security.',
                ]),
                'tags' => ['cyber-security', 'election'],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 10, 'views' => 12400,
            ],
            [
                'category' => 'politics', 'sub' => 'election',
                'title_bn' => 'আগামী জাতীয় নির্বাচনের রোডম্যাপ প্রকাশ করল নির্বাচন কমিশন',
                'title_en' => 'Election Commission publishes roadmap for next general election',
                'excerpt_bn' => 'আগামী জাতীয় নির্বাচন অনুষ্ঠানের বিস্তারিত পরিকল্পনা প্রকাশ করেছে নির্বাচন কমিশন।',
                'excerpt_en' => 'The Election Commission has released detailed plans for the next general election.',
                'body_bn' => $this->body_bn('নির্বাচনী রোডম্যাপ', [
                    'আগামী জাতীয় সংসদ নির্বাচন সময়মতো ও সুষ্ঠুভাবে অনুষ্ঠানের লক্ষ্যে নির্বাচন কমিশন একটি বিস্তারিত রোডম্যাপ প্রকাশ করেছে। এতে ভোটার তালিকা হালনাগাদ, প্রার্থী নিবন্ধন ও ভোট গ্রহণের তারিখসহ প্রতিটি পর্যায়ের বিস্তারিত তথ্য রয়েছে।',
                    '<h3>গুরুত্বপূর্ণ তারিখসমূহ</h3>',
                    '<ul><li>ভোটার তালিকা হালনাগাদ: ১ সেপ্টেম্বর</li><li>প্রার্থী নিবন্ধন: ১৫ অক্টোবর</li><li>প্রচারণা শুরু: ১ নভেম্বর</li><li>ভোট গ্রহণ: ৭ জানুয়ারি</li></ul>',
                    'প্রধান নির্বাচন কমিশনার বলেছেন, এই রোডম্যাপে প্রযুক্তির সর্বোচ্চ ব্যবহার নিশ্চিত করা হয়েছে। ইলেকট্রনিক ভোটিং মেশিন (ইভিএম) নিয়ে বিতর্কের মধ্যে আপাতত ব্যালট পেপারেই ভোট নেওয়ার সিদ্ধান্ত হয়েছে।',
                ]),
                'body_en' => $this->body_en('Election Roadmap', [
                    'The Election Commission has published a detailed roadmap for holding the next parliamentary election on time and fairly. It includes voter roll updates, candidate registration, and voting dates.',
                    'Key dates: Voter list update September 1, candidate registration October 15, campaign start November 1, voting January 7.',
                    'The Chief Election Commissioner said technology will be maximized, but paper ballots will be used amid controversy over Electronic Voting Machines.',
                ]),
                'tags' => ['election'],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 24, 'views' => 17600,
            ],

            // ════════ অর্থনীতি ════════════════════════════════════════════════
            [
                'category' => 'economy', 'sub' => 'banking',
                'title_bn' => 'ডলারের বিনিময় হার ১২০ টাকা ছাড়িয়ে গেল, বাংলাদেশ ব্যাংকের নতুন পদক্ষেপ',
                'title_en' => 'Dollar exchange rate surpasses Tk 120, Bangladesh Bank takes new measures',
                'excerpt_bn' => 'মুদ্রা বাজারে অস্থিরতার মধ্যে ডলারের বিনিময় হার সর্বোচ্চ পর্যায়ে পৌঁছেছে।',
                'excerpt_en' => 'Amid currency market volatility, the dollar exchange rate has reached an all-time high.',
                'body_bn' => $this->body_bn('ডলার সংকট', [
                    'আন্তর্জাতিক বাজারে ডলারের শক্তিশালী অবস্থান ও দেশে রিজার্ভ কমে যাওয়ার কারণে বাংলাদেশি টাকার বিপরীতে মার্কিন ডলারের বিনিময় হার প্রথমবারের মতো ১২০ টাকা ছাড়িয়ে গেছে।',
                    'বাংলাদেশ ব্যাংকের তথ্যানুযায়ী, দেশের বৈদেশিক মুদ্রার রিজার্ভ এখন ২৪ বিলিয়ন ডলারের নিচে নেমেছে, যা গত পাঁচ বছরের মধ্যে সর্বনিম্ন।',
                    '<h3>বাংলাদেশ ব্যাংকের পদক্ষেপ</h3>',
                    'পরিস্থিতি সামলাতে বাংলাদেশ ব্যাংক সুদের হার বাড়িয়েছে এবং আমদানি নিয়ন্ত্রণে কঠোর নীতি নিয়েছে। রেমিট্যান্স প্রবাহ বাড়াতে প্রণোদনা বৃদ্ধির পরিকল্পনাও নেওয়া হয়েছে।',
                    '<blockquote>পরিস্থিতি উদ্বেগজনক হলেও নিয়ন্ত্রণযোগ্য। আগামী কয়েক মাসে রিজার্ভ আবার বাড়বে। — বাংলাদেশ ব্যাংকের গভর্নর</blockquote>',
                    'অর্থনীতিবিদরা বলছেন, এই সংকট কাটাতে রপ্তানি বাড়ানো ও আমদানি কমানোর দীর্ঘমেয়াদি কৌশল দরকার।',
                ]),
                'body_en' => $this->body_en('Dollar Crisis', [
                    'The US dollar has surpassed Tk 120 against the Bangladeshi taka for the first time, driven by the strong dollar globally and shrinking domestic reserves.',
                    'Bangladesh Bank reports foreign currency reserves have fallen below $24 billion, the lowest in five years.',
                    'Bangladesh Bank has raised interest rates and tightened import controls. Incentives to boost remittance flows are also planned.',
                    '<blockquote>The situation is concerning but manageable. Reserves will recover in the coming months. — Bangladesh Bank Governor</blockquote>',
                ]),
                'tags' => ['dollar-crisis', 'budget-2025'],
                'is_featured' => true, 'is_breaking' => false,
                'hours_ago' => 9, 'views' => 34800,
            ],
            [
                'category' => 'economy', 'sub' => 'trade',
                'title_bn' => 'রেমিট্যান্স প্রবাহে নতুন রেকর্ড, একমাসে এলো ২৫০ কোটি ডলার',
                'title_en' => 'New remittance record, $2.5 billion arrives in one month',
                'excerpt_bn' => 'প্রবাসী বাংলাদেশিদের পাঠানো রেমিট্যান্স এক মাসে ২৫০ কোটি ডলার ছাড়িয়ে গেছে।',
                'excerpt_en' => 'Remittances sent by overseas Bangladeshis have crossed $2.5 billion in a single month.',
                'body_bn' => $this->body_bn('রেমিট্যান্স রেকর্ড', [
                    'বিদেশে কর্মরত বাংলাদেশিদের পাঠানো রেমিট্যান্স গত মাসে ২৫০ কোটি ডলার ছাড়িয়ে নতুন মাসিক রেকর্ড স্থাপন করেছে। এটি আগের মাসের তুলনায় ১৮ শতাংশ বেশি।',
                    'কেন্দ্রীয় ব্যাংকের তথ্যানুযায়ী, সবচেয়ে বেশি রেমিট্যান্স এসেছে সৌদি আরব, সংযুক্ত আরব আমিরাত, যুক্তরাষ্ট্র ও মালয়েশিয়া থেকে।',
                    '<h3>প্রণোদনার প্রভাব</h3>',
                    'সরকারের আড়াই শতাংশ নগদ প্রণোদনা প্রবাসীদের বৈধ চ্যানেলে টাকা পাঠাতে উৎসাহিত করেছে। হুন্ডির মাধ্যমে অর্থ পাঠানো কমে গেছে।',
                ]),
                'body_en' => $this->body_en('Remittance Record', [
                    'Remittances sent by Bangladeshis working abroad crossed $2.5 billion last month, setting a new monthly record — up 18% from the previous month.',
                    'The Central Bank says the biggest remittance sources are Saudi Arabia, UAE, USA, and Malaysia.',
                    'The government\'s 2.5% cash incentive has encouraged expatriates to send money through legal channels, reducing hundi transfers.',
                ]),
                'tags' => ['remittance'],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 20, 'views' => 11200,
            ],
            [
                'category' => 'economy', 'sub' => 'stock-market',
                'title_bn' => 'শেয়ার বাজারে বড় ধস, ডিএসই সূচক ৩০০ পয়েন্ট কমেছে',
                'title_en' => 'Stock market crashes, DSE index drops 300 points',
                'excerpt_bn' => 'ঢাকা স্টক এক্সচেঞ্জে আজ বড় পতন ঘটেছে, বিনিয়োগকারীরা উদ্বিগ্ন।',
                'excerpt_en' => 'Dhaka Stock Exchange saw a major fall today, investors are worried.',
                'body_bn' => $this->body_bn('শেয়ার বাজার', [
                    'ঢাকা স্টক এক্সচেঞ্জে (ডিএসই) আজ ব্যাপক দরপতন হয়েছে। সার্বিক সূচক ডিএসইএক্স একদিনে ৩০০ পয়েন্টেরও বেশি কমে গেছে, যা গত ছয় মাসের সর্বোচ্চ একদিনের পতন।',
                    'এই পতনের ফলে বাজারের মোট মূলধন প্রায় ১৫ হাজার কোটি টাকা কমে গেছে।',
                    '<h3>পতনের কারণ</h3>',
                    'বিশ্লেষকরা বলছেন, বৈশ্বিক বাজারে অস্থিরতা, দেশীয় মুদ্রার অবমূল্যায়ন এবং সুদের হার বৃদ্ধি শেয়ার বাজারে নেতিবাচক প্রভাব ফেলছে।',
                    '<blockquote>বিনিয়োগকারীদের আতঙ্কিত না হয়ে দীর্ঘমেয়াদী দৃষ্টিভঙ্গি রাখতে হবে। — বিএসইসি চেয়ারম্যান</blockquote>',
                ]),
                'body_en' => $this->body_en('Stock Market', [
                    'The Dhaka Stock Exchange (DSE) witnessed a major fall today, with the DSEX index dropping more than 300 points — the biggest single-day decline in six months.',
                    'The total market capitalization fell by about Tk 15,000 crore.',
                    'Analysts point to global market instability, domestic currency depreciation, and rising interest rates as contributing factors.',
                ]),
                'tags' => ['stock-market'],
                'is_featured' => false, 'is_breaking' => true,
                'hours_ago' => 7, 'views' => 28400,
            ],

            // ════════ খেলাধুলা ════════════════════════════════════════════════
            [
                'category' => 'sports', 'sub' => 'cricket-news',
                'title_bn' => 'বাংলাদেশ ভারতকে টেস্টে হারিয়ে ইতিহাস গড়ল, ঢাকায় উৎসব',
                'title_en' => 'Bangladesh beats India in Test to make history, celebrations in Dhaka',
                'excerpt_bn' => 'ঐতিহাসিক মুহূর্তে বাংলাদেশ প্রথমবারের মতো ভারতকে টেস্টে পরাজিত করেছে।',
                'excerpt_en' => 'In a historic moment, Bangladesh has defeated India in a Test match for the first time.',
                'body_bn' => $this->body_bn('বাংলাদেশ বনাম ভারত টেস্ট', [
                    'ক্রিকেটে একটি অবিশ্বাস্য অর্জন করেছে বাংলাদেশ। মীরপুরের শের-ই-বাংলা স্টেডিয়ামে ভারতের বিপক্ষে ঐতিহাসিক টেস্ট জয় পেয়েছে টাইগাররা। ১৫০ রানের লক্ষ্যমাত্রায় ভারতকে মাত্র ৮৪ রানে অলআউট করে দিয়েছে বাংলাদেশ।',
                    'তরুণ স্পিনার নাহিদ রানা একাই নিয়েছেন ৭ উইকেট। এই পারফরম্যান্সে তিনি ম্যাচ সেরার পুরস্কার পেয়েছেন।',
                    '<h3>ম্যাচের মূল মুহূর্ত</h3>',
                    'ম্যাচের চতুর্থ দিনে বাংলাদেশ ব্যাটিং বিপর্যয়ে পড়েছিল। মাত্র ৮৭ রানে ৭ উইকেট হারানোর পর সাকিব আল হাসান ও মেহেদী হাসান মিরাজ দলকে উদ্ধার করেন।',
                    '<blockquote>এই জয় বাংলাদেশ ক্রিকেটের ইতিহাসে একটি মাইলফলক। আমরা প্রমাণ করলাম যে আমরাও পারি। — অধিনায়ক নাজমুল শান্ত</blockquote>',
                    'পুরো ঢাকা শহরে উৎসব শুরু হয়ে গেছে। সামাজিক যোগাযোগমাধ্যমে এই জয় নিয়ে ঝড় বইছে।',
                ]),
                'body_en' => $this->body_en('Bangladesh vs India Test', [
                    'Bangladesh has achieved an incredible feat in cricket. The Tigers have claimed a historic Test win against India at Mirpur\'s Sher-e-Bangla National Stadium. Bangladesh dismissed India for just 84 runs chasing a target of 150.',
                    'Young spinner Nahid Rana single-handedly took 7 wickets, earning him the Player of the Match award.',
                    '<h3>Key Moments</h3>',
                    'On the fourth day, Bangladesh was in batting trouble at 87 for 7, but Shakib Al Hasan and Mehidy Hasan Miraz rescued the innings.',
                    '<blockquote>This win is a milestone in Bangladesh cricket history. We proved we can do it. — Captain Najmul Shanto</blockquote>',
                ]),
                'tags' => ['bd-cricket', 'cricket'],
                'is_featured' => true, 'is_breaking' => true,
                'hours_ago' => 14, 'views' => 67800,
            ],
            [
                'category' => 'sports', 'sub' => 'cricket-news',
                'title_bn' => 'সাকিব আল হাসান টেস্ট ক্রিকেট থেকে অবসর নিচ্ছেন, ভক্তদের মধ্যে মিশ্র প্রতিক্রিয়া',
                'title_en' => 'Shakib Al Hasan to retire from Test cricket, mixed reaction from fans',
                'excerpt_bn' => 'বাংলাদেশের সর্বকালের সেরা ক্রিকেটার সাকিব আল হাসান টেস্ট ক্রিকেট থেকে অবসরের ঘোষণা দিয়েছেন।',
                'excerpt_en' => 'Bangladesh\'s greatest cricketer Shakib Al Hasan has announced his retirement from Test cricket.',
                'body_bn' => $this->body_bn('সাকিব অবসর', [
                    'বাংলাদেশ ক্রিকেটের পোস্টারবয় ও সর্বকালের সেরা অলরাউন্ডার সাকিব আল হাসান টেস্ট ক্রিকেট থেকে অবসর নেওয়ার সিদ্ধান্ত নিয়েছেন। তিনি সামাজিক যোগাযোগমাধ্যমে এক বিবৃতিতে এই ঘোষণা দেন।',
                    '১৭ বছরের দীর্ঘ টেস্ট ক্যারিয়ারে সাকিব ৭০টি টেস্টে ৫,১৮৬ রান ও ২৪৬ উইকেট নিয়েছেন। তিনি বিশ্বের প্রথম ক্রিকেটার যিনি একটি আসরে ৫ হাজার রান ও ২৫০ উইকেটের মাইলফলক ছুঁয়েছেন।',
                    '<h3>বিবৃতিতে যা বললেন</h3>',
                    '<blockquote>টেস্ট ক্রিকেট সবসময় আমার হৃদয়ের কাছের। কিন্তু এখন সময় এসেছে পরের প্রজন্মের জন্য জায়গা করে দেওয়ার। — সাকিব আল হাসান</blockquote>',
                    'তবে সাকিব জানিয়েছেন, তিনি টি-টোয়েন্টি ও ওয়ানডে ক্রিকেট চালিয়ে যাবেন। বিশ্বকাপ পর্যন্ত খেলার ইচ্ছা আছে তাঁর।',
                ]),
                'body_en' => $this->body_en('Shakib Retirement', [
                    'Bangladesh\'s greatest all-rounder and poster boy of cricket, Shakib Al Hasan, has decided to retire from Test cricket, announcing it via social media.',
                    'In a 17-year Test career, Shakib has scored 5,186 runs and taken 246 wickets in 70 Tests. He is the first cricketer in history to achieve 5,000 runs and 250 wickets in a single format.',
                    '<blockquote>Test cricket is always close to my heart. But now it is time to make way for the next generation. — Shakib Al Hasan</blockquote>',
                    'Shakib said he will continue playing T20 and ODI cricket and hopes to play until the World Cup.',
                ]),
                'tags' => ['shakib-al-hasan', 'bd-cricket'],
                'is_featured' => true, 'is_breaking' => false,
                'hours_ago' => 36, 'views' => 89200,
            ],
            [
                'category' => 'sports', 'sub' => 'football-news',
                'title_bn' => 'ফিফা বিশ্বকাপ বাছাইয়ে বাংলাদেশ কুয়েতের বিপক্ষে ১-০ গোলে পরাজিত',
                'title_en' => 'Bangladesh loses 1-0 to Kuwait in FIFA World Cup qualifier',
                'excerpt_bn' => 'ফিফা বিশ্বকাপ বাছাই পর্বে বাংলাদেশ ফুটবল দল কুয়েতের কাছে হেরেছে।',
                'excerpt_en' => 'Bangladesh football team has lost to Kuwait in the FIFA World Cup qualifier.',
                'body_bn' => $this->body_bn('বাংলাদেশ ফুটবল', [
                    'ফিফা বিশ্বকাপ ২০২৬ বাছাই পর্বে বাংলাদেশ ফুটবল দল কুয়েতের কাছে ১-০ গোলে পরাজিত হয়েছে। কুয়েতের আব্দুল্লাহ আল-বুরাইদি ম্যাচের ৬৭তম মিনিটে একমাত্র গোলটি করেন।',
                    'বাংলাদেশ দল বেশ কয়েকটি ভালো সুযোগ পেলেও গোল করতে পারেনি।',
                    '<h3>কোচের মন্তব্য</h3>',
                    '<blockquote>দলের পারফরম্যান্স ভালো ছিল, কিন্তু ফিনিশিং দুর্বল। আমরা পরের ম্যাচে উন্নতি করব। — বাংলাদেশ কোচ</blockquote>',
                    'বাংলাদেশ এখন গ্রুপে তৃতীয় স্থানে রয়েছে। পরের ম্যাচ অস্ট্রেলিয়ার বিপক্ষে।',
                ]),
                'body_en' => $this->body_en('Bangladesh Football', [
                    'Bangladesh football team has lost 1-0 to Kuwait in the FIFA World Cup 2026 qualifier. Kuwait\'s Abdullah Al-Buraidi scored the only goal in the 67th minute.',
                    'Bangladesh had several good chances but couldn\'t finish.',
                    'Bangladesh is now third in the group. Their next match is against Australia.',
                ]),
                'tags' => ['football'],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 28, 'views' => 22100,
            ],

            // ════════ বিনোদন ══════════════════════════════════════════════════
            [
                'category' => 'entertainment', 'sub' => 'cinema',
                'title_bn' => '"সুড়ঙ্গ" চলচ্চিত্র কান উৎসবে বিশেষ মনোনয়ন পেয়েছে, নির্মাতার প্রতিক্রিয়া',
                'title_en' => '"Surong" film receives special nomination at Cannes festival',
                'excerpt_bn' => 'বাংলাদেশের চলচ্চিত্র "সুড়ঙ্গ" কান চলচ্চিত্র উৎসবে বিশেষ মনোনয়ন পেয়ে দেশের মুখ উজ্জ্বল করেছে।',
                'excerpt_en' => 'Bangladesh film "Surong" has received a special nomination at the Cannes Film Festival.',
                'body_bn' => $this->body_bn('কান চলচ্চিত্র', [
                    'বাংলাদেশের স্বাধীনচেতা নির্মাতা রাহুল আনন্দের সিনেমা "সুড়ঙ্গ" ফ্রান্সের কান চলচ্চিত্র উৎসবে "আন সার্টেন রিগার্ড" বিভাগে বিশেষ মনোনয়ন পেয়েছে। এটি বাংলাদেশের সিনেমার জন্য একটি ঐতিহাসিক মুহূর্ত।',
                    'সিনেমাটি মুক্তিযুদ্ধের প্রেক্ষাপটে একটি গ্রামীণ পরিবারের গল্প বলে। এর চিত্রগ্রহণ ও অভিনয় ইতোমধ্যে আন্তর্জাতিক চলচ্চিত্র বিশ্লেষকদের প্রশংসা পেয়েছে।',
                    '<h3>নির্মাতার অনুভূতি</h3>',
                    '<blockquote>এটি কেবল আমার সিনেমার নয়, পুরো বাংলাদেশের চলচ্চিত্র শিল্পের স্বীকৃতি। — রাহুল আনন্দ, পরিচালক</blockquote>',
                    'বাংলাদেশ চলচ্চিত্র সংসদ নির্মাতাকে অভিনন্দন জানিয়ে সংবর্ধনার ঘোষণা দিয়েছে।',
                ]),
                'body_en' => $this->body_en('Cannes Film', [
                    'Bangladeshi filmmaker Rahul Ananda\'s film "Surong" has received a special nomination in the "Un Certain Regard" section of the Cannes Film Festival — a historic moment for Bangladeshi cinema.',
                    'The film tells the story of a rural family against the backdrop of the Liberation War, drawing critical praise for its cinematography and performances.',
                    '<blockquote>This is not just recognition for my film, but for the entire Bangladeshi film industry. — Rahul Ananda, Director</blockquote>',
                ]),
                'tags' => [],
                'is_featured' => true, 'is_breaking' => false,
                'hours_ago' => 48, 'views' => 24500,
            ],
            [
                'category' => 'entertainment', 'sub' => 'music',
                'title_bn' => 'জনপ্রিয় শিল্পী মিতার নতুন অ্যালবাম "নীলাকাশ" মুক্তি পেল, পাওয়া যাচ্ছে স্ট্রিমিং প্ল্যাটফর্মে',
                'title_en' => 'Popular singer Mita\'s new album "Nilakash" released on streaming platforms',
                'excerpt_bn' => 'বাংলাদেশের জনপ্রিয় কণ্ঠশিল্পী মিতা হক তাঁর নতুন অ্যালবাম "নীলাকাশ" প্রকাশ করেছেন।',
                'excerpt_en' => 'Bangladeshi popular singer Mita Haque has released her new album "Nilakash".',
                'body_bn' => $this->body_bn('মিতার অ্যালবাম', [
                    'দীর্ঘ তিন বছর পর বাংলাদেশের সংগীতজগতে ফিরলেন কণ্ঠশিল্পী মিতা হক। তাঁর নতুন অ্যালবাম "নীলাকাশ" আজ আনুষ্ঠানিকভাবে সব প্রধান স্ট্রিমিং প্ল্যাটফর্মে মুক্তি পেয়েছে।',
                    'এই অ্যালবামে মোট ১২টি গান রয়েছে। রবীন্দ্রসংগীত, নজরুলগীতি ও আধুনিক বাংলা গানের মিশ্রণে তৈরি এই অ্যালবামটি শ্রোতাদের মধ্যে ব্যাপক সাড়া ফেলেছে।',
                    '<h3>শিল্পীর অনুভূতি</h3>',
                    '<blockquote>এই অ্যালবামে আমার নিজেকে খুঁজে পাওয়ার গল্প আছে। প্রতিটি গান একটি অনুভূতি। — মিতা হক</blockquote>',
                ]),
                'body_en' => $this->body_en('Album Release', [
                    'After three years, singer Mita Haque has returned to the Bangladeshi music scene with her new album "Nilakash", released today on all major streaming platforms.',
                    'The album features 12 songs, blending Rabindra Sangeet, Nazrul Geeti, and modern Bangla music.',
                    '<blockquote>This album has the story of finding myself. Each song is a feeling. — Mita Haque</blockquote>',
                ]),
                'tags' => [],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 30, 'views' => 15600,
            ],
            [
                'category' => 'entertainment', 'sub' => 'television',
                'title_bn' => 'ঢাকা আন্তর্জাতিক চলচ্চিত্র উৎসব ২০২৫-এ আসছেন বিশ্বের ৫০ দেশের চলচ্চিত্র',
                'title_en' => 'Films from 50 countries coming to Dhaka International Film Festival 2025',
                'excerpt_bn' => '২৩তম ঢাকা আন্তর্জাতিক চলচ্চিত্র উৎসবে ৫০টি দেশের ২২৫টি চলচ্চিত্র প্রদর্শিত হবে।',
                'excerpt_en' => '225 films from 50 countries will be screened at the 23rd Dhaka International Film Festival.',
                'body_bn' => $this->body_bn('ঢাকা আন্তর্জাতিক চলচ্চিত্র উৎসব', [
                    '২৩তম ঢাকা আন্তর্জাতিক চলচ্চিত্র উৎসব আগামী মাসে অনুষ্ঠিত হতে যাচ্ছে। এবার ৫০টি দেশের ২২৫টি চলচ্চিত্র প্রদর্শিত হবে।',
                    'উৎসবে বাংলাদেশ বিভাগ, এশিয়া বিভাগ, শিশু চলচ্চিত্র বিভাগ এবং স্পিরিচুয়াল বিভাগে চলচ্চিত্র থাকবে।',
                    '<h3>বিশেষ আকর্ষণ</h3>',
                    'এবারের উৎসবে ইরানের বিখ্যাত পরিচালক মাজিদ মাজিদি সম্মানসূচক পুরস্কার পাবেন। তিনি ব্যক্তিগতভাবে ঢাকায় উপস্থিত থাকবেন।',
                ]),
                'body_en' => $this->body_en('Dhaka Film Festival', [
                    'The 23rd Dhaka International Film Festival is set to take place next month, featuring 225 films from 50 countries.',
                    'The festival includes sections for Bangladesh, Asia, children\'s films, and spiritual cinema.',
                    'This year, renowned Iranian director Majid Majidi will receive an honorary award and attend in person.',
                ]),
                'tags' => [],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 60, 'views' => 9800,
            ],

            // ════════ প্রযুক্তি ════════════════════════════════════════════════
            [
                'category' => 'technology', 'sub' => 'innovation',
                'title_bn' => 'বাংলাদেশে ৫জি নেটওয়ার্কের পরীক্ষামূলক কার্যক্রম শুরু হচ্ছে এ বছরের শেষে',
                'title_en' => '5G network pilot to begin in Bangladesh by end of this year',
                'excerpt_bn' => 'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন এ বছরের শেষে ৫জি পরীক্ষামূলক কার্যক্রম শুরুর ঘোষণা দিয়েছে।',
                'excerpt_en' => 'Bangladesh Telecommunication Regulatory Commission has announced a 5G pilot program to begin by the end of this year.',
                'body_bn' => $this->body_bn('৫জি বাংলাদেশ', [
                    'বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (বিটিআরসি) জানিয়েছে, আগামী ডিসেম্বরের মধ্যে দেশে ৫জি নেটওয়ার্কের পরীক্ষামূলক কার্যক্রম শুরু হবে। ঢাকা, চট্টগ্রাম ও সিলেটে প্রথম পর্যায়ে ৫জি চালু করা হবে।',
                    'মোবাইল অপারেটর রবি ও গ্রামীণফোন ইতোমধ্যে স্পেকট্রাম বরাদ্দের জন্য আবেদন করেছে।',
                    '<h3>কী সুবিধা পাবে সাধারণ মানুষ?</h3>',
                    '<ul><li>ইন্টারনেট গতি ৪জি-এর চেয়ে ১০০ গুণ বেশি</li><li>ভিডিও কলে বাধামুক্ত অভিজ্ঞতা</li><li>স্মার্ট কৃষি ও শিল্পে ব্যবহারের সুযোগ</li><li>স্বায়ত্তশাসিত যানবাহনের পথ তৈরি</li></ul>',
                    '<blockquote>৫জি বাংলাদেশের ডিজিটাল রূপান্তরকে নতুন উচ্চতায় নিয়ে যাবে। — বিটিআরসি চেয়ারম্যান</blockquote>',
                ]),
                'body_en' => $this->body_en('5G Bangladesh', [
                    'The Bangladesh Telecommunication Regulatory Commission (BTRC) has announced that a 5G pilot program will begin by December, starting in Dhaka, Chattogram, and Sylhet.',
                    'Mobile operators Robi and Grameenphone have already applied for spectrum allocation.',
                    '<h3>Benefits for the Public</h3>',
                    '<ul><li>Internet speed 100x faster than 4G</li><li>Uninterrupted video calling</li><li>Smart agriculture and industry applications</li><li>Foundation for autonomous vehicles</li></ul>',
                ]),
                'tags' => ['ai-technology'],
                'is_featured' => true, 'is_breaking' => false,
                'hours_ago' => 16, 'views' => 19200,
            ],
            [
                'category' => 'technology', 'sub' => 'cybersecurity',
                'title_bn' => 'সরকারি ওয়েবসাইটে সাইবার হামলা, কোটি কোটি নাগরিকের তথ্য ঝুঁকিতে',
                'title_en' => 'Cyberattack on government websites, data of millions of citizens at risk',
                'excerpt_bn' => 'হ্যাকার গোষ্ঠী একাধিক সরকারি ওয়েবসাইট থেকে নাগরিকদের ব্যক্তিগত তথ্য চুরি করেছে বলে অভিযোগ।',
                'excerpt_en' => 'A hacker group is alleged to have stolen personal data of citizens from multiple government websites.',
                'body_bn' => $this->body_bn('সাইবার হামলা', [
                    'বাংলাদেশের কয়েকটি গুরুত্বপূর্ণ সরকারি ওয়েবসাইট সাইবার হামলার শিকার হয়েছে বলে তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ নিশ্চিত করেছে। হ্যাকাররা প্রায় ৫ কোটি নাগরিকের নাম, ঠিকানা ও জাতীয় পরিচয়পত্র নম্বর সংগ্রহ করেছে বলে দাবি করা হচ্ছে।',
                    'নিরাপত্তা বিশ্লেষকরা বলছেন, এটি বাংলাদেশের ইতিহাসে সবচেয়ে বড় তথ্য ফাঁসের ঘটনা হতে পারে।',
                    '<h3>কীভাবে ঘটল?</h3>',
                    'প্রাথমিক তদন্তে জানা গেছে, একটি অপ্রচলিত সফটওয়্যার দুর্বলতার সুযোগ নিয়ে হামলাকারীরা সিস্টেমে প্রবেশ করেছে।',
                    '<blockquote>আমরা বিষয়টি তদন্ত করছি এবং ক্ষতিগ্রস্তদের সুরক্ষায় দ্রুত ব্যবস্থা নেওয়া হবে। — তথ্যপ্রযুক্তি মন্ত্রী</blockquote>',
                ]),
                'body_en' => $this->body_en('Cyberattack', [
                    'The ICT Division has confirmed that several key government websites have been targeted in a cyberattack. Hackers claim to have collected names, addresses, and national ID numbers of about 50 million citizens.',
                    'Security analysts say this could be the largest data breach in Bangladesh\'s history.',
                    'Initial investigation shows attackers exploited an obsolete software vulnerability to gain access.',
                ]),
                'tags' => ['cyber-security'],
                'is_featured' => false, 'is_breaking' => true,
                'hours_ago' => 22, 'views' => 41200,
            ],
            [
                'category' => 'technology', 'sub' => 'artificial-intelligence',
                'title_bn' => 'বাংলাদেশি স্টার্টআপের এআই সিস্টেম বিশ্বের সেরা ১০-এ স্থান পেয়েছে',
                'title_en' => 'Bangladeshi startup\'s AI system ranks in global top 10',
                'excerpt_bn' => 'ঢাকাভিত্তিক একটি স্টার্টআপের কৃত্রিম বুদ্ধিমত্তা সফটওয়্যার আন্তর্জাতিক প্রতিযোগিতায় বিশ্বসেরা ১০-এ জায়গা করে নিয়েছে।',
                'excerpt_en' => 'A Dhaka-based startup\'s AI software has placed in the global top 10 in an international competition.',
                'body_bn' => $this->body_bn('বাংলাদেশি এআই', [
                    'ঢাকার একটি তরুণ প্রযুক্তি উদ্যোগ "টেকডেক্স" স্ট্যানফোর্ড বিশ্ববিদ্যালয় আয়োজিত বার্ষিক এআই প্রতিযোগিতায় বিশ্বসেরা ১০ এ জায়গা করে নিয়ে বাংলাদেশকে গর্বিত করেছে।',
                    'তাদের তৈরি করা কৃষি সহায়তা চ্যাটবটটি বাংলাদেশের কৃষকদের আবহাওয়া পূর্বাভাস ও ফসল ব্যবস্থাপনার পরামর্শ দিতে সক্ষম।',
                    '<h3>প্রতিষ্ঠাতার কথা</h3>',
                    '<blockquote>আমরা বিশ্বাস করি প্রযুক্তি দেশের কৃষকদের জীবন বদলে দিতে পারে। এই পুরস্কার আমাদের অনুপ্রেরণা। — রাফি হোসেন, সিইও টেকডেক্স</blockquote>',
                    'সরকারের আইসিটি বিভাগ এই স্টার্টআপকে বিশেষ অনুদান দেওয়ার কথা ঘোষণা করেছে।',
                ]),
                'body_en' => $this->body_en('Bangladeshi AI', [
                    'Dhaka-based startup "TechDex" has made Bangladesh proud by ranking in the global top 10 at Stanford University\'s annual AI competition.',
                    'Their agriculture chatbot provides Bangladesh\'s farmers with weather forecasts and crop management advice.',
                    '<blockquote>We believe technology can transform the lives of farmers in our country. This award is our inspiration. — Rafi Hossain, CEO TechDex</blockquote>',
                    'The government\'s ICT Division has announced a special grant for this startup.',
                ]),
                'tags' => ['ai', 'ai-technology'],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 40, 'views' => 16800,
            ],

            // ════════ লাইফস্টাইল ══════════════════════════════════════════════
            [
                'category' => 'lifestyle', 'sub' => 'health',
                'title_bn' => 'ডেঙ্গু রোগীর সংখ্যা বাড়ছে, সতর্কতা জারি স্বাস্থ্য অধিদপ্তরের',
                'title_en' => 'Dengue cases rising, health directorate issues alert',
                'excerpt_bn' => 'দেশে ডেঙ্গু রোগীর সংখ্যা উদ্বেগজনকভাবে বাড়ছে, হাসপাতালে চাপ বাড়ছে।',
                'excerpt_en' => 'Dengue cases are rising alarmingly across the country, putting pressure on hospitals.',
                'body_bn' => $this->body_bn('ডেঙ্গু সংকট', [
                    'দেশে ডেঙ্গু পরিস্থিতি আবারও উদ্বেগজনক পর্যায়ে পৌঁছেছে। স্বাস্থ্য অধিদপ্তরের সর্বশেষ তথ্যানুযায়ী, চলতি বছর এখন পর্যন্ত ৩৫ হাজারের বেশি ডেঙ্গু রোগী শনাক্ত হয়েছেন এবং ১৫০ জনের বেশি মারা গেছেন।',
                    'ঢাকার বাইরেও এবার ডেঙ্গু ছড়িয়ে পড়েছে। চট্টগ্রাম, সিলেট ও রাজশাহীতেও উল্লেখযোগ্য রোগী পাওয়া যাচ্ছে।',
                    '<h3>সতর্কতা অবলম্বনে করণীয়</h3>',
                    '<ul><li>বাড়ির আশেপাশে পানি জমতে না দেওয়া</li><li>দিনের বেলাও মশার কয়েল ব্যবহার</li><li>জ্বর হলে সঙ্গে সঙ্গে চিকিৎসকের কাছে যাওয়া</li><li>পূর্ণ আস্তিন পোশাক পরা</li></ul>',
                    '<blockquote>ডেঙ্গু থেকে বাঁচতে সচেতনতাই মূল অস্ত্র। প্রতিটি পরিবারকে সতর্ক থাকতে হবে। — স্বাস্থ্য অধিদপ্তরের মহাপরিচালক</blockquote>',
                ]),
                'body_en' => $this->body_en('Dengue Crisis', [
                    'The dengue situation in the country has again reached alarming levels. According to the latest data from the Directorate General of Health Services, more than 35,000 dengue cases have been confirmed this year, with over 150 deaths.',
                    'This year dengue has spread outside Dhaka too, with significant cases in Chattogram, Sylhet, and Rajshahi.',
                    '<h3>Prevention Measures</h3>',
                    '<ul><li>Prevent water from accumulating near homes</li><li>Use mosquito coils even during the day</li><li>See a doctor immediately when fever occurs</li><li>Wear full-sleeve clothing</li></ul>',
                ]),
                'tags' => [],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 11, 'views' => 25600,
            ],
            [
                'category' => 'lifestyle', 'sub' => 'travel',
                'title_bn' => 'সুন্দরবন ভ্রমণে নতুন নিষেধাজ্ঞা, রেজিস্ট্রেশন বাধ্যতামূলক করা হয়েছে',
                'title_en' => 'New restrictions on Sundarbans tourism, registration made mandatory',
                'excerpt_bn' => 'পরিবেশ রক্ষায় সুন্দরবনে পর্যটকদের প্রবেশে নতুন বিধিমালা জারি হয়েছে।',
                'excerpt_en' => 'New regulations on tourist entry into the Sundarbans have been issued for environmental protection.',
                'body_bn' => $this->body_bn('সুন্দরবন পর্যটন', [
                    'বিশ্বের বৃহত্তম ম্যানগ্রোভ বন সুন্দরবনে পর্যটক নিয়ন্ত্রণে সরকার নতুন বিধিমালা জারি করেছে। এখন থেকে সুন্দরবনে যেতে হলে অনলাইনে আগাম নিবন্ধন বাধ্যতামূলক।',
                    'একই সাথে প্রতিদিন সর্বোচ্চ পাঁচ হাজার পর্যটক প্রবেশ করতে পারবেন। ড্রোন ওড়ানো ও প্লাস্টিক নিয়ে যাওয়া সম্পূর্ণ নিষিদ্ধ।',
                    '<h3>কেন এই পদক্ষেপ?</h3>',
                    'গত কয়েক বছরে সুন্দরবনে পর্যটকের সংখ্যা অতিরিক্ত বেড়ে গিয়েছিল, যা বনের জীববৈচিত্র্যের জন্য হুমকি হয়ে দাঁড়িয়েছিল।',
                ]),
                'body_en' => $this->body_en('Sundarbans Tourism', [
                    'The government has issued new regulations to control tourists entering the Sundarbans, the world\'s largest mangrove forest. Online advance registration is now mandatory for visits.',
                    'A maximum of 5,000 tourists per day will be allowed. Drones and plastic are completely banned.',
                    'The increased tourist numbers in recent years had become a threat to the forest\'s biodiversity.',
                ]),
                'tags' => [],
                'is_featured' => false, 'is_breaking' => false,
                'hours_ago' => 72, 'views' => 13400,
            ],
        ];

        // Create all articles
        foreach ($articles as $idx => $a) {
            $cat   = $cats->get($a['category']);
            $sub   = isset($a['sub']) ? $cats->get($a['sub']) : null;

            if (!$cat) continue;

            $slugBn  = $slug($a['title_bn'], $idx + 1);
            $slugEn  = Str::slug($a['title_en']) . '-' . ($idx + 1);
            $aId     = $authorId();

            $article = Article::firstOrCreate(
                ['slug_bn' => $slugBn],
                [
                    'category_id'  => $cat->id,
                    'author_id'    => $aId,
                    'title_bn'     => $a['title_bn'],
                    'title_en'     => $a['title_en'],
                    'slug_en'      => $slugEn,
                    'body_bn'      => $a['body_bn'],
                    'body_en'      => $a['body_en'],
                    'excerpt_bn'   => $a['excerpt_bn'],
                    'excerpt_en'   => $a['excerpt_en'],
                    'edition'      => 'both',
                    'article_type' => 'news',
                    'status'       => 'published',
                    'is_breaking'  => $a['is_breaking'],
                    'is_featured'  => $a['is_featured'],
                    'published_at' => now()->subHours($a['hours_ago']),
                    'featured_image' => 'https://picsum.photos/seed/' . ($idx + 1) . 'news/800/450',
                    'views'        => $a['views'],
                ]
            );

            // Attach tags
            if (!empty($a['tags'])) {
                $tagIds = collect($a['tags'])->map(fn($s) => $tagMap[$s] ?? null)->filter()->pluck('id');
                $article->tags()->syncWithoutDetaching($tagIds);
            }

            // Update tag counts
            foreach ($a['tags'] as $tSlug) {
                if (isset($tagMap[$tSlug])) {
                    $tagMap[$tSlug]->increment('article_count');
                }
            }
        }

        $this->command->info('✅ Realistic articles seeded successfully!');
    }

    private function body_bn(string $topic, array $paragraphs): string
    {
        return implode("\n", $paragraphs);
    }

    private function body_en(string $topic, array $paragraphs): string
    {
        return implode("\n", $paragraphs);
    }
}
