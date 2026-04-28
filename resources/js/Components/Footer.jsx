import { t } from '../translations';
import Icon from './Icon';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';

export default function Footer() {
  const { lang, settings } = useApp();
  const { onNavigate } = useNavigation();

  const nav = (page, sub) => () => onNavigate(page, sub);

  const siteName = settings.site_name || (lang === 'bn' ? 'নব দিগন্ত' : 'Nobo Digonto');
  const facebookUrl = settings.facebook_url || 'https://facebook.com';
  const twitterUrl = settings.twitter_url || 'https://twitter.com';
  const youtubeUrl = settings.youtube_url || 'https://youtube.com';

  return (
    <footer id="footer">
      <div className="wrap">
        <div className="ft-grid">
          <div className="ft-brand">
            <div className="name" onClick={nav('home')} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}>
              {siteName}
            </div>
            <p>{settings.meta_description || t('footer.desc', lang)}</p>
            <div className="ft-social">
              <a
                className="soc-btn s-fb"
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Icon name="facebook" size={14} />
              </a>
              <a
                className="soc-btn s-tw"
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Icon name="twitter" size={14} />
              </a>
              <a
                className="soc-btn s-yt"
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Icon name="youtube" size={14} />
              </a>
            </div>
          </div>

          <div className="ft-col">
            <h4>{t('footer.sections', lang)}</h4>
            <ul>
              <li><a onClick={nav('cat', 'bangladesh')}>{t('nav.bangladesh', lang)}</a></li>
              <li><a onClick={nav('cat', 'international')}>{t('nav.international', lang)}</a></li>
              <li><a onClick={nav('cat', 'economy')}>{t('nav.economy', lang)}</a></li>
              <li><a onClick={nav('cat', 'sports')}>{t('nav.sports', lang)}</a></li>
              <li><a onClick={nav('cat', 'entertainment')}>{t('nav.entertainment', lang)}</a></li>
              <li><a onClick={nav('cat', 'opinion')}>{t('nav.opinion', lang)}</a></li>
              <li><a onClick={nav('regional')}>{lang === 'bn' ? 'সারাদেশ' : 'Regional'}</a></li>
            </ul>
          </div>

          <div className="ft-col">
            <h4>{t('footer.services', lang)}</h4>
            <ul>
              <li><a onClick={nav('archive')}>{t('topbar.archive', lang)}</a></li>
              <li><a onClick={nav('gallery')}>{t('nav.gallery', lang)}</a></li>
              <li><a onClick={nav('video')}>{t('nav.video', lang)}</a></li>
            </ul>
          </div>

          <div className="ft-col">
            <h4>{t('footer.institution', lang)}</h4>
            <ul>
              <li><a onClick={nav('about')}>{t('topbar.about', lang)}</a></li>
              <li><a onClick={nav('contact')}>{t('topbar.advertise', lang)}</a></li>
              <li><a onClick={nav('contact')}>{t('topbar.contact', lang)}</a></li>
              <li><a onClick={nav('jobs')}>{lang === 'bn' ? 'ক্যারিয়ার' : 'Career'}</a></li>
            </ul>
            {/* Legal information (Bangladesh Press Council requirement) */}
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 12, lineHeight: 1.7 }}>
              <div>{lang === 'bn' ? `সম্পাদক: ${settings.editor_name_bn || 'মোহাম্মদ রহমান'}` : `Editor: ${settings.editor_name_en || 'Mohammad Rahman'}`}</div>
              <div>{lang === 'bn' ? `প্রকাশক: ${settings.publisher_name_bn || 'প্রভাতা মিডিয়া লিমিটেড'}` : `Publisher: ${settings.publisher_name_en || 'Provati Media Ltd.'}`}</div>
              <div>{lang === 'bn' ? (settings.office_address_bn || '১২৩, মতিঝিল, ঢাকা-১০০০') : (settings.office_address_en || '123, Motijheel, Dhaka-1000')}</div>
              <div>{lang === 'bn' ? `নিবন্ধন: ${settings.reg_number_bn || 'বিএনপিসি-২০২৪-০০১২৩'}` : `Reg: ${settings.reg_number_en || 'BNPC-2024-00123'}`}</div>
            </div>
          </div>

        </div>
      </div>

      <div className="ft-bottom">
        <span>{t('footer.copyright', lang).replace('নবদিগন্ত', siteName).replace('NoboDiganta', siteName)}</span>
        <span style={{ margin: '0 12px', color: '#666' }}>|</span>
        <a href="/privacy" style={{ color: '#999', fontSize: 12 }}>
          {lang === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
        </a>
        <span style={{ margin: '0 8px', color: '#666' }}>|</span>
        <a href="/terms" style={{ color: '#999', fontSize: 12 }}>
          {lang === 'bn' ? 'শর্তাবলী' : 'Terms of Service'}
        </a>
      </div>
    </footer>
  );
}
