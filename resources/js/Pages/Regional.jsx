import { Head } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import PageSidebar from '../Components/PageSidebar';
import Pagination from '../Components/ui/Pagination';
import NewsCard from '../Components/ui/NewsCard';
import EmptyState from '../Components/ui/EmptyState';
import { router } from '@inertiajs/react';

const DIVISIONS = [
  { slug: 'dhaka',       bn: 'ঢাকা',         en: 'Dhaka' },
  { slug: 'chittagong',  bn: 'চট্টগ্রাম',      en: 'Chittagong' },
  { slug: 'rajshahi',   bn: 'রাজশাহী',       en: 'Rajshahi' },
  { slug: 'khulna',     bn: 'খুলনা',         en: 'Khulna' },
  { slug: 'barishal',   bn: 'বরিশাল',        en: 'Barishal' },
  { slug: 'sylhet',     bn: 'সিলেট',         en: 'Sylhet' },
  { slug: 'rangpur',    bn: 'রংপুর',         en: 'Rangpur' },
  { slug: 'mymensingh', bn: 'ময়মনসিংহ',      en: 'Mymensingh' },
];

export default function Regional({ division: activeDivision = 'dhaka', articles }) {
  const { lang } = useApp();

  const handleDivisionChange = (slug) => {
    router.get(route('regional'), { division: slug }, { preserveState: true });
  };

  const results = articles?.data || [];
  const divLabel = (d) => lang === 'bn' ? d.bn : d.en;

  return (
    <>
      <Head title={`${lang === 'bn' ? 'সারাদেশ' : 'Regional News'} | ${lang === 'bn' ? 'নব দিগন্ত' : 'Nobo Digonto'}`} />
      <div className="article-layout">
        <div className="article-main">
          <div className="sec-hdr" style={{ marginBottom: 16 }}>
            <div className="sec-ttl">{lang === 'bn' ? 'সারাদেশ' : 'Regional News'}</div>
          </div>

          {/* Division tabs */}
          <div className="tabs" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 6 }}>
            {DIVISIONS.map((d) => (
              <button
                key={d.slug}
                className={`tbtn ${activeDivision === d.slug ? 'on' : ''}`}
                onClick={() => handleDivisionChange(d.slug)}
              >
                {divLabel(d)}
              </button>
            ))}
          </div>

          {results.length === 0 ? (
            <EmptyState
              titleBn="কোনো সংবাদ পাওয়া যায়নি"
              titleEn="No articles found"
            />
          ) : (
            <div className="g2" style={{ rowGap: 20 }}>
              {results.map((article) => (
                <NewsCard key={article.id} article={article} variant="featured" imgH={160} />
              ))}
            </div>
          )}
          {articles && <Pagination links={articles.links} />}
        </div>
        <PageSidebar />
      </div>
    </>
  );
}
