import { usePage } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import { t } from '../translations';

export default function Dashboard() {
  const { auth } = usePage().props;
  const { lang } = useApp();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        {lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
      </h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        {lang === 'bn' ? 'স্বাগতম' : 'Welcome'}, {auth?.user?.name || 'User'}!
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            {lang === 'bn' ? 'সর্বশেষ সংবাদ' : 'Latest News'}
          </h3>
          <p style={{ color: '#888' }}>
            {lang === 'bn' ? 'এখনো কোনো সংবাদ নেই' : 'No news yet'}
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            {lang === 'bn' ? 'মন্তব্য' : 'Comments'}
          </h3>
          <p style={{ color: '#888' }}>
            {lang === 'bn' ? 'এখনো কোনো মন্তব্য নেই' : 'No comments yet'}
          </p>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            {lang === 'bn' ? 'পাঠক সংখ্যা' : 'Readers'}
          </h3>
          <p style={{ color: '#888' }}>
            {lang === 'bn' ? 'এখনো কোনো পাঠক নেই' : 'No readers yet'}
          </p>
        </div>
      </div>
    </div>
  );
}
