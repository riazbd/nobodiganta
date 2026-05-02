import { useState, useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { User, Mail, Phone, MapPin, Camera, Save, Shield, Bell, Globe, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { useRole } from '../hooks/useRole';

export default function Profile() {
  const { auth } = usePage().props;
  const user = auth.user;
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { roleInfo } = useRole();
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const tabs = [
    { id: 'profile', labelBn: 'প্রোফাইল', labelEn: 'Profile', icon: User },
    { id: 'security', labelBn: 'নিরাপত্তা', labelEn: 'Security', icon: Shield },
    { id: 'notifications', labelBn: 'বিজ্ঞপ্তি', labelEn: 'Notifications', icon: Bell },
  ];

  const profileForm = useForm({
    name: user.name || '',
    email: user.email || '',
    photo: null,
    // Add other fields if needed
  });

  const securityForm = useForm({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      profileForm.setData('photo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    if (confirm(lang === 'bn' ? 'আপনি কি প্রোফাইল ছবি মুছে ফেলতে চান?' : 'Are you sure you want to remove your profile photo?')) {
      router.post(route('admin.profile.update'), { 
        _method: 'post', // Using post for multipart
        remove_photo: true,
        name: profileForm.data.name,
        email: profileForm.data.email
      }, {
        onSuccess: () => {
          showToast(lang === 'bn' ? 'ছবি মুছে ফেলা হয়েছে' : 'Photo removed');
          setPhotoPreview(null);
        }
      });
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileForm.post(route('admin.profile.update'), {
      forceFormData: true,
      onSuccess: () => {
        showToast(lang === 'bn' ? 'প্রোফাইল আপডেট হয়েছে!' : 'Profile updated successfully!');
        setPhotoPreview(null);
        profileForm.setData('photo', null);
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0];
        showToast(firstError || (lang === 'bn' ? 'আপডেট ব্যর্থ হয়েছে' : 'Update failed'), 'error');
      }
    });
  };

  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    securityForm.put(route('password.update'), {
      onSuccess: () => {
        showToast(lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন হয়েছে!' : 'Password changed successfully!');
        securityForm.reset();
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0];
        showToast(firstError || (lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ' : 'Failed to change password'), 'error');
      }
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] flex items-center gap-2 font-['Noto_Sans_Bengali']">
            <User className="w-5 h-5 text-[#e8001e]" />
            {lang === 'bn' ? 'প্রোফাইল' : 'Profile'}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? 'আপনার অ্যাকাউন্ট সেটিংস' : 'Your account settings'}</p>
        </div>
      </div>
      
      <div className="flex gap-1 mb-5 border-b border-[var(--card-border,#e8ebf4)]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 text-[12.5px] font-semibold border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#e8001e] text-[#e8001e]' : 'border-transparent text-[var(--text-muted,#9ca3af)] hover:text-[var(--text-primary,#1a1d2e)]'}`}>
              <Icon className="w-4 h-4" />
              {lang === 'bn' ? tab.labelBn : tab.labelEn}
            </button>
          );
        })}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-6 max-w-2xl">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-50 shadow-inner">
                {photoPreview ? (
                  <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                ) : user.profile_photo_url ? (
                  <img src={user.profile_photo_url} className="w-full h-full object-cover" alt={user.name} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#e8001e] to-[#ff6b6b] flex items-center justify-center text-white text-3xl font-bold">
                    {user.name?.charAt(0)}
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg shadow-lg border border-gray-100 text-gray-600 hover:text-[#e8001e] transition-all transform hover:scale-110 active:scale-95"
              >
                <Camera className="w-4 h-4" />
              </button>
              {(photoPreview || user.profile_photo_url) && (
                <button 
                  type="button"
                  onClick={removePhoto}
                  className="absolute -bottom-2 -left-2 p-2 bg-white rounded-lg shadow-lg border border-gray-100 text-red-500 hover:text-red-700 transition-all transform hover:scale-110 active:scale-95"
                  title={lang === 'bn' ? 'মুছে ফেলুন' : 'Remove Photo'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="red">
                  {user.role === 'super_admin' ? (lang === 'bn' ? 'সুপার এডমিন' : 'Super Admin') : 
                   user.role === 'admin' ? (lang === 'bn' ? 'এডমিন' : 'Admin') : 
                   user.role === 'editor' ? (lang === 'bn' ? 'সম্পাদক' : 'Editor') : 
                   (lang === 'bn' ? 'প্রতিবেদক' : 'Reporter')}
                </Badge>
                <span className="text-xs text-gray-400 font-medium tracking-tight">Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}</label>
              <input 
                type="text" 
                value={profileForm.data.name} 
                onChange={e => profileForm.setData('name', e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${profileForm.errors.name ? 'border-red-500 bg-red-50' : 'border-[#e8ebf4] focus:border-[#e8001e]'}`} 
              />
              {profileForm.errors.name && <p className="text-[10px] text-red-500 mt-1 font-medium">{profileForm.errors.name}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}</label>
              <input 
                type="email" 
                value={profileForm.data.email} 
                onChange={e => profileForm.setData('email', e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${profileForm.errors.email ? 'border-red-500 bg-red-50' : 'border-[#e8ebf4] focus:border-[#e8001e]'}`} 
              />
              {profileForm.errors.email && <p className="text-[10px] text-red-500 mt-1 font-medium">{profileForm.errors.email}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button 
              type="submit" 
              disabled={profileForm.processing}
              className="bg-[#e8001e] text-white rounded-xl px-8 py-3 text-sm font-bold flex items-center gap-2 hover:bg-[#b8001a] transition-all shadow-lg shadow-red-100 disabled:opacity-50"
            >
              {profileForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handleSecuritySubmit} className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-6 max-w-2xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#e8001e]" />
            {lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Update Password'}
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}</label>
              <input 
                type="password" 
                autoComplete="current-password"
                value={securityForm.data.current_password}
                onChange={e => securityForm.setData('current_password', e.target.value)}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${securityForm.errors.current_password ? 'border-red-500 bg-red-50' : 'border-[#e8ebf4] focus:border-[#e8001e]'}`} 
              />
              {securityForm.errors.current_password && <p className="text-[10px] text-red-500 mt-1 font-medium">{securityForm.errors.current_password}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}</label>
                <input 
                  type="password" 
                  autoComplete="new-password"
                  value={securityForm.data.password}
                  onChange={e => securityForm.setData('password', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none transition-all ${securityForm.errors.password ? 'border-red-500 bg-red-50' : 'border-[#e8ebf4] focus:border-[#e8001e]'}`} 
                />
                {securityForm.errors.password && <p className="text-[10px] text-red-500 mt-1 font-medium">{securityForm.errors.password}</p>}
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5">{lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}</label>
                <input 
                  type="password" 
                  autoComplete="new-password"
                  value={securityForm.data.password_confirmation}
                  onChange={e => securityForm.setData('password_confirmation', e.target.value)}
                  className={`w-full border border-[#e8ebf4] rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:border-[#e8001e]`} 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={securityForm.processing}
            className="mt-8 bg-[#e8001e] text-white rounded-xl px-8 py-3 text-sm font-bold flex items-center gap-2 hover:bg-[#b8001a] transition-all shadow-lg shadow-red-100 disabled:opacity-50"
          >
            {securityForm.processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {lang === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password'}
          </button>
        </form>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-6 max-w-2xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#e8001e]" />
            {lang === 'bn' ? 'বিজ্ঞপ্তি সেটিংস' : 'Notification Settings'}
          </h3>
          
          <div className="space-y-4">
            {[
              { labelBn: 'ইমেইল বিজ্ঞপ্তি', labelEn: 'Email Notifications', desc: 'Get updates on your email' },
              { labelBn: 'পুশ নোটিফিকেশন', labelEn: 'Push Notifications', desc: 'Browser notifications for alerts' },
              { labelBn: 'সংবাদ অনুমোদন', labelEn: 'Article Approvals', desc: 'When your article is approved or rejected' },
              { labelBn: 'মন্তব্য বিজ্ঞপ্তি', labelEn: 'Comment Notifications', desc: 'When someone comments on your post' },
              { labelBn: 'সিস্টেম আপডেট', labelEn: 'System Updates', desc: 'Maintenance and new feature alerts' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                <div>
                  <span className="text-sm font-bold text-gray-700 block">{lang === 'bn' ? item.labelBn : item.labelEn}</span>
                  <span className="text-[11px] text-gray-400">{item.desc}</span>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                  <div className="w-10 h-5.5 bg-gray-200 peer-checked:bg-[#10b981] rounded-full relative transition-colors">
                    <div className="w-4.5 h-4.5 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:translate-x-4.5 transition-transform shadow-sm" />
                  </div>
                </label>
              </div>
            ))}
          </div>
          <button onClick={() => showToast(lang === 'bn' ? 'বিজ্ঞপ্তি সেটিংস সংরক্ষিত!' : 'Notification settings saved!')} className="mt-8 bg-[#e8001e] text-white rounded-xl px-8 py-3 text-sm font-bold flex items-center gap-2 hover:bg-[#b8001a] transition-all shadow-lg shadow-red-100">
            <Save className="w-4 h-4" /> {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}

