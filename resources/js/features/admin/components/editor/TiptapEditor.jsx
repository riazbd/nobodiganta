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
  AlignLeft, AlignCenter, AlignRight, Maximize, Minus, Type, Code, Target, X, Film
} from 'lucide-react';

const AdSlotNode = Node.create({
  name: 'adSlot',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      adType: {
        default: 'image',
        parseHTML: el => el.getAttribute('data-ad-type') || 'image',
        renderHTML: attrs => ({ 'data-ad-type': attrs.adType }),
      },
      adId: {
        default: null,
        parseHTML: el => el.getAttribute('data-ad-id'),
        renderHTML: attrs => attrs.adId ? { 'data-ad-id': attrs.adId } : {},
      },
      adSrc: {
        default: null,
        parseHTML: el => el.getAttribute('data-ad-src'),
        renderHTML: attrs => attrs.adSrc ? { 'data-ad-src': attrs.adSrc } : {},
      },
      adLink: {
        default: null,
        parseHTML: el => el.getAttribute('data-ad-link'),
        renderHTML: attrs => attrs.adLink ? { 'data-ad-link': attrs.adLink } : {},
      },
      adCode: {
        default: null,
        parseHTML: el => { const v = el.getAttribute('data-ad-code'); return v ? decodeURIComponent(v) : null; },
        renderHTML: attrs => attrs.adCode ? { 'data-ad-code': encodeURIComponent(attrs.adCode) } : {},
      },
      adTitle: {
        default: null,
        parseHTML: el => el.getAttribute('data-ad-title'),
        renderHTML: attrs => attrs.adTitle ? { 'data-ad-title': attrs.adTitle } : {},
      },
      adHref: {
        default: null,
        parseHTML: el => el.getAttribute('data-ad-href'),
        renderHTML: attrs => attrs.adHref ? { 'data-ad-href': attrs.adHref } : {},
      },
    };
  },
  parseHTML() {
    return [
      { tag: 'div[data-inline-ad]' },
      { tag: 'div[data-ad-slot]' }, // backward compat
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-inline-ad': 'true' }, HTMLAttributes)];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'ad-slot-node';
      dom.setAttribute('contenteditable', 'false');
      const render = ({ adType, adId, adSrc, adTitle, adHref }) => {
        const label = adTitle ? ` — ${adTitle}` : (adId ? ` #${adId}` : '');
        if (adType === 'news_promo') {
          dom.innerHTML = `<span>📰</span> News Promo${label}`;
        } else if (adType === 'custom_html') {
          dom.innerHTML = `<span>📝</span> HTML Ad${label}`;
        } else if (adType === 'custom_image' || adSrc) {
          dom.innerHTML = `<span>🖼️</span> Image Ad${label}`;
        } else {
          dom.innerHTML = `<span>📢</span> Ad Slot${label || ' — not configured'}`;
        }
      };
      render(node.attrs);
      return { dom, update: updated => { render(updated.attrs); return true; } };
    };
  },
  addCommands() {
    return {
      insertAdSlot: (attrs) => ({ commands }) =>
        commands.insertContent({ type: 'adSlot', attrs: attrs || {} }),
    };
  },
});

