import { useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { useReadingProgress } from '../hooks/useReadingProgress';

/**
 * Wraps article content with:
 * - A fixed reading-progress bar at top
 * - data-font-size and data-theme applied via AppContext (already handled by AppContext useEffect)
 *
 * Usage:
 *   <ArticleLayout>
 *     <div ref={articleRef}>...article body...</div>
 *   </ArticleLayout>
 *
 * Or pass a contentRef from the parent:
 *   <ArticleLayout contentRef={articleRef}>...</ArticleLayout>
 */
export default function ArticleLayout({ children, contentRef }) {
  const internalRef = useRef(null);
  const ref = contentRef || internalRef;
  const progress = useReadingProgress(ref);

  return (
    <>
      {/* Fixed reading progress bar */}
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${progress}%`,
          height: 3,
          background: 'var(--red, #e8001e)',
          zIndex: 9999,
          transition: 'width 0.1s linear',
          pointerEvents: 'none',
        }}
      />
      {children}
    </>
  );
}
