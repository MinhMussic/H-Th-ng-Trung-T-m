import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData, filterNotificationsForUser } from '../../context/DataContext';
import { UserProfileModal } from '../profile/UserProfileModal';
import { TopThreeHonorPodium } from '../gamification/TopThreeHonorPodium';
import { PersonalRankCard } from '../gamification/PersonalRankCard';
import { CourseRegistrationFlowModal } from '../registration/CourseRegistrationFlowModal';
import { PaymentProofUploadModal } from '../tuition/PaymentProofUploadModal';
import { RequestScheduleChangeModal } from '../common/RequestScheduleChangeModal';
import { TwoLevelSubTabs } from '../layout/TwoLevelSubTabs';
import { PARENT_NAV_CONFIG } from '../../config/navigationData';
import { StudentDocumentsLibrary } from '../student/StudentDocumentsLibrary';
import { StudentAccountSettings } from '../student/StudentAccountSettings';
import { RealtimeGreetingCard } from '../common/RealtimeGreetingCard';
import { Assignment, Submission, TuitionPayment, RegistrationRequest, MakeupRequest, ReservationRecord, ScheduleChangeRequest } from '../../types';
import confetti from 'canvas-confetti';
import {
  Users,
  GraduationCap,
  CalendarDays,
  CheckSquare,
  CreditCard,
  QrCode,
  Clock,
  RefreshCw,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileText,
  Camera,
  UserCheck,
  Copy,
  Check,
  X,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
  Trophy,
  Star,
  Music,
  Gauge,
  Link as LinkIcon,
  Award,
  ExternalLink,
  BookOpen,
  CalendarCheck,
  Bell,
  Building2,
  Settings,
  PlusCircle,
  Video,
  Upload,
  Send,
  Image as ImageIcon,
  Gift,
  MapPin,
  Phone
} from 'lucide-react';

type ParentTab = 
  | 'overview' 
  | 'subjects' 
  | 'attendance' 
  | 'makeup_reservation' 
  | 'honor_rewards' 
  | 'tuition' 
  | 'notifications' 
  | 'branches';

