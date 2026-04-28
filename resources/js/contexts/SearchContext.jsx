import { createContext, useContext, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { ROUTES } from '../lib/routes';

export const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const onSearch = useCallback((query) => {
    const q = (query ?? searchQuery).trim();
    if (q.length < 2) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.visit(ROUTES.searchQuery(q));
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
  }, []);

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      suggestions,
      setSuggestions,
      onSearch,
      clearSearch,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
