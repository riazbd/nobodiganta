import { useState, useEffect, useRef, useCallback, useReducer, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Copy, Trash2, Download, Save, FilePlus, Image as ImageIcon, Eye, Undo2, Redo2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import PhotocardEditor from '../../components/photocard/PhotocardEditor.jsx';
import StudioControls from '../../components/photocard/StudioControls.jsx';
import { downloadConfig } from '../../components/photocard/dynamicRenderer.js';
import TemplateThumb from '../../components/photocard/TemplateThumb.jsx';
import { defaultConfig, normalizeConfig, SAMPLE_DATA, makeLayer } from '../../components/photocard/schema.js';
import { elementBox, setElementBox } from '../../components/photocard/elements.js';

// Immutable dot-path setter: setIn(obj, 'a.b.c', val)
function setIn(obj, path, value) {
  const keys = path.split('.');
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return clone;
}

// History reducer for undo/redo. Rapid changes within 400ms coalesce into one step.
function historyReducer(state, action) {
  const { past, present, future, lastTs } = state;
  switch (action.type) {
    case 'set': {
      const value = typeof action.value === 'function' ? action.value(present) : action.value;
      if (value === present) return state;
      const coalesce = action.ts - lastTs < 400 && past.length > 0;
      return { past: coalesce ? past : [...past, present].slice(-60), present: value, future: [], lastTs: action.ts };
    }
    case 'undo':
      if (!past.length) return state;
      return { past: past.slice(0, -1), present: past[past.length - 1], future: [present, ...future], lastTs: 0 };
    case 'redo':
      if (!future.length) return state;
      return { past: [...past, present], present: future[0], future: future.slice(1), lastTs: 0 };
    case 'reset':
      return { past: [], present: action.value, future: [], lastTs: 0 };
    default:
      return state;
  }
}

export default function PhotocardStudio() {
  const { props }   = usePage();
  const templates   = props.templates || [];
  const baseSettings = props.settings || {};
  const { lang }    = useLanguage();
  const { showToast } = useToast();

  // Active ads by position (for the dynamic {{ad:position}} token).
  const [adsByPos, setAdsByPos] = useState({});
  useEffect(() => {
    window.axios.get(route('admin.photocard-templates.ads')).then(r => setAdsByPos(r.data.byPosition || {})).catch(() => {});
  }, []);
  const settings = useMemo(() => ({ ...baseSettings, ads: adsByPos }), [baseSettings, adsByPos]);

  const [selectedId, setSelectedId] = useState(null);
  const [nameBn, setNameBn]   = useState('');
  const [nameEn, setNameEn]   = useState('');
  const [isActive, setIsActive] = useState(true);
  const [hist, dispatch] = useReducer(historyReducer, { past: [], present: defaultConfig(), future: [], lastTs: 0 });
  const config = hist.present;
  const [dirty, setDirty] = useState(false);
  const setConfig = useCallback((value) => { dispatch({ type: 'set', value, ts: Date.now() }); setDirty(true); }, []);
  const resetConfig = useCallback((value) => { dispatch({ type: 'reset', value }); setDirty(false); }, []);
  const undo = useCallback(() => { dispatch({ type: 'undo' }); setDirty(true); }, []);
  const redo = useCallback(() => { dispatch({ type: 'redo' }); setDirty(true); }, []);
  const canUndo = hist.past.length > 0;
  const canRedo = hist.future.length > 0;
  const [selectedKey, setSelectedKey] = useState(null);
  const [saving, setSaving]   = useState(false);
  const pendingSelect = useRef(null);

  // Lock the studio to the viewport so the PAGE never scrolls — only the inner
  // columns scroll. Height is measured (works whatever the topbar/header height is).
  const gridRef = useRef(null);
  const [gridH, setGridH] = useState(null);
  useEffect(() => {
    const measure = () => {
      if (typeof window === 'undefined' || window.innerWidth < 1024 || !gridRef.current) { setGridH(null); return; }
      const top = gridRef.current.getBoundingClientRect().top;
      // subtract space below the grid (studio + main bottom padding) so the page itself never scrolls
      setGridH(Math.max(360, Math.round(window.innerHeight - top - 48)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Load the first template (or a blank one) on mount.
  useEffect(() => {
    if (templates.length) loadTemplate(templates[0]);
    else newTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After a create, the props refresh — select the just-created template by name.
  useEffect(() => {
    if (pendingSelect.current) {
      const match = [...templates].reverse().find(t => t.name_bn === pendingSelect.current);
      pendingSelect.current = null;
      if (match) loadTemplate(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]);

  function loadTemplate(t) {
    setSelectedId(t.id);
    setNameBn(t.name_bn || '');
    setNameEn(t.name_en || '');
    setIsActive(!!t.is_active);
    const cfg = normalizeConfig(t.config);
    cfg._preset = t.canvas_preset || 'custom';
    resetConfig(cfg);
    setSelectedKey(null);
  }

  function newTemplate() {
    setSelectedId(null);
    setNameBn(lang === 'bn' ? 'নতুন ফটোকার্ড' : 'New Photocard');
    setNameEn('New Photocard');
    setIsActive(true);
    const cfg = defaultConfig();
    cfg._preset = 'square';
    resetConfig(cfg);
    setSelectedKey(null);
  }

  const set = useCallback((path, value) => setConfig(c => setIn(c, path, value)), [setConfig]);

  // Warn before leaving with unsaved changes (reload / close tab).
  useEffect(() => {
    const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  // ── Keyboard: undo/redo, delete, nudge, duplicate (ignored while typing) ──
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;

      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }

      const key = selectedKey;
      if (!key || key === '__canvas__') return;
      const isLayer = key.startsWith('layers.');

      // Duplicate (custom layers only)
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (isLayer) {
          const i = Number(key.split('.')[1]);
          setConfig(c => {
            const src = c.layers[i];
            const copy = { ...src, id: `L${Date.now().toString(36)}`, x: (src.x || 0) + 20, y: (src.y || 0) + 20 };
            return { ...c, layers: [...c.layers, copy] };
          });
        }
        return;
      }

      // Delete: layer → remove; core element → hide (enabled=false)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (isLayer) {
          const i = Number(key.split('.')[1]);
          setConfig(c => ({ ...c, layers: c.layers.filter((_, idx) => idx !== i) }));
          setSelectedKey(null);
        } else {
          setConfig(c => setIn(c, `${key}.enabled`, false));
          setSelectedKey(null);
        }
        return;
      }

      // Arrow nudge (Shift = 10px)
      const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (arrows[e.key]) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const [dx, dy] = arrows[e.key];
        setConfig(c => {
          const b = elementBox(c, key);
          return setElementBox(c, key, { ...b, x: b.x + dx * step, y: b.y + dy * step });
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedKey, undo, redo, setConfig]);

  const uploadAsset = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await window.axios.post(route('admin.photocard-templates.upload-asset'), fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.url;
    } catch {
      showToast(lang === 'bn' ? 'আপলোড ব্যর্থ' : 'Upload failed', 'error');
      return null;
    }
  }, [lang, showToast]);

  function payload() {
    const { _preset, ...cleanConfig } = config;
    return {
      name_bn: nameBn || (lang === 'bn' ? 'ফটোকার্ড' : 'Photocard'),
      name_en: nameEn || null,
      canvas_preset: _preset || 'custom',
      config: cleanConfig,
      is_active: isActive,
    };
  }

  function save() {
    if (saving) return;
    setSaving(true);
    const opts = {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => { showToast(lang === 'bn' ? 'সংরক্ষিত হয়েছে' : 'Saved'); setDirty(false); },
      onError:   () => showToast(lang === 'bn' ? 'সংরক্ষণ ব্যর্থ' : 'Save failed', 'error'),
      onFinish:  () => setSaving(false),
    };
    if (selectedId) router.put(route('admin.photocard-templates.update', selectedId), payload(), opts);
    else { pendingSelect.current = nameBn; router.post(route('admin.photocard-templates.store'), payload(), opts); }
  }

  function saveAsNew() {
    if (saving) return;
    setSaving(true);
    setSelectedId(null);
    pendingSelect.current = nameBn;
    router.post(route('admin.photocard-templates.store'), payload(), {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => { showToast(lang === 'bn' ? 'নতুন কপি সংরক্ষিত' : 'Saved as new'); setDirty(false); },
      onError:   () => showToast(lang === 'bn' ? 'সংরক্ষণ ব্যর্থ' : 'Save failed', 'error'),
      onFinish:  () => setSaving(false),
    });
  }

  function duplicate(t) {
    router.post(route('admin.photocard-templates.duplicate', t.id), {}, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => showToast(lang === 'bn' ? 'কপি তৈরি হয়েছে' : 'Duplicated'),
    });
  }

  function remove(t) {
    if (!confirm(lang === 'bn' ? 'এই টেমপ্লেট মুছে ফেলবেন?' : 'Delete this template?')) return;
    router.delete(route('admin.photocard-templates.destroy', t.id), {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => { showToast(lang === 'bn' ? 'মুছে ফেলা হয়েছে' : 'Deleted'); if (selectedId === t.id) newTemplate(); },
    });
  }

  async function download(type = 'png') {
    try {
      const { _preset, ...clean } = config;
      await downloadConfig(clean, SAMPLE_DATA, settings, nameEn || nameBn || 'photocard', { type });
    } catch {
      showToast(lang === 'bn' ? 'ডাউনলোড ব্যর্থ' : 'Download failed', 'error');
    }
  }

  return (
    <div className="p-4 md:p-6">
      <Head title={lang === 'bn' ? 'ফটোকার্ড স্টুডিও' : 'Photocard Studio'} />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon size={20} /> {lang === 'bn' ? 'ফটোকার্ড স্টুডিও' : 'Photocard Studio'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {lang === 'bn' ? 'নিজের মতো ফটোকার্ড ডিজাইন করুন — ফন্ট, রঙ, গ্রেডিয়েন্ট, অ্যাড ব্যানার, সবকিছু।' : 'Design your own photocards — fonts, colors, gradients, ad banners, everything.'}
          </p>
        </div>
        <button onClick={newTemplate} className="flex items-center gap-1.5 text-sm font-bold bg-[#1a56db] text-white rounded-xl px-4 py-2 hover:bg-[#1648b8]">
          <Plus size={16} /> {lang === 'bn' ? 'নতুন' : 'New'}
        </button>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-[220px_1fr_340px] gap-4" style={gridH ? { height: gridH, overflow: 'hidden' } : undefined}>

        {/* ── Template list ── */}
        <div className="space-y-2 order-2 lg:order-1 lg:h-full lg:min-h-0 lg:overflow-y-auto pr-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide px-1">{lang === 'bn' ? 'টেমপ্লেট' : 'Templates'}</div>
          {templates.map(t => (
            <div key={t.id}
              className={`group flex items-center justify-between gap-1 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${
                selectedId === t.id ? 'border-[#1a56db] bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => loadTemplate(t)}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 flex-shrink-0 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                  <TemplateThumb config={t.config} settings={settings} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-700 truncate">{lang === 'bn' ? t.name_bn : (t.name_en || t.name_bn)}</div>
                  <div className="text-[10px] text-gray-400">{t.canvas_preset}{t.is_active ? '' : ' · ' + (lang === 'bn' ? 'নিষ্ক্রিয়' : 'inactive')}</div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); duplicate(t); }} className="p-1 text-gray-400 hover:text-[#1a56db]" title="Duplicate"><Copy size={13} /></button>
                <button onClick={(e) => { e.stopPropagation(); remove(t); }} className="p-1 text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
          {templates.length === 0 && <div className="text-xs text-gray-400 px-1 py-4">{lang === 'bn' ? 'কোনো টেমপ্লেট নেই' : 'No templates yet'}</div>}
        </div>

        {/* ── Live preview (stays in place while side tools scroll) ── */}
        <div className="order-1 lg:order-2 lg:h-full lg:overflow-hidden">
          <div className="bg-gray-100 rounded-2xl p-4 lg:h-full flex flex-col justify-center">
            {/* Cap preview by viewport height (using the card's aspect ratio) so the
                canvas column never exceeds the screen — keeps it sticky, no page jump. */}
            <div className="mx-auto w-full" style={{ maxWidth: `min(460px, calc((100vh - 17rem) * ${config.canvas?.width || 1080} / ${config.canvas?.height || 1080}))` }}>
              <PhotocardEditor config={config} data={SAMPLE_DATA} settings={settings}
                selectedKey={selectedKey} onSelect={setSelectedKey} onChange={setConfig} lang={lang} />
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button onClick={undo} disabled={!canUndo} title={lang === 'bn' ? 'আগের ধাপে (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
                className="p-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"><Undo2 size={16} /></button>
              <button onClick={redo} disabled={!canRedo} title={lang === 'bn' ? 'পরের ধাপে (Ctrl+Shift+Z)' : 'Redo (Ctrl+Shift+Z)'}
                className="p-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"><Redo2 size={16} /></button>
              <button onClick={() => download('png')} className="flex items-center gap-1.5 text-sm font-bold bg-[#263238] text-white rounded-xl px-4 py-2 hover:bg-[#1a2428]">
                <Download size={15} /> PNG
              </button>
              <button onClick={() => download('jpg')} title={lang === 'bn' ? 'ছোট ফাইল (শেয়ারের জন্য)' : 'Smaller file (for sharing)'}
                className="flex items-center gap-1.5 text-sm font-bold border border-gray-300 text-gray-600 rounded-xl px-3 py-2 hover:bg-white">
                <Download size={15} /> JPG
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
              <Eye size={11} /> {lang === 'bn' ? 'ক্লিক করে সিলেক্ট/সরান · নিচের এলিমেন্ট পেতে Alt+ক্লিক · কোণ/পাশ টেনে রিসাইজ · Esc আনসিলেক্ট' : 'Click to select/move · Alt+click to reach elements underneath · drag corners/sides to resize · Esc to deselect'}
            </p>
          </div>
        </div>

        {/* ── Controls (meta/save pinned at top; only the tool list scrolls) ── */}
        <div className="order-3 flex flex-col gap-3 lg:h-full lg:min-h-0">
          {/* Meta — stays in place */}
          <div className="border border-gray-200 rounded-xl p-3 space-y-2 bg-white flex-shrink-0">
            <input value={nameBn} onChange={e => { setNameBn(e.target.value); setDirty(true); }} placeholder={lang === 'bn' ? 'নাম (বাংলা)' : 'Name (Bangla)'}
              className="w-full text-sm font-bold border border-gray-200 rounded-lg px-3 py-2" />
            <input value={nameEn} onChange={e => { setNameEn(e.target.value); setDirty(true); }} placeholder="Name (English)"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2" />
            <div className="flex items-center justify-between text-xs text-gray-600">
              {lang === 'bn' ? 'সক্রিয় (মডালে দেখাবে)' : 'Active (shown in modal)'}
              <button type="button" role="switch" aria-checked={isActive} onClick={() => { setIsActive(a => !a); setDirty(true); }}
                className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 ${isActive ? 'bg-[#16a34a]' : 'bg-gray-300'}`}>
                <span className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${isActive ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {dirty && <div className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" /> {lang === 'bn' ? 'অসংরক্ষিত পরিবর্তন' : 'Unsaved changes'}</div>}
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving} className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-bold text-white rounded-lg px-3 py-2 disabled:opacity-60 ${dirty ? 'bg-[#1a56db] hover:bg-[#1648b8]' : 'bg-[#1a56db]/90 hover:bg-[#1648b8]'}`}>
                <Save size={15} /> {selectedId ? (lang === 'bn' ? 'সংরক্ষণ' : 'Save') : (lang === 'bn' ? 'তৈরি করুন' : 'Create')}{dirty ? ' •' : ''}
              </button>
              {selectedId && (
                <button onClick={saveAsNew} disabled={saving} title={lang === 'bn' ? 'নতুন কপি হিসেবে' : 'Save as new'}
                  className="flex items-center justify-center gap-1 text-sm font-bold border border-gray-300 text-gray-600 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-60">
                  <FilePlus size={15} />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto pr-1 -mr-1 flex-1 min-h-0">
            <StudioControls config={config} set={set} onUpload={uploadAsset} lang={lang} selectedKey={selectedKey} onSelect={setSelectedKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
