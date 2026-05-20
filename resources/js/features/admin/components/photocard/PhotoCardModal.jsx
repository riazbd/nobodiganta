import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { X, Download, Loader2, Image as ImageIcon } from 'lucide-react';
import {
  getAllTemplates,
  renderToCanvas,
  downloadCard,
} from './PhotoCardEngine.js';

// Side-effect import — registers all built-in templates into the engine
import './templates/index.js';

export default function PhotoCardModal({ article, onClose }) {
  const { props } = usePage();
  const settings  = props.settings || {};

  const templates = getAllTemplates();
  const [selectedId,   setSelectedId]   = useState(templates[0]?.id ?? '');
  const [rendering,    setRendering]    = useState(false);
  const [downloading,  setDownloading]  = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const canvasRef = useRef(null);

  // Re-render preview whenever template or article changes
  useEffect(() => {
    if (!selectedId || !canvasRef.current) return;
    let cancelled = false;

    setRendering(true);
    setPreviewError(false);

    renderToCanvas(selectedId, article, settings)
      .then(offscreen => {
        if (cancelled || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width  = offscreen.width;
        canvasRef.current.height = offscreen.height;
        ctx.drawImage(offscreen, 0, 0);
      })
      .catch(() => { if (!cancelled) setPreviewError(true); })
      .finally(() => { if (!cancelled) setRendering(false); });

    return () => { cancelled = true; };
  }, [selectedId, article?.id]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await downloadCard(selectedId, article, settings);
    } catch (err) {
      console.error('PhotoCard download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Close on Escape
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Template picker — only shown when >1 template registered */}
        {templates.length > 1 && (
          <div className="flex gap-2 px-5 pt-4 overflow-x-auto pb-1">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  selectedId === t.id
                    ? 'bg-[#263238] text-white border-[#263238]'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {t.nameBn || t.name}
              </button>
            ))}
          </div>
        )}

        {/* Canvas preview */}
        <div className="px-5 py-4">
          <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
            {rendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            )}
            {previewError && !rendering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                <ImageIcon className="w-10 h-10" />
                <span className="text-xs">প্রিভিউ লোড করা সম্ভব হয়নি</span>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{ display: rendering || previewError ? 'none' : 'block' }}
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            প্রিভিউ — ডাউনলোড হবে 1080×1080 PNG
          </p>
        </div>

        {/* Article title */}
        <div className="px-5 pb-2">
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {article.title}
          </p>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            বাতিল
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || rendering}
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
