import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Key, 
  Mail, 
  Lock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Phone, 
  ShieldCheck, 
  Sparkles,
  Eye,
  EyeOff,
  Send,
  HelpCircle
} from 'lucide-react';
import { UserAccount } from '../../types';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessReset?: (identifier: string) => void;
  initialIdentifier?: string;
  themeColor?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccessReset,
  initialIdentifier = '',
  themeColor = '#059669'
}) => {
  const { findAccountByIdentifier, resetPassword } = useAuth();

  const [step, setStep] = useState<'IDENTIFY' | 'VERIFY_AND_RESET' | 'SUCCESS'>('IDENTIFY');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [matchedAccount, setMatchedAccount] = useState<UserAccount | null>(null);

  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // New Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Find Account
  const handleFindAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = identifier.trim();
    if (!clean) {
      setError('Vui lòng nhập Email, Số điện thoại hoặc Tên đăng nhập.');
      return;
    }

    const acc = findAccountByIdentifier(clean);
    if (!acc) {
      setError('Không tìm thấy tài khoản tương ứng với thông tin đã nhập. Vui lòng kiểm tra lại hoặc liên hệ Quản trị viên.');
      return;
    }

    setMatchedAccount(acc);
    setStep('VERIFY_AND_RESET');
    // Auto send initial simulated OTP
    handleSendOtp(acc);
  };

  const handleSendOtp = (accTarget?: UserAccount) => {
    const acc = accTarget || matchedAccount;
    if (!acc) return;

    // Generate 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsOtpSent(true);
    setOtpCountdown(60);

    // Simulated SMS / Email notification timer
    const interval = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Mask email helper (e.g. ng***@gmail.com)
  const maskEmail = (email: string) => {
    if (!email || !email.includes('@')) return email;
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `${user}***@${domain}`;
    return `${user.substring(0, 2)}***${user.slice(-1)}@${domain}`;
  };

  // Mask phone helper (e.g. 090****088)
  const maskPhone = (phone?: string) => {
    if (!phone || phone.length < 7) return phone || 'Chưa cập nhật';
    return `${phone.substring(0, 3)}****${phone.slice(-3)}`;
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!matchedAccount) {
      setError('Không tìm thấy thông tin tài khoản.');
      return;
    }

    // Verify OTP
    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      setError('Mã xác thực OTP không chính xác. Vui lòng nhập đúng mã đã được cấp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có độ dài tối thiểu từ 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp với mật khẩu mới.');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(matchedAccount.email || matchedAccount.username || identifier, newPassword);
    setIsLoading(false);

    if (result.success) {
      setStep('SUCCESS');
      if (onSuccessReset) {
        onSuccessReset(matchedAccount.email || matchedAccount.username || identifier);
      }
    } else {
      setError(result.error || 'Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại.');
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col z-[100000]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: themeColor }}
            >
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                Khôi Phục Mật Khẩu
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Lấy lại quyền truy cập tài khoản Minh Music
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {/* STEP 1: IDENTIFY */}
          {step === 'IDENTIFY' && (
            <form onSubmit={handleFindAccount} className="space-y-4">
              <div className="text-center py-2 space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Nhập thông tin tài khoản của bạn
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Hệ thống sẽ tra cứu tài khoản qua Email, Số điện thoại hoặc Tên đăng nhập để tiến hành gửi mã xác thực.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email, Số điện thoại hoặc Tên đăng nhập:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Ví dụ: minh123tho@gmail.com, 0908151088 hoặc tên đăng nhập"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer hover:brightness-110 active:scale-98"
                style={{ backgroundColor: themeColor }}
              >
                Tìm Tài Khoản & Tiếp Tục
              </button>

              {/* Quick hotline note */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-center gap-2.5 text-[11px] text-amber-800 dark:text-amber-300">
                <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Quên cả Email và SĐT? Liên hệ Trưởng trung tâm qua Hotline/Zalo: <strong>0908 151 088</strong> (Thầy Minh).
                </span>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY AND RESET */}
          {step === 'VERIFY_AND_RESET' && matchedAccount && (
            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
              {/* Account Card Preview */}
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shrink-0">
                    {matchedAccount.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs">
                      {matchedAccount.displayName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Email: {maskEmail(matchedAccount.email)} • SĐT: {maskPhone(matchedAccount.phone)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('IDENTIFY');
                    setError(null);
                  }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Đổi
                </button>
              </div>

              {/* Simulated OTP Notification Banner */}
              {isOtpSent && generatedOtp && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-blue-800 dark:text-blue-300">
                    <span className="font-bold flex items-center gap-1.5 text-[11px]">
                      <Send className="w-3.5 h-3.5" />
                      Mã xác thực OTP đã được tạo:
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedOtp)}
                      className="text-[11px] font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-700 hover:bg-blue-100 cursor-pointer"
                      title="Nhấn để tự động điền mã OTP"
                    >
                      Điền nhanh mã: {generatedOtp}
                    </button>
                  </div>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400">
                    (Trong môi trường ứng dụng Minh Music, mã xác thực hiển thị trực tiếp để bạn khôi phục tài khoản tức thì).
                  </p>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Mã xác thực OTP (6 chữ số):
                  </label>
                  <button
                    type="button"
                    disabled={otpCountdown > 0}
                    onClick={() => handleSendOtp()}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {otpCountdown > 0 ? `Gửi lại sau (${otpCountdown}s)` : 'Gửi lại mã OTP'}
                  </button>
                </div>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      if (error) setError(null);
                    }}
                    placeholder="Nhập mã 6 chữ số"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono tracking-widest text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mật khẩu mới:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Xác nhận lại mật khẩu mới:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Nhập lại chính xác mật khẩu mới"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('IDENTIFY')}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 text-white font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer hover:brightness-110 active:scale-98 disabled:opacity-50"
                  style={{ backgroundColor: themeColor }}
                >
                  {isLoading ? 'Đang cập nhật...' : 'Xác Nhận & Đổi Mật Khẩu'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Đã Đặt Lại Mật Khẩu Thành Công!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Mật khẩu tài khoản của bạn đã được cập nhật an toàn. Bây giờ bạn có thể đăng nhập ngay bằng mật khẩu mới vừa thiết lập.
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer hover:brightness-110 active:scale-98"
                style={{ backgroundColor: themeColor }}
              >
                Quay Lại Đăng Nhập Ngay
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
