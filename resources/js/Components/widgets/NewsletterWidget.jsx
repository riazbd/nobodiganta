import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { validateNewsletterEmail } from '../../lib/validators';
import Icon from '../Icon';

export default function NewsletterWidget() {
  const { lang } = useApp();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateNewsletterEmail(email, lang);
    if (err) { setError(err); return; }
    setError('');
    // TODO: POST /api/newsletter/subscribe
    setSubmitted(true);
    showToast(lang === 'bn' ? 'সাবস্ক্রাইব সফল হয়েছে!' : 'Subscribed successfully!');
  };

  if (submitted) {
    return (
      <div className="newsletter-widget widget-block">
        <div style={{ textAlign: 'center', padding: '16px 0', color: '#28a745', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Icon name="checkCircle" size={16} /> {lang === 'bn' ? 'ধন্যবাদ! সাবস্ক্রাইব করা হয়েছে।' : 'Thank you! You are subscribed.'}
        </div>
      </div>
    );
  }

  return (
    <div className="newsletter-widget widget-block">
      <div className="widget-header" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="mail" size={16} /> {lang === 'bn' ? 'নিউজলেটার' : 'Newsletter'}
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
        {lang === 'bn'
          ? 'প্রতিদিনের সংবাদ ইমেইলে পান'
          : 'Get daily news in your inbox'}
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          placeholder={lang === 'bn' ? 'আপনার ইমেইল' : 'Your email'}
          aria-label={lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email address'}
          style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, marginBottom: error ? 4 : 10 }}
        />
        {error && <div style={{ color: '#c00', fontSize: 12, marginBottom: 8 }}>{error}</div>}
        <button
          type="submit"
          style={{ width: '100%', padding: '9px', background: '#c00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          {lang === 'bn' ? 'সাবস্ক্রাইব করুন' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}
