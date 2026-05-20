const registry = new Map();

/**
 * Register a template. Call this once per template module.
 * template shape: { id, name, nameBn, width, height, render }
 */
export function registerTemplate(template) {
  registry.set(template.id, template);
}

/** Get one template by id, or null */
export function getTemplate(id) {
  return registry.get(id) ?? null;
}

/** Return all registered templates in insertion order */
export function getAllTemplates() {
  return Array.from(registry.values());
}

/**
 * Render a template onto an offscreen canvas and return the canvas.
 * @param {string} templateId
 * @param {object} article  — { title, title_en, featured_image, published_at, slug }
 * @param {object} settings — { site_logo, site_url, site_name }
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderToCanvas(templateId, article, settings) {
  const template = getTemplate(templateId);
  if (!template) throw new Error(`Template "${templateId}" not found`);

  const canvas = document.createElement('canvas');
  canvas.width  = template.width;
  canvas.height = template.height;

  await template.render(canvas, article, settings);
  return canvas;
}

/**
 * Render and trigger a PNG download.
 * @returns {Promise<void>}
 */
export async function downloadCard(templateId, article, settings) {
  const canvas = await renderToCanvas(templateId, article, settings);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error('Canvas toBlob failed'));
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${article.slug || 'photocard'}-${templateId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}
