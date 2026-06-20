<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OpinionController;
use App\Http\Controllers\Admin\VideoController;
use App\Http\Controllers\Admin\PhotoController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\TranslationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\ReporterController;
use App\Http\Controllers\Admin\AdController;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscriptionController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\StockController;
use App\Http\Controllers\Admin\CricketMatchController;
use App\Http\Controllers\Admin\PriceController;
use App\Http\Controllers\Admin\PollController;
use App\Http\Controllers\Admin\HoroscopeController;
use App\Http\Controllers\Admin\EpaperController;
use App\Http\Controllers\Admin\NewsletterController;
use App\Http\Controllers\Admin\HomepageController;
use App\Http\Controllers\Admin\PhotocardTemplateController;
use App\Http\Controllers\Admin\LocationController as AdminLocationController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\BreakingNewsController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PrayerPageController;
use App\Http\Controllers\PushController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\WeatherApiController;
use App\Http\Controllers\LocationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ══════════════════════════════════════
// PUBLIC NEWS ROUTES — BANGLA EDITION (default)
// ══════════════════════════════════════

// Fixed-path routes (registered first to avoid conflicts)
Route::get('/', [NewsController::class, 'home'])->name('home');
Route::get('/search', [NewsController::class, 'search'])->name('search');
Route::get('/gallery', [NewsController::class, 'gallery'])->name('gallery');
Route::get('/video', [NewsController::class, 'video'])->name('video');
Route::get('/epaper', [NewsController::class, 'epaper'])->name('epaper');
Route::get('/about', [NewsController::class, 'about'])->name('about');
Route::get('/contact', [NewsController::class, 'contact'])->name('contact');
Route::get('/privacy', [NewsController::class, 'privacy'])->name('privacy');
Route::get('/terms', [NewsController::class, 'terms'])->name('terms');
Route::get('/archive', [NewsController::class, 'archive'])->name('archive');
Route::get('/regional', [NewsController::class, 'regional'])->name('regional');
// Location hierarchy — সারাদেশ
Route::get('/saradesh', [LocationController::class, 'index'])->name('location');
Route::get('/saradesh/{division}', [LocationController::class, 'division'])->name('location.division');
Route::get('/saradesh/{division}/{district}', [LocationController::class, 'district'])->name('location.district');
Route::get('/saradesh/{division}/{district}/{upazila}', [LocationController::class, 'upazila'])->name('location.upazila');
Route::get('/prayer-times', [NewsController::class, 'prayerTimes'])->name('prayer-times');
Route::get('/cricket', [NewsController::class, 'cricket'])->name('cricket');
Route::get('/stock-market', [NewsController::class, 'stockMarket'])->name('stock-market');
Route::get('/jobs', [NewsController::class, 'jobs'])->name('jobs');
Route::get('/health', [NewsController::class, 'health'])->name('health');
Route::get('/islamic-life', [NewsController::class, 'islamicLife'])->name('islamic-life');
Route::get('/horoscope', [NewsController::class, 'horoscope'])->name('horoscope');

// Named resource routes (fixed prefix, dynamic suffix — safe)
Route::get('/category/{slug}', [NewsController::class, 'category'])->name('category');
Route::get('/topic/{slug}', [NewsController::class, 'topic'])->name('topic');
Route::get('/author/{slug}', [NewsController::class, 'author'])->name('author');
Route::get('/live/{slug}', [NewsController::class, 'liveblog'])->name('liveblog');

// ══════════════════════════════════════
// PUBLIC API ROUTES (BEFORE catch-all article route)
// ══════════════════════════════════════
Route::get('/api/categories', [CategoryController::class, 'publicIndex'])->name('api.categories');
Route::get('/api/breaking-news/stream', [BreakingNewsController::class, 'stream'])->name('breaking-news.stream');
Route::get('/api/breaking-news', [BreakingNewsController::class, 'index'])->name('breaking-news.index');

