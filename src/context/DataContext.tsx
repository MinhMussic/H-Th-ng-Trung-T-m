import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Student,
  Teacher,
  Guardian,
  StudentGuardianLink,
  Subject,
  Course,
  ClassItem,
  ClassTeacher,
  ClassTeacherRole,
  AttendanceRecord,
  AttendanceStatus,
  TuitionPayment,
  BirthdayItem,
  BirthdayTemplate,
  Assignment,
  Submission,
  RewardItem,
  NotificationItem,
  MakeupRequest,
  ReservationRecord,
  TrialLesson,
  StarLeaderboardItem,
  TenantBranding,
  TenantBranch,
  BankAccountConfig,
  RegistrationRequest,
  ScheduleChangeRequest,
  PaymentSubmission,
  UserAccount,
  UserRole,
  CenterHoliday,
  MusicEvent,
  MusicEventType,
  EventAudience
} from '../types';
import {
  initialStudents,
  initialTeachers,
  initialGuardians,
  initialStudentGuardianLinks,
  initialSubjects,
  initialCourses,
  initialClasses,
  initialAttendance,
  initialTuitionPayments,
  initialBirthdayTemplates,
  initialAssignments,
  initialSubmissions,
  initialRewards,
  initialNotifications,
  initialBranding,
  initialBranches,
  initialReservations,
  initialTrialLessons,
  initialRegistrationRequests,
  initialScheduleChangeRequests,
  initialPaymentSubmissions,
  initialHolidays,
  initialEvents
} from '../data/initialData';
import { getNextAvailableStudentCode, getNextTrialCode, isStudentCodeProtectedOrLocked } from '../utils/studentCode';
import { sendInstantAttendancePush, formatAttendancePushMessage } from '../utils/pushNotification';

/**
 * Lọc thông báo chuẩn theo phân quyền người dùng:
 * - Admin & Giáo viên: Được thấy toàn bộ thông báo hệ thống và sinh nhật nội bộ.
 * - Học viên & Phụ huynh:
 *   + Tuyệt đối KHÔNG hiển thị thông báo sinh nhật nội bộ đại trà.
 *   + CHỈ hiển thị thông báo sinh nhật khi Admin/Giáo viên gửi lời chúc mừng sinh nhật cá nhân hóa đích danh đến học viên đó.
 *   + Hiển thị các thông báo chung phù hợp với vai trò của mình hoặc gửi trực tiếp cho mình/con em mình.
 */
