import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Save, Send, Image as ImageIcon, X, ChevronLeft, Globe, FileText, Settings, Trash2, Languages, Loader2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';
import RichTextEditor from '../../components/editor/TiptapEditor';
import MediaLibraryModal from '../../components/media/MediaLibraryModal';
import ConfirmationModal from '../../components/feedback/ConfirmationModal';
import { detectVideoProvider } from '../../../../lib/video';

function slugify(text, lang) {
  if (!text) return '';
  
  let slug = text.toLowerCase().trim();
  
  if (lang === 'bn') {
    // Keep Unicode letters (L), numbers (N), and marks (M - vowels/accents)
    // Replace everything else (spaces, punctuation) with a dash
    slug = slug.replace(/[^\p{L}\p{N}\p{M}]+/gu, '-');
  } else {
    // Standard latin slugify
    slug = slug.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  }
  
  return slug
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function WriteOpinion() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { article, authors = [] } = usePage().props;
  
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showTranslateConfirm, setShowTranslateConfirm] = useState(false);
  const [activeMediaTarget, setActiveMediaTarget] = useState('featured'); // 'featured' or 'guest'
  const [manuallyEditedSlugBn, setManuallyEditedSlugBn] = useState(false);
  const [manuallyEditedSlugEn, setManuallyEditedSlugEn] = useState(false);

  const form = useForm({
    titleBn: '',
    titleEn: '',
    subtitleBn: '',
    subtitleEn: '',
    bodyBn: '',
    bodyEn: '',
    excerptBn: '',
    excerptEn: '',
    slugBn: '',
    slugEn: '',
    edition: 'both',
    status: 'draft',
    featuredImage: '',
    featuredImageAltBn: '',
    featuredImageAltEn: '',
    isExclusive: false,
    secondaryAuthorId: '',
    isGuestAuthor: false,
    guestAuthorNameBn: '',
    guestAuthorNameEn: '',
    guestAuthorBioBn: '',
    guestAuthorBioEn: '',
    guestAuthorImage: '',
    allowComments: true,
    videoUrl: '',
    videoProvider: 'youtube',
    videoDuration: '',
  });

  useEffect(() => {
    if (article) {
      form.setData({
        titleBn: article.titleBn || '',
        titleEn: article.titleEn || '',
        subtitleBn: article.subtitleBn || '',
        subtitleEn: article.subtitleEn || '',
        bodyBn: article.bodyBn || '',
        bodyEn: article.bodyEn || '',
        excerptBn: article.excerptBn || '',
        excerptEn: article.excerptEn || '',
        slugBn: article.slugBn || '',
        slugEn: article.slugEn || '',
        edition: article.edition || 'both',
        status: article.status || 'draft',
        featuredImage: article.featuredImage || '',
        featuredImageAltBn: '',
        featuredImageAltEn: '',
        isExclusive: !!article.isExclusive,
        allowComments: article.allowComments !== undefined ? !!article.allowComments : true,
        videoUrl: article.videoUrl || '',
        videoProvider: article.videoProvider || 'youtube',
        videoDuration: article.videoDuration || '',
        secondaryAuthorId: article.secondaryAuthorId || '',
        isGuestAuthor: !!article.isGuestAuthor,
        guestAuthorNameBn: article.guestAuthorNameBn || '',
        guestAuthorNameEn: article.guestAuthorNameEn || '',
        guestAuthorBioBn: article.guestAuthorBioBn || '',
        guestAuthorBioEn: article.guestAuthorBioEn || '',
        guestAuthorImage: article.guestAuthorImage || '',
      });
    }
  }, [article]);

  // Auto-generate slugs from titles
  useEffect(() => {
    if (article) return;
    const newSlug = slugify(form.data.titleBn || '', 'bn');
    if (!manuallyEditedSlugBn && form.data.slugBn !== newSlug) {
      form.setData('slugBn', newSlug);
    }
  }, [form.data.titleBn]);

  useEffect(() => {
    if (article) return;
    const newSlug = slugify(form.data.titleEn || '', 'en');
    if (!manuallyEditedSlugEn && form.data.slugEn !== newSlug) {
      form.setData('slugEn', newSlug);
    }
  }, [form.data.titleEn]);

  const handleSubmit = (status = null) => {
    // If status is provided, update form data
    if (status) {
      form.setData('status', status);
    }
    
    const needsBn = form.data.edition === 'bn' || form.data.edition === 'both';
    const needsEn = form.data.edition === 'en' || form.data.edition === 'both';

    if (needsBn && !form.data.titleBn?.trim()) {
      showToast(lang === 'bn' ? 'বাংলা শিরোনাম প্রয়োজন!' : 'Bengali title is required!', 'error');
      return;
    }
    if (needsEn && !form.data.titleEn?.trim()) {
      showToast(lang === 'bn' ? 'ইংরেজি শিরোনাম প্রয়োজন!' : 'English title is required!', 'error');
      return;
    }
    
    // Strip HTML to check if body is truly empty
    const bodyBnText = form.data.bodyBn?.replace(/<[^>]*>?/gm, '').trim();
    if (needsBn && !bodyBnText) {
      showToast(lang === 'bn' ? 'বাংলা বিষয়বস্তু প্রয়োজন!' : 'Bengali content is required!', 'error');
      return;
    }
    
    const bodyEnText = form.data.bodyEn?.replace(/<[^>]*>?/gm, '').trim();
    if (needsEn && !bodyEnText) {
      showToast(lang === 'bn' ? 'ইংরেজি বিষয়বস্তু প্রয়োজন!' : 'English content is required!', 'error');
      return;
    }

    // We must use form.transform or a manual object if we want to ensure status is included 
    // because setData is async. However, Inertia's transform is perfect here.
    form.transform(data => ({
      ...data,
      status: status || data.status
    }));

    const url = article ? `/admin/opinions/${article.id}` : '/admin/opinions';
    const method = article ? 'put' : 'post';
    
    form[method](url, {
      preserveScroll: true,
      onSuccess: () => {
        showToast(lang === 'bn' ? 'মতামত সংরক্ষিত হয়েছে' : 'Opinion saved successfully');
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0];
        showToast(firstError || (lang === 'bn' ? 'দুঃখিত, কিছু সমস্যা হয়েছে' : 'Sorry, there were some errors'), 'error');
      }
    });
  };

  const openMediaLibrary = (target) => {
    setActiveMediaTarget(target);
    setShowMediaLibrary(true);
  };

  const handleMediaSelect = (media) => {
    if (activeMediaTarget === 'featured') {
      form.setData({
        ...form.data,
        featuredImage: media.url,
        featuredImageAltBn: media.alt_text_bn || '',
        featuredImageAltEn: media.alt_text_en || '',
      });
    } else {
      form.setData('guestAuthorImage', media.url);
    }
    setShowMediaLibrary(false);
  };

  const handleUrlChange = (url) => {
    const provider = detectVideoProvider(url);
    form.setData({ ...form.data, videoUrl: url, videoProvider: provider });
  };

  const showBn = form.data.edition === 'bn' || form.data.edition === 'both';
  const showEn = form.data.edition === 'en' || form.data.edition === 'both';

  const [isTranslating, setIsTranslating] = useState(false);

  const translateEmptyFields = async (skipOverwrite = false) => {
    if (form.data.edition !== 'both') return;
    
    // Check if we are overwriting anything
    const willOverwrite = (form.data.titleEn || form.data.subtitleEn || form.data.excerptEn || form.data.bodyEn) && 
                         (form.data.titleBn || form.data.subtitleBn || form.data.excerptBn || form.data.bodyBn);
    
    if (willOverwrite && !skipOverwrite) {
      setShowTranslateConfirm(true);
      return;
    }

    const fieldsToTranslate = {};
    
    // Logic: If BN exists, prioritize translating BN -> EN
    // If BN is missing but EN exists, translate EN -> BN
    if (form.data.titleBn) fieldsToTranslate.titleEn = form.data.titleBn;
    else if (form.data.titleEn) fieldsToTranslate.titleBn = form.data.titleEn;

    if (form.data.subtitleBn) fieldsToTranslate.subtitleEn = form.data.subtitleBn;
    else if (form.data.subtitleEn) fieldsToTranslate.subtitleBn = form.data.subtitleEn;

    if (form.data.excerptBn) fieldsToTranslate.excerptEn = form.data.excerptBn;
    else if (form.data.excerptEn) fieldsToTranslate.excerptBn = form.data.excerptEn;

    if (form.data.bodyBn) fieldsToTranslate.bodyEn = form.data.bodyBn;
    else if (form.data.bodyEn) fieldsToTranslate.bodyBn = form.data.bodyEn;

    if (Object.keys(fieldsToTranslate).length === 0) {
      showToast(lang === 'bn' ? 'অনুবাদ করার মতো কোনো তথ্য নেই' : 'No content to translate', 'info');
      return;
    }

    setIsTranslating(true);
    showToast(lang === 'bn' ? 'অনুবাদ করা হচ্ছে...' : 'Translating...');

    try {
      const enKeys = ['titleEn', 'subtitleEn', 'excerptEn', 'bodyEn'];
      const bnKeys = ['titleBn', 'subtitleBn', 'excerptBn', 'bodyBn'];
      
      const enPayload = {};
      const bnPayload = {};
      
      Object.keys(fieldsToTranslate).forEach(k => {
        if (enKeys.includes(k)) enPayload[k] = fieldsToTranslate[k];
        if (bnKeys.includes(k)) bnPayload[k] = fieldsToTranslate[k];
      });

      let finalUpdates = {};

      if (Object.keys(enPayload).length > 0) {
        const res = await window.axios.post('/admin/api/translate', {
          fields: enPayload,
          target_lang: 'en',
          source_lang: 'bn'
        });
        if (res.data.success) {
          finalUpdates = { ...finalUpdates, ...res.data.translations };
        }
      }

      if (Object.keys(bnPayload).length > 0) {
        const res = await window.axios.post('/admin/api/translate', {
          fields: bnPayload,
          target_lang: 'bn',
          source_lang: 'en'
        });
        if (res.data.success) {
          finalUpdates = { ...finalUpdates, ...res.data.translations };
        }
      }

      if (Object.keys(finalUpdates).length > 0) {
        form.setData(prev => ({ ...prev, ...finalUpdates }));
        showToast(lang === 'bn' ? 'অনুবাদ সফল হয়েছে' : 'Translation complete', 'success');
      }

    } catch (err) {
      console.error('Translation failed:', err);
      showToast(lang === 'bn' ? 'অনুবাদ ব্যর্থ হয়েছে' : 'Translation failed', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="font-['Noto_Sans_Bengali'] pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5 text-[var(--text-secondary,#6b7280)]" />
        </button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)]">
              {article ? (lang === 'bn' ? 'মতামত সম্পাদনা' : 'Edit Opinion') : (lang === 'bn' ? 'নতুন মতামত লিখুন' : 'Write New Opinion')}
            </h1>
            <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">
              {lang === 'bn' ? 'আপনার মতামত প্রকাশ করুন' : 'Share your opinion piece'}
            </p>
          </div>
          {form.data.edition === 'both' && (
            <button
              type="button"
              onClick={() => translateEmptyFields()}
              disabled={isTranslating}
              className="bg-[#eff6ff] text-[#3b82f6] border border-[#bfdbfe] rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#dbeafe] transition-colors disabled:opacity-50"
            >
              {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
              {lang === 'bn' ? 'অটো ট্রান্সলেট' : 'Auto Translate'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content Area (Left Side) */}
        <div className="space-y-6">
          {showBn && (
            <div className="bg-white p-6 rounded-xl border border-[var(--card-border,#e8ebf4)] shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#263238]">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-bold">বাংলা বিষয়বস্তু (Bengali Content)</span>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">শিরোনাম *</label>
                <input required type="text" value={form.data.titleBn} onChange={e => form.setData('titleBn', e.target.value)} placeholder="মূল শিরোনাম..." className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#263238] transition-colors bg-gray-50/50 focus:bg-white" />
                {form.errors.titleBn && <div className="text-[#263238] text-[11px] mt-1">{form.errors.titleBn}</div>}
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">উপ-শিরোনাম</label>
                <input type="text" value={form.data.subtitleBn} onChange={e => form.setData('subtitleBn', e.target.value)} placeholder="বিষয়বস্তুর সংক্ষিপ্ত বর্ণনা..." className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#263238] transition-colors bg-gray-50/50 focus:bg-white" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">মতামত *</label>
                <div className="border border-[var(--card-border,#e8ebf4)] rounded-lg overflow-hidden focus-within:border-[#263238] transition-colors">
                  <RichTextEditor value={form.data.bodyBn} onChange={val => form.setData('bodyBn', val)} lang="bn" placeholder="এখানে আপনার মতামত লিখুন..." />
                </div>
                {form.errors.bodyBn && <div className="text-[#263238] text-[11px] mt-1">{form.errors.bodyBn}</div>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">সারাংশ (Excerpt)</label>
                <textarea rows="2" value={form.data.excerptBn} onChange={e => form.setData('excerptBn', e.target.value)} placeholder="হোমপেজ বা তালিকার জন্য ছোট সারাংশ..." className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#263238] transition-colors bg-gray-50/50 focus:bg-white resize-none" />
              </div>
            </div>
          )}

          {showEn && (
            <div className="bg-white p-6 rounded-xl border border-[var(--card-border,#e8ebf4)] shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-bold">English Content</span>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">Title *</label>
                <input required type="text" value={form.data.titleEn} onChange={e => form.setData('titleEn', e.target.value)} placeholder="Enter title..." className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#263238] transition-colors bg-gray-50/50 focus:bg-white" />
                {form.errors.titleEn && <div className="text-[#263238] text-[11px] mt-1">{form.errors.titleEn}</div>}
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">Subtitle</label>
                <input type="text" value={form.data.subtitleEn} onChange={e => form.setData('subtitleEn', e.target.value)} placeholder="Brief subtitle..." className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#263238] transition-colors bg-gray-50/50 focus:bg-white" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">Opinion *</label>
                <div className="border border-[var(--card-border,#e8ebf4)] rounded-lg overflow-hidden focus-within:border-[#263238] transition-colors">
                  <RichTextEditor value={form.data.bodyEn} onChange={val => form.setData('bodyEn', val)} lang="en" placeholder="Write your opinion here..." />
                </div>
                {form.errors.bodyEn && <div className="text-[#263238] text-[11px] mt-1">{form.errors.bodyEn}</div>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase mb-1">Excerpt</label>
                <textarea rows="2" value={form.data.excerptEn} onChange={e => form.setData('excerptEn', e.target.value)} placeholder="Short excerpt for homepage..." className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#263238] transition-colors bg-gray-50/50 focus:bg-white resize-none" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Right Side) */}
        <div className="space-y-6">
          {/* Publication Status */}
          <div className="bg-white p-5 rounded-xl border border-[var(--card-border,#e8ebf4)] shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-50">
              <Settings className="w-4 h-4 text-[#263238]" />
              <h3 className="text-sm font-bold">{lang === 'bn' ? 'প্রকাশনা (Publish)' : 'Publish'}</h3>
            </div>
            <div className="space-y-3">
              {article && (
                <button 
                  onClick={() => handleSubmit()} 
                  disabled={form.processing} 
                  className="w-full bg-[#10b981] text-white rounded-lg py-2.5 text-sm font-bold hover:bg-[#059669] transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {lang === 'bn' ? 'পরিবর্তন সংরক্ষণ' : 'Save Changes'}
                </button>
              )}
              <button 
                onClick={() => handleSubmit('published')} 
                disabled={form.processing} 
                className="w-full bg-[#263238] text-white rounded-lg py-2.5 text-sm font-bold hover:bg-[#1a2428] transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {lang === 'bn' ? 'এখনই প্রকাশ করুন' : 'Publish Now'}
              </button>
              <button 
                onClick={() => handleSubmit('draft')} 
                disabled={form.processing} 
                className="w-full bg-white text-gray-700 border border-gray-200 rounded-lg py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {lang === 'bn' ? 'ড্রাফট হিসেবে সংরক্ষণ' : 'Save as Draft'}
              </button>
            </div>
            {article && (
              <div className="mt-4 pt-3 border-t border-gray-50 text-center">
                <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                  form.data.status === 'published' ? 'bg-[#ecfdf5] text-[#10b981]' : 
                  form.data.status === 'pending' ? 'bg-orange-50 text-orange-600' : 
                  form.data.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {lang === 'bn' ? 'বর্তমান অবস্থা' : 'Current Status'}: {form.data.status}
                </span>
              </div>
            )}
          </div>

          {/* Article Options */}
          <div className="bg-white p-5 rounded-xl border border-[var(--card-border,#e8ebf4)] shadow-sm space-y-4">
             <h3 className="text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider">{lang === 'bn' ? 'নিবন্ধ অপশন' : 'Article Options'}</h3>
             
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={form.data.isExclusive} 
                    onChange={e => form.setData('isExclusive', e.target.checked)} 
                  />
                  <div className={`block w-8 h-5 rounded-full transition-colors ${form.data.isExclusive ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${form.data.isExclusive ? 'translate-x-3' : ''}`}></div>
                </div>
                <div className="text-xs font-bold text-orange-700">{lang === 'bn' ? 'এক্সক্লুসিভ নিবন্ধ' : 'Mark as Exclusive'}</div>
             </label>

             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={form.data.allowComments} 
                    onChange={e => form.setData('allowComments', e.target.checked)} 
                  />
                  <div className={`block w-8 h-5 rounded-full transition-colors ${form.data.allowComments ? 'bg-[#10b981]' : 'bg-gray-200'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${form.data.allowComments ? 'translate-x-3' : ''}`}></div>
                </div>
                <div className="text-xs font-bold text-gray-700">{lang === 'bn' ? 'মন্তব্য অনুমোদন' : 'Allow Comments'}</div>
             </label>

             <div className="pt-2 border-t border-gray-50">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'सह-লেখক (Co-author)' : 'Secondary Author'}</label>
                <select
                  value={form.data.secondaryAuthorId}
                  onChange={(e) => form.setData('secondaryAuthorId', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#263238]"
                >
                  <option value="">{lang === 'bn' ? 'কেউ নেই' : 'None'}</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
             </div>
          </div>

          {/* Video Options */}
          <div className="bg-white p-5 rounded-xl border border-[var(--card-border,#e8ebf4)] shadow-sm space-y-4">
             <h3 className="text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider mb-2">{lang === 'bn' ? 'ভিডিও অপশন' : 'Video Options'}</h3>
             
             <div>
               <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'ভিডিও লিঙ্ক' : 'Video URL'}</label>
               <input 
                 type="url" 
                 value={form.data.videoUrl} 
                 onChange={e => handleUrlChange(e.target.value)}
                 placeholder="https://..."
                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#263238]" 
               />
             </div>

             <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'দৈর্ঘ্য' : 'Duration'}</label>
                 <input 
                   type="text" 
                   value={form.data.videoDuration} 
                   onChange={e => form.setData('videoDuration', e.target.value)}
                   placeholder="00:00"
                   className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#263238]" 
                 />
               </div>
               <div>
                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'সোর্স' : 'Provider'}</label>
                 <select 
                   value={form.data.videoProvider} 
                   onChange={e => form.setData('videoProvider', e.target.value)}
                   className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#263238]"
                 >
                   <option value="youtube">YouTube</option>
                   <option value="vimeo">Vimeo</option>
                   <option value="facebook">Facebook</option>
                   <option value="dailymotion">Dailymotion</option>
                   <option value="local">Local</option>
                 </select>
               </div>
             </div>
          </div>

          {/* Guest Author */}
          <div className="bg-white p-5 rounded-xl border border-[var(--card-border,#e8ebf4)] shadow-sm font-['Noto_Sans_Bengali']">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider">{lang === 'bn' ? 'অতিথি লেখক' : 'Guest Author'}</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={form.data.isGuestAuthor} 
                    onChange={e => form.setData('isGuestAuthor', e.target.checked)} 
                  />
                  <div className={`block w-8 h-5 rounded-full transition-colors ${form.data.isGuestAuthor ? 'bg-[#263238]' : 'bg-gray-200'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${form.data.isGuestAuthor ? 'translate-x-3' : ''}`}></div>
                </div>
              </label>
            </div>

            {form.data.isGuestAuthor && (
              <div className="space-y-3 pt-2 animate-in fade-in duration-300">
                <div className="space-y-1">
                   <label className="block text-[10px] font-bold text-gray-400 uppercase">Photo</label>
                   <div 
                     onClick={() => openMediaLibrary('guest')}
                     className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#263238]/30 hover:bg-red-50/10 transition-all overflow-hidden group mx-auto mb-2"
                   >
                     {form.data.guestAuthorImage ? (
                       <img src={form.data.guestAuthorImage} className="w-full h-full object-cover" />
                     ) : (
                       <ImageIcon className="w-5 h-5 text-gray-300 group-hover:text-[#263238]" />
                     )}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={form.data.guestAuthorNameBn} onChange={e => form.setData('guestAuthorNameBn', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238]" placeholder="নাম (বাংলা)..." />
                  <input type="text" value={form.data.guestAuthorNameEn} onChange={e => form.setData('guestAuthorNameEn', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238]" placeholder="Name (EN)..." />
                </div>
                <textarea rows="2" value={form.data.guestAuthorBioBn} onChange={e => form.setData('guestAuthorBioBn', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#263238] resize-none" placeholder="লেখকের সংক্ষিপ্ত পরিচিতি..." />
              </div>
            )}
            
            {!form.data.isGuestAuthor && (
              <p className="text-[10px] text-gray-400 leading-tight">Opinion will be credited to you or the selected Co-author.</p>
            )}
          </div>

          {/* Edition Selection */}
          <div className="bg-white p-5 rounded-xl border border-[var(--card-border,#e8ebf4)] shadow-sm">
            <h3 className="text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider mb-3">{lang === 'bn' ? 'সংস্করণ (Edition)' : 'Edition'}</h3>
            <div className="space-y-2">
              {[
                { val: 'both', labelBn: 'উভয় (বাংলা + ইংরেজি)', labelEn: 'Both (Bangla + English)' },
                { val: 'bn', labelBn: 'শুধু বাংলা', labelEn: 'Bangla Only' },
                { val: 'en', labelBn: 'শুধু ইংরেজি', labelEn: 'English Only' }
              ].map(ed => (
                <label key={ed.val} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${form.data.edition === ed.val ? 'border-[#263238] bg-[#eceff1]' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="edition"
                    value={ed.val}
                    checked={form.data.edition === ed.val}
                    onChange={(e) => form.setData('edition', e.target.value)}
                    className="w-4 h-4 text-[#263238] focus:ring-[#263238]"
                  />
                  <span className={`text-xs font-semibold ${form.data.edition === ed.val ? 'text-[#263238]' : 'text-gray-700'}`}>
                    {lang === 'bn' ? ed.labelBn : ed.labelEn}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-5 rounded-xl border border-[var(--card-border,#e8ebf4)] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider">{lang === 'bn' ? 'ফিচার্ড ছবি' : 'Featured Image'}</h3>
              <button
                type="button"
                onClick={() => openMediaLibrary('featured')}
                className="text-[10px] font-bold text-[#263238] hover:underline flex items-center gap-1"
              >
                <ImageIcon className="w-3 h-3" /> {lang === 'bn' ? 'লাইব্রেরি' : 'Library'}
              </button>
            </div>

            {!form.data.featuredImage ? (
              <button
                type="button"
                onClick={() => openMediaLibrary('featured')}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-[#263238]/30 hover:bg-red-50/10 transition-all group"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-red-50 transition-colors">
                  <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-[#263238]" />
                </div>
                <span className="text-xs font-medium text-gray-500 group-hover:text-[#263238]">{lang === 'bn' ? 'ছবি নির্বাচন করুন' : 'Select Image'}</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 group">
                <img src={form.data.featuredImage} alt="Featured" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <button
                     type="button"
                     onClick={() => openMediaLibrary('featured')}
                     className="p-2 bg-white rounded-full text-gray-700 hover:text-[#263238] transition-colors"
                   >
                     <ImageIcon className="w-4 h-4" />
                   </button>
                   <button 
                     type="button"
                     onClick={() => form.setData('featuredImage', '')}
                     className="p-2 bg-white rounded-full text-[#263238] hover:bg-red-50 transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* SEO & Slugs */}
          <div className="bg-white p-5 rounded-xl border border-[var(--card-border,#e8ebf4)] shadow-sm space-y-4">
            <h3 className="text-[11px] font-bold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider border-b border-gray-50 pb-2">{lang === 'bn' ? 'স্লাগ ও URL' : 'Slugs & URL'}</h3>
            
            {showBn && (
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">বাংলা স্লাগ</label>
                <input 
                  type="text" 
                  value={form.data.slugBn} 
                  onChange={e => {
                    setManuallyEditedSlugBn(true);
                    form.setData('slugBn', e.target.value);
                  }} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#263238] bg-gray-50 focus:bg-white transition-colors" 
                />
                {form.errors.slugBn && <div className="text-[#263238] text-[10px] mt-1">{form.errors.slugBn}</div>}
              </div>
            )}
            
            {showEn && (
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">English Slug</label>
                <input 
                  type="text" 
                  value={form.data.slugEn} 
                  onChange={e => {
                    setManuallyEditedSlugEn(true);
                    form.setData('slugEn', e.target.value);
                  }} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-[#263238] bg-gray-50 focus:bg-white transition-colors" 
                />
                {form.errors.slugEn && <div className="text-[#263238] text-[10px] mt-1">{form.errors.slugEn}</div>}
              </div>
            )}
          </div>

        </div>
      </div>

      <MediaLibraryModal 
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaSelect}
        initialType="image"
      />

      <ConfirmationModal 
        isOpen={showTranslateConfirm}
        onClose={() => setShowTranslateConfirm(false)}
        onConfirm={() => translateEmptyFields(true)}
        variant="warning"
        title={lang === 'bn' ? 'অনুবাদ ওভাররাইট নিশ্চিতকরণ' : 'Confirm Overwrite'}
        message={lang === 'bn' 
          ? 'আপনি কি নিশ্চিত যে আপনি বিদ্যমান অনুবাদগুলি মুছে ফেলে নতুন করে অনুবাদ করতে চান?' 
          : 'Are you sure you want to overwrite existing fields with fresh translations? This will replace your current text.'}
        confirmText={lang === 'bn' ? 'হ্যাঁ, অনুবাদ করুন' : 'Yes, Translate'}
        cancelText={lang === 'bn' ? 'না, থাক' : 'Cancel'}
        lang={lang}
      />
    </div>
  );
}
