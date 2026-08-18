import { TuitionPayment, Student, BankAccountConfig, TenantBranding } from '../types';
import { OverdueTemplate, OverdueAutomationSettings, OverdueNoticeLevel, OverdueDispatchLog } from '../types/overdueNotifications';

export const DEFAULT_OVERDUE_TEMPLATES: OverdueTemplate[] = [
  {
    id: 'tpl_due_soon',
    level: 'due_soon',
    name: 'Nhắc phí sắp đến hạn (Trước 3 ngày)',
    description: 'Gửi nhắc nhở nhẹ nhàng và lịch sự trước khi đến hạn thanh toán 3 ngày.',
    emailSubject: '🔔 [Minh Music] Thông báo học phí kỳ {Ky_Hoc_Phi} - Học viên {Hoc_Vien}',
    emailBody: `Kính gửi Quý Phụ huynh {Phu_Huynh} (hoặc Học viên {Hoc_Vien}),

Trung tâm Âm nhạc {Ten_Trung_Tam} trân trọng thông báo về kỳ học phí sắp tới của học viên {Hoc_Vien} (Mã HV: {Ma_HV}):

- Bộ môn / Khóa học: {Mon_Hoc} - {Khoa_Hoc}
- Kỳ học phí: {Ky_Hoc_Phi}
- Số tiền cần đóng: {So_Tien} đ
- Hạn thanh toán: {Han_Nop} (Còn {So_Ngay_Con_Lai} ngày)

Quý Phụ huynh có thể thanh toán nhanh chóng và tự động qua chuyển khoản ngân hàng:
- Ngân hàng: {Ngan_Hang}
- Số tài khoản: {So_Tai_Khoan}
- Chủ tài khoản: {Chu_Tai_Khoan}
- Cú pháp chuyển khoản: {Cu_Phap_Chuyen_Khoan}

Hoặc Quý phụ huynh có thể mở ứng dụng Ngân hàng để quét mã VietQR tự động khớp học phí tại Cổng phụ huynh.

Nếu Quý phụ huynh đã hoàn tất đóng học phí, vui lòng bỏ qua thông báo này. Mọi thắc mắc xin liên hệ Hotline: {Hotline}.

Trân trọng cảm ơn,
Ban Quản Trị {Ten_Trung_Tam}`,
    pushTitle: '🔔 Nhắc học phí kỳ {Ky_Hoc_Phi} ({So_Tien} đ)',
    pushBody: 'Kính gửi PH {Phu_Huynh}: Học phí môn {Mon_Hoc} của em {Hoc_Vien} sẽ đến hạn vào ngày {Han_Nop}. Chạm để xem mã VietQR thanh toán.',
    smsBody: '[Minh Music] Kính gửi PH em {Hoc_Vien}: Học phí kỳ {Ky_Hoc_Phi} ({So_Tien}d) hạn nộp {Han_Nop}. STK: {So_Tai_Khoan} ({Ngan_Hang}) - ND: {Cu_Phap_Chuyen_Khoan}. LH: {Hotline}',
    severity: 'info'
  },
  {
    id: 'tpl_due_today',
    level: 'due_today',
    name: 'Thông báo đến hạn thanh toán (Đúng ngày)',
    description: 'Gửi thông báo nhắc nhở vào đúng ngày hết hạn học phí.',
    emailSubject: '⏰ [Hôm nay đến hạn] Thanh toán học phí kỳ {Ky_Hoc_Phi} - {Hoc_Vien}',
    emailBody: `Kính gửi Quý Phụ huynh {Phu_Huynh} và Học viên {Hoc_Vien},

Hôm nay là ngày đến hạn thanh toán học phí môn {Mon_Hoc} của học viên {Hoc_Vien} (Mã HV: {Ma_HV}) tại {Ten_Trung_Tam}.

Chi tiết khoản thu:
- Khóa học: {Khoa_Hoc}
- Kỳ học phí: {Ky_Hoc_Phi}
- Số tiền: {So_Tien} đ
- Hạn nộp: Hôm nay ({Han_Nop})

Thông tin chuyển khoản nhanh:
- Ngân hàng: {Ngan_Hang}
- Số tài khoản: {So_Tai_Khoan}
- Chủ tài khoản: {Chu_Tai_Khoan}
- Cú pháp chuyển khoản: {Cu_Phap_Chuyen_Khoan}

Kính đề nghị Quý phụ huynh hoàn tất thanh toán để trung tâm duy trì lịch học và chuẩn bị tốt nhất cho các buổi học tiếp theo của học viên.

Hotline hỗ trợ tài vụ: {Hotline}
Trân trọng cảm ơn!`,
    pushTitle: '⏰ Hôm nay đến hạn học phí em {Hoc_Vien}',
    pushBody: 'Học phí kỳ {Ky_Hoc_Phi} môn {Mon_Hoc} ({So_Tien} đ) đến hạn hôm nay ({Han_Nop}). Kính mời Phụ huynh thanh toán qua VietQR.',
    smsBody: '[Minh Music] Hôm nay den han hoc phi ky {Ky_Hoc_Phi} cua em {Hoc_Vien} ({So_Tien}d). STK: {So_Tai_Khoan} - ND: {Cu_Phap_Chuyen_Khoan}. Hotline: {Hotline}',
    severity: 'warning'
  },
  {
    id: 'tpl_overdue_1',
    level: 'overdue_level_1',
    name: 'Nhắc nợ quá hạn Lần 1 (Quá hạn 1 - 7 ngày)',
    description: 'Gửi nhắc nhở quá hạn mức độ 1 với sự ân cần và nhắc nhở thời hạn hoàn tất.',
    emailSubject: '⚠️ [Nhắc quá hạn] Học phí kỳ {Ky_Hoc_Phi} của học viên {Hoc_Vien} đã quá hạn',
    emailBody: `Kính gửi Quý Phụ huynh {Phu_Huynh},

Hệ thống quản lý {Ten_Trung_Tam} ghi nhận khoản học phí của học viên {Hoc_Vien} (Mã: {Ma_HV}) hiện đã quá hạn {So_Ngay_Qua_Han} ngày.

Thông tin khoản nợ học phí:
- Môn học: {Mon_Hoc} ({Khoa_Hoc})
- Kỳ học: {Ky_Hoc_Phi}
- Số tiền chưa thanh toán: {So_Tien} đ
- Ngày hết hạn ban đầu: {Han_Nop}
- Tình trạng: Quá hạn {So_Ngay_Qua_Han} ngày

Kính mong Quý Phụ huynh sắp xếp thời gian thanh toán sớm để đảm bảo quyền lợi điểm danh và duy trì suất học của em:
- Ngân hàng: {Ngan_Hang}
- Số TK: {So_Tai_Khoan}
- Chủ TK: {Chu_Tai_Khoan}
- Cú pháp: {Cu_Phap_Chuyen_Khoan}

Nếu Quý phụ huynh gặp trở ngại hoặc đã chuyển khoản nhưng chưa được cập nhật, xin vui lòng phản hồi qua Hotline: {Hotline} để bộ phận kế toán kiểm tra lại đối soát.

Trân trọng cảm ơn!`,
    pushTitle: '⚠️ Học phí của em {Hoc_Vien} đã quá hạn {So_Ngay_Qua_Han} ngày',
    pushBody: 'Khoản học phí {So_Tien} đ kỳ {Ky_Hoc_Phi} đã quá hạn {So_Ngay_Qua_Han} ngày. Kính mong Phụ huynh hoàn tất sớm để đảm bảo buổi học của con.',
    smsBody: '[Minh Music] Hoc phi ky {Ky_Hoc_Phi} cua em {Hoc_Vien} da qua han {So_Ngay_Qua_Han} ngay ({So_Tien}d). Kính mong PH chuyen khoan toi STK: {So_Tai_Khoan} - ND: {Cu_Phap_Chuyen_Khoan}. LH: {Hotline}',
    severity: 'warning'
  },
  {
    id: 'tpl_overdue_2',
    level: 'overdue_level_2',
    name: 'Cảnh báo quá hạn nghiêm trọng (> 7 ngày)',
    description: 'Thông báo chính thức về việc tạm dừng điểm danh / giữ chỗ nếu chưa hoàn tất học phí.',
    emailSubject: '🛑 [CẢNH BÁO QUÁ HẠN] Tạm dừng lịch học em {Hoc_Vien} do học phí quá hạn > 7 ngày',
    emailBody: `Kính gửi Quý Phụ huynh {Phu_Huynh},

{Ten_Trung_Tam} trân trọng gửi thông báo khẩn về tình trạng học phí của học viên {Hoc_Vien} (Mã HV: {Ma_HV}):

- Bộ môn: {Mon_Hoc}
- Số tiền nợ: {So_Tien} đ
- Hạn nộp: {Han_Nop}
- Số ngày quá hạn: {So_Ngay_Qua_Han} ngày

Theo quy chế đào tạo của trung tâm, các trường hợp quá hạn học phí trên 7 ngày sẽ bị tạm khóa quyền điểm danh và tạm dừng sắp xếp lịch học với giáo viên.

Để đảm bảo việc học tập của học viên {Hoc_Vien} không bị gián đoạn, kính đề nghị Quý Phụ huynh thanh toán ngay trong vòng 24h tới:
- Ngân hàng: {Ngan_Hang}
- Số tài khoản: {So_Tai_Khoan}
- Chủ tài khoản: {Chu_Tai_Khoan}
- Nội dung: {Cu_Phap_Chuyen_Khoan}

Bộ phận Tài vụ & Kế toán {Ten_Trung_Tam} sẵn sàng hỗ trợ trực tiếp tại số: {Hotline}.

Trân trọng kính báo!`,
    pushTitle: '🛑 CẢNH BÁO: Học phí em {Hoc_Vien} quá hạn {So_Ngay_Qua_Han} ngày',
    pushBody: 'Khoản học phí {So_Tien} đ quá hạn nghiêm trọng ({So_Ngay_Qua_Han} ngày). Lịch học có thể bị tạm dừng. Vui lòng thanh toán ngay.',
    smsBody: '[CANH BAO MINH MUSIC] Hoc phi em {Hoc_Vien} da qua han {So_Ngay_Qua_Han} ngay ({So_Tien}d). Vui long thanh toan toi STK: {So_Tai_Khoan} de khong bi gian doan lich hoc. Hotline: {Hotline}',
    severity: 'alert'
  }
];

