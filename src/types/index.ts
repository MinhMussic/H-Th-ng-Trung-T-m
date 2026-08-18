export type UserRole = 
  | 'ADMIN' 
  | 'MANAGER' 
  | 'ACCOUNTANT' 
  | 'TEACHER' 
  | 'STUDENT' 
  | 'PARENT' 
  | 'GUARDIAN'
  | 'admin'
  | 'manager'
  | 'accountant'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'guardian';

export type AccountStatus = 'pending' | 'active' | 'suspended' | 'rejected';

export type Gender = 'Nam' | 'Nữ' | 'Khác' | 'male' | 'female' | 'other';

export interface UserAccount {
  uid: string;
  email: string;
  displayName: string;
  username?: string; // Tên đăng nhập
  nickname?: string; // Tên gọi / Biệt danh
  phone?: string;
  role: UserRole; // Current/primary role for backward compatibility
  roles: UserRole[]; // Multi-role support: e.g. ['ADMIN', 'TEACHER']
  primaryRole: UserRole; // Default role upon login
  activeRole?: UserRole; // Active operational mode in UI without logging out
  status: AccountStatus;
  profileId?: string; // Links to Student, Teacher, or Guardian
  studentProfileId?: string;
  teacherProfileId?: string;
  guardianProfileId?: string;
  profileCode?: string;
  code?: string;
  profileName?: string;
  avatarUrl?: string;
  avatar?: string;
  photoURL?: string;
  gender?: Gender;
  birthDate?: string;
  nationality?: string; // Quốc tịch
  ethnicity?: string; // Dân tộc
  address?: string;
  guardianName?: string; // Họ tên phụ huynh/người giám hộ
  guardianPhone?: string; // SĐT phụ huynh
  guardianRelation?: string; // Mối quan hệ
  guardianBirthYear?: string; // Năm sinh phụ huynh
  isUnder16?: boolean;
  bio?: string;
  specialties?: string[];
  linkedStudentIds?: string[];
  createdAt: string;
  lastLoginAt?: string;
  password?: string; // Mật khẩu tài khoản (dành cho xác thực cục bộ & đồng bộ)
  note?: string;
}

export interface RegisterPayload {
  role: UserRole;
  displayName: string;
  nickname?: string;
  birthDate?: string;
  nationality?: string;
  ethnicity?: string;
  address?: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  guardianBirthYear?: string;
  isUnder16?: boolean;
  specialties?: string[];
  note?: string;
}

export type GuardianRelation = 
  | 'Cha' 
  | 'Mẹ' 
  | 'Ông' 
  | 'Bà' 
  | 'Anh' 
  | 'Chị' 
  | 'Cô' 
  | 'Dì' 
  | 'Chú' 
  | 'Bác' 
  | 'Người giám hộ' 
  | 'Khác';

export interface StudentGuardianLink {
  id: string;
  studentId: string;
  guardianId: string;
  studentName?: string;
  guardianName?: string;
  relationship: GuardianRelation;
  canViewLearning: boolean;
  canViewPayments: boolean;
  canSubmitPayments: boolean;
  canRequestScheduleChange: boolean;
  canRequestReservation: boolean;
  canRegisterCourses: boolean;
  canRedeemRewards: boolean;
  receiveNotifications: boolean;
  isPrimary: boolean;
  status: 'active' | 'pending' | 'inactive';
  createdAt?: string;
  notes?: string;
}

export interface Guardian {
  id: string;
  code: string; // e.g. PH001
  fullName: string;
  relation: GuardianRelation;
  phone: string;
  email: string;
  address: string;
  linkedStudentIds: string[];
  studentIds?: string[];
  isPrimaryContact: boolean;
  isNotificationReceiver: boolean;
  isTuitionResponsible: boolean;
  hasUserAccount: boolean;
  userId?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  notes?: string;
}

