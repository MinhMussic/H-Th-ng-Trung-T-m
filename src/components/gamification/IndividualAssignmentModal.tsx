import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Assignment } from '../../types';
import {
  FileText,
  User,
  Music,
  Clock,
  Star,
  Gift,
  Sparkles,
  Link,
  BookOpen,
  X,
  CheckCircle2,
  Gauge,
  MessageSquare
} from 'lucide-react';

interface IndividualAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentToEdit?: Assignment | null;
  defaultStudentId?: string;
}

export const IndividualAssignmentModal: React.FC<IndividualAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignmentToEdit,
  defaultStudentId
}) => {
  const { students, teachers, classes, subjects, addAssignment, updateAssignment } = useData();

  const [studentId, setStudentId] = useState<string>(defaultStudentId || students[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [studentLevel, setStudentLevel] = useState('Cơ bản (Grade 1-2)');
  const [subjectName, setSubjectName] = useState('Piano Cổ Điển');
  const [targetBpm, setTargetBpm] = useState<number | undefined>(72);
  const [customNotes, setCustomNotes] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [bonusStars, setBonusStars] = useState<number>(5);
  const [rewardPoints, setRewardPoints] = useState<number>(15);
  const [maxScore, setMaxScore] = useState<number>(10);
  const [sheetMusicUrl, setSheetMusicUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || '');

  // Sync state when editing or student changes
  useEffect(() => {
    if (assignmentToEdit) {
      setStudentId(assignmentToEdit.studentId || students[0]?.id || '');
      setTitle(assignmentToEdit.title || '');
      setDescription(assignmentToEdit.description || '');
      setStudentLevel(assignmentToEdit.studentLevel || 'Cơ bản (Grade 1-2)');
      setSubjectName(assignmentToEdit.subjectName || 'Piano Cổ Điển');
      setTargetBpm(assignmentToEdit.targetBpm || 72);
      setCustomNotes(assignmentToEdit.customNotes || '');
      setDueDate(assignmentToEdit.dueDate || '');
      setBonusStars(assignmentToEdit.bonusStars || 5);
      setRewardPoints(assignmentToEdit.rewardPoints || 15);
      setMaxScore(assignmentToEdit.maxScore || 10);
      setSheetMusicUrl(assignmentToEdit.sheetMusicUrl || '');
      setAudioUrl(assignmentToEdit.audioUrl || '');
      setTeacherId(assignmentToEdit.teacherId || teachers[0]?.id || '');
    } else {
      if (defaultStudentId) {
        setStudentId(defaultStudentId);
      }
      // Set level based on selected student if available
      const std = students.find(s => s.id === (defaultStudentId || studentId));
      if (std) {
        if (std.level) setStudentLevel(std.level);
      }
    }
  }, [assignmentToEdit, defaultStudentId, isOpen]);

  // When student changes, update default subject & level
  const handleStudentChange = (newStdId: string) => {
    setStudentId(newStdId);
    const selectedStd = students.find(s => s.id === newStdId);
    if (selectedStd) {
      if (selectedStd.level) setStudentLevel(selectedStd.level);
      // Try to find enrolled subject
      const stdClass = classes.find(c => c.studentIds?.includes(newStdId));
      if (stdClass) {
        setSubjectName(stdClass.name);
      }
    }
  };

  if (!isOpen) return null;

  const selectedStudent = students.find(s => s.id === studentId);
  const selectedTeacher = teachers.find(t => t.id === teacherId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vui lòng nhập tên bài tập!');
      return;
    }
    if (!studentId) {
      alert('Vui lòng chọn học viên nhận bài tập!');
      return;
    }

    const payload = {
      title,
      description,
      studentId,
      studentName: selectedStudent?.fullName || 'Học viên',
      studentLevel,
      subjectName,
      targetBpm: targetBpm ? Number(targetBpm) : undefined,
      customNotes,
      dueDate,
      bonusStars: Number(bonusStars),
      rewardPoints: Number(rewardPoints),
      maxScore: Number(maxScore),
      sheetMusicUrl,
      audioUrl,
      teacherId,
      teacherName: selectedTeacher?.fullName || 'Giáo viên',
      attachments: []
    };

    if (assignmentToEdit) {
      updateAssignment(assignmentToEdit.id, payload);
    } else {
      addAssignment(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black font-heading">
                {assignmentToEdit ? 'Chỉnh Sửa Bài Tập Cá Nhân Hóa' : 'Giao Bài Tập Cho Từng Học Viên'}
              </h2>
              <p className="text-amber-100 text-xs mt-0.5">
                Thiết kế lộ trình luyện tập riêng theo đúng trình độ, nhạc cụ và điểm cần khắc phục của từng học viên.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Student Selection */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                <User className="w-4 h-4 text-amber-700" />
                <span>1. Chọn Học Viên Nhận Bài Tập (Bắt buộc):</span>
              </label>
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">
                Cá nhân hóa 1-1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={studentId}
                  onChange={(e) => handleStudentChange(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Chọn học viên --</option>
                  {students.map(std => (
                    <option key={std.id} value={std.id}>
                      {std.fullName} ({std.code || std.id}) - {std.level || 'Chưa phân cấp'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudent && (
                <div className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-xl border border-amber-200">
                  <img
                    src={selectedStudent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={selectedStudent.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-amber-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{selectedStudent.fullName}</p>
                    <p className="text-[11px] text-amber-700 font-semibold truncate">
                      ⭐ {selectedStudent.totalStars ?? selectedStudent.stars ?? 0} Sao vinh danh | 🎁 {selectedStudent.rewardPoints ?? 0} đ thưởng
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Level & Instrument / Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Trình độ thực tế học viên:</span>
              </label>
              <select
                value={studentLevel}
                onChange={(e) => setStudentLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="Vỡ lòng">Vỡ lòng (Người mới bắt đầu)</option>
                <option value="Cơ bản (Grade 1-2)">Cơ bản (Grade 1 - Grade 2)</option>
                <option value="Trung cấp (Grade 3-4)">Trung cấp (Grade 3 - Grade 4)</option>
                <option value="Nâng cao (Grade 5+)">Nâng cao (Grade 5 - Grade 8)</option>
                <option value="Luyện thi / Chuyên sâu">Luyện thi chứng chỉ ABRSM / LCM / Nhạc viện</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-purple-600" />
                <span>Bộ môn / Nhạc cụ:</span>
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Ví dụ: Piano Cổ Điển, Guitar Đệm Hát, Thanh Nhạc..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Tiêu đề bài tập / Tên tác phẩm cần tập: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Luyện ngón Hanon No.1 & Tiểu phẩm Sonatina Op.36 No.1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Description & Practice Goal */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nội dung chi tiết & Mục tiêu bài học:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ví dụ: Tập trung thế tay cong tròn, thả lỏng cổ tay, ghép hai tay ô nhịp 1-16 đều nhịp..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Metronome & Custom Coach Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-orange-600" />
                <span>Tốc độ Metronome (BPM):</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="40"
                  max="240"
                  value={targetBpm || ''}
                  onChange={(e) => setTargetBpm(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="72"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                />
                <span className="text-slate-500 font-bold text-[11px]">BPM</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Lời dặn riêng theo điểm yếu của học viên này:</span>
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Ví dụ: Chú ý không gãy ngón út tay trái khi nhấn pedal ở ô nhịp 8."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Links for sheet music and audio demo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Sheet nhạc / Bản phổ (PDF / Ảnh):</span>
              </label>
              <input
                type="url"
                value={sheetMusicUrl}
                onChange={(e) => setSheetMusicUrl(e.target.value)}
                placeholder="https://example.com/sheets/sonatina.pdf"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-rose-600" />
                <span>Link Video mẫu / Audio Beat đệm:</span>
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=demo hoặc link mp3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 text-[11px]"
              />
            </div>
          </div>

          {/* Rewards & Due Date */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" /> Hạn nộp:
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-400" /> Thưởng sao BXH:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={bonusStars}
                onChange={(e) => setBonusStars(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-amber-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Gift className="w-3 h-3 text-rose-500" /> Điểm đổi quà:
              </label>
              <input
                type="number"
                min="0"
                max="200"
                value={rewardPoints}
                onChange={(e) => setRewardPoints(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-rose-600 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giáo viên phụ trách:</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 text-xs"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{assignmentToEdit ? 'Lưu Thay Đổi Bài Tập' : 'Xác Nhận Giao Bài Cho Học Viên'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
