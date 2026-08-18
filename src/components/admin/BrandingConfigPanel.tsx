import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { TenantBranding, TenantBranch } from '../../types';
import { BRANDING_PRESETS, BrandingPreset } from '../../data/initialData';
import { BrandLogo } from '../common/BrandLogo';
import {
  Palette,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Building,
  Sparkles,
  Music,
  GraduationCap,
  Award,
  Headphones,
  Mic,
  Radio,
  Copy,
  Layers,
  Phone,
  Mail,
  MapPin,
  Globe,
  Sliders,
  Eye,
  Check,
  Plus,
  ShieldCheck,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

export const BrandingConfigPanel: React.FC = () => {
  const { 
    branding, 
    updateBranding, 
    resetBranding, 
    branches, 
    activeBranchId, 
    setActiveBranchId,
    addBranch
  } = useData();
  const { theme, isDark, setTheme, setCustomHexColor } = useTheme();

  // Local draft state for live editing before saving
  const [formData, setFormData] = useState<TenantBranding>({ ...branding });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTabSection, setActiveTabSection] = useState<'system_theme' | 'presets' | 'logo_identity' | 'tax_business_profile' | 'colors' | 'multitenant_branches'>('system_theme');
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchEmail, setNewBranchEmail] = useState('');
  const [newBranchGoogleMapsUrl, setNewBranchGoogleMapsUrl] = useState('https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApplyPreset = (preset: BrandingPreset) => {
    setFormData(prev => ({
      ...prev,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      headerGradientFrom: preset.headerGradientFrom,
      headerGradientTo: preset.headerGradientTo,
      brandTagBg: preset.brandTagBg,
      brandTagText: preset.brandTagText,
      logoIcon: preset.logoIcon,
      logoType: 'icon'
    }));
    setCustomHexColor(preset.primaryColor);
    showToast(`Đã chọn bảng màu: ${preset.name}`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Dung lượng hình ảnh logo không vượt quá 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({
          ...prev,
          logoType: 'image',
          logoUrl: reader.result as string
        }));
        showToast('Đã tải lên logo thương hiệu mới!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateBranding(formData);
    setCustomHexColor(formData.primaryColor);
    showToast('Đã lưu cấu hình nhận diện thương hiệu & đồng bộ toàn hệ thống!');
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục nhận diện thương hiệu về mặc định của Minh Music?')) {
      resetBranding();
      showToast('Đã khôi phục cài đặt thương hiệu mặc định!');
    }
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(formData, null, 2));
    showToast('Đã sao chép cấu hình thương hiệu JSON vào bộ nhớ đệm!');
  };

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchCode.trim()) {
      alert('Vui lòng nhập tên và mã cơ sở');
      return;
    }

    addBranch({
      code: newBranchCode.toUpperCase(),
      name: newBranchName,
      address: newBranchAddress || 'Chưa cập nhật địa chỉ',
      phone: newBranchPhone || '0901.888.999',
      email: newBranchEmail || 'branch@minhmusic.vn',
      googleMapsUrl: newBranchGoogleMapsUrl || 'https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac',
      isMainBranch: false
    });

    setIsAddBranchModalOpen(false);
    setNewBranchName('');
    setNewBranchCode('');
    setNewBranchAddress('');
    setNewBranchPhone('');
    setNewBranchEmail('');
    setNewBranchGoogleMapsUrl('https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac');
    showToast('Đã thêm cơ sở chi nhánh mới vào mạng lưới đa cơ sở!');
  };

  const renderLogoIcon = (iconName: TenantBranding['logoIcon'], className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Music': return <Music className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Headphones': return <Headphones className={className} />;
      case 'Mic': return <Mic className={className} />;
      case 'Radio': return <Radio className={className} />;
      case 'Building': return <Building className={className} />;
      default: return <Music className={className} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/30 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-3.5 rounded-2xl text-white shadow-md flex items-center justify-center transition-all duration-300"
            style={{ 
              background: `linear-gradient(135deg, ${formData.headerGradientFrom}, ${formData.headerGradientTo})` 
            }}
          >
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                Cấu Hình Thương Hiệu & Giao Diện Đa Cơ Sở
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                Multi-Tenant Brand Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tùy biến Logo, Hệ màu sắc chủ đạo, Tiêu đề trung tâm và đồng bộ nhận diện thương hiệu trên mọi vai trò (Admin, Giáo viên, Học viên, Phụ huynh).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-copy-branding-json"
            onClick={handleCopyJSON}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Sao chép cấu hình JSON"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sao chép JSON</span>
          </button>

          <button
            id="btn-reset-branding"
            onClick={handleReset}
            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200"
            title="Khôi phục mặc định"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <button
            id="btn-save-branding"
            onClick={handleSave}
            className="px-5 py-2.5 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md hover:brightness-110 active:scale-95 transition-all"
            style={{ backgroundColor: formData.primaryColor }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>LƯU CẤU HÌNH THƯƠNG HIỆU</span>
          </button>
        </div>
      </div>

      {/* LIVE PREVIEW SECTION (Realtime Mirror) */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Bản Xem Trước Trực Quan Thời Gian Thực (Live Realtime Mirror)
            </span>
          </div>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
            Hiển thị tức thì khi điều chỉnh
          </span>
        </div>

        {/* Mockup Navbar Preview */}
        <div className="bg-white text-slate-900 rounded-2xl p-4 border border-slate-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
            {/* Logo + Name */}
            <div className="flex items-center gap-3">
              <BrandLogo
                size="md"
                collapsed={true}
                customLogoUrl={formData.logoType === 'image' ? formData.logoUrl : undefined}
                customLogoIcon={formData.logoIcon}
                customGradientFrom={formData.headerGradientFrom}
                customGradientTo={formData.headerGradientTo}
              />

              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-lg font-black tracking-tight font-heading"
                    style={{ color: formData.primaryColor }}
                  >
                    {formData.centerName || 'MINH MUSIC'}
                  </span>
                  <span 
                    className="text-[11px] px-2 py-0.5 rounded-full font-extrabold uppercase border"
                    style={{ 
                      backgroundColor: formData.brandTagBg, 
                      color: formData.brandTagText,
                      borderColor: formData.primaryColor + '40'
                    }}
                  >
                    {formData.subName || 'CENTER'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {formData.slogan || 'Hệ thống Quản lý Trung tâm Âm nhạc Toàn diện'}
                </p>
              </div>
            </div>

            {/* Mockup Active Badge & Button */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-700 border border-slate-200">
                🏢 {branches.find(b => b.id === activeBranchId)?.name || 'Trụ sở chính'}
              </span>
              <button 
                className="px-3 py-1.5 text-white rounded-lg text-xs font-bold shadow-xs"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Trải nghiệm giao diện
              </button>
            </div>
          </div>

          {/* Mini Mock Dashboard Elements */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-slate-500 font-medium">Màu chủ đạo (Primary)</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-4 h-4 rounded-md" style={{ backgroundColor: formData.primaryColor }}></div>
                <strong className="font-mono text-slate-900">{formData.primaryColor}</strong>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-slate-500 font-medium">Màu phụ (Secondary)</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-4 h-4 rounded-md" style={{ backgroundColor: formData.secondaryColor }}></div>
                <strong className="font-mono text-slate-900">{formData.secondaryColor}</strong>
              </div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-slate-500 font-medium">Màu điểm nhấn (Accent)</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-4 h-4 rounded-md" style={{ backgroundColor: formData.accentColor }}></div>
                <strong className="font-mono text-slate-900">{formData.accentColor}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION FOR BRANDING ENGINE */}
      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl w-fit flex-wrap">
        <button
          onClick={() => setActiveTabSection('system_theme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTabSection === 'system_theme' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Giao Diện & Màu Sắc</span>
        </button>

        <button
          onClick={() => setActiveTabSection('presets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTabSection === 'presets' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Bảng màu mẫu (Presets)</span>
        </button>

        <button
          onClick={() => setActiveTabSection('logo_identity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTabSection === 'logo_identity' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-indigo-600" />
          <span>Logo & Định Danh</span>
        </button>

        <button
          onClick={() => setActiveTabSection('tax_business_profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTabSection === 'tax_business_profile' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pháp Nhân & Kê Khai Thuế</span>
        </button>

        <button
          onClick={() => setActiveTabSection('colors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTabSection === 'colors' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-600" />
          <span>Bảng Màu Chi Tiết</span>
        </button>

        <button
          onClick={() => setActiveTabSection('multitenant_branches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTabSection === 'multitenant_branches' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Mạng Lưới Đa Cơ Sở ({branches.length})</span>
        </button>
      </div>

      {/* SECTION: SYSTEM THEME & COLOR MODE */}
      {activeTabSection === 'system_theme' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
              Cài Đặt Chế Độ Giao Diện & Màu Sắc Hệ Thống
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Quản trị viên thiết lập chế độ hiển thị mặc định (Sáng / Tối / Tự động) và màu sắc nhận diện chính cho toàn bộ người dùng hệ thống.
            </p>
          </div>

          {/* 1. Theme Mode Switcher */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Chế Độ Hiển Thị Giao Diện (Theme Mode):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
              <button
                type="button"
                id="btn-theme-mode-light"
                onClick={() => {
                  setTheme('light');
                  showToast('Đã chuyển sang chế độ Sáng (Light Mode)');
                }}
                className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold">Giao diện Sáng</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Nền sáng dịu mắt, độ tương phản cao</p>
                </div>
              </button>

              <button
                type="button"
                id="btn-theme-mode-dark"
                onClick={() => {
                  setTheme('dark');
                  showToast('Đã chuyển sang chế độ Tối (Dark Mode)');
                }}
                className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold">Giao diện Tối</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Chế độ ban đêm sang trọng & dịu mắt</p>
                </div>
              </button>

              <button
                type="button"
                id="btn-theme-mode-system"
                onClick={() => {
                  setTheme('system');
                  showToast('Đã chuyển sang chế độ Tự động theo thiết bị');
                }}
                className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Monitor className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold">Tự Động</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Theo cài đặt hệ điều hành người dùng</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Quick Swatches for Primary Theme Color */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Chọn Nhanh Màu Nhận Diện Chủ Đạo:
            </label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {[
                { hex: '#059669', name: 'Xanh Ngọc (Emerald)' },
                { hex: '#d97706', name: 'Cam Năng Động (Amber)' },
                { hex: '#2563eb', name: 'Xanh Dương (Ocean Blue)' },
                { hex: '#7c3aed', name: 'Tím Hoàng Gia (Purple)' },
                { hex: '#e11d48', name: 'Đỏ Ruby (Rose)' },
                { hex: '#0891b2', name: 'Xanh Cyan (Cyan)' },
                { hex: '#4f46e5', name: 'Chàm Indigo (Indigo)' },
                { hex: '#ea580c', name: 'Cam Đậm (Orange)' },
                { hex: '#0d9488', name: 'Xanh Mòng Két (Teal)' }
              ].map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, primaryColor: c.hex }));
                    setCustomHexColor(c.hex);
                    showToast(`Đã chọn màu: ${c.name}`);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.primaryColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: c.hex }} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: PRESET THEMES */}
      {activeTabSection === 'presets' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Gợi Ý Bộ Màu Nhận Diện Chuẩn Nhạc Viện
            </h3>
            <p className="text-xs text-slate-500">
              Chọn 1 trong các bộ phối màu được thiết kế hài hòa, độ tương phản chuẩn WCAG AA cho ứng dụng giáo dục âm nhạc.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BRANDING_PRESETS.map((preset) => {
              const isSelected = 
                formData.primaryColor.toLowerCase() === preset.primaryColor.toLowerCase() &&
                formData.headerGradientFrom.toLowerCase() === preset.headerGradientFrom.toLowerCase();

              return (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md relative space-y-3 ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{
                          background: `linear-gradient(135deg, ${preset.headerGradientFrom}, ${preset.headerGradientTo})`
                        }}
                      >
                        {renderLogoIcon(preset.logoIcon, 'w-4 h-4')}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 font-heading">
                          {preset.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {preset.description}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="p-1 bg-amber-500 text-white rounded-full">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Swatches */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                      <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: preset.primaryColor }}></span>
                      <span>{preset.primaryColor}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                      <span className="w-3.5 h-3.5 rounded-full shadow-xs" style={{ backgroundColor: preset.secondaryColor }}></span>
                      <span>{preset.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: LOGO & IDENTITY */}
      {activeTabSection === 'logo_identity' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Tùy Chỉnh Biểu Trưng (Logo) & Định Danh
            </h3>
            <p className="text-xs text-slate-500">
              Chọn sử dụng Logo biểu tượng vector nghệ thuật hoặc tải lên tệp hình ảnh thương hiệu riêng của trung tâm.
            </p>
          </div>

          {/* Logo Type Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">Loại Logo Hiển Thị:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, logoType: 'icon' }))}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-3 transition-all ${
                  formData.logoType === 'icon' 
                    ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-600/20' 
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <Music className="w-5 h-5 text-amber-600" />
                <div className="text-left">
                  <p className="font-bold">Biểu Tượng Vector</p>
                  <p className="text-[10px] text-slate-500">Sử dụng icon âm nhạc sắc nét trên mọi kích thước</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, logoType: 'image' }))}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-3 transition-all ${
                  formData.logoType === 'image' 
                    ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-600/20' 
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <div className="text-left">
                  <p className="font-bold">Hình Ảnh Riêng (Custom)</p>
                  <p className="text-[10px] text-slate-500">Tải lên tệp ảnh logo PNG / SVG / JPG</p>
                </div>
              </button>
            </div>
          </div>

          {/* Vector Icon Options */}
          {formData.logoType === 'icon' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Chọn Biểu Tượng Âm Nhạc:</label>
              <div className="flex flex-wrap gap-2">
                {([
                  { id: 'Music', label: 'Nốt nhạc (Music)' },
                  { id: 'Sparkles', label: 'Tỏa sáng (Sparkles)' },
                  { id: 'GraduationCap', label: 'Học viện (Academy)' },
                  { id: 'Award', label: 'Huy chương (Award)' },
                  { id: 'Headphones', label: 'Tai nghe (Headphones)' },
                  { id: 'Mic', label: 'Micro biểu diễn (Mic)' },
                  { id: 'Radio', label: 'Đài phát thanh (Radio)' },
                  { id: 'Building', label: 'Nhạc viện (Conservatory)' }
                ] as const).map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoIcon: item.id }))}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      formData.logoIcon === item.id 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {renderLogoIcon(item.id, 'w-4 h-4')}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload Option */}
          {formData.logoType === 'image' && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-700">Tải Lên Tệp Ảnh Logo:</label>
              
              <div className="flex items-center gap-4 flex-wrap">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Chọn tệp ảnh từ máy tính...</span>
                </button>

                {formData.logoUrl && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                    <img 
                      src={formData.logoUrl} 
                      alt="Uploaded Logo" 
                      className="w-8 h-8 rounded-md object-contain border border-slate-100" 
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs text-slate-600 font-medium">Logo đã chọn thành công</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                      className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500">
                <span>Hoặc nhập đường dẫn URL hình ảnh trực tiếp:</span>
                <input
                  type="url"
                  value={formData.logoUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Center Identity Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên Trung Tâm Chính (*):</label>
              <input
                type="text"
                value={formData.centerName}
                onChange={(e) => setFormData(prev => ({ ...prev, centerName: e.target.value }))}
                placeholder="MINH MUSIC"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nhãn Phụ / Tag Phân Loại (*):</label>
              <input
                type="text"
                value={formData.subName}
                onChange={(e) => setFormData(prev => ({ ...prev, subName: e.target.value }))}
                placeholder="CENTER, ACADEMY, STUDIO..."
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mã Định Danh Tenant (*):</label>
              <input
                type="text"
                value={formData.tenantCode}
                onChange={(e) => setFormData(prev => ({ ...prev, tenantCode: e.target.value }))}
                placeholder="MINH-MUSIC-HQ"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-700"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Khẩu Hiệu / Slogan (*):</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData(prev => ({ ...prev, slogan: e.target.value }))}
                placeholder="Hệ thống Quản lý Trung tâm Âm nhạc Toàn diện"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>
          </div>

          {/* Multi-Size Unified Logo Preview Frame */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Kiểm Tra Hiển Thị Logo Đồng Nhất Trên Toàn Hệ Thống:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Header Preview */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">1. Thanh Header (Kích thước Vừa)</span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <BrandLogo 
                    size="md"
                    collapsed={true}
                    customLogoUrl={formData.logoType === 'image' ? formData.logoUrl : undefined}
                    customLogoIcon={formData.logoIcon}
                    customGradientFrom={formData.headerGradientFrom}
                    customGradientTo={formData.headerGradientTo}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate" style={{ color: formData.primaryColor }}>
                      {formData.centerName || 'MINH MUSIC'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{formData.subName || 'CENTER'}</p>
                  </div>
                </div>
              </div>

              {/* Sidebar Preview */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">2. Đầu Sidebar (Thu gọn & Mở rộng)</span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <BrandLogo 
                    size="md"
                    collapsed={true}
                    customLogoUrl={formData.logoType === 'image' ? formData.logoUrl : undefined}
                    customLogoIcon={formData.logoIcon}
                    customGradientFrom={formData.headerGradientFrom}
                    customGradientTo={formData.headerGradientTo}
                  />
                  <span className="text-[10px] font-mono text-slate-400">1:1 Tỷ lệ chuẩn</span>
                </div>
              </div>

              {/* Auth Preview */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">3. Trang Đăng Nhập (Kích thước Lớn)</span>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <BrandLogo 
                    size="lg"
                    collapsed={true}
                    customLogoUrl={formData.logoType === 'image' ? formData.logoUrl : undefined}
                    customLogoIcon={formData.logoIcon}
                    customGradientFrom={formData.headerGradientFrom}
                    customGradientTo={formData.headerGradientTo}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: TAX & LEGAL BUSINESS ENTITY PROFILE */}
      {activeTabSection === 'tax_business_profile' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading">
              Cấu Hình Loại Hình Cơ Sở & Pháp Nhân Kê Khai Thuế
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Thiết lập quy mô hoạt động (Hộ kinh doanh cá thể hoặc Doanh nghiệp / Công ty) để tự động xuất đúng mẫu biểu thuế Mẫu 01/CNKD (TT 40/2021/TT-BTC) hoặc Mẫu Doanh Nghiệp (TT 80/2021/TT-BTC).
            </p>
          </div>

          {/* Facility Type Selector Radio */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/70 to-indigo-50/70 dark:from-slate-800 dark:to-slate-850 border border-amber-200/70 dark:border-slate-700 space-y-3">
            <label className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Chọn Loại Hình Quy Mô Cơ Sở:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, facilityType: 'household' }))}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  (formData.facilityType || 'household') === 'household'
                    ? 'border-amber-500 bg-white dark:bg-slate-900 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                    [x] Hộ Kinh Doanh Cá Thể
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Mẫu 01/CNKD
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Áp dụng Thông tư 40/2021/TT-BTC. Doanh thu dạy nhạc mã 8559 không chịu thuế GTGT, tính thuế TNCN tỷ lệ 2%.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, facilityType: 'company' }))}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  formData.facilityType === 'company'
                    ? 'border-indigo-500 bg-white dark:bg-slate-900 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 dark:text-indigo-300">
                    [x] Doanh Nghiệp / Công Ty
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                    Mẫu Doanh Nghiệp
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                  Áp dụng Thông tư 80/2021/TT-BTC. Bảng kê hóa đơn chi tiết, chỉ tiêu [26] không chịu thuế GTGT và các mức thuế suất chuẩn.
                </p>
              </button>
            </div>
          </div>

          {/* Conditional Business Profile Form */}
          {(formData.facilityType || 'household') === 'household' ? (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                Hồ Sơ Hộ Kinh Doanh (Theo Giấy Phép Đăng Ký Kinh Doanh)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Hộ Kinh Doanh:
                  </label>
                  <input
                    type="text"
                    value={formData.householdName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, householdName: e.target.value }))}
                    placeholder="HỘ KINH DOANH TRUNG TÂM ÂM NHẠC MINH MUSIC"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Số Thuế Hộ Kinh Doanh (MST HKD):
                  </label>
                  <input
                    type="text"
                    value={formData.householdTaxCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, householdTaxCode: e.target.value, centerTaxCode: e.target.value }))}
                    placeholder="8499281902"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-amber-700 dark:text-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Họ Tên Chủ Hộ Kinh Doanh:
                  </label>
                  <input
                    type="text"
                    value={formData.householdOwner || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, householdOwner: e.target.value }))}
                    placeholder="Nguyễn Văn Minh"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Số CCCD / CMND Chủ Hộ:
                  </label>
                  <input
                    type="text"
                    value={formData.householdCccd || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, householdCccd: e.target.value }))}
                    placeholder="079085012345"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Địa Điểm Kinh Doanh:
                  </label>
                  <input
                    type="text"
                    value={formData.householdBusinessAddress || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, householdBusinessAddress: e.target.value }))}
                    placeholder="123 Đường Âm Nhạc, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ngành Nghề Kinh Doanh Chính:
                  </label>
                  <input
                    type="text"
                    value={formData.householdMainCareer || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, householdMainCareer: e.target.value }))}
                    placeholder="8559 - Giáo dục khác chưa được phân vào đâu (Đào tạo âm nhạc, dạy đàn, thanh nhạc, bán lẻ nhạc cụ)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">
                Hồ Sơ Doanh Nghiệp / Công Ty (Theo Giấy Chứng Nhận ĐKKD)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tên Doanh Nghiệp / Công Ty:
                  </label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="CÔNG TY TNHH GIÁO DỤC ÂM NHẠC MINH MUSIC"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mã Số Thuế Doanh Nghiệp (MST DN):
                  </label>
                  <input
                    type="text"
                    value={formData.companyTaxCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyTaxCode: e.target.value, centerTaxCode: e.target.value }))}
                    placeholder="0316889988"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-indigo-700 dark:text-indigo-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Người Đại Diện Theo Pháp Luật / Giám Đốc:
                  </label>
                  <input
                    type="text"
                    value={formData.legalRepresentative || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, legalRepresentative: e.target.value }))}
                    placeholder="Nguyễn Văn Minh"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kế Toán Trưởng:
                  </label>
                  <input
                    type="text"
                    value={formData.chiefAccountant || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, chiefAccountant: e.target.value }))}
                    placeholder="Trần Thị Thu Thủy"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Địa Chỉ Trụ Sở Chính:
                  </label>
                  <input
                    type="text"
                    value={formData.companyAddress || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyAddress: e.target.value }))}
                    placeholder="123 Đường Âm Nhạc, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Legal Compliance Notes Callout */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Chính sách tách nguồn thu và tỷ lệ tính thuế tự động:</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
              <li><strong>Nguồn 1: Dạy nhạc / Học phí (Mã 8559)</strong>: Đánh dấu không chịu thuế GTGT (Khoản 13 Đ4 TT 219/2013). Nếu là Hộ kinh doanh tính thuế TNCN tỷ lệ 2%.</li>
              <li><strong>Nguồn 2: Bán giáo trình, bán/cho thuê nhạc cụ</strong>: Phân phối hàng hóa (HKD: GTGT 1% + TNCN 0.5% | DN: GTGT 8%).</li>
              <li><strong>Nguồn 3: Dịch vụ phụ trợ / Khảo thí / Cho thuê phòng</strong>: Dịch vụ (HKD: GTGT 5% + TNCN 2% | DN: GTGT 10%).</li>
            </ul>
          </div>
        </div>
      )}
      {activeTabSection === 'colors' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">
              Bảng Màu Chi Tiết (Custom Color Palette)
            </h3>
            <p className="text-xs text-slate-500">
              Nhập mã màu Hex (#RRGGBB) hoặc dùng công cụ chọn màu trực tiếp để tùy biến chính xác hệ màu thương hiệu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Primary */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Màu Chủ Đạo (Primary Color):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-900 uppercase"
                />
              </div>
              <p className="text-[10px] text-slate-500">Dùng cho nút bấm chính, tiêu đề thương hiệu & liên kết quan trọng</p>
            </div>

            {/* Secondary */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Màu Thứ Cấp (Secondary Color):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-900 uppercase"
                />
              </div>
              <p className="text-[10px] text-slate-500">Dùng cho biểu tượng phụ, huy hiệu sao & thông báo nóng</p>
            </div>

            {/* Accent */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Màu Điểm Nhấn (Accent Color):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accentColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, accentColor: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-900 uppercase"
                />
              </div>
              <p className="text-[10px] text-slate-500">Dùng cho tag danh mục, trạng thái và hiệu ứng tương tác</p>
            </div>

            {/* Header Gradient From */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Gradient Khởi Đầu (Header From):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.headerGradientFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, headerGradientFrom: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={formData.headerGradientFrom}
                  onChange={(e) => setFormData(prev => ({ ...prev, headerGradientFrom: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-900 uppercase"
                />
              </div>
            </div>

            {/* Header Gradient To */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Gradient Kết Thúc (Header To):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.headerGradientTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, headerGradientTo: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={formData.headerGradientTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, headerGradientTo: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-900 uppercase"
                />
              </div>
            </div>

            {/* Tag Styling */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Màu Nền Nhãn Phụ (Tag Bg):</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.brandTagBg}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandTagBg: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={formData.brandTagBg}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandTagBg: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-xs font-bold text-slate-900 uppercase"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: MULTI-TENANT & BRANCHES */}
      {activeTabSection === 'multitenant_branches' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Mạng Lưới Chi Nhánh & Quản Trị Đa Điểm (Multi-Tenant Hub)
              </h3>
              <p className="text-xs text-slate-500">
                Quản lý các cơ sở thuộc hệ thống Minh Music, chọn cơ sở đang xem hoặc thiết lập đồng bộ thương hiệu.
              </p>
            </div>

            <button
              onClick={() => setIsAddBranchModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>THÊM CƠ SỞ MỚI</span>
            </button>
          </div>

          {/* Sync Option Checkbox */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">Đồng Bộ Nhận Diện Cho Tất Cả Cơ Sở (Master Sync)</p>
                <p className="text-[11px] text-slate-500">Khi bật, mọi cơ sở và vai trò sẽ sử dụng chung bảng màu và logo này.</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.syncToAllTenants}
                onChange={(e) => setFormData(prev => ({ ...prev, syncToAllTenants: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Branch List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((branch) => {
              const isActive = branch.id === activeBranchId;
              return (
                <div
                  key={branch.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isActive 
                      ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Building className={`w-5 h-5 ${branch.isMainBranch ? 'text-amber-600' : 'text-slate-500'}`} />
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 font-heading">
                          {branch.name}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-slate-100 text-slate-600 font-bold">
                          {branch.code}
                        </span>
                      </div>
                    </div>

                    {branch.isMainBranch && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        TRỤ SỞ CHÍNH
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{branch.address}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{branch.phone}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{branch.email}</span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBranchId(branch.id);
                        showToast(`Đã chuyển cơ sở làm việc sang: ${branch.name}`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isActive ? '✓ Đang xem cơ sở này' : 'Chuyển sang cơ sở này'}
                    </button>

                    <a
                      href={branch.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(branch.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Bản đồ</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Operational Contact Details */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">Thông Tin Liên Hệ & Trực Tuyến Toàn Hệ Thống:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">Hotline:</label>
                <input
                  type="text"
                  value={formData.hotline}
                  onChange={(e) => setFormData(prev => ({ ...prev, hotline: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Email hỗ trợ:</label>
                <input
                  type="text"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Địa chỉ trụ sở:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-medium mb-1">Website chính thức:</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-indigo-600"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM CƠ SỞ MỚI */}
      {isAddBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                <span>Thêm Cơ Sở / Chi Nhánh Mới</span>
              </h3>
              <button onClick={() => setIsAddBranchModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddBranchSubmit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên cơ sở (*):</label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Ví dụ: Cơ Sở 4 - Minh Music Academy Tân Bình"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã viết tắt (*):</label>
                <input
                  type="text"
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  placeholder="MM-TB"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 uppercase font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ chi tiết:</label>
                <input
                  type="text"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường, quận..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hotline:</label>
                  <input
                    type="text"
                    value={newBranchPhone}
                    onChange={(e) => setNewBranchPhone(e.target.value)}
                    placeholder="0909.111.222"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email:</label>
                  <input
                    type="email"
                    value={newBranchEmail}
                    onChange={(e) => setNewBranchEmail(e.target.value)}
                    placeholder="cso4@minhmusic.vn"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Link Google Maps / Chia sẻ vị trí:</span>
                  <span className="text-[10px] text-indigo-600 font-normal">maps.app.goo.gl</span>
                </label>
                <input
                  type="text"
                  value={newBranchGoogleMapsUrl}
                  onChange={(e) => setNewBranchGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/cCs2t8VuaE9JBNMD9?g_st=ac"
                  className="w-full p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/40 text-slate-800 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Lưu Cơ Sở
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
