import * as XLSX from 'xlsx';
import { TuitionPayment, AttendanceRecord, Student, MusicClass, AttendanceStatus, TenantBranding } from '../types';
import { vietnameseNumberToWords } from './taxCompliance';

/**
 * Utility function to trigger CSV file download in browser
 */
export const downloadCSV = (content: string, filename: string) => {
  // UTF-8 BOM so Excel opens Vietnamese characters correctly without encoding issues
  const bom = '\uFEFF';
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Escape CSV fields to prevent formatting issues
 */
const escapeCSV = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Helper to translate AttendanceStatus to readable Vietnamese
 */
export const formatAttendanceStatus = (status: AttendanceStatus): string => {
  switch (status) {
    case 'present':
      return 'Có mặt';
    case 'absent_excused':
    case 'absent_with_leave':
      return 'Nghỉ phép (Học bù)';
    case 'absent_unexcused':
    case 'absent_no_leave':
      return 'Vắng không phép';
    case 'late':
      return 'Đi muộn';
    case 'makeup':
      return 'Học bù';
    default:
      return status;
  }
};

/**
 * ============================================================================
 * EXCEL (.XLSX) EXPORTS WITH ADMINISTRATIVE STRUCTURE & CELL FORMATTING
 * ============================================================================
 */

/**
 * Xuất file Excel (.xlsx) Báo cáo Học Phí & Công Nợ
 */
export const exportTuitionToExcel = (
  payments: TuitionPayment[],
  students: Student[],
  branding?: TenantBranding,
  filename?: string
) => {
  const centerName = branding?.centerName || branding?.householdName || branding?.companyName || 'TRUNG TÂM ÂM NHẠC MINH MUSIC';
  const taxCode = branding?.householdTaxCode || branding?.companyTaxCode || branding?.centerTaxCode || '8499281902';
  const address = branding?.householdBusinessAddress || branding?.companyAddress || branding?.address || 'Quận 1, TP. Hồ Chí Minh';
  const hotline = branding?.hotline || '0901 888 999';
  const accountant = branding?.chiefAccountant || 'Trần Thị Thu Thủy';
  const director = branding?.legalRepresentative || branding?.householdOwner || 'Nguyễn Văn Minh';
  const dateStr = new Date().toLocaleDateString('vi-VN');
  const actualFilename = filename || `Bao_Cao_Hoc_Phi_${Date.now().toString().slice(-6)}.xlsx`;

  const totalPaid = payments
    .filter((p) => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalAmount = totalPaid + totalPending;

  const aoa: any[][] = [];

  // Header cơ sở
  aoa.push([centerName.toUpperCase(), '', '', '', '', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
  aoa.push([`Mã số thuế: ${taxCode} | Hotline: ${hotline}`, '', '', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc']);
  aoa.push([`Địa chỉ: ${address}`, '', '', '', '', '', '', '', 'Mẫu số: 01-HP (Theo chuẩn nội bộ)']);
  aoa.push([]);

  // Tiêu đề báo cáo
  aoa.push(['BẢNG TỔNG HỢP & THEO DÕI THU HỌC PHÍ']);
  aoa.push([`Ngày lập: ${dateStr} - Tổng số hóa đơn: ${payments.length} - Tỷ lệ tất toán: ${payments.length > 0 ? (((payments.filter(p => p.status === 'paid' || p.status === 'completed').length) / payments.length) * 100).toFixed(1) : 0}%`]);
  aoa.push([]);

  // Tóm tắt số liệu
  aoa.push(['I. TỔNG HỢP SỐ LIỆU HỌC PHÍ:']);
  aoa.push(['Chỉ Tiêu', 'Số Lượng / Tỷ Lệ', 'Tổng Số Tiền (VNĐ)', 'Ghi Chú']);
  aoa.push(['1. Đã thu hoàn tất', `${payments.filter((p) => p.status === 'paid' || p.status === 'completed').length} hóa đơn`, totalPaid, 'Đã vào quỹ']);
  aoa.push(['2. Công nợ còn chờ thu', `${payments.filter((p) => p.status === 'pending' || p.status === 'overdue').length} hóa đơn`, totalPending, 'Chờ phụ huynh nộp']);
  aoa.push(['TỔNG CỘNG HỌC PHÍ', `${payments.length} hóa đơn`, totalAmount, `Bằng chữ: ${vietnameseNumberToWords(totalAmount)}`]);
  aoa.push([]);

  // Chi tiết hóa đơn
  aoa.push(['II. DANH SÁCH CHI TIẾT HÓA ĐƠN HỌC PHÍ:']);
  const tableHeaders = [
    'STT',
    'Mã Hóa Đơn',
    'Mã Học Viên',
    'Họ Tên Học Viên',
    'Môn Học',
    'Khóa Học',
    'Kỳ Thu',
    'Số Buổi',
    'Số Tiền (VNĐ)',
    'Hạn Nộp',
    'Ngày Nộp',
    'Trạng Thái',
    'Hình Thức TT',
    'Cú Pháp Chuyển Khoản',
    'Ghi Chú'
  ];
  aoa.push(tableHeaders);

  const statusMap: Record<string, string> = {
    paid: 'Đã thu',
    completed: 'Đã hoàn tất',
    pending: 'Chờ thu',
    overdue: 'Quá hạn'
  };

  payments.forEach((p, idx) => {
    const student = students.find((s) => s.id === p.studentId);
    aoa.push([
      idx + 1,
      p.id,
      p.studentCode || student?.code || '',
      p.studentName || student?.fullName || '',
      p.subjectName || 'Piano',
      p.courseName || '',
      p.billingMonth || '',
      p.sessionsCount || 0,
      p.amount,
      p.dueDate || '',
      p.paymentDate || '',
      statusMap[p.status] || p.status,
      p.paymentMethod || 'VietQR',
      p.transferSyntax || '',
      p.invoiceNote || ''
    ]);
  });

  aoa.push([]);
  aoa.push([
    'TỔNG CỘNG',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalAmount,
    '',
    '',
    `Đã thu: ${totalPaid.toLocaleString('vi-VN')} đ`,
    '',
    `Còn nợ: ${totalPending.toLocaleString('vi-VN')} đ`,
    ''
  ]);
  aoa.push([`Số tiền bằng chữ: ${vietnameseNumberToWords(totalAmount)}`]);
  aoa.push([]);

  // Chữ ký xác nhận
  aoa.push(['', '', '', '', '', '', '', '', `......, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`]);
  aoa.push(['NGƯỜI LẬP BIỂU', '', '', 'KẾ TOÁN TRƯỞNG / THU QUỸ', '', '', '', '', 'ĐẠI DIỆN TRUNG TÂM / CHỦ HỘ']);
  aoa.push(['(Ký, ghi rõ họ tên)', '', '', '(Ký, ghi rõ họ tên)', '', '', '', '', '(Ký, đóng dấu, ghi rõ họ tên)']);
  aoa.push([]);
  aoa.push([]);
  aoa.push(['Người lập báo cáo', '', '', accountant, '', '', '', '', director]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Set autofit column widths
  ws['!cols'] = [
    { wch: 6 },
    { wch: 14 },
    { wch: 12 },
    { wch: 25 },
    { wch: 14 },
    { wch: 18 },
    { wch: 12 },
    { wch: 10 },
    { wch: 16 },
    { wch: 13 },
    { wch: 13 },
    { wch: 13 },
    { wch: 16 },
    { wch: 28 },
    { wch: 22 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bao_Cao_Hoc_Phi');
  XLSX.writeFile(wb, actualFilename);
};

/**
 * Xuất file Excel (.xlsx) Báo cáo Điểm Danh & Chuyên Cần
 */
export const exportAttendanceToExcel = (
  attendance: AttendanceRecord[],
  students: Student[],
  classes: MusicClass[],
  branding?: TenantBranding,
  filename?: string
) => {
  const centerName = branding?.centerName || branding?.householdName || branding?.companyName || 'TRUNG TÂM ÂM NHẠC MINH MUSIC';
  const taxCode = branding?.householdTaxCode || branding?.companyTaxCode || branding?.centerTaxCode || '8499281902';
  const address = branding?.householdBusinessAddress || branding?.companyAddress || branding?.address || 'Quận 1, TP. Hồ Chí Minh';
  const hotline = branding?.hotline || '0901 888 999';
  const director = branding?.legalRepresentative || branding?.householdOwner || 'Nguyễn Văn Minh';
  const dateStr = new Date().toLocaleDateString('vi-VN');
  const actualFilename = filename || `Bao_Cao_Diem_Danh_${Date.now().toString().slice(-6)}.xlsx`;

  const totalSessions = attendance.length;
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const excusedCount = attendance.filter((a) => a.status === 'absent_excused' || a.status === 'absent_with_leave').length;
  const unexcusedCount = attendance.filter((a) => a.status === 'absent_unexcused' || a.status === 'absent_no_leave').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const attendanceRate = totalSessions > 0 ? (((presentCount + lateCount) / totalSessions) * 100).toFixed(1) : '100';

  const aoa: any[][] = [];

  // Header
  aoa.push([centerName.toUpperCase(), '', '', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
  aoa.push([`Mã số thuế: ${taxCode} | Hotline: ${hotline}`, '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc']);
  aoa.push([`Địa chỉ: ${address}`, '', '', '', '', '', 'Mẫu số: 02-DD (Theo dõi chuyên cần)']);
  aoa.push([]);

  // Tiêu đề
  aoa.push(['BẢNG TỔNG HỢP ĐIỂM DANH & THEO DÕI CHUYÊN CẦN HỌC VIÊN']);
  aoa.push([`Ngày lập: ${dateStr} - Tổng lượt điểm danh: ${totalSessions} - Tỷ lệ chuyên cần: ${attendanceRate}%`]);
  aoa.push([]);

  // Tóm tắt
  aoa.push(['I. TỔNG HỢP CHUYÊN CẦN:']);
  aoa.push(['Chỉ Tiêu', 'Số Lượng', 'Tỷ Lệ (%)', 'Ghi Chú']);
  aoa.push(['1. Có mặt đúng giờ', presentCount, totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) + '%' : '0%', 'Đúng giờ']);
  aoa.push(['2. Đi muộn', lateCount, totalSessions > 0 ? ((lateCount / totalSessions) * 100).toFixed(1) + '%' : '0%', 'Cần nhắc nhở']);
  aoa.push(['3. Nghỉ phép (được học bù)', excusedCount, totalSessions > 0 ? ((excusedCount / totalSessions) * 100).toFixed(1) + '%' : '0%', 'Sắp xếp lịch bù']);
  aoa.push(['4. Vắng không phép', unexcusedCount, totalSessions > 0 ? ((unexcusedCount / totalSessions) * 100).toFixed(1) + '%' : '0%', 'Trừ buổi']);
  aoa.push(['TỔNG LƯỢT ĐIỂM DANH', totalSessions, '100%', `Tỷ lệ chuyên cần chung: ${attendanceRate}%`]);
  aoa.push([]);

  // Bảng chi tiết
  aoa.push(['II. BẢNG KÊ CHI TIẾT NHẬT KÝ ĐIỂM DANH:']);
  aoa.push([
    'STT',
    'Ngày Học',
    'Mã Học Viên',
    'Họ Tên Học Viên',
    'Lớp Học',
    'Môn Học',
    'Giáo Viên / Người Điểm Danh',
    'Trạng Thái',
    'Đánh Giá / Nhận Xét',
    'Ghi Chú'
  ]);

  attendance.forEach((a, idx) => {
    const student = students.find((s) => s.id === a.studentId);
    const cls = classes.find((c) => c.id === a.classId);
    aoa.push([
      idx + 1,
      a.date,
      student?.code || '',
      a.studentName || student?.fullName || '',
      a.className || cls?.name || '',
      a.subjectName || cls?.subjectName || cls?.subject || 'Piano',
      cls?.teacherName || a.recordedBy || '',
      formatAttendanceStatus(a.status),
      a.evaluation || '',
      a.note || ''
    ]);
  });

  aoa.push([]);
  // Chữ ký
  aoa.push(['', '', '', '', '', '', `......, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`]);
  aoa.push(['GIÁO VỤ / NGƯỜI ĐIỂM DANH', '', '', 'GIÁO VIÊN BỘ MÔN', '', '', 'ĐẠI DIỆN TRUNG TÂM']);
  aoa.push(['(Ký, ghi rõ họ tên)', '', '', '(Ký, ghi rõ họ tên)', '', '', '(Ký, đóng dấu, ghi rõ họ tên)']);
  aoa.push([]);
  aoa.push([]);
  aoa.push(['Người lập báo cáo', '', '', 'Giáo viên phụ trách', '', '', director]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 13 },
    { wch: 12 },
    { wch: 25 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 18 },
    { wch: 32 },
    { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bao_Cao_Diem_Danh');
  XLSX.writeFile(wb, actualFilename);
};

/**
 * Xuất file Excel (.xlsx) Tổng Hợp Học Phí & Điểm Danh Toàn Diện (Multi-sheet)
 */
export const exportCombinedSummaryToExcel = (
  payments: TuitionPayment[],
  attendance: AttendanceRecord[],
  students: Student[],
  classes: MusicClass[],
  branding?: TenantBranding,
  filename?: string
) => {
  const centerName = branding?.centerName || branding?.householdName || branding?.companyName || 'TRUNG TÂM ÂM NHẠC MINH MUSIC';
  const taxCode = branding?.householdTaxCode || branding?.companyTaxCode || branding?.centerTaxCode || '8499281902';
  const address = branding?.householdBusinessAddress || branding?.companyAddress || branding?.address || 'Quận 1, TP. Hồ Chí Minh';
  const hotline = branding?.hotline || '0901 888 999';
  const director = branding?.legalRepresentative || branding?.householdOwner || 'Nguyễn Văn Minh';
  const accountant = branding?.chiefAccountant || 'Trần Thị Thu Thủy';
  const dateStr = new Date().toLocaleDateString('vi-VN');
  const actualFilename = filename || `Bao_Cao_Tong_Hop_Tai_Chinh_Diem_Danh_${Date.now().toString().slice(-6)}.xlsx`;

  const totalPaid = payments
    .filter((p) => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  // SHEET 1: TỔNG HỢP HỌC VIÊN
  const aoa1: any[][] = [];
  aoa1.push([centerName.toUpperCase(), '', '', '', '', '', '', 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM']);
  aoa1.push([`Mã số thuế: ${taxCode} | Hotline: ${hotline}`, '', '', '', '', '', '', 'Độc lập - Tự do - Hạnh phúc']);
  aoa1.push([`Địa chỉ: ${address}`, '', '', '', '', '', '', 'Mẫu số: 03-TH (Báo cáo tổng hợp)']);
  aoa1.push([]);
  aoa1.push(['BẢNG TỔNG HỢP HỌC VIÊN, HỌC PHÍ & CHUYÊN CẦN']);
  aoa1.push([`Ngày lập: ${dateStr} - Tổng học viên: ${students.length} - Doanh thu đã thu: ${totalPaid.toLocaleString('vi-VN')} đ`]);
  aoa1.push([]);

  aoa1.push([
    'STT',
    'Mã HV',
    'Họ Tên Học Viên',
    'Môn Đăng Ký',
    'Buổi Có Mặt',
    'Buổi Vắng/Nghỉ',
    'Học Phí Đã Nộp (VNĐ)',
    'Công Nợ Còn Lại (VNĐ)',
    'Trạng Thái Học Tập'
  ]);

  const statusMap: Record<string, string> = {
    active: 'Đang học',
    trial: 'Học thử',
    reserved: 'Bảo lưu',
    completed: 'Hoàn thành',
    locked: 'Tạm khóa',
    inactive: 'Nghỉ học'
  };

  students.forEach((s, idx) => {
    const sAttendance = attendance.filter((a) => a.studentId === s.id);
    const sPresent = sAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    const sAbsent = sAttendance.filter((a) => a.status === 'absent_unexcused' || a.status === 'absent_excused' || a.status === 'absent_with_leave' || a.status === 'absent_no_leave').length;
    const sPayments = payments.filter((p) => p.studentId === s.id);
    const sPaid = sPayments.filter((p) => p.status === 'paid' || p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const sPending = sPayments.filter((p) => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

    aoa1.push([
      idx + 1,
      s.code,
      s.fullName,
      (s.enrolledSubjects || []).join(', ') || 'Piano',
      sPresent,
      sAbsent,
      sPaid,
      sPending,
      statusMap[s.status] || s.status
    ]);
  });

  aoa1.push([]);
  aoa1.push([
    'TỔNG CỘNG',
    '',
    '',
    `Tổng ${students.length} học viên`,
    '',
    '',
    totalPaid,
    totalPending,
    ''
  ]);
  aoa1.push([`Tổng doanh thu học phí bằng chữ: ${vietnameseNumberToWords(totalPaid + totalPending)}`]);
  aoa1.push([]);
  aoa1.push(['', '', '', '', '', '', '', `......, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}`]);
  aoa1.push(['NGƯỜI LẬP BIỂU', '', 'KẾ TOÁN TRƯỞNG', '', '', '', '', 'ĐẠI DIỆN TRUNG TÂM']);
  aoa1.push(['(Ký, ghi rõ họ tên)', '', '(Ký, ghi rõ họ tên)', '', '', '', '', '(Ký, đóng dấu, ghi rõ họ tên)']);
  aoa1.push([]);
  aoa1.push([]);
  aoa1.push(['Người lập báo cáo', '', accountant, '', '', '', '', director]);

  const ws1 = XLSX.utils.aoa_to_sheet(aoa1);
  ws1['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 25 },
    { wch: 20 },
    { wch: 14 },
    { wch: 16 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Tong_Hop_Hoc_Vien');
  XLSX.writeFile(wb, actualFilename);
};

/**
 * ============================================================================
 * ADMINISTRATIVE CSV EXPORTS
 * ============================================================================
 */

export const exportTuitionToCSV = (
  payments: TuitionPayment[],
  students: Student[],
  filename = 'Danh_Sach_Hoc_Phi.csv'
) => {
  const headers = [
    'Mã Hóa Đơn',
    'Mã Học Viên',
    'Họ Tên Học Viên',
    'Môn Học',
    'Khóa Học',
    'Kỳ Thu',
    'Số Buổi',
    'Số Tiền (VNĐ)',
    'Hạn Nộp',
    'Ngày Nộp',
    'Trạng Thái',
    'Hình Thức',
    'Cú Pháp Chuyển Khoản',
    'Ghi Chú'
  ];

  const rows = payments.map((p) => {
    const student = students.find((s) => s.id === p.studentId);
    const studentName = p.studentName || student?.fullName || '';
    const studentCode = p.studentCode || student?.code || '';

    const statusMap: Record<string, string> = {
      paid: 'Đã thanh toán',
      completed: 'Đã hoàn tất',
      pending: 'Chờ thanh toán',
      overdue: 'Quá hạn'
    };

    return [
      escapeCSV(p.id),
      escapeCSV(studentCode),
      escapeCSV(studentName),
      escapeCSV(p.subjectName || 'Piano'),
      escapeCSV(p.courseName || ''),
      escapeCSV(p.billingMonth || ''),
      escapeCSV(p.sessionsCount || 0),
      escapeCSV(p.amount),
      escapeCSV(p.dueDate || ''),
      escapeCSV(p.paymentDate || ''),
      escapeCSV(statusMap[p.status] || p.status),
      escapeCSV(p.paymentMethod || 'VietQR'),
      escapeCSV(p.transferSyntax || ''),
      escapeCSV(p.invoiceNote || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(csvContent, filename);
};

export const exportAttendanceToCSV = (
  attendance: AttendanceRecord[],
  students: Student[],
  classes: MusicClass[],
  filename = 'Danh_Sach_Diem_Danh.csv'
) => {
  const headers = [
    'Ngày',
    'Mã Học Viên',
    'Họ Tên Học Viên',
    'Lớp Học',
    'Môn Học',
    'Giáo Viên',
    'Trạng Thái',
    'Đánh Giá / Nhận Xét',
    'Ghi Chú'
  ];

  const rows = attendance.map((a) => {
    const student = students.find((s) => s.id === a.studentId);
    const cls = classes.find((c) => c.id === a.classId);

    const studentName = a.studentName || student?.fullName || '';
    const studentCode = student?.code || '';
    const className = a.className || cls?.name || '';
    const subjectName = a.subjectName || cls?.subjectName || cls?.subject || 'Piano';
    const teacherName = cls?.teacherName || a.recordedBy || '';

    return [
      escapeCSV(a.date),
      escapeCSV(studentCode),
      escapeCSV(studentName),
      escapeCSV(className),
      escapeCSV(subjectName),
      escapeCSV(teacherName),
      escapeCSV(formatAttendanceStatus(a.status)),
      escapeCSV(a.evaluation || ''),
      escapeCSV(a.note || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadCSV(csvContent, filename);
};

export const exportCombinedSummaryToCSV = (
  payments: TuitionPayment[],
  attendance: AttendanceRecord[],
  students: Student[],
  classes: MusicClass[],
  filename = 'Bao_Cao_Tong_Hop.csv'
) => {
  const totalPaid = payments.filter((p) => p.status === 'paid' || p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const totalSessions = attendance.length;
  const presentCount = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const absentCount = attendance.filter((a) => a.status === 'absent_excused' || a.status === 'absent_unexcused' || a.status === 'absent_with_leave' || a.status === 'absent_no_leave').length;

  const lines: string[] = [];

  lines.push(`"BÁO CÁO TỔNG HỢP HỌC PHÍ VÀ ĐIỂM DANH TRUNG TÂM ÂM NHẠC"`);
  lines.push(`"Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}"`);
  lines.push(`"Tổng số học viên:","${students.length}"`);
  lines.push(`"Tổng doanh thu học phí đã thu:","${totalPaid.toLocaleString('vi-VN')} VNĐ"`);
  lines.push(`"Tổng công nợ học phí chờ nộp:","${totalPending.toLocaleString('vi-VN')} VNĐ"`);
  lines.push(`"Tổng số lượt điểm danh:","${totalSessions}"`);
  lines.push(`"Lượt có mặt & đi muộn:","${presentCount}"`);
  lines.push(`"Lượt nghỉ phép & vắng:","${absentCount}"`);
  lines.push(`"Tỷ lệ chuyên cần:","${totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : 100}%"`);
  lines.push('');

  lines.push('"1. THỐNG KÊ TỔNG HỢP TỪNG HỌC VIÊN"');
  lines.push([
    'Mã HV',
    'Họ Tên Học Viên',
    'Môn Đăng Ký',
    'Buổi Có Mặt',
    'Buổi Nghỉ/Vắng',
    'Đã Đóng Học Phí',
    'Còn Nợ Học Phí',
    'Trạng Thái Học Tập'
  ].map(h => `"${h}"`).join(','));

  students.forEach((s) => {
    const sAttendance = attendance.filter((a) => a.studentId === s.id);
    const sPresent = sAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    const sAbsent = sAttendance.filter((a) => a.status === 'absent_unexcused' || a.status === 'absent_excused' || a.status === 'absent_with_leave' || a.status === 'absent_no_leave').length;
    const sPayments = payments.filter((p) => p.studentId === s.id);
    const sPaid = sPayments.filter((p) => p.status === 'paid' || p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const sPending = sPayments.filter((p) => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

    const statusMap: Record<string, string> = {
      active: 'Đang học',
      trial: 'Học thử',
      reserved: 'Bảo lưu',
      completed: 'Hoàn thành',
      locked: 'Tạm khóa',
      inactive: 'Nghỉ học'
    };

    lines.push([
      escapeCSV(s.code),
      escapeCSV(s.fullName),
      escapeCSV((s.enrolledSubjects || []).join(', ')),
      escapeCSV(sPresent),
      escapeCSV(sAbsent),
      escapeCSV(sPaid),
      escapeCSV(sPending),
      escapeCSV(statusMap[s.status] || s.status)
    ].join(','));
  });

  lines.push('');
  lines.push('"2. DANH SÁCH CHI TIẾT HÓA ĐƠN HỌC PHÍ"');
  lines.push([
    'Mã HĐ',
    'Mã HV',
    'Họ Tên Học Viên',
    'Môn Học',
    'Kỳ Thu',
    'Số Buổi',
    'Số Tiền',
    'Hạn Nộp',
    'Trạng Thái',
    'Cú Pháp Chuyển Khoản'
  ].map(h => `"${h}"`).join(','));

  payments.forEach((p) => {
    const student = students.find((s) => s.id === p.studentId);
    lines.push([
      escapeCSV(p.id),
      escapeCSV(p.studentCode || student?.code || ''),
      escapeCSV(p.studentName || student?.fullName || ''),
      escapeCSV(p.subjectName || 'Piano'),
      escapeCSV(p.billingMonth || ''),
      escapeCSV(p.sessionsCount || 0),
      escapeCSV(p.amount),
      escapeCSV(p.dueDate || ''),
      escapeCSV(p.status === 'paid' || p.status === 'completed' ? 'Đã thu' : 'Chờ nộp'),
      escapeCSV(p.transferSyntax || '')
    ].join(','));
  });

  const csvContent = lines.join('\r\n');
  downloadCSV(csvContent, filename);
};

/**
 * ============================================================================
 * PRINT & PDF GENERATOR CONFORMING TO VIETNAMESE ADMINISTRATIVE STANDARDS
 * Căn lề chuẩn: Trên: 20mm, Dưới: 20mm, Trái: 25mm, Phải: 15mm.
 * Font chữ: Times New Roman 12–13pt rõ nét.
 * Bảng nét đơn đen: border 1px solid #000, chống vỡ trang giữa dòng.
 * ============================================================================
 */

export interface PrintReportOptions {
  orientation?: 'portrait' | 'landscape';
  reportTitle?: string;
  reportSubtitle?: string;
  formCode?: string; // e.g. "Mẫu số: 01/CNKD (TT 40/2021/TT-BTC)" or "Mẫu số: 01-HP"
  branding?: TenantBranding;
}

export const printReportAsPDF = (
  htmlContent: string,
  title = 'Báo Cáo Trung Tâm Âm Nhạc',
  options?: PrintReportOptions
) => {
  const orientation = options?.orientation || 'portrait';
  const branding = options?.branding;
  const centerName = branding?.centerName || branding?.householdName || branding?.companyName || 'HỆ THỐNG TRUNG TÂM ÂM NHẠC MINH MUSIC';
  const hotline = branding?.hotline || '0901 888 999';
  const address = branding?.householdBusinessAddress || branding?.companyAddress || branding?.address || 'Quận 1, TP. Hồ Chí Minh';
  const taxCode = branding?.householdTaxCode || branding?.companyTaxCode || branding?.centerTaxCode || '8499281902';
  const formCode = options?.formCode || 'Mẫu số chuẩn văn bản hành chính';

  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Trình duyệt đang chặn cửa sổ Popup. Vui lòng cho phép Popup để in hoặc xuất PDF.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4 ${orientation};
          margin: 20mm 15mm 20mm 25mm; /* Trên: 20mm, Phải: 15mm, Dưới: 20mm, Trái: 25mm */
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        body {
          font-family: 'Times New Roman', Times, serif, system-ui;
          color: #000000;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 12pt;
          line-height: 1.45;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #000000;
          padding-bottom: 10px;
          margin-bottom: 16px;
        }
        .brand-block {
          width: 58%;
        }
        .brand-title {
          font-size: 11.5pt;
          font-weight: bold;
          color: #000000;
          margin: 0 0 3px 0;
          text-transform: uppercase;
        }
        .brand-sub {
          font-size: 9.5pt;
          color: #222222;
          margin: 1px 0;
        }
        .national-block {
          width: 40%;
          text-align: center;
        }
        .national-title {
          font-size: 10pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0 0 2px 0;
        }
        .national-motto {
          font-size: 9.5pt;
          font-weight: bold;
          margin: 0 0 2px 0;
        }
        .motto-line {
          width: 120px;
          height: 1px;
          background: #000000;
          margin: 3px auto 4px auto;
        }
        .form-code {
          font-size: 8.5pt;
          font-style: italic;
          color: #333333;
        }
        .report-title-section {
          text-align: center;
          margin: 16px 0 14px 0;
        }
        .report-title-section h1 {
          font-size: 15pt;
          font-weight: bold;
          color: #000000;
          margin: 0 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .report-title-section p {
          font-size: 10.5pt;
          font-style: italic;
          color: #333333;
          margin: 0;
        }
        .metrics-summary-box {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
          background: #f8fafc;
          border: 1px solid #000000;
          padding: 8px 12px;
        }
        .metric-item {
          text-align: center;
        }
        .metric-label {
          font-size: 9pt;
          color: #444444;
          font-weight: bold;
          text-transform: uppercase;
        }
        .metric-val {
          font-size: 12.5pt;
          font-weight: bold;
          color: #000000;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0 16px 0;
          font-size: 10.5pt;
          page-break-inside: auto;
        }
        thead {
          display: table-header-group;
        }
        tfoot {
          display: table-footer-group;
        }
        tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        th, td {
          border: 1px solid #000000;
          padding: 5px 7px;
          color: #000000;
        }
        th {
          background-color: #f2f2f2;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          font-size: 9.5pt;
        }
        .text-left { text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .bg-total {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        .words-line {
          font-size: 10.5pt;
          font-style: italic;
          margin: 8px 0 16px 0;
        }
        .signature-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 24px;
          page-break-inside: avoid;
          break-inside: avoid;
          text-align: center;
        }
        .sig-block {
          text-align: center;
        }
        .sig-title {
          font-weight: bold;
          font-size: 10.5pt;
          color: #000000;
          text-transform: uppercase;
        }
        .sig-note {
          font-size: 9pt;
          color: #444444;
          font-style: italic;
          margin-top: 2px;
        }
        .sig-space {
          height: 65px;
        }
        .sig-name {
          font-weight: bold;
          font-size: 10.5pt;
        }
        .date-right {
          text-align: right;
          font-size: 10.5pt;
          font-style: italic;
          margin-bottom: 8px;
        }
        .footer-note {
          margin-top: 20px;
          padding-top: 8px;
          border-top: 1px dashed #666666;
          font-size: 8.5pt;
          color: #555555;
          text-align: center;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="admin-header">
        <div class="brand-block">
          <div class="brand-title">${centerName}</div>
          <div class="brand-sub">Mã số thuế: <strong>${taxCode}</strong> | Hotline: ${hotline}</div>
          <div class="brand-sub">Địa chỉ: ${address}</div>
        </div>
        <div class="national-block">
          <div class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div class="national-motto">Độc lập - Tự do - Hạnh phúc</div>
          <div class="motto-line"></div>
          <div class="form-code">${formCode}</div>
        </div>
      </div>

      ${htmlContent}

      <script>
        window.onload = function() {
          window.focus();
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};
