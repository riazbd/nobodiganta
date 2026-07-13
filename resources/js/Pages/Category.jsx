import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { t } from '../translations';
import Icon from '../Components/Icon';
import PageSidebar from '../Components/PageSidebar';
import AdSlot from '../Components/ui/AdSlot';
import Pagination from '../Components/ui/Pagination';
import EmptyState from '../Components/ui/EmptyState';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { toBengaliNum, relativeTime } from '../lib/formatters';
import MetaTags from '../Components/seo/MetaTags';
import ArticleThumb from '../Components/ui/ArticleThumb';
import { BreadcrumbJsonLd } from '../Components/seo/JsonLd';
import { buildCategorySeo } from '../lib/seo';

function ArticleCard({ item, lang, onNavigate, hero = false }) {
  if (!item) return null;
  return (
    <article
      className="card"
      onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
    >
      <ArticleThumb src={item.featured_image} alt={item.title} isVideo={item.article_type === 'video'} aspectRatio={hero ? '16/9' : '4/3'} style={hero ? { width: '100%', maxHeight: 480 } : undefined} />
      <div className="cb">
        <h3>{item.title}</h3>
        {item.excerpt && <p>{item.excerpt}</p>}
      </div>
    </article>
  );
}

function ArticleListItem({ item, lang, onNavigate }) {
  if (!item) return null;
  return (
    <div
      className="li"
      onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
    >
      <ArticleThumb src={item.featured_image} alt={item.title} isVideo={item.article_type === 'video'} width={70} height={50} />
      <div>
        <h4>{item.title}</h4>
      </div>
    </div>
  );
}

export default function Category({ category, articles }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const catName = category?.name || '';
  const subcategories = category?.subcategories || [];
  const count = articles?.total || 0;
  const data = articles?.data || [];
  const currentPage = articles?.current_page || 1;
  const seoData = buildCategorySeo(category, lang);
  const breadcrumbItems = [
    { label: lang === 'bn' ? 'হোম' : 'Home', url: `${lang === 'en' ? '/en' : '/'}` },
    { label: catName, url: `${lang === 'en' ? '/en' : '/'}category/${category?.slug}` },
  ];

  return (
    <>
      <MetaTags seo={seoData} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {currentPage > 1 && (
        <Head>
          <meta name="robots" content="noindex,follow" />
        </Head>
      )}

      <div>
        {/* Category banner */}
        <div className="cat-banner">
          <h1>{catName}</h1>
          <span className="cnt">
            {lang === 'bn' ? `${toBengaliNum(String(count))}টি সংবাদ` : `${count} articles`}
          </span>
        </div>

        {/* Subcategory pills */}
        {subcategories.length > 0 && (
          <div className="cat-subcats">
            <div className="wrap">
              <span
                className="cat-subcat-pill active"
                onClick={() => onNavigate('cat', category.slug)}
                role="button"
                tabIndex={0}
              >
                {lang === 'bn' ? 'সব' : 'All'}
              </span>
              {subcategories.map(sc => (
                <span
                  key={sc.id}
                  className="cat-subcat-pill"
                  onClick={() => onNavigate('cat', sc.slug)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && onNavigate('cat', sc.slug)}
                >
                  {lang === 'bn' ? sc.name : (sc.name_en || sc.name)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="g-side">
          <div>
            {data.length === 0 ? (
              <EmptyState
                titleBn="কোনো সংবাদ পাওয়া যায়নি"
                titleEn="No articles found"
                descBn="এই বিভাগে কোনো সংবাদ নেই"
                descEn="No articles in this category yet"
              />
            ) : (
              <>
                {/* Hero card */}
                <div style={{ marginBottom: 14 }}>
                  <ArticleCard item={data[0]} lang={lang} onNavigate={onNavigate} hero />
                </div>

                {/* Remaining items — same cards as the article detail middle-column related news */}
                {data.length > 1 && (
                  <div className="art-bottom-grid" style={{ marginBottom: 20 }}>
                    {data.slice(1).map(item => (
                      <div
                        key={item.id}
                        className="art-bottom-card"
                        onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
                      >
                        {item.featured_image && (
                          <div className="art-bottom-card-img">
                            <img src={item.featured_image} alt={item.title || ''} loading="lazy" />
                          </div>
                        )}
                        <div className="art-bottom-card-body">
                          {item.category?.name && <div className="art-bottom-card-cat">{item.category.name}</div>}
                          <div className="art-bottom-card-title">{item.title}</div>
                          {item.published_at && (
                            <div className="art-bottom-card-date">{relativeTime(item.published_at, lang)}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ margin: '20px 0' }}>
                  <AdSlot size="leaderboard" position="category_middle" />
                </div>

                <Pagination links={articles.links} />
              </>
            )}
          </div>
          <PageSidebar />
        </div>
      </div>
    </>
  );
}
