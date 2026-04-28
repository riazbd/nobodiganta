import { useEffect, useState } from 'react';

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

  return (
    <div className="fixed bottom-6 right-6 bg-[#1a1d2e] text-white px-4.5 py-2.75 rounded-lg text-sm z-[9999] border-l-[3px] border-[#e8001e] shadow-lg transition-all duration-300" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)' }}>
      {toast.message}
    </div>
  );
}
