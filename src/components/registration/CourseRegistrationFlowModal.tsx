import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Student, Subject, Course, MusicClass } from '../../types';
import {
  X,
  Sparkles,
  Music,
  CheckCircle2,
  Calendar,
  Clock,
  Send,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  DollarSign,
  Info,
  CalendarDays,
  Check,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CourseRegistrationFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudent: Student;
  isParentView?: boolean;
  parentName?: string;
  onSuccess?: () => void;
}

export const CourseRegistrationFlowModal: React.FC<CourseRegistrationFlowModalProps> = ({
  isOpen,
  onClose,
  targetStudent,
  isParentView = false,
  parentName,
  onSuccess
}) => {
  const { subjects, courses, classes, levels, submitRegistrationRequest } = useData();

  // Step 1: Chọn Môn
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  
  // Step 2: Chọn Trình độ & Gói thời hạn / số buổi
  const [selectedLevel, setSelectedLevel] = useState<string>('Cơ bản');
  const [selectedPackage, setSelectedPackage] = useState<'1_month_8b' | '1_month_12b' | '3_months_24b' | '6_months_48b' | 'custom'>('1_month_12b');
  const [customLessons, setCustomLessons] = useState<number>(16);
  const [customFee, setCustomFee] = useState<number>(3200000);
  
  // Step 3: Bảng lịch học & Khung giờ mong muốn
  const [selectedDays, setSelectedDays] = useState<string[]>(['Thứ 2', 'Thứ 4']);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('18:00 - 19:00');
  const [customScheduleNotes, setCustomScheduleNotes] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Step Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const subjectName = currentSubject?.name || 'Piano & Keyboard';

  // Calculate pricing & lessons
  let durationMonths = 1;
  let totalLessons = 12;
  let estimatedFee = 2400000;
  let packageTitle = 'Gói 1 Tháng (12 Buổi / 1h)';

  if (selectedPackage === '1_month_8b') {
    durationMonths = 1;
    totalLessons = 8;
    estimatedFee = 1600000;
    packageTitle = 'Gói 1 Tháng (8 Buổi / 1h)';
  } else if (selectedPackage === '1_month_12b') {
    durationMonths = 1;
    totalLessons = 12;
    estimatedFee = 2400000;
    packageTitle = 'Gói 1 Tháng (12 Buổi / 1h)';
  } else if (selectedPackage === '3_months_24b') {
    durationMonths = 3;
    totalLessons = 24;
    estimatedFee = 4500000; // Tiết kiệm hơn
    packageTitle = 'Gói 3 Tháng (24 Buổi / 1h) - Ưu Đãi';
  } else if (selectedPackage === '6_months_48b') {
    durationMonths = 6;
    totalLessons = 48;
    estimatedFee = 8600000; // Tiết kiệm cao nhất
    packageTitle = 'Gói 6 Tháng (48 Buổi / 1h) - Chuyên Sâu';
  } else {
    durationMonths = Math.max(1, Math.round(customLessons / 8));
    totalLessons = customLessons || 16;
    estimatedFee = customFee || (totalLessons * 200000);
    packageTitle = `Gói Tùy Chỉnh (${totalLessons} Buổi / 1h)`;
  }

  // Danh sách các ngày trong tuần
  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  // Danh sách ca học mẫu
  const timeSlots = [
    { label: 'Ca Sáng 1', time: '08:00 - 09:00', period: 'Sáng' },
    { label: 'Ca Sáng 2', time: '09:30 - 10:30', period: 'Sáng' },
    { label: 'Ca Chiều 1', time: '14:00 - 15:00', period: 'Chiều' },
    { label: 'Ca Chiều 2', time: '15:30 - 16:30', period: 'Chiều' },
    { label: 'Ca Chiều 3', time: '17:00 - 18:00', period: 'Chiều' },
    { label: 'Ca Tối 1', time: '18:00 - 19:00', period: 'Tối (Phổ biến)' },
    { label: 'Ca Tối 2', time: '19:15 - 20:15', period: 'Tối' },
    { label: 'Ca Tối 3', time: '20:15 - 21:15', period: 'Tối' }
  ];

  // Lọc các lớp học đang mở của môn này để gợi ý
  const matchingClasses = classes.filter(c => 
    c.status === 'active' && 
    (c.subjectId === selectedSubjectId || c.subjectName?.toLowerCase().includes(subjectName.toLowerCase()) || subjectName.toLowerCase().includes(c.subjectName?.toLowerCase() || ''))
  );

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as any);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const scheduleText = `${selectedDays.join(', ')} (${selectedTimeSlot})`;
    const matchedClass = classes.find(c => c.id === selectedClassId);

    const regTargetName = `${subjectName} - ${selectedLevel} (${totalLessons} buổi/1h - ${durationMonths} tháng)`;

    const finalNote = [
      isParentView ? `Phụ huynh ${parentName || 'phụ huynh'} đăng ký cho học viên.` : '',
      `Gói học: ${packageTitle} - Trình độ: ${selectedLevel}.`,
      `Lịch mong muốn: ${scheduleText}.`,
      matchedClass ? `Nguyện vọng ghép lớp: ${matchedClass.name} (${matchedClass.room}).` : '',
      customScheduleNotes ? `Ghi chú: ${customScheduleNotes}` : ''
    ].filter(Boolean).join(' | ');

    submitRegistrationRequest({
      type: 'COURSE',
      targetId: selectedSubjectId || 'sub-general',
      targetName: regTargetName,
      studentId: targetStudent.id,
      studentName: targetStudent.fullName,
      studentCode: targetStudent.code,
      guardianName: parentName,
      subjectId: selectedSubjectId,
      subjectName,
      level: selectedLevel,
      durationPackage: selectedPackage,
      durationMonths,
      totalLessons,
      lessonDurationMinutes: 60,
      estimatedFee,
      desiredDays: selectedDays,
      desiredTimeSlot: selectedTimeSlot,
      desiredScheduleText: scheduleText,
      desiredClassId: selectedClassId || undefined,
      desiredClassName: matchedClass?.name || undefined,
      note: finalNote
    });

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    setIsSubmitting(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Thân thiện trên mobile */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <GraduationCap className="w-6 h-6 text-white animate-gentle-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider">
                  Đăng Ký Khóa Học
                </span>
                <span className="text-[11px] font-bold text-amber-100">
                  Bước {currentStep}/4
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-heading mt-0.5">
                {isParentView ? `Đăng Ký Học Cho Bé: ${targetStudent.fullName}` : `Đăng Ký Khóa Học: ${targetStudent.fullName}`}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 shrink-0">
          <div
            className="bg-gradient-to-r from-amber-500 to-indigo-600 h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body with smooth scrolling */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs space-y-5">
          
          {/* ============================================================ */}
          {/* BƯỚC 1: CHỌN MÔN HỌC */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white font-heading">
                  1. Lựa Chọn Môn Học Âm Nhạc
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Chọn bộ môn năng khiếu bạn hoặc bé muốn theo học tại Minh Music Center:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {subjects.map((sub) => {
                  const isSelected = selectedSubjectId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedSubjectId(sub.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between min-h-[90px] ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{sub.icon || '🎵'}</span>
                        {isSelected && (
                          <span className="p-1 bg-amber-500 text-white rounded-full">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-xs sm:text-sm mt-2">{sub.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{sub.code}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {currentSubject && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">{currentSubject.name}: </strong>
                    {currentSubject.description || 'Chương trình đào tạo chuẩn quốc tế, giáo trình trực quan, thực hành liên tục trên nhạc cụ cao cấp.'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* BƯỚC 2: CHỌN TRÌNH ĐỘ & GÓI THỜI HẠN / SỐ BUỔI */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white font-heading">
                  2. Chọn Trình Độ & Gói Khóa Học (1 Tháng, 3 Tháng, 6 Tháng)
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Thời lượng mỗi buổi học là <strong className="text-amber-600 dark:text-amber-400">1 giờ (60 phút)</strong>. Bạn có thể chọn gói phù hợp:
                </p>
              </div>

              {/* Trình độ */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Trình độ hiện tại / Mục tiêu:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(levels.length > 0
                    ? levels.map(l => l.name)
                    : ['Cơ bản', 'Trung cấp', 'Nâng cao', 'Thiếu nhi / Vỡ lòng', 'Đệm hát', 'Luyện thi / Chuyên sâu']
                  ).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer truncate ${
                        selectedLevel === lvl
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Các gói thời hạn & số buổi */}
              <div className="space-y-2.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Gói thời hạn & Số buổi học (1h/buổi):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Gói 1: 1 Tháng - 8 Buổi */}
                  <label
                    onClick={() => setSelectedPackage('1_month_8b')}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                      selectedPackage === '1_month_8b'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">Gói 1 Tháng (8 buổi)</span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        2 buổi/tuần x 1h
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-base font-black text-rose-600 dark:text-rose-400">1.600.000 đ</span>
                      <span className="text-[10px] text-slate-500">200k/buổi 1h</span>
                    </div>
                  </label>

                  {/* Gói 2: 1 Tháng - 12 Buổi */}
                  <label
                    onClick={() => setSelectedPackage('1_month_12b')}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                      selectedPackage === '1_month_12b'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">Gói 1 Tháng (12 buổi)</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        3 buổi/tuần x 1h
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-base font-black text-rose-600 dark:text-rose-400">2.400.000 đ</span>
                      <span className="text-[10px] text-slate-500">200k/buổi 1h</span>
                    </div>
                  </label>

                  {/* Gói 3: 3 Tháng - 24 Buổi */}
                  <label
                    onClick={() => setSelectedPackage('3_months_24b')}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                      selectedPackage === '3_months_24b'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">Gói 3 Tháng (24 buổi) ⭐</span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold">
                        Tiết kiệm 300k
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <div>
                        <span className="text-base font-black text-rose-600 dark:text-rose-400">4.500.000 đ</span>
                        <span className="text-[10px] text-slate-400 line-through ml-1.5">4.800.000 đ</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">Tặng 20 ⭐</span>
                    </div>
                  </label>

                  {/* Gói 4: 6 Tháng - 48 Buổi */}
                  <label
                    onClick={() => setSelectedPackage('6_months_48b')}
                    className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                      selectedPackage === '6_months_48b'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs">Gói 6 Tháng (48 buổi) 🏆</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                        Tiết kiệm 1 Triệu
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <div>
                        <span className="text-base font-black text-rose-600 dark:text-rose-400">8.600.000 đ</span>
                        <span className="text-[10px] text-slate-400 line-through ml-1.5">9.600.000 đ</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-bold">Tặng 50 ⭐</span>
                    </div>
                  </label>
                </div>

                {/* Tùy chỉnh */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPackage('custom')}
                    className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      selectedPackage === 'custom' ? 'text-amber-600 font-black' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span>⚙️ Hoặc nhập số buổi tùy chỉnh do Admin/Người dùng yêu cầu</span>
                  </button>

                  {selectedPackage === 'custom' && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 animate-in fade-in">
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Số buổi (1h/buổi):</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={customLessons}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setCustomLessons(val);
                            setCustomFee(val * 200000);
                          }}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Học phí dự tính (VNĐ):</label>
                        <input
                          type="number"
                          step={50000}
                          value={customFee}
                          onChange={(e) => setCustomFee(Number(e.target.value))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-rose-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* BƯỚC 3: BẢNG LỊCH HỌC & KHUNG GIỜ MONG MUỐN */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white font-heading">
                  3. Bảng Lịch Học & Khung Giờ Bạn Muốn Đăng Ký
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Tích chọn các ngày trong tuần và ca học mong muốn để Ban Quản Trị xếp lớp chuẩn xác nhất:
                </p>
              </div>

              {/* Tích chọn Thứ trong tuần */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  A. Chọn các ngày trong tuần (Tối thiểu 1-3 ngày):
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {daysOfWeek.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`py-2.5 px-1 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bảng Ca Học / Khung giờ */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  B. Bảng các khung giờ / ca học chuẩn (1h / buổi):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400">{slot.label}</span>
                          <span className="text-[9px] px-1 py-0.2 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">{slot.period}</span>
                        </div>
                        <p className="font-extrabold text-xs mt-1 text-slate-900 dark:text-white font-mono">{slot.time}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gợi ý các lớp học có sẵn của môn này */}
              {matchingClasses.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    C. Hoặc chọn ghép ngay vào Lớp Học Có Sẵn của môn {subjectName}:
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold text-xs"
                  >
                    <option value="">-- Để Ban Quản Trị tự động xếp lớp mới theo lịch trên --</option>
                    {matchingClasses.map(cl => (
                      <option key={cl.id} value={cl.id}>
                        {cl.name} • {cl.scheduleTime || '18:00 - 19:00'} • {cl.room} (GV: {cl.teacherName || 'Trung tâm'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Ghi chú thêm */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  D. Nguyện vọng khác (Giáo viên mong muốn, thời gian đặc biệt...):
                </label>
                <textarea
                  rows={2}
                  value={customScheduleNotes}
                  onChange={(e) => setCustomScheduleNotes(e.target.value)}
                  placeholder="Ví dụ: Em muốn học giáo viên nữ, có thể học linh hoạt thứ 7 hoặc chủ nhật..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs resize-none"
                />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* BƯỚC 4: XÁC NHẬN & GỬI YÊU CẦU */}
          {/* ============================================================ */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center py-2">
                <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-full text-emerald-600 mb-2">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white font-heading">
                  Kiểm Tra & Xác Nhận Hồ Sơ Đăng Ký
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  Vui lòng xác nhận thông tin trước khi gửi để Ban Quản Trị duyệt và liên hệ xếp lịch:
                </p>
              </div>

              {/* Bảng tóm tắt phiếu đăng ký */}
              <div className="bg-gradient-to-br from-amber-50/70 via-rose-50/50 to-indigo-50/70 dark:from-slate-800 dark:to-slate-800/80 p-4 sm:p-5 rounded-2xl border border-amber-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-700 pb-2.5">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">Học viên đăng ký:</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    {targetStudent.fullName} ({targetStudent.code || 'Mã mới'})
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-700 pb-2.5">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">Môn học & Trình độ:</span>
                  <span className="font-extrabold text-indigo-700 dark:text-indigo-400 text-xs">
                    {subjectName} • Trình độ: {selectedLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-700 pb-2.5">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">Gói thời hạn & Số buổi:</span>
                  <span className="font-black text-amber-900 dark:text-amber-300 text-xs">
                    {durationMonths} tháng • {totalLessons} buổi (1h / buổi)
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-slate-700 pb-2.5">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">Lịch học mong muốn:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs font-mono">
                    {selectedDays.join(', ')} ({selectedTimeSlot})
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Học phí dự tính:</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-heading">
                    {estimatedFee.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Sau khi gửi, Admin sẽ phê duyệt, xếp giáo viên phụ trách và gửi thông báo xác nhận ngay vào tài khoản của bạn!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer - Single line controls with proper padding */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Quay Lại</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap"
            >
              Đóng
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-6 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>Tiếp Tục</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="py-2.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Đăng Ký'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
