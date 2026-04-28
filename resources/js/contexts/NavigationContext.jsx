import { createContext, useContext, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ROUTES } from '../lib/routes';

export const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  // ✅ Hook called at top level (correct)
  const { edition = 'bn' } = usePage().props;

  /**
   * Navigate to a named route.
   * @param {string} page - key from ROUTES or 'article'/'cat'/'search'/'topic'/'author'/'live'
   * @param {string|number|object} [sub] - route parameter(s)
   *   - article: { categorySlug, articleSlug } (new) OR id (legacy, deprecated)
   *   - category/topic/author/live: slug string
   *   - search: query string
   */
  const onNavigate = useCallback((page, sub) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // ✅ Edition from closure (not inside callback)
    if (page === 'article') {
      // New format: { categorySlug, articleSlug }
      if (typeof sub === 'object' && sub !== null && sub.categorySlug && sub.articleSlug) {
        router.visit(ROUTES.article(sub.categorySlug, sub.articleSlug, edition));
      } else {
        // Legacy format: id (deprecated, logs warning)
        console.warn('[Navigation] onNavigate("article", id) is deprecated. Use { categorySlug, articleSlug } instead.');
        // Fallback: navigate to home
        router.visit(ROUTES.home(edition));
      }
    } else if (page === 'cat' || page === 'category') {
      router.visit(ROUTES.category(sub, edition));
    } else if (page === 'search') {
      router.visit(ROUTES.searchQuery(sub || '', edition));
    } else if (page === 'tag' || page === 'topic') {
      // tag is deprecated, use topic
      router.visit(ROUTES.topic(sub, edition));
    } else if (page === 'author') {
      router.visit(ROUTES.author(sub, edition));
    } else if (page === 'liveblog' || page === 'live') {
      // liveblog is deprecated, use live
      router.visit(ROUTES.live(sub, edition));
    } else if (typeof ROUTES[page] === 'string') {
      router.visit(ROUTES[page]);
    } else if (typeof ROUTES[page] === 'function') {
      router.visit(ROUTES[page](sub));
    }
  }, [edition]);

  return (
    <NavigationContext.Provider value={{ onNavigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
