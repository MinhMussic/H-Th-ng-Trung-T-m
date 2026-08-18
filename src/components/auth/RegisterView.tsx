import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole, RegisterPayload } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { 
  Music, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Globe, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  AlertCircle, 
  KeyRound, 
  UserCheck, 
  BookOpen, 
  Sun, 
  Moon, 
  ArrowLeft,
  Eye,
  EyeOff,
  Palette,
  Clock,
  CheckCircle,
  BellRing,
  Info,
  PhoneCall,
  X
} from 'lucide-react';

interface RegisterViewProps {
  onSwitchToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const { branding } = useData();
  const { isDark, toggleTheme } = useTheme();

  // Role selector: STUDENT, TEACHER, PARENT
  const [role, setRole] = useState<UserRole>('STUDENT');

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('2012-05-15');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [nationality, setNationality] = useState('Việt Nam');
  const [ethnicity, setEthnicity] = useState('Kinh');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Under-16 Guardian Fields (For Student)
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Mẹ');
  const [guardianBirthYear, setGuardianBirthYear] = useState('1985');

  // Teacher Specific Fields
  const [specialties, setSpecialties] = useState<string[]>(['Piano']);
  const [teacherBio, setTeacherBio] = useState('');

  // Parent/Guardian Specific Fields
  const [childStudentName, setChildStudentName] = useState('');
  const [parentRelation, setParentRelation] = useState('Phụ huynh');

  // UI States
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToastNotification, setShowToastNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Theme Accent Switcher (Fresh Green default)
  const [colorScheme, setColorScheme] = useState<'green' | 'branding' | 'indigo' | 'amber'>('green');

  // Calculate student age
  const calculatedAge = useMemo(() => {
    if (!birthDate) return 18;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return isNaN(age) ? 18 : age;
  }, [birthDate]);

  const isUnder16 = role === 'STUDENT' && calculatedAge < 16;

  // Primary color theme resolution
  const themeColors = useMemo(() => {
    switch (colorScheme) {
      case 'green':
        return {
          primary: '#059669', // emerald-600
          primaryLight: '#10b981', // emerald-500
          accentBg: 'bg-emerald-500/15',
          borderAccent: 'border-emerald-500/30',
          textAccent: 'text-emerald-600 dark:text-emerald-400',
          btnGradient: 'from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-green-700',
          glowColor: '#10b981'
        };
      case 'indigo':
        return {
          primary: '#4f46e5',
          primaryLight: '#6366f1',
          accentBg: 'bg-indigo-500/15',
          borderAccent: 'border-indigo-500/30',
          textAccent: 'text-indigo-600 dark:text-indigo-400',
          btnGradient: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700',
          glowColor: '#4f46e5'
        };
      case 'amber':
        return {
          primary: '#d97706',
          primaryLight: '#f59e0b',
          accentBg: 'bg-amber-500/15',
          borderAccent: 'border-amber-500/30',
          textAccent: 'text-amber-600 dark:text-amber-400',
          btnGradient: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
          glowColor: '#d97706'
        };
      case 'branding':
      default:
        return {
          primary: branding.primaryColor || '#059669',
          primaryLight: branding.secondaryColor || '#10b981',
          accentBg: 'bg-emerald-500/15',
          borderAccent: 'border-emerald-500/30',
          textAccent: 'text-emerald-600 dark:text-emerald-400',
          btnGradient: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
          glowColor: branding.primaryColor || '#059669'
        };
    }
  }, [colorScheme, branding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!fullName.trim()) {
      setError('Vui lòng nhập đầy đủ Họ và tên.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập địa chỉ Gmail / Email hợp lệ.');
      return;
    }
    if (!username.trim()) {
      setError('Vui lòng nhập Tên đăng nhập.');
      return;
    }
    if (username.length < 3) {
      setError('Tên đăng nhập cần ít nhất 3 ký tự.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập Số điện thoại liên hệ.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự để bảo mật.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    // Check under 16 student requirement
    if (isUnder16) {
      if (!guardianName.trim()) {
        setError('Học viên dưới 16 tuổi bắt buộc phải nhập Họ và tên Ba Mẹ / Người giám hộ.');
        return;
      }
      if (!guardianPhone.trim()) {
        setError('Học viên dưới 16 tuổi bắt buộc phải nhập Số điện thoại của Ba Mẹ / Người giám hộ.');
        return;
      }
    }

    setIsSubmitting(true);

    const payload: RegisterPayload = {
      role,
      displayName: fullName.trim(),
      nickname: role === 'STUDENT' ? (nickname.trim() || undefined) : undefined,
      birthDate: role === 'STUDENT' ? birthDate : undefined,
      nationality: nationality.trim() || 'Việt Nam',
      ethnicity: ethnicity.trim() || 'Kinh',
      address: address.trim() || undefined,
      phone: phoneNumber.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      password,
      guardianName: isUnder16 ? guardianName.trim() : (role === 'PARENT' ? childStudentName.trim() : undefined),
      guardianPhone: isUnder16 ? guardianPhone.trim() : undefined,
      guardianRelation: isUnder16 ? guardianRelation : (role === 'PARENT' ? parentRelation : undefined),
      guardianBirthYear: isUnder16 ? guardianBirthYear : undefined,
      isUnder16,
      specialties: role === 'TEACHER' ? specialties : undefined,
      note: role === 'TEACHER' 
        ? `Đăng ký Giáo viên môn ${specialties.join(', ')}. Chờ Admin duyệt.`
        : role === 'PARENT'
        ? `Đăng ký Phụ huynh / Người giám hộ. Học viên: ${childStudentName || 'Chưa cập nhật'}.`
        : `Đăng ký Học viên (${calculatedAge} tuổi). ${isUnder16 ? `Người giám hộ: ${guardianName} - ${guardianPhone}` : 'Tự quản lý'}.`
    };

    const res = await register(payload);
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
      setShowSuccessModal(true);
      setShowToastNotification(true);
    } else {
      setError(res.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      if (specialties.length > 1) {
        setSpecialties(specialties.filter(s => s !== spec));
      }
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50/50 to-green-100/60 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-3 sm:p-6 relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Decorative Ambient Orbs */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ backgroundColor: themeColors.glowColor }}
      />
      <div 
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: '#10b981' }}
      />

