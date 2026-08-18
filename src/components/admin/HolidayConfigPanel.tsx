import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { CenterHoliday } from '../../types';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  RefreshCw,
  Clock,
  Info,
  Calendar,
  X,
  Check,
  Palmtree,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Sun
} from 'lucide-react';

export const HolidayConfigPanel: React.FC = () => {
  const {
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    toggleHolidayActive,
    resetHolidaysToDefault
  } = useData();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>(currentYear);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<CenterHoliday | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [year, setYear] = useState<number>(currentYear);
  const [type, setType] = useState<CenterHoliday['type']>('national');
  const [description, setDescription] = useState('');
  const [autoExemptAttendance, setAutoExemptAttendance] = useState(true);
  const [isActive, setIsActive] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingHoliday(null);
    setName('');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setYear(currentYear);
    setType('national');
    setDescription('');
    setAutoExemptAttendance(true);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (h: CenterHoliday) => {
    setEditingHoliday(h);
    setName(h.name);
    setStartDate(h.startDate);
    setEndDate(h.endDate);
    setYear(h.year || parseInt(h.startDate.split('-')[0], 10) || currentYear);
    setType(h.type || 'national');
    setDescription(h.description || '');
    setAutoExemptAttendance(h.autoExemptAttendance !== undefined ? h.autoExemptAttendance : true);
    setIsActive(h.isActive);
    setIsModalOpen(true);
  };

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e.getTime() - s.getTime();
    if (diffTime < 0) return 1;
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) {
      showToast('⚠️ Vui lòng điền đầy đủ tên ngày nghỉ và khoảng thời gian!');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      showToast('⚠️ Ngày kết thúc không thể trước ngày bắt đầu!');
      return;
    }

    const calculatedYear = year || parseInt(startDate.split('-')[0], 10) || currentYear;

    if (editingHoliday) {
      updateHoliday(editingHoliday.id, {
        name: name.trim(),
        startDate,
        endDate,
        year: calculatedYear,
        type,
        description: description.trim(),
        autoExemptAttendance,
        isActive
      });
      showToast(`✓ Đã cập nhật thành công ngày nghỉ lễ "${name}"!`);
    } else {
      addHoliday({
        name: name.trim(),
        startDate,
        endDate,
        year: calculatedYear,
        type,
        description: description.trim(),
        autoExemptAttendance,
        isActive
      });
      showToast(`✓ Đã thêm mới ngày nghỉ lễ "${name}" vào hệ thống!`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteHoliday = (id: string, hName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ngày nghỉ lễ "${hName}" khỏi danh sách cấu hình?`)) {
      deleteHoliday(id);
      showToast(`✓ Đã xóa ngày nghỉ lễ "${hName}"!`);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Bạn có muốn khôi phục danh sách các ngày nghỉ lễ chuẩn Việt Nam (2025 - 2026)? Toàn bộ dữ liệu ngày lễ mặc định sẽ được nạp lại.')) {
      resetHolidaysToDefault();
      showToast('✓ Đã nạp lại danh sách ngày nghỉ lễ chuẩn Việt Nam thành công!');
    }
  };

  // Filtered list
  const filteredHolidays = holidays.filter(h => {
    // Year filter
    if (selectedYear !== 'ALL' && h.year !== selectedYear) {
      // also check startDate year
      const startYear = parseInt(h.startDate.split('-')[0], 10);
      if (startYear !== selectedYear) return false;
    }
    // Type filter
    if (selectedType !== 'ALL' && h.type !== selectedType) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchDesc = h.description?.toLowerCase().includes(q) || false;
      const matchDate = h.startDate.includes(q) || h.endDate.includes(q);
      if (!matchName && !matchDesc && !matchDate) return false;
    }
    return true;
  }).sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Statistics
  const totalDaysOff = filteredHolidays
    .filter(h => h.isActive)
    .reduce((sum, h) => sum + calculateDays(h.startDate, h.endDate), 0);

  const activeCount = filteredHolidays.filter(h => h.isActive).length;
  const autoExemptCount = filteredHolidays.filter(h => h.isActive && h.autoExemptAttendance).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingHolidays = holidays.filter(h => h.isActive && h.endDate >= todayStr).sort((a, b) => a.startDate.localeCompare(b.startDate));

  const getTypeBadge = (type: CenterHoliday['type']) => {
    switch (type) {
      case 'national':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
            <Flame className="w-3 h-3 text-red-500" />
            <span>Quốc Lễ Toàn Quốc</span>
          </span>
        );
      case 'center':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Nghỉ Nội Bộ Trung Tâm</span>
          </span>
        );
      case 'break':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
            <Sun className="w-3 h-3 text-emerald-500" />
            <span>Kỳ Nghỉ Định Kỳ / Hè</span>
          </span>
        );
      case 'custom':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
            <Palmtree className="w-3 h-3 text-amber-500" />
            <span>Nghỉ Đột Xuất / Khác</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-md shadow-amber-500/20">
              <Palmtree className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                Cấu Hình Danh Sách Ngày Nghỉ Lễ Trong Năm
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hệ thống tự động không tính các ngày này vào lịch điểm danh của học viên, bảo lưu buổi học và không trừ điểm sao chuyên cần.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetToDefault}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Nạp lại các ngày lễ chuẩn Việt Nam 2025 - 2026"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Nạp Lễ Chuẩn VN</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Ngày Nghỉ Lễ</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số đợt nghỉ lễ</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              {filteredHolidays.length} <span className="text-xs font-semibold text-slate-400">dịp lễ</span>
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số ngày nghỉ</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              {totalDaysOff} <span className="text-xs font-semibold text-slate-400">ngày</span>
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tự động miễn điểm danh</p>
            <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
              {autoExemptCount} / {activeCount} <span className="text-xs font-semibold text-slate-400">đang bật</span>
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Palmtree className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dịp nghỉ tiếp theo</p>
            <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200 truncate max-w-[140px]" title={upcomingHolidays[0]?.name || 'Không có'}>
              {upcomingHolidays[0] ? upcomingHolidays[0].name : 'Chưa có lịch'}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              {upcomingHolidays[0] ? upcomingHolidays[0].startDate : '--/--/----'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Explanatory Card */}
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-extrabold text-amber-950 dark:text-amber-100">
            Quy tắc hoạt động tự động của Lịch Nghỉ Lễ:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-[11.5px] text-amber-800 dark:text-amber-300">
            <li>
              <strong>Tạm ngưng điểm danh:</strong> Khi ngày hiện tại hoặc ngày được chọn trong màn hình Điểm danh nằm trong khoảng thời gian nghỉ lễ đã bật, hệ thống sẽ hiển thị biểu ngữ thông báo và không tính buổi học vào tiến độ của học viên.
            </li>
            <li>
              <strong>Không trừ sao chuyên cần:</strong> Các trường hợp vắng mặt vào ngày nghỉ lễ sẽ tự động được miễn trừ điểm phạt (-2⭐), bảo toàn 100% điểm sao và số buổi học còn lại của học viên.
            </li>
            <li>
              <strong>Đồng bộ lịch học:</strong> Toàn bộ giảng viên và phụ huynh sẽ thấy thông tin ngày nghỉ lễ khi tra cứu thời khóa biểu trên ứng dụng.
            </li>
          </ul>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year selector pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setSelectedYear('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedYear === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tất cả năm
            </button>
            <button
              onClick={() => setSelectedYear(2025)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedYear === 2025
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Năm 2025
            </button>
            <button
              onClick={() => setSelectedYear(2026)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedYear === 2026
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Năm 2026
            </button>
            <button
              onClick={() => setSelectedYear(2027)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedYear === 2027
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Năm 2027
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
          >
            <option value="ALL">Mọi loại ngày nghỉ</option>
            <option value="national">Quốc Lễ Toàn Quốc</option>
            <option value="center">Nghỉ Nội Bộ Trung Tâm</option>
            <option value="break">Kỳ Nghỉ Định Kỳ / Hè</option>
            <option value="custom">Nghỉ Đột Xuất / Khác</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm ngày lễ, ngày nghỉ..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Holiday Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredHolidays.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Palmtree className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              Không tìm thấy ngày nghỉ lễ nào
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không có ngày nghỉ lễ nào khớp với bộ lọc hiện tại. Bấm "Thêm Ngày Nghỉ Lễ" hoặc "Nạp Lễ Chuẩn VN" để thiết lập.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={handleResetToDefault}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Nạp Lễ Chuẩn VN
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                + Thêm Ngày Nghỉ Lễ
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10.5px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Tên Ngày Nghỉ Lễ</th>
                  <th className="py-3.5 px-4">Khoảng Thời Gian</th>
                  <th className="py-3.5 px-4 text-center">Số Ngày Nghỉ</th>
                  <th className="py-3.5 px-4">Phân Loại</th>
                  <th className="py-3.5 px-4 text-center">Miễn Điểm Danh</th>
                  <th className="py-3.5 px-4 text-center">Kích Hoạt</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                {filteredHolidays.map((h) => {
                  const days = calculateDays(h.startDate, h.endDate);
                  const isCurrentHoliday = todayStr >= h.startDate && todayStr <= h.endDate;

                  return (
                    <tr
                      key={h.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isCurrentHoliday ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                      } ${!h.isActive ? 'opacity-50' : ''}`}
                    >
                      {/* Name & Description */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                                {h.name}
                              </span>
                              {isCurrentHoliday && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-white animate-pulse">
                                  🌴 Đang diễn ra
                                </span>
                              )}
                            </div>
                            {h.description && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                                {h.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date Range */}
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>{h.startDate}</span>
                          {h.startDate !== h.endDate && (
                            <>
                              <span className="text-slate-400">→</span>
                              <span>{h.endDate}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Days Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {days} ngày
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        {getTypeBadge(h.type)}
                      </td>

                      {/* Auto Exempt Attendance Status */}
                      <td className="py-3.5 px-4 text-center">
                        {h.autoExemptAttendance ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Tự động miễn</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <span>Không miễn</span>
                          </span>
                        )}
                      </td>

                      {/* Active Toggle Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleHolidayActive(h.id)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer mx-auto ${
                            h.isActive ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={h.isActive ? 'Bấm để tạm tắt ngày nghỉ này' : 'Bấm để kích hoạt ngày nghỉ này'}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              h.isActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(h)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Sửa ngày nghỉ lễ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(h.id, h.name)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa ngày nghỉ lễ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL: THÊM / CHỈNH SỬA NGÀY NGHỈ LỄ */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-xl">
                  <Palmtree className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                  {editingHoliday ? 'Chỉnh Sửa Ngày Nghỉ Lễ' : 'Thêm Ngày Nghỉ Lễ Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHoliday} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Ngày Nghỉ Lễ (*):
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Tết Nguyên Đán, Giỗ Tổ Hùng Vương, Nghỉ lễ Quốc khánh..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày bắt đầu (*):
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (!endDate || new Date(endDate) < new Date(e.target.value)) {
                        setEndDate(e.target.value);
                      }
                      const yr = parseInt(e.target.value.split('-')[0], 10);
                      if (yr) setYear(yr);
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày kết thúc (*):
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Duration Notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-amber-900 dark:text-amber-200">
                <span className="font-semibold">Thời lượng kỳ nghỉ:</span>
                <span className="font-black text-amber-800 dark:text-amber-300 text-sm">
                  {calculateDays(startDate, endDate)} ngày nghỉ liên tiếp
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phân loại ngày nghỉ:
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="national">Quốc Lễ Toàn Quốc</option>
                    <option value="center">Nghỉ Nội Bộ Trung Tâm</option>
                    <option value="break">Kỳ Nghỉ Định Kỳ / Hè</option>
                    <option value="custom">Nghỉ Đột Xuất / Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Năm áp dụng:
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mô tả / Ghi chú cho Phụ huynh & Học viên:
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Trung tâm nghỉ lễ theo quy định nhà nước. Toàn bộ buổi học được tự động bảo lưu."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white leading-relaxed"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoExemptAttendance}
                    onChange={(e) => setAutoExemptAttendance(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Tự động không tính vào lịch điểm danh của học viên
                    </span>
                    <p className="text-[10.5px] text-slate-400">
                      Học viên vắng mặt vào ngày này sẽ không bị trừ sao chuyên cần và buổi học được bảo lưu trọn vẹn.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Kích hoạt ngày nghỉ lễ này ngay lập tức
                    </span>
                  </div>
                </label>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {editingHoliday ? 'Lưu Thay Đổi' : 'Thêm Ngày Nghỉ Lễ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
