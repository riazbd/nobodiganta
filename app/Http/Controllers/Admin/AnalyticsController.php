<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdClient;
use App\Models\AdSlot;
use App\Models\Article;
use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Real-data analytics reports. Every figure here comes from data the system
 * actually collects (page_views, articles, ads) — no mock numbers and no
 * metrics that would require external services (geo, bounce, keyword rankings).
 */
class AnalyticsController extends Controller
{
    private const BN_DAY = ['Sun' => 'রবি', 'Mon' => 'সোম', 'Tue' => 'মঙ্গল', 'Wed' => 'বুধ', 'Thu' => 'বৃহঃ', 'Fri' => 'শুক্র', 'Sat' => 'শনি'];
    private const BN_MON = ['Jan' => 'জানু', 'Feb' => 'ফেব্রু', 'Mar' => 'মার্চ', 'Apr' => 'এপ্রিল', 'May' => 'মে', 'Jun' => 'জুন', 'Jul' => 'জুলাই', 'Aug' => 'আগস্ট', 'Sep' => 'সেপ্টে', 'Oct' => 'অক্টো', 'Nov' => 'নভে', 'Dec' => 'ডিসে'];

    // ── Traffic Analytics ────────────────────────────────────────────────────

    public function traffic(Request $request)
    {
        $this->authorizePermission($request, 'analytics.view');

        $range = (int) $request->input('range', 7);
        $range = in_array($range, [7, 30, 90], true) ? $range : 7;

        $start = today()->subDays($range - 1);
        $prevStart = today()->subDays($range * 2 - 1);
        $prevEnd = today()->subDays($range);

        $pvInRange = PageView::where('created_at', '>=', $start);
        $pageviews = (clone $pvInRange)->count();
        $uniques = (clone $pvInRange)->distinct('visitor_hash')->count('visitor_hash');

        $prevPageviews = PageView::whereBetween('created_at', [$prevStart->copy()->startOfDay(), $prevEnd->copy()->endOfDay()])->count();

        $todayVisitors = PageView::whereDate('created_at', today())->distinct('visitor_hash')->count('visitor_hash');
        $yesterdayVisitors = PageView::whereDate('created_at', today()->subDay())->distinct('visitor_hash')->count('visitor_hash');

        // Daily series
        $labels = $labelsEn = $pvSeries = $uvSeries = [];
        for ($i = $range - 1; $i >= 0; $i--) {
            $day = today()->subDays($i);
            $en = $day->format('D');
            $labelsEn[] = $range > 14 ? $day->format('j') : $en;
            $labels[] = $range > 14 ? $this->bnDigits($day->format('j')) : (self::BN_DAY[$en] ?? $en);
            $pvSeries[] = PageView::whereDate('created_at', $day)->count();
            $uvSeries[] = PageView::whereDate('created_at', $day)->distinct('visitor_hash')->count('visitor_hash');
        }

        // Traffic sources — bucket referrer hosts
        $hosts = (clone $pvInRange)
            ->selectRaw('referrer_host, count(*) as c')
            ->groupBy('referrer_host')
            ->pluck('c', 'referrer_host');
        $buckets = ['search' => 0, 'social' => 0, 'direct' => 0, 'referral' => 0];
        foreach ($hosts as $host => $c) {
            if ($host === null || $host === '') {
                $buckets['direct'] += $c;
            } elseif ($this->isSearchHost($host)) {
                $buckets['search'] += $c;
            } elseif ($this->isSocialHost($host)) {
                $buckets['social'] += $c;
            } else {
                $buckets['referral'] += $c;
            }
        }
        $srcTotal = max(1, array_sum($buckets));
        $sourceMeta = [
            'search'   => ['bn' => 'সার্চ ইঞ্জিন', 'en' => 'Search', 'icon' => 'Search', 'color' => '#10b981'],
            'social'   => ['bn' => 'সোশ্যাল মিডিয়া', 'en' => 'Social', 'icon' => 'Facebook', 'color' => '#3b82f6'],
            'direct'   => ['bn' => 'ডাইরেক্ট', 'en' => 'Direct', 'icon' => 'Globe', 'color' => '#263238'],
            'referral' => ['bn' => 'রেফারেল', 'en' => 'Referral', 'icon' => 'Link', 'color' => '#f59e0b'],
        ];
        $sources = collect($buckets)
            ->map(fn($c, $k) => [
                'name' => $sourceMeta[$k]['bn'], 'nameEn' => $sourceMeta[$k]['en'],
                'icon' => $sourceMeta[$k]['icon'], 'color' => $sourceMeta[$k]['color'],
                'count' => $c, 'pct' => (int) round($c / $srcTotal * 100),
            ])
            ->sortByDesc('count')->values();

        // Device breakdown — guarded so a missing column (e.g. migration not yet
        // run on a fresh deploy) degrades to "no data" instead of erroring the page.
        $deviceRows = \Illuminate\Support\Facades\Schema::hasColumn('page_views', 'device')
            ? (clone $pvInRange)
                ->selectRaw("COALESCE(device, 'unknown') as d, count(*) as c")
                ->groupBy('d')->pluck('c', 'd')
            : collect();
        $devTotal = max(1, $deviceRows->sum());
        $devMeta = [
            'mobile'  => ['bn' => 'মোবাইল', 'en' => 'Mobile', 'color' => '#263238'],
            'desktop' => ['bn' => 'ডেস্কটপ', 'en' => 'Desktop', 'color' => '#3b82f6'],
            'tablet'  => ['bn' => 'ট্যাবলেট', 'en' => 'Tablet', 'color' => '#f59e0b'],
            'unknown' => ['bn' => 'অজানা', 'en' => 'Unknown', 'color' => '#9ca3af'],
        ];
        $devices = collect(['mobile', 'desktop', 'tablet', 'unknown'])
            ->map(fn($k) => [
                'key' => $k, 'labelBn' => $devMeta[$k]['bn'], 'labelEn' => $devMeta[$k]['en'],
                'color' => $devMeta[$k]['color'], 'count' => (int) ($deviceRows[$k] ?? 0),
                'pct' => round(($deviceRows[$k] ?? 0) / $devTotal * 100, 1),
            ])
            ->filter(fn($d) => $d['count'] > 0)->values();

        // Top pages — resolve article titles from the trailing slug where possible
        $topPaths = (clone $pvInRange)
            ->selectRaw('path, count(*) as c')
            ->groupBy('path')->orderByDesc('c')->limit(8)->get();
        $topPages = $topPaths->map(function ($row) {
            $slug = $row->path ? collect(explode('/', $row->path))->last() : null;
            $article = $slug
                ? Article::where('slug_bn', $slug)->orWhere('slug_en', $slug)->first(['title_bn', 'title_en'])
                : null;
            return [
                'titleBn' => $article?->title_bn ?? ('/' . $row->path),
                'titleEn' => $article?->title_en ?: ($article?->title_bn ?? ('/' . $row->path)),
                'path' => '/' . $row->path,
                'views' => (int) $row->c,
            ];
        });

        // Edition split
        $bnViews = (clone $pvInRange)->where('edition', 'bn')->count();
        $enViews = (clone $pvInRange)->where('edition', 'en')->count();
        $edTotal = max(1, $bnViews + $enViews);

        return Inertia::render('features/admin/pages/analytics/TrafficAnalytics', [
            'range' => $range,
            'hasData' => $pageviews > 0,
            'cards' => [
                'todayVisitors'  => $todayVisitors,
                'pageviews'      => $pageviews,
                'uniques'        => $uniques,
                'pagesPerVisit'  => $uniques > 0 ? round($pageviews / $uniques, 1) : 0,
                'visitorsTrend'  => $this->trend($todayVisitors, $yesterdayVisitors),
                'pageviewsTrend' => $this->trend($pageviews, $prevPageviews),
            ],
            'trend' => ['labels' => $labels, 'labelsEn' => $labelsEn, 'pageViews' => $pvSeries, 'uniqueVisitors' => $uvSeries],
            'sources' => $sources,
            'devices' => $devices,
            'topPages' => $topPages,
            'edition' => [
                'bn' => $bnViews, 'en' => $enViews,
                'bnPct' => (int) round($bnViews / $edTotal * 100),
                'enPct' => (int) round($enViews / $edTotal * 100),
            ],
        ]);
    }