export interface Student {
  id: string;
  code: string; // e.g. HV001
  fullName: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  phone?: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  level?: string;
  teacherId?: string;
  address?: string;
  enrolledSubjects: string[];
  enrolledClassIds?: string[];
  totalLessons?: number;
  completedLessons?: number;
  remainingLessons?: number;
  stars?: number;
  totalStars?: number; // ⭐ Điểm sao vinh danh tích lũy trọn đời / BXH (Không bị trừ khi đổi quà)
  rewardPoints?: number; // 🎁 Điểm thưởng đổi quà khả dụng (Bị trừ khi đổi quà)
  status: 'active' | 'reserved' | 'completed' | 'trial' | 'locked' | 'inactive';
  userId?: string;
  linkedGuardianIds?: string[];
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  parentPhone?: string;
  citizenId?: string;
  taxId?: string;
  cccd?: string;
  joinDate?: string;
  joinedDate?: string;
  notes?: string;
}

export interface Teacher {
  id: string;
  code: string; // e.g. GV001
  fullName: string;
  gender?: Gender;
  birthDate: string; // YYYY-MM-DD
  phone: string;
  email: string;
  specialties: string[]; // ['Piano', 'Guitar', 'Thanh nhạc']
  bio?: string;
  avatar?: string;
  hourlyRate?: number;
  status: 'active' | 'on_leave' | 'inactive';
  userId?: string;
  hireDate?: string;
  joinDate?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  totalCourses?: number;
  totalClasses?: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  subjectId?: string;
  subject?: string;
  subjectName?: string;
  level?: 'Cơ bản' | 'Trung cấp' | 'Nâng cao' | 'Luyện thi' | 'Thiếu nhi' | 'Đệm hát' | 'Chuyên sâu' | string;
  totalLessons?: number;
  sessionDurationMinutes?: number; // e.g. 60 (1 giờ / buổi)
  sessionDurationText?: string; // e.g. '1h / buổi'
  durationMonths?: number; // 1, 3, 6 tháng
  fee?: number | string;
  description?: string;
}

export type ClassTeacherRole = 'lead' | 'assistant' | 'substitute' | 'specialist';

