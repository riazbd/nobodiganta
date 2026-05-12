import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  UserPlus, Edit3, Trash2, Search, X, Shield, Eye, EyeOff,
  Filter, SlidersHorizontal, Calendar, Clock, ChevronDown,
  Save, RotateCcw, Star, Download, Upload
} from 'lucide-react';
import { Badge } from '../../components/feedback/Badge';
import { Pagination } from '../../components/data/Pagination';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../hooks/useToast';
import { createUser, updateUser, deleteUser, toggleUserStatus } from '../../api/users';

const ROLE_COLORS = {
  super_admin: 'red',
  editor_in_chief: 'orange',
  managing_editor: 'blue',
  section_editor: 'cyan',
  seo_manager: 'purple',
  photographer: 'green',
  reporter: 'gray',
};

const STATUS_OPTIONS = [
  { value: '', label: 'allStatus', icon: null },
  { value: 'active', label: 'active', icon: '🟢' },
  { value: 'inactive', label: 'inactive', icon: '⚪' },
  { value: 'verified', label: 'verified', icon: '✅' },
  { value: 'unverified', label: 'unverified', icon: '❌' },
];

const SORT_OPTIONS = [
  { value: 'created_at_desc', label: 'newestFirst', field: 'created_at', dir: 'desc' },
  { value: 'created_at_asc', label: 'oldestFirst', field: 'created_at', dir: 'asc' },
  { value: 'name_asc', label: 'nameAZ', field: 'name', dir: 'asc' },
  { value: 'name_desc', label: 'nameZA', field: 'name', dir: 'desc' },
  { value: 'last_login_desc', label: 'recentlyActive', field: 'last_login_at', dir: 'desc' },
  { value: 'role_asc', label: 'byRole', field: 'role', dir: 'asc' },
];

const DEFAULT_FILTERS = {
  search: '',
  role: '',
  status: '',
  sort: 'created_at_desc',
  date_from: '',
  date_to: '',
  last_login: '',
  per_page: 15,
};

