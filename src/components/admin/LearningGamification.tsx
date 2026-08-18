import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Assignment, RewardItem, Submission } from '../../types';
import { TopThreeHonorPodium } from '../gamification/TopThreeHonorPodium';
import { RewardConfigModal } from '../gamification/RewardConfigModal';
import { IndividualAssignmentModal } from '../gamification/IndividualAssignmentModal';
import { GradeSubmissionModal } from '../gamification/GradeSubmissionModal';
import {
  FileText,
  Star,
  Gift,
  Trophy,
  Plus,
  Search,
  CheckCircle2,
  Sparkles,
  Edit2,
  Trash2,
  Settings,
  Package,
  Filter,
  User,
  Music,
  Clock,
  Gauge,
  MessageSquare,
  Link,
  Video,
  Award,
  BookOpen,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface LearningGamificationProps {
  initialSubTab?: 'assignments' | 'progress' | 'star_ranking' | 'rewards' | 'achievements';
}

export const LearningGamification: React.FC<LearningGamificationProps> = ({ initialSubTab = 'star_ranking' }) => {
  const { 
    assignments, 
    deleteAssignment,
    submissions,
    rewards, 
    redeemReward, 
    students,
    teachers
  } = useData();

  const [activeTab, setActiveTab] = useState<'assignments' | 'progress' | 'star_ranking' | 'rewards' | 'achievements'>(initialSubTab);

  // Sync tab and reset sub-state when initialSubTab changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
      setIsAssignmentModalOpen(false);
      setAssignmentToEdit(null);
      setIsRewardModalOpen(false);
      setSelectedRewardToEdit(null);
      setSubmissionToGrade(null);
      setRewardSearch('');
      setRewardCategoryFilter('all');
      setAssignmentSearch('');
      setAssignmentStudentFilter('all');
      setAssignmentLevelFilter('all');
    }
  }, [initialSubTab]);
  
  // Modals state
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<Assignment | null>(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [selectedRewardToEdit, setSelectedRewardToEdit] = useState<RewardItem | null>(null);
  const [submissionToGrade, setSubmissionToGrade] = useState<Submission | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rewards filter
  const [rewardCategoryFilter, setRewardCategoryFilter] = useState<string>('all');
  const [rewardSearch, setRewardSearch] = useState<string>('');

  // Assignments filter
  const [assignmentStudentFilter, setAssignmentStudentFilter] = useState<string>('all');
  const [assignmentLevelFilter, setAssignmentLevelFilter] = useState<string>('all');
  const [assignmentSearch, setAssignmentSearch] = useState<string>('');
  const [assignmentViewMode, setAssignmentViewMode] = useState<'cards' | 'submissions'>('cards');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddAssignment = () => {
    setAssignmentToEdit(null);
    setIsAssignmentModalOpen(true);
  };

  const handleOpenEditAssignment = (asg: Assignment) => {
    setAssignmentToEdit(asg);
    setIsAssignmentModalOpen(true);
  };

  const handleDeleteAssignment = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài tập "${title}"?`)) {
      deleteAssignment(id);
      showToast('Đã xóa bài tập thành công!');
    }
  };

  const handleOpenAddReward = () => {
    setSelectedRewardToEdit(null);
    setIsRewardModalOpen(true);
  };

  const handleOpenEditReward = (reward: RewardItem) => {
    setSelectedRewardToEdit(reward);
    setIsRewardModalOpen(true);
  };

  const filteredRewards = rewards.filter(r => {
    const matchesCat = rewardCategoryFilter === 'all' || 
      (r.category || '').toLowerCase().includes(rewardCategoryFilter.toLowerCase());
    const matchesSearch = !rewardSearch.trim() || 
      r.name.toLowerCase().includes(rewardSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredAssignments = assignments.filter(asg => {
    const matchesStudent = assignmentStudentFilter === 'all' || asg.studentId === assignmentStudentFilter;
    const matchesLevel = assignmentLevelFilter === 'all' || (asg.studentLevel || '').includes(assignmentLevelFilter);
    const matchesSearch = !assignmentSearch.trim() || 
      (asg.title || '').toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      (asg.studentName || '').toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      (asg.subjectName || '').toLowerCase().includes(assignmentSearch.toLowerCase());
    return matchesStudent && matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="w-full lg:w-auto lg:max-w-md xl:max-w-xl min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-300/40 dark:border-amber-700/40 shrink-0">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight break-words leading-snug">
                Học Tập & Bảng Xếp Hạng Sao
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                Giao bài tập cá nhân hóa theo từng học viên & trình độ, chấm video bài nộp, bảng vinh danh Top 3 Pro và kho đổi quà thưởng.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end gap-2 w-full lg:w-auto shrink-0 min-w-0">
          {activeTab === 'rewards' && (
            <button
              onClick={handleOpenAddReward}
              className="col-span-2 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer transition-all text-center"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="truncate">+ Thêm / Cấu hình quà mới</span>
            </button>
          )}

          {activeTab === 'assignments' && (
            <button
              onClick={handleOpenAddAssignment}
              className="col-span-2 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 cursor-pointer transition-all text-center"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="truncate">+ Giao bài theo học viên</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Toolbar - Natural scrolling toolbar on mobile */}
      <div className="relative py-1 sm:py-2 flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 overflow-hidden w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-200/70 dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 overflow-x-auto scrollbar-none no-scrollbar flex-nowrap max-w-full touch-pan-x">
          <button
            onClick={() => setActiveTab('star_ranking')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'star_ranking' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            <span>Bảng Xếp Hạng Top 3 Pro ⭐</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'assignments' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Bài tập ({assignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'rewards' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Kho Đổi Quà ({rewards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'achievements' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Huy hiệu</span>
          </button>
        </div>
      </div>

      {/* SUBTAB: BẢNG XẾP HẠNG SAO - GIAO DIỆN VINH DANH PRO */}
      {activeTab === 'star_ranking' && (
        <TopThreeHonorPodium
          title="Bảng Vàng Vinh Danh Học Viên Xuất Sắc"
          subtitle="Tuyên dương 3 gương mặt học viên dẫn đầu bảng sao với ảnh đại diện, bộ môn âm nhạc và thành tích nổi bật"
          showFilters={true}
          showFullLeaderboardBelow={true}
        />
      )}

      {/* SUBTAB: BÀI TẬP CÁ NHÂN HÓA THEO TỪNG HỌC VIÊN */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {/* Concept Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-indigo-500/10 border border-blue-300/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                🎼
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm">
                  Cơ Chế Giao Bài Tập Cá Nhân Hóa (1-1) Theo Trình Độ Riêng Biệt
                </p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Mỗi học viên có năng khiếu, nhạc cụ và trình độ riêng (Vỡ lòng, Grade 1-8). Giáo viên giao tác phẩm cụ thể, tốc độ Metronome, bản sheet và lời nhắc riêng cho từng em.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setAssignmentViewMode('cards')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  assignmentViewMode === 'cards' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Danh sách bài tập ({assignments.length})
              </button>
              <button
                onClick={() => setAssignmentViewMode('submissions')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  assignmentViewMode === 'submissions' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Bài nộp & Chấm điểm ({submissions.length})
              </button>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Học viên:</span>
              </div>
              <select
                value={assignmentStudentFilter}
                onChange={(e) => setAssignmentStudentFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold text-slate-800"
              >
                <option value="all">Tất cả học viên ({students.length})</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.code || s.id})</option>
                ))}
              </select>

              <div className="flex items-center gap-1 text-xs font-bold text-slate-600 ml-2">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>Trình độ:</span>
              </div>
              <select
                value={assignmentLevelFilter}
                onChange={(e) => setAssignmentLevelFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold text-slate-800"
              >
                <option value="all">Tất cả trình độ</option>
                <option value="Vỡ lòng">Vỡ lòng</option>
                <option value="Cơ bản">Cơ bản (Grade 1-2)</option>
                <option value="Trung cấp">Trung cấp (Grade 3-4)</option>
                <option value="Nâng cao">Nâng cao (Grade 5+)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={assignmentSearch}
                  onChange={(e) => setAssignmentSearch(e.target.value)}
                  placeholder="Tìm bài tập, học viên, bộ môn..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <button
                onClick={handleOpenAddAssignment}
                className="px-3.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold flex items-center gap-1 border border-amber-200 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Giao Bài Mới</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: Danh Sách Bài Tập Cá Nhân */}
          {assignmentViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssignments.map((asg) => {
                const student = students.find(s => s.id === asg.studentId);
                const relatedSubmissions = submissions.filter(s => s.assignmentId === asg.id);
                const hasPendingSubmission = relatedSubmissions.some(s => s.status === 'pending');
                const hasGradedSubmission = relatedSubmissions.some(s => s.status === 'graded');

                return (
                  <div 
                    key={asg.id} 
                    className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Student Info Bar */}
                      <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200/70">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={asg.studentName || 'Học viên'}
                            className="w-8 h-8 rounded-full object-cover border border-amber-300"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs">
                              {asg.studentName || student?.fullName || 'Học viên cá nhân'}
                            </p>
                            <p className="text-[11px] text-slate-500 font-semibold">
                              {asg.subjectName || 'Bộ môn'} • <span className="text-amber-700 font-bold">{asg.studentLevel || 'Cơ bản'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                            Hạn: {asg.dueDate}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 font-heading leading-snug">
                          {asg.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {asg.description}
                        </p>
                      </div>

                      {/* Technical specifications */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {asg.targetBpm && (
                          <div className="flex items-center gap-1.5 bg-orange-50/80 px-2.5 py-1.5 rounded-xl border border-orange-200 text-orange-900 font-bold text-[11px]">
                            <Gauge className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                            <span>Metronome: {asg.targetBpm} BPM</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 bg-amber-50/80 px-2.5 py-1.5 rounded-xl border border-amber-200 text-amber-900 font-bold text-[11px]">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                          <span>+{asg.bonusStars || 5} ⭐ | +{asg.rewardPoints || 15} 🎁</span>
                        </div>
                      </div>

                      {/* Custom Teacher Note for student weakness */}
                      {asg.customNotes && (
                        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs">
                          <p className="font-bold flex items-center gap-1 text-[11px] text-blue-800">
                            <MessageSquare className="w-3 h-3" /> Lời dặn riêng của giáo viên:
                          </p>
                          <p className="mt-0.5 font-medium italic text-[11px] leading-relaxed">
                            "{asg.customNotes}"
                          </p>
                        </div>
                      )}

                      {/* Sheet Music & Audio Links */}
                      {(asg.sheetMusicUrl || asg.audioUrl) && (
                        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                          {asg.sheetMusicUrl && (
                            <a
                              href={asg.sheetMusicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1"
                            >
                              <Link className="w-3 h-3 text-emerald-600" />
                              <span>Sheet nhạc mẫu</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                            </a>
                          )}

                          {asg.audioUrl && (
                            <a
                              href={asg.audioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1"
                            >
                              <Music className="w-3 h-3 text-rose-600" />
                              <span>Audio / Beat mẫu</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        {hasPendingSubmission ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 animate-pulse">
                            ⚠️ Có bài nộp chờ chấm
                          </span>
                        ) : hasGradedSubmission ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            ✓ Đã nộp & Đã chấm
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">
                            Chưa nộp bài
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {relatedSubmissions.length > 0 && (
                          <button
                            onClick={() => setSubmissionToGrade(relatedSubmissions[0])}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Chấm Bài ({relatedSubmissions.length})</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditAssignment(asg)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa bài tập"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa bài tập"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW 2: Danh Sách Bài Nộp & Chấm Điểm */}
          {assignmentViewMode === 'submissions' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center justify-between">
                <span>Tất cả bài thực hành đã nộp từ học viên</span>
                <span className="text-blue-600">{submissions.length} bài nộp</span>
              </div>

              <div className="divide-y divide-slate-100">
                {submissions.map((sub) => {
                  const student = students.find(s => s.id === sub.studentId);
                  const asg = assignments.find(a => a.id === sub.assignmentId);

                  return (
                    <div key={sub.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={sub.studentName || 'Học viên'}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 text-sm">
                              {sub.studentName || student?.fullName}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              sub.status === 'graded' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {sub.status === 'graded' ? '✓ Đã chấm' : '⏳ Chờ chấm'}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-700 mt-0.5">
                            {asg?.title || 'Bài tập thực hành'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Nộp lúc: {sub.submittedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {sub.grade && (
                          <div className="text-right hidden md:block">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">Đánh giá</span>
                            <span className="font-extrabold text-blue-700 text-xs">{sub.grade}</span>
                          </div>
                        )}

                        <button
                          onClick={() => setSubmissionToGrade(sub)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{sub.status === 'graded' ? 'Xem lại & Sửa điểm' : 'Chấm điểm ngay'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB: KHO ĐỔI QUÀ (CÓ CẤU HÌNH SAO, ẢNH, TÊN QUÀ) */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          {/* Decoupling Explanation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 border border-amber-300/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                🎁
              </div>
              <div>
                <p className="font-extrabold text-slate-800 text-sm">
                  Cơ Chế Điểm Thưởng Đổi Quà & Sao Vinh Danh Tách Biệt
                </p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  Đổi quà sẽ <strong>trừ vào Điểm Thưởng Đổi Quà</strong> của học viên. <strong>Điểm Sao Vinh Danh trên Bảng Xếp Hạng (BXH)</strong> luôn được bảo toàn 100% trọn đời và không bị khấu trừ!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 font-bold text-[11px] shadow-xs flex items-center gap-1">
                ⭐ Sao BXH: Bất biến
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[11px] shadow-xs flex items-center gap-1">
                🎁 Điểm Đổi Quà: Khấu trừ khi đổi
              </span>
            </div>
          </div>

          {/* Filters and Management Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span>Danh mục:</span>
              </span>
              {['all', 'Nhạc cụ & Phụ kiện', 'Giáo trình', 'Quà lưu niệm', 'Voucher'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setRewardCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    rewardCategoryFilter === cat
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Tất cả quà' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={rewardSearch}
                  onChange={(e) => setRewardSearch(e.target.value)}
                  placeholder="Tìm quà tặng..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              <button
                onClick={handleOpenAddReward}
                className="px-3.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center gap-1 border border-rose-200 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Quà Mới</span>
              </button>
            </div>
          </div>

          {/* Grid Rewards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRewards.map((r) => {
              const pts = r.pointsRequired ?? r.requiredPoints ?? 50;
              const img = r.imageUrl || r.image || 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&auto=format&fit=crop&q=80';

              return (
                <div 
                  key={r.id} 
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-rose-300"
                >
                  <div>
                    {/* Image Header with quick actions */}
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img 
                        src={img} 
                        alt={r.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        referrerPolicy="no-referrer" 
                      />
                      
                      {/* Category Tag */}
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/90 backdrop-blur-xs text-rose-700 shadow-sm">
                        {r.category || 'Quà tặng'}
                      </span>

                      {/* Edit button overlay */}
                      <button
                        onClick={() => handleOpenEditReward(r)}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-xs transition-all shadow-md cursor-pointer flex items-center gap-1 text-xs font-bold"
                        title="Chỉnh sửa cấu hình quà"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px]">Cấu hình</span>
                      </button>

                      {/* Stock Badge */}
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs flex items-center gap-1">
                        <Package className="w-3 h-3 text-slate-400" />
                        <span>Còn {r.stock ?? 20} phần</span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-extrabold text-base text-slate-900 font-heading line-clamp-1">
                        {r.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {r.description || 'Quà tặng rèn luyện âm nhạc hấp dẫn dành cho học viên chăm chỉ.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Điểm thưởng cần đổi</span>
                        <div className="flex items-center gap-1.5 text-base font-black text-rose-600">
                          <Gift className="w-4 h-4 text-rose-500" />
                          <span>{pts} điểm</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditReward(r)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Sửa cấu hình quà tặng (Tên, Ảnh, Điểm đổi)"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">Cấu hình</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            const st = students[0];
                            if (st) {
                              const res = redeemReward(st.id, r.id);
                              if (res.success) {
                                showToast(`Đã đổi thành công quà "${r.name}" cho ${st.fullName}! (Trừ ${pts} điểm thưởng, giữ nguyên sao BXH)`);
                              } else {
                                alert(res.error || 'Không thể đổi quà');
                              }
                            }
                          }}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer"
                        >
                          Đổi Quà
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB: THÀNH TÍCH */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Chuyên Cần Vàng', desc: 'Điểm danh đủ 100% các buổi trong tháng', icon: '🌟', color: 'bg-amber-50 text-amber-800' },
            { title: 'Bàn Tay Vàng Piano', desc: 'Hoàn thành trọn vẹn giáo trình Grade 2', icon: '🎹', color: 'bg-indigo-50 text-indigo-800' },
            { title: 'Ngôi Sao Sân Khấu', desc: 'Tham gia biểu diễn báo cáo cuối khóa tại Nhà hát', icon: '🎭', color: 'bg-rose-50 text-rose-800' },
            { title: 'Luyện Tập Bất Bại', desc: 'Tích lũy chuỗi 30 ngày quay video bài tập', icon: '🔥', color: 'bg-orange-50 text-orange-800' },
            { title: 'Đôi Tai Tuyệt Đối', desc: 'Đạt điểm tối đa bài kiểm tra xướng âm & tiết tấu', icon: '🎼', color: 'bg-teal-50 text-teal-800' },
            { title: 'Chiến Binh Sao Sáng', desc: 'Đạt mốc 100 Sao tích lũy tại Minh Music', icon: '⭐', color: 'bg-purple-50 text-purple-800' },
          ].map((ach, i) => (
            <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
              <div className="text-3xl">{ach.icon}</div>
              <h3 className="font-extrabold text-sm text-slate-900 font-heading">{ach.title}</h3>
              <p className="text-xs text-slate-500">{ach.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CẤU HÌNH & THÊM/SỬA QUÀ TẶNG */}
      <RewardConfigModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        rewardToEdit={selectedRewardToEdit}
        onSaved={() => showToast('Đã lưu cấu hình quà tặng thành công!')}
      />

      {/* MODAL GIAO BÀI TẬP CÁ NHÂN HÓA 1-1 */}
      <IndividualAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        assignmentToEdit={assignmentToEdit}
      />

      {/* MODAL CHẤM ĐIỂM & NHẬN XÉT BÀI TẬP */}
      {submissionToGrade && (
        <GradeSubmissionModal
          isOpen={!!submissionToGrade}
          onClose={() => setSubmissionToGrade(null)}
          submission={submissionToGrade}
          assignment={assignments.find(a => a.id === submissionToGrade.assignmentId)}
        />
      )}
    </div>
  );
};
