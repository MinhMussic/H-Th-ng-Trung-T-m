import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound, AMBIENT_TRACKS, SoundTheme } from '../../context/SoundContext';
import { TuitionPayment, NotificationItem, BankAccountConfig } from '../../types';
import { BrandingConfigPanel } from './BrandingConfigPanel';
import { BranchesAndMapManagement } from './BranchesAndMapManagement';
import { HolidayConfigPanel } from './HolidayConfigPanel';
import { ExportReportModal } from './ExportReportModal';
import { TaxRevenueReportModal } from './TaxRevenueReportModal';
import { OverdueNotificationModal } from './finance/OverdueNotificationModal';
import { FactoryResetModal } from './FactoryResetModal';
import {
  exportTuitionToCSV,
  exportAttendanceToCSV,
  exportCombinedSummaryToCSV
} from '../../utils/exportReports';
import {
  CreditCard,
  Bell,
  BarChart3,
  FileSpreadsheet,
  MapPin,
  Settings,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  QrCode,
  Share2,
  Sparkles,
  ExternalLink,
  Send,
  Building,
  RefreshCw,
  Palette,
  Sun,
  Moon,
  Monitor,
  Eye,
  Copy,
  Download,
  Upload,
  Check,
  AlertCircle,
  FileText,
  DollarSign,
  HelpCircle,
  X,
  Music,
  MousePointerClick,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Disc3,
  Printer,
  Layers,
  CheckSquare,
  TrendingUp,
  Users,
  School,
  Palmtree,
  Receipt,
  FileCheck2,
  Banknote,
  ShieldAlert,
  Trash2,
  Database,
  RotateCcw
} from 'lucide-react';

interface FinanceAndSettingsProps {
  initialSubTab?: 'tuition' | 'bank_qr_config' | 'holidays' | 'notifications' | 'reports' | 'tax_report' | 'sheets_sync' | 'branding' | 'branches_map' | 'settings';
}

