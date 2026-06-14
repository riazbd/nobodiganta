import { useEffect, useRef, useState, useCallback } from 'react';
import { drawNow, ensureAssets } from './dynamicRenderer.js';
import { ensureConfigFonts } from './fonts.js';
import { listElements, elementBox, setElementBox, assetUrls } from './elements.js';

const RS = 18; // ruler thickness (px)

const HANDLES = [
  { id: 'nw', cx: 0,   cy: 0,   cur: 'nwse-resize' }, { id: 'n', cx: 0.5, cy: 0,   cur: 'ns-resize' }, { id: 'ne', cx: 1, cy: 0,   cur: 'nesw-resize' },
  { id: 'w',  cx: 0,   cy: 0.5, cur: 'ew-resize' },                                                     { id: 'e',  cx: 1, cy: 0.5, cur: 'ew-resize' },
  { id: 'sw', cx: 0,   cy: 1,   cur: 'nesw-resize' }, { id: 's', cx: 0.5, cy: 1,   cur: 'ns-resize' }, { id: 'se', cx: 1, cy: 1,   cur: 'nwse-resize' },
];

function resizeBox(start, h, dx, dy) {
  let { x, y, w, h: hh } = start;
  if (h.includes('w')) { x = start.x + dx; w = start.w - dx; }
  if (h.includes('e')) { w = start.w + dx; }
  if (h.includes('n')) { y = start.y + dy; hh = start.h - dy; }
  if (h.includes('s')) { hh = start.h + dy; }
  if (w < 2)  { w = 2;  if (h.includes('w')) x = start.x + start.w - 2; }
  if (hh < 2) { hh = 2; if (h.includes('n')) y = start.y + start.h - 2; }
  return { x, y, w, h: hh };
}

// Snap targets (canvas coords) from every element except the one being dragged.
function snapTargets(config, exceptKey, W, H) {
  const vx = [0, W / 2, W], hy = [0, H / 2, H];
  for (const { key } of listElements(config)) {
    if (key === exceptKey) continue;
    const b = elementBox(config, key);
    vx.push(b.x, b.x + b.w / 2, b.x + b.w);
    hy.push(b.y, b.y + b.h / 2, b.y + b.h);
  }
  return { vx, hy };
}
function nearest(value, candidates, th) {
  let best = null, bd = th;
  for (const c of candidates) { const d = Math.abs(value - c); if (d <= bd) { bd = d; best = c; } }
  return best;
}

