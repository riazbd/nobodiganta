import { useApp } from '../../contexts/AppContext';
import { toBengaliNum } from '../../lib/formatters';

export default function Pagination({ meta, onPageChange }) {
  const { lang } = useApp();
  if (!meta || meta.lastPage <= 1) return null;

  const { currentPage, lastPage } = meta;

  const pages = [];
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || Math.abs(i - currentPage) <= 2) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  const label = (n) => lang === 'bn' ? toBengaliNum(String(n)) : String(n);

  return (
    <nav className="pagination" aria-label={lang === 'bn' ? 'পৃষ্ঠা নেভিগেশন' : 'Page navigation'}>
      <button
        className="pag-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label={lang === 'bn' ? 'আগের পৃষ্ঠা' : 'Previous page'}
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e-${i}`} className="pag-ellipsis">…</span>
          : <button
              key={p}
              className={`pag-btn ${p === currentPage ? 'active' : ''}`}
              onClick={() => p !== currentPage && onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {label(p)}
            </button>
      )}
      <button
        className="pag-btn"
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label={lang === 'bn' ? 'পরের পৃষ্ঠা' : 'Next page'}
      >
        ›
      </button>
    </nav>
  );
}
