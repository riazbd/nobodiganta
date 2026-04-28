/**
 * Centralized route map — single source of truth for all navigation.
 * Edition-aware, slug-based URLs for SEO.
 * 
 * All public routes now support edition parameter (default: 'bn').
 * Admin routes remain unchanged (no edition needed).
 */
export const ROUTES = {
    // Static routes
    home:        (ed = 'bn') => ed === 'en' ? '/en' : '/',
    gallery:     (ed = 'bn') => ed === 'en' ? '/en/gallery'      : '/gallery',
    video:       (ed = 'bn') => ed === 'en' ? '/en/video'        : '/video',
    epaper:      (ed = 'bn') => ed === 'en' ? '/en/epaper'       : '/epaper',
    about:       (ed = 'bn') => ed === 'en' ? '/en/about'        : '/about',
    contact:     (ed = 'bn') => ed === 'en' ? '/en/contact'      : '/contact',
    archive:     (ed = 'bn') => ed === 'en' ? '/en/archive'      : '/archive',
    search:      (ed = 'bn') => ed === 'en' ? '/en/search'       : '/search',
    regional:    (ed = 'bn') => ed === 'en' ? '/en/regional'     : '/regional',
    prayerTimes: (ed = 'bn') => ed === 'en' ? '/en/prayer-times' : '/prayer-times',
    cricket:     (ed = 'bn') => ed === 'en' ? '/en/cricket'      : '/cricket',
    jobs:        (ed = 'bn') => ed === 'en' ? '/en/jobs'         : '/jobs',
    stockMarket: (ed = 'bn') => ed === 'en' ? '/en/stock-market' : '/stock-market',
    health:      (ed = 'bn') => ed === 'en' ? '/en/health'       : '/health',
    islamicLife: (ed = 'bn') => ed === 'en' ? '/en/islamic-life' : '/islamic-life',
    horoscope:   (ed = 'bn') => ed === 'en' ? '/en/horoscope'    : '/horoscope',

    // Edition-aware dynamic routes
    article:   (catSlug, artSlug, ed = 'bn') =>
                    ed === 'en' ? `/en/${catSlug}/${artSlug}` : `/${catSlug}/${artSlug}`,

    category:  (slug, ed = 'bn') =>
                    ed === 'en' ? `/en/category/${slug}` : `/category/${slug}`,

    topic:     (slug, ed = 'bn') =>                          // was: tag(slug)
                    ed === 'en' ? `/en/topic/${slug}` : `/topic/${slug}`,

    author:    (slug, ed = 'bn') =>                          // slug, not ID
                    ed === 'en' ? `/en/author/${slug}` : `/author/${slug}`,

    live:      (slug, ed = 'bn') =>                          // was: liveblog(id)
                    ed === 'en' ? `/en/live/${slug}` : `/live/${slug}`,

    searchQuery: (q, ed = 'bn') => {
        const base = ed === 'en' ? '/en/search' : '/search';
        return `${base}?q=${encodeURIComponent(q)}`;
    },

    searchAdvanced: (params, ed = 'bn') => {
        const base = ed === 'en' ? '/en/search' : '/search';
        const qs = new URLSearchParams(params).toString();
        return `${base}?${qs}`;
    },

    // Admin routes — unchanged, no edition needed
    admin: {
        dashboard:        '/admin/dashboard',
        news:             '/admin/news',
        newsAll:          '/admin/news',
        newsWrite:        '/admin/news/write',
        newsDrafts:       '/admin/news/drafts',
        newsPublished:    '/admin/news/published',
        newsPending:      '/admin/news/pending',
        categories:       '/admin/categories',
        media:            '/admin/media',
        videos:           '/admin/videos',
        opinions:         '/admin/opinions',
        opinionsWrite:    '/admin/opinions/write',
        opinionsEdit:     '/admin/opinions/:id/edit',
        reporters:        '/admin/reporters',
        comments:         '/admin/comments',
        ads:              '/admin/ads',
        subscriptions:    '/admin/subscriptions',
        traffic:          '/admin/traffic',
        revenue:          '/admin/revenue',
        seo:              '/admin/seo',
        settings:         '/admin/settings',
        users:            '/admin/users',
        roles:            '/admin/roles',
        auditLog:         '/admin/audit-log',
        epaper:           '/admin/epaper-manager',
        newsletter:       '/admin/newsletter',
        profile:          '/admin/profile',
        pitchBoard:       '/admin/pitch-board',
        assignmentBoard:  '/admin/assignment-board',
        editorialCalendar:'/admin/editorial-calendar',
        stocks:           '/admin/stocks',
        cricket:          '/admin/cricket',
        prices:           '/admin/prices',
        polls:            '/admin/polls',
        weather:          '/admin/weather',
        horoscope:        '/admin/horoscope',
        prayerTimes:      '/admin/prayer-times',
        homepageLayout:   '/admin/homepage-layout',
    },
};
