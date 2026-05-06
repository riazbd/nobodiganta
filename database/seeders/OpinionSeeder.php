<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OpinionSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::firstOrCreate(
            ['slug' => 'opinion'],
            ['name_bn' => 'মতামত', 'name_en' => 'Opinion', 'edition' => 'both', 'is_active' => true]
        );

        $tagMap = [];
        foreach (['climate-change', 'election', 'dollar-crisis', 'ai', 'budget-2025'] as $s) {
            $t = Tag::where('slug', $s)->first();
            if ($t) $tagMap[$s] = $t;
        }

        $opinions = [
            [
                'title_bn'    => 'গণতন্ত্রের পথে বাংলাদেশ: কোথায় আছি, কোথায় যাব',
                'title_en'    => 'Bangladesh on the path of democracy: Where are we, where are we going',
                'subtitle_bn' => 'নির্বাচনী ব্যবস্থার সংস্কার না হলে গণতন্ত্র অর্থবহ হবে না',
                'subtitle_en' => 'Democracy will not be meaningful without electoral reform',
                'slug_bn'     => 'ganatantrer-pathe-bangladesh',
                'slug_en'     => 'bangladesh-on-the-path-of-democracy',
                'excerpt_bn'  => 'বাংলাদেশে গণতন্ত্রের অগ্রযাত্রা কতটা টেকসই, তা নিয়ে একটি বিশ্লেষণধর্মী আলোচনা।',
                'excerpt_en'  => 'An analytical discussion on how sustainable democracy\'s progress is in Bangladesh.',
                'body_bn'     => <<<HTML
<p>বাংলাদেশ একটি গণতান্ত্রিক রাষ্ট্র হিসেবে তার যাত্রা শুরু করেছিল ১৯৭১ সালে মহান মুক্তিযুদ্ধের মধ্য দিয়ে। মুক্তিযুদ্ধের অন্যতম লক্ষ্য ছিল একটি সত্যিকারের গণতান্ত্রিক রাষ্ট্র প্রতিষ্ঠা, যেখানে মানুষের ভোটের মূল্য থাকবে, বাক্স্বাধীনতা থাকবে, বিরোধী মতকে সম্মান করা হবে।</p>

<p>পঞ্চাশ বছরেরও বেশি সময় পেরিয়ে গেছে। এই দীর্ঘ পথ পরিক্রমায় বাংলাদেশ অনেক উত্থান-পতন দেখেছে। সামরিক শাসন, একদলীয় শাসন, গণঅভ্যুত্থান—সব কিছুর মধ্য দিয়ে একটি দেশ হিসেবে আমরা এগিয়ে এসেছি।</p>

<h2>নির্বাচনী ব্যবস্থার সংকট</h2>

<p>বাংলাদেশে গণতন্ত্রের সবচেয়ে বড় সংকট হলো নির্বাচনী ব্যবস্থায়। বারবার প্রশ্ন উঠছে—নির্বাচন কমিশন কতটা স্বাধীন? ভোটাররা কি সত্যিকার অর্থে তাদের পছন্দমতো প্রতিনিধি নির্বাচন করতে পারছেন? রাষ্ট্রীয় যন্ত্রপাতির ব্যবহার কি নির্বাচনকে প্রভাবিত করছে?</p>

<blockquote>গণতন্ত্র কেবল ভোটের খেলা নয়। এটি সংস্কৃতি, মূল্যবোধ এবং প্রতিষ্ঠানের সমন্বয়। — অধ্যাপক রেহমান সোবহান</blockquote>

<p>এই প্রশ্নগুলোর উত্তর খোঁজা দরকার। নির্বাচন কমিশনকে সত্যিকার অর্থে স্বাধীন ও নিরপেক্ষ করার জন্য সাংবিধানিক ও আইনি সংস্কার প্রয়োজন।</p>

<h2>সুশীল সমাজের ভূমিকা</h2>

<p>গণতন্ত্র শুধু রাজনৈতিক দলের কাজ নয়। সুশীল সমাজ, গণমাধ্যম, বিচার বিভাগ—সবাইকে একসাথে কাজ করতে হবে। স্বাধীন বিচার বিভাগ ছাড়া গণতন্ত্র টেকসই হয় না।</p>

<p>আমাদের তরুণ প্রজন্ম গণতন্ত্রের প্রতি আগ্রহী। তারা পরিবর্তন চায়। এই আগ্রহ ও শক্তিকে কাজে লাগাতে হবে।</p>

<p>পরিশেষে বলতে চাই, গণতন্ত্র একটি চলমান প্রক্রিয়া। এটি একদিনে প্রতিষ্ঠিত হয় না। ধৈর্য, অধ্যবসায় ও সম্মিলিত প্রচেষ্টায় আমরা একটি সত্যিকারের গণতান্ত্রিক বাংলাদেশ গড়তে পারব।</p>
HTML,
                'body_en'     => <<<HTML
<p>Bangladesh began its journey as a democratic state through the great Liberation War of 1971. Among the key goals of the war was the establishment of a truly democratic state — one where people's votes would matter, freedom of speech would exist, and opposing views would be respected.</p>

<p>More than fifty years have passed. Through this long journey, Bangladesh has witnessed many ups and downs — military rule, single-party rule, mass uprisings — and has moved forward as a nation.</p>

<h2>The Crisis in the Electoral System</h2>

<p>The biggest crisis for democracy in Bangladesh lies in its electoral system. Questions repeatedly arise: How independent is the Election Commission? Can voters truly elect representatives of their choice? Is state machinery influencing elections?</p>

<blockquote>Democracy is not merely a game of votes. It is a combination of culture, values, and institutions. — Professor Rehman Sobhan</blockquote>

<p>These questions need answers. Constitutional and legal reforms are needed to make the Election Commission truly independent and impartial.</p>

<h2>Role of Civil Society</h2>

<p>Democracy is not the sole responsibility of political parties. Civil society, the media, and the judiciary must all work together. Democracy cannot be sustained without an independent judiciary.</p>

<p>Our young generation is interested in democracy. They want change. This energy must be channeled productively.</p>
HTML,
                'is_guest_author'    => false,
                'hours_ago'          => 24,
                'image'              => 'https://picsum.photos/seed/op1author/200/200',
                'tags'               => ['election'],
            ],
            [
                'title_bn'    => 'জলবায়ু পরিবর্তন: বাংলাদেশের অস্তিত্বের সংকট',
                'title_en'    => 'Climate Change: Bangladesh\'s existential crisis',
                'subtitle_bn' => 'উপকূলীয় অঞ্চলকে বাঁচাতে এখনই দরকার কার্যকর পদক্ষেপ',
                'subtitle_en' => 'Effective action needed now to save coastal areas',
                'slug_bn'     => 'jalbayu-poriborton-bangladesh-astitwer-sankat',
                'slug_en'     => 'climate-change-bangladesh-existential-crisis',
                'excerpt_bn'  => 'জলবায়ু পরিবর্তনের কারণে বাংলাদেশের ২০ শতাংশ ভূমি ডুবে যাওয়ার আশঙ্কা রয়েছে।',
                'excerpt_en'  => 'Climate change threatens to submerge 20 percent of Bangladesh\'s landmass.',
                'body_bn'     => <<<HTML
<p>বাংলাদেশ জলবায়ু পরিবর্তনের সবচেয়ে ভুক্তভোগী দেশগুলোর মধ্যে একটি, অথচ বৈশ্বিক কার্বন নির্গমনে আমাদের অবদান মাত্র ০.৩৫ শতাংশ। এই অসংগতি বিশ্ব রাজনীতির একটি বড় ব্যর্থতা।</p>

<p>জাতিসংঘের জলবায়ু বিশেষজ্ঞ প্যানেল (আইপিসিসি)-এর সাম্প্রতিক রিপোর্ট অনুযায়ী, সমুদ্রের জলস্তর প্রতি দশকে গড়ে ৩.৬ মিলিমিটার বাড়ছে। এই হারে বাড়লে ২০৫০ সালের মধ্যে বাংলাদেশের উপকূলীয় এলাকার বিশাল অংশ পানির নিচে চলে যাবে।</p>

<h2>উপকূলের মানুষের কষ্ট</h2>

<p>সুন্দরবন থেকে শুরু করে ভোলা, পটুয়াখালী, বরগুনা—সব জায়গায় মানুষ জলবায়ু পরিবর্তনের শিকার হচ্ছেন। লবণাক্ততা বৃদ্ধি পেয়ে চাষযোগ্য জমি কমছে। ঘরবাড়ি নদীর ভাঙনে হারিয়ে যাচ্ছে।</p>

<blockquote>আমরা এখানে বাপ-দাদার ভিটায় থাকি। কিন্তু প্রতি বছর একটু একটু করে সব হারিয়ে যাচ্ছে। — গাবুরার বাসিন্দা রহিম মোল্লা</blockquote>

<h2>আন্তর্জাতিক দায়িত্ব</h2>

<p>ধনী দেশগুলোকে তাদের কার্বন নির্গমন কমাতে হবে এবং ক্ষতিগ্রস্ত দেশগুলোকে ক্ষতিপূরণ দিতে হবে। বাংলাদেশকে কপ সম্মেলনে আরও সক্রিয় ভূমিকা পালন করতে হবে।</p>

<p>দেশীয়ভাবে আমাদের উপকূলীয় বাঁধ শক্তিশালী করা, ম্যানগ্রোভ বন বৃদ্ধি করা ও জলবায়ু উদ্বাস্তুদের পুনর্বাসনের পরিকল্পনা করতে হবে।</p>

<p>জলবায়ু পরিবর্তন মোকাবেলা কেবল পরিবেশ বিভাগের কাজ নয়। এটি জাতীয় নিরাপত্তার বিষয়, অর্থনৈতিক উন্নয়নের বিষয়, মানবাধিকারের বিষয়।</p>
HTML,
                'body_en'     => <<<HTML
<p>Bangladesh is one of the most vulnerable countries to climate change, yet contributes only 0.35% of global carbon emissions. This disparity represents a major failure of global politics.</p>

<p>According to the IPCC's latest report, sea levels are rising by an average of 3.6mm per decade. At this rate, a vast portion of Bangladesh's coastal area will be submerged by 2050.</p>

<h2>The Suffering of Coastal People</h2>

<p>From the Sundarbans to Bhola, Patuakhali, Barguna — people everywhere are victims of climate change. Increasing salinity is reducing arable land. Homes are disappearing due to river erosion.</p>

<blockquote>We have lived on our ancestors' land here. But every year, little by little, everything is being lost. — Rahim Molla, resident of Gabura</blockquote>

<h2>International Responsibility</h2>

<p>Rich nations must reduce their carbon emissions and compensate affected countries. Bangladesh must play a more active role at COP summits.</p>

<p>Domestically, we must strengthen coastal embankments, expand mangrove forests, and plan for climate refugees.</p>
HTML,
                'is_guest_author'     => true,
                'guest_author_name_bn'=> 'অধ্যাপক আইনুন নিশাত',
                'guest_author_name_en'=> 'Prof. Ainun Nishat',
                'guest_author_bio_bn' => 'জলবায়ু বিশেষজ্ঞ ও পানি সম্পদ প্রকৌশলী, ব্র্যাক বিশ্ববিদ্যালয়',
                'guest_author_bio_en' => 'Climate Expert and Water Resource Engineer, BRAC University',
                'image'               => 'https://picsum.photos/seed/op2author/200/200',
                'hours_ago'           => 48,
                'tags'                => ['climate-change'],
            ],
            [
                'title_bn'    => 'অর্থনৈতিক মন্দা কি আসছে? বাংলাদেশের সামনে যে চ্যালেঞ্জ',
                'title_en'    => 'Is a recession coming? The challenges ahead for Bangladesh',
                'subtitle_bn' => 'বৈদেশিক মুদ্রা রিজার্ভ ও মুদ্রাস্ফীতি নিয়ন্ত্রণে সরকারের কৌশল কী হওয়া উচিত',
                'subtitle_en' => 'What should the government\'s strategy be on managing foreign reserves and inflation',
                'slug_bn'     => 'orthonaitik-manda-asche-ki',
                'slug_en'     => 'is-a-recession-coming-challenges-for-bangladesh',
                'excerpt_bn'  => 'বাংলাদেশের অর্থনীতি এক ক্রান্তিকাল পার করছে। ডলার সংকট, মুদ্রাস্ফীতি ও বিনিয়োগ হ্রাস একসাথে মোকাবেলা করা কঠিন।',
                'excerpt_en'  => 'Bangladesh\'s economy is going through a critical phase. Simultaneously tackling the dollar crisis, inflation, and falling investment is challenging.',
                'body_bn'     => <<<HTML
<p>বাংলাদেশের অর্থনীতি এমন এক সন্ধিক্ষণে এসে দাঁড়িয়েছে যেখানে বেশ কয়েকটি চাপ একই সঙ্গে কাজ করছে। ডলারের মূল্য বৃদ্ধি, রিজার্ভ হ্রাস, ঊর্ধ্বমুখী মুদ্রাস্ফীতি ও বিনিয়োগ হ্রাস—এই চারটি সমস্যা একসাথে মোকাবেলা করার সক্ষমতা আমাদের আছে কি?</p>

<h2>বৈদেশিক মুদ্রা রিজার্ভের পরিস্থিতি</h2>

<p>বর্তমানে বাংলাদেশ ব্যাংকের বৈদেশিক মুদ্রা রিজার্ভ ২৪ বিলিয়ন ডলারের নিচে নেমেছে। আইএমএফ-এর মানদণ্ড অনুযায়ী কমপক্ষে তিন মাসের আমদানি ব্যয় সমান রিজার্ভ রাখার পরামর্শ দেওয়া হয়। বর্তমান রিজার্ভ সেই লক্ষ্যমাত্রার কাছাকাছি আছে, কিন্তু পরিস্থিতি উদ্বেগজনক।</p>

<blockquote>অর্থনীতির সংকট সাময়িক। কিন্তু দীর্ঘমেয়াদে কাঠামোগত সংস্কার না করলে বারবার এই চাপের মুখে পড়তে হবে। — ড. আতিউর রহমান, সাবেক গভর্নর, বাংলাদেশ ব্যাংক</blockquote>

<h2>সমাধান কী?</h2>

<p>সমস্যার সমাধান নেই এমন বলব না। কিন্তু সমাধান দ্রুত ও কার্যকরভাবে বাস্তবায়ন করতে হবে:</p>

<ul>
<li>রপ্তানি বহুমুখীকরণ ও নতুন বাজার খোঁজা</li>
<li>অভ্যন্তরীণ রাজস্ব আদায় বাড়ানো</li>
<li>সরকারি ব্যয়ে কৌশলগত সংযম</li>
<li>রেমিট্যান্সের জন্য আরও আকর্ষণীয় প্রণোদনা</li>
<li>বিদেশি বিনিয়োগ আকৃষ্ট করতে ব্যবসায়িক পরিবেশ উন্নয়ন</li>
</ul>

<p>অর্থনীতি পরিচালনায় রাজনৈতিক সদিচ্ছা ও দীর্ঘমেয়াদী দৃষ্টিভঙ্গি দরকার। স্বল্পমেয়াদী সুবিধার জন্য দীর্ঘমেয়াদী ক্ষতি করা চলবে না।</p>
HTML,
                'body_en'     => <<<HTML
<p>Bangladesh's economy has arrived at a junction where several pressures are working simultaneously. Dollar appreciation, falling reserves, rising inflation, and declining investment — do we have the capacity to tackle all four at once?</p>

<h2>Foreign Reserve Situation</h2>

<p>Bangladesh Bank's foreign reserves have now fallen below $24 billion. The IMF recommends maintaining reserves equivalent to at least three months of import costs. Current reserves are close to that threshold, but the situation is concerning.</p>

<blockquote>The economic crisis is temporary. But without structural reforms in the long term, we will face these pressures again and again. — Dr. Atiur Rahman, Former Governor, Bangladesh Bank</blockquote>

<h2>What Are the Solutions?</h2>

<ul>
<li>Export diversification and finding new markets</li>
<li>Increasing domestic revenue collection</li>
<li>Strategic restraint in government spending</li>
<li>More attractive incentives for remittances</li>
<li>Improving the business environment to attract foreign investment</li>
</ul>

<p>Managing the economy requires political will and a long-term vision. Short-term gains must not come at the cost of long-term damage.</p>
HTML,
                'is_guest_author'     => true,
                'guest_author_name_bn'=> 'ড. আতিউর রহমান',
                'guest_author_name_en'=> 'Dr. Atiur Rahman',
                'guest_author_bio_bn' => 'সাবেক গভর্নর, বাংলাদেশ ব্যাংক এবং অর্থনীতি অধ্যাপক, ঢাকা বিশ্ববিদ্যালয়',
                'guest_author_bio_en' => 'Former Governor, Bangladesh Bank and Professor of Economics, Dhaka University',
                'image'               => 'https://picsum.photos/seed/op3author/200/200',
                'hours_ago'           => 72,
                'tags'                => ['dollar-crisis', 'budget-2025'],
            ],
            [
                'title_bn'    => 'কৃত্রিম বুদ্ধিমত্তা কি আমাদের চাকরি কেড়ে নেবে?',
                'title_en'    => 'Will artificial intelligence take our jobs?',
                'subtitle_bn' => 'প্রযুক্তির সাথে তাল মিলিয়ে চলতে হলে দক্ষতা উন্নয়নে বিনিয়োগ করতে হবে',
                'subtitle_en' => 'Investment in skill development needed to keep pace with technology',
                'slug_bn'     => 'krittrim-buddhimotta-ki-chaakri-nebe',
                'slug_en'     => 'will-artificial-intelligence-take-our-jobs',
                'excerpt_bn'  => 'কৃত্রিম বুদ্ধিমত্তা দ্রুত বিশ্বের কর্মক্ষেত্র বদলে দিচ্ছে। বাংলাদেশের জন্য এটি সুযোগ না হুমকি?',
                'excerpt_en'  => 'AI is rapidly changing the world of work. Is this an opportunity or a threat for Bangladesh?',
                'body_bn'     => <<<HTML
<p>চ্যাটজিপিটি থেকে শুরু করে গেমিনি, ক্লড—কৃত্রিম বুদ্ধিমত্তার নতুন প্রজন্ম বিশ্বকে দ্রুত বদলে দিচ্ছে। লেখালেখি, কোডিং, অনুবাদ, ডিজাইন—এমন কোনো ক্ষেত্র নেই যেখানে এআই এখন কার্যকর ভূমিকা রাখছে না।</p>

<p>এই পরিবর্তন বাংলাদেশের জন্য একটি বিশাল চ্যালেঞ্জ। আমাদের জনশক্তির একটি বড় অংশ তৈরি পোশাক শিল্পে কর্মরত। এই শিল্পে স্বয়ংক্রিয় যন্ত্রপাতির ব্যবহার বাড়লে লাখো মানুষের কর্মসংস্থান হুমকিতে পড়বে।</p>

<h2>সুযোগের দিক</h2>

<p>তবে হতাশার পাশাপাশি সুযোগও আছে। এআই প্রযুক্তি ব্যবহার করে নতুন ব্যবসা তৈরি হচ্ছে। ডেটা সায়েন্স, মেশিন লার্নিং, প্রম্পট ইঞ্জিনিয়ারিং—এসব ক্ষেত্রে দক্ষ জনবলের চাহিদা বাড়ছে।</p>

<blockquote>এআই চাকরি নেবে না, কিন্তু এআই ব্যবহার করে যে মানুষ কাজ করতে পারবে, সে ব্যক্তি সেই কাজ নেবে যে পারবে না। — অ্যান্ড্রু এনজি, এআই বিশেষজ্ঞ</blockquote>

<h2>বাংলাদেশের করণীয়</h2>

<p>সরকারকে এখনই ডিজিটাল দক্ষতা উন্নয়নে বিনিয়োগ করতে হবে। শিক্ষাক্রমে প্রযুক্তি শিক্ষা আরও বাড়াতে হবে। প্রযুক্তি খাতে স্টার্টআপ সংস্কৃতি বিকাশে সরকারি সহায়তা দরকার।</p>

<p>পরিশেষে, প্রযুক্তির পরিবর্তনকে ভয় না করে একে সুযোগ হিসেবে গ্রহণ করাই হবে বুদ্ধিমানের কাজ।</p>
HTML,
                'body_en'     => <<<HTML
<p>From ChatGPT to Gemini to Claude — the new generation of artificial intelligence is rapidly changing the world. Writing, coding, translation, design — there is hardly a field where AI is not now playing an effective role.</p>

<p>This change poses a massive challenge for Bangladesh. A large portion of our workforce is employed in the garment industry. If automated machinery use increases there, the employment of millions will be at risk.</p>

<h2>The Opportunity Side</h2>

<p>But alongside despair, there is opportunity. New businesses are being created using AI. Demand for skilled workers in data science, machine learning, and prompt engineering is growing.</p>

<blockquote>AI won't take jobs, but a person using AI will take the job of someone who doesn't. — Andrew Ng, AI Expert</blockquote>

<h2>What Bangladesh Must Do</h2>

<p>The government must invest in digital skill development now. Technology education must be expanded in curricula. Government support is needed to develop startup culture in the tech sector.</p>

<p>Ultimately, embracing technological change as an opportunity rather than fearing it is the wise approach.</p>
HTML,
                'is_guest_author'     => false,
                'image'               => 'https://picsum.photos/seed/op4author/200/200',
                'hours_ago'           => 96,
                'tags'                => ['ai'],
            ],
            [
                'title_bn'    => 'শিক্ষা ব্যবস্থার সংকট: আমরা কি সঠিক পথে আছি?',
                'title_en'    => 'Crisis in the education system: Are we on the right track?',
                'subtitle_bn' => 'নম্বরসর্বস্ব শিক্ষা থেকে বেরিয়ে দক্ষতাভিত্তিক শিক্ষায় যেতে হবে',
                'subtitle_en' => 'We must move from grade-centric education to competency-based learning',
                'slug_bn'     => 'shikkha-bebostha-sankat',
                'slug_en'     => 'crisis-in-the-education-system',
                'excerpt_bn'  => 'পরীক্ষার নম্বর বাড়লেও বাস্তব জ্ঞান ও দক্ষতায় পিছিয়ে পড়ছে বাংলাদেশের শিক্ষার্থীরা।',
                'excerpt_en'  => 'Despite rising exam scores, Bangladeshi students are falling behind in practical knowledge and skills.',
                'body_bn'     => <<<HTML
<p>বাংলাদেশের শিক্ষা ব্যবস্থা একটি বিরোধাভাসে আটকে আছে। একদিকে জিপিএ-৫ পাওয়া শিক্ষার্থীর সংখ্যা প্রতি বছর বাড়ছে, অন্যদিকে বিশ্ববিদ্যালয় থেকে পাস করা তরুণরা কর্মবাজারে টিকতে পারছেন না। এই দুটো তথ্য একসাথে কীভাবে সত্য হতে পারে?</p>

<h2>মুখস্থনির্ভর শিক্ষার সমস্যা</h2>

<p>আমাদের শিক্ষা ব্যবস্থা মুখস্থ করার উপর অতিরিক্ত নির্ভরশীল। শিক্ষার্থীরা প্রশ্নের উত্তর মুখস্থ করে, কিন্তু সমস্যা সমাধানের দক্ষতা অর্জন করতে পারে না। সমালোচনামূলক চিন্তাভাবনা, সৃজনশীলতা ও যোগাযোগের দক্ষতার অভাব রয়েছে।</p>

<blockquote>আমাদের শিক্ষার্থীরা প্রশ্নের উত্তর দিতে পারে, কিন্তু প্রশ্ন তৈরি করতে পারে না। এটাই সবচেয়ে বড় সমস্যা। — ড. মোহাম্মদ কায়কোবাদ, বুয়েট অধ্যাপক</blockquote>

<h2>নতুন শিক্ষাক্রম কি সমাধান?</h2>

<p>নতুন জাতীয় শিক্ষাক্রম ২০২৩-এ অভিজ্ঞতাভিত্তিক শিক্ষার উপর জোর দেওয়া হয়েছে। এটি একটি ইতিবাচক পদক্ষেপ। কিন্তু শিক্ষকদের প্রশিক্ষণ, পাঠ্যপুস্তকের মান ও শিক্ষা পরিবেশের উন্নয়ন না হলে শুধু নীতি পরিবর্তনে কাজ হবে না।</p>

<p>শিক্ষার মান উন্নয়নে শিক্ষকদের বেতন ও মর্যাদা বাড়ানো অপরিহার্য। মেধাবী শিক্ষার্থীরা যদি শিক্ষকতা পেশায় না আসেন, তাহলে পরিবর্তন আসবে না।</p>
HTML,
                'body_en'     => <<<HTML
<p>Bangladesh's education system is stuck in a paradox. On one hand, the number of students achieving GPA-5 is increasing every year. On the other hand, young people graduating from universities are unable to survive in the job market. How can both these facts be true simultaneously?</p>

<h2>The Problem of Rote Learning</h2>

<p>Our education system is excessively dependent on memorization. Students memorize answers to questions but fail to develop problem-solving skills. Critical thinking, creativity, and communication skills are lacking.</p>

<blockquote>Our students can answer questions, but cannot generate questions. That is the biggest problem. — Dr. Mohammad Kaykobad, BUET Professor</blockquote>

<h2>Is the New Curriculum the Solution?</h2>

<p>The National Curriculum 2023 emphasizes experiential learning — a positive step. But without teacher training, improved textbook quality, and better learning environments, policy changes alone won't work.</p>

<p>Increasing teacher salaries and prestige is essential. If talented students don't enter the teaching profession, change won't come.</p>
HTML,
                'is_guest_author'     => false,
                'image'               => 'https://picsum.photos/seed/op5author/200/200',
                'hours_ago'           => 120,
                'tags'                => [],
            ],
            [
                'title_bn'    => 'ডিজিটাল যুগে সাংবাদিকতার চ্যালেঞ্জ: সত্য টিকবে কি?',
                'title_en'    => 'Challenges of journalism in the digital age: Will truth survive?',
                'subtitle_bn' => 'ভুয়া খবরের বিরুদ্ধে লড়াইয়ে দক্ষ সাংবাদিকতার বিকল্প নেই',
                'subtitle_en' => 'There is no alternative to skilled journalism in the fight against fake news',
                'slug_bn'     => 'digital-juge-sangbadikatar-challenge-2025',
                'slug_en'     => 'challenges-of-journalism-in-digital-age-2025',
                'excerpt_bn'  => 'সোশ্যাল মিডিয়ার যুগে মানুষ মিথ্যা খবরে বেশি আকৃষ্ট হচ্ছে। পেশাদার সাংবাদিকতার প্রাসঙ্গিকতা এখন বড় প্রশ্নের মুখে।',
                'excerpt_en'  => 'In the age of social media, people are more attracted to false news. The relevance of professional journalism now faces major questions.',
                'body_bn'     => <<<HTML
<p>একটি ভাইরাল ভুয়া খবর এখন হাজার সত্যিকার খবরের চেয়ে বেশি শেয়ার হয়। এটি কেবল তথ্যের সমস্যা নয়, এটি সমাজের জন্য একটি মারাত্মক বিপদ।</p>

<p>বাংলাদেশে সামাজিক যোগাযোগমাধ্যম ব্যবহারকারীর সংখ্যা এখন প্রায় ৬ কোটি। এই বিশাল ব্যবহারকারী গোষ্ঠীর কাছে তথ্য পৌঁছে দিচ্ছে সবাই—যাচাই করে এবং না করেও।</p>

<h2>পেশাদার সাংবাদিকতার গুরুত্ব</h2>

<p>তথ্য যাচাই করা, একাধিক সূত্র থেকে নিশ্চিত করা, বিষয়টি বোঝার জন্য বিশেষজ্ঞের মতামত নেওয়া—এগুলো পেশাদার সাংবাদিকতার মূলনীতি। এই নীতিগুলো আজও প্রাসঙ্গিক, বরং আগের চেয়ে বেশি প্রাসঙ্গিক।</p>

<blockquote>সত্যের পক্ষে থাকাটা সাংবাদিকতার প্রথম শর্ত। যে সাংবাদিক এই শর্ত ভুলে যান, তিনি আর সাংবাদিক নন, তিনি একজন প্রচারক। — আনিসুল হক, কলামিস্ট</blockquote>

<h2>পাঠকের দায়িত্ব</h2>

<p>শুধু সাংবাদিকদের দায়িত্ব নয়, পাঠকদেরও দায়িত্ব আছে। কোনো খবর শেয়ার করার আগে তা যাচাই করার অভ্যাস গড়ে তুলতে হবে। বিশ্বস্ত সংবাদ মাধ্যমের খবর পড়ার অভ্যাস রাখতে হবে।</p>

<p>সাংবাদিকতা এখনও জরুরি। বরং ডিজিটাল যুগে এর ভূমিকা আরও বড়। শুধু দরকার সৎ, দক্ষ ও সাহসী সাংবাদিক।</p>
HTML,
                'body_en'     => <<<HTML
<p>A viral piece of fake news now gets more shares than a thousand true stories. This is not just an information problem — it is a serious danger for society.</p>

<p>The number of social media users in Bangladesh is now approximately 60 million. This massive user base receives information from everyone — verified and unverified alike.</p>

<h2>The Importance of Professional Journalism</h2>

<p>Verifying information, confirming from multiple sources, seeking expert opinion — these are the core principles of professional journalism. These principles are still relevant today, more so than ever.</p>

<blockquote>Standing for truth is the first condition of journalism. A journalist who forgets this condition is no longer a journalist — they are a propagandist. — Anisul Hoque, Columnist</blockquote>

<h2>Reader Responsibility</h2>

<p>Not just journalists — readers also bear responsibility. The habit of verifying news before sharing it must be cultivated. The habit of reading trusted news sources must be maintained.</p>

<p>Journalism is still essential. In the digital age, its role is even bigger. We just need honest, skilled, and courageous journalists.</p>
HTML,
                'is_guest_author'     => false,
                'image'               => 'https://picsum.photos/seed/op6author/200/200',
                'hours_ago'           => 144,
                'tags'                => [],
            ],
        ];

        foreach ($opinions as $idx => $op) {
            $matchAttr = ['slug_bn' => $op['slug_bn']];
            $data = [
                'category_id'   => $category->id,
                'article_type'  => 'opinion',
                'edition'       => 'both',
                'status'        => 'published',
                'published_at'  => now()->subHours($op['hours_ago']),
                'featured_image'=> $op['image'],
                'views'         => rand(8000, 35000),
                'title_bn'      => $op['title_bn'],
                'title_en'      => $op['title_en'],
                'subtitle_bn'   => $op['subtitle_bn'] ?? null,
                'subtitle_en'   => $op['subtitle_en'] ?? null,
                'slug_en'       => $op['slug_en'],
                'excerpt_bn'    => $op['excerpt_bn'],
                'excerpt_en'    => $op['excerpt_en'],
                'body_bn'       => $op['body_bn'],
                'body_en'       => $op['body_en'],
                'is_guest_author'      => $op['is_guest_author'],
                'guest_author_name_bn' => $op['guest_author_name_bn'] ?? null,
                'guest_author_name_en' => $op['guest_author_name_en'] ?? null,
                'guest_author_bio_bn'  => $op['guest_author_bio_bn'] ?? null,
                'guest_author_bio_en'  => $op['guest_author_bio_en'] ?? null,
                'guest_author_image'   => $op['is_guest_author'] ? $op['image'] : null,
                'is_featured'          => ($idx < 2),
                'allow_comments'       => true,
            ];

            // Use first available user as author fallback
            $data['author_id'] = \App\Models\User::first()?->id ?? 1;

            $article = Article::firstOrCreate($matchAttr, $data);

            $article->categories()->syncWithoutDetaching([
                $category->id => ['is_primary' => true, 'sort_order' => 0],
            ]);

            // Attach tags
            foreach ($op['tags'] as $tSlug) {
                if (isset($tagMap[$tSlug])) {
                    $article->tags()->syncWithoutDetaching([$tagMap[$tSlug]->id]);
                    $tagMap[$tSlug]->increment('article_count');
                }
            }
        }

        $this->command->info('✅ Opinion articles seeded successfully!');
    }
}
