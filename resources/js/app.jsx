import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router, usePage } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useState, useCallback, useEffect } from 'react';

import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { SearchProvider } from './contexts/SearchContext';
import { NavigationProvider } from './contexts/NavigationContext';
import PublicLayout from './Layouts/PublicLayout';
import { ROUTES } from './lib/routes';
import { registerServiceWorker, showInstallPrompt } from './lib/pwa';
import { AdminNavigationProvider } from './features/admin/contexts/AdminNavigationContext';
import AdminLayout from './features/admin/components/layout/AdminLayout';

const appName = import.meta.env.VITE_APP_NAME || 'নবদিগন্ত';

const pages = import.meta.glob('./Pages/**/*.jsx', { eager: false });
const adminPages = import.meta.glob('./features/admin/**/*.jsx', { eager: false });

// Stable layout references — same object every call so Inertia knows not to remount them
const adminLayout = (page) => <AdminShell>{page}</AdminShell>;
const publicLayout = (page) => (
    <AppProvider>
        <ToastProvider>
            <SearchProvider>
                <NavigationProvider>
                    <PublicLayout>{page}</PublicLayout>
                </NavigationProvider>
            </SearchProvider>
        </ToastProvider>
    </AppProvider>
);

// Handle invalid Inertia responses (CSRF mismatch or version mismatch).
// For 419s: soft-reload so the CSRF token is refreshed WITHOUT unmounting
// the page component — form state (all typed content) is preserved and the
// user can simply retry the submit.
// For anything else (e.g. post-deploy asset version mismatch): hard reload.
router.on('invalid', (e) => {
    e.preventDefault();
    if (e.detail?.response?.status === 419) {
        router.reload({ preserveState: true });
    } else {
        window.location.reload();
    }
});

// Keep the meta[name="csrf-token"] tag fresh so Inertia's own HTTP client
// (which reads that tag per-request) always sends the correct X-CSRF-TOKEN.
// We sync from shared props on BOTH events:
//   navigate — fires when the visible page changes (link clicks, redirects)
//   success  — fires for every successful Inertia response, including form
//              submissions that redirect back to the same page
const syncCsrf = (page) => {
    const token = page?.props?.csrf_token;
    if (!token) return;
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) meta.setAttribute('content', token);
};
router.on('navigate', (e) => syncCsrf(e.detail?.page));
router.on('success',  (e) => syncCsrf(e.detail?.page));

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        const isAdmin = name.startsWith('features/admin/');
        const isAuth = name.startsWith('Auth/');

        let page;
        if (isAdmin) {
            page = await resolvePageComponent(`./${name}.jsx`, adminPages);
            // Attach persistent admin layout (only if page hasn't defined its own)
            page.default.layout = page.default.layout ?? adminLayout;
        } else {
            page = await resolvePageComponent(`./Pages/${name}.jsx`, pages);
            if (!isAuth) {
                page.default.layout = page.default.layout ?? publicLayout;
            }
        }
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);

        // Register PWA service worker
        registerServiceWorker();
        showInstallPrompt();
    },
    progress: {
        color: '#e8001e',
    },
});

/**
 * AdminShell — persistent admin layout, lives inside Inertia's App so
 * usePage() works and always returns the current page's props.
 * Inertia keeps this mounted across admin-to-admin navigations.
 */
function AdminShell({ children }) {
    const { auth } = usePage().props;
    const userRole = auth?.user?.role || 'reporter';

    const [currentPage, setCurrentPage] = useState(
        () => urlToPageName(window.location.pathname) || 'dashboard'
    );

    useEffect(() => {
        const cancel = router.on('navigate', () => {
            const page = urlToPageName(window.location.pathname);
            if (page) setCurrentPage(page);
        });
        return () => cancel();
    }, []);

    const handleNavigate = useCallback((pageId) => {
        const route = ROUTES.admin[pageId] || ROUTES.admin[pageId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())];
        if (route) router.visit(route);
    }, []);

    return (
        <AdminNavigationProvider currentPage={currentPage} onNavigate={handleNavigate}>
            <AdminLayout currentPage={currentPage} onNavigate={handleNavigate} userRole={userRole}>
                {children}
            </AdminLayout>
        </AdminNavigationProvider>
    );
}

/**
 * Convert URL path to sidebar page name.
 */
function urlToPageName(url) {
    const path = url.replace(/^\/admin\/?/, '');
    
    // Dynamic patterns
    if (path.startsWith('news/')) {
        if (path.includes('/edit')) return 'news-all';
        const sub = path.split('/')[1];
        const subMap = { 'write': 'news-write', 'drafts': 'news-drafts', 'published': 'news-published', 'pending': 'news-pending' };
        if (subMap[sub]) return subMap[sub];
    }
    if (path.startsWith('opinions/')) {
        return 'opinions';
    }

    const urlMap = {
        '': 'dashboard',
        'dashboard': 'dashboard',
        'news': 'news-all',
        'categories': 'categories',
        'media': 'media',
        'videos': 'videos',
        'stories': 'stories',
        'opinions': 'opinions',
        'reporters': 'reporters',
        'comments': 'comments',
        'ads': 'ads',
        'subscriptions': 'subscriptions',
        'traffic': 'traffic',
        'revenue': 'revenue',
        'seo': 'seo',
        'settings': 'settings',
        'users': 'users',
        'roles': 'roles',
        'audit-log': 'audit-log',
        'stocks': 'stocks',
        'cricket': 'cricket',
        'prices': 'prices',
        'polls': 'polls',
        'weather': 'weather',
        'horoscope': 'horoscope',
        'prayer-times': 'prayer-times',
        'epaper-manager': 'epaper',
        'newsletter': 'newsletter',
        'homepage-layout': 'homepage-layout',
        'profile': 'profile',
        'pitch-board': 'pitch-board',
        'assignment-board': 'assignment-board',
        'editorial-calendar': 'editorial-calendar',
    };
    return urlMap[path] || null;
}
