import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useSound, AMBIENT_TRACKS, SoundTheme } from '../../context/SoundContext';
import { UserRole, Gender, GuardianRelation } from '../../types';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  Shield,
  Music,
  GraduationCap,
  Sparkles,
  Save,
  Lock,
  Eye,
  EyeOff,
  Star,
  Award,
  BookOpen,
  Clock,
  Heart,
  Users,
  Check,
  RefreshCw,
  Building,
  CreditCard,
  FileText,
  HelpCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Disc3,
  Sliders,
  MousePointerClick,
  Headphones,
  Radio,
  Waves,
  Plus,
  Trash2,
  Link,
  FileAudio,
  Music2,
  Palette
} from 'lucide-react';
import { ThemeSettingsSection } from '../theme/ThemeSettingsSection';

const PRESET_AVATARS = [
  {
    id: 'avt-1',
    label: 'Pianist / Admin',
    category: 'Giáo viên & Admin',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-2',
    label: 'Vocal Teacher',
    category: 'Giáo viên & Admin',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-3',
    label: 'Guitar Teacher',
    category: 'Giáo viên & Admin',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-4',
    label: 'Violin Artist',
    category: 'Giáo viên & Admin',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-5',
    label: 'Học viên Piano',
    category: 'Học viên',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-6',
    label: 'Học viên Violin',
    category: 'Học viên',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-7',
    label: 'Học viên Nhí',
    category: 'Học viên',
    url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-8',
    label: 'Học viên Guitar',
    category: 'Học viên',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-9',
    label: 'Phụ huynh Mẹ',
    category: 'Phụ huynh',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-10',
    label: 'Phụ huynh Ba',
    category: 'Phụ huynh',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-11',
    label: 'Ca sĩ & Nghệ sĩ',
    category: 'Nghệ sĩ',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'avt-12',
    label: 'Drummer Năng Động',
    category: 'Nghệ sĩ',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80'
  }
];