export const DEFAULT_AUTOMATION_SETTINGS: OverdueAutomationSettings = {
  isEnabled: true,
  scheduledTime: '08:30',
  notifyBeforeDays: 3,
  notifyOnDueDate: true,
  repeatOverdueDays: 3,
  enablePushInApp: true,
  enableEmail: true,
  enableSmsZalo: false,
  attachVietQr: true,
  autoSendParents: true,
  autoSendStudents: false,
  lastRunTimestamp: new Date().toLocaleDateString('vi-VN') + ' 08:30',
  totalAutomatedSent: 34
};

// Variable tokens reference for editor
export const TEMPLATE_VARIABLES = [
  { token: '{Hoc_Vien}', desc: 'Họ tên đầy đủ học viên', example: 'Nguyễn Minh Anh' },
  { token: '{Ma_HV}', desc: 'Mã số học viên', example: 'HV001' },
  { token: '{Phu_Huynh}', desc: 'Tên phụ huynh / người nộp', example: 'Nguyễn Văn Hùng' },
  { token: '{Mon_Hoc}', desc: 'Bộ môn âm nhạc', example: 'Piano & Keyboard' },
  { token: '{Khoa_Hoc}', desc: 'Tên khóa học đăng ký', example: 'Piano Cơ Bản Toàn Diện' },
  { token: '{Ky_Hoc_Phi}', desc: 'Kỳ tháng học phí', example: 'Tháng 03/2025' },
  { token: '{So_Tien}', desc: 'Số tiền học phí (VNĐ)', example: '3.600.000' },
  { token: '{Han_Nop}', desc: 'Hạn thanh toán', example: '10/03/2025' },
  { token: '{So_Ngay_Qua_Han}', desc: 'Số ngày đã quá hạn', example: '4' },
  { token: '{So_Ngay_Con_Lai}', desc: 'Số ngày còn lại trước hạn', example: '2' },
  { token: '{Ngan_Hang}', desc: 'Tên ngân hàng nhận', example: 'MBBank' },
  { token: '{So_Tai_Khoan}', desc: 'Số tài khoản trung tâm', example: '0901888999' },
  { token: '{Chu_Tai_Khoan}', desc: 'Chủ tài khoản', example: 'TRUNG TAM AM NHAC MINH MUSIC' },
  { token: '{Cu_Phap_Chuyen_Khoan}', desc: 'Cú pháp chuyển khoản chuẩn', example: 'HV001 PIANO T0325' },
  { token: '{Ten_Trung_Tam}', desc: 'Tên trung tâm âm nhạc', example: 'Trung tâm Âm nhạc Minh Music' },
  { token: '{Hotline}', desc: 'Số điện thoại hotline', example: '0901 888 999' }
];