export default function Users({ users, roles, filters }) {
  const { lang, t } = useLanguage();
  const { showToast } = useToast();
  const searchTimeout = useRef(null);
  const searchInputRef = useRef(null);

  // Server-side state
  const usersData = users?.data || [];
  const links = users?.links || [];
  const meta = {
    current_page: users?.current_page || 1,
    last_page: users?.last_page || 1,
    total: users?.total || 0,
    per_page: users?.per_page || 15,
    from: users?.from || 0,
    to: users?.to || 0,
  };

  // Filter state — defensive parsing against any backend value
  let sf = {};
  try {
    if (typeof filters === 'string') sf = JSON.parse(filters);
    else if (filters && typeof filters === 'object') sf = filters;
  } catch { sf = {}; }

  const [searchQuery, setSearchQuery] = useState(String(sf.search || ''));
  const [roleFilter, setRoleFilter] = useState(String(sf.role || ''));
  const [statusFilter, setStatusFilter] = useState(String(sf.status || ''));
  const [sortFilter, setSortFilter] = useState(String(sf.sort || 'created_at_desc'));
  const [dateFrom, setDateFrom] = useState(String(sf.date_from || ''));
  const [dateTo, setDateTo] = useState(String(sf.date_to || ''));
  const [lastLoginFilter, setLastLoginFilter] = useState(String(sf.last_login || ''));
  const [perPage, setPerPage] = useState(Number(sf.per_page) || 15);

  // UI state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false);
  const [savedFilterName, setSavedFilterName] = useState('');
  const [savedFilters, setSavedFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user_filters') || '[]');
    } catch { return []; }
  });

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password_confirmation: '', role: 'reporter',
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [createPhotoFile, setCreatePhotoFile] = useState(null);
  const [createPhotoPreview, setCreatePhotoPreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Debounced search
  const handleSearchInput = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      applyFilters({ search: value, page: 1 });
    }, 400);
  }, []);

  // Keep a ref that always reflects the latest filter values so callbacks
  // that fire synchronously after setState don't read stale closure state.
  const filtersRef = useRef({});
  filtersRef.current = { searchQuery, roleFilter, statusFilter, sortFilter, dateFrom, dateTo, lastLoginFilter, perPage };

  // Apply all filters via Inertia SPA navigation
  const applyFilters = useCallback((overrides = {}) => {
    const f = filtersRef.current;
    const p = {
      search: f.searchQuery,
      role: f.roleFilter,
      status: f.statusFilter,
      sort: f.sortFilter,
      date_from: f.dateFrom,
      date_to: f.dateTo,
      last_login: f.lastLoginFilter,
      per_page: f.perPage,
      ...overrides,
    };

    const params = {};
    if (p.search) params.search = p.search;
    if (p.role) params.role = p.role;
    if (p.status) params.status = p.status;
    if (p.sort && p.sort !== 'created_at_desc') params.sort = p.sort;
    if (p.date_from) params.date_from = p.date_from;
    if (p.date_to) params.date_to = p.date_to;
    if (p.last_login) params.last_login = p.last_login;
    if (p.per_page !== 15) params.per_page = p.per_page;
    if (p.page && p.page > 1) params.page = p.page;

    router.get('/admin/users', params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  }, []); // no deps — reads live values via ref

  // Quick filter handlers
  const handleRoleChange = (role) => { setRoleFilter(role); applyFilters({ role, page: 1 }); };
  const handleStatusChange = (status) => { setStatusFilter(status); applyFilters({ status, page: 1 }); };
  const handleSortChange = (sort) => { setSortFilter(sort); applyFilters({ sort, page: 1 }); };
  const handleDateFromChange = (date) => { setDateFrom(date); };
  const handleDateToChange = (date) => { setDateTo(date); };
  const handleLastLoginChange = (val) => { setLastLoginFilter(val); };

  const handlePageChange = (page) => {
    applyFilters({ page });
  };

  const handlePerPageChange = (newPerPage, page = 1) => {
    setPerPage(newPerPage);
    applyFilters({ per_page: newPerPage, page });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setRoleFilter('');
    setStatusFilter('');
    setSortFilter('created_at_desc');
    setDateFrom('');
    setDateTo('');
    setLastLoginFilter('');
    setPerPage(15);
    router.get('/admin/users', {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  // Count active filters
  const activeFilterCount = [searchQuery, roleFilter, statusFilter, dateFrom, dateTo, lastLoginFilter]
    .filter(Boolean).length + (sortFilter !== 'created_at_desc' ? 1 : 0);

  // Saved filters
  const saveCurrentFilters = () => {
    if (!savedFilterName.trim()) return;
    const newFilter = {
      id: Date.now(),
      name: savedFilterName.trim(),
      filters: { search: searchQuery, role: roleFilter, status: statusFilter, sort: sortFilter, date_from: dateFrom, date_to: dateTo, last_login: lastLoginFilter },
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem('admin_user_filters', JSON.stringify(updated));
    setShowSaveFilterModal(false);
    setSavedFilterName('');
    showToast(t('filterSaved'));
  };

  const loadSavedFilter = (saved) => {
    const f = saved.filters;
    setSearchQuery(f.search || '');
    setRoleFilter(f.role || '');
    setStatusFilter(f.status || '');
    setSortFilter(f.sort || 'created_at_desc');
    setDateFrom(f.date_from || '');
    setDateTo(f.date_to || '');
    setLastLoginFilter(f.last_login || '');
    applyFilters({ ...f, page: 1 });
    setShowSavedFilters(false);
  };

  const deleteSavedFilter = (id) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem('admin_user_filters', JSON.stringify(updated));
  };

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, []);

  // Modal helpers
  const openCreate = () => {
    setFormData({ name: '', email: '', password: '', password_confirmation: '', role: 'reporter' });
    setFormErrors({}); setShowPassword(false); setCreatePhotoFile(null); setCreatePhotoPreview(null); setShowCreateModal(true);
  };
  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', password_confirmation: '', role: user.role, profile_photo_url: user.profile_photo_url });
    setFormErrors({}); setShowPassword(false); setShowEditModal(true);
  };
  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormErrors({});
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (createPhotoFile) fd.append('photo', createPhotoFile);
      await createUser(fd);
      setShowCreateModal(false); showToast(t('userCreated'));
    }
    catch (errors) { setFormErrors(errors); } finally { setSubmitting(false); }
  };
  const handleUpdate = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormErrors({});
    try {
      const data = { ...formData };
      if (!data.password) { delete data.password; delete data.password_confirmation; }
      await updateUser(editingUser.id, data); setShowEditModal(false); showToast(t('userUpdated'));
    } catch (errors) { setFormErrors(errors); } finally { setSubmitting(false); }
  };
  const handleDelete = async (user) => {
    try { await deleteUser(user.id); setShowDeleteConfirm(null); showToast(t('userDeleted')); }
    catch { showToast(t('errorOccurred'), 'error'); }
  };
  const handleToggleStatus = async (user) => {
    try { await toggleUserStatus(user.id); showToast(t('statusUpdated')); }
    catch { showToast(t('errorOccurred'), 'error'); }
  };

  const handleCreatePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCreatePhotoFile(file);
    setCreatePhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editingUser) return;
    setPhotoUploading(true);
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const res = await window.axios.post(route('admin.users.photo', editingUser.id), fd);
      setFormData(f => ({ ...f, profile_photo_url: res.data.url }));
      showToast(lang === 'bn' ? 'ছবি আপলোড হয়েছে' : 'Photo uploaded');
    } catch { showToast(lang === 'bn' ? 'আপলোড ব্যর্থ' : 'Upload failed', 'error'); }
    finally { setPhotoUploading(false); }
  };

  const handlePhotoRemove = async () => {
    if (!editingUser) return;
    setPhotoUploading(true);
    try {
      await window.axios.post(route('admin.users.photo', editingUser.id), { remove: true });
      setFormData(f => ({ ...f, profile_photo_url: null }));
      showToast(lang === 'bn' ? 'ছবি সরানো হয়েছে' : 'Photo removed');
    } catch { showToast(lang === 'bn' ? 'ব্যর্থ হয়েছে' : 'Failed', 'error'); }
    finally { setPhotoUploading(false); }
  };

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm outline-none transition-all bg-white ${
      formErrors[field] ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-[#263238] focus:ring-2 focus:ring-[#263238]/20'
    }`;

  const currentSort = SORT_OPTIONS.find(s => s.value === sortFilter) || SORT_OPTIONS[0];

  return (
    <div>
      <Head title={t('userManagement')} />

      {/* Page Header */}
      <div className="flex items-start justify-between mb-5.5">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary,#1a1d2e)] font-['Noto_Sans_Bengali']">
            👥 {t('userManagement')}
          </h1>
          <p className="text-[12.5px] text-[var(--text-muted,#9ca3af)] mt-0.75">
            {meta?.total || 0} {t('usersCount')}
            {activeFilterCount > 0 && (
              <span className="ml-2 text-[#263238] font-medium">
                ({activeFilterCount} {t('activeFilters') || 'active filters'})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSavedFilters(!showSavedFilters)}
            className="border border-[var(--card-border,#e8ebf4)] bg-white text-[var(--text-secondary,#6b7280)] rounded-lg px-3 py-2 text-[12.5px] font-medium flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
          >
            <Star className="w-3.5 h-3.5" /> {t('savedFilters') || 'Saved'}
          </button>
          <button
            onClick={openCreate}
            className="bg-[#263238] text-white rounded-lg px-4 py-2 text-[12.5px] font-semibold flex items-center gap-1.5 hover:bg-[#1a2428] transition-colors"
          >
            <UserPlus className="w-4 h-4" /> {t('newUser')}
          </button>
        </div>
      </div>

      {/* Search Bar + Filter Toggles */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        {/* Search Input */}
        <div className="flex-1 min-w-[250px] relative">
          <div className="flex items-center bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 gap-2 focus-within:border-[#263238] focus-within:ring-2 focus-within:ring-[#263238]/10 transition-all">
            <Search className="w-4 h-4 text-[var(--text-muted,#9ca3af)]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`${t('searchUsers')} (Ctrl+K)`}
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="border-none bg-transparent outline-none text-sm w-full focus:outline-none focus:ring-0"
            />
            {searchQuery && (
              <button onClick={() => handleSearchInput('')} className="text-[var(--text-muted,#9ca3af)] hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted,#9ca3af)] bg-gray-100 rounded border border-gray-200">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortFilter}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-[var(--card-border,#e8ebf4)] rounded-lg pl-3 pr-8 py-2 text-sm bg-white outline-none focus:border-[#263238] appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
            ))}
          </select>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors ${
            showAdvancedFilters || activeFilterCount > 0
              ? 'bg-[#263238]/5 border-[#263238]/30 text-[#263238]'
              : 'bg-white border-[var(--card-border,#e8ebf4)] text-[var(--text-secondary,#6b7280)] hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t('advancedFilters') || 'Filters'}
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-[#263238] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Save Filter */}
        {activeFilterCount > 0 && (
          <button
            onClick={() => setShowSaveFilterModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-[var(--card-border,#e8ebf4)] bg-white text-[var(--text-secondary,#6b7280)] hover:bg-gray-50 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> {t('saveFilter') || 'Save'}
          </button>
        )}

        {/* Clear All */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {t('clearAll') || 'Clear'}
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {searchQuery && (
            <FilterChip label={`${t('search')}: "${searchQuery}"`} onRemove={() => handleSearchInput('')} />
          )}
          {roleFilter && (
            <FilterChip
              label={`${t('role')}: ${lang === 'bn' ? (roles?.find(r => r.name === roleFilter)?.label_bn || roleFilter) : (roles?.find(r => r.name === roleFilter)?.label_en || roleFilter)}`}
              onRemove={() => handleRoleChange('')}
            />
          )}
          {statusFilter && (
            <FilterChip label={`${t('status')}: ${t(statusFilter)}`} onRemove={() => handleStatusChange('')} />
          )}
          {dateFrom && (
            <FilterChip label={`${t('dateFrom') || 'From'}: ${dateFrom}`} onRemove={() => { setDateFrom(''); applyFilters({ date_from: '', page: 1 }); }} />
          )}
          {dateTo && (
            <FilterChip label={`${t('dateTo') || 'To'}: ${dateTo}`} onRemove={() => { setDateTo(''); applyFilters({ date_to: '', page: 1 }); }} />
          )}
          {lastLoginFilter && (
            <FilterChip label={`${t('lastLogin')}: ${t('lastLogin_' + lastLoginFilter) || lastLoginFilter}`} onRemove={() => { setLastLoginFilter(''); applyFilters({ last_login: '', page: 1 }); }} />
          )}
          {sortFilter !== 'created_at_desc' && (
            <FilterChip label={`${t('sort') || 'Sort'}: ${t(currentSort.label)}`} onRemove={() => handleSortChange('created_at_desc')} />
          )}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-4 mb-4.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Role Filter */}
            <div>
              <label className="block text-[11.5px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider mb-1.5">
                {t('role')}
              </label>
              <select
                value={roleFilter}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#263238]"
              >
                <option value="">{t('allRoles')}</option>
                {roles?.map((r) => (
                  <option key={r.name} value={r.name}>{lang === 'bn' ? r.label_bn : r.label_en}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11.5px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider mb-1.5">
                {t('status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#263238]"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-[11.5px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider mb-1.5">
                {t('dateFrom') || 'Created From'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#263238]"
                />
              </div>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[11.5px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider mb-1.5">
                {t('dateTo') || 'Created To'}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#263238]"
              />
            </div>

            {/* Last Login */}
            <div>
              <label className="block text-[11.5px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider mb-1.5">
                {t('lastLogin')}
              </label>
              <select
                value={lastLoginFilter}
                onChange={(e) => { handleLastLoginChange(e.target.value); applyFilters({ last_login: e.target.value, page: 1 }); }}
                className="w-full border border-[var(--card-border,#e8ebf4)] rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#263238]"
              >
                <option value="">{t('anyTime') || 'Any time'}</option>
                <option value="today">{t('today')}</option>
                <option value="week">{t('thisWeek')}</option>
                <option value="month">{t('thisMonth')}</option>
                <option value="year">{t('thisYear')}</option>
                <option value="never">{t('never') || 'Never logged in'}</option>
              </select>
            </div>

            {/* Quick Actions */}
            <div className="flex items-end gap-2">
              <button
                onClick={() => applyFilters({ page: 1 })}
                className="flex-1 bg-[#263238] text-white rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[#1a2428] transition-colors flex items-center justify-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" /> {t('applyFilters') || 'Apply'}
              </button>
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setLastLoginFilter(''); setRoleFilter(''); setStatusFilter(''); applyFilters({ date_from: '', date_to: '', last_login: '', role: '', status: '', page: 1 }); }}
                className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Filters Dropdown */}
      {showSavedFilters && (
        <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm p-4 mb-4.5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#f59e0b]" /> {t('savedFilters') || 'Saved Filters'}
            </h3>
            <button onClick={() => setShowSavedFilters(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          {savedFilters.length === 0 ? (
            <p className="text-sm text-[var(--text-muted,#9ca3af)] text-center py-4">
              {t('noSavedFilters') || 'No saved filters yet. Use "Save" to store your current filter.'}
            </p>
          ) : (
            <div className="space-y-2">
              {savedFilters.map(saved => (
                <div key={saved.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--card-border,#e8ebf4)] hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{saved.name}</div>
                    <div className="text-[11px] text-[var(--text-muted,#9ca3af)] mt-0.5">
                      {Object.entries(saved.filters).filter(([_, v]) => v).map(([k]) => k).join(' · ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => loadSavedFilter(saved)}
                      className="px-3 py-1.5 text-xs bg-[#263238] text-white rounded-md hover:bg-[#1a2428] transition-colors"
                    >
                      {t('apply') || 'Apply'}
                    </button>
                    <button
                      onClick={() => deleteSavedFilter(saved.id)}
                      className="p-1.5 rounded-md hover:bg-[#eceff1] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#263238]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[var(--card-bg,#ffffff)] border border-[var(--card-border,#e8ebf4)] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{t('name')}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{t('email')}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{t('role')}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{t('status')}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{t('lastLogin')}</th>
              <th className="text-[11px] font-semibold text-[var(--text-muted,#9ca3af)] uppercase tracking-wider px-4 py-3 bg-[var(--body-bg,#f0f2f8)] border-b border-[var(--card-border,#e8ebf4)] text-left">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {usersData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-12 text-center text-[var(--text-muted,#9ca3af)]">
                  {activeFilterCount > 0 ? (t('noUsersMatchFilters') || 'No users match your filters') : t('noUsersFound')}
                </td>
              </tr>
            ) : (
              usersData.map((user) => (
                <tr key={user.id} className="hover:bg-[#fafbff] transition-colors">
                  <td className="px-4 py-3 border-b border-[#f3f4f6]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                        {user.profile_photo_url ? (
                          <img src={user.profile_photo_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#263238] to-[#ff6b6b] flex items-center justify-center text-white text-sm font-bold">
                            {(user.name ?? '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--text-primary,#1a1d2e)] hover:text-[#263238] transition-colors cursor-pointer">{user.name}</div>
                        <div className="text-[10.5px] text-[var(--text-muted,#9ca3af)]">{user.created_at}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] text-[var(--text-secondary,#6b7280)]">{user.email}</td>
                  <td className="px-4 py-3 border-b border-[#f3f4f6]">
                    <Badge variant={ROLE_COLORS[user.role] || 'gray'}>
                      {lang === 'bn' ? user.role_label_bn : user.role_label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 border-b border-[#f3f4f6]">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                        user.status === 'active'
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {user.status === 'active' ? (<><Eye className="w-3 h-3" /> {t('active')}</>) : (<><EyeOff className="w-3 h-3" /> {t('inactive')}</>)}
                    </button>
                  </td>
                  <td className="px-4 py-3 border-b border-[#f3f4f6] text-[12.5px] text-[var(--text-muted,#9ca3af)]">
                    {user.last_login || '—'}
                  </td>
                  <td className="px-4 py-3 border-b border-[#f3f4f6]">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(user)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title={t('edit')}>
                        <Edit3 className="w-3.5 h-3.5 text-[var(--text-muted,#9ca3af)]" />
                      </button>
                      <button onClick={() => setShowDeleteConfirm(user)} className="p-1.5 rounded-md hover:bg-[#eceff1] transition-colors" title={t('delete')}>
                        <Trash2 className="w-3.5 h-3.5 text-[#263238]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <Pagination
          meta={meta}
          links={links}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          perPageOptions={[10, 15, 25, 50, 100]}
        />
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title={t('createUser')} onClose={() => setShowCreateModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Profile photo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 bg-gradient-to-br from-[#263238] to-[#ff6b6b] flex items-center justify-center">
                {createPhotoPreview
                  ? <img src={createPhotoPreview} alt="" className="w-full h-full object-cover" />
                  : <span className="text-white text-xl font-bold">{(formData.name || '?').charAt(0).toUpperCase()}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700">
                  {lang === 'bn' ? 'ছবি নির্বাচন' : 'Choose Photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCreatePhotoSelect} />
                </label>
                {createPhotoPreview && (
                  <button type="button" onClick={() => { setCreatePhotoFile(null); setCreatePhotoPreview(null); }}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors text-left">
                    {lang === 'bn' ? 'ছবি সরান' : 'Remove'}
                  </button>
                )}
              </div>
            </div>
            <FormField label={t('name')} error={formErrors.name}><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass('name')} required autoFocus /></FormField>
            <FormField label={t('email')} error={formErrors.email}><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass('email')} required /></FormField>
            <FormField label={t('role')} error={formErrors.role}>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputClass('role')} required>
                {roles?.map((r) => (<option key={r.name} value={r.name}>{lang === 'bn' ? r.label_bn : r.label_en}</option>))}
              </select>
            </FormField>
            <FormField label={t('password')} error={formErrors.password}>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass('password')} required minLength={8} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </FormField>
            <FormField label={t('confirmPassword')} error={formErrors.password_confirmation}><input type={showPassword ? 'text' : 'password'} value={formData.password_confirmation} onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })} className={inputClass('password_confirmation')} required minLength={8} /></FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">{t('cancel')}</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-[#263238] text-white rounded-lg hover:bg-[#1a2428] disabled:opacity-50 transition-colors">{submitting ? t('creating') : t('create')}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <Modal title={t('editUser')} onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Profile photo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 bg-gradient-to-br from-[#263238] to-[#ff6b6b] flex items-center justify-center">
                {formData.profile_photo_url
                  ? <img src={formData.profile_photo_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-white text-xl font-bold">{(formData.name || '?').charAt(0).toUpperCase()}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700">
                  {photoUploading ? '...' : (lang === 'bn' ? 'ছবি আপলোড' : 'Upload Photo')}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
                </label>
                {formData.profile_photo_url && (
                  <button type="button" onClick={handlePhotoRemove} disabled={photoUploading}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors text-left">
                    {lang === 'bn' ? 'ছবি সরান' : 'Remove photo'}
                  </button>
                )}
              </div>
            </div>
            <FormField label={t('name')} error={formErrors.name}><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass('name')} required autoFocus /></FormField>
            <FormField label={t('email')} error={formErrors.email}><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass('email')} required /></FormField>
            <FormField label={t('role')} error={formErrors.role}>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputClass('role')} required>
                {roles?.map((r) => (<option key={r.name} value={r.name}>{lang === 'bn' ? r.label_bn : r.label_en}</option>))}
              </select>
            </FormField>
            <FormField label={t('newPasswordOptional')} error={formErrors.password}>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass('password')} minLength={8} placeholder={t('leaveBlankToKeep')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </FormField>
            <FormField label={t('confirmPassword')} error={formErrors.password_confirmation}><input type={showPassword ? 'text' : 'password'} value={formData.password_confirmation} onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })} className={inputClass('password_confirmation')} minLength={8} /></FormField>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">{t('cancel')}</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-[#263238] text-white rounded-lg hover:bg-[#1a2428] disabled:opacity-50 transition-colors">{submitting ? t('updating') : t('update')}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <Modal title={t('deleteUser')} onClose={() => setShowDeleteConfirm(null)}>
          <div className="py-4">
            <p className="text-sm text-[var(--text-secondary,#6b7280)] mb-4">{t('confirmDeleteUser').replace('{name}', showDeleteConfirm.name)}</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">{t('cancel')}</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">{t('delete')}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Save Filter Modal */}
      {showSaveFilterModal && (
        <Modal title={t('saveFilter') || 'Save Filter'} onClose={() => setShowSaveFilterModal(false)}>
          <div className="space-y-4">
            <FormField label={t('filterName') || 'Filter Name'}>
              <input type="text" value={savedFilterName} onChange={(e) => setSavedFilterName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#263238]" placeholder={t('filterNamePlaceholder') || 'e.g., Active Reporters'} autoFocus />
            </FormField>
            <div className="text-[11.5px] text-[var(--text-muted,#9ca3af)]">
              {t('willSave') || 'This will save:'} {activeFilterCount} {t('activeFilters') || 'filters'}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowSaveFilterModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">{t('cancel')}</button>
              <button onClick={saveCurrentFilters} disabled={!savedFilterName.trim()} className="px-4 py-2 text-sm bg-[#263238] text-white rounded-lg hover:bg-[#1a2428] disabled:opacity-50 flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5" /> {t('save')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Reusable Components ─── */

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium bg-[#263238]/5 text-[#263238] border border-[#263238]/20">
      {label}
      <button onClick={onRemove} className="hover:bg-[#263238]/20 rounded-full p-0.5 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <h3 className="text-sm font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{Array.isArray(error) ? error[0] : error}</p>}
    </div>
  );
}
