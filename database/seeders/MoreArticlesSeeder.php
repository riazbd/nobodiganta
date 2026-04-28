<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MoreArticlesSeeder extends Seeder
{
    public function run(): void
    {
        $author = User::where('email', 'editor@nobodigonto.com')->first()
            ?? User::where('role', 'editor_in_chief')->first()
            ?? User::first();

        $cats = Category::all()->keyBy('slug');

        $now = now();

        $items = [

            // ═══════════ বাংলাদেশ ════════════════════════════════════════════
            [
                'cat' => 'bangladesh', 'sub' => 'national',
                'title_bn' => 'দেশে বিদ্যুৎ উৎপাদন সক্ষমতা ৩০ হাজার মেগাওয়াট ছাড়িয়েছে',
                'title_en' => 'Bangladesh power generation capacity exceeds 30,000 MW',
                'excerpt_bn' => 'দেশের বিদ্যুৎ উৎপাদন সক্ষমতা নতুন মাইলফলক অতিক্রম করেছে।',
                'excerpt_en' => 'The country has crossed a major milestone in power generation capacity.',
                'body_bn' => '<p>বাংলাদেশের বিদ্যুৎ খাত নতুন মাইলফলক অর্জন করেছে। সরকারি তথ্যানুযায়ী দেশের মোট বিদ্যুৎ উৎপাদন সক্ষমতা এখন ৩০ হাজার মেগাওয়াটের উপরে।</p><p>বিদ্যুৎ বিভাগ সূত্রে জানা গেছে, নতুন বেসরকারি বিদ্যুৎকেন্দ্র স্থাপন এবং নবায়নযোগ্য শক্তির ব্যবহার বাড়ানোর ফলে এই সাফল্য সম্ভব হয়েছে।</p><h3>সৌরশক্তিতে বিপ্লব</h3><p>গত দুই বছরে দেশে সোলার হোম সিস্টেমের সংখ্যা দ্বিগুণ হয়েছে। গ্রামীণ এলাকায় বিদ্যুতায়নে এটি গুরুত্বপূর্ণ ভূমিকা রাখছে।</p>',
                'body_en' => '<p>Bangladesh has crossed a new milestone in power generation. According to official data, total installed capacity now exceeds 30,000 MW.</p><p>The Power Division says new private power plants and increased use of renewable energy have contributed to this achievement.</p><h3>Solar Energy Revolution</h3><p>The number of solar home systems in the country has doubled over the past two years, playing a major role in rural electrification.</p>',
                'h' => 8, 'views' => 9800, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'bangladesh', 'sub' => 'dhaka-news',
                'title_bn' => 'ঢাকার বায়ু দূষণ নিয়ন্ত্রণে কঠোর পদক্ষেপ নেবে সরকার',
                'title_en' => 'Government to take strict steps to control Dhaka air pollution',
                'excerpt_bn' => 'রাজধানীর বায়ু মান উন্নয়নে সরকার একগুচ্ছ পরিকল্পনা হাতে নিয়েছে।',
                'excerpt_en' => 'The government has drawn up plans to improve air quality in the capital.',
                'body_bn' => '<p>ঢাকা বিশ্বের সবচেয়ে দূষিত শহরগুলোর মধ্যে অন্যতম। পরিবেশ অধিদপ্তরের তথ্য বলছে, ঢাকার বায়ু মান সূচক (AQI) প্রায়ই ২০০ ছাড়িয়ে যায়, যা স্বাস্থ্যের জন্য ক্ষতিকর।</p><p>সরকার ২০২৬ সালের মধ্যে ইট ভাটার সংখ্যা অর্ধেকে নামিয়ে আনা এবং সব পুরনো যানবাহন বন্ধ করার পরিকল্পনা করছে।</p><blockquote>পরিষ্কার বায়ু আমাদের অধিকার। সরকার এই বিষয়ে আপোসহীন থাকবে। — পরিবেশমন্ত্রী</blockquote>',
                'body_en' => '<p>Dhaka is among the most polluted cities in the world. The Department of Environment says the Air Quality Index (AQI) in Dhaka frequently exceeds 200, which is harmful to health.</p><p>The government plans to halve the number of brick kilns by 2026 and ban all old vehicles.</p><blockquote>Clean air is our right. The government will not compromise on this issue. — Minister of Environment</blockquote>',
                'h' => 14, 'views' => 11200, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'bangladesh', 'sub' => 'countrywide',
                'title_bn' => 'সারাদেশে ডেঙ্গু পরিস্থিতির অবনতি, হাসপাতালে রোগীর ভিড়',
                'title_en' => 'Dengue situation worsens across the country, hospitals overwhelmed',
                'excerpt_bn' => 'ডেঙ্গু জ্বরের প্রকোপে সারাদেশের হাসপাতালগুলো রোগীতে উপচে পড়ছে।',
                'excerpt_en' => 'Hospitals across the country are overwhelmed with dengue patients.',
                'body_bn' => '<p>এবার ডেঙ্গু জ্বরের প্রকোপ অন্য বছরের তুলনায় বেশি ভয়াবহ। স্বাস্থ্য অধিদপ্তরের হিসাব অনুযায়ী, চলতি মাসে সারাদেশে ডেঙ্গুতে আক্রান্ত হয়েছেন প্রায় ১৫ হাজার মানুষ।</p><h3>ঢাকায় পরিস্থিতি সবচেয়ে খারাপ</h3><p>ঢাকার হাসপাতালগুলোতে ডেঙ্গু রোগীর চাপ সামলাতে হিমশিম খাচ্ছেন চিকিৎসকরা। শয্যা সংকটে পড়ে অনেক রোগীকে মেঝেতে রাখতে হচ্ছে।</p><p>চিকিৎসকরা পরামর্শ দিচ্ছেন, বাড়িতে পানি জমতে না দেওয়া, মশারি ব্যবহার করা এবং লক্ষণ দেখা দিলে দ্রুত চিকিৎসা নিতে।</p>',
                'body_en' => '<p>This year\'s dengue outbreak is more severe than previous years. According to the Directorate General of Health Services, approximately 15,000 people have been infected with dengue this month.</p><h3>Worst in Dhaka</h3><p>Hospitals in Dhaka are struggling to handle the influx of dengue patients. Due to bed shortages, many patients are being kept on floors.</p>',
                'h' => 20, 'views' => 14600, 'featured' => true, 'breaking' => true,
            ],

            // ═══════════ আন্তর্জাতিক ═════════════════════════════════════════
            [
                'cat' => 'international', 'sub' => 'asia',
                'title_bn' => 'ভারতে সাধারণ নির্বাচন: মোদির বিজেপি টানা তৃতীয়বার জয়ী',
                'title_en' => 'India general election: Modi\'s BJP wins for third consecutive term',
                'excerpt_bn' => 'ভারতের লোকসভা নির্বাচনে নরেন্দ্র মোদির নেতৃত্বে বিজেপি জোট আবারো সরকার গঠন করতে যাচ্ছে।',
                'excerpt_en' => 'The BJP-led alliance under Narendra Modi is set to form government again in India\'s Lok Sabha elections.',
                'body_bn' => '<p>ভারতের ১৮তম লোকসভা নির্বাচনের ফলাফলে নরেন্দ্র মোদির নেতৃত্বে বিজেপি জোট টানা তৃতীয়বারের মতো সরকার গঠন করতে যাচ্ছে। তবে এবার জোট সংখ্যাগরিষ্ঠতার ওপর বেশি নির্ভরশীল।</p><h3>বাংলাদেশের জন্য তাৎপর্য</h3><p>এই নির্বাচনের ফলাফল বাংলাদেশ-ভারত সম্পর্কে সরাসরি প্রভাব ফেলবে। বিশেষজ্ঞরা মনে করেন, তিস্তা পানি বণ্টন চুক্তি এবং বাণিজ্য সম্পর্কে নতুন গতি আসতে পারে।</p>',
                'body_en' => '<p>In India\'s 18th Lok Sabha election results, the BJP-led National Democratic Alliance under Narendra Modi is forming government for a third consecutive term, though this time more dependent on coalition partners.</p><h3>Significance for Bangladesh</h3><p>The election outcome will directly affect Bangladesh-India relations. Experts believe the Teesta water-sharing deal and trade relations may see new momentum.</p>',
                'h' => 36, 'views' => 16300, 'featured' => true, 'breaking' => false,
            ],
            [
                'cat' => 'international', 'sub' => 'middle-east',
                'title_bn' => 'গাজায় যুদ্ধবিরতি কার্যকর, ইসরায়েল-হামাস বন্দি বিনিময় শুরু',
                'title_en' => 'Gaza ceasefire takes effect, Israel-Hamas prisoner exchange begins',
                'excerpt_bn' => 'মধ্যস্থতাকারীদের প্রচেষ্টায় গাজায় যুদ্ধবিরতি কার্যকর হয়েছে।',
                'excerpt_en' => 'A ceasefire in Gaza has taken effect following mediation efforts.',
                'body_bn' => '<p>মাসের পর মাস আলোচনার পর অবশেষে গাজায় যুদ্ধবিরতি কার্যকর হয়েছে। কাতার ও মিশরের মধ্যস্থতায় ইসরায়েল ও হামাসের মধ্যে এই চুক্তি সম্ভব হয়েছে।</p><p>প্রথম পর্যায়ে ৩৩ জন ইসরায়েলি বন্দিকে মুক্তি দেওয়ার বিনিময়ে ইসরায়েল প্রায় ৯০০ ফিলিস্তিনি বন্দিকে ছেড়ে দেবে।</p><blockquote>এটি একটি প্রাথমিক পদক্ষেপ, স্থায়ী শান্তির জন্য আরও অনেক পথ পাড়ি দিতে হবে। — জাতিসংঘ মহাসচিব</blockquote>',
                'body_en' => '<p>After months of negotiations, a ceasefire has finally taken effect in Gaza, made possible through mediation by Qatar and Egypt.</p><p>In the first phase, Israel will release approximately 900 Palestinian prisoners in exchange for the release of 33 Israeli hostages.</p><blockquote>This is a first step; much more needs to be done for lasting peace. — UN Secretary-General</blockquote>',
                'h' => 48, 'views' => 21400, 'featured' => true, 'breaking' => false,
            ],
            [
                'cat' => 'international', 'sub' => 'europe',
                'title_bn' => 'ইউক্রেন যুদ্ধ: ন্যাটো সদস্যরা সামরিক সহায়তা বাড়ানোর ঘোষণা দিল',
                'title_en' => 'Ukraine war: NATO members announce increased military aid',
                'excerpt_bn' => 'ন্যাটোর বৈঠকে সদস্য রাষ্ট্রগুলো ইউক্রেনকে আরও সামরিক সহায়তার প্রতিশ্রুতি দিয়েছে।',
                'excerpt_en' => 'NATO member states have pledged increased military support for Ukraine at the alliance summit.',
                'body_bn' => '<p>ন্যাটো সম্মেলনে সদস্য দেশগুলো ইউক্রেনকে সামরিক সহায়তা উল্লেখযোগ্যভাবে বাড়ানোর প্রতিশ্রুতি দিয়েছে। যুক্তরাষ্ট্র একা ৬০ বিলিয়ন ডলারের সহায়তা ঘোষণা করেছে।</p><p>রাশিয়া এই সিদ্ধান্তকে উস্কানিমূলক বলে অভিহিত করেছে এবং পাল্টা ব্যবস্থা নেওয়ার হুমকি দিয়েছে।</p>',
                'body_en' => '<p>NATO member states have pledged significantly increased military support for Ukraine at the alliance summit. The United States alone announced $60 billion in aid.</p><p>Russia has called the decision provocative and threatened countermeasures.</p>',
                'h' => 60, 'views' => 13200, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'international', 'sub' => 'asia',
                'title_bn' => 'রোহিঙ্গা সংকট: জাতিসংঘের নতুন তদন্তে মিয়ানমারের বিরুদ্ধে গণহত্যার প্রমাণ',
                'title_en' => 'Rohingya crisis: New UN probe finds genocide evidence against Myanmar',
                'excerpt_bn' => 'জাতিসংঘের নতুন তদন্তে রোহিঙ্গাদের বিরুদ্ধে গণহত্যার নতুন প্রমাণ উঠে এসেছে।',
                'excerpt_en' => 'A new UN investigation has uncovered fresh evidence of genocide against the Rohingya.',
                'body_bn' => '<p>জাতিসংঘের স্বাধীন তদন্তকারীরা মিয়ানমারে রোহিঙ্গাদের বিরুদ্ধে গণহত্যার নতুন প্রমাণ উন্মোচন করেছেন। ২০১৭ সালের পর থেকে বাংলাদেশে আশ্রয় নেওয়া ১০ লাখেরও বেশি রোহিঙ্গার প্রত্যাবাসন এখনো অনিশ্চিত।</p><p>বাংলাদেশের পররাষ্ট্র মন্ত্রণালয় জানিয়েছে, আন্তর্জাতিক সম্প্রদায়কে এই সংকট সমাধানে আরও সক্রিয় ভূমিকা রাখতে হবে।</p>',
                'body_en' => '<p>UN independent investigators have uncovered new evidence of genocide against the Rohingya in Myanmar. The repatriation of more than one million Rohingya who have taken refuge in Bangladesh since 2017 remains uncertain.</p><p>Bangladesh\'s Ministry of Foreign Affairs says the international community must play a more active role in resolving this crisis.</p>',
                'h' => 72, 'views' => 18900, 'featured' => false, 'breaking' => false,
            ],

            // ═══════════ রাজনীতি ══════════════════════════════════════════════
            [
                'cat' => 'politics', 'sub' => 'government',
                'title_bn' => 'মন্ত্রিসভায় রদবদল: পাঁচ মন্ত্রী বদলালেন দফতর',
                'title_en' => 'Cabinet reshuffle: Five ministers swap portfolios',
                'excerpt_bn' => 'প্রধানমন্ত্রীর কার্যালয় থেকে মন্ত্রিসভার বড় রদবদলের আদেশ জারি হয়েছে।',
                'excerpt_en' => 'A major cabinet reshuffle order has been issued from the Prime Minister\'s office.',
                'body_bn' => '<p>বাংলাদেশের মন্ত্রিসভায় বড় ধরনের রদবদল হয়েছে। পাঁচজন সিনিয়র মন্ত্রীকে নতুন দফতর দেওয়া হয়েছে এবং তিনজন নতুন মুখ মন্ত্রিসভায় স্থান পেয়েছেন।</p><h3>গুরুত্বপূর্ণ পরিবর্তন</h3><p>অর্থ মন্ত্রণালয়ে নতুন মন্ত্রী নিয়োগ পাওয়াটাই সবচেয়ে আলোচিত পরিবর্তন। ডলার সংকট মোকাবেলায় নতুন মন্ত্রীর কাছে প্রত্যাশা অনেক বেশি।</p>',
                'body_en' => '<p>Bangladesh has seen a major cabinet reshuffle. Five senior ministers have been given new portfolios and three new faces have joined the cabinet.</p><h3>Key Changes</h3><p>The appointment of a new Finance Minister is the most discussed change, with high expectations for addressing the dollar crisis.</p>',
                'h' => 6, 'views' => 19200, 'featured' => true, 'breaking' => false,
            ],
            [
                'cat' => 'politics', 'sub' => 'opposition',
                'title_bn' => 'বিরোধী দল সংসদ বর্জন অব্যাহত রেখেছে, সংলাপের আহ্বান',
                'title_en' => 'Opposition continues parliament boycott, calls for dialogue',
                'excerpt_bn' => 'প্রধান বিরোধী দল একাদশ দিনের মতো সংসদ বর্জন অব্যাহত রেখেছে।',
                'excerpt_en' => 'The main opposition party continues its parliament boycott for the eleventh consecutive day.',
                'body_bn' => '<p>প্রধান বিরোধী দল টানা একাদশ দিনের মতো জাতীয় সংসদ বর্জন করেছে। দলটির নেতারা বলছেন, সংসদে তাদের কথা না শোনা পর্যন্ত এই বর্জন অব্যাহত থাকবে।</p><p>অন্যদিকে সরকারি দলের নেতারা বিরোধী দলকে সংসদে ফিরে আসার আহ্বান জানিয়েছেন।</p>',
                'body_en' => '<p>The main opposition party has boycotted parliament for the eleventh consecutive day. Party leaders say the boycott will continue until their concerns are heard in parliament.</p><p>Government party leaders have meanwhile called on the opposition to return to parliament.</p>',
                'h' => 18, 'views' => 8400, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'politics', 'sub' => 'election',
                'title_bn' => 'নির্বাচন কমিশন আগামী উপজেলা ভোটের তারিখ ঘোষণা করল',
                'title_en' => 'Election Commission announces date for upcoming upazila polls',
                'excerpt_bn' => 'নির্বাচন কমিশন তিন ধাপে উপজেলা পরিষদ নির্বাচন আয়োজনের ঘোষণা দিয়েছে।',
                'excerpt_en' => 'The Election Commission has announced upazila council elections in three phases.',
                'body_bn' => '<p>বাংলাদেশ নির্বাচন কমিশন তিন ধাপে উপজেলা পরিষদ নির্বাচন আয়োজনের তারিখ ঘোষণা করেছে। প্রথম ধাপের ভোট আগামী মাসে অনুষ্ঠিত হবে।</p><p>৪৯২টি উপজেলায় এই নির্বাচন অনুষ্ঠিত হবে বলে জানিয়েছেন প্রধান নির্বাচন কমিশনার।</p><blockquote>সুষ্ঠু ও নিরপেক্ষ নির্বাচন নিশ্চিত করতে আমরা বদ্ধপরিকর। — প্রধান নির্বাচন কমিশনার</blockquote>',
                'body_en' => '<p>The Bangladesh Election Commission has announced dates for upazila council elections in three phases, with the first phase next month.</p><p>Elections will be held in 492 upazilas, the Chief Election Commissioner announced.</p><blockquote>We are determined to ensure free and fair elections. — Chief Election Commissioner</blockquote>',
                'h' => 30, 'views' => 11700, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'politics', 'sub' => 'government',
                'title_bn' => 'সরকার দিচ্ছে ১০ লাখ কর্মসংস্থান, নতুন কর্মসূচি ঘোষণা',
                'title_en' => 'Government announces new programme to create 1 million jobs',
                'excerpt_bn' => 'বেকারত্ব কমাতে সরকার নতুন একটি কর্মসংস্থান কর্মসূচি চালু করতে যাচ্ছে।',
                'excerpt_en' => 'The government is launching a new employment programme to reduce unemployment.',
                'body_bn' => '<p>বেকারত্ব মোকাবেলায় সরকার "কর্মসংস্থান বাংলাদেশ" নামে একটি নতুন কর্মসূচি ঘোষণা করেছে। এই কর্মসূচির আওতায় আগামী দুই বছরে ১০ লাখ নতুন কর্মসংস্থান সৃষ্টির লক্ষ্য নির্ধারণ করা হয়েছে।</p><p>বিশেষ করে তরুণ উদ্যোক্তাদের জন্য বিনা সুদে ঋণ এবং প্রশিক্ষণের ব্যবস্থা থাকবে।</p>',
                'body_en' => '<p>The government has announced a new programme called "Karmasangsthan Bangladesh" to address unemployment, with a target of creating 1 million new jobs over the next two years.</p><p>Interest-free loans and training will be available especially for young entrepreneurs.</p>',
                'h' => 40, 'views' => 7600, 'featured' => false, 'breaking' => false,
            ],

            // ═══════════ অর্থনীতি ════════════════════════════════════════════
            [
                'cat' => 'economy', 'sub' => 'stock-market',
                'title_bn' => 'ডিএসইতে সূচক পতন, বিনিয়োগকারীদের মধ্যে উদ্বেগ',
                'title_en' => 'DSE index falls, investors worried',
                'excerpt_bn' => 'ঢাকা স্টক এক্সচেঞ্জের সূচক টানা তৃতীয় দিনের মতো পড়েছে।',
                'excerpt_en' => 'The Dhaka Stock Exchange index has fallen for the third consecutive day.',
                'body_bn' => '<p>ঢাকা স্টক এক্সচেঞ্জের (ডিএসই) প্রধান সূচক ডিএসইএক্স আজ ৪৫ পয়েন্ট পড়ে ৬ হাজার ১৫০-এ নেমে এসেছে। টানা তৃতীয় দিনের মতো সূচক পতনে বিনিয়োগকারীদের মধ্যে উদ্বেগ বাড়ছে।</p><h3>কেন পড়ছে বাজার</h3><p>বিশ্লেষকরা বলছেন, আন্তর্জাতিক বাজারে অস্থিরতা এবং দেশে ডলার সংকটের কারণে বিদেশি বিনিয়োগকারীরা শেয়ার বিক্রি করছেন।</p>',
                'body_en' => '<p>The Dhaka Stock Exchange\'s main index DSEX fell 45 points today to 6,150, declining for the third consecutive day, increasing investor anxiety.</p><h3>Why the Market is Falling</h3><p>Analysts say global market volatility and the domestic dollar crisis are prompting foreign investors to sell shares.</p>',
                'h' => 4, 'views' => 13500, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'economy', 'sub' => 'remittance',
                'title_bn' => 'রেমিট্যান্স প্রবাহ বাড়ছে, আগস্টে এলো ২২০ কোটি ডলার',
                'title_en' => 'Remittance inflow rising, $2.2 billion received in August',
                'excerpt_bn' => 'প্রবাসী বাংলাদেশিদের পাঠানো অর্থের পরিমাণ উল্লেখযোগ্যভাবে বেড়েছে।',
                'excerpt_en' => 'The amount sent by Bangladeshi expatriates has increased significantly.',
                'body_bn' => '<p>গত আগস্ট মাসে প্রবাসীরা বাংলাদেশে ২২০ কোটি মার্কিন ডলার রেমিট্যান্স পাঠিয়েছেন, যা গত বছরের একই সময়ের তুলনায় ১৮ শতাংশ বেশি। বাংলাদেশ ব্যাংকের সূত্রে এ তথ্য জানা গেছে।</p><p>মধ্যপ্রাচ্য, যুক্তরাজ্য ও যুক্তরাষ্ট্র থেকে বেশি রেমিট্যান্স এসেছে।</p>',
                'body_en' => '<p>Bangladeshi expatriates sent $2.2 billion in remittances in August, up 18% from the same period last year, according to Bangladesh Bank.</p><p>The largest flows came from the Middle East, UK, and USA.</p>',
                'h' => 16, 'views' => 9100, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'economy', 'sub' => 'banking',
                'title_bn' => 'বাংলাদেশ ব্যাংক নীতি সুদহার ৫০ বেসিস পয়েন্ট বাড়াল',
                'title_en' => 'Bangladesh Bank raises policy rate by 50 basis points',
                'excerpt_bn' => 'মূল্যস্ফীতি নিয়ন্ত্রণে কেন্দ্রীয় ব্যাংক সুদের হার বাড়ানোর সিদ্ধান্ত নিয়েছে।',
                'excerpt_en' => 'The central bank has decided to raise the interest rate to control inflation.',
                'body_bn' => '<p>বাংলাদেশ ব্যাংক নীতি সুদহার ৫০ বেসিস পয়েন্ট বাড়িয়ে ৮ শতাংশে নির্ধারণ করেছে। ক্রমবর্ধমান মূল্যস্ফীতি নিয়ন্ত্রণ করতে এই সিদ্ধান্ত নেওয়া হয়েছে বলে কেন্দ্রীয় ব্যাংক জানিয়েছে।</p><blockquote>মূল্যস্ফীতি ৬ শতাংশের নিচে না আসা পর্যন্ত আমরা সতর্ক থাকব। — গভর্নর, বাংলাদেশ ব্যাংক</blockquote>',
                'body_en' => '<p>Bangladesh Bank has raised the policy rate by 50 basis points to 8% to control rising inflation, the central bank announced.</p><blockquote>We will remain vigilant until inflation falls below 6%. — Governor, Bangladesh Bank</blockquote>',
                'h' => 26, 'views' => 12300, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'economy', 'sub' => 'trade',
                'title_bn' => 'পোশাক রপ্তানিতে নতুন রেকর্ড, আয় ছাড়াল ৪৭ বিলিয়ন ডলার',
                'title_en' => 'New record in garment exports, earnings exceed $47 billion',
                'excerpt_bn' => 'বাংলাদেশের তৈরি পোশাক রপ্তানি এ বছর নতুন রেকর্ড গড়েছে।',
                'excerpt_en' => 'Bangladesh\'s garment exports have set a new record this year.',
                'body_bn' => '<p>বাংলাদেশের তৈরি পোশাক শিল্প চলতি অর্থবছরে ৪৭ বিলিয়ন ডলার রপ্তানি আয়ের নতুন রেকর্ড গড়েছে। বিজিএমইএর তথ্যানুযায়ী, ইউরোপ ও আমেরিকার বাজারে চাহিদা বাড়ায় এই সাফল্য সম্ভব হয়েছে।</p><p>২০৩০ সালের মধ্যে ১০০ বিলিয়ন ডলার রপ্তানির লক্ষ্যমাত্রা রয়েছে সরকারের।</p>',
                'body_en' => '<p>Bangladesh\'s garment industry has set a new export record of $47 billion this fiscal year. According to BGMEA, increased demand in European and American markets has made this achievement possible.</p><p>The government\'s target is $100 billion in exports by 2030.</p>',
                'h' => 38, 'views' => 10800, 'featured' => true, 'breaking' => false,
            ],
            [
                'cat' => 'economy', 'sub' => 'agriculture',
                'title_bn' => 'ধানের ভালো ফলন, কৃষকের মুখে হাসি — কিন্তু দাম কম',
                'title_en' => 'Good rice harvest brings smiles, but prices remain low',
                'excerpt_bn' => 'এবার আমন ধানের বাম্পার ফলন হলেও কৃষকরা ন্যায্য দাম পাচ্ছেন না।',
                'excerpt_en' => 'Despite a bumper aman rice harvest this year, farmers are not getting fair prices.',
                'body_bn' => '<p>এবার আমন মৌসুমে বাংলাদেশে বাম্পার ফলন হয়েছে। কৃষি মন্ত্রণালয়ের তথ্যানুযায়ী, এবার দেশে প্রায় ১ কোটি ৬৫ লাখ মেট্রিক টন আমন ধান উৎপাদিত হয়েছে।</p><p>কিন্তু উৎপাদন বেশি হওয়ায় বাজারে ধানের দাম কমে গেছে। কৃষকরা বলছেন, উৎপাদন খরচও উঠছে না।</p>',
                'body_en' => '<p>Bangladesh has had a bumper aman rice harvest this season. According to the Agriculture Ministry, about 16.5 million metric tons of aman paddy have been produced.</p><p>However, increased production has driven down market prices. Farmers say they cannot even recover production costs.</p>',
                'h' => 50, 'views' => 7200, 'featured' => false, 'breaking' => false,
            ],

            // ═══════════ খেলাধুলা ════════════════════════════════════════════
            [
                'cat' => 'sports', 'sub' => 'cricket-news',
                'title_bn' => 'বাংলাদেশ-পাকিস্তান টেস্টে টাইগারদের দুর্দান্ত জয়',
                'title_en' => 'Bangladesh beat Pakistan in thrilling Test victory',
                'excerpt_bn' => 'ঢাকায় পাকিস্তানের বিরুদ্ধে টেস্টে বাংলাদেশের ঐতিহাসিক জয়।',
                'excerpt_en' => 'Bangladesh claim a historic Test victory against Pakistan in Dhaka.',
                'body_bn' => '<p>মিরপুর শেরেবাংলা জাতীয় ক্রিকেট স্টেডিয়ামে অনুষ্ঠিত টেস্টে বাংলাদেশ পাকিস্তানকে ইনিংস ও ২৪ রানে হারিয়েছে। এটি পাকিস্তানের বিরুদ্ধে বাংলাদেশের সবচেয়ে বড় জয়।</p><h3>মেহেদী হাসানের অসাধারণ পারফরম্যান্স</h3><p>মেহেদী হাসান মিরাজ দ্বিতীয় ইনিংসে ৭ উইকেট নিয়ে ম্যান অব দ্য ম্যাচ হয়েছেন।</p><blockquote>এটি বাংলাদেশ ক্রিকেটের জন্য ঐতিহাসিক দিন। — নাজমুল হোসেন শান্ত, অধিনায়ক</blockquote>',
                'body_en' => '<p>Bangladesh defeated Pakistan by an innings and 24 runs at the Sher-e-Bangla National Cricket Stadium in Mirpur — their biggest-ever victory over Pakistan.</p><h3>Mehidy Hasan\'s Brilliant Performance</h3><p>Mehidy Hasan Miraz took 7 wickets in the second innings to be named Man of the Match.</p><blockquote>This is a historic day for Bangladesh cricket. — Najmul Hossain Shanto, Captain</blockquote>',
                'h' => 6, 'views' => 34200, 'featured' => true, 'breaking' => true,
            ],
            [
                'cat' => 'sports', 'sub' => 'football-news',
                'title_bn' => 'বাংলাদেশ ফুটবল দল বিশ্বকাপ বাছাইয়ে ভালো শুরু করেছে',
                'title_en' => 'Bangladesh football team makes good start in World Cup qualifiers',
                'excerpt_bn' => 'বিশ্বকাপ বাছাইয়ে প্রথম ম্যাচে বাংলাদেশ ড্র করে ভালো শুরু করেছে।',
                'excerpt_en' => 'Bangladesh made a positive start in the World Cup qualifiers with a draw in their first match.',
                'body_bn' => '<p>২০২৬ ফিফা বিশ্বকাপ বাছাইপর্বে বাংলাদেশ ফুটবল দল তাদের প্রথম ম্যাচে শক্তিশালী আফগানিস্তানের সাথে ১-১ গোলে ড্র করেছে। হোম মাঠে এই ফলাফল বাংলাদেশের জন্য আশাব্যঞ্জক।</p><p>বাংলাদেশের পক্ষে একমাত্র গোলটি করেন অধিনায়ক জামাল ভূঁইয়া।</p>',
                'body_en' => '<p>Bangladesh drew 1-1 with strong Afghanistan in their first 2026 FIFA World Cup qualifier match at home stadium, a promising result for Bangladesh.</p><p>Captain Jamal Bhuyan scored Bangladesh\'s only goal.</p>',
                'h' => 22, 'views' => 17800, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'sports', 'sub' => 'other-sports',
                'title_bn' => 'সাঁতারু মাহফুজা এশিয়ান গেমসে স্বর্ণ জিতলেন',
                'title_en' => 'Swimmer Mahfuza wins gold at Asian Games',
                'excerpt_bn' => 'বাংলাদেশের সাঁতারু মাহফুজা খাতুন এশিয়ান গেমসে স্বর্ণপদক জিতেছেন।',
                'excerpt_en' => 'Bangladeshi swimmer Mahfuza Khatun has won a gold medal at the Asian Games.',
                'body_bn' => '<p>বাংলাদেশের তরুণ সাঁতারু মাহফুজা খাতুন চীনের হাংঝৌতে অনুষ্ঠিত এশিয়ান গেমসে ৫০ মিটার ব্যাকস্ট্রোকে স্বর্ণপদক জিতেছেন। এটি বাংলাদেশের সাঁতারে প্রথম আন্তর্জাতিক স্বর্ণপদক।</p>',
                'body_en' => '<p>Young Bangladeshi swimmer Mahfuza Khatun has won a gold medal in the 50m backstroke at the Asian Games in Hangzhou, China — Bangladesh\'s first international gold medal in swimming.</p>',
                'h' => 34, 'views' => 22600, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'sports', 'sub' => 'cricket-news',
                'title_bn' => 'শ্রীলঙ্কার বিরুদ্ধে ওয়ানডে সিরিজ: বাংলাদেশের ৩-০ ক্লিনসুইপ',
                'title_en' => 'ODI series vs Sri Lanka: Bangladesh clinch 3-0 clean sweep',
                'excerpt_bn' => 'ঘরের মাঠে শ্রীলঙ্কাকে হোয়াইটওয়াশ করে বাংলাদেশ দারুণ ফর্মে',
                'excerpt_en' => 'Bangladesh whitewash Sri Lanka at home in dominant fashion',
                'body_bn' => '<p>শ্রীলঙ্কার বিরুদ্ধে তিন ম্যাচের ওয়ানডে সিরিজের সবকটিতে জিতে বাংলাদেশ ক্লিনসুইপ করেছে। তৃতীয় ম্যাচে ৬ উইকেটের জয়ে সিরিজ ৩-০ ব্যবধানে শেষ করেছে টাইগাররা।</p>',
                'body_en' => '<p>Bangladesh completed a 3-0 clean sweep against Sri Lanka in the three-match ODI series, winning the third match by 6 wickets.</p>',
                'h' => 48, 'views' => 19400, 'featured' => false, 'breaking' => false,
            ],

            // ═══════════ বিনোদন ═══════════════════════════════════════════════
            [
                'cat' => 'entertainment', 'sub' => 'cinema',
                'title_bn' => 'ঢালিউডের নতুন ছবি "অষ্টপ্রহর" মুক্তির প্রথম সপ্তাহে কোটি টাকার ব্যবসা',
                'title_en' => 'Dhallywood\'s new film "Ashtoprohor" earns crores in first week',
                'excerpt_bn' => 'বাংলাদেশের সিনেমা হলে দর্শকের ঢল, নতুন ছবির সাফল্যে উৎসাহিত নির্মাতারা',
                'excerpt_en' => 'Audiences flood Bangladeshi cinemas, filmmakers encouraged by new film\'s success',
                'body_bn' => '<p>বাংলাদেশের পর্দায় দীর্ঘদিন পর একটি সফল বাংলা ছবির দেখা মিলেছে। "অষ্টপ্রহর" মুক্তির প্রথম সপ্তাহে দেশজুড়ে মোট ১ কোটি ২০ লাখ টাকার টিকিট বিক্রি হয়েছে।</p><h3>গল্প ও পরিচালনা</h3><p>নতুন পরিচালক রুবেল হাসানের এই ছবিতে অভিনয় করেছেন শাকিব খান ও মাহিয়া মাহি। মুক্তিযুদ্ধের পটভূমিতে নির্মিত ছবিটি দর্শকদের মনে আলাদা জায়গা করে নিয়েছে।</p>',
                'body_en' => '<p>Bangladesh\'s cinema screens have seen a successful Bengali film after a long time. "Ashtoprohor" sold tickets worth Tk 1.2 crore in its first week of release across the country.</p><h3>Story and Direction</h3><p>Directed by newcomer Rubel Hasan, the film stars Shakib Khan and Mahiya Mahi. Set against the backdrop of the Liberation War, the film has won the hearts of audiences.</p>',
                'h' => 5, 'views' => 18200, 'featured' => true, 'breaking' => false,
            ],
            [
                'cat' => 'entertainment', 'sub' => 'music',
                'title_bn' => 'তরুণ শিল্পী আরিফের নতুন অ্যালবাম "একলা পথ" সারাদেশে সাড়া ফেলেছে',
                'title_en' => 'Young artist Arif\'s new album "Ekla Path" creates buzz nationwide',
                'excerpt_bn' => 'ডিজিটাল প্ল্যাটফর্মে মাত্র তিন দিনে ১ কোটি স্ট্রিমিং অতিক্রম করেছে নতুন অ্যালবামটি',
                'excerpt_en' => 'The new album surpassed 10 million streams on digital platforms in just three days',
                'body_bn' => '<p>তরুণ সংগীতশিল্পী আরিফ রহমানের প্রথম একক অ্যালবাম "একলা পথ" ডিজিটাল প্ল্যাটফর্মে তুমুল সাড়া ফেলেছে। মাত্র তিন দিনে ইউটিউব ও স্পটিফাইতে মোট ১ কোটিরও বেশি বার শোনা হয়েছে।</p>',
                'body_en' => '<p>Young musician Arif Rahman\'s debut album "Ekla Path" (Lonely Road) has created a sensation on digital platforms, crossing 10 million streams on YouTube and Spotify in just three days.</p>',
                'h' => 17, 'views' => 14300, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'entertainment', 'sub' => 'television',
                'title_bn' => 'ঈদের নাটকে রেকর্ড দর্শক, জনপ্রিয়তার তালিকায় শীর্ষে "বৃষ্টির দিনে"',
                'title_en' => 'Eid drama draws record viewers, "Brishter Dine" tops popularity charts',
                'excerpt_bn' => 'ঈদুল ফিতরে প্রচারিত নাটকগুলোর মধ্যে "বৃষ্টির দিনে" সবচেয়ে বেশি দর্শক টেনেছে।',
                'excerpt_en' => 'Among the dramas aired on Eid-ul-Fitr, "Brishter Dine" has attracted the most viewers.',
                'body_bn' => '<p>এবার ঈদের নাটকগুলোর মধ্যে চ্যানেল আইতে প্রচারিত "বৃষ্টির দিনে" সবচেয়ে বেশি দর্শকপ্রিয়তা পেয়েছে। ইউটিউবে মাত্র ৪৮ ঘণ্টায় ৫০ লাখ ভিউ হয়েছে।</p>',
                'body_en' => '<p>Among this Eid\'s dramas, "Brishter Dine" (In Rainy Days) aired on Channel i has become the most popular, reaching 5 million views on YouTube in just 48 hours.</p>',
                'h' => 29, 'views' => 11700, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'entertainment', 'sub' => 'cinema',
                'title_bn' => 'কান চলচ্চিত্র উৎসবে বাংলাদেশের "নদীর নাম" বিশেষ পুরস্কার পেল',
                'title_en' => 'Bangladesh\'s "Nadir Nam" wins special award at Cannes Film Festival',
                'excerpt_bn' => 'কান উৎসবে বাংলাদেশের একটি স্বল্পদৈর্ঘ্য চলচ্চিত্র বিশেষ পুরস্কার পেয়েছে।',
                'excerpt_en' => 'A Bangladeshi short film has won a special award at the Cannes Film Festival.',
                'body_bn' => '<p>ফরাসি রিভিয়েরায় অনুষ্ঠিত বিশ্বের সবচেয়ে মর্যাদাপূর্ণ চলচ্চিত্র উৎসব কানে বাংলাদেশের পরিচালক তাওসিফ আহমেদের "নদীর নাম" বিশেষ জুরি পুরস্কার জিতেছে।</p>',
                'body_en' => '<p>Bangladeshi director Tawsif Ahmed\'s "Nadir Nam" (Name of the River) has won a Special Jury Prize at the Cannes Film Festival, the world\'s most prestigious film festival.</p>',
                'h' => 41, 'views' => 16400, 'featured' => false, 'breaking' => false,
            ],

            // ═══════════ প্রযুক্তি ════════════════════════════════════════════
            [
                'cat' => 'technology', 'sub' => 'artificial-intelligence',
                'title_bn' => 'বাংলাদেশি স্টার্টআপ এআই দিয়ে ধান রোগ শনাক্তের অ্যাপ বানাল',
                'title_en' => 'Bangladeshi startup builds AI app to detect rice crop diseases',
                'excerpt_bn' => 'কৃষিক্ষেত্রে বিপ্লব আনতে দেশীয় প্রযুক্তি প্রতিষ্ঠানের নতুন উদ্যোগ।',
                'excerpt_en' => 'A local tech firm\'s new initiative aims to revolutionize agriculture.',
                'body_bn' => '<p>বাংলাদেশি স্টার্টআপ "কৃষি এআই" একটি মোবাইল অ্যাপ তৈরি করেছে যা কৃত্রিম বুদ্ধিমত্তা ব্যবহার করে ধান গাছের রোগ শনাক্ত করতে পারে। স্মার্টফোনে ছবি তুললেই অ্যাপটি রোগের নাম এবং চিকিৎসার পরামর্শ দেয়।</p><h3>বিশ্বব্যাংকের স্বীকৃতি</h3><p>এই অ্যাপটি ইতিমধ্যে বিশ্বব্যাংকের উদ্ভাবন পুরস্কার জিতেছে।</p>',
                'body_en' => '<p>Bangladeshi startup "Krishi AI" has developed a mobile app that uses artificial intelligence to detect rice crop diseases. Just by taking a photo with a smartphone, the app identifies the disease and provides treatment advice.</p><h3>World Bank Recognition</h3><p>This app has already won the World Bank Innovation Award.</p>',
                'h' => 7, 'views' => 12800, 'featured' => true, 'breaking' => false,
            ],
            [
                'cat' => 'technology', 'sub' => 'cybersecurity',
                'title_bn' => 'সাইবার আক্রমণে বাংলাদেশের সরকারি ওয়েবসাইট হ্যাক, তথ্য চুরির আশঙ্কা',
                'title_en' => 'Government websites hacked in cyberattack, data theft feared',
                'excerpt_bn' => 'একটি বড় সাইবার আক্রমণে একাধিক সরকারি ওয়েবসাইট ক্ষতিগ্রস্ত হয়েছে।',
                'excerpt_en' => 'Multiple government websites have been compromised in a major cyberattack.',
                'body_bn' => '<p>বাংলাদেশের বেশ কয়েকটি সরকারি ওয়েবসাইটে একটি সমন্বিত সাইবার আক্রমণ হয়েছে। সরকারি কম্পিউটার ইনসিডেন্ট রেসপন্স টিম (BGD e-GOV CIRT) জানিয়েছে, প্রাথমিক তদন্তে বিদেশি হ্যাকার গোষ্ঠীর সম্পৃক্ততার আশঙ্কা রয়েছে।</p>',
                'body_en' => '<p>Several Bangladeshi government websites have been hit by a coordinated cyberattack. BGD e-GOV CIRT said preliminary investigations suggest involvement of a foreign hacker group.</p>',
                'h' => 19, 'views' => 23700, 'featured' => false, 'breaking' => true,
            ],
            [
                'cat' => 'technology', 'sub' => 'innovation',
                'title_bn' => 'দেশে ৫জি সেবা চালু: গ্রামীণফোন ও রবি প্রথম পরীক্ষামূলক সম্প্রচার করল',
                'title_en' => '5G launched in Bangladesh: Grameenphone and Robi conduct first pilot',
                'excerpt_bn' => 'বাংলাদেশে ৫জি যুগের সূচনা হলো আজ থেকে।',
                'excerpt_en' => 'The 5G era begins in Bangladesh today.',
                'body_bn' => '<p>বাংলাদেশে আজ থেকে ৫জি সেবার পরীক্ষামূলক সম্প্রচার শুরু হয়েছে। গ্রামীণফোন এবং রবি আজ একযোগে ঢাকায় ৫জি পাইলট প্রজেক্ট চালু করেছে।</p><p>ডাক ও টেলিযোগাযোগ মন্ত্রী বলেন, ২০২৬ সালের মধ্যে সারাদেশে বাণিজ্যিকভাবে ৫জি সেবা চালু করা হবে।</p>',
                'body_en' => '<p>Bangladesh has launched pilot 5G broadcasts today. Grameenphone and Robi simultaneously launched 5G pilot projects in Dhaka.</p><p>The Minister of Telecommunications said commercial 5G services will be launched nationwide by 2026.</p>',
                'h' => 31, 'views' => 17500, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'technology', 'sub' => 'innovation',
                'title_bn' => 'ই-কমার্স খাতে নতুন নীতিমালা: গ্রাহক সুরক্ষায় কঠোর আইন',
                'title_en' => 'New e-commerce policy: Strict laws for consumer protection',
                'excerpt_bn' => 'অনলাইন শপিংয়ে প্রতারণা ঠেকাতে সরকার নতুন নীতিমালা প্রণয়ন করেছে।',
                'excerpt_en' => 'The government has formulated new policies to prevent online shopping fraud.',
                'body_bn' => '<p>ই-কমার্স খাতে ভোক্তা প্রতারণা ঠেকাতে সরকার নতুন "ডিজিটাল কমার্স নীতিমালা ২০২৫" প্রণয়ন করেছে। এই নীতিমালা অনুযায়ী, ডেলিভারি না দিলে বা পণ্য নকল হলে ব্যবসায়ীকে কঠোর জরিমানা দিতে হবে।</p>',
                'body_en' => '<p>The government has formulated the new "Digital Commerce Policy 2025" to prevent consumer fraud in e-commerce. Under this policy, traders face strict fines for non-delivery or counterfeit products.</p>',
                'h' => 43, 'views' => 9300, 'featured' => false, 'breaking' => false,
            ],

            // ═══════════ লাইফস্টাইল ══════════════════════════════════════════
            [
                'cat' => 'lifestyle', 'sub' => 'health',
                'title_bn' => 'গবেষণা বলছে, দিনে ৩০ মিনিট হাঁটলে হৃদরোগের ঝুঁকি ৪০% কমে',
                'title_en' => 'Research: 30 minutes of walking daily reduces heart disease risk by 40%',
                'excerpt_bn' => 'নিয়মিত হাঁটার অভ্যাস হৃদরোগ প্রতিরোধে অত্যন্ত কার্যকর।',
                'excerpt_en' => 'Regular walking habit is highly effective in preventing heart disease.',
                'body_bn' => '<p>বাংলাদেশ মেডিক্যাল রিসার্চ কাউন্সিলের একটি নতুন গবেষণায় দেখা গেছে, প্রতিদিন মাত্র ৩০ মিনিট হাঁটলে হৃদরোগের ঝুঁকি ৪০ শতাংশ পর্যন্ত কমে যায়।</p><h3>কীভাবে শুরু করবেন</h3><p>চিকিৎসকরা বলছেন, সকালে বা সন্ধ্যায় নিয়মিত হাঁটার অভ্যাস গড়ে তোলা সম্ভব। শুরুতে ১০ মিনিট করে শুরু করে ধীরে ধীরে ৩০ মিনিটে নিয়ে আসুন।</p>',
                'body_en' => '<p>A new study by the Bangladesh Medical Research Council found that walking just 30 minutes daily can reduce the risk of heart disease by up to 40%.</p><h3>How to Start</h3><p>Doctors say it\'s possible to build a regular walking habit in the morning or evening. Start with 10 minutes and gradually increase to 30 minutes.</p>',
                'h' => 8, 'views' => 13400, 'featured' => true, 'breaking' => false,
            ],
            [
                'cat' => 'lifestyle', 'sub' => 'travel',
                'title_bn' => 'সুন্দরবন ভ্রমণে পর্যটকের ঢল, নতুন ট্যুর প্যাকেজের ঘোষণা',
                'title_en' => 'Surge in Sundarbans tourists, new tour packages announced',
                'excerpt_bn' => 'শীতের মৌসুমে সুন্দরবনে পর্যটকের সংখ্যা আগের বছরের তুলনায় ৩০% বেশি।',
                'excerpt_en' => 'Tourist numbers in the Sundarbans are 30% higher than last year in the winter season.',
                'body_bn' => '<p>এই শীতে সুন্দরবনে পর্যটকের সংখ্যা রেকর্ড সংখ্যায় পৌঁছেছে। বন বিভাগের তথ্য অনুযায়ী, গত বছরের একই সময়ের তুলনায় এবার ৩০ শতাংশ বেশি পর্যটক সুন্দরবন ভ্রমণ করেছেন।</p><p>বাংলাদেশ ট্যুরিজম বোর্ড সুলভ মূল্যে নতুন ট্যুর প্যাকেজ ঘোষণা করেছে।</p>',
                'body_en' => '<p>Tourist numbers in the Sundarbans have reached record levels this winter, up 30% compared to the same period last year, according to the Forest Department.</p><p>The Bangladesh Tourism Board has announced new affordable tour packages.</p>',
                'h' => 20, 'views' => 11200, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'lifestyle', 'sub' => 'food',
                'title_bn' => 'ইলিশ মাছের দাম কমেছে, বাজারে উৎসবের আমেজ',
                'title_en' => 'Hilsa fish prices drop, festive mood in markets',
                'excerpt_bn' => 'মৌসুমি বৃষ্টির ফলে এবার ইলিশের ভালো মৌসুম, দাম সাধ্যের মধ্যে',
                'excerpt_en' => 'Good hilsa season this year due to seasonal rains, prices within reach',
                'body_bn' => '<p>এবার ইলিশ মাছের ভালো মৌসুম হয়েছে। যমুনা, পদ্মা ও মেঘনায় প্রচুর ইলিশ ধরা পড়ছে। বাজারে এক কেজি ইলিশের দাম নেমে এসেছে ৭০০-৮০০ টাকায়, যা গত বছরের তুলনায় অনেক কম।</p>',
                'body_en' => '<p>This year\'s hilsa season has been very good. Abundant hilsa is being caught in the Jamuna, Padma, and Meghna rivers. Market prices for one kilogram of hilsa have dropped to Tk 700-800, much lower than last year.</p>',
                'h' => 32, 'views' => 16700, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'lifestyle', 'sub' => 'health',
                'title_bn' => 'শীতে শিশুর নিউমোনিয়া প্রতিরোধে যা করবেন',
                'title_en' => 'How to prevent pneumonia in children during winter',
                'excerpt_bn' => 'শীতে শিশুদের নিউমোনিয়ার প্রকোপ বাড়ে, চিকিৎসকদের পরামর্শ।',
                'excerpt_en' => 'Pneumonia incidence rises in children during winter; doctors\' advice.',
                'body_bn' => '<p>শীতের মৌসুমে শিশুদের নিউমোনিয়ার প্রকোপ উল্লেখযোগ্যভাবে বাড়ে। বাংলাদেশে প্রতি বছর প্রায় ৪ লাখ শিশু নিউমোনিয়ায় আক্রান্ত হয়।</p><h3>প্রতিরোধের উপায়</h3><ul><li>শিশুকে উষ্ণ রাখুন</li><li>নিয়মিত টিকা নিশ্চিত করুন</li><li>মায়ের বুকের দুধ খাওয়ান</li><li>বাড়িতে ধূমপান নিষেধ করুন</li></ul>',
                'body_en' => '<p>Pneumonia incidence in children increases significantly during winter. Around 400,000 children are affected by pneumonia in Bangladesh every year.</p><h3>Prevention Tips</h3><ul><li>Keep children warm</li><li>Ensure regular vaccinations</li><li>Breastfeed regularly</li><li>Ban smoking indoors</li></ul>',
                'h' => 44, 'views' => 9800, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'lifestyle', 'sub' => 'travel',
                'title_bn' => 'কক্সবাজারে নতুন মেরিন ড্রাইভ সম্প্রসারণ, পর্যটন শিল্পে নতুন আশা',
                'title_en' => 'Cox\'s Bazar Marine Drive extension brings new hope to tourism',
                'excerpt_bn' => 'বিশ্বের দীর্ঘতম সমুদ্রসৈকতে নতুন সড়ক সম্প্রসারণের কাজ শেষ হয়েছে।',
                'excerpt_en' => 'New road extension work completed at the world\'s longest sea beach.',
                'body_bn' => '<p>কক্সবাজারের মেরিন ড্রাইভ সড়ক আরও ১৫ কিলোমিটার সম্প্রসারণ সম্পন্ন হয়েছে। এখন মোট ৮০ কিলোমিটার মেরিন ড্রাইভ ধরে গাড়ি চালিয়ে যাওয়া যাবে।</p>',
                'body_en' => '<p>Cox\'s Bazar Marine Drive has been extended by 15 more kilometers, making the total 80 kilometers of scenic coastal road.</p>',
                'h' => 56, 'views' => 14100, 'featured' => false, 'breaking' => false,
            ],

            // ═══════════ ইসলামী জীবন ════════════════════════════════════════
            [
                'cat' => 'islamic-life', 'sub' => null,
                'title_bn' => 'শবে বরাতের ফজিলত ও আমল: ইসলামিক ফাউন্ডেশনের নির্দেশনা',
                'title_en' => null,
                'excerpt_bn' => 'শবে বরাতে কী কী ইবাদত করা উচিত তা নিয়ে ইসলামিক ফাউন্ডেশন গাইডলাইন প্রকাশ করেছে।',
                'excerpt_en' => null,
                'body_bn' => '<p>শবে বরাত বা লাইলাতুল বারাআত ইসলাম ধর্মের একটি গুরুত্বপূর্ণ রজনী। এই রাতে আল্লাহ তায়ালা বান্দাদের ভাগ্য নির্ধারণ করেন বলে হাদিস শরীফে উল্লেখ রয়েছে।</p><h3>করণীয় আমলসমূহ</h3><ul><li>নফল নামাজ পড়া</li><li>পবিত্র কোরআন তিলাওয়াত করা</li><li>দোয়া ও তওবা করা</li><li>আত্মীয়-স্বজনের কবর জিয়ারত করা</li></ul><p>ইসলামিক ফাউন্ডেশন আলেমদের সাথে আলোচনা করে একটি বিস্তারিত গাইডলাইন প্রকাশ করেছে।</p>',
                'body_en' => null,
                'h' => 6, 'views' => 21300, 'featured' => true, 'breaking' => false,
            ],
            [
                'cat' => 'islamic-life', 'sub' => null,
                'title_bn' => 'রমজান মাসের প্রস্তুতি: সেহরি ও ইফতারের সঠিক সময়সূচি',
                'title_en' => null,
                'excerpt_bn' => 'আসন্ন রমজানের জন্য ঢাকাসহ দেশের প্রধান শহরগুলোর সময়সূচি প্রকাশিত হয়েছে।',
                'excerpt_en' => null,
                'body_bn' => '<p>ইসলামিক ফাউন্ডেশন বাংলাদেশ আসন্ন রমজান মাসের জন্য সেহরি ও ইফতারের সময়সূচি প্রকাশ করেছে। ঢাকায় প্রথম রোজায় সেহরির শেষ সময় ভোর ৪টা ৪৬ মিনিট এবং ইফতারের সময় সন্ধ্যা ৬টা ১৮ মিনিট।</p>',
                'body_en' => null,
                'h' => 18, 'views' => 31200, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'islamic-life', 'sub' => null,
                'title_bn' => 'হজ প্যাকেজ ঘোষণা: এবার সরকারি ব্যবস্থাপনায় হজের খরচ কমছে',
                'title_en' => null,
                'excerpt_bn' => 'ধর্ম মন্ত্রণালয় এবারের হজের প্যাকেজ ঘোষণা করেছে, খরচ গত বছরের তুলনায় কম।',
                'excerpt_en' => null,
                'body_bn' => '<p>ধর্ম মন্ত্রণালয় আসন্ন হজ মৌসুমের জন্য প্যাকেজ ঘোষণা করেছে। এবার সরকারি ব্যবস্থাপনায় হজের খরচ ধার্য করা হয়েছে ৫ লাখ ৭৮ হাজার ৮৪০ টাকা, যা গত বছরের তুলনায় কম।</p>',
                'body_en' => null,
                'h' => 30, 'views' => 18700, 'featured' => false, 'breaking' => false,
            ],
            [
                'cat' => 'islamic-life', 'sub' => null,
                'title_bn' => 'কোরআন তিলাওয়াত প্রতিযোগিতায় বাংলাদেশের তরুণ শীর্ষস্থান অধিকার করেছে',
                'title_en' => null,
                'excerpt_bn' => 'আন্তর্জাতিক কোরআন তিলাওয়াত প্রতিযোগিতায় বাংলাদেশের মাওলানা রাফিউদ্দিন প্রথম হয়েছেন।',
                'excerpt_en' => null,
                'body_bn' => '<p>সৌদি আরবে অনুষ্ঠিত আন্তর্জাতিক কোরআন তিলাওয়াত প্রতিযোগিতায় বাংলাদেশের তরুণ হাফেজ মাওলানা রাফিউদ্দিন প্রথম স্থান অধিকার করেছেন। ৪৭টি দেশের প্রতিনিধিদের মধ্যে থেকে তিনি শীর্ষস্থান পেয়েছেন।</p>',
                'body_en' => null,
                'h' => 42, 'views' => 14900, 'featured' => false, 'breaking' => false,
            ],
        ];

        foreach ($items as $idx => $item) {
            $cat = $cats[$item['cat']] ?? null;
            if (!$cat) continue;

            $subCat = $item['sub'] ? ($cats[$item['sub']] ?? null) : null;

            $slugBase = Str::slug($item['title_bn']);
            $slug = $slugBase . '-' . ($idx + 100);

            // Skip if already exists
            if (Article::where('slug_bn', $slug)->exists()) continue;

            $publishedAt = now()->subHours($item['h']);

            $a = Article::create([
                'author_id'       => $author->id,
                'category_id'     => $cat->id,
                'subcategory_id'  => $subCat?->id,
                'title_bn'        => $item['title_bn'],
                'title_en'        => $item['title_en'] ?? null,
                'slug_bn'         => $slug,
                'slug_en'         => $item['title_en'] ? Str::slug($item['title_en']) . '-' . ($idx + 100) : null,
                'excerpt_bn'      => $item['excerpt_bn'],
                'excerpt_en'      => $item['excerpt_en'] ?? null,
                'body_bn'         => $item['body_bn'],
                'body_en'         => $item['body_en'] ?? null,
                'edition'         => $item['title_en'] ? 'both' : 'bn',
                'status'          => 'published',
                'is_featured'     => $item['featured'],
                'is_breaking'     => $item['breaking'],
                'views'           => $item['views'],
                'published_at'    => $publishedAt,
            ]);
        }

        $this->command->info('✅ ' . count($items) . ' additional articles seeded.');
    }
}
