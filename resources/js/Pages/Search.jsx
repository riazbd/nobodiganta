import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { t } from '../translations';
import Icon from '../Components/Icon';
import PageSidebar from '../Components/PageSidebar';
import Pagination from '../Components/ui/Pagination';
import EmptyState from '../Components/ui/EmptyState';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSearch } from '../contexts/SearchContext';
import { validateSearchQuery } from '../lib/validators';
import { toBengaliNum } from '../lib/formatters';
import MetaTags from '../Components/seo/MetaTags';
import { buildSearchSeo } from '../lib/seo';

export default function Search({ query: initialQuery, articles }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();
  const { setSearchQuery } = useSearch();

  const [inputVal, setInputVal] = useState(initialQuery || '');
  const [error, setError] = useState('');

  const handleSearch = () => {
    const err = validateSearchQuery(inputVal, lang);
    if (err) { setError(err); return; }
    setError('');
    setSearchQuery(inputVal.trim());
    onNavigate('search', inputVal.trim());
  };

  const results = articles?.data || [];
  const countLabel = initialQuery
    ? (lang === 'bn'
        ? `"${initialQuery}" — ${toBengaliNum(String(articles?.total || 0))}টি ফলাফল`
        : `"${initialQuery}" — ${articles?.total || 0} result${articles?.total !== 1 ? 's' : ''}`)
    : '';

  const seoData = initialQuery ? buildSearchSeo(initialQuery, lang) : null;

  return (
    <>
      {seoData && <MetaTags seo={seoData} />}
      <Head>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <div className="article-layout">
        <div>
          <div className="srch-bar">
            <input
              type="search"
              placeholder={t('header.search_placeholder', lang)}
              value={inputVal}
              onChange={(e) => { setInputVal(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              aria-label={t('header.search_placeholder', lang)}
            />
            <button onClick={handleSearch} aria-label={t('search.button', lang)}>
              <Icon name="search" size={14} /> {t('search.button', lang)}
            </button>
          </div>
          {error && <div style={{ color: '#c00', fontSize: 13, marginBottom: 12 }}>{error}</div>}

          {initialQuery && (
            <div className="srch-count" style={{ marginBottom: 16 }}>{countLabel}</div>
          )}

          {initialQuery && results.length === 0 ? (
            <EmptyState
              icon="🔍"
              titleBn="কোনো ফলাফল পাওয়া যায়নি"
              titleEn="No results found"
              descBn={`"${initialQuery}" এর জন্য কোনো সংবাদ পাওয়া যায়নি`}
              descEn={`No articles found for "${initialQuery}"`}
            />
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                className="srch-item"
                onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
                role="button"
                tabIndex={0}
              >
                {item.featured_image
                  ? <img src={item.featured_image} style={{ width: 120, height: 82, objectFit: 'cover', flexShrink: 0 }} loading="lazy" alt={item.title} />
                  : <div className="ph" style={{ width: 120, height: 82, flexShrink: 0 }}>📰</div>}
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                </div>
              </div>
            ))
          )}
          {articles && <Pagination links={articles.links} />}
        </div>
        <PageSidebar />
      </div>
    </>
  );
}
