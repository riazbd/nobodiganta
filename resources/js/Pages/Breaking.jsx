import { Head, Link, router } from '@inertiajs/react';
import { useApp } from '../contexts/AppContext';
import PageSidebar from '../Components/PageSidebar';

const SEV = {
  just_in:  { bn: 'জাস্ট ইন', en: 'JUST IN',  c: '#475569' },
  breaking: { bn: 'ব্রেকিং',   en: 'BREAKING', c: 'var(--red)' },
  urgent:   { bn: 'জরুরি',     en: 'URGENT',   c: '#ea580c' },
  live:     { bn: 'লাইভ',      en: 'LIVE',     c: '#059669' },
};

export default function Breaking({ items }) {
  const { lang } = useApp();
  const data = items?.data ?? [];
  const go = (it) => { if (it.url) router.visit(it.url); };

  return (
    <>
      <Head title={lang === 'bn' ? 'ব্রেকিং নিউজ' : 'Breaking News'} />
      <div className="g-side">
        <div>
          <div className="sec-hdr" style={{ marginBottom: 16 }}>
            <div className="sec-ttl">{lang === 'bn' ? 'ব্রেকিং নিউজ' : 'Breaking News'}</div>
          </div>

          {data.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              {lang === 'bn' ? 'এখন কোনো ব্রেকিং নিউজ নেই।' : 'No breaking news right now.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.map(it => {
                const s = SEV[it.severity] || SEV.breaking;
                return (
                  <div key={it.id} onClick={() => go(it)} role={it.url ? 'button' : undefined} tabIndex={it.url ? 0 : undefined}
                    onKeyDown={e => it.url && e.key === 'Enter' && go(it)}
                    style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', border: '1px solid #eee', borderRadius: 8, cursor: it.url ? 'pointer' : 'default', opacity: it.is_active ? 1 : 0.6, transition: 'background .15s' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#fff', background: s.c, padding: '3px 8px', borderRadius: 4, flexShrink: 0 }}>
                      {lang === 'bn' ? s.bn : s.en}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', flex: 1 }}>{it.title}</span>
                    {!it.is_active && <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{lang === 'bn' ? 'মেয়াদোত্তীর্ণ' : 'expired'}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {items?.links && items.links.length > 3 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 24 }}>
              {items.links.map((lk, i) => (
                <Link key={i} href={lk.url ?? '#'} dangerouslySetInnerHTML={{ __html: lk.label }} preserveScroll
                  style={{ padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 600, background: lk.active ? 'var(--red)' : 'var(--border-color)', color: lk.active ? '#fff' : '#333', textDecoration: 'none', pointerEvents: lk.url ? 'auto' : 'none', opacity: lk.url ? 1 : 0.4 }} />
              ))}
            </div>
          )}
        </div>
        <PageSidebar />
      </div>
    </>
  );
}
