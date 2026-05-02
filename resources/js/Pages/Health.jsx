import { useApp } from '../contexts/AppContext';
import MetaTags from '../Components/seo/MetaTags';
import PageSidebar from '../Components/PageSidebar';
import NewsCard from '../Components/ui/NewsCard';
import AdSlot from '../Components/ui/AdSlot';
import Icon from '../Components/Icon';

export default function Health({ articles = [] }) {
  const { lang } = useApp();

  const seo = {
    title: lang === 'bn' ? 'ডাক্তারবাড়ি | স্বাস্থ্য | নবদিগন্ত' : 'Health | NoboDiganta',
    description: lang === 'bn' ? 'স্বাস্থ্য সংক্রান্ত সর্বশেষ সংবাদ ও পরামর্শ' : 'Latest health news and advice',
    lang,
  };

  return (
    <>
      <MetaTags seo={seo} />
      <div className="article-layout">
        <div className="article-main">
          <h1 style={{ fontSize: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="heart" size={24} /> {lang === 'bn' ? 'ডাক্তারবাড়ি' : 'Health'}
          </h1>
          <div className="g2" style={{ rowGap: 20 }}>
            {articles.length > 0 ? articles.map((a) => <NewsCard key={a.id} article={a} variant="featured" imgH={160} />) : <p>{lang === 'bn' ? 'কোনো সংবাদ পাওয়া যায়নি।' : 'No articles found.'}</p>}
          </div>
          <div style={{ marginTop: 20 }}>
             <AdSlot size="leaderboard" position="category_middle" />
          </div>
        </div>
        <PageSidebar />
      </div>
    </>
  );
}
