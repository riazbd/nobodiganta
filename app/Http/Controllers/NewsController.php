<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use App\Models\User;
use App\Models\Reporter;
use App\Models\Stock;
use App\Models\Price;
use App\Models\Ad;
use App\Models\CricketMatch;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\Horoscope;
use App\Models\Epaper;
use App\Services\PrayerTimeService;
use App\Services\WeatherService;
use App\Services\ArticleMeter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsController extends Controller
{
    /**
     * Detect edition from URL prefix or ?edition= query param (for API calls)
     */
    protected function getEdition(Request $request): string
    {
        $path = $request->path();
        if ($path === 'en' || str_starts_with($path, 'en/')) {
            return 'en';
        }
        return $request->query('edition') === 'en' ? 'en' : 'bn';
    }

    /**
     * Helper: Get ads grouped by position
     */
    protected function getAds(string $edition)
    {
        return Ad::active()->get()->groupBy('position')->map(function($group) use ($edition) {
            return $group->map(fn($ad) => [
                'id' => $ad->id,
                'title' => $ad->getTitle($edition),
                'image' => $ad->image,
                'link' => $ad->link,
                'type' => $ad->type,
                'code' => $ad->code,
            ]);
        });
    }

    /**
     * Home page
     */
    public function home(Request $request)
    {
        $edition = $this->getEdition($request);

        // 1. Lead articles — prefer featured, fall back to latest published
        $leadArticles = Article::published()->forEdition($edition)
            ->withRelations()
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->limit(15)
            ->get()
            ->map(fn($a) => $a->toAPIArray($edition))
            ->values();

        // 2. Latest strip — prefer breaking, fill with latest published
        $breakingNews = Article::published()->forEdition($edition)
            ->withRelations()
            ->orderByDesc('is_breaking')
            ->orderByDesc('published_at')
            ->limit(12)
            ->get()
            ->map(fn($a) => $a->toAPIArray($edition))
            ->values();

        // 3. Category sections — driven by HomepageSection config
        $layoutSections = \App\Models\HomepageSection::active()
            ->forEdition($edition)
            ->with(['category.children'])
            ->orderBy('sort_order')
            ->get();

        $homepageData = $layoutSections->map(function($section) use ($edition) {
            $data = [
                'id'            => $section->id,
                'title'         => $section->getTitle($edition),
                'type'          => $section->type,
                'layout'        => $section->layout,
                'subcategories' => [],
                'slug'          => null,
                'items'         => [],
            ];

            if ($section->type === 'category' && $section->category) {
                $cat = $section->category;
                $categoryIds = $cat->children->pluck('id')->push($cat->id);

                $data['slug'] = $cat->slug;

                // Pass subcategories so the frontend can show pills
                $data['subcategories'] = $cat->children->map(fn($c) => [
                    'id'   => $c->id,
                    'name' => $c->getName($edition),
                    'slug' => $c->slug,
                ])->values();

                $data['items'] = Article::published()
                    ->forEdition($edition)
                    ->whereIn('category_id', $categoryIds)
                    ->withRelations()
                    ->orderByDesc('published_at')
                    ->limit(max($section->item_count, 6))
                    ->get()
                    ->map(fn($a) => $a->toAPIArray($edition))
                    ->values();

            } elseif ($section->type === 'videos') {
                // Videos — try article_type=video first, fall back to ভিডিও category
                $videoArticles = Article::published()
                    ->forEdition($edition)
                    ->where('article_type', 'video')
                    ->withRelations()
                    ->orderByDesc('published_at')
                    ->limit(8)
                    ->get();

                if ($videoArticles->isEmpty()) {
                    $videoCat = \App\Models\Category::where('slug', 'video')
                        ->orWhere('name_bn', 'ভিডিও')
                        ->first();
                    if ($videoCat) {
                        $videoArticles = Article::published()
                            ->forEdition($edition)
                            ->where('category_id', $videoCat->id)
                            ->withRelations()
                            ->orderByDesc('published_at')
                            ->limit(8)
                            ->get();
                    }
                }

                $data['items'] = $videoArticles
                    ->map(fn($a) => $a->toAPIArray($edition))
                    ->values();
            } elseif ($section->type === 'stories') {
                $data['items'] = \App\Models\Story::published()
                    ->forEdition($edition)
                    ->with(['coverMedia', 'slides.media', 'slides.linkedArticle.category'])
                    ->withCount('slides')
                    ->latest('published_at')
                    ->limit($section->item_count ?? 10)
                    ->get()
                    ->map(fn($s) => $s->toAPIArray($edition))
                    ->values();
            }

            return $data;
        })->values();

        // 4. Opinions — type opinion, fall back to মতামত category
        $opinions = Article::published()->forEdition($edition)
            ->where(function($q) {
                $q->where('article_type', 'opinion')
                  ->orWhereHas('category', function($q2) {
                      $q2->where('slug', 'opinion')
                        ->orWhere('name_bn', 'মতামত')
                        ->orWhereHas('parent', fn($q3) => $q3->where('slug', 'opinion'));
                  });
            })
            ->withRelations()
            ->orderByDesc('published_at')
            ->limit(6)
            ->get()
            ->map(fn($a) => $a->toAPIArray($edition))
            ->values();

        // 5. Most read
        $mostRead = Article::published()->forEdition($edition)
            ->withRelations()
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn($a) => $a->toAPIArray($edition))
            ->values();

        // 6. Popular tags — live count of published articles
        $popularTags = Tag::withCount(['articles' => fn($q) => $q->where('status', 'published')])
            ->orderByDesc('articles_count')
            ->limit(50)
            ->get()
            ->filter(fn($t) => $t->articles_count > 0)
            ->take(24)
            ->map(fn($t) => [
                'id'    => $t->id,
                'name'  => $t->getName($edition),
                'slug'  => $t->slug,
                'count' => $t->articles_count,
            ])
            ->values();

        // 7. Weather (real-time, cached 30min)
        $weatherService = new WeatherService();
        $weather = $weatherService->getCurrentAndForecast('dhaka');

        // 8. Prayer times (real-time, cached 24h)
        $prayerService = new PrayerTimeService();
        $prayerTimes = $prayerService->getTimingsForCity('dhaka');

        // 9. Active poll
        $pollRow = Poll::where('is_active', true)->with('options')->latest('start_date')->first();
        $poll = $pollRow ? [
            'id'          => $pollRow->id,
            'question'    => $pollRow->getQuestion($edition),
            'total_votes' => $pollRow->total_votes,
            'options'     => $pollRow->options->map(fn($opt) => [
                'id'     => $opt->id,
                'option' => $opt->getOption($edition),
                'votes'  => $opt->votes,
            ])->values(),
        ] : null;

        return Inertia::render('Home', [
            'edition'      => $edition,
            'leadArticles' => $leadArticles,
            'breakingNews' => $breakingNews,
            'sections'     => $homepageData,
            'opinions'     => $opinions,
            'mostRead'     => $mostRead,
            'popularTags'  => $popularTags,
            'weather'      => $weather,
            'prayerTimes'  => $prayerTimes,
            'poll'         => $poll,
            'ads'          => $this->getAds($edition),
        ]);
    }

    /**
     * Category page
     */
    public function category(Request $request, $slug)
    {
        $edition = $this->getEdition($request);

        $category = Category::where('slug', $slug)
            ->where(function ($q) use ($edition) {
                $q->where('edition', 'both')
                  ->orWhere('edition', $edition);
            })
            ->with(['children'])
            ->firstOrFail();

        $query = Article::published()->forEdition($edition);

        $query->whereHas('categories', function ($q) use ($category) {
            $q->where('categories.id', $category->id);
        });

        $articles = $query->withRelations()
            ->latest()
            ->paginate(20)
            ->through(fn($article) => $article->toAPIArray($edition));

        return Inertia::render('Category', [
            'edition' => $edition,
            'category' => [
                'id' => $category->id,
                'name' => $category->getName($edition),
                'slug' => $category->slug,
                'description' => $category->getDescription($edition),
                'parentId' => $category->parent_id,
                'subcategories' => $category->children->map(fn($c) => [
                    'id' => $c->id,
                    'name' => $c->getName($edition),
                    'slug' => $c->slug,
                ]),
            ],
            'articles' => $articles,
            'ads' => $this->getAds($edition),
        ]);
    }

    /**
     * Article page - /{category}/{slug}
     */
    public function article(Request $request, $categorySlug, $articleSlug)
    {
        $edition = $this->getEdition($request);

        // Find article by slug (try both bn and en slugs)
        $article = Article::published()
            ->forEdition($edition)
            ->where(function ($q) use ($articleSlug) {
                $q->where('slug_bn', $articleSlug)
                  ->orWhere('slug_en', $articleSlug);
            })
            ->withRelations()
            ->firstOrFail();

        // Increment view count
        $article->incrementViews();

        // Record article view for meter
        ArticleMeter::recordView($article->id);

        // Check paywall for premium articles
        $isPremium = $article->is_premium;
        $hasSubscription = false;
        $meterExceeded = ArticleMeter::hasExceededLimit();
        $meterRemaining = ArticleMeter::getRemaining();

        if ($request->user()) {
            $hasSubscription = $request->user()->hasPremiumSubscription();
        }

        // If premium article and no subscription, show paywall
        if ($isPremium && !$hasSubscription) {
            return Inertia::render('Article', [
                'edition' => $edition,
                'article' => $article->toAPIArray($edition),
                'paywall' => true,
                'paywallReason' => 'premium',
                'meterRemaining' => $meterRemaining,
                'meterExceeded' => $meterExceeded,
            ]);
        }

        // If meter exceeded and no subscription, show paywall
        if ($meterExceeded && !$hasSubscription) {
            return Inertia::render('Article', [
                'edition' => $edition,
                'article' => $article->toAPIArray($edition),
                'paywall' => true,
                'paywallReason' => 'meter_exceeded',
                'meterRemaining' => 0,
                'meterExceeded' => true,
            ]);
        }

        // Related articles
        $relatedArticles = Article::published()
            ->forEdition($edition)
            ->where('category_id', $article->category_id)
            ->where('id', '!=', $article->id)
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($a) => $a->toAPIArray($edition));

        return Inertia::render('Article', [
            'edition' => $edition,
            'article' => $article->toAPIArray($edition),
            'relatedArticles' => $relatedArticles,
            'ads' => $this->getAds($edition),
            'paywall' => false,
            'meterRemaining' => $meterRemaining,
            'meterExceeded' => false,
        ]);
    }

    /**
     * Topic (tag) page
     */
    public function topic(Request $request, $slug)
    {
        $edition = $this->getEdition($request);

        $tag = Tag::where('slug', $slug)->firstOrFail();

        $articles = Article::published()
            ->forEdition($edition)
            ->whereHas('tags', function ($q) use ($tag) {
                $q->where('tag_id', $tag->id);
            })
            ->latest()
            ->paginate(20)
            ->through(fn($article) => $article->toAPIArray($edition));

        return Inertia::render('Tag', [
            'edition' => $edition,
            'tag' => [
                'id' => $tag->id,
                'name' => $tag->getName($edition),
                'slug' => $tag->slug,
                'description' => $tag->getDescription($edition),
            ],
            'articles' => $articles,
        ]);
    }

    /**
     * Author page
     */
    public function author(Request $request, $slug)
    {
        $edition = $this->getEdition($request);

        // Find reporter by slug
        $reporter = Reporter::where('slug', $slug)->first();
        
        if (!$reporter) {
            // Fallback: search for user by name slug
            $user = User::whereRaw("LOWER(REPLACE(name, ' ', '-')) = ?", [strtolower($slug)])->firstOrFail();
            
            // Create a temporary reporter object for consistency if none exists
            $authorData = [
                'id' => $user->id,
                'name' => $user->name,
                'name_bn' => $user->name,
                'name_en' => $user->name,
                'slug' => $slug,
                'designation' => null,
                'bio' => null,
                'image' => $user->profile_photo_url,
            ];
            $authorId = $user->id;
        } else {
            $authorData = [
                'id' => $reporter->id,
                'name' => $reporter->getName($edition),
                'name_bn' => $reporter->name_bn,
                'name_en' => $reporter->name_en,
                'slug' => $reporter->slug,
                'designation' => $reporter->getDesignation($edition),
                'bio' => $reporter->getBio($edition),
                'image' => $reporter->image ?: ($reporter->user ? $reporter->user->profile_photo_url : null),
                'social_links' => $reporter->social_links,
            ];
            $authorId = $reporter->user_id ?: 0; // If reporter has no user_id, use 0
        }

        $articles = Article::published()
            ->forEdition($edition)
            ->where(function($q) use ($authorId, $reporter) {
                if ($authorId) {
                    $q->where('author_id', $authorId);
                }
                // Also support guest authors if we ever implement that linkage
            })
            ->latest()
            ->paginate(20)
            ->through(fn($article) => $article->toAPIArray($edition));

        return Inertia::render('Author', [
            'edition' => $edition,
            'author' => $authorData,
            'articles' => $articles,
        ]);
    }

    /**
     * Live blog page
     */
    public function liveblog(Request $request, $slug)
    {
        $edition = $this->getEdition($request);

        $article = Article::published()
            ->forEdition($edition)
            ->type('liveblog')
            ->where(function ($q) use ($slug) {
                $q->where('slug_bn', $slug)
                  ->orWhere('slug_en', $slug);
            })
            ->withRelations()
            ->firstOrFail();

        // Increment view count
        $article->incrementViews();

        $updates = $article->updates()
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'headline' => $u->getHeadline($edition),
                'body' => $u->getBody($edition),
                'author' => $u->getAuthorName($edition),
                'time' => $u->created_at->diffForHumans(),
                'timestamp' => $u->created_at->toIso8601String(),
                'is_key_event' => $u->is_key_event,
            ]);

        return Inertia::render('Liveblog', [
            'edition' => $edition,
            'article' => $article->toAPIArray($edition),
            'initialUpdates' => $updates,
        ]);
    }

    /**
     * API: Get liveblog updates
     */
    public function apiLiveblogUpdates(Request $request, Article $article)
    {
        $edition = $this->getEdition($request);
        $afterId = $request->input('after_id');

        $query = $article->updates();
        if ($afterId) {
            $query->where('id', '>', $afterId);
        }

        $updates = $query->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'headline' => $u->getHeadline($edition),
                'body' => $u->getBody($edition),
                'author' => $u->getAuthorName($edition),
                'time' => $u->created_at->diffForHumans(),
                'timestamp' => $u->created_at->toIso8601String(),
                'is_key_event' => $u->is_key_event,
            ]);

        return response()->json(['data' => $updates]);
    }

    /**
     * Regional page
     */
    public function regional(Request $request)
    {
        $edition = $this->getEdition($request);
        $division = $request->input('division', 'dhaka');

        $articles = Article::published()
            ->forEdition($edition)
            ->where('division', $division)
            ->latest()
            ->paginate(20)
            ->through(fn($article) => $article->toAPIArray($edition));

        return Inertia::render('Regional', [
            'edition' => $edition,
            'division' => $division,
            'articles' => $articles,
        ]);
    }

    /**
     * API: Get regional articles
     */
    public function apiRegional(Request $request)
    {
        $edition = $this->getEdition($request);
        $division = $request->input('division');
        $district = $request->input('district');

        $query = Article::published()->forEdition($edition);
        
        if ($division) {
            $query->where('division', $division);
        }
        if ($district) {
            $query->where('district', $district);
        }

        $articles = $query->latest()
            ->paginate(20)
            ->through(fn($article) => $article->toAPIArray($edition));

        return response()->json($articles);
    }

    /**
     * API: Get stocks
     */
    public function apiStocks(Request $request)
    {
        $edition = $this->getEdition($request);
        
        $stocks = Stock::orderBy('sort_order')->get()->map(fn($s) => [
            'name' => $s->getName($edition),
            'value' => $s->value,
            'change' => $s->change,
            'up' => $s->is_up,
        ]);

        $prices = Price::orderBy('sort_order')->get()->map(fn($p) => [
            'key' => $p->key,
            'name' => $p->getTitle($edition),
            'value' => $p->amount,
            'unit' => $p->unit,
            'change' => $p->change,
            'up' => $p->trend === 'up' ? true : ($p->trend === 'down' ? false : null),
        ]);

        // Mock more data for StockMarket page but using dynamic base
        $data = [
            'indices' => [
                ['name' => $edition === 'en' ? 'DSEX' : 'ডিএসইএক্স', 'value' => 6245.32, 'change' => 28.15, 'pct' => '0.54%'],
                ['name' => $edition === 'en' ? 'DS30' : 'ডিএস৩০', 'value' => 2124.15, 'change' => 12.44, 'pct' => '0.59%'],
                ['name' => $edition === 'en' ? 'CASPI' : 'সিএএসপিআই', 'value' => 18342.15, 'change' => -12.44, 'pct' => '-0.08%'],
            ],
            'gainers' => [
                ['symbol' => 'BRACBANK', 'change' => 6.51],
                ['symbol' => 'SQURPHARMA', 'change' => 4.25],
                ['symbol' => 'GP', 'change' => 3.46],
            ],
            'losers' => [
                ['symbol' => 'BEXIMCO', 'change' => -6.06],
                ['symbol' => 'SUMMITPOW', 'change' => -5.26],
            ],
            'ticker' => $stocks,
            'prices' => $prices,
        ];

        return response()->json(['data' => $data]);
    }

    /**
     * API: Get cricket matches
     */
    public function apiCricket(Request $request)
    {
        $edition = $this->getEdition($request);
        
        $matches = CricketMatch::orderBy('sort_order')->get()->map(fn($m) => [
            'id' => $m->id,
            'series' => $m->getSeries($edition),
            'status' => $m->status,
            'statusText' => $m->getStatusText($edition),
            'teams' => array_map(function($team) use ($edition) {
                return [
                    'name' => $edition === 'en' ? ($team['name_en'] ?? $team['name_bn']) : ($team['name_bn'] ?? $team['name_en']),
                    'score' => $team['score'] ?? null,
                    'wickets' => $team['wickets'] ?? null,
                    'overs' => $team['overs'] ?? null,
                ];
            }, $m->teams),
        ]);

        return response()->json(['data' => $matches]);
    }

    /**
     * API: Get ads
     */
    public function adImpression(Request $request, $id)
    {
        Ad::where('id', $id)->increment('impressions');
        return response()->json(['ok' => true]);
    }

    public function adClick(Request $request, $id)
    {
        Ad::where('id', $id)->increment('clicks');
        return response()->json(['ok' => true]);
    }

    public function apiAds(Request $request)
    {
        $edition = $this->getEdition($request);
        $position = $request->query('position');

        $query = Ad::active();
        if ($position) {
            $query->position($position);
        }

        $ads = $query->get()->map(fn($ad) => [
            'id' => $ad->id,
            'title' => $ad->getTitle($edition),
            'image' => $ad->image,
            'link' => $ad->link,
            'type' => $ad->type,
            'code' => $ad->code,
            'position' => $ad->position,
        ]);

        return response()->json(['data' => $ads]);
    }

    /**
     * API: Get Active Poll
     */
    public function apiPoll(Request $request)
    {
        $edition = $this->getEdition($request);
        $poll = Poll::where('is_active', true)->with('options')->latest('start_date')->first();

        if (!$poll) return response()->json(['data' => null]);

        return response()->json(['data' => [
            'id'             => $poll->id,
            'question'       => $poll->getQuestion($edition),
            'total_votes'    => $poll->total_votes,
            'featured_image' => $poll->featured_image,
            'created_at'     => $poll->created_at?->toISOString(),
            'end_date'       => $poll->end_date?->toDateString(),
            'options'        => $poll->options->map(fn($opt) => [
                'id'     => $opt->id,
                'option' => $opt->getOption($edition),
                'votes'  => $opt->votes,
            ]),
        ]]);
    }

    /**
     * API: Submit a vote for a poll option
     */
    public function apiPollVote(Request $request, Poll $poll)
    {
        if (!$poll->is_active || ($poll->end_date && $poll->end_date->isPast())) {
            return response()->json(['error' => 'Poll is closed'], 422);
        }

        $validated = $request->validate([
            'option_id' => 'required|integer',
        ]);

        $option = PollOption::where('id', $validated['option_id'])
            ->where('poll_id', $poll->id)
            ->firstOrFail();

        $option->increment('votes');
        $poll->increment('total_votes');

        $poll->load('options');

        return response()->json([
            'options' => $poll->options->map(fn($opt) => [
                'id'    => $opt->id,
                'votes' => $opt->votes,
            ]),
        ]);
    }

    /**
     * API: Get Horoscope
     */
    public function apiHoroscope(Request $request)
    {
        $edition = $this->getEdition($request);
        // Latest predictions grouped by sign
        $horoscopes = Horoscope::latest('date')->take(12)->get()->mapWithKeys(function($h) use ($edition) {
            $key = strtolower($h->sign);
            return [
                $key => [
                    'sign' => $h->getSign($edition),
                    'prediction' => $h->getPrediction($edition),
                ]
            ];
        });

        return response()->json(['data' => $horoscopes]);
    }

    /**
     * API: Get E-Paper editions
     */
    public function apiEpaper(Request $request)
    {
        $edition = $this->getEdition($request);
        $editions = Epaper::where('edition', $edition)
            ->latest('date')
            ->limit(30)
            ->get()
            ->map(fn($e) => [
                'date' => $e->date,
                'pdfUrl' => $e->pdf_url,
                'thumbnailUrl' => $e->thumbnail_url,
                'label' => $e->getLabel('bn'),
                'labelEn' => $e->getLabel('en'),
            ]);

        return response()->json(['data' => $editions]);
    }

    /**
     * Search page
     */
    public function search(Request $request)
    {
        $edition = $this->getEdition($request);
        $query = $request->input('q', '');

        $articles = collect();
        if (strlen($query) >= 2) {
            $articles = Article::published()
                ->forEdition($edition)
                ->where(function ($q) use ($query) {
                    $q->where('title_bn', 'like', "%{$query}%")
                      ->orWhere('title_en', 'like', "%{$query}%")
                      ->orWhere('excerpt_bn', 'like', "%{$query}%")
                      ->orWhere('excerpt_en', 'like', "%{$query}%");
                })
                ->latest()
                ->paginate(20)
                ->through(fn($article) => $article->toAPIArray($edition));
        }

        return Inertia::render('Search', [
            'edition' => $edition,
            'query' => $query,
            'articles' => $articles,
        ]);
    }

    /**
     * API: Get trending articles
     */
    public function apiTrending(Request $request)
    {
        $edition = $this->getEdition($request);
        $limit = $request->input('limit', 5);

        $articles = Article::published()
            ->forEdition($edition)
            ->orderBy('views', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($article) => $article->toAPIArray($edition));

        return response()->json(['data' => $articles]);
    }

    /**
     * API: Get most read articles
     */
    public function apiMostRead(Request $request)
    {
        $edition = $this->getEdition($request);
        $limit = $request->input('limit', 5);

        $articles = Article::published()
            ->forEdition($edition)
            ->orderBy('views', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($article) => $article->toAPIArray($edition));

        return response()->json(['data' => $articles]);
    }

    /**
     * API: Get most commented articles
     */
    public function apiMostCommented(Request $request)
    {
        $edition = $this->getEdition($request);
        $limit = $request->input('limit', 5);

        $articles = Article::published()
            ->forEdition($edition)
            ->withCount('comments')
            ->orderBy('comments_count', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($article) => $article->toAPIArray($edition));

        return response()->json(['data' => $articles]);
    }

    public function recordShare(Request $request, Article $article)
    {
        $platform = $request->input('platform', 'unknown');
        $allowed  = ['facebook', 'whatsapp', 'telegram', 'twitter', 'linkedin', 'copy', 'native'];

        if (!in_array($platform, $allowed)) {
            return response()->json(['error' => 'Invalid platform'], 422);
        }

        $article->recordShare($platform);

        return response()->json([
            'shares_count' => $article->fresh()->shares_count,
        ]);
    }

    public function getShareCounts(Article $article)
    {
        return response()->json([
            'total'     => $article->shares_count ?? 0,
            'platforms' => $article->sharesByPlatform(),
        ]);
    }

    public function apiLatest(Request $request)
    {
        $edition = $this->getEdition($request);
        $limit = $request->input('limit', 6);

        $articles = Article::published()
            ->forEdition($edition)
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($article) => $article->toAPIArray($edition));

        return response()->json(['data' => $articles]);
    }

    /**
     * API: Get opinions
     */
    public function apiOpinions(Request $request)
    {
        $edition = $this->getEdition($request);
        $limit = $request->input('limit', 4);

        $articles = Article::published()
            ->forEdition($edition)
            ->type('opinion')
            ->latest()
            ->limit($limit)
            ->withRelations()
            ->get()
            ->map(function($article) use ($edition) {
                $data = $article->toAPIArray($edition);
                // Map fields to match what opinionService.js expects (name, desg, title, avatar)
                return [
                    'id' => $data['id'],
                    'title' => $data['title'],
                    'slug' => $data['slug'],
                    'excerpt' => $data['excerpt'] ?? null,
                    'name' => $data['author']['name'] ?? 'Unknown',
                    'desg' => $data['author']['designation'] ?? 'Columnist',
                    'avatar' => $data['author']['image'] ?? null,
                    'categorySlug' => $data['category']['slug'] ?? 'opinion',
                ];
            });

        return response()->json(['data' => $articles]);
    }

    // ══════════════════════════════════════
    // STATIC PAGES (unchanged)
    // ══════════════════════════════════════

    public function gallery(Request $request)
    {
        $edition = $this->getEdition($request);
        return Inertia::render('Gallery', [
            'edition' => $edition,
            'ads' => $this->getAds($edition)
        ]);
    }

    public function video(Request $request)
    {
        $edition = $this->getEdition($request);
        $videos = Article::published()
            ->forEdition($edition)
            ->type('video')
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'title' => $edition === 'en' ? $a->title_en : $a->title_bn,
                'time' => $a->published_at ? $a->published_at->diffForHumans() : '',
                'views' => $a->views,
                'duration' => $a->video_duration ?: '03:45',
                'thumbnail' => $a->featured_image,
                'video_url' => $a->video_url,
            ]);

        return Inertia::render('Video', [
            'edition' => $edition,
            'videos' => $videos,
            'ads' => $this->getAds($edition),
        ]);
    }

    public function epaper(Request $request)
    {
        $edition = $this->getEdition($request);
        return Inertia::render('Epaper', [
            'edition' => $edition,
            'ads' => $this->getAds($edition)
        ]);
    }

    public function about()
    {
        return Inertia::render('About');
    }

    public function privacy()
    {
        return Inertia::render('Privacy');
    }

    public function terms()
    {
        return Inertia::render('Terms');
    }

    public function contact()
    {
        return Inertia::render('Contact');
    }

    public function archive(Request $request)
    {
        $edition = $this->getEdition($request);
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);
        $day = $request->input('day', now()->day);

        $articles = Article::published()
            ->forEdition($edition)
            ->whereYear('published_at', $year)
            ->whereMonth('published_at', $month)
            ->whereDay('published_at', $day)
            ->latest()
            ->get()
            ->map(fn($article) => $article->toAPIArray($edition));

        return Inertia::render('Archive', [
            'edition' => $edition,
            'year' => (int) $year,
            'month' => (int) $month,
            'day' => (int) $day,
            'articles' => $articles,
        ]);
    }

    public function prayerTimes(Request $request)
    {
        $service  = new PrayerTimeService();
        $cityKey  = $request->query('city', config('bangladesh_cities.default', 'dhaka'));
        $today    = $service->getTimingsForCity($cityKey);
        $calendar = $service->getMonthlyCalendar($cityKey, now()->month, now()->year);
        $cities   = $service->getCities();

        return Inertia::render('PrayerTimes', [
            'today'    => $today,
            'calendar' => $calendar,
            'cities'   => $cities,
            'cityKey'  => $cityKey,
        ]);
    }

    public function cricket()
    {
        return Inertia::render('Cricket');
    }

    public function stockMarket()
    {
        return Inertia::render('StockMarket');
    }

    public function jobs(Request $request)
    {
        $edition = $this->getEdition($request);
        $articles = Article::published()->forEdition($edition)->whereHas('category', function($q) {
            $q->where('slug', 'jobs');
        })->latest()->limit(10)->get()->map(fn($a) => $a->toAPIArray($edition));

        return Inertia::render('Jobs', [
            'edition' => $edition,
            'articles' => $articles,
            'ads' => $this->getAds($edition),
        ]);
    }

    public function health(Request $request)
    {
        $edition = $this->getEdition($request);
        $articles = Article::published()->forEdition($edition)->whereHas('category', function($q) {
            $q->where('slug', 'health');
        })->latest()->limit(10)->get()->map(fn($a) => $a->toAPIArray($edition));

        return Inertia::render('Health', [
            'edition' => $edition,
            'articles' => $articles,
            'ads' => $this->getAds($edition),
        ]);
    }

    public function islamicLife(Request $request)
    {
        $edition = $this->getEdition($request);
        $articles = Article::published()->forEdition($edition)->whereHas('category', function($q) {
            $q->where('slug', 'islamic-life');
        })->latest()->limit(10)->get()->map(fn($a) => $a->toAPIArray($edition));

        return Inertia::render('IslamicLife', [
            'edition' => $edition,
            'articles' => $articles,
            'ads' => $this->getAds($edition),
        ]);
    }

    public function horoscope()
    {
        return Inertia::render('Horoscope');
    }
}