// Gallery & Media API
Route::get('/api/gallery', [GalleryController::class, 'index'])->name('api.gallery');
Route::get('/api/gallery/categories', [GalleryController::class, 'categories'])->name('api.gallery.categories');
Route::get('/api/videos', [GalleryController::class, 'videos'])->name('api.videos');
Route::get('/api/media/{id}', [GalleryController::class, 'show'])->name('api.media.show')->whereNumber('id');

// Prayer & Weather API
Route::get('/api/prayer', [PrayerPageController::class, 'api'])->name('api.prayer');
Route::get('/api/prayer-monthly', [PrayerPageController::class, 'monthly'])->name('api.prayer.monthly');
Route::get('/api/weather', [WeatherApiController::class, 'api'])->name('api.weather');

// ══════════════════════════════════════
// PROTECTED ADMIN ROUTES
// ══════════════════════════════════════
Route::middleware(['auth'])->group(function () {
    
    // Admin API routes
    Route::get('/api/admin/categories', [CategoryController::class, 'adminIndex'])->name('api.admin.categories');

    Route::prefix('admin')->name('admin.')->group(function () {
        // Media API for modals
        Route::get('/api/media', [MediaController::class, 'apiIndex'])->name('api.media.index');

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Content - Article Management
        Route::get('/news', [ArticleController::class, 'index'])->name('news');
        Route::get('/news/write', [ArticleController::class, 'create'])->name('news.write');
        Route::post('/news', [ArticleController::class, 'store'])->name('news.store');

        // Drafts, Published, Pending (filtered views) - Fixed paths must come before dynamic segments
        $statusView = function (string $status, string $component) {
            return function (Illuminate\Http\Request $request) use ($status, $component) {
                $perPage  = in_array((int) $request->per_page, [10, 20, 50, 100]) ? (int) $request->per_page : 20;
                $edition  = $request->input('edition');
                $category = $request->input('category');
                $author   = $request->input('author');

                $articles = \App\Models\Article::with(['category', 'author'])
                    ->where('status', $status)
                    ->when($request->search, fn($q, $s) => $q->where(fn($q2) => $q2->where('title_bn', 'like', "%$s%")->orWhere('title_en', 'like', "%$s%")))
                    ->when($edition && $edition !== 'all', fn($q) => $q->where('edition', $edition))
                    ->when($category && $category !== 'all', fn($q) => $q->whereHas('category', fn($q2) => is_numeric($category) ? $q2->where('id', (int)$category) : $q2->where('slug', $category)))
                    ->when($author && $author !== 'all', fn($q) => $q->where('author_id', $author))
                    ->latest()->paginate($perPage)->withQueryString()
                    ->through(fn($a) => [
                        'id' => $a->id, 'title' => $a->title_bn, 'title_en' => $a->title_en,
                        'status' => $a->status, 'edition' => $a->edition,
                        'author' => $a->author?->name,
                        'category' => $a->category ? ['name' => $a->category->name_bn, 'name_en' => $a->category->name_en, 'slug' => $a->category->slug, 'color_code' => $a->category->color_code] : null,
                        'published_at' => $a->published_at?->toIso8601String(),
                        'created_at' => $a->created_at->toIso8601String(),
                    ]);

                return Inertia::render("features/admin/pages/content/{$component}", [
                    'articles'   => $articles,
                    'categories' => \App\Models\Category::active()->editorial()->ordered()->get(['id', 'name_bn', 'name_en', 'slug']),
                    'authors'    => \App\Models\User::whereIn('role', ['admin', 'editor', 'reporter'])->orderBy('name')->get(['id', 'name']),
                    'filters'    => $request->only(['search', 'edition', 'category', 'author', 'per_page']),
                ]);
            };
        };

        Route::get('/news/drafts',    $statusView('draft',     'Drafts'))->name('news.drafts');
        Route::get('/news/published', $statusView('published', 'Published'))->name('news.published');
        Route::get('/news/pending',   $statusView('pending',   'PendingApproval'))->name('news.pending');

        Route::get('/news/{article}/edit', [ArticleController::class, 'edit'])->name('news.edit')->whereNumber('article');
        Route::put('/news/{article}', [ArticleController::class, 'update'])->name('news.update')->whereNumber('article');
        Route::delete('/news/{article}', [ArticleController::class, 'destroy'])->name('news.destroy')->whereNumber('article');
        Route::get('/news/{article}', [ArticleController::class, 'show'])->name('news.show')->whereNumber('article');
        Route::post('/news/bulk-status', [ArticleController::class, 'bulkUpdateStatus'])->name('news.bulk-status');
        Route::post('/news/bulk-delete', [ArticleController::class, 'bulkDestroy'])->name('news.bulk-delete');
        Route::patch('/news/{article}/status', [ArticleController::class, 'transitionStatus'])->name('news.transition-status')->whereNumber('article');
        Route::get('/news/{article}/allowed-transitions', [ArticleController::class, 'getAllowedTransitions'])->name('news.allowed-transitions')->whereNumber('article');

        // Categories
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update')->whereNumber('category');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy')->whereNumber('category');
        Route::post('/categories/reorder', [CategoryController::class, 'reorder'])->name('categories.reorder');
        Route::patch('/categories/{category}/toggle-status', [CategoryController::class, 'toggleStatus'])->name('categories.toggle-status')->whereNumber('category');
        Route::patch('/categories/{category}/toggle-nav', [CategoryController::class, 'toggleNav'])->name('categories.toggle-nav')->whereNumber('category');
        Route::post('/categories/bulk-update', [CategoryController::class, 'bulkUpdate'])->name('categories.bulk-update');

        // Media
        Route::get('media', [MediaController::class, 'index'])->name('media');
        Route::get('api/media', [MediaController::class, 'apiIndex'])->name('media.api');
        Route::get('api/articles', [\App\Http\Controllers\ArticleController::class, 'apiSearch'])->name('articles.api.search');
        Route::post('media', [MediaController::class, 'store'])->name('media.store');
        Route::put('/media/{media}', [MediaController::class, 'update'])->name('media.update')->whereNumber('media');
        Route::delete('/media/{media}', [MediaController::class, 'destroy'])->name('media.destroy')->whereNumber('media');
        Route::post('/media/bulk-delete', [MediaController::class, 'bulkDestroy'])->name('media.bulk-delete');

        // Photos (Gallery)
        Route::get('/photos', [PhotoController::class, 'index'])->name('photos');
        Route::post('/photos', [PhotoController::class, 'store'])->name('photos.store');
        Route::put('/photos/{article}', [PhotoController::class, 'update'])->name('photos.update')->whereNumber('article');
        Route::delete('/photos/{article}', [PhotoController::class, 'destroy'])->name('photos.destroy')->whereNumber('article');

        // Videos & Opinion
        Route::get('/videos', [VideoController::class, 'index'])->name('videos');
        Route::post('/videos', [VideoController::class, 'store'])->name('videos.store');
        Route::put('/videos/{article}', [VideoController::class, 'update'])->name('videos.update')->whereNumber('article');
        Route::delete('/videos/{article}', [VideoController::class, 'destroy'])->name('videos.destroy')->whereNumber('article');
        
        // Opinion Management
        Route::get('/opinions', [OpinionController::class, 'index'])->name('opinions');
        Route::get('/opinions/write', [OpinionController::class, 'create'])->name('opinions.write');
        Route::post('/opinions', [OpinionController::class, 'store'])->name('opinions.store');
        Route::get('/opinions/{article}/edit', [OpinionController::class, 'edit'])->name('opinions.edit')->whereNumber('article');
        Route::put('/opinions/{article}', [OpinionController::class, 'update'])->name('opinions.update')->whereNumber('article');
        Route::delete('/opinions/{article}', [OpinionController::class, 'destroy'])->name('opinions.destroy')->whereNumber('article');
        Route::patch('/opinions/{article}/status', [OpinionController::class, 'transitionStatus'])->name('opinions.transition-status')->whereNumber('article');

        // Operations
        Route::resource('reporters', ReporterController::class)->names([
            'index' => 'reporters',
            'store' => 'reporters.store',
            'update' => 'reporters.update',
            'destroy' => 'reporters.destroy',
        ])->only(['index', 'store', 'update', 'destroy']);
        Route::get('/comments', [CommentController::class, 'index'])->name('comments');
        Route::post('/comments/bulk-approve', [CommentController::class, 'bulkApprove'])->name('comments.bulk-approve');
        Route::post('/comments/bulk-action', [CommentController::class, 'bulkAction'])->name('comments.bulk-action');
        Route::patch('/comments/{comment}/approve', [CommentController::class, 'approve'])->name('comments.approve')->whereNumber('comment');
        Route::patch('/comments/{comment}/spam', [CommentController::class, 'markSpam'])->name('comments.spam')->whereNumber('comment');
        Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy')->whereNumber('comment');

        // Ads Management
        Route::get('/ads', [AdController::class, 'index'])->name('ads');
        Route::post('/ads', [AdController::class, 'store'])->name('ads.store');
        Route::put('/ads/{ad}', [AdController::class, 'update'])->name('ads.update')->whereNumber('ad');
        Route::delete('/ads/{ad}', [AdController::class, 'destroy'])->name('ads.destroy')->whereNumber('ad');
        Route::patch('/ads/{ad}/toggle', [AdController::class, 'toggleStatus'])->name('ads.toggle')->whereNumber('ad');

        // Subscription Management
        Route::get('/subscriptions', [AdminSubscriptionController::class, 'index'])->name('subscriptions');
        Route::post('/subscriptions', [AdminSubscriptionController::class, 'store'])->name('subscriptions.store');
        Route::put('/subscriptions/{subscription}', [AdminSubscriptionController::class, 'update'])->name('subscriptions.update')->whereNumber('subscription');
        Route::delete('/subscriptions/{subscription}', [AdminSubscriptionController::class, 'destroy'])->name('subscriptions.destroy')->whereNumber('subscription');
        Route::patch('/subscriptions/{subscription}/toggle', [AdminSubscriptionController::class, 'toggleStatus'])->name('subscriptions.toggle')->whereNumber('subscription');

        // Analytics
        Route::get('/traffic', function () {
            return Inertia::render('features/admin/pages/analytics/TrafficAnalytics');
        })->name('traffic');
        Route::get('/revenue', function () {
            return Inertia::render('features/admin/pages/analytics/RevenueReport');
        })->name('revenue');
        Route::get('/seo', function () {
            return Inertia::render('features/admin/pages/dashboard/SEOManagerDashboard');
        })->name('seo');

        // System Settings
        Route::get('/settings', [SettingController::class, 'index'])->name('settings');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
        Route::post('/settings/upload-image', [SettingController::class, 'uploadImage'])->name('settings.upload-image');
        Route::delete('/settings/delete-image', [SettingController::class, 'deleteImage'])->name('settings.delete-image');

        // Operations - Stocks & Cricket
        Route::get('/stocks', [StockController::class, 'index'])->name('stocks');
        Route::post('/stocks', [StockController::class, 'store'])->name('stocks.store');
        Route::put('/stocks/{stock}', [StockController::class, 'update'])->name('stocks.update')->whereNumber('stock');
        Route::delete('/stocks/{stock}', [StockController::class, 'destroy'])->name('stocks.destroy')->whereNumber('stock');

        Route::get('/cricket', [CricketMatchController::class, 'index'])->name('cricket');
        Route::post('/cricket', [CricketMatchController::class, 'store'])->name('cricket.store');
        Route::put('/cricket/{match}', [CricketMatchController::class, 'update'])->name('cricket.update')->whereNumber('match');
        Route::delete('/cricket/{match}', [CricketMatchController::class, 'destroy'])->name('cricket.destroy')->whereNumber('match');

        Route::get('/prices', [PriceController::class, 'index'])->name('prices');
        Route::post('/prices', [PriceController::class, 'store'])->name('prices.store');
        Route::put('/prices/{price}', [PriceController::class, 'update'])->name('prices.update')->whereNumber('price');
        Route::delete('/prices/{price}', [PriceController::class, 'destroy'])->name('prices.destroy')->whereNumber('price');

        Route::get('/polls', [PollController::class, 'index'])->name('polls');
        Route::post('/polls', [PollController::class, 'store'])->name('polls.store');
        Route::put('/polls/{poll}', [PollController::class, 'update'])->name('polls.update')->whereNumber('poll');
        Route::patch('/polls/{poll}/toggle', [PollController::class, 'toggle'])->name('polls.toggle')->whereNumber('poll');
        Route::delete('/polls/{poll}', [PollController::class, 'destroy'])->name('polls.destroy')->whereNumber('poll');

        Route::get('/horoscope', [HoroscopeController::class, 'index'])->name('horoscope');
        Route::post('/horoscope', [HoroscopeController::class, 'store'])->name('horoscope.store');
        Route::delete('/horoscope/{horoscope}', [HoroscopeController::class, 'destroy'])->name('horoscope.destroy')->whereNumber('horoscope');

        Route::get('/epaper-manager', [EpaperController::class, 'index'])->name('epaper-manager');
        Route::post('/epaper-manager', [EpaperController::class, 'store'])->name('epaper-manager.store');
        Route::delete('/epaper-manager/{epaper}', [EpaperController::class, 'destroy'])->name('epaper-manager.destroy')->whereNumber('epaper');

        // Translations
        Route::post('/api/translate', [TranslationController::class, 'translate'])->name('translate');

        Route::get('/newsletter', [NewsletterController::class, 'index'])->name('newsletter');
        Route::post('/newsletter', [NewsletterController::class, 'store'])->name('newsletter.store');
        Route::delete('/newsletter/{newsletter}', [NewsletterController::class, 'destroy'])->name('newsletter.destroy')->whereNumber('newsletter');

        Route::get('/homepage-layout', [HomepageController::class, 'index'])->name('homepage-layout');
        Route::get('/homepage-layout/articles', [HomepageController::class, 'articles'])->name('homepage-layout.articles');
        Route::post('/homepage-layout', [HomepageController::class, 'store'])->name('homepage-layout.store');
        Route::put('/homepage-layout/{section}', [HomepageController::class, 'update'])->name('homepage-layout.update')->whereNumber('section');
        Route::delete('/homepage-layout/{section}', [HomepageController::class, 'destroy'])->name('homepage-layout.destroy')->whereNumber('section');
        Route::post('/homepage-layout/reorder', [HomepageController::class, 'reorder'])->name('homepage-layout.reorder');
        Route::post('/homepage-layout/upload-banner', [HomepageController::class, 'uploadBanner'])->name('homepage-layout.upload-banner');
        Route::delete('/homepage-layout/banner', [HomepageController::class, 'deleteBanner'])->name('homepage-layout.delete-banner');

        // Photocard Studio
        Route::get('/photocard-templates', [PhotocardTemplateController::class, 'index'])->name('photocard-templates');
        Route::get('/photocard-templates/list', [PhotocardTemplateController::class, 'apiList'])->name('photocard-templates.list');
        Route::get('/photocard-templates/ads', [PhotocardTemplateController::class, 'ads'])->name('photocard-templates.ads');
        Route::post('/photocard-templates/import-url', [PhotocardTemplateController::class, 'importUrl'])->name('photocard-templates.import-url');
        Route::post('/photocard-templates', [PhotocardTemplateController::class, 'store'])->name('photocard-templates.store');
        Route::put('/photocard-templates/{template}', [PhotocardTemplateController::class, 'update'])->name('photocard-templates.update')->whereNumber('template');
        Route::delete('/photocard-templates/{template}', [PhotocardTemplateController::class, 'destroy'])->name('photocard-templates.destroy')->whereNumber('template');
        Route::post('/photocard-templates/{template}/duplicate', [PhotocardTemplateController::class, 'duplicate'])->name('photocard-templates.duplicate')->whereNumber('template');
        Route::post('/photocard-templates/upload-asset', [PhotocardTemplateController::class, 'uploadAsset'])->name('photocard-templates.upload-asset');

        // User Management
        Route::get('/users', [UserController::class, 'index'])->name('users');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update')->whereNumber('user');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->whereNumber('user');
        Route::patch('/users/{user}/role', [UserController::class, 'assignRole'])->name('users.assign-role')->whereNumber('user');
        Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status')->whereNumber('user');
        Route::post('/users/{user}/photo', [UserController::class, 'uploadPhoto'])->name('users.photo')->whereNumber('user');

        // Role & Permission Management
        Route::get('/roles', [RoleController::class, 'index'])->name('roles');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update')->whereNumber('role');
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy')->whereNumber('role');
        Route::post('/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->name('roles.sync-permissions')->whereNumber('role');
        Route::get('/roles/permissions/list', [RoleController::class, 'permissions'])->name('roles.permissions.list');

        // Audit Log
        Route::get('/audit-log', [AuditLogController::class, 'index'])->name('audit-log');
        Route::post('/audit-log/clear', [AuditLogController::class, 'clear'])->name('audit-log.clear');

        // User Profile
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // Stories
        Route::get('/stories', [\App\Http\Controllers\Admin\StoryController::class, 'index'])->name('stories');
        Route::get('/stories/create', [\App\Http\Controllers\Admin\StoryController::class, 'create'])->name('stories.create');
        Route::post('/stories', [\App\Http\Controllers\Admin\StoryController::class, 'store'])->name('stories.store');
        Route::get('/stories/{story}/edit', [\App\Http\Controllers\Admin\StoryController::class, 'edit'])->name('stories.edit');
        Route::put('/stories/{story}', [\App\Http\Controllers\Admin\StoryController::class, 'update'])->name('stories.update');
        Route::delete('/stories/{story}', [\App\Http\Controllers\Admin\StoryController::class, 'destroy'])->name('stories.destroy');
        Route::post('/stories/{story}/publish', [\App\Http\Controllers\Admin\StoryController::class, 'publish'])->name('stories.publish');
        Route::post('/stories/{story}/restore', [\App\Http\Controllers\Admin\StoryController::class, 'restore'])->name('stories.restore');
        Route::post('/stories/{story}/archive', [\App\Http\Controllers\Admin\StoryController::class, 'archive'])->name('stories.archive');

        // Story Slides
        Route::post('/stories/{story}/slides', [\App\Http\Controllers\Admin\StorySlideController::class, 'store'])->name('stories.slides.store');
        Route::put('/stories/{story}/slides/{slide}', [\App\Http\Controllers\Admin\StorySlideController::class, 'update'])->name('stories.slides.update');
        Route::delete('/stories/{story}/slides/{slide}', [\App\Http\Controllers\Admin\StorySlideController::class, 'destroy'])->name('stories.slides.destroy');
        Route::post('/stories/{story}/slides/reorder', [\App\Http\Controllers\Admin\StorySlideController::class, 'reorder'])->name('stories.slides.reorder');

        // Location Management
        Route::get('/locations', [AdminLocationController::class, 'index'])->name('locations');
        Route::post('/locations/divisions', [AdminLocationController::class, 'storeDivision'])->name('locations.divisions.store');
        Route::put('/locations/divisions/{division}', [AdminLocationController::class, 'updateDivision'])->name('locations.divisions.update')->whereNumber('division');
        Route::delete('/locations/divisions/{division}', [AdminLocationController::class, 'destroyDivision'])->name('locations.divisions.destroy')->whereNumber('division');
        Route::post('/locations/districts', [AdminLocationController::class, 'storeDistrict'])->name('locations.districts.store');
        Route::put('/locations/districts/{district}', [AdminLocationController::class, 'updateDistrict'])->name('locations.districts.update')->whereNumber('district');
        Route::delete('/locations/districts/{district}', [AdminLocationController::class, 'destroyDistrict'])->name('locations.districts.destroy')->whereNumber('district');
        Route::post('/locations/upazilas', [AdminLocationController::class, 'storeUpazila'])->name('locations.upazilas.store');
        Route::put('/locations/upazilas/{upazila}', [AdminLocationController::class, 'updateUpazila'])->name('locations.upazilas.update')->whereNumber('upazila');
        Route::delete('/locations/upazilas/{upazila}', [AdminLocationController::class, 'destroyUpazila'])->name('locations.upazilas.destroy')->whereNumber('upazila');

        // Editorial
        Route::get('/pitch-board', function () {
            return Inertia::render('features/admin/pages/editorial/PitchBoard');
        })->name('pitch-board');
        Route::get('/assignment-board', function () {
            return Inertia::render('features/admin/pages/editorial/AssignmentBoard');
        })->name('assignment-board');
        Route::get('/editorial-calendar', function () {
            return Inertia::render('features/admin/pages/editorial/EditorialCalendar');
        })->name('editorial-calendar');
    });
});

