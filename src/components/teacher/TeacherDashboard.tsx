import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AttendanceStatus, Assignment, Submission, Student } from '../../types';
import { UserProfileModal } from '../profile/UserProfileModal';
import { IndividualAssignmentModal } from '../gamification/IndividualAssignmentModal';
import { GradeSubmissionModal } from '../gamification/GradeSubmissionModal';
import { RealtimeGreetingCard } from '../common/RealtimeGreetingCard';
import {
  CalendarDays,
  School,
  CheckSquare,
  FileText,
  Clock,
  Music,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Camera,
  Plus,
  Star,
  Gauge,
  Video,
  UserCheck,
  ShieldCheck,
  Unlock,
  Lock,
  Check,
  Palmtree
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    classes, 
    students, 
    assignments, 
    submissions, 
    markAttendance, 
    recordAttendance,
    attendanceRecords, 
    makeupSessions, 
    getTodayBirthdays,
    isHolidayDate
  } = useData();

  // Find classes taught by this teacher (or all classes for demo)
  const myClasses = classes || [];
  const [selectedClassId, setSelectedClassId] = useState<string>(myClasses[0]?.id || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Modals for individual assignments & grading
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedStudentForAssignment, setSelectedStudentForAssignment] = useState<string | undefined>(undefined);
  const [submissionToGrade, setSubmissionToGrade] = useState<Submission | null>(null);

  const todayBirthdays = getTodayBirthdays ? getTodayBirthdays() : [];
  const selectedClass = myClasses.find(c => c.id === selectedClassId) || myClasses[0] || {
    id: 'sample-class',
    code: 'LH001',
    name: 'Piano Cơ Bản 01',
    subject: 'Piano',
    room: 'Phòng 01 (Piano Upright)',
    scheduleText: 'Thứ 2 - Thứ 4 (17:30 - 19:00)',
    teacherId: 'GV001',
    teacherName: 'Thầy Hoàng Minh',
    studentIds: ['std-01', 'std-02', 'std-03'],
    maxStudents: 6,
    currentStudents: 3,
    status: 'active' as const
  };
  const todayDate = new Date().toISOString().split('T')[0];

  // Reset drafts & state on class selection change
  useEffect(() => {
    setPendingDrafts({});
    setUnlockedStudentIds([]);
    setConfirmModalStudent(null);
  }, [selectedClassId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Draft attendance states before verification
  const [pendingDrafts, setPendingDrafts] = useState<Record<string, AttendanceStatus>>({});
  const [unlockedStudentIds, setUnlockedStudentIds] = useState<string[]>([]);
  const [confirmModalStudent, setConfirmModalStudent] = useState<{ student: Student; status: AttendanceStatus; stars: number } | null>(null);

  const getStarsForStatus = (status: AttendanceStatus): number => {
    switch (status) {
      case 'present':
      case 'makeup':
        return 2;
      case 'late':
        return 1;
      case 'absent_unexcused':
      case 'absent_no_leave':
        return -2;
      case 'absent_excused':
      case 'absent_with_leave':
      default:
        return 0;
    }
  };

  const handleSelectStatusDraft = (studentId: string, status: AttendanceStatus) => {
    const existingRec = attendanceRecords?.find(
      r => r.studentId === studentId && r.classId === selectedClass.id && r.date === todayDate
    );
    const isAlreadyVerified = existingRec && existingRec.isVerified && !unlockedStudentIds.includes(studentId);

    if (isAlreadyVerified) {
      showToast('⚠️ Học viên đã được xác thực điểm danh. Bấm "Mở khóa sửa" nếu cần thay đổi!');
      return;
    }

    setPendingDrafts(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleOpenVerifyModal = (student: Student) => {
    const existingRec = attendanceRecords?.find(
      r => r.studentId === student.id && r.classId === selectedClass.id && r.date === todayDate
    );
    const status = pendingDrafts[student.id] || existingRec?.status || 'present';
    const stars = getStarsForStatus(status);

    setConfirmModalStudent({
      student,
      status,
      stars
    });
  };

  const handleConfirmTeacherAttendance = () => {
    if (!confirmModalStudent) return;
    const { student, status, stars } = confirmModalStudent;

    recordAttendance({
      studentId: student.id,
      studentName: student.fullName,
      classId: selectedClass.id,
      className: selectedClass.name,
      subjectName: selectedClass.subject || selectedClass.subjectName || 'Âm nhạc',
      date: todayDate,
      status,
      starsAwarded: stars,
      recordedBy: currentUser?.displayName ? `GV ${currentUser.displayName}` : 'Giáo viên',
      isVerified: true,
      verifiedBy: currentUser?.displayName || 'Giáo viên',
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    setPendingDrafts(prev => {
      const next = { ...prev };
      delete next[student.id];
      return next;
    });
    setUnlockedStudentIds(prev => prev.filter(id => id !== student.id));
    setConfirmModalStudent(null);
    showToast(`✓ Đã xác thực điểm danh cho ${student.fullName} (${status === 'present' ? '+2⭐' : status === 'late' ? '+1⭐' : status === 'absent_unexcused' ? '-2⭐' : '0⭐'})!`);
  };

  const handleUnlockStudent = (studentId: string) => {
    setUnlockedStudentIds(prev => [...prev, studentId]);
    showToast('Đã mở khóa để chỉnh sửa điểm danh. Bấm "Xác thực" để lưu lại!');
  };

  const handleOpenAssignModalForStudent = (studentId?: string) => {
    setSelectedStudentForAssignment(studentId);
    setIsAssignmentModalOpen(true);
  };

  // Get class students (enrolled in class OR enrolled in this subject)
  const classStudents = students.filter(s => 
    selectedClass.studentIds?.includes(s.id) || 
    s.enrolledClassIds?.includes(selectedClass.id) ||
    s.enrolledSubjects?.some(sub => (selectedClass.subject || '').toLowerCase().includes(sub.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* LỜI CHÀO THỜI GIAN THỰC & LỜI CHÚC TRUYỀN CẢM HỨNG */}
      <RealtimeGreetingCard 
        userName={currentUser?.displayName || 'Thầy/Cô'}
        variant="card"
        showClock={true}
      />

      {/* Header & Quick Action Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase">
            CỔNG GIẢNG VIÊN • MINH MUSIC
          </span>
          <h1 className="text-2xl font-black mt-2 font-heading">
            Xin chào, {currentUser?.displayName || 'Thầy/Cô'}!
          </h1>
          <p className="text-blue-100 text-xs mt-1">
            Điểm danh trực tiếp, giao bài tập cá nhân hóa 1-1 theo trình độ và chấm video thực hành của từng học viên.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => handleOpenAssignModalForStudent(classStudents[0]?.id)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Giao Bài Theo Học Viên</span>
          </button>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl border border-white/30 text-white transition-all cursor-pointer flex flex-col items-center gap-1 text-xs font-bold"
            title="Xem hồ sơ & đổi mật khẩu"
          >
            <UserCheck className="w-5 h-5" />
            <span>Hồ sơ</span>
          </button>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <School className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-slate-700 text-xs">Lớp đang giảng dạy:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-900"
          >
            {myClasses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.subject}) - {c.scheduleText}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-semibold flex items-center gap-3">
          <span>Phòng: <strong className="text-slate-800">{selectedClass.room || 'Phòng 01'}</strong></span>
          <span>Sĩ số: <strong className="text-blue-700">{classStudents.length} học viên</strong></span>
        </div>
      </div>

      {/* Main Grid: 2 Cols Left (Students & Individual Tasks), 1 Col Right (Submissions to Grade & Makeup) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Danh Sách Học Viên Trong Lớp & Điểm Danh / Giao Bài Cá Nhân */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Học Viên Trong Lớp ({classStudents.length})
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-400">Hôm nay: {todayDate}</span>
            </div>

            {/* Holiday Notice for Teacher */}
            {(() => {
              const holCheck = isHolidayDate ? isHolidayDate(todayDate) : { isHoliday: false };
              if (holCheck.isHoliday && holCheck.holiday) {
                return (
                  <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-300 flex items-center justify-between gap-3 text-amber-900 animate-in fade-in">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                        <Palmtree className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-amber-950">
                          🌴 Hôm nay là ngày nghỉ lễ: "{holCheck.holiday.name}" ({holCheck.holiday.startDate} → {holCheck.holiday.endDate})
                        </p>
                        <p className="text-[11px] text-amber-800">
                          Trung tâm tự động miễn tính vào lịch điểm danh của học viên. Học viên không bị trừ sao và số buổi học được bảo lưu.
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                      Lễ / Nghỉ
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-3">
              {classStudents.map((st) => {
                const rec = attendanceRecords?.find(
                  r => r.studentId === st.id && r.classId === selectedClass.id && r.date === todayDate
                );
                const isVerified = rec && rec.isVerified && !unlockedStudentIds.includes(st.id);
                const draft = pendingDrafts[st.id];
                const activeStatus = draft || rec?.status || 'present';
                const hasPendingDraft = !!draft;

                // Find active assignments for this specific student
                const studentAssignments = assignments.filter(
                  a => a.studentId === st.id || a.targetStudentIds?.includes(st.id)
                );

                return (
                  <div 
                    key={st.id} 
                    className={`p-4 rounded-2xl border transition-colors space-y-3 ${
                      hasPendingDraft 
                        ? 'border-amber-300 bg-amber-50/50' 
                        : isVerified 
                        ? 'border-slate-200 bg-slate-50/50' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.avatar || st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={st.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-amber-300 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-slate-900 text-sm">{st.fullName}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                              {st.level || 'Cơ bản'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            ⭐ {st.totalStars ?? st.stars ?? 0} Sao BXH • 🎁 {st.rewardPoints ?? 0} đ thưởng • {st.phone || '0901234567'}
                          </p>
                        </div>
                      </div>

                      {/* Attendance Buttons & Verification */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Có mặt (+2⭐) */}
                        <button
                          disabled={isVerified}
                          onClick={() => handleSelectStatusDraft(st.id, 'present')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeStatus === 'present' 
                              ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/50' 
                              : isVerified
                              ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
                          }`}
                        >
                          ✓ Có mặt (+2⭐)
                        </button>

                        {/* Nghỉ phép (0⭐) */}
                        <button
                          disabled={isVerified}
                          onClick={() => handleSelectStatusDraft(st.id, 'absent_excused')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeStatus === 'absent_excused' 
                              ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-400/50' 
                              : isVerified
                              ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50'
                          }`}
                        >
                          Nghỉ phép (0⭐)
                        </button>

                        {/* Muộn (+1⭐) */}
                        <button
                          disabled={isVerified}
                          onClick={() => handleSelectStatusDraft(st.id, 'late')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeStatus === 'late' 
                              ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-400/50' 
                              : isVerified
                              ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-purple-50'
                          }`}
                        >
                          Muộn (+1⭐)
                        </button>

                        {/* Vắng không phép (-2⭐) */}
                        <button
                          disabled={isVerified}
                          onClick={() => handleSelectStatusDraft(st.id, 'absent_unexcused')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeStatus === 'absent_unexcused' 
                              ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400/50' 
                              : isVerified
                              ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50'
                          }`}
                        >
                          Vắng KP (-2⭐)
                        </button>

                        {/* Verification Button / Indicator */}
                        {isVerified ? (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đã ghi nhận</span>
                            </span>
                            <button
                              onClick={() => handleUnlockStudent(st.id)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold cursor-pointer"
                              title="Mở khóa để điểm danh lại"
                            >
                              <Unlock className="w-3.5 h-3.5 text-amber-600" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenVerifyModal(st)}
                            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Xác thực</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenAssignModalForStudent(st.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all cursor-pointer flex items-center gap-1"
                          title="Giao bài tập riêng cho học viên này"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Giao bài riêng</span>
                        </button>
                      </div>
                    </div>

                    {/* Assigned Tasks for this specific student */}
                    {studentAssignments.length > 0 && (
                      <div className="pt-2.5 border-t border-slate-200/70 space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          <Music className="w-3 h-3 text-blue-600" /> Bài tập riêng đã giao cho {st.fullName}:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {studentAssignments.map(asg => (
                            <div key={asg.id} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                              <p className="font-bold text-slate-900 truncate">{asg.title}</p>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                                <span>{asg.targetBpm ? `${asg.targetBpm} BPM` : 'Hạn: ' + asg.dueDate}</span>
                                <span className="text-amber-600 font-bold">+{asg.bonusStars || 5} ⭐</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Bài Tập & Video Cần Chấm + Lịch Dạy Bù */}
        <div className="space-y-4">
          {/* Submissions & Tasks to Grade */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                Bài Tập Cần Chấm & Nhận Xét
              </h3>
              <span className="text-xs font-bold text-blue-600">{submissions.length} bài</span>
            </div>
            
            <div className="space-y-2.5">
              {submissions.map(sub => {
                const asg = assignments.find(a => a.id === sub.assignmentId);
                return (
                  <div key={sub.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{sub.studentName || 'Học viên'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        sub.status === 'graded' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sub.status === 'graded' ? 'Đã chấm' : 'Chờ chấm'}
                      </span>
                    </div>

                    <p className="text-slate-700 font-semibold truncate">
                      {asg?.title || 'Bài tập thực hành'}
                    </p>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Nộp: {sub.submittedAt}</span>
                      <button
                        onClick={() => setSubmissionToGrade(sub)}
                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Video className="w-3 h-3" />
                        <span>{sub.status === 'graded' ? 'Xem lại' : 'Chấm ngay'} →</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Makeup Sessions */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Lịch Dạy Bù Sắp Tới
              </h3>
            </div>

            <div className="space-y-2">
              {makeupSessions.map(mk => (
                <div key={mk.id} className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs">
                  <div className="flex justify-between font-bold text-indigo-950">
                    <span>{mk.studentName}</span>
                    <span className="text-indigo-600">{mk.makeupDate}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">Giờ: {mk.makeupTime} • {mk.room}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Giao Bài Tập Cá Nhân Modal */}
      <IndividualAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        defaultStudentId={selectedStudentForAssignment}
      />

      {/* Chấm Điểm & Nhận Xét Modal */}
      {submissionToGrade && (
        <GradeSubmissionModal
          isOpen={!!submissionToGrade}
          onClose={() => setSubmissionToGrade(null)}
          submission={submissionToGrade}
          assignment={assignments.find(a => a.id === submissionToGrade.assignmentId)}
        />
      )}

      {/* Teacher Verification Confirmation Modal */}
      {confirmModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 font-heading">
                    Xác Thực Điểm Danh (Giáo Viên)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Xác nhận 1 lần nữa để ghi nhận vào hệ thống & khóa tránh trùng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmModalStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Học viên:</span>
                <strong className="text-slate-900 text-sm">{confirmModalStudent.student.fullName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Lớp / Môn:</span>
                <strong className="text-blue-700">{selectedClass.name} ({selectedClass.subject})</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Ngày điểm danh:</span>
                <strong className="text-slate-800">{todayDate}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Trạng thái:</span>
                <span className={`px-2.5 py-1 rounded-lg font-bold ${
                  confirmModalStudent.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                  confirmModalStudent.status === 'late' ? 'bg-purple-100 text-purple-800' :
                  confirmModalStudent.status === 'absent_unexcused' ? 'bg-rose-100 text-rose-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {confirmModalStudent.status === 'present' ? '✓ Có mặt' : confirmModalStudent.status === 'late' ? '⏱ Đến muộn' : confirmModalStudent.status === 'absent_unexcused' ? '✕ Vắng KP' : '📋 Nghỉ phép'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-semibold">Biến động sao thưởng:</span>
                <strong className={`text-sm ${
                  confirmModalStudent.stars > 0 ? 'text-amber-600' : confirmModalStudent.stars < 0 ? 'text-rose-600' : 'text-slate-600'
                }`}>
                  {confirmModalStudent.stars > 0 ? `+${confirmModalStudent.stars} ⭐` : `${confirmModalStudent.stars} ⭐`}
                </strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmModalStudent(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmTeacherAttendance}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>XÁC THỰC & GHI NHẬN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
};
