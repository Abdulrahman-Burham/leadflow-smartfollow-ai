import React, { useState, useEffect } from 'react';
import { MMCard, MMButton, MMBadge, MMSearch, MMSelect, MMInput } from '../sdk';
import userService from '../services/userService';
import { useTranslation } from 'react-i18next';
import { UserPlus, Users, ShieldCheck, Edit2, Lock, AlertOctagon } from 'lucide-react';

const ROLE_DEFINITIONS = {
  ADMIN: {
    title: 'Administrator',
    titleAr: 'مدير النظام الشامل',
    color: 'var(--danger-color)',
    badge: 'danger',
    description: 'Full administrative control over all organization settings, users, projects, and pipeline data.',
    descriptionAr: 'صلاحيات كاملة لإدارة جميع المستخدمين، الإعدادات، المشاريع، وبيانات الصفقات.',
    permissions: ['Manage Users & Roles', 'Full Pipeline Access', 'System Settings', 'AI Co-Pilots', 'Data Export'],
    permissionsAr: ['إدارة المستخدمين والصلاحيات', 'وصول كامل للصفقات', 'إعدادات النظام', 'المساعدون الذكاء الاصطناعي', 'تصدير البيانات']
  },
  MANAGER: {
    title: 'Sales & Project Manager',
    titleAr: 'مدير المبيعات والمشاريع',
    color: 'var(--warning-color)',
    badge: 'warning',
    description: 'Manages sales pipelines, assigns follow-up tasks, creates projects, and generates reports.',
    descriptionAr: 'إدارة خط المبيعات، توزيع مهام المتابعة، إنشاء المشاريع، وتوليد التقارير.',
    permissions: ['Create & Edit Leads', 'Assign Follow-ups', 'Create Projects', 'AI Report Bot', 'View Analytics'],
    permissionsAr: ['إنشاء وتعديل العملاء', 'تعيين المتابعات', 'إنشاء المشاريع', 'روبوت التقارير', 'عرض التحليلات']
  },
  USER: {
    title: 'Sales Representative',
    titleAr: 'مسؤول مبيعات ومتابعة',
    color: 'var(--primary)',
    badge: 'primary',
    description: 'Executes daily follow-up actions, uses AI draft generators, and updates deal stages.',
    descriptionAr: 'تنفيذ مهام المتابعة اليومية، استخدام الذكاء الاصطناعي لإنشاء الرسائل، وتحديث الصفقات.',
    permissions: ['Daily Action Queue', 'AI Message Generator', 'Update Deal Stage', 'Log Customer Calls'],
    permissionsAr: ['قائمة العمل اليومية', 'إنشاء الرسائل بالذكاء الاصطناعي', 'تحديث مرحلة الصفقة', 'تسجيل المكالمات']
  },
  VIEWER: {
    title: 'Viewer / Auditor',
    titleAr: 'مراقب / مشاهد فقط',
    color: 'var(--text-secondary)',
    badge: 'neutral',
    description: 'Read-only access to inspect dashboards, reports, and deal progress without edit rights.',
    descriptionAr: 'صلاحية مشاهدة وقراءة فقط للوحات التحليل والتقارير والصفقات دون تعديل.',
    permissions: ['View Dashboards', 'View Pipelines', 'View Reports (Read-Only)'],
    permissionsAr: ['عرض لوحات التحليل', 'عرض الصفقات', 'عرض التقارير (قراءة فقط)']
  }
};

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Read Logged-In User Role
  const [currentUser, setCurrentUser] = useState(() => {
    const currentUserStr = localStorage.getItem('user');
    return currentUserStr ? JSON.parse(currentUserStr) : null;
  });
  const userRole = currentUser?.role || 'ADMIN';
  const isReadOnly = userRole === 'VIEWER';
  const canManageUsers = userRole === 'ADMIN' || userRole === 'MANAGER';

  // Add User Modal State
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [formError, setFormError] = useState('');

  // Edit Role Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('USER');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 4500);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers({ search, role: roleFilter });
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!canManageUsers) {
      showError(isArabic ? '⛔ تم رفض الوصول: لا تملك صلاحيات إضافة مستخدمين.' : '⛔ Access Denied: VIEWER role cannot add new users.');
      return;
    }

    try {
      const created = await userService.createUser(newUser);
      setShowModal(false);
      setNewUser({ displayName: '', email: '', password: '', role: 'USER' });
      showToast(isArabic ? `تمت إضافة المستخدم ${created.displayName || created.email}` : `Added user ${created.displayName || created.email}!`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user:', err);
      setFormError(err.response?.data?.error || (isArabic ? 'تعذر إنشاء المستخدم' : 'Failed to create user.'));
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!canManageUsers) {
      showError(isArabic ? '⛔ تم رفض الوصول: لا تملك صلاحية تعديل الدور.' : '⛔ Access Denied: VIEWER role cannot modify user roles.');
      return;
    }

    try {
      const targetUser = users.find(u => u.id === userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      await userService.updateUser(userId, { role: newRole });

      // Sync localStorage and component state if changing current logged in user
      if (currentUser && (currentUser.id === userId || currentUser.email === targetUser?.email)) {
        const updatedSelf = { ...currentUser, role: newRole };
        localStorage.setItem('user', JSON.stringify(updatedSelf));
        setCurrentUser(updatedSelf);
      }

      showToast(isArabic ? `تم تغيير دور المستخدم إلى ${newRole}` : `⚡ User role updated to ${newRole}!`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role:', err);
      showError(err.response?.data?.error || (isArabic ? 'تعذر تحديث الدور' : 'Failed to update role.'));
      fetchUsers();
    }
  };

  const handleSaveRoleModal = async () => {
    if (!editingUser) return;
    await handleChangeRole(editingUser.id, selectedRole);
    setEditingUser(null);
  };

  const handleToggleActive = async (user) => {
    if (userRole !== 'ADMIN') {
      showError(isArabic ? '⛔ الصلاحية للمدراء فقط.' : '⛔ Access Denied: Only Administrators can activate/deactivate users.');
      return;
    }

    try {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: !user.active } : u));
      await userService.updateUser(user.id, { active: !user.active });
      showToast(isArabic ? `تم تغيير الحالة إلى ${!user.active ? 'نشط' : 'غير نشط'}` : `User status set to ${!user.active ? 'Active' : 'Inactive'}`);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status:', err);
      showError(err.response?.data?.error || (isArabic ? 'تعذر تحديث الحالة' : 'Failed to update status.'));
      fetchUsers();
    }
  };

  return (
    <div style={{ padding: '24px', background: 'var(--bg-page)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      {/* Read-Only Security Banner */}
      {isReadOnly && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger-color)', color: '#EF4444',
          marginBottom: '20px', fontWeight: 'bold', fontSize: '14px'
        }}>
          <Lock size={20} />
          {isArabic 
            ? '🔒 وضع المشاهدة فقط: حسابك بصلاحية مشاهد. لا يمكنك إضافة مستخدمين أو تعديل الصلاحيات.'
            : '🔒 Read-Only Restricted Mode: Your role is VIEWER. You cannot add users, change roles, or modify settings.'
          }
        </div>
      )}

      {/* Error Alert Toast */}
      {errorMessage && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger-color)', color: '#EF4444',
          marginBottom: '20px', fontWeight: 'bold', fontSize: '13px'
        }}>
          <AlertOctagon size={18} /> {errorMessage}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
        padding: '24px', borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(224, 170, 62, 0.15) 0%, rgba(28, 28, 28, 0.8) 100%)',
        border: '1px solid var(--primary)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck style={{ color: 'var(--primary)' }} size={32} />
            {isArabic ? 'إدارة أدوار وصلاحيات أعضاء الفريق' : 'Team Roles & Permissions Management'}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
            {isArabic ? 'تعيين الأدوار، تحديد مسؤوليات الفريق، والتحكم في صلاحيات الوصول للنظام.' : 'Assign detailed system roles, define team responsibilities, and control access permissions.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {toastMessage && (
            <div style={{ 
              padding: '8px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.2)', 
              color: 'var(--success-color)', fontWeight: 'bold', fontSize: '13px', border: '1px solid var(--success-color)' 
            }}>
              {toastMessage}
            </div>
          )}
          {canManageUsers && (
            <MMButton variant="primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} /> {isArabic ? 'إضافة مستخدم جديد' : 'Add New User'}
            </MMButton>
          )}
        </div>
      </div>

      {/* Role Matrix Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {Object.entries(ROLE_DEFINITIONS).map(([key, info]) => (
          <MMCard key={key} style={{ borderTop: `3px solid ${info.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '15px', color: info.color }}>{isArabic ? info.titleAr : info.title}</span>
              <MMBadge variant={info.badge}>{key}</MMBadge>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: '1.4' }}>
              {isArabic ? info.descriptionAr : info.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {(isArabic ? info.permissionsAr : info.permissions).slice(0, 3).map((perm, i) => (
                <span key={i} style={{ 
                  fontSize: '11px', padding: '2px 6px', borderRadius: '4px', 
                  background: 'var(--bg-hover)', color: 'var(--text-muted)' 
                }}>
                  ✓ {perm}
                </span>
              ))}
            </div>
          </MMCard>
        ))}
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <MMSearch 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isArabic ? 'بحث بالاسم أو البريد الإلكتروني...' : 'Search team members by name or email...'} 
          />
        </div>
        <div style={{ width: '220px' }}>
          <MMSelect 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'ALL', label: isArabic ? 'جميع الصلاحيات' : 'All System Roles' },
              { value: 'ADMIN', label: isArabic ? 'ADMIN (مدير النظام)' : 'ADMIN (Administrator)' },
              { value: 'MANAGER', label: isArabic ? 'MANAGER (مدير المبيعات)' : 'MANAGER (Sales Manager)' },
              { value: 'USER', label: isArabic ? 'USER (مسؤول مبيعات)' : 'USER (Sales Rep)' },
              { value: 'VIEWER', label: isArabic ? 'VIEWER (مشاهد فقط)' : 'VIEWER (Read-Only)' }
            ]}
          />
        </div>
      </div>

      {/* Users Table */}
      <MMCard title={isArabic ? `👥 دليل أعضاء الفريق النظامي (${users.length})` : `👥 Organization Team Directory (${users.length})`}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>{isArabic ? 'جاري التحميل...' : 'Loading users...'}</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>{isArabic ? 'لم يتم العثور على أعضاء.' : 'No team members found.'}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: isArabic ? 'right' : 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>{isArabic ? 'العضو / البريد' : 'Member / Email'}</th>
                  <th style={{ padding: '12px' }}>{isArabic ? 'الدور الحالي' : 'Current System Role'}</th>
                  <th style={{ padding: '12px' }}>{isArabic ? 'تغيير الدور' : 'Change Role'}</th>
                  <th style={{ padding: '12px' }}>{isArabic ? 'الحالة' : 'Status'}</th>
                  <th style={{ padding: '12px', textAlign: isArabic ? 'left' : 'right' }}>{isArabic ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const roleInfo = ROLE_DEFINITIONS[u.role] || ROLE_DEFINITIONS.USER;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '38px', height: '38px', borderRadius: '50%', 
                            background: roleInfo.color, color: '#000', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            fontWeight: 'bold', fontSize: '15px' 
                          }}>
                            {(u.displayName || u.email || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{u.displayName || (isArabic ? 'مستخدم' : 'User')}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <MMBadge variant={roleInfo.badge}>{u.role} — {isArabic ? roleInfo.titleAr : roleInfo.title}</MMBadge>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{isArabic ? roleInfo.descriptionAr : roleInfo.description}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px', width: '170px' }}>
                        {canManageUsers ? (
                          <select 
                            value={u.role} 
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            style={{ 
                              padding: '8px 12px', borderRadius: '6px', 
                              background: 'var(--bg-surface)', color: 'var(--text-primary)', 
                              border: `2px solid ${roleInfo.color}`, fontSize: '13px', cursor: 'pointer', width: '100%',
                              fontWeight: 'bold'
                            }}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="USER">USER</option>
                            <option value="VIEWER">VIEWER</option>
                          </select>
                        ) : (
                          <MMBadge variant="neutral">{isArabic ? '🔒 مشاهدة فقط' : '🔒 Read-Only'}</MMBadge>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <MMBadge variant={u.active ? 'success' : 'neutral'}>
                          {u.active ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}
                        </MMBadge>
                      </td>
                      <td style={{ padding: '12px', textAlign: isArabic ? 'left' : 'right' }}>
                        {canManageUsers ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: isArabic ? 'flex-start' : 'flex-end' }}>
                            <MMButton 
                              variant="primary" 
                              size="sm"
                              onClick={() => { setEditingUser(u); setSelectedRole(u.role); }}
                              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Edit2 size={14} /> {isArabic ? 'تعديل الدور' : 'Edit Role'}
                            </MMButton>
                            {userRole === 'ADMIN' && (
                              <MMButton 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleToggleActive(u)}
                                style={{ fontSize: '12px' }}
                              >
                                {u.active ? (isArabic ? 'تعطيل' : 'Deactivate') : (isArabic ? 'تفعيل' : 'Activate')}
                              </MMButton>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{isArabic ? 'غير مسموح' : 'No actions allowed'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </MMCard>

      {/* Edit Role Modal */}
      {editingUser && canManageUsers && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '24px', width: '100%', maxWidth: '500px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit2 style={{ color: 'var(--primary)' }} size={24} />
              {isArabic ? `تعديل الدور لـ ${editingUser.displayName || editingUser.email}` : `Update System Role for ${editingUser.displayName || editingUser.email}`}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'اختر الدور الجديد' : 'Select New System Role'}
                </label>
                <MMSelect 
                  value={selectedRole} 
                  onChange={(val) => setSelectedRole(typeof val === 'object' && val?.target ? val.target.value : val)}
                  options={[
                    { value: 'ADMIN', label: isArabic ? 'ADMIN (مدير بنظام كامل)' : 'ADMIN (Full Administrative Control)' },
                    { value: 'MANAGER', label: isArabic ? 'MANAGER (مدير المبيعات والمشاريع)' : 'MANAGER (Sales & Project Manager)' },
                    { value: 'USER', label: isArabic ? 'USER (مسؤول مبيعات ومتابعة)' : 'USER (Sales Representative)' },
                    { value: 'VIEWER', label: isArabic ? 'VIEWER (مشاهد وقارئ فقط)' : 'VIEWER (Read-Only Access)' }
                  ]}
                />
              </div>

              {/* Role Permissions Card */}
              {ROLE_DEFINITIONS[selectedRole] && (
                <div style={{ 
                  padding: '14px', borderRadius: '8px', 
                  background: 'var(--bg-surface)', border: `2px solid ${ROLE_DEFINITIONS[selectedRole].color}`,
                  fontSize: '13px'
                }}>
                  <div style={{ fontWeight: 'bold', color: ROLE_DEFINITIONS[selectedRole].color, marginBottom: '6px' }}>
                    {isArabic ? ROLE_DEFINITIONS[selectedRole].titleAr : ROLE_DEFINITIONS[selectedRole].title}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {isArabic ? ROLE_DEFINITIONS[selectedRole].descriptionAr : ROLE_DEFINITIONS[selectedRole].description}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(isArabic ? ROLE_DEFINITIONS[selectedRole].permissionsAr : ROLE_DEFINITIONS[selectedRole].permissions).map((perm, i) => (
                      <span key={i} style={{ padding: '3px 8px', background: 'var(--bg-hover)', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '11px' }}>
                        ✓ {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <MMButton type="button" variant="ghost" onClick={() => setEditingUser(null)}>{isArabic ? 'إلغاء' : 'Cancel'}</MMButton>
                <MMButton type="button" variant="primary" onClick={handleSaveRoleModal}>{isArabic ? 'حفظ وتحديث الدور' : 'Save & Update Role'}</MMButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showModal && canManageUsers && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '24px', width: '100%', maxWidth: '540px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus style={{ color: 'var(--primary)' }} size={24} />
              {isArabic ? 'إضافة مستخدم وتعيين الدور' : 'Add User & Assign System Role'}
            </h3>

            {formError && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <MMInput 
                  value={newUser.displayName} 
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  placeholder={isArabic ? 'مثال: محمود رشاد' : 'e.g. Mahmoud Rashad'} 
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'البريد الإلكتروني *' : 'Email Address *'}
                </label>
                <MMInput 
                  type="email"
                  value={newUser.email} 
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="user@domain.com" 
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    {isArabic ? 'كلمة السر *' : 'Password *'}
                  </label>
                  <MMInput 
                    type="password"
                    value={newUser.password} 
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="******" 
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    {isArabic ? 'اختر الدور *' : 'Select System Role *'}
                  </label>
                  <MMSelect 
                    value={newUser.role} 
                    onChange={(val) => {
                      const roleVal = typeof val === 'object' && val?.target ? val.target.value : val;
                      setNewUser(prev => ({ ...prev, role: roleVal }));
                    }}
                    options={[
                      { value: 'ADMIN', label: isArabic ? 'ADMIN (مدير كامل)' : 'ADMIN (Full Access)' },
                      { value: 'MANAGER', label: isArabic ? 'MANAGER (مدير مبيعات)' : 'MANAGER (Sales & Projects)' },
                      { value: 'USER', label: isArabic ? 'USER (مسؤول مبيعات)' : 'USER (Sales Representative)' },
                      { value: 'VIEWER', label: isArabic ? 'VIEWER (مشاهد فقط)' : 'VIEWER (Read-Only)' }
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <MMButton type="button" variant="ghost" onClick={() => setShowModal(false)}>{isArabic ? 'إلغاء' : 'Cancel'}</MMButton>
                <MMButton type="submit" variant="primary">{isArabic ? 'إنشاء وتعيين الدور' : 'Create User & Assign Role'}</MMButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