export const FinanceAndSettings: React.FC<FinanceAndSettingsProps> = ({ initialSubTab = 'tuition' }) => {
  const {
    tuitionPayments,
    addTuitionPayment,
    updateTuitionStatus,
    notifications,
    addNotification,
    students,
    teachers,
    subjects,
    courses,
    classes,
    attendance,
    branding,
    holidays,
    updateBankAccount,
    generateQrUrlForPayment,
    formatTransferContent
  } = useData();
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const {
    isSoundEnabled,
    toggleSound,
    soundVolume,
    setSoundVolume,
    soundTheme,
    setSoundTheme,
    playSuccessSound,
    isMusicPlaying,
    toggleMusic,
    musicVolume,
    setMusicVolume,
    currentTrackId,
    setCurrentTrackId,
    currentTrack,
    allTracks
  } = useSound();

  const [activeTab, setActiveTab] = useState<'tuition' | 'bank_qr_config' | 'holidays' | 'notifications' | 'reports' | 'tax_report' | 'sheets_sync' | 'branding' | 'branches_map' | 'settings'>(initialSubTab);

  // Sync tab and reset sub-state when initialSubTab changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
      setIsExportModalOpen(false);
      setIsTaxReportModalOpen(false);
      setIsOverdueModalOpen(false);
      setSelectedPaymentForQR(null);
      setTuitionSearch('');
      setTuitionStatusFilter('ALL');
    }
  }, [initialSubTab]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDefaultType, setExportDefaultType] = useState<'tuition' | 'attendance' | 'combined'>('combined');

  // Tax Revenue Report Modal State
  const [isTaxReportModalOpen, setIsTaxReportModalOpen] = useState(false);

  // Overdue Tuition Notification System Modal State
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);

  // Factory Reset Modal State
  const [isFactoryResetModalOpen, setIsFactoryResetModalOpen] = useState(false);

  // Search & Filter for Tuition
  const [tuitionSearch, setTuitionSearch] = useState('');
  const [tuitionStatusFilter, setTuitionStatusFilter] = useState<'ALL' | 'pending' | 'paid' | 'overdue'>('ALL');

  // QR Modal State
  const [selectedPaymentForQR, setSelectedPaymentForQR] = useState<TuitionPayment | null>(null);

  // Bank & QR Config Draft State
  const bankConfig: BankAccountConfig = branding.bankAccount || {
    bankId: 'MBBank',
    bankName: 'MBBank - Ngân hàng Quân Đội',
    bankCode: '970422',
    accountNumber: '0901888999',
    accountHolder: 'TRUNG TAM AM NHAC MINH MUSIC',
    memoFormat: 'CODE_SUBJECT_MONTH',
    useCustomQr: false,
    customQrUrl: ''
  };

  const [bankId, setBankId] = useState(bankConfig.bankId || 'MBBank');
  const [accountNumber, setAccountNumber] = useState(bankConfig.accountNumber || '0901888999');
  const [accountHolder, setAccountHolder] = useState(bankConfig.accountHolder || 'TRUNG TAM AM NHAC MINH MUSIC');
  const [memoFormat, setMemoFormat] = useState<'CODE_SUBJECT_MONTH' | 'NAME_SUBJECT_MONTH'>(bankConfig.memoFormat || 'CODE_SUBJECT_MONTH');
  const [useCustomQr, setUseCustomQr] = useState(bankConfig.useCustomQr || false);
  const [customQrUrl, setCustomQrUrl] = useState(bankConfig.customQrUrl || '');
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  // Create Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [subjectName, setSubjectName] = useState(subjects[0]?.name || 'Piano');
  const [courseName, setCourseName] = useState(courses[0]?.name || 'Khóa học chính thức');
  const [amount, setAmount] = useState<number>(3600000);
  const [billingMonth, setBillingMonth] = useState(`Tháng ${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`);
  const [sessionsCount, setSessionsCount] = useState<number>(12);
  const [invoiceNote, setInvoiceNote] = useState('');

  // Create Notification Modal State
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [notifAudience, setNotifAudience] = useState<'ALL' | 'TEACHER' | 'STUDENT' | 'PARENT'>('ALL');
  const [notifType, setNotifType] = useState<'general' | 'tuition' | 'event' | 'schedule'>('general');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Đã sao chép ${fieldName}: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveBankConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const bankListMap: Record<string, string> = {
      'MBBank': 'MBBank - Ngân hàng Quân Đội',
      'VCB': 'Vietcombank - Ngân hàng Ngoại thương Việt Nam',
      'TCB': 'Techcombank - Ngân hàng Kỹ thương Việt Nam',
      'VPB': 'VPBank - Ngân hàng Việt Nam Thịnh Vượng',
      'ACB': 'ACB - Ngân hàng Á Châu',
      'BIDV': 'BIDV - Ngân hàng Đầu tư & Phát triển Việt Nam',
      'CTG': 'VietinBank - Ngân hàng Công thương Việt Nam',
      'TPB': 'TPBank - Ngân hàng Tiên Phong',
      'VIB': 'VIB - Ngân hàng Quốc tế',
      'STB': 'Sacombank - Ngân hàng Sài Gòn Thương Tín'
    };

    updateBankAccount({
      bankId,
      bankName: bankListMap[bankId] || bankId,
      accountNumber,
      accountHolder: accountHolder.toUpperCase(),
      memoFormat,
      useCustomQr,
      customQrUrl
    });
    showToast('Đã lưu cấu hình tài khoản ngân hàng & QR chuyển khoản thành công!');
  };

  const handleCustomQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomQrUrl(reader.result);
        setUseCustomQr(true);
        showToast('Đã tải lên mã QR ngân hàng của trung tâm thành công!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const studentCodeOrName = memoFormat === 'NAME_SUBJECT_MONTH' ? student.fullName : (student.code || student.fullName);
    const syntax = formatTransferContent(studentCodeOrName, subjectName, billingMonth);

    addTuitionPayment({
      code: `HP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      studentId,
      studentCode: student.code,
      studentName: student.fullName,
      subjectName,
      courseName,
      amount,
      paidAmount: 0,
      billingMonth,
      sessionsCount,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      paymentMethod: 'VietQR',
      transferSyntax: syntax,
      invoiceNote: invoiceNote || `Học phí môn ${subjectName} ${billingMonth}`
    });

    setIsPaymentModalOpen(false);
    showToast(`Đã tạo hóa đơn học phí cho học viên ${student.fullName} (Cú pháp: ${syntax})`);
  };

  const handleSendNotification = () => {
    if (!notifTitle.trim() || !notifContent.trim()) {
      showToast('Vui lòng nhập Tiêu đề và Nội dung thông báo!');
      return;
    }

    addNotification({
      title: notifTitle,
      content: notifContent,
      targetAudience: notifAudience,
      type: notifType
    });

    setIsNotifModalOpen(false);
    setNotifTitle('');
    setNotifContent('');
    showToast('Đã phát thông báo toàn hệ thống thành công!');
  };

  const filteredPayments = tuitionPayments.filter(p => {
    if (tuitionStatusFilter !== 'ALL' && p.status !== tuitionStatusFilter) return false;
    if (tuitionSearch.trim() !== '') {
      const q = tuitionSearch.toLowerCase();
      return (
        (p.studentName || '').toLowerCase().includes(q) ||
        (p.studentCode || '').toLowerCase().includes(q) ||
        (p.subjectName || '').toLowerCase().includes(q) ||
        (p.billingMonth || '').toLowerCase().includes(q) ||
        (p.transferSyntax || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalTuitionRevenue = tuitionPayments
    .filter(p => p.status === 'paid')
    .reduce((acc, cur) => acc + (cur.amount || 0), 0);

  const pendingTuitionRevenue = tuitionPayments
    .filter(p => p.status === 'pending')
    .reduce((acc, cur) => acc + (cur.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="w-full lg:w-auto lg:max-w-md xl:max-w-xl min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-300/40 dark:border-amber-700/40 shrink-0">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight break-words leading-snug">
                Tài Chính, Thu Phí VietQR & Hệ Thống
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                Quản lý hóa đơn học phí, cấu hình mã QR chuyển khoản chuẩn cú pháp, phát tin thông báo và chia sẻ phân quyền.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end gap-2 w-full lg:w-auto shrink-0 min-w-0">
          <button
            onClick={() => setIsTaxReportModalOpen(true)}
            className="col-span-1 lg:w-auto px-3 sm:px-3.5 py-2.5 min-h-[40px] bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer text-center"
            title="Báo cáo Doanh thu & Kê khai nghĩa vụ thuế chuẩn (Mẫu 01/BK-DNT, Xuất Excel/PDF)"
          >
            <Receipt className="w-3.5 h-3.5 text-sky-200 shrink-0" />
            <span className="truncate">Kê khai thuế</span>
          </button>

          <button
            onClick={() => {
              setExportDefaultType(activeTab === 'tuition' ? 'tuition' : 'combined');
              setIsExportModalOpen(true);
            }}
            className="col-span-1 lg:w-auto px-3 sm:px-3.5 py-2.5 min-h-[40px] bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs text-center"
            title="Xuất dữ liệu học phí và điểm danh sang CSV Excel hoặc in PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Xuất báo cáo</span>
          </button>

          <button
            onClick={() => setActiveTab('bank_qr_config')}
            className="col-span-1 lg:w-auto px-3 sm:px-3.5 py-2.5 min-h-[40px] bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">Cấu hình QR</span>
          </button>

          {activeTab === 'tuition' ? (
            <>
              <button
                type="button"
                onClick={() => setIsOverdueModalOpen(true)}
                className="col-span-1 lg:w-auto px-3 sm:px-3.5 py-2.5 min-h-[40px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer text-center"
              >
                <Bell className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                <span className="truncate">Nhắc phí tự động</span>
              </button>

              <button
                onClick={() => {
                  const s = students[0];
                  if (s) {
                    setStudentId(s.id);
                    setSubjectName(s.enrolledSubjects?.[0] || subjects[0]?.name || 'Piano');
                  }
                  setIsPaymentModalOpen(true);
                }}
                className="col-span-2 lg:col-span-1 lg:w-auto px-4 py-2.5 min-h-[40px] bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer text-center"
              >
                <Plus className="w-4 h-4 stroke-[3] shrink-0" />
                <span>+ Tạo hóa đơn</span>
              </button>
            </>
          ) : activeTab === 'notifications' ? (
            <>
              <button
                type="button"
                onClick={() => setIsOverdueModalOpen(true)}
                className="col-span-1 lg:w-auto px-3 sm:px-3.5 py-2.5 min-h-[40px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 shadow-xs cursor-pointer transition-all text-center"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Mẫu nhắc phí</span>
              </button>

              <button
                onClick={() => setIsNotifModalOpen(true)}
                className="col-span-2 lg:col-span-1 lg:w-auto px-4 py-2.5 min-h-[40px] bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer transition-all text-center"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>Gửi thông báo</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* Sub Tabs - Natural Scrolling Toolbar with Horizontal Swiping on Mobile */}
      <div className="relative py-2 flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-200/70 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-x-auto no-scrollbar flex-nowrap max-w-full">
          <button
            onClick={() => setActiveTab('tuition')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'tuition' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Học Phí ({tuitionPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bank_qr_config')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'bank_qr_config' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Cấu hình QR</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'notifications' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Thông Báo ({notifications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'reports' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Báo Cáo</span>
          </button>

          <button
            onClick={() => setActiveTab('tax_report')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'tax_report' ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs ring-1 ring-sky-400/40' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Kê Khai Thuế</span>
          </button>

          <button
            onClick={() => setActiveTab('holidays')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'holidays' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palmtree className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Nghỉ Lễ ({holidays.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'branding' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Thương Hiệu</span>
          </button>

          <button
            onClick={() => setActiveTab('branches_map')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'branches_map' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Bản Đồ Cơ Sở</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'settings' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-600 shrink-0" />
            <span>Cài Đặt</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUBTAB: LỊCH NGHỈ LỄ TRONG NĂM */}
      {/* ============================================================ */}
      {activeTab === 'holidays' && (
        <div className="animate-in fade-in duration-200">
          <HolidayConfigPanel />
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 1: HỌC PHÍ & VIETQR */}
      {/* ============================================================ */}
      {activeTab === 'tuition' && (
        <div className="space-y-4">
          {/* Overdue Notification Automation Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                    TỰ ĐỘNG HÓA CRM
                  </span>
                  <span className="text-xs text-amber-200 font-bold">
                    Hệ thống thông báo & nhắc học phí quá hạn
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Tự động quét học phí đến hạn/quá hạn, tạo mẫu Email/Push chuyên nghiệp và gửi đồng loạt tới Phụ huynh & Học viên.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOverdueModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all cursor-pointer flex-shrink-0 w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quét & Quản Lý Mẫu Nhắc Phí →</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500">Đã thu học phí</p>
              <p className="text-xl font-black text-emerald-700 font-heading mt-1">
                {totalTuitionRevenue.toLocaleString('vi-VN')} đ
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">
                ✓ {tuitionPayments.filter(p => p.status === 'paid').length} hóa đơn đã tất toán
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500">Chờ phụ huynh nộp</p>
              <p className="text-xl font-black text-amber-700 font-heading mt-1">
                {pendingTuitionRevenue.toLocaleString('vi-VN')} đ
              </p>
              <p className="text-[11px] text-amber-600 mt-1">
                ⏳ {tuitionPayments.filter(p => p.status === 'pending').length} hóa đơn đang mở QR
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">Cú pháp chuyển khoản chuẩn</p>
                <p className="text-xs font-mono font-bold text-indigo-900 mt-1 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                  {bankConfig.memoFormat === 'NAME_SUBJECT_MONTH' ? '[Họ và tên] - [Môn] - [Tháng]' : '[Mã HV] - [Môn] - [Tháng]'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">VD: HV001 - Piano - Thang 03</p>
              </div>
              <QrCode className="w-8 h-8 text-amber-500 shrink-0" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Tìm theo mã HV, tên học viên, môn học, kỳ thu..."
                  value={tuitionSearch}
                  onChange={(e) => setTuitionSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={tuitionStatusFilter}
                    onChange={(e) => setTuitionStatusFilter(e.target.value as any)}
                    className="text-xs border-0 bg-transparent font-semibold text-slate-700 focus:ring-0 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="pending">Chưa thanh toán</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="overdue">Quá hạn</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const timestamp = new Date().toISOString().slice(0, 10);
                    exportTuitionToCSV(filteredPayments, students, `Hoc_Phi_${timestamp}.csv`);
                    showToast('Đã xuất danh sách hóa đơn học phí sang file CSV Excel thành công!');
                  }}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Xuất bảng học phí hiện tại ra file CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExportDefaultType('tuition');
                    setIsExportModalOpen(true);
                  }}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="In hoặc tải báo cáo học phí dạng PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-600" />
                  <span>In / PDF</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                    <th className="py-3 px-3">Hóa Đơn & Học Viên</th>
                    <th className="py-3 px-3">Môn & Kỳ Thu</th>
                    <th className="py-3 px-3">Số Buổi</th>
                    <th className="py-3 px-3">Số Tiền (VNĐ)</th>
                    <th className="py-3 px-3">Cú Pháp Chuyển Khoản</th>
                    <th className="py-3 px-3">Hạn Nộp</th>
                    <th className="py-3 px-3">Trạng Thái</th>
                    <th className="py-3 px-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => {
                    const memo = p.transferSyntax || formatTransferContent(p.studentCode || p.studentName, p.subjectName || 'Piano', p.billingMonth);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div>
                            <span className="font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] border border-amber-200 mr-1.5">
                              {p.code || 'HP'}
                            </span>
                            <strong className="text-slate-900">{p.studentName}</strong>
                            {p.studentCode && <span className="text-slate-400 text-[10px] ml-1">({p.studentCode})</span>}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div>
                            <span className="font-bold text-slate-800">{p.subjectName || 'Âm nhạc'}</span>
                            <p className="text-[10px] text-slate-500">{p.billingMonth}</p>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {p.sessionsCount} buổi
                        </td>

                        <td className="py-3 px-3 font-black text-amber-700 text-sm">
                          {p.amount.toLocaleString('vi-VN')} đ
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleCopyText(memo, 'Nội dung chuyển khoản')}
                            className="font-mono font-bold text-[11px] text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                            title="Bấm để sao chép cú pháp chuyển khoản"
                          >
                            <span>{memo}</span>
                            <Copy className="w-3 h-3 text-indigo-600" />
                          </button>
                        </td>

                        <td className="py-3 px-3 text-slate-500">{p.dueDate}</td>

                        <td className="py-3 px-3">
                          {p.status === 'paid' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Đã nộp
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                              Chờ thanh toán
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedPaymentForQR(p)}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer transition-all"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Xem QR</span>
                            </button>

                            {p.status === 'pending' && (
                              <button
                                onClick={() => {
                                  updateTuitionStatus(p.id, 'paid', p.amount);
                                  showToast(`Đã xác nhận thanh toán học phí thành công cho ${p.studentName}!`);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Xác nhận thu
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 2: CẤU HÌNH TÀI KHOẢN NGÂN HÀNG & ÚP MÃ QR */}
      {/* ============================================================ */}
      {activeTab === 'bank_qr_config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Cấu Hình Tài Khoản Ngân Hàng Nhận Học Phí & Mã QR
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Thiết lập ngân hàng thụ hưởng của trung tâm để phụ huynh và học viên quét mã QR chuyển khoản nộp học phí nhanh chóng.
              </p>
            </div>

            <form onSubmit={handleSaveBankConfig} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngân hàng thụ hưởng (*):</label>
                  <select
                    value={bankId}
                    onChange={(e) => setBankId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800"
                  >
                    <option value="MBBank">MBBank (Ngân hàng Quân Đội)</option>
                    <option value="VCB">Vietcombank (Ngoại thương)</option>
                    <option value="TCB">Techcombank (Kỹ thương)</option>
                    <option value="VPB">VPBank (Việt Nam Thịnh Vượng)</option>
                    <option value="ACB">ACB (Á Châu)</option>
                    <option value="BIDV">BIDV (Đầu tư & Phát triển)</option>
                    <option value="CTG">VietinBank (Công thương)</option>
                    <option value="TPB">TPBank (Tiên Phong)</option>
                    <option value="VIB">VIB (Quốc Tế)</option>
                    <option value="STB">Sacombank (Sài Gòn Thương Tín)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số tài khoản (*):</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="0901888999"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-extrabold text-amber-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên chủ tài khoản (In hoa không dấu) (*):</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  placeholder="TRUNG TAM AM NHAC MINH MUSIC"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Định dạng cú pháp nội dung chuyển khoản (*):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                  <label
                    onClick={() => setMemoFormat('CODE_SUBJECT_MONTH')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                      memoFormat === 'CODE_SUBJECT_MONTH'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="memoFormat"
                      checked={memoFormat === 'CODE_SUBJECT_MONTH'}
                      onChange={() => setMemoFormat('CODE_SUBJECT_MONTH')}
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <p className="font-extrabold text-xs">Mã HV - Môn - Tháng</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">HV001 - Piano - Thang 03</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setMemoFormat('NAME_SUBJECT_MONTH')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                      memoFormat === 'NAME_SUBJECT_MONTH'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="memoFormat"
                      checked={memoFormat === 'NAME_SUBJECT_MONTH'}
                      onChange={() => setMemoFormat('NAME_SUBJECT_MONTH')}
                      className="mt-0.5 text-amber-600"
                    />
                    <div>
                      <p className="font-extrabold text-xs">Họ và tên - Môn - Tháng</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">Nguyen Minh Anh - Piano - Thang 03</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Tùy chọn úp mã QR */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900">Tải lên ảnh Mã QR riêng của trung tâm</h4>
                    <p className="text-slate-500 text-[11px]">
                      Nếu bạn có sẵn ảnh mã QR được in từ ngân hàng, bạn có thể úp trực tiếp lên hệ thống.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomQr}
                      onChange={(e) => setUseCustomQr(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {useCustomQr && (
                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                    <input
                      type="file"
                      ref={qrFileInputRef}
                      onChange={handleCustomQrUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => qrFileInputRef.current?.click()}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Chọn file ảnh QR từ thiết bị</span>
                    </button>
                    {customQrUrl && (
                      <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã tải lên ảnh QR thành công</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  Lưu Cấu Hình Ngân Hàng
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                Xem Trước Mã QR Học Phí
              </h3>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Napas 247 Live
              </span>
            </div>

            <div className="bg-gradient-to-b from-amber-50/50 to-orange-50/30 p-5 rounded-2xl border border-amber-200 text-center space-y-3">
              <p className="text-xs font-extrabold text-slate-800">QUÉT MÃ QR NỘP HỌC PHÍ</p>
              
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block">
                {useCustomQr && customQrUrl ? (
                  <img
                    src={customQrUrl}
                    alt="Custom Bank QR"
                    className="w-52 h-52 object-contain mx-auto rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <img
                    src={`https://img.vietqr.io/image/${bankId}-${accountNumber}-compact2.png?amount=3600000&addInfo=${encodeURIComponent(memoFormat === 'NAME_SUBJECT_MONTH' ? 'Nguyen Minh Anh - Piano - Thang 03' : 'HV001 - Piano - Thang 03')}&accountName=${encodeURIComponent(accountHolder)}`}
                    alt="VietQR Live Preview"
                    className="w-52 h-52 object-contain mx-auto rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              <div className="text-left text-xs space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <strong className="text-slate-900">{bankId}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <strong className="text-amber-800 font-mono text-sm">{accountNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <strong className="text-slate-900 font-mono text-[11px]">{accountHolder}</strong>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Nội dung mẫu:</span>
                  <span className="font-mono font-bold text-indigo-900 text-[11px]">
                    {memoFormat === 'NAME_SUBJECT_MONTH' ? 'Nguyen Minh Anh - Piano - Thang 03' : 'HV001 - Piano - Thang 03'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 3: THÔNG BÁO */}
      {/* ============================================================ */}
      {activeTab === 'notifications' && (
        <div className="space-y-5">
          {/* Overdue Notification Automation Feature Card */}
          <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 flex-shrink-0">
                <Bell className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono">
                    AUTOMATED ENGINE
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Cấu hình mẫu & Lịch quét tự động
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading mt-0.5">
                  Tự Động Hóa Nhắc Học Phí & Cảnh Báo Quá Hạn
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Tùy biến mẫu Email, Push Notification và tin nhắn SMS kèm mã VietQR tự động. Đặt lịch quét định kỳ hàng ngày lúc 08:30 sáng và gửi đồng loạt tới phụ huynh.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOverdueModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer flex-shrink-0"
            >
              <Sliders className="w-4 h-4 text-amber-300" />
              <span>Mở Trình Quản Lý Nhắc Phí →</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">
              Danh Sách Thông Báo Đã Phát ({notifications.length})
            </h3>
            <span className="text-xs text-slate-400">Hiển thị theo thời gian thực</span>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {n.targetAudience === 'ALL' ? 'Toàn bộ trung tâm' : n.targetAudience}
                    </span>
                    <span className="text-xs text-slate-400">{n.createdAt}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading">{n.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 4: BÁO CÁO TÀI CHÍNH & CHUYÊN CẦN ĐIỂM DANH */}
      {/* ============================================================ */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Action Header for Reports */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                  Báo Cáo Tài Chính & Chuyên Cần Điểm Danh
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theo dõi tình hình thu học phí, thống kê chuyên cần và xuất file dữ liệu định dạng CSV / PDF
              </p>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const timestamp = new Date().toISOString().slice(0, 10);
                  exportCombinedSummaryToCSV(tuitionPayments, attendance, students, classes, `Bao_Cao_Tong_Hop_${timestamp}.csv`);
                  showToast('Đã xuất toàn bộ báo cáo tổng hợp Học phí & Điểm danh sang file CSV Excel!');
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer transition-all"
                title="Tải ngay file CSV tổng hợp tất cả học phí và điểm danh"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>XUẤT CSV TỔNG HỢP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportDefaultType('combined');
                  setIsExportModalOpen(true);
                }}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-600/20 cursor-pointer transition-all"
                title="In hoặc tải bản báo cáo hoàn chỉnh có định dạng PDF"
              >
                <FileText className="w-4 h-4" />
                <span>IN BÁO CÁO / PDF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExportDefaultType('combined');
                  setIsExportModalOpen(true);
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Tùy chỉnh khoảng thời gian, lớp học và định dạng xuất"
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Tùy Chỉnh Lọc</span>
              </button>
            </div>
          </div>

          {/* TAX COMPLIANCE BANNER IN REPORTS */}
          <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-5 rounded-3xl border border-sky-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-sky-500/20 border border-sky-400/30 text-sky-400 rounded-2xl shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black font-heading tracking-wide">
                    Báo Cáo Doanh Thu & Xuất Kê Khai Thuế (Mẫu 01/BK-DNT)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/30 text-sky-200 border border-sky-400/30 uppercase">
                    Chuẩn Kế Toán / Thuế
                  </span>
                </div>
                <p className="text-xs text-sky-200/80 mt-0.5">
                  Lọc theo Tháng, Quý, Năm hoặc Khoảng ngày. Phân tách Doanh thu trước thuế & Tiền thuế GTGT, xuất Excel/CSV chuẩn UTF-8 và in PDF có chữ ký.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsTaxReportModalOpen(true)}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shrink-0 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Mở Bảng Kê Khai & Xuất File</span>
            </button>
          </div>

          {/* Key KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Học phí thực thu</p>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-400 font-heading mt-2">
                {totalTuitionRevenue.toLocaleString('vi-VN')} đ
              </h3>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Đã thu: {tuitionPayments.filter(p => p.status === 'paid').length} HĐ</span>
                <span className="text-emerald-600 font-bold">↑ +18%</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Học phí chờ nộp</p>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-black text-amber-700 dark:text-amber-400 font-heading mt-2">
                {pendingTuitionRevenue.toLocaleString('vi-VN')} đ
              </h3>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Chờ nộp: {tuitionPayments.filter(p => p.status === 'pending').length} HĐ</span>
                <span className="text-amber-600 font-bold">Đang phát QR</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Tỷ lệ chuyên cần</p>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </div>
              {(() => {
                const totalAtt = attendance.length;
                const presentAtt = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
                const rate = totalAtt > 0 ? ((presentAtt / totalAtt) * 100).toFixed(1) : '100';
                return (
                  <>
                    <h3 className="text-xl font-black text-indigo-700 dark:text-indigo-400 font-heading mt-2">
                      {rate}%
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{totalAtt} lượt điểm danh</span>
                      <span className="text-indigo-600 font-bold">Đạt chuẩn</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Học viên & Lớp học</p>
                <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-black text-purple-700 dark:text-purple-400 font-heading mt-2">
                {students.length} Học Viên
              </h3>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{classes.length} Lớp đang mở</span>
                <span className="text-emerald-600 font-bold">Duy trì 94.2%</span>
              </div>
            </div>
          </div>

          {/* Section: 2 Detailed Panels (Tuition vs Attendance) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Báo cáo nhanh Thu Học Phí */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white font-heading">
                    Tổng Hợp Học Phí Theo Hóa Đơn ({tuitionPayments.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const timestamp = new Date().toISOString().slice(0, 10);
                    exportTuitionToCSV(tuitionPayments, students, `Bao_Cao_Hoc_Phi_${timestamp}.csv`);
                    showToast('Đã xuất danh sách thu học phí sang CSV!');
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất CSV</span>
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {tuitionPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{p.studentName}</span>
                        <span className="text-[10px] text-slate-400">({p.studentCode || 'HV---'})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.subjectName || 'Piano'} • {p.billingMonth} • {p.sessionsCount} buổi
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-slate-900 dark:text-white">
                        {p.amount.toLocaleString('vi-VN')} đ
                      </p>
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 ${
                          p.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {p.status === 'paid' ? 'Đã thu' : 'Chờ nộp'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Báo cáo nhanh Chuyên Cần & Điểm Danh */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white font-heading">
                    Nhật Ký Điểm Danh Gần Đây ({attendance.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const timestamp = new Date().toISOString().slice(0, 10);
                    exportAttendanceToCSV(attendance, students, classes, `Bao_Cao_Diem_Danh_${timestamp}.csv`);
                    showToast('Đã xuất nhật ký điểm danh sang CSV!');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất CSV</span>
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {attendance.slice(0, 15).map((a) => {
                  let statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Có mặt
                    </span>
                  );
                  if (a.status === 'absent_excused' || a.status === 'absent_with_leave') {
                    statusBadge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Nghỉ phép (Bù)
                      </span>
                    );
                  } else if (a.status === 'absent_unexcused' || a.status === 'absent_no_leave') {
                    statusBadge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                        Vắng KP
                      </span>
                    );
                  } else if (a.status === 'late') {
                    statusBadge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                        Đi muộn
                      </span>
                    );
                  }

                  return (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{a.studentName}</span>
                          <span className="text-[10px] text-slate-400">{a.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {a.className || 'Lớp học'} • {a.subject || 'Piano'} • GV: {a.teacherName || 'GV'}
                        </p>
                      </div>

                      <div className="text-right">
                        {statusBadge}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Bảng Đối Soát Tổng Thể Học Viên (Tuition vs Attendance Matrix) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white font-heading">
                  Bảng Đối Soát Toàn Diện Học Viên (Học Phí vs Chuyên Cần)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tương quan giữa số buổi đã học và tình trạng đóng học phí của từng học viên
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const timestamp = new Date().toISOString().slice(0, 10);
                    exportCombinedSummaryToCSV(tuitionPayments, attendance, students, classes, `Doi_Soat_Hoc_Vien_${timestamp}.csv`);
                    showToast('Đã xuất bảng đối soát học viên sang file CSV!');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xuất CSV Đối Soát</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExportDefaultType('combined');
                    setIsExportModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-600" />
                  <span>In Đối Soát PDF</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-3">Mã & Họ Tên Học Viên</th>
                    <th className="py-3 px-3">Môn Học</th>
                    <th className="py-3 px-3 text-center">Buổi Có Mặt</th>
                    <th className="py-3 px-3 text-center">Buổi Vắng / Nghỉ</th>
                    <th className="py-3 px-3">Đã Đóng HP</th>
                    <th className="py-3 px-3">Còn Chờ Thu</th>
                    <th className="py-3 px-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((s) => {
                    const sAttendance = attendance.filter((a) => a.studentId === s.id);
                    const sPresent = sAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
                    const sAbsent = sAttendance.filter((a) => a.status === 'absent_unexcused' || a.status === 'absent_no_leave' || a.status === 'absent_excused' || a.status === 'absent_with_leave').length;
                    const sPayments = tuitionPayments.filter((p) => p.studentId === s.id);
                    const sPaid = sPayments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
                    const sPending = sPayments.filter((p) => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

                    const statusText = s.status === 'active' ? 'Đang học' : s.status === 'trial' ? 'Học thử' : s.status === 'reserved' ? 'Bảo lưu' : 'Hoạt động';

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-900 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
                              {s.code || 'HV'}
                            </span>
                            <strong className="text-slate-900 dark:text-white">{s.fullName}</strong>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {(s.enrolledSubjects || []).join(', ') || 'Piano'}
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-emerald-600">
                          {sPresent} buổi
                        </td>

                        <td className="py-3 px-3 text-center font-bold text-rose-600">
                          {sAbsent} buổi
                        </td>

                        <td className="py-3 px-3 font-black text-slate-900 dark:text-white">
                          {sPaid > 0 ? `${sPaid.toLocaleString('vi-VN')} đ` : '0 đ'}
                        </td>

                        <td className="py-3 px-3 font-bold text-amber-700 dark:text-amber-400">
                          {sPending > 0 ? `${sPending.toLocaleString('vi-VN')} đ` : '0 đ'}
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 4.5: KÊ KHAI DOANH THU & NGHĨA VỤ THUẾ */}
      {/* ============================================================ */}
      {activeTab === 'tax_report' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Action Banner */}
          <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-sky-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-sky-500/20 border border-sky-400/30 text-sky-400 rounded-2xl shrink-0">
                <Receipt className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black font-heading tracking-wide">
                    Báo Cáo Doanh Thu & Kê Khai Nghĩa Vụ Thuế
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/30 text-sky-200 border border-sky-400/30 uppercase tracking-wider">
                    Mẫu 01/BK-DNT
                  </span>
                </div>
                <p className="text-xs text-sky-200/80 mt-1">
                  Đơn vị: <strong>{branding.centerName || 'Minh Music'}</strong> • MST: <strong>{branding.centerTaxCode || '0316889988'}</strong> • Đại diện: {branding.legalRepresentative || 'Nguyễn Văn Minh'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              <button
                onClick={() => setIsTaxReportModalOpen(true)}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Mở Toàn Màn Hình & Bộ Lọc Nâng Cao</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-sky-200 dark:border-sky-900/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tổng Thực Thu Đã Tất Toán</span>
                <div className="p-2 bg-sky-100 dark:bg-sky-950 text-sky-600 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-sky-700 dark:text-sky-400 font-heading mt-2">
                {tuitionPayments
                  .filter((p) => p.status === 'paid' || p.status === 'completed')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString('vi-VN')}{' '}
                đ
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {tuitionPayments.filter((p) => p.status === 'paid' || p.status === 'completed').length} hóa đơn hợp lệ
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Chuyển Khoản / VietQR</span>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-heading mt-2">
                {tuitionPayments
                  .filter((p) => (p.status === 'paid' || p.status === 'completed') && (p.paymentMethod === 'bank_transfer' || !p.paymentMethod))
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString('vi-VN')}{' '}
                đ
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                ✓ Sao kê tài khoản tự động
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tiền Mặt Tại Quầy</span>
                <div className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 font-heading mt-2">
                {tuitionPayments
                  .filter((p) => (p.status === 'paid' || p.status === 'completed') && p.paymentMethod === 'cash')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toLocaleString('vi-VN')}{' '}
                đ
              </h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-bold">
                💵 Thu tiền mặt trực tiếp
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Thuế GTGT Kê Khai</span>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 rounded-xl">
                  <FileCheck2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-indigo-700 dark:text-indigo-400 font-heading mt-2">
                {tuitionPayments
                  .filter((p) => p.status === 'paid' || p.status === 'completed')
                  .reduce((sum, p) => sum + (p.taxAmount || 0), 0)
                  .toLocaleString('vi-VN')}{' '}
                đ
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Theo mức thuế suất từng nguồn thu
              </p>
            </div>
          </div>

          {/* Embedded Records Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white font-heading">
                  Danh Sách Hóa Đơn & Chứng Từ Thu Tiền ({tuitionPayments.length} Giao Dịch)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nhấp vào nút "Mở Bảng Kê Khai" để tùy biến thời gian kê khai, xuất Excel (.xlsx), CSV hoặc in ấn PDF
                </p>
              </div>

              <button
                onClick={() => setIsTaxReportModalOpen(true)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Receipt className="w-4 h-4" />
                <span>Xem Chi Tiết Bảng Kê Khai Thuế</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-extrabold uppercase border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3">Mã Hóa Đơn</th>
                    <th className="py-2.5 px-3">Ngày Kê Khai</th>
                    <th className="py-2.5 px-3">Người Nộp / Học Viên</th>
                    <th className="py-2.5 px-3">Mã Số Thuế / CCCD</th>
                    <th className="py-2.5 px-3">Nội Dung Thu</th>
                    <th className="py-2.5 px-3 text-right">Tổng Thực Thu</th>
                    <th className="py-2.5 px-3">Hình Thức</th>
                    <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tuitionPayments.slice(0, 10).map((p) => {
                    const student = students.find((s) => s.id === p.studentId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-700 dark:text-sky-400">
                          {p.invoiceCode || `HD-${p.id.slice(-6).toUpperCase()}`}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                          {p.paidDate || p.createdAt || '2025-01-15'}
                        </td>
                        <td className="py-2.5 px-3">
                          <strong className="text-slate-900 dark:text-white">
                            {p.payerName || p.studentName || student?.fullName || 'Học viên'}
                          </strong>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                          {p.taxIdOrCccd || '---'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                          {p.notes || `Học phí môn ${p.subjectName || 'Piano'} ${p.billingMonth || ''}`}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                          {p.amount.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {p.paymentMethod === 'cash'
                            ? 'Tiền mặt'
                            : p.paymentMethod === 'e_wallet'
                            ? 'Ví điện tử'
                            : 'Chuyển khoản / QR'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              p.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {p.status === 'paid' ? 'Đã thu' : 'Chờ nộp'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SUBTAB 5: THƯƠNG HIỆU */}
      {/* ============================================================ */}
      {activeTab === 'branding' && (
        <BrandingConfigPanel />
      )}

      {/* ============================================================ */}
      {/* SUBTAB 6: BẢN ĐỒ CƠ SỞ & VỊ TRÍ */}
      {/* ============================================================ */}
      {activeTab === 'branches_map' && (
        <BranchesAndMapManagement />
      )}

      {/* ============================================================ */}
      {/* SUBTAB 7: CÀI ĐẶT HỆ THỐNG & ÂM THANH / NHẠC NỀN */}
      {/* ============================================================ */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* 1. ÂM THANH & NHẠC NỀN TRUNG TÂM (AUDIO STUDIO SETTINGS) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                    Cấu Hình Âm Thanh & Nhạc Nền Studio
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tùy chỉnh hiệu ứng nốt nhạc khi tương tác click chuột và nhạc nền thư giãn cho trung tâm
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full">
                Web Audio Studio
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cài đặt âm thanh click chuột */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      <MousePointerClick className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 font-heading">
                        Âm Thanh Click Chuột
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Phát âm thanh nốt nhạc khi bấm các nút và danh mục
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={toggleSound}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      isSoundEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    aria-label="Bật tắt âm thanh click"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                        isSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {isSoundEnabled && (
                  <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Chọn Bộ Âm Sắc Tương Tác:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'piano', label: 'Piano Classic', desc: 'Đàn Piano ấm áp' },
                          { id: 'marimba', label: 'Mộc Cầm', desc: 'Gõ gỗ Marimba' },
                          { id: 'modern_pop', label: 'Modern Pop', desc: 'Bong bóng hiện đại' },
                          { id: 'gentle_chime', label: 'Chuông Ngân', desc: 'Chuông bạc êm dịu' }
                        ].map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => {
                              setSoundTheme(theme.id as SoundTheme);
                              playSuccessSound();
                            }}
                            className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                              soundTheme === theme.id
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-300'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <p className="font-extrabold text-xs">{theme.label}</p>
                            <p className={`text-[10px] mt-0.5 ${soundTheme === theme.id ? 'text-amber-100' : 'text-slate-400'}`}>
                              {theme.desc}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        <span>Âm lượng hiệu ứng click:</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400">{Math.round(soundVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={soundVolume}
                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cài đặt nhạc nền trung tâm */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      <Disc3 className={`w-5 h-5 ${isMusicPlaying ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 font-heading">
                        Nhạc Nền Không Gian Studio
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isMusicPlaying ? `Đang phát: ${currentTrack.title}` : 'Giai điệu thư giãn giảm căng thẳng'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={toggleMusic}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      isMusicPlaying
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/20'
                        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    }`}
                  >
                    {isMusicPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isMusicPlaying ? 'Tạm Dừng' : 'Bật Nhạc Nền'}</span>
                  </button>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Chọn Giai Điệu Nền:
                    </label>
                    <div className="space-y-1.5">
                      {AMBIENT_TRACKS.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            setCurrentTrackId(t.id);
                            if (!isMusicPlaying) toggleMusic();
                          }}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between border ${
                            currentTrackId === t.id
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 ring-1 ring-amber-400'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div>
                            <p className="font-extrabold">{t.title}</p>
                            <p className="text-[10px] text-slate-400 font-normal">{t.genre} • {t.tempoBpm} BPM</p>
                          </div>
                          {currentTrackId === t.id && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500 text-white">
                              {isMusicPlaying ? 'Đang phát ♫' : 'Đang chọn'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span>Âm lượng nhạc nền:</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400">{Math.round(musicVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CÀI ĐẶT GIAO DIỆN SÁNG / TỐI */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                    Chế Độ Giao Diện (Theme Mode)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tùy chọn tông màu hiển thị ngày và đêm cho hệ thống
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Ban ngày (Light)</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Ban đêm (Dark)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. CẤU HÌNH NGÀY NGHỈ LỄ & MIỄN TRỪ ĐIỂM DANH */}
          <div className="pt-2">
            <HolidayConfigPanel />
          </div>

          {/* 4. KHÔI PHỤC CÀI ĐẶT GỐC & LÀM TRỐNG DỮ LIỆU (FACTORY RESET) */}
          <div className="bg-gradient-to-br from-red-50/70 via-white to-rose-50/60 dark:from-red-950/20 dark:via-slate-900 dark:to-rose-950/10 p-6 rounded-3xl border border-red-200/80 dark:border-red-900/40 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-3 bg-red-600/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                      Khôi Phục Cài Đặt Gốc & Làm Trống Dữ Liệu
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                      Cực Kỳ Quan Trọng
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                    Đưa toàn bộ phần mềm về trạng thái dữ liệu trống ban đầu (0 học viên, 0 giáo viên, 0 lớp học, 0 học phí và điểm danh) để trung tâm bắt đầu vận hành mới. Yêu cầu Quản trị viên nhập mật khẩu xác nhận.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsFactoryResetModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Khôi Phục Cài Đặt Gốc...</span>
                </button>
              </div>
            </div>

            {/* Quick summary alert & data footprint */}
            <div className="pt-3 border-t border-red-100 dark:border-red-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-[11px]">
                <span>Hiện có: <strong className="text-slate-800 dark:text-slate-200 font-bold">{students.length}</strong> học viên</span>
                <span>•</span>
                <span><strong className="text-slate-800 dark:text-slate-200 font-bold">{teachers.length}</strong> giáo viên</span>
                <span>•</span>
                <span><strong className="text-slate-800 dark:text-slate-200 font-bold">{classes.length}</strong> lớp học</span>
                <span>•</span>
                <span><strong className="text-slate-800 dark:text-slate-200 font-bold">{tuitionPayments.length}</strong> phiếu thu</span>
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Hệ thống hỗ trợ tự động tải file sao lưu JSON trước khi thực hiện</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: XEM MÃ QR HỌC PHÍ CHI TIẾT */}
      {/* ============================================================ */}
      {selectedPaymentForQR && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                Mã QR Nộp Học Phí VietQR
              </h3>
              <button
                onClick={() => setSelectedPaymentForQR(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dynamic VietQR Image */}
            <div className="p-3 bg-gradient-to-b from-amber-50 to-orange-50/40 rounded-2xl border border-amber-200">
              <img
                src={generateQrUrlForPayment(selectedPaymentForQR)}
                alt="VietQR Payment Code"
                className="w-56 h-56 mx-auto rounded-xl shadow-xs"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bank details & Copy triggers */}
            <div className="text-xs text-left space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Ngân hàng:</span>
                <strong className="text-slate-900">{bankConfig.bankId || 'MBBank'}</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tài khoản:</span>
                <button
                  onClick={() => handleCopyText(bankConfig.accountNumber || '0901888999', 'Số tài khoản')}
                  className="font-mono font-extrabold text-amber-900 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>{bankConfig.accountNumber || '0901888999'}</span>
                  <Copy className="w-3 h-3 text-amber-600" />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">
                  {bankConfig.accountHolder || 'TRUNG TAM AM NHAC MINH MUSIC'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số tiền nộp:</span>
                <strong className="text-amber-800 text-sm font-black">
                  {selectedPaymentForQR.amount.toLocaleString('vi-VN')} đ
                </strong>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Nội dung chuyển khoản chuẩn:</span>
                <button
                  onClick={() => {
                    const idOrName = bankConfig.memoFormat === 'NAME_SUBJECT_MONTH'
                      ? (selectedPaymentForQR.studentName || selectedPaymentForQR.studentCode || 'HV')
                      : (selectedPaymentForQR.studentCode || selectedPaymentForQR.studentName || 'HV');
                    const memo = selectedPaymentForQR.transferSyntax || formatTransferContent(idOrName, selectedPaymentForQR.subjectName || 'Piano', selectedPaymentForQR.billingMonth);
                    handleCopyText(memo, 'Nội dung chuyển khoản');
                  }}
                  className="w-full p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-xl font-mono font-bold text-xs flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="truncate mr-1">
                    {selectedPaymentForQR.transferSyntax || formatTransferContent(selectedPaymentForQR.studentCode || selectedPaymentForQR.studentName, selectedPaymentForQR.subjectName || 'Piano', selectedPaymentForQR.billingMonth)}
                  </span>
                  <Copy className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedPaymentForQR.status === 'pending' && (
                <button
                  onClick={() => {
                    updateTuitionStatus(selectedPaymentForQR.id, 'paid', selectedPaymentForQR.amount);
                    showToast('Đã ghi nhận thanh toán học phí thành công!');
                    setSelectedPaymentForQR(null);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  ✓ Xác Nhận Đã Thu
                </button>
              )}
              <button
                onClick={() => setSelectedPaymentForQR(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: TẠO HÓA ĐƠN HỌC PHÍ MỚI */}
      {/* ============================================================ */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 font-heading">
                  Tạo Hóa Đơn Học Phí Mới
                </h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="py-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn học viên (*):</label>
                <select
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    const st = students.find(s => s.id === e.target.value);
                    if (st && st.enrolledSubjects?.[0]) {
                      setSubjectName(st.enrolledSubjects[0]);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.code}) - {s.enrolledSubjects?.join(', ') || 'Âm nhạc'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bộ môn (*):</label>
                  <select
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kỳ thu (*):</label>
                  <input
                    type="text"
                    required
                    value={billingMonth}
                    onChange={(e) => setBillingMonth(e.target.value)}
                    placeholder="Tháng 03/2025"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số tiền học phí (VNĐ):</label>
                  <input
                    type="number"
                    step={100000}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-amber-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số buổi học:</label>
                  <input
                    type="number"
                    value={sessionsCount}
                    onChange={(e) => setSessionsCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              {/* Preview Transfer Syntax */}
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-indigo-900 text-[11px] space-y-1">
                <p className="font-bold">Cú pháp chuyển khoản sẽ sinh tự động:</p>
                <p className="font-mono font-bold text-slate-900 bg-white p-1.5 rounded border border-indigo-200">
                  {formatTransferContent(
                    students.find(s => s.id === studentId)?.code || students.find(s => s.id === studentId)?.fullName || 'HV',
                    subjectName,
                    billingMonth
                  )}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú phiếu thu:</label>
                <input
                  type="text"
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  placeholder="Ví dụ: Học phí khóa cơ bản kỳ 1"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  Tạo Hóa Đơn & Sinh Mã QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: PHÁT THÔNG BÁO MỚI */}
      {/* ============================================================ */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Phát Thông Báo Toàn Hệ Thống
              </h3>
              <button onClick={() => setIsNotifModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề thông báo (*):</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="Ví dụ: Thông báo lịch học bù và nộp học phí tháng mới..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gửi tới đối tượng:</label>
                <select
                  value={notifAudience}
                  onChange={(e) => setNotifAudience(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="ALL">Toàn bộ trung tâm (Tất cả)</option>
                  <option value="TEACHER">Chỉ Giáo viên</option>
                  <option value="STUDENT">Chỉ Học viên</option>
                  <option value="PARENT">Chỉ Phụ huynh & Giám hộ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung chi tiết (*):</label>
                <textarea
                  rows={4}
                  value={notifContent}
                  onChange={(e) => setNotifContent(e.target.value)}
                  placeholder="Nhập nội dung thông báo..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSendNotification}
                className="px-5 py-2.5 text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm cursor-pointer"
              >
                Phát Thông Báo
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultType={exportDefaultType}
      />

      {/* Tax Revenue & Compliance Modal */}
      <TaxRevenueReportModal
        isOpen={isTaxReportModalOpen}
        onClose={() => setIsTaxReportModalOpen(false)}
      />

      {/* Automated Overdue Tuition Notification & Template System Modal */}
      <OverdueNotificationModal
        isOpen={isOverdueModalOpen}
        onClose={() => setIsOverdueModalOpen(false)}
        tuitionPayments={tuitionPayments}
        students={students}
        bankConfig={bankConfig}
        branding={branding}
        onSendNotifications={(notifs) => {
          notifs.forEach(n => addNotification(n));
          playSuccessSound();
        }}
        onSuccessToast={(msg) => setToastMessage(msg)}
      />

      {/* Factory Reset Modal (Khôi phục cài đặt gốc về dữ liệu trống) */}
      <FactoryResetModal
        isOpen={isFactoryResetModalOpen}
        onClose={() => setIsFactoryResetModalOpen(false)}
        onSuccess={() => {
          setToastMessage('Khôi phục cài đặt gốc thành công!');
          playSuccessSound();
        }}
      />
    </div>
  );
};
