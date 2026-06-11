import { useEffect, useState } from 'react';

const TYPE_STYLES = {
  success: 'border-[#10b981]',
  error:   'border-[#e8001e]',
  warning: 'border-[#f59e0b]',
  info:    'border-[#263238]',
};

export function Toast({ toast }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast?.visible) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast || !visible) return null;

  const borderColor = TYPE_STYLES[toast.type] || TYPE_STYLES.info;

  return (
    <div
      className={`fixed bottom-6 right-6 bg-[#1a1d2e] text-white px-4 py-3 rounded-lg text-sm z-[9999] border-l-[3px] ${borderColor} shadow-lg transition-all duration-300`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', maxWidth: 360 }}
    >
      {toast.message}
    </div>
  );
}
