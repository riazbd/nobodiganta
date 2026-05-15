import Icon from './Icon';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { toBengaliNum } from '../lib/formatters';

const SocialLink = ({ href, label, icon, color }) => (
  <a className="ftr-soc" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{ background: color }}>
    <Icon name={icon} size={15} />
  </a>
);

export default function Footer() {
  const { lang, settings } = useApp();
  const { onNavigate } = useNavigation();
  const nav = (page, sub) => () => onNavigate(page, sub);
  const yearRaw = new Date().getFullYear();
  const year = lang === 'bn' ? toBengaliNum(String(yearRaw)) : String(yearRaw);

  const siteName = lang === 'bn'
    ? (settings.site_name    || 'নব দিগন্ত')
    : (settings.site_name_en || settings.site_name || 'Nobo Digonto');
  const tagline  = settings.site_tagline || (lang === 'bn' ? 'সঠিক সংবাদ সবার আগে' : 'Trusted News First');
  const logoUrl  = settings.site_logo    || null;
  const metaDesc = lang === 'bn'
    ? (settings.meta_description    || 'নব দিগন্ত বাংলাদেশের অন্যতম শীর্ষস্থানীয় অনলাইন সংবাদ মাধ্যম।')
    : (settings.meta_description_en || "Nobo Digonto is one of Bangladesh's leading online news portals.");
  const copyrightOwner = lang === 'bn'
    ? (settings.copyright_owner_bn || settings.site_name || 'নব দিগন্ত')
    : (settings.copyright_owner_en || settings.site_name_en || 'Nobo Digonto');
  const copyrightNotice = lang === 'bn'
    ? (settings.copyright_notice_bn || 'এই ওয়েবসাইটের কোনো লেখা বা ছবি অনুমতি ছাড়া নকল করা বা অন্য কোথাও প্রকাশ করা সম্পূর্ণ বেআইনি।')
    : (settings.copyright_notice_en || 'Unauthorised reproduction of content or images from this website is strictly prohibited.');

  const institution = [
    { page: 'about',   bn: 'আমাদের সম্পর্কে', en: 'About Us'  },
    { page: 'contact', bn: 'যোগাযোগ',          en: 'Contact'   },
    { page: 'contact', bn: 'বিজ্ঞাপন',          en: 'Advertise' },
  ];

  const bdAddress = lang === 'bn' ? (settings.office_address_bn || '') : (settings.office_address_en || '');
  const ukAddress = lang === 'bn' ? (settings.office_address_uk_bn || '') : (settings.office_address_uk_en || '');

  return (
    <footer id="footer" className="ftr">

      {/* ── Animated ocean wave ── */}
      <div className="ftr-wave">
        <svg
          className="ftr-wave-svg"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="ftr-wave-shape"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="ftr-wave-parallax">
            <use xlinkHref="#ftr-wave-shape" x="48" y="0" fill="rgba(240,242,245,0.4)" />
            <use xlinkHref="#ftr-wave-shape" x="48" y="3" fill="rgba(232,234,238,0.6)" />
            <use xlinkHref="#ftr-wave-shape" x="48" y="5" fill="rgba(220,224,230,0.8)" />
            <use xlinkHref="#ftr-wave-shape" x="48" y="7" fill="#f0f2f5" />
          </g>
        </svg>
      </div>

      {/* ── Top section: description + links ── */}
      <div className="ftr-top">
        <div className="ftr-inner ftr-top-inner">

          {/* Description */}
          <div className="ftr-brand">
            <p className="ftr-desc">
              {metaDesc}
            </p>
          </div>

          {/* Institution links */}
          <div className="ftr-col">
            <h4 className="ftr-col-hd">{lang === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}</h4>
            <ul className="ftr-links">
              {institution.map(s => (
                <li key={s.bn}><a onClick={nav(s.page)}>{lang === 'bn' ? s.bn : s.en}</a></li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="ftr-col">
            <h4 className="ftr-col-hd">{lang === 'bn' ? 'নীতিমালা' : 'Policies'}</h4>
            <ul className="ftr-links">
              <li><a onClick={nav('privacy')}>{lang === 'bn' ? 'গোপনীয়তার নীতি' : 'Privacy Policy'}</a></li>
              <li><a onClick={nav('terms')}>{lang === 'bn' ? 'শর্তাবলি' : 'Terms of Use'}</a></li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Divider ── */}
      <div className="ftr-divider" />

      {/* ── Bottom section: office | editor | logo+socials ── */}
      <div className="ftr-bottom-body">
        <div className="ftr-inner ftr-bottom-grid">

          {/* Office / Contact */}
          <div className="ftr-info-col">
            <h4 className="ftr-info-hd">{lang === 'bn' ? 'অফিস:' : 'Office:'}</h4>
            {bdAddress && (
              <p className="ftr-info-text">
                <span className="ftr-info-lbl">{lang === 'bn' ? 'বাংলাদেশ:' : 'Bangladesh:'}</span> {bdAddress}
              </p>
            )}
            {ukAddress && (
              <p className="ftr-info-text">
                <span className="ftr-info-lbl">{lang === 'bn' ? 'যুক্তরাজ্য:' : 'UK:'}</span> {ukAddress}
              </p>
            )}
            {settings.contact_email && (
              <p className="ftr-info-text">
                {lang === 'bn' ? 'ইমেইল:' : 'Email:'} {settings.contact_email}
              </p>
            )}
            {settings.contact_phone && (
              <p className="ftr-info-text">
                {lang === 'bn' ? 'ফোন:' : 'Phone:'} {settings.contact_phone}
              </p>
            )}
            {settings.contact_phone_2 && (
              <p className="ftr-info-text">
                {lang === 'bn' ? 'বার্তা ও বিজ্ঞাপন:' : 'News & Ads:'} {settings.contact_phone_2}
              </p>
            )}
          </div>

          {/* Editor / Legal */}
          <div className="ftr-info-col">
            <h4 className="ftr-info-hd">{lang === 'bn' ? 'সম্পাদক:' : 'Editor:'}</h4>
            {(settings.editor_name_bn || settings.editor_name_en) && (
              <p className="ftr-info-text">
                <span className="ftr-info-lbl">{lang === 'bn' ? 'সম্পাদক:' : 'Editor:'}</span>{' '}
                {lang === 'bn' ? settings.editor_name_bn : settings.editor_name_en}
              </p>
            )}
            {(settings.executive_editor_name_bn || settings.executive_editor_name_en) && (
              <p className="ftr-info-text">
                <span className="ftr-info-lbl">{lang === 'bn' ? 'নির্বাহী সম্পাদক:' : 'Executive Editor:'}</span>{' '}
                {lang === 'bn' ? settings.executive_editor_name_bn : settings.executive_editor_name_en}
              </p>
            )}
            {(settings.ceo_name_bn || settings.ceo_name_en) && (
              <p className="ftr-info-text">
                <span className="ftr-info-lbl">{lang === 'bn' ? 'প্রধান নির্বাহী:' : 'CEO:'}</span>{' '}
                {lang === 'bn' ? settings.ceo_name_bn : settings.ceo_name_en}
              </p>
            )}
            {(settings.publisher_name_bn || settings.publisher_name_en) && (
              <p className="ftr-info-text">
                <span className="ftr-info-lbl">{lang === 'bn' ? 'প্রকাশক:' : 'Publisher:'}</span>{' '}
                {lang === 'bn' ? settings.publisher_name_bn : settings.publisher_name_en}
              </p>
            )}
            {(settings.reg_number_bn || settings.reg_number_en) && (
              <p className="ftr-info-text">
                <span className="ftr-info-lbl">{lang === 'bn' ? 'নিবন্ধন:' : 'Reg:'}</span>{' '}
                {lang === 'bn' ? settings.reg_number_bn : settings.reg_number_en}
              </p>
            )}
          </div>

          {/* Logo + Follow + Socials */}
          <div className="ftr-info-col ftr-logo-col">
            <div className="ftr-logo" onClick={nav('home')} role="link" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onNavigate('home')}>
              {logoUrl
                ? <img src={logoUrl} alt={siteName} className="ftr-logo-img" />
                : <span className="ftr-logo-name">{siteName}</span>}
            </div>
            <p className="ftr-follow-text">
              {lang === 'bn' ? `ফলো করুন ${siteName} -এর সকল খবর` : `Follow ${siteName} for all updates`}
            </p>
            <div className="ftr-socials">
              {settings.facebook_url  && <SocialLink href={settings.facebook_url}  label="Facebook"  icon="facebook"  color="#1877f2" />}
              {settings.twitter_url   && <SocialLink href={settings.twitter_url}   label="X/Twitter" icon="twitter"   color="#14171a" />}
              {settings.youtube_url   && <SocialLink href={settings.youtube_url}   label="YouTube"   icon="youtube"   color="#ff0000" />}
              {settings.instagram_url && <SocialLink href={settings.instagram_url} label="Instagram" icon="instagram" color="#e1306c" />}
            </div>
          </div>

        </div>
      </div>

      {/* ── Copyright bar ── */}
      <div className="ftr-copy-bar">
        <div className="ftr-inner ftr-copy-inner">
          <div>
            <div className="ftr-copy">© {copyrightOwner} {year}</div>
            <div className="ftr-copy-notice">{copyrightNotice}</div>
          </div>
          <div className="ftr-bottom-links">
            <a onClick={nav('privacy')}>{lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}</a>
            <span className="ftr-sep">|</span>
            <a onClick={nav('terms')}>{lang === 'bn' ? 'শর্তাবলী' : 'Terms of Use'}</a>
          </div>
        </div>
      </div>

    </footer>
  );
}
