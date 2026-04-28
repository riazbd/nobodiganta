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
import { relativeTime, toBengaliNum } from '../lib/formatters';

function ArticleCard({ item, lang, onNavigate, imgH = 185 }) {
  if (!item) return null;
  return (
    <article
      className="card"
      onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
    >
      {item.featured_image
        ? <img src={item.featured_image} alt={item.title} style={{ width: '100%', height: imgH, objectFit: 'cover', display: 'block' }} loading="lazy" />
        : <div className="ph" style={{ height: imgH }}>📰</div>}
      <div className="cb">
        <span className="tag">{item.category?.name}</span>
        <h3>{item.title}</h3>
        {item.excerpt && <p>{item.excerpt}</p>}
        <div className="meta">
          {item.author?.name && <span style={{ fontWeight: 600 }}>{item.author.name}</span>}
          <span>{relativeTime(item.published_at, lang)}</span>
          <span className="views"><Icon name="eye" size={12} /> {lang === 'bn' ? toBengaliNum(String(item.views || 0)) : (item.views || 0)}</span>
        </div>
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
      {item.featured_image
        ? <img src={item.featured_image} alt={item.title} style={{ width: 100, height: 70, objectFit: 'cover', display: 'block', flexShrink: 0 }} loading="lazy" />
        : <div className="ph" style={{ width: 100, height: 70, flexShrink: 0 }}>📰</div>}
      <div>
        <span className="tag">{item.category?.name}</span>
        {item.subcategory?.name && <span className="tag" style={{ marginLeft: 4, color: '#666', background: '#f5f5f5' }}>› {item.subcategory.name}</span>}
        <h4>{item.title}</h4>
        <div className="meta">
          {item.author?.name && <span style={{ fontWeight: 600 }}>{item.author.name}</span>}
          <span>{relativeTime(item.published_at, lang)}</span>
        </div>
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

  return (
    <>
      <Head title={`${catName} | ${lang === 'bn' ? 'নব দিগন্ত' : 'Nobo Digonto'}`} />

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
                  <ArticleCard item={data[0]} lang={lang} onNavigate={onNavigate} imgH={260} />
                </div>

                {/* 2-up grid */}
                {data.length > 1 && (
                  <div className="g2" style={{ marginBottom: 14 }}>
                    {data.slice(1, 3).map(item => (
                      <ArticleCard key={item.id} item={item} lang={lang} onNavigate={onNavigate} />
                    ))}
                  </div>
                )}

                <div style={{ margin: '20px 0' }}>
                  <AdSlot size="leaderboard" position="category_middle" />
                </div>

                {/* List items */}
                <div className="sec">
                  {data.slice(3).map(item => (
                    <ArticleListItem key={item.id} item={item} lang={lang} onNavigate={onNavigate} />
                  ))}
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
