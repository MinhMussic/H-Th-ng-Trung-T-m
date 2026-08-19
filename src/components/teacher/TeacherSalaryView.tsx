import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TeacherSalaryRecord, TeacherSessionSalaryLog, TeacherBonusDetail } from '../../types';
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  Award,
  Sparkles,
  TrendingUp,
  CreditCard,
  Building,
  FileText,
  Download,
  Printer,
  ChevronRight,
  Info,
  Layers,
  Search,
  Filter,
  Check,
  Flame,
  Star,
  Users,
  School,
  RefreshCw,
  Gift,
  HelpCircle,
  Copy,
  Receipt,
  ExternalLink
} from 'lucide-react';

interface TeacherSalaryViewProps {
  initialMonth?: string;
  className?: string;
}

export const TeacherSalaryView: React.FC<TeacherSalaryViewProps> = ({
  initialMonth = '2026-03',
  className = ''
}) => {
  const { currentUser } = useAuth();
  const { 
    teachers, 
    teacherSalaries, 
    getTeacherSalaryByMonth, 
    getTeacherSessionLogsForMonth, 
    classes,
    calculateTeacherSalaryForMonth 
  } = useData();

  // Find current teacher profile
  const currentTeacher = useMemo(() => {
    const byUserId = teachers.find(t => t.userId === currentUser?.uid || t.userId === (currentUser as any)?.id);
    if (byUserId) return byUserId;
    const byEmail = teachers.find(t => t.email && currentUser?.email && t.email.toLowerCase() === currentUser.email.toLowerCase());
    if (byEmail) return byEmail;
    const byName = teachers.find(t => currentUser?.displayName && t.fullName.toLowerCase().includes(currentUser.displayName.toLowerCase()));
    if (byName) return byName;
    return teachers[0] || {
      id: 'tch-01',
      code: 'GV001',
      fullName: 'Thầy Nguyễn Văn Minh',
      phone: '0908151088',
      email: 'minhmusic1510@gmail.com',
      specialties: ['Piano', 'Nhạc Lý'],
      hourlyRate: 200000,
      shiftRate: 300000,
      baseSalary: 3000000,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bankName: 'Techcombank',
      bankAccount: '19033458899018',
      bankHolder: 'NGUYEN VAN MINH',
      birthDate: '1990-05-15',
      status: 'active' as const
    };
  }, [teachers, currentUser]);

  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [activeSubTab, setActiveSubTab] = useState<'payslip' | 'shifts' | 'bonuses'>('payslip');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [searchShiftQuery, setSearchShiftQuery] = useState<string>('');
  const [selectedShiftClass, setSelectedShiftClass] = useState<string>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Available months list for selector
  const availableMonths = [
    { value: '2026-03', label: 'Tháng 03/2026 (Kỳ hiện tại)' },
    { value: '2026-02', label: 'Tháng 02/2026' },
    { value: '2026-01', label: 'Tháng 01/2026' }
  ];

  // Retrieve or compute salary record for selected month
  const salaryRecord: TeacherSalaryRecord = useMemo(() => {
    const found = getTeacherSalaryByMonth(currentTeacher.id, selectedMonth);
    if (found) return found;
    const year = parseInt(selectedMonth.split('-')[0], 10) || 2026;
    return calculateTeacherSalaryForMonth(currentTeacher.id, selectedMonth, year);
  }, [currentTeacher.id, selectedMonth, getTeacherSalaryByMonth, calculateTeacherSalaryForMonth, teacherSalaries]);

  // Session logs for the month
  const sessionLogs: TeacherSessionSalaryLog[] = useMemo(() => {
    if (salaryRecord.sessionLogs && salaryRecord.sessionLogs.length > 0) {
      return salaryRecord.sessionLogs;
    }
    return getTeacherSessionLogsForMonth(currentTeacher.id, selectedMonth);
  }, [salaryRecord, currentTeacher.id, selectedMonth, getTeacherSessionLogsForMonth]);

  // Filtered session logs
  const filteredSessionLogs = useMemo(() => {
    return sessionLogs.filter(log => {
      const matchSearch = !searchShiftQuery.trim() || 
        log.className.toLowerCase().includes(searchShiftQuery.toLowerCase()) ||
        log.subjectName.toLowerCase().includes(searchShiftQuery.toLowerCase()) ||
        log.date.includes(searchShiftQuery);
      
      const matchClass = selectedShiftClass === 'all' || log.classId === selectedShiftClass || log.className === selectedShiftClass;
      return matchSearch && matchClass;
    });
  }, [sessionLogs, searchShiftQuery, selectedShiftClass]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const formatVND = (amount: number = 0) => {
    return amount.toLocaleString('vi-VN') + ' đ';
  };

  // Status mapping
  const statusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Đã thanh toán',
          bg: 'bg-emerald-50 dark:bg-emerald-950/70',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-300 dark:border-emerald-700',
          dot: 'bg-emerald-500'
        };
      case 'approved':
        return {
          label: 'Đã phê duyệt (Chờ chi)',
          bg: 'bg-blue-50 dark:bg-blue-950/70',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-300 dark:border-blue-700',
          dot: 'bg-blue-500'
        };
      case 'pending':
        return {
          label: 'Chờ kế toán duyệt',
          bg: 'bg-amber-50 dark:bg-amber-950/70',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-300 dark:border-amber-700',
          dot: 'bg-amber-500'
        };
      default:
        return {
          label: 'Bản nháp tính lương',
          bg: 'bg-slate-50 dark:bg-slate-900',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400'
        };
    }
  };

  const badgeInfo = statusBadge(salaryRecord.status);

  // Unique classes for filter dropdown
  const uniqueClassOptions = useMemo(() => {
    const set = new Set<string>();
    sessionLogs.forEach(l => set.add(l.className));
    return Array.from(set);
  }, [sessionLogs]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header & Month Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Thù Lao & Bảng Lương Giảng Viên
            </span>
            
            {/* Status Pill */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-extrabold border ${badgeInfo.bg} ${badgeInfo.text} ${badgeInfo.border}`}>
              <span className={`w-2 h-2 rounded-full ${badgeInfo.dot} animate-pulse`} />
              <span>{badgeInfo.label}</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 font-heading">
            Thu Nhập Giảng Dạy: {currentTeacher.fullName} ({currentTeacher.code})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Minh bạch từng ca dạy, thời lượng giờ giảng, thưởng chuyên cần & phụ cấp theo hợp đồng.
          </p>
        </div>

        {/* Month Selector & Print Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-2" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-900 dark:text-white pr-3 py-1 focus:outline-hidden cursor-pointer"
            >
              {availableMonths.map(m => (
                <option key={m.value} value={m.value} className="dark:bg-slate-900">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="In hoặc xuất phiếu lương"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Phiếu Lương</span>
          </button>
        </div>
      </div>

      {/* 2. Key Salary Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TỔNG LƯƠNG THỰC NHẬN (NET PAYOUT) */}
        <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-200">
              Tổng Lương Thực Nhận
            </span>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
          </div>

          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-300 font-heading">
              {formatVND(salaryRecord.totalNetSalary)}
            </div>
            <p className="text-[11px] text-blue-100 mt-1">
              Kỳ: Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
            </p>
          </div>

          <div className="pt-2 border-t border-white/20 text-[10px] font-semibold text-blue-100 flex items-center justify-between">
            <span>Hình thức: Chuyển khoản</span>
            <span className="font-bold text-amber-300">
              {salaryRecord.paymentDate ? `Ngày chi: ${salaryRecord.paymentDate}` : 'Đầu tháng'}
            </span>
          </div>
        </div>

        {/* Card 2: LƯƠNG THEO CA DẠY (SHIFTS PAY) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Lương Theo Ca Dạy
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <School className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              {formatVND(salaryRecord.sessionSalary)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{salaryRecord.totalSessions} ca dạy hoàn thành</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Đơn giá ca:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formatVND(salaryRecord.sessionRate)}/ca
            </span>
          </div>
        </div>

        {/* Card 3: LƯƠNG THEO GIỜ & THỜI LƯỢNG (HOURLY RATE) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tổng Giờ Giảng Dạy
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              {salaryRecord.totalHours} giờ dạy
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Đơn giá: {formatVND(salaryRecord.hourlyRate)}/giờ
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Lương cơ bản cứng:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formatVND(salaryRecord.baseSalary || 0)}
            </span>
          </div>
        </div>

        {/* Card 4: TIỀN THƯỞNG & PHỤ CẤP (BONUSES & ALLOWANCES) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Tiền Thưởng & Phụ Cấp
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-heading">
              +{formatVND(salaryRecord.bonusAmount + (salaryRecord.allowanceAmount || 0))}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
              {salaryRecord.bonusNotes || 'Thưởng chuyên cần 100% & chấm bài'}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Khấu trừ:</span>
            <span className="font-bold text-rose-500">
              -{formatVND(salaryRecord.deductionAmount || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tab Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-xs">
        <button
          onClick={() => setActiveSubTab('payslip')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'payslip'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Bảng Lương Chi Tiết (Payslip)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'shifts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Nhật Ký Từng Ca Dạy ({sessionLogs.length} ca)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bonuses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'bonuses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Chi Tiết Tiền Thưởng & Đãi Ngộ</span>
        </button>
      </div>

      {/* 4. Tab 1: Detailed Payslip & Bank Information */}
      {activeSubTab === 'payslip' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: The Digital Payslip Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                  MINH MUSIC CENTER • PHIẾU THÙ LAO GIẢNG DẠY
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading mt-0.5">
                  Bảng Lương Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-bold block">Mã số: {salaryRecord.id}</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  ✓ {badgeInfo.label}
                </span>
              </div>
            </div>

            {/* Teacher Details Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={salaryRecord.teacherAvatar || currentTeacher.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={salaryRecord.teacherName}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {salaryRecord.teacherName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mã GV: <strong className="text-blue-600 dark:text-blue-400">{salaryRecord.teacherCode}</strong> • Bộ môn: {currentTeacher.specialties?.join(', ') || 'Piano'}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold space-y-0.5 sm:text-right">
                <div>Tổng ca dạy: <strong className="text-slate-900 dark:text-white">{salaryRecord.totalSessions} ca</strong></div>
                <div>Tổng thời lượng: <strong className="text-slate-900 dark:text-white">{salaryRecord.totalHours} giờ</strong></div>
              </div>
            </div>

            {/* Itemized Calculation Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Chi Tiết Các Khoản Thu Nhập
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
                {/* 1. Lương theo ca dạy */}
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white">1. Thù lao theo ca dạy (Shifts Pay)</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {salaryRecord.totalSessions} ca hoàn thành × {formatVND(salaryRecord.sessionRate)}/ca
                    </p>
                  </div>
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    {formatVND(salaryRecord.sessionSalary)}
                  </span>
                </div>

                {/* 2. Lương cứng cơ bản */}
                {salaryRecord.baseSalary && salaryRecord.baseSalary > 0 ? (
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white">2. Lương cứng cơ bản theo hợp đồng</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Phụ cấp giảng viên chính thức / thâm niên
                      </p>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      +{formatVND(salaryRecord.baseSalary)}
                    </span>
                  </div>
                ) : null}

                {/* 3. Tiền thưởng */}
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors bg-amber-50/30 dark:bg-amber-950/20">
                  <div>
                    <span className="font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      3. Tiền thưởng (Chuyên cần & Chất lượng giảng dạy)
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {salaryRecord.bonusNotes || 'Thưởng chuyên cần 100%, phản hồi tốt'}
                    </p>
                  </div>
                  <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                    +{formatVND(salaryRecord.bonusAmount)}
                  </span>
                </div>

                {/* 4. Phụ cấp */}
                {salaryRecord.allowanceAmount > 0 && (
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white">4. Phụ cấp bộ môn & Xăng xe</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Hỗ trợ giáo trình, điều phối và phụ cấp trách nhiệm
                      </p>
                    </div>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      +{formatVND(salaryRecord.allowanceAmount)}
                    </span>
                  </div>
                )}

                {/* 5. Khấu trừ nếu có */}
                {salaryRecord.deductionAmount > 0 && (
                  <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors text-rose-600">
                    <div>
                      <span className="font-extrabold">5. Các khoản giảm trừ / Tạm ứng</span>
                      <p className="text-[11px] text-rose-500/80">
                        {salaryRecord.deductionNotes || 'Tạm ứng hoặc phạt phát sinh'}
                      </p>
                    </div>
                    <span className="font-black text-sm">
                      -{formatVND(salaryRecord.deductionAmount)}
                    </span>
                  </div>
                )}

                {/* TOTAL NET PAYOUT HIGHLIGHT */}
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between rounded-b-2xl">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 block">
                      TỔNG THỰC LĨNH (NET INCOME)
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Đã bao gồm toàn bộ thù lao ca dạy, giờ dạy và thưởng
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-amber-300 font-heading">
                    {formatVND(salaryRecord.totalNetSalary)}
                  </span>
                </div>
              </div>
            </div>

            {/* Note & Policy */}
            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-200/60 dark:border-blue-800/60 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Chính sách tính thù lao giảng viên tại Minh Music Studio:</p>
                <p className="text-[11px] text-blue-800 dark:text-blue-300">
                  Thù lao được chốt vào ngày cuối cùng của tháng theo dữ liệu điểm danh thực tế trên hệ thống. Lương được chuyển khoản từ ngày 01 - 05 hàng tháng. Mọi thắc mắc về ca dạy vui lòng phản hồi phòng đào tạo trước ngày 03.
                </p>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Banking & Payment Info Card */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Building className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                  Tài Khoản Nhận Lương
                </h4>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                  <span>NGÂN HÀNG LIÊN KẾT</span>
                  <span className="px-2 py-0.5 bg-blue-500/30 text-blue-300 rounded text-[10px] uppercase font-black">
                    {salaryRecord.bankName || currentTeacher.bankName || 'Techcombank'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Số Tài Khoản</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-lg font-mono font-black text-amber-300 tracking-wider">
                      {salaryRecord.bankAccount || currentTeacher.bankAccount || '19033458899018'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(salaryRecord.bankAccount || currentTeacher.bankAccount || '19033458899018', 'STK')}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
                      title="Sao chép số tài khoản"
                    >
                      {copiedText === 'STK' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-xs flex items-center justify-between text-slate-300">
                  <span>Chủ tài khoản:</span>
                  <strong className="text-white uppercase font-black">
                    {salaryRecord.bankHolder || currentTeacher.bankHolder || salaryRecord.teacherName}
                  </strong>
                </div>
              </div>

              {/* Transfer Syntax */}
              <div className="space-y-1 text-xs">
                <span className="text-slate-500 font-bold text-[11px]">Cú pháp chi lương:</span>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="truncate">{salaryRecord.transferSyntax || `LUONG ${selectedMonth} ${salaryRecord.teacherCode}`}</span>
                  <button
                    onClick={() => copyToClipboard(salaryRecord.transferSyntax || `LUONG ${selectedMonth} ${salaryRecord.teacherCode}`, 'Syntax')}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors ml-1 cursor-pointer"
                  >
                    {copiedText === 'Syntax' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800"
                >
                  <Printer className="w-4 h-4" />
                  <span>Xem Bản In Phiếu Lương</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Box */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-3xl border border-amber-200 dark:border-amber-800/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Hiệu Suất & Đánh Giá Giảng Dạy</span>
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p>⭐ Đánh giá trung bình từ học viên: <strong className="text-amber-600">4.95/5.0</strong></p>
                <p>🏆 Tỷ lệ điểm danh đúng giờ: <strong className="text-emerald-600">100%</strong></p>
                <p>🎯 Số bài tập video đã chấm: <strong className="text-blue-600">18 bài</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Detailed Teaching Shifts Log Table */}
      {activeSubTab === 'shifts' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                Nhật Ký Từng Ca Dạy ({filteredSessionLogs.length} ca hoàn thành)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chi tiết từng buổi dạy thực tế, thời lượng và mức thù lao tương ứng.
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo lớp, ngày..."
                  value={searchShiftQuery}
                  onChange={(e) => setSearchShiftQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold w-40 sm:w-48 text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              {uniqueClassOptions.length > 0 && (
                <select
                  value={selectedShiftClass}
                  onChange={(e) => setSelectedShiftClass(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="all">Tất cả các lớp</option>
                  {uniqueClassOptions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">STT</th>
                  <th className="px-4 py-3">Ngày Dạy</th>
                  <th className="px-4 py-3">Lớp Học & Môn</th>
                  <th className="px-4 py-3">Phòng Học</th>
                  <th className="px-4 py-3">Thời Gian / Giờ</th>
                  <th className="px-4 py-3">Sĩ Số Đi Học</th>
                  <th className="px-4 py-3">Đơn Giá Ca</th>
                  <th className="px-4 py-3 text-right">Thù Lao Buổi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSessionLogs.length > 0 ? (
                  filteredSessionLogs.map((shift, idx) => (
                    <tr key={shift.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {shift.date}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400 block">
                          {shift.className}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {shift.subjectName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {shift.room || 'Phòng 01'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {shift.startTime || '17:30'} - {shift.endTime || '19:00'}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          ({shift.durationHours} giờ)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px]">
                          <Users className="w-3 h-3" />
                          {shift.studentsAttendedCount} học viên
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatVND(shift.sessionRate || salaryRecord.sessionRate)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-slate-900 dark:text-white text-sm whitespace-nowrap">
                        {formatVND(shift.calculatedAmount || shift.sessionRate || salaryRecord.sessionRate)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      <p className="font-bold text-sm">Chưa có nhật ký ca dạy trong khoảng thời gian này</p>
                      <p className="text-xs mt-1">Dữ liệu ca dạy được tự động cập nhật ngay khi bạn điểm danh lớp học.</p>
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-black border-t border-slate-200 dark:border-slate-700">
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-right text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Tổng Thù Lao Ca Dạy ({filteredSessionLogs.length} ca):
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-blue-600 dark:text-blue-400">
                    {formatVND(filteredSessionLogs.reduce((sum, s) => sum + (s.calculatedAmount || s.sessionRate || salaryRecord.sessionRate), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Detailed Bonus & Incentives Breakdown */}
      {activeSubTab === 'bonuses' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Danh Sách Các Khoản Thưởng & Đãi Ngộ (Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thưởng ghi nhận cống hiến, độ chuyên cần, phản hồi tích cực từ học viên và chất lượng đào tạo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(salaryRecord.bonusesList && salaryRecord.bonusesList.length > 0 ? salaryRecord.bonusesList : [
                { id: 'b1', title: 'Thưởng chuyên cần giảng dạy 100%', amount: 500000, type: 'attendance', date: `${selectedMonth}-28`, notes: 'Không đi muộn, không vắng buổi nào trong tháng' },
                { id: 'b2', title: 'Thưởng chất lượng & chấm bài video chăm chỉ', amount: 500000, type: 'performance', date: `${selectedMonth}-30`, notes: 'Chấm 100% video thực hành của học viên đúng hạn' }
              ]).map((bn: any, idx: number) => (
                <div 
                  key={bn.id || idx}
                  className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {bn.title}
                        </h4>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          {bn.type === 'attendance' ? '🌟 Chuyên cần' : bn.type === 'performance' ? '🏆 Thành tích học viên' : '🎯 KPI Đào tạo'}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      +{formatVND(bn.amount)}
                    </span>
                  </div>

                  {bn.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                      {bn.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Allowance Card */}
            {salaryRecord.allowanceAmount > 0 && (
              <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-600 text-white rounded-xl">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Phụ Cấp Trách Nhiệm & Xăng Xe
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hỗ trợ công tác quản lý chuyên môn và học liệu bộ môn
                    </p>
                  </div>
                </div>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                  +{formatVND(salaryRecord.allowanceAmount)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Printable Payslip Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-lg font-heading shadow-md">
                  M
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-heading">
                    TRUNG TÂM ÂM NHẠC MINH MUSIC
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    PHIẾU THANH TOÁN THÙ LAO GIẢNG DẠY (PAYSLIP)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs font-bold"
              >
                ✕ Đóng
              </button>
            </div>

            {/* Content for Printing */}
            <div className="space-y-4 text-xs" id="printable-payslip">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Giảng viên</span>
                  <strong className="text-slate-900 dark:text-white text-sm">{salaryRecord.teacherName}</strong>
                  <span className="text-slate-500 block">Mã số: {salaryRecord.teacherCode}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Kỳ lương</span>
                  <strong className="text-slate-900 dark:text-white text-sm">Tháng {selectedMonth}</strong>
                  <span className="text-emerald-600 font-bold block">{badgeInfo.label}</span>
                </div>
              </div>

              <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">1. Số ca dạy ({salaryRecord.totalSessions} ca × {formatVND(salaryRecord.sessionRate)}):</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatVND(salaryRecord.sessionSalary)}</span>
                </div>
                {salaryRecord.baseSalary ? (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">2. Lương cơ bản:</span>
                    <span className="font-bold text-slate-900 dark:text-white">+{formatVND(salaryRecord.baseSalary)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">3. Tiền thưởng (Chuyên cần & KPIs):</span>
                  <span className="font-bold text-amber-600">+{formatVND(salaryRecord.bonusAmount)}</span>
                </div>
                {salaryRecord.allowanceAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">4. Phụ cấp trách nhiệm:</span>
                    <span className="font-bold text-slate-900 dark:text-white">+{formatVND(salaryRecord.allowanceAmount)}</span>
                  </div>
                )}
                {salaryRecord.deductionAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800 text-rose-500">
                    <span>5. Giảm trừ / Tạm ứng:</span>
                    <span className="font-bold">-{formatVND(salaryRecord.deductionAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-sm font-black text-slate-900 dark:text-white border-t-2 border-slate-900 dark:border-slate-600">
                  <span className="uppercase">TỔNG LƯƠNG THỰC NHẬN:</span>
                  <span className="text-blue-600 dark:text-amber-400 text-base">{formatVND(salaryRecord.totalNetSalary)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between text-[11px]">
                <span>Tài khoản nhận: <strong>{salaryRecord.bankName} - {salaryRecord.bankAccount}</strong></span>
                <span>Chủ TK: <strong>{salaryRecord.bankHolder}</strong></span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>In Phiếu Lương Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
