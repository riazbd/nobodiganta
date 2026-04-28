import { useNavigation } from '../../contexts/NavigationContext';
import { useApp } from '../../contexts/AppContext';

export default function SectionHeader({ title, category, moreLabel }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();
  const more = moreLabel || (lang === 'bn' ? 'আরও দেখুন' : 'See more');
  return (
    <div className="sec-hdr">
      <div className="sec-ttl">{title}</div>
      {category && (
        <button className="sec-more" onClick={() => onNavigate('cat', category)}>
          {more}
        </button>
      )}
    </div>
  );
}
