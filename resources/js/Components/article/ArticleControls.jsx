import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import Icon from '../Icon';

/**
 * Font size / dark mode / print / bookmark controls for the article page.
 */
export default function ArticleControls({ articleId, articleTitle }) {
  const { lang, fontSize, setFontSize: setFontSizeExplicit } = useApp();
  const { showToast } = useToast();

  const SIZES = ['small', 'normal', 'large'];
  const LABELS = { small: 'A-', normal: 'A', large: 'A+' };

  const bookmarkKey = 'pa_bookmarks';
  const isBookmarked = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(bookmarkKey) || '[]');
      return saved.some((b) => b.id === articleId);
    } catch { return false; }
  };

  const toggleBookmark = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(bookmarkKey) || '[]');
      const exists = saved.some((b) => b.id === articleId);
      const updated = exists
        ? saved.filter((b) => b.id !== articleId)
        : [...saved, { id: articleId, title: articleTitle, saved: Date.now() }];
      localStorage.setItem(bookmarkKey, JSON.stringify(updated));
      showToast(exists
        ? (lang === 'bn' ? 'বুকমার্ক সরানো হয়েছে' : 'Bookmark removed')
        : (lang === 'bn' ? 'বুকমার্ক যোগ হয়েছে!' : 'Bookmarked!'));
    } catch {}
  };

  const handlePrint = () => window.print();

  const bookmarked = isBookmarked();

  return (
    <div className="article-controls" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
      {/* Font size controls */}
      <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
        {SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setFontSizeExplicit(size)}
            aria-label={`${lang === 'bn' ? 'ফন্ট সাইজ' : 'Font size'} ${LABELS[size]}`}
            aria-pressed={fontSize === size}
            style={{
              padding: '5px 10px',
              border: 'none',
              borderRight: size !== 'large' ? '1px solid var(--border-color)' : 'none',
              background: fontSize === size ? '#c00' : 'var(--surface)',
              color: fontSize === size ? '#fff' : 'var(--text-color)',
              cursor: 'pointer',
              fontSize: size === 'small' ? 12 : size === 'large' ? 16 : 14,
              fontWeight: 600,
            }}
          >
            {LABELS[size]}
          </button>
        ))}
      </div>

      {/* Bookmark */}
      <button
        onClick={toggleBookmark}
        aria-label={lang === 'bn' ? 'বুকমার্ক করুন' : 'Bookmark'}
        aria-pressed={bookmarked}
        style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: 4, background: bookmarked ? 'var(--tint-hover)' : 'var(--surface)', color: bookmarked ? '#c00' : 'var(--text-color)', cursor: 'pointer', fontSize: 16 }}
      >
        {bookmarked ? '🔖' : '🔖'}
      </button>

      {/* Print */}
      <button
        onClick={handlePrint}
        aria-label={lang === 'bn' ? 'প্রিন্ট করুন' : 'Print article'}
        style={{ padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: 4, background: 'var(--surface)', color: 'var(--text-color)', cursor: 'pointer', fontSize: 16 }}
      >
        🖨️
      </button>
    </div>
  );
}
