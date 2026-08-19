import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TopThreeHonorPodium } from '../gamification/TopThreeHonorPodium';
import { StarLeaderboardItem } from '../../types';
import {
  Trophy,
  Award,
  Sparkles,
  Music,
  Star,
  Users,
  Filter,
  CheckCircle2,
  Flame,
  Search,
  BookOpen,
  Calendar,
  School
} from 'lucide-react';

interface TeacherHonorBoardViewProps {
  className?: string;
}

export const TeacherHonorBoardView: React.FC<TeacherHonorBoardViewProps> = ({
  className = ''
}) => {
  const { currentUser } = useAuth();
  const { teachers, starLeaderboard, subjects, classes, students } = useData();

  // Find current teacher
  const currentTeacher = useMemo(() => {
    const byUserId = teachers.find(t => t.userId === currentUser?.uid || t.userId === (currentUser as any)?.id);
    if (byUserId) return byUserId;
    const byEmail = teachers.find(t => t.email && currentUser?.email && t.email.toLowerCase() === currentUser.email.toLowerCase());
    if (byEmail) return byEmail;
    const byName = teachers.find(t => currentUser?.displayName && t.fullName.toLowerCase().includes(currentUser.displayName.toLowerCase()));
    if (byName) return byName;
    return teachers[0];
  }, [teachers, currentUser]);

  // Tab: 'all_center' | 'by_subject' | 'my_classes'
  const [scopeTab, setScopeTab] = useState<'all_center' | 'by_subject' | 'my_classes'>('all_center');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('piano');

  // Teacher's classes and students
  const teacherClasses = useMemo(() => {
    if (!currentTeacher) return classes;
    return classes.filter(c => 
      c.teacherId === currentTeacher.id || 
      c.teacherIds?.includes(currentTeacher.id) ||
      (c.teacherName && c.teacherName.toLowerCase().includes(currentTeacher.fullName.toLowerCase()))
    );
  }, [classes, currentTeacher]);

  const teacherClassNames = useMemo(() => {
    return new Set(teacherClasses.map(c => c.name.toLowerCase()));
  }, [teacherClasses]);

  // Filtered leaderboard items for My Classes
  const myClassLeaderboardItems = useMemo(() => {
    return starLeaderboard.filter(item => {
      if (item.className && teacherClassNames.has(item.className.toLowerCase())) return true;
      if (item.classNameOrSubject && teacherClassNames.has(item.classNameOrSubject.toLowerCase())) return true;
      return false;
    });
  }, [starLeaderboard, teacherClassNames]);

  // Subject-specific items
  const selectedSubjectObj = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId || s.name.toLowerCase().includes(selectedSubjectId.toLowerCase())) || subjects[0];
  }, [subjects, selectedSubjectId]);

  const subjectLeaderboardItems = useMemo(() => {
    const subName = selectedSubjectObj?.name || 'Piano';
    return starLeaderboard.filter(item => {
      const targetStr = (item.subject || item.classNameOrSubject || item.className || '').toLowerCase();
      return targetStr.includes(subName.toLowerCase()) || targetStr.includes(selectedSubjectId.toLowerCase());
    });
  }, [starLeaderboard, selectedSubjectObj, selectedSubjectId]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header Card */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/20 text-slate-950 text-xs font-black uppercase tracking-wider mb-2">
              <Trophy className="w-4 h-4 text-amber-200" />
              Bảng Vàng Vinh Danh & Tuyên Dương
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-heading">
              Vinh Danh Học Viên Xuất Sắc Minh Music
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-900/80 mt-1 max-w-2xl">
              Theo dõi và tôn vinh những học viên có thành tích rèn luyện, tích lũy sao và hoàn thành bài tập xuất sắc nhất toàn trung tâm và theo từng môn học chuyên sâu.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/15 p-3 rounded-2xl backdrop-blur-xs shrink-0">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-lg shadow-md">
              👑
            </div>
            <div className="text-xs">
              <span className="text-slate-950/70 font-extrabold uppercase text-[10px] block">Giảng viên phụ trách</span>
              <strong className="text-slate-950 text-sm font-black">{currentTeacher?.fullName || 'Thầy Minh'}</strong>
              <span className="text-slate-950/80 block font-bold">{teacherClasses.length} lớp học đang quản lý</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Scope Navigator Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setScopeTab('all_center')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              scopeTab === 'all_center'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Toàn Trung Tâm ({starLeaderboard.length} học viên)</span>
          </button>

          <button
            onClick={() => setScopeTab('by_subject')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              scopeTab === 'by_subject'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Theo Môn Học Cụ Thể</span>
          </button>

          <button
            onClick={() => setScopeTab('my_classes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              scopeTab === 'my_classes'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Lớp Thầy/Cô Dạy ({myClassLeaderboardItems.length} học viên)</span>
          </button>
        </div>

        {/* Subject quick selector if on by_subject tab */}
        {scopeTab === 'by_subject' && (
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Music className="w-3.5 h-3.5 text-amber-500 ml-2" />
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-900 dark:text-white pr-3 py-1 focus:outline-hidden cursor-pointer"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id} className="dark:bg-slate-900">
                  Môn {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Render Podium Based on Scope */}
      {scopeTab === 'all_center' && (
        <TopThreeHonorPodium
          customItems={starLeaderboard}
          title="Bảng Vàng Vinh Danh Toàn Trung Tâm"
          subtitle="Top các ngôi sao âm nhạc xuất sắc nhất toàn hệ thống Minh Music Studio"
          showFilters={true}
          showFullLeaderboardBelow={true}
        />
      )}

      {scopeTab === 'by_subject' && (
        <TopThreeHonorPodium
          customItems={subjectLeaderboardItems.length > 0 ? subjectLeaderboardItems : starLeaderboard}
          title={`Bảng Vinh Danh Bộ Môn ${selectedSubjectObj?.name || 'Piano'}`}
          subtitle={`Tuyên dương những học viên có năng khiếu và rèn luyện môn ${selectedSubjectObj?.name || 'Piano'} xuất sắc nhất`}
          showFilters={true}
          showFullLeaderboardBelow={true}
        />
      )}

      {scopeTab === 'my_classes' && (
        <TopThreeHonorPodium
          customItems={myClassLeaderboardItems.length > 0 ? myClassLeaderboardItems : starLeaderboard.slice(0, 10)}
          title={`Bảng Vinh Danh Lớp Học Của ${currentTeacher?.fullName || 'Giảng Viên'}`}
          subtitle={`Ghi nhận nỗ lực học tập và tiến bộ của học viên các lớp: ${teacherClasses.map(c => c.name).join(', ') || 'Tất cả các lớp'}`}
          showFilters={true}
          showFullLeaderboardBelow={true}
        />
      )}
    </div>
  );
};
