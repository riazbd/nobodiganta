import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import MetaTags from '../Components/seo/MetaTags';

export default function Error500() {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const seo = {
    title: lang === 'bn' ? 'সার্ভার সমস্যা | নবদিগন্ত' : 'Server Error | NoboDiganta',
    lang,
  };

  return (
    <>
      <MetaTags seo={seo} />
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: '#e0e0e0', lineHeight: 1 }}>500</div>
        <h1 style={{ fontSize: 24, color: '#333', margin: '16px 0 8px' }}>
          {lang === 'bn' ? 'সার্ভারে সমস্যা হয়েছে' : 'Server Error'}
        </h1>
        <p style={{ color: '#888', fontSize: 15, maxWidth: 400, lineHeight: 1.7, marginBottom: 28 }}>
          {lang === 'bn'
            ? 'একটি অপ্রত্যাশিত সমস্যা হয়েছে। আমরা এটি ঠিক করার চেষ্টা করছি।'
            : 'An unexpected error occurred. We are working to fix it.'}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 24px', background: '#c00', color: '#fff', border: 'none', borderRadius: 4, fontSize: 15, cursor: 'pointer', fontWeight: 600 }}
          >
            {lang === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Try Again'}
          </button>
          <button
            onClick={() => onNavigate('home')}
            style={{ padding: '10px 24px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 4, fontSize: 15, cursor: 'pointer' }}
          >
            {lang === 'bn' ? 'প্রথম পাতা' : 'Homepage'}
          </button>
        </div>
      </div>
    </>
  );
}
