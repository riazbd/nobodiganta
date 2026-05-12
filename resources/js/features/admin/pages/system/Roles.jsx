import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
  Shield, Edit3, Trash2, Users, X, ChevronDown, ChevronRight, 
  Save, Plus, Check, Settings, AlertCircle, Info, Lock
} from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { Pagination } from '../../components/data/Pagination';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { usePermission } from '../../hooks/usePermission';

const ROLE_GRADIENTS = {
  super_admin: 'from-[#263238] to-[#ff6b6b]',
  editor_in_chief: 'from-[#f59e0b] to-[#fbbf24]',
  managing_editor: 'from-[#3b82f6] to-[#60a5fa]',
  section_editor: 'from-[#06b6d4] to-[#22d3ee]',
  seo_manager: 'from-[#8b5cf6] to-[#a78bfa]',
  photographer: 'from-[#10b981] to-[#34d399]',
  reporter: 'from-[#6b7280] to-[#9ca3af]',
  user: 'from-blue-400 to-indigo-400',
};

const ROLE_COLORS = {
  super_admin: 'red',
  editor_in_chief: 'orange',
  managing_editor: 'blue',
  section_editor: 'cyan',
  seo_manager: 'purple',
  photographer: 'green',
  reporter: 'gray',
  user: 'indigo',
};

