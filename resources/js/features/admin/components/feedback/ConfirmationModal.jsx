import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText,
  variant = 'danger',
  lang = 'bn'
}) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const colors = {
    danger: {
      icon: 'bg-red-50 text-red-500',
      button: 'bg-red-500 hover:bg-red-600 shadow-red-100',
    },
    warning: {
      icon: 'bg-orange-50 text-orange-500',
      button: 'bg-orange-500 hover:bg-orange-600 shadow-orange-100',
    },
    blue: {
      icon: 'bg-blue-50 text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-100',
    }
  };

  const style = colors[variant] || colors.danger;

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${style.icon}`}>
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {cancelText || (lang === 'bn' ? 'বাতিল' : 'Cancel')}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-[1.5] py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 ${style.button}`}
          >
            {confirmText || (lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
