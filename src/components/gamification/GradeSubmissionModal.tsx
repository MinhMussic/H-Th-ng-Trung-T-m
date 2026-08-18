import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Submission, Assignment } from '../../types';
import {
  FileText,
  Star,
  Gift,
  CheckCircle2,
  X,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Award,
  Video,
  Music,
  Clock,
  User
} from 'lucide-react';

interface GradeSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  assignment?: Assignment;
}

export const GradeSubmissionModal: React.FC<GradeSubmissionModalProps> = ({
  isOpen,
  onClose,
  submission,
  assignment
}) => {
  const { students, gradeSubmission } = useData();

  const student = students.find(s => s.id === submission.studentId);

  const [grade, setGrade] = useState(submission.grade || '9.5/10 (Xuất sắc)');
  const [score, setScore] = useState<number>(submission.score || 9.5);
  const [teacherFeedback, setTeacherFeedback] = useState(
    submission.teacherFeedback ||
    'Thế tay của con rất đẹp, giữ nhịp đều đặn. Cần chú ý thả lỏng cổ tay hơn khi chuyển sang đoạn cao trào.'
  );
  const [starsAwarded, setStarsAwarded] = useState<number>(
    submission.starsAwarded !== undefined ? submission.starsAwarded : (assignment?.bonusStars || 5)
  );
  const [rewardPointsAwarded, setRewardPointsAwarded] = useState<number>(
    submission.rewardPointsAwarded !== undefined ? submission.rewardPointsAwarded : (assignment?.rewardPoints || 15)
  );

  if (!isOpen) return null;

  const handleGrade = (e: React.FormEvent) => {
    e.preventDefault();

    gradeSubmission(submission.id, {
      grade,
      score: Number(score),
      teacherFeedback,
      starsAwarded: Number(starsAwarded),
      rewardPointsAwarded: Number(rewardPointsAwarded)
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black font-heading">
                Chấm Điểm & Nhận Xét Bài Tập Thực Hành
              </h2>
              <p className="text-blue-100 text-xs mt-0.5">
                Đánh giá bài nộp của học viên, gửi lời động viên và cộng sao vinh danh + điểm thưởng đổi quà.
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
        <form onSubmit={handleGrade} className="p-6 space-y-4 text-xs">
          {/* Student & Assignment Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={student?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={submission.studentName || 'Học viên'}
                  className="w-9 h-9 rounded-full object-cover border border-blue-300"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {submission.studentName || student?.fullName}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {assignment?.subjectName || 'Bộ môn'} • {assignment?.studentLevel || 'Trình độ'}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                submission.status === 'graded' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {submission.status === 'graded' ? 'Đã chấm điểm' : 'Chờ chấm bài'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <p className="font-bold text-slate-800">{assignment?.title || 'Bài tập thực hành'}</p>
              <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Nộp lúc: {submission.submittedAt}
              </p>
            </div>
          </div>

          {/* Submission Media & Student Notes */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-3">
            <h5 className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
              <Video className="w-4 h-4 text-blue-700" />
              <span>Video / Ghi âm thực hành & Lời nhắn của học viên:</span>
            </h5>

            {submission.mediaUrl ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <Music className="w-4 h-4" />
                  <span className="truncate max-w-[280px]">{submission.mediaUrl}</span>
                </div>
                <a
                  href={submission.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs"
                >
                  <span>Mở xem video</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <p className="text-slate-500 italic text-[11px]">Học viên nộp bài báo cáo qua phần ghi chú.</p>
            )}

            {submission.notes && (
              <div className="bg-white p-3 rounded-xl border border-blue-100">
                <p className="font-bold text-slate-700 text-[11px] mb-1">Ghi chú của học viên:</p>
                <p className="text-slate-800 font-medium italic text-xs">"{submission.notes}"</p>
              </div>
            )}
          </div>

          {/* Grading & Feedback */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đánh giá / Xếp loại:
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="10/10 (Xuất sắc tuyệt đối)">10/10 (Xuất sắc tuyệt đối)</option>
                  <option value="9.5/10 (Xuất sắc)">9.5/10 (Xuất sắc)</option>
                  <option value="9.0/10 (Giỏi)">9.0/10 (Giỏi)</option>
                  <option value="8.5/10 (Khá tốt)">8.5/10 (Khá tốt)</option>
                  <option value="8.0/10 (Đạt yêu cầu)">8.0/10 (Đạt yêu cầu)</option>
                  <option value="Cần rèn luyện thêm">Cần rèn luyện thêm</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Điểm số thang 10:
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-blue-700 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Nhận xét chi tiết & Hướng dẫn sửa lỗi ngón/nhịp:</span>
              </label>
              <textarea
                rows={3}
                required
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                placeholder="Nhập lời nhận xét, động viên và nhắc nhở học viên..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-blue-500 resize-none text-xs"
              />
            </div>
          </div>

          {/* Reward Awards */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Phần Thưởng Tặng Cho Học Viên:</span>
              </span>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                Tự động cộng ví học viên
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="font-bold text-slate-800 text-xs">Sao BXH:</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={starsAwarded}
                  onChange={(e) => setStarsAwarded(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-amber-50 border border-amber-300 rounded-lg text-center font-black text-amber-700 text-xs"
                />
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-rose-500" />
                  <span className="font-bold text-slate-800 text-xs">Điểm Đổi Quà:</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={rewardPointsAwarded}
                  onChange={(e) => setRewardPointsAwarded(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-rose-50 border border-rose-300 rounded-lg text-center font-black text-rose-700 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Chấm & Tặng Thưởng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
