import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { getGoldPrice } from '../../services/goldService';
import { toBengaliNum } from '../../lib/formatters';
import Icon from '../Icon';

export default function GoldPriceWidget() {
  const { lang } = useApp();
  const [data, setData] = useState(null);

  useEffect(() => {
    getGoldPrice().then((res) => setData(res.data));
  }, []);

  const fmt = (n) => {
    const s = Number(n).toLocaleString('en-IN');
    return lang === 'bn' ? toBengaliNum(s) : s;
  };

  if (!data) return null;

  const trend = data.gold22k?.trend;
  const trendColor = trend === 'up' ? '#c00' : trend === 'down' ? '#28a745' : '#888';

  return (
    <div className="gold-widget widget-block">
      <div className="widget-header" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name="dollarSign" size={16} /> {lang === 'bn' ? 'স্বর্ণের দাম' : 'Gold Price'}
        <span style={{ fontSize: 11, color: '#999', fontWeight: 400, marginLeft: 'auto' }}>
          {lang === 'bn' ? 'বাংলাদেশ' : 'Bangladesh'}
        </span>
      </div>
      <div className="gold-grid">
        <div className="gold-row">
          <span>{lang === 'bn' ? '২২ ক্যারেট (প্রতি ভরি)' : '22K per bhori'}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            ৳{fmt(data.gold22k?.price)}
            {trend === 'up' && <Icon name="trendingUp" size={12} style={{ color: trendColor }} />}
            {trend === 'down' && <Icon name="trendingDown" size={12} style={{ color: trendColor }} />}
          </span>
        </div>
        <div className="gold-row">
          <span>{lang === 'bn' ? '২৪ ক্যারেট (প্রতি ভরি)' : '24K per bhori'}</span>
          <span>৳{fmt(data.gold24k?.price)}</span>
        </div>
        {data.usdBdt && (
          <div className="gold-row" style={{ marginTop: 6, borderTop: '1px solid #eee', paddingTop: 6 }}>
            <span>USD/BDT</span>
            <span>৳{fmt(data.usdBdt?.rate)}</span>
          </div>
        )}
      </div>
      {data.updatedAt && (
        <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
          {lang === 'bn' ? 'আপডেট: ' : 'Updated: '}{data.updatedAt}
        </div>
      )}
    </div>
  );
}
