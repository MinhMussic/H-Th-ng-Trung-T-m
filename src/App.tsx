import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';
import { AdminMenuTab } from './types';
import { STUDENT_NAV_CONFIG, PARENT_NAV_CONFIG } from './config/navigationData';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { BottomNav } from './components/layout/BottomNav';

// Admin Modules
import { DashboardOverview } from './components/admin/DashboardOverview';
import { EventsManagement } from './components/admin/EventsManagement';
import { BirthdayModule } from './components/admin/BirthdayModule';
import { AccountsManagement } from './components/admin/AccountsManagement';
import { GuardiansManagement } from './components/admin/GuardiansManagement';
import { StudentsManagement } from './components/admin/StudentsManagement';
import { TeachersManagement } from './components/admin/TeachersManagement';
import { ClassesCoursesManagement } from './components/admin/ClassesCoursesManagement';
import { AttendanceManagement } from './components/admin/AttendanceManagement';
import { LearningGamification } from './components/admin/LearningGamification';
import { FinanceAndSettings } from './components/admin/FinanceAndSettings';
import { UserProfileView } from './components/profile/UserProfileView';

// Role-Specific Portals
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';

// Auth Views
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { InAppPushBanner } from './components/common/InAppPushBanner';

const MainApp: React.FC = () => {
  const { currentUser, currentRole, isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Navigation State for Admin / Manager / Accountant
  const [activeTab, setActiveTab] = useState<AdminMenuTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2-Level Navigation State for Student & Parent
  const [studentMainMenu, setStudentMainMenu] = useState<string>('learning');
  const [studentSubMenu, setStudentSubMenu] = useState<string>('overview_assignments');
  const [parentMainMenu, setParentMainMenu] = useState<string>('learning');
  const [parentSubMenu, setParentSubMenu] = useState<string>('progress_overview');

  // Main scrollable container reference
  const mainContainerRef = useRef<HTMLElement | null>(null);

  // Smooth scroll to top function
  const scrollToTop = useCallback(() => {
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // 1. DEFAULT AFTER LOGIN / ROLE CHANGE:
  // Always reset to the default Overview/Dashboard of the corresponding role
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const normalizedRole = (currentRole || 'ADMIN').toUpperCase();
      if (normalizedRole === 'STUDENT') {
        setStudentMainMenu('learning');
        setStudentSubMenu('overview_assignments');
      } else if (normalizedRole === 'PARENT' || normalizedRole === 'GUARDIAN') {
        setParentMainMenu('learning');
        setParentSubMenu('progress_overview');
      } else {
        // Admin, Manager, Accountant, Teacher
        setActiveTab('dashboard');
      }
      setIsSidebarOpen(false);
      scrollToTop();
    }
  }, [isAuthenticated, currentUser?.uid, currentRole, scrollToTop]);

  // 2. SCROLL TO TOP ON NAVIGATION:
  // Whenever the active tab / main menu / sub menu changes, scroll smoothly to the top
  useEffect(() => {
    scrollToTop();
  }, [activeTab, studentMainMenu, studentSubMenu, parentMainMenu, parentSubMenu, scrollToTop]);

  // Unified Admin Tab Change Handler
  const handleAdminTabChange = (newTab: AdminMenuTab) => {
    setActiveTab(newTab);
    setIsSidebarOpen(false);
    scrollToTop();
  };

  // Unified Student Main Menu Change Handler
  const handleStudentMainMenuChange = (mainId: string) => {
    setStudentMainMenu(mainId);
    const cfg = STUDENT_NAV_CONFIG.find(m => m.id === mainId) || STUDENT_NAV_CONFIG[0];
    const defaultSub = cfg?.defaultSubId || cfg?.subItems?.[0]?.id || 'overview_assignments';
    setStudentSubMenu(defaultSub);
    scrollToTop();
  };

  // Unified Student Sub Menu Change Handler
  const handleStudentSubMenuChange = (subId: string) => {
    setStudentSubMenu(subId);
    scrollToTop();
  };

  // Unified Parent Main Menu Change Handler
  const handleParentMainMenuChange = (mainId: string) => {
    setParentMainMenu(mainId);
    const cfg = PARENT_NAV_CONFIG.find(m => m.id === mainId) || PARENT_NAV_CONFIG[0];
    const defaultSub = cfg?.defaultSubId || cfg?.subItems?.[0]?.id || 'progress_overview';
    setParentSubMenu(defaultSub);
    scrollToTop();
  };

  // Unified Parent Sub Menu Change Handler
  const handleParentSubMenuChange = (subId: string) => {
    setParentSubMenu(subId);
    scrollToTop();
  };

  // If user is not authenticated, show Login or Register view
  if (!isAuthenticated || !currentUser) {
    if (authMode === 'register') {
      return <RegisterView onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <LoginView onSwitchToRegister={() => setAuthMode('register')} />;
  }

  const roleUpper = (currentRole || 'ADMIN').toUpperCase();

  // Render Role-specific views
  const renderRoleContent = () => {
    switch (roleUpper) {
      case 'TEACHER':
        const teacherTab = (activeTab as string) === 'salary' ? 'salary' : (activeTab as string) === 'honor' ? 'honor' : 'overview';
        return (
          <div className="h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col overflow-hidden">
            <Navbar 
              onToggleSidebar={() => {}} 
              onNavigate={(tab) => handleAdminTabChange(tab as AdminMenuTab)} 
            />
            <main 
              ref={mainContainerRef}
              className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto overflow-x-hidden pb-20 lg:pb-8 scroll-smooth"
            >
              <TeacherDashboard initialTab={teacherTab} />
            </main>
            <BottomNav 
              activeTab={activeTab} 
              onSelectTab={(tab) => handleAdminTabChange(tab as AdminMenuTab)} 
            />
          </div>
        );

      case 'STUDENT':
        return (
          <div className="h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col overflow-hidden">
            <Navbar 
              onToggleSidebar={() => {}} 
              onNavigate={(tab) => handleAdminTabChange(tab as AdminMenuTab)} 
            />
            <main 
              ref={mainContainerRef}
              className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto overflow-x-hidden pb-20 lg:pb-8 scroll-smooth"
            >
              <StudentDashboard 
                activeMainMenu={studentMainMenu}
                activeSubMenu={studentSubMenu}
                onMainMenuChange={handleStudentMainMenuChange}
                onSubMenuChange={handleStudentSubMenuChange}
              />
            </main>
            <BottomNav 
              activeMainMenu={studentMainMenu}
              onSelectMainMenu={handleStudentMainMenuChange}
            />
          </div>
        );

      case 'PARENT':
      case 'GUARDIAN':
        return (
          <div className="h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col overflow-hidden">
            <Navbar 
              onToggleSidebar={() => {}} 
              onNavigate={(tab) => handleAdminTabChange(tab as AdminMenuTab)} 
            />
            <main 
              ref={mainContainerRef}
              className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto overflow-x-hidden pb-20 lg:pb-8 scroll-smooth"
            >
              <ParentDashboard 
                activeMainMenu={parentMainMenu}
                activeSubMenu={parentSubMenu}
                onSelectMainMenu={handleParentMainMenuChange}
                onSelectSubMenu={handleParentSubMenuChange}
              />
            </main>
            <BottomNav 
              activeMainMenu={parentMainMenu}
              onSelectMainMenu={handleParentMainMenuChange}
            />
          </div>
        );

      case 'ADMIN':
      case 'MANAGER':
      case 'ACCOUNTANT':
      default:
        return (
          <div className="h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar
              activeTab={activeTab}
              onSelectTab={handleAdminTabChange}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Admin Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
              <Navbar
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onNavigate={(tab) => handleAdminTabChange(tab as AdminMenuTab)}
              />

              <main 
                ref={mainContainerRef}
                className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto overflow-x-hidden pb-20 lg:pb-8 scroll-smooth"
              >
                {/* Router based on activeTab */}
                {activeTab === 'dashboard' && (
                  <DashboardOverview 
                    onNavigateTab={handleAdminTabChange} 
                    onNavigate={handleAdminTabChange} 
                  />
                )}

                {activeTab === 'events' && <EventsManagement />}
                {activeTab === 'birthdays' && <BirthdayModule />}
                {activeTab === 'accounts' && <AccountsManagement />}
                {activeTab === 'guardians' && <GuardiansManagement />}
                {activeTab === 'students' && <StudentsManagement />}
                {activeTab === 'teachers' && <TeachersManagement />}

                {/* Training section */}
                {activeTab === 'subjects' && <ClassesCoursesManagement key="tab-subjects" initialSubTab="subjects" />}
                {activeTab === 'courses' && <ClassesCoursesManagement key="tab-courses" initialSubTab="courses" />}
                {activeTab === 'classes' && <ClassesCoursesManagement key="tab-classes" initialSubTab="classes" />}
                {activeTab === 'schedules' && <ClassesCoursesManagement key="tab-schedules" initialSubTab="schedules" />}

                {/* Attendance section */}
                {activeTab === 'attendance' && <AttendanceManagement key="tab-attendance" initialSubTab="attendance" />}
                {activeTab === 'makeup' && <AttendanceManagement key="tab-makeup" initialSubTab="makeup" />}
                {activeTab === 'reservations' && <AttendanceManagement key="tab-reservations" initialSubTab="reservations" />}
                {activeTab === 'trial' && <AttendanceManagement key="tab-trial" initialSubTab="trial" />}

                {/* Learning & Gamification section */}
                {activeTab === 'assignments' && <LearningGamification key="tab-assignments" initialSubTab="assignments" />}
                {activeTab === 'progress' && <LearningGamification key="tab-progress" initialSubTab="progress" />}
                {activeTab === 'star_ranking' && <LearningGamification key="tab-star_ranking" initialSubTab="star_ranking" />}
                {activeTab === 'rewards' && <LearningGamification key="tab-rewards" initialSubTab="rewards" />}
                {activeTab === 'achievements' && <LearningGamification key="tab-achievements" initialSubTab="achievements" />}

                {/* Finance & System */}
                {activeTab === 'tuition' && <FinanceAndSettings key="tab-tuition" initialSubTab="tuition" />}
                {activeTab === 'tax_report' && <FinanceAndSettings key="tab-tax_report" initialSubTab="tax_report" />}
                {activeTab === 'notifications' && <FinanceAndSettings key="tab-notifications" initialSubTab="notifications" />}
                {activeTab === 'reports' && <FinanceAndSettings key="tab-reports" initialSubTab="reports" />}
                {activeTab === 'sheets_sync' && <FinanceAndSettings key="tab-sheets_sync" initialSubTab="sheets_sync" />}
                {activeTab === 'branding' && <FinanceAndSettings key="tab-branding" initialSubTab="branding" />}
                {activeTab === 'branches_map' && <FinanceAndSettings key="tab-branches_map" initialSubTab="branches_map" />}
                {activeTab === 'profile' && <UserProfileView />}
                {activeTab === 'settings' && <FinanceAndSettings key="tab-settings" initialSubTab="settings" />}
              </main>

              {/* Mobile Bottom Navigation Bar */}
              <BottomNav
                activeTab={activeTab}
                onSelectTab={handleAdminTabChange}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderRoleContent()}
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <AuthProvider>
          <DataProvider>
            <MainApp />
          </DataProvider>
        </AuthProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}
