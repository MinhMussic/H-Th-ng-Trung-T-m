import React, { useState } from 'react';
import { useTheme, PREDEFINED_PALETTES, ColorPalette } from '../../context/ThemeContext';
import {
  Palette,
  Check,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Sparkles,
  Sliders,
  Eye,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';

interface ThemeSettingsSectionProps {
  onSaved?: () => void;
  showPreview?: boolean;
}

const QUICK_HEX_SWATCHES = [
  '#059669', // Emerald
  '#d97706', // Amber
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#c026d3', // Fuchsia
  '#65a30d', // Lime
  '#ea580c', // Orange
  '#0284c7', // Sky
  '#0d9488'  // Teal
];

export const ThemeSettingsSection: React.FC<ThemeSettingsSectionProps> = ({ 
  onSaved,
  showPreview = true 
}) => {
  const {
    theme,
    isDark,
    setTheme,
    colorPresetId,
    customColor,
    currentPalette,
    setColorPreset,
    setCustomHexColor,
    resetThemeToDefault
  } = useTheme();

  const [hexInput, setHexInput] = useState(
    colorPresetId === 'custom' ? customColor : currentPalette.primaryColor
  );
  const [hexError, setHexError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSelectPreset = (palette: ColorPalette) => {
    setColorPreset(palette.id);
    setHexInput(palette.primaryColor);
    setHexError(null);
    showToast(`Đã áp dụng chủ đề màu: ${palette.vietnameseName}`);
    if (onSaved) onSaved();
  };

  const handleCustomHexChange = (val: string) => {
    setHexInput(val);
    const cleaned = val.startsWith('#') ? val : `#${val}`;
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(cleaned)) {
      setHexError(null);
      setCustomHexColor(cleaned);
      if (onSaved) onSaved();
    } else {
      setHexError('Mã HEX không hợp lệ (Ví dụ: #059669 hoặc #F59E0B)');
    }
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    setHexError(null);
    setCustomHexColor(val);
    if (onSaved) onSaved();
  };

  const handleSelectSwatch = (hex: string) => {
    setHexInput(hex);
    setHexError(null);
    setCustomHexColor(hex);
    showToast(`Đã chọn mã màu riêng: ${hex.toUpperCase()}`);
    if (onSaved) onSaved();
  };

  const handleReset = () => {
    resetThemeToDefault();
    setHexInput('#d97706');
    setHexError(null);
    showToast('Đã khôi phục cài đặt màu sắc và giao diện mặc định');
    if (onSaved) onSaved();
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMsg && (
        <div className="p-3 bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
          <button 
            onClick={() => setToastMsg(null)}
            className="p-1 hover:bg-emerald-600 rounded-lg text-white/80 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. CHẾ ĐỘ HIỂN THỊ (LIGHT / DARK / SYSTEM) */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Chế độ hiển thị Giao diện
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động tối ưu độ tương phản cho ban ngày hoặc làm việc ban đêm
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {theme === 'light' ? 'Sáng' : theme === 'dark' ? 'Tối' : 'Hệ thống'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          <button
            type="button"
            id="theme-mode-light"
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-50 text-amber-900 border-amber-400 ring-2 ring-amber-400/20 shadow-xs dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-600'
                : 'bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Sáng (Light)</span>
          </button>

          <button
            type="button"
            id="theme-mode-dark"
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-indigo-950/60 text-indigo-200 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Tối (Dark)</span>
          </button>

          <button
            type="button"
            id="theme-mode-system"
            onClick={() => setTheme('system')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              theme === 'system'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600'
                : 'bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-500" />
            <span>Theo thiết bị</span>
          </button>
        </div>
      </div>

      {/* 2. BỘ BẢNG MÀU CÓ SẴN (PREDEFINED COLOR PALETTES) */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: currentPalette.primaryColor }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Bộ Bảng Màu Có Sẵn (Predefined Themes)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lựa chọn bảng màu đồng bộ và chuyên nghiệp theo nhận diện của trung tâm
              </p>
            </div>
          </div>
          <span 
            className="text-xs font-extrabold px-2.5 py-1 rounded-full border shadow-2xs transition-colors"
            style={{
              backgroundColor: currentPalette.lightBg,
              color: isDark ? currentPalette.darkText : currentPalette.primaryColor,
              borderColor: currentPalette.lightBorder
            }}
          >
            {currentPalette.vietnameseName}
          </span>
        </div>

        {/* Danh sách các thẻ Preset kèm Vòng tròn Màu Sắc (Color Dots) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PREDEFINED_PALETTES.map((p) => {
            const isSelected = colorPresetId === p.id;
            return (
              <div
                key={p.id}
                id={`theme-preset-card-${p.id}`}
                onClick={() => handleSelectPreset(p)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-2 ring-2 shadow-md dark:bg-slate-900/90 bg-white'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
                }`}
                style={{
                  borderColor: isSelected ? p.primaryColor : undefined,
                  boxShadow: isSelected ? `0 4px 14px -2px ${p.primaryColor}35` : undefined
                }}
              >
                {/* Active Indicator Checkmark */}
                {isSelected && (
                  <div 
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: p.primaryColor }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Vòng tròn màu sắc đa sắc (Color Dot) */}
                  <div className="relative shrink-0">
                    <div
                      className="w-10 h-10 rounded-2xl shadow-sm flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`
                      }}
                    >
                      <span className="w-3 h-3 rounded-full bg-white/90 shadow-2xs" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white font-heading truncate">
                        {p.vietnameseName}
                      </h4>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {p.vibe}
                    </p>
                  </div>
                </div>

                {/* Color swatches strip */}
                <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span 
                    className="w-4 h-4 rounded-full shadow-2xs" 
                    style={{ backgroundColor: p.primaryColor }} 
                    title={`Chính: ${p.primaryColor}`}
                  />
                  <span 
                    className="w-4 h-4 rounded-full shadow-2xs" 
                    style={{ backgroundColor: p.hoverColor }} 
                    title={`Hover: ${p.hoverColor}`}
                  />
                  <span 
                    className="w-4 h-4 rounded-full shadow-2xs border border-black/10" 
                    style={{ backgroundColor: p.gradientTo }} 
                    title={`Phối: ${p.gradientTo}`}
                  />
                  <span 
                    className="text-[10px] font-mono font-bold text-slate-400 ml-auto"
                  >
                    {p.primaryColor}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. TÙY CHỈNH MÃ MÀU RIÊNG (CUSTOM HEX COLOR PICKER) */}
      <div 
        id="section-custom-color-picker"
        className={`bg-white dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border transition-all shadow-xs ${
          colorPresetId === 'custom' 
            ? 'border-2 ring-2' 
            : 'border-slate-200/80 dark:border-slate-700/80'
        }`}
        style={{
          borderColor: colorPresetId === 'custom' ? currentPalette.primaryColor : undefined,
          boxShadow: colorPresetId === 'custom' ? `0 4px 14px -2px ${currentPalette.primaryColor}30` : undefined
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <span>Tùy Chỉnh Mã Màu Riêng (Custom Hex Color)</span>
                {colorPresetId === 'custom' && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-extrabold">
                    Đang dùng
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhập mã màu HEX hoặc chọn trực tiếp từ bảng màu để áp dụng màu thương hiệu cá nhân
              </p>
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="flex items-center gap-3">
            {/* Native HTML5 Color Picker Container */}
            <div className="relative">
              <input
                type="color"
                id="custom-theme-color-native-picker"
                value={hexInput.startsWith('#') && hexInput.length === 7 ? hexInput : '#059669'}
                onChange={handleColorPickerChange}
                className="w-12 h-12 rounded-2xl cursor-pointer border-2 border-slate-200 dark:border-slate-700 p-0.5 bg-transparent shadow-xs transition-transform hover:scale-105"
                title="Bấm để chọn màu tự do"
                aria-label="Chọn màu tự do"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="custom-theme-hex-input" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mã màu Hex (Ví dụ: #059669)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="custom-theme-hex-input"
                  value={hexInput}
                  onChange={(e) => handleCustomHexChange(e.target.value)}
                  placeholder="#059669"
                  maxLength={7}
                  className="w-full font-mono text-sm font-bold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <div 
                  className="absolute right-2 top-2 w-6 h-6 rounded-lg shadow-2xs border border-black/10"
                  style={{ backgroundColor: hexInput.startsWith('#') ? hexInput : `#${hexInput}` }}
                />
              </div>
              {hexError && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">{hexError}</p>
              )}
            </div>
          </div>

          {/* Quick Swatches */}
          <div>
            <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Gợi ý mã màu thương hiệu đẹp:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_HEX_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => handleSelectSwatch(swatch)}
                  className="w-7 h-7 rounded-xl border border-black/10 shadow-2xs hover:scale-115 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: swatch }}
                  title={`Chọn ${swatch}`}
                >
                  {customColor.toLowerCase() === swatch.toLowerCase() && colorPresetId === 'custom' && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. XEM TRƯỚC GIAO DIỆN THỰC TẾ (LIVE PREVIEW SECTION) */}
      {showPreview && (
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                Xem Trước Đồng Bộ Giao Diện (Live Theme Preview)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Các thành phần giao diện chính trên màn hình tự động đổi màu theo chủ đề đã chọn
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
            {/* Banner gradient preview */}
            <div 
              className="p-3.5 rounded-xl text-white shadow-xs flex items-center justify-between transition-all"
              style={{
                background: `linear-gradient(135deg, ${currentPalette.gradientFrom}, ${currentPalette.gradientTo})`
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black">
                  M
                </div>
                <div>
                  <h4 className="text-xs font-black font-heading">Biểu Ngữ Chào Mừng / Banner Header</h4>
                  <p className="text-[10px] text-white/90 font-medium">Hệ thống Quản lý Minh Music Center</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/20 font-bold backdrop-blur-xs">
                {currentPalette.vietnameseName}
              </span>
            </div>

            {/* Buttons preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                className="py-2 px-3 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                style={{ backgroundColor: currentPalette.primaryColor }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Nút Chính: Xác nhận</span>
              </button>

              <button
                type="button"
                className="py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  backgroundColor: currentPalette.lightBg,
                  color: isDark ? currentPalette.darkText : currentPalette.primaryColor,
                  borderColor: currentPalette.lightBorder
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Thẻ Nổi Bật / Điểm danh</span>
              </button>

              <button
                type="button"
                className="py-2 px-3 rounded-xl text-xs font-bold border-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                style={{
                  color: isDark ? currentPalette.darkText : currentPalette.primaryColor,
                  borderColor: currentPalette.primaryColor
                }}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Viền Đang Chọn</span>
              </button>
            </div>

            {/* Badges preview */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Thẻ trạng thái:
              </span>
              <span 
                className="text-[11px] px-2.5 py-0.5 rounded-full font-bold border"
                style={{
                  backgroundColor: currentPalette.lightBg,
                  color: isDark ? currentPalette.darkText : currentPalette.primaryColor,
                  borderColor: currentPalette.lightBorder
                }}
              >
                ⭐ Vinh danh tháng
              </span>
              <span 
                className="text-[11px] px-2.5 py-0.5 rounded-full font-bold text-white"
                style={{ backgroundColor: currentPalette.primaryColor }}
              >
                ✓ Đã hoàn thành
              </span>
              <span 
                className="text-[11px] px-2.5 py-0.5 rounded-full font-bold border font-mono"
                style={{
                  borderColor: currentPalette.primaryColor,
                  color: isDark ? currentPalette.darkText : currentPalette.primaryColor
                }}
              >
                Mã màu: {currentPalette.primaryColor}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. NÚT KHÔI PHỤC MẶC ĐỊNH */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Khôi phục màu mặc định (Warm Amber)</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Tự động lưu vào bộ nhớ máy</span>
        </div>
      </div>
    </div>
  );
};
