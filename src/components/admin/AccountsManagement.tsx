import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole, AccountStatus, UserAccount } from '../../types';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Key,
  Link as LinkIcon,
  Trash2,
  Lock,
  Unlock,
  GraduationCap,
  Users,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ExternalLink,
  FileSpreadsheet,
  Upload,
  Receipt,
  Building2,
  CreditCard,
  Calculator,
  Briefcase
} from 'lucide-react';
import { ImportAccountsModal } from './ImportAccountsModal';
import { ImportType } from '../../utils/importHelper';

export const AccountsManagement: React.FC = () => {
  const { 
    accounts, 
    addAccount, 
    updateAccountStatus, 
    updateAccountRole, 
    linkAccountToProfile, 
    deleteAccount,
    resetPassword 
  } = useAuth();
  
  const { students, teachers, guardians, addStudent, addTeacher, addGuardian } = useData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importDefaultType, setImportDefaultType] = useState<ImportType>('STUDENT');

  // 5-Step Create Account Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createStep, setCreateStep] = useState<number>(1);
  
  // Create account form state
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [adminAuthCode, setAdminAuthCode] = useState<string>('');
  const [profileSearchQuery, setProfileSearchQuery] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<{ id: string; name: string; code: string; email?: string; phone?: string } | null>(null);
  const [accountEmail, setAccountEmail] = useState<string>('');
  const [accountPhone, setAccountPhone] = useState<string>('');
  const [tempPassword, setTempPassword] = useState<string>('MinhMusic@2024');
  const [displayName, setDisplayName] = useState<string>('');
  const [accountNote, setAccountNote] = useState<string>('');

  // Link profile modal for pending accounts
  const [linkingAccount, setLinkingAccount] = useState<UserAccount | null>(null);
  const [linkTargetProfile, setLinkTargetProfile] = useState<any>(null);
  const [viewingDetailAccount, setViewingDetailAccount] = useState<UserAccount | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Normalize role matching helper
  const isRoleMatching = (roleA: string, roleB: string) => {
    return roleA.toUpperCase() === roleB.toUpperCase();
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    if (roleFilter !== 'ALL' && !isRoleMatching(acc.role, roleFilter)) return false;
    if (statusFilter !== 'ALL' && acc.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        acc.displayName.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        (acc.username && acc.username.toLowerCase().includes(q)) ||
        (acc.nickname && acc.nickname.toLowerCase().includes(q)) ||
        (acc.phone && acc.phone.includes(q)) ||
        (acc.profileName && acc.profileName.toLowerCase().includes(q)) ||
        (acc.profileCode && acc.profileCode.toLowerCase().includes(q)) ||
        (acc.guardianName && acc.guardianName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getRoleBadge = (r: UserRole) => {
    const roleUpper = (r || 'STUDENT').toUpperCase();
    switch (roleUpper) {
      case 'ADMIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-600" /> Admin
          </span>
        );
      case 'MANAGER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-indigo-600" /> Quản lý Cơ sở
          </span>
        );
      case 'ACCOUNTANT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 flex items-center gap-1">
            <Receipt className="w-3 h-3 text-cyan-600" /> Kế toán / Thu ngân
          </span>
        );
      case 'TEACHER':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-blue-600" /> Giáo viên
          </span>
        );
      case 'STUDENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-emerald-600" /> Học viên
          </span>
        );
      case 'PARENT':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <Users className="w-3 h-3 text-amber-600" /> Phụ huynh
          </span>
        );
      case 'GUARDIAN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
            <Users className="w-3 h-3 text-teal-600" /> Người giám hộ
          </span>
        );
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">{r}</span>;
    }
  };

  const getStatusBadge = (s: AccountStatus) => {
    switch (s) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Hoạt động</span>;
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 animate-pulse"><Clock className="w-3 h-3" /> Chờ duyệt</span>;
      case 'suspended':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1"><Lock className="w-3 h-3" /> Tạm khóa</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 flex items-center gap-1"><XCircle className="w-3 h-3" /> Từ chối</span>;
    }
  };

  // Get available profiles for search in Step 2
  const getProfilesForRole = () => {
    const q = profileSearchQuery.toLowerCase();
    if (selectedRole === 'STUDENT') {
      return (students || [])
        .filter(s => s.fullName.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || (s.phone && s.phone.includes(q)))
        .map(s => ({ id: s.id, name: s.fullName, code: s.code, email: s.email, phone: s.phone, details: (s.enrolledSubjects || []).join(', ') || 'Chưa có môn học' }));
    } else if (selectedRole === 'TEACHER') {
      return (teachers || [])
        .filter(t => t.fullName.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || (t.phone && t.phone.includes(q)))
        .map(t => ({ id: t.id, name: t.fullName, code: t.code, email: t.email, phone: t.phone, details: (t.specialties || []).join(', ') || 'Giáo viên' }));
    } else if (selectedRole === 'PARENT' || selectedRole === 'GUARDIAN') {
      return (guardians || [])
        .filter(g => g.fullName.toLowerCase().includes(q) || g.code.toLowerCase().includes(q) || (g.phone && g.phone.includes(q)))
        .map(g => ({ id: g.id, name: g.fullName, code: g.code, email: g.email, phone: g.phone, details: `${g.relation || 'Phụ huynh'} • ${(g.linkedStudentIds || []).length} học viên` }));
    } else if (selectedRole === 'MANAGER' || selectedRole === 'ACCOUNTANT' || selectedRole === 'ADMIN') {
      // List existing teachers and staff that can be assigned manager/accountant role
      return (teachers || [])
        .filter(t => t.fullName.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || (t.phone && t.phone.includes(q)))
        .map(t => ({ id: t.id, name: t.fullName, code: t.code, email: t.email, phone: t.phone, details: `Nhân sự / Giảng viên • ${t.specialties?.join(', ') || 'Nhân sự trung tâm'}` }));
    }
    return [];
  };

  const handleOpenCreateModal = () => {
    setCreateStep(1);
    setSelectedRole('STUDENT');
    setAdminAuthCode('');
    setSelectedProfile(null);
    setProfileSearchQuery('');
    setAccountEmail('');
    setAccountPhone('');
    setDisplayName('');
    setTempPassword('MinhMusic@2024');
    setAccountNote('');
    setIsCreateModalOpen(true);
  };

  const handleCompleteAccountCreation = async () => {
    if (!accountEmail.trim()) {
      alert('Vui lòng nhập Email đăng nhập');
      return;
    }

    const emailToUse = accountEmail.trim().toLowerCase();
    const usernameToUse = emailToUse.includes('@') ? emailToUse.split('@')[0] : emailToUse;
    const finalPassword = tempPassword.trim() || (selectedRole === 'ADMIN' ? 'admin123' : selectedRole === 'TEACHER' ? 'teacher123' : selectedRole === 'STUDENT' ? 'student123' : 'parent123');
    const finalDisplayName = displayName.trim() || selectedProfile?.name || usernameToUse;
    const finalPhone = accountPhone.trim() || selectedProfile?.phone || '';

    let linkedProfileId = selectedProfile?.id;
    let linkedProfileCode = selectedProfile?.code;
    let linkedProfileName = selectedProfile?.name || finalDisplayName;

    // If role is STUDENT and no profile was selected, check existing or auto-create student profile
    if (selectedRole === 'STUDENT') {
      if (!linkedProfileId) {
        const existingStudent = students.find(s => 
          (s.email && s.email.toLowerCase() === emailToUse) ||
          (finalPhone && s.phone && s.phone.replace(/\D+/g, '') === finalPhone.replace(/\D+/g, '')) ||
          s.fullName.toLowerCase() === finalDisplayName.toLowerCase()
        );
        if (existingStudent) {
          linkedProfileId = existingStudent.id;
          linkedProfileCode = existingStudent.code;
          linkedProfileName = existingStudent.fullName;
        } else {
          const newStudentId = `stu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const newCode = `HV${String(students.length + 1).padStart(3, '0')}`;
          addStudent({
            id: newStudentId,
            code: newCode,
            fullName: finalDisplayName,
            email: emailToUse,
            phone: finalPhone,
            gender: 'Khác',
            birthDate: '2015-01-01',
            status: 'active',
            enrolledSubjects: ['Piano'],
            totalLessons: 24,
            completedLessons: 0,
            remainingLessons: 24,
            stars: 20,
            totalStars: 20,
            rewardPoints: 20
          });
          linkedProfileId = newStudentId;
          linkedProfileCode = newCode;
          linkedProfileName = finalDisplayName;
        }
      }
    } else if (selectedRole === 'PARENT' || selectedRole === 'GUARDIAN') {
      if (!linkedProfileId) {
        const existingGuardian = guardians.find(g => 
          (g.email && g.email.toLowerCase() === emailToUse) ||
          (finalPhone && g.phone && g.phone.replace(/\D+/g, '') === finalPhone.replace(/\D+/g, ''))
        );
        if (existingGuardian) {
          linkedProfileId = existingGuardian.id;
          linkedProfileCode = existingGuardian.code;
          linkedProfileName = existingGuardian.fullName;
        }
      }
    } else if (selectedRole === 'TEACHER') {
      if (!linkedProfileId) {
        const existingTeacher = teachers.find(t => 
          (t.email && t.email.toLowerCase() === emailToUse) ||
          (finalPhone && t.phone && t.phone.replace(/\D+/g, '') === finalPhone.replace(/\D+/g, ''))
        );
        if (existingTeacher) {
          linkedProfileId = existingTeacher.id;
          linkedProfileCode = existingTeacher.code;
          linkedProfileName = existingTeacher.fullName;
        }
      }
    }

    const newUid = `usr-gen-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    await addAccount({
      uid: newUid,
      email: emailToUse,
      username: usernameToUse,
      password: finalPassword,
      displayName: finalDisplayName,
      phone: finalPhone,
      role: selectedRole,
      roles: [selectedRole],
      primaryRole: selectedRole,
      status: 'active',
      profileId: linkedProfileId,
      studentProfileId: selectedRole === 'STUDENT' ? linkedProfileId : undefined,
      guardianProfileId: (selectedRole === 'PARENT' || selectedRole === 'GUARDIAN') ? linkedProfileId : undefined,
      teacherProfileId: selectedRole === 'TEACHER' ? linkedProfileId : undefined,
      profileName: linkedProfileName,
      profileCode: linkedProfileCode,
      note: accountNote || `Được tạo bởi Admin ngày ${new Date().toLocaleDateString('vi-VN')}`
    });

    setIsCreateModalOpen(false);
    showToast(`Đã tạo tài khoản ${selectedRole} thành công cho ${finalDisplayName}! Mật khẩu: ${finalPassword}`);
  };

  const handleConfirmLinkPending = () => {
    if (!linkingAccount || !linkTargetProfile) return;
    linkAccountToProfile(
      linkingAccount.uid,
      linkTargetProfile.id,
      linkTargetProfile.fullName || linkTargetProfile.name,
      linkTargetProfile.code
    );
    setLinkingAccount(null);
    setLinkTargetProfile(null);
    showToast(`Đã duyệt và liên kết tài khoản ${linkingAccount.email} với hồ sơ ${linkTargetProfile.fullName || linkTargetProfile.name}!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header and KPI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
              Tài Khoản & Phân Quyền (RBAC)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý tập trung toàn bộ tài khoản đăng nhập Firebase Authentication, cấp quyền và liên kết với hồ sơ nghiệp vụ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-open-import-accounts"
            onClick={() => {
              setImportDefaultType('STUDENT');
              setIsImportModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>NHẬP EXCEL / CSV</span>
          </button>

          <button
            id="btn-open-create-account"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>TẠO TÀI KHOẢN MỚI</span>
          </button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, sđt, mã hồ sơ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">Admin (Quản trị viên)</option>
              <option value="MANAGER">Quản lý Cơ sở / Vận hành</option>
              <option value="ACCOUNTANT">Kế toán / Thu ngân</option>
              <option value="TEACHER">Giáo viên</option>
              <option value="STUDENT">Học viên</option>
              <option value="PARENT">Phụ huynh</option>
              <option value="GUARDIAN">Người giám hộ</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="pending">Chờ duyệt (Pending)</option>
              <option value="suspended">Tạm khóa</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider bg-slate-50/70">
                <th className="py-3 px-3">Họ Tên & Email</th>
                <th className="py-3 px-3">Vai Trò</th>
                <th className="py-3 px-3">Hồ Sơ Liên Kết</th>
                <th className="py-3 px-3">Số Điện Thoại</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3">Đăng Nhập Gần Nhất</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    Không tìm thấy tài khoản nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.uid} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Display Name & Email */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        {acc.avatarUrl ? (
                          <img 
                            src={acc.avatarUrl} 
                            alt={acc.displayName} 
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                            {acc.displayName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900">{acc.displayName}</span>
                            {acc.nickname && (
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-medium">
                                ({acc.nickname})
                              </span>
                            )}
                            {acc.isUnder16 && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 py-0.2 rounded">
                                &lt;16 tuổi
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {acc.email}
                            </span>
                            {acc.username && (
                              <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
                                @{acc.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-3">
                      {getRoleBadge(acc.role)}
                    </td>

                    {/* Linked Profile */}
                    <td className="py-3 px-3">
                      {acc.profileId ? (
                        <div className="flex items-center gap-1 text-slate-700">
                          <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] border border-indigo-100">
                            {acc.profileCode}
                          </span>
                          <span className="truncate max-w-[130px] font-medium">{acc.profileName}</span>
                        </div>
                      ) : acc.status === 'pending' ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewingDetailAccount(acc)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md font-bold text-[10px] border border-emerald-200 flex items-center gap-1 cursor-pointer"
                            title="Xem chi tiết đơn đăng ký & Duyệt"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Duyệt / Xem</span>
                          </button>
                          <button
                            onClick={() => setLinkingAccount(acc)}
                            className="px-1.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md font-bold text-[10px] border border-amber-200 flex items-center gap-1 cursor-pointer"
                            title="Gán hồ sơ có sẵn"
                          >
                            <LinkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa liên kết</span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3 text-slate-600">
                      {acc.phone || '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {getStatusBadge(acc.status)}
                    </td>

                    {/* Last Login & Created */}
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      <div>{acc.lastLoginAt || 'Chưa đăng nhập'}</div>
                      <div className="text-[10px] text-slate-400">{acc.createdAt}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Lock / Unlock */}
                        {acc.status === 'active' ? (
                          <button
                            onClick={() => {
                              updateAccountStatus(acc.uid, 'suspended');
                              showToast(`Đã tạm khóa tài khoản ${acc.email}`);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Khóa tài khoản"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        ) : acc.status === 'suspended' ? (
                          <button
                            onClick={() => {
                              updateAccountStatus(acc.uid, 'active');
                              showToast(`Đã mở khóa tài khoản ${acc.email}`);
                            }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Mở khóa tài khoản"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        {/* Reset password */}
                        <button
                          onClick={async () => {
                            await resetPassword(acc.email);
                            showToast(`Đã gửi email khôi phục mật khẩu tới ${acc.email}!`);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Gửi email đổi mật khẩu"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete (Cannot delete primary admin) */}
                        {acc.role !== 'ADMIN' && (
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${acc.email}?`)) {
                                deleteAccount(acc.uid);
                                showToast(`Đã xóa tài khoản ${acc.email}`);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-STEP MODAL: TẠO TÀI KHOẢN */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    Quy Trình Tạo Tài Khoản Đăng Nhập
                  </h3>
                  <p className="text-xs text-slate-500">Bước {createStep} / 5</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            {/* Step Progress bar */}
            <div className="grid grid-cols-5 gap-1.5 my-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-colors ${createStep >= s ? 'bg-purple-600' : 'bg-slate-200'}`}
                />
              ))}
            </div>

            {/* STEP 1: CHỌN VAI TRÒ */}
            {createStep === 1 && (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Bước 1: Chọn vai trò tài khoản cần tạo
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Bố cục phân quyền RBAC</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { role: 'STUDENT' as UserRole, label: 'HỌC VIÊN', icon: GraduationCap, desc: 'Xem lịch học, bài tập, điểm sao, đổi quà' },
                    { role: 'TEACHER' as UserRole, label: 'GIÁO VIÊN', icon: BookOpen, desc: 'Lịch dạy, điểm danh, giao bài, nhận xét' },
                    { role: 'PARENT' as UserRole, label: 'PHỤ HUYNH', icon: Users, desc: 'Theo dõi con, học phí QR, xin nghỉ/bù' },
                    { role: 'GUARDIAN' as UserRole, label: 'NGƯỜI GIÁM HỘ', icon: Users, desc: 'Quản lý học viên được ủy quyền' },
                    { role: 'ACCOUNTANT' as UserRole, label: 'KẾ TOÁN / THU NGÂN', icon: Receipt, desc: 'Quản lý học phí, hóa đơn, công nợ & xuất báo cáo thuế.', isStaff: true },
                    { role: 'MANAGER' as UserRole, label: 'QUẢN LÝ CƠ SỞ / VẬN HÀNH', icon: Building2, desc: 'Điều phối lớp học, duyệt nghỉ bù/bảo lưu, giám sát vận hành.', isStaff: true },
                    { role: 'ADMIN' as UserRole, label: 'QUẢN TRỊ VIÊN', icon: ShieldCheck, desc: 'Toàn quyền quản trị & cấu hình hệ thống (Cần mã bảo mật Admin)', isDangerous: true, isFullWidth: true }
                  ].map(item => {
                    const Icon = item.icon;
                    const isSelected = selectedRole === item.role;
                    return (
                      <div
                        key={item.role}
                        onClick={() => setSelectedRole(item.role)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? item.isDangerous
                              ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-400/40 shadow-xs'
                              : item.isStaff
                              ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-400/40 shadow-xs'
                              : 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-400/40 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        } ${item.isFullWidth ? 'col-span-2' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 shrink-0 ${
                            isSelected 
                              ? item.isDangerous ? 'text-purple-700' : item.isStaff ? 'text-indigo-700' : 'text-purple-700'
                              : 'text-slate-500'
                          }`} />
                          <span className="font-bold text-xs text-slate-900">{item.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Security verification code box for sensitive roles */}
                {selectedRole === 'ADMIN' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Xác thực an toàn cấp quyền Quản trị viên (Admin):</span>
                    </div>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      Để bảo vệ hệ thống, vui lòng nhập mã xác thực bảo mật Quản trị viên cấp cao (Mặc định: <code className="font-mono font-bold bg-rose-100 px-1 py-0.5 rounded">MINHMUSIC@ADMIN</code>).
                    </p>
                    <input
                      type="password"
                      placeholder="Nhập mã bảo mật Admin..."
                      value={adminAuthCode}
                      onChange={(e) => setAdminAuthCode(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-rose-300 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                )}

                {selectedRole === 'MANAGER' && (
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                      <Key className="w-4 h-4 text-indigo-600" />
                      <span>Xác thực an toàn cấp quyền Quản lý Cơ sở / Vận hành:</span>
                    </div>
                    <p className="text-[11px] text-indigo-700 leading-relaxed">
                      Vui lòng nhập mã bảo mật cấp quyền Quản lý Cơ sở (Mặc định: <code className="font-mono font-bold bg-indigo-100 px-1 py-0.5 rounded">MINHMUSIC@MANAGER</code> hoặc mã Admin).
                    </p>
                    <input
                      type="password"
                      placeholder="Nhập mã bảo mật Quản lý..."
                      value={adminAuthCode}
                      onChange={(e) => setAdminAuthCode(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                )}

                {selectedRole === 'ACCOUNTANT' && (
                  <div className="p-3.5 bg-cyan-50 border border-cyan-200 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-900">
                      <Receipt className="w-4 h-4 text-cyan-700" />
                      <span>Xác thực an toàn cấp quyền Kế toán / Thu ngân:</span>
                    </div>
                    <p className="text-[11px] text-cyan-800 leading-relaxed">
                      Vui lòng nhập mã bảo mật cấp quyền Kế toán & Thu chi (Mặc định: <code className="font-mono font-bold bg-cyan-100 px-1 py-0.5 rounded">MINHMUSIC@ACCOUNTANT</code> hoặc mã Admin).
                    </p>
                    <input
                      type="password"
                      placeholder="Nhập mã bảo mật Kế toán..."
                      value={adminAuthCode}
                      onChange={(e) => setAdminAuthCode(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-cyan-300 bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: TÌM HỒ SƠ CÓ SẴN TRONG HỆ THỐNG */}
            {createStep === 2 && (
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Bước 2: Tìm và chọn hồ sơ {selectedRole} có sẵn
                  </h4>
                  {['ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(selectedRole) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProfile(null);
                        setDisplayName(selectedRole === 'ACCOUNTANT' ? 'Kế toán viên' : selectedRole === 'MANAGER' ? 'Quản lý cơ sở' : 'Quản trị viên');
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                    >
                      Bỏ qua (Tạo tài khoản độc lập)
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Tìm theo mã hồ sơ, tên, số điện thoại..."
                    value={profileSearchQuery}
                    onChange={(e) => setProfileSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 divide-y divide-slate-100">
                  {getProfilesForRole().length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <p className="text-xs text-slate-400">
                        Không tìm thấy hồ sơ nào khớp với từ khóa
                      </p>
                      {['ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(selectedRole) && (
                        <p className="text-[11px] text-indigo-600 font-medium">
                          Bạn có thể tiếp tục để tạo tài khoản độc lập mà không cần liên kết hồ sơ trước.
                        </p>
                      )}
                    </div>
                  ) : (
                    getProfilesForRole().map((prof) => {
                      const isSelected = selectedProfile?.id === prof.id;
                      return (
                        <div
                          key={prof.id}
                          onClick={() => {
                            setSelectedProfile(prof);
                            setAccountEmail(prof.email || '');
                            setAccountPhone(prof.phone || '');
                            setDisplayName(prof.name);
                          }}
                          className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                            isSelected 
                              ? 'bg-purple-50 border border-purple-300 font-bold' 
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded text-[10px]">
                                {prof.code}
                              </span>
                              <span className="text-xs text-slate-900 font-bold">{prof.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {prof.phone || 'Chưa có SĐT'} • {prof.details}
                            </p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                        </div>
                      );
                    })
                  )}
                </div>

                {selectedProfile && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <span>Đã chọn: <strong>{selectedProfile.code} - {selectedProfile.name}</strong></span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: NHẬP EMAIL & MẬT KHẨU TẠM THỜI */}
            {createStep === 3 && (
              <div className="space-y-3 py-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Bước 3: Nhập thông tin đăng nhập & Mật khẩu tạm thời
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email đăng nhập (*):</label>
                  <input
                    type="email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="ví dụ: hocvien@minhmusic.vn"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên hiển thị:</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Họ và tên hiển thị"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại:</label>
                  <input
                    type="tel"
                    value={accountPhone}
                    onChange={(e) => setAccountPhone(e.target.value)}
                    placeholder="Số điện thoại liên hệ"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu tạm thời (*):</label>
                  <input
                    type="text"
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-purple-700 font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Người dùng có thể tự đổi mật khẩu sau khi đăng nhập lần đầu.</p>
                </div>
              </div>
            )}

            {/* STEP 4: TẠO FIREBASE AUTH */}
            {createStep === 4 && (
              <div className="space-y-4 py-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Bước 4: Xác nhận tạo tài khoản Firebase Authentication
                </h4>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Vai trò:</span>
                    <span className="font-bold text-purple-700">{selectedRole}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Hồ sơ liên kết:</span>
                    <span className="font-bold text-slate-900">{selectedProfile ? `${selectedProfile.code} - ${selectedProfile.name}` : 'Tài khoản độc lập'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Email đăng nhập:</span>
                    <span className="font-bold text-slate-900">{accountEmail}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Tên hiển thị:</span>
                    <span className="font-bold text-slate-900">{displayName || selectedProfile?.name || accountEmail.split('@')[0]}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Mật khẩu tạm thời:</span>
                    <span className="font-mono font-bold text-indigo-700">{tempPassword}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  ⚡ Hệ thống sẽ tạo tài khoản xác thực trong Firebase Auth và gán trạng thái <strong>active</strong> ngay lập tức.
                </p>
              </div>
            )}

            {/* STEP 5: LIÊN KẾT UID VỚI HỒ SƠ TƯƠNG ỨNG */}
            {createStep === 5 && (
              <div className="space-y-4 py-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Bước 5: Hoàn tất & Đồng bộ UID
                </h4>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-sm">Sẵn sàng kích hoạt tài khoản</h4>
                  <p className="text-xs text-emerald-700">
                    UID sẽ được liên kết trực tiếp với {selectedProfile ? `hồ sơ ${selectedProfile.code}` : 'hệ thống'}. Không tạo trùng lặp hồ sơ mới.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
              {createStep > 1 ? (
                <button
                  onClick={() => setCreateStep(createStep - 1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Quay lại
                </button>
              ) : (
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy bỏ
                </button>
              )}

              {createStep < 5 ? (
                <button
                  onClick={() => {
                    if (createStep === 1) {
                      if (selectedRole === 'ADMIN' && adminAuthCode.trim() !== 'MINHMUSIC@ADMIN') {
                        alert('Mã xác thực bảo mật Quản trị viên không chính xác. (Mặc định: MINHMUSIC@ADMIN)');
                        return;
                      }
                      if (selectedRole === 'MANAGER' && adminAuthCode.trim() !== 'MINHMUSIC@MANAGER' && adminAuthCode.trim() !== 'MINHMUSIC@ADMIN') {
                        alert('Mã xác thực bảo mật Quản lý Cơ sở không chính xác. (Mặc định: MINHMUSIC@MANAGER hoặc MINHMUSIC@ADMIN)');
                        return;
                      }
                      if (selectedRole === 'ACCOUNTANT' && adminAuthCode.trim() !== 'MINHMUSIC@ACCOUNTANT' && adminAuthCode.trim() !== 'MINHMUSIC@ADMIN') {
                        alert('Mã xác thực bảo mật Kế toán không chính xác. (Mặc định: MINHMUSIC@ACCOUNTANT hoặc MINHMUSIC@ADMIN)');
                        return;
                      }
                    }
                    if (createStep === 2 && !selectedProfile && !['ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(selectedRole)) {
                      alert('Vui lòng chọn một hồ sơ trong hệ thống để liên kết.');
                      return;
                    }
                    if (createStep === 3 && !accountEmail.trim()) {
                      alert('Vui lòng nhập Email.');
                      return;
                    }
                    setCreateStep(createStep + 1);
                  }}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  id="btn-confirm-create-account"
                  onClick={handleCompleteAccountCreation}
                  className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận & Hoàn Tất</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT & DUYỆT ĐƠN ĐĂNG KÝ */}
      {viewingDetailAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                    Hồ Sơ Đăng Ký Tài Khoản
                  </h3>
                  <p className="text-xs text-slate-500">
                    Vai trò: <strong>{viewingDetailAccount.role}</strong> • Trạng thái: <strong>{viewingDetailAccount.status}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingDetailAccount(null)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Detail Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Họ và tên:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{viewingDetailAccount.displayName}</span>
                {viewingDetailAccount.nickname && (
                  <span className="text-slate-500 text-xs block">Biệt danh: {viewingDetailAccount.nickname}</span>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Tên đăng nhập:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  @{viewingDetailAccount.username || viewingDetailAccount.email.split('@')[0]}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Gmail / Email:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewingDetailAccount.email}</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Số điện thoại:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{viewingDetailAccount.phone || 'Chưa cập nhật'}</span>
              </div>

              {viewingDetailAccount.birthDate && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Ngày sinh:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{viewingDetailAccount.birthDate}</span>
                </div>
              )}

              {(viewingDetailAccount.nationality || viewingDetailAccount.ethnicity) && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Quốc tịch / Dân tộc:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {viewingDetailAccount.nationality || 'Việt Nam'} • {viewingDetailAccount.ethnicity || 'Kinh'}
                  </span>
                </div>
              )}

              {viewingDetailAccount.address && (
                <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Địa chỉ thường trú:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{viewingDetailAccount.address}</span>
                </div>
              )}
            </div>

            {/* If Student Under 16 or Guardian info */}
            {viewingDetailAccount.guardianName && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Thông tin Người Giám Hộ / Ba Mẹ {viewingDetailAccount.isUnder16 ? '(Học viên < 16 tuổi)' : ''}:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div><strong>Họ tên:</strong> {viewingDetailAccount.guardianName}</div>
                  <div><strong>Số điện thoại:</strong> {viewingDetailAccount.guardianPhone || '—'}</div>
                  <div><strong>Mối quan hệ:</strong> {viewingDetailAccount.guardianRelation || 'Phụ huynh'}</div>
                  <div><strong>Năm sinh:</strong> {viewingDetailAccount.guardianBirthYear || '—'}</div>
                </div>
              </div>
            )}

            {/* Note */}
            {viewingDetailAccount.note && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                <strong>Ghi chú:</strong> {viewingDetailAccount.note}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  updateAccountStatus(viewingDetailAccount.uid, 'rejected');
                  setViewingDetailAccount(null);
                  showToast(`Đã từ chối đơn đăng ký của ${viewingDetailAccount.displayName}`);
                }}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
              >
                Từ chối đơn
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const acc = viewingDetailAccount;
                    setViewingDetailAccount(null);
                    setLinkingAccount(acc);
                  }}
                  className="px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-xl cursor-pointer"
                >
                  Gán vào Hồ sơ có sẵn
                </button>
                <button
                  onClick={() => {
                    const acc = viewingDetailAccount;
                    let studentId = acc.studentProfileId || acc.profileId;
                    let studentCode = acc.profileCode;
                    let studentName = acc.profileName || acc.displayName;

                    if (acc.role === 'STUDENT' && !studentId) {
                      const existing = students.find(s => 
                        (s.email && s.email.toLowerCase() === acc.email.toLowerCase()) ||
                        (acc.phone && s.phone && s.phone.replace(/\D+/g, '') === acc.phone.replace(/\D+/g, ''))
                      );
                      if (existing) {
                        studentId = existing.id;
                        studentCode = existing.code;
                        studentName = existing.fullName;
                      } else {
                        const newStudentId = `stu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
                        const newCode = `HV${String(students.length + 1).padStart(3, '0')}`;
                        addStudent({
                          id: newStudentId,
                          code: newCode,
                          fullName: acc.displayName,
                          email: acc.email,
                          phone: acc.phone,
                          birthDate: acc.birthDate || '2015-01-01',
                          gender: acc.gender || 'Khác',
                          guardianName: acc.guardianName,
                          guardianPhone: acc.guardianPhone,
                          address: acc.address,
                          enrolledSubjects: ['Piano'],
                          status: 'active',
                          totalLessons: 24,
                          completedLessons: 0,
                          remainingLessons: 24,
                          stars: 20,
                          totalStars: 20,
                          rewardPoints: 20
                        });
                        studentId = newStudentId;
                        studentCode = newCode;
                        studentName = acc.displayName;
                      }
                      linkAccountToProfile(acc.uid, studentId, studentName, studentCode || '');
                    } else {
                      updateAccountStatus(acc.uid, 'active');
                    }

                    setViewingDetailAccount(null);
                    showToast(`Đã DUYỆT THÀNH CÔNG và kích hoạt tài khoản cho ${acc.displayName}! Mã: ${studentCode || acc.username || acc.email}`);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Phê Duyệt & Kích Hoạt Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DUYỆT & GÁN HỒ SƠ CHO TÀI KHOẢN TỰ ĐĂNG KÝ */}
      {linkingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Duyệt & Gán Hồ Sơ Cho Tài Khoản Tự Đăng Ký
              </h3>
              <button onClick={() => setLinkingAccount(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 border border-amber-200">
                <p>Tài khoản: <strong>{linkingAccount.displayName}</strong> ({linkingAccount.email})</p>
                <p>Vai trò đăng ký: <strong>{linkingAccount.role}</strong></p>
              </div>

              <label className="block text-xs font-bold text-slate-700">Chọn hồ sơ trong hệ thống để gán:</label>
              
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {(linkingAccount.role === 'STUDENT' ? students : guardians).map((item: any) => {
                  const isSelected = linkTargetProfile?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setLinkTargetProfile(item)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                        isSelected ? 'bg-indigo-50 border-indigo-400 font-bold' : 'hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <span className="text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded text-[10px] mr-2">
                          {item.code}
                        </span>
                        <span>{item.fullName}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setLinkingAccount(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmLinkPending}
                disabled={!linkTargetProfile}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                Duyệt & Kích Hoạt Tài Khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NHẬP DỮ LIỆU TỰ ĐỘNG TỪ EXCEL / CSV */}
      <ImportAccountsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
        defaultType={importDefaultType}
      />
    </div>
  );
};
