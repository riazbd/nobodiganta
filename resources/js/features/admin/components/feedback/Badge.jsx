import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

export function Badge({ variant = 'gray', children, className = '' }) {
  const variants = {
    red: 'bg-[#fff0f2] text-[#e8001e]',
    green: 'bg-[#ecfdf5] text-[#10b981]',
    blue: 'bg-[#eff6ff] text-[#3b82f6]',
    orange: 'bg-[#fffbeb] text-[#f59e0b]',
    purple: 'bg-[#f5f3ff] text-[#8b5cf6]',
    gray: 'bg-[#f3f4f6] text-[#6b7280]',
    cyan: 'bg-[#ecfeff] text-[#06b6d4]',
  };

  return (
    <span className={`inline-flex items-center px-2.25 py-0.75 rounded-full text-[11px] font-semibold ${variants[variant] || variants.gray} ${className}`}>
      {children}
    </span>
  );
}

export function ProgressBar({ value, color = '#e8001e', className = '' }) {
  return (
    <div className={`h-1.25 bg-[#f3f4f6] rounded-full overflow-hidden ${className}`}>
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"><Icon className="w-8 h-8 text-gray-400" /></div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange?.(!checked)}
        className={`w-9 h-5 rounded-full relative transition-colors ${checked ? 'bg-[#e8001e]' : 'bg-[#374151]'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform shadow ${checked ? 'translate-x-4' : ''}`} />
      </button>
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </div>
  );
}
