import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { X, Download, Loader2, Image as ImageIcon, Palette } from 'lucide-react';
import { renderConfig, downloadConfig } from './dynamicRenderer.js';
import { normalizeConfig } from './schema.js';
import TemplateThumb from './TemplateThumb.jsx';

export default function PhotoCardModal({ article, onClose }) {
  const { props } = usePage();
  const [adsByPos, setAdsByPos] = useState({});
  const settings  = { ...(props.settings || {}), ads: adsByPos };

  const [templates,    setTemplates]    = useState([]);
  const [loadingList,  setLoadingList]  = useState(true);
  const [selectedId,   setSelectedId]   = useState(null);
  const [rendering,    setRendering]    = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const canvasRef = useRef(null);

  const selected = templates.find(t => t.id === selectedId) || null;

  // Fetch active ad images by position (for {{ad:position}} tokens).
  useEffect(() => {
    window.axios.get(route('admin.photocard-templates.ads')).then(r => setAdsByPos(r.data.byPosition || {})).catch(() => {});
  }, []);

  // Fetch active templates from the DB.
  useEffect(() => {
    let cancelled = false;
    window.axios.get(route('admin.photocard-templates.list'))
      .then(res => {
        if (cancelled) return;
        const list = res.data.templates || [];
        setTemplates(list);
        setSelectedId(list[0]?.id ?? null);
      })
      .catch(() => { if (!cancelled) setPreviewError(true); })
      .finally(() => { if (!cancelled) setLoadingList(false); });
    return () => { cancelled = true; };
  }, []);

  // Render preview whenever the selected template or article changes.
  useEffect(() => {
    if (!selected || !canvasRef.current) return;
    let cancelled = false;
    setRendering(true);
    setPreviewError(false);

    const cfg = normalizeConfig(selected.config);
    renderConfig(canvasRef.current, cfg, article, settings)
      .catch(() => { if (!cancelled) setPreviewError(true); })
      .finally(() => { if (!cancelled) setRendering(false); });

    return () => { cancelled = true; };
  }, [selectedId, article?.id]);

  const handleDownload = async (type = 'png') => {
    if (downloading || !selected) return;
    setDownloading(true);
    try {
      await downloadConfig(normalizeConfig(selected.config), article, settings, article.slug || 'photocard', { type });
    } catch (err) {
      console.error('PhotoCard download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            <span className="font-bold text-sm text-gray-800">ফটো কার্ড ডাউনলোড</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template picker — visual thumbnails */}
        {!loadingList && templates.length > 0 && (
          <div className="flex gap-2 px-5 pt-4 overflow-x-auto pb-1">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                title={t.name_bn || t.name_en}
                className={`flex-shrink-0 w-[68px] rounded-lg border-2 overflow-hidden transition-all ${
                  selectedId === t.id ? 'border-[#263238]' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="h-[68px] bg-gray-100 flex items-center justify-center overflow-hidden">
                  <TemplateThumb config={t.config} settings={settings} data={article} className="max-w-full max-h-full object-contain" />
                </div>
                <div className={`text-[9px] font-bold truncate px-1 py-0.5 ${selectedId === t.id ? 'bg-[#263238] text-white' : 'text-gray-500'}`}>
                  {t.name_bn || t.name_en}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Canvas preview */}
        <div className="px-5 py-4">
          <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: 240 }}>
            {(loadingList || rendering) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
            {!loadingList && templates.length === 0 && (
              <div className="flex flex-col items-center justify-center text-gray-400 gap-2 py-12 px-6 text-center">
                <Palette className="w-10 h-10" />
                <span className="text-xs">কোনো টেমপ্লেট নেই — ফটোকার্ড স্টুডিওতে একটি তৈরি করুন</span>
              </div>
            )}
            {previewError && !rendering && !loadingList && templates.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                <ImageIcon className="w-10 h-10" />
                <span className="text-xs">প্রিভিউ লোড করা সম্ভব হয়নি</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-h-[60vh] object-contain"
              style={{ display: loadingList || rendering || previewError || templates.length === 0 ? 'none' : 'block' }}
            />
          </div>
          {selected && (
            <p className="text-[10px] text-gray-400 text-center mt-2">
              প্রিভিউ — ডাউনলোড হবে {selected.config?.canvas?.width || 1080}×{selected.config?.canvas?.height || 1080} PNG
            </p>
          )}
        </div>

        {/* Article title */}
        <div className="px-5 pb-2">
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{article.title}</p>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            বাতিল
          </button>
          <button
            onClick={() => handleDownload('jpg')}
            disabled={downloading || rendering || !selected}
            title="ছোট ফাইল"
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            JPG
          </button>
          <button
            onClick={() => handleDownload('png')}
            disabled={downloading || rendering || !selected}
            className="flex-1 py-2.5 rounded-xl bg-[#263238] text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#1a2428] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> তৈরি হচ্ছে...</>
              : <><Download className="w-4 h-4" /> PNG ডাউনলোড</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