export const filterNotificationsForUser = (
  notifications: NotificationItem[] = [],
  currentUser: UserAccount | null,
  currentRole: UserRole,
  studentProfileId?: string,
  linkedStudentIds: string[] = []
): NotificationItem[] => {
  return (notifications || []).filter(n => {
    // 1. Admin & Giáo viên có quyền xem toàn diện
    if (currentRole === 'ADMIN' || currentRole === 'TEACHER') {
      return true;
    }

    const currentUserId = currentUser?.uid || (currentUser as any)?.id;
    const isTargetStudent = !!studentProfileId && (n.recipientId === studentProfileId || n.studentId === studentProfileId);
    const isTargetUser = !!currentUserId && (n.recipientId === currentUserId || n.targetUserIds?.includes(currentUserId));
    const isLinkedChild = linkedStudentIds.some(id => n.recipientId === id || n.studentId === id || n.targetUserIds?.includes(id));

    // 2. Học viên & Phụ huynh với sinh nhật
    if (n.type === 'birthday') {
      if (!n.recipientId && (!n.targetUserIds || n.targetUserIds.length === 0)) {
        return false;
      }
      return isTargetStudent || isTargetUser || isLinkedChild;
    }

    // 3. Thông báo cá nhân hóa theo Học viên hoặc Phụ huynh (Điểm danh vắng, Nhận xét đánh giá, Học phí,...)
    if (n.recipientId || n.studentId || (n.targetUserIds && n.targetUserIds.length > 0)) {
      if (isTargetStudent || isTargetUser || isLinkedChild) return true;
      // Nếu có targetRoles nhưng thông báo gán cho studentId khác con mình => Không hiển thị
      if (n.studentId || n.recipientId) return false;
    }

    if (n.targetRoles && n.targetRoles.length > 0) {
      return n.targetRoles.includes(currentRole);
    }

    if (n.targetAudience) {
      if (n.targetAudience === 'ALL') return true;
      return n.targetAudience === currentRole;
    }

    return true;
  });
};

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  guardians: Guardian[];
  studentGuardianLinks: StudentGuardianLink[];
  subjects: Subject[];
  courses: Course[];
  classes: ClassItem[];
  attendance: AttendanceRecord[];
  attendanceRecords: AttendanceRecord[];
  tuitionPayments: TuitionPayment[];
  birthdayTemplates: BirthdayTemplate[];
  assignments: Assignment[];
  submissions: Submission[];
  rewards: RewardItem[];
  notifications: NotificationItem[];
  makeupRequests: MakeupRequest[];
  makeupSessions: MakeupRequest[];
  reservations: ReservationRecord[];
  reservationRequests: ReservationRecord[];
  trialLessons: TrialLesson[];
  registrationRequests: RegistrationRequest[];
  scheduleChangeRequests: ScheduleChangeRequest[];
  paymentSubmissions: PaymentSubmission[];
  starLeaderboard: StarLeaderboardItem[];
  branding: TenantBranding;
  bankConfig: BankAccountConfig;
  branches: TenantBranch[];
  activeBranchId: string;

  // Multi-Teacher Class Assignment (Many-to-Many)
  assignTeacherToClass: (
    classId: string,
    teacherId: string,
    roleInClass: ClassTeacherRole,
    subjects?: string[],
    startDate?: string,
    endDate?: string
  ) => { success: boolean; conflictWarning?: string; error?: string };
  removeTeacherFromClass: (classId: string, teacherId: string) => void;
  updateTeacherInClass: (classId: string, teacherId: string, updates: Partial<ClassTeacher>) => void;

  // Student-Guardian Link Scoping
  addStudentGuardianLink: (link: Omit<StudentGuardianLink, 'id' | 'createdAt'>) => void;
  updateStudentGuardianLink: (id: string, updates: Partial<StudentGuardianLink>) => void;
  deleteStudentGuardianLink: (id: string) => void;

  // User Requests Workflow (Student & Parent requests -> Pending -> Admin approval)
  submitRegistrationRequest: (req: Omit<RegistrationRequest, 'id' | 'requestedDate' | 'status'>) => void;
  approveRegistrationRequest: (requestId: string, adminNote?: string, targetClassId?: string, assignedLessons?: number) => void;
  rejectRegistrationRequest: (requestId: string, reason?: string) => void;

  submitScheduleChangeRequest: (req: Omit<ScheduleChangeRequest, 'id' | 'createdAt' | 'status'>) => void;
  approveScheduleChangeRequest: (requestId: string, adminResponse?: string) => void;
  rejectScheduleChangeRequest: (requestId: string, reason?: string) => void;

  submitPaymentReceipt: (sub: Omit<PaymentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  approvePaymentSubmission: (submissionId: string) => void;
  rejectPaymentSubmission: (submissionId: string) => void;

  // Scoped Data Retriever
  getScopedDataForUser: (user: UserAccount | null, activeRole: UserRole) => {
    scopedClasses: ClassItem[];
    scopedStudents: Student[];
    scopedTeachers: Teacher[];
    scopedAssignments: Assignment[];
    scopedSubmissions: Submission[];
    scopedAttendance: AttendanceRecord[];
    scopedTuition: TuitionPayment[];
    scopedMakeupRequests: MakeupRequest[];
    scopedGuardianLinks: StudentGuardianLink[];
    activeGuardianPermissions?: Record<string, StudentGuardianLink>;
  };

  // Branding & Multi-tenant & Bank
  updateBranding: (updates: Partial<TenantBranding>) => void;
  resetBranding: () => void;
  updateBankAccount: (config: Partial<BankAccountConfig>) => void;
  setActiveBranchId: (id: string) => void;
  addBranch: (branch: Omit<TenantBranch, 'id'>) => void;
  updateBranch: (id: string, updates: Partial<TenantBranch>) => void;
  deleteBranch: (id: string) => void;

  // Birthday Helpers
  getAllBirthdays: () => BirthdayItem[];
  getTodayBirthdays: () => BirthdayItem[];
  getTomorrowBirthdays: () => BirthdayItem[];
  get7DaysBirthdays: () => BirthdayItem[];
  getMonthBirthdays: (month?: number) => BirthdayItem[];
  sendBirthdayWish: (item: BirthdayItem, messageText?: string) => Promise<{ success: boolean; message: string }>;

  // Guardians (Phụ huynh & Người giám hộ) CRUD
  addGuardian: (guardian: Omit<Guardian, 'id' | 'createdAt'>) => void;
  updateGuardian: (id: string, updates: Partial<Guardian>) => void;
  deleteGuardian: (id: string) => void;
  linkGuardianToStudent: (guardianId: string, studentId: string) => void;

  // Students CRUD & Status Operations (Bảo lưu & Học thử & Khóa tài khoản)
  addStudent: (student: Omit<Student, 'id'> & { id?: string; joinDate?: string; stars?: number; completedLessons?: number }) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string, purgeData?: boolean) => void;
  toggleLockStudent: (studentId: string, isLocked: boolean, reason?: string) => void;
  awardStars: (studentId: string, amount: number, reason?: string) => void;
  adjustStudentStars: (
    studentId: string, 
    amount: number, 
    reason: string, 
    target?: 'stars' | 'rewardPoints' | 'both',
    actionType?: 'add' | 'deduct'
  ) => void;
  reserveStudentAccount: (studentId: string, startDate: string, endDate: string, reason: string, notes?: string) => void;
  reactivateStudentAccount: (studentId: string, targetClassId?: string) => void;
  convertTrialToOfficial: (
    trialStudentId: string,
    targetCourseId: string,
    targetClassId: string,
    totalLessons?: number,
    tuitionAmount?: number,
    officialCode?: string
  ) => { success: boolean; student?: Student; error?: string };

  // Teachers CRUD
  addTeacher: (teacher: Omit<Teacher, 'id' | 'joinDate'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Courses & Classes CRUD
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addClass: (cls: Omit<ClassItem, 'id'>) => void;
  updateClass: (id: string, updates: Partial<ClassItem>) => void;
  deleteClass: (id: string) => void;

  // Attendance
  recordAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  batchRecordAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  markAttendance: (classId: string, studentId: string, date: string, status: AttendanceStatus, note?: string, evaluation?: string, starsAwarded?: number) => void;

  // Tuition & QR Code Generation
  addTuitionPayment: (payment: Omit<TuitionPayment, 'id'>) => void;
  updateTuitionStatus: (id: string, status: 'paid' | 'pending' | 'overdue' | 'completed', paidAmount?: number) => void;
  updatePaymentStatus: (id: string, status: 'paid' | 'pending' | 'overdue' | 'completed', paidAmount?: number) => void;
  updateTuitionPayment: (id: string, updates: Partial<TuitionPayment>) => void;
  formatTransferContent: (studentCodeOrName: string, subjectName: string, billingMonth: string) => string;
  generateQrUrlForPayment: (payment: Partial<TuitionPayment>, customAmount?: number, customMemo?: string) => string;

  // Birthday Templates
  addBirthdayTemplate: (tpl: Omit<BirthdayTemplate, 'id'>) => void;
  updateBirthdayTemplate: (id: string, updates: Partial<BirthdayTemplate>) => void;
  deleteBirthdayTemplate: (id: string) => void;

  // Assignments & Rewards
  addAssignment: (asn: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  submitAssignment: (sub: Omit<Submission, 'id' | 'submittedAt'>) => void;
  gradeSubmission: (
    submissionId: string,
    gradeData: {
      grade: string;
      score?: number;
      teacherFeedback: string;
      starsAwarded: number;
      rewardPointsAwarded: number;
    }
  ) => void;
  redeemReward: (studentId: string, rewardId: string) => { success: boolean; error?: string };
  addReward: (reward: Omit<RewardItem, 'id'>) => void;
  updateReward: (id: string, updates: Partial<RewardItem>) => void;
  deleteReward: (id: string) => void;

  // Notifications
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  sendTeacherEvaluationToParent: (data: {
    studentId: string;
    studentName?: string;
    teacherName?: string;
    subjectName?: string;
    date?: string;
    evaluation: string;
    rating?: string;
    attitude?: string;
    homework?: string;
  }) => void;

  // Makeup & Reservations & Trial Lessons
  requestMakeup: (req: Omit<MakeupRequest, 'id' | 'createdAt' | 'status'> & { status?: MakeupRequest['status'] }) => void;
  addMakeupSession: (req: Omit<MakeupRequest, 'id' | 'createdAt' | 'status'> & { status?: MakeupRequest['status'] }) => void;
  updateMakeupStatus: (id: string, status: 'approved' | 'rejected' | 'completed' | 'cancelled' | 'scheduled') => void;
  requestReservation: (req: Omit<ReservationRecord, 'id' | 'createdAt' | 'status'>) => void;
  addReservationRequest: (req: Omit<ReservationRecord, 'id' | 'createdAt' | 'status'>) => void;
  updateReservationStatus: (id: string, status: 'approved' | 'ended' | 'rejected' | 'active') => void;
  cancelReservation: (id: string) => void;
  addTrialLesson: (trial: Omit<TrialLesson, 'id' | 'createdAt'>) => void;
  updateTrialLesson: (id: string, updates: Partial<TrialLesson>) => void;
  deleteTrialLesson: (id: string) => void;

  // Holidays Configuration (Lịch nghỉ lễ tự động miễn điểm danh)
  holidays: CenterHoliday[];
  addHoliday: (holiday: Omit<CenterHoliday, 'id' | 'createdAt'>) => void;
  updateHoliday: (id: string, updates: Partial<CenterHoliday>) => void;
  deleteHoliday: (id: string) => void;
  toggleHolidayActive: (id: string) => void;
  resetHolidaysToDefault: () => void;
  isHolidayDate: (dateStr: string) => { isHoliday: boolean; holiday?: CenterHoliday };
  getHolidayByDate: (dateStr: string) => CenterHoliday | undefined;

  // Music Events & Activities (Sự kiện biểu diễn, Masterclass, Workshop, Kỳ thi...)
  events: MusicEvent[];
  addEvent: (event: Omit<MusicEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, updates: Partial<MusicEvent>) => void;
  deleteEvent: (id: string) => void;
  registerStudentForEvent: (eventId: string, studentId: string) => { success: boolean; message?: string };
  cancelStudentEventRegistration: (eventId: string, studentId: string) => void;
  resetEventsToDefault: () => void;

  // Reset to initial seed
  resetDataToDefault: () => void;

  // Khôi phục cài đặt gốc về dữ liệu trống & Xuất bản sao lưu hệ thống
  factoryResetToEmptyData: (options?: { preserveSubjectsAndCourses?: boolean }) => void;
  exportSystemBackupJSON: () => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const PREFIX = 'minhmusic_data_';

// Helper function to generate globally unique IDs preventing React key collisions
let idCounter = 0;
export const generateUniqueId = (prefix: string = 'id'): string => {
  idCounter = (idCounter + 1) % 1000000;
  const rand = Math.random().toString(36).substring(2, 9) + Math.random().toString(36).substring(2, 6);
  return `${prefix}-${Date.now()}-${idCounter}-${rand}`;
};

const sanitizeUniqueCollection = <T extends { id: string }>(items: T[], prefix: string): T[] => {
  if (!items || !Array.isArray(items)) return [];
  const seenIds = new Set<string>();
  return items.map((item, idx) => {
    if (!item.id || seenIds.has(item.id)) {
      const newId = `${prefix}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 8)}`;
      seenIds.add(newId);
      return { ...item, id: newId };
    }
    seenIds.add(item.id);
    return item;
  });
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadInitial = <T,>(key: string, fallback: T): T => {
    const item = localStorage.getItem(PREFIX + key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch (e) {
        console.error(`Error parsing ${key}`, e);
      }
    }
    return fallback;
  };

  const [students, setStudents] = useState<Student[]>(() => {
    const loaded = loadInitial<Student[] | null>('students', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialStudents;
    const sanitized = sanitizeUniqueCollection(list, 'stu');
    return sanitized.map(s => ({
      ...s,
      totalStars: s.totalStars !== undefined ? s.totalStars : (s.stars || 0),
      rewardPoints: s.rewardPoints !== undefined ? s.rewardPoints : (s.stars || 0),
      stars: s.totalStars !== undefined ? s.totalStars : (s.stars || 0)
    }));
  });
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const loaded = loadInitial<Teacher[] | null>('teachers', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialTeachers;
    return sanitizeUniqueCollection(list, 'tch');
  });
  const [guardians, setGuardians] = useState<Guardian[]>(() => {
    const loaded = loadInitial<Guardian[] | null>('guardians', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialGuardians;
    return sanitizeUniqueCollection(list, 'grd');
  });
  const [studentGuardianLinks, setStudentGuardianLinks] = useState<StudentGuardianLink[]>(() => {
    const loaded = loadInitial<StudentGuardianLink[] | null>('student_guardian_links', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialStudentGuardianLinks;
    return sanitizeUniqueCollection(list, 'sgl');
  });
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const loaded = loadInitial<Subject[] | null>('subjects', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialSubjects;
    return sanitizeUniqueCollection(list, 'sub');
  });
  const [courses, setCourses] = useState<Course[]>(() => {
    const loaded = loadInitial<Course[] | null>('courses', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialCourses;
    return sanitizeUniqueCollection(list, 'crs');
  });
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const loaded = loadInitial<ClassItem[] | null>('classes', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialClasses;
    return sanitizeUniqueCollection(list, 'cls');
  });
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const loaded = loadInitial<AttendanceRecord[] | null>('attendance', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialAttendance;
    return sanitizeUniqueCollection(list, 'att');
  });
  const [tuitionPayments, setTuitionPayments] = useState<TuitionPayment[]>(() => {
    const loaded = loadInitial<TuitionPayment[] | null>('tuition', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialTuitionPayments;
    return sanitizeUniqueCollection(list, 'tui');
  });
  const [birthdayTemplates, setBirthdayTemplates] = useState<BirthdayTemplate[]>(() => {
    const loaded = loadInitial<BirthdayTemplate[] | null>('bdt_templates', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialBirthdayTemplates;
    return sanitizeUniqueCollection(list, 'bdt');
  });
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const loaded = loadInitial<Assignment[] | null>('assignments', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialAssignments;
    return sanitizeUniqueCollection(list, 'asn');
  });
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const loaded = loadInitial<Submission[] | null>('submissions', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialSubmissions;
    return sanitizeUniqueCollection(list, 'sub');
  });
  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    const loaded = loadInitial<RewardItem[] | null>('rewards', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialRewards;
    return sanitizeUniqueCollection(list, 'rwd');
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const loaded = loadInitial<NotificationItem[] | null>('notifications', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialNotifications;
    return sanitizeUniqueCollection(list, 'notif');
  });
  const [makeupRequests, setMakeupRequests] = useState<MakeupRequest[]>(() => {
    const loaded = loadInitial<MakeupRequest[] | null>('makeup_reqs', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : [];
    return sanitizeUniqueCollection(list, 'mk');
  });
  const [reservations, setReservations] = useState<ReservationRecord[]>(() => {
    const loaded = loadInitial<ReservationRecord[] | null>('reservations', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialReservations;
    return sanitizeUniqueCollection(list, 'res');
  });
  const [trialLessons, setTrialLessons] = useState<TrialLesson[]>(() => {
    const loaded = loadInitial<TrialLesson[] | null>('trials', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialTrialLessons;
    return sanitizeUniqueCollection(list, 'trial');
  });
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>(() => {
    const loaded = loadInitial<RegistrationRequest[] | null>('reg_requests', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialRegistrationRequests;
    return sanitizeUniqueCollection(list, 'reg-req');
  });
  const [scheduleChangeRequests, setScheduleChangeRequests] = useState<ScheduleChangeRequest[]>(() => {
    const loaded = loadInitial<ScheduleChangeRequest[] | null>('sch_change_reqs', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialScheduleChangeRequests;
    return sanitizeUniqueCollection(list, 'scr');
  });
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>(() => {
    const loaded = loadInitial<PaymentSubmission[] | null>('payment_submissions', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialPaymentSubmissions;
    return sanitizeUniqueCollection(list, 'ps');
  });
  const [branding, setBranding] = useState<TenantBranding>(() => loadInitial('branding', initialBranding));
  const [branches, setBranches] = useState<TenantBranch[]>(() => {
    const loaded = loadInitial<TenantBranch[] | null>('branches', null);
    const list = loaded !== null && Array.isArray(loaded) && loaded.length > 0 ? loaded : initialBranches;
    // Merge any missing fields like googleMapsUrl from initialBranches
    const merged = list.map(b => {
      const def = initialBranches.find(ib => ib.id === b.id);
      return {
        ...def,
        ...b,
        googleMapsUrl: b.googleMapsUrl || def?.googleMapsUrl || 'https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac'
      };
    });
    return sanitizeUniqueCollection(merged, 'branch');
  });
  const [activeBranchId, setActiveBranchId] = useState<string>(() => loadInitial('active_branch_id', initialBranches[0]?.id || 'branch-01'));
  const [holidays, setHolidays] = useState<CenterHoliday[]>(() => {
    const loaded = loadInitial<CenterHoliday[] | null>('holidays', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialHolidays;
    return sanitizeUniqueCollection(list, 'hol');
  });
  const [events, setEvents] = useState<MusicEvent[]>(() => {
    const loaded = loadInitial<MusicEvent[] | null>('events', null);
    const list = loaded !== null && Array.isArray(loaded) ? loaded : initialEvents;
    return sanitizeUniqueCollection(list, 'evt');
  });

  // Sync to local storage
  useEffect(() => { localStorage.setItem(PREFIX + 'events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem(PREFIX + 'holidays', JSON.stringify(holidays)); }, [holidays]);
  useEffect(() => { localStorage.setItem(PREFIX + 'students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem(PREFIX + 'teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem(PREFIX + 'guardians', JSON.stringify(guardians)); }, [guardians]);
  useEffect(() => { localStorage.setItem(PREFIX + 'student_guardian_links', JSON.stringify(studentGuardianLinks)); }, [studentGuardianLinks]);
  useEffect(() => { localStorage.setItem(PREFIX + 'subjects', JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem(PREFIX + 'courses', JSON.stringify(courses)); }, [courses]);
  useEffect(() => { localStorage.setItem(PREFIX + 'classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem(PREFIX + 'attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem(PREFIX + 'tuition', JSON.stringify(tuitionPayments)); }, [tuitionPayments]);
  useEffect(() => { localStorage.setItem(PREFIX + 'bdt_templates', JSON.stringify(birthdayTemplates)); }, [birthdayTemplates]);
  useEffect(() => { localStorage.setItem(PREFIX + 'assignments', JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem(PREFIX + 'submissions', JSON.stringify(submissions)); }, [submissions]);
  useEffect(() => { localStorage.setItem(PREFIX + 'rewards', JSON.stringify(rewards)); }, [rewards]);
  useEffect(() => { localStorage.setItem(PREFIX + 'notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(PREFIX + 'reservations', JSON.stringify(reservations)); }, [reservations]);
  useEffect(() => { localStorage.setItem(PREFIX + 'trials', JSON.stringify(trialLessons)); }, [trialLessons]);
  useEffect(() => { localStorage.setItem(PREFIX + 'reg_requests', JSON.stringify(registrationRequests)); }, [registrationRequests]);
  useEffect(() => { localStorage.setItem(PREFIX + 'sch_change_reqs', JSON.stringify(scheduleChangeRequests)); }, [scheduleChangeRequests]);
  useEffect(() => { localStorage.setItem(PREFIX + 'payment_submissions', JSON.stringify(paymentSubmissions)); }, [paymentSubmissions]);
  useEffect(() => { localStorage.setItem(PREFIX + 'branding', JSON.stringify(branding)); }, [branding]);
  useEffect(() => { localStorage.setItem(PREFIX + 'branches', JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem(PREFIX + 'active_branch_id', JSON.stringify(activeBranchId)); }, [activeBranchId]);

  // Birthday calculation engine
  const calculateBirthdayInfo = (
    id: string,
    name: string,
    role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'GUARDIAN',
    birthDateStr: string,
    phone?: string,
    avatar?: string,
    classNameOrSubject?: string
  ): BirthdayItem | null => {
    if (!birthDateStr) return null;
    const parts = birthDateStr.split('-');
    if (parts.length < 3) return null;
    const bMonth = parseInt(parts[1], 10);
    const bDay = parseInt(parts[2], 10);
    const bYear = parseInt(parts[0], 10);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    const currentDay = now.getDate();

    // Birthday this year
    let nextBday = new Date(currentYear, bMonth - 1, bDay);
    const todayZero = new Date(currentYear, currentMonth - 1, currentDay);
    
    // Difference in days
    const diffTime = nextBday.getTime() - todayZero.getTime();
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // Birthday already passed this year, calculate for next year
      nextBday = new Date(currentYear + 1, bMonth - 1, bDay);
      diffDays = Math.ceil((nextBday.getTime() - todayZero.getTime()) / (1000 * 60 * 60 * 24));
    }

    let category: 'today' | 'tomorrow' | '7days' | 'this_month' = 'this_month';
    if (diffDays === 0) {
      category = 'today';
    } else if (diffDays === 1) {
      category = 'tomorrow';
    } else if (diffDays <= 7) {
      category = '7days';
    } else if (bMonth === currentMonth) {
      category = 'this_month';
    }

    const turningAge = (currentYear - bYear) + (diffDays < 0 ? 1 : 0);

    return {
      id,
      name,
      role,
      birthDate: birthDateStr,
      age: turningAge > 0 ? turningAge : 0,
      phone,
      avatar,
      classNameOrSubject,
      daysUntilBirthday: diffDays,
      category
    };
  };

  const getAllBirthdays = (): BirthdayItem[] => {
    const list: BirthdayItem[] = [];
    
    // Students
    (students || []).forEach(s => {
      const cls = (classes || []).find(c => s.enrolledClassIds?.includes(c.id));
      const subjText = (s.enrolledSubjects || []).join(', ') || 'Âm nhạc';
      const info = calculateBirthdayInfo(
        s.id, 
        s.fullName, 
        'STUDENT', 
        s.birthDate, 
        s.phone, 
        s.avatar, 
        cls ? `${subjText} • ${cls.name}` : subjText
      );
      if (info) list.push(info);
    });

    // Teachers
    (teachers || []).forEach(t => {
      const specsText = (t.specialties || []).join(', ') || 'Giáo viên';
      const info = calculateBirthdayInfo(
        t.id, 
        t.fullName, 
        'TEACHER', 
        t.birthDate, 
        t.phone, 
        t.avatar, 
        `Giảng viên ${specsText}`
      );
      if (info) list.push(info);
    });

    // Sort by days until birthday
    return list.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
  };

  const getTodayBirthdays = (): BirthdayItem[] => {
    return getAllBirthdays().filter(b => b.category === 'today' || b.daysUntilBirthday === 0);
  };

  const getTomorrowBirthdays = (): BirthdayItem[] => {
    return getAllBirthdays().filter(b => b.daysUntilBirthday === 1);
  };

  const get7DaysBirthdays = (): BirthdayItem[] => {
    return getAllBirthdays().filter(b => b.daysUntilBirthday >= 0 && b.daysUntilBirthday <= 7);
  };

  const getMonthBirthdays = (month?: number): BirthdayItem[] => {
    const targetMonth = month || (new Date().getMonth() + 1);
    return getAllBirthdays().filter(b => {
      const parts = b.birthDate.split('-');
      return parseInt(parts[1], 10) === targetMonth;
    });
  };

  const sendBirthdayWish = async (item: BirthdayItem, messageText?: string): Promise<{ success: boolean; message: string }> => {
    // Fire festive confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti effect triggered');
    }

    const defaultMsg = `Chúc mừng sinh nhật ${item.name}! Chúc bạn thêm một tuổi mới luôn tràn đầy cảm hứng âm nhạc và hạnh phúc! 🎂🎶✨`;
    const finalMsg = messageText || defaultMsg;

    // Add targeted birthday congratulation notification - ONLY visible to that student/parent or admin/teachers
    const targetRoles: UserRole[] = item.role === 'STUDENT' 
      ? ['STUDENT', 'PARENT', 'ADMIN', 'TEACHER'] 
      : [item.role, 'ADMIN', 'TEACHER'];

    const newNotif: NotificationItem = {
      id: generateUniqueId('notif-bday'),
      title: item.role === 'STUDENT' ? `🎂 Bạn đã nhận được lời chúc sinh nhật từ Minh Music Center!` : `🎉 Chúc mừng sinh nhật ${item.name}! 🎂`,
      content: `🎉 Chúc mừng sinh nhật ${item.name} (${item.classNameOrSubject || 'Trung tâm Minh Music'})! ${finalMsg}`,
      type: 'birthday',
      targetRoles,
      recipientId: item.id,
      targetUserIds: [item.id],
      createdAt: 'Vừa xong',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    return {
      success: true,
      message: `Đã tạo thiệp và gửi lời chúc mừng sinh nhật thành công tới ${item.name}!`
    };
  };

  // Guardian CRUD
  const addGuardian = (guardianData: Omit<Guardian, 'id' | 'createdAt'>) => {
    const code = `PH${String(guardians.length + 1).padStart(3, '0')}`;
    const newGuardian: Guardian = {
      ...guardianData,
      id: generateUniqueId('grd'),
      code: guardianData.code || code,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setGuardians(prev => [newGuardian, ...prev]);
  };

  const updateGuardian = (id: string, updates: Partial<Guardian>) => {
    setGuardians(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGuardian = (id: string) => {
    setGuardians(prev => prev.filter(g => g.id !== id));
  };

  const linkGuardianToStudent = (guardianId: string, studentId: string) => {
    setGuardians(prev => prev.map(g => {
      if (g.id === guardianId && !g.linkedStudentIds.includes(studentId)) {
        return { ...g, linkedStudentIds: [...g.linkedStudentIds, studentId] };
      }
      return g;
    }));

    setStudents(prev => prev.map(s => {
      if (s.id === studentId && !s.linkedGuardianIds?.includes(guardianId)) {
        return { ...s, linkedGuardianIds: [...(s.linkedGuardianIds || []), guardianId] };
      }
      return s;
    }));
  };

  // Students CRUD
  const addStudent = (studentData: Omit<Student, 'id'> & { id?: string; joinDate?: string; stars?: number; completedLessons?: number }) => {
    // Generate next strictly available code (HV001, HV002, ...)
    const code = studentData.code || getNextAvailableStudentCode(students);
    const initialStars = studentData.stars ?? studentData.totalStars ?? 20;
    const newStudent: Student = {
      ...studentData,
      id: studentData.id || generateUniqueId('stu'),
      code,
      completedLessons: studentData.completedLessons ?? 0,
      stars: initialStars, // Welcome star bonus
      totalStars: studentData.totalStars ?? initialStars, // Điểm sao vinh danh tích lũy BXH
      rewardPoints: studentData.rewardPoints ?? initialStars, // Điểm thưởng đổi quà khả dụng
      joinDate: studentData.joinDate || studentData.joinedDate || new Date().toISOString().split('T')[0],
      status: studentData.status || 'active'
    };
    setStudents(prev => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  /**
   * Xóa học viên và làm mới sạch sẽ thông tin liên quan.
   * Mã học viên cũ sẽ được tự động giải phóng sạch sẽ để học viên tiếp theo sử dụng lại từ đầu.
   */
  const deleteStudent = (id: string, purgeData: boolean = true) => {
    const targetStudent = students.find(s => s.id === id);
    const targetCode = targetStudent?.code;

    // 1. Loại bỏ học viên khỏi danh sách
    setStudents(prev => prev.filter(s => s.id !== id));

    if (purgeData && targetStudent) {
      // 2. Làm sạch học viên khỏi danh sách lớp học
      setClasses(prev => prev.map(c => {
        const remainingStudentIds = (c.studentIds || []).filter(sid => sid !== id);
        return {
          ...c,
          studentIds: remainingStudentIds,
          currentStudents: remainingStudentIds.length
        };
      }));

      // 3. Xóa liên kết phụ huynh
      setStudentGuardianLinks(prev => prev.filter(l => l.studentId !== id));

      // 4. Xóa toàn bộ điểm danh cũ
      setAttendance(prev => prev.filter(a => a.studentId !== id));

      // 5. Xóa toàn bộ bài tập và nộp bài cũ
      setSubmissions(prev => prev.filter(sub => sub.studentId !== id));

      // 6. Xóa học phí cũ
      setTuitionPayments(prev => prev.filter(t => t.studentId !== id && (targetCode ? t.studentCode !== targetCode : true)));

      // 7. Xóa đơn đăng ký và bảo lưu
      setReservations(prev => prev.filter(r => r.studentId !== id));
      setRegistrationRequests(prev => prev.filter(r => r.studentId !== id));
      setScheduleChangeRequests(prev => prev.filter(r => r.studentId !== id));
      setPaymentSubmissions(prev => prev.filter(p => p.studentId !== id));

      // 8. Tẩy sạch thông tin liên kết trong tài khoản người dùng
      try {
        const savedAccs = localStorage.getItem('minhmusic_user_accounts_v2');
        if (savedAccs) {
          const parsed = JSON.parse(savedAccs);
          if (Array.isArray(parsed)) {
            const updatedAccs = parsed.filter(a => 
              a.profileId !== id && 
              a.studentProfileId !== id && 
              (targetCode ? a.profileCode !== targetCode && a.code !== targetCode : true)
            );
            localStorage.setItem('minhmusic_user_accounts_v2', JSON.stringify(updatedAccs));
          }
        }
      } catch (err) {
        console.error('Failed to clean user accounts on student deletion', err);
      }
    }
  };

  /**
   * Tạm khóa / Mở khóa tài khoản học viên và bảo vệ mã học viên
   */
  const toggleLockStudent = (studentId: string, isLocked: boolean, reason?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newStatus: Student['status'] = isLocked ? 'locked' : 'active';
    setStudents(prev => prev.map(s => s.id === studentId ? {
      ...s,
      status: newStatus,
      notes: reason ? `${s.notes ? s.notes + ' | ' : ''}${isLocked ? 'Tạm khóa: ' : 'Mở khóa: '}${reason}` : s.notes
    } : s));

    // Đồng bộ trạng thái khóa sang tài khoản người dùng
    try {
      const savedAccs = localStorage.getItem('minhmusic_user_accounts_v2');
      if (savedAccs) {
        const parsed = JSON.parse(savedAccs);
        if (Array.isArray(parsed)) {
          const updatedAccs = parsed.map((a: any) => {
            if (a.profileId === studentId || a.studentProfileId === studentId || (student.code && a.profileCode === student.code)) {
              return {
                ...a,
                status: isLocked ? 'suspended' : 'active',
                note: reason || (isLocked ? 'Tài khoản học viên bị Quản trị viên tạm khóa' : 'Đã mở khóa học viên')
              };
            }
            return a;
          });
          localStorage.setItem('minhmusic_user_accounts_v2', JSON.stringify(updatedAccs));
        }
      }
    } catch (e) {
      console.error('Sync lock state error', e);
    }

    addNotification({
      title: isLocked ? '🔒 Học viên bị tạm khóa' : '🔓 Đã mở khóa học viên',
      content: `Học viên ${student.fullName} (${student.code}) đã được ${isLocked ? 'tạm khóa' : 'mở khóa'} trạng thái tài khoản. ${reason ? `Lý do: ${reason}` : ''}`,
      type: 'system',
      targetRoles: ['ADMIN', 'TEACHER']
    });
  };

  const adjustStudentStars = (
    studentId: string, 
    amount: number, 
    reason: string, 
    target: 'stars' | 'rewardPoints' | 'both' = 'both',
    actionType: 'add' | 'deduct' = amount >= 0 ? 'add' : 'deduct'
  ) => {
    const delta = actionType === 'deduct' ? -Math.abs(amount) : Math.abs(amount);
    
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const currentTotal = s.totalStars !== undefined ? s.totalStars : (s.stars || 0);
        const currentReward = s.rewardPoints !== undefined ? s.rewardPoints : (s.stars || 0);
        
        const newTotal = (target === 'stars' || target === 'both')
          ? Math.max(0, currentTotal + delta)
          : currentTotal;
          
        const newReward = (target === 'rewardPoints' || target === 'both')
          ? Math.max(0, currentReward + delta)
          : currentReward;
          
        return {
          ...s,
          stars: newTotal,
          totalStars: newTotal,
          rewardPoints: newReward
        };
      }
      return s;
    }));

    // Gửi thông báo trực tiếp đến học viên
    const st = students.find(s => s.id === studentId);
    if (st) {
      const notifTitle = actionType === 'add' 
        ? `+${Math.abs(amount)} Điểm Thưởng Mới ⭐️` 
        : `-${Math.abs(amount)} Điểm Thưởng ⭐️`;
      const targetText = target === 'both' ? 'Sao Vinh Danh & Điểm Quà' : target === 'stars' ? 'Sao Vinh Danh' : 'Điểm Đổi Quà';
      const notifMsg = `Học viên ${st.fullName} được ${actionType === 'add' ? 'cộng' : 'trừ'} ${Math.abs(amount)} điểm (${targetText}). Lý do: ${reason || 'Điều chỉnh điểm từ Trung tâm'}`;
      
      const newNotif: NotificationItem = {
        id: generateUniqueId('notif-star'),
        title: notifTitle,
        content: notifMsg,
        type: 'general',
        createdAt: new Date().toISOString().split('T')[0],
        isRead: false,
        recipientId: st.id,
        targetAudience: 'STUDENT'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const awardStars = (studentId: string, amount: number, reason?: string) => {
    adjustStudentStars(studentId, amount, reason || 'Thưởng sao xuất sắc', 'both', 'add');
  };

  // Teachers CRUD
  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'joinDate'>) => {
    const code = `GV${String(teachers.length + 1).padStart(3, '0')}`;
    const newTeacher: Teacher = {
      ...teacherData,
      id: generateUniqueId('tch'),
      code: teacherData.code || code,
      joinDate: new Date().toISOString().split('T')[0]
    };
    setTeachers(prev => [newTeacher, ...prev]);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  // Subjects & Courses & Classes
  const addSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...subjectData,
      id: generateUniqueId('sub')
    };
    setSubjects(prev => [...prev, newSub]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCrs: Course = {
      ...courseData,
      id: generateUniqueId('crs')
    };
    setCourses(prev => [...prev, newCrs]);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const addClass = (classData: Omit<ClassItem, 'id'>) => {
    const newCls: ClassItem = {
      ...classData,
      id: generateUniqueId('cls')
    };
    setClasses(prev => [...prev, newCls]);
  };

  const updateClass = (id: string, updates: Partial<ClassItem>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  // Student reservation (Bảo lưu tài khoản)
  const reserveStudentAccount = (
    studentId: string,
    startDate: string,
    endDate: string,
    reason: string,
    notes?: string
  ) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const firstClass = classes.find(c => student.enrolledClassIds?.includes(c.id));

    // Update student status
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status: 'reserved',
          notes: notes ? `${s.notes ? s.notes + ' | ' : ''}Bảo lưu từ ${startDate} đến ${endDate}: ${reason}` : s.notes
        };
      }
      return s;
    }));

    // Create reservation record
    const newReservation: ReservationRecord = {
      id: generateUniqueId('res'),
      studentId: student.id,
      studentName: student.fullName,
      classId: firstClass?.id,
      className: firstClass?.name,
      subjectName: student.enrolledSubjects?.join(', ') || 'Âm nhạc',
      startDate,
      endDate,
      sessionsRemaining: student.remainingLessons || 0,
      remainingLessonsHeld: student.remainingLessons || 0,
      reason,
      status: 'active',
      approvedDate: new Date().toISOString().split('T')[0],
      notes: notes || `Bảo toàn ${student.remainingLessons || 0} buổi học và ${student.stars || 0} sao.`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setReservations(prev => [newReservation, ...prev]);

    // Send notification
    addNotification({
      title: '⏸️ Xác nhận bảo lưu học viên',
      content: `Học viên ${student.fullName} (${student.code}) đã được bảo lưu từ ${startDate} đến ${endDate}. Bảo toàn ${student.remainingLessons || 0} buổi học.`,
      type: 'system',
      targetRoles: ['ADMIN', 'TEACHER', 'PARENT']
    });
  };

  // Reactivate student account (Khôi phục học viên đi học lại)
  const reactivateStudentAccount = (studentId: string, targetClassId?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        let updatedClasses = s.enrolledClassIds || [];
        if (targetClassId && !updatedClasses.includes(targetClassId)) {
          updatedClasses = [...updatedClasses, targetClassId];
        }
        return {
          ...s,
          status: 'active',
          enrolledClassIds: updatedClasses
        };
      }
      return s;
    }));

    // Mark current active reservations for this student as ended
    setReservations(prev => prev.map(r => {
      if (r.studentId === studentId && (r.status === 'active' || r.status === 'pending')) {
        return { ...r, status: 'ended' };
      }
      return r;
    }));

    addNotification({
      title: '🎉 Chào mừng học viên quay trở lại học tập!',
      content: `Học viên ${student.fullName} (${student.code}) đã khôi phục trạng thái Đang học. Chúc em có những giờ học âm nhạc tuyệt vời!`,
      type: 'system',
      targetRoles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT']
    });
  };

  // Convert Trial to Official Student (Chuyển học viên học thử sang chính thức)
  const convertTrialToOfficial = (
    trialStudentId: string,
    targetCourseId: string,
    targetClassId: string,
    totalLessons: number = 24,
    tuitionAmount: number = 4800000,
    customOfficialCode?: string
  ): { success: boolean; student?: Student; error?: string } => {
    const student = students.find(s => s.id === trialStudentId);
    if (!student) {
      return { success: false, error: 'Không tìm thấy học viên học thử.' };
    }

    const course = courses.find(c => c.id === targetCourseId);
    const cls = classes.find(c => c.id === targetClassId);

    // Generate next official student code if not provided
    let newCode = customOfficialCode;
    if (!newCode || newCode.startsWith('HT')) {
      const existingOfficialNums = students
        .filter(s => s.code && s.code.startsWith('HV'))
        .map(s => parseInt(s.code.replace('HV', ''), 10))
        .filter(n => !isNaN(n));
      const maxNum = existingOfficialNums.length > 0 ? Math.max(...existingOfficialNums) : 6;
      newCode = `HV${String(maxNum + 1).padStart(3, '0')}`;
    }

    const currentMonth = `Tháng ${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
    const subjectName = course?.subject || (course?.subjectId ? subjects.find(s => s.id === course.subjectId)?.name : '') || student.enrolledSubjects?.[0] || 'Âm nhạc';

    // Update student
    const currentStars = student.totalStars !== undefined ? student.totalStars : (student.stars || 0);
    const currentRewards = student.rewardPoints !== undefined ? student.rewardPoints : (student.stars || 0);
    const updatedStudent: Student = {
      ...student,
      code: newCode,
      status: 'active',
      enrolledSubjects: [subjectName],
      enrolledClassIds: targetClassId ? [targetClassId] : [],
      totalLessons: totalLessons || 24,
      completedLessons: 0,
      remainingLessons: totalLessons || 24,
      stars: currentStars + 20, // +20 welcome stars!
      totalStars: currentStars + 20,
      rewardPoints: currentRewards + 20,
      notes: `${student.notes ? student.notes + ' | ' : ''}Chính thức nhập học khóa ${course?.name || 'mới'} ngày ${new Date().toLocaleDateString('vi-VN')}`
    };

    setStudents(prev => prev.map(s => s.id === trialStudentId ? updatedStudent : s));

    // Update class studentIds if class selected
    if (targetClassId) {
      setClasses(prev => prev.map(c => {
        if (c.id === targetClassId) {
          const sIds = c.studentIds || [];
          if (!sIds.includes(trialStudentId)) {
            return { ...c, studentIds: [...sIds, trialStudentId], currentStudents: (c.currentStudents || 0) + 1 };
          }
        }
        return c;
      }));
    }

    // Mark trial lessons as converted
    setTrialLessons(prev => prev.map(t => {
      if (t.studentId === trialStudentId || t.studentName === student.fullName) {
        return { ...t, status: 'converted', convertedDate: new Date().toISOString().split('T')[0] };
      }
      return t;
    }));

    // Create Initial Tuition Payment with format [Code] - [Subject] - [Month]
    const transferMemo = formatTransferContent(newCode, subjectName, currentMonth);
    const newTuition: TuitionPayment = {
      id: generateUniqueId('tui'),
      code: `HP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      studentId: student.id,
      studentCode: newCode,
      studentName: student.fullName,
      courseId: targetCourseId,
      courseName: course?.name || 'Khóa học chính thức',
      subjectName,
      billingMonth: currentMonth,
      sessionsCount: totalLessons,
      amount: tuitionAmount,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      paymentMethod: 'VietQR',
      transferSyntax: transferMemo,
      invoiceNote: `Học phí nhập học chính thức khóa ${course?.name || 'mới'}. Nhận ưu đãi 20 ⭐ sao thưởng chào mừng!`
    };
    setTuitionPayments(prev => [newTuition, ...prev]);

    // Send congratulation notification
    addNotification({
      title: '🎉 Chúc mừng học viên chính thức mới!',
      content: `Học viên ${student.fullName} đã chính thức nhập học môn ${subjectName} (Mã HV: ${newCode}). Tặng 20 ⭐ sao chào mừng!`,
      type: 'system',
      targetRoles: ['ADMIN', 'TEACHER', 'PARENT', 'STUDENT']
    });

    return { success: true, student: updatedStudent };
  };

  // Trial Lessons CRUD
  const addTrialLesson = (trialData: Omit<TrialLesson, 'id' | 'createdAt'>) => {
    const newTrial: TrialLesson = {
      ...trialData,
      id: generateUniqueId('trial'),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTrialLessons(prev => [newTrial, ...prev]);
  };

  const updateTrialLesson = (id: string, updates: Partial<TrialLesson>) => {
    setTrialLessons(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTrialLesson = (id: string) => {
    setTrialLessons(prev => prev.filter(t => t.id !== id));
  };

  const cancelReservation = (id: string) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  };

  // Holiday Configuration Methods (Lịch nghỉ lễ tự động miễn trừ điểm danh)
  const isHolidayDate = (dateStr: string): { isHoliday: boolean; holiday?: CenterHoliday } => {
    if (!dateStr) return { isHoliday: false };
    const found = holidays.find(h => h.isActive && h.autoExemptAttendance && dateStr >= h.startDate && dateStr <= h.endDate);
    return {
      isHoliday: !!found,
      holiday: found
    };
  };

  const getHolidayByDate = (dateStr: string): CenterHoliday | undefined => {
    if (!dateStr) return undefined;
    return holidays.find(h => h.isActive && dateStr >= h.startDate && dateStr <= h.endDate);
  };

  const addHoliday = (holidayData: Omit<CenterHoliday, 'id' | 'createdAt'>) => {
    const newHoliday: CenterHoliday = {
      ...holidayData,
      id: generateUniqueId('hol'),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setHolidays(prev => [newHoliday, ...prev]);
    addNotification({
      title: '🌴 Cấu hình lịch nghỉ lễ mới',
      content: `Đã cập nhật ngày nghỉ lễ "${newHoliday.name}" (${newHoliday.startDate} đến ${newHoliday.endDate}). Hệ thống tự động không tính các ngày này vào lịch điểm danh của học viên.`,
      type: 'system',
      targetRoles: ['ADMIN', 'TEACHER']
    });
  };

  const updateHoliday = (id: string, updates: Partial<CenterHoliday>) => {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHoliday = (id: string) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
  };

  const toggleHolidayActive = (id: string) => {
    setHolidays(prev => prev.map(h => h.id === id ? { ...h, isActive: !h.isActive } : h));
  };

  const resetHolidaysToDefault = () => {
    setHolidays(initialHolidays);
    localStorage.setItem(PREFIX + 'holidays', JSON.stringify(initialHolidays));
  };

  // Music Events & Calendar Activities CRUD (Recitals, Masterclasses, Holidays, Workshops, Competitions)
  const addEvent = (eventData: Omit<MusicEvent, 'id' | 'createdAt'>) => {
    const newEvent: MusicEvent = {
      ...eventData,
      id: generateUniqueId('evt'),
      currentParticipants: eventData.currentParticipants ?? (eventData.registeredStudentIds ? eventData.registeredStudentIds.length : 0),
      registeredStudentIds: eventData.registeredStudentIds || [],
      status: eventData.status || 'upcoming',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setEvents(prev => [newEvent, ...prev]);

    // Dispatch automatic system announcement notification to relevant audiences
    const typeNames: Record<MusicEventType, string> = {
      recital: 'Hòa Nhạc & Báo Cáo',
      masterclass: 'Masterclass Chuyên Sâu',
      holiday: 'Lịch Nghỉ Lễ',
      workshop: 'Workshop Âm Nhạc',
      competition: 'Cuộc Thi & Festival',
      exam: 'Kỳ Thi Định Kỳ',
      other: 'Sự Kiện'
    };
    const typeLabel = typeNames[newEvent.type] || 'Sự kiện';

    addNotification({
      title: `🎵 ${typeLabel} mới: ${newEvent.title}`,
      content: `Sự kiện sẽ diễn ra vào ngày ${newEvent.startDate}${newEvent.startTime ? ` lúc ${newEvent.startTime}` : ''}${newEvent.location ? ` tại ${newEvent.location}` : ''}. Kính mời Quý phụ huynh, Giảng viên & Học viên theo dõi!`,
      type: 'event',
      targetAudience: newEvent.targetAudience,
      severity: newEvent.isFeatured ? 'alert' : 'info'
    });
  };

  const updateEvent = (id: string, updates: Partial<MusicEvent>) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id !== id) return evt;
      const updated = { ...evt, ...updates };
      if (updates.registeredStudentIds) {
        updated.currentParticipants = updates.registeredStudentIds.length;
      }
      return updated;
    }));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(evt => evt.id !== id));
  };

  const registerStudentForEvent = (eventId: string, studentId: string): { success: boolean; message?: string } => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return { success: false, message: 'Không tìm thấy sự kiện' };

    const student = students.find(s => s.id === studentId);
    const studentName = student?.fullName || 'Học viên';

    const registered = targetEvent.registeredStudentIds || [];
    if (registered.includes(studentId)) {
      return { success: false, message: `${studentName} đã đăng ký sự kiện này trước đó.` };
    }

    if (targetEvent.maxParticipants && registered.length >= targetEvent.maxParticipants) {
      return { success: false, message: 'Sự kiện đã đủ số lượng người đăng ký tối đa.' };
    }

    const updatedRegistered = [...registered, studentId];
    updateEvent(eventId, {
      registeredStudentIds: updatedRegistered,
      currentParticipants: updatedRegistered.length
    });

    addNotification({
      title: '🎟️ Đăng ký sự kiện thành công',
      content: `Học viên ${studentName} đã đăng ký tham gia sự kiện "${targetEvent.title}" (${targetEvent.startDate}).`,
      type: 'event',
      studentId: studentId,
      recipientId: studentId
    });

    return { success: true, message: `Đã đăng ký thành công cho học viên ${studentName}!` };
  };

  const cancelStudentEventRegistration = (eventId: string, studentId: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;
    const registered = targetEvent.registeredStudentIds || [];
    const updated = registered.filter(id => id !== studentId);
    updateEvent(eventId, {
      registeredStudentIds: updated,
      currentParticipants: updated.length
    });
  };

  const resetEventsToDefault = () => {
    setEvents(initialEvents);
    localStorage.setItem(PREFIX + 'events', JSON.stringify(initialEvents));
  };

  // Attendance Management with Real Attendance Tracking, Star Rules & Backdating
  const computeStarsForStatus = (status: AttendanceStatus, explicitStars?: number): number => {
    if (explicitStars !== undefined) return explicitStars;
    switch (status) {
      case 'present':
      case 'makeup':
        return 2; // Có mặt đúng lịch / học bù: +2 sao
      case 'late':
        return 1; // Đến muộn: +1 sao
      case 'absent_unexcused':
      case 'absent_no_leave':
        return -2; // Vắng không phép: -2 sao
      case 'absent_excused':
      case 'absent_with_leave':
      default:
        return 0; // Nghỉ có phép / bảo lưu: 0 sao
    }
  };

  const recordAttendance = (rec: Omit<AttendanceRecord, 'id'>) => {
    const student = students.find(s => s.id === rec.studentId);
    const cls = classes.find(c => c.id === rec.classId);
    const todayStr = new Date().toISOString().split('T')[0];
    const isPast = rec.date < todayStr;
    const isBackdated = rec.isBackdated !== undefined ? rec.isBackdated : isPast;

    // Check if the attendance date is configured as a public holiday
    const holidayCheck = isHolidayDate(rec.date);
    const isHoliday = holidayCheck.isHoliday;

    // On holidays: automatically do not deduct stars (-2⭐ becomes 0⭐) to protect student attendance
    let calculatedStars = computeStarsForStatus(rec.status, rec.starsAwarded);
    if (isHoliday && calculatedStars < 0) {
      calculatedStars = 0;
    }

    let adjustedNote = rec.note;
    if (isHoliday && holidayCheck.holiday) {
      const holTag = `[🌴 Nghỉ lễ: ${holidayCheck.holiday.name}]`;
      if (!adjustedNote || !adjustedNote.includes('Nghỉ lễ')) {
        adjustedNote = adjustedNote ? `${holTag} ${adjustedNote}` : `${holTag} Tự động miễn trừ điểm danh`;
      }
    }

    const newRec: AttendanceRecord = {
      ...rec,
      note: adjustedNote,
      studentName: rec.studentName || student?.fullName || 'Học viên',
      className: rec.className || cls?.name || 'Lớp Âm Nhạc',
      subjectName: rec.subjectName || cls?.subjectName || cls?.subject || 'Âm nhạc',
      id: generateUniqueId('att'),
      starsAwarded: calculatedStars,
      recordedAt: rec.recordedAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      isBackdated,
      isVerified: rec.isVerified !== undefined ? rec.isVerified : true,
      verifiedBy: rec.verifiedBy || rec.recordedBy || 'Giáo viên / Quản trị viên',
      verifiedAt: rec.verifiedAt || new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setAttendance(prev => {
      // Replace existing record if student already has a record on the same date and class
      const existingIdx = prev.findIndex(a => a.studentId === rec.studentId && a.classId === rec.classId && a.date === rec.date);
      let updated: AttendanceRecord[];
      let deltaStars = calculatedStars;

      if (existingIdx >= 0) {
        const existingRec = prev[existingIdx];
        const prevStars = existingRec.starsAwarded !== undefined ? existingRec.starsAwarded : computeStarsForStatus(existingRec.status);
        deltaStars = calculatedStars - prevStars;
        updated = [...prev];
        updated[existingIdx] = { ...prev[existingIdx], ...newRec, id: prev[existingIdx].id };
      } else {
        updated = [newRec, ...prev];
      }

      // Dynamically calculate completed lessons for this student
      const studentAttendedCount = updated.filter(
        a => a.studentId === rec.studentId && (a.status === 'present' || a.status === 'late' || a.status === 'makeup')
      ).length;

      setStudents(prevSt => prevSt.map(s => {
        if (s.id === rec.studentId) {
          const total = s.totalLessons || 0;
          const comp = studentAttendedCount;
          const rem = total > 0 ? Math.max(0, total - comp) : 0;
          const currentTotal = s.totalStars !== undefined ? s.totalStars : (s.stars || 0);
          const currentReward = s.rewardPoints !== undefined ? s.rewardPoints : (s.stars || 0);
          const updatedTotalStars = Math.max(0, currentTotal + deltaStars);
          const updatedRewardPoints = Math.max(0, currentReward + deltaStars);

          return {
            ...s,
            completedLessons: comp,
            remainingLessons: rem,
            stars: updatedTotalStars,
            totalStars: updatedTotalStars,
            rewardPoints: updatedRewardPoints
          };
        }
        return s;
      }));

      return updated;
    });

    // Automated Real-Time Push Notifications & Alerts for Parents and Students
    const studentName = rec.studentName || student?.fullName || 'Học viên';
    const className = rec.className || cls?.name || 'Lớp Âm Nhạc';
    const subjectName = rec.subjectName || cls?.subjectName || cls?.subject || 'Âm nhạc';

    // Find linked guardian for parent salutation & contact
    const linkedLink = studentGuardianLinks.find(l => l.studentId === rec.studentId && l.receiveNotifications);
    const linkedGuardian = guardians.find(g => 
      g.id === linkedLink?.guardianId || 
      g.linkedStudentIds?.includes(rec.studentId) || 
      g.studentIds?.includes(rec.studentId)
    );

    const guardianName = linkedGuardian?.fullName || student?.guardianName;
    const guardianPhone = linkedGuardian?.phone || student?.guardianPhone || student?.parentPhone;
    const guardianRelation = linkedGuardian?.relation || student?.guardianRelation || 'Phụ huynh';

    const nowTimeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    // 1. Tích hợp Hệ thống Thông Báo Đẩy (Push Notification) gửi tức thì cho Phụ huynh
    const pushResult = sendInstantAttendancePush({
      studentId: rec.studentId,
      studentName,
      studentCode: student?.code,
      className,
      subjectName,
      attendanceDate: rec.date,
      attendanceTime: nowTimeStr,
      sessionNumber: rec.sessionNumber,
      status: rec.status,
      starsAwarded: calculatedStars,
      evaluation: rec.evaluation,
      note: rec.note,
      recordedBy: rec.recordedBy || 'Giáo viên',
      verifiedBy: rec.verifiedBy || rec.recordedBy || 'Giáo viên phụ trách',
      completedLessons: (student?.completedLessons || 0) + (rec.status === 'present' || rec.status === 'late' || rec.status === 'makeup' ? 1 : 0),
      totalLessons: student?.totalLessons || 24,
      remainingLessons: student?.remainingLessons,
      guardianName,
      guardianPhone,
      guardianRelation,
      channels: ['WEB_PUSH', 'IN_APP_BANNER', 'SMS_ZALO_GATEWAY']
    });

    // 2. Lưu vào Hộp thư Thông Báo Hệ thống (Notification Center) cho Phụ huynh & Học viên
    addNotification({
      title: pushResult.title,
      content: pushResult.body,
      type: 'attendance',
      severity: rec.status === 'absent_unexcused' || rec.status === 'absent_no_leave' ? 'alert' : rec.status === 'present' || rec.status === 'makeup' ? 'success' : 'info',
      recipientId: rec.studentId,
      studentId: rec.studentId,
      studentName: studentName,
      targetRoles: ['PARENT', 'STUDENT', 'ADMIN']
    });

    // 3. Tự động gửi Nhận xét & Đánh giá chuyên sâu của giáo viên tới Phụ huynh nếu có lời nhắn riêng
    const evaluationText = rec.evaluation;
    if (evaluationText && evaluationText.trim().length > 0 && evaluationText !== rec.note) {
      addNotification({
        title: `📝 Nhận xét buổi học môn ${subjectName} - ${studentName}`,
        content: `Thầy/Cô ${rec.verifiedBy || rec.recordedBy || 'phụ trách'} đã gửi nhận xét đánh giá buổi học ngày ${rec.date}: "${evaluationText.trim()}". Kính mời Phụ huynh và học viên theo dõi tiến độ rèn luyện!`,
        type: 'evaluation',
        severity: 'info',
        recipientId: rec.studentId,
        studentId: rec.studentId,
        studentName: studentName,
        targetRoles: ['PARENT', 'STUDENT', 'ADMIN']
      });
    }

    if (isBackdated) {
      addNotification({
        title: '📋 Đã ghi nhận điểm danh bù / bổ sung',
        content: `Đã điểm danh bù ngày ${rec.date} cho học viên ${studentName} (${rec.status === 'present' ? 'Có mặt (+2⭐)' : rec.status === 'late' ? 'Đi muộn (+1⭐)' : rec.status === 'absent_unexcused' ? (isHoliday ? 'Nghỉ lễ (0⭐)' : 'Vắng không phép (-2⭐)') : 'Nghỉ phép (0⭐)'}). Tiến độ học tập đã được cập nhật.`,
        type: 'system',
        targetRoles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
      });
    }
  };

  const batchRecordAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    records.forEach(r => recordAttendance(r));
  };

  const markAttendance = (
    param1: string | { studentId: string; classId?: string; date?: string; status: AttendanceStatus; sessionNumber?: number; note?: string; evaluation?: string; starsAwarded?: number; markedBy?: string; isBackdated?: boolean; isVerified?: boolean; verifiedBy?: string },
    studentIdOrStatus?: string | AttendanceStatus,
    date?: string,
    status?: AttendanceStatus,
    note?: string,
    evaluation?: string,
    starsAwarded?: number
  ) => {
    if (typeof param1 === 'object' && param1 !== null) {
      const computedStars = computeStarsForStatus(param1.status || 'present', param1.starsAwarded);
      recordAttendance({
        studentId: param1.studentId,
        classId: param1.classId || classes[0]?.id || 'cls-01',
        date: param1.date || new Date().toISOString().split('T')[0],
        status: param1.status || 'present',
        sessionNumber: param1.sessionNumber,
        note: param1.note,
        evaluation: param1.evaluation,
        starsAwarded: computedStars,
        recordedBy: param1.markedBy || 'Giáo viên',
        isBackdated: param1.isBackdated,
        isVerified: param1.isVerified !== undefined ? param1.isVerified : true,
        verifiedBy: param1.verifiedBy || param1.markedBy || 'Giáo viên'
      });
      return;
    }

    // Positional parameters: markAttendance(classId, studentId, date, status, note, evaluation, starsAwarded)
    const classId = param1 as string;
    const studentId = studentIdOrStatus as string;
    const attDate = date || new Date().toISOString().split('T')[0];
    const attStatus = status || 'present';
    const computedStars = computeStarsForStatus(attStatus, starsAwarded);

    recordAttendance({
      classId,
      studentId,
      date: attDate,
      status: attStatus,
      note,
      evaluation,
      starsAwarded: computedStars,
      recordedBy: 'Quản trị viên / Giáo viên',
      isVerified: true,
      verifiedBy: 'Quản trị viên / Giáo viên'
    });
  };

  // Tuition
  const addTuitionPayment = (paymentData: Omit<TuitionPayment, 'id'>) => {
    const newPayment: TuitionPayment = {
      ...paymentData,
      id: generateUniqueId('tui')
    };
    setTuitionPayments(prev => [newPayment, ...prev]);
  };

  const updateTuitionStatus = (id: string, status: 'paid' | 'pending' | 'overdue', paidAmount?: number) => {
    setTuitionPayments(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          paidAmount: paidAmount !== undefined ? paidAmount : t.paidAmount
        };
      }
      return t;
    }));
  };

  const updateTuitionPayment = (id: string, updates: Partial<TuitionPayment>) => {
    setTuitionPayments(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  // Birthday Templates
  const addBirthdayTemplate = (tpl: Omit<BirthdayTemplate, 'id'>) => {
    const newTpl: BirthdayTemplate = {
      ...tpl,
      id: generateUniqueId('bdt')
    };
    setBirthdayTemplates(prev => [...prev, newTpl]);
  };

  const updateBirthdayTemplate = (id: string, updates: Partial<BirthdayTemplate>) => {
    setBirthdayTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteBirthdayTemplate = (id: string) => {
    setBirthdayTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Assignments
  const addAssignment = (asnData: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAsn: Assignment = {
      ...asnData,
      id: generateUniqueId('asn'),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAssignments(prev => [newAsn, ...prev]);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const submitAssignment = (subData: Omit<Submission, 'id' | 'submittedAt'>) => {
    const newSub: Submission = {
      ...subData,
      id: generateUniqueId('sub'),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setSubmissions(prev => [newSub, ...prev]);
  };

  const gradeSubmission = (
    submissionId: string,
    gradeData: {
      grade: string;
      score?: number;
      teacherFeedback: string;
      starsAwarded: number;
      rewardPointsAwarded: number;
    }
  ) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          grade: gradeData.grade,
          score: gradeData.score,
          teacherFeedback: gradeData.teacherFeedback,
          starsAwarded: gradeData.starsAwarded,
          rewardPointsAwarded: gradeData.rewardPointsAwarded,
          status: 'graded'
        };
      }
      return sub;
    }));

    // Find student to award stars and reward points
    const sub = submissions.find(s => s.id === submissionId);
    if (sub && (gradeData.starsAwarded > 0 || gradeData.rewardPointsAwarded > 0)) {
      setStudents(prev => prev.map(st => {
        if (st.id === sub.studentId) {
          const currentStars = st.totalStars !== undefined ? st.totalStars : (st.stars || 0);
          const currentPoints = st.rewardPoints !== undefined ? st.rewardPoints : (st.stars || 0);
          return {
            ...st,
            stars: currentStars + gradeData.starsAwarded,
            totalStars: currentStars + gradeData.starsAwarded,
            rewardPoints: currentPoints + gradeData.rewardPointsAwarded
          };
        }
        return st;
      }));

      const feedbackMsg = gradeData.teacherFeedback ? ` Lời nhận xét: "${gradeData.teacherFeedback}".` : '';
      addNotification({
        title: `🎵 Đánh giá bài tập thực hành - ${sub.studentName}`,
        content: `Giáo viên đã chấm bài tập của học viên ${sub.studentName}: Xếp loại "${gradeData.grade}" (+${gradeData.starsAwarded} ⭐, +${gradeData.rewardPointsAwarded} Điểm đổi quà).${feedbackMsg}`,
        type: 'evaluation',
        severity: 'success',
        recipientId: sub.studentId,
        studentId: sub.studentId,
        studentName: sub.studentName,
        targetRoles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']
      });
    }
  };

  const redeemReward = (studentId: string, rewardId: string): { success: boolean; error?: string } => {
    const student = students.find(s => s.id === studentId);
    const reward = rewards.find(r => r.id === rewardId);

    if (!student || !reward) {
      return { success: false, error: 'Không tìm thấy thông tin quà hoặc học viên.' };
    }

    const pts = reward.pointsRequired || reward.requiredPoints || 50;
    const availableRewardPoints = student.rewardPoints !== undefined ? student.rewardPoints : (student.stars || 0);
    const honorStars = student.totalStars !== undefined ? student.totalStars : (student.stars || 0);

    if (availableRewardPoints < pts) {
      return {
        success: false,
        error: `Bạn cần ${pts} Điểm thưởng đổi quà (hiện có ${availableRewardPoints} điểm). Điểm sao vinh danh tích lũy BXH (${honorStars} ⭐) của bạn luôn được bảo toàn!`
      };
    }

    if (reward.stock <= 0) {
      return { success: false, error: 'Phần quà này tạm thời hết hàng trong kho.' };
    }

    // Deduct rewardPoints ONLY & decrease stock.
    // CRITICAL: student.totalStars (and leaderboard stars) remain 100% untouched!
    const newRewardPoints = Math.max(0, availableRewardPoints - pts);
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          rewardPoints: newRewardPoints
        };
      }
      return s;
    }));
    setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, stock: Math.max(0, r.stock - 1) } : r));

    addNotification({
      title: '🎁 Đổi quà thưởng thành công!',
      content: `Học viên ${student.fullName} đã dùng ${pts} điểm thưởng để đổi "${reward.name}". Số dư điểm đổi quà còn: ${newRewardPoints} điểm. Điểm sao vinh danh BXH (${honorStars} ⭐) được bảo toàn nguyên vẹn!`,
      type: 'system',
      targetRoles: ['ADMIN', 'STUDENT', 'PARENT']
    });

    try {
      confetti({ particleCount: 90, spread: 70 });
    } catch (e) {}

    return { success: true };
  };

  const addReward = (rewardData: Omit<RewardItem, 'id'>) => {
    const newRwd: RewardItem = {
      ...rewardData,
      id: generateUniqueId('rwd'),
      pointsRequired: rewardData.pointsRequired || rewardData.requiredPoints || 50,
      requiredPoints: rewardData.pointsRequired || rewardData.requiredPoints || 50,
      stock: rewardData.stock !== undefined ? Number(rewardData.stock) : 10
    };
    setRewards(prev => [newRwd, ...prev]);
  };

  const updateReward = (id: string, updates: Partial<RewardItem>) => {
    setRewards(prev => prev.map(r => {
      if (r.id === id) {
        const pts = updates.pointsRequired ?? updates.requiredPoints ?? r.pointsRequired ?? r.requiredPoints ?? 50;
        return {
          ...r,
          ...updates,
          pointsRequired: pts,
          requiredPoints: pts
        };
      }
      return r;
    }));
  };

  const deleteReward = (id: string) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  // Notifications
  const addNotification = (notifData: Omit<NotificationItem, 'id' | 'createdAt'>) => {
    const newN: NotificationItem = {
      ...notifData,
      id: generateUniqueId('notif'),
      createdAt: 'Vừa xong'
    };
    setNotifications(prev => [newN, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const sendTeacherEvaluationToParent = (data: {
    studentId: string;
    studentName?: string;
    teacherName?: string;
    subjectName?: string;
    date?: string;
    evaluation: string;
    rating?: string;
    attitude?: string;
    homework?: string;
  }) => {
    const student = students.find(s => s.id === data.studentId);
    const studentName = data.studentName || student?.fullName || 'Học viên';
    const dateStr = data.date || new Date().toISOString().split('T')[0];
    const teacherName = data.teacherName || 'Giáo viên phụ trách';
    const subjectName = data.subjectName || student?.enrolledSubjects?.[0] || 'Âm nhạc';

    let content = `Thầy/Cô ${teacherName} đã gửi nhận xét đánh giá buổi học môn ${subjectName} ngày ${dateStr}:\n"${data.evaluation}"`;
    if (data.rating) {
      content += `\n• Xếp loại rèn luyện: ${data.rating}`;
    }
    if (data.attitude) {
      content += `\n• Thái độ học tập: ${data.attitude}`;
    }
    if (data.homework) {
      content += `\n• Luyện tập tại nhà: ${data.homework}`;
    }

    addNotification({
      title: `📝 Nhận xét & Đánh giá giáo viên - ${studentName}`,
      content,
      type: 'evaluation',
      severity: 'info',
      recipientId: data.studentId,
      studentId: data.studentId,
      studentName: studentName,
      targetRoles: ['PARENT', 'STUDENT', 'ADMIN']
    });
  };

  // Makeup & Reservations
  const requestMakeup = (reqData: Omit<MakeupRequest, 'id' | 'createdAt' | 'status'> & { status?: MakeupRequest['status'] }) => {
    const newReq: MakeupRequest = {
      ...reqData,
      id: generateUniqueId('mk'),
      status: reqData.status || 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setMakeupRequests(prev => [newReq, ...prev]);
  };

  const updateMakeupStatus = (id: string, status: 'approved' | 'rejected' | 'completed' | 'cancelled' | 'scheduled') => {
    setMakeupRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const requestReservation = (reqData: Omit<ReservationRecord, 'id' | 'createdAt' | 'status'>) => {
    const newRes: ReservationRecord = {
      ...reqData,
      id: generateUniqueId('res'),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setReservations(prev => [newRes, ...prev]);
  };

  const updateReservationStatus = (id: string, status: 'approved' | 'ended' | 'rejected' | 'active') => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // Compute Star Leaderboard (Dựa trên Tổng Sao Tích Lũy Vinh Danh, Không bị ảnh hưởng khi đổi quà)
  const starLeaderboard: StarLeaderboardItem[] = [...(students || [])]
    .sort((a, b) => {
      const starsA = a.totalStars !== undefined ? a.totalStars : (a.stars || 0);
      const starsB = b.totalStars !== undefined ? b.totalStars : (b.stars || 0);
      return starsB - starsA;
    })
    .map((s, index) => {
      const cls = (classes || []).find(c => s.enrolledClassIds?.includes(c.id));
      const honorStars = s.totalStars !== undefined ? s.totalStars : (s.stars || 0);
      const redeemPoints = s.rewardPoints !== undefined ? s.rewardPoints : (s.stars || 0);
      const rankTitle = index === 0 ? '🏆 Quán Quân Sao' : index === 1 ? '🥈 Á Quân Sao' : index === 2 ? '🥉 Top 3 Sao Vàng' : '🌟 Ngôi Sao Cần Cù';
      const subjText = (s.enrolledSubjects || []).join(', ') || 'Âm nhạc';
      return {
        studentId: s.id,
        code: s.code,
        studentName: s.fullName,
        avatar: s.avatar,
        stars: honorStars,
        totalStars: honorStars,
        rewardPoints: redeemPoints,
        rankTitle,
        totalLessons: s.totalLessons || 24,
        completedLessons: s.completedLessons || 0,
        subject: subjText,
        classNameOrSubject: cls ? `${subjText} • ${cls.name}` : (subjText || 'Lớp nhạc'),
        rank: index + 1,
        badges: ['Chuyên cần', 'Đúng giờ'],
        recentBadges: ['Chuyên cần', 'Đúng giờ', 'Biểu diễn tự tin']
      };
    });

  const updateBankAccount = (bankConfig: Partial<BankAccountConfig>) => {
    setBranding(prev => ({
      ...prev,
      bankAccount: {
        ...(prev.bankAccount || initialBranding.bankAccount!),
        ...bankConfig
      }
    }));
  };

  // Format VietQR transfer content strictly as requested:
  // "họ và tên hoặc mã hv - môn - tháng" (e.g. "HV001 - Piano - Thang 03" or "Nguyen Minh Anh - Piano - Thang 03")
  const formatTransferContent = (
    studentCodeOrName: string,
    subjectName: string,
    billingMonth: string
  ): string => {
    const cleanSubj = (subjectName || 'AmNhac')
      .replace(/&/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Clean month (e.g. "Tháng 03/2025" -> "Thang 03" or "T03")
    let monthClean = billingMonth || `Thang ${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    monthClean = monthClean.replace(/[\/\.]\d{4}/g, '').replace('Tháng', 'Thang').trim();

    const cleanCodeOrName = studentCodeOrName || 'HV';
    return `${cleanCodeOrName} - ${cleanSubj} - ${monthClean}`;
  };

  // Generate VietQR URL with Napas247 standard URL
  const generateQrUrlForPayment = (
    payment: Partial<TuitionPayment>,
    customAmount?: number,
    customMemo?: string
  ): string => {
    const bank = branding.bankAccount || initialBranding.bankAccount!;

    // If custom uploaded QR image is selected
    if (bank.useCustomQr && bank.customQrUrl) {
      return bank.customQrUrl;
    }

    const bankCode = bank.bankId || 'MBBank';
    const accNumber = bank.accountNumber || '0901888999';
    const amount = customAmount !== undefined ? customAmount : (payment.amount || 0);

    let memo = customMemo;
    if (!memo) {
      const idOrName = bank.memoFormat === 'NAME_SUBJECT_MONTH'
        ? (payment.studentName || payment.studentCode || 'HV')
        : (payment.studentCode || payment.studentName || 'HV');
      memo = formatTransferContent(idOrName, payment.subjectName || 'AmNhac', payment.billingMonth || `Thang ${new Date().getMonth() + 1}`);
    }

    // vietqr.io url format: https://img.vietqr.io/image/<BANK_CODE>-<ACCOUNT_NO>-compact2.jpg?amount=<AMOUNT>&addInfo=<MEMO>&accountName=<NAME>
    const encodedMemo = encodeURIComponent(memo);
    const encodedName = encodeURIComponent(bank.accountHolder || 'TRUNG TAM AM NHAC MINH MUSIC');
    return `https://img.vietqr.io/image/${bankCode}-${accNumber}-compact2.png?amount=${amount}&addInfo=${encodedMemo}&accountName=${encodedName}`;
  };

  const updateBranding = (updates: Partial<TenantBranding>) => {
    setBranding(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    }));
  };

  const resetBranding = () => {
    setBranding(initialBranding);
  };

  const addBranch = (branch: Omit<TenantBranch, 'id'>) => {
    const newBranch: TenantBranch = {
      ...branch,
      id: generateUniqueId('branch')
    };
    setBranches(prev => [...prev, newBranch]);
  };

  const updateBranch = (id: string, updates: Partial<TenantBranch>) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBranch = (id: string) => {
    setBranches(prev => {
      const remaining = prev.filter(b => b.id !== id);
      if (remaining.length === 0) return prev; // Cannot delete all
      if (activeBranchId === id) {
        setActiveBranchId(remaining[0].id);
      }
      return remaining;
    });
  };

  const resetDataToDefault = () => {
    localStorage.clear();
    setStudents(initialStudents);
    setTeachers(initialTeachers);
    setGuardians(initialGuardians);
    setStudentGuardianLinks(initialStudentGuardianLinks);
    setSubjects(initialSubjects);
    setCourses(initialCourses);
    setClasses(initialClasses);
    setAttendance(initialAttendance);
    setTuitionPayments(initialTuitionPayments);
    setBirthdayTemplates(initialBirthdayTemplates);
    setAssignments(initialAssignments);
    setRewards(initialRewards);
    setNotifications(initialNotifications);
    setReservations(initialReservations);
    setTrialLessons(initialTrialLessons);
    setRegistrationRequests(initialRegistrationRequests);
    setScheduleChangeRequests(initialScheduleChangeRequests);
    setPaymentSubmissions(initialPaymentSubmissions);
    setHolidays(initialHolidays);
    setBranding(initialBranding);
    setBranches(initialBranches);
    setActiveBranchId(initialBranches[0]?.id || 'branch-01');
  };

  // Khôi phục cài đặt gốc về dữ liệu trống (0 bản ghi)
  const factoryResetToEmptyData = (options?: { preserveSubjectsAndCourses?: boolean }) => {
    setStudents([]);
    setTeachers([]);
    setGuardians([]);
    setStudentGuardianLinks([]);
    if (!options?.preserveSubjectsAndCourses) {
      setSubjects([]);
      setCourses([]);
    }
    setClasses([]);
    setAttendance([]);
    setTuitionPayments([]);
    setBirthdayTemplates([]);
    setAssignments([]);
    setSubmissions([]);
    setRewards([]);
    setNotifications([]);
    setMakeupRequests([]);
    setReservations([]);
    setTrialLessons([]);
    setRegistrationRequests([]);
    setScheduleChangeRequests([]);
    setPaymentSubmissions([]);
    setHolidays([]);
    setEvents([]);

    // Persist empty states into localStorage
    localStorage.setItem(PREFIX + 'students', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'teachers', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'guardians', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'student_guardian_links', JSON.stringify([]));
    if (!options?.preserveSubjectsAndCourses) {
      localStorage.setItem(PREFIX + 'subjects', JSON.stringify([]));
      localStorage.setItem(PREFIX + 'courses', JSON.stringify([]));
    }
    localStorage.setItem(PREFIX + 'classes', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'attendance', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'tuition', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'bdt_templates', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'assignments', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'submissions', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'rewards', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'notifications', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'makeup_reqs', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'reservations', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'trials', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'reg_requests', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'sch_change_reqs', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'payment_submissions', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'holidays', JSON.stringify([]));
    localStorage.setItem(PREFIX + 'events', JSON.stringify([]));
  };

  // Xuất toàn bộ dữ liệu hệ thống ra tệp sao lưu JSON có cấu trúc chuẩn
  const exportSystemBackupJSON = (): string => {
    const backupPayload = {
      backupTitle: 'Bản Sao Lưu Toàn Bộ Dữ Liệu - Minh Music Center',
      exportTimestamp: new Date().toISOString(),
      exportDateFormatted: new Date().toLocaleString('vi-VN'),
      version: '2.0.0',
      stats: {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalGuardians: guardians.length,
        totalClasses: classes.length,
        totalCourses: courses.length,
        totalSubjects: subjects.length,
        totalTuitionInvoices: tuitionPayments.length,
        totalAttendanceRecords: attendance.length,
        totalAssignments: assignments.length,
        totalEvents: events.length,
        totalHolidays: holidays.length
      },
      data: {
        students,
        teachers,
        guardians,
        studentGuardianLinks,
        subjects,
        courses,
        classes,
        attendance,
        tuitionPayments,
        birthdayTemplates,
        assignments,
        submissions,
        rewards,
        notifications,
        makeupRequests,
        reservations,
        trialLessons,
        registrationRequests,
        scheduleChangeRequests,
        paymentSubmissions,
        holidays,
        events,
        branding,
        branches
      }
    };
    return JSON.stringify(backupPayload, null, 2);
  };

  // Multi-Teacher Class Assignment logic with conflict detection
  const assignTeacherToClass = (
    classId: string,
    teacherId: string,
    roleInClass: ClassTeacherRole,
    subjectsList?: string[],
    startDate?: string,
    endDate?: string
  ): { success: boolean; conflictWarning?: string; error?: string } => {
    const cls = classes.find(c => c.id === classId);
    const tch = teachers.find(t => t.id === teacherId);
    if (!cls || !tch) {
      return { success: false, error: 'Không tìm thấy thông tin Lớp học hoặc Giáo viên.' };
    }

    // Check for schedule collision across other active classes taught by this teacher
    let conflictWarning: string | undefined;
    const existingClassesForTeacher = classes.filter(c => {
      if (c.id === classId) return false;
      const isAssigned = c.teacherId === teacherId 
        || c.teachers?.some(t => t.teacherId === teacherId) 
        || c.teacherIds?.includes(teacherId);
      return isAssigned && c.status === 'active';
    });

    for (const otherClass of existingClassesForTeacher) {
      // Check schedule overlaps (e.g. same dayOfWeek and matching time)
      if (otherClass.scheduleDayOfWeek && cls.scheduleDayOfWeek) {
        const overlapDays = cls.scheduleDayOfWeek.some(day => otherClass.scheduleDayOfWeek?.includes(day));
        if (overlapDays && otherClass.scheduleTime === cls.scheduleTime) {
          conflictWarning = `CẢNH BÁO: Giáo viên ${tch.fullName} đang có lịch dạy trùng ở lớp "${otherClass.name}" (${otherClass.scheduleTime} - ${otherClass.scheduleDayOfWeek.join(', ')})!`;
          break;
        }
      }
    }

    const newTeacherEntry: ClassTeacher = {
      id: generateUniqueId('ct'),
      classId,
      teacherId,
      teacherName: tch.fullName,
      teacherCode: tch.code || tch.id,
      roleInClass,
      roleTitle: roleInClass === 'lead' ? 'Giáo viên chính' : roleInClass === 'assistant' ? 'Giáo viên phụ' : roleInClass === 'substitute' ? 'GV Thay thế' : 'Trợ giảng',
      subjects: subjectsList && subjectsList.length > 0 ? subjectsList : [cls.subjectName || 'Âm nhạc'],
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate,
      status: 'active'
    };

    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const currentTeachers = c.teachers || [];
        const filtered = currentTeachers.filter(t => t.teacherId !== teacherId);
        const updatedTeachers = [...filtered, newTeacherEntry];
        const updatedTeacherIds = Array.from(new Set([...(c.teacherIds || []), teacherId]));
        
        // If lead, set as main teacher for backwards compatibility
        const isPrimary = roleInClass === 'lead' || !c.teacherId;
        return {
          ...c,
          teacherId: isPrimary ? teacherId : c.teacherId,
          teacherName: isPrimary ? tch.fullName : c.teacherName,
          teacherIds: updatedTeacherIds,
          teachers: updatedTeachers
        };
      }
      return c;
    }));

    return { success: true, conflictWarning };
  };

  const removeTeacherFromClass = (classId: string, teacherId: string) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const updatedTeachers = (c.teachers || []).filter(t => t.teacherId !== teacherId);
        const updatedTeacherIds = (c.teacherIds || []).filter(id => id !== teacherId);
        const newPrimary = updatedTeachers.find(t => t.roleInClass === 'lead') || updatedTeachers[0];
        return {
          ...c,
          teachers: updatedTeachers,
          teacherIds: updatedTeacherIds,
          teacherId: newPrimary ? newPrimary.teacherId : '',
          teacherName: newPrimary ? newPrimary.teacherName : 'Chưa phân công'
        };
      }
      return c;
    }));
  };

  const updateTeacherInClass = (classId: string, teacherId: string, updates: Partial<ClassTeacher>) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        const updatedTeachers = (c.teachers || []).map(t => {
          if (t.teacherId === teacherId) {
            return { ...t, ...updates };
          }
          return t;
        });
        return { ...c, teachers: updatedTeachers };
      }
      return c;
    }));
  };

  // Student-Guardian Link CRUD
  const addStudentGuardianLink = (link: Omit<StudentGuardianLink, 'id' | 'createdAt'>) => {
    const newLink: StudentGuardianLink = {
      ...link,
      id: generateUniqueId('sgl'),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setStudentGuardianLinks(prev => [newLink, ...prev]);
  };

  const updateStudentGuardianLink = (id: string, updates: Partial<StudentGuardianLink>) => {
    setStudentGuardianLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteStudentGuardianLink = (id: string) => {
    setStudentGuardianLinks(prev => prev.filter(l => l.id !== id));
  };

  // User Request Workflows
  const submitRegistrationRequest = (req: Omit<RegistrationRequest, 'id' | 'requestedDate' | 'status'>) => {
    const newReq: RegistrationRequest = {
      ...req,
      id: generateUniqueId('reg-req'),
      requestedDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setRegistrationRequests(prev => [newReq, ...prev]);
  };

  const approveRegistrationRequest = (requestId: string, adminNote?: string, targetClassId?: string, assignedLessons?: number) => {
    const targetReq = registrationRequests.find(r => r.id === requestId);
    if (targetReq) {
      const subjectName = targetReq.subjectName || targetReq.targetName.split(' - ')[0] || targetReq.targetName;
      const totalLsn = assignedLessons || targetReq.totalLessons || 24;
      const assignedClassId = targetClassId || targetReq.desiredClassId;

      // Cập nhật hoặc tạo hồ sơ học viên
      setStudents(prev => {
        const studentIndex = prev.findIndex(s => s.id === targetReq.studentId || (targetReq.studentName && s.fullName.toLowerCase() === targetReq.studentName.toLowerCase()));
        if (studentIndex >= 0) {
          return prev.map((s, idx) => {
            if (idx === studentIndex) {
              const currentSubs = s.enrolledSubjects || [];
              const newSubs = currentSubs.includes(subjectName) ? currentSubs : [...currentSubs, subjectName];
              const currentClasses = s.enrolledClassIds || [];
              const newClasses = (assignedClassId && !currentClasses.includes(assignedClassId)) ? [...currentClasses, assignedClassId] : currentClasses;
              return {
                ...s,
                status: 'active',
                enrolledSubjects: newSubs,
                enrolledClassIds: newClasses,
                totalLessons: s.totalLessons ? s.totalLessons + totalLsn : totalLsn,
                remainingLessons: s.remainingLessons ? s.remainingLessons + totalLsn : totalLsn,
              };
            }
            return s;
          });
        } else {
          const newStd: Student = {
            id: targetReq.studentId || generateUniqueId('std'),
            code: targetReq.studentCode || `HV${String(prev.length + 1).padStart(3, '0')}`,
            fullName: targetReq.studentName || 'Học Viên Mới',
            gender: 'Khác',
            birthDate: '2012-01-01',
            enrolledSubjects: [subjectName],
            enrolledClassIds: assignedClassId ? [assignedClassId] : [],
            totalLessons: totalLsn,
            completedLessons: 0,
            remainingLessons: totalLsn,
            stars: 0,
            totalStars: 0,
            rewardPoints: 0,
            status: 'active'
          };
          return [newStd, ...prev];
        }
      });

      // Nếu có assignedClassId, thêm học viên vào lớp học
      if (assignedClassId) {
        setClasses(prev => prev.map(c => {
          if (c.id === assignedClassId) {
            const sIds = c.studentIds || [];
            if (!sIds.includes(targetReq.studentId)) {
              return {
                ...c,
                studentIds: [...sIds, targetReq.studentId],
                currentStudents: (c.currentStudents || 0) + 1
              };
            }
          }
          return c;
        }));
      }

      // Gửi thông báo đến học viên
      const newNotif: NotificationItem = {
        id: generateUniqueId('notif-reg'),
        title: 'Đăng Ký Môn Học Thành Công 🎉',
        content: `Yêu cầu đăng ký môn "${subjectName}" (${targetReq.level || 'Khóa học'}, ${totalLsn} buổi) đã được Admin phê duyệt và xếp lớp thành công. Chúc bạn có những giờ học hiệu quả tại Minh Music!`,
        type: 'general',
        createdAt: new Date().toISOString().split('T')[0],
        isRead: false,
        recipientId: targetReq.studentId,
        targetAudience: 'STUDENT'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    setRegistrationRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'approved',
          reviewedBy: 'Admin',
          reviewedAt: new Date().toISOString().split('T')[0],
          note: adminNote ? `${r.note || ''} (Admin: ${adminNote})` : r.note
        };
      }
      return r;
    }));
  };

  const rejectRegistrationRequest = (requestId: string, reason?: string) => {
    setRegistrationRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'rejected',
          reviewedBy: 'Admin',
          reviewedAt: new Date().toISOString().split('T')[0],
          note: reason ? `${r.note || ''} (Lý do từ chối: ${reason})` : r.note
        };
      }
      return r;
    }));
  };

  const submitScheduleChangeRequest = (req: Omit<ScheduleChangeRequest, 'id' | 'createdAt' | 'status'>) => {
    const newReq: ScheduleChangeRequest = {
      ...req,
      id: generateUniqueId('scr'),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setScheduleChangeRequests(prev => [newReq, ...prev]);
  };

  const approveScheduleChangeRequest = (requestId: string, adminResponse?: string) => {
    setScheduleChangeRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'approved',
          adminResponse
        };
      }
      return r;
    }));
  };

  const rejectScheduleChangeRequest = (requestId: string, reason?: string) => {
    setScheduleChangeRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'rejected',
          adminResponse: reason
        };
      }
      return r;
    }));
  };

  const submitPaymentReceipt = (sub: Omit<PaymentSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const newSub: PaymentSubmission = {
      ...sub,
      id: generateUniqueId('ps'),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending'
    };
    setPaymentSubmissions(prev => [newSub, ...prev]);
  };

  const approvePaymentSubmission = (submissionId: string) => {
    const sub = paymentSubmissions.find(p => p.id === submissionId);
    if (sub) {
      setPaymentSubmissions(prev => prev.map(p => p.id === submissionId ? { ...p, status: 'approved' } : p));
      if (sub.tuitionPaymentId) {
        updateTuitionStatus(sub.tuitionPaymentId, 'paid', sub.amount);
      }
    }
  };

  const rejectPaymentSubmission = (submissionId: string) => {
    setPaymentSubmissions(prev => prev.map(p => p.id === submissionId ? { ...p, status: 'rejected' } : p));
  };

  // Scoped Data Retriever Engine according to Business Scope Rules
  const getScopedDataForUser = (user: UserAccount | null, currentActiveRole: UserRole) => {
    if (!user) {
      return {
        scopedClasses: [],
        scopedStudents: [],
        scopedTeachers: [],
        scopedAssignments: [],
        scopedSubmissions: [],
        scopedAttendance: [],
        scopedTuition: [],
        scopedMakeupRequests: [],
        scopedGuardianLinks: []
      };
    }

    if (currentActiveRole === 'ADMIN') {
      return {
        scopedClasses: classes,
        scopedStudents: students,
        scopedTeachers: teachers,
        scopedAssignments: assignments,
        scopedSubmissions: submissions,
        scopedAttendance: attendance,
        scopedTuition: tuitionPayments,
        scopedMakeupRequests: makeupRequests,
        scopedGuardianLinks: studentGuardianLinks
      };
    }

    if (currentActiveRole === 'TEACHER') {
      // Find matching teacher profile
      const teacherProfile = teachers.find(t => 
        t.id === user.teacherProfileId || 
        t.id === user.profileId || 
        t.email?.toLowerCase() === user.email?.toLowerCase() ||
        t.fullName?.toLowerCase() === user.displayName?.toLowerCase()
      ) || teachers[0]; // fallback to first teacher in demo

      const teacherId = teacherProfile?.id;

      // Filter classes assigned to this teacher (either as primary teacher, in teacherIds, or in teachers array)
      const myClasses = classes.filter(c => 
        c.teacherId === teacherId ||
        c.teacherIds?.includes(teacherId) ||
        c.teachers?.some(t => t.teacherId === teacherId)
      );
      const myClassIds = myClasses.map(c => c.id);

      // Students enrolled in teacher's classes
      const studentIdSet = new Set<string>();
      myClasses.forEach(c => (c.studentIds || []).forEach(sid => studentIdSet.add(sid)));
      const myStudents = students.filter(s => 
        studentIdSet.has(s.id) || 
        s.enrolledClassIds?.some(cid => myClassIds.includes(cid)) ||
        s.teacherId === teacherId
      );

      // Assignments for teacher's classes or created by this teacher
      const myAssignments = assignments.filter(a => 
        a.teacherId === teacherId || 
        (a.classId && myClassIds.includes(a.classId))
      );
      const myAssignmentIds = myAssignments.map(a => a.id);

      const mySubmissions = submissions.filter(s => myAssignmentIds.includes(s.assignmentId));
      const myAttendance = attendance.filter(a => myClassIds.includes(a.classId));
      const myMakeup = makeupRequests.filter(m => m.teacherId === teacherId || myClassIds.includes(m.classId));

      return {
        scopedClasses: myClasses,
        scopedStudents: myStudents,
        scopedTeachers: teacherProfile ? [teacherProfile] : teachers,
        scopedAssignments: myAssignments,
        scopedSubmissions: mySubmissions,
        scopedAttendance: myAttendance,
        scopedTuition: [], // Teachers do not have access to tuition financial data
        scopedMakeupRequests: myMakeup,
        scopedGuardianLinks: []
      };
    }

    if (currentActiveRole === 'STUDENT') {
      const studentProfile = students.find(s => 
        s.id === user.studentProfileId || 
        s.id === user.profileId || 
        s.email?.toLowerCase() === user.email?.toLowerCase() ||
        s.code?.toLowerCase() === user.profileCode?.toLowerCase() ||
        s.fullName?.toLowerCase() === user.displayName?.toLowerCase()
      ) || students[0]; // fallback to first student

      const studentId = studentProfile?.id;
      const myClasses = classes.filter(c => c.studentIds?.includes(studentId) || studentProfile?.enrolledClassIds?.includes(c.id));
      const myClassIds = myClasses.map(c => c.id);

      const myAssignments = assignments.filter(a => 
        (a.classId && myClassIds.includes(a.classId)) || 
        a.targetStudentId === studentId ||
        (!a.classId && !a.targetStudentId)
      );
      const mySubmissions = submissions.filter(s => s.studentId === studentId);
      const myAttendance = attendance.filter(a => a.studentId === studentId);
      const myTuition = tuitionPayments.filter(t => t.studentId === studentId);
      const myMakeup = makeupRequests.filter(m => m.studentId === studentId);

      return {
        scopedClasses: myClasses,
        scopedStudents: studentProfile ? [studentProfile] : [],
        scopedTeachers: teachers,
        scopedAssignments: myAssignments,
        scopedSubmissions: mySubmissions,
        scopedAttendance: myAttendance,
        scopedTuition: myTuition,
        scopedMakeupRequests: myMakeup,
        scopedGuardianLinks: []
      };
    }

    if (currentActiveRole === 'PARENT' || currentActiveRole === 'GUARDIAN') {
      // Find matching guardian profile or links
      const guardianProfile = guardians.find(g => 
        g.id === user.guardianProfileId || 
        g.id === user.profileId || 
        g.email?.toLowerCase() === user.email?.toLowerCase() ||
        g.phone === user.phone
      ) || guardians[0];

      const guardianId = guardianProfile?.id || 'grd-01';
      const myLinks = studentGuardianLinks.filter(l => l.guardianId === guardianId && l.status === 'active');
      const linkedStudentIds = myLinks.map(l => l.studentId);
      const linkedStudents = students.filter(s => linkedStudentIds.includes(s.id) || guardianProfile?.studentIds?.includes(s.id));

      const linkedClassIds = new Set<string>();
      linkedStudents.forEach(s => (s.enrolledClassIds || []).forEach(cid => linkedClassIds.add(cid)));
      const linkedClasses = classes.filter(c => linkedClassIds.has(c.id));

      const linkedAssignments = assignments.filter(a => a.classId && linkedClassIds.has(a.classId));
      const linkedSubmissions = submissions.filter(s => linkedStudentIds.includes(s.studentId));
      const linkedAttendance = attendance.filter(a => linkedStudentIds.includes(a.studentId));
      const linkedTuition = tuitionPayments.filter(t => linkedStudentIds.includes(t.studentId));
      const linkedMakeup = makeupRequests.filter(m => linkedStudentIds.includes(m.studentId));

      const permissionsMap: Record<string, StudentGuardianLink> = {};
      myLinks.forEach(l => { permissionsMap[l.studentId] = l; });

      return {
        scopedClasses: linkedClasses,
        scopedStudents: linkedStudents,
        scopedTeachers: teachers,
        scopedAssignments: linkedAssignments,
        scopedSubmissions: linkedSubmissions,
        scopedAttendance: linkedAttendance,
        scopedTuition: linkedTuition,
        scopedMakeupRequests: linkedMakeup,
        scopedGuardianLinks: myLinks,
        activeGuardianPermissions: permissionsMap
      };
    }

    // Default fallback
    return {
      scopedClasses: classes,
      scopedStudents: students,
      scopedTeachers: teachers,
      scopedAssignments: assignments,
      scopedSubmissions: submissions,
      scopedAttendance: attendance,
      scopedTuition: tuitionPayments,
      scopedMakeupRequests: makeupRequests,
      scopedGuardianLinks: studentGuardianLinks
    };
  };

  return (
    <DataContext.Provider
      value={{
        students,
        teachers,
        guardians,
        studentGuardianLinks,
        subjects,
        courses,
        classes,
        attendance,
        attendanceRecords: attendance,
        tuitionPayments,
        birthdayTemplates,
        assignments,
        submissions,
        rewards,
        notifications,
        makeupRequests,
        makeupSessions: makeupRequests,
        reservations,
        reservationRequests: reservations,
        trialLessons,
        registrationRequests,
        scheduleChangeRequests,
        paymentSubmissions,
        starLeaderboard,
        branding,
        bankConfig: branding?.bankAccount || initialBranding.bankAccount!,
        branches,
        activeBranchId,
        assignTeacherToClass,
        removeTeacherFromClass,
        updateTeacherInClass,
        addStudentGuardianLink,
        updateStudentGuardianLink,
        deleteStudentGuardianLink,
        submitRegistrationRequest,
        approveRegistrationRequest,
        rejectRegistrationRequest,
        submitScheduleChangeRequest,
        approveScheduleChangeRequest,
        rejectScheduleChangeRequest,
        submitPaymentReceipt,
        approvePaymentSubmission,
        rejectPaymentSubmission,
        getScopedDataForUser,
        updateBranding,
        resetBranding,
        updateBankAccount,
        setActiveBranchId,
        addBranch,
        updateBranch,
        deleteBranch,
        getAllBirthdays,
        getTodayBirthdays,
        getTomorrowBirthdays,
        get7DaysBirthdays,
        getMonthBirthdays,
        sendBirthdayWish,
        addGuardian,
        updateGuardian,
        deleteGuardian,
        linkGuardianToStudent,
        addStudent,
        updateStudent,
        deleteStudent,
        toggleLockStudent,
        awardStars,
        adjustStudentStars,
        reserveStudentAccount,
        reactivateStudentAccount,
        convertTrialToOfficial,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addSubject,
        updateSubject,
        deleteSubject,
        addCourse,
        updateCourse,
        deleteCourse,
        addClass,
        updateClass,
        deleteClass,
        recordAttendance,
        batchRecordAttendance,
        markAttendance,
        addTuitionPayment,
        updateTuitionStatus,
        updatePaymentStatus: updateTuitionStatus,
        updateTuitionPayment,
        formatTransferContent,
        generateQrUrlForPayment,
        addBirthdayTemplate,
        updateBirthdayTemplate,
        deleteBirthdayTemplate,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignment,
        gradeSubmission,
        redeemReward,
        addReward,
        updateReward,
        deleteReward,
        addNotification,
        markNotificationRead,
        sendTeacherEvaluationToParent,
        requestMakeup,
        addMakeupSession: requestMakeup,
        updateMakeupStatus,
        requestReservation,
        addReservationRequest: requestReservation,
        updateReservationStatus,
        cancelReservation,
        addTrialLesson,
        updateTrialLesson,
        deleteTrialLesson,
        holidays,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        toggleHolidayActive,
        resetHolidaysToDefault,
        isHolidayDate,
        getHolidayByDate,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        registerStudentForEvent,
        cancelStudentEventRegistration,
        resetEventsToDefault,
        resetDataToDefault,
        factoryResetToEmptyData,
        exportSystemBackupJSON
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