    // ── Revenue Report (ads only — booked value) ─────────────────────────────

    public function revenue(Request $request)
    {
        $this->authorizePermission($request, 'business.revenue.view');

        $slots = AdSlot::orderBy('sort_order')->get();
        $activeAds = Ad::active()->with(['client', 'slot'])->get();

        $activeBooked = round($activeAds->sum(fn($a) => $a->bookingValue()), 2);
        $bookedThisMonth = $this->bookedBetween(now()->startOfMonth(), now()->endOfMonth());
        $bookedLastMonth = $this->bookedBetween(now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth());

        $totalImpressions = (int) Ad::sum('impressions');
        $totalClicks = (int) Ad::sum('clicks');

        $totalCapacity = (int) $slots->sum('capacity');
        $totalOccupied = $slots->sum(fn($s) => $s->occupiedCount());

        // 6-month booked-value trend
        $labels = $labelsEn = $monthly = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = now()->subMonthsNoOverflow($i);
            $en = $m->format('M');
            $labelsEn[] = $en;
            $labels[] = self::BN_MON[$en] ?? $en;
            $monthly[] = $this->bookedBetween($m->copy()->startOfMonth(), $m->copy()->endOfMonth());
        }

        $bySlot = $activeAds->groupBy('slot_id')->map(fn($g) => [
            'name' => $g->first()->slot?->name_bn ?? '—',
            'nameEn' => $g->first()->slot?->name_en ?? '—',
            'value' => round($g->sum(fn($a) => $a->bookingValue()), 2),
        ])->sortByDesc('value')->values();
        $bySlotTotal = max(1, $bySlot->sum('value'));
        $bySlot = $bySlot->map(fn($s) => [...$s, 'pct' => (int) round($s['value'] / $bySlotTotal * 100)]);

