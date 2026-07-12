import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import MetaTags from '../Components/seo/MetaTags';

export default function Error404() {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const seo = {
    title: lang === 'bn' ? 'পৃষ্ঠা পাওয়া যায়নি | নবদিগন্ত' : 'Page Not Found | NoboDiganta',
    lang,
  };

  return (
    <>
      <MetaTags seo={seo} />
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 80, fontWeight: 900, color: 'var(--text-muted)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 24, color: 'var(--text-color)', margin: '16px 0 8px' }}>
          {lang === 'bn' ? 'পৃষ্ঠাটি পাওয়া যায়নি' : 'Page Not Found'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 400, lineHeight: 1.7, marginBottom: 28 }}>
          {lang === 'bn'
            ? 'আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি সরানো হয়েছে, নাম পরিবর্তন হয়েছে, বা কখনো ছিল না।'
            : 'The page you are looking for has been moved, renamed, or never existed.'}
        </p>
        <button
          onClick={() => onNavigate('home')}
          style={{ padding: '10px 28px', background: '#c00', color: '#fff', border: 'none', borderRadius: 4, fontSize: 15, cursor: 'pointer', fontWeight: 600 }}
        >
          {lang === 'bn' ? 'প্রথম পাতায় যান' : 'Go to Homepage'}
        </button>
      </div>
    </>
  );
}
