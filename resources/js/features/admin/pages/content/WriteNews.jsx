import { useState, useEffect, useCallback } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import {
  Save, Send, Eye, Image as ImageIcon, X, Plus, Type, Tag, FileText,
  Settings, ChevronRight, ChevronLeft, Newspaper, Globe, Clock, CheckCircle,
  FolderTree, Trash2
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';
import MediaUpload from '../../components/forms/MediaUpload';
import RichTextEditor from '../../components/editor/RichTextEditor';
import MediaLibraryModal from '../../components/media/MediaLibraryModal';

/**
 * Slugify helper — creates URL-friendly slugs from titles.
 */
function slugify(text, lang) {
  if (!text) return '';
  
  let slug = text.toLowerCase().trim();
  
  if (lang === 'bn') {
    // Keep Unicode letters and numbers, replace everything else with dash
    slug = slug.replace(/[^\p{L}\p{N}]+/gu, '-');
  } else {
    // Standard latin slugify
    slug = slug.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  }
  
  return slug
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Character counter component.
 */
function CharCounter({ current, max }) {
  const over = current > max;
  return (
    <div className={`text-[11px] mt-1.5 ${over ? 'text-red-500 font-semibold' : 'text-[var(--text-muted,#9ca3af)]'}`}>
      {current}/{max} {over ? '(over limit!)' : 'characters'}
    </div>
  );
}

/**
 * Step indicator component.
 */
function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        return (
          <button
            key={step.id}
            onClick={() => onStepClick(i)}
            className="flex items-center gap-2 flex-1"
            disabled={i > currentStep}
          >
            <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all ${
              isActive ? 'border-[#e8001e] bg-[#e8001e] text-white' :
              isCompleted ? 'border-[#10b981] bg-[#10b981] text-white' :
              'border-[var(--card-border,#e8ebf4)] text-[var(--text-muted,#9ca3af)]'
            }`}>
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
            </div>
            <div className="flex-1 text-left">
              <div className={`text-xs font-semibold ${isActive ? 'text-[#e8001e]' : isCompleted ? 'text-[#10b981]' : 'text-[var(--text-muted,#9ca3af)]'}`}>
                {step.label}
              </div>
              <div className="text-[10px] text-[var(--text-muted,#9ca3af)]">{step.description}</div>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-[var(--text-muted,#9ca3af)] flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function WriteNews() {
  const { authors = [] } = usePage().props;
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { onNavigate } = useAdminNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Props passed from controller when editing
  const { article } = usePage().props;

  // Fetch categories from database on mount
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        // Transform snake_case from API to camelCase for frontend use
        const transformed = data.map(c => ({
          id: c.id,
          parentId: c.parent_id,
          nameBn: c.name_bn,
          nameEn: c.name_en,
          slug: c.slug,
          edition: c.edition,
          isActive: c.is_active,
        }));
        setCategories(transformed);
      })
      .catch((err) => {
        console.error('Failed to fetch categories:', err);
        setCategories([]);
      });
  }, []);

  const form = useForm({
    // Content
    titleBn: '',
    titleEn: '',
    subtitleBn: '',
    subtitleEn: '',
    bodyBn: '',
    bodyEn: '',
    excerptBn: '',
    excerptEn: '',

    // SEO Slugs
    slugBn: '',
    slugEn: '',

    // Edition & Type
    edition: 'both',
    articleType: 'news',
    status: 'draft',

    // Flags
    isBreaking: false,
    isFeatured: false,
    isPremium: false,
    isExclusive: false,
    isGuestAuthor: false,

    // Relationships
    category: '',
    subcategory: '',
    authorId: '',
    secondaryAuthorId: '',
    guestAuthorNameBn: '',
    guestAuthorNameEn: '',
    guestAuthorBioBn: '',
    guestAuthorBioEn: '',
    guestAuthorImage: '',
    tags: [],

    // Media
    featuredImage: '',
    featuredImageAltBn: '',
    featuredImageAltEn: '',

    // SEO
    metaTitleBn: '',
    metaTitleEn: '',
    metaDescBn: '',
    metaDescEn: '',

    // Publishing
    publishAt: '',
    scheduledAt: '',

    // Notifications
    sendPushNotification: false,
    allowComments: true,
  });

  // Populate form when editing
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
        articleType: article.articleType || 'news',
        status: article.status || 'draft',
        isBreaking: !!article.isBreaking,
        isFeatured: !!article.isFeatured,
        isPremium: !!article.isPremium,
        isExclusive: !!article.isExclusive,
        isGuestAuthor: !!article.isGuestAuthor,
        category: article.category?.id || article.category || '',
        subcategory: article.subcategory?.id || article.subcategory || '',
        authorId: article.authorId || '',
        secondaryAuthorId: article.secondaryAuthorId || '',
        guestAuthorNameBn: article.guestAuthorNameBn || '',
        guestAuthorNameEn: article.guestAuthorNameEn || '',
        guestAuthorBioBn: article.guestAuthorBioBn || '',
        guestAuthorBioEn: article.guestAuthorBioEn || '',
        guestAuthorImage: article.guestAuthorImage || '',
        featuredImage: article.featuredImage || '',
        featuredImageAltBn: article.featuredImageAltBn || '',
        featuredImageAltEn: article.featuredImageAltEn || '',
        metaTitleBn: article.metaTitleBn || '',
        metaTitleEn: article.metaTitleEn || '',
        metaDescBn: article.metaDescBn || '',
        metaDescEn: article.metaDescEn || '',
        scheduledAt: article.scheduledAt || '',
        tags: article.tags || [],
      });
    }
  }, [article]);

  const [tagsInput, setTagsInput] = useState('');
  const [manuallyEditedSlugBn, setManuallyEditedSlugBn] = useState(false);
  const [manuallyEditedSlugEn, setManuallyEditedSlugEn] = useState(false);
  const [manuallyEditedMetaBn, setManuallyEditedMetaBn] = useState(false);
  const [manuallyEditedMetaEn, setManuallyEditedMetaEn] = useState(false);

  // Auto-generate slugs and meta titles from Bengali title
  useEffect(() => {
    if (article) return;
    
    const title = form.data.titleBn || '';
    const newSlug = slugify(title, 'bn');
    
    const updates = {};
    if (!manuallyEditedSlugBn && form.data.slugBn !== newSlug) {
      updates.slugBn = newSlug;
    }
    if (!manuallyEditedMetaBn && form.data.metaTitleBn !== title) {
      updates.metaTitleBn = title;
    }
    
    if (Object.keys(updates).length > 0) {
      form.setData(data => ({ ...data, ...updates }));
    }
  }, [form.data.titleBn]);

  // Auto-generate slugs and meta titles from English title
  useEffect(() => {
    if (article) return;
    
    const title = form.data.titleEn || '';
    const newSlug = slugify(title, 'en');
    
    const updates = {};
    if (!manuallyEditedSlugEn && form.data.slugEn !== newSlug) {
      updates.slugEn = newSlug;
    }
    if (!manuallyEditedMetaEn && form.data.metaTitleEn !== title) {
      updates.metaTitleEn = title;
    }
    
    if (Object.keys(updates).length > 0) {
      form.setData(data => ({ ...data, ...updates }));
    }
  }, [form.data.titleEn]);

  const addTag = () => {
    const tag = tagsInput.trim();
    if (tag && !form.data.tags.includes(tag)) {
      form.setData('tags', [...form.data.tags, tag]);
      setTagsInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    form.setData('tags', form.data.tags.filter((t) => t !== tagToRemove));
  };

  const handlePublish = () => {
    // Validate required fields based on edition
    const needsBn = form.data.edition === 'bn' || form.data.edition === 'both';
    const needsEn = form.data.edition === 'en' || form.data.edition === 'both';

    if (needsBn && !form.data.titleBn.trim()) {
      showToast(lang === 'bn' ? 'বাংলা শিরোনাম প্রয়োজন!' : 'Bengali title is required!');
      return;
    }
    if (needsEn && !form.data.titleEn.trim()) {
      showToast(lang === 'bn' ? 'ইংরেজি শিরোনাম প্রয়োজন!' : 'English title is required!');
      return;
    }
    if (needsBn && !form.data.bodyBn.trim()) {
      showToast(lang === 'bn' ? 'বাংলা বিষয়বস্তু প্রয়োজন!' : 'Bengali content is required!');
      return;
    }
    if (needsEn && !form.data.bodyEn.trim()) {
      showToast(lang === 'bn' ? 'ইংরেজি বিষয়বস্তু প্রয়োজন!' : 'English content is required!');
      return;
    }

    // Validate category-edition match
    if (form.data.category) {
      const selectedCategory = categories.find((c) => c.slug === form.data.category);
      if (selectedCategory && selectedCategory.edition !== 'both' && selectedCategory.edition !== form.data.edition) {
        showToast(
          lang === 'bn'
            ? `বিভাগ "${selectedCategory.nameBn}" শুধুমাত্র ${selectedCategory.edition === 'bn' ? 'বাংলা' : 'ইংরেজি'} এডিশনের জন্য!`
            : `Category "${selectedCategory.nameEn || selectedCategory.nameBn}" is for ${selectedCategory.edition === 'bn' ? 'Bangla' : 'English'} edition only!`
        );
        return;
      }
    }

    form.transform((data) => ({ ...data, status: 'published' }));
    const url = article ? route('admin.news.update', { article: article.id }) : route('admin.news.store');
    const method = article ? 'put' : 'post';
    form[method](url, {
      onSuccess: () => showToast(lang === 'bn' ? 'সংবাদ প্রকাশিত হয়েছে!' : 'Article published!'),
    });
  };

  const handleDraft = () => {
    form.transform((data) => ({ ...data, status: 'draft' }));
    const url = article ? route('admin.news.update', { article: article.id }) : route('admin.news.store');
    const method = article ? 'put' : 'post';
    form[method](url, {
      onSuccess: () => showToast(lang === 'bn' ? 'ড্রাফট সংরক্ষিত হয়েছে' : 'Draft saved'),
    });
  };

  const handleSubmitForReview = () => {
    form.transform((data) => ({ ...data, status: 'pending' }));
    const url = article ? route('admin.news.update', { article: article.id }) : route('admin.news.store');
    const method = article ? 'put' : 'post';
    form[method](url, {
      onSuccess: () => showToast(lang === 'bn' ? 'অনুমোদনের জন্য পাঠানো হয়েছে' : 'Sent for approval'),
    });
  };

  const [activeMediaTarget, setActiveMediaTarget] = useState('featured'); // 'featured' or 'guest'

  const handleFeaturedFileSelected = async (files) => {
    if (!files?.length) return;
    const file = files[0];
    setMediaFiles([file]);
    setUploadingFeatured(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('edition', form.data.edition || 'both');
      formData.append('license_type', 'internal');
      const res = await fetch('/admin/media', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
          'Accept': 'application/json',
        },
      });
      const data = await res.json();
      if (data.success && data.url) {
        form.setData({
          ...form.data,
          featuredImage: data.url,
          featuredImageAltBn: data.media?.alt_text_bn || '',
          featuredImageAltEn: data.media?.alt_text_en || '',
        });
        setMediaFiles([]);
      } else {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : (data.message || (lang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Image upload failed'));
        showToast(errMsg, 'error');
      }
    } catch {
      showToast(lang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Image upload failed', 'error');
    } finally {
      setUploadingFeatured(false);
    }
  };

  const handleMediaSelect = (media) => {
    if (activeMediaTarget === 'featured') {
      form.setData({
        ...form.data,
        featuredImage: media.url,
        featuredImageAltBn: media.alt_text_bn || '',
        featuredImageAltEn: media.alt_text_en || '',
      });
      setMediaFiles([]); // Clear local file if selected from library
    } else {
      form.setData('guestAuthorImage', media.url);
    }
    setShowMediaLibrary(false);
  };

  const steps = [
    {
      id: 'setup',
      label: lang === 'bn' ? 'সেটআপ' : 'Setup',
      description: lang === 'bn' ? 'ধরন ও এডিশন' : 'Type & Edition',
      icon: Newspaper,
    },
    {
      id: 'content',
      label: lang === 'bn' ? 'বিষয়বস্তু' : 'Content',
      description: lang === 'bn' ? 'শিরোনাম ও লেখা' : 'Title & Body',
      icon: FileText,
    },
    {
      id: 'media-seo',
      label: lang === 'bn' ? 'মিডিয়া ও SEO' : 'Media & SEO',
      description: lang === 'bn' ? 'ছবি ও মেটা' : 'Images & Meta',
      icon: ImageIcon,
    },
    {
      id: 'settings',
      label: lang === 'bn' ? 'সেটিংস' : 'Settings',
      description: lang === 'bn' ? 'প্রকাশ ও ফ্ল্যাগ' : 'Publish & Flags',
      icon: Settings,
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Determine which fields to show based on edition
  const showBn = form.data.edition === 'bn' || form.data.edition === 'both';
  const showEn = form.data.edition === 'en' || form.data.edition === 'both';

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">✏️ {lang === 'bn' ? 'নতুন সংবাদ লিখুন' : 'Write New Article'}</h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'নতুন সংবাদ তৈরি ও প্রকাশ করুন' : 'Create and publish a new article'}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => showToast(lang === 'bn' ? 'প্রিভিউ দেখা হচ্ছে...' : 'Previewing...')}
            className="bg-white text-[var(--text-secondary,#6b7280)] border border-[var(--card-border,#e8ebf4)] rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" /> {lang === 'bn' ? 'প্রিভিউ' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5 mb-5">
        <StepIndicator steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
      </div>

      {/* ═══════════════════════════════════════════
          STEP 1: Article Setup
      ════════════════════════════════════════════ */}
      {currentStep === 0 && (
        <div className="grid grid-cols-[1fr_320px] gap-4.5">
          <div className="space-y-4.5">
            {/* Article Type */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'নিবন্ধের ধরন' : 'Article Type'}</h3>
              <select
                value={form.data.articleType}
                onChange={(e) => form.setData('articleType', e.target.value)}
                className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8001e] transition-colors"
              >
                <option value="news">{lang === 'bn' ? 'সংবাদ' : 'News'}</option>
                <option value="feature">{lang === 'bn' ? 'ফিচার' : 'Feature'}</option>
                <option value="opinion">{lang === 'bn' ? 'মতামত' : 'Opinion'}</option>
                <option value="interview">{lang === 'bn' ? 'সাক্ষাৎকার' : 'Interview'}</option>
                <option value="explainer">{lang === 'bn' ? 'ব্যাখ্যামূলক' : 'Explainer'}</option>
                <option value="video">{lang === 'bn' ? 'ভিডিও' : 'Video'}</option>
                <option value="photo">{lang === 'bn' ? 'ফটো এসে' : 'Photo Essay'}</option>
                <option value="liveblog">{lang === 'bn' ? 'লাইভ ব্লগ' : 'Live Blog'}</option>
                <option value="sponsored">{lang === 'bn' ? 'স্পনসরড' : 'Sponsored'}</option>
                </select>

                {form.data.articleType === 'video' && (
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">{lang === 'bn' ? 'ভিডিও সোর্স (Provider)' : 'Video Provider'}</label>
                  <div className="flex gap-2">
                    {['youtube', 'vimeo', 'local'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => form.setData('videoProvider', p)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          form.data.videoProvider === p ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-50">
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
                    <div>
                      <div className="text-sm font-bold text-gray-700 group-hover:text-orange-600 transition-colors">{lang === 'bn' ? 'এক্সক্লুসিভ (Exclusive)' : 'Mark as Exclusive'}</div>
                      <div className="text-[10px] text-gray-400">Highlighted as investigative or proprietary content</div>
                    </div>
                  </label>
                </div>
            </div>

            {/* Guest Author */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5 font-['Noto_Sans_Bengali']">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">{lang === 'bn' ? 'অতিথি লেখক (Guest Author)' : 'Guest Author'}</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={form.data.isGuestAuthor} 
                      onChange={e => form.setData('isGuestAuthor', e.target.checked)} 
                    />
                    <div className={`block w-8 h-5 rounded-full transition-colors ${form.data.isGuestAuthor ? 'bg-[#e8001e]' : 'bg-gray-200'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${form.data.isGuestAuthor ? 'translate-x-3' : ''}`}></div>
                  </div>
                </label>
              </div>

              {form.data.isGuestAuthor && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
                    <div className="space-y-1">
                       <label className="block text-[10px] font-bold text-gray-400 uppercase">Photo</label>
                       <div 
                         onClick={() => { setActiveMediaTarget('guest'); setShowMediaLibrary(true); }}
                         className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#e8001e]/30 hover:bg-red-50/10 transition-all overflow-hidden group"
                       >
                         {form.data.guestAuthorImage ? (
                           <img src={form.data.guestAuthorImage} className="w-full h-full object-cover" />
                         ) : (
                           <ImageIcon className="w-5 h-5 text-gray-300 group-hover:text-[#e8001e]" />
                         )}
                       </div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={form.data.guestAuthorNameBn} onChange={e => form.setData('guestAuthorNameBn', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8001e]" placeholder="লেখকের নাম (বাংলা)..." />
                        <input type="text" value={form.data.guestAuthorNameEn} onChange={e => form.setData('guestAuthorNameEn', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8001e]" placeholder="Author Name (English)..." />
                      </div>
                      <textarea rows="2" value={form.data.guestAuthorBioBn} onChange={e => form.setData('guestAuthorBioBn', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8001e] resize-none" placeholder="লেখকের সংক্ষিপ্ত পরিচিতি..." />
                    </div>
                  </div>
                </div>
              )}
              
              {!form.data.isGuestAuthor && (
                <p className="text-[11px] text-gray-400">Article will be credited to the staff member selected in settings.</p>
              )}
            </div>

            {/* Edition */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'এডিশন নির্বাচন করুন' : 'Select Edition'}</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-[var(--card-border,#e8ebf4)] rounded-lg cursor-pointer hover:bg-[#fff0f2] transition-colors">
                  <input
                    type="radio"
                    name="edition"
                    value="both"
                    checked={form.data.edition === 'both'}
                    onChange={(e) => form.setData('edition', e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary,#1a1d2e)]">
                      {lang === 'bn' ? 'উভয় (বাংলা + ইংরেজি)' : 'Both (Bangla + English)'}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted,#9ca3af)]">
                      {lang === 'bn' ? 'দুই ভাষাতেই বিষয়বস্তু লিখুন' : 'Write content in both languages'}
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-[var(--card-border,#e8ebf4)] rounded-lg cursor-pointer hover:bg-[#fff0f2] transition-colors">
                  <input
                    type="radio"
                    name="edition"
                    value="bn"
                    checked={form.data.edition === 'bn'}
                    onChange={(e) => form.setData('edition', e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary,#1a1d2e)]">
                      {lang === 'bn' ? 'শুধু বাংলা' : 'Bangla Only'}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted,#9ca3af)]">
                      {lang === 'bn' ? 'শুধুমাত্র বাংলা বিষয়বস্তু দেখানো হবে' : 'Only Bengali content fields will be shown'}
                    </div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-[var(--card-border,#e8ebf4)] rounded-lg cursor-pointer hover:bg-[#fff0f2] transition-colors">
                  <input
                    type="radio"
                    name="edition"
                    value="en"
                    checked={form.data.edition === 'en'}
                    onChange={(e) => form.setData('edition', e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary,#1a1d2e)]">
                      {lang === 'bn' ? 'শুধু ইংরেজি' : 'English Only'}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted,#9ca3af)]">
                      {lang === 'bn' ? 'শুধুমাত্র ইংরেজি বিষয়বস্তু দেখানো হবে' : 'Only English content fields will be shown'}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4.5">
            {/* Category & Subcategory */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5 font-['Noto_Sans_Bengali']">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#e8001e]" />
                {lang === 'bn' ? 'বিভাগ ও উপ-বিভাগ' : 'Category & Sub'}
              </h3>
              
              <div className="space-y-4">
                {/* Parent Category */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'প্রধান বিভাগ' : 'Main Category'}</label>
                  <select
                    value={form.data.category}
                    onChange={(e) => {
                      form.setData({ ...form.data, category: e.target.value, subcategory: '' });
                    }}
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8001e] bg-white transition-all"
                  >
                    <option value="">{lang === 'bn' ? 'নির্বাচন করুন' : 'Select Category'}</option>
                    {categories
                      .filter(c => !c.parentId && (c.edition === 'both' || c.edition === form.data.edition))
                      .map(c => (
                        <option key={c.id} value={c.id}>{lang === 'bn' ? c.nameBn : (c.nameEn || c.nameBn)}</option>
                      ))
                    }
                  </select>
                </div>

                {/* Subcategory (Only show if parent selected and has children) */}
                {form.data.category && categories.some(c => String(c.parentId) === String(form.data.category)) && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'উপ-বিভাগ (Subcategory)' : 'Subcategory'}</label>
                    <select
                      value={form.data.subcategory}
                      onChange={(e) => form.setData('subcategory', e.target.value)}
                      className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8001e] bg-white transition-all"
                    >
                      <option value="">{lang === 'bn' ? 'প্রযোজ্য নয়' : 'None / Not Applicable'}</option>
                      {categories
                        .filter(c => String(c.parentId) === String(form.data.category))
                        .map(c => (
                          <option key={c.id} value={c.id}>{lang === 'bn' ? c.nameBn : (c.nameEn || c.nameBn)}</option>
                        ))
                      }
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50">
                 <div className="text-[10px] text-gray-400 leading-relaxed">
                   Proper categorization ensures the article appears in the correct sections of the portal and improves SEO.
                 </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'ট্যাগ' : 'Tags'}</h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder={lang === 'bn' ? 'ট্যাগ যোগ করুন...' : 'Add tag...'}
                  className="flex-1 border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#e8001e] transition-colors"
                />
                <button onClick={addTag} className="bg-[#e8001e] text-white rounded-lg px-2 py-1.5 hover:bg-[#b8001a] transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {(form.data.tags || []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-[var(--body-bg,#f0f2f8)] rounded-full px-2.5 py-1 text-[11px] font-medium">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-[#e8001e] transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {form.data.tags.length === 0 && (
                  <span className="text-[11px] text-[var(--text-muted,#9ca3af)]">
                    {lang === 'bn' ? 'কোনো ট্যাগ নেই' : 'No tags added'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          STEP 2: Content (Edition-Aware)
      ════════════════════════════════════════════ */}
      {currentStep === 1 && (
        <div className="grid grid-cols-[1fr_320px] gap-4.5">
          <div className="space-y-4.5">
            {/* Bengali Content */}
            {showBn && (
              <>
                <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-[#e8001e]" />
                    <h3 className="text-sm font-bold text-[var(--text-primary,#1a1d2e)]">
                      {lang === 'bn' ? 'বাংলা বিষয়বস্তু' : 'Bengali Content'}
                    </h3>
                  </div>
                  <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2">
                    {lang === 'bn' ? 'শিরোনাম' : 'Title'} *
                  </label>
                  <input
                    type="text"
                    value={form.data.titleBn}
                    onChange={(e) => form.setData('titleBn', e.target.value)}
                    placeholder={lang === 'bn' ? 'এখানে শিরোনাম লিখুন...' : 'Enter Bengali title...'}
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                  />
                  <CharCounter current={(form.data.titleBn || "").length} max={100} />

                  <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2 mt-3">
                    {lang === 'bn' ? 'সাবটাইটেল' : 'Subtitle'}
                  </label>
                  <input
                    type="text"
                    value={form.data.subtitleBn}
                    onChange={(e) => form.setData('subtitleBn', e.target.value)}
                    placeholder={lang === 'bn' ? 'সাবটাইটেল লিখুন...' : 'Enter Bengali subtitle...'}
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                  />

                  <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2 mt-3">
                    {lang === 'bn' ? 'বিষয়বস্তু' : 'Content'} *
                  </label>
                  <RichTextEditor
                    value={form.data.bodyBn}
                    onChange={(val) => form.setData('bodyBn', val)}
                    lang="bn"
                    placeholder={lang === 'bn' ? 'এখানে সংবাদ লিখুন...' : 'Write article content in Bengali...'}
                  />

                  <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2 mt-3">
                    {lang === 'bn' ? 'সংক্ষিপ্ত সার (Excerpt)' : 'Excerpt'}
                  </label>
                  <textarea
                    value={form.data.excerptBn}
                    onChange={(e) => form.setData('excerptBn', e.target.value)}
                    placeholder={lang === 'bn' ? 'সংক্ষিপ্ত সার লিখুন...' : 'Write a brief excerpt...'}
                    rows={3}
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                  />
                </div>
              </>
            )}

            {/* English Content */}
            {showEn && (
              <>
                <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-[#3b82f6]" />
                    <h3 className="text-sm font-bold text-[var(--text-primary,#1a1d2e)]">
                      {lang === 'bn' ? 'ইংরেজি বিষয়বস্তু' : 'English Content'}
                    </h3>
                  </div>
                  <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.data.titleEn}
                    onChange={(e) => form.setData('titleEn', e.target.value)}
                    placeholder="Enter English title..."
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                  />
                  <CharCounter current={form.data.titleEn.length} max={100} />

                  <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2 mt-3">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={form.data.subtitleEn}
                    onChange={(e) => form.setData('subtitleEn', e.target.value)}
                    placeholder="Enter English subtitle..."
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                  />

                  <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2 mt-3">
                    Content *
                  </label>
                  <RichTextEditor
                    value={form.data.bodyEn}
                    onChange={(val) => form.setData('bodyEn', val)}
                    lang="en"
                    placeholder="Write article content in English..."
                  />

                  <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2 mt-3">
                    Excerpt
                  </label>
                  <textarea
                    value={form.data.excerptEn}
                    onChange={(e) => form.setData('excerptEn', e.target.value)}
                    placeholder="Write a brief excerpt..."
                    rows={3}
                    className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                  />
                </div>
              </>
            )}
          </div>

          {/* Sidebar: Auto-generated slugs */}
          <div className="space-y-4.5">
            {showBn && (
              <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'বাংলা URL স্লাগ' : 'Bengali URL Slug'}</h3>
                <input
                  type="text"
                  value={form.data.slugBn}
                  onChange={(e) => {
                    setManuallyEditedSlugBn(true);
                    form.setData('slugBn', e.target.value);
                  }}
                  placeholder="auto-generated-from-title"
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors font-mono"
                />
                <p className="text-[11px] text-[var(--text-muted,#9ca3af)] mt-2">
                  {lang === 'bn' ? 'শিরোনাম থেকে স্বয়ংক্রিয়ভাবে তৈরি' : 'Auto-generated from title'}
                </p>
              </div>
            )}

            {showEn && (
              <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-bold mb-3">English URL Slug</h3>
                <input
                  type="text"
                  value={form.data.slugEn}
                  onChange={(e) => {
                    setManuallyEditedSlugEn(true);
                    form.setData('slugEn', e.target.value);
                  }}
                  placeholder="auto-generated-from-title"
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors font-mono"
                />
                <p className="text-[11px] text-[var(--text-muted,#9ca3af)] mt-2">
                  Auto-generated from title
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          STEP 3: Media & SEO (Edition-Aware)
      ════════════════════════════════════════════ */}
      {currentStep === 2 && (
        <div className="grid grid-cols-[1fr_320px] gap-4.5">
          <div className="space-y-4.5">
            {/* Featured Image */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5 font-['Noto_Sans_Bengali']">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold">{lang === 'bn' ? 'ফিচার্ড ছবি' : 'Featured Image'}</h3>
                <button 
                  type="button"
                  onClick={() => setShowMediaLibrary(true)}
                  className="text-[11px] font-bold text-[#e8001e] hover:underline flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3" /> {lang === 'bn' ? 'লাইব্রেরি থেকে নিন' : 'Choose from Library'}
                </button>
              </div>
              
              {!form.data.featuredImage ? (
                uploadingFeatured ? (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg gap-2">
                    <div className="w-6 h-6 border-2 border-[#e8001e] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-[var(--text-muted,#9ca3af)]">
                      {lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}
                    </span>
                  </div>
                ) : (
                  <MediaUpload
                    onFilesSelected={handleFeaturedFileSelected}
                    accept="image/*"
                    maxSizeMB={5}
                    multiple={false}
                    label={lang === 'bn' ? 'ড্র্যাগ ও ড্রপ বা ব্রাউজ করুন' : 'Drag & drop or browse'}
                  />
                )
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                  <img src={form.data.featuredImage} alt="Featured" className="w-full h-48 object-cover font-['Noto_Sans_Bengali']" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <button 
                       type="button"
                       onClick={() => setShowMediaLibrary(true)}
                       className="p-2 bg-white rounded-full text-gray-700 hover:text-[#e8001e]"
                     >
                       <ImageIcon className="w-5 h-5" />
                     </button>
                     <button 
                       type="button"
                       onClick={() => form.setData('featuredImage', '')}
                       className="p-2 bg-white rounded-full text-[#e8001e] hover:bg-red-50"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              )}


              <MediaLibraryModal 
                isOpen={showMediaLibrary}
                onClose={() => setShowMediaLibrary(false)}
                onSelect={handleMediaSelect}
                initialType="image"
              />
            </div>

            {/* Bengali SEO */}
            {showBn && (
              <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'বাংলা SEO' : 'Bengali SEO'}</h3>
                <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2">
                  {lang === 'bn' ? 'মেটা শিরোনাম' : 'Meta Title'}
                </label>
                <input
                  type="text"
                  value={form.data.metaTitleBn}
                  onChange={(e) => {
                    setManuallyEditedMetaBn(true);
                    form.setData('metaTitleBn', e.target.value);
                  }}
                  placeholder={lang === 'bn' ? 'মেটা শিরোনাম লিখুন...' : 'Enter meta title...'}
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                />
                <CharCounter current={form.data.metaTitleBn.length} max={60} />

                <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2 mt-3">
                  {lang === 'bn' ? 'মেটা বিবরণ' : 'Meta Description'}
                </label>
                <textarea
                  value={form.data.metaDescBn}
                  onChange={(e) => form.setData('metaDescBn', e.target.value)}
                  placeholder={lang === 'bn' ? 'মেটা বিবরণ লিখুন...' : 'Enter meta description...'}
                  rows={3}
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                />
                <CharCounter current={form.data.metaDescBn.length} max={160} />

                <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2 mt-3">
                  {lang === 'bn' ? 'ছবির বিকল্প পাঠ্য' : 'Image Alt Text'}
                </label>
                <input
                  type="text"
                  value={form.data.featuredImageAltBn}
                  onChange={(e) => form.setData('featuredImageAltBn', e.target.value)}
                  placeholder={lang === 'bn' ? 'ছবির বর্ণনা...' : 'Image description...'}
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                />
              </div>
            )}

            {/* English SEO */}
            {showEn && (
              <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-bold mb-3">English SEO</h3>
                <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={form.data.metaTitleEn}
                  onChange={(e) => {
                    setManuallyEditedMetaEn(true);
                    form.setData('metaTitleEn', e.target.value);
                  }}
                  placeholder="Enter meta title..."
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                />
                <CharCounter current={form.data.metaTitleEn.length} max={60} />

                <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2 mt-3">
                  Meta Description
                </label>
                <textarea
                  value={form.data.metaDescEn}
                  onChange={(e) => form.setData('metaDescEn', e.target.value)}
                  placeholder="Enter meta description..."
                  rows={3}
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                />
                <CharCounter current={(form.data.metaDescEn || "").length} max={160} />

                <label className="block text-xs font-semibold text-[var(--text-primary,#1a1d2e)] mb-2 mt-3">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  value={form.data.featuredImageAltEn}
                  onChange={(e) => form.setData('featuredImageAltEn', e.target.value)}
                  placeholder="Image description..."
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                />
              </div>
            )}
          </div>

          {/* Sidebar: SEO Preview */}
          <div className="space-y-4.5">
            {/* Google Preview */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'Google প্রিভিউ' : 'Google Preview'}</h3>
              {showBn && (
                <div className="mb-4 p-3 bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg">
                  <div className="text-sm text-[#1a0dab] font-medium mb-1 truncate">
                    {form.data.metaTitleBn || (lang === 'bn' ? 'মেটা শিরোনাম এখানে দেখা যাবে' : 'Meta title will appear here')}
                  </div>
                  <div className="text-xs text-[#006621] mb-1 truncate">
                    নবদিগন্ত › {form.data.category || 'category'}
                  </div>
                  <div className="text-xs text-[#545454] line-clamp-2">
                    {form.data.metaDescBn || (lang === 'bn' ? 'মেটা বিবরণ এখানে দেখা যাবে...' : 'Meta description will appear here...')}
                  </div>
                </div>
              )}
              {showEn && (
                <div className="p-3 bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg">
                  <div className="text-sm text-[#1a0dab] font-medium mb-1 truncate">
                    {form.data.metaTitleEn || 'Meta title will appear here'}
                  </div>
                  <div className="text-xs text-[#006621] mb-1 truncate">
                    Prothom Alo › {form.data.category || 'category'}
                  </div>
                  <div className="text-xs text-[#545454] line-clamp-2">
                    {form.data.metaDescEn || 'Meta description will appear here...'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          STEP 4: Settings & Publish
      ════════════════════════════════════════════ */}
      {currentStep === 3 && (
        <div className="grid grid-cols-[1fr_320px] gap-4.5">
          <div className="space-y-4.5">
            {/* Publication Status */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'প্রকাশের অবস্থা' : 'Publication Status'}</h3>
              <select
                value={form.data.status}
                onChange={(e) => form.setData('status', e.target.value)}
                className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8001e] transition-colors"
              >
                <option value="draft">{lang === 'bn' ? 'ড্রাফট' : 'Draft'}</option>
                <option value="pending">{lang === 'bn' ? 'অনুমোদন অপেক্ষায়' : 'Pending Approval'}</option>
                <option value="scheduled">{lang === 'bn' ? 'নির্ধারিত' : 'Scheduled'}</option>
                <option value="published">{lang === 'bn' ? 'প্রকাশিত' : 'Published'}</option>
              </select>
            </div>

            {/* Scheduled Publishing */}
            {form.data.status === 'scheduled' && (
              <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'প্রকাশের সময়' : 'Publish At'}</h3>
                <input
                  type="datetime-local"
                  value={form.data.scheduledAt}
                  onChange={(e) => form.setData('scheduledAt', e.target.value)}
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e] transition-colors"
                />
                <p className="text-xs text-[var(--text-muted,#9ca3af)] mt-2">
                  {lang === 'bn' ? 'নির্দিষ্ট সময়ে স্বয়ংক্রিয়ভাবে প্রকাশিত হবে' : 'Will be published automatically at specified time'}
                </p>
              </div>
            )}

            {/* Article Flags */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'নিবন্ধ ফ্ল্যাগ' : 'Article Flags'}</h3>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.data.isBreaking}
                  onChange={(e) => {
                    form.setData('isBreaking', e.target.checked);
                    if (e.target.checked) {
                      form.setData('sendPushNotification', true);
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-[var(--text-secondary,#6b7280)]">
                  {lang === 'bn' ? '🔴 ব্রেকিং নিউজ' : '🔴 Breaking News'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.data.isFeatured}
                  onChange={(e) => form.setData('isFeatured', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-[var(--text-secondary,#6b7280)]">
                  {lang === 'bn' ? '⭐ হোমপেজে ফিচার্ড' : '⭐ Feature on Homepage'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.data.isExclusive}
                  onChange={(e) => form.setData('isExclusive', e.target.checked)}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-orange-700 font-bold">
                  {lang === 'bn' ? '🔥 এক্সক্লুসিভ (Exclusive)' : '🔥 Mark as Exclusive'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.data.isPremium}
                  onChange={(e) => form.setData('isPremium', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-[var(--text-secondary,#6b7280)]">
                  {lang === 'bn' ? '💎 প্রিমিয়াম (পেওয়াল)' : '💎 Premium (Paywall)'}
                </span>
              </label>

              {form.data.isBreaking && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.data.sendPushNotification}
                    onChange={(e) => form.setData('sendPushNotification', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-[var(--text-secondary,#6b7280)]">
                    {lang === 'bn' ? '📱 পুশ নোটিফিকেশন পাঠান' : '📱 Send Push Notification'}
                  </span>
                </label>
              )}
            </div>

            {/* Authors */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5 space-y-4 font-['Noto_Sans_Bengali']">
              <h3 className="text-sm font-bold">{lang === 'bn' ? 'লেখকবৃন্দ' : 'Authors'}</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{lang === 'bn' ? 'প্রধান লেখক' : 'Primary Author'}</label>
                <select
                  value={form.data.authorId}
                  onChange={(e) => form.setData('authorId', e.target.value)}
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8001e] transition-colors"
                >
                  <option value="">{lang === 'bn' ? 'বর্তমান ব্যবহারকারী (স্বয়ংক্রিয়)' : 'Current User (Default)'}</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{lang === 'bn' ? 'সহ-লেখক (Co-author)' : 'Secondary Author'}</label>
                <select
                  value={form.data.secondaryAuthorId}
                  onChange={(e) => form.setData('secondaryAuthorId', e.target.value)}
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#e8001e] transition-colors"
                >
                  <option value="">{lang === 'bn' ? 'কেউ নেই' : 'None'}</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-2">Professional standard for investigative pieces covered by multiple journalists.</p>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'মন্তব্য' : 'Comments'}</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.data.allowComments}
                  onChange={(e) => form.setData('allowComments', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-[var(--text-secondary,#6b7280)]">
                  {lang === 'bn' ? 'এই সংবাদে মন্তব্য অনুমোদন করুন' : 'Allow comments on this article'}
                </span>
              </label>
            </div>
          </div>

          {/* Sidebar: Summary & Actions */}
          <div className="space-y-4.5">
            {/* Article Summary */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'সংক্ষিপ্ত সার' : 'Summary'}</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'ধরন' : 'Type'}</span>
                  <span className="font-semibold text-[var(--text-primary,#1a1d2e)] capitalize">{form.data.articleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'এডিশন' : 'Edition'}</span>
                  <span className="font-semibold text-[var(--text-primary,#1a1d2e)] capitalize">{form.data.edition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'বিভাগ' : 'Category'}</span>
                  <span className="font-semibold text-[var(--text-primary,#1a1d2e)]">
                    {form.data.category ? (categories.find(c => c.id == form.data.category)?.nameBn || '—') : '—'}
                  </span>
                </div>
                {form.data.subcategory && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'উপ-বিভাগ' : 'Subcategory'}</span>
                    <span className="font-semibold text-[var(--text-primary,#1a1d2e)] text-right">
                      {categories.find(c => c.id == form.data.subcategory)?.nameBn || '—'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'ট্যাগ' : 'Tags'}</span>
                  <span className="font-semibold text-[var(--text-primary,#1a1d2e)]">{form.data.tags.length}</span>
                </div>
                <div className="border-t border-[var(--card-border,#e8ebf4)] pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'বাংলা শব্দ' : 'Bangla Words'}</span>
                    <span className="font-semibold text-[var(--text-primary,#1a1d2e)]">
                      {form.data.bodyBn ? form.data.bodyBn.trim().split(/\s+/).length : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted,#9ca3af)]">{lang === 'bn' ? 'ইংরেজি শব্দ' : 'English Words'}</span>
                    <span className="font-semibold text-[var(--text-primary,#1a1d2e)]">
                      {form.data.bodyEn ? form.data.bodyEn.trim().split(/\s+/).length : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-bold mb-3">{lang === 'bn' ? 'ক্রিয়া' : 'Actions'}</h3>
              <div className="space-y-2">
                <button
                  onClick={handleDraft}
                  disabled={form.processing}
                  className="w-full bg-white text-[#e8001e] border border-[#e8001e] rounded-lg px-4 py-2.5 text-[12.5px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#fff0f2] transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {lang === 'bn' ? 'ড্রাফট সংরক্ষণ' : 'Save Draft'}
                </button>
                <button
                  onClick={handleSubmitForReview}
                  disabled={form.processing}
                  className="w-full bg-white text-[#f59e0b] border border-[#f59e0b] rounded-lg px-4 py-2.5 text-[12.5px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#fffbeb] transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {lang === 'bn' ? 'অনুমোদনের জন্য জমা' : 'Submit for Review'}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={form.processing}
                  className="w-full bg-[#e8001e] text-white rounded-lg px-4 py-2.5 text-[12.5px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[#b8001a] transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {lang === 'bn' ? 'এখনই প্রকাশ' : 'Publish Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          Navigation Buttons
      ════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mt-5">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 text-[12.5px] font-semibold text-[var(--text-secondary,#6b7280)] bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" /> {lang === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted,#9ca3af)]">
            {lang === 'bn' ? `ধাপ ${currentStep + 1} / ${steps.length}` : `Step ${currentStep + 1} of ${steps.length}`}
          </span>
          {currentStep < steps.length - 1 && (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-4 py-2 text-[12.5px] font-semibold text-white bg-[#e8001e] rounded-lg hover:bg-[#b8001a] transition-colors"
            >
              {lang === 'bn' ? 'পরবর্তী' : 'Next'} <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}