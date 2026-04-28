import { t } from '../translations';
import Icon from '../Components/Icon';
import PageSidebar from '../Components/PageSidebar';
import { useApp } from '../contexts/AppContext';

export default function About() {
  const { lang, settings } = useApp();
  const siteName = settings.site_name || (lang === 'bn' ? 'নব দিগন্ত' : 'Nobo Digonto');
  
  const milestones = lang === 'bn' ? [
    ['২০১০', `${siteName}র যাত্রা শুরু ১ জানুয়ারি। শহীদুল ইসলামের সম্পদনায় প্রথম সংখ্যা প্রকাশিত হয়।`],
    ['২০১৩', 'অনলাইন সংস্করণ চালু। ডিজিটাল সাংবাদিকতায় নতুন যুগের সূচনা।'],
    ['২০১৬', 'মোবাইল অ্যাপ লঞ্চ। স্মার্টফোনে সংবাদ পাঠের নতুন যুগ।'],
    ['২০১৯', 'দশ বছর পূর্তি। প্রচার সংখ্যা পাঁচ লাখ ছাড়িয়ে যায়।'],
    ['২০২২', 'ডিজিটাল সাবস্ক্রিপশন সেবা চালু। অনলাইন পাঠক সংখ্যা এক কোটি ছাড়িয়ে যায়।'],
    ['২০২৬', 'বাংলাদেশের সর্বাধিক পঠিত নিউজ পোর্টাল হিসেবে স্বীকৃতি।'],
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
            <div style={{ fontFamily: "'Noto Serif Bengali', serif", fontSize: 15, lineHeight: 1.9, color: '#2a2a2a' }}>
              <p style={{ marginBottom: 16 }}>{lang === 'bn' ? `${siteName} বাংলাদেশের একটি বাংলা ভাষার দৈনিক সংবাদপত্র। এটি ২০১০ সালের ১ জানুয়ারি প্রথম প্রকাশিত হয়। শহীদুল ইসলামের সম্পাদনায় এবং ${siteName} মিডিয়া লিমিটেডের প্রকাশনায় এই পত্রিকাটি বর্তমানে বাংলাদেশের সর্বাধিক প্রচারিত বাংলা দৈনিক।` : `${siteName} is a Bengali-language daily newspaper of Bangladesh. It was first published on January 1, 2010. Under the editorship of Shahidul Islam and published by ${siteName} Media Limited, this newspaper is currently the most widely circulated Bengali daily in Bangladesh.`}</p>
              <p style={{ marginBottom: 16 }}>{lang === 'bn' ? 'পত্রিকাটি সত্য, নিরপেক্ষতা ও পেশাদারিত্বের নীতিতে প্রতিদিনের সংবাদ পরিবেশন করে থাকে। বাংলাদেশের পাশাপাশি পশ্চিমবঙ্গসহ বিশ্বের বিভিন্ন দেশে বাংলাভাষী পাঠকদের কাছে পত্রিকাটি সমানভাবে জনপ্রিয়।' : 'The newspaper delivers daily news based on the principles of truth, impartiality, and professionalism. Alongside Bangladesh, the newspaper is equally popular among Bengali-speaking readers in West Bengal and various countries around the world.'}</p>
              <p style={{ marginBottom: 16 }}>{lang === 'bn' ? `ডিজিটাল প্ল্যাটফর্মে ${siteName}র ওয়েবসাইট বাংলাদেশের সর্বাধিক পঠিত বাংলা সংবাদ পোর্টাল। মোবাইল অ্যাপ, সোশ্যাল মিডিয়া ও ই-পেপারের মাধ্যমে পাঠকদের সঙ্গে নিরন্তর যোগাযোগ বজায় রাখে ${siteName}।` : `On digital platforms, ${siteName}'s website is Bangladesh's most read Bengali news portal. ${siteName} maintains continuous communication with readers through mobile app, social media, and e-paper.`}</p>
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
                [<Icon name="trophy" size={28} />, 'শ্রেষ্ঠ সংবাদপত্র পুরস্কার ২০২৪', 'বাংলাদেশ প্রেস ইনস্টিটিউট'],
                [<Icon name="medal" size={28} />, 'ডিজিটাল মিডিয়া অ্যাওয়ার্ড ২০২৩', 'বাংলাদেশ অ্যাসোসিয়েশন অব জার্নালিস্টস'],
                [<Icon name="star" size={28} />, 'সেরা অনলাইন নিউজপোর্টাল ২০২৩', 'আইএবি বাংলাদেশ'],
                [<Icon name="newspaper" size={20} />, 'ফ্রিডম অব প্রেস অ্যাওয়ার্ড ২০২২', 'আরএসএফ'],
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
