export default function EpaperViewer({ url, title = '' }) {
  if (!url) return null;

  const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div style={{ width: '100%' }}>
      <object
        data={url}
        type="application/pdf"
        width="100%"
        height="600"
        style={{ borderRadius: 4, border: '1px solid var(--border)' }}
        title={title}
      >
        {/* Fallback: Google Docs viewer */}
        <iframe
          src={googleDocsUrl}
          title={title}
          width="100%"
          height="600"
          style={{ border: 0, borderRadius: 4 }}
          allowFullScreen
        />
      </object>
    </div>
  );
}
