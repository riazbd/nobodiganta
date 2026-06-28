const SITE_NAME_BN = 'নবদিগন্ত';
const SITE_NAME_EN = 'NoboDiganta';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://nobodiganta.com';

function editionPrefix(lang) {
  return lang === 'en' ? '/en' : '';
}

export function buildArticleSeo(article, lang = 'bn') {
  // Prefer the admin Meta Title override; getMetaTitle() already falls back to
  // the headline, so article.meta_title is set whenever the article is.
  const title = article?.meta_title || article?.title || '';
  const description = article?.meta_description || article?.excerpt || '';
  const catSlug = article?.category?.slug || '';
  const artSlug = article?.slug || '';
  const url = catSlug && artSlug
    ? `${SITE_URL}${editionPrefix(lang)}/${catSlug}/${artSlug}`
    : `${SITE_URL}${editionPrefix(lang)}`;
  const image = article?.featured_image || `${SITE_URL}/og-default.jpg`;
  const authorName = article?.author?.name || '';
  const publishedAt = article?.published_at || '';
  const catName = article?.category?.name || '';
  const tags = Array.isArray(article?.tags) ? article.tags.map(t => t.name || t).filter(Boolean) : [];

  return {
    title: `${title} | ${lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN}`,
    description,
    canonical: url,
    og: { title, description, image, url, type: 'article', siteName: lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN },
    twitter: { title, description, image, card: 'summary_large_image' },
    article: { publishedTime: publishedAt, author: authorName, section: catName, tags },
    lang,
  };
}

export function buildCategorySeo(category, lang = 'bn') {
  const name = lang === 'en' ? (category?.nameEn || category?.name) : category?.name;
  const desc = lang === 'en' ? (category?.descEn || category?.desc) : category?.desc;
  const url = `${SITE_URL}${editionPrefix(lang)}/category/${category?.slug}`;
  return {
    title: `${name} | ${lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN}`,
    description: desc || name,
    canonical: url,
    og: { title: name, description: desc || name, url, type: 'website', siteName: lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN },
    twitter: { title: name, description: desc || name, card: 'summary' },
    lang,
  };
}

export function buildTagSeo(tag, lang = 'bn') {
  const label = lang === 'bn' ? `"${tag}" ট্যাগের সংবাদ` : `News tagged "${tag}"`;
  const url = `${SITE_URL}${editionPrefix(lang)}/topic/${encodeURIComponent(tag)}`;
  return {
    title: `${label} | ${lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN}`,
    description: label,
    canonical: url,
    og: { title: label, url, type: 'website', siteName: lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN },
    twitter: { title: label, card: 'summary' },
    lang,
  };
}

export function buildAuthorSeo(author, lang = 'bn') {
  const name = lang === 'en' ? (author?.nameEn || author?.name) : author?.name;
  const label = lang === 'bn' ? `${name} — সাংবাদিক` : `${name} — Journalist`;
  const url = `${SITE_URL}${editionPrefix(lang)}/author/${author?.id}`;
  return {
    title: `${label} | ${lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN}`,
    description: label,
    canonical: url,
    og: { title: label, url, type: 'profile', siteName: lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN },
    twitter: { title: label, card: 'summary' },
    lang,
  };
}

export function buildSearchSeo(query, lang = 'bn') {
  const label = lang === 'bn'
    ? `"${query}" এর অনুসন্ধান ফলাফল`
    : `Search results for "${query}"`;
  const siteName = lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN;
  return {
    title: `${label} | ${siteName}`,
    description: label,
    canonical: `${SITE_URL}/search?q=${encodeURIComponent(query)}`,
    og: { title: label, url: `${SITE_URL}/search?q=${encodeURIComponent(query)}`, type: 'website', siteName },
    twitter: { title: label, card: 'summary' },
    lang,
  };
}

export function buildDefaultSeo(lang = 'bn') {
  const tagline = lang === 'bn'
    ? 'বাংলাদেশের শীর্ষস্থানীয় অনলাইন সংবাদপত্র'
    : "Bangladesh's leading online newspaper";
  const siteName = lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN;
  const url = `${SITE_URL}${editionPrefix(lang)}`;
  return {
    title: `${siteName} | ${tagline}`,
    description: tagline,
    canonical: url,
    og: { title: siteName, description: tagline, url, type: 'website', siteName, image: `${SITE_URL}/og-default.jpg` },
    twitter: { title: siteName, description: tagline, card: 'summary_large_image' },
    lang,
  };
}
