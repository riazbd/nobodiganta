import { useEditor, EditorContent } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { useCallback, useState, useEffect } from 'react';
import {
  Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2, Heading3,
  Link as LinkIcon, Image as ImageIcon, Video, Highlighter, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Maximize, Minus, Type, Code, Target
} from 'lucide-react';

const AdSlotNode = Node.create({
  name: 'adSlot',
  group: 'block',
  atom: true,
  parseHTML() {
    return [{ tag: 'div[data-ad-slot]' }];
  },
  renderHTML() {
    return ['div', { 'data-ad-slot': 'true' }];
  },
  addNodeView() {
    return () => {
      const dom = document.createElement('div');
      dom.className = 'ad-slot-node';
      dom.setAttribute('contenteditable', 'false');
      dom.innerHTML = '<span>📢</span> AD SLOT';
      return { dom };
    };
  },
  addCommands() {
    return {
      insertAdSlot: () => ({ commands }) => commands.insertContent({ type: 'adSlot' }),
    };
  },
});
import MediaLibraryModal from '../media/MediaLibraryModal';

const MenuButton = ({ onClick, isActive, children, title, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-colors ${
      isActive ? 'bg-[#263238] text-white' : 'text-gray-600 hover:bg-gray-100'
    } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

export default function TiptapEditor({ value, onChange, placeholder, lang = 'bn' }) {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTarget, setMediaTarget] = useState('image'); // 'image' or 'video'

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        blockquote: {
          HTMLAttributes: {
            class: 'highlight-section',
          },
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4 border border-gray-200 shadow-sm',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#263238] underline underline-offset-4 decoration-1 font-medium',
        },
      }),
      Youtube.configure({
        width: 840,
        height: 480,
        HTMLAttributes: {
          class: 'aspect-video w-full rounded-xl my-6 shadow-lg',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || (lang === 'bn' ? 'এখানে সংবাদ লিখুন...' : 'Write your content here...'),
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      AdSlotNode,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content focus:outline-none min-h-[400px] max-w-none p-5',
      },
    },
  });

  // Critical: Sync external value changes to the editor (for auto-translate)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleMediaSelect = (media) => {
    if (mediaTarget === 'image') {
      editor.chain().focus().setImage({ src: media.url, alt: media.alt_text_bn || media.alt_text_en }).run();
    } else if (mediaTarget === 'video') {
      // If it's a youtube link, we can use Youtube extension
      if (media.url.includes('youtube.com') || media.url.includes('youtu.be')) {
        editor.chain().focus().setYoutubeVideo({ src: media.url }).run();
      } else {
        // Fallback or generic video handling could go here
        showToast('Only YouTube videos are currently supported in the editor', 'error');
      }
    }
    setShowMediaModal(false);
  };

  const addHighlightedSection = () => {
    // We can use a custom block or just a formatted paragraph
    // For now, let's use a blockquote with a specific class for "highlighted section"
    editor.chain().focus().toggleBlockquote().run();
  };

  if (!editor) return null;

  return (
    <div className="border border-[var(--card-border,#e8ebf4)] rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
      {/* Toolbar */}
      <div className="px-3 py-2 bg-gray-50 border-b border-[var(--card-border,#e8ebf4)] flex flex-wrap gap-1 sticky top-0 z-20">
        <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
           <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo className="w-4 h-4" /></MenuButton>
           <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo className="w-4 h-4" /></MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
           <MenuButton 
             onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
             isActive={editor.isActive('heading', { level: 1 })}
             title="H1"
           >
             <Heading1 className="w-4 h-4" />
           </MenuButton>
           <MenuButton 
             onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
             isActive={editor.isActive('heading', { level: 2 })}
             title="H2"
           >
             <Heading2 className="w-4 h-4" />
           </MenuButton>
           <MenuButton 
             onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
             isActive={editor.isActive('heading', { level: 3 })}
             title="H3"
           >
             <Heading3 className="w-4 h-4" />
           </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleHighlight().run()} 
            isActive={editor.isActive('highlight')}
            title="Highlight Text"
          >
            <Highlighter className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </MenuButton>
          <MenuButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <MenuButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            isActive={editor.isActive('blockquote')}
            title="Blockquote / Highlighted Section"
          >
            <Quote className="w-4 h-4" />
          </MenuButton>
          <MenuButton 
            onClick={setLink} 
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="flex items-center gap-1 pl-2">
           <MenuButton 
             onClick={() => { setMediaTarget('image'); setShowMediaModal(true); }}
             title="Insert Image"
           >
             <ImageIcon className="w-4 h-4" />
           </MenuButton>
           <MenuButton 
             onClick={() => { setMediaTarget('video'); setShowMediaModal(true); }}
             title="Insert Video"
           >
             <Video className="w-4 h-4" />
           </MenuButton>
           <MenuButton
             onClick={() => editor.chain().focus().setHorizontalRule().run()}
             title="Horizontal Rule"
           >
             <Minus className="w-4 h-4" />
           </MenuButton>
           <MenuButton
             onClick={() => editor.chain().focus().insertAdSlot().run()}
             title="Insert Ad Slot"
           >
             <Target className="w-4 h-4" />
           </MenuButton>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Media Library Integration */}
      <MediaLibraryModal 
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleMediaSelect}
        initialType={mediaTarget}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .tiptap-editor-content {
          font-family: 'Noto Sans Bengali', 'SolaimanLipi', 'Inter', sans-serif;
          font-size: 15px !important;
          font-weight: 400 !important;
          line-height: 1.7;
          color: #1a1a1a;
        }
        .tiptap-editor-content p {
          font-size: 15px !important;
          font-weight: 400 !important;
          margin: 0 0 0.75rem 0;
        }
        .tiptap-editor-content h1 { font-size: 22px !important; font-weight: 700 !important; margin: 1rem 0 0.5rem; }
        .tiptap-editor-content h2 { font-size: 19px !important; font-weight: 700 !important; margin: 1rem 0 0.5rem; }
        .tiptap-editor-content h3 { font-size: 17px !important; font-weight: 600 !important; margin: 0.75rem 0 0.4rem; }
        .tiptap-editor-content ul, .tiptap-editor-content ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap-editor-content li { font-size: 15px !important; font-weight: 400 !important; margin: 0.25rem 0; }
        .tiptap-editor-content blockquote {
          border-left: 4px solid #263238;
          background: #fffafa;
          padding: 1rem 1.5rem;
          font-style: italic;
          font-size: 15px !important;
          font-weight: 400 !important;
          border-radius: 0 0.75rem 0.75rem 0;
          margin: 1.25rem 0;
        }
        .tiptap-editor-content img {
          display: block;
          margin-left: auto;
          margin-right: auto;
          max-width: 100%;
        }
        .tiptap-editor-content a {
          color: #263238;
          text-decoration: underline;
          font-weight: 400 !important;
        }
        .ad-slot-node {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 12px 0;
          padding: 10px 16px;
          background: #fff8e1;
          border: 2px dashed #f59e0b;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #92400e;
          letter-spacing: 0.05em;
          cursor: default;
          user-select: none;
        }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          font-size: 15px;
          font-weight: 400;
          pointer-events: none;
          height: 0;
        }
      `}} />
    </div>
  );
}