// Admin location dropdown APIs (use location tables, numeric IDs — for admin panels)
Route::get('/api/locations/divisions', [AdminLocationController::class, 'apiDivisions'])->name('api.locations.divisions');
Route::get('/api/locations/divisions/{division}/districts', [AdminLocationController::class, 'apiDistricts'])->name('api.locations.districts')->whereNumber('division');
Route::get('/api/locations/districts/{district}/upazilas', [AdminLocationController::class, 'apiUpazilas'])->name('api.locations.upazilas')->whereNumber('district');

// Public location cascade APIs (use categories, slug-based — for public filter widget)
Route::get('/api/location/districts/{division}', [LocationController::class, 'apiDistricts'])->name('api.location.districts');
Route::get('/api/location/upazilas/{district}', [LocationController::class, 'apiUpazilas'])->name('api.location.upazilas');

Route::get('/api/trending', [NewsController::class, 'apiTrending'])->name('api.trending');
Route::get('/api/opinions', [NewsController::class, 'apiOpinions'])->name('api.opinions');
Route::get('/api/most-read', [NewsController::class, 'apiMostRead'])->name('api.most-read');
Route::get('/api/most-commented', [NewsController::class, 'apiMostCommented'])->name('api.most-commented');
Route::get('/api/latest', [NewsController::class, 'apiLatest'])->name('api.latest');
Route::get('/api/liveblog/{article}/updates', [NewsController::class, 'apiLiveblogUpdates'])->name('api.liveblog.updates')->whereNumber('article');
Route::get('/api/regional', [NewsController::class, 'apiRegional'])->name('api.regional');
Route::get('/api/stocks', [NewsController::class, 'apiStocks'])->name('api.stocks');
Route::get('/api/cricket', [NewsController::class, 'apiCricket'])->name('api.cricket');
Route::get('/api/ads', [NewsController::class, 'apiAds'])->name('api.ads');
Route::post('/api/ads/{id}/impression', [NewsController::class, 'adImpression'])->name('api.ads.impression');
Route::post('/api/ads/{id}/click', [NewsController::class, 'adClick'])->name('api.ads.click');
Route::get('/api/poll', [NewsController::class, 'apiPoll'])->name('api.poll');
Route::post('/api/poll/{poll}/vote', [NewsController::class, 'apiPollVote'])
    ->name('api.poll.vote')
    ->whereNumber('poll');
