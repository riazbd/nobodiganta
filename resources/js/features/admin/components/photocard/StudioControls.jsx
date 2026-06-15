import { useState, useRef } from 'react';
import { ChevronDown, Upload, Trash2, Type, Image as ImageIcon, Square, Share2, Star, Eye, EyeOff, Lock, Unlock, ChevronUp } from 'lucide-react';
import { FONTS } from './fonts.js';
import { CANVAS_PRESETS, makeLayer } from './schema.js';
import { ICON_PATHS, listAllElements } from './elements.js';

// ─── Primitives ────────────────────────────────────────────────────────────────
function Row({ label, children }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs text-gray-600 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </label>
  );
}
// Parse any color string → { hex:'#rrggbb', a:0..100 }
function parseColor(v) {
  if (!v) return { hex: '#000000', a: 100 };
  const c = String(v).trim();
  if (c.startsWith('rgb')) {
    const n = (c.match(/[\d.]+/g) || []).map(Number);
    const [r = 0, g = 0, b = 0, a = 1] = n;
    const hex = '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
    return { hex, a: Math.round(a * 100) };
  }
  let h = c.replace('#', '');
  if (h.length === 3) h = h.split('').map(x => x + x).join('');
  let a = 100;
  if (h.length === 8) { a = Math.round((parseInt(h.slice(6, 8), 16) || 0) / 255 * 100); h = h.slice(0, 6); }
  return { hex: '#' + (h.slice(0, 6) || '000000'), a };
}
function buildColor(hex, a) {
  if (a >= 100) return hex;
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) || 0, g = parseInt(h.slice(2, 4), 16) || 0, b = parseInt(h.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${(a / 100).toFixed(2)})`;
}

function Color({ value, onChange }) {
  const { hex, a } = parseColor(value);
  return (
    <div className="flex items-center gap-1.5">
      <input type="color" value={hex} onChange={e => onChange(buildColor(e.target.value, a))} className="w-7 h-7 rounded border border-gray-200 cursor-pointer bg-white p-0.5" />
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-16 text-xs border border-gray-200 rounded px-1.5 py-1 font-mono" />
      <input type="range" min={0} max={100} value={a} onChange={e => onChange(buildColor(hex, Number(e.target.value)))}
        className="w-12 accent-[#1a56db]" title={`Opacity ${a}%`} />
    </div>
  );
}
function Num({ value, onChange, min = 0, max = 4000, step = 1, width = 'w-20' }) {
  return <input type="number" value={value ?? 0} min={min} max={max} step={step} onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={`${width} text-xs border border-gray-200 rounded px-2 py-1`} />;
}
function Slider({ value, onChange, min, max, step = 1 }) {
  return (
    <div className="flex items-center gap-2">
      <input type="range" value={value ?? 0} min={min} max={max} step={step} onChange={e => onChange(Number(e.target.value))} className="w-28 accent-[#1a56db]" />
      <span className="text-[11px] text-gray-500 w-9 text-right tabular-nums">{value ?? 0}</span>
    </div>
  );
}
function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1a56db]/40 ${checked ? 'bg-[#16a34a]' : 'bg-gray-300'}`}>
      <span className={`absolute text-[8px] font-bold transition-opacity ${checked ? 'left-1.5 text-white opacity-100' : 'opacity-0'}`}>ON</span>
      <span className={`absolute text-[8px] font-bold transition-opacity ${checked ? 'opacity-0' : 'right-1.5 text-gray-500 opacity-100'}`}>OFF</span>
      <span className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}
function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white max-w-[150px]">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function FontSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 bg-white max-w-[150px]">
      <optgroup label="বাংলা (বাংলা + ইংরেজি)">{FONTS.filter(f => f.lang === 'bn').map(f => <option key={f.name} value={f.name}>{f.label}</option>)}</optgroup>
      <optgroup label="English only (ইংরেজি এডিশন)">{FONTS.filter(f => f.lang === 'en').map(f => <option key={f.name} value={f.name}>{f.label}</option>)}</optgroup>
    </select>
  );
}
const WEIGHTS = [400, 500, 600, 700, 800, 900].map(w => ({ value: w, label: String(w) }));
const ALIGNS  = [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }];

