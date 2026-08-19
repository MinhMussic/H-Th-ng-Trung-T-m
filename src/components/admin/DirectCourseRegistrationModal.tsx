import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Course, Student, MusicClass, Subject } from '../../types';
import {
  BookOpen,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Calendar,
  School,
  X,
  Plus,
  Users,
  Search,
  GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DirectCourseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCourse?: Course | null;
  onSuccess?: () => void;
}

export const DirectCourseRegistrationModal: React.FC<DirectCourseRegistrationModalProps> = ({
  isOpen,
  onClose,
  initialCourse,
  onSuccess
}) => {
  const {
    students,
    subjects,
    courses,
    classes,
    levels,
    registerStudentCourse
  } = useData();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialCourse?.subjectId || subjects[0]?.id || ''
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourse?.id || courses[0]?.id || '');
  const [selectedLevel, setSelectedLevel] = useState<string>(initialCourse?.level || 'Cơ bản');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  // Custom overriding package duration/lessons/fee
  const [customLessons, setCustomLessons] = useState<number>(initialCourse?.totalLessons || 12);
  const [customDurationMonths, setCustomDurationMonths] = useState<number>(initialCourse?.durationMonths || 1);
  const [customFee, setCustomFee] = useState<number>(Number(initialCourse?.fee) || 2400000);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [autoApproveTuition, setAutoApproveTuition] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Selected student
  const student = students.find(s => s.id === selectedStudentId);

  // Selected subject
  const subject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const subjectName = subject?.name || 'Piano & Keyboard';

  // Available courses for the selected subject
  const availableCourses = courses.filter(
    c => c.subjectId === selectedSubjectId || c.subject === subjectName || c.subjectName === subjectName
  );

  // Available classes for the selected subject
  const availableClasses = classes.filter(
    c => c.subjectId === selectedSubjectId || c.subject === subjectName || c.subjectName === subjectName
  );

  const handleSubjectChange = (subId: string) => {
    setSelectedSubjectId(subId);
    const sub = subjects.find(s => s.id === subId);
    const subName = sub?.name || '';
    const matchingCourses = courses.filter(c => c.subjectId === subId || c.subject === subName);
    if (matchingCourses.length > 0) {
      setSelectedCourseId(matchingCourses[0].id);
      setCustomLessons(matchingCourses[0].totalLessons || 12);
      setCustomDurationMonths(matchingCourses[0].durationMonths || 1);
      setCustomFee(Number(matchingCourses[0].fee) || 2400000);
    }
    const matchingClasses = classes.filter(c => c.subjectId === subId || c.subject === subName);
    setSelectedClassId(matchingClasses[0]?.id || '');
  };

  const handleCourseChange = (crsId: string) => {
    setSelectedCourseId(crsId);
    const crs = courses.find(c => c.id === crsId);
    if (crs) {
      setCustomLessons(crs.totalLessons || 12);
      setCustomDurationMonths(crs.durationMonths || 1);
      setCustomFee(Number(crs.fee) || 2400000);
      if (crs.level) setSelectedLevel(crs.level);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setErrorMsg('Vui lòng chọn học viên cần đăng ký!');
      return;
    }
    if (!selectedClassId) {
      setErrorMsg('Vui lòng chọn lớp học tiếp nhận!');
      return;
    }

    setIsSubmitting(true);
    const finalFee = Math.max(0, customFee - discountAmount);

    const result = registerStudentCourse({
      studentId: selectedStudentId,
      targetClassId: selectedClassId,
      subjectId: selectedSubjectId,
      courseId: selectedCourseId,
      level: selectedLevel,
      totalLessons: Number(customLessons) || 12,
      durationMonths: Number(customDurationMonths) || 1,
      fee: finalFee,
      note: notes || 'Admin đăng ký trực tiếp và xếp lớp tại trung tâm.',
      autoApprove: autoApproveTuition
    });

    if (!result.success) {
      setErrorMsg(result.message || 'Có lỗi xảy ra khi ghi danh!');
      setIsSubmitting(false);
      return;
    }

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {}

    setIsSubmitting(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
                Ghi Danh & Đăng Ký Khóa Học
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Áp dụng khóa học theo môn & xếp vào lớp học tương ứng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="my-3 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="py-3.5 space-y-3.5 text-xs">
          {/* 1. Chọn Học Viên */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              1. Chọn học viên ghi danh (*):
            </label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.code}) - {s.phone || 'Chưa có SĐT'}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Chọn Môn học & Trình độ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                2. Môn học (*):
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-amber-700 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Trình độ đào tạo:
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {levels.length > 0 ? (
                  levels.map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                    <option value="Chuyên sâu">Chuyên sâu</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 3. Chọn Gói Khóa Học & Lớp Học */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-3">
            <div>
              <label className="block font-bold text-amber-950 dark:text-amber-300 mb-1">
                3. Gói thời hạn / Số buổi học:
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
              >
                <option value="">-- Tùy chỉnh gói riêng --</option>
                {availableCourses.map(crs => (
                  <option key={crs.id} value={crs.id}>
                    {crs.name} ({crs.totalLessons} buổi / {crs.durationMonths} tháng) - {(crs.fee || 0).toLocaleString('vi-VN')} đ
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Số buổi:</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={customLessons}
                  onChange={(e) => setCustomLessons(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Thời hạn (tháng):</label>
                <input
                  type="number"
                  min={1}
                  max={36}
                  value={customDurationMonths}
                  onChange={(e) => setCustomDurationMonths(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Học phí gốc (đ):</label>
                <input
                  type="number"
                  step={50000}
                  value={customFee}
                  onChange={(e) => setCustomFee(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-amber-700 dark:text-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 4. Chọn Lớp học tiếp nhận (Physical / scheduled class) */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              4. Xếp vào Lớp học môn {subjectName} (*):
            </label>
            <select
              required
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-indigo-700 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">-- Chọn lớp học --</option>
              {availableClasses.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.code} - {cls.name} ({cls.scheduleText || cls.schedule}) | {cls.room} | GV: {cls.teacherName || 'Chưa phân công'}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1 italic">
              💡 Học viên đăng ký khóa (8b, 12b, 3 tháng...) sẽ tham gia cùng lớp {subjectName} này.
            </p>
          </div>

          {/* Discount and Auto Approve */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Giảm giá / Ưu đãi (VNĐ):</label>
              <input
                type="number"
                step={50000}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoApproveTuition}
                  onChange={(e) => setAutoApproveTuition(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Tạo phiếu thu & Kích hoạt ngay
                </span>
              </label>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-900 dark:text-emerald-300">Tổng tiền cần thanh toán:</span>
            <strong className="text-base font-black text-emerald-700 dark:text-emerald-400">
              {Math.max(0, customFee - discountAmount).toLocaleString('vi-VN')} đ
            </strong>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang xử lý...' : 'Xác nhận ghi danh'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
