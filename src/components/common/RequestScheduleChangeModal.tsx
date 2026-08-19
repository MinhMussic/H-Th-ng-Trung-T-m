import React, { useState, useEffect } from 'react';
import { Student, MusicClass, UserAccount } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Calendar,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  DoorClosed,
  GraduationCap,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RequestScheduleChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  guardianName?: string;
  isParent?: boolean;
  onSuccess?: (msg: string) => void;
}

export const RequestScheduleChangeModal: React.FC<RequestScheduleChangeModalProps> = ({
  isOpen,
  onClose,
  student,
  guardianName,
  isParent,
  onSuccess
}) => {
  const { classes, submitScheduleChangeRequest } = useData();
  const { currentUser } = useAuth();

  // Find classes the student is currently enrolled in
  const studentClasses = classes.filter(c => 
    (student.enrolledClassIds || []).includes(c.id) ||
    (c.studentIds || []).includes(student.id)
  );

  const [selectedCurrentClassId, setSelectedCurrentClassId] = useState<string>('');
  const [changeType, setChangeType] = useState<'SELECT_EXISTING_CLASS' | 'PROPOSE_CUSTOM_SCHEDULE'>('SELECT_EXISTING_CLASS');
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [desiredStartDate, setDesiredStartDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [desiredDays, setDesiredDays] = useState<string[]>(['Thứ 3', 'Thứ 5']);
  const [desiredTimeSlot, setDesiredTimeSlot] = useState<string>('18:00 - 19:30');
  const [reason, setReason] = useState<string>('Do trùng lịch học chính khóa tại trường phổ thông');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (studentClasses.length > 0) {
      setSelectedCurrentClassId(studentClasses[0].id);
    } else if (classes.length > 0) {
      setSelectedCurrentClassId(classes[0].id);
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const currentClass = classes.find(c => c.id === selectedCurrentClassId) || studentClasses[0] || classes[0];
  const subjectName = currentClass?.subject || (student.enrolledSubjects && student.enrolledSubjects[0]) || 'Âm nhạc';

  // Other available classes for the same subject
  const availableTargetClasses = classes.filter(c => 
    c.id !== currentClass?.id && 
    (!currentClass?.subject || c.subject === currentClass.subject)
  );

  const toggleDay = (day: string) => {
    setDesiredDays(prev => 
      prev.includes(day) ? (prev.length > 1 ? prev.filter(d => d !== day) : prev) : [...prev, day]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do thay đổi lịch học để Ban Quản Trị tiện sắp xếp.');
      return;
    }

    setSubmitting(true);

    try {
      const targetCls = changeType === 'SELECT_EXISTING_CLASS' ? classes.find(c => c.id === targetClassId) : null;

      submitScheduleChangeRequest({
        studentId: student.id,
        studentName: student.fullName,
        studentCode: student.code,
        guardianName: guardianName || (isParent || currentUser?.role === 'PARENT' ? (currentUser?.displayName || currentUser?.guardianName || 'Phụ huynh') : undefined),
        currentSubject: subjectName,
        currentClassId: currentClass?.id || 'cls-01',
        currentClassName: currentClass?.name || 'Lớp học hiện tại',
        currentScheduleText: currentClass?.schedule || currentClass?.scheduleTime || 'Lịch hiện tại',
        targetClassId: targetCls?.id || undefined,
        targetClassName: targetCls?.name || undefined,
        desiredScheduleDate: desiredStartDate,
        desiredDays: changeType === 'PROPOSE_CUSTOM_SCHEDULE' ? desiredDays : undefined,
        desiredTimeSlot: changeType === 'PROPOSE_CUSTOM_SCHEDULE' ? desiredTimeSlot : undefined,
        desiredScheduleText: targetCls 
          ? `${targetCls.name} (${targetCls.schedule || targetCls.scheduleTime || 'Lịch mới'})`
          : `${desiredDays.join(', ')} (${desiredTimeSlot}) - Từ ngày ${desiredStartDate}`,
        reason: reason.trim()
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (onSuccess) {
        onSuccess('🎉 Đã gửi yêu cầu đổi lịch học thành công! Ban Quản Trị (Admin) sẽ sớm xét duyệt.');
      }
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi yêu cầu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/20 shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight font-heading">
                Gửi Yêu Cầu Đổi Lịch Học / Chuyển Lớp
              </h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                Học viên: <strong className="text-white">{student.fullName}</strong> ({student.code || 'HV'})
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

        {/* Info Banner */}
        <div className="p-3.5 bg-amber-50 border-b border-amber-200/70 text-amber-950 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Lưu ý quan trọng:</span> Yêu cầu đổi lịch học cần được <strong>Ban Quản Trị (Admin) xét duyệt</strong> để đảm bảo sĩ số lớp và lịch trống của giáo viên. Sau khi được duyệt, thời khóa biểu của bạn sẽ tự động cập nhật ngay.
          </div>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800 text-xs">
          {/* Step 1: Current Class to Change */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">
              1. Chọn Lớp / Môn học hiện tại bạn muốn đổi lịch <span className="text-rose-500">*</span>
            </label>

            {studentClasses.length === 0 ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                Lớp hiện tại: {currentClass?.name || 'Lớp Âm Nhạc Cơ Bản'} ({currentClass?.schedule || 'Chưa gán lịch'})
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {studentClasses.map(cls => {
                  const isSelected = selectedCurrentClassId === cls.id;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => setSelectedCurrentClassId(cls.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-600 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-slate-900">{cls.name}</span>
                        <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded text-[10px] font-bold">
                          {cls.subject || 'Môn'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {cls.schedule || cls.scheduleTime || 'Chưa có lịch'}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2: Choose Method */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700">
              2. Lịch học mới bạn mong muốn chuyển sang
            </label>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChangeType('SELECT_EXISTING_CLASS')}
                className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  changeType === 'SELECT_EXISTING_CLASS'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="block font-extrabold text-xs">Chuyển Sang Lớp Đang Mở</span>
                <span className={`block text-[10px] mt-0.5 ${changeType === 'SELECT_EXISTING_CLASS' ? 'text-indigo-100' : 'text-slate-500'}`}>
                  Chọn từ các lớp cùng bộ môn
                </span>
              </button>

              <button
                type="button"
                onClick={() => setChangeType('PROPOSE_CUSTOM_SCHEDULE')}
                className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                  changeType === 'PROPOSE_CUSTOM_SCHEDULE'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="block font-extrabold text-xs">Đề Xuất Khung Giờ Mới</span>
                <span className={`block text-[10px] mt-0.5 ${changeType === 'PROPOSE_CUSTOM_SCHEDULE' ? 'text-indigo-100' : 'text-slate-500'}`}>
                  Chọn thứ & ca giờ mong muốn
                </span>
              </button>
            </div>

            {/* Option A: Select Existing Class */}
            {changeType === 'SELECT_EXISTING_CLASS' && (
              <div className="space-y-2 pt-2">
                <label className="block text-[11px] font-bold text-slate-600">
                  Danh sách các lớp bộ môn {subjectName} đang mở:
                </label>
                {availableTargetClasses.length === 0 ? (
                  <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                    Không tìm thấy lớp học nào khác cùng bộ môn. Bạn hãy chuyển sang mục "Đề Xuất Khung Giờ Mới" để Admin sắp xếp lớp mới nhé!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {availableTargetClasses.map(cls => {
                      const isSelected = targetClassId === cls.id;
                      const isFull = (cls.currentStudents || 0) >= (cls.maxStudents || 4);

                      return (
                        <div
                          key={cls.id}
                          onClick={() => setTargetClassId(cls.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-50/90 border-indigo-600 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">{cls.name}</span>
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                                {cls.level || 'Cơ bản'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>📅 {cls.schedule || cls.scheduleTime || 'Lịch'}</span>
                              <span>•</span>
                              <span>🚪 {cls.room || 'Phòng học'}</span>
                              <span>•</span>
                              <span>🧑‍🏫 {cls.teacherName || 'Giáo viên'}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isFull ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {cls.currentStudents || 0}/{cls.maxStudents || 4} bạn
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Option B: Propose Custom Schedule */}
            {changeType === 'PROPOSE_CUSTOM_SCHEDULE' && (
              <div className="space-y-3 pt-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                {/* Days of week */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Chọn các ngày trong tuần mong muốn học:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map(day => {
                      const isChecked = desiredDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Khung giờ mong muốn
                    </label>
                    <select
                      value={desiredTimeSlot}
                      onChange={(e) => setDesiredTimeSlot(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="17:00 - 18:30">17:00 - 18:30 (Ca 1 chiều)</option>
                      <option value="17:30 - 19:00">17:30 - 19:00 (Ca 2 chiều)</option>
                      <option value="18:00 - 19:30">18:00 - 19:30 (Ca tối 1)</option>
                      <option value="18:30 - 20:00">18:30 - 20:00 (Ca tối 2)</option>
                      <option value="19:30 - 21:00">19:30 - 21:00 (Ca tối muộn)</option>
                      <option value="08:30 - 10:00 (Cuối tuần)">08:30 - 10:00 (Sáng T7/CN)</option>
                      <option value="15:00 - 16:30 (Cuối tuần)">15:00 - 16:30 (Chiều T7/CN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Ngày bắt đầu áp dụng lịch mới
                    </label>
                    <input
                      type="date"
                      value={desiredStartDate}
                      onChange={(e) => setDesiredStartDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Reason */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-700">
              3. Lý do thay đổi lịch học <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do đổi lịch (ví dụ: bận lịch học văn hóa, đổi ca làm việc, bận việc gia đình...)"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Đến Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
