/**
 * JSON-LD structured data components.
 * Renders <script type="application/ld+json"> inside Inertia <Head>.
 */
import { Head, usePage } from '@inertiajs/react';

function usePublisher() {
  const { props } = usePage();
  const settings = props.settings || {};
  const siteUrl = window.location.origin;
  const logoUrl = settings.site_logo || `${siteUrl}/icons/icon-192.png`;
  const siteName = settings.site_name || 'নব দিগন্ত';
  const fbUrl = settings.facebook_url;
  const twUrl = settings.twitter_url;
  const ytUrl = settings.youtube_url;

  return {
    '@type': 'Organization',
    name: siteName,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
      width: 240,
      height: 60,
    },
    url: siteUrl,
    sameAs: [fbUrl, twUrl, ytUrl].filter(Boolean),
  };
}

/**
 * NewsArticle JSON-LD with 3 image aspect ratios (required by Google News)
 */
export function NewsArticleJsonLd({ article, edition = 'bn' }) {
  if (!article) return null;

  const publisher = usePublisher();
  const siteUrl = window.location.origin;

  const title = edition === 'en' ? (article.title_en || article.title) : article.title;
  const description = edition === 'en' ? (article.meta_description || article.excerpt) : (article.meta_description || article.excerpt);
  const authorName = edition === 'en' ? (article.author?.name_en || article.author?.name) : article.author?.name;
  const category = edition === 'en' ? (article.category?.name_en || article.category?.name) : article.category?.name;

  const baseImage = article.featured_image || `${siteUrl}/icons/icon-192.png`;
  const images = [
    baseImage,
    `${baseImage}?w=800&h=800&fit=crop`,
    `${baseImage}?w=800&h=600&fit=crop`,
    `${baseImage}?w=1200&h=675&fit=crop`,
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description || title,
    image: images,
    thumbnailUrl: images[0],
    datePublished: article.published_at || new Date().toISOString(),
    dateModified: article.updated_at || article.published_at || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: authorName || (edition === 'en' ? 'Provati Desk' : 'প্রভাতী ডেস্ক'),
      url: `${siteUrl}/author/${article.author?.slug || 'desk'}`,
    },
    publisher,
    url: `${siteUrl}/${edition === 'en' ? 'en/' : ''}${article.category?.slug}/${article.slug}`,
    inLanguage: edition === 'bn' ? 'bn-BD' : 'en',
    articleSection: category || 'News',
    keywords: (article.tags || []).map(t => t.name || t).join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/${edition === 'en' ? 'en/' : ''}${article.category?.slug}/${article.slug}`,
    },
    articleBody: article.body ? article.body.replace(/<[^>]*>/g, '').substring(0, 5000) : '',
    wordCount: article.body ? article.body.replace(/<[^>]*>/g, '').split(/\s+/).length : 0,
  };

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Head>
  );
}

/**
 * BreadcrumbList JSON-LD for navigation structure
 */
export function BreadcrumbJsonLd({ items = [] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.url,
    })),
  };
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Head>
  );
}

/**
 * Organization JSON-LD for homepage
 */
export function OrganizationJsonLd() {
  const publisher = usePublisher();
  const { props } = usePage();
  const settings = props.settings || {};

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: publisher.name,
    url: publisher.url,
    logo: publisher.logo,
    sameAs: publisher.sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings.contact_phone || '',
      email: settings.contact_email || '',
      contactType: 'customer service',
      availableLanguage: ['bn', 'en'],
    },
  };

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Head>
  );
}

export function WebSiteJsonLd() {
  const { props } = usePage();
  const settings = props.settings || {};
  const siteUrl = window.location.origin;
  const siteName = settings.site_name || 'নব দিগন্ত';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Head>
  );
}