export interface ScannedOverdueItem {
  payment: TuitionPayment;
  student?: Student;
  level: OverdueNoticeLevel;
  daysDifference: number; // positive = overdue days, negative = days before due, 0 = due today
  statusLabel: string;
  badgeColor: string;
  recommendedTemplateId: string;
  variables: Record<string, string>;
}

export function calculateDaysDiff(dueDateStr: string): number {
  if (!dueDateStr) return 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Support YYYY-MM-DD or DD/MM/YYYY
  let due: Date;
  if (dueDateStr.includes('/')) {
    const parts = dueDateStr.split('/');
    due = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  } else {
    const parts = dueDateStr.split('-');
    due = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  due.setHours(0, 0, 0, 0);

  const diffTime = now.getTime() - due.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function scanOverduePayments(
  payments: TuitionPayment[],
  students: Student[],
  bankConfig?: BankAccountConfig,
  branding?: TenantBranding
): ScannedOverdueItem[] {
  const result: ScannedOverdueItem[] = [];

  const bankName = bankConfig?.bankName || 'MBBank - Ngân hàng Quân Đội';
  const accountNumber = bankConfig?.accountNumber || '0901888999';
  const accountHolder = bankConfig?.accountHolder || 'TRUNG TAM AM NHAC MINH MUSIC';
  const centerName = branding?.centerName || 'Trung tâm Âm nhạc Minh Music';
  const hotline = branding?.hotline || '0901 888 999';

  payments.forEach(payment => {
    // Only check pending or overdue payments
    if (payment.status === 'completed' || payment.status === 'paid' || payment.status === 'refunded') {
      return;
    }

    const student = students.find(s => s.id === payment.studentId || s.code === payment.studentCode);
    const studentName = payment.studentName || student?.fullName || 'Học viên';
    const studentCode = payment.studentCode || student?.code || 'HV000';
    const guardianName = payment.guardianName || student?.guardianName || studentName;
    const courseName = payment.courseName || 'Khóa học chính khóa';
    const subjectName = payment.subjectName || student?.enrolledSubjects?.[0] || 'Âm nhạc';
    const billingMonth = payment.billingMonth || 'Tháng hiện tại';
    const amountStr = (payment.amount || 0).toLocaleString('vi-VN');
    const dueDateStr = payment.dueDate || new Date().toISOString().slice(0, 10);

    const daysDiff = calculateDaysDiff(dueDateStr);

    let level: OverdueNoticeLevel = 'due_soon';
    let statusLabel = 'Sắp đến hạn';
    let badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
    let recommendedTemplateId = 'tpl_due_soon';

    if (daysDiff > 7) {
      level = 'overdue_level_2';
      statusLabel = `Quá hạn ${daysDiff} ngày (Nghiêm trọng)`;
      badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
      recommendedTemplateId = 'tpl_overdue_2';
    } else if (daysDiff > 0) {
      level = 'overdue_level_1';
      statusLabel = `Quá hạn ${daysDiff} ngày`;
      badgeColor = 'bg-orange-100 text-orange-800 border-orange-200';
      recommendedTemplateId = 'tpl_overdue_1';
    } else if (daysDiff === 0) {
      level = 'due_today';
      statusLabel = 'Đến hạn hôm nay';
      badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
      recommendedTemplateId = 'tpl_due_today';
    } else {
      // daysDiff < 0
      const daysLeft = Math.abs(daysDiff);
      level = 'due_soon';
      statusLabel = `Còn ${daysLeft} ngày đến hạn`;
      badgeColor = 'bg-sky-100 text-sky-800 border-sky-200';
      recommendedTemplateId = 'tpl_due_soon';
    }

    // Transfer syntax
    const cleanMonth = billingMonth.replace(/[^0-9]/g, '');
    const transferSyntax = `${studentCode} ${subjectName.slice(0, 5).toUpperCase()} ${cleanMonth || 'HP'}`;

    const variables: Record<string, string> = {
      '{Hoc_Vien}': studentName,
      '{Ma_HV}': studentCode,
      '{Phu_Huynh}': guardianName,
      '{Mon_Hoc}': subjectName,
      '{Khoa_Hoc}': courseName,
      '{Ky_Hoc_Phi}': billingMonth,
      '{So_Tien}': amountStr,
      '{Han_Nop}': dueDateStr,
      '{So_Ngay_Qua_Han}': Math.max(0, daysDiff).toString(),
      '{So_Ngay_Con_Lai}': Math.max(0, -daysDiff).toString(),
      '{Ngan_Hang}': bankName,
      '{So_Tai_Khoan}': accountNumber,
      '{Chu_Tai_Khoan}': accountHolder,
      '{Cu_Phap_Chuyen_Khoan}': transferSyntax,
      '{Ten_Trung_Tam}': centerName,
      '{Hotline}': hotline
    };

    result.push({
      payment,
      student,
      level,
      daysDifference: daysDiff,
      statusLabel,
      badgeColor,
      recommendedTemplateId,
      variables
    });
  });

  // Sort: most overdue first, then due today, then due soon
  return result.sort((a, b) => b.daysDifference - a.daysDifference);
}

export function renderTemplateText(templateText: string, variables: Record<string, string>): string {
  if (!templateText) return '';
  let output = templateText;
  Object.entries(variables).forEach(([token, val]) => {
    output = output.split(token).join(val || '');
  });
  return output;
}

// Storage helpers
const TEMPLATES_STORAGE_KEY = 'minh_music_overdue_templates';
const AUTOMATION_STORAGE_KEY = 'minh_music_overdue_automation';
const DISPATCH_LOG_STORAGE_KEY = 'minh_music_overdue_logs';

export function loadSavedTemplates(): OverdueTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved overdue templates', e);
  }
  return DEFAULT_OVERDUE_TEMPLATES;
}