export interface ClassTeacher {
  id: string;
  classId: string;
  teacherId: string;
  teacherName?: string;
  teacherCode?: string;
  roleInClass: ClassTeacherRole; // 'lead' (GV Chính), 'assistant' (GV Phụ), 'substitute' (GV Thay thế), 'specialist' (Trợ giảng)
  roleTitle?: string; // Tên hiển thị: 'Giáo viên chính', 'Giáo viên phụ', 'Trợ giảng', 'GV Thay thế'
  subjects?: string[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive';
}

export interface MusicClass {
  id: string;
  code: string;
  name: string;
  subject?: string;
  subjectId?: string;
  subjectName?: string;
  courseId?: string;
  courseName?: string;
  teacherId: string; // Primary lead teacher (for backward compatibility)
  teacherName?: string;
  teacherIds?: string[]; // All assigned teacher IDs (many-to-many)
  teachers?: ClassTeacher[]; // Rich relation records for many-to-many
  schedule?: string;
  scheduleText?: string;
  scheduleTime?: string;
  scheduleDayOfWeek?: number[];
  daysOfWeek?: number[];
  startTime?: string;
  endTime?: string;
  room: string;
  maxStudents: number;
  currentStudents?: number;
  studentIds?: string[];
  status: 'active' | 'upcoming' | 'finished';
}

export type ClassItem = MusicClass;

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused' | 'late' | 'makeup' | 'absent_with_leave' | 'absent_no_leave';

export interface AttendanceRecord {
  id: string;
  classId: string;
  className?: string;
  subjectName?: string;
  subject?: string;
  teacherName?: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName?: string;
  status: AttendanceStatus;
  note?: string;
  evaluation?: string;
  starsAwarded?: number;
  recordedBy?: string;
  recordedAt?: string;
  isBackdated?: boolean;
  sessionNumber?: number;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface MakeupSession {
  id: string;
  studentId: string;
  studentName?: string;
  originalClassId?: string;
  originalDate?: string;
  classId?: string;
  className?: string;
  missedDate?: string;
  timeSlot?: string;
  targetClassId?: string;
  targetDate?: string;
  makeupDate?: string;
  makeupTime?: string;
  teacherId?: string;
  teacherName?: string;
  room?: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected';
  note?: string;
  createdAt?: string;
}

export type MakeupRequest = MakeupSession;

export interface ReservationRequest {
  id: string;
  studentId: string;
  studentName?: string;
  classId?: string;
  className?: string;
  courseId?: string;
  courseName?: string;
  subjectName?: string;
  startDate: string;
  endDate: string;
  sessionsRemaining?: number;
  remainingLessons?: number;
  remainingLessonsHeld?: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'ended';
  approvedDate?: string;
  notes?: string;
  createdAt?: string;
}

export type ReservationRecord = ReservationRequest;

export interface TrialLesson {
  id: string;
  studentId?: string;
  studentCode?: string;
  studentName: string;
  phone?: string;
  email?: string;
  subjectId?: string;
  subjectName?: string;
  subject?: string;
  preferredDate: string;
  preferredTime?: string;
  timeSlot?: string;
  teacherId?: string;
  teacherName?: string;
  parentName?: string;
  parentPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  gender?: Gender;
  status: 'scheduled' | 'attended' | 'converted' | 'cancelled';
  notes?: string;
  convertedDate?: string;
  createdAt: string;
}

export interface BirthdayItem {
  id: string;
  name: string;
  fullName?: string;
  code?: string;
  enrolledSubjects?: string[];
  role: UserRole;
  birthDate: string; // YYYY-MM-DD
  age: number;
  phone?: string;
  avatar?: string;
  classNameOrSubject?: string;
  daysUntilBirthday: number;
  category: 'today' | 'tomorrow' | '7days' | 'this_month';
}

export interface BirthdayTemplate {
  id: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'STUDENT' | 'TEACHER';
  isDefault?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId?: string; // Optional class tag
  className?: string;
  studentId?: string; // Primary target student
  studentName?: string;
  targetStudentId?: string;
  targetStudentIds?: string[]; // Multiple specific students if assigned to a group of individuals
  studentLevel?: 'Vỡ lòng' | 'Cơ bản (Grade 1-2)' | 'Trung cấp (Grade 3-4)' | 'Nâng cao (Grade 5+)' | 'Luyện thi / Chuyên sâu' | string;
  subjectName?: string; // e.g. Piano, Guitar, Thanh nhạc, Violin, Trống
  targetBpm?: number; // Metronome practice speed (e.g. 72, 80, 96, 120 bpm)
  customNotes?: string; // Specific instructions based on student's weaknesses/strengths
  dueDate: string;
  maxScore?: number;
  bonusStars?: number; // Honor stars for leaderboard upon completion (+5, +10 ⭐)
  rewardPoints?: number; // Reward points for gift redemption (+15 pts)
  attachments?: string[];
  sheetMusicUrl?: string; // Sheet music PDF/Image link
  audioUrl?: string; // Demo audio/beat/video link
  teacherId?: string;
  teacherName?: string;
  createdAt?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  submittedAt: string;
  mediaUrl?: string; // Video or Audio recording link
  notes?: string; // Student notes / practice difficulties
  teacherFeedback?: string; // Teacher feedback & coaching advice
  grade?: string; // e.g. 9.5/10, A+, Xuất sắc, Đạt yêu cầu
  score?: number;
  starsAwarded?: number; // Honor stars awarded (added to totalStars)
  rewardPointsAwarded?: number; // Reward points awarded (added to rewardPoints)
  status: 'pending' | 'graded';
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  requiredPoints?: number;
  pointsRequired?: number;
  imageUrl?: string;
  image?: string;
  category: 'accessories' | 'books' | 'gifts' | 'Giáo trình' | 'Nhạc cụ & Phụ kiện' | 'Quà lưu niệm' | 'Voucher' | string;
  stock: number;
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  date: string;
  badgeIcon: string;
  points: number;
}

export interface StarLeaderboardItem {
  studentId: string;
  code: string;
  studentName: string;
  avatar?: string;
  stars: number;
  totalStars?: number; // ⭐ Điểm sao tích lũy vinh danh BXH
  rewardPoints?: number; // 🎁 Điểm thưởng đổi quà khả dụng
  totalLessons?: number;
  completedLessons?: number;
  subject?: string;
  classNameOrSubject?: string;
  rank?: number;
  rankTitle?: string;
  recentBadges?: string[];
  badges?: string[];
}

export interface BankAccountConfig {
  bankId: string; // e.g. 'MBBank' | 'Vietcombank' | 'Techcombank' | 'ACB' | 'BIDV' | 'VietinBank' | 'TPBank' | 'VPBank' | 'Sacombank'
  bankName?: string;
  bankCode: string; // BIN e.g. '970422' (MB), '970436' (VCB), '970407' (Techcombank), '970416' (ACB), '970418' (BIDV), '970415' (VietinBank), '970423' (TPBank), '970432' (VPBank), '970403' (Sacombank)
  accountNumber: string;
  accountHolder: string;
  branchName?: string;
  customQrUrl?: string;
  useCustomQr: boolean;
  memoFormat: 'CODE_SUBJECT_MONTH' | 'NAME_SUBJECT_MONTH'; // e.g. "HV001 - Piano - Thang 03" vs "Nguyen Minh Anh - Piano - Thang 03"
}

export interface TuitionPayment {
  id: string;
  code?: string;
  invoiceCode?: string; // Mã số hóa đơn điện tử / Ký hiệu hóa đơn
  invoiceSeries?: string; // Ký hiệu mẫu số/ký hiệu (vd: 1C25TMM)
  studentId: string;
  studentCode?: string;
  studentName?: string;
  guardianId?: string;
  guardianName?: string;
  courseId?: string;
  courseName?: string;
  subjectName?: string;
  amount: number; // Tổng tiền thực thu / Giá trị thanh toán
  preTaxAmount?: number; // Doanh thu trước thuế
  taxRate?: number; // Thuế suất (%) vd: 0, 5, 8, 10
  taxAmount?: number; // Tiền thuế GTGT phát sinh
  taxIdOrCccd?: string; // MST hoặc CCCD người nộp/học viên
  payerName?: string; // Họ tên người nộp tiền (nếu khác học viên)
  revenueSource?: 'tuition' | 'instruments_books' | 'services_other' | string; // Nguồn thu: Học phí, Nhạc cụ/Giáo trình, Phí dịch vụ khác
  discountAmount?: number;
  paidAmount?: number;
  billingMonth?: string;
  sessionsCount?: number;
  paymentDate?: string;
  dueDate: string;
  status: 'completed' | 'pending' | 'overdue' | 'paid' | 'refunded';
  isRefunded?: boolean;
  refundDate?: string;
  refundAmount?: number;
  paymentMethod?: 'vietqr' | 'cash' | 'transfer' | 'VietQR' | 'Chuyển khoản' | 'Tiền mặt' | 'Thẻ' | 'Ví điện tử' | string;
  paymentMethodCategory?: 'bank_transfer' | 'cash' | 'e_wallet' | 'card' | string;
  invoiceNote?: string;
  qrString?: string;
  transferSyntax?: string;
  receiptProofUrl?: string;
  receiptSubmittedAt?: string;
  paidDate?: string;
  createdAt?: string;
  notes?: string;
}

export type RevenueSourceCategory = 'all' | 'tuition' | 'instruments_books' | 'services_other';
export type TaxPaymentMethodCategory = 'all' | 'bank_transfer' | 'cash' | 'e_wallet';
export type TaxPeriodType = 'month' | 'quarter' | 'year' | 'custom';
export type FacilityTaxType = 'household' | 'company';

export interface TaxReportFilterState {
  facilityType?: FacilityTaxType; // 'household': Hộ kinh doanh (Mẫu 01/CNKD) | 'company': Doanh nghiệp (Mẫu DN)
  periodType: TaxPeriodType;
  selectedMonth: number; // 1 - 12
  selectedQuarter: number; // 1 - 4
  selectedYear: number; // e.g. 2025, 2026
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  revenueSource: RevenueSourceCategory;
  paymentMethod: TaxPaymentMethodCategory;
  statusFilter: 'all' | 'paid' | 'refunded' | 'pending';
  searchQuery: string;
}

export interface TaxRevenueRecord {
  stt: number;
  id: string;
  invoiceCode: string;
  paymentDate: string;
  payerOrStudentName: string;
  studentCode: string;
  taxIdOrCccd: string;
  revenueContent: string;
  revenueCategoryName: string;
  taxGroup: 'education_8559' | 'goods_retail' | 'services_auxiliary'; // Phân nhóm ngành nghề thuế
  taxGroupLabel: string;
  preTaxAmount: number;
  taxRatePercent: number;
  taxAmount: number; // Thuế GTGT Doanh nghiệp hoặc tiền thuế GTGT
  pitTaxRatePercent: number; // Tỷ lệ thuế TNCN (Hộ KD)
  pitTaxAmount: number; // Tiền thuế TNCN (Hộ KD)
  totalTaxObligation: number; // Tổng nghĩa vụ thuế (GTGT + TNCN)
  totalCollectedAmount: number;
  paymentMethodDisplay: string;
  paymentMethodCategory: 'bank_transfer' | 'cash' | 'e_wallet';
  status: 'paid' | 'refunded' | 'pending';
  statusDisplay: string;
  isRefunded: boolean;
  notes: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  targetAudience?: 'ALL' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'GUARDIAN' | 'ACCOUNTANT' | 'MANAGER' | string;
  targetRoles?: UserRole[];
  targetUserIds?: string[];
  recipientId?: string;
  studentId?: string;
  studentName?: string;
  type: 'general' | 'tuition' | 'event' | 'schedule' | 'birthday' | 'attendance' | 'assignment' | 'evaluation' | 'system' | string;
  severity?: 'info' | 'warning' | 'alert' | 'success';
  createdAt: string;
  isRead?: boolean;
}

export interface CenterHoliday {
  id: string;
  name: string; // Tên ngày nghỉ lễ (vd: Tết Nguyên Đán, Giỗ Tổ Hùng Vương, Quốc khánh 2/9, Nghỉ hè trung tâm)
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  year: number; // e.g. 2025, 2026, 2027
  type: 'national' | 'center' | 'break' | 'custom'; // Quốc lễ | Nghỉ nội bộ trung tâm | Nghỉ định kỳ | Nghỉ đột xuất
  description?: string;
  isActive: boolean;
  autoExemptAttendance: boolean; // Tự động miễn trừ tính lịch điểm danh
  applicableSubjects?: string[]; // Áp dụng cho các môn (mặc định: tất cả)
  createdBy?: string;
  createdAt?: string;
}

export type MusicEventType = 
  | 'recital' // Báo cáo / Hòa nhạc / Biểu diễn định kỳ
  | 'masterclass' // Masterclass chuyên gia / Nghệ sĩ thỉnh giảng
  | 'holiday' // Nghỉ lễ / Nghỉ định kỳ trung tâm
  | 'workshop' // Workshop & Chuyên đề âm nhạc
  | 'competition' // Cuộc thi / Festival âm nhạc
  | 'exam' // Kỳ thi định kỳ / Đánh giá xếp lớp
  | 'other';

export type EventAudience = 'ALL' | 'STUDENT' | 'TEACHER' | 'PARENT' | 'PUBLIC';

export interface MusicEvent {
  id: string;
  title: string;
  type: MusicEventType;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (nếu sự kiện kéo dài nhiều ngày)
  startTime?: string; // HH:mm (vd: 09:00, 19:30)
  endTime?: string; // HH:mm (vd: 11:30, 21:30)
  location?: string; // Địa điểm tổ chức (vd: Khán phòng Hòa nhạc Tầng 3 Minh Music)
  branchId?: string; // Chi nhánh áp dụng hoặc 'all'
  branchName?: string;
  instructorOrHost?: string; // Chủ trì / Giảng viên Masterclass / Nghệ sĩ khách mời
  targetAudience: EventAudience;
  maxParticipants?: number;
  currentParticipants?: number;
  registeredStudentIds?: string[];
  bannerUrl?: string;
  color?: string; // Mã màu nhãn sự kiện (Hex)
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isFeatured?: boolean;
  registrationFee?: number; // 0 = Miễn phí
  notes?: string;
  createdAt?: string;
}

export interface TenantBranding {
  id: string;
  tenantCode: string;
  centerName: string;
  subName: string;
  slogan: string;
  logoType: 'icon' | 'image';
  logoUrl?: string;
  logoIcon: 'Music' | 'Sparkles' | 'GraduationCap' | 'Award' | 'Building' | 'Headphones' | 'Mic' | 'Radio';
  primaryColor: string; // Hex color (e.g. #d97706)
  secondaryColor: string; // Hex color (e.g. #e11d48)
  accentColor: string; // Hex color (e.g. #4f46e5)
  headerGradientFrom: string; // Hex color
  headerGradientTo: string; // Hex color
  brandTagBg: string;
  brandTagText: string;
  syncToAllTenants: boolean;
  hotline: string;
  supportEmail: string;
  address: string;
  website: string;
  // CẤU HÌNH LOẠI HÌNH CƠ SỞ & NGHĨA VỤ THUẾ
  facilityType?: 'household' | 'company'; // 'household': Hộ kinh doanh cá thể | 'company': Doanh nghiệp / Công ty
  // 1. Dành cho Hộ Kinh Doanh Cá Thể (Mẫu 01/CNKD - TT 40/2021/TT-BTC)
  householdName?: string; // Tên Hộ kinh doanh (vd: HỘ KINH DOANH MINH MUSIC CENTER)
  householdOwner?: string; // Chủ hộ / Họ tên chủ kinh doanh (vd: Nguyễn Văn Minh)
  householdCccd?: string; // CCCD/CMND của chủ hộ kinh doanh (vd: 079085012345)
  householdTaxCode?: string; // Mã số thuế Hộ kinh doanh
  householdBusinessAddress?: string; // Địa chỉ địa điểm kinh doanh của Hộ
  householdMainCareer?: string; // Ngành nghề kinh doanh chính (vd: 8559 - Giáo dục khác chưa được phân vào đâu)
  // 2. Dành cho Doanh Nghiệp / Công Ty (Mẫu DN & TT 80/2021/TT-BTC)
  companyName?: string; // Tên Doanh nghiệp / Công ty (vd: CÔNG TY TNHH GIÁO DỤC ÂM NHẠC MINH MUSIC)
  companyTaxCode?: string; // Mã số thuế Doanh nghiệp
  companyAddress?: string; // Trụ sở chính công ty
  centerTaxCode?: string; // Mã số thuế chung (fallback)
  legalRepresentative?: string; // Người đại diện theo pháp luật / Giám đốc
  chiefAccountant?: string; // Kế toán trưởng / Người phụ trách kế toán
  updatedAt?: string;
  bankAccount?: BankAccountConfig;
}

export interface TenantBranch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isMainBranch: boolean;
  branding?: Partial<TenantBranding>;
  googleMapsUrl?: string; // Link Google Maps / Link chia sẻ vị trí
  mapEmbedUrl?: string; // Link nhúng bản đồ / Iframe src
  latitude?: number; // Vĩ độ GPS
  longitude?: number; // Kinh độ GPS
  openingHours?: string; // Giờ mở cửa đón tiếp
  managerName?: string; // Quản lý cơ sở
  managerPhone?: string;
  facilities?: string[]; // Tiện ích & Cơ sở vật chất
  imageUrl?: string; // Ảnh thực tế cơ sở
  googleMapsApiKey?: string; // API Key nếu có
  notes?: string;
}

export type AdminMenuTab =
  // TỔNG QUAN
  | 'dashboard'
  | 'events'
  | 'star_ranking'
  // NHÂN SỰ & HỌC VIÊN
  | 'students'
  | 'teachers'
  | 'guardians'
  | 'birthdays'
  | 'accounts'
  // ĐÀO TẠO
  | 'subjects'
  | 'courses'
  | 'classes'
  | 'schedules'
  | 'attendance'
  | 'makeup'
  | 'reservations'
  | 'trial'
  // HỌC TẬP
  | 'assignments'
  | 'progress'
  | 'reward_points'
  | 'rewards'
  | 'achievements'
  // TÀI CHÍNH & HỆ THỐNG
  | 'tuition'
  | 'tax_report'
  | 'notifications'
  | 'reports'
  | 'sheets_sync'
  | 'branding'
  | 'branches_map'
  | 'profile'
  | 'settings';

export type TeacherMenuTab =
  // TỔNG QUAN
  | 'teacher_dashboard'
  // GIẢNG DẠY
  | 'teacher_schedules'
  | 'teacher_subjects'
  | 'teacher_classes'
  | 'teacher_students'
  | 'teacher_attendance'
  | 'teacher_assignments'
  | 'teacher_progress'
  | 'teacher_rewards'
  // CÁ NHÂN
  | 'teacher_notifications'
  | 'teacher_contact_admin'
  | 'teacher_profile';

export type StudentMenuTab =
  // TỔNG QUAN
  | 'student_dashboard'
  | 'student_leaderboard'
  // KHÁM PHÁ
  | 'student_subjects'
  | 'student_packages'
  | 'student_courses'
  | 'student_open_classes'
  // HỌC TẬP CỦA TÔI
  | 'student_my_classes'
  | 'student_my_schedule'
  | 'student_my_assignments'
  | 'student_my_progress'
  | 'student_my_rewards'
  | 'student_my_achievements'
  | 'student_redeem_gifts'
  // YÊU CẦU
  | 'student_request_registration'
  | 'student_request_makeup'
  | 'student_request_schedule_change'
  | 'student_request_reservation'
  | 'student_my_tuition'
  // HỖ TRỢ
  | 'student_branches'
  | 'student_contact_admin'
  | 'student_notifications'
  | 'student_profile';

export type ParentMenuTab =
  // TRANG CHỦ
  | 'parent_dashboard'
  | 'parent_my_students'
  // HỌC TẬP
  | 'parent_schedules'
  | 'parent_classes'
  | 'parent_subjects'
  | 'parent_courses'
  | 'parent_assignments'
  | 'parent_progress'
  | 'parent_rewards'
  | 'parent_achievements'
  // DỊCH VỤ
  | 'parent_register_learning'
  | 'parent_tuition'
  | 'parent_makeup'
  | 'parent_schedule_change'
  | 'parent_reservation'
  | 'parent_redeem_rewards'
  // HỖ TRỢ
  | 'parent_notifications'
  | 'parent_branches'
  | 'parent_contact_admin'
  | 'parent_profile';

export interface UserDataScope {
  role: UserRole;
  isAdmin: boolean;
  isManager?: boolean;
  isAccountant?: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isParentOrGuardian: boolean;
  teacherProfileId?: string;
  studentProfileId?: string;
  guardianProfileId?: string;
  assignedClassIds: string[];
  assignedStudentIds: string[];
  assignedSubjectIds: string[];
  assignedScheduleIds: string[];
  linkedStudentIds: string[];
  guardianPermissions?: Record<string, StudentGuardianLink>; // studentId -> permission link
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface RegistrationRequest {
  id: string;
  type: 'SUBJECT' | 'PACKAGE' | 'COURSE' | 'CLASS';
  targetId: string;
  targetName: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  guardianId?: string;
  guardianName?: string;
  
  // Chi tiết đăng ký môn & khóa học
  subjectId?: string;
  subjectName?: string;
  courseId?: string;
  courseName?: string;
  level?: string; // 'Cơ bản' | 'Trung cấp' | 'Nâng cao' | 'Thiếu nhi' | 'Đệm hát' | 'Chuyên sâu'
  durationPackage?: '1_month' | '3_months' | '6_months' | 'custom' | string;
  durationMonths?: number; // 1, 3, 6
  totalLessons?: number; // 8, 12, 24, 48
  lessonDurationMinutes?: number; // 60 (1h)
  estimatedFee?: number;
  
  // Lịch học & Khung giờ mong muốn
  desiredDays?: string[]; // ['Thứ 2', 'Thứ 4']
  desiredTimeSlot?: string; // '18:00 - 19:00'
  desiredScheduleText?: string; // 'Thứ 2, Thứ 4 (18:00 - 19:00)'
  desiredClassId?: string;
  desiredClassName?: string;
  
  requestedDate: string;
  note?: string;
  status: RequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  adminResponse?: string;
}

export interface ScheduleChangeRequest {
  id: string;
  studentId: string;
  studentName?: string;
  currentClassId: string;
  currentClassName?: string;
  currentScheduleDate?: string;
  targetClassId?: string;
  targetClassName?: string;
  desiredScheduleDate?: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminResponse?: string;
}

export interface PaymentSubmission {
  id: string;
  tuitionPaymentId?: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  amount: number;
  transferSyntax: string;
  receiptProofUrl?: string; // Data URL Base64 or Image URL
  receiptProofFileName?: string;
  transferDateTime?: string; // YYYY-MM-DDTHH:mm or YYYY-MM-DD HH:mm
  notes?: string;
  submittedAt: string;
  status: RequestStatus;
  confirmedBy?: string;
  confirmedAt?: string;
}