// Small inline SVG preview of an icon (used in the icon picker).
function IconGlyph({ name, className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}
function WeightSelect({ value, onChange }) { return <Select value={value} onChange={v => onChange(Number(v))} options={WEIGHTS} />; }
function AlignSelect({ value, onChange })  { return <Select value={value} onChange={onChange} options={ALIGNS} />; }

function ImageField({ value, onChange, onUpload, lang }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try { const url = await onUpload(file); if (url) onChange(url); }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = ''; }
  };
  return (
    <div className="flex items-center gap-2">
      {value && <img src={value} alt="" className="w-7 h-7 rounded object-cover border border-gray-200" />}
      <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1 text-[11px] font-bold text-[#1a56db] border border-[#1a56db] rounded px-2 py-1 hover:bg-blue-50">
        <Upload size={11} /> {busy ? '...' : (lang === 'bn' ? 'আপলোড' : 'Upload')}
      </button>
      {value && <button type="button" onClick={() => onChange(null)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>}
      <input ref={inputRef} type="file" accept="image/*" onChange={pick} className="hidden" />
    </div>
  );
}
function Text({ value, onChange }) {
  return <input value={value || ''} onChange={e => onChange(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 w-40" />;
}

// Image source: a system field (token) OR a custom upload.
function ImageSourceField({ value, onChange, onUpload, lang }) {
  const opts = [
    { v: 'custom', label: lang === 'bn' ? 'কাস্টম আপলোড' : 'Custom upload' },
    { v: '{{site_logo}}', label: lang === 'bn' ? 'সাইট লোগো' : 'Site logo' },
    { v: '{{featured_image}}', label: lang === 'bn' ? 'আর্টিকেল ছবি' : 'Article photo' },
    { v: '{{og_default_image}}', label: 'OG image' },
  ];
  const isToken = typeof value === 'string' && value.startsWith('{{');
  return (
    <div className="flex flex-col items-end gap-1">
      <select value={isToken ? value : 'custom'} onChange={e => onChange(e.target.value === 'custom' ? null : e.target.value)}
        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white max-w-[150px]">
        {opts.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
      {!isToken && <ImageField value={value} onChange={onChange} onUpload={onUpload} lang={lang} />}
    </div>
  );
}

// Fit mode for any image (cover / contain / stretch).
function FitSelect({ value, onChange, lang }) {
  return <Select value={value || 'cover'} onChange={onChange} options={[
    { value: 'cover',   label: lang === 'bn' ? 'ভরাট (কাটবে)' : 'Cover (crop)' },
    { value: 'contain', label: lang === 'bn' ? 'পুরোটা দেখাও' : 'Contain (fit)' },
    { value: 'stretch', label: lang === 'bn' ? 'টেনে ফিট' : 'Stretch' },
  ]} />;
}

// Pick an ad image from the Ad Manager (static) or bind dynamically by position.
function AdManagerPicker({ onPick, lang }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setOpen(o => !o);
    if (data) return;
    try { const r = await window.axios.get(route('admin.photocard-templates.ads')); setData(r.data); }
    catch { setData({ ads: [], byPosition: {} }); }
  };
  const pickStatic = async (ad) => {
    let url = ad.image;
    if (url && !url.startsWith('/') && !url.includes(window.location.host)) {
      setBusy(true);
      try { const r = await window.axios.post(route('admin.photocard-templates.import-url'), { url }); if (r.data.url) url = r.data.url; }
      catch { /* falls back to external url (may taint download) */ }
      finally { setBusy(false); }
    }
    onPick(url);
  };
  const positions = data ? Object.keys(data.byPosition || {}) : [];
  return (
    <div className="py-1">
      <button type="button" onClick={toggle} className="w-full text-[11px] font-bold text-[#1a56db] border border-[#1a56db] rounded px-2 py-1 hover:bg-blue-50">
        {busy ? '...' : (lang === 'bn' ? 'Ad Manager থেকে বাছুন' : 'Pick from Ad Manager')}
      </button>
      {open && data && (
        <div className="mt-2 space-y-2">
          {positions.length > 0 && (
            <div>
              <div className="text-[10px] text-gray-400 mb-1">{lang === 'bn' ? 'ডাইনামিক (পজিশন অনুযায়ী অটো):' : 'Dynamic (auto by position):'}</div>
              <div className="flex flex-wrap gap-1">
                {positions.map(p => (
                  <button key={p} type="button" onClick={() => onPick(`{{ad:${p}}}`)}
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold border border-gray-200 text-gray-600 hover:border-[#1a56db]">{`{{ad:${p}}}`}</button>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="text-[10px] text-gray-400 mb-1">{lang === 'bn' ? 'নির্দিষ্ট অ্যাড বাছুন:' : 'Pick a specific ad:'}</div>
            <div className="grid grid-cols-3 gap-1">
              {(data.ads || []).map(ad => (
                <button key={ad.id} type="button" onClick={() => pickStatic(ad)} title={ad.title_bn || ad.title_en || ad.position}
                  className="border border-gray-200 rounded overflow-hidden hover:border-[#1a56db]">
                  <img src={ad.image} alt="" className="w-full h-10 object-contain bg-gray-50" />
                  <div className="text-[8px] text-gray-400 truncate px-0.5">{ad.position}</div>
                </button>
              ))}
              {(!data.ads || data.ads.length === 0) && <div className="col-span-3 text-[10px] text-gray-400 py-2 text-center">{lang === 'bn' ? 'কোনো অ্যাড নেই' : 'No ads'}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Legend of available dynamic fields.
function FieldLegend({ lang }) {
  const [open, setOpen] = useState(false);
  const tokens = ['{{title}}', '{{title_en}}', '{{date}}', '{{category}}', '{{site_name}}', '{{site_url}}', '{{site_logo}}', '{{facebook_url}}', '{{contact_phone}}', '{{contact_email}}'];
  return (
    <div className="border border-blue-200 bg-blue-50/50 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-center gap-2 px-3 py-2 text-left">
        <ChevronDown size={14} className={`text-blue-400 transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">{lang === 'bn' ? 'ডাইনামিক ফিল্ড' : 'Dynamic Fields'}</span>
      </button>
      {open && (
        <div className="px-3 pb-2.5">
          <p className="text-[11px] text-gray-500 mb-1.5">{lang === 'bn' ? 'যেকোনো লেখায় এগুলো বসান — রেন্ডারের সময় সিস্টেম থেকে আসল মান বসবে:' : 'Type these in any text — they fill from your system at render time:'}</p>
          <div className="flex flex-wrap gap-1">
            {tokens.map(t => <code key={t} className="text-[10px] bg-white border border-gray-200 rounded px-1 py-0.5 text-gray-600">{t}</code>)}
          </div>
        </div>
      )}
    </div>
  );
}
function Section({ title, enabled, onToggle, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50">
        <button type="button" onClick={() => setOpen(o => !o)} className="flex items-center gap-2 flex-1 text-left">
          <ChevronDown size={15} className={`text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</span>
        </button>
        {onToggle && <Toggle checked={enabled} onChange={onToggle} />}
      </div>
      {open && <div className="px-3 py-2 divide-y divide-gray-50">{children}</div>}
    </div>
  );
}
function GradientControls({ obj, p, set, withMid }) {
  return (
    <>
      <Row label="From"><Color value={obj.gradientFrom} onChange={v => set(`${p}.gradientFrom`, v)} /></Row>
      {withMid && (
        <>
          <Row label="Mid">
            <button type="button" onClick={() => set(`${p}.gradientMid`, obj.gradientMid ? null : '#888888')} className={`text-[10px] px-1.5 py-0.5 rounded border ${obj.gradientMid ? 'bg-[#1a56db] text-white border-[#1a56db]' : 'border-gray-300 text-gray-500'}`}>{obj.gradientMid ? 'on' : 'off'}</button>
            {obj.gradientMid && <Color value={obj.gradientMid} onChange={v => set(`${p}.gradientMid`, v)} />}
          </Row>
          {obj.gradientMid && <Row label="Mid pos %"><Slider value={obj.gradientMidPos} min={0} max={100} onChange={v => set(`${p}.gradientMidPos`, v)} /></Row>}
        </>
      )}
      <Row label="To"><Color value={obj.gradientTo} onChange={v => set(`${p}.gradientTo`, v)} /></Row>
      <Row label="Angle°"><Slider value={obj.gradientAngle} min={0} max={360} onChange={v => set(`${p}.gradientAngle`, v)} /></Row>
    </>
  );
}

// Shared text-styling rows (font / size / weight / color / align). `p` is the dot-path prefix.
function TextStyle({ obj, p, set, lang, withWrap }) {
  return (
    <>
      <Row label={lang === 'bn' ? 'ফন্ট' : 'Font'}><FontSelect value={obj.font} onChange={v => set(`${p}.font`, v)} /></Row>
      <Row label={lang === 'bn' ? 'সাইজ' : 'Size'}><Slider value={obj.size} min={10} max={200} onChange={v => set(`${p}.size`, v)} /></Row>
      <Row label={lang === 'bn' ? 'ওজন' : 'Weight'}><WeightSelect value={obj.weight} onChange={v => set(`${p}.weight`, v)} /></Row>
      <Row label={lang === 'bn' ? 'রঙ' : 'Color'}><Color value={obj.color} onChange={v => set(`${p}.color`, v)} /></Row>
      <Row label={lang === 'bn' ? 'অ্যালাইন' : 'Align'}><AlignSelect value={obj.align} onChange={v => set(`${p}.align`, v)} /></Row>
      {withWrap && (
        <>
          <Row label={lang === 'bn' ? 'লাইন উচ্চতা' : 'Line height'}><Slider value={obj.lineHeight} min={20} max={240} onChange={v => set(`${p}.lineHeight`, v)} /></Row>
          <Row label={lang === 'bn' ? 'সর্বোচ্চ লাইন' : 'Max lines'}><Slider value={obj.maxLines} min={1} max={8} onChange={v => set(`${p}.maxLines`, v)} /></Row>
        </>
      )}
    </>
  );
}

// ─── Main controls ──────────────────────────────────────────────────────────────
export default function StudioControls({ config, set, onUpload, lang, selectedKey, onSelect }) {
  const c = config;
  const bgTypes = [{ value: 'solid', label: 'Solid' }, { value: 'gradient', label: 'Gradient' }, { value: 'image', label: 'Image' }];

  const addLayer = (type) => set('layers', [...(c.layers || []), makeLayer(type)]);
  const removeLayer = (i) => set('layers', c.layers.filter((_, idx) => idx !== i));
  const setLayer = (i, key, val) => set('layers', c.layers.map((l, idx) => idx === i ? { ...l, [key]: val } : l));
  const openIf = (k) => selectedKey === k;

  // ── Layer panel helpers ──
  const toggleVisible = (el) => {
    if (el.isLayer) setLayer(el.index, 'hidden', el.visible);     // visible→hidden
    else set(`${el.key}.enabled`, !el.visible);
  };
  const toggleLock = (el) => {
    if (el.isLayer) setLayer(el.index, 'locked', !el.locked);
    else set(`${el.key}.locked`, !el.locked);
  };
  const moveLayer = (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= c.layers.length) return;
    const arr = [...c.layers];
    [arr[index], arr[j]] = [arr[j], arr[index]];
    set('layers', arr);
  };
  const allEls = listAllElements(c);

  return (
    <div className="space-y-2.5">
      <div className="text-[11px] text-gray-400 px-1 leading-relaxed">
        {lang === 'bn' ? 'সরাতে/রিসাইজ করতে ক্যানভাসে এলিমেন্টে ক্লিক করুন। নিচের প্যানেল শুধু স্টাইলের জন্য।' : 'Click elements on the canvas to move/resize. The panel below is just for styling.'}
      </div>

      <FieldLegend lang={lang} />

      {/* Layer panel */}
      <Section title={lang === 'bn' ? 'লেয়ার সমূহ' : 'Layers'} defaultOpen>
        <div className="py-1 space-y-0.5">
          {allEls.map((el) => (
            <div key={el.key}
              onClick={() => onSelect?.(el.key)}
              className={`flex items-center gap-1.5 px-1.5 py-1 rounded cursor-pointer ${selectedKey === el.key ? 'bg-blue-50 ring-1 ring-[#1a56db]' : 'hover:bg-gray-50'}`}>
              <span className={`flex-1 text-xs truncate ${el.visible ? 'text-gray-700' : 'text-gray-300 line-through'}`}>{el.label}</span>
              {el.isLayer && (
                <span className="flex items-center">
                  <button type="button" onClick={(e) => { e.stopPropagation(); moveLayer(el.index, 1); }} title={lang === 'bn' ? 'সামনে' : 'Forward'} className="p-0.5 text-gray-400 hover:text-gray-700"><ChevronUp size={13} /></button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); moveLayer(el.index, -1); }} title={lang === 'bn' ? 'পেছনে' : 'Backward'} className="p-0.5 text-gray-400 hover:text-gray-700"><ChevronDown size={13} /></button>
                </span>
              )}
              <button type="button" onClick={(e) => { e.stopPropagation(); toggleLock(el); }} title={lang === 'bn' ? 'লক' : 'Lock'} className={`p-0.5 ${el.locked ? 'text-amber-500' : 'text-gray-300 hover:text-gray-600'}`}>
                {el.locked ? <Lock size={13} /> : <Unlock size={13} />}
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); toggleVisible(el); }} title={lang === 'bn' ? 'দেখাও/লুকাও' : 'Show/Hide'} className={`p-0.5 ${el.visible ? 'text-gray-500 hover:text-gray-800' : 'text-gray-300'}`}>
                {el.visible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 pt-1">{lang === 'bn' ? 'উপরের তীর = সামনে আনা · চোখ = দেখাও/লুকাও · তালা = নড়াচড়া বন্ধ' : 'Arrows = reorder · eye = show/hide · lock = freeze position'}</p>
      </Section>

      {/* Canvas */}
      <Section title={lang === 'bn' ? 'ক্যানভাস' : 'Canvas'} defaultOpen>
        <Row label={lang === 'bn' ? 'ফরম্যাট' : 'Format'}>
          <Select value={c._preset || 'custom'} onChange={(v) => { const pr = CANVAS_PRESETS[v]; set('_preset', v); if (v !== 'custom' && pr) { set('canvas.width', pr.width); set('canvas.height', pr.height); } }}
            options={Object.entries(CANVAS_PRESETS).map(([value, p]) => ({ value, label: p.label }))} />
        </Row>
        <Row label={lang === 'bn' ? 'প্রস্থ' : 'Width'}><Num value={c.canvas.width} min={200} max={4000} onChange={v => set('canvas.width', v)} /></Row>
        <Row label={lang === 'bn' ? 'উচ্চতা' : 'Height'}><Num value={c.canvas.height} min={200} max={4000} onChange={v => set('canvas.height', v)} /></Row>
        <Row label={lang === 'bn' ? 'কোণ রেডিয়াস' : 'Corner radius'}><Slider value={c.canvas.radius ?? 0} min={0} max={300} onChange={v => set('canvas.radius', v)} /></Row>
      </Section>

      {/* Background */}
      <Section title={lang === 'bn' ? 'ব্যাকগ্রাউন্ড' : 'Background'}>
        <Row label={lang === 'bn' ? 'টাইপ' : 'Type'}><Select value={c.background.type} onChange={v => set('background.type', v)} options={bgTypes} /></Row>
        {c.background.type === 'solid' && <Row label="Color"><Color value={c.background.color} onChange={v => set('background.color', v)} /></Row>}
        {c.background.type === 'gradient' && <GradientControls obj={c.background} p="background" set={set} withMid />}
        {c.background.type === 'image' && (
          <>
            <Row label={lang === 'bn' ? 'ছবি' : 'Image'}><ImageSourceField value={c.background.imageUrl} onChange={v => set('background.imageUrl', v)} onUpload={onUpload} lang={lang} /></Row>
            <Row label={lang === 'bn' ? 'ফিট' : 'Fit'}><FitSelect value={c.background.fit} onChange={v => set('background.fit', v)} lang={lang} /></Row>
            <Row label={lang === 'bn' ? 'অপাসিটি' : 'Opacity'}><Slider value={c.background.imageOpacity} min={0} max={100} onChange={v => set('background.imageOpacity', v)} /></Row>
          </>
        )}
      </Section>

      {/* Photo */}
      <Section title={lang === 'bn' ? 'আর্টিকেল ছবি' : 'Article Photo'} enabled={c.photo.enabled} onToggle={v => set('photo.enabled', v)} defaultOpen={openIf('photo')}>
        <Row label={lang === 'bn' ? 'চওড়া / উঁচু' : 'W / H'}><Num value={c.photo.width} min={2} max={4000} onChange={v => set('photo.width', v)} width="w-16" /><Num value={c.photo.height} min={2} max={4000} onChange={v => set('photo.height', v)} width="w-16" /></Row>
        <Row label={lang === 'bn' ? 'ফিট' : 'Fit'}><FitSelect value={c.photo.fit} onChange={v => set('photo.fit', v)} lang={lang} /></Row>
        <Row label={lang === 'bn' ? 'জুম (ক্রপ)' : 'Zoom (crop)'}><Slider value={Math.round((c.photo.zoom ?? 1) * 100)} min={100} max={300} onChange={v => set('photo.zoom', v / 100)} /></Row>
        <Row label={lang === 'bn' ? 'অবস্থান X' : 'Position X'}><Slider value={c.photo.offsetX ?? 0} min={-100} max={100} onChange={v => set('photo.offsetX', v)} /></Row>
        <Row label={lang === 'bn' ? 'অবস্থান Y' : 'Position Y'}><Slider value={c.photo.offsetY ?? 0} min={-100} max={100} onChange={v => set('photo.offsetY', v)} /></Row>
        <Row label={lang === 'bn' ? 'কোণ রেডিয়াস' : 'Corner radius'}><Slider value={c.photo.radius} min={0} max={400} onChange={v => set('photo.radius', v)} /></Row>
        <Row label={lang === 'bn' ? 'ওভারলে' : 'Overlay'}><Color value={c.photo.overlayColor} onChange={v => set('photo.overlayColor', v)} /></Row>
        <Row label={lang === 'bn' ? 'ওভারলে %' : 'Overlay %'}><Slider value={c.photo.overlayOpacity} min={0} max={100} onChange={v => set('photo.overlayOpacity', v)} /></Row>
        <Row label={lang === 'bn' ? 'নিচে ফেইড' : 'Bottom fade'}><Toggle checked={c.photo.fade.enabled} onChange={v => set('photo.fade.enabled', v)} /></Row>
        {c.photo.fade.enabled && (
          <>
            <Row label={lang === 'bn' ? 'ফেইড রঙ' : 'Fade color'}><Color value={c.photo.fade.color} onChange={v => set('photo.fade.color', v)} /></Row>
            <Row label={lang === 'bn' ? 'ফেইড %' : 'Fade %'}><Slider value={c.photo.fade.opacity} min={0} max={100} onChange={v => set('photo.fade.opacity', v)} /></Row>
            <Row label={lang === 'bn' ? 'ফেইড উচ্চতা' : 'Fade height'}><Slider value={c.photo.fade.height} min={0} max={600} onChange={v => set('photo.fade.height', v)} /></Row>
          </>
        )}
      </Section>

      {/* Panel */}
      <Section title={lang === 'bn' ? 'নিচের প্যানেল' : 'Bottom Panel'} enabled={c.panel.enabled} onToggle={v => set('panel.enabled', v)} defaultOpen={openIf('panel')}>
        <Row label={lang === 'bn' ? 'চওড়া / উঁচু' : 'W / H'}><Num value={c.panel.width} min={2} max={4000} onChange={v => set('panel.width', v)} width="w-16" /><Num value={c.panel.height} min={2} max={4000} onChange={v => set('panel.height', v)} width="w-16" /></Row>
        <Row label={lang === 'bn' ? 'টাইপ' : 'Type'}><Select value={c.panel.type} onChange={v => set('panel.type', v)} options={[{ value: 'solid', label: 'Solid' }, { value: 'gradient', label: 'Gradient' }]} /></Row>
        {c.panel.type === 'solid' && <Row label="Color"><Color value={c.panel.color} onChange={v => set('panel.color', v)} /></Row>}
        {c.panel.type === 'gradient' && <GradientControls obj={c.panel} p="panel" set={set} withMid />}
        <Row label={lang === 'bn' ? 'ছবির সাথে ব্লেন্ড' : 'Blend into photo'}><Toggle checked={c.panel.feather?.enabled} onChange={v => set('panel.feather.enabled', v)} /></Row>
        {c.panel.feather?.enabled && <Row label={lang === 'bn' ? 'ব্লেন্ড উচ্চতা' : 'Blend height'}><Slider value={c.panel.feather?.height} min={0} max={500} onChange={v => set('panel.feather.height', v)} /></Row>}
      </Section>

      {/* Logo */}
      <Section title={lang === 'bn' ? 'লোগো' : 'Logo'} enabled={c.logo.enabled} onToggle={v => set('logo.enabled', v)} defaultOpen={openIf('logo')}>
        <Row label={lang === 'bn' ? 'উৎস' : 'Source'}><Select value={c.logo.source} onChange={v => set('logo.source', v)} options={[{ value: 'site', label: lang === 'bn' ? 'সাইট লোগো' : 'Site logo' }, { value: 'custom', label: lang === 'bn' ? 'কাস্টম' : 'Custom' }]} /></Row>
        {c.logo.source === 'custom' && <Row label={lang === 'bn' ? 'ছবি' : 'Image'}><ImageField value={c.logo.imageUrl} onChange={v => set('logo.imageUrl', v)} onUpload={onUpload} lang={lang} /></Row>}
        <Row label={lang === 'bn' ? 'আকৃতি' : 'Shape'}><Select value={c.logo.shape} onChange={v => set('logo.shape', v)} options={[{ value: 'square', label: lang === 'bn' ? 'চারকোনা / রেক্ট্যাঙ্গেল' : 'Rectangle' }, { value: 'circle', label: lang === 'bn' ? 'গোল / ওভাল' : 'Circle / Oval' }]} /></Row>
        {c.logo.shape !== 'circle' && (
          <>
            <Row label={lang === 'bn' ? 'ফিট' : 'Fit'}><FitSelect value={c.logo.fit} onChange={v => set('logo.fit', v)} lang={lang} /></Row>
            <Row label={lang === 'bn' ? 'রেডিয়াস' : 'Radius'}><Slider value={c.logo.radius} min={0} max={400} onChange={v => set('logo.radius', v)} /></Row>
          </>
        )}
        <Row label={lang === 'bn' ? 'বর্ডার' : 'Border'}><Color value={c.logo.borderColor} onChange={v => set('logo.borderColor', v)} /></Row>
        <Row label={lang === 'bn' ? 'বর্ডার পুরুত্ব' : 'Border width'}><Slider value={c.logo.borderWidth} min={0} max={40} onChange={v => set('logo.borderWidth', v)} /></Row>
        <Row label={lang === 'bn' ? 'চওড়া / উঁচু' : 'W / H'}><Num value={c.logo.width ?? c.logo.size} min={2} max={4000} onChange={v => set('logo.width', v)} width="w-16" /><Num value={c.logo.height ?? c.logo.size} min={2} max={4000} onChange={v => set('logo.height', v)} width="w-16" /></Row>
        <p className="text-[10px] text-gray-400 pt-1">{lang === 'bn' ? 'সাইজ ক্যানভাসে টেনেও বদলানো যায় (যেকোনো দিক)।' : 'Can also resize on canvas by dragging (any direction).'}</p>
      </Section>

      {/* Headline */}
      <Section title={lang === 'bn' ? 'শিরোনাম' : 'Headline'} enabled={c.headline.enabled} onToggle={v => set('headline.enabled', v)} defaultOpen={openIf('headline')}>
        <Row label={lang === 'bn' ? 'উৎস' : 'Source'}><Select value={c.headline.source} onChange={v => set('headline.source', v)} options={[{ value: 'title', label: lang === 'bn' ? 'শিরোনাম (বাংলা)' : 'Title (BN)' }, { value: 'title_en', label: 'Title (EN)' }, { value: 'custom', label: lang === 'bn' ? 'কাস্টম টেক্সট' : 'Custom text' }]} /></Row>
        {c.headline.source === 'custom' && <Row label={lang === 'bn' ? 'টেক্সট' : 'Text'}><Text value={c.headline.customText} onChange={v => set('headline.customText', v)} /></Row>}
        <TextStyle obj={c.headline} p="headline" set={set} lang={lang} withWrap />
        <Row label={lang === 'bn' ? 'শ্যাডো' : 'Shadow'}><Toggle checked={c.headline.shadow.enabled} onChange={v => set('headline.shadow.enabled', v)} /></Row>
        {c.headline.shadow.enabled && (
          <>
            <Row label={lang === 'bn' ? 'শ্যাডো রঙ' : 'Shadow color'}><Color value={c.headline.shadow.color} onChange={v => set('headline.shadow.color', v)} /></Row>
            <Row label="Blur"><Slider value={c.headline.shadow.blur} min={0} max={40} onChange={v => set('headline.shadow.blur', v)} /></Row>
          </>
        )}
      </Section>

      {/* CTA */}
      <Section title={lang === 'bn' ? 'CTA টেক্সট' : 'CTA Text'} enabled={c.cta.enabled} onToggle={v => set('cta.enabled', v)} defaultOpen={openIf('cta')}>
        <Row label={lang === 'bn' ? 'টেক্সট' : 'Text'}><Text value={c.cta.text} onChange={v => set('cta.text', v)} /></Row>
        <TextStyle obj={c.cta} p="cta" set={set} lang={lang} />
      </Section>

      {/* URL */}
      <Section title={lang === 'bn' ? 'সাইট URL' : 'Site URL'} enabled={c.urlText.enabled} onToggle={v => set('urlText.enabled', v)} defaultOpen={openIf('urlText')}>
        <Row label={lang === 'bn' ? 'কাস্টম URL' : 'Custom URL'}><input value={c.urlText.text} placeholder={lang === 'bn' ? 'সাইট থেকে' : 'from site'} onChange={e => set('urlText.text', e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1 w-36" /></Row>
        <TextStyle obj={c.urlText} p="urlText" set={set} lang={lang} />
      </Section>

      {/* Date */}
      <Section title={lang === 'bn' ? 'তারিখ' : 'Date'} enabled={c.dateText.enabled} onToggle={v => set('dateText.enabled', v)} defaultOpen={openIf('dateText')}>
        <TextStyle obj={c.dateText} p="dateText" set={set} lang={lang} />
      </Section>

      {/* Ad banner */}
      <Section title={lang === 'bn' ? 'অ্যাড ব্যানার' : 'Ad Banner'} enabled={c.adBanner.enabled} onToggle={v => set('adBanner.enabled', v)} defaultOpen={openIf('adBanner')}>
        <Row label={lang === 'bn' ? 'চওড়া / উঁচু' : 'W / H'}><Num value={c.adBanner.width} min={2} max={4000} onChange={v => set('adBanner.width', v)} width="w-16" /><Num value={c.adBanner.height} min={2} max={4000} onChange={v => set('adBanner.height', v)} width="w-16" /></Row>
        <Row label={lang === 'bn' ? 'ব্যানার ছবি' : 'Banner image'}><ImageSourceField value={c.adBanner.imageUrl} onChange={v => set('adBanner.imageUrl', v)} onUpload={onUpload} lang={lang} /></Row>
        <AdManagerPicker onPick={v => set('adBanner.imageUrl', v)} lang={lang} />
        {c.adBanner.imageUrl && <Row label={lang === 'bn' ? 'ফিট' : 'Fit'}><FitSelect value={c.adBanner.fit} onChange={v => set('adBanner.fit', v)} lang={lang} /></Row>}
        {/* Background always available — shows behind a 'contain'/transparent ad image too */}
        <Row label={lang === 'bn' ? 'ব্যাকগ্রাউন্ড' : 'Background'}><Select value={c.adBanner.bgType} onChange={v => set('adBanner.bgType', v)} options={[{ value: 'solid', label: 'Solid' }, { value: 'gradient', label: 'Gradient' }]} /></Row>
        {c.adBanner.bgType === 'solid' && <Row label={lang === 'bn' ? 'ব্যাকগ্রাউন্ড রঙ' : 'Background color'}><Color value={c.adBanner.bgColor} onChange={v => set('adBanner.bgColor', v)} /></Row>}
        {c.adBanner.bgType === 'gradient' && <GradientControls obj={c.adBanner} p="adBanner" set={set} />}
        <Row label={lang === 'bn' ? 'টেক্সট' : 'Text'}><Text value={c.adBanner.text} onChange={v => set('adBanner.text', v)} /></Row>
        {c.adBanner.text && (
          <>
            <Row label={lang === 'bn' ? 'ফন্ট' : 'Font'}><FontSelect value={c.adBanner.textFont} onChange={v => set('adBanner.textFont', v)} /></Row>
            <Row label={lang === 'bn' ? 'টেক্সট সাইজ' : 'Text size'}><Slider value={c.adBanner.textSize} min={12} max={120} onChange={v => set('adBanner.textSize', v)} /></Row>
            <Row label={lang === 'bn' ? 'টেক্সট রঙ' : 'Text color'}><Color value={c.adBanner.textColor} onChange={v => set('adBanner.textColor', v)} /></Row>
            <Row label={lang === 'bn' ? 'অ্যালাইন' : 'Align'}><AlignSelect value={c.adBanner.textAlign} onChange={v => set('adBanner.textAlign', v)} /></Row>
          </>
        )}
      </Section>

      {/* Custom layers */}
      <Section title={lang === 'bn' ? 'কাস্টম লেয়ার' : 'Custom Layers'} defaultOpen={String(selectedKey).startsWith('layers')}>
        <div className="flex gap-2 py-2">
          <button type="button" onClick={() => addLayer('text')} className="flex items-center gap-1 text-[11px] font-bold text-gray-600 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"><Type size={12} /> {lang === 'bn' ? 'টেক্সট' : 'Text'}</button>
          <button type="button" onClick={() => addLayer('image')} className="flex items-center gap-1 text-[11px] font-bold text-gray-600 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"><ImageIcon size={12} /> {lang === 'bn' ? 'ছবি' : 'Image'}</button>
          <button type="button" onClick={() => addLayer('rect')} className="flex items-center gap-1 text-[11px] font-bold text-gray-600 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"><Square size={12} /> {lang === 'bn' ? 'শেপ' : 'Shape'}</button>
          <button type="button" onClick={() => addLayer('social')} className="flex items-center gap-1 text-[11px] font-bold text-gray-600 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"><Share2 size={12} /> {lang === 'bn' ? 'সোশ্যাল' : 'Social'}</button>
          <button type="button" onClick={() => addLayer('icon')} className="flex items-center gap-1 text-[11px] font-bold text-gray-600 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"><Star size={12} /> {lang === 'bn' ? 'আইকন' : 'Icon'}</button>
        </div>
        {(c.layers || []).map((l, i) => (
          <div key={l.id} className={`py-2 ${selectedKey === `layers.${i}` ? 'bg-blue-50/60 -mx-3 px-3 rounded' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase">{l.type} #{i + 1}</span>
              <button type="button" onClick={() => removeLayer(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
            </div>
            {l.type === 'text' && (
              <>
                <Row label="Text"><Text value={l.text} onChange={v => setLayer(i, 'text', v)} /></Row>
                <Row label="Font"><FontSelect value={l.font} onChange={v => setLayer(i, 'font', v)} /></Row>
                <Row label="Size"><Slider value={l.size} min={10} max={200} onChange={v => setLayer(i, 'size', v)} /></Row>
                <Row label="Weight"><WeightSelect value={l.weight} onChange={v => setLayer(i, 'weight', v)} /></Row>
                <Row label="Color"><Color value={l.color} onChange={v => setLayer(i, 'color', v)} /></Row>
                <Row label="Align"><AlignSelect value={l.align} onChange={v => setLayer(i, 'align', v)} /></Row>
                <Row label="Max lines"><Slider value={l.maxLines} min={1} max={8} onChange={v => setLayer(i, 'maxLines', v)} /></Row>
              </>
            )}
            {l.type === 'image' && (
              <>
                <Row label="Image"><ImageSourceField value={l.imageUrl} onChange={v => setLayer(i, 'imageUrl', v)} onUpload={onUpload} lang={lang} /></Row>
                <Row label={lang === 'bn' ? 'ফিট' : 'Fit'}><FitSelect value={l.fit} onChange={v => setLayer(i, 'fit', v)} lang={lang} /></Row>
                <Row label={lang === 'bn' ? 'চওড়া / উঁচু' : 'W / H'}><Num value={l.width} min={2} max={4000} onChange={v => setLayer(i, 'width', v)} width="w-16" /><Num value={l.height} min={2} max={4000} onChange={v => setLayer(i, 'height', v)} width="w-16" /></Row>
                <Row label={lang === 'bn' ? 'জুম (ক্রপ)' : 'Zoom (crop)'}><Slider value={Math.round((l.zoom ?? 1) * 100)} min={100} max={300} onChange={v => setLayer(i, 'zoom', v / 100)} /></Row>
                <Row label={lang === 'bn' ? 'অবস্থান X / Y' : 'Position X / Y'}><Num value={l.offsetX ?? 0} min={-100} max={100} onChange={v => setLayer(i, 'offsetX', v)} width="w-14" /><Num value={l.offsetY ?? 0} min={-100} max={100} onChange={v => setLayer(i, 'offsetY', v)} width="w-14" /></Row>
                <Row label="Radius"><Slider value={l.radius} min={0} max={400} onChange={v => setLayer(i, 'radius', v)} /></Row>
              </>
            )}
            {l.type === 'rect' && (
              <>
                <Row label="Color"><Color value={l.color} onChange={v => setLayer(i, 'color', v)} /></Row>
                <Row label={lang === 'bn' ? 'চওড়া / উঁচু' : 'W / H'}><Num value={l.width} min={2} max={4000} onChange={v => setLayer(i, 'width', v)} width="w-16" /><Num value={l.height} min={2} max={4000} onChange={v => setLayer(i, 'height', v)} width="w-16" /></Row>
                <Row label="Radius"><Slider value={l.radius} min={0} max={400} onChange={v => setLayer(i, 'radius', v)} /></Row>
              </>
            )}
            {l.type === 'icon' && (
              <>
                <div className="py-1.5">
                  <div className="text-xs text-gray-600 mb-1.5">{lang === 'bn' ? 'আইকন বাছুন' : 'Pick an icon'}</div>
                  <div className="grid grid-cols-8 gap-1">
                    {Object.keys(ICON_PATHS).map(name => (
                      <button key={name} type="button" title={name} onClick={() => setLayer(i, 'icon', name)}
                        className={`aspect-square flex items-center justify-center rounded border ${l.icon === name ? 'border-[#1a56db] bg-blue-50 text-[#1a56db]' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                        <IconGlyph name={name} className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
                <Row label={lang === 'bn' ? 'রঙ' : 'Color'}><Color value={l.color} onChange={v => setLayer(i, 'color', v)} /></Row>
                <Row label={lang === 'bn' ? 'চওড়া / উঁচু' : 'W / H'}><Num value={l.width} min={2} max={4000} onChange={v => setLayer(i, 'width', v)} width="w-16" /><Num value={l.height} min={2} max={4000} onChange={v => setLayer(i, 'height', v)} width="w-16" /></Row>
              </>
            )}
            {l.type === 'social' && (
              <>
                <Row label={lang === 'bn' ? 'উৎস' : 'Source'}>
                  <Select value={l.source || 'manual'} onChange={v => setLayer(i, 'source', v)} options={[
                    { value: 'manual', label: lang === 'bn' ? 'হাতে বাছাই' : 'Pick manually' },
                    { value: 'auto', label: lang === 'bn' ? 'সেটিংস থেকে অটো' : 'Auto from settings' },
                  ]} />
                </Row>
                {(l.source || 'manual') === 'manual' && (
                  <Row label={lang === 'bn' ? 'প্ল্যাটফর্ম' : 'Platforms'}>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[160px]">
                      {['facebook', 'instagram', 'tiktok', 'linkedin', 'youtube', 'x', 'whatsapp'].map(p => {
                        const on = (l.platforms || []).includes(p);
                        return (
                          <button key={p} type="button"
                            onClick={() => setLayer(i, 'platforms', on ? l.platforms.filter(x => x !== p) : [...(l.platforms || []), p])}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${on ? 'bg-[#1a56db] text-white border-[#1a56db]' : 'bg-white text-gray-400 border-gray-200'}`}>{p}</button>
                        );
                      })}
                    </div>
                  </Row>
                )}
                {(l.source) === 'auto' && <div className="text-[10px] text-gray-400 py-1">{lang === 'bn' ? 'সেটিংসে যেসব সোশ্যাল লিংক আছে শুধু সেগুলো দেখাবে।' : 'Shows only platforms that have a URL in settings.'}</div>}
                <Row label={lang === 'bn' ? 'স্টাইল' : 'Style'}>
                  <Select value={l.style || 'badge'} onChange={v => setLayer(i, 'style', v)} options={[
                    { value: 'badge', label: lang === 'bn' ? 'ব্যাজ (গোল + আইকন)' : 'Badge (circle + icon)' },
                    { value: 'plain', label: lang === 'bn' ? 'শুধু আইকন' : 'Icon only' },
                  ]} />
                </Row>
                <Row label={lang === 'bn' ? 'বার ব্যাকগ্রাউন্ড' : 'Bar background'}><Color value={l.bg} onChange={v => setLayer(i, 'bg', v)} /></Row>
                <Row label={(l.style || 'badge') === 'plain' ? (lang === 'bn' ? 'আইকন রঙ' : 'Icon color') : (lang === 'bn' ? 'ব্যাজ রঙ (খালি=ব্র্যান্ড)' : 'Badge color (empty=brand)')}><Color value={l.iconColor} onChange={v => setLayer(i, 'iconColor', v)} /></Row>
                {(l.style || 'badge') === 'badge' && <Row label={lang === 'bn' ? 'আইকন রঙ' : 'Glyph color'}><Color value={l.glyphColor} onChange={v => setLayer(i, 'glyphColor', v)} /></Row>}
                <Row label={lang === 'bn' ? 'লেবেল দেখাও' : 'Show labels'}><Toggle checked={l.showLabels} onChange={v => setLayer(i, 'showLabels', v)} /></Row>
                {l.showLabels && (
                  <>
                    <Row label={lang === 'bn' ? 'লেবেল ফন্ট' : 'Label font'}><FontSelect value={l.font} onChange={v => setLayer(i, 'font', v)} /></Row>
                    <Row label={lang === 'bn' ? 'লেবেল সাইজ' : 'Label size'}>
                      <button type="button" onClick={() => setLayer(i, 'labelSize', 0)} title={lang === 'bn' ? 'আইকনের সাথে বাঁধা' : 'Tied to icon size'}
                        className={`text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 ${!l.labelSize ? 'bg-[#1a56db] text-white border-[#1a56db]' : 'border-gray-300 text-gray-500'}`}>{lang === 'bn' ? 'অটো' : 'Auto'}</button>
                      <Slider value={l.labelSize || Math.round((l.size || 34) * 0.62)} min={8} max={120} onChange={v => setLayer(i, 'labelSize', v)} />
                    </Row>
                    <Row label={lang === 'bn' ? 'লেবেল রঙ' : 'Label color'}><Color value={l.labelColor} onChange={v => setLayer(i, 'labelColor', v)} /></Row>
                    <Row label={lang === 'bn' ? 'লেবেল কেস (ইংরেজি)' : 'Label case (English)'}>
                      <Select value={l.labelCase || 'none'} onChange={v => setLayer(i, 'labelCase', v)} options={[
                        { value: 'none', label: lang === 'bn' ? 'যেমন আছে' : 'As typed' },
                        { value: 'upper', label: 'UPPERCASE' },
                        { value: 'lower', label: 'lowercase' },
                        { value: 'title', label: 'Title Case' },
                        { value: 'sentence', label: 'Sentence case' },
                      ]} />
                    </Row>
                    <div className="py-1">
                      <div className="text-[11px] text-gray-500 mb-1">{lang === 'bn' ? 'কাস্টম লেবেল (খালি = ডিফল্ট)' : 'Custom labels (empty = default)'}</div>
                      {(l.source === 'auto' ? ['facebook', 'instagram', 'tiktok', 'linkedin', 'youtube', 'x', 'whatsapp'] : (l.platforms || [])).map(p => (
                        <div key={p} className="flex items-center gap-2 py-0.5">
                          <span className="text-[10px] text-gray-400 w-14 flex-shrink-0 truncate">{p}</span>
                          <input value={(l.labels && l.labels[p]) || ''} placeholder={p}
                            onChange={e => setLayer(i, 'labels', { ...(l.labels || {}), [p]: e.target.value })}
                            className="flex-1 min-w-0 text-xs border border-gray-200 rounded px-2 py-1" />
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <Row label={lang === 'bn' ? 'আইকন সাইজ' : 'Icon size'}><Slider value={l.size} min={16} max={80} onChange={v => setLayer(i, 'size', v)} /></Row>
                <Row label={lang === 'bn' ? 'গ্যাপ' : 'Gap'}><Slider value={l.gap} min={4} max={120} onChange={v => setLayer(i, 'gap', v)} /></Row>
                <Row label={lang === 'bn' ? 'অ্যালাইন' : 'Align'}><AlignSelect value={l.align} onChange={v => setLayer(i, 'align', v)} /></Row>
              </>
            )}
            <Row label={lang === 'bn' ? 'রোটেট° / অপাসিটি' : 'Rotate° / Opacity'}><Num value={l.rotation} min={-180} max={180} onChange={v => setLayer(i, 'rotation', v)} width="w-14" /><Slider value={l.opacity} min={0} max={100} onChange={v => setLayer(i, 'opacity', v)} /></Row>
          </div>
        ))}
      </Section>
    </div>
  );
}
