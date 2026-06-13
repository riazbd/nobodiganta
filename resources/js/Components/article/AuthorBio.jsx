import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { t } from '../../translations';

export default function AuthorBio({ article }) {
  const { lang, settings } = useApp();
  const { onNavigate } = useNavigation();

  if (!article?.author) return null;

  const author = article.author;
  const name = author.name;
  const designation = author.designation || t('article.staff_reporter', lang);
  const bio = author.bio;
  const slug = author.slug;
  const isGuest = author.is_guest;

  if (!name) return null;

  return (
    <div style={{
      margin: '32px 0 8px',
      borderTop: '3px solid var(--red)',
      background: '#fff',
      border: '1px solid #e8e8e8',
      borderTopColor: 'var(--red)',
      borderTopWidth: 3,
    }}>
      {/* Header label */}
      <div style={{
        padding: '8px 20px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--red)',
          fontFamily: 'sans-serif',
        }}>
          {t('article.author_bio', lang)}
        </span>
      </div>

      {/* Author info */}
      <div style={{ display: 'flex', gap: 20, padding: '18px 20px', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{ flexShrink: 0 }}>
          <img
            src={settings?.site_logo || '/logo.png'}
            alt={name}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #eee',
              display: 'block',
            }}
          />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{
              fontFamily: 'SolaimanLipi, sans-serif',
              fontSize: 18,
              fontWeight: 800,
              color: '#111',
              lineHeight: 1.3,
            }}>
              {designation}
            </span>
          </div>

          {bio && (
            <p style={{
              fontFamily: 'SolaimanLipi, sans-serif',
              fontSize: 15,
              color: '#555',
              lineHeight: 1.7,
              margin: '0 0 12px',
            }}>
              {bio}
            </p>
          )}

          {!isGuest && slug && (
            <button
              onClick={() => onNavigate('author', slug)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                background: 'var(--red)',
                border: 'none',
                borderRadius: 2,
                padding: '5px 14px',
                cursor: 'pointer',
                fontFamily: 'SolaimanLipi, sans-serif',
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {t('article.view_all_by', lang)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
