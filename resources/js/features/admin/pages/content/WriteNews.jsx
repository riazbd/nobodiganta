import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import {
  Save, Send, Eye, Image as ImageIcon, X, Plus, Type, Tag, FileText,
  Settings, ChevronRight, Newspaper, Globe, Clock, CheckCircle,
  FolderTree, Trash2, Languages, Loader2, Video, Users, Search, MapPin, Target, Upload,
  ExternalLink, Copy
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { usePermission } from '../../hooks/usePermission';
import { useAdminNavigation } from '../../contexts/AdminNavigationContext';
import MediaUpload from '../../components/forms/MediaUpload';
import RichTextEditor from '../../components/editor/TiptapEditor';
import MediaLibraryModal from '../../components/media/MediaLibraryModal';
import ConfirmationModal from '../../components/feedback/ConfirmationModal';
import { detectVideoProvider } from '../../../../lib/video';

function slugify(text, lang) {
  if (!text) return '';
  let slug = text.toLowerCase().trim();
  if (lang === 'bn') {
    slug = slug.replace(/[^\p{L}\p{N}\p{M}]+/gu, '-');
  } else {
    slug = slug.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  }
  return slug.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function CharCounter({ current, max }) {
  const over = current > max;
  return (
    <div className={`text-[11px] mt-1 text-right ${over ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
      {current}/{max}
    </div>
  );
}

function SidebarSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm mb-4 overflow-hidden">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-3.5 bg-gray-50/30 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary,#1a1d2e)]">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          {title}
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && <div className="p-4 border-t border-[var(--card-border,#e8ebf4)] space-y-4">{children}</div>}
    </div>
  );
}

const isLocationCat = (cat) =>
  cat.slug === 'saradesh' ||
  cat.slug.startsWith('division-') ||
  cat.slug.startsWith('district-') ||
  cat.slug.startsWith('upazila-');

export default function WriteNews() {
  const { authors = [], ads = [] } = usePage().props;
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { hasAnyPermission } = usePermission();

  // Only publishers/approvers see "Publish Now"; anyone who can submit/edit sees
  // "Submit for Review". Reporters keep Submit/Draft but never see Publish.
  const canPublish = hasAnyPermission(['news.publish', 'news.approve']);
  const canSubmitForReview = hasAnyPermission(['news.submit', 'news.edit', 'news.edit.own']);

  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showTranslateConfirm, setShowTranslateConfirm] = useState(false);
  const [activeMediaTarget, setActiveMediaTarget] = useState('featured');
  const [isTranslating, setIsTranslating] = useState(false);
  const [tagsBnInput, setTagsBnInput] = useState('');
  const [tagsEnInput, setTagsEnInput] = useState('');
  const [catSearch, setCatSearch] = useState('');
  const [explicitCategories, setExplicitCategories] = useState(new Set());
  const [locationOpen, setLocationOpen] = useState(false);
  const [openNodes, setOpenNodes] = useState(new Set());

  const toggleNode = (id) => setOpenNodes(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const [manuallyEditedSlugBn, setManuallyEditedSlugBn] = useState(false);
  const [manuallyEditedSlugEn, setManuallyEditedSlugEn] = useState(false);
  const [manuallyEditedMetaBn, setManuallyEditedMetaBn] = useState(false);
  const [manuallyEditedMetaEn, setManuallyEditedMetaEn] = useState(false);

  const { article } = usePage().props;


  useEffect(() => {
    window.axios.get('/api/admin/categories')
      .then((res) => res.data)
      .then((data) => {
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
    articleType: 'news',
    status: 'draft',
    videoUrl: '',
    videoProvider: 'youtube',
    videoDuration: '',
    isBreaking: false,
    isFeatured: false,
    isExclusive: false,
    isGuestAuthor: false,
    categories: [],
    primaryCategory: '',
    authorId: '',
    secondaryAuthorId: '',
    approverId: '',
    guestAuthorNameBn: '',
    guestAuthorNameEn: '',
    guestAuthorDesignationBn: '',
    guestAuthorDesignationEn: '',
    guestAuthorBioBn: '',
    guestAuthorBioEn: '',
    guestAuthorImage: '',
    tags_bn: [],
    tags_en: [],
    featuredImage: '',
    featuredImageAltBn: '',
    featuredImageAltEn: '',
    featuredImageCaptionBn: '',
    featuredImageCaptionEn: '',
    metaTitleBn: '',
    metaTitleEn: '',
    metaDescBn: '',
    metaDescEn: '',
    allowComments: true,
    inArticleAdId: '',
    inArticleAdPosition: 4,
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
        articleType: article.articleType || 'news',
        videoUrl: article.videoUrl || '',
        videoProvider: article.videoProvider || 'youtube',
        videoDuration: article.videoDuration || '',
        status: article.status || 'draft',
        isBreaking: !!article.isBreaking,
        isFeatured: !!article.isFeatured,
        isExclusive: !!article.isExclusive,
        isGuestAuthor: !!article.isGuestAuthor,
        allowComments: article.allowComments !== undefined ? !!article.allowComments : true,
        categories: article.categories || (article.primaryCategory ? [Number(article.primaryCategory)] : []),
        primaryCategory: String(article.primaryCategory || ''),
        authorId: article.authorId || '',
        secondaryAuthorId: article.secondaryAuthorId || '',
        approverId: article.approverId || '',
        guestAuthorNameBn: article.guestAuthorNameBn || '',
        guestAuthorNameEn: article.guestAuthorNameEn || '',
        guestAuthorDesignationBn: article.guestAuthorDesignationBn || '',
        guestAuthorDesignationEn: article.guestAuthorDesignationEn || '',
        guestAuthorBioBn: article.guestAuthorBioBn || '',
        guestAuthorBioEn: article.guestAuthorBioEn || '',
        guestAuthorImage: article.guestAuthorImage || '',
        featuredImage: article.featuredImage || '',
        featuredImageAltBn: article.featuredImageAltBn || '',
        featuredImageAltEn: article.featuredImageAltEn || '',
        featuredImageCaptionBn: article.featuredImageCaptionBn || '',
        featuredImageCaptionEn: article.featuredImageCaptionEn || '',
        metaTitleBn: article.metaTitleBn || '',
        metaTitleEn: article.metaTitleEn || '',
        metaDescBn: article.metaDescBn || '',
        metaDescEn: article.metaDescEn || '',
        tags_bn: article.tags_bn || [],
        tags_en: article.tags_en || [],
        inArticleAdId: article.inArticleAdId ? String(article.inArticleAdId) : '',
        inArticleAdPosition: article.inArticleAdPosition ?? 4,
      });
      // Treat all pre-existing categories as explicitly selected on edit load
      setExplicitCategories(new Set(article.categories || []));
    }
  }, [article]);

  useEffect(() => {
    if (article) return;
    const title = form.data.titleBn || '';
    const newSlug = slugify(title, 'bn');
    const updates = {};
    if (!manuallyEditedSlugBn && form.data.slugBn !== newSlug) updates.slugBn = newSlug;
    if (!manuallyEditedMetaBn && form.data.metaTitleBn !== title) updates.metaTitleBn = title;
    if (Object.keys(updates).length > 0) form.setData(data => ({ ...data, ...updates }));
  }, [form.data.titleBn]);

  useEffect(() => {
    if (article) return;
    const title = form.data.titleEn || '';
    const newSlug = slugify(title, 'en');
    const updates = {};
    if (!manuallyEditedSlugEn && form.data.slugEn !== newSlug) updates.slugEn = newSlug;
    if (!manuallyEditedMetaEn && form.data.metaTitleEn !== title) updates.metaTitleEn = title;
    if (Object.keys(updates).length > 0) form.setData(data => ({ ...data, ...updates }));
  }, [form.data.titleEn]);

  const addTag = (edition) => {
    if (edition === 'bn') {
      const tag = tagsBnInput.trim();
      if (tag && !form.data.tags_bn.includes(tag)) {
        form.setData('tags_bn', [...form.data.tags_bn, tag]);
        setTagsBnInput('');
      }
    } else {
      const tag = tagsEnInput.trim();
      if (tag && !form.data.tags_en.includes(tag)) {
        form.setData('tags_en', [...form.data.tags_en, tag]);
        setTagsEnInput('');
      }
    }
  };

  const removeTag = (tagToRemove, edition) => {
    if (edition === 'bn') {
      form.setData('tags_bn', form.data.tags_bn.filter((t) => t !== tagToRemove));
    } else {
      form.setData('tags_en', form.data.tags_en.filter((t) => t !== tagToRemove));
    }
  };

  const getSubmitUrl = () => {
    return article ? route('admin.news.update', { article: article.id }) : route('admin.news.store');
  };

  const submitForm = (newStatus = null, successMessage = null) => {
    if (newStatus) form.setData('status', newStatus);

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

    if (!form.data.categories.length || !form.data.primaryCategory) {
      showToast(lang === 'bn' ? 'একটি বিভাগ নির্বাচন করুন!' : 'Category is required!', 'error');
      return;
    }

    const statusToSubmit = newStatus || form.data.status;
    let handled = false;
    const submitOptions = {
      preserveScroll: true,
      onSuccess: () => {
        handled = true;
        showToast(successMessage || (lang === 'bn' ? 'সংরক্ষণ করা হয়েছে' : 'Saved successfully'), 'success');
      },
      onError: (errors) => {
        handled = true;
        const firstError = Object.values(errors)[0];
        showToast(firstError || (lang === 'bn' ? 'সংরক্ষণ করতে ব্যর্থ হয়েছে' : 'Failed to save'), 'error');
      },
      onFinish: () => {
        if (!handled) {
          showToast(lang === 'bn' ? 'সার্ভার ত্রুটি। পুনরায় চেষ্টা করুন।' : 'Server error. Please try again.', 'error');
        }
      },
    };

    form.transform(data => ({ ...data, status: statusToSubmit }));

    if (article) {
      form.put(getSubmitUrl(), submitOptions);
    } else {
      form.post(getSubmitUrl(), submitOptions);
    }
  };

  const handleSaveChanges = () => submitForm(null, lang === 'bn' ? 'পরিবর্তন সংরক্ষিত হয়েছে' : 'Changes saved successfully');
  const handlePublish = () => submitForm('published', lang === 'bn' ? 'সংবাদ প্রকাশিত হয়েছে!' : 'Article published!');
  const handleDraft = () => submitForm('draft', lang === 'bn' ? 'ড্রাফট সংরক্ষিত হয়েছে' : 'Draft saved');
  const handleSubmitForReview = () => submitForm('pending', lang === 'bn' ? 'অনুমোদনের জন্য পাঠানো হয়েছে' : 'Sent for approval');

  const handleFeaturedFileSelected = async (files) => {
    if (!files?.length) return;
    const file = files[0];
    const edition = form.data.edition || 'both';
    setUploadingFeatured(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('edition', edition);
      formData.append('license_type', 'internal');
      const res = await window.axios.post('/admin/media', formData);
      const data = res.data;
      if (data.success && data.url) {
        form.setData((prev) => ({
          ...prev,
          featuredImage: data.url,
          featuredImageAltBn: data.media?.alt_text_bn || prev.featuredImageAltBn,
          featuredImageAltEn: data.media?.alt_text_en || prev.featuredImageAltEn,
          featuredImageCaptionBn: data.media?.caption_bn || prev.featuredImageCaptionBn,
          featuredImageCaptionEn: data.media?.caption_en || prev.featuredImageCaptionEn,
        }));
        setMediaFiles([]);
        showToast(lang === 'bn' ? 'ছবি আপলোড সফল হয়েছে' : 'Image uploaded successfully', 'success');
      } else {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : (data.message || data.error || (lang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Image upload failed'));
        showToast(errMsg, 'error');
      }
    } catch (err) {
      console.error('Featured image upload failed:', err);
      showToast(lang === 'bn' ? 'ছবি আপলোড ব্যর্থ হয়েছে' : 'Image upload failed', 'error');
    } finally {
      setUploadingFeatured(false);
    }
  };

  // Direct video upload from PC → stores via the media endpoint, then fills the
  // Video URL with the self-hosted file (played by the native HTML5 player).
  const handleVideoUpload = async (file) => {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      showToast(lang === 'bn' ? 'ফাইলের সাইজ ১০০MB এর বেশি হতে পারবে না' : 'File size must not exceed 100MB', 'error');
      return;
    }
    setUploadingVideo(true);
    setVideoProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('edition', form.data.edition || 'both');
      formData.append('license_type', 'internal');
      const res = await window.axios.post('/admin/media', formData, {
        timeout: 0, // large videos
        onUploadProgress: (e) => { if (e.total) setVideoProgress(Math.round((e.loaded * 100) / e.total)); },
      });
      const data = res.data;
      if (data.success && data.url) {
        form.setData((prev) => ({ ...prev, videoUrl: data.url, videoProvider: 'html5' }));
        showToast(lang === 'bn' ? 'ভিডিও আপলোড সফল হয়েছে' : 'Video uploaded successfully', 'success');
      } else {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(' ')
          : (data.message || data.error || (lang === 'bn' ? 'ভিডিও আপলোড ব্যর্থ হয়েছে' : 'Video upload failed'));
        showToast(errMsg, 'error');
      }
    } catch (err) {
      const msg = err.response?.status === 413
        ? (lang === 'bn'
            ? 'ফাইলটি সার্ভারের অনুমোদিত সীমার চেয়ে বড়। সার্ভারের আপলোড লিমিট (php.ini) বাড়াতে হবে।'
            : 'File is larger than the server allows. The server upload limit (php.ini) needs to be raised.')
        : (err.response?.data?.message || err.message || (lang === 'bn' ? 'ভিডিও আপলোড ব্যর্থ হয়েছে' : 'Video upload failed'));
      showToast(msg, 'error');
    } finally {
      setUploadingVideo(false);
      setVideoProgress(0);
    }
  };

  const handleMediaSelect = (media) => {
    if (activeMediaTarget === 'featured') {
      form.setData({
        ...form.data,
        featuredImage: media.url,
        featuredImageAltBn: media.alt_text_bn || '',
        featuredImageAltEn: media.alt_text_en || '',
        featuredImageCaptionBn: media.caption_bn || '',
        featuredImageCaptionEn: media.caption_en || '',
      });
      setMediaFiles([]);
    } else {
      form.setData('guestAuthorImage', media.url);
    }
    setShowMediaLibrary(false);
  };

  const translateEmptyFields = async (skipOverwrite = false) => {
    if (form.data.edition !== 'both') return;
    const willOverwrite = (form.data.titleEn || form.data.subtitleEn || form.data.excerptEn || form.data.bodyEn) &&
                         (form.data.titleBn || form.data.subtitleBn || form.data.excerptBn || form.data.bodyBn);
    if (willOverwrite && !skipOverwrite) { setShowTranslateConfirm(true); return; }

    const fieldsToTranslate = {};
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
        const res = await window.axios.post('/admin/api/translate', { fields: enPayload, target_lang: 'en', source_lang: 'bn' });
        if (res.data.success) finalUpdates = { ...finalUpdates, ...res.data.translations };
      }
      if (Object.keys(bnPayload).length > 0) {
        const res = await window.axios.post('/admin/api/translate', { fields: bnPayload, target_lang: 'bn', source_lang: 'en' });
        if (res.data.success) finalUpdates = { ...finalUpdates, ...res.data.translations };
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

  // When categories API loads, auto-expand ancestor nodes of every selected category
  useEffect(() => {
    if (!categories.length || !form.data.categories.length) return;
    const toOpen = new Set();
    form.data.categories.forEach(catId => {
      let cur = categories.find(c => c.id === catId);
      while (cur?.parentId) {
        toOpen.add(cur.parentId);
        cur = categories.find(c => c.id === cur.parentId);
      }
    });
    if (toOpen.size > 0) setOpenNodes(toOpen);
    const hasLoc = form.data.categories.some(id => {
      const c = categories.find(x => x.id === id);
      return c && isLocationCat(c);
    });
    if (hasLoc) setLocationOpen(true);
  }, [categories]); // intentionally only re-runs when categories list loads

  const childrenByParentId = useMemo(() => {
    const map = {};
    for (const c of categories) {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      }
    }
    return map;
  }, [categories]);

  const saradeshId = useMemo(
    () => categories.find(c => c.slug === 'saradesh')?.id ?? null,
    [categories]
  );

  const hasLocationSelected = useMemo(
    () => form.data.categories.some(id => {
      const c = categories.find(x => x.id === id);
      return c && isLocationCat(c);
    }),
    [form.data.categories, categories]
  );

  const clearLocationCategories = () => {
    const newCats = form.data.categories.filter(id => {
      const c = categories.find(x => x.id === id);
      return c && !isLocationCat(c);
    });
    const newExplicit = new Set([...explicitCategories].filter(id => {
      const c = categories.find(x => x.id === id);
      return c && !isLocationCat(c);
    }));
    let newPrimary = form.data.primaryCategory;
    if (newPrimary) {
      const pc = categories.find(c => String(c.id) === String(newPrimary));
      if (pc && isLocationCat(pc)) newPrimary = newCats.length > 0 ? String(newCats[0]) : '';
    }
    setExplicitCategories(newExplicit);
    form.setData({ ...form.data, categories: newCats, primaryCategory: newPrimary });
  };

  const renderCategoryRow = (cat, depth = 0, flatMode = false) => {
    const isChecked   = form.data.categories.includes(cat.id);
    const isPrimary   = String(form.data.primaryCategory) === String(cat.id);
    const isLocCat    = isLocationCat(cat);
    const isExplicit  = explicitCategories.has(cat.id);
    const isAuto      = isChecked && !isExplicit && isLocCat;
    const name        = lang === 'bn' ? cat.nameBn : (cat.nameEn || cat.nameBn);
    const children    = flatMode ? [] : (childrenByParentId[cat.id] || [])
      .filter(c => c.edition === 'both' || c.edition === form.data.edition);

    // Build ancestor breadcrumb for flat/search mode
    const breadcrumb = flatMode && cat.parentId ? (() => {
      const parts = [];
      let cur = cat;
      while (cur.parentId) {
        const parent = categories.find(c => c.id === cur.parentId);
        if (!parent) break;
        parts.unshift(lang === 'bn' ? parent.nameBn : (parent.nameEn || parent.nameBn));
        cur = parent;
      }
      return parts.join(' › ');
    })() : null;

    // First non-location category in current selection, or saradesh as fallback
    const pickFallbackPrimary = (catList) => {
      const firstNonLoc = catList.find(id => {
        const c = categories.find(x => x.id === id);
        return c && !isLocationCat(c);
      });
      if (firstNonLoc) return String(firstNonLoc);
      if (saradeshId && catList.includes(saradeshId)) return String(saradeshId);
      return catList.length > 0 ? String(catList[0]) : '';
    };

    const toggleCategory = () => {
      if (isChecked) {
        const newExplicit = new Set(explicitCategories);
        newExplicit.delete(cat.id);

        if (isLocCat) {
          // Remove this location cat + all its location descendants
          const toRemove = new Set([cat.id]);
          const collectLocDescendants = (id) => {
            (childrenByParentId[id] || []).forEach(child => {
              if (isLocationCat(child)) {
                toRemove.add(child.id);
                newExplicit.delete(child.id);
                collectLocDescendants(child.id);
              }
            });
          };
          collectLocDescendants(cat.id);
          const newCats = form.data.categories.filter(id => !toRemove.has(id));
          const primaryWasRemoved = toRemove.has(Number(form.data.primaryCategory)) ||
                                    toRemove.has(form.data.primaryCategory);
          const newPrimary = primaryWasRemoved ? pickFallbackPrimary(newCats) : form.data.primaryCategory;
          setExplicitCategories(newExplicit);
          form.setData({ ...form.data, categories: newCats, primaryCategory: newPrimary });
        } else {
          const newCats = form.data.categories.filter(id => id !== cat.id);
          const newPrimary = isPrimary ? pickFallbackPrimary(newCats) : form.data.primaryCategory;
          setExplicitCategories(newExplicit);
          form.setData({ ...form.data, categories: newCats, primaryCategory: newPrimary });
        }
      } else {
        // Check: add this + all ancestors
        const newCats = [...form.data.categories];
        const newExplicit = new Set(explicitCategories);
        if (!newCats.includes(cat.id)) newCats.push(cat.id);
        newExplicit.add(cat.id); // only this one is explicit

        let parentId = cat.parentId;
        while (parentId) {
          if (!newCats.includes(parentId)) newCats.push(parentId);
          // ancestors are NOT marked explicit
          const parent = categories.find(c => c.id === parentId);
          parentId = parent?.parentId ?? null;
        }

        // Auto-primary: never use a location category as primary
        let newPrimary = form.data.primaryCategory;
        const currentPc = categories.find(c => String(c.id) === String(newPrimary));
        const primaryIsLoc = !newPrimary || (currentPc && isLocationCat(currentPc));
        if (primaryIsLoc) {
          if (!isLocCat) {
            newPrimary = String(cat.id);
          } else if (saradeshId && newCats.includes(saradeshId)) {
            newPrimary = String(saradeshId);
          }
        }

        const isOpinion = cat.slug === 'opinion' || cat.nameBn === 'মতামত';
        setExplicitCategories(newExplicit);
        form.setData({
          ...form.data,
          categories: newCats,
          primaryCategory: newPrimary,
          articleType: isOpinion ? 'opinion' : form.data.articleType,
        });
      }
    };

    const isOpen = openNodes.has(cat.id);

    return (
      <div key={cat.id}>
        <div
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors ${isAuto ? 'opacity-60' : ''}`}
          style={{ paddingLeft: flatMode ? '8px' : `${8 + depth * 14}px` }}
        >
          {/* Chevron toggle for nodes with children; spacer for leaves */}
          {!flatMode && (
            children.length > 0
              ? (
                <button
                  type="button"
                  onClick={() => toggleNode(cat.id)}
                  className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <ChevronRight className={`w-3 h-3 transition-transform duration-150 ${isOpen ? 'rotate-90' : ''}`} />
                </button>
              )
              : <span className="w-3.5 flex-shrink-0" />
          )}
          <input
            type="checkbox"
            id={`cat-${cat.id}`}
            checked={isChecked}
            onChange={toggleCategory}
            className={`w-4 h-4 rounded cursor-pointer flex-shrink-0 ${isAuto ? 'accent-teal-500' : 'accent-[#263238]'}`}
          />
          <label htmlFor={`cat-${cat.id}`} className="flex-1 text-sm cursor-pointer select-none min-w-0">
            <span className="truncate block">{name}</span>
            {breadcrumb && <span className="text-[10px] text-gray-400 block truncate">{breadcrumb}</span>}
          </label>
          {isAuto && (
            <span className="text-[9px] text-teal-600 font-bold bg-teal-50 border border-teal-200 px-1 py-0.5 rounded flex-shrink-0">auto</span>
          )}
          {isChecked && !isLocCat && (
            <button
              type="button"
              onClick={() => form.setData('primaryCategory', String(cat.id))}
              className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                isPrimary ? 'bg-[#263238] text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
              }`}
            >
              {lang === 'bn' ? 'প্রধান' : 'Primary'}
            </button>
          )}
          {isChecked && isLocCat && isPrimary && (
            <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-bold bg-teal-600 text-white">
              {lang === 'bn' ? 'প্রধান' : 'Primary'}
            </span>
          )}
        </div>
        {!flatMode && isOpen && children.map(child => renderCategoryRow(child, depth + 1, false))}
      </div>
    );
  };

  const showBn = form.data.edition === 'bn' || form.data.edition === 'both';
  const showEn = form.data.edition === 'en' || form.data.edition === 'both';

  // Public URL of a saved article (edit mode only). Built from the primary
  // category slug + the article slug — same as the admin "Live Preview" link.
  const primaryCatSlug = categories.find(c => c.id === Number(form.data.primaryCategory))?.slug;
  const publicSlug = form.data.slugBn || form.data.slugEn;
  const publicPath = (article && primaryCatSlug && publicSlug)
    ? route(form.data.slugBn ? 'article' : 'en.article', { category: primaryCatSlug, slug: publicSlug })
    : null;
  // route() may return absolute (Ziggy default) or relative; normalize to an
  // absolute URL so the link always opens correctly in a new tab.
  const publicUrl = publicPath
    ? (publicPath.startsWith('http') ? publicPath : window.location.origin + publicPath)
    : null;

  const copyPublicUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard?.writeText(publicUrl)
      .then(() => showToast(lang === 'bn' ? 'লিংক কপি হয়েছে' : 'Link copied', 'success'))
      .catch(() => showToast(lang === 'bn' ? 'কপি করা যায়নি' : 'Copy failed', 'error'));
  };

  return (
    <div className="pb-24">
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[var(--card-border,#e8ebf4)] px-6 py-4 flex flex-wrap items-center justify-between gap-4 -mx-6 -mt-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#eceff1] p-2 rounded-lg">
            <Newspaper className="w-5 h-5 text-[#263238]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali'] leading-none">
              {article ? (lang === 'bn' ? 'সংবাদ সম্পাদনা' : 'Edit Article') : (lang === 'bn' ? 'নতুন সংবাদ লিখুন' : 'Write New Article')}
            </h1>
            <p className="text-[11px] text-[var(--text-muted,#9ca3af)] mt-1">
              {form.data.status === 'published' ? (lang === 'bn' ? 'প্রকাশিত' : 'Published') : (lang === 'bn' ? 'সংরক্ষণ করা হয়নি' : 'Unsaved changes')}
            </p>
            {publicUrl && (
              <div className="flex items-center gap-1.5 mt-1">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={publicUrl}
                  className="text-[11px] text-[#3b82f6] hover:underline inline-flex items-center gap-1 max-w-[260px] truncate"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{publicUrl}</span>
                </a>
                <button
                  type="button"
                  onClick={copyPublicUrl}
                  title={lang === 'bn' ? 'লিংক কপি করুন' : 'Copy link'}
                  className="text-gray-400 hover:text-[#263238] transition-colors p-0.5"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {form.data.edition === 'both' && (
            <button
              type="button"
              onClick={translateEmptyFields}
              disabled={isTranslating}
              className="bg-[#eff6ff] text-[#3b82f6] border border-[#bfdbfe] rounded-lg px-3.5 py-2 text-xs font-bold flex items-center gap-2 hover:bg-[#dbeafe] transition-colors disabled:opacity-50"
              title={lang === 'bn' ? 'খালি ঘরগুলো অন্য ভাষা থেকে স্বয়ংক্রিয়ভাবে অনুবাদ করুন' : 'Automatically translate empty fields from the other language'}
            >
              {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
              <span>{lang === 'bn' ? 'অটো ট্রান্সলেট' : 'Auto Translate'}</span>
            </button>
          )}

          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

          {article ? (
            <button
              onClick={handleSaveChanges}
              disabled={form.processing}
              className="bg-white text-gray-700 border border-gray-200 rounded-lg px-3.5 py-2 text-xs font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
              title={lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
            >
              <Save className="w-4 h-4 text-gray-500" /> 
              <span className="hidden sm:inline">{lang === 'bn' ? 'পরিবর্তন সংরক্ষণ' : 'Save Changes'}</span>
            </button>
          ) : (
            <button
              onClick={handleDraft}
              disabled={form.processing}
              className="bg-white text-gray-700 border border-gray-200 rounded-lg px-3.5 py-2 text-xs font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
              title={lang === 'bn' ? 'ড্রাফট হিসেবে সংরক্ষণ করুন' : 'Save as Draft'}
            >
              <Save className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'ড্রাফট সংরক্ষণ' : 'Save as Draft'}</span>
            </button>
          )}

          {canSubmitForReview && (
            <button
              onClick={handleSubmitForReview}
              disabled={form.processing}
              className="bg-[#fffbeb] text-[#d97706] border border-[#fcd34d] rounded-lg px-3.5 py-2 text-xs font-bold flex items-center gap-2 hover:bg-[#fef3c7] transition-colors disabled:opacity-50 shadow-sm"
              title={lang === 'bn' ? 'অনুমোদনের জন্য পাঠান' : 'Submit for Review'}
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'অনুমোদনের জন্য জমা' : 'Submit for Review'}</span>
            </button>
          )}

          {canPublish && (
            <button
              onClick={handlePublish}
              disabled={form.processing}
              className="bg-[#263238] text-white rounded-lg px-4.5 py-2 text-xs font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-colors disabled:opacity-50 shadow-md shadow-red-100"
              title={lang === 'bn' ? 'এখনই প্রকাশ করুন' : 'Publish Now'}
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'bn' ? 'এখনই প্রকাশ' : 'Publish Now'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ── LEFT MAIN COLUMN (Distraction Free Editor) ── */}
        <div className="space-y-8">

          {/* Language / Edition Toggle */}
          <div className="flex justify-center mb-2">
            <div className="bg-gray-100/80 backdrop-blur-sm p-1.5 rounded-xl inline-flex shadow-inner">
              {[
                { value: 'bn', labelBn: 'বাংলা', labelEn: 'Bangla' },
                { value: 'both', labelBn: 'উভয় ভাষা', labelEn: 'Bilingual' },
                { value: 'en', labelBn: 'English', labelEn: 'English' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => form.setData('edition', opt.value)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    form.data.edition === opt.value
                      ? 'bg-white text-[#263238] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
                >
                  {lang === 'bn' ? opt.labelBn : opt.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Bangla Content Area */}
          {showBn && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 relative group">
              <div className="absolute top-4 right-4 bg-red-50 text-red-600 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 select-none pointer-events-none">
                <Globe className="w-3 h-3" /> Bangla
              </div>
              
              <div className="space-y-4">
                <div>
                  <textarea
                    value={form.data.titleBn}
                    onChange={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                      form.setData('titleBn', e.target.value);
                    }}
                    placeholder={lang === 'bn' ? 'সংবাদের শিরোনাম লিখুন...' : 'Enter Bengali title...'}
                    className="w-full text-lg font-semibold font-['Noto_Sans_Bengali'] text-gray-900 border-none outline-none resize-none placeholder-gray-300 leading-snug focus:ring-0 px-0"
                    rows={1}
                  />
                  <CharCounter current={(form.data.titleBn || '').length} max={100} />
                </div>

                <div>
                  <input
                    type="text"
                    value={form.data.subtitleBn}
                    onChange={(e) => form.setData('subtitleBn', e.target.value)}
                    placeholder={lang === 'bn' ? 'সাবটাইটেল (ঐচ্ছিক)' : 'Subtitle (Optional)'}
                    className="w-full text-sm font-normal font-['Noto_Sans_Bengali'] text-gray-500 border-none outline-none placeholder-gray-300 focus:ring-0 px-0"
                  />
                </div>

                <div className="pt-6 mt-2 border-t border-gray-100">
                  <RichTextEditor
                    value={form.data.bodyBn}
                    onChange={(val) => form.setData('bodyBn', val)}
                    lang="bn"
                    ads={ads}
                    placeholder={lang === 'bn' ? 'আপনার সংবাদ এখানে লেখা শুরু করুন...' : 'Start writing your story here...'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* English Content Area */}
          {showEn && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 relative group">
              <div className="absolute top-4 right-4 bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 select-none pointer-events-none">
                <Globe className="w-3 h-3" /> English
              </div>
              
              <div className="space-y-4">
                <div>
                  <textarea
                    value={form.data.titleEn}
                    onChange={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                      form.setData('titleEn', e.target.value);
                    }}
                    placeholder="Enter English title..."
                    className="w-full text-lg font-semibold text-gray-900 border-none outline-none resize-none placeholder-gray-300 leading-snug focus:ring-0 px-0"
                    rows={1}
                  />
                  <CharCounter current={(form.data.titleEn || '').length} max={100} />
                </div>

                <div>
                  <input
                    type="text"
                    value={form.data.subtitleEn}
                    onChange={(e) => form.setData('subtitleEn', e.target.value)}
                    placeholder="Subtitle (Optional)"
                    className="w-full text-sm font-normal text-gray-500 border-none outline-none placeholder-gray-300 focus:ring-0 px-0"
                  />
                </div>

                <div className="pt-6 mt-2 border-t border-gray-100">
                  <RichTextEditor
                    value={form.data.bodyEn}
                    onChange={(val) => form.setData('bodyEn', val)}
                    lang="en"
                    ads={ads}
                    placeholder="Start writing your story here in English..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Excerpts Summary Box */}
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-[var(--text-primary,#1a1d2e)] mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              {lang === 'bn' ? 'সংক্ষিপ্ত সার (Excerpts)' : 'Article Excerpts'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showBn && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Bangla Excerpt</label>
                  <textarea
                    value={form.data.excerptBn}
                    onChange={(e) => form.setData('excerptBn', e.target.value)}
                    placeholder={lang === 'bn' ? 'সংক্ষিপ্ত সার...' : 'Excerpt...'}
                    rows={3}
                    className="w-full bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238] transition-colors resize-none"
                  />
                </div>
              )}
              {showEn && (
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">English Excerpt</label>
                  <textarea
                    value={form.data.excerptEn}
                    onChange={(e) => form.setData('excerptEn', e.target.value)}
                    placeholder="Short summary..."
                    rows={3}
                    className="w-full bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238] transition-colors resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SEO & Meta Box (Moved from Sidebar) */}
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-[var(--text-primary,#1a1d2e)] mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
              {lang === 'bn' ? 'SEO ও মেটা' : 'SEO & Meta'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showBn && (
                <div className="bg-[#eceff1]/50 p-4 rounded-xl border border-[#263238]/20">
                  <div className="text-[10px] font-bold text-[#263238] uppercase mb-3">Bangla SEO</div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">URL Slug</label>
                  <input type="text" value={form.data.slugBn} onChange={(e) => { setManuallyEditedSlugBn(true); form.setData('slugBn', e.target.value); }} className="w-full mb-4 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-[#263238] outline-none transition-colors" />
                  
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Meta Title</label>
                  <input type="text" value={form.data.metaTitleBn} onChange={(e) => { setManuallyEditedMetaBn(true); form.setData('metaTitleBn', e.target.value); }} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-[#263238] outline-none transition-colors" />
                  <CharCounter current={(form.data.metaTitleBn || '').length} max={60} />
                  
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 mt-3">Meta Description</label>
                  <textarea rows={2} value={form.data.metaDescBn} onChange={(e) => form.setData('metaDescBn', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:border-[#263238] outline-none transition-colors" />
                  <CharCounter current={(form.data.metaDescBn || '').length} max={160} />
                </div>
              )}
              {showEn && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="text-[10px] font-bold text-blue-600 uppercase mb-3">English SEO</div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">URL Slug</label>
                  <input type="text" value={form.data.slugEn} onChange={(e) => { setManuallyEditedSlugEn(true); form.setData('slugEn', e.target.value); }} className="w-full mb-4 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500 outline-none transition-colors" />
                  
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5">Meta Title</label>
                  <input type="text" value={form.data.metaTitleEn} onChange={(e) => { setManuallyEditedMetaEn(true); form.setData('metaTitleEn', e.target.value); }} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors" />
                  <CharCounter current={(form.data.metaTitleEn || '').length} max={60} />
                  
                  <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1.5 mt-3">Meta Description</label>
                  <textarea rows={2} value={form.data.metaDescEn} onChange={(e) => form.setData('metaDescEn', e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:border-blue-500 outline-none transition-colors" />
                  <CharCounter current={(form.data.metaDescEn || '').length} max={160} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT SETTINGS SIDEBAR ── */}
        <div className="space-y-4">
          
          <SidebarSection title={lang === 'bn' ? 'মিডিয়া (Featured Media)' : 'Media'} icon={ImageIcon} defaultOpen={true}>
            {!form.data.featuredImage ? (
              uploadingFeatured ? (
                <div className="flex items-center justify-center py-4 border border-dashed border-[var(--card-border,#e8ebf4)] rounded-lg gap-2 bg-gray-50">
                  <div className="w-4 h-4 border-2 border-[#263238] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-gray-500 font-medium">{lang === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...'}</span>
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors [&_.media-upload-zone]:border-none [&_.media-upload-zone]:py-4 [&_.media-upload-zone]:px-2">
                  <MediaUpload
                    onFilesSelected={handleFeaturedFileSelected}
                    accept="image/*"
                    maxSizeMB={5}
                    multiple={false}
                    label={lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}
                  />
                </div>
              )
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
                <img src={form.data.featuredImage} alt="Featured" className="w-full h-auto max-h-28 object-contain bg-gray-50" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  <button type="button" onClick={() => { setActiveMediaTarget('featured'); setShowMediaLibrary(true); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors" title={lang === 'bn' ? 'পরিবর্তন করুন' : 'Change Image'}>
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => form.setData('featuredImage', '')} className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded text-white transition-colors" title={lang === 'bn' ? 'মুছে ফেলুন' : 'Remove Image'}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-2 text-center">
               <button
                type="button"
                onClick={() => { setActiveMediaTarget('featured'); setShowMediaLibrary(true); }}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 w-full py-1.5 bg-blue-50/50 hover:bg-blue-50 rounded transition-colors"
              >
                <Search className="w-3 h-3" /> {lang === 'bn' ? 'লাইব্রেরি থেকে নির্বাচন করুন' : 'Choose from Library'}
              </button>
            </div>

            {form.data.featuredImage && (
              <div className="mt-3 space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">{lang === 'bn' ? 'ক্যাপশন (বাংলা)' : 'Caption (BN)'}</label>
                  <input
                    type="text"
                    value={form.data.featuredImageCaptionBn}
                    onChange={e => form.setData('featuredImageCaptionBn', e.target.value)}
                    placeholder={lang === 'bn' ? 'ছবির বিবরণ...' : 'Image caption in Bangla...'}
                    className="w-full bg-gray-50 border border-[var(--card-border,#e8ebf4)] rounded-lg px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#263238] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">{lang === 'bn' ? 'ক্যাপশন (ইংরেজি)' : 'Caption (EN)'}</label>
                  <input
                    type="text"
                    value={form.data.featuredImageCaptionEn}
                    onChange={e => form.setData('featuredImageCaptionEn', e.target.value)}
                    placeholder="Image caption in English..."
                    className="w-full bg-gray-50 border border-[var(--card-border,#e8ebf4)] rounded-lg px-2.5 py-1.5 text-xs outline-none focus:bg-white focus:border-[#263238] transition-colors"
                  />
                </div>
              </div>
            )}
          </SidebarSection>

          <SidebarSection title={lang === 'bn' ? 'বিভাগ ও ট্যাগ' : 'Organization'} icon={FolderTree} defaultOpen={true}>
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">{lang === 'bn' ? 'বিভাগসমূহ' : 'Categories'}</label>

              {/* Search */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={catSearch}
                  onChange={e => setCatSearch(e.target.value)}
                  placeholder={lang === 'bn' ? 'বিভাগ খুঁজুন...' : 'Search categories...'}
                  className="w-full bg-white border border-[var(--card-border,#e8ebf4)] rounded-lg pl-8 pr-7 py-1.5 text-xs outline-none focus:border-[#263238] transition-colors"
                />
                {catSearch && (
                  <button type="button" onClick={() => setCatSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="bg-gray-50 border border-[var(--card-border,#e8ebf4)] rounded-lg p-2 max-h-80 overflow-y-auto">
                {catSearch ? (
                  // Flat search results across all categories
                  (() => {
                    const term = catSearch.toLowerCase();
                    const matched = categories.filter(c =>
                      (c.edition === 'both' || c.edition === form.data.edition) &&
                      ((c.nameBn && c.nameBn.toLowerCase().includes(term)) ||
                       (c.nameEn && c.nameEn.toLowerCase().includes(term)))
                    );
                    return matched.length === 0
                      ? <p className="text-xs text-gray-400 text-center py-4">{lang === 'bn' ? 'কোনো বিভাগ পাওয়া যায়নি' : 'No categories found'}</p>
                      : matched.map(c => renderCategoryRow(c, 0, true));
                  })()
                ) : (
                  <>
                    {/* Editorial categories */}
                    {categories
                      .filter(c => !c.parentId && !isLocationCat(c) && (c.edition === 'both' || c.edition === form.data.edition))
                      .map(c => renderCategoryRow(c, 0))}

                    {/* Location section — collapsible */}
                    {categories.some(c => c.slug === 'saradesh') && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setLocationOpen(o => !o)}
                          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                            <span>{lang === 'bn' ? 'অবস্থান (সারাদেশ)' : 'Location (Saradesh)'}</span>
                            {hasLocationSelected && (
                              <span className="bg-teal-100 text-teal-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">✓</span>
                            )}
                          </span>
                          <span className="text-gray-400 text-[10px]">{locationOpen ? '▲' : '▼'}</span>
                        </button>

                        {locationOpen && (
                          <>
                            {categories
                              .filter(c => c.slug === 'saradesh')
                              .map(c => renderCategoryRow(c, 0))}
                            {hasLocationSelected && (
                              <button
                                type="button"
                                onClick={clearLocationCategories}
                                className="mt-1 ml-2 text-[10px] text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                              >
                                <X className="w-2.5 h-2.5" />
                                {lang === 'bn' ? 'অবস্থান মুছুন' : 'Clear location'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">{lang === 'bn' ? 'বাংলা ট্যাগ' : 'Bangla Tags'}</label>
                <div className="flex gap-2 mb-1.5">
                  <input
                    type="text"
                    value={tagsBnInput}
                    onChange={(e) => setTagsBnInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('bn'))}
                    placeholder={lang === 'bn' ? 'বাংলা ট্যাগ যোগ করুন...' : 'Add Bangla tag...'}
                    className="flex-1 bg-gray-50 border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-[#263238] transition-colors"
                  />
                  <button type="button" onClick={() => addTag('bn')} className="bg-gray-800 text-white rounded-lg px-2.5 py-1.5 hover:bg-black transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(form.data.tags_bn || []).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-[var(--body-bg,#f0f2f8)] border border-[var(--card-border,#e8ebf4)] rounded-md px-2 py-1 text-[11px] font-medium text-gray-700">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag, 'bn')} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">{lang === 'bn' ? 'ইংরেজি ট্যাগ' : 'English Tags'}</label>
                <div className="flex gap-2 mb-1.5">
                  <input
                    type="text"
                    value={tagsEnInput}
                    onChange={(e) => setTagsEnInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('en'))}
                    placeholder={lang === 'bn' ? 'ইংরেজি ট্যাগ যোগ করুন...' : 'Add English tag...'}
                    className="flex-1 bg-gray-50 border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-1.5 text-xs outline-none focus:bg-white focus:border-[#263238] transition-colors"
                  />
                  <button type="button" onClick={() => addTag('en')} className="bg-gray-800 text-white rounded-lg px-2.5 py-1.5 hover:bg-black transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(form.data.tags_en || []).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-[var(--body-bg,#f0f2f8)] border border-[var(--card-border,#e8ebf4)] rounded-md px-2 py-1 text-[11px] font-medium text-gray-700">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag, 'en')} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SidebarSection>

          <SidebarSection title={lang === 'bn' ? 'সেটিংস' : 'Article Settings'} icon={Settings} defaultOpen={true}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-wider">Format</label>
                <select
                  value={form.data.articleType}
                  onChange={(e) => form.setData('articleType', e.target.value)}
                  className="w-full bg-gray-50 border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-[#263238]"
                >
                  {/*
                    Only the formats with real public behaviour are offered here.
                    Opinion / Photo are created from their own dedicated managers
                    (Opinions, Photo Gallery). Feature/Interview/Explainer/Liveblog/
                    Sponsored are stored-only labels with no public layout yet — see
                    docs/DEFERRED_FEATURES.md (#8). Backend validation still accepts
                    those values so existing articles edit without breaking.
                  */}
                  <option value="news">News</option>
                  <option value="video">Video</option>
                </select>
              </div>

              {form.data.articleType === 'video' && (
                <div className="bg-gray-50 p-3 rounded-lg border border-[var(--card-border,#e8ebf4)]">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Video URL</label>
                  <input
                    type="url"
                    value={form.data.videoUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      form.setData({ ...form.data, videoUrl: url, videoProvider: detectVideoProvider(url) });
                    }}
                    placeholder="https://youtube.com/..."
                    className="w-full mb-2 bg-white border border-[var(--card-border,#e8ebf4)] rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-red-500"
                  />

                  {/* Direct upload from PC (self-hosted, plays in the native player) */}
                  <div className="flex items-center gap-2 mb-3">
                    <label className={`inline-flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-md border text-xs font-bold transition-all ${uploadingVideo ? 'opacity-60 cursor-wait border-gray-200 text-gray-400' : 'border-[#263238] text-[#263238] hover:bg-[#263238] hover:text-white'}`}>
                      {uploadingVideo ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      {uploadingVideo ? `${videoProgress}%` : (lang === 'bn' ? 'পিসি থেকে আপলোড' : 'Upload from PC')}
                      <input
                        type="file"
                        accept="video/*"
                        className="sr-only"
                        disabled={uploadingVideo}
                        onChange={(e) => { handleVideoUpload(e.target.files[0]); e.target.value = ''; }}
                      />
                    </label>
                    <span className="text-[10px] text-gray-400">{lang === 'bn' ? 'অথবা উপরে লিঙ্ক দিন (সর্বোচ্চ ১০০MB)' : 'or paste a link above (max 100MB)'}</span>
                  </div>

                  {form.data.videoUrl && form.data.videoProvider === 'html5' && (
                    <video src={form.data.videoUrl} controls className="w-full mb-3 rounded-md bg-black max-h-40" />
                  )}

                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Duration</label>
                  <input
                    type="text"
                    value={form.data.videoDuration}
                    onChange={(e) => form.setData('videoDuration', e.target.value)}
                    placeholder="05:30"
                    className="w-full bg-white border border-[var(--card-border,#e8ebf4)] rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={form.data.isBreaking} onChange={e => form.setData('isBreaking', e.target.checked)} />
                    <div className={`block w-8 h-4.5 rounded-full transition-colors ${form.data.isBreaking ? 'bg-[#263238]' : 'bg-gray-200'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform shadow-sm ${form.data.isBreaking ? 'translate-x-3.5' : ''}`}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Breaking News</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={form.data.isFeatured} onChange={e => form.setData('isFeatured', e.target.checked)} />
                    <div className={`block w-8 h-4.5 rounded-full transition-colors ${form.data.isFeatured ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform shadow-sm ${form.data.isFeatured ? 'translate-x-3.5' : ''}`}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Feature on Homepage</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={form.data.isExclusive} onChange={e => form.setData('isExclusive', e.target.checked)} />
                    <div className={`block w-8 h-4.5 rounded-full transition-colors ${form.data.isExclusive ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform shadow-sm ${form.data.isExclusive ? 'translate-x-3.5' : ''}`}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Exclusive Content</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group pt-2 border-t border-[var(--card-border,#e8ebf4)]">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={form.data.allowComments} onChange={e => form.setData('allowComments', e.target.checked)} />
                    <div className={`block w-8 h-4.5 rounded-full transition-colors ${form.data.allowComments ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform shadow-sm ${form.data.allowComments ? 'translate-x-3.5' : ''}`}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Allow Comments</span>
                </label>
              </div>
            </div>
          </SidebarSection>

          <SidebarSection title={lang === 'bn' ? 'লেখক ও ক্রেডিট' : 'Authorship'} icon={Users} defaultOpen={true}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Primary Author</label>
                <select
                  value={form.data.authorId}
                  onChange={(e) => form.setData('authorId', e.target.value)}
                  className="w-full bg-gray-50 border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-[#263238]"
                >
                  <option value="">Current User (Default)</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Co-Author</label>
                <select
                  value={form.data.secondaryAuthorId}
                  onChange={(e) => form.setData('secondaryAuthorId', e.target.value)}
                  className="w-full bg-gray-50 border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-[#263238]"
                >
                  <option value="">None</option>
                  {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              {/* Approver is set automatically from the logged-in user on publish — no manual selection. */}

              <div className="pt-3 border-t border-[var(--card-border,#e8ebf4)]">
                <label className="flex items-center gap-3 cursor-pointer group mb-3">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={form.data.isGuestAuthor} onChange={e => form.setData('isGuestAuthor', e.target.checked)} />
                    <div className={`block w-8 h-4.5 rounded-full transition-colors ${form.data.isGuestAuthor ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform shadow-sm ${form.data.isGuestAuthor ? 'translate-x-3.5' : ''}`}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Guest Author</span>
                </label>
                
                {form.data.isGuestAuthor && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-[var(--card-border,#e8ebf4)] space-y-3">
                    <input type="text" value={form.data.guestAuthorNameBn} onChange={e => form.setData('guestAuthorNameBn', e.target.value)} className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs outline-none" placeholder="Name (Bangla)" />
                    <input type="text" value={form.data.guestAuthorNameEn} onChange={e => form.setData('guestAuthorNameEn', e.target.value)} className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs outline-none" placeholder="Name (English)" />
                    <input type="text" value={form.data.guestAuthorDesignationBn} onChange={e => form.setData('guestAuthorDesignationBn', e.target.value)} className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs outline-none" placeholder="Designation (Bangla)" />
                    <input type="text" value={form.data.guestAuthorDesignationEn} onChange={e => form.setData('guestAuthorDesignationEn', e.target.value)} className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs outline-none" placeholder="Designation (English)" />
                    <textarea rows="2" value={form.data.guestAuthorBioBn} onChange={e => form.setData('guestAuthorBioBn', e.target.value)} className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs outline-none resize-none" placeholder="Short bio (Bangla)..." />
                    <textarea rows="2" value={form.data.guestAuthorBioEn} onChange={e => form.setData('guestAuthorBioEn', e.target.value)} className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-xs outline-none resize-none" placeholder="Short bio (English)..." />
                    <div className="flex items-center gap-2">
                      {form.data.guestAuthorImage
                        ? <img src={form.data.guestAuthorImage} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                        : <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-lg">👤</div>}
                      <button type="button" onClick={() => { setActiveMediaTarget('guest'); setShowMediaLibrary(true); }} className="text-xs font-semibold px-2.5 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100">
                        {form.data.guestAuthorImage ? (lang === 'bn' ? 'ছবি পরিবর্তন' : 'Change photo') : (lang === 'bn' ? 'ছবি আপলোড' : 'Upload photo')}
                      </button>
                      {form.data.guestAuthorImage && (
                        <button type="button" onClick={() => form.setData('guestAuthorImage', '')} className="text-xs text-red-500 hover:underline">
                          {lang === 'bn' ? 'সরান' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SidebarSection>

          <SidebarSection title={lang === 'bn' ? 'আর্টিকেল বিজ্ঞাপন' : 'In-Article Ad'} icon={Target} defaultOpen={true}>
            <div className="space-y-3">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                {lang === 'bn'
                  ? 'নোট: এডিটর থেকে ইনলাইন বিজ্ঞাপন যোগ করলে এই সিলেকশন উপেক্ষা হবে।'
                  : 'Note: If inline ads are inserted via the editor, this selection is ignored.'}
              </p>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                  {lang === 'bn' ? 'বিজ্ঞাপন নির্বাচন করুন' : 'Select Ad'}
                </label>
                <select
                  value={form.data.inArticleAdId}
                  onChange={e => form.setData('inArticleAdId', e.target.value)}
                  className="w-full bg-gray-50 border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-[#263238]"
                >
                  <option value="">{lang === 'bn' ? '— কোনো বিজ্ঞাপন নেই —' : '— No ad —'}</option>
                  {ads.map(ad => (
                    <option key={ad.id} value={ad.id}>
                      {ad.title_bn || ad.title_en} [{ad.position}]
                    </option>
                  ))}
                </select>
              </div>
              {form.data.inArticleAdId && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                    {lang === 'bn' ? 'কত নম্বর প্যারার পরে দেখাবে' : 'Show after paragraph #'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={form.data.inArticleAdPosition}
                    onChange={e => form.setData('inArticleAdPosition', Number(e.target.value))}
                    className="w-full bg-gray-50 border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm outline-none focus:bg-white focus:border-[#263238]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {lang === 'bn' ? 'ডিফল্ট ৪' : 'Default: 4'}
                  </p>
                </div>
              )}
            </div>
          </SidebarSection>
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
