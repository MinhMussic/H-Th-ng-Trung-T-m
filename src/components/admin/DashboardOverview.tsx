import React from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { AdminMenuTab } from '../../types';
import {
  Users,
  GraduationCap,
  School,
  CreditCard,
  Cake,
  Star,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  UserPlus,
  ShieldCheck,
  Award,
  Music,
  Plus
} from 'lucide-react';
import { EnrollmentTrendsChart } from './dashboard/EnrollmentTrendsChart';
import { TuitionStatusChart } from './dashboard/TuitionStatusChart';
import { RealtimeGreetingCard } from '../common/RealtimeGreetingCard';

interface DashboardOverviewProps {
  onNavigateTab?: (tab: AdminMenuTab) => void;
  onNavigate?: (tab: AdminMenuTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigateTab, onNavigate }) => {
  const navigateTo = (tab: AdminMenuTab) => {
    if (typeof onNavigateTab === 'function') {
      onNavigateTab(tab);
    } else if (typeof onNavigate === 'function') {
      onNavigate(tab);
    }
  };

  const { 
    students, 
    teachers, 
    classes, 
    getTodayBirthdays, 
    starLeaderboard, 
    notifications,
    tuitionPayments 
  } = useData();
  const { accounts, currentUser } = useAuth();

  const todayBirthdays = getTodayBirthdays();
  const totalRevenue = tuitionPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeStudents = students.filter(s => s.status === 'active');
  const activeClasses = classes.filter(c => c.status === 'active');
  const pendingAccounts = accounts.filter(a => a.status === 'pending');

  return (
    <div className="space-y-6">
      
      {/* 🌟 LỜI CHÀO THỜI GIAN THỰC & LỜI CHÚC TÂM TRẠNG TÍCH CỰC */}
      <RealtimeGreetingCard 
        userName={currentUser?.displayName || currentUser?.username}
        variant="card"
        showClock={true}
      />

      {/* 🎂 PROMINENT BIRTHDAY SPOTLIGHT BANNER */}
      {todayBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-2xl p-3.5 sm:p-5 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 overflow-hidden min-w-0 w-full">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Cake className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                  🎉 CHÚC MỪNG SINH NHẬT
                </span>
                <span className="text-xs font-bold text-amber-200">
                  {todayBirthdays.length} sinh nhật hôm nay
                </span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold mt-0.5 font-heading break-words">
                {todayBirthdays.map(b => `${b.name} (${b.role === 'STUDENT' ? 'Học viên' : 'Giáo viên'} - Tròn ${b.age} tuổi)`).join(' • ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              id="btn-overview-bday-view"
              onClick={() => navigateTo('birthdays')}
              className="px-3.5 sm:px-4 py-2.5 bg-white text-rose-700 hover:bg-rose-50 active:scale-95 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Xem & Gửi Lời Chúc 🎉</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
        
        {/* Metric 1: Students */}
        <div 
          onClick={() => navigateTo('students')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group min-w-0"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 sm:px-2 py-0.5 rounded-full truncate">
              {activeStudents.length} đang học
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Tổng số học viên</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-heading">{students.length}</h3>
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold group-hover:text-emerald-600 flex items-center shrink-0">
              Chi tiết <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Metric 2: Teachers */}
        <div 
          onClick={() => navigateTo('teachers')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group min-w-0"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 sm:px-2 py-0.5 rounded-full truncate">
              Chuyên nghiệp
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Giáo viên giảng dạy</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-heading">{teachers.length}</h3>
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold group-hover:text-blue-600 flex items-center shrink-0">
              Chi tiết <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Metric 3: Active Classes */}
        <div 
          onClick={() => navigateTo('classes')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group min-w-0"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <School className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 sm:px-2 py-0.5 rounded-full truncate">
              {activeClasses.length} lớp mở
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Tổng số lớp học</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-heading">{classes.length}</h3>
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold group-hover:text-amber-600 flex items-center shrink-0">
              Chi tiết <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Metric 4: Tuition Collected */}
        <div 
          onClick={() => navigateTo('tuition')}
          className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group min-w-0"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-1.5 sm:px-2 py-0.5 rounded-full truncate">
              VietQR Tự Động
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">Doanh thu học phí</p>
          <div className="flex items-baseline justify-between mt-1 min-w-0">
            <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white font-heading truncate">
              {totalRevenue.toLocaleString('vi-VN')} đ
            </h3>
            <span className="text-[11px] sm:text-xs text-slate-400 font-semibold group-hover:text-purple-600 flex items-center shrink-0">
              Xem <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 overflow-hidden min-w-0 w-full">
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 font-heading">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Lối Tắt Thao Tác Nhanh Quản Trị</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 break-words">
            Thực hiện nhanh các nghiệp vụ trung tâm âm nhạc Minh Music
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 min-w-0">
          <button
            onClick={() => navigateTo('events')}
            className="col-span-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Lịch Sự Kiện</span>
          </button>

          <button
            onClick={() => navigateTo('students')}
            className="col-span-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Thêm Học Viên</span>
          </button>

          <button
            onClick={() => navigateTo('accounts')}
            className="col-span-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tài Khoản ({pendingAccounts.length > 0 ? `${pendingAccounts.length} chờ` : 'Mới'})</span>
          </button>

          <button
            onClick={() => navigateTo('attendance')}
            className="col-span-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Điểm Danh Nhanh</span>
          </button>

          <button
            onClick={() => navigateTo('tuition')}
            className="col-span-2 sm:col-span-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Tạo Mã QR Học Phí</span>
          </button>
        </div>
      </div>

      {/* 📊 INTERACTIVE ANALYTICS & CHARTS (RECHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnrollmentTrendsChart
          students={students}
          onNavigateToStudents={() => navigateTo('students')}
        />
        <TuitionStatusChart
          tuitionPayments={tuitionPayments}
          onNavigateToTuition={() => navigateTo('tuition')}
        />
      </div>

      {/* 🌟 PRO TOP 3 HONOR SPOTLIGHT (HORIZONTAL ROW) */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  🏆 TOP 3 VINH DANH MINH MUSIC
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                  Tháng {String(new Date().getMonth() + 1).padStart(2, '0')}/{new Date().getFullYear()}
                </span>
              </div>
              <h3 className="text-base font-black text-white font-heading mt-0.5">
                Gương Mặt Xuất Sắc Dẫn Đầu Bảng Sao Toàn Trung Tâm
              </h3>
            </div>
          </div>

          <button
            onClick={() => navigateTo('star_ranking')}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mở Bảng Vàng Pro →</span>
          </button>
        </div>

        {/* Horizontal Top 3 Grid */}
        {starLeaderboard && starLeaderboard.length > 0 ? (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {(starLeaderboard || []).slice(0, 3).map((item, idx) => {
              const rank = idx + 1;
              const rankStyle = rank === 1
                ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-400/40 text-white shadow-lg'
                : rank === 2
                ? 'bg-gradient-to-b from-slate-800/60 via-slate-900 to-slate-900 border-slate-600/40 text-white'
                : 'bg-gradient-to-b from-orange-950/30 via-slate-900 to-slate-900 border-amber-700/40 text-white';

              const badgeColor = rank === 1 ? 'bg-amber-400 text-slate-950' : rank === 2 ? 'bg-slate-300 text-slate-950' : 'bg-amber-600 text-white';
              const medal = rank === 1 ? '🥇 Quán Quân' : rank === 2 ? '🥈 Á Quân' : '🥉 Top 3';

              return (
                <div
                  key={item.studentId}
                  onClick={() => navigateTo('star_ranking')}
                  className={`p-4 rounded-2xl border ${rankStyle} flex items-center justify-between gap-3 hover:border-amber-400/60 transition-all cursor-pointer group`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full overflow-hidden ${rank === 1 ? 'ring-2 ring-amber-400' : 'ring-2 ring-slate-400'}`}>
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.studentName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                            {item.studentName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${badgeColor} flex items-center justify-center text-[10px] font-black shadow`}>
                        {rank}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-amber-300">
                        {medal}
                      </span>
                      <h4 className="text-sm font-extrabold text-white truncate max-w-[130px]">
                        {item.studentName}
                      </h4>
                      {/* Subject name */}
                      <p className="text-[11px] text-slate-400 font-semibold truncate max-w-[140px]">
                        {item.subject || item.classNameOrSubject || 'Âm nhạc'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 font-black text-sm text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{item.totalStars ?? item.stars ?? 0}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{item.completedLessons ?? 0} buổi</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative z-10 p-5 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1 mt-4">
            <p className="text-xs font-bold text-amber-300">⭐ Chưa có học viên trên Bảng Vàng vinh danh</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Hệ thống sẽ tự động vinh danh Top 3 học viên xuất sắc nhất khi các bạn tích lũy sao qua điểm danh, làm bài tập và biểu diễn âm nhạc.
            </p>
          </div>
        )}
      </div>

      {/* TWO COLUMNS: TODAY'S CLASSES & STAR LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Classes */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Lịch Dạy & Lớp Học Hôm Nay
              </h3>
            </div>
            <button
              onClick={() => navigateTo('schedules')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Xem toàn bộ lịch →
            </button>
          </div>

          <div className="space-y-3">
            {classes.length > 0 ? (
              classes.slice(0, 5).map((cls) => (
                <div 
                  key={cls.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-amber-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{cls.name}</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {cls.subject}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        GV: <strong>{cls.teacherName || 'Chưa phân công'}</strong> • Phòng: {cls.room || 'P.Học'} • Lịch: {cls.schedule || 'Theo thời khóa biểu'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 hidden sm:inline">
                      {cls.currentStudents || 0}/{cls.maxStudents || 10} HV
                    </span>
                    <button
                      onClick={() => navigateTo('attendance')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Điểm danh
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-200/60 text-slate-500 flex items-center justify-center mx-auto">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">Chưa có lớp học nào trong hệ thống</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Tạo các lớp học nhạc mới để bắt đầu xếp lịch giảng dạy và điểm danh học viên.
                </p>
                <button
                  onClick={() => navigateTo('classes')}
                  className="mt-2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                >
                  <span>+ Quản Lý Lớp Học</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Star Ranking Leaderboard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Top Bảng Sao Minh Music
              </h3>
            </div>
            <button
              onClick={() => navigateTo('star_ranking')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              Xem tất cả →
            </button>
          </div>

          <div className="space-y-2.5">
            {starLeaderboard && starLeaderboard.length > 0 ? (
              starLeaderboard.slice(0, 5).map((item, idx) => (
                <div 
                  key={item.studentId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      idx === 0 ? 'bg-amber-400 text-slate-900' :
                      idx === 1 ? 'bg-slate-300 text-slate-900' :
                      idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {idx + 1}
                    </span>
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.studentName} className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                        {item.studentName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-[110px]">{item.studentName}</p>
                      <p className="text-[10px] text-slate-500">{item.rankTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{item.totalStars} sao</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                <p className="text-xs font-bold text-slate-700">Chưa có bảng sao</p>
                <p className="text-[10px] text-slate-500">
                  Điểm sao sẽ hiển thị khi học viên nhận sao thưởng từ giáo viên.
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => navigateTo('rewards')}
              className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Kho Đổi Quà Thưởng Học Viên</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
