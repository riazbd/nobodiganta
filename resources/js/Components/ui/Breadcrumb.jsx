import { useNavigation } from '../../contexts/NavigationContext';

/**
 * items: [{ label: string, page?: string, sub?: string }]
 * Last item is current page (no link).
 */
export default function Breadcrumb({ items = [] }) {
  const { onNavigate } = useNavigation();
  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="bc-item">
            {isLast ? (
              <span className="bc-current" aria-current="page">{item.label}</span>
            ) : (
              <>
                <button
                  className="bc-link"
                  onClick={() => item.page && onNavigate(item.page, item.sub)}
                >
                  {item.label}
                </button>
                <span className="bc-sep" aria-hidden="true">›</span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
}