export function saveTemplates(templates: OverdueTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save overdue templates', e);
  }
}

export function loadSavedAutomationSettings(): OverdueAutomationSettings {
  try {
    const raw = localStorage.getItem(AUTOMATION_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_AUTOMATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return DEFAULT_AUTOMATION_SETTINGS;
}

export function saveAutomationSettings(settings: OverdueAutomationSettings): void {
  try {
    localStorage.setItem(AUTOMATION_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export function loadDispatchLogs(): OverdueDispatchLog[] {
  try {
    const raw = localStorage.getItem(DISPATCH_LOG_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return [
    {
      id: 'log-01',
      studentId: 'stu-02',
      studentName: 'Trần Bảo Long',
      studentCode: 'HV002',
      guardianName: 'Trần Văn Hùng',
      paymentId: 'tui-02',
      amount: 3200000,
      dueDate: '2025-03-05',
      daysOverdue: 5,
      level: 'overdue_level_1',
      channels: ['push', 'email'],
      sentAt: '12/03/2025 08:30:15',
      status: 'success'
    },
    {
      id: 'log-02',
      studentId: 'stu-04',
      studentName: 'Lê Hoàng Nam',
      studentCode: 'HV004',
      guardianName: 'Lê Văn Tuấn',
      paymentId: 'tui-04',
      amount: 3800000,
      dueDate: '2025-03-01',
      daysOverdue: 9,
      level: 'overdue_level_2',
      channels: ['push', 'email', 'sms'],
      sentAt: '12/03/2025 08:30:15',
      status: 'success'
    }
  ];
}

export function appendDispatchLog(log: OverdueDispatchLog): void {
  try {
    const current = loadDispatchLogs();
    const updated = [log, ...current].slice(0, 100); // keep 100 latest
    localStorage.setItem(DISPATCH_LOG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
}
