import React, { useState } from 'react';
import { ScheduleChangeRequest, MusicClass } from '../../types';
import { useData } from '../../context/DataContext';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Sparkles,
  ChevronRight,
  School
} from 'lucide-react';

interface ScheduleChangeApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export const ScheduleChangeApprovalModal: React.FC<ScheduleChangeApprovalModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    scheduleChangeRequests,
    classes,
    students,
    approveScheduleChangeRequest,
    rejectScheduleChangeRequest
  } = useData();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active request being approved or rejected
  const [selectedReqForApproval, setSelectedReqForApproval] = useState<ScheduleChangeRequest | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [adminResponseMsg, setAdminResponseMsg] = useState<string>('Đã duyệt chuyển lịch học thành công. Chúc bạn học tập tốt!');

  const [selectedReqForRejection, setSelectedReqForRejection] = useState<ScheduleChangeRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Lớp học đã đủ sĩ số tối đa. Vui lòng liên hệ trung tâm để chọn ca học khác phù hợp.');

  if (!isOpen) return null;

  // Filter requests
  const filteredRequests = scheduleChangeRequests.filter(req => {
    if (filterStatus !== 'all' && req.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = req.studentName?.toLowerCase().includes(q);
      const matchCode = req.studentCode?.toLowerCase().includes(q);
      const matchClass = req.currentClassName?.toLowerCase().includes(q) || req.targetClassName?.toLowerCase().includes(q);
      const matchReason = req.reason?.toLowerCase().includes(q);
      return matchName || matchCode || matchClass || matchReason;
    }
    return true;
  });

  const pendingCount = scheduleChangeRequests.filter(r => r.status === 'pending').length;

  // Handle open approve
  const handleOpenApprove = (req: ScheduleChangeRequest) => {
    setSelectedReqForApproval(req);
    // Find target class ID if specified, or find matching class for that subject
    const matchedClass = req.targetClassId 
      ? classes.find(c => c.id === req.targetClassId)
      : classes.find(c => c.subject === req.currentSubject && c.id !== req.currentClassId);
    
    setTargetClassId(matchedClass?.id || req.targetClassId || classes[0]?.id || '');
    setAdminResponseMsg('Đã duyệt chuyển lịch học thành công. Chúc bạn học tập tốt!');
  };

  // Handle confirm approve
  const handleConfirmApprove = () => {
    if (!selectedReqForApproval) return;

    approveScheduleChangeRequest(
      selectedReqForApproval.id,
      adminResponseMsg.trim() || undefined,
      targetClassId || undefined
    );

    if (onSuccess) {
      onSuccess(`✅ Đã phê duyệt và chuyển lịch học cho học viên ${selectedReqForApproval.studentName || 'Học viên'}!`);
    }
    setSelectedReqForApproval(null);
  };

  // Handle confirm reject
  const handleConfirmReject = () => {
    if (!selectedReqForRejection) return;

    rejectScheduleChangeRequest(
      selectedReqForRejection.id,
      rejectionReason.trim() || undefined
    );

    if (onSuccess) {
      onSuccess(`Đã từ chối yêu cầu đổi lịch của học viên ${selectedReqForRejection.studentName || 'Học viên'}.`);
    }
    setSelectedReqForRejection(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/20 shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight font-heading">
                  Duyệt Đổi Lịch Học & Chuyển Lớp
                </h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-black animate-pulse">
                    {pendingCount} chờ duyệt
                  </span>
                )}
              </div>
              <p className="text-xs text-purple-100 mt-0.5">
                Xem xét và phê duyệt các yêu cầu thay đổi lịch học hoặc chuyển lớp từ học viên và phụ huynh.
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

        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'pending'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Chờ Duyệt</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'approved'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã Phê Duyệt
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'rejected'
                  ? 'bg-white text-rose-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Từ Chối
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất Cả
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên học viên, lớp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-slate-500 space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-sm text-slate-700">
                {filterStatus === 'pending'
                  ? 'Tuyệt vời! Hiện không có yêu cầu đổi lịch học nào đang chờ duyệt.'
                  : 'Không tìm thấy yêu cầu đổi lịch học nào phù hợp bộ lọc.'}
              </p>
              <p className="text-xs text-slate-400">
                Khi học viên hoặc phụ huynh gửi yêu cầu đổi lịch, danh sách sẽ hiển thị tại đây để Admin xét duyệt.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map(req => {
                const currentCls = classes.find(c => c.id === req.currentClassId);
                const targetCls = req.targetClassId ? classes.find(c => c.id === req.targetClassId) : null;
                const student = students.find(s => s.id === req.studentId);

                return (
                  <div
                    key={req.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-4"
                  >
                    {/* Top Row: Student & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm">
                          {req.studentName?.charAt(0) || 'H'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-900">
                              {req.studentName || 'Học viên'}
                            </h4>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                              {req.studentCode || student?.code || 'HV'}
                            </span>
                            {req.guardianName && (
                              <span className="text-[11px] text-slate-500">
                                (PH: {req.guardianName})
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Ngày gửi đơn: <strong>{req.createdAt}</strong> • SĐT: {student?.phone || 'Chưa cập nhật'}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {req.status === 'pending' && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Chờ Admin duyệt</span>
                          </span>
                        )}
                        {req.status === 'approved' && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Đã phê duyệt</span>
                          </span>
                        )}
                        {req.status === 'rejected' && (
                          <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-black flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Đã từ chối</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Schedule Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                      {/* Current Class */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <span>📍 Lịch học hiện tại</span>
                        </span>
                        <p className="text-xs font-extrabold text-slate-900">
                          {req.currentClassName || currentCls?.name || 'Lớp học hiện tại'}
                        </p>
                        <p className="text-xs text-slate-600">
                          {req.currentScheduleText || currentCls?.schedule || currentCls?.scheduleTime || 'Chưa có lịch'}
                        </p>
                      </div>

                      {/* Desired Class / New Schedule */}
                      <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>🎯 Lịch học mong muốn đổi sang</span>
                        </span>
                        <p className="text-xs font-extrabold text-indigo-950">
                          {req.targetClassName || targetCls?.name || req.desiredScheduleText || 'Chuyển sang lớp khác'}
                        </p>
                        <p className="text-xs text-indigo-800 font-semibold">
                          {targetCls?.schedule || targetCls?.scheduleTime || req.desiredScheduleDate || (req.desiredDays && req.desiredDays.join(', ') + ' ' + (req.desiredTimeSlot || '')) || 'Theo sắp xếp của Admin'}
                        </p>
                      </div>
                    </div>

                    {/* Reason & Notes */}
                    <div className="text-xs bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 text-amber-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-900">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                        <span>Lý do thay đổi từ người học:</span>
                      </div>
                      <p className="italic text-slate-800">{req.reason || 'Không ghi rõ lý do'}</p>
                    </div>

                    {/* Admin Response if already reviewed */}
                    {req.adminResponse && (
                      <div className="text-xs bg-slate-100 p-3 rounded-xl border border-slate-200 text-slate-800">
                        <span className="font-bold text-slate-900">Phản hồi của Admin:</span>{' '}
                        <span>{req.adminResponse}</span>
                        {req.reviewedAt && (
                          <span className="text-[10px] text-slate-500 ml-2">
                            (Duyệt ngày: {req.reviewedAt})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions for Pending Requests */}
                    {req.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedReqForRejection(req);
                            setRejectionReason('Lớp học đã đủ sĩ số tối đa. Vui lòng liên hệ trung tâm để chọn ca học khác phù hợp.');
                          }}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Từ Chối</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenApprove(req)}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Phê Duyệt & Đổi Lịch Ngay</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Tổng cộng: <strong>{scheduleChangeRequests.length}</strong> yêu cầu đổi lịch trong hệ thống
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Confirmation Sub-Modal: Approve Schedule Change */}
      {selectedReqForApproval && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2 font-heading">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                <span>Xác Nhận Phê Duyệt Đổi Lịch</span>
              </h4>
              <button
                onClick={() => setSelectedReqForApproval(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Học viên: <strong className="text-slate-900">{selectedReqForApproval.studentName}</strong>
              </p>

              {/* Select Target Class */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn lớp học áp dụng lịch mới <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.subject || 'Môn'}) - {cls.schedule || cls.scheduleTime || 'Lịch'} - GV: {cls.teacherName || 'Chưa gán'} [Sĩ số: {cls.currentStudents || 0}/{cls.maxStudents || 4}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lời nhắn gửi đến Học viên & Phụ huynh
                </label>
                <textarea
                  rows={2}
                  value={adminResponseMsg}
                  onChange={(e) => setAdminResponseMsg(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-[11px] leading-relaxed">
                ✓ Hệ thống sẽ tự động cập nhật thời khóa biểu, sĩ số các lớp và gửi thông báo Push tức thì đến tài khoản học viên và phụ huynh.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReqForApproval(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận & Áp Dụng Ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Sub-Modal: Reject Schedule Change */}
      {selectedReqForRejection && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-black text-rose-700 flex items-center gap-2 font-heading">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>Từ Chối Yêu Cầu Đổi Lịch</span>
              </h4>
              <button
                onClick={() => setSelectedReqForRejection(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Học viên: <strong className="text-slate-900">{selectedReqForRejection.studentName}</strong>
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lý do từ chối gửi đến học viên & phụ huynh <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReqForRejection(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Xác Nhận Từ Chối</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
