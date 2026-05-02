import { useApp } from '../contexts/AppContext';
import MetaTags from '../Components/seo/MetaTags';
import PageSidebar from '../Components/PageSidebar';
import NewsCard from '../Components/ui/NewsCard';
import AdSlot from '../Components/ui/AdSlot';
import Icon from '../Components/Icon';

export default function Jobs({ articles = [] }) {
  const { lang } = useApp();
  const seo = {
    title: lang === 'bn' ? 'চাকরি | নবদিগন্ত' : 'Jobs | NoboDiganta',
    description: lang === 'bn' ? 'বাংলাদেশের সর্বশেষ চাকরির বিজ্ঞপ্তি' : 'Latest job listings in Bangladesh',
    lang,
  };

  return (
    <>
      <MetaTags seo={seo} />
      <div className="article-layout">
        <div className="article-main">
          <h1 style={{ fontSize: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="briefcase" size={24} /> {lang === 'bn' ? 'চাকরি' : 'Jobs'}
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
