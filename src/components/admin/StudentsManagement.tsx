import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Student, Gender, ReservationRecord, TrialLesson, RegistrationRequest } from '../../types';
import {
  GraduationCap,
  Plus,
  Minus,
  Gift,
  Search,
  Filter,
  Phone,
  Cake,
  Star,
  Edit2,
  Trash2,
  Sparkles,
  Music,
  CheckCircle2,
  XCircle,
  HeartHandshake,
  PauseCircle,
  PlayCircle,
  UserCheck,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  DollarSign,
  QrCode,
  Lock,
  Unlock,
  ShieldAlert,
  X
} from 'lucide-react';
import { getNextAvailableStudentCode, getNextTrialCode, isStudentCodeProtectedOrLocked } from '../../utils/studentCode';
import { EditStudentCourseScheduleModal } from './EditStudentCourseScheduleModal';
import { ScheduleChangeApprovalModal } from './ScheduleChangeApprovalModal';

export const StudentsManagement: React.FC = () => {
  const {
    students,
    subjects,
    courses,
    classes,
    teachers,
    reservations,
    trialLessons,
    registrationRequests,
    scheduleChangeRequests,
    addStudent,
    updateStudent,
    deleteStudent,
    toggleLockStudent,
    awardStars,
    adjustStudentStars,
    approveRegistrationRequest,
    rejectRegistrationRequest,
    reserveStudentAccount,
    reactivateStudentAccount,
    convertTrialToOfficial,
    cancelReservation,
    addTrialLesson,
    updateTrialLesson
  } = useData();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending_registration' | 'trial' | 'reserved' | 'locked' | 'history_reservations'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Modals ---
  // 1. Add/Edit Student Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Piano']);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [totalLessons, setTotalLessons] = useState<number>(24);
  const [status, setStatus] = useState<'active' | 'inactive' | 'reserved' | 'trial' | 'locked' | 'completed'>('active');

  // 2. Adjust Stars & Reward Points Modal (Cộng / Trừ Điểm & Lý do)
  const [starStudent, setStarStudent] = useState<Student | null>(null);
  const [starActionType, setStarActionType] = useState<'add' | 'deduct'>('add');
  const [starTarget, setStarTarget] = useState<'both' | 'stars' | 'rewardPoints'>('both');
  const [starCount, setStarCount] = useState<number>(5);
  const [starReason, setStarReason] = useState<string>('Hoàn thành xuất sắc bài luyện tập & chuyên cần');

  // 3. Class Assignment & Registration Approval Modal (Phân lớp & duyệt đăng ký môn)
  const [assignModalReq, setAssignModalReq] = useState<RegistrationRequest | null>(null);
  const [assignTargetClassId, setAssignTargetClassId] = useState<string>('');
  const [assignTotalLessons, setAssignTotalLessons] = useState<number>(24);
  const [assignAdminNote, setAssignAdminNote] = useState<string>('Đã xếp lịch học phù hợp');

  // 3. Reserve Account Modal (Bảo lưu)
  const [reserveModalStudent, setReserveModalStudent] = useState<Student | null>(null);
  const [reserveStartDate, setReserveStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reserveEndDate, setReserveEndDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [reserveReason, setReserveReason] = useState('Bận lịch học văn hóa tại trường / Ôn thi');
  const [reserveNotes, setReserveNotes] = useState('');

  // 4. Reactivate Account Modal (Khôi phục đi học lại)
  const [reactivateModalStudent, setReactivateModalStudent] = useState<Student | null>(null);
  const [reactivateClassId, setReactivateClassId] = useState('');

  // 5. Convert Trial To Official Modal (Chuyển học thử sang chính thức)
  const [convertModalStudent, setConvertModalStudent] = useState<Student | null>(null);
  const [targetCourseId, setTargetCourseId] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [targetLessons, setTargetLessons] = useState(24);
  const [targetTuition, setTargetTuition] = useState(4800000);
  const [targetOfficialCode, setTargetOfficialCode] = useState('');

  // 6. Quick Create Trial Modal (Tạo tài khoản học thử)
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [trialName, setTrialName] = useState('');
  const [trialPhone, setTrialPhone] = useState('');
  const [trialGuardian, setTrialGuardian] = useState('');
  const [trialSubject, setTrialSubject] = useState('Piano');
  const [trialDate, setTrialDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [trialTime, setTrialTime] = useState('18:00');
  const [trialTeacherId, setTrialTeacherId] = useState('');
  const [trialNotes, setTrialNotes] = useState('Học thử trải nghiệm đánh giá cảm thụ âm nhạc');

  // 7. Lock / Protect Student Code Modal
  const [lockModalStudent, setLockModalStudent] = useState<Student | null>(null);
  const [lockReason, setLockReason] = useState<string>('Tạm khóa tài khoản theo yêu cầu bảo vệ quyền riêng tư');

  // 8. Delete & Clean Student Code Modal
  const [deleteModalStudent, setDeleteModalStudent] = useState<Student | null>(null);

  // 9. Edit Course & Schedule / Sessions Modal
  const [isEditCourseScheduleModalOpen, setIsEditCourseScheduleModalOpen] = useState(false);
  const [studentForCourseScheduleEdit, setStudentForCourseScheduleEdit] = useState<Student | null>(null);

  // 10. Schedule Change Approvals Modal
  const [isScheduleChangeModalOpen, setIsScheduleChangeModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Counts
  const activeCount = students.filter(s => s.status === 'active').length;
  const trialCount = students.filter(s => s.status === 'trial').length;
  const reservedCount = students.filter(s => s.status === 'reserved').length;
  const lockedCount = students.filter(s => s.status === 'locked').length;
  const pendingRegistrations = (registrationRequests || []).filter(r => r.status === 'pending');
  const unassignedStudents = students.filter(s => (!s.enrolledClassIds || s.enrolledClassIds.length === 0) && s.status === 'active');
  const pendingCount = pendingRegistrations.length + unassignedStudents.length;
  const pendingScheduleCount = (scheduleChangeRequests || []).filter(r => r.status === 'pending').length;

  const filteredStudents = students.filter(s => {
    if (activeTab === 'active' && s.status !== 'active') return false;
    if (activeTab === 'trial' && s.status !== 'trial') return false;
    if (activeTab === 'reserved' && s.status !== 'reserved') return false;
    if (activeTab === 'locked' && s.status !== 'locked') return false;
    if (activeTab === 'pending_registration') {
      return (!s.enrolledClassIds || s.enrolledClassIds.length === 0) && s.status === 'active';
    }
    if (subjectFilter !== 'ALL' && !s.enrolledSubjects?.includes(subjectFilter)) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.guardianName && s.guardianName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Open Standard Student Modal with next clean available code
  const handleOpenAdd = () => {
    setEditingStudent(null);
    const nextCode = getNextAvailableStudentCode(students);
    setCode(nextCode);
    setFullName('');
    setBirthDate('2015-05-20');
    setGender('female');
    setPhone('');
    setEmail('');
    setAddress('');
    setSelectedSubjects([subjects[0]?.name || 'Piano']);
    setSelectedClassId(classes[0]?.id || '');
    setGuardianName('');
    setGuardianPhone('');
    setTotalLessons(24);
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setCode(s.code);
    setFullName(s.fullName);
    setBirthDate(s.birthDate);
    setGender(s.gender);
    setPhone(s.phone || '');
    setEmail(s.email || '');
    setAddress(s.address || '');
    setSelectedSubjects(s.enrolledSubjects || []);
    setSelectedClassId(s.enrolledClassIds?.[0] || '');
    setGuardianName(s.guardianName || '');
    setGuardianPhone(s.guardianPhone || '');
    setTotalLessons(s.totalLessons || 24);
    setStatus(s.status);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !birthDate) {
      showToast('Vui lòng nhập đầy đủ Họ tên và Ngày sinh!');
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        code,
        fullName,
        birthDate,
        gender,
        phone,
        email,
        address,
        enrolledSubjects: selectedSubjects,
        enrolledClassIds: selectedClassId ? [selectedClassId] : [],
        guardianName,
        guardianPhone,
        totalLessons,
        status
      });
      showToast(`Đã cập nhật hồ sơ học viên ${fullName}`);
    } else {
      addStudent({
        code,
        fullName,
        birthDate,
        gender,
        phone,
        email,
        address,
        enrolledSubjects: selectedSubjects,
        enrolledClassIds: selectedClassId ? [selectedClassId] : [],
        guardianName,
        guardianPhone,
        totalStars: 10,
        stars: 10,
        rewardPoints: 10,
        totalLessons,
        completedLessons: 0,
        remainingLessons: totalLessons,
        status,
        joinedDate: new Date().toISOString().split('T')[0]
      });
      showToast(`Đã thêm mới học viên ${fullName}`);
    }

    setIsModalOpen(false);
  };

  // Open Reserve Modal
  const handleOpenReserve = (s: Student) => {
    setReserveModalStudent(s);
    setReserveStartDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    setReserveEndDate(d.toISOString().split('T')[0]);
    setReserveReason('Bận lịch học văn hóa tại trường / Ôn thi');
    setReserveNotes(`Giữ nguyên ${s.remainingLessons || 0} buổi học và ${s.stars || 0} sao thưởng.`);
  };

  const handleConfirmReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveModalStudent) return;
    reserveStudentAccount(
      reserveModalStudent.id,
      reserveStartDate,
      reserveEndDate,
      reserveReason,
      reserveNotes
    );
    showToast(`Đã bảo lưu tài khoản học viên ${reserveModalStudent.fullName} thành công!`);
    setReserveModalStudent(null);
  };

  // Open Reactivate Modal
  const handleOpenReactivate = (s: Student) => {
    setReactivateModalStudent(s);
    setReactivateClassId(classes[0]?.id || '');
  };

  const handleConfirmReactivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reactivateModalStudent) return;
    reactivateStudentAccount(reactivateModalStudent.id, reactivateClassId);
    showToast(`Học viên ${reactivateModalStudent.fullName} đã tiếp tục học tập!`);
    setReactivateModalStudent(null);
  };

  // Open Convert Trial Modal
  const handleOpenConvertTrial = (s: Student) => {
    setConvertModalStudent(s);
    setTargetCourseId(courses[0]?.id || '');
    setTargetClassId(classes[0]?.id || '');
    setTargetLessons(24);
    const firstCourse = courses[0];
    const initialFee = firstCourse ? (typeof firstCourse.fee === 'number' ? firstCourse.fee : 4800000) : 4800000;
    setTargetTuition(initialFee);
    // Generate next official code
    const existingOfficialNums = students
      .filter(st => st.code && st.code.startsWith('HV'))
      .map(st => parseInt(st.code.replace('HV', ''), 10))
      .filter(n => !isNaN(n));
    const maxNum = existingOfficialNums.length > 0 ? Math.max(...existingOfficialNums) : 6;
    setTargetOfficialCode(`HV${String(maxNum + 1).padStart(3, '0')}`);
  };

  const handleConfirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertModalStudent) return;
    const res = convertTrialToOfficial(
      convertModalStudent.id,
      targetCourseId,
      targetClassId,
      targetLessons,
      targetTuition,
      targetOfficialCode
    );
    if (res.success) {
      showToast(`🎉 Đã chuyển học viên ${convertModalStudent.fullName} sang CHÍNH THỨC (${targetOfficialCode}) & sinh hóa đơn học phí!`);
    } else {
      showToast(res.error || 'Có lỗi xảy ra khi chuyển học viên');
    }
    setConvertModalStudent(null);
  };

  // Create Trial Student
  const handleCreateTrialStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialName.trim()) {
      showToast('Vui lòng nhập họ tên học viên học thử!');
      return;
    }

    const trialCode = `HT${String(Date.now()).slice(-3)}`;
    const selTeacher = teachers.find(t => t.id === trialTeacherId) || teachers[0];

    // 1. Add student as trial
    addStudent({
      code: trialCode,
      fullName: trialName,
      birthDate: '2016-01-01',
      gender: 'male',
      phone: trialPhone,
      email: '',
      address: '',
      enrolledSubjects: [trialSubject],
      guardianName: trialGuardian || trialName,
      guardianPhone: trialPhone,
      totalStars: 5,
      stars: 5,
      rewardPoints: 5,
      totalLessons: 1,
      completedLessons: 0,
      remainingLessons: 1,
      status: 'trial',
      joinedDate: new Date().toISOString().split('T')[0],
      notes: `Học thử môn ${trialSubject} ngày ${trialDate} lúc ${trialTime}. ${trialNotes}`
    });

    // 2. Add trial lesson record
    addTrialLesson({
      studentName: trialName,
      parentName: trialGuardian || trialName,
      parentPhone: trialPhone,
      subject: trialSubject,
      preferredDate: trialDate,
      timeSlot: trialTime,
      teacherId: selTeacher?.id,
      teacherName: selTeacher?.fullName,
      status: 'scheduled',
      notes: trialNotes
    });

    showToast(`Đã tạo tài khoản học thử cho em ${trialName} (${trialCode})!`);
    setIsTrialModalOpen(false);
    setTrialName('');
    setTrialPhone('');
    setTrialGuardian('');
  };

  const handleConfirmAdjustStars = () => {
    if (!starStudent) return;
    if (!starReason.trim()) {
      showToast('Vui lòng nhập lý do cộng/trừ điểm!');
      return;
    }
    const count = Math.max(1, Number(starCount) || 1);
    adjustStudentStars(
      starStudent.id,
      count,
      starReason.trim(),
      starTarget,
      starActionType
    );
    const targetLabel = starTarget === 'stars' ? 'Sao Vinh Danh BXH' : starTarget === 'rewardPoints' ? 'Ví Điểm Đổi Quà' : 'cả Sao & Ví Quà';
    showToast(
      starActionType === 'add'
        ? `Đã CỘNG +${count} vào ${targetLabel} cho học viên ${starStudent.fullName}! (${starReason})`
        : `Đã TRỪ -${count} từ ${targetLabel} của học viên ${starStudent.fullName}! (${starReason})`
    );
    setStarStudent(null);
  };

  const handleOpenAssignModal = (req: RegistrationRequest) => {
    setAssignModalReq(req);
    setAssignTargetClassId(classes[0]?.id || '');
    setAssignTotalLessons(24);
    setAssignAdminNote('Đã phân lớp và xếp thời khóa biểu phù hợp');
  };

  const handleConfirmAssignAndApprove = () => {
    if (!assignModalReq) return;
    approveRegistrationRequest(
      assignModalReq.id,
      assignAdminNote,
      assignTargetClassId || undefined,
      assignTotalLessons
    );
    const selClass = classes.find(c => c.id === assignTargetClassId);
    showToast(`Đã duyệt đăng ký & phân lớp "${selClass?.name || 'Mới'}" cho học viên ${assignModalReq.studentName}!`);
    setAssignModalReq(null);
  };

  const handleRejectRegistration = (reqId: string, studentName: string) => {
    rejectRegistrationRequest(reqId, 'Lớp học hiện tại đã đủ sĩ số hoặc không phù hợp khung giờ');
    showToast(`Đã từ chối yêu cầu đăng ký của học viên ${studentName}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="w-full lg:w-auto lg:max-w-md xl:max-w-xl min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-300/40 dark:border-emerald-700/40 shrink-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight break-words leading-snug">
                Quản Lý Học Viên & Học Thử / Bảo Lưu
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                Quản lý hồ sơ học viên chính thức, bảo lưu tài khoản khi nghỉ tạm thời, và chuyển đổi học viên học thử.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end gap-2 w-full lg:w-auto shrink-0 min-w-0">
          <button
            id="btn-schedule-approvals"
            onClick={() => setIsScheduleChangeModalOpen(true)}
            className="col-span-2 sm:col-span-1 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer text-center"
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">Duyệt Đổi Lịch ({pendingScheduleCount})</span>
            {pendingScheduleCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 font-black text-[10px] rounded-full animate-pulse">
                {pendingScheduleCount}
              </span>
            )}
          </button>

          <button
            id="btn-add-trial"
            onClick={() => {
              setTrialTeacherId(teachers[0]?.id || '');
              setIsTrialModalOpen(true);
            }}
            className="col-span-1 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer text-center"
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">+ Học thử</span>
          </button>

          <button
            id="btn-add-student"
            onClick={handleOpenAdd}
            className="col-span-1 lg:w-auto px-3 sm:px-4 py-2.5 min-h-[40px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-center"
          >
            <Plus className="w-4 h-4 stroke-[3] shrink-0" />
            <span className="truncate">+ Thêm HV</span>
          </button>
        </div>
      </div>

      {/* Tabs Toolbar - Natural scrolling without floating conflicts */}
      <div className="relative py-1 sm:py-2 flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto scrollbar-none no-scrollbar touch-pan-x w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-200/70 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 whitespace-nowrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tất cả ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            <span>Đang học ({activeCount})</span>
          </button>

          <button
            onClick={() => setIsScheduleChangeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span>Duyệt Đổi Lịch ({pendingScheduleCount})</span>
            {pendingScheduleCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-black rounded-full animate-pulse">
                {pendingScheduleCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pending_registration')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'pending_registration' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ Phân Lớp / ĐK Môn ({pendingCount})</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('trial')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'trial' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-300"></span>
            <span>Học thử ({trialCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('reserved')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'reserved' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>Đang bảo lưu ({reservedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('locked')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'locked' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Tạm khóa & Bảo vệ ({lockedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('history_reservations')}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'history_reservations' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lịch sử bảo lưu ({reservations.length})</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      {activeTab !== 'history_reservations' ? (
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 overflow-hidden min-w-0 w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
            <div className="relative flex-1 min-w-0 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 shrink-0" />
              <input
                type="text"
                placeholder="Tìm theo mã HV, họ tên, phụ huynh, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full sm:w-auto text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả môn học</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.name}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PENDING REGISTRATION PANEL WHEN TAB IS SELECTED OR HAS PENDING */}
          {activeTab === 'pending_registration' && pendingRegistrations.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-700" />
                  <h3 className="font-black text-sm text-amber-950 font-heading">
                    Danh Sách Yêu Cầu Đăng Ký Môn & Gói Học Cần Xếp Lớp ({pendingRegistrations.length})
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                  Chờ Ban Quản Trị duyệt
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingRegistrations.map(req => (
                  <div key={req.id} className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-extrabold text-sm text-slate-900">{req.studentName}</p>
                        <p className="text-xs text-emerald-700 font-bold mt-0.5">
                          🎯 Đăng ký: {req.targetName} ({req.type === 'COURSE' ? 'Gói khóa học' : req.type === 'SUBJECT' ? 'Môn học' : 'Lớp học'})
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">{req.requestedDate}</span>
                    </div>

                    {req.note && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                        "{req.note}"
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleRejectRegistration(req.id, req.studentName)}
                        className="px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl cursor-pointer"
                      >
                        Từ Chối
                      </button>
                      <button
                        onClick={() => handleOpenAssignModal(req)}
                        className="px-4 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Phân Lớp & Kích Hoạt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider bg-slate-50/70">
                  <th className="py-3.5 px-3">Mã & Học Viên</th>
                  <th className="py-3.5 px-3">Môn & Lớp</th>
                  <th className="py-3.5 px-3">Phụ Huynh</th>
                  <th className="py-3.5 px-3">Số Buổi Học</th>
                  <th className="py-3.5 px-3">Sao Thưởng ⭐</th>
                  <th className="py-3.5 px-3">Trạng Thái</th>
                  <th className="py-3.5 px-3 text-right">Hành Động Chuyên Biệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                      Không tìm thấy học viên nào phù hợp bộ lọc
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const birth = new Date(s.birthDate);
                    const age = isNaN(birth.getTime()) ? '' : ` • ${new Date().getFullYear() - birth.getFullYear()}t`;
                    const currentClass = classes.find(c => s.enrolledClassIds?.includes(c.id));

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Học viên */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {s.avatar ? (
                              <img src={s.avatar} alt={s.fullName} className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" referrerPolicy="no-referrer" />
                            ) : (
                              <div className={`w-9 h-9 rounded-full text-white flex items-center justify-center font-extrabold text-xs shadow-xs ${
                                s.status === 'trial' ? 'bg-blue-600' : s.status === 'reserved' ? 'bg-amber-600' : 'bg-emerald-700'
                              }`}>
                                {s.fullName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] border ${
                                  s.status === 'trial'
                                    ? 'bg-blue-100 text-blue-900 border-blue-200'
                                    : s.status === 'reserved'
                                    ? 'bg-amber-100 text-amber-900 border-amber-200'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                                }`}>
                                  {s.code}
                                </span>
                                <span className="font-extrabold text-slate-900">{s.fullName}</span>
                                <span className="text-[10px] text-slate-400">{age}</span>
                              </div>
                              <p className="text-[11px] text-slate-400">{s.phone || 'Chưa có SĐT'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Môn & Lớp */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap gap-1">
                              {s.enrolledSubjects?.map(sub => (
                                <span key={sub} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px]">
                                  {sub}
                                </span>
                              ))}
                            </div>
                            {currentClass && (
                              <p className="text-[10px] text-slate-500 font-medium">{currentClass.name}</p>
                            )}
                          </div>
                        </td>

                        {/* Phụ huynh */}
                        <td className="py-3 px-3">
                          {s.guardianName ? (
                            <div>
                              <p className="font-bold text-slate-800 flex items-center gap-1">
                                <HeartHandshake className="w-3 h-3 text-amber-600" />
                                <span>{s.guardianName}</span>
                              </p>
                              <p className="text-[11px] text-slate-500">{s.guardianPhone}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Chưa liên kết</span>
                          )}
                        </td>

                        {/* Buổi học */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800">
                              {s.remainingLessons !== undefined ? `${s.remainingLessons}/${s.totalLessons || 24}` : `${s.totalLessons || 24}`} buổi
                            </span>
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(100, (((s.completedLessons || 0) / (s.totalLessons || 24)) * 100))}%`
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Sao thưởng & Điểm đổi quà */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1 font-black text-amber-600 text-xs" title="Sao tích lũy Vinh Danh BXH (Bảo toàn trọn đời)">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>{s.totalStars ?? s.stars ?? 0} ⭐</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setStarStudent(s);
                                    setStarActionType('add');
                                    setStarReason('Thưởng làm bài tập xuất sắc & chuyên cần');
                                  }}
                                  className="w-5 h-5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-black text-xs flex items-center justify-center border border-emerald-300 cursor-pointer shadow-2xs"
                                  title="Cộng điểm thưởng / sao vinh danh"
                                >
                                  +
                                </button>
                                <button
                                  onClick={() => {
                                    setStarStudent(s);
                                    setStarActionType('deduct');
                                    setStarReason('Trừ điểm do nghỉ học không phép / vi phạm nội quy');
                                  }}
                                  className="w-5 h-5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded font-black text-xs flex items-center justify-center border border-rose-300 cursor-pointer shadow-2xs"
                                  title="Trừ điểm / sao thưởng"
                                >
                                  -
                                </button>
                              </div>
                            </div>
                            <div className="text-[10px] font-bold text-rose-600 flex items-center gap-1" title="Điểm khả dụng dùng để đổi quà trong kho">
                              <span>🎁 Ví: {s.rewardPoints ?? s.stars ?? 0} điểm</span>
                            </div>
                          </div>
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3 px-3">
                          {s.status === 'active' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Đang học
                            </span>
                          )}
                          {s.status === 'locked' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 w-fit animate-pulse" title="Tài khoản bị tạm khóa, mã đang được bảo vệ an toàn">
                              <Lock className="w-3 h-3 text-rose-600" />
                              <span>Đang khóa & Bảo vệ</span>
                            </span>
                          )}
                          {s.status === 'trial' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 w-fit">
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              <span>Học thử</span>
                            </span>
                          )}
                          {s.status === 'reserved' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 w-fit">
                              <PauseCircle className="w-3 h-3 text-amber-600" />
                              <span>Đang bảo lưu</span>
                            </span>
                          )}
                          {s.status === 'inactive' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600">
                              Đã nghỉ
                            </span>
                          )}
                        </td>

                        {/* Hành động */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Nút Khóa / Mở khóa bảo vệ mã */}
                            {s.status === 'locked' ? (
                              <button
                                onClick={() => {
                                  toggleLockStudent(s.id, false);
                                  showToast(`Đã mở khóa học viên ${s.fullName} (${s.code})`);
                                }}
                                className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-black text-[11px] flex items-center gap-1 cursor-pointer transition-all border border-emerald-300"
                                title="Mở khóa tài khoản học viên"
                              >
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Mở Khóa</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setLockModalStudent(s);
                                  setLockReason('Tạm khóa tài khoản để bảo vệ thông tin học viên');
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                                title="Tạm khóa tài khoản & Bảo vệ mã"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Nút đặc biệt 0: Phân lớp nếu chưa có lớp */}
                            {s.status === 'active' && (!s.enrolledClassIds || s.enrolledClassIds.length === 0) && (
                              <button
                                onClick={() => {
                                  const req = registrationRequests.find(r => r.studentId === s.id && r.status === 'pending');
                                  if (req) {
                                    handleOpenAssignModal(req);
                                  } else {
                                    handleOpenAssignModal({
                                      id: `req-${Date.now()}`,
                                      studentId: s.id,
                                      studentName: s.fullName,
                                      type: 'COURSE',
                                      targetId: courses[0]?.id || 'course-01',
                                      targetName: courses[0]?.name || 'Khóa học',
                                      requestedDate: new Date().toISOString().split('T')[0],
                                      status: 'pending',
                                      note: 'Học viên mới tạo tài khoản, chờ xếp lớp'
                                    });
                                  }
                                }}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                                title="Phân lớp học & duyệt gói học cho học viên"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Phân Lớp</span>
                              </button>
                            )}

                            {/* Nút đặc biệt 1: Chuyển chính thức nếu là học thử */}
                            {s.status === 'trial' && (
                              <button
                                onClick={() => handleOpenConvertTrial(s)}
                                className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                                title="Chuyển học viên học thử sang học chính thức"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Chuyển Chính Thức</span>
                              </button>
                            )}

                            {/* Nút đặc biệt 2: Bảo lưu nếu đang học */}
                            {s.status === 'active' && (
                              <button
                                onClick={() => handleOpenReserve(s)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                                title="Bảo lưu tài khoản học viên khi nghỉ tạm thời"
                              >
                                <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Bảo lưu</span>
                              </button>
                            )}

                            {/* Nút đặc biệt 3: Khôi phục nếu đang bảo lưu */}
                            {s.status === 'reserved' && (
                              <button
                                onClick={() => handleOpenReactivate(s)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                                title="Khôi phục trạng thái Đang học cho học viên"
                              >
                                <PlayCircle className="w-3.5 h-3.5" />
                                <span>Đi học lại</span>
                              </button>
                            )}

                            {/* Sửa Khóa Học, Buổi Học & Lịch Học */}
                            <button
                              onClick={() => {
                                setStudentForCourseScheduleEdit(s);
                                setIsEditCourseScheduleModalOpen(true);
                              }}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                              title="Sửa khóa học, buổi học (tổng/đã học/còn lại) và phân lớp lịch học cho học viên"
                            >
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Sửa Khóa & Lịch</span>
                            </button>

                            {/* Sửa / Xóa chuẩn */}
                            <button
                              onClick={() => handleOpenEdit(s)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              title="Sửa thông tin học viên"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteModalStudent(s)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                              title="Xóa học viên & Làm sạch tái sử dụng mã"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Lịch sử bảo lưu tài khoản */
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Sổ Theo Dõi & Lịch Sử Bảo Lưu Học Viên
              </h3>
              <p className="text-xs text-slate-500">
                Toàn bộ dữ liệu ngày bắt đầu, ngày kết thúc và số buổi học bảo toàn cho học viên.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
              {reservations.length} Bản ghi
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider bg-slate-50/70">
                  <th className="py-3 px-3">Học Viên</th>
                  <th className="py-3 px-3">Môn & Lớp</th>
                  <th className="py-3 px-3">Thời Gian Bảo Lưu</th>
                  <th className="py-3 px-3">Số Buổi Bảo Toàn</th>
                  <th className="py-3 px-3">Lý Do</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      Chưa có hồ sơ bảo lưu nào
                    </td>
                  </tr>
                ) : (
                  reservations.map((r) => {
                    const st = students.find(s => s.id === r.studentId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-extrabold text-slate-900">
                          {r.studentName} {st ? `(${st.code})` : ''}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {r.subjectName || r.className || 'Âm nhạc'}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            <span>{r.startDate} ➔ {r.endDate}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-emerald-700">
                          {r.sessionsRemaining || r.remainingLessonsHeld || 0} buổi
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs">
                          {r.reason}
                        </td>
                        <td className="py-3 px-3">
                          {r.status === 'active' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Đang bảo lưu
                            </span>
                          ) : r.status === 'ended' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Đã đi học lại
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              Đã hủy
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {r.status === 'active' && (
                            <button
                              onClick={() => {
                                if (st) handleOpenReactivate(st);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold cursor-pointer hover:bg-emerald-700"
                            >
                              Khôi phục học
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

      {/* ============================================================ */}
      {/* MODAL 1: BẢO LƯU TÀI KHOẢN HỌC VIÊN */}
      {/* ============================================================ */}
      {reserveModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <PauseCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Bảo Lưu Tài Khoản Học Viên
                </h3>
              </div>
              <button onClick={() => setReserveModalStudent(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReserve} className="py-4 space-y-3.5 text-xs">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1">
                <p className="font-extrabold text-sm">
                  {reserveModalStudent.fullName} ({reserveModalStudent.code})
                </p>
                <p className="text-[11px] text-amber-800">
                  Số buổi học còn lại được bảo toàn: <strong>{reserveModalStudent.remainingLessons || 0} buổi</strong>
                </p>
                <p className="text-[11px] text-amber-800">
                  Số sao thưởng tích lũy giữ nguyên: <strong>{reserveModalStudent.stars || 0} ⭐</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày bắt đầu bảo lưu:</label>
                  <input
                    type="date"
                    required
                    value={reserveStartDate}
                    onChange={(e) => setReserveStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dự kiến đi học lại:</label>
                  <input
                    type="date"
                    required
                    value={reserveEndDate}
                    onChange={(e) => setReserveEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý do bảo lưu (*):</label>
                <input
                  type="text"
                  required
                  value={reserveReason}
                  onChange={(e) => setReserveReason(e.target.value)}
                  placeholder="Ví dụ: Nghỉ hè về quê, bận ôn thi chuyển cấp, lý do sức khỏe..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú thêm:</label>
                <textarea
                  rows={2}
                  value={reserveNotes}
                  onChange={(e) => setReserveNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReserveModalStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  Xác Nhận Bảo Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: KHÔI PHỤC ĐI HỌC LẠI */}
      {/* ============================================================ */}
      {reactivateModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Khôi Phục Học Tập
                </h3>
              </div>
              <button onClick={() => setReactivateModalStudent(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReactivate} className="py-4 space-y-3.5 text-xs">
              <p className="text-slate-700">
                Chào đón học viên <strong>{reactivateModalStudent.fullName} ({reactivateModalStudent.code})</strong> quay trở lại trung tâm.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Xếp vào lớp học:</label>
                <select
                  value={reactivateClassId}
                  onChange={(e) => setReactivateClassId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.scheduleText || c.schedule} (GV: {c.teacherName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                Số buổi học tiếp tục: <strong>{reactivateModalStudent.remainingLessons || 0} buổi</strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReactivateModalStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Xác Nhận Đi Học Lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: CHUYỂN HỌC THỬ SANG CHÍNH THỨC */}
      {/* ============================================================ */}
      {convertModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Chuyển Sang Học Viên Chính Thức
                </h3>
              </div>
              <button onClick={() => setConvertModalStudent(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmConvert} className="py-4 space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-blue-950 space-y-1">
                <p className="font-extrabold text-sm">
                  {convertModalStudent.fullName} (Mã học thử: {convertModalStudent.code})
                </p>
                <p className="text-[11px] text-blue-800">
                  Phụ huynh: {convertModalStudent.guardianName || '—'} • SĐT: {convertModalStudent.guardianPhone || convertModalStudent.phone || '—'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã HV chính thức mới (*):</label>
                  <input
                    type="text"
                    required
                    value={targetOfficialCode}
                    onChange={(e) => setTargetOfficialCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khóa học đăng ký (*):</label>
                  <select
                    value={targetCourseId}
                    onChange={(e) => {
                      setTargetCourseId(e.target.value);
                      const sel = courses.find(c => c.id === e.target.value);
                      if (sel) {
                        const f = typeof sel.fee === 'number' ? sel.fee : parseInt(String(sel.fee).replace(/\D/g, ''), 10) || 4800000;
                        setTargetTuition(f);
                        setTargetLessons(sel.totalLessons || 24);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp học xếp vào:</label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.scheduleText || c.schedule})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số buổi đào tạo:</label>
                  <input
                    type="number"
                    value={targetLessons}
                    onChange={(e) => setTargetLessons(parseInt(e.target.value, 10) || 24)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mức học phí nhập học (VNĐ):</label>
                <input
                  type="number"
                  step={100000}
                  value={targetTuition}
                  onChange={(e) => setTargetTuition(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-amber-800 text-sm"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tự động sinh hóa đơn học phí với cú pháp chuẩn:</span>
                </p>
                <p className="font-mono font-bold bg-white p-1.5 rounded border border-emerald-300 text-slate-900">
                  {targetOfficialCode} - {convertModalStudent.enrolledSubjects?.[0] || 'Piano'} - Thang {new Date().getMonth() + 1}
                </p>
                <p className="text-emerald-700">Tặng ngay +20 ⭐ sao thưởng chào mừng học viên chính thức!</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setConvertModalStudent(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Xác Nhận Nhập Học Chính Thức
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: TẠO TÀI KHOẢN HỌC THỬ (TRIAL ACCOUNT) */}
      {/* ============================================================ */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Tạo Tài Khoản Học Thử Mới
                </h3>
              </div>
              <button onClick={() => setIsTrialModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTrialStudent} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ tên học viên (*):</label>
                <input
                  type="text"
                  required
                  value={trialName}
                  onChange={(e) => setTrialName(e.target.value)}
                  placeholder="Bé Hoàng Nam"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ tên Phụ huynh:</label>
                  <input
                    type="text"
                    value={trialGuardian}
                    onChange={(e) => setTrialGuardian(e.target.value)}
                    placeholder="Anh Hoàng"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại liên hệ (*):</label>
                  <input
                    type="tel"
                    required
                    value={trialPhone}
                    onChange={(e) => setTrialPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học thử (*):</label>
                  <select
                    value={trialSubject}
                    onChange={(e) => setTrialSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giáo viên phụ trách:</label>
                  <select
                    value={trialTeacherId}
                    onChange={(e) => setTrialTeacherId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày học thử:</label>
                  <input
                    type="date"
                    value={trialDate}
                    onChange={(e) => setTrialDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giờ học thử:</label>
                  <input
                    type="time"
                    value={trialTime}
                    onChange={(e) => setTrialTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú & Yêu cầu đặc biệt:</label>
                <textarea
                  rows={2}
                  value={trialNotes}
                  onChange={(e) => setTrialNotes(e.target.value)}
                  placeholder="Ghi chú đánh giá cảm thụ âm nhạc, kiểm tra năng khiếu..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTrialModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Tạo Tài Khoản Học Thử
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: THÊM / SỬA HỌC VIÊN CHUẨN */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                {editingStudent ? 'Sửa Thông Tin Học Viên' : 'Thêm Mới Học Viên Chính Thức'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="py-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã học viên (*):</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên (*):</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Minh Anh"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh (*):</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính:</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bộ môn đăng ký học:</label>
                <div className="flex flex-wrap gap-1.5">
                  {subjects.map(sub => {
                    const isSelected = selectedSubjects.includes(sub.name);
                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => {
                          if (isSelected) setSelectedSubjects(selectedSubjects.filter(s => s !== sub.name));
                          else setSelectedSubjects([...selectedSubjects, sub.name]);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lớp học ban đầu:</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  >
                    <option value="">-- Chưa gán lớp --</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổng số buổi đăng ký:</label>
                  <input
                    type="number"
                    value={totalLessons}
                    onChange={(e) => setTotalLessons(parseInt(e.target.value, 10) || 24)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ tên Phụ huynh:</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Chị Lan"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại Phụ huynh:</label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  {editingStudent ? 'Lưu Thay Đổi' : 'Tạo Học Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: CỘNG / TRỪ ĐIỂM & SAO THƯỞNG HỌC VIÊN */}
      {starStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl text-white ${starActionType === 'add' ? 'bg-amber-500 shadow-md shadow-amber-500/20' : 'bg-rose-600 shadow-md shadow-rose-600/20'}`}>
                  {starActionType === 'add' ? <Star className="w-5 h-5 fill-white" /> : <Minus className="w-5 h-5 stroke-[3]" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    {starActionType === 'add' ? 'Cộng Điểm & Sao Thưởng' : 'Trừ Điểm / Điều Chỉnh Giảm'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Học viên: {starStudent.fullName} ({starStudent.code})</p>
                </div>
              </div>
              <button onClick={() => setStarStudent(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Toggle Cộng / Trừ */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Loại thao tác:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setStarActionType('add');
                      if (starReason.includes('Trừ')) setStarReason('Thưởng làm bài tập xuất sắc & chuyên cần');
                    }}
                    className={`py-2 px-3 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      starActionType === 'add' ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ CỘNG ĐIỂM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStarActionType('deduct');
                      if (starReason.includes('Thưởng')) setStarReason('Trừ điểm do nghỉ học không phép / vi phạm nội quy');
                    }}
                    className={`py-2 px-3 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      starActionType === 'deduct' ? 'bg-white text-rose-700 shadow-xs border border-rose-200' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>- TRỪ ĐIỂM</span>
                  </button>
                </div>
              </div>

              {/* Hiện trạng số dư điểm */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Sao Vinh Danh BXH hiện tại:</span>
                  </span>
                  <span className="font-black text-amber-700">{starStudent.totalStars ?? starStudent.stars ?? 0} ⭐</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-600 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-rose-500" />
                    <span>Ví Điểm Đổi Quà hiện tại:</span>
                  </span>
                  <span className="font-black text-rose-700">{starStudent.rewardPoints ?? starStudent.stars ?? 0} điểm</span>
                </div>
              </div>

              {/* Phạm vi áp dụng điểm */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Áp dụng vào ví / mục tiêu:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setStarTarget('both')}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      starTarget === 'both' ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🌟 Cả 2 Ví
                  </button>
                  <button
                    type="button"
                    onClick={() => setStarTarget('stars')}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      starTarget === 'stars' ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ⭐ Sao BXH
                  </button>
                  <button
                    type="button"
                    onClick={() => setStarTarget('rewardPoints')}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all cursor-pointer ${
                      starTarget === 'rewardPoints' ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🎁 Ví Đổi Quà
                  </button>
                </div>
              </div>

              {/* Số lượng điểm */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700">Số điểm / sao {starActionType === 'add' ? 'cộng' : 'trừ'}:</label>
                  <span className="font-extrabold text-slate-900 text-xs">
                    {starActionType === 'add' ? `+${starCount}` : `-${starCount}`} điểm
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[1, 3, 5, 10, 20, 50].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setStarCount(cnt)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs border transition-all cursor-pointer ${
                        starCount === cnt
                          ? starActionType === 'add'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : 'bg-rose-600 text-white border-rose-700 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {starActionType === 'add' ? `+${cnt}` : `-${cnt}`}
                    </button>
                  ))}
                  <div className="flex-1 min-w-[70px]">
                    <input
                      type="number"
                      min={1}
                      value={starCount}
                      onChange={(e) => setStarCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-black text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Lý do cộng / trừ điểm */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lý do {starActionType === 'add' ? 'cộng điểm' : 'trừ điểm'} <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={starReason}
                  onChange={(e) => setStarReason(e.target.value)}
                  placeholder="Nhập lý do cụ thể..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                
                {/* Gợi ý lý do nhanh */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {(starActionType === 'add' ? [
                    'Hoàn thành xuất sắc bài tập',
                    'Đi học chuyên cần đúng giờ',
                    'Biểu diễn báo cáo xuất sắc',
                    'Tiến bộ vượt bậc'
                  ] : [
                    'Nghỉ học không xin phép',
                    'Chưa làm bài tập về nhà',
                    'Vi phạm quy định phòng tập',
                    'Điều chỉnh do nhập nhầm'
                  ]).map(reasonPreset => (
                    <button
                      key={reasonPreset}
                      type="button"
                      onClick={() => setStarReason(reasonPreset)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                    >
                      {reasonPreset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setStarStudent(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">
                Hủy
              </button>
              <button
                onClick={handleConfirmAdjustStars}
                className={`px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer ${
                  starActionType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                }`}
              >
                {starActionType === 'add' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                <span>{starActionType === 'add' ? `Xác Nhận Cộng +${starCount} Điểm` : `Xác Nhận Trừ -${starCount} Điểm`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: PHÂN LỚP & DUYỆT ĐĂNG KÝ MÔN HỌC */}
      {assignModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    Phân Lớp & Duyệt Đăng Ký Học
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Học viên: {assignModalReq.studentName}</p>
                </div>
              </div>
              <button onClick={() => setAssignModalReq(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1">
                <p className="font-bold text-xs">
                  🎯 Yêu cầu: <span className="text-amber-900 font-extrabold">{assignModalReq.targetName}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  Ngày gửi: {assignModalReq.requestedDate}
                </p>
                {assignModalReq.note && (
                  <p className="text-[11px] text-slate-700 italic pt-1 border-t border-amber-200/60">
                    Ghi chú từ học viên: "{assignModalReq.note}"
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Chọn Lớp Học Phân Công:</label>
                <select
                  value={assignTargetClassId}
                  onChange={(e) => setAssignTargetClassId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Chọn lớp học phù hợp --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.subject}) • GV: {c.teacherName} • {c.schedule}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tổng số buổi học cấp:</label>
                <input
                  type="number"
                  value={assignTotalLessons}
                  onChange={(e) => setAssignTotalLessons(Math.max(1, parseInt(e.target.value, 10) || 24))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Ghi chú duyệt gửi tới học viên:</label>
                <input
                  type="text"
                  value={assignAdminNote}
                  onChange={(e) => setAssignAdminNote(e.target.value)}
                  placeholder="Ví dụ: Đã xếp lớp Piano K24 học vào Thứ 7 lúc 18h..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAssignModalReq(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAssignAndApprove}
                className="px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận Phân Lớp & Kích Hoạt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: TẠM KHÓA & BẢO VỆ MÃ HỌC VIÊN */}
      {lockModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    Tạm Khóa & Bảo Vệ Mã Học Viên
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Mã: {lockModalStudent.code}</p>
                </div>
              </div>
              <button onClick={() => setLockModalStudent(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950 space-y-1">
                <p className="font-extrabold text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Học viên: {lockModalStudent.fullName}</span>
                </p>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Khi tạm khóa, tài khoản sẽ không thể đăng nhập hoặc thao tác. <b>Mã {lockModalStudent.code} sẽ được bảo vệ an toàn</b> và không bị cấp trùng cho người khác cho đến khi Quản trị viên mở khóa.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lý do tạm khóa:</label>
                <input
                  type="text"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                  placeholder="Nhập lý do tạm khóa..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setLockModalStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => {
                  toggleLockStudent(lockModalStudent.id, true, lockReason);
                  showToast(`Đã tạm khóa và bảo vệ mã ${lockModalStudent.code} của học viên ${lockModalStudent.fullName}`);
                  setLockModalStudent(null);
                }}
                className="px-5 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Xác Nhận Tạm Khóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: XÓA HỌC VIÊN & LÀM SẠCH DỮ LIỆU TÁI SỬ DỤNG MÃ */}
      {deleteModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    Xóa Học Viên & Giải Phóng Mã
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Mã số: {deleteModalStudent.code}</p>
                </div>
              </div>
              <button onClick={() => setDeleteModalStudent(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1.5">
                <p className="font-extrabold text-xs text-amber-900">
                  ⚠️ Xác nhận xóa: {deleteModalStudent.fullName}
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Hệ thống sẽ <b>làm mới sạch sẽ toàn bộ thông tin</b> (điểm danh, bài tập, học phí, tài khoản) của học viên này. 
                </p>
                <p className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  ✨ Mã <b>{deleteModalStudent.code}</b> sẽ trở thành mã trống sạch sẽ, sẵn sàng để học viên mới tiếp theo được cấp lại từ đầu.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteModalStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => {
                  deleteStudent(deleteModalStudent.id, true);
                  showToast(`Đã xóa sạch dữ liệu và giải phóng mã ${deleteModalStudent.code} thành công!`);
                  setDeleteModalStudent(null);
                }}
                className="px-5 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa & Giải Phóng Mã</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 9: SỬA KHÓA HỌC, BUỔI HỌC & LỊCH HỌC DÀNH CHO ADMIN */}
      <EditStudentCourseScheduleModal
        isOpen={isEditCourseScheduleModalOpen}
        onClose={() => {
          setIsEditCourseScheduleModalOpen(false);
          setStudentForCourseScheduleEdit(null);
        }}
        student={studentForCourseScheduleEdit}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* MODAL 10: XÉT DUYỆT ĐỔI LỊCH HỌC VÀ CHUYỂN LỚP */}
      <ScheduleChangeApprovalModal
        isOpen={isScheduleChangeModalOpen}
        onClose={() => setIsScheduleChangeModalOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
};
