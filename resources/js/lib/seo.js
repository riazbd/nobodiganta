/**
 * SEO meta builder functions.
 * Each function returns an object consumed by MetaTags.jsx.
 */

const SITE_NAME_BN = 'নবদিগন্ত';
const SITE_NAME_EN = 'NoboDiganta';
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://nobodiganta.com';

export function buildArticleSeo(article, lang = 'bn') {
  const title = lang === 'en'
    ? (article?.titleEn || article?.title || '')
    : (article?.title || '');
  const description = lang === 'en'
    ? (article?.subEn || article?.sub || '')
    : (article?.sub || '');
  const url = `${SITE_URL}/article/${article?.id}`;
  const image = article?.image || `${SITE_URL}/og-default.jpg`;
  const authorName = lang === 'en' ? (article?.authorEn || article?.author) : article?.author;
  const publishedAt = article?.date || article?.time || new Date().toISOString();
  const catName = lang === 'en' ? (article?.catNameEn || article?.catName) : article?.catName;

  return {
    title: `${title} | ${lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN}`,
    description,
    canonical: url,
    og: { title, description, image, url, type: 'article', siteName: lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN },
    twitter: { title, description, image, card: 'summary_large_image' },
    article: { publishedTime: publishedAt, author: authorName, section: catName, tags: article?.tags || [] },
    lang,
  };
}

export function buildCategorySeo(category, lang = 'bn') {
  const name = lang === 'en' ? (category?.nameEn || category?.name) : category?.name;
  const desc = lang === 'en' ? (category?.descEn || category?.desc) : category?.desc;
  const url = `${SITE_URL}/category/${category?.slug}`;
  return {
    title: `${name} | ${lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN}`,
    description: desc || name,
    canonical: url,
    og: { title: name, description: desc, url, type: 'website', siteName: lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN },
    twitter: { title: name, description: desc, card: 'summary' },
    lang,
  };
}

export function buildTagSeo(tag, lang = 'bn') {
  const label = lang === 'bn' ? `"${tag}" ট্যাগের সংবাদ` : `News tagged "${tag}"`;
  const url = `${SITE_URL}/tag/${encodeURIComponent(tag)}`;
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
  const url = `${SITE_URL}/author/${author?.id}`;
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
  return {
    title: `${label} | ${lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN}`,
    description: label,
    lang,
  };
}

export function buildDefaultSeo(lang = 'bn') {
  const tagline = lang === 'bn'
    ? 'বাংলাদেশের শীর্ষস্থানীয় অনলাইন সংবাদপত্র'
    : "Bangladesh's leading online newspaper";
  const siteName = lang === 'bn' ? SITE_NAME_BN : SITE_NAME_EN;
  return {
    title: `${siteName} | ${tagline}`,
    description: tagline,
    canonical: SITE_URL,
    og: { title: siteName, description: tagline, url: SITE_URL, type: 'website', siteName, image: `${SITE_URL}/og-default.jpg` },
    twitter: { title: siteName, description: tagline, card: 'summary_large_image' },
    lang,
  };
}