Route::get('/api/horoscope', [NewsController::class, 'apiHoroscope'])->name('api.horoscope');
Route::get('/api/epaper', [NewsController::class, 'apiEpaper'])->name('api.epaper');

// Public Comment Routes
Route::get('/api/articles/{article}/comments', [CommentController::class, 'getArticleComments'])->name('api.comments.index')->whereNumber('article');
Route::post('/api/articles/{article}/comments', [CommentController::class, 'store'])->name('api.comments.store')->whereNumber('article');
Route::post('/api/articles/{article}/share', [NewsController::class, 'recordShare'])->name('api.articles.share')->whereNumber('article');
Route::get('/api/articles/{article}/shares', [NewsController::class, 'getShareCounts'])->name('api.articles.shares')->whereNumber('article');
Route::post('/api/comments/{comment}/flag', [CommentController::class, 'flag'])->name('api.comments.flag')->whereNumber('comment');

// Stories (public)
Route::get('/stories', [\App\Http\Controllers\StoriesController::class, 'index'])->name('stories');
Route::get('/api/stories', [\App\Http\Controllers\StoriesController::class, 'apiIndex'])->name('api.stories');

// ══════════════════════════════════════
// ENGLISH EDITION — mirrors all public routes under /en prefix
// MUST be declared before the /{category}/{slug} catch-all
// ══════════════════════════════════════
Route::prefix('en')->group(function () {
    Route::get('/', [NewsController::class, 'home'])->name('en.home');
    Route::get('/search', [NewsController::class, 'search'])->name('en.search');
    Route::get('/gallery', [NewsController::class, 'gallery'])->name('en.gallery');
    Route::get('/video', [NewsController::class, 'video'])->name('en.video');
    Route::get('/epaper', [NewsController::class, 'epaper'])->name('en.epaper');
    Route::get('/about', [NewsController::class, 'about'])->name('en.about');
    Route::get('/contact', [NewsController::class, 'contact'])->name('en.contact');
    Route::get('/privacy', [NewsController::class, 'privacy'])->name('en.privacy');
    Route::get('/terms', [NewsController::class, 'terms'])->name('en.terms');
    Route::get('/archive', [NewsController::class, 'archive'])->name('en.archive');
    Route::get('/regional', [NewsController::class, 'regional'])->name('en.regional');
    // Location hierarchy — সারাদেশ (English edition mirrors)
    Route::get('/saradesh', [LocationController::class, 'index'])->name('en.location');
    Route::get('/saradesh/{division}', [LocationController::class, 'division'])->name('en.location.division');
    Route::get('/saradesh/{division}/{district}', [LocationController::class, 'district'])->name('en.location.district');
    Route::get('/saradesh/{division}/{district}/{upazila}', [LocationController::class, 'upazila'])->name('en.location.upazila');
    Route::get('/prayer-times', [NewsController::class, 'prayerTimes'])->name('en.prayer-times');
    Route::get('/cricket', [NewsController::class, 'cricket'])->name('en.cricket');
    Route::get('/stock-market', [NewsController::class, 'stockMarket'])->name('en.stock-market');
    Route::get('/jobs', [NewsController::class, 'jobs'])->name('en.jobs');
    Route::get('/health', [NewsController::class, 'health'])->name('en.health');
    Route::get('/islamic-life', [NewsController::class, 'islamicLife'])->name('en.islamic-life');
    Route::get('/horoscope', [NewsController::class, 'horoscope'])->name('en.horoscope');
    Route::get('/category/{slug}', [NewsController::class, 'category'])->name('en.category');
    Route::get('/topic/{slug}', [NewsController::class, 'topic'])->name('en.topic');
    Route::get('/author/{slug}', [NewsController::class, 'author'])->name('en.author');
    Route::get('/live/{slug}', [NewsController::class, 'liveblog'])->name('en.liveblog');
    Route::get('/stories', [\App\Http\Controllers\StoriesController::class, 'index'])->name('en.stories');
    Route::get('/{category}/{slug}', [NewsController::class, 'article'])->name('en.article');
});

// Article catch-all — MUST be after all specific routes including /en prefix group
Route::get('/{category}/{slug}', [NewsController::class, 'article'])->name('article');

// ══════════════════════════════════════
// ERROR PAGES
// ══════════════════════════════════════
Route::fallback(function () {
    return Inertia::render('Error404');
});

require __DIR__.'/auth.php';
