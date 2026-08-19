import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { StarLeaderboardItem } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { LaurelWreathFrame } from './LaurelWreathFrame';
import {
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Award,
  Music,
  Flame,
  Star,
  CheckCircle2,
  Calendar,
  Share2,
  Download,
  PartyPopper,
  Filter,
  Eye,
  X,
  ChevronRight,
  TrendingUp,
  Search,
  Users
} from 'lucide-react';

interface TopThreeHonorPodiumProps {
  customItems?: StarLeaderboardItem[];
  title?: string;
  subtitle?: string;
  showFilters?: boolean;
  showFullLeaderboardBelow?: boolean;
  onSelectStudent?: (studentId: string) => void;
  className?: string;
}

export const TopThreeHonorPodium: React.FC<TopThreeHonorPodiumProps> = ({
  customItems,
  title = 'Bảng Vàng Vinh Danh Minh Music',
  subtitle = 'Tuyên dương 3 gương mặt học viên xuất sắc nhất với thành tích học tập và rèn luyện vượt trội',
  showFilters = true,
  showFullLeaderboardBelow = true,
  onSelectStudent,
  className = ''
}) => {
  const { starLeaderboard, subjects, awardStars } = useData();
  const { currentUser, role, activeRole } = useAuth();

  const effectiveRole = activeRole || role || currentUser?.role;
  const isStudentOrParentOrGuardian = 
    effectiveRole === 'STUDENT' || 
    effectiveRole === 'PARENT' || 
    (effectiveRole as any) === 'GUARDIAN' ||
    currentUser?.role === 'STUDENT' || 
    currentUser?.role === 'PARENT' || 
    (currentUser?.role as any) === 'GUARDIAN';

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'all'>('month');
  const [podiumStyle, setPodiumStyle] = useState<'podium' | 'linear'>('podium'); // 'podium' (2-1-3) or 'linear' (1-2-3)
  const [activeCertificateItem, setActiveCertificateItem] = useState<StarLeaderboardItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [displayLimit, setDisplayLimit] = useState<number>(30); // Default to show 30 students

  const baseItems = customItems || starLeaderboard || [];

  // Filter items by subject and search query
  const filteredItems = baseItems.filter(item => {
    const matchesSubject = selectedSubject === 'all' || 
      (item.subject || item.classNameOrSubject || '').toLowerCase().includes(selectedSubject.toLowerCase());
    
    const matchesSearch = !searchQuery.trim() || 
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSubject && matchesSearch;
  });

  // Re-rank items after filter
  const rankedItems: StarLeaderboardItem[] = filteredItems.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    rankTitle: idx === 0 ? '🏆 Quán Quân Sao' : idx === 1 ? '🥈 Á Quân Sao' : idx === 2 ? '🥉 Top 3 Sao Vàng' : '🌟 Ngôi Sao Cần Cù'
  }));

  const rank1 = rankedItems[0];
  const rank2 = rankedItems[1];
  const rank3 = rankedItems[2];
  
  // Sliced items for the rest of leaderboard (ranks 4+)
  const restItems = rankedItems.slice(3, displayLimit);

  // Confetti trigger
  const triggerConfetti = (e?: React.MouseEvent) => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 60,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 1 }
        });
      }, 250);
    } catch (err) {
      console.log('Confetti effect');
    }
    showToast('🎉 Chúc mừng 3 học viên xuất sắc nhất của Minh Music!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Get subject icon
  const getSubjectIcon = (subjectName?: string) => {
    const s = (subjectName || '').toLowerCase();
    if (s.includes('piano') || s.includes('keyboard')) return '🎹';
    if (s.includes('guitar') || s.includes('ukulele')) return '🎸';
    if (s.includes('thanh nhạc') || s.includes('vocal') || s.includes('hát')) return '🎤';
    if (s.includes('violin') || s.includes('vĩ cầm')) return '🎻';
    if (s.includes('trống') || s.includes('drum') || s.includes('cajon')) return '🥁';
    return '🎼';
  };

  // Render individual card for podium with Royal Laurel Wreath
  const renderHonorCard = (
    item: StarLeaderboardItem | undefined,
    rank: 1 | 2 | 3,
    isElevated: boolean = false
  ) => {
    if (!item) {
      return (
        <div className="flex-1 min-h-[360px] rounded-3xl border border-dashed border-slate-700/60 p-6 flex flex-col items-center justify-center text-center bg-slate-900/40">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center font-black text-xl mb-2">
            #{rank}
          </div>
          <p className="text-xs text-slate-400 font-medium">Đang cập nhật bảng xếp hạng</p>
        </div>
      );
    }

    const isRank1 = rank === 1;
    const isRank2 = rank === 2;
    const isRank3 = rank === 3;

    // Styling themes per rank
    const config = isRank1
      ? {
          cardBg: 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 text-white border-amber-400/60 shadow-2xl shadow-amber-500/20 ring-1 ring-amber-400/30',
          pedestalBg: 'bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 text-slate-950 font-black',
          pillBg: 'bg-amber-400/20 text-amber-300 border border-amber-400/40',
          medalEmoji: '🥇',
          label: 'HẠNG NHẤT • QUÁN QUÂN',
          titleColor: 'text-amber-200',
          pedestalHeight: 'h-24 sm:h-28',
          wreathSize: 'lg' as const
        }
      : isRank2
      ? {
          cardBg: 'bg-gradient-to-b from-slate-800/80 via-slate-900 to-slate-950 text-white border-slate-400/40 shadow-xl shadow-slate-400/10 ring-1 ring-slate-400/20',
          pedestalBg: 'bg-gradient-to-t from-slate-500 via-slate-300 to-slate-100 text-slate-950 font-black',
          pillBg: 'bg-slate-300/20 text-slate-200 border border-slate-300/40',
          medalEmoji: '🥈',
          label: 'HẠNG NHÌ • Á QUÂN',
          titleColor: 'text-slate-100',
          pedestalHeight: 'h-16 sm:h-18',
          wreathSize: 'md' as const
        }
      : {
          cardBg: 'bg-gradient-to-b from-orange-950/30 via-slate-900 to-slate-950 text-white border-amber-700/50 shadow-xl shadow-orange-500/10 ring-1 ring-amber-600/20',
          pedestalBg: 'bg-gradient-to-t from-amber-800 via-amber-600 to-amber-500 text-white font-black',
          pillBg: 'bg-orange-500/20 text-amber-300 border border-amber-600/40',
          medalEmoji: '🥉',
          label: 'HẠNG BA • QUÝ QUÂN',
          titleColor: 'text-amber-200',
          pedestalHeight: 'h-12 sm:h-14',
          wreathSize: 'md' as const
        };

    const subjectName = item.subject || item.classNameOrSubject || 'Bộ môn Âm nhạc';
    const subjIcon = getSubjectIcon(subjectName);

    return (
      <div
        key={item.studentId}
        className={`relative rounded-3xl border transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between overflow-hidden ${
          config.cardBg
        } ${isRank1 ? 'md:-mt-6 lg:-mt-10 md:scale-105 z-20' : 'z-10'}`}
      >
        {/* Top Glow & Shimmer FX */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        
        {/* Rank Badge Header & Action */}
        <div className="relative z-10 p-5 pb-0 flex items-center justify-between">
          <div className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${config.pillBg}`}>
            <span>{config.medalEmoji}</span>
            <span>{config.label}</span>
          </div>

          <button
            onClick={() => setActiveCertificateItem(item)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer text-xs flex items-center gap-1 border border-white/10 shadow-xs"
            title="Xem & In Giấy Khen Vinh Danh"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">Giấy Khen</span>
          </button>
        </div>

        {/* Center: Royal Laurel Wreath & Avatar Frame (Khung Vinh Danh Hoàng Gia) */}
        <div className="relative z-10 p-4 sm:p-5 text-center flex flex-col items-center">
          
          {/* 🌟 Vòng Nguyệt Quế, Vương Miện & Ruy Băng Hoàng Gia chuẩn mẫu */}
          <div className="my-1 w-full flex items-center justify-center">
            <LaurelWreathFrame
              avatarUrl={item.avatar}
              studentName={item.studentName}
              rank={rank}
              size={config.wreathSize}
              ribbonLabel={item.studentName.toUpperCase()}
              subTitle={
                rank === 1 
                  ? 'Quán Quân Toàn Trung Tâm' 
                  : rank === 2 
                  ? 'Á Quân Toàn Trung Tâm' 
                  : 'Quý Quân Toàn Trung Tâm'
              }
              showCrown={true}
            />
          </div>

          {/* Student Name & Code Prominent Display */}
          <div className="mt-1 mb-1 text-center">
            <h3 className={`text-base sm:text-lg font-black tracking-tight font-heading leading-tight ${
              isRank1 
                ? 'text-amber-300 drop-shadow-[0_2px_8px_rgba(245,185,45,0.4)]' 
                : isRank2 
                ? 'text-slate-100 drop-shadow-[0_2px_8px_rgba(215,228,245,0.4)]' 
                : 'text-orange-200 drop-shadow-[0_2px_8px_rgba(235,130,60,0.4)]'
            }`}>
              {item.studentName}
            </h3>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Mã HV: <strong className="text-slate-200">{item.code || `HV00${rank}`}</strong>
            </p>
          </div>

          {/* Subject Badge (TÊN MÔN HỌC RÕ RÀNG & NỔI BẬT NẰM NGANG) */}
          <div className="mt-2.5 w-full">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center gap-2 shadow-inner">
              <span className="text-base">{subjIcon}</span>
              <span className="font-extrabold text-xs text-white tracking-wide truncate">
                {subjectName}
              </span>
            </div>
          </div>

          {/* Stats Bar: Stars & Completed Lessons */}
          <div className="mt-3 w-full grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-2xl border border-white/10 text-xs">
            <div className="text-center">
              <span className="text-[10px] text-slate-400 font-semibold block">Tích lũy sao</span>
              <div className="flex items-center justify-center gap-1 font-black text-sm text-amber-300 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                <span>{item.totalStars ?? item.stars ?? 0}</span>
              </div>
            </div>

            <div className="text-center border-l border-white/10">
              <span className="text-[10px] text-slate-400 font-semibold block">Số buổi học</span>
              <div className="font-extrabold text-xs text-emerald-400 mt-0.5">
                {item.completedLessons ?? 18} buổi
              </div>
            </div>
          </div>

          {/* Rank Title / Quote */}
          <div className="mt-2 text-[11px] font-bold text-slate-300 italic flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{item.rankTitle || 'Ngôi Sao Sáng'}</span>
          </div>
        </div>

        {/* Bottom Pedestal Block */}
        <div className={`flex flex-col items-center justify-center text-center font-black ${config.pedestalBg} ${config.pedestalHeight} border-t border-white/20 shadow-inner`}>
          <span className="text-2xl sm:text-3xl drop-shadow-xs">{config.medalEmoji}</span>
          <span className="text-xs uppercase tracking-wider mt-0.5">BẬC TOP {rank}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-500/40 animate-in fade-in slide-in-from-bottom-5">
          <PartyPopper className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Container Hero Showcase */}
      <div className="relative rounded-3xl bg-slate-950 text-white p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Ambient Stage Lighting Background FX */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

        {/* Header Title & Actions */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>MINH MUSIC HALL OF FAME</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-700">
                PRO EDITION
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black mt-2 font-heading tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
              {title}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={triggerConfetti}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              title="Bắn pháo hoa giấy chúc mừng"
            >
              <PartyPopper className="w-4 h-4" />
              <span>Tung Hoa Chúc Mừng 🎉</span>
            </button>

            {/* Layout Switcher */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setPodiumStyle('podium')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  podiumStyle === 'podium'
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bố cục bục vinh danh (Nhất cao nhất ở giữa, Nhì bên trái, Ba bên phải)"
              >
                Bục Vinh Danh (2 - 1 - 3)
              </button>
              <button
                onClick={() => setPodiumStyle('linear')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  podiumStyle === 'linear'
                    ? 'bg-amber-400 text-slate-950 font-extrabold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bố cục hàng ngang (1 - 2 - 3)"
              >
                Hàng Ngang (1 - 2 - 3)
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        {showFilters && (
          <div className="relative z-10 my-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            
            {/* Subject Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>Môn:</span>
              </span>

              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedSubject === 'all'
                    ? 'bg-white text-slate-950 font-black shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🏆 Tất cả môn
              </button>

              {subjects && subjects.length > 0 ? (
                subjects.map(s => {
                  const isSelected = selectedSubject.toLowerCase() === s.name.toLowerCase() || 
                    (selectedSubject !== 'all' && s.name.toLowerCase().includes(selectedSubject.toLowerCase()));
                  const icon = getSubjectIcon(s.name);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubject(s.name)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{icon} {s.name}</span>
                    </button>
                  );
                })
              ) : (
                <>
                  <button
                    onClick={() => setSelectedSubject('piano')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSubject === 'piano'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>🎹 Piano</span>
                  </button>
                  <button
                    onClick={() => setSelectedSubject('guitar')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSubject === 'guitar'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>🎸 Guitar</span>
                  </button>
                  <button
                    onClick={() => setSelectedSubject('thanh nhạc')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSubject === 'thanh nhạc'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>🎤 Thanh Nhạc</span>
                  </button>
                  <button
                    onClick={() => setSelectedSubject('violin')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSubject === 'violin'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>🎻 Violin</span>
                  </button>
                  <button
                    onClick={() => setSelectedSubject('trống')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                      selectedSubject === 'trống'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>🥁 Trống</span>
                  </button>
                </>
              )}
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm học viên / mã số..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-amber-400"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Timeframe */}
              <div className="flex items-center gap-1 text-xs shrink-0">
                <button
                  onClick={() => setSelectedTimeframe('month')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedTimeframe === 'month'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tháng này
                </button>
                <button
                  onClick={() => setSelectedTimeframe('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedTimeframe === 'all'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tất cả
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 🌟 3 HẠNG ĐẦU NẰM NGANG (NHẤT CAO NHẤT, NHÌ VÀ BA NẰM 2 BÊN THẤP HƠN) */}
        <div className="relative z-10 mt-6 pt-4">
          {podiumStyle === 'podium' ? (
            /* Classic Podium: Rank 2 (Left, Lower) - Rank 1 (Center, Highest Elevated) - Rank 3 (Right, Lower) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end">
              {/* Rank 2 (Left) */}
              <div className="order-2 md:order-1">
                {renderHonorCard(rank2, 2)}
              </div>

              {/* Rank 1 (Center - Elevated) */}
              <div className="order-1 md:order-2">
                {renderHonorCard(rank1, 1, true)}
              </div>

              {/* Rank 3 (Right) */}
              <div className="order-3 md:order-3">
                {renderHonorCard(rank3, 3)}
              </div>
            </div>
          ) : (
            /* Linear Arrangement: Rank 1 - Rank 2 - Rank 3 */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              <div>{renderHonorCard(rank1, 1)}</div>
              <div>{renderHonorCard(rank2, 2)}</div>
              <div>{renderHonorCard(rank3, 3)}</div>
            </div>
          )}
        </div>

        {/* Motivation Footer Banner */}
        <div className="relative z-10 mt-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-200 uppercase tracking-wide">
                Luyện tập mỗi ngày • Chinh phục Top 3 Bảng Vàng
              </p>
              <p className="text-[11px] text-slate-400">
                Mỗi buổi học đúng giờ nhận <strong>+5 ⭐</strong>, hoàn thành bài tập xuất sắc nhận <strong>+10 ⭐</strong>.
              </p>
            </div>
          </div>

          {!isStudentOrParentOrGuardian && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (rank1) awardStars(rank1.studentId, 10, 'Thưởng Quán Quân');
                  if (rank2) awardStars(rank2.studentId, 5, 'Thưởng Á Quân');
                  if (rank3) awardStars(rank3.studentId, 5, 'Thưởng Top 3');
                  triggerConfetti();
                  showToast('Đã thưởng thêm Sao động viên cho Top 3 học viên!');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all cursor-pointer"
              >
                + Thưởng Thêm 🌟
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FULL LEADERBOARD (DISPLAY UP TO 30 STUDENTS AS REQUESTED) */}
      {showFullLeaderboardBelow && restItems.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  Bảng Xếp Hạng Kế Tiếp (Hạng 4 – {Math.min(displayLimit, rankedItems.length)})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Danh sách học viên theo dõi thành tích & bám đuổi Top 3
                </p>
              </div>
            </div>

            {/* Display limit switcher: 10 / 20 / 30 / All */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>Hiển thị:</span>
              </span>
              {[10, 20, 30, 100].map((num) => (
                <button
                  key={num}
                  onClick={() => setDisplayLimit(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    displayLimit === num
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  {num === 100 ? 'Tất cả' : `${num} HV`}
                </button>
              ))}
            </div>
          </div>

          {/* Students List Table/Rows */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {restItems.map((item, idx) => {
              const currentRank = idx + 4;
              const subjName = item.subject || item.classNameOrSubject || 'Âm nhạc';
              const subjIcon = getSubjectIcon(subjName);
              const starsToTop3 = (rank3?.totalStars ?? 145) - (item.totalStars ?? item.stars ?? 0);

              return (
                <div
                  key={item.studentId}
                  className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-amber-50/40 dark:hover:bg-slate-800/70 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-xs shrink-0">
                      #{currentRank}
                    </span>

                    <div className="relative shrink-0">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.studentName}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                          {item.studentName.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {item.studentName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {item.code}
                        </span>
                      </div>

                      {/* Subject tag */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <span>{subjIcon}</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{subjName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stars difference */}
                    {starsToTop3 > 0 && (
                      <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                        Cách Top 3: <strong className="text-amber-600 dark:text-amber-400">{starsToTop3} ⭐</strong>
                      </span>
                    )}

                    <div className="text-right">
                      <div className="flex items-center gap-1 font-black text-sm text-amber-600 dark:text-amber-400">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        <span>{item.totalStars ?? item.stars ?? 0} sao</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {item.completedLessons ?? 10} buổi học
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveCertificateItem(item)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-200 transition-all cursor-pointer"
                      title="Xem Bằng Khen"
                    >
                      <Award className="w-4 h-4 text-amber-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📜 MODAL: GIẤY KHEN & THẺ VINH DANH PRO */}
      {activeCertificateItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-500/30 animate-in fade-in zoom-in-95 relative overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setActiveCertificateItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Frame Layout */}
            <div className="relative border-4 border-double border-amber-500/60 p-6 rounded-2xl bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 text-center space-y-4">
              
              {/* Header Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 mb-2">
                  <Trophy className="w-7 h-7 fill-slate-950" />
                </div>
                <span className="text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest">
                  TRUNG TÂM ÂM NHẠC MINH MUSIC
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight mt-1">
                  GIẤY KHEN VINH DANH
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Học Viên Xuất Sắc Kỳ Học Tháng 03/2025
                </p>
              </div>

              {/* Student Details with Royal Wreath */}
              <div className="py-2 space-y-3 flex flex-col items-center">
                <div className="w-full flex items-center justify-center -my-2">
                  <LaurelWreathFrame
                    avatarUrl={activeCertificateItem.avatar}
                    studentName={activeCertificateItem.studentName}
                    rank={(activeCertificateItem.rank as 1 | 2 | 3) || 1}
                    size="sm"
                    ribbonLabel={activeCertificateItem.studentName.toUpperCase()}
                    subTitle={`Học viên xuất sắc • Top #${activeCertificateItem.rank || 1}`}
                  />
                </div>

                <div className="text-center">
                  <h4 className="text-lg sm:text-xl font-black text-amber-900 dark:text-amber-200 tracking-tight font-heading uppercase">
                    {activeCertificateItem.studentName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Mã số học viên: <strong className="text-amber-800 dark:text-amber-300">{activeCertificateItem.code}</strong>
                  </p>
                </div>

                {/* Subject & Achievement description */}
                <div className="w-full bg-amber-100/60 dark:bg-slate-800 p-3 rounded-xl border border-amber-200 dark:border-slate-700 text-xs space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Bộ môn: <span className="text-amber-800 dark:text-amber-300 font-extrabold">{activeCertificateItem.subject || activeCertificateItem.classNameOrSubject || 'Âm nhạc'}</span>
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                    Đạt thành tích <strong>{activeCertificateItem.totalStars ?? activeCertificateItem.stars ?? 0} Sao Vàng</strong> • Hoàn thành xuất sắc tiến trình đào tạo.
                  </p>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="text-left">
                  <p className="text-[10px]">Ngày cấp: 15/03/2025</p>
                  <p className="font-mono text-[10px] text-amber-700 dark:text-amber-400 font-bold">Mã số: MMC-HONOR-{activeCertificateItem.code}</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">BAN GIÁM ĐỐC MINH MUSIC</p>
                  <p className="text-[10px] italic text-slate-400">Đã ký điện tử & đóng dấu</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveCertificateItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  window.print();
                  showToast('Đang chuẩn bị in giấy khen...');
                }}
                className="px-5 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>In & Tải Giấy Khen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
