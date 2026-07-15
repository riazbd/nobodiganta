<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Comment;
use App\Models\Subscription;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\Stock;
use App\Models\CricketMatch;
use App\Models\Price;
use App\Models\Poll;
use App\Models\Horoscope;
use App\Models\PageView;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $edition = str_starts_with($request->path(), 'en') ? 'en' : 'bn';

        // Site-wide dashboard is for users who can view analytics. Everyone else
        // (reporters, photographers) gets a dashboard scoped to their own work —
        // no global figures, no server health, no other authors' activity.
        if (! $request->user()->hasPermission('analytics.view')) {
            return $this->ownDashboard($request);
        }

        // 1. Core Stats
        $totalPublished = Article::published()->count();
        $todayVisitors = PageView::whereDate('created_at', today())->distinct('visitor_hash')->count('visitor_hash');
        $weeklyComments = Comment::where('created_at', '>=', now()->subWeek())->count();
        $activeSubscribers = Subscription::active()->count();

        // 2. Mini Stats
        $reportersCount = User::where('role', 'reporter')->count();
        $pendingApproval = Article::where('status', 'pending')->count();
        $totalViews = (int) Article::sum('views'); // replaces mock ad-revenue (no billing system)
        $avgReadTime = $this->averageReadTimeMinutes();

        // 3. Category Breakdown
        $totalArticles = Article::count();
        $categoryBreakdown = Category::parents()
            ->withCount('articles')
            ->orderBy('articles_count', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($cat) => [
                'name' => $cat->getName($edition),
                'count' => $cat->articles_count,
                'pct' => $totalArticles > 0 ? round(($cat->articles_count / $totalArticles) * 100) : 0,
                'color' => $cat->color_code ?? '#3b82f6',
            ]);

        // 4. Content Status
        $totalArticles = Article::count();
        $contentStatus = [
            'total' => $totalArticles,
            'published' => ['count' => Article::where('status', 'published')->count(), 'pct' => 0],
            'draft' => ['count' => Article::where('status', 'draft')->count(), 'pct' => 0],
            'pending' => ['count' => Article::where('status', 'pending')->count(), 'pct' => 0],
            'archived' => ['count' => Article::where('status', 'archived')->count(), 'pct' => 0],
        ];
        if ($totalArticles > 0) {
            foreach (['published', 'draft', 'pending', 'archived'] as $status) {
                $contentStatus[$status]['pct'] = round(($contentStatus[$status]['count'] / $totalArticles) * 100, 1);
            }
        }

        // 5. Recent Articles
        $recentArticles = Article::with(['category', 'author'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'titleBn' => $a->title_bn,
                'titleEn' => $a->title_en,
                'time' => $a->created_at->diffForHumans(),
                'category' => $a->category->slug ?? 'news',
                'categoryBn' => $a->category->name_bn ?? 'নিউজ',
                'categoryEn' => $a->category->name_en ?? 'News',
                'author' => $a->author,
                'views' => $a->views,
                'status' => $a->status,
            ]);

        // 6. Traffic Stats — real, from the page_views log (last 7 days)
        $bnDay = ['Sun' => 'রবি', 'Mon' => 'সোম', 'Tue' => 'মঙ্গল', 'Wed' => 'বুধ', 'Thu' => 'বৃহঃ', 'Fri' => 'শুক্র', 'Sat' => 'শনি'];
        $labels = $labelsEn = $pageViewsSeries = $uniqueSeries = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = today()->subDays($i);
            $en = $day->format('D');
            $labelsEn[] = $en;
            $labels[] = $bnDay[$en] ?? $en;
            $pageViewsSeries[] = PageView::whereDate('created_at', $day)->count();
            $uniqueSeries[] = PageView::whereDate('created_at', $day)->distinct('visitor_hash')->count('visitor_hash');
        }
        $traffic = [
            'labels' => $labels,
            'labelsEn' => $labelsEn,
            'pageViews' => $pageViewsSeries,
            'uniqueVisitors' => $uniqueSeries,
        ];

        // Stat-card trends — real period-over-period change.
        $visitorsYesterday = PageView::whereDate('created_at', today()->subDay())->distinct('visitor_hash')->count('visitor_hash');
        $publishedThisMonth = Article::published()->whereBetween('published_at', [now()->startOfMonth(), now()])->count();
        $publishedLastMonth = Article::published()->whereBetween('published_at', [now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth()])->count();
        $commentsThisWeek = Comment::whereBetween('created_at', [now()->startOfWeek(), now()])->count();
        $commentsLastWeek = Comment::whereBetween('created_at', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()])->count();
        $subsThisMonth = Subscription::whereBetween('created_at', [now()->startOfMonth(), now()])->count();
        $subsLastMonth = Subscription::whereBetween('created_at', [now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth()])->count();

        $trends = [
            'published'   => $this->trend($publishedThisMonth, $publishedLastMonth),
            'visitors'    => $this->trend($todayVisitors, $visitorsYesterday),
            'comments'    => $this->trend($commentsThisWeek, $commentsLastWeek),
            'subscribers' => $this->trend($subsThisMonth, $subsLastMonth),
        ];

        // 7. Recent Activity from Audit Logs
        $activities = AuditLog::with('user')
            ->visibleTo($request->user())
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'user' => $log->user->name ?? 'System',
                'action' => $log->event,
                'target' => $log->auditable_type . ' #' . $log->auditable_id,
                'time' => $log->created_at->diffForHumans(),
            ]);

        // 8. Server Health — real where PHP can read it reliably (disk, DB size, memory).
        $serverHealth = $this->serverHealth();

        // 9. Widgets Data
        $stocks = Stock::orderBy('sort_order')->limit(5)->get();
        $cricketMatches = CricketMatch::where('status', 'live')->orWhere('status', 'upcoming')->orderBy('sort_order')->limit(3)->get();
        $prices = Price::orderBy('sort_order')->limit(5)->get();
        $activePoll = Poll::with('options')->where('is_active', true)->first();
        $horoscopes = Horoscope::today()->limit(3)->get();

        return Inertia::render('features/admin/pages/dashboard/Dashboard', [
            'stats' => [
                'totalPublished' => number_format($totalPublished),
                'todayVisitors' => number_format($todayVisitors),
                'weeklyComments' => number_format($weeklyComments),
                'activeSubscribers' => number_format($activeSubscribers),
            ],
            'miniStats' => [
                'reportersCount' => $reportersCount,
                'pendingApproval' => $pendingApproval,
                'totalViews' => $totalViews,
                'avgReadTime' => $avgReadTime,
            ],
            'trends' => $trends,
            'categoryBreakdown' => $categoryBreakdown,
            'contentStatus' => $contentStatus,
            'recentArticles' => $recentArticles,
            'traffic' => $traffic,
            'activities' => $activities,
            'serverHealth' => $serverHealth,
            'widgets' => [
                'stocks' => $stocks,
                'cricket' => $cricketMatches,
                'prices' => $prices,
                'poll' => $activePoll,
                'horoscope' => $horoscopes,
            ],
        ]);
    }

    /**
     * Dashboard scoped to the current user's own articles — for roles without
     * site-wide analytics access (reporters, photographers). Only their own
     * publication statistics are exposed.
     */
    private function ownDashboard(Request $request)
    {
        $userId = $request->user()->id;
        $mine   = fn () => Article::where('author_id', $userId);

        $stats = [
            'total'     => $mine()->count(),
            'published' => $mine()->where('status', 'published')->count(),
            'drafts'    => $mine()->where('status', 'draft')->count(),
            'pending'   => $mine()->where('status', 'pending')->count(),
            'views'     => (int) $mine()->sum('views'),
        ];

        $recentArticles = $mine()->with('category')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($a) => [
                'id'         => $a->id,
                'titleBn'    => $a->title_bn,
                'titleEn'    => $a->title_en,
                'categoryBn' => $a->category->name_bn ?? '—',
                'categoryEn' => $a->category->name_en ?? '—',
                'views'      => $a->views,
                'status'     => $a->status,
                'time'       => $a->created_at->diffForHumans(),
            ]);

        return Inertia::render('features/admin/pages/dashboard/ReporterDashboard', [
            'stats'          => $stats,
            'recentArticles' => $recentArticles,
        ]);
    }

    /**
     * Clear the application + view cache (Quick Actions → Clear Cache).
     */
    public function clearCache(Request $request)
    {
        if (!$request->user()->hasPermission('system.settings')) {
            abort(403);
        }

        \Illuminate\Support\Facades\Artisan::call('cache:clear');
        \Illuminate\Support\Facades\Artisan::call('view:clear');

        return back()->with('success', 'Cache cleared');
    }

    /**
     * Percentage change between two periods, plus direction, for stat cards.
     */
    private function trend(int $current, int $previous): array
    {
        $pct = $previous > 0
            ? round(abs($current - $previous) / $previous * 100, 1)
            : ($current > 0 ? 100 : 0);

        return ['change' => $pct . '%', 'up' => $current >= $previous];
    }

    /**
     * Average estimated reading time (minutes) across recent published articles.
     * Word count splits on whitespace, which works for Bangla and English alike.
     */
    private function averageReadTimeMinutes(): float
    {
        $bodies = Article::published()->latest('published_at')->limit(100)->pluck('body_bn');
        $totalWords = 0;
        $counted = 0;
        foreach ($bodies as $body) {
            $text = trim(strip_tags((string) $body));
            if ($text === '') {
                continue;
            }
            $totalWords += count(preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY));
            $counted++;
        }
        if ($counted === 0) {
            return 0;
        }
        return max(1, round(($totalWords / $counted) / 180, 1)); // ~180 words/minute
    }

    /**
     * System health using values PHP can read reliably across platforms:
     * disk usage of the app drive, database size, and current memory usage.
     */
    private function serverHealth(): array
    {
        $diskTotal = @disk_total_space(base_path()) ?: 0;
        $diskFree  = @disk_free_space(base_path()) ?: 0;
        $diskUsedPct = $diskTotal > 0 ? (int) round((1 - $diskFree / $diskTotal) * 100) : 0;

        $dbSizeBytes = 0;
        try {
            $driver = DB::connection()->getDriverName();
            if ($driver === 'pgsql') {
                $dbSizeBytes = (int) (DB::selectOne('SELECT pg_database_size(current_database()) AS size')->size ?? 0);
            } elseif ($driver === 'mysql') {
                $row = DB::selectOne('SELECT SUM(data_length + index_length) AS size FROM information_schema.tables WHERE table_schema = database()');
                $dbSizeBytes = (int) ($row->size ?? 0);
            }
        } catch (\Throwable) {
            $dbSizeBytes = 0;
        }

        return [
            'disk'      => $diskUsedPct,
            'diskFree'  => $this->formatBytes($diskFree),
            'diskTotal' => $this->formatBytes($diskTotal),
            'dbSize'    => $this->formatBytes($dbSizeBytes),
            'memory'    => $this->formatBytes(memory_get_usage(true)),
            'phpVersion' => PHP_VERSION,
        ];
    }

    private function formatBytes(int|float $bytes, int $precision = 1): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $pow = min((int) floor(log($bytes, 1024)), count($units) - 1);
        return round($bytes / (1024 ** $pow), $precision) . ' ' . $units[$pow];
    }
}
