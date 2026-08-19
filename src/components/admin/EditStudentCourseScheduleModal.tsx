import React, { useState, useEffect } from 'react';
import { Student, MusicClass, Subject, MusicLevel } from '../../types';
import { useData } from '../../context/DataContext';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  Layers,
  GraduationCap,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sparkles,
  Users,
  DoorClosed,
  ChevronRight,
  Info
} from 'lucide-react';

interface EditStudentCourseScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess?: (msg: string) => void;
}

export const EditStudentCourseScheduleModal: React.FC<EditStudentCourseScheduleModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess
}) => {
  const {
    subjects,
    classes,
    levels,
    updateStudentCourseAndSchedule
  } = useData();

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [level, setLevel] = useState<string>('Cơ bản');
  const [totalLessons, setTotalLessons] = useState<number>(24);
  const [completedLessons, setCompletedLessons] = useState<number>(0);
  const [remainingLessons, setRemainingLessons] = useState<number>(24);
  const [adminNote, setAdminNote] = useState<string>('');
  const [notifyUser, setNotifyUser] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      const subs = student.enrolledSubjects && student.enrolledSubjects.length > 0 
        ? student.enrolledSubjects 
        : ['Piano'];
      setSelectedSubjects(subs);
      setSelectedClassIds(student.enrolledClassIds || []);
      setLevel(student.level || 'Cơ bản');
      
      const tot = student.totalLessons ?? 24;
      const comp = student.completedLessons ?? 0;
      const rem = student.remainingLessons ?? Math.max(0, tot - comp);
      
      setTotalLessons(tot);
      setCompletedLessons(comp);
      setRemainingLessons(rem);
      setAdminNote('');
      setNotifyUser(true);
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  // Toggle subject selection
  const handleToggleSubject = (subjectName: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectName)) {
        if (prev.length <= 1) return prev; // Keep at least one subject
        return prev.filter(s => s !== subjectName);
      } else {
        return [...prev, subjectName];
      }
    });
  };

  // Toggle class selection
  const handleToggleClass = (classId: string) => {
    setSelectedClassIds(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  // Quick adjust sessions
  const handleAdjustSessions = (delta: number) => {
    setTotalLessons(prev => Math.max(0, prev + delta));
    setRemainingLessons(prev => Math.max(0, prev + delta));
  };

  // Auto calculate remaining
  const handleRecalculateRemaining = () => {
    setRemainingLessons(Math.max(0, totalLessons - completedLessons));
  };

  // Save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = updateStudentCourseAndSchedule({
        studentId: student.id,
        enrolledSubjects: selectedSubjects,
        enrolledClassIds: selectedClassIds,
        totalLessons,
        completedLessons,
        remainingLessons,
        level,
        adminNote: adminNote.trim() || undefined,
        notifyUser
      });

      if (res.success) {
        if (onSuccess) {
          onSuccess(`✅ Đã cập nhật thành công khóa học & lịch học cho học viên ${student.fullName}!`);
        }
        onClose();
      } else {
        alert(res.message || 'Có lỗi xảy ra khi cập nhật.');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi hệ thống khi lưu dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  // Classes filtered by student's selected subjects
  const availableClasses = classes.filter(c => 
    selectedSubjects.length === 0 || selectedSubjects.includes(c.subject || '')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/20 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight font-heading">
                  Sửa Khóa Học, Buổi Học & Lịch Học
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold">
                  Admin
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5 flex items-center gap-2">
                <span>Học viên: <strong className="text-white">{student.fullName}</strong> ({student.code || 'HV'})</span>
                <span>•</span>
                <span>SĐT: {student.phone || 'Chưa có'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800">
          {/* 1. Môn Học & Trình Độ */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 font-heading">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>1. Bộ Môn Đang Học & Trình Độ</span>
              </h4>
              <span className="text-[11px] text-slate-500 italic">
                (Học viên có thể học 1 hoặc nhiều môn song song)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subjects Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bộ môn đăng ký học <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map(sub => {
                    const isChecked = selectedSubjects.includes(sub.name);
                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => handleToggleSubject(sub.name)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span>{sub.icon || '🎵'}</span>
                          <span className="truncate">{sub.name}</span>
                        </span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Trình độ học viên
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Vỡ lòng">Vỡ lòng (Pre-Basic)</option>
                  <option value="Cơ bản">Cơ bản (Beginner / Grade 1-2)</option>
                  <option value="Trung cấp">Trung cấp (Intermediate / Grade 3-5)</option>
                  <option value="Nâng cao">Nâng cao (Advanced / Grade 6-8)</option>
                  <option value="Đệm hát">Đệm hát & Solo</option>
                  <option value="Thiếu nhi">Cảm thụ thiếu nhi (Kids Music)</option>
                  <option value="ABRSM / Trinity">Luyện thi chứng chỉ Quốc tế</option>
                  {levels.map(lvl => (
                    <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Giúp giáo viên phân loại giáo trình và thiết kế lộ trình bài tập phù hợp.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Quản Lý Buổi Học (Sessions & Lessons) */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 font-heading">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>2. Quản Lý Số Buổi Học (Tổng buổi, Đã học, Còn lại)</span>
              </h4>
              <button
                type="button"
                onClick={handleRecalculateRemaining}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
              >
                Tự tính: Còn lại = Tổng - Đã học
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Total Lessons */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <label className="block text-[11px] font-bold text-slate-600">
                  Tổng số buổi gói học
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={totalLessons}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setTotalLessons(val);
                      setRemainingLessons(Math.max(0, val - completedLessons));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-slate-900 text-center focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">buổi</span>
                </div>
              </div>

              {/* Completed Lessons */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <label className="block text-[11px] font-bold text-slate-600">
                  Số buổi đã học (Hoàn thành)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={completedLessons}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setCompletedLessons(val);
                      setRemainingLessons(Math.max(0, totalLessons - val));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-purple-700 text-center focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">buổi</span>
                </div>
              </div>

              {/* Remaining Lessons */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <label className="block text-[11px] font-bold text-slate-600">
                  Số buổi còn lại được học
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={remainingLessons}
                    onChange={(e) => setRemainingLessons(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-sm font-black text-emerald-800 text-center focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-emerald-800 shrink-0">buổi</span>
                </div>
              </div>
            </div>

            {/* Quick Adjust Buttons */}
            <div className="flex items-center flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500">Cộng/trừ nhanh buổi:</span>
              <button
                type="button"
                onClick={() => handleAdjustSessions(1)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                +1 Buổi (Bù)
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSessions(4)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                +4 Buổi (1 Tháng)
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSessions(8)}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                +8 Buổi (Gói K24)
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSessions(-1)}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                -1 Buổi
              </button>
            </div>
          </div>

          {/* 3. Phân Lớp & Thời Khóa Biểu (Lịch Học) */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 font-heading">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>3. Phân Lớp & Thời Khóa Biểu (Lịch Học)</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-bold">
                Đã chọn: {selectedClassIds.length} lớp
              </span>
            </div>

            {availableClasses.length === 0 ? (
              <div className="p-4 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                Không tìm thấy lớp học nào thuộc các môn đã chọn. Bạn có thể tạo thêm lớp trong mục Quản Lý Lớp Học.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {availableClasses.map(cls => {
                  const isSelected = selectedClassIds.includes(cls.id);
                  const isFull = (cls.currentStudents || 0) >= (cls.maxStudents || 4) && !isSelected;

                  return (
                    <div
                      key={cls.id}
                      onClick={() => handleToggleClass(cls.id)}
                      className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div
                          className="w-4 h-4 text-purple-600 rounded border-slate-300 pointer-events-none"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{cls.name}</span>
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                              {cls.subject || 'Môn học'}
                            </span>
                            {cls.level && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                                {cls.level}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-purple-500" />
                              {cls.schedule || cls.scheduleTime || 'Chưa xếp'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <DoorClosed className="w-3 h-3 text-amber-500" />
                              {cls.room || 'Phòng học'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3 text-emerald-500" />
                              {cls.teacherName || 'Giáo viên'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isFull 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          Sĩ số: {cls.currentStudents || 0}/{cls.maxStudents || 4}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold">
                            Đang theo học
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Ghi Chú & Tùy Chọn Thông Báo */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú điều chỉnh (Tùy chọn)
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Ví dụ: Chuyển sang lớp Piano nâng cao tối T3-T5, cộng bù 2 buổi nghỉ lễ..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs">
              <input
                type="checkbox"
                id="notifyUserCheckbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300"
              />
              <label htmlFor="notifyUserCheckbox" className="font-semibold text-indigo-950 cursor-pointer flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span>Gửi thông báo Push & Cập nhật tức thời đến tài khoản Học viên & Phụ huynh</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi Khóa & Lịch Học'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
