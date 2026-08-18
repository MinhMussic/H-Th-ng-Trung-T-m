import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  FileText, 
  Users, 
  BookOpen, 
  Calendar, 
  CreditCard,
  Check
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

interface FactoryResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FactoryResetModal: React.FC<FactoryResetModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { 
    students, 
    teachers, 
    guardians, 
    classes, 
    courses, 
    subjects, 
    tuitionPayments, 
    attendance, 
    assignments, 
    events, 
    holidays,
    factoryResetToEmptyData,
    exportSystemBackupJSON,
    resetDataToDefault
  } = useData();

  const { currentUser, factoryResetAccounts } = useAuth();

  // Mode: 'empty' (wipe to empty / 0 records) vs 'sample_seed' (restore original demo dataset)
  const [resetType, setResetType] = useState<'empty' | 'sample_seed'>('empty');
  const [preserveSubjects, setPreserveSubjects] = useState<boolean>(true);
  const [preserveAdmins, setPreserveAdmins] = useState<boolean>(true);
  
  // Security verification states
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [confirmPhrase, setConfirmPhrase] = useState<string>('');
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  
  // State feedback
  const [downloadedBackup, setDownloadedBackup] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const REQUIRED_PHRASE = 'KHOI PHUC CAI DAT GOC';

  // Handle Download Backup JSON
  const handleDownloadBackup = () => {
    try {
      const backupJSON = exportSystemBackupJSON();
      const blob = new Blob([backupJSON], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.href = url;
      link.setAttribute('download', `minhmusic_backup_${timestamp}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadedBackup(true);
      setErrorMessage('');
    } catch (err) {
      console.error('Backup error:', err);
      setErrorMessage('Không thể tạo file sao lưu. Vui lòng thử lại.');
    }
  };

  // Handle Execute Reset
  const handleExecuteReset = async () => {
    setErrorMessage('');

    // 1. Check phrase
    if (confirmPhrase.trim().toUpperCase() !== REQUIRED_PHRASE) {
      setErrorMessage(`Vui lòng gõ chính xác cụm từ: "${REQUIRED_PHRASE}"`);
      return;
    }

    // 2. Check password if admin has password
    if (currentUser?.password) {
      if (!adminPassword || adminPassword !== currentUser.password) {
        // Fallback check: allow default 'admin123' if password matches
        if (adminPassword !== 'admin123') {
          setErrorMessage('Mật khẩu Quản trị viên không chính xác. Vui lòng kiểm tra lại!');
          return;
        }
      }
    } else if (!adminPassword || adminPassword.length < 4) {
      setErrorMessage('Vui lòng nhập mật khẩu quản trị viên hợp lệ.');
      return;
    }

    // 3. Check agreement
    if (!hasAgreed) {
      setErrorMessage('Vui lòng tích chọn xác nhận đồng ý chịu trách nhiệm về thao tác này.');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate quick processing delay for clear UX feedback
      await new Promise(resolve => setTimeout(resolve, 800));

      if (resetType === 'empty') {
        // Reset to completely empty data
        factoryResetToEmptyData({ preserveSubjectsAndCourses: preserveSubjects });
        factoryResetAccounts(preserveAdmins);
      } else {
        // Reset to default sample seed data
        resetDataToDefault();
      }

      setIsSuccess(true);
      setIsProcessing(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Reset error:', err);
      setErrorMessage('Có lỗi xảy ra trong quá trình khôi phục. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setAdminPassword('');
    setConfirmPhrase('');
    setHasAgreed(false);
    setErrorMessage('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        id="factory-reset-modal-container"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Khôi phục Cài đặt gốc & Làm trống Dữ liệu
              </h3>
              <p className="text-xs text-red-100 font-medium mt-0.5">
                Khu vực quản trị cấp cao • Yêu cầu xác thực tài khoản Admin
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {isSuccess ? (
            /* Success State */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/40">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  {resetType === 'empty' 
                    ? 'Khôi phục Dữ liệu Trống Thành Công!' 
                    : 'Đã Khôi phục Dữ liệu Mẫu Thành Công!'}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  {resetType === 'empty'
                    ? 'Toàn bộ dữ liệu hoạt động của học viên, giáo viên, lớp học và tài chính đã được làm trống. Bạn có thể bắt đầu nhập dữ liệu mới ngay bây giờ.'
                    : 'Hệ thống đã được thiết lập lại về dữ liệu ban đầu.'}
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md transition-all"
                >
                  Đóng & Tiếp tục sử dụng
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Critical Warning Alert */}
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start space-x-3.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                  <span className="font-bold">CẢNH BÁO QUAN TRỌNG:</span> Thao tác này sẽ xóa toàn bộ cơ sở dữ liệu hoạt động hiện tại (học viên, phụ huynh, giáo viên, lớp học, lịch điểm danh, biên lai thu học phí, bài tập, quà thưởng). Bạn nên tải bản sao lưu JSON về máy tính trước khi thực hiện.
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  1. Lựa chọn chế độ khôi phục
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResetType('empty')}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      resetType === 'empty'
                        ? 'border-red-500 bg-red-50/60 dark:bg-red-950/20 dark:border-red-700 ring-2 ring-red-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {resetType === 'empty' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold text-sm">
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa Trắng Dữ Liệu (Về 0)</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
                      Xóa sạch 100% học viên, giáo viên, lớp, học phí và điểm danh để trung tâm nhập liệu từ đầu.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResetType('sample_seed')}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      resetType === 'sample_seed'
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/20 dark:border-blue-700 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {resetType === 'sample_seed' && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                      <RefreshCw className="w-4 h-4" />
                      <span>Dữ Liệu Mẫu Mặc Định</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">
                      Khôi phục lại bộ dữ liệu mẫu ban đầu (học viên mẫu, lớp mẫu, hóa đơn mẫu) để trải nghiệm thử.
                    </p>
                  </button>
                </div>
              </div>

              {/* Data Summary Stats */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Dữ liệu hiện có trên hệ thống:
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Sẽ bị ảnh hưởng
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-500" /> Học viên:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{students.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500" /> Giáo viên:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{teachers.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-emerald-500" /> Lớp học:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{classes.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-amber-500" /> Hóa đơn:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{tuitionPayments.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-purple-500" /> Điểm danh:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{attendance.length}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-rose-500" /> Bài tập/Sự kiện:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{assignments.length + events.length}</span>
                  </div>
                </div>
              </div>

              {/* Safety Backup Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                      Sao lưu dữ liệu trước khi xóa
                    </div>
                    <div className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                      Tải về tệp JSON chứa toàn bộ dữ liệu hiện tại
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                    downloadedBackup
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {downloadedBackup ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Đã tải về sao lưu</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải Bản Sao Lưu (.json)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Options for Empty Mode */}
              {resetType === 'empty' && (
                <div className="space-y-2.5 pt-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    2. Tùy chọn giữ lại
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preserveSubjects}
                        onChange={e => setPreserveSubjects(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Giữ lại danh mục Môn học & Khóa học cơ bản (Piano, Guitar, Thanh Nhạc, Trống, Violin...)
                      </span>
                    </label>

                    <label className="flex items-center space-x-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preserveAdmins}
                        onChange={e => setPreserveAdmins(e.target.checked)}
                        className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Giữ lại Tài khoản Quản trị viên (Admin) để tiếp tục đăng nhập quản lý
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Admin Verification Section */}
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  3. Xác thực danh tính Quản trị viên
                </label>

                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-slate-500">Tài khoản xác thực:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {currentUser?.displayName || 'Quản Trị Viên'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold text-[11px]">
                    ADMIN
                  </span>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Nhập mật khẩu Admin của bạn:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đăng nhập..."
                      className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmation Phrase Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Gõ chính xác cụm từ <span className="font-bold text-red-600 dark:text-red-400 select-all font-mono bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900">{REQUIRED_PHRASE}</span> để xác nhận:
                  </label>
                  <input
                    type="text"
                    value={confirmPhrase}
                    onChange={e => setConfirmPhrase(e.target.value)}
                    placeholder={`Gõ "${REQUIRED_PHRASE}"`}
                    className="w-full px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 uppercase focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  />
                </div>

                {/* Agreement Checkbox */}
                <label className="flex items-start space-x-3 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAgreed}
                    onChange={e => setHasAgreed(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 mt-0.5"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                    Tôi là Quản trị viên và xác nhận đồng ý thực hiện khôi phục cài đặt gốc. Tôi hiểu rằng hành động này không thể hoàn tác sau khi xác nhận.
                  </span>
                </label>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-medium text-red-700 dark:text-red-300 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleExecuteReset}
              disabled={
                isProcessing || 
                !hasAgreed || 
                confirmPhrase.trim().toUpperCase() !== REQUIRED_PHRASE ||
                !adminPassword
              }
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center space-x-2 ${
                isProcessing || 
                !hasAgreed || 
                confirmPhrase.trim().toUpperCase() !== REQUIRED_PHRASE ||
                !adminPassword
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 shadow-red-500/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý khôi phục...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {resetType === 'empty' 
                      ? 'Xác Nhận Khôi Phục Dữ Liệu Trống' 
                      : 'Xác Nhận Khôi Phục Dữ Liệu Mẫu'}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default FactoryResetModal;
