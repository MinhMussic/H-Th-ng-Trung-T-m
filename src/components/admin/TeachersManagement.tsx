import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Teacher, ClassItem } from '../../types';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Cake,
  Music,
  Edit2,
  Trash2,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  DollarSign,
  Printer,
  FileText,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  Download,
  AlertCircle,
  Building,
  GraduationCap
} from 'lucide-react';

interface SalarySlipModalProps {
  teacher: Teacher;
  month: string;
  year: number;
  classesTaught: ClassItem[];
  hourlyRate: number;
  totalHours: number;
  baseSalary: number;
  bonus: number;
  allowance: number;
  deduction: number;
  netSalary: number;
  note: string;
  onClose: () => void;
}

const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  teacher,
  month,
  year,
  classesTaught,
  hourlyRate,
  totalHours,
  baseSalary,
  bonus,
  allowance,
  deduction,
  netSalary,
  note,
  onClose
}) => {
  const { branding } = useData();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                Phiếu Lương & Thù Lao Giảng Dạy
              </span>
              <h3 className="text-lg font-black font-heading mt-0.5">
                {teacher.fullName} ({teacher.code})
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content printable */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1 print:p-0">
          {/* Center Brand Header */}
          <div className="flex items-center justify-between border-b pb-4 border-slate-200">
            <div>
              <h4 className="text-base font-black text-slate-900 uppercase font-heading">
                {branding.centerName || 'HỆ THỐNG TRUNG TÂM ÂM NHẠC MINH MUSIC'}
              </h4>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {branding.tagline || 'Ươm mầm tài năng âm nhạc & nghệ thuật biểu diễn'}
              </p>
              <p className="text-slate-400 text-[10px] mt-0.5">Hotline: {branding.phone || '0901.234.567'} | Email: contact@minhmusic.vn</p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-blue-50 text-blue-800 font-black rounded-lg border border-blue-200 text-xs inline-block">
                Kỳ Lương: {month}/{year}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Ngày lập: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          {/* Teacher Profile Summary */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Giảng viên / Giáo viên</span>
              <p className="text-sm font-black text-slate-900 mt-0.5">{teacher.fullName}</p>
              <p className="text-slate-600 text-[11px] mt-0.5">Chuyên môn: {teacher.specialties.join(', ')}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Thông tin liên lạc</span>
              <p className="text-slate-700 font-semibold mt-0.5">SĐT: {teacher.phone}</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Email: {teacher.email}</p>
            </div>
          </div>

          {/* Classes Taught breakdown */}
          <div>
            <h5 className="font-extrabold text-slate-800 mb-2 flex items-center gap-1.5 text-xs">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Danh sách lớp học & ca dạy phụ trách ({classesTaught.length} lớp)</span>
            </h5>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Mã / Tên Lớp</th>
                    <th className="p-2.5">Bộ môn & Trình độ</th>
                    <th className="p-2.5">Lịch học & Phòng</th>
                    <th className="p-2.5 text-center">Học viên</th>
                    <th className="p-2.5 text-right">Số ca dạy/tháng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classesTaught.length > 0 ? (
                    classesTaught.map((c) => {
                      const scheduleDisplay = c.schedule || c.scheduleText || 'Thứ 2, 4 (18:00 - 19:00)';
                      const daysCount = c.scheduleDays?.length || c.daysOfWeek?.length || 2;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold text-blue-700">
                            {c.name} <span className="text-slate-400 font-normal">({c.code})</span>
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {c.subjectName || c.subject || 'Piano'} - <span className="font-medium text-amber-700">{c.level || 'Cơ bản'}</span>
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {scheduleDisplay} - {c.room || c.roomName || 'Phòng A1'}
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-700">
                            {c.studentIds?.length || 4} HV
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            {daysCount * 4} ca
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-slate-400 italic">
                        Chưa có phân công lớp cố định trong kỳ lương này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Salary Calculation Formula */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
            <h5 className="font-black text-slate-800 text-xs uppercase tracking-wide">
              Chi tiết các khoản thu nhập & khấu trừ
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600 font-medium">1. Định mức thù lao theo giờ:</span>
                <span className="font-bold text-slate-900">{hourlyRate.toLocaleString('vi-VN')} đ/giờ</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600 font-medium">2. Tổng số giờ đứng lớp ({totalHours} giờ):</span>
                <span className="font-bold text-slate-900">{baseSalary.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-emerald-700 font-medium">+ Thưởng chuyên cần / Học viên xuất sắc:</span>
                <span className="font-bold text-emerald-700">+{bonus.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-blue-700 font-medium">+ Phụ cấp quản lý & giáo trình:</span>
                <span className="font-bold text-blue-700">+{allowance.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-rose-600 font-medium">- Khấu trừ (nghỉ ca không phép / tạm ứng):</span>
                <span className="font-bold text-rose-600">-{deduction.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-sm">
                <span className="font-black text-slate-900 text-sm">THỰC NHẬN (NET SALARY):</span>
                <span className="font-black text-rose-600 text-base">{netSalary.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

          {note && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
              <strong>Ghi chú: </strong> {note}
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 text-center">
            <div>
              <p className="font-bold text-slate-700">Giảng Viên Ký Nhận</p>
              <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
              <div className="h-16 mt-2 flex items-center justify-center font-serif text-slate-400 italic">
                {teacher.fullName}
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-700">Giám Đốc / Quản Lý Trung Tâm</p>
              <p className="text-[10px] text-slate-400 italic mt-0.5">(Ký, đóng dấu)</p>
              <div className="h-16 mt-2 flex items-center justify-center font-bold text-blue-800">
                Thầy Hoàng Minh
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Đóng
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Lương</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TeachersManagement: React.FC = () => {
  const { teachers, classes, addTeacher, updateTeacher, deleteTeacher } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'teachers' | 'payroll'>('teachers');
  const [selectedMonth, setSelectedMonth] = useState<string>('08');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected teacher for salary slip modal
  const [viewingSlipTeacher, setViewingSlipTeacher] = useState<Teacher | null>(null);

  // Custom adjustments per teacher for payroll
  const [salaryAdjustments, setSalaryAdjustments] = useState<Record<string, { bonus: number; allowance: number; deduction: number; note: string; status: 'paid' | 'pending' }>>({});

  // Form states
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('1992-06-15');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(['Piano']);
  const [hourlyRate, setHourlyRate] = useState<number>(250000);
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<'active' | 'on_leave' | 'inactive'>('active');

  const specialtiesList = ['Piano', 'Guitar', 'Thanh nhạc', 'Violin', 'Trống / Drum', 'Organ', 'Cảm thụ âm nhạc'];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredTeachers = teachers.filter(t => {
    if (specialtyFilter !== 'ALL' && !t.specialties.includes(specialtyFilter)) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return t.fullName.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.phone.includes(q) || t.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setCode(`GV${String(teachers.length + 1).padStart(3, '0')}`);
    setFullName('');
    setBirthDate('1992-06-15');
    setPhone('');
    setEmail('');
    setSelectedSpecialties(['Piano']);
    setHourlyRate(250000);
    setBio('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setCode(t.code);
    setFullName(t.fullName);
    setBirthDate(t.birthDate);
    setPhone(t.phone);
    setEmail(t.email);
    setSelectedSpecialties(t.specialties);
    setHourlyRate(t.hourlyRate || 250000);
    setBio(t.bio || '');
    setStatus(t.status);
    setIsModalOpen(true);
  };

  const handleSaveTeacher = () => {
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      alert('Vui lòng nhập đầy đủ Họ tên, Số điện thoại và Email');
      return;
    }

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        code,
        fullName,
        birthDate,
        phone,
        email,
        specialties: selectedSpecialties,
        hourlyRate,
        bio,
        status
      });
      showToast(`Đã cập nhật hồ sơ giáo viên ${fullName}`);
    } else {
      addTeacher({
        code,
        fullName,
        birthDate,
        phone,
        email,
        specialties: selectedSpecialties,
        hourlyRate,
        bio,
        hireDate: new Date().toISOString().split('T')[0],
        status
      });
      showToast(`Đã thêm mới giáo viên ${fullName}`);
    }

    setIsModalOpen(false);
  };

  // Helper to compute payroll details for a teacher
  const computePayroll = (t: Teacher) => {
    // Find classes where teacher is primary or assistant
    const assignedClasses = classes.filter(c => 
      c.status === 'active' && (
        c.teacherId === t.id || 
        c.teacherIds?.includes(t.id) ||
        c.teacherName === t.fullName ||
        c.additionalTeachers?.some(at => at.teacherId === t.id)
      )
    );

    // Estimate total sessions in a month: 4 weeks * sessions per week per class
    let totalSessions = 0;
    assignedClasses.forEach(c => {
      const daysCount = c.scheduleDays?.length || c.daysOfWeek?.length || 2;
      totalSessions += daysCount * 4;
    });

    // Default 1.25 hour per session if not specified
    const rate = t.hourlyRate || 250000;
    const totalHours = Math.round(totalSessions * 1.25);
    const baseSalary = totalHours * rate;

    const adj = salaryAdjustments[t.id] || {
      bonus: 500000,
      allowance: 300000,
      deduction: 0,
      note: 'Giảng dạy chuẩn giờ, phản hồi phụ huynh tích cực.',
      status: 'pending'
    };

    const netSalary = baseSalary + (adj.bonus || 0) + (adj.allowance || 0) - (adj.deduction || 0);

    return {
      teacher: t,
      assignedClasses,
      totalSessions,
      totalHours,
      rate,
      baseSalary,
      bonus: adj.bonus ?? 500000,
      allowance: adj.allowance ?? 300000,
      deduction: adj.deduction ?? 0,
      netSalary,
      note: adj.note || '',
      status: adj.status || 'pending'
    };
  };

  const allPayrolls = teachers.map(computePayroll);
  const totalPayrollBudget = allPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalTeachingHours = allPayrolls.reduce((sum, p) => sum + p.totalHours, 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-5 lg:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="w-full lg:w-auto lg:max-w-md xl:max-w-xl min-w-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-300/40 dark:border-blue-700/40 shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight break-words leading-snug">
                Đội Ngũ Giáo Viên & Thù Lao Giảng Dạy
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
                Quản lý hồ sơ giảng viên, phân công đứng lớp, tính lương theo ca dạy và xuất phiếu thù lao minh bạch.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveSubTab('teachers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'teachers'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Hồ Sơ ({teachers.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('payroll')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'payroll'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Bảng Tính Lương ({teachers.length})</span>
            </button>
          </div>

          {activeSubTab === 'teachers' && (
            <button
              id="btn-add-teacher"
              onClick={handleOpenAdd}
              className="px-4 py-2 min-h-[38px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span>Thêm giáo viên mới</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: HỒ SƠ GIÁO VIÊN */}
      {/* ========================================================================= */}
      {activeSubTab === 'teachers' && (
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 overflow-hidden min-w-0 w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
            <div className="relative flex-1 min-w-0 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 shrink-0" />
              <input
                type="text"
                placeholder="Tìm theo mã GV, tên, chuyên môn, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full sm:w-auto text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả chuyên môn</option>
                {specialtiesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Teachers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((t) => {
              const birth = new Date(t.birthDate);
              const age = isNaN(birth.getTime()) ? '—' : new Date().getFullYear() - birth.getFullYear();
              const teacherClasses = classes.filter(c => 
                c.status === 'active' && (
                  c.teacherId === t.id || 
                  c.teacherIds?.includes(t.id) ||
                  c.teacherName === t.fullName ||
                  c.additionalTeachers?.some(at => at.teacherId === t.id)
                )
              );

              return (
                <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px] border border-blue-200">
                        {t.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Đang giảng dạy
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      {t.avatar ? (
                        <img src={t.avatar} alt={t.fullName} className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/20" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-base">
                          {t.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 font-heading">{t.fullName}</h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Cake className="w-3 h-3 text-rose-500" />
                          {t.birthDate} ({age} tuổi)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.phone}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{t.email}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {t.specialties.map(spec => (
                        <span key={spec} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Classes assigned */}
                    <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
                      <span className="font-bold text-slate-600 block mb-0.5">Lớp đang phụ trách ({teacherClasses.length}):</span>
                      {teacherClasses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacherClasses.map(c => (
                            <span key={c.id} className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-700 font-medium rounded text-[10px]">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa xếp lớp</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Định mức thù lao</span>
                      <span className="text-xs font-black text-slate-900">
                        {t.hourlyRate ? `${t.hourlyRate.toLocaleString('vi-VN')} đ/h` : '250.000 đ/h'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Sửa giáo viên"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa hồ sơ giáo viên ${t.fullName}?`)) {
                            deleteTeacher(t.id);
                            showToast(`Đã xóa giáo viên ${t.fullName}`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa giáo viên"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: BẢNG TÍNH LƯƠNG & CA DẠY */}
      {/* ========================================================================= */}
      {activeSubTab === 'payroll' && (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs text-blue-100 font-bold uppercase tracking-wider block">
                Tổng ngân sách thù lao (Tháng {selectedMonth}/{selectedYear})
              </span>
              <div className="text-2xl font-black font-heading mt-1">
                {totalPayrollBudget.toLocaleString('vi-VN')} đ
              </div>
              <p className="text-[11px] text-blue-100/90 mt-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Cho {teachers.length} giáo viên & trợ giảng
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider block">
                Tổng giờ đứng lớp dự kiến
              </span>
              <div className="text-2xl font-black font-heading mt-1">
                {totalTeachingHours} giờ
              </div>
              <p className="text-[11px] text-emerald-100/90 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Tính trên {classes.length} lớp học hoạt động
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-sm space-y-1">
              <span className="text-xs text-amber-100 font-bold uppercase tracking-wider block">
                Thưởng chuyên cần & Phụ cấp
              </span>
              <div className="text-2xl font-black font-heading mt-1">
                {(teachers.length * 800000).toLocaleString('vi-VN')} đ
              </div>
              <p className="text-[11px] text-amber-100/90 mt-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Đánh giá tích cực từ học viên & phụ huynh
              </p>
            </div>
          </div>

          {/* Month / Year Selector & Actions */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Kỳ tính lương:</span>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                  <option key={m} value={m}>Tháng {m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value={2025}>Năm 2025</option>
                <option value={2026}>Năm 2026</option>
                <option value={2027}>Năm 2027</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Công thức: (Số giờ dạy x Đơn giá/h) + Thưởng + Phụ cấp - Khấu trừ
              </span>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-slate-700 text-[11px] uppercase">
                  <tr>
                    <th className="p-3.5">Giáo Viên</th>
                    <th className="p-3.5">Lớp Phụ Trách</th>
                    <th className="p-3.5 text-center">Số Ca / Giờ Dạy</th>
                    <th className="p-3.5 text-right">Đơn Giá / Giờ</th>
                    <th className="p-3.5 text-right">Lương Giờ Dạy</th>
                    <th className="p-3.5 text-right">Thưởng & Phụ Cấp</th>
                    <th className="p-3.5 text-right">Thực Nhận</th>
                    <th className="p-3.5 text-center">Trạng Thái</th>
                    <th className="p-3.5 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {allPayrolls.map((p) => (
                    <tr key={p.teacher.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          {p.teacher.avatar ? (
                            <img src={p.teacher.avatar} alt={p.teacher.fullName} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                              {p.teacher.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">
                              {p.teacher.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {p.teacher.code} • {p.teacher.specialties[0]}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="max-w-[200px]">
                          {p.assignedClasses.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {p.assignedClasses.map(c => (
                                <span key={c.id} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Dạy kèm riêng 1-1</span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-center font-bold text-slate-800 dark:text-slate-200">
                        <span>{p.totalSessions} ca</span>
                        <span className="text-slate-400 font-normal text-[11px] block">({p.totalHours} giờ)</span>
                      </td>

                      <td className="p-3.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                        {p.rate.toLocaleString('vi-VN')} đ
                      </td>

                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white">
                        {p.baseSalary.toLocaleString('vi-VN')} đ
                      </td>

                      <td className="p-3.5 text-right font-bold text-emerald-600">
                        +{(p.bonus + p.allowance).toLocaleString('vi-VN')} đ
                      </td>

                      <td className="p-3.5 text-right font-black text-rose-600 dark:text-rose-400 text-sm">
                        {p.netSalary.toLocaleString('vi-VN')} đ
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => {
                            const currentStatus = salaryAdjustments[p.teacher.id]?.status || 'pending';
                            const nextStatus = currentStatus === 'paid' ? 'pending' : 'paid';
                            setSalaryAdjustments(prev => ({
                              ...prev,
                              [p.teacher.id]: {
                                ...(prev[p.teacher.id] || { bonus: p.bonus, allowance: p.allowance, deduction: p.deduction, note: p.note }),
                                status: nextStatus
                              }
                            }));
                            showToast(`Đã cập nhật trạng thái lương: ${nextStatus === 'paid' ? 'Đã chi trả' : 'Chờ duyệt'}`);
                          }}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                            (salaryAdjustments[p.teacher.id]?.status || 'pending') === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          {(salaryAdjustments[p.teacher.id]?.status || 'pending') === 'paid' ? '✓ Đã Chi Trả' : '⏳ Chờ Chi Trả'}
                        </button>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setViewingSlipTeacher(p.teacher)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl border border-blue-200 text-xs flex items-center gap-1 mx-auto transition-all cursor-pointer shadow-xs"
                          title="Xem & In phiếu lương"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Phiếu Lương</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA GIÁO VIÊN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                {editingTeacher ? 'Sửa Hồ Sơ Giáo Viên' : 'Thêm Giáo Viên Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã giáo viên:</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên (*):</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Thầy Hoàng Minh"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh (*):</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thù lao giờ dạy (VNĐ):</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại (*):</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email (*):</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="minh.teacher@minhmusic.vn"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chuyên môn giảng dạy:</label>
                <div className="flex flex-wrap gap-2">
                  {specialtiesList.map((spec) => {
                    const isSelected = selectedSpecialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (selectedSpecialties.length > 1) {
                              setSelectedSpecialties(selectedSpecialties.filter(s => s !== spec));
                            }
                          } else {
                            setSelectedSpecialties([...selectedSpecialties, spec]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {spec} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giới thiệu kinh nghiệm / Tiểu sử:</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Kinh nghiệm biểu diễn, phương pháp giảng dạy..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trạng thái:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="active">Đang giảng dạy</option>
                  <option value="on_leave">Nghỉ phép tạm thời</option>
                  <option value="inactive">Đã nghỉ việc</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveTeacher}
                className="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-sm"
              >
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SALARY SLIP MODAL */}
      {viewingSlipTeacher && (
        <SalarySlipModal
          teacher={viewingSlipTeacher}
          month={selectedMonth}
          year={selectedYear}
          classesTaught={classes.filter(c => 
            c.status === 'active' && (
              c.teacherId === viewingSlipTeacher.id || 
              c.teacherIds?.includes(viewingSlipTeacher.id) ||
              c.teacherName === viewingSlipTeacher.fullName ||
              c.additionalTeachers?.some(at => at.teacherId === viewingSlipTeacher.id)
            )
          )}
          hourlyRate={viewingSlipTeacher.hourlyRate || 250000}
          totalHours={computePayroll(viewingSlipTeacher).totalHours}
          baseSalary={computePayroll(viewingSlipTeacher).baseSalary}
          bonus={computePayroll(viewingSlipTeacher).bonus}
          allowance={computePayroll(viewingSlipTeacher).allowance}
          deduction={computePayroll(viewingSlipTeacher).deduction}
          netSalary={computePayroll(viewingSlipTeacher).netSalary}
          note={computePayroll(viewingSlipTeacher).note}
          onClose={() => setViewingSlipTeacher(null)}
        />
      )}
    </div>
  );
};
