import { useState, useRef, useCallback } from 'react';

/**
 * Drag-drop media upload component.
 * Calls onFilesSelected(files: File[]) when files are chosen.
 * Does not perform the actual upload — parent handles POST.
 */
export default function MediaUpload({
  onFilesSelected,
  accept = 'image/*,video/*',
  maxSizeMB = 10,
  multiple = true,
  label = 'Drop files here or click to browse',
}) {
  const [previews, setPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);

  const processFiles = useCallback((fileList) => {
    const files = Array.from(fileList);
    const errs = [];
    const valid = files.filter((f) => {
      if (f.size > maxSizeMB * 1024 * 1024) {
        errs.push(`${f.name} exceeds ${maxSizeMB}MB limit`);
        return false;
      }
      return true;
    });

    setErrors(errs);

    const newPreviews = valid.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
    onFilesSelected?.(valid);
  }, [maxSizeMB, onFilesSelected]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const removePreview = (index) => {
    setPreviews((prev) => {
      const updated = [...prev];
      if (updated[index].url) URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  };

  return (
    <div>
      <div
        className={`media-upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={label}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <div style={{ textAlign: 'center', color: '#888', pointerEvents: 'none' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
          <p style={{ fontSize: 13, margin: 0 }}>{label}</p>
          <p style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>Max {maxSizeMB}MB per file</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {errors.map((err, i) => (
            <div key={i} style={{ color: '#dc2626', fontSize: 12 }}>{err}</div>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <div className="media-preview-grid" style={{ marginTop: 12 }}>
          {previews.map((p, i) => (
            <div key={i} className="media-preview-item">
              {p.url ? (
                <img src={p.url} alt={p.name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 3 }} />
              ) : (
                <div style={{ width: '100%', height: 80, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, fontSize: 24 }}>
                  🎬
                </div>
              )}
              <div style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3, color: '#555' }}>
                {p.name}
              </div>
              <button
                onClick={() => removePreview(i)}
                style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 11, lineHeight: '18px', padding: 0 }}
                aria-label={`Remove ${p.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
