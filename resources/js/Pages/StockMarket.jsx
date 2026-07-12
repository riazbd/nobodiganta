import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { getDSEData } from '../services/stockService';
import MetaTags from '../Components/seo/MetaTags';
import { toBengaliNum } from '../lib/formatters';
import Icon from '../Components/Icon';

export default function StockMarket() {
  const { lang } = useApp();
  const [data, setData] = useState(null);

  useEffect(() => {
    getDSEData().then((res) => setData(res.data));
  }, []);

  const seo = {
    title: lang === 'bn' ? 'শেয়ার বাজার | নবদিগন্ত' : 'Stock Market | NoboDiganta',
    description: lang === 'bn' ? 'ঢাকা স্টক এক্সচেঞ্জ সূচক ও শেয়ার মূল্য' : 'Dhaka Stock Exchange index and share prices',
    lang,
  };

  const fmt = (n) => lang === 'bn' ? toBengaliNum(Number(n).toLocaleString('en-IN')) : Number(n).toLocaleString();
  const changeColor = (c) => parseFloat(c) >= 0 ? '#28a745' : '#c00';

  return (
    <>
      <MetaTags seo={seo} />
      <div className="page-content">
        <h1 style={{ fontSize: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="trendingUp" size={24} /> {lang === 'bn' ? 'শেয়ার বাজার' : 'Stock Market'}
        </h1>
        {!data ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
            {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
          </div>
        ) : (
          <>
            {/* Indices */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
              {data.indices?.map((idx) => (
                <div key={idx.name} style={{ background: 'var(--surface)', borderRadius: 8, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>{idx.name}</div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{fmt(idx.value)}</div>
                  <div style={{ color: changeColor(idx.change), fontSize: 14, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    {parseFloat(idx.change) >= 0 ? <Icon name="trendingUp" size={14} /> : <Icon name="trendingDown" size={14} />}
                    {fmt(idx.change)} ({idx.pct})
                  </div>
                </div>
              ))}
            </div>

            {/* Gainers & Losers */}
            <div className="stock-gl-grid">
              <div style={{ background: 'var(--surface)', borderRadius: 8, padding: 16 }}>
                <h3 style={{ color: '#28a745', marginBottom: 12, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="trendingUp" size={14} />
                  {lang === 'bn' ? 'শীর্ষ গেইনার' : 'Top Gainers'}
                </h3>
                {data.gainers?.map((s) => (
                  <div key={s.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                    <span>{s.symbol}</span>
                    <span style={{ color: '#28a745' }}>+{fmt(s.change)}%</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--surface)', borderRadius: 8, padding: 16 }}>
                <h3 style={{ color: '#c00', marginBottom: 12, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon name="trendingDown" size={14} />
                  {lang === 'bn' ? 'শীর্ষ লুজার' : 'Top Losers'}
                </h3>
                {data.losers?.map((s) => (
                  <div key={s.symbol} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)', fontSize: 13 }}>
                    <span>{s.symbol}</span>
                    <span style={{ color: '#c00' }}>{fmt(s.change)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
