import { Head, usePage } from '@inertiajs/react';

/**
 * Renders all SEO meta tags via Inertia's <Head>.
 * Accepts the seo object returned by lib/seo.js builder functions.
 */
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

  // Build proper hreflang URLs using path-based edition prefixes
  // Remove /en/ prefix if present to get the base path
  const basePath = typeof window !== 'undefined' 
    ? window.location.pathname.replace(/^\/en/, '') || '/'
    : '/';
  
  const canonicalBn = `${SITE}${basePath}`;
  const canonicalEn = `${SITE}/en${basePath === '/' ? '' : basePath}`;
  
  // Use provided canonical or fall back to edition-based default
  const finalCanonical = canonical || (edition === 'en' ? canonicalEn : canonicalBn);

  // hreflang links
  const hreflangBn = canonicalBn;
  const hreflangEn = canonicalEn;

  return (
    <Head>
      {/* Page title */}
      {title && <title>{title}</title>}

      {/* HTML lang attribute */}
      <html lang={htmlLang} />

      {/* Description */}
      {description && <meta name="description" content={description} />}

      {/* Canonical */}
      <link rel="canonical" href={finalCanonical} />

      {/* hreflang - proper URL paths, NOT query params */}
      <link rel="alternate" hrefLang="bn-BD" href={hreflangBn} />
      <link rel="alternate" hrefLang="en" href={hreflangEn} />
      <link rel="alternate" hrefLang="x-default" href={hreflangBn} />

      {/* Open Graph */}
      {og.title && <meta property="og:title" content={og.title} />}
      {og.description && <meta property="og:description" content={og.description} />}
      {og.image && <meta property="og:image" content={og.image} />}
      {og.url && <meta property="og:url" content={og.url} />}
      {og.type && <meta property="og:type" content={og.type} />}
      {og.siteName && <meta property="og:site_name" content={og.siteName} />}

      {/* Article meta (for og:type="article") */}
      {articleMeta.publishedTime && <meta property="article:published_time" content={articleMeta.publishedTime} />}
      {articleMeta.author && <meta property="article:author" content={articleMeta.author} />}
      {articleMeta.section && <meta property="article:section" content={articleMeta.section} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitter.card || 'summary_large_image'} />
      {twitter.title && <meta name="twitter:title" content={twitter.title} />}
      {twitter.description && <meta name="twitter:description" content={twitter.description} />}
      {twitter.image && <meta name="twitter:image" content={twitter.image} />}
    </Head>
  );
}
