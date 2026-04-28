import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

/**
 * Reusable pagination component with page numbers, per-page selector, and smart ellipsis.
 *
 * @param {Object} props
 * @param {Object} props.meta - Laravel paginator meta (from, to, total, per_page, current_page, last_page)
 * @param {Array}  props.links - Laravel paginator links array
 * @param {Function} props.onPageChange - Callback when page changes (pageNumber)
 * @param {Function} [props.onPerPageChange] - Callback when per-page changes (perPage)
 * @param {Array}  [props.perPageOptions] - Available per-page options (default: [10, 15, 25, 50, 100])
 * @param {string} [props.className] - Additional wrapper classes
 */
export function Pagination({ meta, links, onPageChange, onPerPageChange, perPageOptions = [10, 15, 25, 50, 100], className = '' }) {
  const { t } = useLanguage();

  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const total = meta?.total || 0;
  const from = meta?.from || 0;
  const to = meta?.to || 0;
  const perPage = meta?.per_page || 15;

  // Always show pagination — even for single page, show info + per-page selector

  // Build smart page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (lastPage <= maxVisible + 2) {
      // Show all pages
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(lastPage - 1, currentPage + 1);

      // Adjust if we're near the start
      if (currentPage <= 3) {
        start = 2;
        end = 5;
      }

      // Adjust if we're near the end
      if (currentPage >= lastPage - 2) {
        start = lastPage - 4;
        end = lastPage - 1;
      }

      // Add ellipsis before range
      if (start > 2) pages.push('...');

      // Add range pages
      for (let i = start; i <= end; i++) pages.push(i);

      // Add ellipsis after range
      if (end < lastPage - 1) pages.push('...');

      // Always show last page
      pages.push(lastPage);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page) => {
    if (page !== '...' && page >= 1 && page <= lastPage) {
      // Prefer explicit onPageChange callback
      if (onPageChange) {
        onPageChange(page);
      } else {
        // Fallback: use Laravel's links array for URL-based navigation
        const link = links.find(l => l.label === String(page) || (l.active && l.url));
        if (link?.url) window.location.href = link.url;
      }
    }
  };

  const handleFirstPage = () => handlePageClick(1);
  const handleLastPage = () => handlePageClick(lastPage);
  const handlePrevPage = () => handlePageClick(currentPage - 1);
  const handleNextPage = () => handlePageClick(currentPage + 1);

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-t border-[#f3f4f6] ${className}`}>
      {/* Left: Info + Per Page */}
      <div className="flex items-center gap-3">
        <div className="text-[12.5px] text-[var(--text-muted,#9ca3af)]">
          {t('showing')} <span className="font-semibold text-[var(--text-primary,#1a1d2e)]">{from}–{to}</span> {t('of')} <span className="font-semibold text-[var(--text-primary,#1a1d2e)]">{total.toLocaleString()}</span>
        </div>
        {onPerPageChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11.5px] text-[var(--text-muted,#9ca3af)] whitespace-nowrap">{t('perPage') || 'Per page'}</span>
            <select
              value={perPage}
              onChange={(e) => {
                const newPerPage = parseInt(e.target.value);
                onPerPageChange(newPerPage, 1);
              }}
              className="border border-[var(--card-border,#e8ebf4)] rounded-md px-2.5 py-1 pr-7 text-[12px] outline-none bg-white focus:border-[#e8001e] focus:ring-1 focus:ring-[#e8001e]/20 cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
            >
              {perPageOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={handleFirstPage}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-[var(--card-border,#e8ebf4)] bg-white text-[var(--text-muted,#9ca3af)] hover:bg-gray-50 hover:text-[var(--text-primary,#1a1d2e)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          title={t('firstPage') || 'First page'}
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md border border-[var(--card-border,#e8ebf4)] bg-white text-[var(--text-muted,#9ca3af)] hover:bg-gray-50 hover:text-[var(--text-primary,#1a1d2e)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          title={t('previousPage') || 'Previous page'}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-0.5 mx-1">
          {pageNumbers.map((page, i) =>
            page === '...' ? (
              <span key={`ellipsis-${i}`} className="px-1.5 py-1 text-[12px] text-[var(--text-muted,#9ca3af)] select-none">
                ···
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageClick(page)}
                className={`min-w-[32px] h-8 rounded-md text-[12.5px] font-medium transition-all ${
                  page === currentPage
                    ? 'bg-[#e8001e] text-white shadow-sm'
                    : 'bg-white text-[var(--text-secondary,#6b7280)] border border-[var(--card-border,#e8ebf4)] hover:bg-gray-50 hover:text-[var(--text-primary,#1a1d2e)]'
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={handleNextPage}
          disabled={currentPage === lastPage}
          className="p-1.5 rounded-md border border-[var(--card-border,#e8ebf4)] bg-white text-[var(--text-muted,#9ca3af)] hover:bg-gray-50 hover:text-[var(--text-primary,#1a1d2e)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          title={t('nextPage') || 'Next page'}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={handleLastPage}
          disabled={currentPage === lastPage}
          className="p-1.5 rounded-md border border-[var(--card-border,#e8ebf4)] bg-white text-[var(--text-muted,#9ca3af)] hover:bg-gray-50 hover:text-[var(--text-primary,#1a1d2e)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
          title={t('lastPage') || 'Last page'}
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Simple pagination info bar (for tables that don't need page controls).
 */
export function PaginationInfo({ meta, className = '' }) {
  const { t } = useLanguage();
  const from = meta?.from || 0;
  const to = meta?.to || 0;
  const total = meta?.total || 0;

  if (total === 0) return null;

  return (
    <div className={`px-4 py-2.5 border-t border-[#f3f4f6] text-[12px] text-[var(--text-muted,#9ca3af)] ${className}`}>
      {t('showing')} {from}–{to} {t('of')} {total.toLocaleString()}
    </div>
  );
}