export default function Roles({ roles, allPermissions, filters }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const { hasPermission } = usePermission();

  const rolesData = roles?.data || [];
  const links = roles?.links || [];
  const meta = {
    current_page: roles?.current_page || 1,
    last_page: roles?.last_page || 1,
    total: roles?.total || 0,
    per_page: roles?.per_page || 15,
  };

  const [expandedRole, setExpandedRole] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  const [createForm, setCreateForm] = useState({ name: '', label_en: '', label_bn: '', level: 1 });
  const [editForm, setEditForm] = useState({ label_en: '', label_bn: '', level: 1 });

  const toggleRole = (role) => {
    if (expandedRole === role.name) {
      setExpandedRole(null);
    } else {
      setExpandedRole(role.name);
      setSelectedPermissions(Object.fromEntries(role.permissions.map(p => [p, true])));
      // Auto expand all groups when opening a role
      const groups = {};
      Object.keys(allPermissions || {}).forEach(g => { groups[g] = true; });
      setExpandedGroups(groups);
    }
  };

  const togglePermission = (permName) => {
    setSelectedPermissions(prev => ({ ...prev, [permName]: !prev[permName] }));
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const selectAllInGroup = (group, perms) => {
    setSelectedPermissions(prev => {
      const next = { ...prev };
      perms.forEach(p => { next[p.name] = true; });
      return next;
    });
  };

  const deselectAllInGroup = (group, perms) => {
    setSelectedPermissions(prev => {
      const next = { ...prev };
      perms.forEach(p => { next[p.name] = false; });
      return next;
    });
  };

  const handleSavePermissions = async (role) => {
    setSaving(true);
    const perms = Object.keys(selectedPermissions).filter(k => selectedPermissions[k]);
    
    router.post(route('admin.roles.sync-permissions', role.id), { permissions: perms }, {
      onSuccess: () => {
        setSaving(false);
        setExpandedRole(null);
        showToast(t('permissionsUpdated'));
      },
      onError: () => {
        setSaving(false);
        showToast(t('errorOccurred'), 'error');
      }
    });
  };

  const handleSaveRole = () => {
    setSaving(true);
    router.put(route('admin.roles.update', editingRole.id), editForm, {
      onSuccess: () => {
        setSaving(false);
        setEditingRole(null);
        showToast(t('roleUpdated'));
      },
      onError: () => {
        setSaving(false);
        showToast(t('errorOccurred'), 'error');
      }
    });
  };

  const handleCreateRole = () => {
    setSaving(true);
    router.post(route('admin.roles.store'), createForm, {
      onSuccess: () => {
        setSaving(false);
        setShowCreateModal(false);
        setCreateForm({ name: '', label_en: '', label_bn: '', level: 1 });
        showToast(t('roleCreated'));
      },
      onError: () => {
        setSaving(false);
        showToast(t('errorOccurred'), 'error');
      }
    });
  };

  const handleDeleteRole = (role) => {
    router.delete(route('admin.roles.destroy', role.id), {
      onSuccess: () => {
        setShowDeleteConfirm(null);
        showToast(t('roleDeleted'));
      }
    });
  };

  const getGroupLabel = (group) => {
    // Capitalize and format group name (e.g., 'news_management' -> 'News Management')
    return group.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const totalPerms = Object.values(allPermissions || {}).flat().length;
  const selectedCount = Object.values(selectedPermissions).filter(Boolean).length;

  return (
    <div className="p-6">
      <Head title={t('rolesPermissions')} />

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1d2e] font-['Noto_Sans_Bengali'] flex items-center gap-3">
            <Shield className="w-7 h-7 text-[#263238]" /> 
            {lang === 'bn' ? 'রোল ও পারমিশন' : 'Roles & Permissions'}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {meta.total} {lang === 'bn' ? 'টি রোল সংজ্ঞায়িত আছে' : 'roles defined in the system'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#263238] text-white rounded-xl px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:bg-[#1a2428] transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" /> {lang === 'bn' ? 'নতুন রোল' : 'New Role'}
        </button>
      </div>

      <div className="space-y-4">
        {rolesData.map((role) => (
          <div key={role.id} className={`bg-white border rounded-2xl shadow-sm transition-all overflow-hidden ${expandedRole === role.name ? 'border-[#263238] ring-4 ring-red-50' : 'border-gray-100 hover:border-gray-200'}`}>
            <div 
              className="flex items-center gap-4 px-6 py-5 cursor-pointer"
              onClick={() => toggleRole(role)}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ROLE_GRADIENTS[role.name] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white shadow-md`}>
                <Shield size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-lg">
                    {lang === 'bn' ? role.label_bn : role.label_en}
                  </span>
                  <Badge variant={ROLE_COLORS[role.name] || 'gray'} className="text-[10px] uppercase font-bold tracking-tighter">
                    {role.name}
                  </Badge>
                  {role.name === 'super_admin' && <Lock size={14} className="text-gray-300" />}
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Shield size={12} className="text-[#263238]" /> {role.permission_count} {lang === 'bn' ? 'পারমিশন' : 'Permissions'}</span>
                  <span className="flex items-center gap-1.5"><Users size={12} className="text-blue-500" /> {role.user_count} {lang === 'bn' ? 'ব্যবহারকারী' : 'Users'}</span>
                  <span className="flex items-center gap-1.5"><Settings size={12} className="text-orange-500" /> {lang === 'bn' ? 'লেভেল' : 'Level'} {role.level}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingRole(role); setEditForm({ label_en: role.label_en, label_bn: role.label_bn, level: role.level }); }}
                  className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all"
                >
                  <Edit3 size={18} />
                </button>
                {role.name !== 'super_admin' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(role); }}
                    className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-[#263238] transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <div className={`p-2 rounded-lg transition-transform duration-300 ${expandedRole === role.name ? 'rotate-180 bg-red-50 text-[#263238]' : 'text-gray-300'}`}>
                   <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {expandedRole === role.name && (
              <div className="border-t border-gray-50 bg-[#fafbff] animate-in slide-in-from-top-2 duration-300">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-bold text-gray-700">
                      {selectedCount} / {totalPerms} {lang === 'bn' ? 'টি পারমিশন নির্বাচিত' : 'permissions selected'}
                    </div>
                    <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-[#263238] transition-all duration-500" style={{ width: `${(selectedCount / totalPerms) * 100}%` }} />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button onClick={() => { const all = {}; Object.values(allPermissions).flat().forEach(p => all[p.name] = true); setSelectedPermissions(all); }} className="text-xs font-bold text-[#263238] hover:underline uppercase tracking-tight">{t('selectAll')}</button>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <button onClick={() => setSelectedPermissions({})} className="text-xs font-bold text-gray-400 hover:underline uppercase tracking-tight">{t('deselectAll')}</button>
                    <button
                      onClick={() => handleSavePermissions(role)}
                      disabled={saving || role.name === 'super_admin'}
                      className="ml-4 bg-[#263238] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#1a2428] shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-30 flex items-center gap-2"
                    >
                      <Save size={14} />
                      {saving ? '...' : (lang === 'bn' ? 'সেভ করুন' : 'Save Changes')}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                   {role.name === 'super_admin' ? (
                     <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                           <Info size={24} />
                        </div>
                        <p className="text-sm text-blue-800 font-medium">
                           {lang === 'bn' 
                             ? 'সুপার অ্যাডমিন রোলে ডিফল্টভাবে সব পারমিশন অন্তর্ভুক্ত থাকে এবং এটি পরিবর্তনযোগ্য নয়।' 
                             : 'Super Admin role includes all permissions by default and cannot be modified.'}
                        </p>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(allPermissions).filter(([group]) => group !== 'epaper').map(([group, perms]) => (
                          <div key={group} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                             <div 
                               className="px-4 py-3 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between cursor-pointer group"
                               onClick={() => toggleGroup(group)}
                             >
                               <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                  {expandedGroups[group] ? <ChevronDown size={14} className="text-[#263238]" /> : <ChevronRight size={14} />}
                                  {getGroupLabel(group)}
                               </span>
                               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={(e) => { e.stopPropagation(); selectAllInGroup(group, perms); }} className="text-[9px] font-bold text-green-600 hover:underline uppercase">All</button>
                                  <button onClick={(e) => { e.stopPropagation(); deselectAllInGroup(group, perms); }} className="text-[9px] font-bold text-gray-400 hover:underline uppercase">None</button>
                               </div>
                             </div>
                             
                             {expandedGroups[group] && (
                               <div className="p-4 space-y-2.5">
                                  {perms.map(p => (
                                    <label key={p.name} className="flex items-center gap-3 cursor-pointer group/item">
                                       <div className="relative flex items-center justify-center">
                                          <input 
                                            type="checkbox" 
                                            checked={!!selectedPermissions[p.name]}
                                            onChange={() => togglePermission(p.name)}
                                            className="w-4.5 h-4.5 rounded-md border-gray-200 text-[#263238] focus:ring-[#263238] transition-all" 
                                          />
                                       </div>
                                       <span className={`text-xs font-medium transition-colors ${selectedPermissions[p.name] ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                                          {p.name.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                       </span>
                                    </label>
                                  ))}
                               </div>
                             )}
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                 <h3 className="text-xl font-bold flex items-center gap-2">
                    <Plus className="text-[#263238]" size={22} />
                    {lang === 'bn' ? 'নতুন রোল যুক্ত করুন' : 'Create New Role'}
                 </h3>
                 <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-5">
                 <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'সিস্টেম নাম (ইংরেজি)' : 'System Name'} *</label>
                    <input type="text" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238] font-mono" placeholder="e.g. news_editor" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'লেবেল (EN)' : 'Label (EN)'} *</label>
                       <input type="text" value={createForm.label_en} onChange={e => setCreateForm({...createForm, label_en: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'লেবেল (BN)' : 'Label (BN)'} *</label>
                       <input type="text" value={createForm.label_bn} onChange={e => setCreateForm({...createForm, label_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'লেভেল' : 'Access Level'} (0-10)</label>
                    <input type="number" value={createForm.level} onChange={e => setCreateForm({...createForm, level: parseInt(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" min={0} max={10} />
                 </div>
                 <button onClick={handleCreateRole} disabled={saving} className="w-full bg-[#263238] text-white rounded-2xl py-4 text-base font-bold shadow-lg shadow-red-100 transition-all hover:bg-[#1a2428] active:scale-95 disabled:opacity-50">
                    {saving ? '...' : (lang === 'bn' ? 'রোল তৈরি করুন' : 'Create Role')}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                 <h3 className="text-xl font-bold flex items-center gap-2">
                    <Edit3 className="text-blue-600" size={22} />
                    {lang === 'bn' ? 'রোল সম্পাদনা' : 'Edit Role'}
                 </h3>
                 <button onClick={() => setEditingRole(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-8 space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'লেবেল (EN)' : 'Label (EN)'} *</label>
                       <input type="text" value={editForm.label_en} onChange={e => setEditForm({...editForm, label_en: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'লেবেল (BN)' : 'Label (BN)'} *</label>
                       <input type="text" value={editForm.label_bn} onChange={e => setEditForm({...editForm, label_bn: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">{lang === 'bn' ? 'লেভেল' : 'Access Level'} (0-10)</label>
                    <input type="number" value={editForm.level} onChange={e => setEditForm({...editForm, level: parseInt(e.target.value)})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#263238]" min={0} max={10} />
                 </div>
                 <button onClick={handleSaveRole} disabled={saving} className="w-full bg-blue-600 text-white rounded-2xl py-4 text-base font-bold shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50">
                    {saving ? '...' : (lang === 'bn' ? 'হালনাগাদ করুন' : 'Update Role')}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9999] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                 <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{lang === 'bn' ? 'রোলটি মুছে ফেলবেন?' : 'Delete Role?'}</h3>
              <p className="text-sm text-gray-500 mb-8">
                 {lang === 'bn' 
                   ? `আপনি কি নিশ্চিত যে আপনি '${showDeleteConfirm.label_bn}' রোলটি মুছে ফেলতে চান? এই অ্যাকশনটি ফিরিয়ে নেওয়া যাবে না।` 
                   : `Are you sure you want to delete the '${showDeleteConfirm.label_en}' role? This action cannot be undone.`}
              </p>
              <div className="flex gap-3">
                 <button onClick={() => handleDeleteRole(showDeleteConfirm)} className="flex-1 bg-red-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-red-700 transition-all active:scale-95">
                    {lang === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
                 </button>
                 <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-3 text-sm font-bold hover:bg-gray-200 transition-all active:scale-95">
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
