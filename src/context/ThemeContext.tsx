import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorPalette {
  id: string;
  name: string;
  vietnameseName: string;
  description: string;
  vibe: string;
  primaryColor: string;
  hoverColor: string;
  lightBg: string;
  lightBorder: string;
  darkText: string;
  darkBg: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  brandTagBg: string;
  brandTagText: string;
  dotColor: string;
  isCustom?: boolean;
}

// Predefined Color Palettes according to user specification
export const PREDEFINED_PALETTES: ColorPalette[] = [
  {
    id: 'emerald',
    name: 'Emerald Green',
    vietnameseName: 'Xanh ngọc / Xanh lá',
    vibe: 'Phong cách tươi mới, hài hòa & truyền cảm hứng',
    description: 'Tông xanh ngọc bích êm dịu, khơi dậy đam mê học tập và sự thư thái nghệ thuật.',
    primaryColor: '#059669', // Emerald 600
    hoverColor: '#047857',   // Emerald 700
    lightBg: '#ecfdf5',      // Emerald 50
    lightBorder: '#a7f3d0',  // Emerald 200
    darkText: '#34d399',     // Emerald 400
    darkBg: 'rgba(5, 150, 105, 0.18)',
    gradientFrom: '#059669',
    gradientTo: '#0d9488',   // Teal 600
    accentColor: '#0d9488',
    brandTagBg: '#d1fae5',
    brandTagText: '#065f46',
    dotColor: '#059669'
  },
  {
    id: 'amber',
    name: 'Warm Amber / Orange',
    vietnameseName: 'Cam năng động',
    vibe: 'Phong cách sáng tạo, nổi bật & ấm áp',
    description: 'Tông màu hổ phách ấm nồng, giàu năng lượng biểu diễn và nhiệt huyết thanh xuân.',
    primaryColor: '#d97706', // Amber 600
    hoverColor: '#b45309',   // Amber 700
    lightBg: '#fffbeb',      // Amber 50
    lightBorder: '#fde68a',  // Amber 200
    darkText: '#fbbf24',     // Amber 400
    darkBg: 'rgba(217, 119, 6, 0.18)',
    gradientFrom: '#d97706',
    gradientTo: '#ea580c',   // Orange 600
    accentColor: '#e11d48',
    brandTagBg: '#fef3c7',
    brandTagText: '#92400e',
    dotColor: '#d97706'
  },
  {
    id: 'blue',
    name: 'Ocean Blue / Indigo',
    vietnameseName: 'Xanh dương hiện đại',
    vibe: 'Phong cách chuẩn mực, chuyên nghiệp & công nghệ',
    description: 'Tông xanh đại dương vững chãi, tạo cảm giác chuyên nghiệp, uy tín và chuẩn mực học viện.',
    primaryColor: '#2563eb', // Blue 600
    hoverColor: '#1d4ed8',   // Blue 700
    lightBg: '#eff6ff',      // Blue 50
    lightBorder: '#bfdbfe',  // Blue 200
    darkText: '#60a5fa',     // Blue 400
    darkBg: 'rgba(37, 99, 235, 0.18)',
    gradientFrom: '#2563eb',
    gradientTo: '#4f46e5',   // Indigo 600
    accentColor: '#4f46e5',
    brandTagBg: '#dbeafe',
    brandTagText: '#1e40af',
    dotColor: '#2563eb'
  },
  {
    id: 'purple',
    name: 'Deep Purple / Violet',
    vietnameseName: 'Tím hoàng gia',
    vibe: 'Phong cách sang trọng, nghệ thuật & đẳng cấp',
    description: 'Sắc tím quý phái, đậm chất hàn lâm và tinh tế của các buổi hòa nhạc cổ điển đỉnh cao.',
    primaryColor: '#7c3aed', // Violet 600
    hoverColor: '#6d28d9',   // Violet 700
    lightBg: '#f5f3ff',      // Violet 50
    lightBorder: '#ddd6fe',  // Violet 200
    darkText: '#a78bfa',     // Violet 400
    darkBg: 'rgba(124, 58, 237, 0.18)',
    gradientFrom: '#7c3aed',
    gradientTo: '#9333ea',   // Purple 600
    accentColor: '#c026d3',
    brandTagBg: '#ede9fe',
    brandTagText: '#5b21b6',
    dotColor: '#7c3aed'
  },
  {
    id: 'rose',
    name: 'Ruby Rose / Coral',
    vietnameseName: 'Đỏ Ruby / San hô',
    vibe: 'Phong cách cảm xúc, ngọt ngào & tinh tế',
    description: 'Tông đỏ hồng quý phái mang lại sự ấm cúng, truyền tải tình yêu âm nhạc sâu sắc.',
    primaryColor: '#e11d48', // Rose 600
    hoverColor: '#be123c',   // Rose 700
    lightBg: '#fff1f2',      // Rose 50
    lightBorder: '#fecdd3',  // Rose 200
    darkText: '#fb7185',     // Rose 400
    darkBg: 'rgba(225, 29, 72, 0.18)',
    gradientFrom: '#e11d48',
    gradientTo: '#db2777',   // Pink 600
    accentColor: '#db2777',
    brandTagBg: '#ffe4e6',
    brandTagText: '#9f1239',
    dotColor: '#e11d48'
  },
  {
    id: 'cyan',
    name: 'Teal & Cyan Wave',
    vietnameseName: 'Xanh ngọc biển Cyan',
    vibe: 'Phong cách trẻ trung, năng động & tự do',
    description: 'Sắc ngọc lam trong trẻo, mang luồng gió hiện đại và tư duy rộng mở cho thế hệ trẻ.',
    primaryColor: '#0891b2', // Cyan 600
    hoverColor: '#0e7490',   // Cyan 700
    lightBg: '#ecfeff',      // Cyan 50
    lightBorder: '#a5f3fc',  // Cyan 200
    darkText: '#22d3ee',     // Cyan 400
    darkBg: 'rgba(8, 145, 178, 0.18)',
    gradientFrom: '#0891b2',
    gradientTo: '#0284c7',   // Sky 600
    accentColor: '#0284c7',
    brandTagBg: '#cffafe',
    brandTagText: '#155e75',
    dotColor: '#0891b2'
  }
];