        $byClient = $activeAds->whereNotNull('client_id')->groupBy('client_id')->map(fn($g) => [
            'name' => $g->first()->client?->name ?? '—',
            'value' => round($g->sum(fn($a) => $a->bookingValue()), 2),
            'campaigns' => $g->count(),
        ])->sortByDesc('value')->take(6)->values();

        $occupancy = $slots->map(fn($s) => [
            'name' => $s->name_bn, 'nameEn' => $s->name_en,
            'occupied' => $s->occupiedCount(), 'capacity' => (int) $s->capacity,
            'pct' => $s->capacity > 0 ? (int) round($s->occupiedCount() / $s->capacity * 100) : 0,
            'rate' => $s->rate !== null ? (float) $s->rate : null,
        ])->values();

        $topAds = Ad::orderByDesc('clicks')->with('client')->limit(6)->get()->map(fn($a) => [
            'title' => $a->title_bn, 'client' => $a->client?->name,
            'impressions' => (int) $a->impressions, 'clicks' => (int) $a->clicks,
            'ctr' => $a->impressions > 0 ? round($a->clicks / $a->impressions * 100, 2) : 0,
            'value' => $a->bookingValue(),
        ]);

        $expiringSoon = Ad::active()->whereNotNull('end_date')
            ->whereBetween('end_date', [now(), now()->addDays(14)])
            ->orderBy('end_date')->with('client')->get()
            ->map(fn($a) => [
                'title' => $a->title_bn, 'client' => $a->client?->name,
                'endDate' => $a->end_date->format('Y-m-d'),
                'daysLeft' => (int) ceil(now()->diffInDays($a->end_date, false)),
                'value' => $a->bookingValue(),
            ]);

