import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { t } from '../translations';
import PageSidebar from '../Components/PageSidebar';
import { useApp } from '../contexts/AppContext';
import { useNavigation } from '../contexts/NavigationContext';
import { toBengaliNum } from '../lib/formatters';
import ArticleThumb from '../Components/ui/ArticleThumb';

export default function Archive({ year: initialYear, month: initialMonth, day: initialDay, articles = [] }) {
  const { lang } = useApp();
  const { onNavigate } = useNavigation();

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const months = [
    t('months.jan', lang), t('months.feb', lang), t('months.mar', lang),
    t('months.apr', lang), t('months.may', lang), t('months.jun', lang),
    t('months.jul', lang), t('months.aug', lang), t('months.sep', lang),
    t('months.oct', lang), t('months.nov', lang), t('months.dec', lang),
  ];

  const years = lang === 'bn'
    ? ['২০২৬', '২০২৫', '২০২৪', '২০২৩', '২০২২'].map((y, i) => ({ label: y, value: 2026 - i }))
    : [2026, 2025, 2024, 2023, 2022].map((y) => ({ label: String(y), value: y }));

  const weekDays = [
    t('weekdays.sun', lang), t('weekdays.mon', lang), t('weekdays.tue', lang),
    t('weekdays.wed', lang), t('weekdays.thu', lang), t('weekdays.fri', lang),
    t('weekdays.sat', lang),
  ];

  const handleView = () => {
    router.get(route('archive'), { year: selectedYear, month: selectedMonth, day: selectedDay }, { preserveState: true });
  };

  const numFmt = (n) => lang === 'bn' ? toBengaliNum(String(n)) : String(n);

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay();

  return (
    <>
      <Head title={`${t('archive.title', lang)} | ${lang === 'bn' ? 'নব দিগন্ত' : 'Nobo Digonto'}`} />
      <div className="g-side" style={{ marginBottom: 18 }}>
        <div className="sec">
          <div className="sec-hdr"><div className="sec-ttl">{t('archive.title', lang)}</div></div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                {t('archive.year', lang)}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{ border: '1.5px solid #ddd', borderRadius: 3, padding: '7px 12px', fontSize: 13, background: 'var(--surface-2)' }}
              >
                {years.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>
                {t('archive.month', lang)}
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{ border: '1.5px solid #ddd', borderRadius: 3, padding: '7px 12px', fontSize: 13, background: 'var(--surface-2)' }}
              >
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                onClick={handleView}
                style={{ background: 'var(--red)', border: 'none', color: '#fff', padding: '9px 20px', borderRadius: 3, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                {t('archive.view', lang)}
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="sec-hdr" style={{ marginTop: 18 }}>
            <div className="sec-ttl" style={{ fontSize: 16 }}>
              {months[selectedMonth - 1]} {numFmt(selectedYear)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 20 }}>
            {weekDays.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', padding: 5 }}>{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1;
              const isSelected = d === selectedDay;
              return (
                <div
                  key={d}
                  onClick={() => { setSelectedDay(d); router.get(route('archive'), { year: selectedYear, month: selectedMonth, day: d }, { preserveState: true }); }}
                  role="button"
                  tabIndex={0}
                  style={{
                    textAlign: 'center',
                    padding: '8px 5px',
                    cursor: 'pointer',
                    borderRadius: 3,
                    background: isSelected ? 'var(--red)' : 'var(--light-bg)',
                    color: isSelected ? '#fff' : 'var(--black)',
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 400,
                  }}
                >
                  {numFmt(d)}
                </div>
              );
            })}
          </div>

          <div className="sec-hdr">
            <div className="sec-ttl" style={{ fontSize: 16 }}>
              {numFmt(selectedDay)} {months[selectedMonth - 1]} {numFmt(selectedYear)} {lang === 'bn' ? 'এর সংবাদ' : 'News'}
            </div>
          </div>

          {articles.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              {lang === 'bn' ? 'এই তারিখে কোনো সংবাদ পাওয়া যায়নি' : 'No news found for this date'}
            </div>
          ) : (
            articles.map((item) => (
              <div
                key={item.id}
                className="li"
                onClick={() => onNavigate('article', { categorySlug: item.category?.slug, articleSlug: item.slug })}
                role="button"
                tabIndex={0}
              >
                <ArticleThumb src={item.featured_image} alt={item.title} isVideo={item.article_type === 'video'} width={100} height={70} />
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.excerpt}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <PageSidebar />
      </div>
    </>
  );
}
