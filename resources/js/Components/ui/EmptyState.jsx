import { useApp } from '../../contexts/AppContext';

export default function EmptyState({ icon = '📭', titleBn, titleEn, descBn, descEn, action }) {
  const { lang } = useApp();
  const title = lang === 'bn' ? (titleBn || 'কোনো তথ্য পাওয়া যায়নি') : (titleEn || 'Nothing found');
  const desc = lang === 'bn' ? descBn : descEn;
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontSize: 18, color: 'var(--text-color)', marginBottom: 8 }}>{title}</h3>
      {desc && <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 360, margin: '0 auto 16px' }}>{desc}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
