import { Head, usePage } from '@inertiajs/react';

export default function MetaTags({ seo = {} }) {
  const { edition } = usePage().props;
  const SITE = 'https://nobodiganta.com';

  const {
    title,
    description,
    canonical,
    og = {},
    twitter = {},
    article: articleMeta = {},
    lang = 'bn',
  } = seo;

  const htmlLang = lang === 'bn' ? 'bn' : 'en';

  const basePath = typeof window !== 'undefined'
    ? window.location.pathname.replace(/^\/en/, '') || '/'
    : '/';
  
  const canonicalBn = `${SITE}${basePath}`;
  const canonicalEn = `${SITE}/en${basePath === '/' ? '' : basePath}`;
  
  const finalCanonical = canonical || (edition === 'en' ? canonicalEn : canonicalBn);

  const hreflangBn = canonicalBn;
  const hreflangEn = canonicalEn;

  return (
    <Head>
      {title && <title>{title}</title>}
      <html lang={htmlLang} />
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={finalCanonical} />

      <link rel="alternate" hrefLang="bn-BD" href={hreflangBn} />
      <link rel="alternate" hrefLang="en" href={hreflangEn} />
      <link rel="alternate" hrefLang="x-default" href={hreflangBn} />

      {og.title && <meta property="og:title" content={og.title} />}
      {og.description && <meta property="og:description" content={og.description} />}
      {og.image && <meta property="og:image" content={og.image} />}
      {og.image && og.title && <meta property="og:image:alt" content={og.title} />}
      {og.url && <meta property="og:url" content={og.url} />}
      {og.type && <meta property="og:type" content={og.type} />}
      {og.siteName && <meta property="og:site_name" content={og.siteName} />}
      <meta property="og:locale" content={lang === 'bn' ? 'bn_BD' : 'en_US'} />
      <meta property="og:locale:alternate" content={lang === 'bn' ? 'en_US' : 'bn_BD'} />

      {articleMeta.publishedTime && <meta property="article:published_time" content={articleMeta.publishedTime} />}
      {articleMeta.author && <meta property="article:author" content={articleMeta.author} />}
      {articleMeta.section && <meta property="article:section" content={articleMeta.section} />}
      {Array.isArray(articleMeta.tags) && articleMeta.tags.map((tag, i) => (
        <meta key={`at-${i}`} property="article:tag" content={tag} />
      ))}

      <meta name="twitter:card" content={twitter.card || 'summary_large_image'} />
      {twitter.title && <meta name="twitter:title" content={twitter.title} />}
      {twitter.description && <meta name="twitter:description" content={twitter.description} />}
      {twitter.image && <meta name="twitter:image" content={twitter.image} />}
      {twitter.image && twitter.title && <meta name="twitter:image:alt" content={twitter.title} />}
    </Head>
  );
}
