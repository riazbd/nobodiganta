import { useState, useEffect } from 'react';
import { t } from '../translations';
import { useApp } from '../contexts/AppContext';

export default function StockTicker() {
  const { lang } = useApp();
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetch('/api/stocks')
      .then(res => res.json())
      .then(json => setStocks(json.data?.ticker || []))
      .catch(err => console.error('Error fetching stocks', err));
  }, []);

  if (stocks.length === 0) return null;

  return (
    <div id="stocks">
      <div className="wrap">
        <span className="stk-lbl">{t('stocks.label', lang)}</span>
        <div className="stk-ticker-container" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div className="stk-ticker-inner" style={{ display: 'inline-flex' }}>
            {stocks.map((stock, i) => (
              <div className="stk-item" key={i}>
                <span className="nm">{stock.name}</span>
                <span>{stock.value}</span>
                <span className={stock.up === true ? 'up' : stock.up === false ? 'dn' : ''}>{stock.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
