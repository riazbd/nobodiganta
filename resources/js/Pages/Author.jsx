import { Head } from '@inertiajs/react';
import PageSidebar from '../Components/PageSidebar';
import Pagination from '../Components/ui/Pagination';
import EmptyState from '../Components/ui/EmptyState';
import Icon from '../Components/Icon';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { toBengaliNum } from '../lib/formatters';
import MetaTags from '../Components/seo/MetaTags';
import { buildAuthorSeo } from '../lib/seo';

function ArticleCard({ item, lang, onNavigate }) {
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
        ? <img src={item.featured_image} alt={item.title} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} loading="lazy" />
        : <div className="ph" style={{ height: 180 }}>📰</div>}
      <div className="cb">
        <h3>{item.title}</h3>
        {item.excerpt && <p>{item.excerpt}</p>}
      </div>
    </article>
  );
}

export default function Author({ author, articles }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const name = author?.name || (lang === 'bn' ? 'অজ্ঞাত লেখক' : 'Unknown Author');
  const designation = author?.designation || (lang === 'bn' ? 'সাংবাদিক' : 'Journalist');
  const bio = author?.bio || '';
  const count = articles?.total || 0;
  const data = articles?.data || [];
  const currentPage = articles?.current_page || 1;
  const seoData = buildAuthorSeo(author, lang);

  return (
    <>
      <MetaTags seo={seoData} />
      {currentPage > 1 && (
        <Head>
          <meta name="robots" content="noindex,follow" />
        </Head>
      )}

      <div>
        {/* Author profile header */}
        <div className="author-profile">
          <div className="author-av">
            {author?.image
              ? <img src={author.image} alt={name} />
              : <div className="author-av-ph">{name.charAt(0)}</div>}
          </div>
          <div className="author-info">
            <h1 className="author-name">{name}</h1>
            {designation && <div className="author-desg">{designation}</div>}
            {bio && <p className="author-bio">{bio}</p>}
            <div className="author-meta">
              {author?.email && (
                <span className="author-meta-item">
                  <Icon name="mail" size={14} /> {author.email}
                </span>
              )}
              {author?.social_links?.facebook && (
                <a className="author-social" href={author.social_links.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Icon name="facebook" size={16} />
                </a>
              )}
              {author?.social_links?.twitter && (
                <a className="author-social" href={author.social_links.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <Icon name="twitter" size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="g-side">
          <div>
            <div className="sec-hdr" style={{ marginBottom: 16 }}>
              <div className="sec-ttl">
                {lang === 'bn' ? 'লেখকের সংবাদ' : "Author's Articles"}
              </div>
              <span style={{ fontSize: 13, color: '#888', marginLeft: 12 }}>
                {lang === 'bn' ? `${toBengaliNum(String(count))}টি` : `${count} articles`}
              </span>
            </div>

            {data.length === 0 ? (
              <EmptyState
                titleBn="কোনো সংবাদ পাওয়া যায়নি"
                titleEn="No articles published yet"
              />
            ) : (
              <>
                <div className="g2" style={{ rowGap: 20 }}>
                  {data.map(item => (
                    <ArticleCard key={item.id} item={item} lang={lang} onNavigate={onNavigate} />
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
