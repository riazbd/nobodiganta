import { Bell, MessageSquare, Settings, Search, Plus, Upload, ChevronDown, Globe, X, Home, FileText, TrendingUp, AlertTriangle, CreditCard, PenLine } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useRole } from '../../hooks/useRole';
import { PERMISSIONS } from '../../api/permissions';
import { usePermission } from '../../hooks/usePermission';
import { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

export default function Topbar({ currentPage, onNavigate, showToast }) {
  const { auth } = usePage().props;
  const { lang, t, toggleLanguage } = useLanguage();
  const { roleInfo } = useRole();
  const { hasPermission } = usePermission();
  const [showNotif, setShowNotif] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);
  
  // Sample notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'publish', titleBn: 'নিবন্ধ প্রকাশিত', titleEn: 'Article Published', textBn: 'বাজেট ২০২৪ প্রকাশিত হয়েছে', textEn: 'Budget 2024 has been published', time: '২ মিনিট আগে', timeEn: '2 mins ago', unread: true, icon: 'FileText' },
    { id: 2, type: 'comment', titleBn: 'নতুন মন্তব্য', titleEn: 'New Comment', textBn: 'শেয়ার বাজার নিবন্ধে নতুন মন্তব্য', textEn: 'New comment on Stock Market', time: '১ ঘণ্টা আগে', timeEn: '1 hour ago', unread: true, icon: 'MessageSquare' },
    { id: 3, type: 'traffic', titleBn: 'ট্র্যাফিক এলার্ট', titleEn: 'Traffic Alert', textBn: 'ভিজিটর সংখ্যা বৃদ্ধি পেয়েছে', textEn: 'Traffic spike detected!', time: '৩ ঘণ্টা আগে', timeEn: '3 hours ago', unread: false, icon: 'TrendingUp' },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearNotifications = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    showToast?.(lang === 'bn' ? 'সব বিজ্ঞপ্তি পঠিত হিসেবে চিহ্নিত হয়েছে' : 'All marked as read');
  };

  const pageTitles = {
    dashboard: { bn: 'অ্যাডমিন ড্যাশবোর্ড', en: 'Admin Dashboard' },
    news: { bn: 'সংবাদ ব্যবস্থাপনা', en: 'News Management' },
    'news-all': { bn: 'সব সংবাদ', en: 'All News' },
    'news-write': { bn: 'নতুন সংবাদ', en: 'Write News' },
    'news-drafts': { bn: 'ড্রাফট', en: 'Drafts' },
    'news-published': { bn: 'প্রকাশিত', en: 'Published' },
    'news-pending': { bn: 'মুলতুবি অনুমোদন', en: 'Pending Approval' },
    categories: { bn: 'বিভাগ', en: 'Categories' },
    media: { bn: 'মিডিয়া লাইব্রেরি', en: 'Media Library' },
    videos: { bn: 'ভিডিও', en: 'Videos' },
    opinions: { bn: 'মতামত কলাম', en: 'Opinion Column' },
    reporters: { bn: 'সাংবাদিক / লেখক', en: 'Reporters' },
    comments: { bn: 'পাঠকের মন্তব্য', en: 'Comments' },
    ads: { bn: 'বিজ্ঞাপন ব্যবস্থাপনা', en: 'Ads Management' },
    subscriptions: { bn: 'সদস্যপদ', en: 'Subscriptions' },
    traffic: { bn: 'ট্র্যাফিক বিশ্লেষণ', en: 'Traffic Analytics' },
    revenue: { bn: 'রাজস্ব রিপোর্ট', en: 'Revenue Report' },
    seo: { bn: 'SEO রিপোর্ট', en: 'SEO Report' },
    settings: { bn: 'সেটিংস', en: 'Settings' },
    users: { bn: 'ব্যবহারকারী', en: 'Users' },
    'audit-log': { bn: 'অডিট লগ', en: 'Audit Log' },
    epaper: { bn: 'ই-পেপার', en: 'E-Paper' },
    newsletter: { bn: 'নিউজলেটার', en: 'Newsletter' },
    profile: { bn: 'প্রোফাইল', en: 'Profile' },
  };

  const pageInfo = pageTitles[currentPage] || { bn: 'ড্যাশবোর্ড', en: 'Dashboard' };

  return (
    <div className="h-[60px] bg-[var(--topbar-bg,#ffffff)] border-b border-[var(--card-border,#e8ebf4)] flex items-center px-6 gap-3.5 sticky top-0 z-50 shadow-sm" style={{ zIndex: 100 }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--text-muted,#9ca3af)]">
        <Home className="w-3.5 h-3.5" />
        <span className="text-[#d1d5db]">›</span>
        <span>Dashboard</span>
        <span className="text-[#d1d5db]">›</span>
        <span className="text-[var(--text-primary,#1a1d2e)] font-semibold">{lang === 'bn' ? pageInfo.bn : pageInfo.en}</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <div className="flex items-center bg-[#f5f6fa] rounded-md px-2.5 py-1.5 gap-2 w-60 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-[#e8001e]/20">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)] flex-shrink-0" />
          <input
            type="text"
            placeholder={`${lang === 'bn' ? 'খুঁজুন...' : 'Search...'}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none bg-transparent outline-none text-[12.5px] text-[var(--text-primary,#1a1d2e)] w-full placeholder:text-[var(--text-muted,#9ca3af)] focus:outline-none focus:ring-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[var(--text-muted,#9ca3af)] hover:text-gray-600 flex-shrink-0">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-9 h-9 border border-[var(--card-border,#e8ebf4)] bg-[var(--card-bg,#ffffff)] rounded-lg flex items-center justify-center cursor-pointer text-[15px] transition-all hover:border-[#e8001e] hover:text-[#e8001e] hover:bg-[#fff0f2] text-[var(--text-secondary,#6b7280)] relative"
            title={lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notifications'}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e8001e] rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {showNotif && (
            <div className="absolute top-12 right-0 w-80 bg-white border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-lg z-[1000] overflow-hidden">
              <div className="px-4.5 py-3.5 border-b border-[var(--card-border,#e8ebf4)] flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Bell className="w-4 h-4 text-[#e8001e]" />
                  <span>{lang === 'bn' ? 'বিজ্ঞপ্তি' : 'Notifications'}</span>
                </div>
                <button onClick={clearNotifications} className="text-[11.5px] text-[#e8001e] cursor-pointer font-semibold">
                  {lang === 'bn' ? 'সব মার্ক করুন' : 'Mark all read'}
                </button>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className="px-4.5 py-3 border-b border-[#f9fafb] flex gap-3 cursor-pointer hover:bg-[var(--body-bg,#f0f2f8)] transition-all">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'publish' ? 'bg-red-50 text-[#e8001e]' : 
                      notif.type === 'comment' ? 'bg-blue-50 text-[#3b82f6]' :
                      notif.type === 'traffic' ? 'bg-green-50 text-[#10b981]' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {notif.icon === 'FileText' && <FileText size={16} />}
                      {notif.icon === 'MessageSquare' && <MessageSquare size={16} />}
                      {notif.icon === 'TrendingUp' && <TrendingUp size={16} />}
                      {notif.icon === 'AlertTriangle' && <AlertTriangle size={16} />}
                      {notif.icon === 'CreditCard' && <CreditCard size={16} />}
                      {notif.icon === 'PenLine' && <PenLine size={16} />}
                      {notif.icon === 'Settings' && <Settings size={16} />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-[var(--text-secondary,#6b7280)] leading-relaxed">
                        <strong className="text-[var(--text-primary,#1a1d2e)] font-semibold">{lang === 'bn' ? notif.titleBn : notif.titleEn}</strong> — {lang === 'bn' ? notif.textBn : notif.textEn}
                      </div>
                      <div className="text-[10.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">{lang === 'bn' ? notif.time : notif.timeEn}</div>
                    </div>
                    {notif.unread && <div className="w-1.75 h-1.75 bg-[#e8001e] rounded-full mt-1.25 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message Icon */}
        <button className="w-9 h-9 border border-[var(--card-border,#e8ebf4)] bg-[var(--card-bg,#ffffff)] rounded-lg flex items-center justify-center cursor-pointer text-[15px] transition-all hover:border-[#e8001e] hover:text-[#e8001e] hover:bg-[#fff0f2] text-[var(--text-secondary,#6b7280)]" title={lang === 'bn' ? 'বার্তা' : 'Messages'}>
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Settings Icon */}
        <button className="w-9 h-9 border border-[var(--card-border,#e8ebf4)] bg-[var(--card-bg,#ffffff)] rounded-lg flex items-center justify-center cursor-pointer text-[15px] transition-all hover:border-[#e8001e] hover:text-[#e8001e] hover:bg-[#fff0f2] text-[var(--text-secondary,#6b7280)]" title={lang === 'bn' ? 'সেটিংস' : 'Settings'}>
          <Settings className="w-4 h-4" />
        </button>

        {/* New Article Button */}
        {hasPermission(PERMISSIONS.NEWS_CREATE) && (
          <button
            onClick={() => { showToast?.(lang === 'bn' ? 'নতুন সংবাদ এডিটর খুলছে...' : 'Opening new article editor...'); onNavigate?.('news-write'); }}
            className="bg-[#e8001e] text-white border-none rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 transition-all hover:bg-[#b8001a] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(232,0,30,0.3)]"
          >
            <Plus className="w-3.5 h-3.5" />
            {lang === 'bn' ? 'নতুন সংবাদ' : 'New Article'}
          </button>
        )}

        <div className="h-8 w-px bg-gray-100 mx-1" />

        {/* User Profile */}
        <button 
          onClick={() => onNavigate?.('profile')}
          className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
        >
          <div className="text-right hidden md:block">
            <div className="text-[12.5px] font-bold text-gray-800 leading-none mb-1 group-hover:text-[#e8001e] transition-colors">{auth.user.name}</div>
            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{auth.user.role}</div>
          </div>
          <div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
            {auth.user.profile_photo_url ? (
              <img src={auth.user.profile_photo_url} alt={auth.user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#e8001e] to-[#ff6b6b] flex items-center justify-center text-white text-xs font-bold uppercase">
                {auth.user.name?.charAt(0)}
              </div>
            )}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>
    </div>
  );
}
