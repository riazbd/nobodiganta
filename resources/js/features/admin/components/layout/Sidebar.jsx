import { useLanguage } from '../../hooks/useLanguage';
import { PERMISSIONS } from '../../api/permissions';
import { router, usePage } from '@inertiajs/react';
import {
  LayoutDashboard, Newspaper, FolderTree, Image, Video, PenLine, Users, MessageSquare,
  Megaphone, CreditCard, BarChart3, TrendingUp, Search, Settings, FileText, Mail,
  LogOut, Globe, ChevronDown, Shield, Crown, UserCheck, Layers, Camera,
  Calendar, Send, Monitor, Palette, Edit3, ListChecks, Target, Zap, Bell, User, PlaySquare, MapPin
} from 'lucide-react';
import { useState } from 'react';
import { usePermission } from '../../hooks/usePermission';

const ICON_MAP = {
  LayoutDashboard, Newspaper, FolderTree, Image, Video, PenLine, Users, MessageSquare,
  Megaphone, CreditCard, BarChart3, TrendingUp, Search, Settings, FileText, Mail,
  LogOut, Bell, Globe, ChevronDown, Shield, Crown, UserCheck, Layers, Camera,
  Calendar, Send, Monitor, Palette, User, Edit3, ListChecks, Target, Zap, PlaySquare, MapPin
};

