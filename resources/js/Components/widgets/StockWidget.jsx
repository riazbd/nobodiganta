import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getDSEData } from '../../services/stockService';
import { toBengaliNum } from '../../lib/formatters';

export default function StockWidget() {
  const { lang } = useApp();
  const [data, setData] = useState(null);

  useEffect(() => {
    getDSEData().then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  const fmt = (n) => lang === 'bn' ? toBengaliNum(String(n)) : String(n);
  const changeColor = (c) => parseFloat(c) >= 0 ? '#28a745' : '#c00';

  return (
    <div className="stock-widget widget-block">
      <div className="widget-header">
        📈 {lang === 'bn' ? 'শেয়ার বাজার' : 'Stock Market'}
      </div>
      {data.indices?.map((idx) => (
        <div key={idx.name} className="stock-index-row">
          <span className="stock-index-name">{idx.name}</span>
          <span className="stock-index-value">{fmt(idx.value)}</span>
          <span style={{ color: changeColor(idx.change), fontSize: 12 }}>
            {parseFloat(idx.change) >= 0 ? '+' : ''}{fmt(idx.change)}
          </span>
        </div>
      ))}
      {data.gainers?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#28a745', marginBottom: 4 }}>
            {lang === 'bn' ? 'শীর্ষ গেইনার' : 'Top Gainers'}
          </div>
          {data.gainers.slice(0, 3).map((s) => (
            <div key={s.symbol} className="stock-company-row">
              <span>{s.symbol}</span>
              <span style={{ color: '#28a745', fontSize: 12 }}>+{fmt(s.change)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
