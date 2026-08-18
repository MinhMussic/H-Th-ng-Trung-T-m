import React, { useState } from 'react';
import { Student } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../context/SoundContext';
import { 
  User, 
  KeyRound, 
  Settings, 
  Building2, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Copy, 
  Check, 
  Lock,
  Sparkles,
  Edit3
} from 'lucide-react';

interface StudentAccountSettingsProps {
  currentStudent: Student;
  activeSubSection: 'profile_info' | 'settings' | 'change_password';
  onOpenEditProfileModal: () => void;
}

export const StudentAccountSettings: React.FC<StudentAccountSettingsProps> = ({
  currentStudent,
  activeSubSection,
  onOpenEditProfileModal
}) => {
  const { currentUser } = useAuth();
  const { branches } = useData();
  const { theme, isDark, toggleTheme } = useTheme();
  const { isSoundEnabled, toggleSound } = useSound();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordToast, setPasswordToast] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    setPasswordToast('🎉 Đã cập nhật mật khẩu mới thành công!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordToast(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. PROFILE INFO SUBSECTION */}
      {activeSubSection === 'profile_info' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={currentStudent.avatar || currentStudent.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={currentStudent.fullName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 font-heading">
                      {currentStudent.fullName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                      Mã: {currentStudent.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Học viên chính thức • {currentStudent.enrolledSubjects?.join(', ') || 'Chưa đăng ký môn'}
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenEditProfileModal}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh Sửa Hồ Sơ & Ảnh</span>
              </button>
            </div>

            {/* Profile detail grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[11px]">Ngày sinh học viên:</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{currentStudent.birthDate || 'Chưa cập nhật'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[11px]">Số điện thoại / Zalo:</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{currentStudent.phone || currentUser?.phone || 'Chưa cập nhật'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[11px]">Email đăng nhập:</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">{currentStudent.email || currentUser?.email || 'Chưa cập nhật'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[11px]">Phụ huynh / Người bảo hộ:</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{currentStudent.guardianName || 'Chưa cập nhật'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[11px]">Hotline phụ huynh:</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{currentStudent.guardianPhone || 'Chưa cập nhật'}</p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[11px]">Tổng số buổi còn lại:</span>
                <p className="font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{currentStudent.remainingLessons ?? 12} Buổi học ⭐</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SYSTEM SETTINGS & BRANCHES SUBSECTION */}
      {activeSubSection === 'settings' && (
        <div className="space-y-6">
          {/* Theme & Sound Controls */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100 font-heading flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              <span>Tùy Chỉnh Giao Diện & Hiệu Ứng</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Giao diện Sáng / Tối</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Chuyển đổi tông màu ban ngày hoặc bảo vệ mắt</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-2.5 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100">Hiệu ứng âm thanh</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Âm thanh click phím và nhận thưởng</p>
                </div>
                <button
                  onClick={toggleSound}
                  className="p-2.5 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {isSoundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Branches Network */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <h3 className="font-black text-base text-slate-900 dark:text-slate-100 font-heading flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Mạng Lưới Cơ Sở & Hotline Minh Music</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {branches.map(b => (
                <div key={b.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-black text-xs text-slate-900 dark:text-slate-100">{b.name}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-bold">
                    <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{b.phone || '0988.776.655'}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. CHANGE PASSWORD SUBSECTION */}
      {activeSubSection === 'change_password' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 rounded-2xl">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 font-heading">
                Đổi Mật Khẩu Tài Khoản
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bảo vệ an toàn tài khoản học viên và dữ liệu học tập cá nhân.
              </p>
            </div>
          </div>

          {passwordToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordToast}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Mật khẩu hiện tại:</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Mật khẩu mới (tối thiểu 6 ký tự):</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">Xác nhận lại mật khẩu mới:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-medium"
                required
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Cập Nhật Mật Khẩu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
