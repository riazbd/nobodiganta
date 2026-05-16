import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Settings as SettingsIcon, Globe, Palette, Search, Mail, Shield, Save,
  Info, AlertTriangle, Monitor, Share2, Server, RefreshCw, Upload, Trash2, Image,
  Scale, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { Badge } from '../../components/feedback/Badge';

export default function Settings({ settings = {}, groups = [] }) {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(groups[0] || 'general');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});

  // Initialize local state from props
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const flatSettings = {};
    Object.values(settings).flat().forEach(s => {
      flatSettings[s.key] = s.type === 'boolean' ? s.value === 'true' : s.value;
    });
    setFormData(flatSettings);
  }, [settings]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (key, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [key]: true }));
    
    const formData = new FormData();
    formData.append('key', key);
    formData.append('file', file);

    try {
      const res = await window.axios.post(route('admin.settings.upload-image'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.url) {
        handleChange(key, res.data.url);
        showToast(lang === 'bn' ? 'ছবি আপলোড হয়েছে' : 'Image uploaded');
        applyImageLive(key, res.data.url);
        router.reload(); // Refresh shared data (settings)
      }
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message || (lang === 'bn' ? 'আপলোড ব্যর্থ' : 'Upload failed');
      showToast(msg, 'error');
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleImageDelete = async (key) => {
    if (!confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) return;
    
    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      await window.axios.delete(route('admin.settings.delete-image'), { data: { key } });
      handleChange(key, null);
      showToast(lang === 'bn' ? 'ছবি মুছে ফেলা হয়েছে' : 'Image removed');
      applyImageLive(key, null);
      router.reload();
    } catch (err) {
      showToast(lang === 'bn' ? 'ব্যর্থ হয়েছে' : 'Action failed', 'error');
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Apply logo/favicon changes immediately in the browser without waiting for a full reload
  const applyImageLive = (key, url) => {
    if (key === 'site_favicon') {
      let link = document.querySelector("link[rel='icon']");
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = url ? (url + '?t=' + Date.now()) : '/favicon.ico';
      link.type = url && url.endsWith('.png') ? 'image/png' : 'image/x-icon';
    }
    if (key === 'site_logo') {
      const logoImg = document.querySelector('.bbc-logo-img');
      if (logoImg) {
        logoImg.src = url ? (url + '?t=' + Date.now()) : '';
      }
    }
  };

  const handleSave = () => {
    setSaving(true);
    const payload = Object.keys(formData).map(key => ({
      key,
      value: formData[key]
    }));

    router.post(route('admin.settings.update'), { settings: payload }, {
      onSuccess: () => {
        setSaving(false);
        showToast(lang === 'bn' ? 'সেটিংস সংরক্ষিত হয়েছে!' : 'Settings updated successfully!');
      },
      onError: () => {
        setSaving(false);
        showToast(lang === 'bn' ? 'ব্যর্থ হয়েছে' : 'Action failed', 'error');
      }
    });
  };

  const TAB_META = {
    general: { labelBn: 'সাধারণ',  labelEn: 'General', icon: SettingsIcon },
    seo:     { labelBn: 'এসইও',    labelEn: 'SEO',     icon: Search },
    social:  { labelBn: 'সোশ্যাল', labelEn: 'Social',  icon: Share2 },
    system:  { labelBn: 'সিস্টেম', labelEn: 'System',  icon: Server },
    legal:   { labelBn: 'আইনি',    labelEn: 'Legal',   icon: Scale },
  };

  // Build tabs from whatever groups the backend returns — no group is silently dropped
  const tabs = groups.map(id => ({
    id,
    ...(TAB_META[id] || { labelBn: id, labelEn: id.charAt(0).toUpperCase() + id.slice(1), icon: HelpCircle }),
  }));

  const renderField = (setting) => {
    const value = formData[setting.key];
    const isUploading = uploading[setting.key];

    switch (setting.type) {
      case 'image': {
        const fileRef = { current: null };
        return (
          <div className="space-y-3">
            {value ? (
              <div className="relative inline-block">
                <img
                  src={value}
                  alt={setting.label_en}
                  className="max-h-20 max-w-xs rounded-xl border border-gray-200 bg-gray-50 object-contain p-2"
                />
                <button
                  type="button"
                  onClick={() => handleImageDelete(setting.key)}
                  disabled={isUploading}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                  title={lang === 'bn' ? 'মুছুন' : 'Remove'}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <Image size={24} className="text-gray-300" />
                <span className="text-sm text-gray-400">{lang === 'bn' ? 'কোনো ছবি নেই' : 'No image uploaded'}</span>
              </div>
            )}
            <label className={`inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border text-sm font-bold transition-all ${isUploading ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : 'border-[#263238] text-[#263238] hover:bg-[#263238] hover:text-white'}`}>
              {isUploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
              {lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Image'}
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                disabled={isUploading}
                onChange={e => handleImageUpload(setting.key, e.target.files[0])}
              />
            </label>
          </div>
        );
      }
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={!!value} 
              onChange={e => handleChange(setting.key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#263238]"></div>
            <span className="ml-3 text-sm font-bold text-gray-700 uppercase tracking-tighter">
               {value ? (lang === 'bn' ? 'সক্রিয়' : 'Enabled') : (lang === 'bn' ? 'নিষ্ক্রিয়' : 'Disabled')}
            </span>
          </label>
        );
      case 'textarea':
        return (
          <textarea 
            rows="3"
            value={value || ''}
            onChange={e => handleChange(setting.key, e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none resize-none"
          />
        );
      default:
        return (
          <input 
            type="text" 
            value={value || ''}
            onChange={e => handleChange(setting.key, e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-[#263238]/5 focus:border-[#263238] transition-all outline-none"
          />
        );
    }
  };

  return (
    <div className="p-6">
      <Head title={lang === 'bn' ? 'সেটিংস' : 'System Settings'} />

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-[#263238]" /> 
            {lang === 'bn' ? 'সিস্টেম সেটিংস' : 'System Settings'}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-blue-500" />
            {lang === 'bn' ? 'পুরো সাইটের কনফিগারেশন এখান থেকে পরিচালনা করুন' : 'Global site configuration and preferences'}
          </p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#263238] text-white rounded-xl px-6 py-3 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow-lg shadow-red-100 active:scale-95 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
          {lang === 'bn' ? 'সব পরিবর্তন সেভ করুন' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* Navigation Tabs */}
         <div className="w-full lg:w-64 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white text-[#263238] shadow-md border-l-4 border-[#263238]' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                {lang === 'bn' ? tab.labelBn : tab.labelEn}
              </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="flex-1 max-w-3xl">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 animate-in fade-in duration-300">
               <div className="mb-8 flex items-center gap-3 text-[#1a1d2e]">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    {(() => {
                       const Icon = tabs.find(t => t.id === activeTab)?.icon;
                       return Icon ? <Icon size={20} /> : null;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                       {lang === 'bn' ? tabs.find(t => t.id === activeTab)?.labelBn : tabs.find(t => t.id === activeTab)?.labelEn}
                    </h2>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{activeTab} configuration</p>
                  </div>
               </div>

               <div className="space-y-8">
                  {settings[activeTab]?.map(setting => (
                    <div key={setting.key} className="group">
                       <div className="flex items-center justify-between mb-2">
                          <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-tight group-hover:text-[#263238] transition-colors">
                             {lang === 'bn' ? setting.label_bn : setting.label_en}
                          </label>
                          {setting.is_public && (
                            <Badge variant="blue" className="text-[9px] px-1.5 py-0">Public API</Badge>
                          )}
                       </div>
                       
                       {renderField(setting)}
                       
                       {(lang === 'bn' ? setting.description_bn : setting.description_en) && (
                         <div className="mt-2 flex items-start gap-2 text-[11px] text-gray-400">
                            <Info size={12} className="mt-0.5 flex-shrink-0" />
                            {lang === 'bn' ? setting.description_bn : setting.description_en}
                         </div>
                       )}
                    </div>
                  ))}
               </div>

               <div className="mt-12 p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-orange-500">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    <strong className="text-gray-700 block mb-1">{lang === 'bn' ? 'সতর্কতা:' : 'Note on changes:'}</strong>
                    {lang === 'bn' 
                      ? 'এখানকার পরিবর্তনের ফলে পুরো ওয়েবসাইটের আচরণ এবং কনফিগারেশন প্রভাবিত হতে পারে। দয়া করে সঠিক তথ্য প্রদান নিশ্চিত করুন।' 
                      : 'Changes made here will affect the entire website configuration immediately. Please double-check all values before saving.'}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
