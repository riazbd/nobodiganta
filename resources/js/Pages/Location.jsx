import { Head, Link } from '@inertiajs/react';
import MetaTags from '../Components/seo/MetaTags';
import { buildDefaultSeo } from '../lib/seo';
import { useApp } from '../contexts/AppContext';
import PageSidebar from '../Components/PageSidebar';
import Pagination from '../Components/ui/Pagination';
import NewsCard from '../Components/ui/NewsCard';
import EmptyState from '../Components/ui/EmptyState';
import {
  BD_DIVISIONS,
  findDivision,
  findDistrict,
  findUpazila,
} from '../data/bdLocations';
import { ROUTES } from '../lib/routes';

function LocationBreadcrumb({ level, division, district, upazila, lang }) {
  const crumbs = [
    { label: lang === 'bn' ? 'সারাদেশ' : 'Bangladesh', href: ROUTES.location(lang) },
  ];

  if (level !== 'country') {
    const divData = findDivision(division);
    if (divData) {
      crumbs.push({
        label: lang === 'bn' ? divData.bn : divData.en,
        href: ROUTES.locationDiv(division, lang),
      });
    }
  }

  if (level === 'district' || level === 'upazila') {
    const distData = findDistrict(division, district);
    if (distData) {
      crumbs.push({
        label: lang === 'bn' ? distData.bn : distData.en,
        href: ROUTES.locationDist(division, district, lang),
      });
    }
  }

  if (level === 'upazila') {
    const uzData = findUpazila(division, district, upazila);
    if (uzData) {
      crumbs.push({
        label: lang === 'bn' ? uzData.bn : uzData.en,
        href: ROUTES.locationUpazila(division, district, upazila, lang),
      });
    }
  }

  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="bc-item">
            {isLast ? (
              <span className="bc-current" aria-current="page">{crumb.label}</span>
            ) : (
              <>
                <Link href={crumb.href} className="bc-link">{crumb.label}</Link>
                <span className="bc-sep" aria-hidden="true">›</span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function FilterPills({ items, activeFn, hrefFn, lang, countMap }) {
  return (
    <div className="loc-pills">
      {items.map((item) => {
        const isActive = activeFn(item);
        const count = countMap?.[item.slug];
        return (
          <Link
            key={item.slug}
            href={hrefFn(item)}
            className={`loc-pill${isActive ? ' on' : ''}`}
          >
            <span>{lang === 'bn' ? item.bn : item.en}</span>
            {count ? <span className="loc-pill-count">{count}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

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

  const results = articles?.data || [];

  return (
    <>
      <MetaTags seo={buildDefaultSeo(lang)} />
      <Head title={`${pageTitle} | ${lang === 'bn' ? 'নবদিগন্ত' : 'Provati'}`} />
      {(articles?.current_page || 1) > 1 && (
        <Head><meta name="robots" content="noindex,follow" /></Head>
      )}

      <div className="article-layout">
        <div className="article-main">

          {/* Breadcrumb */}
          <LocationBreadcrumb
            level={level}
            division={division}
            district={district}
            upazila={upazila}
            lang={lang}
          />

          {/* Page header */}
          <div className="sec-hdr" style={{ marginBottom: 16 }}>
            <div className="sec-ttl">{pageTitle}</div>
          </div>

          {/* Country level: show 8-division grid */}
          {level === 'country' && (
            <DivisionGrid lang={lang} divisionCounts={divisionCounts} />
          )}

          {/* Division level: show district pills */}
          {level === 'division' && divData && (
            <FilterPills
              items={divData.districts}
              activeFn={(d) => d.slug === district}
              hrefFn={(d) => ROUTES.locationDist(division, d.slug, lang)}
              lang={lang}
              countMap={districtCounts}
            />
          )}

          {/* District level: show upazila pills */}
          {level === 'district' && distData && (
            <FilterPills
              items={distData.upazilas}
              activeFn={(u) => u.slug === upazila}
              hrefFn={(u) => ROUTES.locationUpazila(division, district, u.slug, lang)}
              lang={lang}
              countMap={upazilaCounts}
            />
          )}

          {/* Article list — shown for division/district/upazila levels */}
          {level !== 'country' && (
            <>
              {results.length === 0 ? (
                <EmptyState
                  titleBn="এই এলাকায় কোনো সংবাদ পাওয়া যায়নি"
                  titleEn="No articles found for this location"
                />
              ) : (
                <div className="g2" style={{ rowGap: 20, marginTop: 20 }}>
                  {results.map((article) => (
                    <NewsCard key={article.id} article={article} variant="featured" imgH={160} />
                  ))}
                </div>
              )}
              {articles && <Pagination links={articles.links} />}
            </>
          )}

        </div>
        <PageSidebar />
      </div>
    </>
  );
}