// Helper: Convert HEX to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

// Helper: Adjust Hex Color Brightness
export function adjustHexBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjust = (val: number) => Math.min(255, Math.max(0, Math.round(val + (255 * percent) / 100)));
  const r = adjust(rgb.r).toString(16).padStart(2, '0');
  const g = adjust(rgb.g).toString(16).padStart(2, '0');
  const b = adjust(rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

// Helper: Shift Hue for pleasant gradients
export function shiftHexHue(hex: string, degreeOffset = 25): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  // Simple RGB mixing approximation for gradient pairing
  const r = Math.min(255, Math.max(0, Math.round(rgb.r * 0.85 + (degreeOffset > 0 ? 30 : 0))));
  const g = Math.min(255, Math.max(0, Math.round(rgb.g * 0.9)));
  const b = Math.min(255, Math.max(0, Math.round(rgb.b * 1.1 + (degreeOffset > 0 ? 25 : 0))));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Helper: Create full custom ColorPalette from a single Hex code
export function createCustomPalette(hex: string): ColorPalette {
  const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
  const rgb = hexToRgb(cleanHex) || { r: 217, g: 119, b: 6 };
  const validHex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;

  const hoverColor = adjustHexBrightness(validHex, -15);
  const lightBorder = adjustHexBrightness(validHex, 60);
  const darkText = adjustHexBrightness(validHex, 35);
  const gradientTo = shiftHexHue(validHex, 30);

  return {
    id: 'custom',
    name: 'Tùy chỉnh riêng (Custom)',
    vietnameseName: 'Màu tùy chỉnh riêng',
    vibe: 'Thương hiệu cá nhân hóa độc bản',
    description: `Mã màu nhận diện riêng (${validHex.toUpperCase()}) được đồng bộ tự động toàn ứng dụng.`,
    primaryColor: validHex,
    hoverColor,
    lightBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
    lightBorder,
    darkText,
    darkBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`,
    gradientFrom: validHex,
    gradientTo,
    accentColor: gradientTo,
    brandTagBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
    brandTagText: validHex,
    dotColor: validHex,
    isCustom: true
  };
}

interface ThemeContextType {
  // Theme Mode (Light / Dark / System)
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Color Palette State
  colorPresetId: string;
  customColor: string;
  currentPalette: ColorPalette;
  allPalettes: ColorPalette[];
  setColorPreset: (presetId: string) => void;
  setCustomHexColor: (hex: string) => void;
  resetThemeToDefault: () => void;

  // Modal helper state
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (open: boolean) => void;
  openThemeModal: () => void;
  closeThemeModal: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_MODE_STORAGE_KEY = 'minh_music_theme_mode';
const THEME_PRESET_STORAGE_KEY = 'minh_music_theme_preset_id';
const THEME_CUSTOM_HEX_STORAGE_KEY = 'minh_music_theme_custom_hex';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Theme Mode State
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // 2. Color Palette State
  const [colorPresetId, setColorPresetId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(THEME_PRESET_STORAGE_KEY);
      if (saved && (PREDEFINED_PALETTES.some(p => p.id === saved) || saved === 'custom')) {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'amber'; // Default brand tone for Minh Music
  });

  const [customColor, setCustomColor] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(THEME_CUSTOM_HEX_STORAGE_KEY);
      if (saved && /^#?[0-9A-Fa-f]{6}$/.test(saved)) {
        return saved.startsWith('#') ? saved : `#${saved}`;
      }
    } catch {
      // fallback
    }
    return '#059669'; // Default custom starting color (Emerald)
  });

  // Modal State
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Compute Active Palette
  const currentPalette = useMemo<ColorPalette>(() => {
    if (colorPresetId === 'custom') {
      return createCustomPalette(customColor);
    }
    const found = PREDEFINED_PALETTES.find(p => p.id === colorPresetId);
    return found || PREDEFINED_PALETTES[1]; // fallback to amber
  }, [colorPresetId, customColor]);

  // All palettes list (including custom)
  const allPalettes = useMemo<ColorPalette[]>(() => {
    const customPalette = createCustomPalette(customColor);
    return [...PREDEFINED_PALETTES, customPalette];
  }, [customColor]);

  // Update HTML classes & CSS Variables whenever theme or palette changes
  useEffect(() => {
    const updateThemeAndVariables = () => {
      let resolvedDark = false;
      if (theme === 'dark') {
        resolvedDark = true;
      } else if (theme === 'light') {
        resolvedDark = false;
      } else {
        resolvedDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDark(resolvedDark);

      const root = document.documentElement;
      if (resolvedDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
        document.body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
        document.body.classList.remove('dark');
      }

      // Inject Global CSS Variables
      const rgb = hexToRgb(currentPalette.primaryColor) || { r: 217, g: 119, b: 6 };
      root.style.setProperty('--primary', currentPalette.primaryColor);
      root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      root.style.setProperty('--primary-hover', currentPalette.hoverColor);
      root.style.setProperty('--primary-light', currentPalette.lightBg);
      root.style.setProperty('--primary-light-border', currentPalette.lightBorder);
      root.style.setProperty('--primary-dark-text', currentPalette.darkText);
      root.style.setProperty('--primary-dark-bg', currentPalette.darkBg);
      root.style.setProperty('--primary-gradient-from', currentPalette.gradientFrom);
      root.style.setProperty('--primary-gradient-to', currentPalette.gradientTo);
      root.style.setProperty('--primary-ring', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`);
      root.style.setProperty('--accent-color', currentPalette.accentColor);
      root.style.setProperty('--theme-color-id', currentPalette.id);
    };

    updateThemeAndVariables();

    // Media query listener if system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (theme === 'system') {
        updateThemeAndVariables();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [theme, currentPalette]);

  // Actions
  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const setColorPreset = (presetId: string) => {
    setColorPresetId(presetId);
    try {
      localStorage.setItem(THEME_PRESET_STORAGE_KEY, presetId);
    } catch {
      // ignore
    }
  };

  const setCustomHexColor = (hex: string) => {
    const formatted = hex.startsWith('#') ? hex : `#${hex}`;
    setCustomColor(formatted);
    setColorPresetId('custom');
    try {
      localStorage.setItem(THEME_CUSTOM_HEX_STORAGE_KEY, formatted);
      localStorage.setItem(THEME_PRESET_STORAGE_KEY, 'custom');
    } catch {
      // ignore
    }
  };

  const resetThemeToDefault = () => {
    setThemeState('light');
    setColorPresetId('amber');
    setCustomColor('#059669');
    try {
      localStorage.setItem(THEME_MODE_STORAGE_KEY, 'light');
      localStorage.setItem(THEME_PRESET_STORAGE_KEY, 'amber');
    } catch {
      // ignore
    }
  };

  const openThemeModal = () => setIsThemeModalOpen(true);
  const closeThemeModal = () => setIsThemeModalOpen(false);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        setTheme,
        toggleTheme,
        colorPresetId,
        customColor,
        currentPalette,
        allPalettes,
        setColorPreset,
        setCustomHexColor,
        resetThemeToDefault,
        isThemeModalOpen,
        setIsThemeModalOpen,
        openThemeModal,
        closeThemeModal
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
