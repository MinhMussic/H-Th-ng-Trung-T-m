import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  GraduationCap, 
  CalendarDays, 
  Award, 
  User, 
  CreditCard,
  BookOpen,
  Users,
  Menu,
  Sparkles,
  Gift
} from 'lucide-react';
import { AdminMenuTab } from '../../types';
import { STUDENT_NAV_CONFIG, PARENT_NAV_CONFIG, TEACHER_NAV_CONFIG } from '../../config/navigationData';

interface BottomNavProps {
  activeMainMenu?: string;
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
  onSelectMainMenu?: (mainId: string) => void;
  onOpenSidebar?: () => void;
  onOpenProfile?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeMainMenu,
  activeTab,
  onSelectTab,
  onSelectMainMenu,
  onOpenSidebar,
  onOpenProfile
}) => {
  const { role, activeRole } = useAuth();
  const { isDark, currentPalette } = useTheme();
  const currentRole = (activeRole || role || 'ADMIN').toUpperCase();

  const handleSelectMain = (mainId: string, defaultAction?: () => void) => {
    if (defaultAction) {
      defaultAction();
      return;
    }
    if (onSelectMainMenu) {
      onSelectMainMenu(mainId);
    } else if (onSelectTab) {
      onSelectTab(mainId);
    }
  };

  const currentActive = activeMainMenu || activeTab || 'dashboard';

  // 1. ADMIN / MANAGER / ACCOUNTANT ROLE BOTTOM BAR
  if (currentRole === 'ADMIN' || currentRole === 'MANAGER' || currentRole === 'ACCOUNTANT') {
    const adminNavItems = currentRole === 'ACCOUNTANT' ? [
      { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { id: 'tuition', label: 'Học phí', icon: CreditCard },
      { id: 'tax_report', label: 'Thuế & BC', icon: BookOpen },
      { id: 'students', label: 'Học viên', icon: GraduationCap },
      { id: 'menu_drawer', label: 'Menu', icon: Menu, isAction: true }
    ] : [
      { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
      { id: 'attendance', label: 'Điểm danh', icon: CheckSquare },
      { id: 'students', label: 'Học viên', icon: GraduationCap },
      { id: 'tuition', label: 'Học phí', icon: CreditCard },
      { id: 'menu_drawer', label: 'Menu', icon: Menu, isAction: true }
    ];

    return (
      <nav 
        id="mobile-bottom-nav-admin"
        aria-label="Thanh điều hướng dưới quản trị"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1 lg:hidden safe-area-pb"
      >
        <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActive === item.id;

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  id={`btn-bottom-nav-${item.id}`}
                  onClick={onOpenSidebar}
                  className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 active:scale-95 transition-all min-h-[48px] min-w-[54px] cursor-pointer"
                  title="Mở toàn bộ danh mục quản trị"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-[56px] text-center">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                id={`btn-bottom-nav-${item.id}`}
                onClick={() => handleSelectMain(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all min-h-[48px] min-w-[54px] cursor-pointer relative ${
                  isActive 
                    ? 'font-extrabold shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95'
                }`}
                style={isActive ? {
                  backgroundColor: currentPalette.lightBg,
                  color: isDark ? currentPalette.darkText : currentPalette.primaryColor
                } : undefined}
              >
                <Icon 
                  className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} 
                  style={isActive ? { color: isDark ? currentPalette.darkText : currentPalette.primaryColor } : undefined}
                />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] text-center font-bold">
                  {item.label}
                </span>
                {isActive && (
                  <span 
                    className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: currentPalette.primaryColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // 2. TEACHER ROLE BOTTOM BAR
  if (currentRole === 'TEACHER') {
    const teacherNavItems = [
      { id: 'dashboard', label: 'Bàn dạy', icon: LayoutDashboard },
      { id: 'attendance', label: 'Điểm danh', icon: CheckSquare },
      { id: 'schedule', label: 'Lịch dạy', icon: CalendarDays },
      { id: 'classes', label: 'Lớp học', icon: Users },
      { id: 'profile', label: 'Hồ sơ', icon: User, action: onOpenProfile }
    ];

    return (
      <nav 
        id="mobile-bottom-nav-teacher"
        aria-label="Thanh điều hướng giáo viên"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1 lg:hidden safe-area-pb"
      >
        <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
          {teacherNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActive === item.id;

            return (
              <button
                key={item.id}
                id={`btn-bottom-nav-teacher-${item.id}`}
                onClick={() => handleSelectMain(item.id, item.action)}
                className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all min-h-[48px] min-w-[54px] cursor-pointer relative ${
                  isActive 
                    ? 'font-extrabold shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95'
                }`}
                style={isActive ? {
                  backgroundColor: currentPalette.lightBg,
                  color: isDark ? currentPalette.darkText : currentPalette.primaryColor
                } : undefined}
              >
                <Icon 
                  className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} 
                  style={isActive ? { color: isDark ? currentPalette.darkText : currentPalette.primaryColor } : undefined}
                />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] text-center font-bold">
                  {item.label}
                </span>
                {isActive && (
                  <span 
                    className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: currentPalette.primaryColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // 3. STUDENT & PARENT ROLE BOTTOM BAR (5 standard 2-level main categories)
  const navConfig = (currentRole === 'PARENT' || currentRole === 'GUARDIAN') ? PARENT_NAV_CONFIG : STUDENT_NAV_CONFIG;
  
  const bottomItems = navConfig.map(m => ({
    id: m.id,
    label: m.id === 'rewards' ? 'Đổi quà ⭐' : m.label.replace(' của con', '').replace(' Phụ huynh', '').replace(' & VietQR', ''),
    icon: m.icon
  }));

  return (
    <nav 
      id="mobile-bottom-nav-student"
      aria-label="Thanh điều hướng học viên và phụ huynh"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1 lg:hidden safe-area-pb"
    >
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentActive === item.id;

          return (
            <button
              key={item.id}
              id={`btn-bottom-nav-student-${item.id}`}
              onClick={() => handleSelectMain(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all min-h-[48px] min-w-[54px] cursor-pointer relative ${
                isActive 
                  ? 'font-extrabold shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95'
              }`}
              style={isActive ? {
                backgroundColor: currentPalette.lightBg,
                color: isDark ? currentPalette.darkText : currentPalette.primaryColor
              } : undefined}
            >
              <Icon 
                className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} 
                style={isActive ? { color: isDark ? currentPalette.darkText : currentPalette.primaryColor } : undefined}
              />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px] text-center font-bold">
                {item.label}
              </span>
              {isActive && (
                <span 
                  className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: currentPalette.primaryColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};


