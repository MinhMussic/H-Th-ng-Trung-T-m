import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdminMenuTab } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  Star,
  Users,
  GraduationCap,
  HeartHandshake,
  Cake,
  ShieldCheck,
  Music,
  BookOpen,
  School,
  DoorOpen,
  Sliders,
  CalendarDays,
  CheckSquare,
  RefreshCw,
  Clock,
  Sparkles,
  FileText,
  TrendingUp,
  Award,
  Gift,
  Trophy,
  CreditCard,
  Receipt,
  Bell,
  BarChart3,
  FileSpreadsheet,
  MapPin,
  Settings,
  Palette,
  ChevronRight,
  User,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  MoveHorizontal,
  ChevronsRight
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: AdminMenuTab;
  onSelectTab: (tab: AdminMenuTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const STORAGE_WIDTH_KEY = 'minh_music_sidebar_width';
const STORAGE_COLLAPSED_KEY = 'minh_music_sidebar_collapsed';
const STORAGE_FLOATING_KEY = 'minh_music_sidebar_floating';

const MIN_WIDTH = 220;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 264;
const COLLAPSED_WIDTH = 72;

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  isOpen = false, 
  onClose 
}) => {
  const { getTodayBirthdays, branding } = useData();
  const { accounts } = useAuth();
  const { currentPalette } = useTheme();

  // Width & State management with localStorage persistence
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WIDTH_KEY);
      const parsed = saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
      return isNaN(parsed) ? DEFAULT_WIDTH : Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed));
    } catch {
      return DEFAULT_WIDTH;
    }
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isFloatingMode, setIsFloatingMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_FLOATING_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const [showWidthTooltip, setShowWidthTooltip] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchCurrentX, setTouchCurrentX] = useState<number | null>(null);

  const sidebarRef = useRef<HTMLElement>(null);
  const dragStartXRef = useRef<number>(0);
  const dragStartWidthRef = useRef<number>(sidebarWidth);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WIDTH_KEY, sidebarWidth.toString());
    } catch {}
  }, [sidebarWidth]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COLLAPSED_KEY, isCollapsed.toString());
    } catch {}
  }, [isCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FLOATING_KEY, isFloatingMode.toString());
    } catch {}
  }, [isFloatingMode]);

  // Handle Dragging via Mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartXRef.current;
      const newWidth = dragStartWidthRef.current + deltaX;

      if (newWidth < 130) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
        setSidebarWidth(clampedWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Handle Dragging / Resizing via Touch on Resizer Bar
  const handleTouchResizeStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartXRef.current = touch.clientX;
    dragStartWidthRef.current = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length !== 1) return;
      const currentTouch = moveEvent.touches[0];
      const deltaX = currentTouch.clientX - dragStartXRef.current;
      const newWidth = dragStartWidthRef.current + deltaX;

      if (newWidth < 130) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
        setSidebarWidth(clampedWidth);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
  };

  // Touch Swipe Gesture for Mobile / Tablet to Slide in / out
  const handleSidebarTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      setTouchCurrentX(e.touches[0].clientX);
    }
  };

  const handleSidebarTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null && e.touches.length === 1) {
      setTouchCurrentX(e.touches[0].clientX);
    }
  };

  const handleSidebarTouchEnd = () => {
    if (touchStartX !== null && touchCurrentX !== null) {
      const diffX = touchCurrentX - touchStartX;
      // If swiped left by more than 60px -> close/slide away
      if (diffX < -60) {
        if (onClose) onClose();
      }
    }
    setTouchStartX(null);
    setTouchCurrentX(null);
  };

  const todayBirthdaysCount = getTodayBirthdays().length;
  const pendingAccountsCount = accounts.filter(a => a.status === 'pending').length;

  const menuSections = [
    {
      groupTitle: 'TỔNG QUAN',
      items: [
        { id: 'dashboard' as AdminMenuTab, label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'events' as AdminMenuTab, label: 'Lịch Sự Kiện & Biểu Diễn', icon: CalendarDays, badge: 'Mới', badgeColor: 'bg-amber-500 text-white font-bold' },
        { id: 'star_ranking' as AdminMenuTab, label: 'Bảng Xếp Hạng Sao', icon: Star, badge: 'Hot' }
      ]
    },
    {
      groupTitle: 'NHÂN SỰ & HỌC VIÊN',
      items: [
        { id: 'students' as AdminMenuTab, label: 'Học viên', icon: GraduationCap },
        { id: 'teachers' as AdminMenuTab, label: 'Giáo viên', icon: Users },
        { id: 'guardians' as AdminMenuTab, label: 'Phụ huynh & Người giám hộ', icon: HeartHandshake },
        { 
          id: 'birthdays' as AdminMenuTab, 
          label: 'Sinh nhật', 
          icon: Cake, 
          badge: todayBirthdaysCount > 0 ? `${todayBirthdaysCount} hôm nay` : undefined,
          badgeColor: 'bg-rose-500 text-white animate-pulse'
        },
        { 
          id: 'accounts' as AdminMenuTab, 
          label: 'Tài khoản & Phân quyền', 
          icon: ShieldCheck,
          badge: pendingAccountsCount > 0 ? `${pendingAccountsCount} chờ duyệt` : undefined,
          badgeColor: 'bg-amber-500 text-white'
        }
      ]
    },
    {
      groupTitle: 'ĐÀO TẠO',
      items: [
        { id: 'subjects' as AdminMenuTab, label: 'Môn học', icon: Music },
        { id: 'courses' as AdminMenuTab, label: 'Khóa học', icon: BookOpen },
        { id: 'classes' as AdminMenuTab, label: 'Lớp học', icon: School },
        { id: 'rooms' as AdminMenuTab, label: 'Phòng học', icon: DoorOpen, badge: 'Mới' },
        { id: 'levels' as AdminMenuTab, label: 'Cấu hình trình độ', icon: Sliders },
        { id: 'schedules' as AdminMenuTab, label: 'Lịch học', icon: CalendarDays },
        { id: 'attendance' as AdminMenuTab, label: 'Điểm danh', icon: CheckSquare },
        { id: 'makeup' as AdminMenuTab, label: 'Học bù', icon: RefreshCw },
        { id: 'reservations' as AdminMenuTab, label: 'Bảo lưu', icon: Clock },
        { id: 'trial' as AdminMenuTab, label: 'Học thử', icon: Sparkles }
      ]
    },
    {
      groupTitle: 'HỌC TẬP',
      items: [
        { id: 'assignments' as AdminMenuTab, label: 'Bài tập', icon: FileText },
        { id: 'progress' as AdminMenuTab, label: 'Tiến độ', icon: TrendingUp },
        { id: 'star_ranking' as AdminMenuTab, label: 'Bảng vinh danh Pro', icon: Trophy, badge: 'Top 3 👑', badgeColor: 'bg-amber-400 text-slate-950 font-black' },
        { id: 'rewards' as AdminMenuTab, label: 'Đổi quà', icon: Gift },
        { id: 'achievements' as AdminMenuTab, label: 'Thành tích', icon: Award }
      ]
    },
    {
      groupTitle: 'TÀI CHÍNH & HỆ THỐNG',
      items: [
        { id: 'tuition' as AdminMenuTab, label: 'Học phí & QR', icon: CreditCard },
        { id: 'tax_report' as AdminMenuTab, label: 'Kê khai Thuế & Doanh thu', icon: Receipt, badge: 'Mẫu 01', badgeColor: 'bg-sky-500 text-white font-bold' },
        { id: 'notifications' as AdminMenuTab, label: 'Thông báo', icon: Bell },
        { id: 'reports' as AdminMenuTab, label: 'Báo cáo', icon: BarChart3 },
        { id: 'sheets_sync' as AdminMenuTab, label: 'Đồng bộ Google Sheets', icon: FileSpreadsheet },
        { id: 'branding' as AdminMenuTab, label: 'Cấu hình Thương hiệu & Màu sắc', icon: Palette, badge: 'Đa cơ sở', badgeColor: 'bg-amber-500/20 text-amber-300' },
        { id: 'branches_map' as AdminMenuTab, label: 'Bản đồ cơ sở & Vị trí', icon: MapPin },
        { id: 'profile' as AdminMenuTab, label: 'Hồ sơ cá nhân của tôi', icon: User, badge: 'Hồ sơ', badgeColor: 'bg-indigo-500/20 text-indigo-300' },
        { id: 'settings' as AdminMenuTab, label: 'Cài đặt & Chia sẻ', icon: Settings }
      ]
    }
  ];

  const handleItemClick = (id: AdminMenuTab) => {
    onSelectTab(id);
    if (onClose) {
      onClose();
    }
  };

  const effectiveWidth = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Floating Overlay Backdrop for desktop if user enables Floating Mode */}
      {isFloatingMode && !isCollapsed && (
        <div 
          onClick={() => setIsCollapsed(true)}
          className="hidden lg:block fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside 
        ref={sidebarRef}
        onTouchStart={handleSidebarTouchStart}
        onTouchMove={handleSidebarTouchMove}
        onTouchEnd={handleSidebarTouchEnd}
        style={{
          width: `${effectiveWidth}px`,
          minWidth: `${effectiveWidth}px`,
          maxWidth: `${effectiveWidth}px`
        }}
        className={`
          fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col justify-between select-none
          border-r border-slate-800 shadow-2xl transition-[width,transform] ${isDragging ? 'duration-0' : 'duration-200'} ease-out
          ${isFloatingMode ? 'lg:fixed lg:top-0 lg:bottom-0 lg:z-40 lg:shadow-2xl' : 'lg:static lg:z-auto lg:shadow-none'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header */}
        <div className="px-3.5 py-3.5 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
              <BrandLogo 
                size="sm" 
                collapsed={true} 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="cursor-pointer shrink-0"
              />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <span className="font-heading font-black text-white text-base tracking-wide whitespace-nowrap block animate-in fade-in duration-200">
                    {branding?.centerName || 'MINH MUSIC'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase block whitespace-nowrap">
                    {branding?.subName || 'Hệ Thống Quản Trị'}
                  </span>
                </div>
              )}
            </div>

            {/* Single Toggle Collapse/Expand Button on Desktop & Close on Mobile */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Desktop 1-Click Toggle Expand/Collapse */}
              <button
                id="btn-sidebar-collapse-toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title={isCollapsed ? 'Mở rộng thanh menu (Sidebar)' : 'Thu gọn thanh menu (Sidebar)'}
                aria-label="Toggle Sidebar"
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-amber-400" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={onClose}
                className="flex lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Đóng menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable menu items */}
        <div className="py-2.5 px-2 space-y-4 overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 flex items-center justify-between">
                  <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-heading">
                    {section.groupTitle}
                  </h3>
                </div>
              )}
              {isCollapsed && (
                <div className="h-px bg-slate-800 mx-2 my-1.5" />
              )}
              <div className="space-y-0.5 pt-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-item-${item.id}`}
                      onClick={() => handleItemClick(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-2.5 py-2'} rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                        isActive
                          ? 'text-white shadow-md font-bold ring-1'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                      style={isActive ? {
                        background: `linear-gradient(135deg, ${currentPalette.gradientFrom}, ${currentPalette.gradientTo})`,
                        boxShadow: `0 4px 12px -2px ${currentPalette.primaryColor}50`,
                        borderColor: `${currentPalette.primaryColor}80`
                      } : undefined}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-amber-400'}`} />
                        {!isCollapsed && <span className="truncate text-left">{item.label}</span>}
                      </div>

                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {item.badge && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${item.badgeColor || 'bg-amber-500/20 text-amber-300'}`}>
                              {item.badge}
                            </span>
                          )}
                          {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Streamlined Footer Info (Theme & Palette controls relocated to Branding & System Settings) */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">
                  {branding?.centerName || 'Minh Music'} HQ
                </span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Trực tuyến
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Rộng: {sidebarWidth}px</span>
                <span className="font-mono">v2.5 Pro</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Hệ thống trực tuyến"></span>
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-xl text-amber-400 hover:bg-slate-800 transition-all cursor-pointer"
                title="Mở rộng menu (trượt sang phải)"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* --- TACTILE RESIZE & SLIDE DRAG HANDLE ON RIGHT BORDER --- */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchResizeStart}
          onDoubleClick={() => setIsCollapsed(!isCollapsed)}
          onMouseEnter={() => setShowWidthTooltip(true)}
          onMouseLeave={() => setShowWidthTooltip(false)}
          className={`
            hidden lg:flex absolute top-0 right-0 -mr-1.5 w-3.5 h-full z-50 cursor-col-resize items-center justify-center
            group select-none transition-colors
            ${isDragging ? 'bg-amber-500/30' : 'hover:bg-amber-500/20'}
          `}
          title="Kéo sang trái/phải để trượt thay đổi kích thước thanh menu (Nhấn đúp để thu gọn/mở rộng)"
        >
          {/* Visual Grip Handle */}
          <div className={`
            w-1.5 h-14 rounded-full transition-all duration-150 flex items-center justify-center
            ${isDragging ? 'bg-amber-500 scale-y-125 shadow-lg shadow-amber-500/50' : 'bg-slate-700 group-hover:bg-amber-400'}
          `}>
            <div className="w-0.5 h-6 bg-slate-900 rounded-full opacity-60" />
          </div>

          {/* Width Tooltip while hovering or dragging */}
          {(showWidthTooltip || isDragging) && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-950 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl border border-amber-500/40 pointer-events-none whitespace-nowrap z-50 animate-in fade-in flex items-center gap-1.5">
              <MoveHorizontal className="w-3 h-3 text-amber-400" />
              <span>{isCollapsed ? 'Thu gọn (72px)' : `${sidebarWidth}px`}</span>
              <span className="text-[10px] text-slate-400 font-normal">| Kéo để trượt</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
