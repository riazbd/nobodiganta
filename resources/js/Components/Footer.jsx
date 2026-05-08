import Icon from './Icon';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';

const SocialLink = ({ href, label, icon, color }) => (
  <a className="ftr-soc" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{ background: color }}>
    <Icon name={icon} size={15} />
  </a>
);

export default function Footer() {
  const { lang, settings } = useApp();
  const { onNavigate } = useNavigation();
  const nav = (page, sub) => () => onNavigate(page, sub);

  const siteName = settings.site_name    || (lang === 'bn' ? 'নব দিগন্ত'            : 'Nobo Digonto');
  const tagline  = settings.site_tagline || (lang === 'bn' ? 'সঠিক সংবাদ সবার আগে' : 'Trusted News First');
  const logoUrl  = settings.site_logo    || null;
  const year     = new Date().getFullYear();

  const sections = [
    { slug: 'bangladesh',    bn: 'বাংলাদেশ',    en: 'Bangladesh'    },
    { slug: 'international', bn: 'আন্তর্জাতিক', en: 'International' },
    { slug: 'economy',       bn: 'অর্থনীতি',    en: 'Economy'       },
    { slug: 'sports',        bn: 'খেলাধুলা',    en: 'Sports'        },
    { slug: 'entertainment', bn: 'বিনোদন',       en: 'Entertainment' },
    { slug: 'technology',    bn: 'প্রযুক্তি',   en: 'Technology'    },
    { slug: 'opinion',       bn: 'মতামত',        en: 'Opinion'       },
  ];

  const services = [
    { page: 'archive', bn: 'আর্কাইভ',       en: 'Archive'       },
    { page: 'gallery', bn: 'ফটো গ্যালারি',  en: 'Photo Gallery' },
    { page: 'video',   bn: 'ভিডিও',          en: 'Video'         },
    { page: 'epaper',  bn: 'ই-পেপার',         en: 'E-Paper'       },
    { page: 'jobs',    bn: 'চাকরি',           en: 'Jobs'          },
  ];

  const institution = [
    { page: 'about',   bn: 'আমাদের সম্পর্কে', en: 'About Us'  },
    { page: 'contact', bn: 'যোগাযোগ',          en: 'Contact'   },
    { page: 'contact', bn: 'বিজ্ঞাপন',          en: 'Advertise' },
    { page: 'contact', bn: 'ক্যারিয়ার',        en: 'Career'    },
  ];

  return (
    <footer id="footer" className="ftr">

      {/* ── Top accent line ── */}
      <div className="ftr-accent" />

      {/* ── Main body ── */}
      <div className="ftr-body">
        <div className="ftr-inner">

          {/* Brand */}
          <div className="ftr-brand">
            <div className="ftr-logo" onClick={nav('home')} role="link" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onNavigate('home')}>
              {logoUrl
                ? <img src={logoUrl} alt={siteName} className="ftr-logo-img" />
                : <span className="ftr-logo-name">{siteName}</span>}
            </div>
            <p className="ftr-tagline">{tagline}</p>
            <p className="ftr-desc">
              {settings.meta_description || (lang === 'bn'
                ? 'বাংলাদেশের বিশ্বস্ত অনলাইন সংবাদ পোর্টাল। দেশ ও বিশ্বের সর্বশেষ সংবাদ সবার আগে পড়ুন।'
                : "Bangladesh's trusted online news portal. Stay informed with the latest national and international news."
              )}
            </p>
            <div className="ftr-socials">
              <SocialLink href={settings.facebook_url  || '#'} label="Facebook"  icon="facebook"  color="#1877f2" />
              <SocialLink href={settings.twitter_url   || '#'} label="X/Twitter" icon="twitter"   color="#14171a" />
              <SocialLink href={settings.youtube_url   || '#'} label="YouTube"   icon="youtube"   color="#ff0000" />
              <SocialLink href={settings.instagram_url || '#'} label="Instagram" icon="instagram" color="#e1306c" />
            </div>
          </div>

          {/* Sections */}
          <div className="ftr-col">
            <h4 className="ftr-col-hd">{lang === 'bn' ? 'বিভাগসমূহ' : 'Sections'}</h4>
            <ul className="ftr-links">
              {sections.map(s => (
                <li key={s.slug}><a onClick={nav('cat', s.slug)}>{lang === 'bn' ? s.bn : s.en}</a></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="ftr-col">
            <h4 className="ftr-col-hd">{lang === 'bn' ? 'সেবাসমূহ' : 'Services'}</h4>
            <ul className="ftr-links">
              {services.map(s => (
                <li key={s.bn}><a onClick={nav(s.page)}>{lang === 'bn' ? s.bn : s.en}</a></li>
              ))}
            </ul>
          </div>

          {/* Institution + Legal */}
          <div className="ftr-col">
            <h4 className="ftr-col-hd">{lang === 'bn' ? 'প্রতিষ্ঠান' : 'Institution'}</h4>
            <ul className="ftr-links">
              {institution.map(s => (
                <li key={s.bn}><a onClick={nav(s.page)}>{lang === 'bn' ? s.bn : s.en}</a></li>
              ))}
            </ul>

            {/* Legal notice — Bangladesh Press Council requirement */}
            <div className="ftr-legal">
              <div className="ftr-legal-row">
                <span className="ftr-legal-lbl">{lang === 'bn' ? 'সম্পাদক' : 'Editor'}</span>
                <span>{lang === 'bn' ? (settings.editor_name_bn || 'মোহাম্মদ রহমান') : (settings.editor_name_en || 'Mohammad Rahman')}</span>
              </div>
              <div className="ftr-legal-row">
                <span className="ftr-legal-lbl">{lang === 'bn' ? 'প্রকাশক' : 'Publisher'}</span>
                <span>{lang === 'bn' ? (settings.publisher_name_bn || 'প্রভাতা মিডিয়া লিমিটেড') : (settings.publisher_name_en || 'Provati Media Ltd.')}</span>
              </div>
              <div className="ftr-legal-addr">
                {lang === 'bn' ? (settings.office_address_bn || '১২৩, মতিঝিল, ঢাকা-১০০০') : (settings.office_address_en || '123, Motijheel, Dhaka-1000')}
              </div>
              <div className="ftr-legal-row">
                <span className="ftr-legal-lbl">{lang === 'bn' ? 'নিবন্ধন' : 'Reg'}</span>
                <span>{lang === 'bn' ? (settings.reg_number_bn || 'বিএনপিসি-২০২৪-০০১২৩') : (settings.reg_number_en || 'BNPC-2024-00123')}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="ftr-bottom">
        <div className="ftr-inner ftr-bottom-inner">
          <span className="ftr-copy">
            © {year} {siteName}. {lang === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
          </span>
          <div className="ftr-bottom-links">
            <a href="/privacy">{lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</a>
            <span className="ftr-sep">|</span>
            <a href="/terms">{lang === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms of Use'}</a>
            <span className="ftr-sep">|</span>
            <a onClick={nav('about')}>{lang === 'bn' ? 'সাইটম্যাপ' : 'Sitemap'}</a>
          </div>
        </div>
      </div>

    </footer>
  );
}
