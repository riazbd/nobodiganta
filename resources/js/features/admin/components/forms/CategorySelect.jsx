import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

/**
 * Searchable, hierarchy-aware category dropdown.
 *
 * Props:
 *  - value:      currently selected value ('' / 'all' / id / slug)
 *  - onChange:   (value) => void
 *  - items:      ordered flat array [{ value, label, isChild }] (all selectable)
 *  - topOption:  { value, label } shown first (e.g. "None (Main)" / "All Categories")
 *  - placeholder, searchPlaceholder, buttonClassName
 */
export default function CategorySelect({
  value,
  onChange,
  items = [],
  topOption = null,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  buttonClassName = '',
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hi, setHi] = useState(0);
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const allOptions = useMemo(
    () => (topOption ? [{ ...topOption, isChild: false }, ...items] : items),
    [topOption, items]
  );

  const selected = allOptions.find(o => String(o.value) === String(value)) || null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allOptions;
    const matches = items.filter(o => (o.label || '').toLowerCase().includes(q));
    // Keep topOption visible only when it also matches (predictable search)
    const top = topOption && (topOption.label || '').toLowerCase().includes(q)
      ? [{ ...topOption, isChild: false }] : [];
    return [...top, ...matches];
  }, [query, allOptions, items, topOption]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (open) { setQuery(''); setHi(0); setTimeout(() => searchRef.current?.focus(), 0); }
  }, [open]);

  const pick = (opt) => { onChange(opt.value); setOpen(false); };

  const onKey = (e) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[hi]) pick(filtered[hi]); }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={buttonClassName || 'w-full flex items-center justify-between gap-2 border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm bg-white text-left outline-none focus:border-[#263238]'}
      >
        <span className={`truncate ${selected ? '' : 'text-gray-400'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-2 border-b border-[var(--card-border,#e8ebf4)]">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setHi(0); }}
              onKeyDown={onKey}
              placeholder={searchPlaceholder}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">No matches</div>
            )}
            {filtered.map((opt, i) => {
              const isSel = String(opt.value) === String(value);
              const depth = opt.depth || (opt.isChild ? 1 : 0);
              return (
                <button
                  key={`${opt.value}-${i}`}
                  type="button"
                  onClick={() => pick(opt)}
                  onMouseEnter={() => setHi(i)}
                  style={{ paddingLeft: 12 + depth * 18 }}
                  className={`w-full flex items-center justify-between gap-2 text-left text-sm pr-3 py-1.5 transition-colors
                    ${depth > 0 ? 'text-gray-600' : 'font-semibold text-gray-800'}
                    ${i === hi ? 'bg-[#eceff1]' : ''} ${isSel ? 'text-[#263238]' : ''}`}
                >
                  <span className="truncate flex items-center gap-1.5">
                    {depth > 0 && <span className="text-gray-300">↳</span>}
                    {opt.label}
                  </span>
                  {isSel && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
