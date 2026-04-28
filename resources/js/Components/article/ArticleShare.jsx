import { useApp } from '../../contexts/AppContext';
import { useToast } from '../../contexts/ToastContext';
import { shareOnFacebook, shareOnWhatsApp, shareOnTelegram, shareOnTwitter, shareOnLinkedIn, copyToClipboard } from '../../lib/sharing';

const SHARE_BUTTONS = [
  { key: 'facebook', label: 'Facebook', color: '#1877f2', icon: 'f' },
  { key: 'whatsapp', label: 'WhatsApp', color: '#25d366', icon: '💬' },
  { key: 'telegram', label: 'Telegram', color: '#0088cc', icon: '✈' },
  { key: 'twitter',  label: 'X',        color: '#000',    icon: '✕' },
  { key: 'linkedin', label: 'LinkedIn', color: '#0a66c2', icon: 'in' },
  { key: 'copy',     label: null,       color: '#666',    icon: '🔗' },
];

export default function ArticleShare({ url, title }) {
  const { lang } = useApp();
  const { showToast } = useToast();

  const shareUrl = url || window.location.href;

  const handle = (key) => {
    switch (key) {
      case 'facebook':  shareOnFacebook(shareUrl, title); break;
      case 'whatsapp':  shareOnWhatsApp(shareUrl, title); break;
      case 'telegram':  shareOnTelegram(shareUrl, title); break;
      case 'twitter':   shareOnTwitter(shareUrl, title); break;
      case 'linkedin':  shareOnLinkedIn(shareUrl, title); break;
      case 'copy':
        copyToClipboard(shareUrl).then((ok) =>
          showToast(ok
            ? (lang === 'bn' ? 'লিঙ্ক কপি হয়েছে!' : 'Link copied!')
            : (lang === 'bn' ? 'কপি করা যায়নি' : 'Copy failed'))
        );
        break;
    }
  };

  const copyLabel = lang === 'bn' ? 'লিঙ্ক কপি' : 'Copy link';

  return (
    <div className="art-share-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '16px 0' }}>
      {SHARE_BUTTONS.map(({ key, label, color, icon }) => (
        <button
          key={key}
          onClick={() => handle(key)}
          aria-label={label || copyLabel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            background: color,
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span>{icon}</span>
          {label && <span>{label}</span>}
          {!label && <span>{copyLabel}</span>}
        </button>
      ))}
    </div>
  );
}
