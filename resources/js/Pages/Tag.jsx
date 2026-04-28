import { Head } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import PageSidebar from '../Components/PageSidebar';
import Pagination from '../Components/ui/Pagination';
import EmptyState from '../Components/ui/EmptyState';
import NewsCard from '../Components/ui/NewsCard';

export default function Tag({ tag, articles }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const tagName = tag?.name || '';
  const results = articles?.data || [];

  return (
    <>
      <Head title={`#${tagName} | ${lang === 'bn' ? 'প্রথম প্রভাতী' : 'Prothom Provati'}`} />
      <div className="article-layout">
        <div className="article-main">
          <div className="sec-hdr" style={{ marginBottom: 20 }}>
            <div className="sec-ttl">
              # {tagName}
            </div>
          </div>
          
          {results.length === 0 ? (
            <EmptyState
              titleBn="কোনো সংবাদ পাওয়া যায়নি"
              titleEn="No articles found"
              descBn={`"${tagName}" ট্যাগে কোনো সংবাদ নেই`}
              descEn={`No articles with tag "${tagName}"`}
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