        return Inertia::render('features/admin/pages/analytics/RevenueReport', [
            'cards' => [
                'activeBooked' => $activeBooked,
                'bookedThisMonth' => $bookedThisMonth,
                'bookedTrend' => $this->trend((int) $bookedThisMonth, (int) $bookedLastMonth),
                'activeCampaigns' => $activeAds->count(),
                'clientsCount' => AdClient::count(),
                'avgCtr' => $totalImpressions > 0 ? round($totalClicks / $totalImpressions * 100, 2) : 0,
                'occupancy' => $totalCapacity > 0 ? (int) round($totalOccupied / $totalCapacity * 100) : 0,
                'totalImpressions' => $totalImpressions,
                'totalClicks' => $totalClicks,
            ],
            'monthly' => ['labels' => $labels, 'labelsEn' => $labelsEn, 'booked' => $monthly],
            'bySlot' => $bySlot,
            'byClient' => $byClient,
            'occupancy' => $occupancy,
            'topAds' => $topAds,
            'expiringSoon' => $expiringSoon,
        ]);
    }

    // ── SEO Report (on-site health + organic traffic) ────────────────────────

    public function seo(Request $request)
    {
        $this->authorizePermission($request, 'seo.view');

        $range = (int) $request->input('range', 7);
        $range = in_array($range, [7, 30], true) ? $range : 7;
        $start = today()->subDays($range - 1);

        $published = Article::where('status', 'published')
            ->get(['id', 'title_bn', 'title_en', 'meta_title_bn', 'meta_description_bn', 'meta_description_en', 'featured_image', 'featured_image_alt_bn']);
        $total = $published->count();

        $withMetaDesc = $withMetaTitle = $withAlt = $withImage = 0;
        $auditQueue = [];
        foreach ($published as $a) {
            $hasDesc = filled($a->meta_description_bn) || filled($a->meta_description_en);
            $hasMetaTitle = filled($a->meta_title_bn);
            $hasImage = filled($a->featured_image);
            $hasAlt = ! $hasImage || filled($a->featured_image_alt_bn);
            $titleLen = mb_strlen((string) $a->title_bn);

            if ($hasDesc) $withMetaDesc++;
            if ($hasMetaTitle) $withMetaTitle++;
            if ($hasImage) $withImage++;
            if ($hasAlt) $withAlt++;

            // Collect the single most important issue per article for the queue
            $issue = null; $priority = null;
            if (! $hasDesc)        { $issue = ['bn' => 'মেটা ডেসক্রিপশন নেই', 'en' => 'Missing meta description']; $priority = 'high'; }
            elseif (! $hasImage)   { $issue = ['bn' => 'ফিচার্ড ইমেজ নেই', 'en' => 'Missing featured image']; $priority = 'high'; }
            elseif (! $hasAlt)     { $issue = ['bn' => 'ইমেজ অল্ট টেক্সট নেই', 'en' => 'Missing image alt text']; $priority = 'medium'; }
            elseif (! $hasMetaTitle) { $issue = ['bn' => 'মেটা টাইটেল নেই', 'en' => 'Missing meta title']; $priority = 'medium'; }
            elseif ($titleLen > 70)  { $issue = ['bn' => 'টাইটেল অনেক বড় (' . $titleLen . ')', 'en' => 'Title too long (' . $titleLen . ')']; $priority = 'low'; }
            elseif ($titleLen > 0 && $titleLen < 15) { $issue = ['bn' => 'টাইটেল অনেক ছোট (' . $titleLen . ')', 'en' => 'Title too short (' . $titleLen . ')']; $priority = 'low'; }

            if ($issue) {
                $auditQueue[] = [
                    'id' => $a->id,
                    'titleBn' => $a->title_bn, 'titleEn' => $a->title_en ?: $a->title_bn,
                    'issueBn' => $issue['bn'], 'issueEn' => $issue['en'], 'priority' => $priority,
                ];
            }
        }

        // Sort the queue high → low and cap it
        $order = ['high' => 0, 'medium' => 1, 'low' => 2];
        usort($auditQueue, fn($x, $y) => $order[$x['priority']] <=> $order[$y['priority']]);
        $issuesCount = count($auditQueue);
        $auditQueue = array_slice($auditQueue, 0, 12);

        $pct = fn($n) => $total > 0 ? (int) round($n / $total * 100) : 0;
        $descPct = $pct($withMetaDesc); $altPct = $pct($withAlt); $titlePct = $pct($withMetaTitle);
        // SEO score = weighted coverage of the checks that matter most for search
        $score = $total > 0 ? (int) round($descPct * 0.4 + $altPct * 0.3 + $titlePct * 0.3) : 0;

        // Organic traffic — search-referrer page views over the range
        $labels = $labelsEn = $organicSeries = [];
        $organicTotal = 0;
        for ($i = $range - 1; $i >= 0; $i--) {
            $day = today()->subDays($i);
            $en = $day->format('D');
            $labelsEn[] = $range > 14 ? $day->format('j') : $en;
            $labels[] = $range > 14 ? $this->bnDigits($day->format('j')) : (self::BN_DAY[$en] ?? $en);
            $count = $this->organicQuery(PageView::whereDate('created_at', $day))->count();
            $organicSeries[] = $count;
            $organicTotal += $count;
        }
        $searchPv = $this->organicQuery(PageView::where('created_at', '>=', $start))->count();
        $allPv = max(1, PageView::where('created_at', '>=', $start)->count());

        return Inertia::render('features/admin/pages/analytics/SeoReport', [
            'range' => $range,
            'cards' => [
                'score' => $score,
                'organicTraffic' => $searchPv,
                'organicShare' => (int) round($searchPv / $allPv * 100),
                'articlesAudited' => $total,
                'issuesCount' => $issuesCount,
            ],
            'coverage' => [
                ['labelBn' => 'মেটা ডেসক্রিপশন', 'labelEn' => 'Meta description', 'pct' => $descPct, 'count' => $withMetaDesc, 'total' => $total, 'color' => '#10b981'],
                ['labelBn' => 'ইমেজ অল্ট টেক্সট', 'labelEn' => 'Image alt text', 'pct' => $altPct, 'count' => $withAlt, 'total' => $total, 'color' => '#3b82f6'],
                ['labelBn' => 'মেটা টাইটেল', 'labelEn' => 'Meta title', 'pct' => $titlePct, 'count' => $withMetaTitle, 'total' => $total, 'color' => '#f59e0b'],
                ['labelBn' => 'ফিচার্ড ইমেজ', 'labelEn' => 'Featured image', 'pct' => $pct($withImage), 'count' => $withImage, 'total' => $total, 'color' => '#8b5cf6'],
            ],
            'organic' => ['labels' => $labels, 'labelsEn' => $labelsEn, 'series' => $organicSeries],
            'auditQueue' => $auditQueue,
        ]);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function authorizePermission(Request $request, string $permission): void
    {
        if (! $request->user() || ! $request->user()->hasPermission($permission)) {
            abort(403);
        }
    }

    /** Booked value of ads whose booking falls in the window (by start_date, else created_at). */
    private function bookedBetween($start, $end): float
    {
        return round(
            Ad::where(function ($q) use ($start, $end) {
                $q->whereBetween('start_date', [$start, $end])
                  ->orWhere(function ($q2) use ($start, $end) {
                      $q2->whereNull('start_date')->whereBetween('created_at', [$start, $end]);
                  });
            })->get()->sum(fn($a) => $a->bookingValue()),
            2
        );
    }

    private function organicQuery($query)
    {
        return $query->where(function ($q) {
            foreach (['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex', 'ecosia'] as $s) {
                $q->orWhere('referrer_host', 'like', "%{$s}%");
            }
        });
    }

    private function isSearchHost(string $h): bool
    {
        $h = strtolower($h);
        foreach (['google', 'bing', 'yahoo', 'duckduckgo', 'baidu', 'yandex', 'ecosia'] as $s) {
            if (str_contains($h, $s)) return true;
        }
        return false;
    }

    private function isSocialHost(string $h): bool
    {
        $h = strtolower($h);
        foreach (['facebook', 'fb.com', 'fb.me', 't.co', 'twitter', 'x.com', 'youtube', 'youtu.be', 'instagram', 'linkedin', 'whatsapp', 'telegram', 'reddit', 'pinterest', 'tiktok'] as $s) {
            if (str_contains($h, $s)) return true;
        }
        return false;
    }

    private function trend(int $current, int $previous): array
    {
        $pct = $previous > 0
            ? round(abs($current - $previous) / $previous * 100, 1)
            : ($current > 0 ? 100 : 0);
        return ['change' => $pct . '%', 'up' => $current >= $previous];
    }

    private function bnDigits(string $s): string
    {
        return strtr($s, ['0' => '০', '1' => '১', '2' => '২', '3' => '৩', '4' => '৪', '5' => '৫', '6' => '৬', '7' => '৭', '8' => '৮', '9' => '৯']);
    }
}
