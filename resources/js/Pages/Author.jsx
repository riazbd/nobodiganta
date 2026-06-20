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
import ArticleThumb from '../Components/ui/ArticleThumb';

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
      <ArticleThumb src={item.featured_image} alt={item.title} isVideo={item.article_type === 'video'} height={180} />
      <div className="cb">
        <h3>{item.title}</h3>
        {item.excerpt && <p>{item.excerpt}</p>}
      </div>
    </article>
  );
}

export default function Author({ author, articles }) {
  const { lang, settings } = useApp();
  const { onNavigate } = useNavigation();

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
            <img
              src={settings?.site_logo || '/logo.png'}
              alt={designation}
            />
          </div>
          <div className="author-info">
            <h1 className="author-name">{designation}</h1>
            {author?.district && (
              <p className="author-district" style={{ color: 'var(--red)', fontWeight: 600, fontSize: 13, margin: '2px 0 0' }}>
                {author.district} {lang === 'bn' ? 'প্রতিনিধি' : 'Correspondent'}
              </p>
            )}
            {bio && <p className="author-bio">{bio}</p>}
            {/* Contact details (email/phone) and social links are hidden from the public author profile.
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
            */}
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