      {/* Top Bar with Center Brand, Theme Selector, and Dark Mode */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 z-20">
        <button
          onClick={onSwitchToLogin}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang Đăng nhập</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Color Scheme Picker */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            title="Chuyển chế độ Sáng / Tối"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
            <span className="hidden sm:inline">{isDark ? 'Tối' : 'Sáng'}</span>
          </button>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-3xl w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-emerald-500/20 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <BrandLogo 
            size="lg"
            collapsed={true}
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-900 dark:text-white">
              ĐĂNG KÝ THÀNH VIÊN MỚI
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-md mx-auto mt-1">
              {branding.centerName || 'MINH MUSIC CENTER'} • Hệ thống đào tạo & phát triển tài năng âm nhạc
            </p>
          </div>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="p-6 sm:p-8 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200 font-heading">
                Đăng Ký Tài Khoản Thành Công!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed max-w-lg mx-auto">
                Hồ sơ tài khoản <strong>{fullName}</strong> (Tên đăng nhập: <code className="px-1.5 py-0.5 bg-emerald-200 dark:bg-emerald-900 rounded font-mono font-bold text-emerald-950 dark:text-emerald-100">{username}</code>) với vai trò <strong>{role === 'STUDENT' ? 'Học Viên' : role === 'TEACHER' ? 'Giáo Viên' : 'Phụ Huynh / Giám Hộ'}</strong> đã được gửi lên hệ thống.
              </p>
            </div>

            <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-500/30 text-left text-xs text-slate-700 dark:text-slate-300 space-y-1.5 max-w-md mx-auto">
              <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Trạng thái: Đang chờ Quản trị viên (Admin) phê duyệt</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Ban quản trị Minh Music sẽ xác thực thông tin và kích hoạt quyền truy cập của bạn vào app trong thời gian sớm nhất. Bạn có thể liên hệ trực tiếp Hotline <strong>{branding.hotline || '0901.888.999'}</strong> để được hỗ trợ kích hoạt nhanh.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
              <button
                onClick={onSwitchToLogin}
                className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Về Trang Đăng Nhập
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">

            {/* Role Selection Tabs */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-2">
                1. Chọn vai trò đăng ký tài khoản (*):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('STUDENT')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    role === 'STUDENT'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md font-black shadow-emerald-500/25'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 font-semibold'
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  <span className="text-xs font-bold">Học Viên</span>
                  <span className="text-[10px] opacity-80">(Student)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('TEACHER')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    role === 'TEACHER'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md font-black shadow-emerald-500/25'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 font-semibold'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-xs font-bold">Giáo Viên</span>
                  <span className="text-[10px] opacity-80">(Teacher)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('PARENT')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    role === 'PARENT'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md font-black shadow-emerald-500/25'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 font-semibold'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-xs font-bold">Phụ Huynh / Giám Hộ</span>
                  <span className="text-[10px] opacity-80">(Parent / Guardian)</span>
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 2. Personal Information Section */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs sm:text-sm">
                  <User className="w-4 h-4 text-emerald-500" />
                  <span>2. Thông tin cá nhân & Liên hệ:</span>
                </h3>
                {role === 'STUDENT' && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    Tuổi học viên: {calculatedAge} tuổi
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Họ và tên */}
                <div className={role === 'STUDENT' ? '' : 'sm:col-span-2'}>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Họ và tên đầy đủ (*):
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn An"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Tên gọi / Biệt danh (Chỉ hiển thị cho Học viên) */}
                {role === 'STUDENT' && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Tên gọi / Biệt danh thân mật:
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Ví dụ: Bé Bắp, An Piano, Mimi..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {/* Ngày tháng năm sinh (For student or anyone) */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Ngày tháng năm sinh (*):
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Giới tính */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Giới tính:
                  </label>
                  <div className="flex gap-2">
                    {(['Nam', 'Nữ', 'Khác'] as const).map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          gender === g
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quốc tịch */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Quốc tịch:
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="Việt Nam"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Dân tộc */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Dân tộc:
                  </label>
                  <input
                    type="text"
                    value={ethnicity}
                    onChange={(e) => setEthnicity(e.target.value)}
                    placeholder="Kinh, Hoa, Tày..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Số điện thoại liên hệ (*):
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Gmail / Email */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Địa chỉ Gmail / Email (*):
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenhocvien@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Địa chỉ nơi ở */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Địa chỉ thường trú / Tạm trú:
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Conditional Role-Specific Section */}

            {/* A. If Student is UNDER 16: Required Guardian/Parents info */}
            {role === 'STUDENT' && isUnder16 && (
              <div className="p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400/60 dark:border-amber-600/40 rounded-2xl space-y-3.5 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-black text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-heading">
                      Thông Tin Người Giám Hộ / Phụ Huynh (Bắt buộc với học viên dưới 16 tuổi - {calculatedAge} tuổi):
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-400/90 leading-tight mt-0.5">
                      Theo quy chế trung tâm, học viên dưới 16 tuổi cần có thông tin Ba Mẹ hoặc Người giám hộ để phối hợp lịch học, đóng học phí và thông báo an toàn.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-amber-950 dark:text-amber-200 font-bold mb-1">
                      Họ và tên Ba Mẹ / Người giám hộ (*):
                    </label>
                    <input
                      type="text"
                      required={isUnder16}
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Thị Mai (Mẹ)"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-950 dark:text-amber-200 font-bold mb-1">
                      Số điện thoại Ba Mẹ / Người giám hộ (*):
                    </label>
                    <input
                      type="tel"
                      required={isUnder16}
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="0988 776 655"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-amber-950 dark:text-amber-200 font-bold mb-1">
                      Mối quan hệ với học viên:
                    </label>
                    <select
                      value={guardianRelation}
                      onChange={(e) => setGuardianRelation(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="Mẹ">Mẹ</option>
                      <option value="Cha">Cha</option>
                      <option value="Ông">Ông</option>
                      <option value="Bà">Bà</option>
                      <option value="Anh">Anh trai</option>
                      <option value="Chị">Chị gái</option>
                      <option value="Người giám hộ">Người giám hộ hợp pháp</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-amber-950 dark:text-amber-200 font-bold mb-1">
                      Năm sinh Phụ huynh / Giám hộ:
                    </label>
                    <input
                      type="number"
                      value={guardianBirthYear}
                      onChange={(e) => setGuardianBirthYear(e.target.value)}
                      placeholder="1985"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* B. If Teacher: Specialties and subject experience */}
            {role === 'TEACHER' && (
              <div className="p-4 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h4 className="font-bold text-teal-900 dark:text-teal-300 text-xs sm:text-sm">
                    Bộ môn chuyên môn giảng dạy (Chọn 1 hoặc nhiều):
                  </h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Piano', 'Guitar', 'Thanh nhạc (Vocal)', 'Organ/Keyboard', 'Trống (Drums)', 'Violin', 'Ukulele', 'Cảm thụ âm nhạc'].map((m) => {
                    const isSelected = specialties.includes(m);
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => toggleSpecialty(m)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{m}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* C. If Parent / Guardian */}
            {role === 'PARENT' && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm">
                    Thông tin học viên con em theo học (hoặc bảo hộ):
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Mối quan hệ với học viên:
                    </label>
                    <select
                      value={parentRelation}
                      onChange={(e) => setParentRelation(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      <option value="Phụ huynh (Mẹ)">Mẹ</option>
                      <option value="Phụ huynh (Cha)">Cha</option>
                      <option value="Ông/Bà">Ông / Bà</option>
                      <option value="Anh/Chị">Anh / Chị</option>
                      <option value="Người giám hộ">Người giám hộ hợp pháp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                      Họ tên học viên (con em):
                    </label>
                    <input
                      type="text"
                      value={childStudentName}
                      onChange={(e) => setChildStudentName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Minh Anh"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. Account Credentials Section */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs sm:text-sm">
                <KeyRound className="w-4 h-4 text-emerald-500" />
                <span>3. Thiết lập Tài khoản & Mật khẩu đăng nhập:</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Tên đăng nhập */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Tên đăng nhập (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    placeholder="vd: an_piano2024"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Chữ thường, số, dấu gạch dưới</span>
                </div>

                {/* Mật khẩu */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Mật khẩu đăng nhập (*):
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                    Nhập lại mật khẩu (*):
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Khớp với mật khẩu trên"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl transition-all cursor-pointer hover:brightness-110 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.primaryLight})`
                }}
              >
                {isSubmitting ? (
                  <span>Đang khởi tạo tài khoản...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Gửi Đăng Ký Tài Khoản & Chờ Admin Duyệt</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-normal">
                Bằng việc bấm Đăng Ký, bạn đồng ý với Quy chế hoạt động & Chính sách bảo vệ dữ liệu học viên của {branding.centerName || 'Minh Music'}.
              </p>
            </div>
          </form>
        )}

        {/* Footer Link to Login */}
        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Bạn đã có tài khoản trên hệ thống?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              Đăng nhập ngay tại đây
            </button>
          </p>
        </div>
      </div>

      {/* FLOATING TOAST NOTIFICATION: Triggers on successful registration */}
      {showToastNotification && (
        <div className="fixed top-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100%-2rem)] sm:w-auto animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start gap-3 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 pr-6 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Gửi Đơn Đăng Ký Thành Công!</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Tài khoản <strong className="text-slate-900 dark:text-white">{username}</strong> ({fullName}) đang trong trạng thái <strong>Chờ Quản trị viên (Admin) phê duyệt</strong>.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setShowSuccessModal(true)}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-700 cursor-pointer"
                >
                  Xem hướng dẫn duyệt tài khoản &gt;
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowToastNotification(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* DEDICATED MODAL: Pending Approval by Administrator Instructions */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 text-slate-900 dark:text-slate-100">
            
            {/* Modal Header */}
            <div className="text-center space-y-2 relative">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute -top-1 -right-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-emerald-950 dark:text-emerald-200">
                Tài Khoản Chờ Phê Duyệt
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Hệ thống {branding.centerName || 'MINH MUSIC CENTER'}
              </p>
            </div>

            {/* Account Summary Banner */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs space-y-1.5">
              <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Họ và tên:</span>
                <span className="font-bold text-slate-900 dark:text-white">{fullName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Tên đăng nhập:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">@{username}</span>
              </div>
              <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/60 pb-1.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Vai trò đăng ký:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {role === 'STUDENT' ? 'Học Viên' : role === 'TEACHER' ? 'Giáo Viên' : 'Phụ Huynh / Giám Hộ'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Trạng thái hồ sơ:</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Đang chờ Admin duyệt (Pending)</span>
                </span>
              </div>
            </div>

            {/* Instruction Steps for User */}
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-500" />
                <span>Quy Trình & Hướng Dẫn Kích Hoạt:</span>
              </h3>

              <div className="space-y-2 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Xác thực thông tin:</strong> Ban quản trị (Admin) trung tâm sẽ kiểm tra hồ sơ đăng ký và đối soát với danh sách học viên/giáo viên.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Phê duyệt & Đồng bộ quyền:</strong> Khi được Admin bấm "Phê Duyệt", tài khoản sẽ ngay lập tức được cấp quyền truy cập thời khóa biểu, điểm danh, bảng vàng sao và nhật ký học tập.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <strong className="text-emerald-900 dark:text-emerald-200">Cần kích hoạt nhanh?</strong> Quý phụ huynh & học viên có thể liên hệ trực tiếp phòng đào tạo hoặc Hotline <strong className="text-emerald-700 dark:text-emerald-300">{branding.hotline || '0901.888.999'}</strong> để được hỗ trợ phê duyệt ngay lập tức.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onSwitchToLogin();
                }}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Chuyển Sang Trang Đăng Nhập</span>
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