interface UserProfileViewProps {
  onClose?: () => void;
  initialTab?: 'info' | 'avatar' | 'related' | 'security' | 'audio' | 'theme';
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onClose, initialTab }) => {
  const { currentUser, role, updateUserProfile } = useAuth();
  const {
    isSoundEnabled,
    toggleSound,
    soundVolume,
    setSoundVolume,
    soundTheme,
    setSoundTheme,
    playClickSound,
    playSuccessSound,
    isMusicPlaying,
    toggleMusic,
    musicVolume,
    setMusicVolume,
    currentTrackId,
    currentTrack,
    setCurrentTrackId,
    nextTrack,
    prevTrack,
    customTracks,
    allTracks,
    addCustomTrack,
    removeCustomTrack
  } = useSound();

  const { 
    students, 
    teachers, 
    guardians, 
    classes, 
    updateStudent, 
    updateTeacher, 
    updateGuardian, 
    branding,
    branches,
    activeBranchId
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  // Active sub-tab inside profile
  const [activeTab, setActiveTab] = useState<'info' | 'avatar' | 'related' | 'security' | 'audio' | 'theme'>(initialTab || 'info');

  // Keep activeTab synced if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Custom Track Form State
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [trackSourceType, setTrackSourceType] = useState<'file' | 'url'>('file');
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackGenre, setNewTrackGenre] = useState('Acoustic / Piano');
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [newTrackFileData, setNewTrackFileData] = useState('');
  const [newTrackFileName, setNewTrackFileName] = useState('');
  const [trackTabFilter, setTrackTabFilter] = useState<'all' | 'preset' | 'custom'>('all');

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav') && !file.name.endsWith('.m4a') && !file.name.endsWith('.ogg')) {
      alert('Vui lòng chọn tệp âm thanh định dạng MP3, WAV, M4A hoặc OGG.');
      return;
    }

    // Limit to 15MB for localStorage storage
    if (file.size > 15 * 1024 * 1024) {
      alert('Dung lượng tệp tối đa là 15MB để đảm bảo hiệu năng lưu trữ trình duyệt.');
      return;
    }

    setNewTrackFileName(file.name);
    if (!newTrackTitle) {
      setNewTrackTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setNewTrackFileData(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCustomTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = trackSourceType === 'file' ? newTrackFileData : newTrackUrl.trim();
    if (!finalUrl) {
      alert(trackSourceType === 'file' ? 'Vui lòng chọn tệp âm thanh từ thiết bị của bạn.' : 'Vui lòng nhập đường dẫn URL âm thanh (ví dụ: https://.../music.mp3).');
      return;
    }
    if (!newTrackTitle.trim()) {
      alert('Vui lòng nhập tên bài nhạc.');
      return;
    }

    addCustomTrack({
      title: newTrackTitle.trim(),
      artist: newTrackArtist.trim() || 'Nhạc tự tải lên',
      genre: newTrackGenre.trim() || 'Tùy chỉnh',
      audioUrl: finalUrl,
      description: `Bản nhạc tải lên bởi ${currentUser?.displayName || 'Người dùng'}`
    });

    playSuccessSound();
    setIsAddingTrack(false);
    setNewTrackTitle('');
    setNewTrackArtist('');
    setNewTrackUrl('');
    setNewTrackFileData('');
    setNewTrackFileName('');
    if (!isMusicPlaying) {
      toggleMusic();
    }
  };

  // Form State
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [gender, setGender] = useState<Gender>(currentUser?.gender || 'Nam');
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate || '2000-01-01');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [bio, setBio] = useState(currentUser?.bio || currentUser?.note || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');

  // Specialty tags for Teacher
  const [specialties, setSpecialties] = useState<string[]>(
    currentUser?.specialties || ['Piano', 'Thanh nhạc']
  );
  const [newSpecialty, setNewSpecialty] = useState('');

  // Sync form state when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setGender(currentUser.gender || 'Nam');
      setBirthDate(currentUser.birthDate || '2000-01-01');
      setAddress(currentUser.address || '');
      setBio(currentUser.bio || currentUser.note || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      if (currentUser.specialties && currentUser.specialties.length > 0) {
        setSpecialties(currentUser.specialties);
      }
    }
  }, [currentUser]);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Avatar Tab states
  const [avatarInputMode, setAvatarInputMode] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const activeBranch = branches.find(b => b.id === activeBranchId) || branches[0];

  // Find linked entity in DataContext
  const linkedStudent = students.find(s => s.userId === currentUser?.uid || s.code === currentUser?.profileCode || s.id === currentUser?.profileId);
  const linkedTeacher = teachers.find(t => t.userId === currentUser?.uid || t.code === currentUser?.profileCode || t.id === currentUser?.profileId);
  const linkedGuardian = guardians.find(g => g.userId === currentUser?.uid || g.code === currentUser?.profileCode || g.id === currentUser?.profileId);

  // Classes linked to this user
  const myClasses = classes.filter(c => {
    if (role === 'TEACHER') {
      return c.teacherId === linkedTeacher?.id || c.teacherName === currentUser?.displayName;
    }
    if (role === 'STUDENT') {
      return c.studentIds?.includes(linkedStudent?.id || '') || c.studentIds?.includes(linkedStudent?.code || '');
    }
    return false;
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle image upload from computer (FileReader to base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('Kích thước file không được vượt quá 4MB', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      showToast('Đã tải ảnh lên! Hãy bấm "Lưu thay đổi" để áp dụng.');
    };
    reader.onerror = () => {
      showToast('Không thể đọc file ảnh. Vui lòng thử lại.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Handle saving personal info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Update in AuthContext & UserAccount
      await updateUserProfile({
        displayName,
        phone,
        email,
        gender,
        birthDate,
        address,
        bio,
        avatarUrl,
        specialties,
        note: bio
      });

      // 2. Synchronize to linked Student profile if applicable
      if (linkedStudent) {
        updateStudent(linkedStudent.id, {
          fullName: displayName,
          phone,
          email,
          gender,
          birthDate,
          address,
          avatar: avatarUrl,
          notes: bio
        });
      }

      // 3. Synchronize to linked Teacher profile if applicable
      if (linkedTeacher) {
        updateTeacher(linkedTeacher.id, {
          fullName: displayName,
          phone,
          email,
          gender,
          birthDate,
          avatar: avatarUrl,
          bio,
          specialties
        });
      }

      // 4. Synchronize to linked Guardian profile if applicable
      if (linkedGuardian) {
        updateGuardian(linkedGuardian.id, {
          fullName: displayName,
          phone,
          email,
          address,
          notes: bio
        });
      }

      showToast('Cập nhật hồ sơ cá nhân thành công!');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu thông tin.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Change Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Vui lòng nhập mật khẩu hiện tại.', 'error');
      return;
    }

    const expectedCurrentPassword = currentUser?.password || 
      (currentUser?.role === 'ADMIN' ? 'admin123' : 
       currentUser?.role === 'TEACHER' ? 'teacher123' : 
       currentUser?.role === 'STUDENT' ? 'student123' : 'parent123');

    if (currentPassword !== expectedCurrentPassword) {
      showToast('Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Xác nhận mật khẩu mới không khớp.', 'error');
      return;
    }

    try {
      await updateUserProfile({ password: newPassword });
      showToast('Đã cập nhật mật khẩu mới thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật mật khẩu.', 'error');
    }
  };

  // Specialty tags helper
  const handleAddSpecialty = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newSpecialty.trim();
    if (trimmed && !specialties.includes(trimmed)) {
      setSpecialties(prev => [...prev, trimmed]);
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (tag: string) => {
    setSpecialties(prev => prev.filter(t => t !== tag));
  };

  const roleLabels: Record<string, { title: string; color: string; badgeBg: string }> = {
    ADMIN: { title: 'Quản trị viên Hệ thống', color: 'text-purple-700', badgeBg: 'bg-purple-100 border-purple-200' },
    MANAGER: { title: 'Quản lý Cơ sở / Vận hành', color: 'text-indigo-700', badgeBg: 'bg-indigo-100 border-indigo-200' },
    ACCOUNTANT: { title: 'Kế toán / Thu ngân', color: 'text-cyan-700', badgeBg: 'bg-cyan-100 border-cyan-200' },
    TEACHER: { title: 'Giáo viên Âm nhạc', color: 'text-blue-700', badgeBg: 'bg-blue-100 border-blue-200' },
    STUDENT: { title: 'Học viên Trung tâm', color: 'text-emerald-700', badgeBg: 'bg-emerald-100 border-emerald-200' },
    PARENT: { title: 'Phụ huynh Học viên', color: 'text-amber-700', badgeBg: 'bg-amber-100 border-amber-200' },
    GUARDIAN: { title: 'Người giám hộ', color: 'text-orange-700', badgeBg: 'bg-orange-100 border-orange-200' }
  };

  const roleMeta = roleLabels[role?.toUpperCase?.() || 'STUDENT'] || roleLabels.STUDENT;

  // Filter preset avatars by category
  const categories = ['Tất cả', 'Học viên', 'Giáo viên & Admin', 'Phụ huynh', 'Nghệ sĩ'];
  const filteredPresets = selectedCategory === 'Tất cả' 
    ? PRESET_AVATARS 
    : PRESET_AVATARS.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6 pb-8">
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border transition-all animate-in fade-in slide-in-from-bottom-5 ${
          toastMessage.type === 'success' 
            ? 'bg-slate-900 text-white border-emerald-500/40' 
            : 'bg-rose-900 text-white border-rose-500/40'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <div 
        className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-white/10"
        style={{
          background: `linear-gradient(135deg, ${branding.headerGradientFrom || '#d97706'}, ${branding.headerGradientTo || '#4338ca'})`
        }}
      >
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            
            {/* Avatar with quick edit trigger */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-white/30 shadow-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900/80 text-white flex items-center justify-center font-black text-4xl font-heading">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('avatar')}
                className="absolute -bottom-2 -right-2 p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-lg ring-4 ring-white/40 transition-transform active:scale-90 flex items-center justify-center cursor-pointer"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Meta Info */}
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-black tracking-wide uppercase backdrop-blur-md">
                  {roleMeta.title}
                </span>
                {currentUser?.profileCode && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-xs">
                    Mã: {currentUser.profileCode}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Đang hoạt động
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black mt-2 font-heading tracking-tight">
                {displayName || currentUser?.email}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-white/80 font-medium">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 opacity-80" />
                  <span>{email || 'Chưa có email'}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 opacity-80" />
                    <span>{phone}</span>
                  </div>
                )}
                {activeBranch && (
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 opacity-80" />
                    <span>{activeBranch.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab('avatar')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20"
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>Đổi ảnh đại diện</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-white/20"
            >
              <Lock className="w-4 h-4 text-rose-300" />
              <span>Bảo mật</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl text-xs font-bold transition-all shadow-md"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'info' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <User className="w-4 h-4 text-amber-500" />
          <span>Thông tin cá nhân</span>
        </button>

        <button
          onClick={() => setActiveTab('avatar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'avatar' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Camera className="w-4 h-4 text-purple-500" />
          <span>Ảnh đại diện & Avatar</span>
        </button>

        <button
          onClick={() => setActiveTab('related')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'related' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span>Dữ liệu & Khóa học liên quan</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Shield className="w-4 h-4 text-rose-500" />
          <span>Bảo mật & Mật khẩu</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audio' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Volume2 className="w-4 h-4 text-indigo-500" />
          <span>Âm thanh & Nhạc nền Studio</span>
        </button>

        <button
          id="btn-profile-tab-theme"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'theme' 
              ? 'bg-slate-900 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-4 h-4 text-pink-500" />
          <span>Giao diện & Bảng màu sắc</span>
        </button>
      </div>

      {/* TAB 1: THÔNG TIN CÁ NHÂN */}
      {activeTab === 'info' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                Cập nhật thông tin cá nhân
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉnh sửa thông tin hồ sơ của bạn được lưu trong hệ thống Minh Music Center.
              </p>
            </div>
            <span className="text-[11px] px-3 py-1 bg-amber-50 text-amber-800 rounded-full font-bold border border-amber-200">
              {roleMeta.title}
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Họ và tên hiển thị <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    placeholder="Ví dụ: Nguyễn Văn Minh"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email liên hệ / Đăng nhập <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    placeholder="name@minhmusic.vn"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    placeholder="Ví dụ: 0908 151 088"
                  />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Giới tính
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Nam', 'Nữ', 'Khác'] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        gender === g
                          ? 'bg-amber-50 text-amber-900 border-amber-400 ring-2 ring-amber-400/20 font-black'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Địa chỉ thường trú / Liên hệ
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    placeholder="Số nhà, tên đường, quận/huyện, TP..."
                  />
                </div>
              </div>

            </div>

            {/* Specialties (if Teacher) */}
            {role === 'TEACHER' && (
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Chuyên môn giảng dạy (Specialties)
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {specialties.map((spec) => (
                    <span 
                      key={spec}
                      className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Music className="w-3.5 h-3.5 text-blue-600" />
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(spec)}
                        className="w-4 h-4 rounded-full bg-blue-200 hover:bg-rose-200 hover:text-rose-800 flex items-center justify-center text-[10px] ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    onKeyDown={handleAddSpecialty}
                    placeholder="Thêm bộ môn (vd: Violin, Trống, Ukulele...)"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecialty}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    + Thêm môn
                  </button>
                </div>
              </div>
            )}

            {/* Bio / Description */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tiểu sử / Giới thiệu bản thân & Ghi chú
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                placeholder="Chia sẻ vài dòng về sở thích âm nhạc, châm ngôn học tập hoặc kinh nghiệm giảng dạy..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Lưu thông tin hồ sơ</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CẬP NHẬT ẢNH ĐẠI DIỆN */}
      {activeTab === 'avatar' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-600" />
                Cập nhật ảnh đại diện (Profile Picture)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chọn ảnh đại diện từ bộ sưu tập âm nhạc của Minh Music, tải ảnh từ máy tính hoặc dán link ảnh.
              </p>
            </div>
          </div>

          {/* Current Avatar Showcase & Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl bg-white flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center font-black text-3xl font-heading">
                    {displayName ? displayName.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
              </div>
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-xs">
                Hiện tại
              </span>
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {displayName || 'Chưa đặt tên'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ảnh đại diện này sẽ xuất hiện trên thanh điều hướng, thẻ thành viên và các bản tin bài học.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh từ máy tính</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarUrl('');
                      showToast('Đã gỡ ảnh đại diện. Bấm "Lưu thay đổi" để áp dụng.');
                    }}
                    className="px-3 py-2 bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all"
                  >
                    Gỡ ảnh đại diện
                  </button>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

          {/* Sub-modes for Avatar */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setAvatarInputMode('presets')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  avatarInputMode === 'presets'
                    ? 'bg-purple-50 text-purple-900 border border-purple-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                ✨ Bộ sưu tập Avatar Minh Music
              </button>
              <button
                onClick={() => setAvatarInputMode('url')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  avatarInputMode === 'url'
                    ? 'bg-purple-50 text-purple-900 border border-purple-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🔗 Nhập URL hình ảnh
              </button>
            </div>

            {/* PRESET AVATARS SELECTOR */}
            {avatarInputMode === 'presets' && (
              <div className="space-y-4">
                {/* Category filters */}
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Grid of avatars */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredPresets.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setAvatarUrl(preset.url);
                        showToast(`Đã chọn avatar "${preset.label}". Bấm "Lưu" để hoàn tất.`);
                      }}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer text-center group ${
                        avatarUrl === preset.url
                          ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-600/30'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-2 relative ring-2 ring-slate-100">
                        <img 
                          src={preset.url} 
                          alt={preset.label} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          referrerPolicy="no-referrer" 
                        />
                        {avatarUrl === preset.url && (
                          <div className="absolute inset-0 bg-purple-600/40 backdrop-blur-xs flex items-center justify-center text-white">
                            <Check className="w-6 h-6 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-800 truncate">{preset.label}</p>
                      <span className="text-[9px] text-slate-400">{preset.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URL INPUT MODE */}
            {avatarInputMode === 'url' && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-lg">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Dán đường dẫn ảnh đại diện (Image URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customUrlInput) return;
                      setAvatarUrl(customUrlInput);
                      showToast('Đã cập nhật URL ảnh đại diện!');
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}

            {/* Save Button for Avatar */}
            <div className="pt-5 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Lưu ảnh đại diện</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: DỮ LIỆU & KHÓA HỌC LIÊN QUAN */}
      {activeTab === 'related' && (
        <div className="space-y-6">
          
          {/* Card: Member Digital ID Mockup */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  Thẻ Điện Tử Thành Viên (Digital Membership ID)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thẻ điện tử chính thức tại Minh Music Center, dùng điểm danh và nhận diện thành viên.
                </p>
              </div>
            </div>

            {/* Card Graphic */}
            <div className="max-w-md mx-auto bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-slate-700">
              <div 
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-2xl pointer-events-none opacity-40"
                style={{ backgroundColor: branding.primaryColor || '#d97706' }}
              ></div>

              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                    style={{ background: `linear-gradient(135deg, ${branding.primaryColor || '#d97706'}, ${branding.secondaryColor || '#e11d48'})` }}
                  >
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black tracking-widest uppercase font-heading">{branding.centerName || 'MINH MUSIC'}</h3>
                    <p className="text-[9px] text-slate-400 font-medium">{branding.subName || 'CENTER'}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-amber-400 text-[10px] font-black border border-white/10">
                  {role}
                </span>
              </div>

              <div className="relative z-10 flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-amber-400/40 bg-slate-800 flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-white">
                      {displayName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-base font-black text-white font-heading">{displayName || 'Thành viên'}</h4>
                  <p className="text-xs text-amber-300 font-mono mt-0.5">
                    MÃ: {currentUser?.profileCode || currentUser?.uid.substring(0, 10)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Cơ sở: {activeBranch?.name || 'Trụ sở chính'}
                  </p>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Ngày tham gia: {currentUser?.createdAt || '2024-01-01'}</span>
                <span className="font-mono text-slate-300">VALIDATED MEMBER</span>
              </div>
            </div>
          </div>

          {/* Role specific details block */}
          {role === 'STUDENT' && linkedStudent && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-base font-black text-slate-900 font-heading flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
                Tiến độ học tập & Khóa học của bạn
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <BookOpen className="w-4 h-4" />
                    <span>MÔN HỌC ĐĂNG KÝ</span>
                  </div>
                  <p className="text-sm font-black text-emerald-950 mt-2">
                    {(linkedStudent.enrolledSubjects || []).join(', ') || 'Chưa đăng ký'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>ĐIỂM SAO TÍCH LŨY</span>
                  </div>
                  <p className="text-2xl font-black text-amber-950 mt-1">
                    {linkedStudent.totalStars || linkedStudent.stars || 0} ⭐
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>SỐ BUỔI HỌC</span>
                  </div>
                  <p className="text-sm font-black text-blue-950 mt-2">
                    {linkedStudent.completedLessons || 0} / {linkedStudent.totalLessons || 24} buổi hoàn thành
                  </p>
                </div>
              </div>

              {/* Linked classes list */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Danh sách lớp học đang theo học:
                </h4>
                {myClasses.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                    Chưa được gán vào lớp học nào. Vui lòng liên hệ Giáo vụ để xếp lớp.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {myClasses.map((cls) => (
                      <div key={cls.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md">
                            {cls.code}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900 mt-1">{cls.name}</h5>
                          <p className="text-xs text-slate-500 mt-0.5">Giáo viên: {cls.teacherName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{cls.scheduleText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {role === 'TEACHER' && linkedTeacher && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-base font-black text-slate-900 font-heading flex items-center gap-2">
                <Music className="w-5 h-5 text-blue-600" />
                Hồ sơ giảng dạy của Thầy / Cô
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-xs font-bold text-blue-800">LỚP ĐANG DẠY</span>
                  <p className="text-2xl font-black text-blue-950 mt-1">{myClasses.length} Lớp</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800">CHUYÊN MÔN CHÍNH</span>
                  <p className="text-sm font-black text-emerald-950 mt-2">
                    {(linkedTeacher.specialties || []).join(' • ') || 'Piano'}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-xs font-bold text-purple-800">NGÀY GIA NHẬP</span>
                  <p className="text-sm font-black text-purple-950 mt-2">{linkedTeacher.joinDate || '2024-01-01'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Guardians / Parents info */}
          {(role === 'PARENT' || role === 'GUARDIAN') && linkedGuardian && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-base font-black text-slate-900 font-heading flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Thông tin Phụ huynh & Học viên con em liên kết
              </h3>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-800 font-semibold">
                  Mối quan hệ với học viên: <strong>{linkedGuardian.relation}</strong>
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  Địa chỉ liên hệ: {linkedGuardian.address || 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: BẢO MẬT & MẬT KHẨU */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 max-w-2xl">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-600" />
              Bảo mật tài khoản & Đổi mật khẩu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật mật khẩu định kỳ để bảo vệ dữ liệu và thông tin học tập của bạn.
            </p>
          </div>

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mật khẩu mới
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Xác nhận mật khẩu mới
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
              >
                Cập nhật mật khẩu mới
              </button>
            </div>
          </form>

          {/* Account status & logs */}
          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Thông tin phiên đăng nhập
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span>UID Tài khoản:</span>
                <span className="font-mono font-semibold text-slate-900">{currentUser?.uid}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span>Ngày tạo tài khoản:</span>
                <span className="font-semibold text-slate-900">{currentUser?.createdAt || '2024-01-01'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Lần đăng nhập gần nhất:</span>
                <span className="font-semibold text-emerald-600">{currentUser?.lastLoginAt || 'Vừa xong'}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: ÂM THANH & NHẠC NỀN STUDIO */}
      {activeTab === 'audio' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-indigo-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`p-3 rounded-2xl shadow-sm ${isMusicPlaying ? 'bg-amber-500 text-white animate-pulse' : 'bg-white text-slate-700 border border-slate-200'}`}>
                <Disc3 className={`w-6 h-6 ${isMusicPlaying ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Minh Music Audio & Sound Studio
                </h3>
                <p className="text-xs text-slate-500">
                  Tùy chỉnh nhạc nền thư giãn khi học tập và hiệu ứng âm thanh tương tác
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={toggleMusic}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer ${
                  isMusicPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isMusicPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Tạm dừng nhạc</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Bật nhạc nền</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 1: Background Music Player */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  1. Nhạc nền Acoustic & Piano thư giãn
                </h4>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                isMusicPlaying ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {isMusicPlaying ? 'Đang phát' : 'Đang dừng'}
              </span>
            </div>

            {/* Currently Selected Track Info */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 uppercase">
                    {currentTrack.genre}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {currentTrack.tempoBpm} BPM
                  </span>
                </div>
                <h5 className="text-sm font-bold text-slate-900">
                  {currentTrack.title}
                </h5>
                <p className="text-xs text-slate-500">
                  {currentTrack.artist} • {currentTrack.description}
                </p>
              </div>

              {/* Player Controls */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={prevTrack}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="Bài trước"
                >
                  <span className="text-xs font-bold">⏮</span>
                </button>

                <button
                  onClick={toggleMusic}
                  className={`p-2.5 rounded-xl text-white shadow-sm transition-all cursor-pointer ${
                    isMusicPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                  title={isMusicPlaying ? 'Tạm dừng' : 'Phát'}
                >
                  {isMusicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  onClick={nextTrack}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="Bài tiếp theo"
                >
                  <span className="text-xs font-bold">⏭</span>
                </button>
              </div>
            </div>

            {/* Music Volume */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                  Âm lượng nhạc nền
                </span>
                <span className="font-mono font-bold text-slate-900">{Math.round(musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Playlist Track Selection & Custom Upload */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Danh sách giai điệu ({(allTracks || []).length} bài)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Chọn nhạc nền có sẵn hoặc tự tải lên tệp MP3 / liên kết âm thanh của bạn
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
                    <button
                      type="button"
                      onClick={() => setTrackTabFilter('all')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        trackTabFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      Tất cả ({(allTracks || []).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrackTabFilter('preset')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        trackTabFilter === 'preset' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      Gốc ({AMBIENT_TRACKS.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrackTabFilter('custom')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        trackTabFilter === 'custom' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      Tự tải ({(customTracks || []).length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddingTrack(!isAddingTrack)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingTrack ? 'Đóng' : 'Thêm nhạc mới'}</span>
                  </button>
                </div>
              </div>

              {/* Add Custom Track Box */}
              {isAddingTrack && (
                <form
                  onSubmit={handleSaveCustomTrack}
                  className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3.5 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <Music2 className="w-4 h-4 text-amber-600" />
                      <span>Cài đặt bản nhạc nền tùy chỉnh mới</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-amber-200 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setTrackSourceType('file')}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          trackSourceType === 'file' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Tải tệp MP3
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrackSourceType('url')}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          trackSourceType === 'url' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Link URL
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Tên bài nhạc *</label>
                      <input
                        type="text"
                        required
                        value={newTrackTitle}
                        onChange={(e) => setNewTrackTitle(e.target.value)}
                        placeholder="VD: Canon in D, Fur Elise..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Nghệ sĩ / Tác giả</label>
                      <input
                        type="text"
                        value={newTrackArtist}
                        onChange={(e) => setNewTrackArtist(e.target.value)}
                        placeholder="VD: Yiruma, Chopin..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Thể loại âm nhạc</label>
                      <input
                        type="text"
                        value={newTrackGenre}
                        onChange={(e) => setNewTrackGenre(e.target.value)}
                        placeholder="VD: Piano Solo, Lo-Fi, Jazz..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {trackSourceType === 'file' ? (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Chọn tệp MP3 / WAV từ máy tính hoặc điện thoại</span>
                        {newTrackFileName && <span className="text-emerald-700 font-mono text-[10px]">Đã nạp: {newTrackFileName}</span>}
                      </label>
                      <input
                        ref={audioFileInputRef}
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.ogg"
                        onChange={handleAudioFileUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => audioFileInputRef.current?.click()}
                        className="p-3 border-2 border-dashed border-amber-300 bg-white/70 hover:bg-white rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold text-slate-700">
                          {newTrackFileName ? `Tệp đã chọn: ${newTrackFileName} (Bấm để đổi)` : 'Nhấp để duyệt tệp nhạc MP3 (Tối đa 15MB)'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Đường link URL tệp nhạc (MP3 Direct Link / Stream)</label>
                      <div className="relative">
                        <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="url"
                          required
                          value={newTrackUrl}
                          onChange={(e) => setNewTrackUrl(e.target.value)}
                          placeholder="https://example.com/audio/my-relaxing-music.mp3"
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingTrack(false)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Lưu và phát ngay
                    </button>
                  </div>
                </form>
              )}

              {/* Grid of Tracks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {(allTracks || [])
                  .filter((track) => {
                    if (trackTabFilter === 'preset') return !track.isCustom;
                    if (trackTabFilter === 'custom') return track.isCustom;
                    return true;
                  })
                  .map((track) => {
                    const isSelected = currentTrackId === track.id;
                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          setCurrentTrackId(track.id);
                          if (!isMusicPlaying) toggleMusic();
                        }}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer group ${
                          isSelected
                            ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-900' : 'text-slate-800'}`}>
                              {track.title}
                            </p>
                            {track.isCustom && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 shrink-0">
                                MP3
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">
                            {track.artist} • {track.genre}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white">
                              {isMusicPlaying ? 'Đang phát' : 'Đã chọn'}
                            </span>
                          )}

                          {track.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Bạn có chắc chắn muốn xóa bài nhạc "${track.title}" khỏi danh sách?`)) {
                                  removeCustomTrack(track.id);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa bản nhạc này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {trackTabFilter === 'custom' && (customTracks || []).length === 0 && (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                  <FileAudio className="w-8 h-8 mx-auto text-slate-300 mb-1.5" />
                  <p className="text-xs font-medium">Bạn chưa tải lên bài nhạc cá nhân nào</p>
                  <button
                    type="button"
                    onClick={() => setIsAddingTrack(true)}
                    className="mt-2 text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                  >
                    + Nhấp vào đây để tải lên tệp MP3 đầu tiên
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Interactive Sound Effects (SFX) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  2. Hiệu ứng âm thanh click & Thao tác (SFX)
                </h4>
              </div>

              {/* Toggle SFX */}
              <button
                onClick={toggleSound}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  isSoundEnabled
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{isSoundEnabled ? 'Đang BẬT' : 'Đang TẮT'}</span>
              </button>
            </div>

            {/* Sound Theme Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Bộ âm sắc (Sound Theme)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(
                  [
                    { id: 'piano', name: '🎹 Phím đàn Piano', desc: 'Nốt nhạc piano acoustic dịu êm' },
                    { id: 'acoustic', name: '🎸 Dây đàn Guitar', desc: 'Âm gảy guitar mộc ấm áp' },
                    { id: 'modern', name: '✨ Hiện đại tinh tế', desc: 'Âm thanh UI phòng thu trong trẻo' },
                    { id: 'retro', name: '🕹️ Retro 8-Bit', desc: 'Âm sắc gamification vui nhộn' },
                    { id: 'chime', name: '🎐 Chuông gió Chime', desc: 'Tiếng chuông ngân thanh thoát' }
                  ] as const
                ).map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setSoundTheme(theme.id as SoundTheme);
                      playClickSound();
                    }}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      soundTheme === theme.id
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <p className={`text-xs font-bold ${soundTheme === theme.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {theme.name}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {theme.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* SFX Volume */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Âm lượng hiệu ứng click chuột</span>
                <span className="font-mono font-bold text-slate-900">{Math.round(soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                disabled={!isSoundEnabled}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
              />
            </div>

            {/* Test Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => playClickSound()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <MousePointerClick className="w-3.5 h-3.5 text-indigo-500" />
                <span>Thử âm thanh Click</span>
              </button>

              <button
                type="button"
                onClick={() => playSuccessSound()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thử âm thanh Thành công / Fanfare</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CÀI ĐẶT CHỦ ĐỀ & TÙY CHỈNH MÀU SẮC GIAO DIỆN */}
      {activeTab === 'theme' && (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-700 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                Cài Đặt Chủ Đề & Tùy Chỉnh Màu Sắc Giao Diện
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Lựa chọn bộ màu nhận diện hoặc tự do chọn mã màu HEX riêng cho giao diện của bạn.
              </p>
            </div>
            <span className="text-[11px] px-3 py-1 bg-pink-50 dark:bg-pink-950/40 text-pink-800 dark:text-pink-300 rounded-full font-bold border border-pink-200 dark:border-pink-800">
              App Theme & Branding
            </span>
          </div>

          <ThemeSettingsSection showPreview={true} />
        </div>
      )}

    </div>
  );
};
