import { useApp } from '../../contexts/AppContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { getAvatarImage } from '../../helpers/images';

export default function AuthorBio({ article }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  if (!article || !article.author) return null;

  const author = article.author;
  const isObject = typeof author === 'object' && author !== null;

  const isGuest = isObject ? author.is_guest : false;
  const name = isObject ? author.name : author;
  const designation = isObject ? author.designation : article.authorDesg;
  const bio = isObject ? author.bio : null;
  const image = isObject ? author.image : null;
  const slug = isObject ? author.slug : (article.authorId || name);

  if (!name) return null;

  return (
    <div className="author-bio" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '24px', background: 'var(--body-bg, #f0f2f8)', borderRadius: 16, margin: '32px 0', border: '1px solid #e8ebf4' }}>
      <img
        src={getAvatarImage(image || name)}
        alt={name}
        style={{ width: 64, height: 64, borderRadius: 16, objectFit: 'cover', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      />
      <div>
        <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--black)', marginBottom: 2 }}>{name}</div>
        {designation && (
          <div style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{designation}</div>
        )}
        {bio && (
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 12 }}>{bio}</p>
        )}
        {!isGuest && slug && (
          <button
            onClick={() => onNavigate('author', slug)}
            style={{ fontSize: 13, color: '#0055a5', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
          >
            {lang === 'bn' ? 'সব লেখা দেখুন →' : 'View all articles →'}
          </button>
        )}
      </div>
    </div>
  );
}
