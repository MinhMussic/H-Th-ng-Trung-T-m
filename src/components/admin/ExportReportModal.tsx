import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Calendar,
  CheckCircle2,
  Filter,
  DollarSign,
  CheckSquare,
  BarChart3,
  Layers,
  Sparkles,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import {
  exportTuitionToExcel,
  exportAttendanceToExcel,
  exportCombinedSummaryToExcel,
  exportTuitionToCSV,
  exportAttendanceToCSV,
  exportCombinedSummaryToCSV,
  printReportAsPDF,
  formatAttendanceStatus
} from '../../utils/exportReports';
import { vietnameseNumberToWords } from '../../utils/taxCompliance';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'tuition' | 'attendance' | 'combined';
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'combined'
}) => {
  const { tuitionPayments, attendance, students, classes, branding } = useData();

  const [reportType, setReportType] = useState<'tuition' | 'attendance' | 'combined'>(defaultType);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'paid' | 'completed' | 'pending' | 'overdue'>('ALL');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [showPreview, setShowPreview] = useState<boolean>(true);

  if (!isOpen) return null;

  // Filter tuition payments
  const filteredTuition = tuitionPayments.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  // Filter attendance records
  const filteredAttendance = attendance.filter((a) => {
    if (attendanceStatusFilter !== 'ALL' && a.status !== attendanceStatusFilter) return false;
    if (selectedClassId !== 'ALL' && a.classId !== selectedClassId) return false;
    return true;
  });

  // Summary Metrics
  const totalPaid = filteredTuition.reduce((sum, p) => sum + (p.status === 'paid' || p.status === 'completed' ? p.amount : 0), 0);
  const totalPending = filteredTuition.reduce((sum, p) => sum + (p.status === 'pending' || p.status === 'overdue' ? p.amount : 0), 0);
  const totalAmount = totalPaid + totalPending;
  const totalInvoices = filteredTuition.length;

  const totalSessions = filteredAttendance.length;
  const presentCount = filteredAttendance.filter((a) => a.status === 'present').length;
  const excusedCount = filteredAttendance.filter((a) => a.status === 'absent_excused' || a.status === 'absent_with_leave').length;
  const unexcusedCount = filteredAttendance.filter((a) => a.status === 'absent_unexcused' || a.status === 'absent_no_leave').length;
  const lateCount = filteredAttendance.filter((a) => a.status === 'late').length;

  const attendanceRate = totalSessions > 0 ? (((presentCount + lateCount) / totalSessions) * 100).toFixed(1) : '100';

  const centerName = branding.centerName || branding.householdName || branding.companyName || 'HỆ THỐNG TRUNG TÂM ÂM NHẠC MINH MUSIC';
  const taxCode = branding.householdTaxCode || branding.companyTaxCode || branding.centerTaxCode || '8499281902';
  const address = branding.householdBusinessAddress || branding.companyAddress || branding.address || 'Quận 1, TP. Hồ Chí Minh';
  const hotline = branding.hotline || '0901 888 999';
  const director = branding.legalRepresentative || branding.householdOwner || 'Nguyễn Văn Minh';
  const accountant = branding.chiefAccountant || 'Trần Thị Thu Thủy';
  const dateStr = new Date().toLocaleDateString('vi-VN');

  // Excel (.xlsx) handler
  const handleExportExcel = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (reportType === 'tuition') {
      exportTuitionToExcel(filteredTuition, students, branding, `Bao_Cao_Hoc_Phi_${timestamp}.xlsx`);
    } else if (reportType === 'attendance') {
      exportAttendanceToExcel(filteredAttendance, students, classes, branding, `Bao_Cao_Diem_Danh_${timestamp}.xlsx`);
    } else {
      exportCombinedSummaryToExcel(filteredTuition, filteredAttendance, students, classes, branding, `Bao_Cao_Tong_Hop_${timestamp}.xlsx`);
    }
  };

  // CSV handler
  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (reportType === 'tuition') {
      exportTuitionToCSV(filteredTuition, students, `Bao_Cao_Hoc_Phi_${timestamp}.csv`);
    } else if (reportType === 'attendance') {
      exportAttendanceToCSV(filteredAttendance, students, classes, `Bao_Cao_Diem_Danh_${timestamp}.csv`);
    } else {
      exportCombinedSummaryToCSV(filteredTuition, filteredAttendance, students, classes, `Bao_Cao_Tong_Hop_${timestamp}.csv`);
    }
  };

  // PDF Print handler
  const handlePrintPDF = () => {
    let reportTitle = '';
    let formCode = '';
    let bodyHtml = '';

    if (reportType === 'tuition') {
      reportTitle = 'BẢNG TỔNG HỢP & THEO DÕI THU HỌC PHÍ';
      formCode = 'Mẫu số: 01-HP (Chuẩn nội bộ)';
      bodyHtml = `
        <div class="report-title-section">
          <h1>${reportTitle}</h1>
          <p>Kỳ báo cáo: Năm ${new Date().getFullYear()} • Ngày lập: ${dateStr}</p>
        </div>

        <div class="metrics-summary-box">
          <div class="metric-item">
            <div class="metric-label">Tổng Hóa Đơn</div>
            <div class="metric-val">${totalInvoices}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Đã Thu Hoàn Tất</div>
            <div class="metric-val" style="color:#15803d;">${totalPaid.toLocaleString('vi-VN')} đ</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Công Nợ Chờ Thu</div>
            <div class="metric-val" style="color:#b45309;">${totalPending.toLocaleString('vi-VN')} đ</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Tỷ Lệ Tất Toán</div>
            <div class="metric-val">${totalInvoices > 0 ? (((filteredTuition.filter(p => p.status === 'paid' || p.status === 'completed').length) / totalInvoices) * 100).toFixed(0) : 0}%</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px;">STT</th>
              <th>Mã HĐ</th>
              <th>Mã HV</th>
              <th>Họ Tên Học Viên</th>
              <th>Môn Học</th>
              <th>Kỳ Thu</th>
              <th>Số Tiền (VNĐ)</th>
              <th>Hạn Nộp</th>
              <th>Trạng Thái</th>
              <th>Ghi Chú</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTuition.map((p, idx) => {
              const student = students.find((s) => s.id === p.studentId);
              const isPaid = p.status === 'paid' || p.status === 'completed';
              return `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td class="text-center font-bold">${p.id}</td>
                  <td class="text-center">${p.studentCode || student?.code || '-'}</td>
                  <td><strong>${p.studentName || student?.fullName}</strong></td>
                  <td>${p.subjectName || 'Piano'}</td>
                  <td class="text-center">${p.billingMonth || '-'}</td>
                  <td class="text-right font-bold">${p.amount.toLocaleString('vi-VN')} đ</td>
                  <td class="text-center">${p.dueDate || '-'}</td>
                  <td class="text-center font-bold" style="color: ${isPaid ? '#15803d' : '#b45309'};">${isPaid ? 'Đã thu' : 'Chờ nộp'}</td>
                  <td>${p.invoiceNote || '-'}</td>
                </tr>
              `;
            }).join('')}
            <tr class="bg-total">
              <td colspan="6" class="text-center font-bold">TỔNG CỘNG HỌC PHÍ PHÁT SINH</td>
              <td class="text-right font-bold">${totalAmount.toLocaleString('vi-VN')} đ</td>
              <td colspan="3" class="text-center font-bold">Đã thu: ${totalPaid.toLocaleString('vi-VN')} đ | Còn nợ: ${totalPending.toLocaleString('vi-VN')} đ</td>
            </tr>
          </tbody>
        </table>

        <div class="words-line">
          Số tiền bằng chữ: <strong>${vietnameseNumberToWords(totalAmount)}</strong>
        </div>

        <div class="date-right">
          ......, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}
        </div>

        <div class="signature-section">
          <div class="sig-block">
            <div class="sig-title">NGƯỜI LẬP BIỂU</div>
            <div class="sig-note">(Ký, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">Người lập báo cáo</div>
          </div>
          <div class="sig-block">
            <div class="sig-title">KẾ TOÁN TRƯỞNG / THU QUỸ</div>
            <div class="sig-note">(Ký, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">${accountant}</div>
          </div>
          <div class="sig-block">
            <div class="sig-title">ĐẠI DIỆN TRUNG TÂM / CHỦ HỘ</div>
            <div class="sig-note">(Ký, đóng dấu, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">${director}</div>
          </div>
        </div>

        <div class="footer-note">
          Trích xuất từ Hệ thống Quản trị Trung tâm Âm nhạc ${centerName} • In lúc ${new Date().toLocaleTimeString('vi-VN')} - ${dateStr}
        </div>
      `;
    } else if (reportType === 'attendance') {
      reportTitle = 'BẢNG TỔNG HỢP ĐIỂM DANH & THEO DÕI CHUYÊN CẦN';
      formCode = 'Mẫu số: 02-DD (Theo dõi chuyên cần)';
      bodyHtml = `
        <div class="report-title-section">
          <h1>${reportTitle}</h1>
          <p>Kỳ theo dõi: Năm ${new Date().getFullYear()} • Ngày lập: ${dateStr}</p>
        </div>

        <div class="metrics-summary-box">
          <div class="metric-item">
            <div class="metric-label">Tổng Lượt Điểm Danh</div>
            <div class="metric-val">${totalSessions}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Tỷ Lệ Chuyên Cần</div>
            <div class="metric-val" style="color:#15803d;">${attendanceRate}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Có Mặt / Đi Muộn</div>
            <div class="metric-val" style="color:#2563eb;">${presentCount} / ${lateCount}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Nghỉ Phép / Vắng</div>
            <div class="metric-val" style="color:#dc2626;">${excusedCount} / ${unexcusedCount}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px;">STT</th>
              <th>Ngày Học</th>
              <th>Mã HV</th>
              <th>Họ Tên Học Viên</th>
              <th>Lớp Học</th>
              <th>Môn Học</th>
              <th>Trạng Thái</th>
              <th>Đánh Giá / Nhận Xét</th>
              <th>Ghi Chú</th>
            </tr>
          </thead>
          <tbody>
            ${filteredAttendance.map((a, idx) => {
              const student = students.find((s) => s.id === a.studentId);
              const cls = classes.find((c) => c.id === a.classId);
              return `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td class="text-center">${a.date}</td>
                  <td class="text-center">${student?.code || '-'}</td>
                  <td><strong>${a.studentName || student?.fullName}</strong></td>
                  <td>${a.className || cls?.name || 'Lớp học'}</td>
                  <td>${a.subjectName || cls?.subjectName || 'Piano'}</td>
                  <td class="text-center font-bold">${formatAttendanceStatus(a.status)}</td>
                  <td>${a.evaluation || '-'}</td>
                  <td>${a.note || '-'}</td>
                </tr>
              `;
            }).join('')}
            <tr class="bg-total">
              <td colspan="6" class="text-center font-bold">TỔNG LƯỢT ĐIỂM DANH: ${totalSessions} BUỔI</td>
              <td colspan="3" class="text-center font-bold">Tỷ lệ chuyên cần chung: ${attendanceRate}%</td>
            </tr>
          </tbody>
        </table>

        <div class="date-right">
          ......, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}
        </div>

        <div class="signature-section">
          <div class="sig-block">
            <div class="sig-title">GIÁO VỤ / ĐIỂM DANH</div>
            <div class="sig-note">(Ký, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">Người lập báo cáo</div>
          </div>
          <div class="sig-block">
            <div class="sig-title">GIÁO VIÊN BỘ MÔN</div>
            <div class="sig-note">(Ký, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">Giáo viên phụ trách</div>
          </div>
          <div class="sig-block">
            <div class="sig-title">ĐẠI DIỆN TRUNG TÂM</div>
            <div class="sig-note">(Ký, đóng dấu, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">${director}</div>
          </div>
        </div>

        <div class="footer-note">
          Hệ thống Quản lý Đào tạo Âm nhạc ${centerName} • In ngày ${dateStr}
        </div>
      `;
    } else {
      reportTitle = 'BÁO CÁO TỔNG HỢP HỌC VIÊN, HỌC PHÍ & CHUYÊN CẦN';
      formCode = 'Mẫu số: 03-TH (Báo cáo tổng hợp)';
      bodyHtml = `
        <div class="report-title-section">
          <h1>${reportTitle}</h1>
          <p>Kỳ báo cáo: Toàn diện • Ngày lập: ${dateStr}</p>
        </div>

        <div class="metrics-summary-box">
          <div class="metric-item">
            <div class="metric-label">Học Phí Đã Thu</div>
            <div class="metric-val" style="color:#15803d;">${totalPaid.toLocaleString('vi-VN')} đ</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Công Nợ Chờ Thu</div>
            <div class="metric-val" style="color:#b45309;">${totalPending.toLocaleString('vi-VN')} đ</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Tổng Học Viên</div>
            <div class="metric-val">${students.length} học viên</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Tỷ Lệ Chuyên Cần</div>
            <div class="metric-val" style="color:#2563eb;">${attendanceRate}%</div>
          </div>
        </div>

        <div style="font-weight: bold; margin: 12px 0 6px 0; font-size: 11pt;">I. BẢNG TỔNG HỢP TÌNH HÌNH TỪNG HỌC VIÊN:</div>
        <table>
          <thead>
            <tr>
              <th style="width: 35px;">STT</th>
              <th>Mã HV</th>
              <th>Họ Tên Học Viên</th>
              <th>Môn Đăng Ký</th>
              <th>Buổi Có Mặt</th>
              <th>Buổi Vắng</th>
              <th>Đã Đóng HP (VNĐ)</th>
              <th>Công Nợ (VNĐ)</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            ${students.map((s, idx) => {
              const sAttendance = attendance.filter((a) => a.studentId === s.id);
              const sPresent = sAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
              const sAbsent = sAttendance.filter((a) => a.status === 'absent_unexcused' || a.status === 'absent_excused' || a.status === 'absent_with_leave' || a.status === 'absent_no_leave').length;
              const sPayments = tuitionPayments.filter((p) => p.studentId === s.id);
              const sPaid = sPayments.filter((p) => p.status === 'paid' || p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
              const sPending = sPayments.filter((p) => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

              const statusText = s.status === 'active' ? 'Đang học' : s.status === 'trial' ? 'Học thử' : s.status === 'reserved' ? 'Bảo lưu' : 'Tạm khóa';

              return `
                <tr>
                  <td class="text-center">${idx + 1}</td>
                  <td class="text-center font-bold">${s.code}</td>
                  <td><strong>${s.fullName}</strong></td>
                  <td>${(s.enrolledSubjects || []).join(', ') || 'Piano'}</td>
                  <td class="text-center font-bold" style="color:#15803d;">${sPresent} buổi</td>
                  <td class="text-center" style="color:#b91c1c;">${sAbsent} buổi</td>
                  <td class="text-right font-bold">${sPaid.toLocaleString('vi-VN')} đ</td>
                  <td class="text-right font-bold" style="color:${sPending > 0 ? '#b45309' : '#000000'};">${sPending > 0 ? sPending.toLocaleString('vi-VN') + ' đ' : '0 đ'}</td>
                  <td class="text-center">${statusText}</td>
                </tr>
              `;
            }).join('')}
            <tr class="bg-total">
              <td colspan="6" class="text-center font-bold">TỔNG CỘNG DOANH THU HỌC PHÍ</td>
              <td class="text-right font-bold">${totalPaid.toLocaleString('vi-VN')} đ</td>
              <td class="text-right font-bold">${totalPending.toLocaleString('vi-VN')} đ</td>
              <td class="text-center font-bold">${students.length} HV</td>
            </tr>
          </tbody>
        </table>

        <div class="words-line">
          Tổng số tiền học phí bằng chữ: <strong>${vietnameseNumberToWords(totalAmount)}</strong>
        </div>

        <div class="date-right">
          ......, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}
        </div>

        <div class="signature-section">
          <div class="sig-block">
            <div class="sig-title">NGƯỜI LẬP BIỂU</div>
            <div class="sig-note">(Ký, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">Người lập báo cáo</div>
          </div>
          <div class="sig-block">
            <div class="sig-title">KẾ TOÁN TRƯỞNG</div>
            <div class="sig-note">(Ký, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">${accountant}</div>
          </div>
          <div class="sig-block">
            <div class="sig-title">GIÁM ĐỐC / ĐẠI DIỆN TRUNG TÂM</div>
            <div class="sig-note">(Ký, đóng dấu, ghi rõ họ tên)</div>
            <div class="sig-space"></div>
            <div class="sig-name">${director}</div>
          </div>
        </div>

        <div class="footer-note">
          Báo cáo quản trị trung tâm ${centerName} • Trích xuất ngày ${dateStr}
        </div>
      `;
    }

    printReportAsPDF(bodyHtml, `${reportTitle} - ${centerName}`, {
      orientation,
      formCode,
      branding
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-md shadow-amber-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                Xuất Báo Cáo & In Chuẩn Văn Bản Hành Chính
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Chuẩn A4 (TT 40/2021 & TT 80)
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hỗ trợ Xuất Excel (.xlsx có merge tiêu đề), CSV (UTF-8 BOM), và In trực tiếp A4 Dọc/Ngang không vỡ bảng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. Chọn loại báo cáo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              1. Chọn Loại Biểu Mẫu Báo Cáo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setReportType('combined')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  reportType === 'combined'
                    ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 ring-2 ring-amber-400/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Layers className={`w-4 h-4 ${reportType === 'combined' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Báo Cáo Tổng Hợp</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Học phí + Chuyên cần từng học viên</p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('tuition')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  reportType === 'tuition'
                    ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-400/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className={`w-4 h-4 ${reportType === 'tuition' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Bảng Kê Thu Học Phí</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{filteredTuition.length} hóa đơn & công nợ</p>
              </button>

              <button
                type="button"
                onClick={() => setReportType('attendance')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  reportType === 'attendance'
                    ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-400/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckSquare className={`w-4 h-4 ${reportType === 'attendance' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 dark:text-white">Bảng Kê Điểm Danh</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{filteredAttendance.length} lượt nhật ký chuyên cần</p>
              </button>
            </div>
          </div>

          {/* 2. Tùy chọn In & Căn lề khổ giấy */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Tùy Chọn Khổ Giấy & Bộ Lọc Dữ Liệu:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Khổ in A4:</span>
                <div className="inline-flex rounded-xl bg-slate-200/70 dark:bg-slate-700/60 p-0.5">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      orientation === 'portrait'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    A4 Dọc (Portrait)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      orientation === 'landscape'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    A4 Ngang (Landscape)
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {reportType === 'tuition' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Lọc theo trạng thái hóa đơn:
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="ALL">Tất cả trạng thái (Đã thu & Chờ nộp)</option>
                    <option value="paid">Chỉ hóa đơn đã thanh toán (Paid)</option>
                    <option value="pending">Chỉ hóa đơn đang chờ nộp (Pending)</option>
                    <option value="overdue">Chỉ hóa đơn quá hạn (Overdue)</option>
                  </select>
                </div>
              )}

              {reportType === 'attendance' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Lọc theo lớp học:
                    </label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    >
                      <option value="ALL">Tất cả các lớp học</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.subject || c.subjectName || 'Piano'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      Trạng thái chuyên cần:
                    </label>
                    <select
                      value={attendanceStatusFilter}
                      onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    >
                      <option value="ALL">Tất cả trạng thái</option>
                      <option value="present">Chỉ các buổi Có mặt (Present)</option>
                      <option value="absent_excused">Nghỉ phép có lý do (Excused)</option>
                      <option value="absent_unexcused">Vắng không phép (Unexcused)</option>
                      <option value="late">Đi muộn (Late)</option>
                    </select>
                  </div>
                </>
              )}

              {reportType === 'combined' && (
                <div className="col-span-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  ✓ Báo cáo tổng hợp bao gồm <strong>{students.length} học viên</strong>,{' '}
                  <strong>{filteredTuition.length} hóa đơn học phí</strong> và{' '}
                  <strong>{filteredAttendance.length} lượt điểm danh</strong> với chữ ký 3 bên theo chuẩn văn bản hành chính.
                </div>
              )}
            </div>
          </div>

          {/* 3. Tóm tắt số liệu & Chuẩn văn bản hành chính */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Tóm tắt chỉ tiêu biểu mẫu:
              </p>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                Căn lề chuẩn: Trên 20mm, Dưới 20mm, Trái 25mm, Phải 15mm
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-amber-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-500">Đã thu học phí</p>
                <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">{totalPaid.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-amber-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-500">Công nợ chờ nộp</p>
                <p className="text-sm font-black text-amber-700 dark:text-amber-400">{totalPending.toLocaleString('vi-VN')} đ</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-amber-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-500">Tổng lượt điểm danh</p>
                <p className="text-sm font-black text-indigo-700 dark:text-indigo-400">{totalSessions}</p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-amber-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-500">Tỷ lệ chuyên cần</p>
                <p className="text-sm font-black text-blue-700 dark:text-blue-400">{attendanceRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Export Excel Button (.xlsx) */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>XUẤT FILE EXCEL (.XLSX)</span>
            </button>

            {/* Export CSV Button (.csv) */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl border border-emerald-600/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV (UTF-8)</span>
            </button>

            {/* Print Standard A4 PDF Button */}
            <button
              type="button"
              onClick={handlePrintPDF}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/25 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>IN BÁO CÁO A4 (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
