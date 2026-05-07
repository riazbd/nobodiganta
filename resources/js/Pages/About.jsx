import { t } from '../translations';
import Icon from '../Components/Icon';
import PageSidebar from '../Components/PageSidebar';
import { useApp } from '../contexts/AppContext';

export default function About() {
  const { lang, settings } = useApp();
  const siteName = settings.site_name || (lang === 'bn' ? 'à¦¨à¦¬ à¦¦à¦¿à¦—à¦¨à§à¦¤' : 'Nobo Digonto');
  
  const milestones = lang === 'bn' ? [
    ['à§¨à§¦à§§à§¦', `${siteName}à¦° à¦¯à¦¾à¦¤à§à¦°à¦¾ à¦¶à§à¦°à§ à§§ à¦œà¦¾à¦¨à§à¦¯à¦¼à¦¾à¦°à¦¿à¥¤ à¦¶à¦¹à§€à¦¦à§à¦² à¦‡à¦¸à¦²à¦¾à¦®à§‡à¦° à¦¸à¦®à§à¦ªà¦¦à¦¨à¦¾à¦¯à¦¼ à¦ªà§à¦°à¦¥à¦® à¦¸à¦‚à¦–à§à¦¯à¦¾ à¦ªà§à¦°à¦•à¦¾à¦¶à¦¿à¦¤ à¦¹à¦¯à¦¼à¥¤`],
    ['à§¨à§¦à§§à§©', 'à¦…à¦¨à¦²à¦¾à¦‡à¦¨ à¦¸à¦‚à¦¸à§à¦•à¦°à¦£ à¦šà¦¾à¦²à§à¥¤ à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à¦¾à¦‚à¦¬à¦¾à¦¦à¦¿à¦•à¦¤à¦¾à¦¯à¦¼ à¦¨à¦¤à§à¦¨ à¦¯à§à¦—à§‡à¦° à¦¸à§‚à¦šà¦¨à¦¾à¥¤'],
    ['à§¨à§¦à§§à§¬', 'à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦…à§à¦¯à¦¾à¦ª à¦²à¦žà§à¦šà¥¤ à¦¸à§à¦®à¦¾à¦°à§à¦Ÿà¦«à§‹à¦¨à§‡ à¦¸à¦‚à¦¬à¦¾à¦¦ à¦ªà¦¾à¦ à§‡à¦° à¦¨à¦¤à§à¦¨ à¦¯à§à¦—à¥¤'],
    ['à§¨à§¦à§§à§¯', 'à¦¦à¦¶ à¦¬à¦›à¦° à¦ªà§‚à¦°à§à¦¤à¦¿à¥¤ à¦ªà§à¦°à¦šà¦¾à¦° à¦¸à¦‚à¦–à§à¦¯à¦¾ à¦ªà¦¾à¦à¦š à¦²à¦¾à¦– à¦›à¦¾à¦¡à¦¼à¦¿à¦¯à¦¼à§‡ à¦¯à¦¾à¦¯à¦¼à¥¤'],
    ['à§¨à§¦à§¨à§¨', 'à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦¸à¦¾à¦¬à¦¸à§à¦•à§à¦°à¦¿à¦ªà¦¶à¦¨ à¦¸à§‡à¦¬à¦¾ à¦šà¦¾à¦²à§à¥¤ à¦…à¦¨à¦²à¦¾à¦‡à¦¨ à¦ªà¦¾à¦ à¦• à¦¸à¦‚à¦–à§à¦¯à¦¾ à¦à¦• à¦•à§‹à¦Ÿà¦¿ à¦›à¦¾à¦¡à¦¼à¦¿à¦¯à¦¼à§‡ à¦¯à¦¾à¦¯à¦¼à¥¤'],
    ['à§¨à§¦à§¨à§¬', 'à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦¸à¦°à§à¦¬à¦¾à¦§à¦¿à¦• à¦ªà¦ à¦¿à¦¤ à¦¨à¦¿à¦‰à¦œ à¦ªà§‹à¦°à§à¦Ÿà¦¾à¦² à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦¸à§à¦¬à§€à¦•à§ƒà¦¤à¦¿à¥¤'],
  ] : [
    ['2010', `${siteName} launched on January 1. First issue published under the editorship of Shahidul Islam.`],
    ['2013', 'Online edition launched. A new era of digital journalism begins.'],
    ['2016', 'Mobile app launched. A new era of reading news on smartphones.'],
    ['2019', 'Ten years completed. Circulation crosses five hundred thousand.'],
    ['2022', 'Digital subscription service launched. Online readers cross ten million.'],
    ['2026', `Recognized as Bangladesh's most read news portal.`],
  ];

  return (
    <div>
      <div className="about-hero">
        <h1>{t('about.hero_title', lang)}</h1>
        <p>{t('about.hero_desc', lang)}</p>
      </div>
      <div className="g-side">
        <div>
          <div className="sec" style={{ marginBottom: 18 }}>
            <div className="sec-hdr"><div className="sec-ttl">{t('about.history', lang)}</div></div>
            <div style={{ fontFamily: "'Kalpurush','SolaimanLipi',sans-serif", fontSize: 15, lineHeight: 1.9, color: '#2a2a2a' }}>
              <p style={{ marginBottom: 16 }}>{lang === 'bn' ? `${siteName} à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦à¦•à¦Ÿà¦¿ à¦¬à¦¾à¦‚à¦²à¦¾ à¦­à¦¾à¦·à¦¾à¦° à¦¦à§ˆà¦¨à¦¿à¦• à¦¸à¦‚à¦¬à¦¾à¦¦à¦ªà¦¤à§à¦°à¥¤ à¦à¦Ÿà¦¿ à§¨à§¦à§§à§¦ à¦¸à¦¾à¦²à§‡à¦° à§§ à¦œà¦¾à¦¨à§à¦¯à¦¼à¦¾à¦°à¦¿ à¦ªà§à¦°à¦¥à¦® à¦ªà§à¦°à¦•à¦¾à¦¶à¦¿à¦¤ à¦¹à¦¯à¦¼à¥¤ à¦¶à¦¹à§€à¦¦à§à¦² à¦‡à¦¸à¦²à¦¾à¦®à§‡à¦° à¦¸à¦®à§à¦ªà¦¾à¦¦à¦¨à¦¾à¦¯à¦¼ à¦à¦¬à¦‚ ${siteName} à¦®à¦¿à¦¡à¦¿à¦¯à¦¼à¦¾ à¦²à¦¿à¦®à¦¿à¦Ÿà§‡à¦¡à§‡à¦° à¦ªà§à¦°à¦•à¦¾à¦¶à¦¨à¦¾à¦¯à¦¼ à¦à¦‡ à¦ªà¦¤à§à¦°à¦¿à¦•à¦¾à¦Ÿà¦¿ à¦¬à¦°à§à¦¤à¦®à¦¾à¦¨à§‡ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦¸à¦°à§à¦¬à¦¾à¦§à¦¿à¦• à¦ªà§à¦°à¦šà¦¾à¦°à¦¿à¦¤ à¦¬à¦¾à¦‚à¦²à¦¾ à¦¦à§ˆà¦¨à¦¿à¦•à¥¤` : `${siteName} is a Bengali-language daily newspaper of Bangladesh. It was first published on January 1, 2010. Under the editorship of Shahidul Islam and published by ${siteName} Media Limited, this newspaper is currently the most widely circulated Bengali daily in Bangladesh.`}</p>
              <p style={{ marginBottom: 16 }}>{lang === 'bn' ? 'à¦ªà¦¤à§à¦°à¦¿à¦•à¦¾à¦Ÿà¦¿ à¦¸à¦¤à§à¦¯, à¦¨à¦¿à¦°à¦ªà§‡à¦•à§à¦·à¦¤à¦¾ à¦“ à¦ªà§‡à¦¶à¦¾à¦¦à¦¾à¦°à¦¿à¦¤à§à¦¬à§‡à¦° à¦¨à§€à¦¤à¦¿à¦¤à§‡ à¦ªà§à¦°à¦¤à¦¿à¦¦à¦¿à¦¨à§‡à¦° à¦¸à¦‚à¦¬à¦¾à¦¦ à¦ªà¦°à¦¿à¦¬à§‡à¦¶à¦¨ à¦•à¦°à§‡ à¦¥à¦¾à¦•à§‡à¥¤ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦ªà¦¾à¦¶à¦¾à¦ªà¦¾à¦¶à¦¿ à¦ªà¦¶à§à¦šà¦¿à¦®à¦¬à¦™à§à¦—à¦¸à¦¹ à¦¬à¦¿à¦¶à§à¦¬à§‡à¦° à¦¬à¦¿à¦­à¦¿à¦¨à§à¦¨ à¦¦à§‡à¦¶à§‡ à¦¬à¦¾à¦‚à¦²à¦¾à¦­à¦¾à¦·à§€ à¦ªà¦¾à¦ à¦•à¦¦à§‡à¦° à¦•à¦¾à¦›à§‡ à¦ªà¦¤à§à¦°à¦¿à¦•à¦¾à¦Ÿà¦¿ à¦¸à¦®à¦¾à¦¨à¦­à¦¾à¦¬à§‡ à¦œà¦¨à¦ªà§à¦°à¦¿à¦¯à¦¼à¥¤' : 'The newspaper delivers daily news based on the principles of truth, impartiality, and professionalism. Alongside Bangladesh, the newspaper is equally popular among Bengali-speaking readers in West Bengal and various countries around the world.'}</p>
              <p style={{ marginBottom: 16 }}>{lang === 'bn' ? `à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦ªà§à¦²à§à¦¯à¦¾à¦Ÿà¦«à¦°à§à¦®à§‡ ${siteName}à¦° à¦“à¦¯à¦¼à§‡à¦¬à¦¸à¦¾à¦‡à¦Ÿ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶à§‡à¦° à¦¸à¦°à§à¦¬à¦¾à¦§à¦¿à¦• à¦ªà¦ à¦¿à¦¤ à¦¬à¦¾à¦‚à¦²à¦¾ à¦¸à¦‚à¦¬à¦¾à¦¦ à¦ªà§‹à¦°à§à¦Ÿà¦¾à¦²à¥¤ à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦…à§à¦¯à¦¾à¦ª, à¦¸à§‹à¦¶à§à¦¯à¦¾à¦² à¦®à¦¿à¦¡à¦¿à¦¯à¦¼à¦¾ à¦“ à¦‡-à¦ªà§‡à¦ªà¦¾à¦°à§‡à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦ªà¦¾à¦ à¦•à¦¦à§‡à¦° à¦¸à¦™à§à¦—à§‡ à¦¨à¦¿à¦°à¦¨à§à¦¤à¦° à¦¯à§‹à¦—à¦¾à¦¯à§‹à¦— à¦¬à¦œà¦¾à¦¯à¦¼ à¦°à¦¾à¦–à§‡ ${siteName}à¥¤` : `On digital platforms, ${siteName}'s website is Bangladesh's most read Bengali news portal. ${siteName} maintains continuous communication with readers through mobile app, social media, and e-paper.`}</p>
            </div>
          </div>
          <div className="sec" style={{ marginBottom: 18 }}>
            <div className="sec-hdr"><div className="sec-ttl">{t('about.milestones', lang)}</div></div>
            {milestones.map(([year, text], i) => (
              <div key={i} className="milestone">
                <div className="year">{year}</div>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <div className="sec">
            <div className="sec-hdr"><div className="sec-ttl">{t('about.awards', lang)}</div></div>
            <div className="g2">
              {(lang === 'bn' ? [
                [<Icon name="trophy" size={28} />, 'à¦¶à§à¦°à§‡à¦·à§à¦  à¦¸à¦‚à¦¬à¦¾à¦¦à¦ªà¦¤à§à¦° à¦ªà§à¦°à¦¸à§à¦•à¦¾à¦° à§¨à§¦à§¨à§ª', 'à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶ à¦ªà§à¦°à§‡à¦¸ à¦‡à¦¨à¦¸à§à¦Ÿà¦¿à¦Ÿà¦¿à¦‰à¦Ÿ'],
                [<Icon name="medal" size={28} />, 'à¦¡à¦¿à¦œà¦¿à¦Ÿà¦¾à¦² à¦®à¦¿à¦¡à¦¿à¦¯à¦¼à¦¾ à¦…à§à¦¯à¦¾à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à§¨à§¦à§¨à§©', 'à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶ à¦…à§à¦¯à¦¾à¦¸à§‹à¦¸à¦¿à¦¯à¦¼à§‡à¦¶à¦¨ à¦…à¦¬ à¦œà¦¾à¦°à§à¦¨à¦¾à¦²à¦¿à¦¸à§à¦Ÿà¦¸'],
                [<Icon name="star" size={28} />, 'à¦¸à§‡à¦°à¦¾ à¦…à¦¨à¦²à¦¾à¦‡à¦¨ à¦¨à¦¿à¦‰à¦œà¦ªà§‹à¦°à§à¦Ÿà¦¾à¦² à§¨à§¦à§¨à§©', 'à¦†à¦‡à¦à¦¬à¦¿ à¦¬à¦¾à¦‚à¦²à¦¾à¦¦à§‡à¦¶'],
                [<Icon name="newspaper" size={20} />, 'à¦«à§à¦°à¦¿à¦¡à¦® à¦…à¦¬ à¦ªà§à¦°à§‡à¦¸ à¦…à§à¦¯à¦¾à¦“à¦¯à¦¼à¦¾à¦°à§à¦¡ à§¨à§¦à§¨à§¨', 'à¦†à¦°à¦à¦¸à¦à¦«'],
              ] : [
                [<Icon name="trophy" size={28} />, 'Best Newspaper Award 2024', 'Bangladesh Press Institute'],
                [<Icon name="medal" size={28} />, 'Digital Media Award 2023', 'Bangladesh Association of Journalists'],
                [<Icon name="star" size={28} />, 'Best Online News Portal 2023', 'IAB Bangladesh'],
                [<Icon name="newspaper" size={20} />, 'Freedom of Press Award 2022', 'RSF'],
              ]).map(([icon, title, org], i) => (
                <div key={i} style={{ background: 'var(--light-bg)', padding: 14, borderRadius: 3, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--red)' }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--lighter-text)' }}>{org}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <PageSidebar />
      </div>
    </div>
  );
}

