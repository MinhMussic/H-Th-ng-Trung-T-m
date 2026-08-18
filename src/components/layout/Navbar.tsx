import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData, filterNotificationsForUser } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../context/SoundContext';
import { UserRole } from '../../types';
import { UserProfileModal } from '../profile/UserProfileModal';
import { ThemeCustomizerModal } from '../theme/ThemeCustomizerModal';
import { GlobalSearchBar } from './GlobalSearchBar';
import { BrandLogo } from '../common/BrandLogo';
import { 
  Music, 
  Cake, 
  Bell, 
  LogOut, 
  User, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Users, 
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Award,
  Headphones,
  Mic,
  Radio,
  Building,
  UserCheck,
  Sun,
  Moon,
  Gift,
  HeartHandshake,
  Check,
  Layers,
  Settings,
  ArrowRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MousePointerClick,
  Sliders,
  Palette,
  Receipt,
  Building2
} from 'lucide-react';

interface NavbarProps {
  onNavigateToTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateToTab, onNavigate, onToggleSidebar }) => {
  const navigateTo = (tab: string) => {
    if (typeof onNavigateToTab === 'function') {
      onNavigateToTab(tab);
    } else if (typeof onNavigate === 'function') {
      onNavigate(tab);
    }
  };

  const { currentUser, role, activeRole, userRoles, switchActiveRole, switchRole, logout } = useAuth();
  const { getTodayBirthdays, notifications, markNotificationRead, branding, branches, activeBranchId } = useData();
  const { isDark, toggleTheme, currentPalette, isThemeModalOpen, openThemeModal, closeThemeModal } = useTheme();
  const { isSoundEnabled, toggleSound, isMusicPlaying, toggleMusic, currentTrack } = useSound();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'info' | 'avatar' | 'related' | 'security' | 'audio' | 'theme'>('info');

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentActiveRole = (activeRole || role || 'ADMIN').toUpperCase() as UserRole;
  const isStaff = ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'TEACHER'].includes(currentActiveRole);

  // Birthdays: ONLY for Admin and Teachers so students are surprised with greetings
  const todayBirthdays = isStaff ? (getTodayBirthdays ? getTodayBirthdays() : []) || [] : [];
  
  // Filter notifications based on role and identity (strictly hiding internal birthday alerts from students/parents)
  const filteredNotifs = filterNotificationsForUser(
    notifications,
    currentUser,
    currentActiveRole,
    currentUser?.studentProfileId,
    currentUser?.linkedStudentIds || []
  );
  
  const unreadNotifs = (filteredNotifs || []).filter(n => !n.isRead);
  const totalNotifBadge = (unreadNotifs || []).length + (isStaff ? (todayBirthdays || []).length : 0);

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0];

  const roleConfigs: Record<string, { bg: string; text: string; border: string; label: string; icon: any }> = {
    ADMIN: { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', label: 'Quản trị viên', icon: ShieldCheck },
    MANAGER: { bg: 'bg-indigo-50 dark:bg-indigo-950/50', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', label: 'Quản lý Cơ sở', icon: Building2 },
    ACCOUNTANT: { bg: 'bg-cyan-50 dark:bg-cyan-950/50', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800', label: 'Kế toán / Thu ngân', icon: Receipt },
    TEACHER: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', label: 'Giáo viên', icon: BookOpen },
    STUDENT: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', label: 'Học viên', icon: GraduationCap },
    PARENT: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', label: 'Phụ huynh', icon: Users },
    GUARDIAN: { bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', label: 'Người giám hộ', icon: Users }
  };

  const currentRoleConfig = roleConfigs[currentActiveRole] || roleConfigs.ADMIN;
  const RoleIcon = currentRoleConfig.icon;

  const renderLogoIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Music': return <Music className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Headphones': return <Headphones className={className} />;
      case 'Mic': return <Mic className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'Building': return <Building className={className} />;
      default: return <Music className={className} />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* 1. GÓC TRÁI: 
              - Mobile (< 768px): Logo + "MINH MUSIC" sát mép trái (đã xóa hamburger menu)
              - Desktop (>= 768px): Thanh tìm kiếm Search Bar đặt sát bên trái (đã xóa cụm logo trùng lặp)
          */}
          <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-none">
            {/* CỤM LOGO + MINH MUSIC: CHỈ HIỆN TRÊN MOBILE (< 768px), ẨN TRÊN DESKTOP */}
            <div className="flex items-center gap-2 shrink-0 min-w-0 md:hidden">
              <BrandLogo 
                size="md"
                collapsed={true}
                className="shrink-0"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span 
                    className="text-base font-black tracking-tight font-heading dark:text-white truncate max-w-[150px]"
                    style={{ color: isDark ? '#ffffff' : (branding?.primaryColor || '#0f172a') }}
                  >
                    {branding?.centerName || 'MINH MUSIC'}
                  </span>

                  {/* Sub brand badge */}
                  <span 
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-bold border shrink-0"
                    style={{
                      backgroundColor: isDark ? '#334155' : (branding?.brandTagBg || '#fef3c7'),
                      color: isDark ? '#f8fafc' : (branding?.brandTagText || '#92400e'),
                      borderColor: (branding?.primaryColor || '#d97706') + '40'
                    }}
                  >
                    {branding?.subName || 'CENTER'}
                  </span>
                </div>
              </div>
            </div>

            {/* THANH TÌM KIẾM TRÊN DESKTOP: ĐẶT SÁT MÉP TRÁI CỦA TOP HEADER */}
            <div className="hidden md:flex items-center w-72 lg:w-96 shrink-0">
              <GlobalSearchBar onNavigate={navigateTo} />
            </div>
          </div>

          {/* 2. GÓC PHẢI:
              - Mobile (< 768px): Tìm kiếm, Chuông thông báo (🔔) và Avatar
              - Desktop (>= 768px): Chuông thông báo (🔔) và Avatar
          */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Nút Tìm kiếm nhanh cho Mobile */}
            <div className="md:hidden">
              <GlobalSearchBar onNavigate={navigateTo} />
            </div>

            {/* A. DROPDOWN THÔNG BÁO (Tích hợp Sinh nhật hôm nay cho Admin & Giáo viên) */}
            <div className="relative" ref={notifRef}>
              <button
                id="btn-nav-notifications"
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowUserDropdown(false);
                }}
                className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
                  showNotifDropdown
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }`}
                title="Thông báo & Sinh nhật"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5" />
                {totalNotifBadge > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-black text-slate-800 dark:text-slate-200">Trung Tâm Thông Báo</span>
                    </div>
                    {unreadNotifs.length > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                        {unreadNotifs.length} tin mới
                      </span>
                    )}
                  </div>

                  {/* TÍCH HỢP SINH NHẬT HÔM NAY (CHỈ ADMIN VÀ GIÁO VIÊN THẤY ĐỂ TẠO BẤT NGỜ) */}
                  {isStaff && todayBirthdays.length > 0 && (
                    <div className="mx-3 my-2.5 p-3 rounded-xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 dark:from-rose-950/50 dark:via-pink-950/40 dark:to-amber-950/40 border border-rose-200/80 dark:border-rose-800/80 shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-rose-800 dark:text-rose-300 flex items-center gap-1.5 font-heading">
                          <Cake className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-bounce" />
                          <span>Sinh nhật hôm nay ({todayBirthdays.length})</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-600 text-white font-bold">
                          Bất ngờ ✨
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-900/80 dark:text-rose-200/80 mb-2">
                        Học viên không thấy mục này. Hãy gửi lời chúc mừng & tặng quà bất ngờ cho các em:
                      </p>
                      <div className="space-y-1.5">
                        {todayBirthdays.map((b) => (
                          <div 
                            key={b.id} 
                            onClick={() => {
                              navigateTo('birthdays');
                              setShowNotifDropdown(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-rose-100 dark:border-rose-900/50 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">🎂</span>
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.fullName}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{b.code || 'HV'} • {b.enrolledSubjects?.join(', ') || 'Âm nhạc'}</p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5 hover:underline">
                              <span>Chúc mừng</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Danh sách thông báo chung */}
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredNotifs.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">Không có thông báo mới</p>
                    ) : (
                      filteredNotifs.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-amber-50/50 dark:bg-amber-950/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200">{n.title}</h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.createdAt}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{n.content || (n as any).message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 px-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button
                      onClick={() => {
                        navigateTo(currentActiveRole === 'ADMIN' ? 'notifications' : 'student_dashboard');
                        setShowNotifDropdown(false);
                      }}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Xem tất cả thông báo trung tâm →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* B. GIAO DIỆN CÁ NHÂN GÓC PHẢI (USER AVATAR MENU) 
                Tích hợp:
                - Hồ sơ cá nhân
                - Chế độ Sáng / Tối (Dark / Light mode)
                - Chuyển đổi giao diện / Đổi vai trò (Role Switcher)
                - Đăng xuất
            */}
            <div className="relative" ref={userRef}>
              <button
                id="btn-nav-user-menu"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowNotifDropdown(false);
                }}
                className={`flex items-center gap-2 p-1 rounded-2xl border transition-all cursor-pointer ${
                  showUserDropdown 
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 ring-2 ring-amber-400/30'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
                title="Tài khoản & Cài đặt giao diện"
                aria-label="Tài khoản cá nhân"
              >
                {currentUser?.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.displayName} 
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-black/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-indigo-700 text-white flex items-center justify-center text-xs font-black font-heading shadow-xs">
                    {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}

                <div className="hidden lg:block text-left pr-1.5">
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                    {currentUser?.displayName || currentUser?.email}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
                    <span>{currentRoleConfig.label}</span>
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* User Profile Header */}
                  <div 
                    onClick={() => {
                      setProfileInitialTab('info');
                      setIsProfileModalOpen(true);
                      setShowUserDropdown(false);
                    }}
                    className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors"
                    title="Bấm để xem và sửa hồ sơ cá nhân"
                  >
                    <div className="flex items-center gap-3">
                      {currentUser?.avatarUrl ? (
                        <img 
                          src={currentUser.avatarUrl} 
                          alt={currentUser.displayName} 
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400/40"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-indigo-700 text-white flex items-center justify-center text-base font-black font-heading shadow-sm">
                          {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'M'}
                        </div>
                      )}
                      <div className="overflow-hidden flex-1">
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate font-heading hover:text-amber-600 transition-colors">
                          {currentUser?.displayName || 'Người dùng'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {currentUser?.email}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`text-[10px] px-2 py-0.2 rounded-md font-extrabold border ${currentRoleConfig.bg} ${currentRoleConfig.text} ${currentRoleConfig.border}`}>
                            {currentRoleConfig.label}
                          </span>
                          {currentUser?.profileCode && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                              {currentUser.profileCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1.5 text-xs">
                    
                    {/* TÍCH HỢP CHẾ ĐỘ SÁNG / TỐI (DARK / LIGHT MODE) VÀO MENU ẢNH TÀI KHOẢN */}
                    <div className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-xl ${isDark ? 'bg-amber-400/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">Giao diện {isDark ? 'Ban đêm (Dark)' : 'Ban ngày (Light)'}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Bấm để chuyển chế độ hiển thị</p>
                        </div>
                      </div>

                      <button
                        id="btn-user-menu-theme-toggle"
                        onClick={toggleTheme}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                          isDark ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        aria-label="Chuyển đổi giao diện sáng tối"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                            isDark ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* TÍCH HỢP BẬT/TẮT ÂM THANH CLICK & NHẠC NỀN */}
                    <div className="px-3 py-2 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
                      {/* Click Sound */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">Âm thanh click chuột</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Hiệu ứng nốt nhạc khi tương tác</p>
                          </div>
                        </div>

                        <button
                          onClick={toggleSound}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                            isSoundEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          aria-label="Bật tắt âm thanh click"
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-xs ${
                              isSoundEnabled ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Ambient Music */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-amber-200/50 dark:border-amber-900/40">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <div className="max-w-[150px]">
                            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">Nhạc nền trung tâm</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {isMusicPlaying ? `Đang phát: ${currentTrack.title}` : 'Thư giãn & tập trung'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={toggleMusic}
                          className={`p-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                            isMusicPlaying 
                              ? 'bg-amber-500 text-white shadow-2xs' 
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                          title="Bật/Tắt nhạc nền"
                        >
                          {isMusicPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          <span>{isMusicPlaying ? 'Dừng' : 'Phát'}</span>
                        </button>
                      </div>
                    </div>

                    {/* TÍCH HỢP CHUYỂN ĐỔI CHẾ ĐỘ VAI TRÒ / GIAO DIỆN */}
                    {/* Nếu tài khoản có nhiều quyền (ví dụ: Admin + Giáo viên) */}
                    {userRoles && userRoles.length > 1 && (
                      <div className="p-2.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span>Chuyển chế độ hoạt động</span>
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300 font-bold">
                            {userRoles.length} vai trò
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {userRoles.map((r) => {
                            const cfg = roleConfigs[r.toUpperCase()] || roleConfigs.ADMIN;
                            const Icon = cfg.icon;
                            const isCurrent = currentActiveRole.toUpperCase() === r.toUpperCase();
                            return (
                              <button
                                key={r}
                                onClick={() => {
                                  switchActiveRole(r);
                                  setShowUserDropdown(false);
                                }}
                                className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer border ${
                                  isCurrent 
                                    ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-purple-400 shadow-2xs` 
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 truncate">
                                  <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
                                  <span className="truncate">{cfg.label}</span>
                                </div>
                                {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Nút Cài đặt Chủ đề & Màu sắc Giao diện */}
                    <button
                      id="btn-nav-open-theme-customizer"
                      onClick={() => {
                        openThemeModal();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-2xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Palette className="w-4 h-4" style={{ color: currentPalette.primaryColor }} />
                        <span>Chủ đề & Tùy chỉnh màu sắc</span>
                      </div>
                      <span
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs"
                        style={{
                          backgroundColor: currentPalette.lightBg,
                          color: isDark ? currentPalette.darkText : currentPalette.primaryColor,
                          borderColor: currentPalette.lightBorder
                        }}
                      >
                        {currentPalette.vietnameseName}
                      </span>
                    </button>

                    {/* Nút Cài đặt hồ sơ & Đổi Avatar */}
                    <button
                      id="btn-nav-open-profile"
                      onClick={() => {
                        setProfileInitialTab('info');
                        setIsProfileModalOpen(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Hồ sơ cá nhân & Đổi ảnh đại diện</span>
                    </button>

                    {/* Nút Cài đặt Âm thanh & Nhạc nền Studio */}
                    <button
                      id="btn-nav-open-audio-settings"
                      onClick={() => {
                        setProfileInitialTab('audio');
                        setIsProfileModalOpen(true);
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Cài đặt âm thanh & Nhạc nền</span>
                    </button>

                    {/* Nút Cài đặt hệ thống (nếu là Admin) */}
                    {role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          navigateTo('settings');
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                        <span>Cài đặt hệ thống & Giao diện</span>
                      </button>
                    )}

                    {/* Nút Đăng xuất */}
                    <button
                      id="btn-logout"
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        initialTab={profileInitialTab}
        onClose={() => setIsProfileModalOpen(false)} 
      />

      {/* Global Theme Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={closeThemeModal}
      />
    </header>
  );
};
