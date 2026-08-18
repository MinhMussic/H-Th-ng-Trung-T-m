import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { AttendanceRecord, AttendanceStatus, Student, ClassItem } from '../../types';
import {
  CheckSquare,
  RefreshCw,
  Clock,
  Sparkles,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Users,
  School,
  History,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
  Unlock,
  ShieldCheck,
  Filter,
  Check,
  RotateCcw,
  Palmtree,
  Bell,
  Send,
  Smartphone,
  MessageSquare,
  Phone,
  UserCheck,
  Star,
  Info
} from 'lucide-react';
import { 
  formatAttendancePushMessage, 
  requestWebPushPermission, 
  getWebPushPermissionStatus 
} from '../../utils/pushNotification';

interface AttendanceManagementProps {
  initialSubTab?: 'attendance' | 'history' | 'makeup' | 'reservations' | 'trial';
}

export const AttendanceManagement: React.FC<AttendanceManagementProps> = ({ initialSubTab = 'attendance' }) => {
  const { 
    attendanceRecords, 
    markAttendance,
    recordAttendance,
    makeupSessions, 
    addMakeupSession, 
    updateMakeupStatus,
    reservationRequests,
    updateReservationStatus,
    students,
    classes,
    teachers,
    isHolidayDate,
    holidays
  } = useData();

  const [activeTab, setActiveTab] = useState<'attendance' | 'history' | 'makeup' | 'reservations' | 'trial'>(initialSubTab);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [studentScopeFilter, setStudentScopeFilter] = useState<'class_and_subject' | 'enrolled_only' | 'all'>('class_and_subject');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  // Sync tab and reset filters when initialSubTab changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
      setSearchQuery('');
      setPendingDrafts({});
      setConfirmModalData(null);
      setIsBackdateModalOpen(false);
      setIsMakeupModalOpen(false);
    }
  }, [initialSubTab]);

  // Draft pending state for 2-step verification workflow
  // Key: studentId -> { status, note }
  const [pendingDrafts, setPendingDrafts] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});
  const [unlockedStudentIds, setUnlockedStudentIds] = useState<string[]>([]);
  const [confirmModalData, setConfirmModalData] = useState<{
    student: Student;
    status: AttendanceStatus;
    note: string;
    stars: number;
    isBatch?: boolean;
    batchList?: { student: Student; status: AttendanceStatus; note: string; stars: number }[];
  } | null>(null);

  // Backdated / Missed Attendance Modal
  const [isBackdateModalOpen, setIsBackdateModalOpen] = useState(false);
  const [backdateStudentId, setBackdateStudentId] = useState(students[0]?.id || '');
  const [backdateClassId, setBackdateClassId] = useState(classes[0]?.id || '');
  const [backdateDate, setBackdateDate] = useState(new Date().toISOString().split('T')[0]);
  const [backdateSessionNumber, setBackdateSessionNumber] = useState(1);
  const [backdateStatus, setBackdateStatus] = useState<AttendanceStatus>('present');
  const [backdateStars, setBackdateStars] = useState(2);
  const [backdateNote, setBackdateNote] = useState('Điểm danh bổ sung buổi học.');
  const [backdateEvaluation, setBackdateEvaluation] = useState('Học viên tiếp thu tốt, thái độ học tập nghiêm túc.');

  // New Makeup session modal
  const [isMakeupModalOpen, setIsMakeupModalOpen] = useState<boolean>(false);
  const [makeupStudentId, setMakeupStudentId] = useState<string>(students[0]?.id || '');
  const [makeupTeacherId, setMakeupTeacherId] = useState<string>(teachers[0]?.id || '');
  const [makeupDate, setMakeupDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [makeupTime, setMakeupTime] = useState<string>('09:00 - 10:30');
  const [makeupRoom, setMakeupRoom] = useState<string>('Phòng Piano 01');
  const [makeupReason, setMakeupReason] = useState<string>('Bù buổi nghỉ ốm');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Calculate default stars based on standard rules:
  // - Có mặt đúng lịch: +2 sao
  // - Nghỉ phép (Bù): 0 sao
  // - Đến muộn: +1 sao
  // - Vắng không phép: -2 sao
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

  // Filter students based on enrolled class, enrolled subject, or all
  const filteredStudentsForClass = students.filter(st => {
    if (!selectedClass) return true;
    if (studentScopeFilter === 'all') return true;

    const isEnrolledInClass = selectedClass.studentIds?.includes(st.id) || st.enrolledClassIds?.includes(selectedClass.id);
    if (studentScopeFilter === 'enrolled_only') {
      return isEnrolledInClass;
    }

    // Default: class_and_subject (học viên thuộc lớp HOẶC đã đăng ký môn học của lớp này)
    const classSubject = (selectedClass.subject || selectedClass.subjectName || '').toLowerCase();
    const isEnrolledInSubject = st.enrolledSubjects?.some(sub => 
      classSubject.includes(sub.toLowerCase()) || sub.toLowerCase().includes(classSubject)
    );

    return isEnrolledInClass || isEnrolledInSubject;
  });

  // Step 1: User selects a draft status (Chờ xác thực)
  const handleSelectDraftStatus = (studentId: string, status: AttendanceStatus, note?: string) => {
    const existingRec = attendanceRecords.find(
      r => r.studentId === studentId && r.classId === selectedClassId && r.date === selectedDate
    );
    const isAlreadyVerified = existingRec && existingRec.isVerified && !unlockedStudentIds.includes(studentId);

    if (isAlreadyVerified) {
      // Prompt user to unlock first
      showToast('⚠️ Buổi học này đã được xác thực trước đó. Vui lòng bấm "Mở khóa sửa" để thay đổi!');
      return;
    }

    setPendingDrafts(prev => ({
      ...prev,
      [studentId]: {
        status,
        note: note !== undefined ? note : (prev[studentId]?.note || existingRec?.note || '')
      }
    }));
  };

  const handleUpdateDraftNote = (studentId: string, note: string) => {
    setPendingDrafts(prev => {
      const current = prev[studentId] || {
        status: (attendanceRecords.find(r => r.studentId === studentId && r.classId === selectedClassId && r.date === selectedDate)?.status || 'present'),
        note: ''
      };
      return {
        ...prev,
        [studentId]: {
          ...current,
          note
        }
      };
    });
  };

  // Step 2: Open Single Student Verification Modal / Prompt
  const handleRequestVerifyStudent = (student: Student) => {
    const existingRec = attendanceRecords.find(
      r => r.studentId === student.id && r.classId === selectedClassId && r.date === selectedDate
    );
    const draft = pendingDrafts[student.id];
    const statusToVerify: AttendanceStatus = draft?.status || existingRec?.status || 'present';
    const noteToVerify = draft?.note !== undefined ? draft.note : (existingRec?.note || '');
    const stars = getStarsForStatus(statusToVerify);

    setConfirmModalData({
      student,
      status: statusToVerify,
      note: noteToVerify,
      stars,
      isBatch: false
    });
  };

  // Quick action: Mark all as present in drafts
  const handleSelectAllPresentDraft = () => {
    const newDrafts: Record<string, { status: AttendanceStatus; note: string }> = { ...pendingDrafts };
    filteredStudentsForClass.forEach(st => {
      newDrafts[st.id] = {
        status: 'present',
        note: newDrafts[st.id]?.note || ''
      };
    });
    setPendingDrafts(newDrafts);
    showToast(`Đã chọn trạng thái "Có mặt (+2⭐)" cho ${filteredStudentsForClass.length} học viên. Bấm "Xác thực" để lưu!`);
  };

  // Step 2 (Batch): Open Batch Verification Modal
  const handleRequestVerifyBatch = () => {
    const listToVerify = filteredStudentsForClass.map(st => {
      const existingRec = attendanceRecords.find(
        r => r.studentId === st.id && r.classId === selectedClassId && r.date === selectedDate
      );
      const draft = pendingDrafts[st.id];
      const status: AttendanceStatus = draft?.status || existingRec?.status || 'present';
      const note = draft?.note !== undefined ? draft.note : (existingRec?.note || '');
      return {
        student: st,
        status,
        note,
        stars: getStarsForStatus(status)
      };
    });

    if (listToVerify.length === 0) {
      showToast('Không có học viên nào trong danh sách lớp.');
      return;
    }

    setConfirmModalData({
      student: listToVerify[0].student,
      status: 'present',
      note: '',
      stars: 2,
      isBatch: true,
      batchList: listToVerify
    });
  };

  // Confirm and save to DataContext
  const handleConfirmVerification = () => {
    if (!confirmModalData) return;

    if (confirmModalData.isBatch && confirmModalData.batchList) {
      // Batch verification
      confirmModalData.batchList.forEach(item => {
        recordAttendance({
          studentId: item.student.id,
          studentName: item.student.fullName,
          classId: selectedClassId,
          className: selectedClass?.name || 'Lớp Âm Nhạc',
          subjectName: selectedClass?.subjectName || selectedClass?.subject || 'Âm nhạc',
          date: selectedDate,
          status: item.status,
          starsAwarded: item.stars,
          note: item.note,
          recordedBy: 'Quản trị viên (Đã xác thực)',
          isVerified: true,
          verifiedBy: 'Quản trị viên',
          verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });
      });

      // Clear drafts and locks
      setPendingDrafts({});
      setUnlockedStudentIds([]);
      setConfirmModalData(null);
      showToast(`✓ Đã xác thực & ghi nhận điểm danh cho toàn bộ ${confirmModalData.batchList.length} học viên!`);
    } else {
      // Single student verification
      const { student, status, note, stars } = confirmModalData;
      recordAttendance({
        studentId: student.id,
        studentName: student.fullName,
        classId: selectedClassId,
        className: selectedClass?.name || 'Lớp Âm Nhạc',
        subjectName: selectedClass?.subjectName || selectedClass?.subject || 'Âm nhạc',
        date: selectedDate,
        status,
        starsAwarded: stars,
        note,
        recordedBy: 'Quản trị viên (Đã xác thực)',
        isVerified: true,
        verifiedBy: 'Quản trị viên',
        verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });

      // Clear draft for this student
      setPendingDrafts(prev => {
        const next = { ...prev };
        delete next[student.id];
        return next;
      });
      setUnlockedStudentIds(prev => prev.filter(id => id !== student.id));
      setConfirmModalData(null);
      showToast(`✓ Đã xác thực điểm danh cho học viên ${student.fullName} (${status === 'present' ? '+2⭐' : status === 'late' ? '+1⭐' : status === 'absent_unexcused' ? '-2⭐' : '0⭐'})!`);
    }
  };

  const handleUnlockForEdit = (studentId: string) => {
    setUnlockedStudentIds(prev => [...prev, studentId]);
    showToast('Đã mở khóa điểm danh để điều chỉnh. Sau khi sửa vui lòng bấm "Xác thực" lại!');
  };

  const handleSaveBackdatedAttendance = () => {
    const student = students.find(s => s.id === backdateStudentId);
    const cls = classes.find(c => c.id === backdateClassId);

    recordAttendance({
      studentId: backdateStudentId,
      studentName: student?.fullName || 'Học viên',
      classId: backdateClassId,
      className: cls?.name || 'Lớp Âm Nhạc',
      subjectName: cls?.subjectName || cls?.subject || 'Âm nhạc',
      date: backdateDate,
      sessionNumber: backdateSessionNumber,
      status: backdateStatus,
      starsAwarded: getStarsForStatus(backdateStatus),
      note: backdateNote,
      evaluation: backdateEvaluation,
      recordedBy: 'Quản trị viên (Điểm danh bù)',
      isBackdated: true,
      isVerified: true,
      verifiedBy: 'Quản trị viên',
      verifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    setIsBackdateModalOpen(false);
    showToast(`Đã điểm danh bù ngày ${backdateDate} cho học viên ${student?.fullName}!`);
  };

  const handleSaveMakeup = () => {
    const student = students.find(s => s.id === makeupStudentId);
    const teacher = teachers.find(t => t.id === makeupTeacherId);

    addMakeupSession({
      studentId: makeupStudentId,
      studentName: student?.fullName || 'Học viên',
      originalDate: selectedDate,
      makeupDate,
      makeupTime,
      teacherId: makeupTeacherId,
      teacherName: teacher?.fullName || 'Giáo viên',
      room: makeupRoom,
      reason: makeupReason,
      status: 'scheduled'
    });

    setIsMakeupModalOpen(false);
    showToast('Đã xếp lịch học bù thành công!');
  };

  const filteredHistory = attendanceRecords.filter(r => {
    const matchesSearch = searchQuery === '' ||
      r.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.className?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subjectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.note?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="w-full lg:w-auto lg:max-w-md xl:max-w-xl min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-300/40 dark:border-emerald-700/40 shrink-0">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight break-words leading-snug">
                Điểm Danh, Học Bù & Bảo Lưu
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                Quy định sao chuẩn: <strong>Có mặt (+2⭐)</strong>, <strong>Đi muộn (+1⭐)</strong>, <strong>Nghỉ phép (0⭐)</strong>, <strong>Vắng KP (-2⭐)</strong>. Hỗ trợ điểm danh đa môn và xác thực an toàn.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end gap-2 w-full lg:w-auto shrink-0 min-w-0">
          <button
            onClick={() => setIsBackdateModalOpen(true)}
            className="col-span-1 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all text-center"
          >
            <CalendarCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">+ Điểm danh bù</span>
          </button>

          {activeTab === 'makeup' && (
            <button
              onClick={() => setIsMakeupModalOpen(true)}
              className="col-span-1 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all text-center"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">Xếp lịch học bù</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Toolbar - Natural scrolling without floating conflicts */}
      <div className="relative py-1 sm:py-2 flex items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/60 overflow-hidden w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-200/70 dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 overflow-x-auto scrollbar-none no-scrollbar flex-nowrap max-w-full touch-pan-x">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'attendance' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Điểm danh lớp</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Lịch sử ({attendanceRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('makeup')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'makeup' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Học bù ({makeupSessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'reservations' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Bảo lưu ({reservationRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('trial')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[38px] ${
              activeTab === 'trial' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Học thử</span>
          </button>
        </div>

        {/* Collapsible toolbar toggle */}
        <button
          onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer shrink-0"
        >
          <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{isFilterCollapsed ? 'Hiện bộ lọc' : 'Thu gọn bộ lọc'}</span>
          {isFilterCollapsed ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronUp className="w-3.5 h-3.5 shrink-0" />}
        </button>
      </div>

      {/* SUBTAB: ĐIỂM DANH */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 max-w-full overflow-hidden">
          {!isFilterCollapsed && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 animate-in fade-in duration-200 w-full max-w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full lg:flex-1 min-w-0">
                <div className="w-full min-w-0">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 truncate">
                    1. Chọn Lớp Học / Môn Học:
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => {
                      setSelectedClassId(e.target.value);
                      setPendingDrafts({});
                    }}
                    className="w-full max-w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 truncate"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} • {c.subject || c.subjectName || 'Âm nhạc'} (GV: {c.teacherName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full min-w-0">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 truncate">
                    2. Ngày Điểm Danh:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setPendingDrafts({});
                    }}
                    className="w-full max-w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                  />
                </div>

                <div className="w-full min-w-0 sm:col-span-2 lg:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 truncate">
                    3. Phạm Vi Học Viên:
                  </label>
                  <select
                    value={studentScopeFilter}
                    onChange={(e) => setStudentScopeFilter(e.target.value as any)}
                    className="w-full max-w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white truncate"
                  >
                    <option value="class_and_subject">Theo môn học & lớp học ({selectedClass?.subject || 'Môn'})</option>
                    <option value="enrolled_only">Chỉ học viên trong danh sách lớp</option>
                    <option value="all">Tất cả học viên trung tâm</option>
                  </select>
                </div>
              </div>

              {/* Class Info Badge */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto shrink-0 min-w-0">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 min-w-0">
                  <School className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{selectedClass?.room || 'Phòng học'} • {selectedClass?.schedule || selectedClass?.scheduleText || 'Lịch chuẩn'}</span>
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 whitespace-nowrap text-center">
                  Sĩ số: {filteredStudentsForClass.length} học viên
                </span>
              </div>
            </div>
          )}

          {/* Holiday Alert Banner if selectedDate is holiday */}
          {(() => {
            const holCheck = isHolidayDate ? isHolidayDate(selectedDate) : { isHoliday: false };
            if (holCheck.isHoliday && holCheck.holiday) {
              return (
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 rounded-2xl border border-amber-300 dark:border-amber-700/60 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                      <Palmtree className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-amber-950 dark:text-amber-100">
                        🌴 Ngày {selectedDate} là ngày nghỉ lễ: "{holCheck.holiday.name}" ({holCheck.holiday.startDate} → {holCheck.holiday.endDate})
                      </p>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300">
                        Hệ thống đã tự động kích hoạt chế độ Miễn Trừ Điểm Danh: Học viên vắng mặt sẽ không bị trừ sao chuyên cần (-2⭐) và số buổi học được bảo lưu.
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider">
                    Đã miễn trừ
                  </span>
                </div>
              );
            }
            return null;
          })()}

          {/* Action Toolbar: Multi-Select & Batch Verify */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Cơ chế xác thực an toàn:
              </span>
              <button
                onClick={handleSelectAllPresentDraft}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Chọn tất cả Có mặt (+2⭐)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRequestVerifyBatch}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>⚡ XÁC THỰC TOÀN BỘ DANH SÁCH ({filteredStudentsForClass.length})</span>
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                  <th className="p-3">Mã & Học Viên</th>
                  <th className="p-3">Bộ Môn Đăng Ký</th>
                  <th className="p-3">Trạng Thái Buổi Học</th>
                  <th className="p-3">Ghi Chú Tiến Độ</th>
                  <th className="p-3 text-center">Xác Thực (Chống Trùng)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudentsForClass.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      Không có học viên nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredStudentsForClass.map((st) => {
                    // Match uniquely by studentId, classId, and date (supports multiple subjects on the same date)
                    const rec = attendanceRecords.find(
                      r => r.studentId === st.id && r.classId === selectedClassId && r.date === selectedDate
                    );
                    const isVerified = rec && rec.isVerified && !unlockedStudentIds.includes(st.id);
                    const draft = pendingDrafts[st.id];
                    const activeStatus = draft?.status || rec?.status || 'present';
                    const activeNote = draft?.note !== undefined ? draft.note : (rec?.note || '');
                    const hasPendingDraft = !!draft;

                    // Other enrolled subjects of this student (for multi-subject transparency)
                    const otherSubjects = (st.enrolledSubjects || []).filter(
                      sub => !sub.toLowerCase().includes((selectedClass?.subject || '').toLowerCase())
                    );

                    return (
                      <tr 
                        key={st.id} 
                        className={`transition-colors ${
                          hasPendingDraft 
                            ? 'bg-amber-50/70 dark:bg-amber-950/20' 
                            : isVerified 
                            ? 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40' 
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Student ID & Name */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                              {st.code}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{st.fullName}</span>
                              <span className="text-[10px] text-slate-400">
                                ⭐ {st.totalStars ?? st.stars ?? 0} Sao • 🎁 {st.rewardPoints ?? 0} đ
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Enrolled Subjects */}
                        <td className="p-3">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-700 dark:text-slate-300 block">
                              {selectedClass?.subject || selectedClass?.subjectName || 'Âm nhạc'}
                            </span>
                            {otherSubjects.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">
                                  + {otherSubjects.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Attendance Status Buttons */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Có mặt (+2⭐) */}
                            <button
                              disabled={isVerified}
                              onClick={() => handleSelectDraftStatus(st.id, 'present')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                activeStatus === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/50'
                                  : isVerified
                                  ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              ✓ Có mặt (+2⭐)
                            </button>

                            {/* Nghỉ phép (0⭐) */}
                            <button
                              disabled={isVerified}
                              onClick={() => handleSelectDraftStatus(st.id, 'absent_excused')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                activeStatus === 'absent_excused'
                                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-400/50'
                                  : isVerified
                                  ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                              }`}
                            >
                              Nghỉ phép (0⭐)
                            </button>

                            {/* Đến muộn (+1⭐) */}
                            <button
                              disabled={isVerified}
                              onClick={() => handleSelectDraftStatus(st.id, 'late')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                activeStatus === 'late'
                                  ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-400/50'
                                  : isVerified
                                  ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                                  : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                              }`}
                            >
                              Đến muộn (+1⭐)
                            </button>

                            {/* Vắng không phép (-2⭐) */}
                            <button
                              disabled={isVerified}
                              onClick={() => handleSelectDraftStatus(st.id, 'absent_unexcused')}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                activeStatus === 'absent_unexcused'
                                  ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400/50'
                                  : isVerified
                                  ? 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
                                  : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                              }`}
                            >
                              Vắng KP (-2⭐)
                            </button>
                          </div>
                        </td>

                        {/* Progress Note */}
                        <td className="p-3">
                          <input
                            type="text"
                            disabled={isVerified}
                            placeholder="Nhận xét buổi học..."
                            value={activeNote}
                            onChange={(e) => handleUpdateDraftNote(st.id, e.target.value)}
                            className={`w-full text-xs p-2 rounded-lg border ${
                              isVerified 
                                ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' 
                                : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500'
                            }`}
                          />
                        </td>

                        {/* Verification & Anti-Duplicate Action Column */}
                        <td className="p-3 text-center">
                          {isVerified ? (
                            <div className="flex items-center justify-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Đã ghi nhận</span>
                              </span>
                              <button
                                onClick={() => handleUnlockForEdit(st.id)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors"
                                title="Mở khóa để chỉnh sửa lại điểm danh này"
                              >
                                <Unlock className="w-3 h-3 text-amber-600" />
                                <span>Sửa</span>
                              </button>
                            </div>
                          ) : hasPendingDraft ? (
                            <button
                              onClick={() => handleRequestVerifyStudent(st)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs shadow-sm flex items-center gap-1.5 mx-auto cursor-pointer animate-pulse transition-all"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Xác thực ngay</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRequestVerifyStudent(st)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5 mx-auto cursor-pointer transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Xác thực</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: LỊCH SỬ ĐIỂM DANH */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên học viên, lớp học hoặc ghi chú..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white"
              />
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Tổng số bản ghi: <span className="text-slate-900 dark:text-white">{filteredHistory.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                  <th className="p-3">Ngày Điểm Danh</th>
                  <th className="p-3">Học Viên</th>
                  <th className="p-3">Lớp & Môn Học</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3">Biến Động Sao</th>
                  <th className="p-3">Nhận Xét Của GV</th>
                  <th className="p-3">Xác Thực Bởi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Chưa có bản ghi điểm danh nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-800 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rec.date}</span>
                          {rec.isBackdated && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                              Bù
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {rec.studentName}
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        <span className="font-semibold">{rec.className || rec.subjectName || 'Âm nhạc'}</span>
                        {rec.subjectName && rec.className && rec.subjectName !== rec.className && (
                          <span className="text-[11px] text-slate-400 block">{rec.subjectName}</span>
                        )}
                      </td>

                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                          rec.status === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'late'
                            ? 'bg-purple-100 text-purple-800'
                            : rec.status === 'makeup'
                            ? 'bg-blue-100 text-blue-800'
                            : rec.status === 'absent_excused'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rec.status === 'present' ? '✓ Có mặt (+2⭐)' : rec.status === 'late' ? '⏱ Đến muộn (+1⭐)' : rec.status === 'makeup' ? '🔄 Học bù (+2⭐)' : rec.status === 'absent_excused' ? '📋 Nghỉ phép (0⭐)' : '✕ Vắng KP (-2⭐)'}
                        </span>
                      </td>

                      <td className="p-3 font-bold">
                        <span className={
                          (rec.starsAwarded ?? 0) > 0 
                            ? 'text-amber-600' 
                            : (rec.starsAwarded ?? 0) < 0 
                            ? 'text-rose-600' 
                            : 'text-slate-500'
                        }>
                          {(rec.starsAwarded ?? 0) > 0 ? `+${rec.starsAwarded} ⭐` : `${rec.starsAwarded ?? 0} ⭐`}
                        </span>
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={rec.note || rec.evaluation}>
                        {rec.note || rec.evaluation || '-'}
                      </td>

                      <td className="p-3 text-slate-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{rec.verifiedBy || rec.recordedBy || 'Quản trị viên'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: HỌC BÙ */}
      {activeTab === 'makeup' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                  <th className="p-3">Học Viên</th>
                  <th className="p-3">Ngày Nghỉ Gốc</th>
                  <th className="p-3">Lịch Học Bù</th>
                  <th className="p-3">Giáo Viên Phụ Trách</th>
                  <th className="p-3">Phòng Học</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {makeupSessions.length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400">Không có lịch học bù nào</td></tr>
                ) : (
                  makeupSessions.map((mk) => (
                    <tr key={mk.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{mk.studentName}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{mk.originalDate}</td>
                      <td className="p-3 font-bold text-indigo-700 dark:text-indigo-400">{mk.makeupDate} • {mk.makeupTime}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{mk.teacherName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{mk.room}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mk.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : mk.status === 'scheduled'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {mk.status === 'completed' ? 'Đã học xong (+2⭐)' : mk.status === 'scheduled' ? 'Đã xếp lịch' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {mk.status === 'scheduled' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                updateMakeupStatus(mk.id, 'completed');
                                showToast('Đã ghi nhận hoàn thành buổi học bù (+2⭐)!');
                              }}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                            >
                              Hoàn thành
                            </button>
                            <button
                              onClick={() => {
                                updateMakeupStatus(mk.id, 'cancelled');
                                showToast('Đã hủy lịch học bù.');
                              }}
                              className="px-2 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded text-[10px] font-bold hover:bg-rose-100 cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: BẢO LƯU */}
      {activeTab === 'reservations' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                  <th className="p-3">Học Viên</th>
                  <th className="p-3">Khóa Học</th>
                  <th className="p-3">Thời Gian Bảo Lưu</th>
                  <th className="p-3">Lý Do</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3 text-right">Duyệt Đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reservationRequests.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400">Không có đơn bảo lưu nào</td></tr>
                ) : (
                  reservationRequests.map((rv) => (
                    <tr key={rv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{rv.studentName}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{rv.courseName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{rv.startDate} đến {rv.endDate}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{rv.reason}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rv.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : rv.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {rv.status === 'approved' ? 'Đã duyệt' : rv.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {rv.status === 'pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                updateReservationStatus(rv.id, 'approved');
                                showToast('Đã duyệt đơn bảo lưu!');
                              }}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700 cursor-pointer"
                            >
                              Duyệt đơn
                            </button>
                            <button
                              onClick={() => {
                                updateReservationStatus(rv.id, 'rejected');
                                showToast('Đã từ chối đơn bảo lưu.');
                              }}
                              className="px-2 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded text-[10px] font-bold hover:bg-rose-100 cursor-pointer"
                            >
                              Từ chối
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: HỌC THỬ */}
      {activeTab === 'trial' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <p className="text-xs text-slate-500">
            Quản lý học viên đăng ký trải nghiệm lớp học thử trước khi chính thức nhập học.
          </p>
          <div className="p-6 bg-slate-50 rounded-2xl text-center">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h3 className="font-extrabold text-sm text-slate-800">Danh sách Học Thử Đang Hoạt Động</h3>
            <p className="text-xs text-slate-500 mt-1">Các học viên trải nghiệm sẽ được cộng 2 sao khi hoàn tất buổi học thử.</p>
          </div>
        </div>
      )}

      {/* MODAL XÁC THỰC ĐIỂM DANH (2-STEP CONFIRMATION) */}
      {confirmModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white font-heading">
                    {confirmModalData.isBatch ? 'Xác Thực Điểm Danh Toàn Lớp' : 'Xác Thực Điểm Danh Học Viên'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Xác nhận 1 lần nữa để ghi nhận chính thức, tránh điểm danh trùng lặp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmModalData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {confirmModalData.isBatch ? (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">
                    Lớp: <strong className="text-slate-900 dark:text-white">{selectedClass?.name}</strong>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">
                    Bộ môn: <strong className="text-emerald-700">{selectedClass?.subject || selectedClass?.subjectName}</strong>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">
                    Ngày điểm danh: <strong className="text-slate-900 dark:text-white">{selectedDate}</strong>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">
                    Số lượng: <strong className="text-blue-700">{confirmModalData.batchList?.length} học viên</strong>
                  </p>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2">
                  {confirmModalData.batchList?.map(item => (
                    <div key={item.student.id} className="py-1.5 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-white">{item.student.fullName}</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        item.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'late' ? 'bg-purple-100 text-purple-800' :
                        item.status === 'absent_unexcused' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status === 'present' ? 'Có mặt (+2⭐)' : item.status === 'late' ? 'Muộn (+1⭐)' : item.status === 'absent_unexcused' ? 'Vắng KP (-2⭐)' : 'Nghỉ phép (0⭐)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Học viên:</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{confirmModalData.student.fullName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Môn học:</span>
                    <strong className="text-emerald-700">{selectedClass?.subject || selectedClass?.subjectName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Ngày điểm danh:</span>
                    <strong className="text-slate-800 dark:text-white">{selectedDate}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Trạng thái:</span>
                    <span className={`px-2.5 py-1 rounded-lg font-bold ${
                      confirmModalData.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                      confirmModalData.status === 'late' ? 'bg-purple-100 text-purple-800' :
                      confirmModalData.status === 'absent_unexcused' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {confirmModalData.status === 'present' ? '✓ Có mặt' : confirmModalData.status === 'late' ? '⏱ Đến muộn' : confirmModalData.status === 'absent_unexcused' ? '✕ Vắng không phép' : '📋 Nghỉ phép'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                    <span className="text-slate-500 font-semibold">Biến động sao BXH:</span>
                    <strong className={`text-sm ${
                      confirmModalData.stars > 0 ? 'text-amber-600' : confirmModalData.stars < 0 ? 'text-rose-600' : 'text-slate-600'
                    }`}>
                      {confirmModalData.stars > 0 ? `+${confirmModalData.stars} ⭐` : `${confirmModalData.stars} ⭐`}
                    </strong>
                  </div>
                </div>

                {confirmModalData.note && (
                  <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-200/50">
                    Nhận xét: "{confirmModalData.note}"
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setConfirmModalData(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmVerification}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>XÁC THỰC & GHI NHẬN NGAY</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ĐIỂM DANH BÙ (BỔ SUNG) */}
      {isBackdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                    Điểm Danh Bù / Bổ Sung Buổi Học
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ghi nhận cho các buổi bị quên hoặc chưa điểm danh trong quá khứ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBackdateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Học Viên:</label>
                  <select
                    value={backdateStudentId}
                    onChange={(e) => setBackdateStudentId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.code} - {s.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lớp Học / Môn Học:</label>
                  <select
                    value={backdateClassId}
                    onChange={(e) => setBackdateClassId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.subject})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ngày Điểm Danh Bù:</label>
                  <input
                    type="date"
                    value={backdateDate}
                    onChange={(e) => setBackdateDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Buổi Học Thứ:</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={backdateSessionNumber}
                    onChange={(e) => setBackdateSessionNumber(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Trạng Thái:</label>
                  <select
                    value={backdateStatus}
                    onChange={(e) => setBackdateStatus(e.target.value as AttendanceStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                  >
                    <option value="present">✓ Có mặt (+2⭐)</option>
                    <option value="late">⏱ Đến muộn (+1⭐)</option>
                    <option value="absent_excused">📋 Nghỉ có phép (0⭐)</option>
                    <option value="absent_unexcused">✕ Vắng không phép (-2⭐)</option>
                    <option value="makeup">🔄 Đã học bù (+2⭐)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ghi Chú Tiến Độ:</label>
                <input
                  type="text"
                  value={backdateNote}
                  onChange={(e) => setBackdateNote(e.target.value)}
                  placeholder="Nội dung bài tập hoặc lý do điểm danh bù..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đánh Giá Của Giáo Viên:</label>
                <textarea
                  rows={2}
                  value={backdateEvaluation}
                  onChange={(e) => setBackdateEvaluation(e.target.value)}
                  placeholder="Nhận xét sự tiến bộ của học viên..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsBackdateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveBackdatedAttendance}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>LƯU ĐIỂM DANH BÙ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XẾP LỊCH HỌC BÙ */}
      {isMakeupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
              Xếp Lịch Học Bù Mới
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Học Viên:</label>
                <select
                  value={makeupStudentId}
                  onChange={(e) => setMakeupStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Giáo Viên Dạy Bù:</label>
                <select
                  value={makeupTeacherId}
                  onChange={(e) => setMakeupTeacherId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ngày Bù:</label>
                  <input
                    type="date"
                    value={makeupDate}
                    onChange={(e) => setMakeupDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Giờ Bù:</label>
                  <input
                    type="text"
                    value={makeupTime}
                    onChange={(e) => setMakeupTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phòng Học Bù:</label>
                <input
                  type="text"
                  value={makeupRoom}
                  onChange={(e) => setMakeupRoom(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lý Do:</label>
                <input
                  type="text"
                  value={makeupReason}
                  onChange={(e) => setMakeupReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsMakeupModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveMakeup}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs"
              >
                Xác Nhận Xếp Lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
