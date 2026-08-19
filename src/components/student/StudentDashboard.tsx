import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData, filterNotificationsForUser } from '../../context/DataContext';
import { UserProfileModal } from '../profile/UserProfileModal';
import { TopThreeHonorPodium } from '../gamification/TopThreeHonorPodium';
import { PersonalRankCard } from '../gamification/PersonalRankCard';
import { CourseRegistrationFlowModal } from '../registration/CourseRegistrationFlowModal';
import { PaymentProofUploadModal } from '../tuition/PaymentProofUploadModal';
import { RequestScheduleChangeModal } from '../common/RequestScheduleChangeModal';
import { Assignment, Submission, RegistrationRequest, MakeupRequest, ReservationRecord, Student, ScheduleChangeRequest } from '../../types';
import confetti from 'canvas-confetti';
import {
  Star,
  Gift,
  Trophy,
  Calendar,
  CalendarDays,
  FileText,
  Clock,
  Music,
  Award,
  Sparkles,
  Upload,
  CheckCircle2,
  UserCheck,
  Camera,
  ChevronDown,
  ChevronUp,
  Gauge,
  MessageSquare,
  Link as LinkIcon,
  Video,
  ExternalLink,
  X,
  BookOpen,
  CalendarCheck,
  RefreshCw,
  CreditCard,
  QrCode,
  Bell,
  Building2,
  Settings,
  PlusCircle,
  Copy,
  Check,
  AlertCircle,
  MapPin,
  Phone,
  ShieldCheck,
  Send,
  Image as ImageIcon,
  GraduationCap,
  Layers,
  Download,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { STUDENT_NAV_CONFIG, findNavMatch } from '../../config/navigationData';
import { TwoLevelSubTabs } from '../layout/TwoLevelSubTabs';
import { StudentDocumentsLibrary } from './StudentDocumentsLibrary';
import { StudentAccountSettings } from './StudentAccountSettings';
import { RealtimeGreetingCard } from '../common/RealtimeGreetingCard';

interface StudentDashboardProps {
  activeMainMenu?: string;
  activeSubMenu?: string;
  onMainMenuChange?: (mainId: string) => void;
  onSubMenuChange?: (subId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  activeMainMenu: propMainMenu,
  activeSubMenu: propSubMenu,
  onMainMenuChange,
  onSubMenuChange
}) => {
  const { currentUser } = useAuth();
  const {
    students,
    subjects,
    courses,
    classes,
    assignments,
    submissions,
    submitAssignment,
    rewards,
    redeemReward,
    attendance,
    tuitionPayments,
    makeupRequests,
    requestMakeup,
    reservations,
    requestReservation,
    registrationRequests,
    submitRegistrationRequest,
    scheduleChangeRequests,
    submitScheduleChangeRequest,
    paymentSubmissions,
    submitPaymentReceipt,
    notifications,
    markNotificationRead,
    branches,
    branding,
    generateQrUrlForPayment,
    formatTransferContent
  } = useData();

  // Active 2-Level Navigation State
  const [internalMainMenu, setInternalMainMenu] = useState<string>('learning');
  const [internalSubMenu, setInternalSubMenu] = useState<string>('overview_assignments');

  const activeMainMenu = propMainMenu || internalMainMenu;
  const activeSubMenu = propSubMenu || internalSubMenu;

  const handleSelectMainMenu = (mainId: string) => {
    const mainConfig = STUDENT_NAV_CONFIG.find(m => m.id === mainId) || STUDENT_NAV_CONFIG[0];
    const defaultSub = mainConfig.defaultSubId || mainConfig.subItems[0]?.id;
    
    if (onMainMenuChange) {
      onMainMenuChange(mainId);
    } else {
      setInternalMainMenu(mainId);
    }
    
    if (onSubMenuChange) {
      onSubMenuChange(defaultSub);
    } else {
      setInternalSubMenu(defaultSub);
    }
  };

  const handleSelectSubMenu = (subId: string) => {
    if (onSubMenuChange) {
      onSubMenuChange(subId);
    } else {
      setInternalSubMenu(subId);
    }
  };

  // Find current student profile - strictly matching current user, never defaulting to wrong student
  const matchedStudent = (students && students.length > 0)
    ? students.find(s => 
        (currentUser?.uid && s.userId === currentUser.uid) ||
        (currentUser?.studentProfileId && s.id === currentUser.studentProfileId) ||
        (currentUser?.profileId && s.id === currentUser.profileId) ||
        (currentUser?.profileCode && s.code === currentUser.profileCode) ||
        (currentUser?.code && s.code === currentUser.code) ||
        (currentUser?.email && s.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser?.phone && s.phone && s.phone === currentUser.phone)
      )
    : null;

  const currentStudent: Student = matchedStudent || {
    id: currentUser?.studentProfileId || `std-${currentUser?.uid || 'new'}`,
    code: currentUser?.profileCode || 'HV-MỚI',
    fullName: currentUser?.displayName || 'Học Viên Mới',
    gender: 'Khác' as any,
    birthDate: currentUser?.birthDate || '2012-01-01',
    enrolledSubjects: [],
    enrolledClassIds: [],
    totalLessons: 0,
    completedLessons: 0,
    remainingLessons: 0,
    stars: 0,
    totalStars: 0,
    rewardPoints: 0,
    status: 'active' as const,
    avatar: currentUser?.avatar || currentUser?.photoURL,
    avatarUrl: currentUser?.avatar || currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    userId: currentUser?.uid,
    guardianName: currentUser?.guardianName,
    guardianPhone: currentUser?.guardianPhone
  };

  const isNewStudentWithoutCourses = !currentStudent.enrolledSubjects || currentStudent.enrolledSubjects.length === 0;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Homework submission modal
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Course registration modal
  const [isRegisterCourseModalOpen, setIsRegisterCourseModalOpen] = useState(false);
  const [selectedRegType, setSelectedRegType] = useState<'SUBJECT' | 'COURSE' | 'CLASS'>('COURSE');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [regNote, setRegNote] = useState('');

  // Makeup request modal
  const [isMakeupModalOpen, setIsMakeupModalOpen] = useState(false);
  const [makeupClassId, setMakeupClassId] = useState('');
  const [makeupMissedDate, setMakeupMissedDate] = useState('2025-03-24');
  const [makeupDesiredDate, setMakeupDesiredDate] = useState('2025-03-29');
  const [makeupReason, setMakeupReason] = useState('Em bị ốm/sốt vào buổi học chính khóa');

  // Reservation request modal
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [reservationCourseName, setReservationCourseName] = useState('Khóa Học Piano Nền Tảng K24');
  const [reservationStartDate, setReservationStartDate] = useState('2025-04-01');
  const [reservationEndDate, setReservationEndDate] = useState('2025-05-01');
  const [reservationReason, setReservationReason] = useState('Bận ôn thi học kỳ tại trường phổ thông');

  // Payment proof modal
  const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);
  const [selectedTuitionId, setSelectedTuitionId] = useState('');
  const [proofAmount, setProofAmount] = useState(1800000);
  const [proofSyntax, setProofSyntax] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');

  // Schedule change request modal
  const [isScheduleChangeModalOpen, setIsScheduleChangeModalOpen] = useState(false);

  // Reset all modal overlays when navigating between tabs
  useEffect(() => {
    setIsProfileOpen(false);
    setSubmittingAssignment(null);
    setIsRegisterCourseModalOpen(false);
    setIsMakeupModalOpen(false);
    setIsReservationModalOpen(false);
    setIsPaymentProofModalOpen(false);
    setIsScheduleChangeModalOpen(false);
  }, [activeMainMenu, activeSubMenu]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Đã sao chép ${fieldName}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Student specific data filtering
  const myAssignments = assignments.filter(
    asg => asg.studentId === currentStudent.id || 
           asg.targetStudentIds?.includes(currentStudent.id) ||
           (!asg.studentId && !asg.targetStudentIds)
  );

  const myAttendance = attendance.filter(a => a.studentId === currentStudent.id);
  const myAttendedSessions = myAttendance.filter(
    a => a.status === 'present' || a.status === 'late' || a.status === 'makeup'
  );
  const isEnrolled = Boolean(
    (currentStudent.enrolledSubjects && currentStudent.enrolledSubjects.length > 0) ||
    (currentStudent.enrolledClassIds && currentStudent.enrolledClassIds.length > 0) ||
    (currentStudent.totalLessons && currentStudent.totalLessons > 0)
  );
  const myCompletedCount = myAttendedSessions.length;
  const myTotalLessons = currentStudent.totalLessons || (isEnrolled ? 24 : 0);
  const myRemainingLessons = isEnrolled && myTotalLessons > 0 ? Math.max(0, myTotalLessons - myCompletedCount) : 0;
  const myTuitions = tuitionPayments.filter(t => t.studentId === currentStudent.id);
  const myMakeupRequests = makeupRequests.filter(m => m.studentId === currentStudent.id);
  const myReservations = reservations.filter(r => r.studentId === currentStudent.id);
  const myRegistrationRequests = registrationRequests.filter(r => r.studentId === currentStudent.id);
  const myScheduleChangeRequests = (scheduleChangeRequests || []).filter(r => r.studentId === currentStudent.id);
  const myPaymentSubmissions = paymentSubmissions.filter(p => p.studentId === currentStudent.id);
  
  // Filter notifications specifically for student (hiding internal birthday alerts)
  const myNotifications = filterNotificationsForUser(
    notifications,
    currentUser,
    'STUDENT',
    currentStudent.id,
    []
  );

  // Homework submit handler
  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    if (!mediaUrl.trim() && !notes.trim()) {
      alert('Vui lòng cung cấp link video thực hành (YouTube, Google Drive...) hoặc ghi chú báo cáo kết quả tập luyện!');
      return;
    }

    submitAssignment({
      assignmentId: submittingAssignment.id,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      mediaUrl,
      notes,
      status: 'pending'
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setSubmittingAssignment(null);
    setMediaUrl('');
    setNotes('');
    showToast('🎉 Đã gửi bài tập thành công! Giáo viên sẽ sớm chấm điểm & nhận xét cho bạn.');
  };

  // Course registration request handler
  const handleRegisterCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetName = 'Khóa học âm nhạc';
    if (selectedRegType === 'COURSE') {
      const found = courses.find(c => c.id === selectedTargetId) || courses[0];
      targetName = found ? found.name : 'Khóa học';
    } else if (selectedRegType === 'SUBJECT') {
      const found = subjects.find(s => s.id === selectedTargetId) || subjects[0];
      targetName = found ? found.name : 'Môn học';
    } else {
      const found = classes.find(c => c.id === selectedTargetId) || classes[0];
      targetName = found ? found.name : 'Lớp học';
    }

    submitRegistrationRequest({
      type: selectedRegType,
      targetId: selectedTargetId || 'item-01',
      targetName,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      note: regNote
    });

    setIsRegisterCourseModalOpen(false);
    setSelectedTargetId('');
    setRegNote('');
    showToast(`Đã gửi yêu cầu đăng ký "${targetName}"! Ban quản lý trung tâm sẽ liên hệ xếp lịch cho bạn.`);
  };

  // Makeup request handler
  const handleMakeupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === makeupClassId) || classes[0];
    requestMakeup({
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      classId: cls ? cls.id : 'cls-01',
      className: cls ? cls.name : 'Lớp học',
      missedDate: makeupMissedDate,
      makeupDate: makeupDesiredDate,
      timeSlot: cls ? cls.scheduleTime : '18:00 - 19:30',
      reason: makeupReason
    });

    setIsMakeupModalOpen(false);
    showToast('Đã gửi yêu cầu đăng ký học bù! Thầy cô sẽ phê duyệt và sắp xếp ca bù sớm nhất.');
  };

  // Reservation request handler
  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestReservation({
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      courseId: 'crs-01',
      courseName: reservationCourseName,
      startDate: reservationStartDate,
      endDate: reservationEndDate,
      reason: reservationReason,
      notes: 'Học viên gửi đơn trực tiếp từ giao diện cá nhân',
      remainingLessons: currentStudent.remainingLessons || 12
    });

    setIsReservationModalOpen(false);
    showToast('Đã gửi đơn xin bảo lưu khóa học! Trung tâm sẽ liên hệ xác nhận thời hạn bảo lưu.');
  };

  // Payment proof submit handler
  const handlePaymentProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl.trim() && !proofNotes.trim()) {
      alert('Vui lòng dán link ảnh biên lai/chuyển khoản hoặc ghi chú mã giao dịch ngân hàng!');
      return;
    }

    submitPaymentReceipt({
      tuitionPaymentId: selectedTuitionId || undefined,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      amount: proofAmount,
      transferSyntax: proofSyntax || `HV${currentStudent.code || '001'} ${currentStudent.fullName} HP`,
      receiptProofUrl: proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
      notes: proofNotes
    });

    setIsPaymentProofModalOpen(false);
    setProofUrl('');
    setProofNotes('');
    showToast('🎉 Đã gửi xác nhận nộp học phí kèm biên lai! Kế toán trung tâm sẽ kiểm tra và cập nhật trạng thái đã đóng.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* LỜI CHÀO THỜI GIAN THỰC & LỜI CHÚC TRUYỀN CẢM HỨNG */}
      <RealtimeGreetingCard 
        userName={currentStudent.fullName}
        variant="card"
        showClock={true}
      />

      {/* Hero Card for Student */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={currentStudent.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'}
                alt={currentStudent.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/30 shadow-md"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setIsProfileOpen(true)}
                className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                title="Đổi ảnh đại diện"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
                  {currentStudent.code || 'HV-MỚI'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                  {isNewStudentWithoutCourses ? 'Học viên mới' : 'Học viên'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isNewStudentWithoutCourses ? 'bg-amber-500/90 text-slate-950' : 'bg-emerald-500/80 text-white'
                }`}>
                  {isNewStudentWithoutCourses 
                    ? 'Chưa đăng ký môn học' 
                    : `Đang học ${currentStudent.enrolledSubjects?.join(', ')}`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1 font-heading">
                Xin chào, {currentStudent.fullName}! 🎵
              </h1>
              <p className="text-emerald-100 text-xs mt-0.5 flex items-center gap-2">
                <span>Cổng học viên cá nhân • Minh Music Studio</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Dual Wallet Display (Stars + Points) */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center gap-4">
              <div className="text-center">
                <span className="text-[10px] font-bold text-amber-200 uppercase block">Sao Vinh Danh</span>
                <div className="flex items-center justify-center gap-1 text-xl font-black text-amber-300">
                  <Star className="w-5 h-5 fill-amber-300" />
                  <span>{currentStudent.totalStars ?? currentStudent.stars ?? 0}</span>
                </div>
              </div>

              <div className="w-px h-8 bg-white/20"></div>

              <div className="text-center">
                <span className="text-[10px] font-bold text-rose-200 uppercase block">Điểm Đổi Quà</span>
                <div className="flex items-center justify-center gap-1 text-xl font-black text-rose-300">
                  <Gift className="w-5 h-5" />
                  <span>{currentStudent.rewardPoints ?? currentStudent.stars ?? 0} đ</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsProfileOpen(true)}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl border border-white/30 text-white transition-all cursor-pointer flex flex-col items-center gap-1 text-xs font-bold shadow-xs"
              title="Cài đặt tài khoản & Đổi ảnh"
            >
              <Settings className="w-5 h-5" />
              <span>Cài đặt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-Level Sub-Tabs Navigation */}
      <TwoLevelSubTabs
        mainNavConfig={STUDENT_NAV_CONFIG}
        activeMainMenu={activeMainMenu}
        activeSubMenu={activeSubMenu}
        onSelectMainMenu={handleSelectMainMenu}
        onSelectSubMenu={handleSelectSubMenu}
        titlePrefix="Học Viên"
      />

      {/* 1. HỌC TẬP (LEARNING) */}
      {activeMainMenu === 'learning' && (
        <>
          {/* Sub-tab 1.1: Overview & Assignments */}
          {activeSubMenu === 'overview_assignments' && (
        <div className="space-y-6">
          {/* ONBOARDING HERO FOR NEW STUDENTS (CHƯA ĐĂNG KÝ MÔN HỌC) */}
          {isNewStudentWithoutCourses && (
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/70 border-2 border-amber-300 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Chào Mừng Học Viên Mới
                    </span>
                    <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                      Tài khoản mới
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                    Khởi đầu hành trình âm nhạc tại Minh Music! 🎹
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 max-w-2xl leading-relaxed">
                    Tài khoản của bạn hiện là tài khoản mới và <strong>chưa có môn học/lớp học nào</strong>. Vui lòng bấm chọn môn học, gói học và lịch học mong muốn để gửi yêu cầu tới Ban Quản Trị (Admin) duyệt và phân lớp cho bạn nhé.
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedRegType('COURSE');
                      setIsRegisterCourseModalOpen(true);
                    }}
                    className="px-5 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer text-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Đăng Ký Môn Học / Gói Học Ngay</span>
                  </button>
                </div>
              </div>

              {/* Status of existing registration requests if any */}
              {myRegistrationRequests.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-200/80 space-y-2">
                  <p className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Yêu cầu đăng ký đã gửi ({myRegistrationRequests.length}):</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {myRegistrationRequests.map(req => (
                      <div key={req.id} className="p-3 bg-white/90 rounded-xl border border-amber-300 text-xs flex items-center justify-between gap-2 shadow-2xs">
                        <div>
                          <p className="font-bold text-slate-900">{req.targetName}</p>
                          <p className="text-[11px] text-slate-500">Ngày gửi: {req.requestedDate} {req.note ? `• ${req.note}` : ''}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        }`}>
                          {req.status === 'approved' ? '✓ Đã duyệt' : req.status === 'rejected' ? '✗ Từ chối' : '⏳ Chờ Admin duyệt & xếp lớp'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Homework & Progress */}
            <div className="lg:col-span-2 space-y-6">
              {/* Homework List */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">
                      Bài Tập Thực Hành & Tác Phẩm ({myAssignments.length})
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Lộ trình cá nhân 1-1
                  </span>
                </div>

                <div className="space-y-4">
                  {myAssignments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                      <Music className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="font-bold text-xs">Hiện tại chưa có bài tập mới nào được giao.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Giáo viên sẽ giao tác phẩm luyện tập phù hợp với bạn sau buổi học tới!</p>
                    </div>
                  ) : (
                    myAssignments.map(asg => {
                      const mySubmission = submissions.find(
                        s => s.assignmentId === asg.id && s.studentId === currentStudent.id
                      );

                      return (
                        <div 
                          key={asg.id} 
                          className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 hover:bg-slate-50 transition-all"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-extrabold">
                                  {asg.subjectName || 'Piano'}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                                  {asg.studentLevel || 'Cơ bản'}
                                </span>
                                {asg.targetBpm && (
                                  <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 text-[10px] font-bold flex items-center gap-1">
                                    <Gauge className="w-3 h-3 text-orange-600" />
                                    {asg.targetBpm} BPM
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-base text-slate-900 font-heading mt-1.5">
                                {asg.title}
                              </h4>
                            </div>

                            <span className="text-[11px] px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0 w-fit">
                              ⏰ Hạn nộp: {asg.dueDate}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {asg.description}
                          </p>

                          {asg.customNotes && (
                            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 text-xs space-y-1">
                              <p className="font-bold flex items-center gap-1.5 text-blue-800">
                                <MessageSquare className="w-3.5 h-3.5" /> Lời dặn dò riêng của thầy/cô:
                              </p>
                              <p className="font-medium italic text-[11px] leading-relaxed">
                                "{asg.customNotes}"
                              </p>
                            </div>
                          )}

                          {(asg.sheetMusicUrl || asg.audioUrl) && (
                            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                              {asg.sheetMusicUrl && (
                                <a
                                  href={asg.sheetMusicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                                >
                                  <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Mở Sheet nhạc / Bài mẫu (PDF)</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                              )}

                              {asg.audioUrl && (
                                <a
                                  href={asg.audioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                                >
                                  <Music className="w-3.5 h-3.5 text-rose-600" />
                                  <span>Nghe Audio Beat / Video mẫu</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                              )}
                            </div>
                          )}

                          {mySubmission && (
                            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">Trạng thái bài nộp:</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  mySubmission.status === 'graded' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {mySubmission.status === 'graded' ? '✓ Thầy/cô đã chấm điểm' : '⏳ Đã nộp - Chờ giáo viên chấm'}
                                </span>
                              </div>

                              {mySubmission.mediaUrl && (
                                <div className="text-xs text-blue-600 flex items-center gap-1.5">
                                  <Video className="w-3.5 h-3.5" />
                                  <a href={mySubmission.mediaUrl} target="_blank" rel="noopener noreferrer" className="underline truncate">
                                    {mySubmission.mediaUrl}
                                  </a>
                                </div>
                              )}

                              {mySubmission.teacherFeedback && (
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
                                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                                    <Award className="w-4 h-4 text-emerald-600" />
                                    Nhận xét: <strong>{mySubmission.grade || 'Đạt xuất sắc'}</strong>
                                  </p>
                                  <p className="text-[11px] italic mt-1 leading-relaxed text-emerald-900">
                                    "{mySubmission.teacherFeedback}"
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 font-bold text-emerald-700 text-[11px]">
                                    <span>⭐ +{mySubmission.starsAwarded || 5} Sao Vinh Danh</span>
                                    <span>🎁 +{mySubmission.rewardPointsAwarded || 15} Điểm Đổi Quà</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                              <span>+{asg.bonusStars || 5} Sao BXH & +{asg.rewardPoints || 15} Điểm đổi quà</span>
                            </div>

                            <button
                              onClick={() => setSubmittingAssignment(asg)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-102"
                            >
                              <Upload className="w-4 h-4" />
                              <span>{mySubmission ? 'Nộp Lại / Cập Nhật Video' : 'Úp Video / Link Bài Tập'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Learning Progress & Attendance Status */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900 font-heading">
                      Tiến Độ Khóa Học & Điểm Danh Chuyên Cần
                    </h3>
                  </div>
                  {isEnrolled && myAttendance.length > 0 && (
                    <button
                      onClick={() => {
                        handleSelectMainMenu('schedule');
                        handleSelectSubMenu('weekly_schedule');
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                    >
                      Xem lịch sử {myAttendance.length} buổi →
                    </button>
                  )}
                </div>

                {!isEnrolled ? (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      Tài khoản chưa đăng ký khóa học
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Bạn chưa đăng ký môn học hoặc lớp học nào nên chưa có số buổi đã học hay còn lại. Hãy gửi yêu cầu đăng ký khóa học để bắt đầu theo dõi tiến độ.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedRegType('COURSE');
                        setIsRegisterCourseModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Đăng ký môn học ngay
                    </button>
                  </div>
                ) : myAttendance.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      Chờ Giáo viên / Admin điểm danh buổi học đầu tiên
                    </p>
                    <p className="text-slate-500 leading-relaxed">
                      Môn học đã đăng ký: <strong className="text-slate-800">{(currentStudent.enrolledSubjects || []).join(', ') || 'Âm nhạc'}</strong> (Khóa {myTotalLessons} buổi). Dữ liệu số buổi đã học và còn lại được tính khi Admin và Giáo viên thực hiện điểm danh.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Đã học (căn cứ điểm danh): <strong className="text-slate-900">{myCompletedCount}</strong> / {myTotalLessons} buổi</span>
                      <span className="text-emerald-700 font-bold">Còn lại: {myRemainingLessons} buổi ⭐</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, myTotalLessons > 0 ? (myCompletedCount / myTotalLessons) * 100 : 0)}%` }}
                      ></div>
                    </div>

                    {/* Latest Attendance Snippet */}
                    {myAttendance[0] && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Điểm danh gần nhất: <strong>{myAttendance[0].date}</strong>
                          {myAttendance[0].isBackdated && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">Điểm danh bù</span>
                          )}
                        </span>
                        <span className={`font-bold ${
                          myAttendance[0].status === 'present' ? 'text-emerald-600' :
                          myAttendance[0].status === 'late' ? 'text-purple-600' :
                          myAttendance[0].status === 'makeup' ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          {myAttendance[0].status === 'present' ? '✓ Có mặt' : myAttendance[0].status === 'late' ? '⏱ Đến muộn' : myAttendance[0].status === 'makeup' ? '🔄 Đã học bù' : 'Nghỉ phép'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 Col: Quick Actions & Personal Rank */}
            <div className="space-y-6">
              {/* Personal Rank Card */}
              <PersonalRankCard student={currentStudent} studentId={currentStudent.id} />

              {/* Quick Navigation Cards */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 font-heading">
                  Lối Tắt Thao Tác Nhanh
                </h3>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      handleSelectMainMenu('learning');
                      handleSelectSubMenu('courses_registration');
                      setIsRegisterCourseModalOpen(true);
                    }}
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      Đăng ký thêm môn học / khóa học mới
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => {
                      handleSelectMainMenu('schedule');
                      handleSelectSubMenu('makeup_schedule');
                      setIsMakeupModalOpen(true);
                    }}
                    className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl border border-amber-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-amber-600" />
                      Đăng ký học bù buổi nghỉ
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => {
                      handleSelectMainMenu('schedule');
                      handleSelectSubMenu('leave_request');
                      setIsReservationModalOpen(true);
                    }}
                    className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-2xl border border-indigo-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Gửi đơn xin bảo lưu khóa học
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => {
                      handleSelectMainMenu('tuition');
                      handleSelectSubMenu('pending_invoices');
                    }}
                    className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-2xl border border-rose-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-rose-600" />
                      Quét VietQR nộp học phí
                    </span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
          )}

          {/* Sub-tab 1.2: Courses & Registration */}
          {activeSubMenu === 'courses_registration' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-heading">
                Môn Học Của Bạn & Đăng Ký Khóa Học Mới
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Học viên có thể học song song nhiều bộ môn (Piano, Guitar, Vocal, Trống, Violin...).
              </p>
            </div>

            <button
              onClick={() => setIsRegisterCourseModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng Ký Môn Học / Khóa Học Mới</span>
            </button>
          </div>

          {/* Enrolled Subjects List */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 font-heading">Các Môn Bạn Đang Học</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(currentStudent.enrolledSubjects || ['Piano']).map((sub, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-black">
                      Bộ môn: {sub}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Đang học
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    Khóa Học {sub} Toàn Diện K24
                  </h4>
                  <p className="text-xs text-slate-500">
                    Lịch học: Thứ 2 & Thứ 4 (17:30 - 19:00) • Phòng Studio 02
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog of other available courses & subjects */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-800 font-heading">Khóa Học & Lớp Học Khác Tại Trung Tâm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <div key={course.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black">
                        {course.subjectName || 'Âm nhạc'}
                      </span>
                      <span className="text-xs font-black text-rose-600">
                        {course.fee?.toLocaleString()} đ
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{course.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRegType('COURSE');
                      setSelectedTargetId(course.id);
                      setIsRegisterCourseModalOpen(true);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Đăng Ký Khóa Này
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Registration requests history */}
          {myRegistrationRequests.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 font-heading">
                Lịch Sử Đơn Đăng Ký Môn / Khóa Học Của Bạn
              </h3>
              <div className="space-y-2">
                {myRegistrationRequests.map(req => (
                  <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{req.targetName}</span>
                      <p className="text-[11px] text-slate-500">Ngày gửi: {req.requestedDate} • Ghi chú: {req.note || 'Không'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status === 'approved' ? 'Đã duyệt' : req.status === 'rejected' ? 'Từ chối' : 'Chờ Admin duyệt'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
          )}

          {/* Sub-tab 1.3: Documents Library */}
          {activeSubMenu === 'documents_library' && (
            <StudentDocumentsLibrary />
          )}
        </>
      )}

      {/* 2. THỜI KHÓA BIỂU (SCHEDULE) */}
      {activeMainMenu === 'schedule' && (
        <>
          {/* Sub-tab 2.1: Weekly Schedule & Attendance */}
          {activeSubMenu === 'weekly_schedule' && (
            <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-900 font-heading flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-600" />
                  <span>Chi Tiết Các Buổi Học Đã Điểm Danh</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Xem lại nhận xét của giáo viên và đánh giá rèn luyện từng buổi học.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tỉ lệ chuyên cần: 100%</span>
              </div>
            </div>

            {myAttendance.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                <CalendarDays className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-xs">Chưa có lịch sử điểm danh nào được ghi nhận.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                      <th className="p-3">Buổi & Ngày Học</th>
                      <th className="p-3">Lớp & Môn Học</th>
                      <th className="p-3">Trạng Thái Điểm Danh</th>
                      <th className="p-3">Sao Thưởng Buổi Học</th>
                      <th className="p-3">Đánh Giá & Nhận Xét Của Thầy/Cô</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myAttendance.map((rec, index) => (
                      <tr key={rec.id || index} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-mono font-black text-slate-900 flex items-center gap-1.5">
                              <span>Buổi {rec.sessionNumber || myAttendance.length - index}</span>
                              <span className="text-slate-400 font-normal">•</span>
                              <span>{rec.date}</span>
                            </span>
                            {rec.isBackdated && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 w-fit mt-0.5">
                                ⏱ Điểm danh bù
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">
                          {rec.className || (currentStudent.enrolledSubjects || [])[0] || 'Lớp Âm Nhạc'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                            rec.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                            rec.status === 'late' ? 'bg-purple-100 text-purple-800' :
                            rec.status === 'makeup' ? 'bg-blue-100 text-blue-800' :
                            rec.status === 'absent_excused' || rec.status === 'absent_with_leave' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {rec.status === 'present' ? '✓ Có mặt đúng giờ' :
                             rec.status === 'late' ? '⏱ Đến muộn' :
                             rec.status === 'makeup' ? '🔄 Đã học bù' :
                             rec.status === 'absent_excused' || rec.status === 'absent_with_leave' ? '📝 Nghỉ phép' : '✗ Vắng không phép'}
                          </span>
                        </td>
                        <td className="p-3">
                          {rec.starsAwarded ? (
                            <span className="font-black text-amber-600 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              +{rec.starsAwarded} Sao
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-700">
                          {rec.note || rec.evaluation || 'Học viên đi học chăm chỉ, tích cực luyện tập.'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
          )}

          {/* Sub-tab 2.2: Makeup Schedule & Schedule Change */}
          {activeSubMenu === 'makeup_schedule' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Schedule Change Request Box */}
            <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100/60 p-5 rounded-3xl border-2 border-purple-300 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-heading">
                      Đổi Lịch / Đổi Lớp
                    </h3>
                    <span className="text-[10px] font-extrabold bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">
                      Cần Admin Duyệt
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Thay đổi ca học, thứ trong tuần hoặc chuyển sang lớp khác cùng bộ môn khi trùng lịch học.
                </p>
              </div>

              <button
                onClick={() => setIsScheduleChangeModalOpen(true)}
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Gửi Yêu Cầu Đổi Lịch Học</span>
              </button>
            </div>

            {/* Makeup Request Box */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-heading">
                      Đăng Ký Học Bù
                    </h3>
                    <p className="text-xs text-slate-500">
                      Học bù buổi nghỉ có phép
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Trung tâm luôn hỗ trợ học viên bù đắp kiến thức và thực hành đầy đủ số buổi đã đăng ký.
                </p>
              </div>

              <button
                onClick={() => setIsMakeupModalOpen(true)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Gửi Yêu Cầu Học Bù</span>
              </button>
            </div>

            {/* Reservation Request Box */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-heading">
                      Bảo Lưu Khóa Học
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bảo lưu buổi khi bận thi cử
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thời hạn bảo lưu tối đa 3 tháng. Số buổi còn lại được kích hoạt lại khi quay trở lại học.
                </p>
              </div>

              <button
                onClick={() => setIsReservationModalOpen(true)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Clock className="w-4 h-4" />
                <span>Gửi Đơn Xin Bảo Lưu</span>
              </button>
            </div>
          </div>

          {/* Schedule Change Requests History */}
          <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 font-heading flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Lịch Sử Đơn Xin Đổi Lịch Học / Chuyển Lớp ({myScheduleChangeRequests.length})</span>
              </h3>
              <button
                onClick={() => setIsScheduleChangeModalOpen(true)}
                className="text-xs font-bold text-purple-700 hover:text-purple-800 underline cursor-pointer"
              >
                + Gửi đơn mới
              </button>
            </div>

            {myScheduleChangeRequests.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">Bạn chưa gửi yêu cầu đổi lịch học nào.</p>
            ) : (
              <div className="space-y-2.5">
                {myScheduleChangeRequests.map(req => (
                  <div key={req.id} className="p-4 bg-purple-50/40 rounded-2xl border border-purple-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">
                          {req.currentClassName || 'Lớp hiện tại'} → {req.targetClassName || req.desiredScheduleText || 'Lịch mới'}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded">
                          {req.currentSubject || 'Môn học'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Lý do: <i>"{req.reason}"</i> • Ngày gửi: {req.createdAt}
                      </p>
                      {req.adminResponse && (
                        <p className="text-[11px] font-semibold text-indigo-900 bg-white p-2 rounded-lg border border-purple-200 inline-block mt-1">
                          💬 Phản hồi Admin: {req.adminResponse}
                        </p>
                      )}
                    </div>

                    <div className="self-end sm:self-center shrink-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                        req.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : req.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      }`}>
                        {req.status === 'approved' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {req.status === 'rejected' && <X className="w-3 h-3 text-rose-600" />}
                        {req.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        <span>
                          {req.status === 'approved' ? 'Đã duyệt chuyển lịch' :
                           req.status === 'rejected' ? 'Admin từ chối' : '⏳ Chờ Admin duyệt'}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Makeup History */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 font-heading">
              Lịch Sử Đơn Đăng Ký Học Bù
            </h3>
            {myMakeupRequests.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có yêu cầu học bù nào.</p>
            ) : (
              <div className="space-y-2">
                {myMakeupRequests.map(m => (
                  <div key={m.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{m.className || 'Lớp học'} • Buổi nghỉ: {m.missedDate || m.originalDate}</p>
                      <p className="text-[11px] text-slate-500">Lịch bù mong muốn: {m.makeupDate || m.targetDate || 'Chưa xếp'} ({m.timeSlot || m.makeupTime || 'Theo lịch'}) • Lý do: {m.reason}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      m.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      m.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      m.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {m.status === 'approved' ? 'Đã duyệt lịch bù' :
                       m.status === 'completed' ? 'Đã học xong' :
                       m.status === 'rejected' ? 'Từ chối' : 'Đang xếp lịch'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reservation History */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 font-heading">
              Lịch Sử Đơn Bảo Lưu
            </h3>
            {myReservations.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có đơn bảo lưu nào.</p>
            ) : (
              <div className="space-y-2">
                {myReservations.map(r => (
                  <div key={r.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{r.courseName || r.className || 'Khóa học'} (Còn {r.remainingLessons || r.remainingLessonsHeld || r.sessionsRemaining || 12} buổi)</p>
                      <p className="text-[11px] text-slate-500">Thời gian: {r.startDate} đến {r.endDate} • Lý do: {r.reason}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      r.status === 'active' || r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status === 'active' || r.status === 'approved' ? 'Đang bảo lưu' : 'Đang xử lý'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          )}
        </>
      )}

      {/* 4. ĐỔI QUÀ / VINH DANH (REWARDS) */}
      {activeMainMenu === 'rewards' && (
        <>
          {/* Sub-tab 4.1: Star Ranking */}
          {activeSubMenu === 'star_ranking' && (
            <div className="space-y-6">
              <TopThreeHonorPodium
                title="Bảng Vàng Vinh Danh Học Viên Xuất Sắc"
                subtitle="Tích cực rèn luyện ngón đàn, nộp bài đúng hạn để vươn lên Top Bảng Vàng nhé!"
                showFilters={false}
                showFullLeaderboardBelow={true}
              />
            </div>
          )}

          {/* Sub-tab 4.2: Reward Store */}
          {activeSubMenu === 'reward_store' && (
            <div className="space-y-6">

          {/* Reward Catalog */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-heading">
                    Kho Quà Tặng Đổi Bằng Điểm Thưởng
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ví điểm của bạn: <strong className="text-rose-600">{currentStudent.rewardPoints ?? currentStudent.stars ?? 0} Điểm</strong>
                  </p>
                </div>
              </div>

              <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl">
                💡 Đổi quà không làm giảm Sao Bảng Vàng!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map(r => {
                const pts = r.pointsRequired ?? r.requiredPoints ?? 50;
                const img = r.imageUrl || r.image || 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400';
                const userPoints = currentStudent.rewardPoints ?? currentStudent.stars ?? 0;
                const canAfford = userPoints >= pts;

                return (
                  <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={img} alt={r.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-xs text-slate-900 line-clamp-2">{r.name}</p>
                        <p className="text-xs font-black text-rose-600 mt-1">{pts} Điểm Thưởng 🎁</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const res = redeemReward(currentStudent.id, r.id);
                        if (res.success) {
                          showToast(`🎉 Chúc mừng! Bạn đã đổi thành công "${r.name}". Vui lòng nhận quà tại quầy lễ tân!`);
                        } else {
                          alert(res.error || 'Chưa đủ điểm thưởng.');
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        canAfford 
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Đổi Quà Ngay' : `Còn thiếu ${pts - userPoints} điểm`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
          )}
        </>
      )}

      {/* 3. HỌC PHÍ (TUITION) */}
      {activeMainMenu === 'tuition' && (
        <>
          {/* Sub-tab 3.1: Pending Invoices & VietQR */}
          {activeSubMenu === 'pending_invoices' && (
            <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Tuition List & VietQR Generator */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900 font-heading flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-rose-600" />
                    <span>Khoản Học Phí Của Bạn</span>
                  </h3>
                  <button
                    onClick={() => {
                      setProofAmount(myTuitions[0]?.amount || 1800000);
                      setSelectedTuitionId(myTuitions[0]?.id || '');
                      setIsPaymentProofModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Nộp Biên Lai Chuyển Khoản</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {myTuitions.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Hiện tại bạn không có khoản học phí nào chưa đóng.</p>
                  ) : (
                    myTuitions.map(t => (
                      <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="font-extrabold text-sm text-slate-900">{t.subjectName || 'Khóa học âm nhạc'}</span>
                          <p className="text-xs text-slate-500 mt-0.5">Kỳ học phí: {t.billingMonth || 'Tháng 03/2025'} • Hạn đóng: {t.dueDate || '2025-03-25'}</p>
                          <p className="text-sm font-black text-rose-600 mt-1">{t.amount?.toLocaleString()} VNĐ</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            t.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {t.status === 'paid' ? '✓ Đã Thanh Toán' : 'Chưa Thanh Toán'}
                          </span>

                          {t.status !== 'paid' && (
                            <button
                              onClick={() => {
                                setSelectedTuitionId(t.id);
                                setProofAmount(t.amount);
                                setIsPaymentProofModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                            >
                              Gửi Bill
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: VietQR Card */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-rose-600 font-heading font-black text-sm">
                  <QrCode className="w-5 h-5" />
                  <span>Mã VietQR Thanh Toán Tự Động</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                  <img
                    src={generateQrUrlForPayment(myTuitions[0] || { amount: 1800000 }, 1800000, `HV${currentStudent.code || '001'} ${currentStudent.fullName} HP T3`)}
                    alt="VietQR"
                    className="w-48 h-48 mx-auto rounded-xl shadow-xs"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-2">Mở app ngân hàng quét mã QR để chuyển khoản nhanh 24/7</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Ngân hàng:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{branding?.bankAccount?.bankName || 'MB Bank'}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Số tài khoản:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-slate-900 dark:text-slate-100">{branding?.bankAccount?.accountNumber || '0988776655'}</span>
                      <button
                        onClick={() => copyToClipboard(branding?.bankAccount?.accountNumber || '0988776655', 'Số tài khoản')}
                        className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                        title="Sao chép"
                      >
                        {copiedField === 'Số tài khoản' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Chủ tài khoản:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{branding?.bankAccount?.accountHolder || 'TRUNG TAM MINH MUSIC'}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Cú pháp CK:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-rose-600 truncate max-w-[140px]">
                        HV{currentStudent.code || '001'} {currentStudent.fullName} HP T3
                      </span>
                      <button
                        onClick={() => copyToClipboard(`HV${currentStudent.code || '001'} ${currentStudent.fullName} HP T3`, 'Cú pháp')}
                        className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                        title="Sao chép"
                      >
                        {copiedField === 'Cú pháp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          )}

          {/* Sub-tab 3.2: Payment History */}
          {activeSubMenu === 'payment_history' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 font-heading">
                    Lịch Sử Nộp Biên Lai & Phiếu Thu Học Phí ({myPaymentSubmissions.length})
                  </h3>
                  <button
                    onClick={() => {
                      setProofAmount(myTuitions[0]?.amount || 1800000);
                      setSelectedTuitionId(myTuitions[0]?.id || '');
                      setIsPaymentProofModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Nộp Biên Lai Mới</span>
                  </button>
                </div>

                {myPaymentSubmissions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    Chưa có biên lai nộp học phí nào trong hệ thống.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {myPaymentSubmissions.map(p => (
                      <div key={p.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">Số tiền: <strong className="text-rose-600">{p.amount?.toLocaleString()} VNĐ</strong> • Cú pháp: {p.transferSyntax}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Thời gian gửi: {p.submittedAt} • Ghi chú: {p.notes || 'Không'}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                          p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status === 'approved' ? '✓ Kế toán đã duyệt' : p.status === 'rejected' ? '✗ Từ chối' : '⏳ Chờ kế toán duyệt'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. TÀI KHOẢN (ACCOUNT) */}
      {activeMainMenu === 'account' && (
        <StudentAccountSettings
          currentStudent={currentStudent}
          activeSubSection={activeSubMenu as any}
          onOpenEditProfileModal={() => setIsProfileOpen(true)}
        />
      )}

      {/* MODAL 1: Submit Homework */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-heading">
                    Nộp Bài Tập / Video Luyện Đàn
                  </h3>
                  <p className="text-blue-100 text-xs mt-0.5 line-clamp-1">
                    {submittingAssignment.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSubmittingAssignment(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitHomework} className="p-6 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-amber-900">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
                <p className="font-semibold text-[11px] leading-relaxed">
                  Hoàn thành nộp bài đúng hạn sẽ nhận ngay <strong>+{submittingAssignment.bonusStars || 5} Sao Vinh Danh</strong> và <strong>+{submittingAssignment.rewardPoints || 15} Điểm Đổi Quà</strong>!
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Link Video / Ghi Âm thực hành (YouTube / Google Drive / TikTok / SoundCloud):</span>
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?... hoặc link Google Drive"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>Ghi chú của học viên (Cảm nhận khi tập hoặc câu hỏi cho thầy cô):</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Em đã tập được đoạn đầu nhịp 76 BPM rất mượt..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-500 resize-none text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gửi Bài Nộp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Register Course / Subject / Class Flow */}
      <CourseRegistrationFlowModal
        isOpen={isRegisterCourseModalOpen}
        onClose={() => setIsRegisterCourseModalOpen(false)}
        targetStudent={currentStudent}
        onSuccess={() => showToast('🎉 Gửi yêu cầu đăng ký môn / khóa học thành công! Ban Quản Trị sẽ sớm liên hệ xếp lịch.')}
      />

      {/* MODAL 3: Makeup Lesson Request */}
      {isMakeupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-heading">
                    Đăng Ký Học Bù Buổi Nghỉ
                  </h3>
                  <p className="text-amber-100 text-xs mt-0.5">
                    Học viên: {currentStudent.fullName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMakeupModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMakeupSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Lớp học cần bù:</label>
                <select
                  value={makeupClassId}
                  onChange={(e) => setMakeupClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500 text-xs"
                >
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.name} ({cl.subjectName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Ngày đã nghỉ:</label>
                  <input
                    type="date"
                    value={makeupMissedDate}
                    onChange={(e) => setMakeupMissedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Ngày mong muốn bù:</label>
                  <input
                    type="date"
                    value={makeupDesiredDate}
                    onChange={(e) => setMakeupDesiredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Lý do nghỉ:</label>
                <textarea
                  rows={2}
                  value={makeupReason}
                  onChange={(e) => setMakeupReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-500 resize-none text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMakeupModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Đăng Ký Học Bù</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Reservation Request */}
      {isReservationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-heading">
                    Gửi Đơn Xin Bảo Lưu Khóa Học
                  </h3>
                  <p className="text-indigo-100 text-xs mt-0.5">
                    Học viên: {currentStudent.fullName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsReservationModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReservationSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Khóa học xin bảo lưu:</label>
                <input
                  type="text"
                  value={reservationCourseName}
                  onChange={(e) => setReservationCourseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Bắt đầu bảo lưu từ:</label>
                  <input
                    type="date"
                    value={reservationStartDate}
                    onChange={(e) => setReservationStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Dự kiến học lại vào:</label>
                  <input
                    type="date"
                    value={reservationEndDate}
                    onChange={(e) => setReservationEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Lý do bảo lưu:</label>
                <textarea
                  rows={2}
                  value={reservationReason}
                  onChange={(e) => setReservationReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500 resize-none text-xs"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsReservationModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Đơn Bảo Lưu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Payment Proof Submission */}
      <PaymentProofUploadModal
        isOpen={isPaymentProofModalOpen}
        onClose={() => setIsPaymentProofModalOpen(false)}
        targetStudent={currentStudent}
        tuition={selectedTuitionId ? tuitionPayments.find(t => t.id === selectedTuitionId) : null}
        onSuccess={() => showToast('🎉 Nộp biên lai học phí thành công! Ban Quản Trị sẽ đối soát và xác nhận.')}
      />

      {/* MODAL 6: Request Schedule Change */}
      <RequestScheduleChangeModal
        isOpen={isScheduleChangeModalOpen}
        onClose={() => setIsScheduleChangeModalOpen(false)}
        student={currentStudent}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
};
