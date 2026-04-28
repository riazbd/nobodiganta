import { useApp } from '../../contexts/AppContext';

export default function ArticleCorrection({ correction }) {
  const { lang } = useApp();
  if (!correction) return null;

  return (
    <div
      role="note"
      aria-label={lang === 'bn' ? 'সংশোধনী' : 'Correction'}
      style={{
        background: '#fff8e1',
        border: '1px solid #ffe082',
        borderLeft: '4px solid #f9a825',
        borderRadius: 4,
        padding: '10px 14px',
        margin: '16px 0',
        fontSize: 13,
      }}
    >
      <strong style={{ color: '#f57f17' }}>
        {lang === 'bn' ? 'সংশোধনী:' : 'Correction:'}
      </strong>{' '}
      {correction}
    </div>
  );
}