// Detect video type and return embed URL
function detectVideoEmbed(url) {
  // YouTube — watch, shorts, live, embed
  const ytMatch = /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/(?:shorts|live|embed)\/)([A-Za-z0-9_-]{11})/.exec(url);
  if (ytMatch) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };

  // Vimeo — vimeo.com/ID or player.vimeo.com/video/ID
  const vimeoMatch = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
  if (vimeoMatch) return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };

  // Facebook — watch, video, reel, story, fb.watch short links
  if (/facebook\.com|fb\.watch/.test(url)) {
    return { type: 'facebook', embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560&height=315` };
  }

  // Instagram — reels, posts, TV
  const igMatch = /instagram\.com\/(?:p|reel|tv)\/([\w-]+)/.exec(url);
  if (igMatch) return { type: 'instagram', embedUrl: `https://www.instagram.com/${url.includes('/reel/') ? 'reel' : url.includes('/tv/') ? 'tv' : 'p'}/${igMatch[1]}/embed/` };

  // TikTok — @user/video/ID or vm.tiktok.com short links
  const ttMatch = /tiktok\.com\/@[^/]+\/video\/(\d+)/.exec(url);
  if (ttMatch) return { type: 'tiktok', embedUrl: `https://www.tiktok.com/embed/${ttMatch[1]}` };
  if (/tiktok\.com/.test(url)) return { type: 'tiktok', embedUrl: `https://www.tiktok.com/embed/v2/?url=${encodeURIComponent(url)}` };

  // Twitter / X — status/tweet links
  const twMatch = /(?:twitter|x)\.com\/\w+\/status\/(\d+)/.exec(url);
  if (twMatch) return { type: 'twitter', embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${twMatch[1]}` };

  // Dailymotion
  const dmMatch = /dailymotion\.com\/video\/([\w]+)/.exec(url);
  if (dmMatch) return { type: 'dailymotion', embedUrl: `https://www.dailymotion.com/embed/video/${dmMatch[1]}` };

  // Twitch — clips and VODs
  const twitchClip = /twitch\.tv\/\w+\/clip\/([\w-]+)|clips\.twitch\.tv\/([\w-]+)/.exec(url);
  if (twitchClip) return { type: 'twitch', embedUrl: `https://clips.twitch.tv/embed?clip=${twitchClip[1] || twitchClip[2]}&parent=${window.location.hostname}` };
  const twitchVod = /twitch\.tv\/videos\/(\d+)/.exec(url);
  if (twitchVod) return { type: 'twitch', embedUrl: `https://player.twitch.tv/?video=${twitchVod[1]}&parent=${window.location.hostname}` };

  // Direct video file
  if (/\.(mp4|webm|ogg|mov|m3u8)(\?|$)/i.test(url)) return { type: 'direct', embedUrl: url };

  // Generic iframe fallback
  return { type: 'iframe', embedUrl: url };
}

const VideoEmbedNode = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: el => el.getAttribute('data-vembed-src'),
        renderHTML: attrs => attrs.src ? { 'data-vembed-src': attrs.src } : {},
      },
      embedType: {
        default: 'iframe',
        parseHTML: el => el.getAttribute('data-vembed-type') || 'iframe',
        renderHTML: attrs => ({ 'data-vembed-type': attrs.embedType }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-vembed]' }];
  },
  renderHTML({ node }) {
    const { src, embedType } = node.attrs;
    if (!src) return ['div', { 'data-vembed': 'empty' }];
    if (embedType === 'direct') {
      return ['div', { 'data-vembed': embedType, 'data-vembed-src': src, 'data-vembed-type': embedType, class: 'video-embed-wrap' },
        ['video', { src, controls: '', style: 'width:100%;max-height:480px;display:block;border-radius:8px', preload: 'metadata' }],
      ];
    }
    return ['div', { 'data-vembed': embedType, 'data-vembed-src': src, 'data-vembed-type': embedType, class: 'video-embed-wrap' },
      ['iframe', { src, allowfullscreen: '', frameborder: '0', allow: 'accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture', style: 'width:100%;aspect-ratio:16/9;display:block;border-radius:8px;border:none' }],
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'video-embed-node';
      dom.setAttribute('contenteditable', 'false');
      const render = ({ src, embedType }) => {
        if (!src) { dom.innerHTML = '<div style="padding:16px;background:#f5f5f5;border-radius:8px;text-align:center;font-size:13px;color:#666">🎬 Video embed — no URL set</div>'; return; }
        if (embedType === 'direct') {
          dom.innerHTML = `<video src="${src}" controls style="width:100%;max-height:240px;border-radius:8px;display:block" preload="metadata"></video>`;
        } else {
          dom.innerHTML = `<div style="position:relative;width:100%;aspect-ratio:16/9"><iframe src="${src}" style="position:absolute;inset:0;width:100%;height:100%;border-radius:8px;border:none" allowfullscreen loading="lazy"></iframe></div>`;
        }
      };
      render(node.attrs);
      return { dom, update: updated => { render(updated.attrs); return true; } };
    };
  },
  addCommands() {
    return {
      insertVideoEmbed: (attrs) => ({ commands }) =>
        commands.insertContent({ type: 'videoEmbed', attrs }),
    };
  },
});

