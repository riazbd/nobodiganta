import { t } from '../translations';
import Icon from '../Components/Icon';
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { validateContactForm } from '../lib/validators';

export default function Contact() {
  const { lang, settings } = useApp();
  const { showToast } = useToast();
  const [form, setForm] = useState({ subject: '', name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState({});

  const contactEmail = settings.contact_email || 'info@provati.com';
  const contactPhone = settings.contact_phone || '+880 1234 567890';
  const contactPhone2 = settings.contact_phone_2 || '';
  const bdAddress = lang === 'bn' ? (settings.office_address_bn || '') : (settings.office_address_en || '');
  const ukAddress = lang === 'bn' ? (settings.office_address_uk_bn || '') : (settings.office_address_uk_en || '');
  const siteUrl = window.location.origin.replace(/^https?:\/\//, '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateContactForm(form, lang);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    showToast(t('contact.sent', lang));
    setForm({ subject: '', name: '', email: '', phone: '', message: '' });
  };

  const contactInfo = [
    ['building', lang === 'bn' ? 'বাংলাদেশ অফিস' : 'Bangladesh Office', bdAddress],
    ...(ukAddress ? [['building', lang === 'bn' ? 'যুক্তরাজ্য অফিস' : 'UK Office', ukAddress]] : []),
    ['phone', lang === 'bn' ? 'ফোন' : 'Phone', contactPhone + (contactPhone2 ? `\n${contactPhone2}` : '')],
    ['mail', lang === 'bn' ? 'ইমেইল' : 'Email', contactEmail],
    ['globe', lang === 'bn' ? 'ওয়েবসাইট' : 'Website', siteUrl],
  ];

  const subjectOptions = lang === 'bn' ? [
    'সংবাদ পাঠান', 'বিজ্ঞাপন সংক্রান্ত', 'সদস্যপদ বিষয়ে', 'প্রযুক্তিগত সহায়তা', 'অভিযোগ', 'অন্যান্য'
  ] : [
    'Submit News', 'Advertising', 'Subscription', 'Technical Support', 'Complaint', 'Other'
  ];

  return (
    <div className="sec" style={{ marginBottom: 18 }}>
      <div className="sec-hdr"><div className="sec-ttl">{t('contact.title', lang)}</div></div>
      <div className="contact-grid">
        <div>
          <h3 style={{ fontFamily: "'Kalpurush','SolaimanLipi',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{t('contact.send_msg', lang)}</h3>
          <div className="contact-form">
            <div className="form-group">
              <label>{t('contact.subject', lang)}</label>
              <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                {subjectOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t('contact.name', lang)}</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('contact.name_placeholder', lang)} />
            </div>
            <div className="form-group">
              <label>{t('contact.email', lang)}</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>{t('contact.phone', lang)}</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+880 XXXXX XXXXX" />
            </div>
            <div className="form-group">
              <label>{t('contact.message', lang)}</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t('contact.msg_placeholder', lang)} />
            </div>
            <button className="submit-btn" onClick={handleSubmit}><Icon name="send" size={14} /> {lang === 'bn' ? 'পাঠান' : 'Send'}</button>
          </div>
        </div>
        <div>
          <h3 style={{ fontFamily: "'Kalpurush','SolaimanLipi',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>{t('contact.address_title', lang)}</h3>
          {contactInfo.map(([icon, label, val], i) => (
            <div key={i} className="contact-info-item">
              <div className="icon"><Icon name={icon} size={20} /></div>
              <div><h4>{label}</h4><p style={{ whiteSpace: 'pre-line' }}>{val}</p></div>
            </div>
          ))}
          <div style={{ background: 'var(--light-bg)', padding: 14, borderRadius: 3, marginTop: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{t('contact.ad_dept', lang)}</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--light-text)', lineHeight: 1.7 }}>
              {t('contact.ad_desc', lang)}<br />
              <Icon name="phone" size={14} /> {contactPhone}<br />
              {contactPhone2 && <><Icon name="phone" size={14} /> {contactPhone2}<br /></>}
              <Icon name="mail" size={14} /> {contactEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
