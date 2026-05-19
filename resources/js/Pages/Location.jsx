import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import MetaTags from '../Components/seo/MetaTags';
import { buildDefaultSeo } from '../lib/seo';
import { useApp } from '../contexts/AppContext';
import Pagination from '../Components/ui/Pagination';
import EmptyState from '../Components/ui/EmptyState';
import { relativeTime } from '../lib/formatters';
import {
  BD_DIVISIONS,
  findDivision,
  findDistrict,
  findUpazila,
} from '../data/bdLocations';
import { ROUTES } from '../lib/routes';

// ── Breadcrumb ─────────────────────────────────────────────────────────────

function LocationBreadcrumb({ level, division, district, upazila, lang }) {
  const crumbs = [
    { label: lang === 'bn' ? 'সারাদেশ' : 'Bangladesh', href: ROUTES.location(lang) },
  ];

  if (level !== 'country') {
    const divData = findDivision(division);
    if (divData) crumbs.push({
      label: lang === 'bn' ? divData.bn : divData.en,
      href: ROUTES.locationDiv(division, lang),
    });
  }

  if (level === 'district' || level === 'upazila') {
    const distData = findDistrict(division, district);
    if (distData) crumbs.push({
      label: lang === 'bn' ? distData.bn : distData.en,
      href: ROUTES.locationDist(division, district, lang),
    });
  }

  if (level === 'upazila') {
    const uzData = findUpazila(division, district, upazila);
    if (uzData) crumbs.push({
      label: lang === 'bn' ? uzData.bn : uzData.en,
      href: ROUTES.locationUpazila(division, district, upazila, lang),
    });
  }

  return (
    <nav className="loc-bc" aria-label="breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="loc-bc-item">
            {isLast ? (
              <span className="loc-bc-current">{crumb.label}</span>
            ) : (
              <>
                <Link href={crumb.href} className="loc-bc-link">{crumb.label}</Link>
                <span className="loc-bc-sep" aria-hidden="true"> › </span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
}

// ── Sub-location inline bullet links (district tabs / upazila tabs) ─────────

function SubLocationLinks({ items, activeSlug, hrefFn, lang }) {
  return (
    <div className="loc-subloc">
      {items.map((item, i) => {
        const isActive = item.slug === activeSlug;
        return (
          <span key={item.slug} className="loc-subloc-entry">
            {i > 0 && <span className="loc-subloc-sep" aria-hidden="true"> • </span>}
            <Link
              href={hrefFn(item)}
              className={`loc-subloc-link${isActive ? ' on' : ''}`}
            >
              {lang === 'bn' ? item.bn : item.en}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

// ── Article URL helper ─────────────────────────────────────────────────────

function articleHref(article, lang) {
  return ROUTES.article(article.category?.slug || 'bangladesh', article.slug, lang);
}

// ── Hero article (large, top of feed) ─────────────────────────────────────

function LocHeroArticle({ article, lang }) {
  return (
    <Link href={articleHref(article, lang)} className="loc-hero-main">
      {article.featured_image && (
        <img
          src={article.featured_image}
          alt={article.featured_image_alt || article.title}
          className="loc-hero-img"
          loading="lazy"
        />
      )}
      <div className="loc-hero-body">
        {/* <span className="loc-hero-cat">{article.category?.name}</span> */}
        <h2 className="loc-hero-title">{article.title}</h2>
        {article.excerpt && <p className="loc-hero-excerpt">{article.excerpt}</p>}
        {/* <span className="loc-hero-time">{relativeTime(article.published_at, lang)}</span> */}
      </div>
    </Link>
  );
}

// ── Mini article (stacked beside hero) ────────────────────────────────────

function LocMiniArticle({ article, lang }) {
  return (
    <Link href={articleHref(article, lang)} className="loc-mini">
      <div className="loc-mini-info">
        {/* <span className="loc-mini-cat">{article.category?.name}</span> */}
        <h3 className="loc-mini-title">{article.title}</h3>
      </div>
      {article.featured_image && (
        <img
          src={article.featured_image}
          alt={article.featured_image_alt || article.title}
          className="loc-mini-img"
          loading="lazy"
        />
      )}
    </Link>
  );
}

// ── List article (title+excerpt left, thumbnail right) ────────────────────

function LocListArticle({ article, lang }) {
  return (
    <Link href={articleHref(article, lang)} className="loc-list-item">
      <div className="loc-list-info">
        {/* <span className="loc-list-cat">{article.category?.name}</span> */}
        <h3 className="loc-list-title">{article.title}</h3>
        {article.excerpt && <p className="loc-list-excerpt">{article.excerpt}</p>}
        {/* <span className="loc-list-meta">{relativeTime(article.published_at, lang)}</span> */}
      </div>
      {article.featured_image && (
        <img
          src={article.featured_image}
          alt={article.featured_image_alt || article.title}
          className="loc-list-img"
          loading="lazy"
        />
      )}
    </Link>
  );
}

// ── Full article feed with hero+mini+list layout ───────────────────────────

function LocArticlesFeed({ articles, lang }) {
  const results = articles?.data || [];

  if (results.length === 0) {
    return (
      <EmptyState
        titleBn="এই এলাকায় কোনো সংবাদ পাওয়া যায়নি"
        titleEn="No articles found for this location"
      />
    );
  }

  const hero = results[0];
  const minis = results.slice(1, 5);
  const listItems = results.slice(5);

  return (
    <div className="loc-feed">
      {/* Hero cluster */}
      <div className="loc-hero-cluster">
        <LocHeroArticle article={hero} lang={lang} />
        {minis.length > 0 && (
          <div className="loc-hero-stack">
            {minis.map(a => <LocMiniArticle key={a.id} article={a} lang={lang} />)}
          </div>
        )}
      </div>

      {/* Divider */}
      {listItems.length > 0 && <div className="loc-divider" />}

      {/* List articles */}
      {listItems.map(a => (
        <LocListArticle key={a.id} article={a} lang={lang} />
      ))}

      {/* Pagination */}
      {articles && <Pagination links={articles.links} />}
    </div>
  );
}

// ── Right sidebar: "আপনার এলাকার খবর" filter widget ──────────────────────

function LocationFilterWidget({ division: initDiv, district: initDist, upazila: initUz, lang }) {
  const [selDiv, setSelDiv] = useState(initDiv || '');
  const [selDist, setSelDist] = useState(initDist || '');
  const [selUz, setSelUz] = useState(initUz || '');

  const divData = selDiv ? findDivision(selDiv) : null;
  const distData = (selDiv && selDist) ? findDistrict(selDiv, selDist) : null;

  const handleDivChange = (e) => {
    setSelDiv(e.target.value);
    setSelDist('');
    setSelUz('');
  };

  const handleDistChange = (e) => {
    setSelDist(e.target.value);
    setSelUz('');
  };

  const handleSearch = () => {
    if (selUz && selDist && selDiv) {
      router.visit(ROUTES.locationUpazila(selDiv, selDist, selUz, lang));
    } else if (selDist && selDiv) {
      router.visit(ROUTES.locationDist(selDiv, selDist, lang));
    } else if (selDiv) {
      router.visit(ROUTES.locationDiv(selDiv, lang));
    } else {
      router.visit(ROUTES.location(lang));
    }
  };

  return (
    <div className="loc-widget">
      <div className="loc-widget-hdr">
        {lang === 'bn' ? 'আপনার এলাকার খবর' : 'News from your area'}
      </div>

      {/* Division */}
      <select className="loc-widget-select" value={selDiv} onChange={handleDivChange}>
        <option value="">{lang === 'bn' ? 'বিভাগ' : 'Division'}</option>
        {BD_DIVISIONS.map(d => (
          <option key={d.slug} value={d.slug}>
            {lang === 'bn' ? d.bn : d.en}
          </option>
        ))}
      </select>

      {/* District — shown when division selected */}
      <select
        className="loc-widget-select"
        value={selDist}
        onChange={handleDistChange}
        disabled={!divData}
      >
        <option value="">{lang === 'bn' ? 'জেলা' : 'District'}</option>
        {divData?.districts.map(d => (
          <option key={d.slug} value={d.slug}>
            {lang === 'bn' ? d.bn : d.en}
          </option>
        ))}
      </select>

      {/* Upazila — shown when district selected */}
      <select
        className="loc-widget-select"
        value={selUz}
        onChange={e => setSelUz(e.target.value)}
        disabled={!distData}
      >
        <option value="">{lang === 'bn' ? 'উপজেলা' : 'Upazila'}</option>
        {distData?.upazilas.map(u => (
          <option key={u.slug} value={u.slug}>
            {lang === 'bn' ? u.bn : u.en}
          </option>
        ))}
      </select>

      <button className="loc-widget-btn" onClick={handleSearch}>
        {lang === 'bn' ? 'খুঁজুন' : 'Search'}
      </button>
    </div>
  );
}

// ── Division grid (country level) ─────────────────────────────────────────

function DivisionGrid({ lang, divisionCounts }) {
  return (
    <div className="loc-div-grid">
      {BD_DIVISIONS.map((div) => {
        const count = divisionCounts?.[div.slug] || 0;
        return (
          <Link key={div.slug} href={ROUTES.locationDiv(div.slug, lang)} className="loc-div-card">
            <div className="loc-div-name">{lang === 'bn' ? div.bn : div.en}</div>
            <div className="loc-div-meta">
              {lang === 'bn' ? `${div.districts.length}টি জেলা` : `${div.districts.length} Districts`}
            </div>
            {count > 0 && (
              <div className="loc-div-count">
                {count} {lang === 'bn' ? 'সংবাদ' : 'news'}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function Location({
  level,
  division,
  district,
  upazila,
  articles,
  divisionCounts,
  districtCounts,
  upazilaCounts,
}) {
  const { lang } = useApp();

  const divData = division ? findDivision(division) : null;
  const distData = (division && district) ? findDistrict(division, district) : null;
  const uzData = (division && district && upazila) ? findUpazila(division, district, upazila) : null;

  const pageTitle = (() => {
    if (level === 'upazila' && uzData) return lang === 'bn' ? uzData.bn : uzData.en;
    if (level === 'district' && distData) return lang === 'bn' ? distData.bn : distData.en;
    if (level === 'division' && divData) return lang === 'bn' ? divData.bn : divData.en;
    return lang === 'bn' ? 'সারাদেশ' : 'Bangladesh';
  })();

  return (
    <>
      <MetaTags seo={buildDefaultSeo(lang)} />
      <Head title={`${pageTitle} | ${lang === 'bn' ? 'নবদিগন্ত' : 'Provati'}`} />
      {(articles?.current_page || 1) > 1 && (
        <Head><meta name="robots" content="noindex,follow" /></Head>
      )}

      {/* Breadcrumb */}
      <LocationBreadcrumb
        level={level}
        division={division}
        district={district}
        upazila={upazila}
        lang={lang}
      />

      {/* Sub-location bullet links */}
      {level === 'division' && divData && (
        <SubLocationLinks
          items={divData.districts}
          activeSlug={district}
          hrefFn={(d) => ROUTES.locationDist(division, d.slug, lang)}
          lang={lang}
        />
      )}
      {level === 'district' && distData && (
        <SubLocationLinks
          items={distData.upazilas}
          activeSlug={upazila}
          hrefFn={(u) => ROUTES.locationUpazila(division, district, u.slug, lang)}
          lang={lang}
        />
      )}
      {level === 'upazila' && distData && (
        <SubLocationLinks
          items={distData.upazilas}
          activeSlug={upazila}
          hrefFn={(u) => ROUTES.locationUpazila(division, district, u.slug, lang)}
          lang={lang}
        />
      )}

      {/* Country level: division grid */}
      {level === 'country' && (
        <DivisionGrid lang={lang} divisionCounts={divisionCounts} />
      )}
      <div className="article-layout">
        {/* ── Left: main content ── */}
        <div className="article-main">
          {/* Article feed for all non-country levels */}
          {level !== 'country' && (
            <LocArticlesFeed articles={articles} lang={lang} />
          )}
        </div>

        {/* ── Right: location filter widget ── */}
        <div className="loc-sidebar">
          <LocationFilterWidget
            division={division}
            district={district}
            upazila={upazila}
            lang={lang}
          />
        </div>
      </div>
    </>
  );
}