function VideoEmbedModal({ isOpen, onClose, onInsert }) {
  const [url, setUrl] = useState('');
  const [detected, setDetected] = useState(null);

  if (!isOpen) return null;

  const handleUrlChange = (val) => {
    setUrl(val);
    if (val.trim()) {
      try { new URL(val); setDetected(detectVideoEmbed(val.trim())); } catch { setDetected(null); }
    } else {
      setDetected(null);
    }
  };

  const handleInsert = () => {
    if (!url.trim() || !detected) return;
    onInsert(detected);
    setUrl(''); setDetected(null); onClose();
  };

  const typeLabel = { youtube: 'YouTube', vimeo: 'Vimeo', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', twitter: 'Twitter / X', dailymotion: 'Dailymotion', twitch: 'Twitch', direct: 'Direct Video', iframe: 'Embed (iframe)' };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-sm text-[#263238]">Embed Video</h3>
          <button onClick={() => { setUrl(''); setDetected(null); onClose(); }} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Video URL</label>
            <input
              type="url"
              value={url}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="Paste any video URL..."
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238]"
            />
          </div>
          {detected && (
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
              <Film className="w-3.5 h-3.5 text-[#263238] shrink-0" />
              <span className="text-gray-500">Detected:</span>
              <span className="font-bold text-[#263238]">{typeLabel[detected.type] || detected.type}</span>
            </div>
          )}
          <p className="text-[10px] text-gray-400">YouTube, Shorts, Reels, TikTok, Facebook, Instagram, Twitter/X, Vimeo, Dailymotion, Twitch, .mp4/.webm, or any URL.</p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t bg-gray-50">
          <button onClick={() => { setUrl(''); setDetected(null); onClose(); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800">Cancel</button>
          <button onClick={handleInsert} disabled={!detected} className="px-5 py-2 bg-[#263238] text-white text-sm font-bold rounded-lg hover:bg-[#37474f] disabled:opacity-40 disabled:cursor-not-allowed">Insert</button>
        </div>
      </div>
    </div>
  );
}

function AdPickerModal({ isOpen, onClose, onInsert, ads = [] }) {
  const [tab, setTab] = useState('system');
  const [selectedAdId, setSelectedAdId] = useState('');
  const [customSrc, setCustomSrc] = useState('');
  const [customLink, setCustomLink] = useState('');
  const [customHtml, setCustomHtml] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoHref, setPromoHref] = useState('');
  const [promoSrc, setPromoSrc] = useState('');

  if (!isOpen) return null;

  const reset = () => {
    setSelectedAdId(''); setCustomSrc(''); setCustomLink('');
    setCustomHtml(''); setPromoTitle(''); setPromoHref(''); setPromoSrc('');
  };

  const handleInsert = () => {
    let attrs = null;
    if (tab === 'system') {
      if (!selectedAdId) return;
      const ad = ads.find(a => String(a.id) === selectedAdId);
      if (!ad) return;
      if (ad.type === 'image') {
        attrs = { adType: 'image', adId: selectedAdId, adSrc: ad.image || null, adLink: ad.link || null, adTitle: ad.title_bn || ad.title_en };
      } else if (ad.type === 'video') {
        attrs = { adType: 'video', adId: selectedAdId, adSrc: ad.video_url || null, adLink: ad.link || null, adTitle: ad.title_bn || ad.title_en };
      } else {
        attrs = { adType: 'code', adId: selectedAdId, adCode: ad.code || null, adTitle: ad.title_bn || ad.title_en };
      }
    } else if (tab === 'custom_image') {
      if (!customSrc) return;
      attrs = { adType: 'custom_image', adSrc: customSrc, adLink: customLink || null, adTitle: 'Custom Image' };
    } else if (tab === 'custom_html') {
      if (!customHtml) return;
      attrs = { adType: 'custom_html', adCode: customHtml, adTitle: 'Custom HTML' };
    } else if (tab === 'news_promo') {
      if (!promoTitle || !promoHref) return;
      attrs = { adType: 'news_promo', adTitle: promoTitle, adHref: promoHref, adSrc: promoSrc || null };
    }
    if (attrs) { onInsert(attrs); reset(); onClose(); }
  };

  const selectedAd = ads.find(a => String(a.id) === selectedAdId);

  const tabClass = (key) =>
    `flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors border-b-2 ${tab === key ? 'text-[#263238] border-[#263238]' : 'text-gray-400 border-transparent hover:text-gray-600'}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-sm text-[#263238]">Insert Ad / Promo Block</h3>
          <button onClick={() => { reset(); onClose(); }} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex border-b bg-gray-50">
          {[['system','Ad System'],['custom_image','Image URL'],['custom_html','HTML Code'],['news_promo','News Promo']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} className={tabClass(k)}>{l}</button>
          ))}
        </div>
        <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
          {tab === 'system' && (
            <>
              <select value={selectedAdId} onChange={e => setSelectedAdId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238]">
                <option value="">— choose an ad —</option>
                {ads.map(ad => (
                  <option key={ad.id} value={ad.id}>
                    {ad.title_bn || ad.title_en} [{ad.position}] ({ad.type})
                  </option>
                ))}
              </select>
              {selectedAd?.type === 'image' && selectedAd.image && (
                <img src={selectedAd.image} className="max-h-14 rounded border" alt="" />
              )}
              {selectedAd?.type === 'video' && selectedAd.video_url && (
                <p className="text-xs text-gray-500">Video: {selectedAd.video_url}</p>
              )}
              {(selectedAd?.type === 'google_ad' || selectedAd?.type === 'script' || selectedAd?.type === 'html') && (
                <p className="text-xs text-gray-500 italic">Code ad — will render HTML/script inline.</p>
              )}
            </>
          )}
          {tab === 'custom_image' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Image URL</label>
                <input type="url" value={customSrc} onChange={e => setCustomSrc(e.target.value)} placeholder="https://example.com/banner.jpg"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Link URL (optional)</label>
                <input type="url" value={customLink} onChange={e => setCustomLink(e.target.value)} placeholder="https://example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238]" />
              </div>
              {customSrc && <img src={customSrc} onError={e => e.target.style.display='none'} className="max-h-20 rounded border" alt="" />}
            </>
          )}
          {tab === 'custom_html' && (
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">HTML / Script Code</label>
              <textarea value={customHtml} onChange={e => setCustomHtml(e.target.value)} rows={5}
                placeholder="<div>Your ad code here...</div>"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#263238] resize-none" />
            </div>
          )}
          {tab === 'news_promo' && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Article Title</label>
                <input value={promoTitle} onChange={e => setPromoTitle(e.target.value)} placeholder="Article headline..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Article URL (relative or full)</label>
                <input value={promoHref} onChange={e => setPromoHref(e.target.value)} placeholder="/category/article-slug"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Thumbnail URL (optional)</label>
                <input type="url" value={promoSrc} onChange={e => setPromoSrc(e.target.value)} placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238]" />
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t bg-gray-50">
          <button onClick={() => { reset(); onClose(); }} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800">Cancel</button>
          <button onClick={handleInsert} className="px-5 py-2 bg-[#263238] text-white text-sm font-bold rounded-lg hover:bg-[#37474f]">Insert</button>
        </div>
      </div>
    </div>
  );
}
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

export default function TiptapEditor({ value, onChange, placeholder, lang = 'bn', ads = [] }) {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTarget, setMediaTarget] = useState('image');
  const [showAdPicker, setShowAdPicker] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

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
      VideoEmbedNode,
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
             onClick={() => setShowVideoModal(true)}
             title="Embed Video URL (YouTube, Vimeo, MP4...)"
           >
             <Film className="w-4 h-4" />
           </MenuButton>
           <MenuButton
             onClick={() => setShowAdPicker(true)}
             title="Insert Ad / Promo Block"
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

      <VideoEmbedModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onInsert={({ type, embedUrl }) => {
          if (type === 'youtube') {
            editor.chain().focus().setYoutubeVideo({ src: embedUrl }).run();
          } else {
            editor.chain().focus().insertVideoEmbed({ src: embedUrl, embedType: type }).run();
          }
        }}
      />

      <AdPickerModal
        isOpen={showAdPicker}
        onClose={() => setShowAdPicker(false)}
        onInsert={(attrs) => editor.chain().focus().insertAdSlot(attrs).run()}
        ads={ads}
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
        .video-embed-node {
          margin: 16px 0;
          border-radius: 8px;
          overflow: hidden;
          cursor: default;
          user-select: none;
        }
        .video-embed-wrap {
          margin: 16px 0;
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