export default function PhotocardEditor({ config, data, settings, selectedKey, onSelect, onChange, lang = 'bn' }) {
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const [scale, setScale] = useState(0);
  const [tick, setTick]   = useState(0);
  const [guides, setGuides] = useState({ v: null, h: null });
  const [readout, setReadout] = useState(null);
  const drag = useRef(null);
  const cfgRef = useRef(config); cfgRef.current = config;

  const W = config.canvas?.width || 1080;
  const H = config.canvas?.height || 1080;

  useEffect(() => {
    const measure = () => { if (wrapRef.current) setScale(wrapRef.current.clientWidth / W); };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [W]);

  const urls = assetUrls(config, data, settings).join('|');
  const fontsKey = [config.headline?.font, config.cta?.font, config.urlText?.font, config.dateText?.font,
                    config.adBanner?.textFont, ...(config.layers || []).map(l => l.font)].filter(Boolean).join('|');
  useEffect(() => {
    let cancelled = false;
    ensureAssets(assetUrls(config, data, settings)).then(() => { if (!cancelled) setTick(t => t + 1); });
    ensureConfigFonts(config).then(() => { if (!cancelled) setTick(t => t + 1); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls, fontsKey]);

  // Synchronous redraw on every change — no flicker.
  useEffect(() => { if (canvasRef.current) drawNow(canvasRef.current, config, data, settings); }, [config, data, settings, tick]);

  function attach() {
    let raf = 0, lastEv = null;

    const apply = () => {
      raf = 0;
      const d = drag.current, ev = lastEv;
      if (!d || !ev) return;
      const s = d.scale || 1;
      const dx = (ev.clientX - d.px) / s, dy = (ev.clientY - d.py) / s;
      let box = d.mode === 'move' ? { ...d.start, x: d.start.x + dx, y: d.start.y + dy } : resizeBox(d.start, d.handle, dx, dy);

      // ── snapping (single nearest target wins; tighter for less jitter) ──
      const th = 6 / s;
      let gv = null, gh = null;
      const { vx, hy } = d.targets;
      const snapAxis = (anchors, cands) => {
        let best = null, bestD = th;
        for (const a of anchors) for (const cand of cands) {
          const dd = Math.abs(a.val - cand);
          if (dd < bestD) { bestD = dd; best = { shift: cand - a.val, line: cand }; }
        }
        return best;
      };
      if (d.mode === 'move') {
        const sx = snapAxis([{ val: box.x }, { val: box.x + box.w / 2 }, { val: box.x + box.w }], vx);
        if (sx) { box.x += sx.shift; gv = sx.line; }
        const sy = snapAxis([{ val: box.y }, { val: box.y + box.h / 2 }, { val: box.y + box.h }], hy);
        if (sy) { box.y += sy.shift; gh = sy.line; }
      } else {
        if (d.handle.includes('w')) { const c = nearest(box.x, vx, th); if (c != null) { box.w += box.x - c; box.x = c; gv = c; } }
        if (d.handle.includes('e')) { const c = nearest(box.x + box.w, vx, th); if (c != null) { box.w = c - box.x; gv = c; } }
        if (d.handle.includes('n')) { const c = nearest(box.y, hy, th); if (c != null) { box.h += box.y - c; box.y = c; gh = c; } }
        if (d.handle.includes('s')) { const c = nearest(box.y + box.h, hy, th); if (c != null) { box.h = c - box.y; gh = c; } }
      }
      setGuides({ v: gv, h: gh });
      setReadout({ x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.w), h: Math.round(box.h) });
      onChange(setElementBox(cfgRef.current, d.key, box, d.mode === 'resize' ? d.handle : null));
    };

    // Throttle to one update per animation frame → smooth, no scatter.
    const onMove = (ev) => { lastEv = ev; if (!raf) raf = requestAnimationFrame(apply); };
    const onUp = () => {
      if (raf) cancelAnimationFrame(raf);
      drag.current = null; setGuides({ v: null, h: null }); setReadout(null);
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  const beginMove = useCallback((e, key) => {
    e.preventDefault(); e.stopPropagation(); onSelect?.(key);
    drag.current = { mode: 'move', key, start: elementBox(cfgRef.current, key), px: e.clientX, py: e.clientY, scale, targets: snapTargets(cfgRef.current, key, W, H) };
    attach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, W, H, onSelect, onChange]);

  const beginResize = useCallback((e, key, handle) => {
    e.preventDefault(); e.stopPropagation(); onSelect?.(key);
    drag.current = { mode: 'resize', key, handle, start: elementBox(cfgRef.current, key), px: e.clientX, py: e.clientY, scale, targets: snapTargets(cfgRef.current, key, W, H) };
    attach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, W, H, onSelect, onChange]);

  // Resize the whole canvas (document) — origin fixed at top-left, so right/bottom/corner only.
  const beginCanvasResize = useCallback((e, handle) => {
    e.preventDefault(); e.stopPropagation(); onSelect?.('__canvas__');
    const startW = cfgRef.current.canvas?.width || 1080, startH = cfgRef.current.canvas?.height || 1080;
    const px = e.clientX, py = e.clientY, s = scale || 1;
    const onMove = (ev) => {
      const dx = (ev.clientX - px) / s, dy = (ev.clientY - py) / s;
      const w = handle.includes('e') ? Math.max(200, Math.round(startW + dx)) : startW;
      const h = handle.includes('s') ? Math.max(200, Math.round(startH + dy)) : startH;
      setReadout({ x: 0, y: 0, w, h });
      onChange({ ...cfgRef.current, canvas: { ...cfgRef.current.canvas, width: w, height: h } });
    };
    const onUp = () => { setReadout(null); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [scale, onSelect, onChange]);

  // Press Escape to deselect.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onSelect?.(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSelect]);

  const els = listElements(config);
  const canvasSel = selectedKey === '__canvas__';
  const selMeta = els.find(e => e.key === selectedKey) || null;
  // Selected element's box — highlighted on the rulers so you can read/align its exact position.
  const selBox = (selMeta && !canvasSel) ? elementBox(config, selectedKey) : null;

  // ── Click selection with cycle-through for stacked elements (Alt/right-click digs deeper) ──
  const onCanvasPointerDown = useCallback((e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const s = rect.width / W;
    const px = (e.clientX - rect.left) / s, py = (e.clientY - rect.top) / s;
    const list = listElements(cfgRef.current);
    const hits = list.filter(el => !el.locked && (() => { const b = elementBox(cfgRef.current, el.key); return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h; })());
    hits.reverse(); // front → back
    if (!hits.length) { onSelect?.(null); return; }
    const idx = hits.findIndex(h => h.key === selectedKey);
    let target;
    if ((e.altKey || e.button === 2) && idx !== -1) target = hits[(idx + 1) % hits.length].key; // dig deeper
    else if (idx !== -1) target = selectedKey;          // click on selected → just drag it
    else target = hits[0].key;                          // frontmost
    beginMove(e, target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [W, selectedKey, onSelect, beginMove]);

  // Ruler ticks
  const step = W > 1500 || H > 1500 ? 200 : 100;
  const xticks = []; for (let x = 0; x <= W; x += step) xticks.push(x);
  const yticks = []; for (let y = 0; y <= H; y += step) yticks.push(y);

  return (
    <div className="relative" style={{ paddingTop: RS, paddingLeft: RS }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onSelect?.(null); }}>

      {/* element selector chips */}
      <div className="absolute -top-9 left-0 right-0 flex flex-wrap gap-1">
        <button onClick={() => onSelect?.(canvasSel ? null : '__canvas__')}
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${canvasSel ? 'bg-[#0d9488] text-white border-[#0d9488]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
          {lang === 'bn' ? 'ক্যানভাস' : 'Canvas'}
        </button>
        {els.map(({ key, label }) => (
          <button key={key} onClick={() => onSelect?.(selectedKey === key ? null : key)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${selectedKey === key ? 'bg-[#1a56db] text-white border-[#1a56db]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* corner */}
      <div className="absolute top-0 left-0 bg-gray-200" style={{ width: RS, height: RS }} />
      {/* top ruler */}
      <div className="absolute top-0 bg-gray-50 border-b border-gray-200 overflow-hidden" style={{ left: RS, right: 0, height: RS }}>
        {selBox && <div className="absolute top-0 bottom-0 bg-[#1a56db]/25 border-x border-[#1a56db]/50" style={{ left: selBox.x * scale, width: selBox.w * scale }} />}
        {scale > 0 && xticks.map(x => (
          <div key={x} className="absolute top-0 bottom-0 border-l border-gray-300/70" style={{ left: x * scale }}>
            <span className="absolute top-px left-0.5 text-[7px] text-gray-400 leading-none">{x}</span>
          </div>
        ))}
        {guides.v != null && <div className="absolute top-0 bottom-0 w-px bg-[#e8001e]" style={{ left: guides.v * scale }} />}
      </div>
      {/* left ruler */}
      <div className="absolute left-0 bg-gray-50 border-r border-gray-200 overflow-hidden" style={{ top: RS, bottom: 0, width: RS }}>
        {selBox && <div className="absolute left-0 right-0 bg-[#1a56db]/25 border-y border-[#1a56db]/50" style={{ top: selBox.y * scale, height: selBox.h * scale }} />}
        {scale > 0 && yticks.map(y => (
          <div key={y} className="absolute left-0 right-0 border-t border-gray-300/70" style={{ top: y * scale }}>
            <span className="absolute left-0.5 top-px text-[7px] text-gray-400 leading-none">{y}</span>
          </div>
        ))}
        {guides.h != null && <div className="absolute left-0 right-0 h-px bg-[#e8001e]" style={{ top: guides.h * scale }} />}
      </div>

      {/* canvas area */}
      <div ref={wrapRef} className="relative w-full select-none touch-none" style={{ aspectRatio: `${W} / ${H}` }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded-sm shadow-lg bg-gray-200" />

        {/* single hit layer — handles all click selection (+ Alt/right-click to cycle stacked) & drag */}
        {scale > 0 && (
          <div className="absolute inset-0 z-10" onPointerDown={onCanvasPointerDown} onContextMenu={(e) => e.preventDefault()} />
        )}

        {/* snap guide lines across canvas */}
        {guides.v != null && <div className="absolute top-0 bottom-0 w-px bg-[#e8001e]/70 pointer-events-none z-[60]" style={{ left: guides.v * scale }} />}
        {guides.h != null && <div className="absolute left-0 right-0 h-px bg-[#e8001e]/70 pointer-events-none z-[60]" style={{ top: guides.h * scale }} />}

        {/* selection box for the selected element */}
        {scale > 0 && selBox && (
          <div className={`absolute z-50 pointer-events-none ${selMeta.locked ? 'ring-2 ring-amber-400' : 'ring-2 ring-[#1a56db]'}`}
            style={{ left: selBox.x * scale, top: selBox.y * scale, width: selBox.w * scale, height: selBox.h * scale }}>
            <span className="absolute -top-4 left-0 px-1 rounded text-[9px] font-bold whitespace-nowrap bg-[#1a56db] text-white">{selMeta.label}</span>
            {!selMeta.locked && HANDLES.map(h => (
              <span key={h.id} data-handle="1" onPointerDown={(e) => beginResize(e, selectedKey, h.id)}
                className="absolute flex items-center justify-center pointer-events-auto"
                style={{ left: `calc(${h.cx * 100}% - 11px)`, top: `calc(${h.cy * 100}% - 11px)`, width: 22, height: 22, cursor: h.cur, zIndex: 55 }}>
                <span className="bg-white border border-[#1a56db] rounded-[1px]" style={{ width: 5, height: 5 }} />
              </span>
            ))}
          </div>
        )}

        {/* Canvas (document) resize frame — right / bottom / corner handles */}
        {scale > 0 && canvasSel && (
          <div className="absolute inset-0 ring-2 ring-[#0d9488] pointer-events-none z-50">
            {[{ id: 'e', cx: 1, cy: 0.5, cur: 'ew-resize' }, { id: 's', cx: 0.5, cy: 1, cur: 'ns-resize' }, { id: 'se', cx: 1, cy: 1, cur: 'nwse-resize' }].map(h => (
              <span key={h.id} onPointerDown={(e) => beginCanvasResize(e, h.id)}
                className="absolute flex items-center justify-center pointer-events-auto"
                style={{ left: `calc(${h.cx * 100}% - 11px)`, top: `calc(${h.cy * 100}% - 11px)`, width: 22, height: 22, cursor: h.cur }}>
                <span className="bg-white border border-[#0d9488] rounded-[1px]" style={{ width: 5, height: 5 }} />
              </span>
            ))}
          </div>
        )}

        {/* live position/size readout */}
        {readout && (
          <div className="absolute top-1 left-1 bg-black/75 text-white text-[10px] font-mono px-1.5 py-0.5 rounded pointer-events-none z-[70]">
            {readout.x},{readout.y} · {readout.w}×{readout.h}
          </div>
        )}
      </div>
    </div>
  );
}