interface ParentDashboardProps {
  activeMainMenu?: string;
  activeSubMenu?: string;
  onSelectMainMenu?: (mainId: string) => void;
  onSelectSubMenu?: (subId: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  activeMainMenu: propMainMenu,
  activeSubMenu: propSubMenu,
  onSelectMainMenu: propOnSelectMainMenu,
  onSelectSubMenu: propOnSelectSubMenu
}) => {
  const { currentUser } = useAuth();
  const {
    students,
    guardians,
    studentGuardianLinks,
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

  // 2-Level Navigation Hierarchy State
  const [internalMainMenu, setInternalMainMenu] = useState<string>('learning');
  const [internalSubMenu, setInternalSubMenu] = useState<string>('overview_assignments');

  const activeMainMenu = propMainMenu || internalMainMenu;
  const activeSubMenu = propSubMenu || internalSubMenu;

  const handleSelectMainMenu = (mainId: string) => {
    const mainConfig = PARENT_NAV_CONFIG.find(m => m.id === mainId) || PARENT_NAV_CONFIG[0];
    const defaultSub = mainConfig.defaultSubId || mainConfig.subItems[0]?.id;

    if (propOnSelectMainMenu) {
      propOnSelectMainMenu(mainId);
    } else {
      setInternalMainMenu(mainId);
    }

    if (propOnSelectSubMenu) {
      propOnSelectSubMenu(defaultSub);
    } else {
      setInternalSubMenu(defaultSub);
    }
  };

  const handleSelectSubMenu = (subId: string) => {
    if (propOnSelectSubMenu) {
      propOnSelectSubMenu(subId);
    } else {
      setInternalSubMenu(subId);
    }
  };

  // Find guardian profile
  const currentGuardian = (guardians && guardians.length > 0)
    ? guardians.find(
        g => (currentUser?.guardianProfileId && g.id === currentUser.guardianProfileId) ||
             (currentUser?.profileId && g.id === currentUser.profileId) ||
             (currentUser?.profileCode && g.code === currentUser.profileCode) ||
             (currentUser?.email && g.email && g.email.toLowerCase() === currentUser.email.toLowerCase()) ||
             (currentUser?.phone && g.phone && g.phone === currentUser.phone)
      ) || guardians[0]
    : null;

  // Linked children
  const linkedLinks = studentGuardianLinks.filter(l => l.guardianId === currentGuardian?.id && l.status === 'active');
  const linkedStudentIds = linkedLinks.map(l => l.studentId);
  const myChildren = students.filter(s => 
    linkedStudentIds.includes(s.id) || 
    currentGuardian?.studentIds?.includes(s.id) ||
    s.parentPhone === currentUser?.phone
  );

  const fallbackChildren = (students || []).slice(0, 2);
  const activeChildrenList = myChildren.length > 0 ? myChildren : fallbackChildren;

  // Selected child switcher state
  const [selectedChildId, setSelectedChildId] = useState<string>(activeChildrenList[0]?.id || 'std-01');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Homework submission modal (Parent submitting on behalf of child)
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Course registration modal for child
  const [isRegisterCourseModalOpen, setIsRegisterCourseModalOpen] = useState(false);
  const [selectedRegType, setSelectedRegType] = useState<'SUBJECT' | 'COURSE' | 'CLASS'>('COURSE');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [regNote, setRegNote] = useState('');

  // Makeup request modal for child
  const [isMakeupModalOpen, setIsMakeupModalOpen] = useState(false);
  const [makeupClassId, setMakeupClassId] = useState('');
  const [makeupMissedDate, setMakeupMissedDate] = useState('2025-03-24');
  const [makeupDesiredDate, setMakeupDesiredDate] = useState('2025-03-29');
  const [makeupReason, setMakeupReason] = useState('Bé bị sốt và bận lịch thi tại trường tiểu học');

  // Reservation request modal for child
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [reservationCourseName, setReservationCourseName] = useState('Khóa Học Piano Nền Tảng K24');
  const [reservationStartDate, setReservationStartDate] = useState('2025-04-01');
  const [reservationEndDate, setReservationEndDate] = useState('2025-05-01');
  const [reservationReason, setReservationReason] = useState('Gia đình có chuyến công tác/nghỉ hè');

  // Payment proof modal
  const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);
  const [selectedTuitionId, setSelectedTuitionId] = useState('');
  const [proofAmount, setProofAmount] = useState(1800000);
  const [proofSyntax, setProofSyntax] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofNotes, setProofNotes] = useState('');

  const currentChild = activeChildrenList.find(c => c.id === selectedChildId) || activeChildrenList[0] || {
    id: 'std-01',
    code: 'HV001',
    fullName: 'Nguyễn Gia Hân',
    gender: 'Nữ' as const,
    birthDate: '2016-05-15',
    enrolledSubjects: ['Piano', 'Thanh nhạc'],
    totalLessons: 24,
    completedLessons: 8,
    remainingLessons: 16,
    stars: 25,
    totalStars: 25,
    rewardPoints: 45,
    status: 'active' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
  };

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

  // Child specific data
  const childAssignments = assignments.filter(
    asg => asg.studentId === currentChild.id || 
           asg.targetStudentIds?.includes(currentChild.id) ||
           (!asg.studentId && !asg.targetStudentIds)
  );

  const childAttendance = attendance.filter(a => a.studentId === currentChild.id);
  const childAttendedSessions = childAttendance.filter(
    a => a.status === 'present' || a.status === 'late' || a.status === 'makeup'
  );
  const isChildEnrolled = Boolean(
    (currentChild.enrolledSubjects && currentChild.enrolledSubjects.length > 0) ||
    (currentChild.enrolledClassIds && currentChild.enrolledClassIds.length > 0) ||
    (currentChild.totalLessons && currentChild.totalLessons > 0)
  );
  const childCompletedCount = childAttendedSessions.length;
  const childTotalLessons = currentChild.totalLessons || (isChildEnrolled ? 24 : 0);
  const childRemainingLessons = isChildEnrolled && childTotalLessons > 0 ? Math.max(0, childTotalLessons - childCompletedCount) : 0;
  const childTuitions = tuitionPayments.filter(t => t.studentId === currentChild.id);
  const childMakeupRequests = makeupRequests.filter(m => m.studentId === currentChild.id);
  const childReservations = reservations.filter(r => r.studentId === currentChild.id);
  const childRegistrationRequests = registrationRequests.filter(r => r.studentId === currentChild.id);
  const childScheduleChangeRequests = (scheduleChangeRequests || []).filter(r => r.studentId === currentChild.id);
  const childPaymentSubmissions = paymentSubmissions.filter(p => p.studentId === currentChild.id);
  
  // Filter notifications specifically for parent (hiding internal birthday alerts)
  const parentNotifications = filterNotificationsForUser(
    notifications,
    currentUser,
    'PARENT',
    undefined,
    activeChildrenList.map(c => c.id)
  );

  const [notifFilter, setNotifFilter] = useState<'all' | 'alert' | 'evaluation' | 'assignment' | 'tuition'>('all');

  // Filter unexcused absence sessions for warning badges
  const unexcusedAbsenceSessions = childAttendance.filter(
    a => a.status === 'absent_unexcused' || a.status === 'absent_no_leave'
  );

  // Consolidated Teacher evaluations & feedback timeline for the child
  const childEvaluations = [
    ...childAttendance.filter(a => !!(a.note || a.evaluation)).map(a => ({
      id: 'att-eval-' + a.id,
      date: a.date,
      teacher: a.verifiedBy || a.recordedBy || 'Giáo viên phụ trách',
      subject: a.className || a.subjectName || (currentChild.enrolledSubjects || [])[0] || 'Âm nhạc',
      text: a.evaluation || a.note || '',
      stars: a.starsAwarded,
      type: 'attendance' as const,
      status: a.status
    })),
    ...submissions.filter(s => s.studentId === currentChild.id && !!s.teacherFeedback).map(s => {
      const asg = assignments.find(a => a.id === s.assignmentId);
      return {
        id: 'sub-eval-' + s.id,
        date: s.submittedAt || 'Gần đây',
        teacher: 'Giáo viên bộ môn',
        subject: asg?.subjectName || 'Bài tập thực hành',
        text: s.teacherFeedback || '',
        stars: s.starsAwarded,
        grade: s.grade,
        type: 'assignment' as const,
        status: undefined
      };
    })
  ];

  // Homework submit handler on behalf of child
  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    if (!mediaUrl.trim() && !notes.trim()) {
      alert('Vui lòng cung cấp link video thực hành hoặc ghi chú báo cáo kết quả tập luyện!');
      return;
    }

    submitAssignment({
      assignmentId: submittingAssignment.id,
      studentId: currentChild.id,
      studentName: currentChild.fullName,
      mediaUrl,
      notes: `(Phụ huynh gửi thay): ${notes}`,
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
    showToast(`🎉 Đã nộp bài tập thành công cho bé ${currentChild.fullName}! Thầy cô sẽ sớm nhận xét.`);
  };

  // Course registration request handler for child
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
      studentId: currentChild.id,
      studentName: currentChild.fullName,
      note: `(Phụ huynh ${currentUser?.displayName || 'Phụ huynh'} đăng ký cho bé): ${regNote}`
    });

    setIsRegisterCourseModalOpen(false);
    setSelectedTargetId('');
    setRegNote('');
    showToast(`Đã gửi yêu cầu đăng ký "${targetName}" cho bé ${currentChild.fullName}!`);
  };

  // Makeup request handler for child
  const handleMakeupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === makeupClassId) || classes[0];
    requestMakeup({
      studentId: currentChild.id,
      studentName: currentChild.fullName,
      classId: cls ? cls.id : 'cls-01',
      className: cls ? cls.name : 'Lớp học',
      missedDate: makeupMissedDate,
      makeupDate: makeupDesiredDate,
      timeSlot: cls ? cls.scheduleTime : '18:00 - 19:30',
      reason: `(Phụ huynh gửi): ${makeupReason}`
    });

    setIsMakeupModalOpen(false);
    showToast(`Đã gửi đơn đăng ký học bù cho bé ${currentChild.fullName}!`);
  };

  // Reservation request handler for child
  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestReservation({
      studentId: currentChild.id,
      studentName: currentChild.fullName,
      courseId: 'crs-01',
      courseName: reservationCourseName,
      startDate: reservationStartDate,
      endDate: reservationEndDate,
      reason: `(Phụ huynh gửi): ${reservationReason}`,
      notes: `Phụ huynh ${currentUser?.displayName || ''} liên hệ bảo lưu`,
      remainingLessons: currentChild.remainingLessons || 12
    });

    setIsReservationModalOpen(false);
    showToast(`Đã gửi đơn xin bảo lưu khóa học cho bé ${currentChild.fullName}!`);
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
      studentId: currentChild.id,
      studentName: currentChild.fullName,
      amount: proofAmount,
      transferSyntax: proofSyntax || `HV${currentChild.code || '001'} ${currentChild.fullName} HP`,
      receiptProofUrl: proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      notes: `(Phụ huynh gửi): ${proofNotes}`
    });

    setIsPaymentProofModalOpen(false);
    setProofUrl('');
    setProofNotes('');
    showToast(`🎉 Đã gửi xác nhận nộp học phí cho bé ${currentChild.fullName}! Kế toán sẽ duyệt sớm.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* LỜI CHÀO THỜI GIAN THỰC & LỜI CHÚC TRUYỀN CẢM HỨNG */}
      <RealtimeGreetingCard 
        userName={currentUser?.displayName || 'Phụ huynh'}
        variant="card"
        showClock={true}
      />

      {/* Header & Child Switcher Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
              CỔNG THÔNG TIN PHỤ HUYNH • MINH MUSIC
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-300 text-slate-950 text-[10px] font-black">
              Giám hộ chính
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black mt-1.5 font-heading">
            Xin chào, Phụ huynh {currentUser?.displayName || 'Phụ huynh'}!
          </h1>
          <p className="text-amber-100 text-xs mt-0.5">
            Đồng hành cùng con: Theo dõi chuyên cần, tiến độ rèn luyện, đăng ký môn học và thanh toán học phí tiện lợi.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Multi-child Switcher Pills */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-1 flex items-center gap-1 border border-white/30">
            {activeChildrenList.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  selectedChildId === child.id
                    ? 'bg-white text-slate-900 shadow-md scale-102'
                    : 'text-white hover:bg-white/15'
                }`}
              >
                <span>👶</span>
                <span>{child.fullName}</span>
                <span className="text-[10px] opacity-75 font-mono">({child.code || 'HV001'})</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl border border-white/30 text-white transition-all cursor-pointer flex flex-col items-center gap-1 text-xs font-bold shadow-xs"
            title="Cài đặt tài khoản phụ huynh & Đổi ảnh"
          >
            <Settings className="w-5 h-5" />
            <span>Cài đặt</span>
          </button>
        </div>
      </div>

      {/* Two-Level Sub-Tabs Navigation for Parent */}
      <TwoLevelSubTabs
        mainNavConfig={PARENT_NAV_CONFIG}
        activeMainMenu={activeMainMenu}
        activeSubMenu={activeSubMenu}
        onSelectMainMenu={handleSelectMainMenu}
        onSelectSubMenu={handleSelectSubMenu}
        titlePrefix="Phụ Huynh"
      />

      {/* 1. HỌC TẬP CỦA CON (LEARNING) */}
      {activeMainMenu === 'learning' && (
        <>
          {/* Sub-tab 1.1: Overview & Assignments */}
          {activeSubMenu === 'overview_assignments' && (
            <div className="space-y-6">
          {/* Urgent Absent Alert Banner */}
          {unexcusedAbsenceSessions.length > 0 && (
            <div className="p-4 bg-rose-50 rounded-3xl border-2 border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-rose-100 rounded-2xl text-rose-700 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-200 text-rose-900 text-[10px] font-black uppercase tracking-wider">
                      Cảnh Báo Chuyên Cần
                    </span>
                    <span className="text-xs font-black text-rose-700">-2 ⭐ / buổi</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-rose-950 mt-1">
                    Bé {currentChild.fullName} có {unexcusedAbsenceSessions.length} buổi vắng không phép
                  </h4>
                  <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                    Buổi gần nhất ngày <strong className="text-rose-950">{unexcusedAbsenceSessions[0].date}</strong> ({unexcusedAbsenceSessions[0].className || 'Lớp Âm Nhạc'}). Phụ huynh hãy đăng ký lịch học bù sớm để trung tâm sắp xếp lớp bổ trợ kiến thức cho bé.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMakeupMissedDate(unexcusedAbsenceSessions[0].date);
                  setIsMakeupModalOpen(true);
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs shrink-0 flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Đăng Ký Học Bù Cho Bé Ngay</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Child summary & homework */}
            <div className="lg:col-span-2 space-y-6">
              {/* Child Profile Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={currentChild.avatarUrl || currentChild.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'}
                      alt={currentChild.fullName}
                      className="w-16 h-16 rounded-2xl object-cover ring-3 ring-amber-400 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-black">
                          {currentChild.code || 'HV001'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                          {currentChild.level || 'Grade 2'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 font-heading mt-1">
                        Học viên: {currentChild.fullName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Sinh ngày: {currentChild.birthDate || '2016-05-15'} • Bộ môn: {currentChild.enrolledSubjects?.join(', ') || 'Piano'}
                      </p>
                    </div>
                  </div>

                  {/* Stars & Points Display (Read-Only) */}
                  <div className="flex items-center gap-3">
                    <div className="text-center bg-amber-50 border border-amber-200 p-2.5 rounded-2xl min-w-[80px]">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Sao Vinh Danh</span>
                      <div className="flex items-center justify-center gap-1 font-black text-base text-amber-600">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                        <span>{currentChild.totalStars ?? currentChild.stars ?? 0}</span>
                      </div>
                    </div>

                    <div className="text-center bg-rose-50 border border-rose-200 p-2.5 rounded-2xl min-w-[80px]">
                      <span className="text-[10px] font-bold text-rose-800 uppercase block">Điểm Đổi Quà</span>
                      <div className="flex items-center justify-center gap-1 font-black text-base text-rose-600">
                        <Gift className="w-4 h-4 text-rose-500" />
                        <span>{currentChild.rewardPoints ?? currentChild.stars ?? 0} đ</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress & Attendance Synced Overview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 font-heading">
                        Tiến Độ Khóa Học Của Bé
                      </h4>
                    </div>
                    {isChildEnrolled && childAttendance.length > 0 && (
                      <button
                        onClick={() => {
                          handleSelectMainMenu('schedule');
                          handleSelectSubMenu('weekly_schedule');
                        }}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                      >
                        Xem lịch sử {childAttendance.length} buổi →
                      </button>
                    )}
                  </div>

                  {!isChildEnrolled ? (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        Bé chưa đăng ký khóa học nào
                      </p>
                      <p className="text-slate-600 leading-relaxed">
                        Phụ huynh vui lòng gửi đăng ký khóa học mới cho bé để bắt đầu theo dõi tiến độ và số buổi học.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedRegType('COURSE');
                          setIsRegisterCourseModalOpen(true);
                        }}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Đăng ký môn học cho bé ngay
                      </button>
                    </div>
                  ) : childAttendance.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                        Chờ Giáo viên / Admin điểm danh buổi học đầu tiên
                      </p>
                      <p className="text-slate-500 leading-relaxed">
                        Môn học đã đăng ký: <strong className="text-slate-800">{(currentChild.enrolledSubjects || []).join(', ') || 'Âm nhạc'}</strong> (Khóa {childTotalLessons} buổi). Dữ liệu số buổi đã học và còn lại được tính khi giáo viên thực hiện điểm danh.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Số buổi đã học: <strong className="text-slate-900">{childCompletedCount}</strong> / {childTotalLessons} buổi</span>
                        <span className="text-amber-700 font-bold">Số buổi còn lại: {childRemainingLessons} buổi ⭐</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, childTotalLessons > 0 ? (childCompletedCount / childTotalLessons) * 100 : 0)}%` }}
                        ></div>
                      </div>

                      {/* Latest Attendance Snippet */}
                      {childAttendance[0] && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Điểm danh gần nhất: <strong>{childAttendance[0].date}</strong>
                            {childAttendance[0].isBackdated && (
                              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">Điểm danh bù</span>
                            )}
                          </span>
                          <span className={`font-bold ${
                            childAttendance[0].status === 'present' ? 'text-emerald-600' :
                            childAttendance[0].status === 'late' ? 'text-purple-600' :
                            childAttendance[0].status === 'makeup' ? 'text-blue-600' : 'text-amber-600'
                          }`}>
                            {childAttendance[0].status === 'present' ? '✓ Có mặt' : childAttendance[0].status === 'late' ? '⏱ Đến muộn' : childAttendance[0].status === 'makeup' ? '🔄 Đã học bù' : 'Nghỉ phép'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Homework List for Child */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">
                      Bài Tập Thực Hành Của Bé ({childAssignments.length})
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Phụ huynh có thể hỗ trợ quay video nộp bài thay con
                  </span>
                </div>

                <div className="space-y-4">
                  {childAssignments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                      <Music className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="font-bold text-xs">Hiện tại bé chưa có bài tập mới nào cần nộp.</p>
                    </div>
                  ) : (
                    childAssignments.map(asg => {
                      const submission = submissions.find(
                        s => s.assignmentId === asg.id && s.studentId === currentChild.id
                      );

                      return (
                        <div key={asg.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-extrabold">
                                  {asg.subjectName || 'Piano'}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                                  {asg.studentLevel || 'Cơ bản'}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-base text-slate-900 font-heading mt-1">
                                {asg.title}
                              </h4>
                            </div>

                            <span className="text-[11px] px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200 w-fit">
                              ⏰ Hạn nộp: {asg.dueDate}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600">{asg.description}</p>

                          {asg.customNotes && (
                            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs">
                              <p className="font-bold text-blue-800 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5" /> Lời dặn của thầy/cô dành cho phụ huynh & học viên:
                              </p>
                              <p className="italic text-[11px] mt-1">"{asg.customNotes}"</p>
                            </div>
                          )}

                          {submission && (
                            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">Trạng thái bài nộp của bé:</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  submission.status === 'graded' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {submission.status === 'graded' ? '✓ Giáo viên đã chấm điểm' : '⏳ Đã nộp - Đang chờ giáo viên xem'}
                                </span>
                              </div>

                              {submission.teacherFeedback && (
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs">
                                  <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                                    <Award className="w-4 h-4 text-emerald-600" />
                                    Đánh giá: <strong>{submission.grade || 'Tốt'}</strong>
                                  </p>
                                  <p className="text-[11px] italic mt-1 text-emerald-900">"{submission.teacherFeedback}"</p>
                                  <div className="flex items-center gap-3 mt-2 font-bold text-emerald-700 text-[11px]">
                                    <span>⭐ +{submission.starsAwarded || 5} Sao Vinh Danh</span>
                                    <span>🎁 +{submission.rewardPointsAwarded || 15} Điểm Đổi Quà</span>
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
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Upload className="w-4 h-4" />
                              <span>{submission ? 'Cập Nhật / Nộp Lại Video Cho Bé' : 'Nộp Video Bài Tập Cho Bé'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Teacher Evaluations & Feedback Feed for Child */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-base font-extrabold text-slate-900 font-heading">
                      Lời Nhận Xét & Đánh Giá Của Thầy Cô ({childEvaluations.length})
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    Cập nhật tự động sau mỗi buổi học & chấm bài
                  </span>
                </div>

                <div className="space-y-3">
                  {childEvaluations.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                      <MessageSquare className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                      <p className="font-bold text-xs">Chưa có nhận xét nào từ giáo viên trong kỳ này.</p>
                    </div>
                  ) : (
                    childEvaluations.slice(0, 5).map(item => (
                      <div 
                        key={item.id} 
                        className={`p-4 rounded-2xl border transition-all space-y-2 ${
                          item.status === 'absent_unexcused'
                            ? 'bg-rose-50/70 border-rose-200'
                            : 'bg-indigo-50/40 border-indigo-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              item.type === 'assignment' 
                                ? 'bg-purple-100 text-purple-800' 
                                : item.status === 'absent_unexcused'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {item.type === 'assignment' ? 'Chấm bài tập' : item.status === 'absent_unexcused' ? 'Vắng không phép' : 'Đánh giá buổi học'}
                            </span>
                            <span className="font-bold text-xs text-slate-900">{item.subject}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.stars !== undefined && item.stars !== 0 && (
                              <span className={`text-[11px] font-black flex items-center gap-0.5 ${
                                item.stars > 0 ? 'text-amber-600' : 'text-rose-600'
                              }`}>
                                <Star className={`w-3.5 h-3.5 ${item.stars > 0 ? 'fill-amber-400 text-amber-500' : 'fill-rose-400 text-rose-500'}`} />
                                {item.stars > 0 ? `+${item.stars}` : item.stars} ⭐
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">{item.date}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-slate-200/60">
                          "{item.text}"
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Người nhận xét: <strong className="text-slate-800">{item.teacher}</strong></span>
                          {item.type === 'assignment' && (item as any).grade && (
                            <span className="font-extrabold text-indigo-700">Điểm đánh giá: {(item as any).grade}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Rank & Quick shortcuts */}
            <div className="space-y-6">
              {/* Personal Rank Card for Child */}
              <PersonalRankCard student={currentChild} studentId={currentChild.id} />

              {/* Quick Actions */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 font-heading">
                  Thao Tác Phụ Huynh Nhanh
                </h3>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => { handleSelectMainMenu('learning'); handleSelectSubMenu('courses_registration'); setIsRegisterCourseModalOpen(true); }}
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      Đăng ký thêm môn / khóa học cho con
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => { handleSelectMainMenu('schedule'); handleSelectSubMenu('makeup_schedule'); setIsMakeupModalOpen(true); }}
                    className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl border border-amber-200 text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-amber-600" />
                      Xin nghỉ / Đăng ký học bù cho con
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => { handleSelectMainMenu('schedule'); handleSelectSubMenu('leave_request'); setIsReservationModalOpen(true); }}
                    className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-2xl border border-indigo-200 text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Gửi đơn xin bảo lưu khóa học cho con
                    </span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => { handleSelectMainMenu('tuition'); handleSelectSubMenu('pending_invoices'); }}
                    className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-900 rounded-2xl border border-rose-200 text-xs font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-rose-600" />
                      Quét VietQR đóng học phí cho con
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
                Môn Học Của Bé {currentChild.fullName} & Đăng Ký Thêm
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Phụ huynh có thể đăng ký bổ sung các môn năng khiếu khác (Vocal, Guitar, Violin, Vẽ tranh...).
              </p>
            </div>

            <button
              onClick={() => setIsRegisterCourseModalOpen(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng Ký Môn / Khóa Mới Cho Con</span>
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 font-heading">Các Môn Bé Đang Theo Học</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(currentChild.enrolledSubjects || ['Piano']).map((sub, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-black">
                      {sub}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Đang học
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    Lớp Năng Khiếu {sub} Trẻ Em
                  </h4>
                  <p className="text-xs text-slate-500">
                    Lịch học: Thứ 2 - Thứ 4 (17:30 - 19:00) • Giáo viên phụ trách: Thầy Minh
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-800 font-heading">Tất Cả Khóa Học & Lớp Năng Khiếu Tại Trung Tâm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <div key={course.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
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
                    className="w-full py-2 bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Đăng Ký Khóa Này Cho Bé
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 1.3: Documents & Library */}
      {activeSubMenu === 'documents_library' && (
        <StudentDocumentsLibrary />
      )}
    </>
  )}

      {/* 2. THỜI KHÓA BIỂU & CHUYÊN CẦN (SCHEDULE) */}
      {activeMainMenu === 'schedule' && (
        <>
          {/* Sub-tab 2.1: Weekly Schedule & Attendance Records */}
          {activeSubMenu === 'weekly_schedule' && (
            <div className="space-y-6">
              {/* Urgent Absent Alert Banner */}
              {unexcusedAbsenceSessions.length > 0 && (
                <div className="p-4 bg-rose-50 rounded-3xl border-2 border-rose-200 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-rose-950">
                        Cảnh Báo Chuyên Cần: Bé có {unexcusedAbsenceSessions.length} buổi vắng không phép (-2⭐)
                      </h4>
                      <p className="text-xs text-rose-800 mt-0.5">
                        Học viên vắng không phép sẽ bị trừ 2 sao BXH. Phụ huynh vui lòng gửi đơn xin học bù để bé được học bù và hoàn thành trọn vẹn số buổi khóa học.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMakeupMissedDate(unexcusedAbsenceSessions[0].date);
                      handleSelectSubMenu('makeup_schedule');
                      setIsMakeupModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>Gửi Đơn Xin Học Bù</span>
                  </button>
                </div>
              )}

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-black text-slate-900 font-heading flex items-center gap-2">
                      <CalendarCheck className="w-5 h-5 text-emerald-600" />
                      <span>Sổ Điểm Danh & Nhật Ký Học Tập Của Bé {currentChild.fullName}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Quy tắc: Đúng lịch (+2⭐), Đến muộn (+1⭐), Nghỉ phép (0⭐), Vắng không phép (-2⭐).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Chuyên cần: {childAttendance.length > 0 ? `${Math.round((childAttendedSessions.length / childAttendance.length) * 100)}%` : '100%'}</span>
                  </div>
                </div>

                {childAttendance.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                    <CalendarDays className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="font-bold text-xs">Chưa có lịch sử điểm danh nào của bé.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                          <th className="p-3">Buổi & Ngày Học</th>
                          <th className="p-3">Lớp & Môn Học</th>
                          <th className="p-3">Trạng Thái Điểm Danh</th>
                          <th className="p-3">Biến Động Sao</th>
                          <th className="p-3">Nhận Xét Của Thầy Cô Giáo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {childAttendance.map((rec, index) => {
                          const isUnexcused = rec.status === 'absent_unexcused' || rec.status === 'absent_no_leave';
                          return (
                            <tr key={rec.id || index} className={`hover:bg-slate-50/80 transition-colors ${isUnexcused ? 'bg-rose-50/30' : ''}`}>
                              <td className="p-3">
                                <div className="flex flex-col">
                                  <span className="font-mono font-black text-slate-900 flex items-center gap-1.5">
                                    <span>Buổi {rec.sessionNumber || childAttendance.length - index}</span>
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
                                {rec.className || (currentChild.enrolledSubjects || [])[0] || 'Lớp Âm Nhạc'}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                                    rec.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                                    rec.status === 'late' ? 'bg-purple-100 text-purple-800' :
                                    rec.status === 'makeup' ? 'bg-blue-100 text-blue-800' :
                                    rec.status === 'absent_excused' || rec.status === 'absent_with_leave' ? 'bg-amber-100 text-amber-800' :
                                    'bg-rose-100 text-rose-800'
                                  }`}>
                                    {rec.status === 'present' ? '✓ Có mặt (+2⭐)' :
                                     rec.status === 'late' ? '⏱ Đến muộn (+1⭐)' :
                                     rec.status === 'makeup' ? '🔄 Đã học bù (0⭐)' :
                                     rec.status === 'absent_excused' || rec.status === 'absent_with_leave' ? '📝 Nghỉ phép (0⭐)' : '✕ Vắng không phép (-2⭐)'}
                                  </span>

                                  {isUnexcused && (
                                    <button
                                      onClick={() => {
                                        setMakeupMissedDate(rec.date);
                                        handleSelectSubMenu('makeup_schedule');
                                        setIsMakeupModalOpen(true);
                                      }}
                                      className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] cursor-pointer shadow-2xs"
                                    >
                                      Xin học bù
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                {rec.starsAwarded !== undefined && rec.starsAwarded !== 0 ? (
                                  <span className={`font-black flex items-center gap-1 ${
                                    rec.starsAwarded > 0 ? 'text-amber-600' : 'text-rose-600'
                                  }`}>
                                    <Star className={`w-3.5 h-3.5 ${rec.starsAwarded > 0 ? 'fill-amber-400 text-amber-500' : 'fill-rose-400 text-rose-500'}`} />
                                    {rec.starsAwarded > 0 ? `+${rec.starsAwarded}` : rec.starsAwarded} ⭐
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold">0 ⭐</span>
                                )}
                              </td>
                              <td className="p-3 text-slate-700">
                                {rec.evaluation || rec.note ? (
                                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                                    <span className="font-semibold text-slate-800">{rec.evaluation || rec.note}</span>
                                    {rec.verifiedBy && (
                                      <span className="block text-[10px] text-slate-400 mt-0.5">Xác nhận bởi: {rec.verifiedBy}</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Chưa có nhận xét riêng</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Schedule Change Request Box */}
                <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100/60 p-6 rounded-3xl border-2 border-purple-300 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-xs">
                          <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 font-heading">
                            Xin Đổi Lịch / Chuyển Lớp Cho Bé
                          </h3>
                          <span className="text-[10px] font-extrabold bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full">
                            Cần Admin Duyệt
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Phụ huynh có thể yêu cầu đổi khung giờ học, ca học trong tuần hoặc chuyển sang lớp khác cùng bộ môn cho bé.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsScheduleChangeModalOpen(true)}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>Gửi Yêu Cầu Đổi Lịch Học</span>
                  </button>
                </div>

                {/* Makeup Request Box */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                          <CalendarDays className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-slate-900 font-heading">
                            Xin Nghỉ & Đăng Ký Học Bù
                          </h3>
                          <p className="text-xs text-slate-500">
                            Báo nghỉ trước để xếp học bù miễn phí
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Trung tâm cam kết dạy bù đầy đủ 100% số buổi cho học viên khi có đơn xin nghỉ hợp lệ từ phụ huynh.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsMakeupModalOpen(true)}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Gửi Đơn Xin Nghỉ & Học Bù</span>
                  </button>
                </div>
              </div>

              {/* Schedule Change Requests History */}
              <div className="bg-white p-5 rounded-3xl border border-purple-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900 font-heading flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-purple-600" />
                    <span>Lịch Sử Đơn Đổi Lịch / Chuyển Lớp Của Bé ({childScheduleChangeRequests.length})</span>
                  </h3>
                  <button
                    onClick={() => setIsScheduleChangeModalOpen(true)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-800 underline cursor-pointer"
                  >
                    + Gửi đơn mới
                  </button>
                </div>

                {childScheduleChangeRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">Chưa có yêu cầu đổi lịch học nào.</p>
                ) : (
                  <div className="space-y-2.5">
                    {childScheduleChangeRequests.map(req => (
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

              {/* History */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 font-heading">
                  Lịch Sử Đơn Xin Nghỉ & Học Bù Của Bé ({childMakeupRequests.length})
                </h3>
                {childMakeupRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có đơn xin nghỉ & học bù nào.</p>
                ) : (
                  <div className="space-y-2">
                    {childMakeupRequests.map(m => (
                      <div key={m.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">[Học bù] {m.className || 'Lớp học'} • Buổi nghỉ: {m.missedDate || m.originalDate}</p>
                          <p className="text-[11px] text-slate-500">Lịch bù mong muốn: {m.makeupDate || m.targetDate || 'Chưa định'} ({m.timeSlot || m.makeupTime || 'Theo lịch lớp'}) • Lý do: {m.reason}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                          {m.status === 'approved' ? 'Đã duyệt' : 'Đang xếp lịch'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-tab 2.3: Leave / Reservation Request */}
          {activeSubMenu === 'leave_request' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 font-heading">
                          Bảo Lưu Khóa Học Cho Con
                        </h3>
                        <p className="text-xs text-slate-500">
                          Bảo lưu học phí và số buổi còn lại khi gia đình có việc bận kéo dài.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsReservationModalOpen(true)}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Gửi Đơn Xin Bảo Lưu</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hỗ trợ bảo lưu tới 3 tháng. Khi bé đi học trở lại, trung tâm sẽ kích hoạt lại lớp học nguyên trạng.
                  </p>
                </div>
              </div>

              {/* History */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 font-heading">
                  Lịch Sử Đơn Bảo Lưu Khóa Học Của Bé ({childReservations.length})
                </h3>
                {childReservations.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Chưa có đơn xin bảo lưu nào.</p>
                ) : (
                  <div className="space-y-2">
                    {childReservations.map(r => (
                      <div key={r.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">[Bảo lưu] {r.courseName || r.className || 'Khóa học'} (Còn {r.remainingLessons || r.remainingLessonsHeld || r.sessionsRemaining || 12} buổi)</p>
                          <p className="text-[11px] text-slate-500">Thời gian: {r.startDate} đến {r.endDate} • Lý do: {r.reason}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
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

      {/* 3. HỌC PHÍ & VIETQR (TUITION) */}
      {activeMainMenu === 'tuition' && (
        <>
          {/* Sub-tab 3.1: Pending Invoices & VietQR */}
          {activeSubMenu === 'pending_invoices' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Tuition list & payment proof */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-base font-black text-slate-900 font-heading flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-rose-600" />
                        <span>Khoản Học Phí Của Bé {currentChild.fullName}</span>
                      </h3>

                      <button
                        onClick={() => {
                          setProofAmount(childTuitions[0]?.amount || 1800000);
                          setSelectedTuitionId(childTuitions[0]?.id || '');
                          setIsPaymentProofModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Nộp Biên Lai Chuyển Khoản</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {childTuitions.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Bé không có khoản học phí nào chưa đóng.</p>
                      ) : (
                        childTuitions.map(t => (
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
                                {t.status === 'paid' ? '✓ Đã Đóng' : 'Chưa Đóng'}
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

                {/* Right 1 Col: VietQR */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-rose-600 font-heading font-black text-sm">
                      <QrCode className="w-5 h-5" />
                      <span>Mã VietQR Đóng Học Phí</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <img
                        src={generateQrUrlForPayment(childTuitions[0] || { amount: 1800000 }, 1800000, `HV${currentChild.code || '001'} ${currentChild.fullName} HP T3`)}
                        alt="VietQR"
                        className="w-48 h-48 mx-auto rounded-xl shadow-xs"
                      />
                      <p className="text-[11px] text-slate-500 font-mono mt-2">Quét mã QR qua mọi ứng dụng ngân hàng</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                        <span className="text-slate-500">Ngân hàng:</span>
                        <span className="font-bold text-slate-800">{branding?.bankAccount?.bankName || 'MB Bank'}</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                        <span className="text-slate-500">Số tài khoản:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-900">{branding?.bankAccount?.accountNumber || '0988776655'}</span>
                          <button
                            onClick={() => copyToClipboard(branding?.bankAccount?.accountNumber || '0988776655', 'Số tài khoản')}
                            className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                            title="Sao chép"
                          >
                            {copiedField === 'Số tài khoản' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                        <span className="text-slate-500">Chủ TK:</span>
                        <span className="font-bold text-slate-800">{branding?.bankAccount?.accountHolder || 'TRUNG TAM MINH MUSIC'}</span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                        <span className="text-slate-500">Cú pháp CK:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-rose-600 truncate max-w-[140px]">
                            HV{currentChild.code || '001'} {currentChild.fullName} HP T3
                          </span>
                          <button
                            onClick={() => copyToClipboard(`HV${currentChild.code || '001'} ${currentChild.fullName} HP T3`, 'Cú pháp')}
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
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 font-heading">
                  Lịch Sử Nộp Biên Lai Đóng Học Phí ({childPaymentSubmissions.length})
                </h3>

                <button
                  onClick={() => {
                    setProofAmount(childTuitions[0]?.amount || 1800000);
                    setSelectedTuitionId(childTuitions[0]?.id || '');
                    setIsPaymentProofModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Nộp Biên Lai Mới</span>
                </button>
              </div>

              {childPaymentSubmissions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                  <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-xs">Chưa có lịch sử biên lai chuyển khoản nào.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {childPaymentSubmissions.map(p => (
                    <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-black text-sm text-slate-900">Số tiền: {p.amount?.toLocaleString()} VNĐ • Cú pháp: {p.transferSyntax}</p>
                        <p className="text-[11px] text-slate-500 mt-1">Thời gian gửi: {p.submittedAt} • Ghi chú: {p.notes || 'Không'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black w-fit ${
                        p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status === 'approved' ? '✓ Kế toán đã duyệt' : p.status === 'rejected' ? '✕ Từ chối' : '⏳ Chờ kế toán duyệt'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* 4. ĐỔI QUÀ & VINH DANH (REWARDS) */}
      {activeMainMenu === 'rewards' && (
        <>
          {/* Sub-tab 4.1: Reward Store */}
          {activeSubMenu === 'reward_store' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                      <Gift className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 font-heading">
                        Kho Quà Tặng Đổi Thưởng Cho Bé
                      </h3>
                      <p className="text-xs text-slate-500">
                        Điểm thưởng tích lũy của bé: <strong className="text-rose-600">{currentChild.rewardPoints ?? currentChild.stars ?? 0} Điểm</strong>
                      </p>
                    </div>
                  </div>

                  <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl">
                    💡 Đổi quà sẽ không làm giảm điểm Sao Bảng Vàng của bé!
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.map(r => {
                    const pts = r.pointsRequired ?? r.requiredPoints ?? 50;
                    const img = r.imageUrl || r.image || 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400';
                    const userPoints = currentChild.rewardPoints ?? currentChild.stars ?? 0;
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
                            const res = redeemReward(currentChild.id, r.id);
                            if (res.success) {
                              showToast(`🎉 Phụ huynh đã đổi thành công "${r.name}" cho bé ${currentChild.fullName}! Nhận quà tại quầy lễ tân.`);
                            } else {
                              alert(res.error || 'Bé chưa đủ điểm thưởng.');
                            }
                          }}
                          disabled={!canAfford}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            canAfford 
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Đổi Quà Này Cho Con' : `Còn thiếu ${pts - userPoints} điểm`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 4.2: Star Ranking / Honor Podium */}
          {activeSubMenu === 'star_ranking' && (
            <div className="space-y-6">
              <TopThreeHonorPodium
                title="Bảng Vàng Vinh Danh Toàn Trung Tâm"
                subtitle="Cùng xem thứ hạng rèn luyện và động viên bé cố gắng đạt thành tích tốt nhất!"
                showFilters={false}
                showFullLeaderboardBelow={true}
              />
            </div>
          )}
        </>
      )}

      {/* 5. TÀI KHOẢN PHỤ HUYNH & CÀI ĐẶT (ACCOUNT) */}
      {activeMainMenu === 'account' && (
        <StudentAccountSettings
          currentStudent={currentChild}
          activeSubSection={activeSubMenu as any}
          onOpenEditProfileModal={() => setIsProfileOpen(true)}
        />
      )}

      {/* MODAL 1: Submit Homework for child */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-heading">
                    Nộp Bài Tập / Video Cho Bé {currentChild.fullName}
                  </h3>
                  <p className="text-amber-100 text-xs mt-0.5 line-clamp-1">
                    {submittingAssignment.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSubmittingAssignment(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitHomework} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Link Video / Ghi Âm thực hành của bé (YouTube / Google Drive / TikTok):</span>
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?... hoặc link Google Drive"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>Ghi chú của phụ huynh gửi thầy cô:</span>
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Bé Hân đã luyện tập đoạn điệp khúc 15 phút mỗi ngày..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-amber-500 resize-none text-xs"
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
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gửi Bài Nộp Cho Thầy Cô</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Register Course / Subject / Class for child */}
      <CourseRegistrationFlowModal
        isOpen={isRegisterCourseModalOpen}
        onClose={() => setIsRegisterCourseModalOpen(false)}
        targetStudent={currentChild}
        isParentView={true}
        parentName={currentGuardian?.fullName || currentUser?.displayName || 'Phụ huynh'}
        onSuccess={() => showToast('🎉 Gửi đăng ký khóa học cho bé thành công! Ban Quản Trị sẽ sớm liên hệ xếp lịch.')}
      />

      {/* MODAL 3: Makeup Request for child */}
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
                    Đơn Xin Nghỉ & Đăng Ký Học Bù
                  </h3>
                  <p className="text-amber-100 text-xs mt-0.5">
                    Học viên: {currentChild.fullName}
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs"
                >
                  {classes.map(cl => (
                    <option key={cl.id} value={cl.id}>{cl.name} ({cl.subjectName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Ngày xin nghỉ:</label>
                  <input
                    type="date"
                    value={makeupMissedDate}
                    onChange={(e) => setMakeupMissedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Ngày mong muốn học bù:</label>
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
                <label className="block font-bold text-slate-800 mb-1">Lý do xin nghỉ:</label>
                <textarea
                  rows={2}
                  value={makeupReason}
                  onChange={(e) => setMakeupReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium resize-none text-xs"
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
                  <span>Gửi Đơn Xin Bù Lịch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Reservation Request for child */}
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
                    Gửi Đơn Bảo Lưu Cho Bé
                  </h3>
                  <p className="text-indigo-100 text-xs mt-0.5">
                    Học viên: {currentChild.fullName}
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
                  <label className="block font-bold text-slate-800 mb-1">Bắt đầu từ:</label>
                  <input
                    type="date"
                    value={reservationStartDate}
                    onChange={(e) => setReservationStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Dự kiến học lại:</label>
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium resize-none text-xs"
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
        targetStudent={currentChild}
        tuition={selectedTuitionId ? tuitionPayments.find(t => t.id === selectedTuitionId) : null}
        isParentView={true}
        parentName={currentGuardian?.fullName || currentUser?.displayName || 'Phụ huynh'}
        onSuccess={() => showToast('🎉 Nộp biên lai học phí cho bé thành công! Ban Quản Trị sẽ đối soát và xác nhận.')}
      />

      {/* MODAL 6: Request Schedule Change */}
      <RequestScheduleChangeModal
        isOpen={isScheduleChangeModalOpen}
        onClose={() => setIsScheduleChangeModalOpen(false)}
        student={currentChild}
        isParent={true}
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
