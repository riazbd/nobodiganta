/**
 * Skeleton loaders — shimmer animation handled in CSS via .skeleton class.
 * variants: CardSkeleton | ListSkeleton | ArticleSkeleton | SidebarSkeleton | HeroSkeleton | WidgetSkeleton
 */

export function CardSkeleton({ imgH = 185 }) {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ height: imgH, borderRadius: 4 }} />
      <div style={{ padding: '10px 0' }}>
        <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 8, borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 16, marginBottom: 6, borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 10, borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 12, width: '30%', borderRadius: 3 }} />
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="skeleton-list" style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
      <div className="skeleton" style={{ width: 100, height: 70, flexShrink: 0, borderRadius: 4 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 12, width: '30%', marginBottom: 8, borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 14, marginBottom: 6, borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8, borderRadius: 3 }} />
        <div className="skeleton" style={{ height: 11, width: '25%', borderRadius: 3 }} />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="skeleton-hero">
      <div className="skeleton" style={{ height: 320, borderRadius: 6, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 10, borderRadius: 3 }} />
      <div className="skeleton" style={{ height: 16, marginBottom: 6, borderRadius: 3 }} />
      <div className="skeleton" style={{ height: 16, width: '85%', borderRadius: 3 }} />
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="skeleton-article">
      <div className="skeleton" style={{ height: 14, width: '20%', marginBottom: 14, borderRadius: 3 }} />
      <div className="skeleton" style={{ height: 28, marginBottom: 8, borderRadius: 3 }} />
      <div className="skeleton" style={{ height: 28, width: '75%', marginBottom: 16, borderRadius: 3 }} />
      <div className="skeleton" style={{ height: 16, marginBottom: 8, borderRadius: 3 }} />
      <div className="skeleton" style={{ height: 16, width: '90%', marginBottom: 20, borderRadius: 3 }} />
      <div className="skeleton" style={{ height: 400, borderRadius: 6, marginBottom: 20 }} />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton" style={{ height: 14, width: i % 2 === 0 ? '95%' : '100%', marginBottom: 8, borderRadius: 3 }} />
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="skeleton-sidebar">
      <div className="skeleton" style={{ height: 18, width: '50%', marginBottom: 14, borderRadius: 3 }} />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div className="skeleton" style={{ width: 60, height: 60, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 12, marginBottom: 6, borderRadius: 3 }} />
            <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="skeleton-widget">
      <div className="skeleton" style={{ height: 18, width: '60%', marginBottom: 12, borderRadius: 3 }} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton" style={{ height: 13, marginBottom: 8, borderRadius: 3 }} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div style={{ padding: '20px 0' }}>
      <HeroSkeleton />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
