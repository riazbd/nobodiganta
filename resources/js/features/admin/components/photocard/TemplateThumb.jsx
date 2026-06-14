import { useEffect, useRef } from 'react';
import { renderConfig } from './dynamicRenderer.js';
import { normalizeConfig, SAMPLE_DATA } from './schema.js';

// Small live-rendered preview of a template config (used in the template list & modal).
export default function TemplateThumb({ config, settings, data = SAMPLE_DATA, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    let cancelled = false;
    if (ref.current) {
      renderConfig(ref.current, normalizeConfig(config), data, settings).catch(() => {});
    }
    return () => { cancelled = true; };
  }, [config, settings, data]);
  return <canvas ref={ref} className={className} />;
}
