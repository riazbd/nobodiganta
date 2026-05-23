import { useEffect, useRef } from 'react';

/**
 * RichTextEditor — a wrapper for Quill.js RTE.
 * Uses the global Quill object loaded from CDN in app.blade.php.
 */
export default function RichTextEditor({ value, onChange, placeholder, lang = 'bn' }) {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Quill && editorRef.current && !quillInstance.current) {
      quillInstance.current = new window.Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder || (lang === 'bn' ? 'এখানে লিখুন...' : 'Write here...'),
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['link', 'blockquote', 'code-block'],
            ['clean']
          ]
        }
      });

      // Set initial value
      if (value) {
        quillInstance.current.root.innerHTML = value;
      }

      // Handle changes
      quillInstance.current.on('text-change', () => {
        if (!isInternalChange.current) {
          const html = quillInstance.current.root.innerHTML;
          // Prevent emitting change if it's just an empty paragraph (Quill default)
          const sanitized = html === '<p><br></p>' ? '' : html;
          onChange(sanitized);
        }
      });
    }

    return () => {
      // Cleanup if needed (Quill doesn't have a formal destroy, but we can clear references)
      if (quillInstance.current) {
        // Option: remove listeners
      }
    };
  }, []); // Only run once on mount

  // Sync value from props to editor (one-way sync for external changes like form resets or auto-fills)
  useEffect(() => {
    if (quillInstance.current) {
      const currentHtml = quillInstance.current.root.innerHTML;
      const sanitizedValue = value === '' ? '<p><br></p>' : value;
      
      if (value !== currentHtml && value !== sanitizedValue) {
        isInternalChange.current = true;
        quillInstance.current.root.innerHTML = value || '';
        isInternalChange.current = false;
      }
    }
  }, [value]);

  return (
    <div className="quill-editor-container bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        .ql-container {
          font-family: 'Noto Sans Bengali', 'Inter', sans-serif !important;
          font-size: 15px !important;
          font-weight: 400 !important;
          min-height: 300px;
        }
        .ql-editor {
          min-height: 300px;
          line-height: 1.7;
          font-size: 15px !important;
          font-weight: 400 !important;
        }
        .ql-editor h1, .ql-editor h2, .ql-editor h3,
        .ql-editor h4, .ql-editor h5, .ql-editor h6 {
          font-weight: 700;
        }
        .ql-toolbar.ql-snow {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-color: #e8ebf4;
          background: #f8fafc;
        }
        .ql-container.ql-snow {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border-color: #e8ebf4;
        }
        .ql-snow .ql-stroke {
          stroke: #64748b;
        }
        .ql-snow .ql-fill {
          fill: #64748b;
        }
        .ql-snow.ql-toolbar button:hover .ql-stroke,
        .ql-snow.ql-toolbar button.ql-active .ql-stroke {
          stroke: #263238;
        }
      `}} />
      <div ref={editorRef} />
    </div>
  );
}
