import { useApp } from '../contexts/AppContext';
import MetaTags from '../Components/seo/MetaTags';
import PageSidebar from '../Components/PageSidebar';
import NewsCard from '../Components/ui/NewsCard';
import AdSlot from '../Components/ui/AdSlot';
import Icon from '../Components/Icon';

export default function IslamicLife({ articles = [] }) {
  const { lang } = useApp();

  const seo = {
    title: lang === 'bn' ? 'ইসলামিক জীবন | নবদিগন্ত' : 'Islamic Life | NoboDiganta',
    description: lang === 'bn' ? 'ইসলামিক জীবনযাত্রা ও ধর্মীয় সংবাদ' : 'Islamic lifestyle and religious news',
    lang,
  };

  return (
    <>
      <MetaTags seo={seo} />
      <div className="article-layout">
        <div className="article-main">
          <h1 style={{ fontSize: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="moon" size={24} /> {lang === 'bn' ? 'ইসলামিক জীবন' : 'Islamic Life'}
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
