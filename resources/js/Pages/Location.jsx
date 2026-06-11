import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import MetaTags from '../Components/seo/MetaTags';
import { buildDefaultSeo } from '../lib/seo';
import { useApp } from '../contexts/AppContext';
import Pagination from '../Components/ui/Pagination';
import EmptyState from '../Components/ui/EmptyState';
import { toBengaliNum } from '../lib/formatters';
import { ROUTES } from '../lib/routes';

function LocationBreadcrumb({ level, division, district, upazila, divisions, districts, upazilas, lang }) {
  const d = (item) => lang === 'bn' ? item.name_bn : item.name_en;
  const findDiv = () => divisions.find(x => x.slug === division) || null;
  const findDist = () => {
    const d = findDiv();
    return d ? (districts.find(x => x.slug === district) || null) : null;
  };
  const findUz = () => {
    const d = findDist();
    return d ? (upazilas.find(x => x.slug === upazila) || null) : null;
  };

  const crumbs = [
    { label: lang === 'bn' ? 'সারাদেশ' : 'Bangladesh', href: ROUTES.location(lang) },
  ];

  if (level !== 'country') {
    const divData = findDiv();
    if (divData) crumbs.push({
      label: d(divData),
      href: ROUTES.locationDiv(division, lang),
    });
  }

  if (level === 'district' || level === 'upazila') {
    const distData = findDist();
    if (distData) crumbs.push({
      label: d(distData),
      href: ROUTES.locationDist(division, district, lang),
    });
  }

  if (level === 'upazila') {
    const uzData = findUz();
    if (uzData) crumbs.push({
      label: d(uzData),
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

function SubLocationLinks({ items, activeSlug, hrefFn, lang }) {
  const label = (item) => lang === 'bn' ? item.name_bn : item.name_en;
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
              {label(item)}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

function articleHref(article, lang) {
  return ROUTES.article(article.category?.slug || 'bangladesh', article.slug, lang);
}

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
        <h2 className="loc-hero-title">{article.title}</h2>
        {article.excerpt && <p className="loc-hero-excerpt">{article.excerpt}</p>}
      </div>
    </Link>
  );
}

function LocMiniArticle({ article, lang }) {
  return (
    <Link href={articleHref(article, lang)} className="loc-mini">
      <div className="loc-mini-info">
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

function LocListArticle({ article, lang }) {
  return (
    <Link href={articleHref(article, lang)} className="loc-list-item">
      <div className="loc-list-info">
        <h3 className="loc-list-title">{article.title}</h3>
        {article.excerpt && <p className="loc-list-excerpt">{article.excerpt}</p>}
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
      <div className="loc-hero-cluster">
        <LocHeroArticle article={hero} lang={lang} />
        {minis.length > 0 && (
          <div className="loc-hero-stack">
            {minis.map(a => <LocMiniArticle key={a.id} article={a} lang={lang} />)}
          </div>
        )}
      </div>

      {listItems.length > 0 && <div className="loc-divider" />}

      {listItems.map(a => (
        <LocListArticle key={a.id} article={a} lang={lang} />
      ))}

      {articles && <Pagination links={articles.links} />}
    </div>
  );
}

function LocationFilterWidget({ division: initDiv, district: initDist, upazila: initUz, divisions, lang }) {
  const [selDiv, setSelDiv] = useState(initDiv || '');
  const [selDist, setSelDist] = useState(initDist || '');
  const [selUz, setSelUz] = useState(initUz || '');
  const [dists, setDists] = useState([]);
  const [uzs, setUzs] = useState([]);

  useEffect(() => {
    if (initDiv) {
      window.axios.get(`/api/location/districts/${initDiv}`)
        .then(r => {
          setDists(r.data);
          if (initDist) {
            window.axios.get(`/api/location/upazilas/${initDist}`)
              .then(r2 => setUzs(r2.data))
              .catch(() => setUzs([]));
          }
        })
        .catch(() => setDists([]));
    }
  }, []);

  const handleDivChange = (e) => {
    const slug = e.target.value;
    setSelDiv(slug);
    setSelDist('');
    setSelUz('');
    setDists([]);
    setUzs([]);
    if (slug) {
      window.axios.get(`/api/location/districts/${slug}`)
        .then(r => setDists(r.data))
        .catch(() => setDists([]));
    }
  };

  const handleDistChange = (e) => {
    const slug = e.target.value;
    setSelDist(slug);
    setSelUz('');
    setUzs([]);
    if (slug) {
      window.axios.get(`/api/location/upazilas/${slug}`)
        .then(r => setUzs(r.data))
        .catch(() => setUzs([]));
    }
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

  const label = (item) => lang === 'bn' ? item.name_bn : item.name_en;

  return (
    <div className="loc-widget">
      <div className="loc-widget-hdr">
        {lang === 'bn' ? 'আপনার এলাকার খবর' : 'News from your area'}
      </div>

      <select className="loc-widget-select" value={selDiv} onChange={handleDivChange}>
        <option value="">{lang === 'bn' ? 'বিভাগ' : 'Division'}</option>
        {(divisions || []).map(d => (
          <option key={d.slug} value={d.slug}>{label(d)}</option>
        ))}
      </select>

      <select className="loc-widget-select" value={selDist} onChange={handleDistChange} disabled={!selDiv}>
        <option value="">{lang === 'bn' ? 'জেলা' : 'District'}</option>
        {dists.map(d => (
          <option key={d.slug} value={d.slug}>{label(d)}</option>
        ))}
      </select>

      <select className="loc-widget-select" value={selUz} onChange={e => setSelUz(e.target.value)} disabled={!selDist}>
        <option value="">{lang === 'bn' ? 'উপজেলা' : 'Upazila'}</option>
        {uzs.map(u => (
          <option key={u.slug} value={u.slug}>{label(u)}</option>
        ))}
      </select>

      <button className="loc-widget-btn" onClick={handleSearch}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline-block', verticalAlign:'middle', marginRight:7, marginTop:-2 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        {lang === 'bn' ? 'খুঁজুন' : 'Search'}
      </button>
    </div>
  );
}

function DivisionGrid({ divisions, lang, divisionCounts }) {
  const label = (item) => lang === 'bn' ? item.name_bn : item.name_en;
  return (
    <div className="loc-div-grid">
      {divisions.map((div) => {
        const count = divisionCounts?.[div.slug] || 0;
        return (
          <Link key={div.slug} href={ROUTES.locationDiv(div.slug, lang)} className="loc-div-card">
            <div className="loc-div-name">{label(div)}</div>
            <div className="loc-div-meta">
              {lang === 'bn' ? `${toBengaliNum(String(div.districts_count || 0))}টি জেলা` : `${div.districts_count || 0} Districts`}
            </div>
            {count > 0 && (
              <div className="loc-div-count">
                {lang === 'bn' ? toBengaliNum(String(count)) : count} {lang === 'bn' ? 'সংবাদ' : 'news'}
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function LocationTreeWidget({ tree, lang }) {
  if (!tree) return null;
  const l = (item) => lang === 'bn' ? item.name_bn : item.name_en;
  return (
    <div className="loc-widget">
      <div className="loc-widget-hdr">
        {lang === 'bn' ? 'অঞ্চল অনুযায়ী' : 'By Region'}
      </div>
      <div className="space-y-0.5">
        {tree.children?.map(div => (
          <div key={div.id}>
            <Link
              href={ROUTES.locationDiv(div.slug.replace('division-', ''), lang)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-700">{l(div)}</span>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {lang === 'bn' ? toBengaliNum(String(div.articles_count || 0)) : (div.articles_count || 0)}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Location({
  level,
  divisions = [],
  districts = [],
  upazilas = [],
  locationTree = null,
  division,
  district,
  upazila,
  articles,
  divisionCounts,
  districtCounts,
  upazilaCounts,
}) {
  const { lang } = useApp();

  const findDiv = () => divisions.find(x => x.slug === division) || null;
  const findDist = () => {
    const d = findDiv();
    return d ? (districts.find(x => x.slug === district) || null) : null;
  };
  const findUz = () => {
    const d = findDist();
    return d ? (upazilas.find(x => x.slug === upazila) || null) : null;
  };

  const d = (item) => lang === 'bn' ? item?.name_bn : item?.name_en;

  const divData = findDiv();
  const distData = findDist();
  const uzData = findUz();

  const pageTitle = (() => {
    if (level === 'upazila' && uzData) return d(uzData);
    if (level === 'district' && distData) return d(distData);
    if (level === 'division' && divData) return d(divData);
    return lang === 'bn' ? 'সারাদেশ' : 'Bangladesh';
  })();

  return (
    <>
      <MetaTags seo={buildDefaultSeo(lang)} />
      <Head title={`${pageTitle} | ${lang === 'bn' ? 'নবদিগন্ত' : 'Provati'}`} />
      {(articles?.current_page || 1) > 1 && (
        <Head><meta name="robots" content="noindex,follow" /></Head>
      )}

      <LocationBreadcrumb
        level={level}
        division={division}
        district={district}
        upazila={upazila}
        divisions={divisions}
        districts={districts}
        upazilas={upazilas}
        lang={lang}
      />

      {level === 'division' && (
        <SubLocationLinks
          items={districts}
          activeSlug={district}
          hrefFn={(d) => ROUTES.locationDist(division, d.slug, lang)}
          lang={lang}
        />
      )}
      {level === 'district' && (
        <SubLocationLinks
          items={upazilas}
          activeSlug={upazila}
          hrefFn={(u) => ROUTES.locationUpazila(division, district, u.slug, lang)}
          lang={lang}
        />
      )}
      {level === 'upazila' && (
        <SubLocationLinks
          items={upazilas}
          activeSlug={upazila}
          hrefFn={(u) => ROUTES.locationUpazila(division, district, u.slug, lang)}
          lang={lang}
        />
      )}

      <div className="article-layout">
        <div className="article-main">
          {articles && (
            <LocArticlesFeed articles={articles} lang={lang} />
          )}
        </div>
        <div className="loc-sidebar">
          <LocationFilterWidget
            division={division}
            district={district}
            upazila={upazila}
            divisions={divisions}
            lang={lang}
          />
          <div className="mt-4">
            <LocationTreeWidget tree={locationTree} lang={lang} />
          </div>
        </div>
      </div>
    </>
  );
}
