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
use App\Models\Weather;
use App\Models\Horoscope;
use App\Models\PrayerTime;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $edition = str_starts_with($request->path(), 'en') ? 'en' : 'bn';

        // 1. Core Stats
        $totalPublished = Article::published()->count();
        $todayVisitors = 324150; // Mock for now until analytics table implemented, but can count unique IPs from logs
        $weeklyComments = Comment::where('created_at', '>=', now()->subWeek())->count();
        $activeSubscribers = Subscription::active()->count();

        // 2. Mini Stats
        $reportersCount = User::where('role', 'reporter')->count();
        $pendingApproval = Article::where('status', 'pending')->count();
        $adRevenue = 1240000; // Mock or from Ad model if we had payments
        $avgReadTime = 4.8;

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

        // 6. Traffic Stats (Mocking labels for now)
        $traffic = [
            'labels' => ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'],
            'labelsEn' => ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            'pageViews' => [450, 520, 610, 480, 590, 680, 720],
            'uniqueVisitors' => [310, 380, 420, 350, 410, 490, 550],
        ];

        // 7. Recent Activity from Audit Logs
        $activities = AuditLog::with('user')
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

        // 8. Server Health
        $serverHealth = [
            'cpu' => 24,
            'ram' => 62,
            'disk' => 45,
            'uptime' => '12 days, 4 hours',
            'db_size' => '1.2 GB',
        ];

        // 9. Widgets Data
        $stocks = Stock::orderBy('sort_order')->limit(5)->get();
        $cricketMatches = CricketMatch::where('status', 'live')->orWhere('status', 'upcoming')->orderBy('sort_order')->limit(3)->get();
        $prices = Price::orderBy('sort_order')->limit(5)->get();
        $activePoll = Poll::with('options')->where('is_active', true)->first();
        $weather = Weather::today()->first();
        $horoscopes = Horoscope::today()->limit(3)->get();
        $prayerTime = PrayerTime::today()->first();

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
                'adRevenue' => $adRevenue,
                'avgReadTime' => $avgReadTime,
            ],
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
                'weather' => $weather,
                'horoscope' => $horoscopes,
                'prayerTime' => $prayerTime,
            ],
            'schedule' => [
                ['time' => '10:00 AM', 'title' => 'Editorial Meeting', 'type' => 'meeting'],
                ['time' => '02:30 PM', 'title' => 'Press Conference: Budget 2026', 'type' => 'event'],
                ['time' => '05:00 PM', 'title' => 'Newspaper Deadline', 'type' => 'deadline'],
            ]
        ]);
    }
}
