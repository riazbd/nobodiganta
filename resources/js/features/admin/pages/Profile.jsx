import { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Shield, Bell, Globe } from 'lucide-react';
import { Badge } from '../components/feedback/Badge';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { useRole } from '../hooks/useRole';
import { useAdminNavigation } from '../contexts/AdminNavigationContext';

export default function Profile() {
  const { lang } = useLanguage();
  const { showToast } = useToast();
  const { roleInfo } = useRole();
  const { onNavigate } = useAdminNavigation();
  const [activeTab, setActiveTab] = useState('profile');
  const tabs = [
    { id: 'profile', labelBn: 'প্রোফাইল', labelEn: 'Profile', icon: User },
    { id: 'security', labelBn: 'নিরাপত্তা', labelEn: 'Security', icon: Shield },
    { id: 'notifications', labelBn: 'বিজ্ঞপ্তি', labelEn: 'Notifications', icon: Bell },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">👤 {lang === 'bn' ? 'প্রোফাইল' : 'Profile'}</h1>
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
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-6 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#e8001e] to-[#ff6b6b] flex items-center justify-center text-white text-3xl font-bold">র</div>
            <div>
              <h2 className="text-lg font-bold">{lang === 'bn' ? 'রাফি আহমেদ' : 'Rafi Ahmed'}</h2>
              <Badge variant="red">{roleInfo ? (lang === 'bn' ? roleInfo.labelBn : roleInfo.labelEn) : 'Super Admin'}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">{lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}</label>
              <input type="text" defaultValue={lang === 'bn' ? 'রাফি আহমেদ' : 'Rafi Ahmed'} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">{lang === 'bn' ? 'ইমেইল' : 'Email'}</label>
              <input type="email" defaultValue="rafi@nobodiganta.com" className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">{lang === 'bn' ? 'ফোন' : 'Phone'}</label>
              <input type="tel" defaultValue="+880-1711-000001" className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">{lang === 'bn' ? 'অবস্থান' : 'Location'}</label>
              <input type="text" defaultValue={lang === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'} className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e]" />
            </div>
          </div>
          <button onClick={() => showToast(lang === 'bn' ? 'প্রোফাইল আপডেট হয়েছে!' : 'Profile updated!')} className="mt-5 bg-[#e8001e] text-white rounded-lg px-6 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-[#b8001a] transition-colors">
            <Save className="w-4 h-4" /> {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
          </button>
        </div>
      )}
      {activeTab === 'security' && (
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-6 max-w-2xl">
          <h3 className="text-lg font-bold mb-4">{lang === 'bn' ? 'নিরাপত্তা সেটিংস' : 'Security Settings'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">{lang === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}</label>
              <input type="password" className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">{lang === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}</label>
              <input type="password" className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e]" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">{lang === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}</label>
              <input type="password" className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8001e]" />
            </div>
          </div>
          <button onClick={() => showToast(lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন হয়েছে!' : 'Password changed!')} className="mt-5 bg-[#e8001e] text-white rounded-lg px-6 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-[#b8001a] transition-colors">
            <Shield className="w-4 h-4" /> {lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}
          </button>
        </div>
      )}
      {activeTab === 'notifications' && (
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-6 max-w-2xl">
          <h3 className="text-lg font-bold mb-4">{lang === 'bn' ? 'বিজ্ঞপ্তি সেটিংস' : 'Notification Settings'}</h3>
          <div className="space-y-4">
            {[
              { labelBn: 'ইমেইল বিজ্ঞপ্তি', labelEn: 'Email Notifications' },
              { labelBn: 'পুশ নোটিফিকেশন', labelEn: 'Push Notifications' },
              { labelBn: 'সংবাদ অনুমোদন', labelEn: 'Article Approvals' },
              { labelBn: 'মন্তব্য বিজ্ঞপ্তি', labelEn: 'Comment Notifications' },
              { labelBn: 'সিস্টেম আপডেট', labelEn: 'System Updates' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#f3f4f6] last:border-0">
                <span className="text-sm text-[var(--text-secondary,#6b7280)]">{lang === 'bn' ? item.labelBn : item.labelEn}</span>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-300 peer-checked:bg-[#e8001e] rounded-full relative transition-colors">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:translate-x-4 transition-transform shadow" />
                  </div>
                </label>
              </div>
            ))}
          </div>
          <button onClick={() => showToast(lang === 'bn' ? 'বিজ্ঞপ্তি সেটিংস সংরক্ষিত!' : 'Notification settings saved!')} className="mt-5 bg-[#e8001e] text-white rounded-lg px-6 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-[#b8001a] transition-colors">
            <Save className="w-4 h-4" /> {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
