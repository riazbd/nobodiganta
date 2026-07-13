import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, Check } from 'lucide-react';

/**
 * Searchable, collapsible category dropdown (tree).
 *
 * Props:
 *  - value:     selected value ('' / 'all' / id / slug)
 *  - onChange:  (value) => void
 *  - items:     flat array [{ value, label, parentValue }] — parentValue is the
 *               parent item's value, or null/undefined for top-level.
 *  - topOption: { value, label } shown first (e.g. "None" / "All Categories")
 *  - placeholder, searchPlaceholder, buttonClassName
 */
const ROOT = '__root__';

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
  const [expanded, setExpanded] = useState(() => new Set());
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const childrenBy = useMemo(() => {
    const m = new Map();
    items.forEach(it => {
      const k = it.parentValue == null ? ROOT : String(it.parentValue);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(it);
    });
    return m;
  }, [items]);
  const hasChildren = (v) => childrenBy.has(String(v));

  const labelOf = (v) => {
    if (topOption && String(v) === String(topOption.value)) return topOption.label;
    const it = items.find(i => String(i.value) === String(v));
    return it ? it.label : null;
  };
  const selectedLabel = value != null && value !== '' ? labelOf(value) : (topOption ? labelOf(topOption.value) : null);

  // Depth-ordered visible rows: collapsed tree, or (search) matches + ancestors expanded.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = [];
    if (q) {
      const byVal = new Map(items.map(it => [String(it.value), it]));
      const keep = new Set();
      items.forEach(it => {
        if ((it.label || '').toLowerCase().includes(q)) {
          let cur = it;
          while (cur) { keep.add(String(cur.value)); cur = cur.parentValue != null ? byVal.get(String(cur.parentValue)) : null; }
        }
      });
      const walk = (key, depth) => (childrenBy.get(key) || []).forEach(it => {
        if (keep.has(String(it.value))) { out.push({ ...it, depth }); walk(String(it.value), depth + 1); }
      });
      walk(ROOT, 0);
      return out;
    }
    const walk = (key, depth) => (childrenBy.get(key) || []).forEach(it => {
      out.push({ ...it, depth });
      if (expanded.has(String(it.value))) walk(String(it.value), depth + 1);
    });
    walk(ROOT, 0);
    return out;
  }, [items, expanded, query, childrenBy]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => searchRef.current?.focus(), 0); }
  }, [open]);

  const pick = (v) => { onChange(v); setOpen(false); };
  const toggleExp = (v) => setExpanded(prev => {
    const n = new Set(prev); const k = String(v);
    n.has(k) ? n.delete(k) : n.add(k);
    return n;
  });

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={buttonClassName || 'w-full flex items-center justify-between gap-2 border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm bg-white text-left outline-none focus:border-[#263238]'}
      >
        <span className={`truncate ${selectedLabel ? '' : 'text-gray-400'}`}>{selectedLabel || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[240px] bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-2 border-b border-[var(--card-border,#e8ebf4)]">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}
              placeholder={searchPlaceholder}
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {topOption && (
              <Row
                label={topOption.label}
                depth={0}
                selected={String(value) === String(topOption.value)}
                onSelect={() => pick(topOption.value)}
              />
            )}
            {visible.length === 0 && query && (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">No matches</div>
            )}
            {visible.map((it) => {
              const kids = hasChildren(it.value);
              const isOpen = !!query || expanded.has(String(it.value));
              return (
                <Row
                  key={it.value}
                  label={it.label}
                  depth={it.depth}
                  selected={String(it.value) === String(value)}
                  expandable={kids}
                  isOpen={isOpen}
                  onToggle={() => toggleExp(it.value)}
                  onSelect={() => pick(it.value)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, depth = 0, selected, expandable, isOpen, onToggle, onSelect }) {
  return (
    <div className={`flex items-center ${selected ? 'bg-[#eceff1]' : 'hover:bg-gray-50'}`} style={{ paddingLeft: 6 + depth * 16 }}>
      {expandable ? (
        <button type="button" onClick={onToggle} className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-[#263238] flex-shrink-0" aria-label={isOpen ? 'Collapse' : 'Expand'}>
          <ChevronRight size={14} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </button>
      ) : <span className="w-5 flex-shrink-0" />}
      <button
        type="button"
        onClick={onSelect}
        className={`flex-1 flex items-center justify-between gap-2 text-left text-sm pr-3 py-1.5 truncate ${depth === 0 ? 'font-semibold text-gray-800' : 'text-gray-600'} ${selected ? 'text-[#263238]' : ''}`}
      >
        <span className="truncate">{label}</span>
        {selected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
      </button>
    </div>
  );
}
