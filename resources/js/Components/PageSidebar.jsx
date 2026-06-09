import AdSlot from './ui/AdSlot';
import TrendingWidget from './widgets/TrendingWidget';

export default function PageSidebar() {
  return (
    <aside className="right-col">
      <TrendingWidget />

      <div style={{ margin: '20px 0' }}>
        <AdSlot size="mrec" position="sidebar_top" />
      </div>

      <div style={{ margin: '20px 0' }}>
        <AdSlot size="mrec" position="sidebar_middle" />
      </div>
    </aside>
  );
}