export default function Sidebar({ currentPage, onNavigate, roleInfo }) {
  const { t, lang, toggleLanguage } = useLanguage();
  const { hasPermission, currentRole } = usePermission();
  const { props } = usePage();
  const settings = props.settings || {};
  const logoUrl = settings.site_logo || null;
  const siteName = settings.site_name || 'প্রভাতী';
  const [openSubs, setOpenSubs] = useState({ newsSub: true });
  const [activeItem, setActiveItem] = useState(currentPage || 'dashboard');

  const toggleSub = (key) => {
    setOpenSubs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const navSections = [
    {
      label: 'mainMenu',
      items: [
        { id: 'dashboard', icon: 'LayoutDashboard', label: 'dashboard', permission: null },
      ]
    },
    {
      label: 'content',
      items: [
        { id: 'news', icon: 'Newspaper', label: 'newsManagement', permission: PERMISSIONS.NEWS_VIEW,
          children: [
            { id: 'news-all',       label: 'allNews',         permission: PERMISSIONS.NEWS_VIEW },
            { id: 'news-write',     label: 'writeNews',       permission: PERMISSIONS.NEWS_CREATE },
            { id: 'news-drafts',    label: 'drafts',          permission: PERMISSIONS.NEWS_VIEW },
            { id: 'news-published', label: 'published',       permission: PERMISSIONS.NEWS_VIEW },
            { id: 'news-pending',   label: 'pendingApproval', permission: PERMISSIONS.NEWS_REVIEW },
          ]
        },
        { id: 'opinions', icon: 'PenLine',    label: 'opinionColumn', permission: PERMISSIONS.OPINION_VIEW },
        { id: 'videos',   icon: 'Video',      label: 'videos',        permission: PERMISSIONS.VIDEO_VIEW },
        { id: 'photos',   icon: 'Camera',     label: 'photoGallery',  permission: PERMISSIONS.MEDIA_GALLERY_MANAGE },
        { id: 'photocard-templates', icon: 'Palette', label: 'photocardStudio', permission: PERMISSIONS.MEDIA_GALLERY_MANAGE },
        { id: 'stories',  icon: 'PlaySquare', label: 'stories',       permission: PERMISSIONS.STORIES_VIEW_ANY },
        { id: 'media',    icon: 'Image',      label: 'mediaLibrary',  permission: PERMISSIONS.MEDIA_VIEW },
        { id: 'categories', icon: 'FolderTree', label: 'categories',  permission: PERMISSIONS.CATEGORY_VIEW },
      ]
    },
    {
      label: 'operations',
      items: [
        { id: 'reporters', icon: 'Users',         label: 'reporters',      permission: PERMISSIONS.REPORTER_VIEW },
        { id: 'comments',  icon: 'MessageSquare', label: 'comments',       permission: PERMISSIONS.COMMENT_VIEW },
        { id: 'ads',       icon: 'Megaphone',     label: 'adsManagement',  permission: PERMISSIONS.BUSINESS_ADS_VIEW },
        // newsletter hidden from client for now — future feature
        // { id: 'newsletter',icon: 'Mail',          label: 'newsletter',     permission: PERMISSIONS.NEWSLETTER_CREATE },
        { id: 'polls',     icon: 'BarChart3',     label: 'polls',          permission: PERMISSIONS.WIDGETS_POLLS_MANAGE },
        { id: 'locations', icon: 'MapPin', label: 'locations', permission: null },
      ]
    },
    {
      label: 'analytics',
      items: [
        { id: 'traffic',  icon: 'BarChart3',   label: 'trafficAnalytics', permission: PERMISSIONS.ANALYTICS_VIEW },
        { id: 'revenue',  icon: 'TrendingUp',  label: 'revenueReport',    permission: PERMISSIONS.BUSINESS_REVENUE_VIEW },
        { id: 'seo',      icon: 'Search',      label: 'seoReport',        permission: PERMISSIONS.SEO_VIEW },
      ]
    },
    {
      label: 'system',
      items: [
        { id: 'homepage-layout', icon: 'LayoutDashboard', label: 'homepageLayout',   permission: PERMISSIONS.HOMEPAGE_EDIT },
        { id: 'users',           icon: 'Users',           label: 'users',            permission: PERMISSIONS.USER_VIEW },
        { id: 'roles',           icon: 'Shield',          label: 'rolesPermissions', permission: PERMISSIONS.USER_VIEW },
        { id: 'settings',        icon: 'Settings',        label: 'settings',         permission: PERMISSIONS.SYSTEM_SETTINGS },
        { id: 'audit-log',       icon: 'FileText',        label: 'auditLog',         permission: PERMISSIONS.SYSTEM_AUDIT_VIEW },
      ]
    },
  ];

  const handleNav = (id) => {
    setActiveItem(id);
    onNavigate?.(id);
  };

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <aside className="w-60 min-h-screen bg-[#0f1117] flex flex-col fixed top-0 left-0 bottom-0 z-50 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2a2d3e transparent' }}>
      {/* Logo */}
      <div className="p-5 pb-4 border-b border-[#1e2130] flex-shrink-0">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={siteName}
            style={{ maxHeight: 40, maxWidth: 180, objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <div className="flex items-center gap-2 text-[#263238] font-['Noto_Serif_Bengali'] text-xl font-extrabold leading-none">
            <div className="w-2 h-2 bg-[#263238] rounded-full" />
            {siteName}
          </div>
        )}
        <div className="text-[10px] text-[#4a5068] tracking-widest uppercase mt-1">Admin Panel</div>
      </div>

      {/* User Card */}
      <div 
        className="px-4 py-3.5 flex items-center gap-2.5 border-b border-[#1e2130] bg-[#1a1d2e] cursor-pointer hover:bg-[#1e2130] transition-colors"
        onClick={() => handleNav('profile')}
      >
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#1e2130] flex-shrink-0">
          {props.auth.user.profile_photo_url ? (
            <img src={props.auth.user.profile_photo_url} alt={props.auth.user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#263238] to-[#ff6b6b] flex items-center justify-center text-white text-sm font-bold">
              {props.auth.user.name?.charAt(0) || 'U'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11.5px] text-white font-bold truncate leading-tight mb-0.5">{props.auth.user.name}</div>
          <div className="text-[9.5px] text-[#8b92a5] uppercase font-bold tracking-wider truncate opacity-70">
            {roleInfo ? (lang === 'bn' ? roleInfo.labelBn : roleInfo.labelEn) : props.auth.user.role}
          </div>
        </div>
        <div className="w-2 h-2 bg-[#10b981] rounded-full flex-shrink-0 animate-pulse" />
      </div>

      {/* Navigation */}
      <div className="flex-1 py-2 overflow-y-auto">
        {navSections.map((section, si) => {
          const visibleItems = section.items.filter(item => !item.permission || hasPermission(item.permission));
          if (visibleItems.length === 0) return null;

          return (
            <div key={si}>
              <div className="text-[9.5px] font-bold tracking-widest uppercase text-[#4a5068] px-5 pt-4 pb-1.5">
                {t(section.label)}
              </div>
              {visibleItems.map(item => (
                <div key={item.id}>
                  <div
                    className={`flex items-center gap-2.5 py-2.25 mx-2 rounded-md text-[12.5px] font-medium cursor-pointer transition-all relative ${
                      activeItem === item.id
                        ? 'bg-[#1e2538] text-white border-l-[3px] border-[#e8001e] pl-[13px] pr-4'
                        : 'text-[#8b92a5] hover:bg-[#1c1f2e] hover:text-[#e0e0e0] px-4'
                    }`}
                    onClick={() => {
                      if (item.children) {
                        toggleSub(item.id + 'Sub');
                      } else {
                        handleNav(item.id);
                      }
                    }}
                  >
                    {item.icon && (() => {
                      const Icon = ICON_MAP[item.icon];
                      return Icon ? <Icon className="w-4 h-4" /> : null;
                    })()}
                    <span className="flex-1">{t(item.label)}</span>
                    {item.badge && (
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                        activeItem === item.id ? 'bg-white/20 text-white' : 'bg-[#1e2538] text-[#8b92a5]'
                      }`}>{item.badge}</span>
                    )}
                    {item.children && (
                      <ChevronDown className={`w-2.5 h-2.5 text-[#4a5068] transition-transform ${openSubs[item.id + 'Sub'] ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                  {item.children && openSubs[item.id + 'Sub'] && (
                    <div className="block">
                      {item.children.filter(sub => !sub.permission || hasPermission(sub.permission)).map(sub => (
                        <div
                          key={sub.id}
                          className={`flex items-center gap-2 py-1.75 mx-2 rounded-md text-[12px] cursor-pointer transition-all ${
                            activeItem === sub.id
                              ? 'bg-[#1e2538] text-white border-l-[3px] border-[#e8001e] pl-[13px] pr-4'
                              : 'text-[#8b92a5] hover:bg-[#1c1f2e] hover:text-[#ddd] px-4'
                          }`}
                          onClick={() => handleNav(sub.id)}
                        >
                          <div className="w-1.25 h-1.25 rounded-full bg-current flex-shrink-0" />
                          <span className="flex-1">{t(sub.label)}</span>
                          {sub.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#f59e0b] text-white">{sub.badge}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Language Toggle */}
      <div className="px-2 pb-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2.5 mx-2 w-full rounded-md border border-[#1e2130] text-[#8b92a5] hover:bg-[#1c1f2e] hover:text-white transition-all text-xs"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
        </button>
      </div>

      {/* Logout */}
      <div className="px-2 pb-4">
        <div
          className="flex items-center gap-2.5 px-4 py-2.25 mx-2 rounded-md text-[12.5px] font-medium cursor-pointer text-[#ff6b6b] hover:bg-[#1c1f2e] transition-all"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>{t('logout')}</span>
        </div>
      </div>
    </aside>
  );
}
