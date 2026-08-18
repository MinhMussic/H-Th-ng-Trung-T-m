import React from 'react';
import { Star, Trophy, Award, Sparkles, Lock, PauseCircle, Music, Crown, Flame, ShieldAlert, Heart } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Student } from '../../types';

interface PersonalRankCardProps {
  studentId?: string;
  student?: Student;
  onOpenLeaderboard?: () => void;
  onOpenCertificate?: () => void;
  className?: string;
}

export const PersonalRankCard: React.FC<PersonalRankCardProps> = ({
  studentId,
  student: propsStudent,
  onOpenLeaderboard,
  onOpenCertificate,
  className = ''
}) => {
  const { starLeaderboard, students } = useData();

  // Find exact student profile:
  // 1. Prioritize propsStudent directly if provided
  // 2. Strict matching by id, userId, or code
  // 3. Never fallback to students[0]
  const matchedStudent = propsStudent || (students && students.length > 0 && studentId ? students.find(s => 
    s.id === studentId ||
    s.userId === studentId ||
    s.code === studentId
  ) : null);

  const student: Student = propsStudent || matchedStudent || {
    id: studentId || 'std-new',
    code: 'HV-MỚI',
    fullName: propsStudent?.fullName || 'Học Viên Mới',
    gender: 'Khác' as any,
    birthDate: '2015-01-01',
    enrolledSubjects: [],
    totalLessons: 0,
    completedLessons: 0,
    remainingLessons: 0,
    stars: 0,
    totalStars: 0,
    rewardPoints: 0,
    status: 'active' as const,
    avatar: propsStudent?.avatar
  };

  const allLeaderboard = starLeaderboard || [];
  const totalStudents = Math.max(allLeaderboard.length, students?.length || 1);
  
  // Find current student rank strictly in leaderboard
  const studentRankIndex = allLeaderboard.findIndex(item => 
    (student?.id && item.studentId === student.id) ||
    (student?.code && item.code && item.code === student.code)
  );

  const currentStars = student?.totalStars !== undefined ? student.totalStars : (student?.stars || 0);
  const rewardPoints = student?.rewardPoints !== undefined ? student.rewardPoints : 0;
  const completedLessons = student?.completedLessons || 0;
  const isLocked = student?.status === 'locked';
  const isReserved = student?.status === 'reserved';
  const isTrial = student?.status === 'trial';

  const hasRank = studentRankIndex !== -1;
  const rankNumber = hasRank ? studentRankIndex + 1 : (currentStars > 0 ? allLeaderboard.length + 1 : null);

  // Rank 3 threshold
  const rank3Item = allLeaderboard[2];
  const rank3Stars = rank3Item ? (rank3Item.totalStars ?? rank3Item.stars ?? 150) : 150;
  const starsNeededForTop3 = Math.max(0, rank3Stars - currentStars + 5);

  const isTop1 = rankNumber === 1;
  const isTop2 = rankNumber === 2;
  const isTop3 = rankNumber === 3;
  const isTop3Overall = rankNumber !== null && rankNumber <= 3;

  // Cheerful, cute, bright styling
  const rankTheme = isTop1
    ? {
        gradient: 'from-amber-400 via-yellow-300 to-amber-500',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        title: '👑 Quán Quân Âm Nhạc Toàn Trung Tâm',
        tagBg: 'bg-amber-500 text-white',
        icon: Crown,
        borderColor: 'border-amber-300 shadow-amber-200/50'
      }
    : isTop2
    ? {
        gradient: 'from-slate-200 via-blue-100 to-indigo-200',
        badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
        title: '🥈 Á Quân Sao Bạc Xuất Sắc',
        tagBg: 'bg-slate-600 text-white',
        icon: Trophy,
        borderColor: 'border-slate-300 shadow-slate-200/50'
      }
    : isTop3
    ? {
        gradient: 'from-amber-200 via-orange-100 to-amber-300',
        badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
        title: '🥉 Top 3 Sao Vàng Tỏa Sáng',
        tagBg: 'bg-orange-600 text-white',
        icon: Flame,
        borderColor: 'border-orange-300 shadow-orange-200/50'
      }
    : rankNumber !== null
    ? {
        gradient: 'from-sky-100 via-emerald-50 to-teal-100',
        badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        title: `🌟 Ngôi Sao Chăm Chỉ • Hạng #${rankNumber}`,
        tagBg: 'bg-emerald-600 text-white',
        icon: Sparkles,
        borderColor: 'border-emerald-200 shadow-emerald-100'
      }
    : {
        gradient: 'from-pink-50 via-purple-50 to-amber-50',
        badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
        title: '🌱 Mầm Non Âm Nhạc • Tích Lũy Sao Vào Bảng Vàng',
        tagBg: 'bg-purple-600 text-white',
        icon: Music,
        borderColor: 'border-purple-200 shadow-purple-100'
      };

  const IconComponent = rankTheme.icon;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-orange-50/80 border-2 ${rankTheme.borderColor} shadow-lg p-5 sm:p-6 transition-all duration-300 hover:shadow-xl ${className}`}>
      
      {/* Playful Floating Cute Animated Notes & Sparkles */}
      <div className="absolute top-2 right-12 text-amber-400/30 text-xl font-bold animate-bounce select-none pointer-events-none duration-1000">
        🎵
      </div>
      <div className="absolute bottom-3 right-4 text-pink-400/30 text-2xl font-bold animate-pulse select-none pointer-events-none">
        ✨
      </div>
      <div className="absolute top-4 left-1/3 text-emerald-400/20 text-lg font-bold select-none pointer-events-none">
        🎶
      </div>
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl pointer-events-none" />

      {/* Account Status Notice if locked or reserved */}
      {isLocked && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 bg-rose-100 text-rose-800 border border-rose-300 shadow-xs animate-pulse">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>🔒 Tài khoản học viên đang được bảo vệ & tạm khóa bởi Quản trị viên. Vui lòng liên hệ trung tâm.</span>
        </div>
      )}

      {isReserved && (
        <div className="mb-4 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
          <PauseCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>⏸️ Khóa học của bé đang trong thời gian bảo lưu an toàn. Số buổi và sao thưởng được bảo toàn trọn vẹn.</span>
        </div>
      )}

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Left: Avatar & Rank info */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden ring-4 ring-amber-300/80 shadow-md bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
              {student?.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.fullName}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-2xl font-heading shadow-inner">
                  {student?.fullName?.charAt(0) || 'B'}
                </div>
              )}
            </div>
            {/* Playful cute rank badge */}
            <span className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black border-2 shadow-sm flex items-center gap-0.5 ${rankTheme.tagBg} border-white animate-bounce`}>
              {isTop1 ? '🥇 #1' : isTop2 ? '🥈 #2' : isTop3 ? '🥉 #3' : rankNumber ? `#${rankNumber}` : '🌟'}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
                <span>BẢNG VINH DANH CÁ NHÂN</span>
              </span>
              <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 font-mono">
                Mã: {student.code || 'HV001'}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading mt-1 flex items-center gap-2 truncate">
              <span className="truncate">{student?.fullName}</span>
              {isTop3Overall && <span className="text-base">👑</span>}
            </h3>

            <div className="flex items-center gap-1.5 mt-0.5 text-xs font-black text-amber-700">
              <IconComponent className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">{rankTheme.title}</span>
            </div>
          </div>
        </div>

        {/* Middle: Stars & Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-amber-200 shadow-xs text-center">
          <div className="p-1.5 rounded-xl bg-amber-50/80 border border-amber-200/60">
            <span className="text-[10px] font-extrabold text-amber-800 uppercase block">⭐ Sao Vinh Danh</span>
            <div className="flex items-center justify-center gap-1 font-black text-base text-amber-600 mt-0.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{currentStars}</span>
            </div>
          </div>

          <div className="p-1.5 rounded-xl bg-rose-50/80 border border-rose-200/60">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase block">🎁 Ví Đổi Quà</span>
            <span className="font-black text-base text-rose-600 block mt-0.5">
              {rewardPoints} đ
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">🎹 Đã Đi Học</span>
            <span className="font-black text-base text-emerald-600 block mt-0.5">
              {completedLessons} buổi
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-indigo-50/80 border border-indigo-200/60 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-extrabold text-indigo-800 uppercase block">🎯 Mục Tiêu</span>
            {isTop3Overall ? (
              <span className="font-black text-xs text-indigo-600 block mt-1">
                👑 Giữ Vững Top 3
              </span>
            ) : currentStars > 0 ? (
              <span className="font-black text-xs text-orange-600 block mt-1">
                +{starsNeededForTop3} ⭐ Top 3
              </span>
            ) : (
              <span className="font-black text-xs text-emerald-600 block mt-1">
                +5 ⭐ Buổi Đầu
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {onOpenCertificate && hasRank && (
            <button
              onClick={onOpenCertificate}
              className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 text-xs font-black flex items-center gap-1.5 border-2 border-amber-300 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Giấy Khen</span>
            </button>
          )}

          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 fill-current text-yellow-200" />
              <span>Bảng Vinh Danh Pro 🏆</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
