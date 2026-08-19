import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { BrandLogo } from '../common/BrandLogo';
import { 
  Music, 
  Lock, 
  Mail, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  UserPlus, 
  AlertCircle,
  KeyRound,
  Check,
  CheckCircle2
} from 'lucide-react';

interface LoginViewProps {
  onSwitchToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { branding } = useData();
  const { isDark, toggleTheme } = useTheme();

  // Remember login state
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return localStorage.getItem('minhmusic_remember_me') === 'true';
  });

  const [identifier, setIdentifier] = useState<string>(() => {
    if (localStorage.getItem('minhmusic_remember_me') === 'true') {
      return localStorage.getItem('minhmusic_remembered_identifier') || '';
    }
    return '';
  });

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Color scheme toggle (Fresh Green by default)
  const [colorScheme, setColorScheme] = useState<'green' | 'branding' | 'indigo' | 'amber'>('green');

  const themeColors = useMemo(() => {
    switch (colorScheme) {
      case 'green':
        return {
          primary: '#059669', // emerald-600
          primaryLight: '#10b981', // emerald-500
          textAccent: 'text-emerald-600 dark:text-emerald-400',
          btnGradient: 'from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-green-700',
          glowColor: '#10b981'
        };
      case 'indigo':
        return {
          primary: '#4f46e5',
          primaryLight: '#6366f1',
          textAccent: 'text-indigo-600 dark:text-indigo-400',
          btnGradient: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
          glowColor: '#4f46e5'
        };
      case 'amber':
        return {
          primary: '#d97706',
          primaryLight: '#f59e0b',
          textAccent: 'text-amber-600 dark:text-amber-400',
          btnGradient: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
          glowColor: '#d97706'
        };
      case 'branding':
      default:
        return {
          primary: branding.primaryColor || '#059669',
          primaryLight: branding.secondaryColor || '#10b981',
          textAccent: 'text-emerald-600 dark:text-emerald-400',
          btnGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
          glowColor: branding.primaryColor || '#059669'
        };
    }
  }, [colorScheme, branding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('Vui lòng nhập Email hoặc Tên đăng nhập.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập Mật khẩu.');
      return;
    }

    setIsLoading(true);
    const result = await login(cleanIdentifier, password);
    setIsLoading(false);

    if (result.success) {
      // Save or remove remember login credentials
      if (rememberMe) {
        localStorage.setItem('minhmusic_remember_me', 'true');
        localStorage.setItem('minhmusic_remembered_identifier', cleanIdentifier);
      } else {
        localStorage.removeItem('minhmusic_remember_me');
        localStorage.removeItem('minhmusic_remembered_identifier');
      }
    } else {
      setError(result.error || 'Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/50 to-green-100/60 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decorative Ambient Orbs */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ backgroundColor: themeColors.glowColor }}
      />
      <div 
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: '#10b981' }}
      />

      {/* Top right Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Color Palette Switcher */}
        <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-xs">
          <button
            onClick={() => setColorScheme('green')}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${colorScheme === 'green' ? 'ring-2 ring-emerald-500 scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'}`}
            title="Tone Xanh Lá Cây Tươi Sáng"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
          </button>
          <button
            onClick={() => setColorScheme('amber')}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${colorScheme === 'amber' ? 'ring-2 ring-amber-500 scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'}`}
            title="Tone Vàng Hoàng Gia"
          >
            <div className="w-4 h-4 rounded-full bg-amber-500" />
          </button>
          <button
            onClick={() => setColorScheme('indigo')}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${colorScheme === 'indigo' ? 'ring-2 ring-indigo-500 scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'}`}
            title="Tone Xanh Indigo Quý Phái"
          >
            <div className="w-4 h-4 rounded-full bg-indigo-500" />
          </button>
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-2 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 backdrop-blur-md transition-colors shadow-xs cursor-pointer"
          title="Chuyển đổi giao diện Sáng / Tối"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Chế độ Tối</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Chế độ Sáng</span>
            </>
          )}
        </button>
      </div>

      {/* Main Login Box */}
      <div className="max-w-md w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-500/20 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <BrandLogo 
            size="lg"
            collapsed={true}
          />
          <div>
            <h1 className="text-2xl font-black font-heading tracking-tight text-slate-900 dark:text-white">
              {branding.centerName || 'MINH MUSIC'} {branding.subName || 'CENTER'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
              {branding.slogan || 'HỆ THỐNG QUẢN LÝ TRUNG TÂM ÂM NHẠC TOÀN DIỆN'}
            </p>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Success notification (e.g., from reset password) */}
        {successNotice && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{successNotice}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
              Tài khoản (Email, Mã HV/PH, SĐT hoặc Username):
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (error) setError(null);
                  if (successNotice) setSuccessNotice(null);
                }}
                placeholder="VD: HV001, PH001, 0909112233, minhanh..."
                autoComplete="username"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">
                Mật khẩu:
              </label>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <KeyRound className="w-3 h-3" />
                <span>Quên mật khẩu?</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Nhập mật khẩu (Mặc định: 123456 hoặc student123/parent123)"
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Ghi nhớ đăng nhập (Remember Me Checkbox) */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div 
                  className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center ${
                    rememberMe 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-emerald-400'
                  }`}
                >
                  {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                Ghi nhớ đăng nhập
              </span>
            </label>

            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
              Lưu tài khoản cho lần sau
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer hover:brightness-110 active:scale-98 disabled:opacity-50"
            style={{
              background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.primaryLight})`
            }}
          >
            {isLoading ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}
          </button>

          {/* Tài khoản mẫu tiện ích (Quick Fill Helpers) */}
          <div className="pt-2">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
              <span>Gợi ý tài khoản kiểm tra nhanh:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setIdentifier('HV001');
                  setPassword('student123');
                  setError(null);
                }}
                className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left hover:border-emerald-500 transition-all cursor-pointer group"
              >
                <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                  <span>Học Viên (Minh Anh)</span>
                  <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-1 rounded">Điền</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[10px] truncate">HV001 • student123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('PH001');
                  setPassword('parent123');
                  setError(null);
                }}
                className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left hover:border-amber-500 transition-all cursor-pointer group"
              >
                <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center justify-between">
                  <span>Phụ Huynh (Bố Hùng)</span>
                  <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-1 rounded">Điền</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[10px] truncate">PH001 • parent123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('huong.tran');
                  setPassword('teacher123');
                  setError(null);
                }}
                className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-left hover:border-blue-500 transition-all cursor-pointer group"
              >
                <div className="font-bold text-blue-700 dark:text-blue-400 flex items-center justify-between">
                  <span>Giáo Viên (Mai Hương)</span>
                  <span className="text-[10px] bg-blue-200 dark:bg-blue-900 px-1 rounded">Điền</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[10px] truncate">huong.tran • teacher123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('admin');
                  setPassword('admin123');
                  setError(null);
                }}
                className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-left hover:border-purple-500 transition-all cursor-pointer group"
              >
                <div className="font-bold text-purple-700 dark:text-purple-400 flex items-center justify-between">
                  <span>Quản Trị (Admin)</span>
                  <span className="text-[10px] bg-purple-200 dark:bg-purple-900 px-1 rounded">Điền</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[10px] truncate">admin • admin123</div>
              </button>
            </div>
          </div>
        </form>

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
          initialIdentifier={identifier}
          themeColor={themeColors.primary}
          onSuccessReset={(recoveredId) => {
            setIdentifier(recoveredId);
            setSuccessNotice('Đã khôi phục mật khẩu thành công! Bạn có thể đăng nhập ngay với mật khẩu mới.');
          }}
        />

        {/* Register CTA Link */}
        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Chưa có tài khoản thành viên?{' '}
            <button
              onClick={onSwitchToRegister}
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký tài khoản ngay</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
