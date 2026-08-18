import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Music, 
  Sparkles, 
  GraduationCap, 
  Award, 
  Headphones, 
  Mic, 
  Radio, 
  Building 
} from 'lucide-react';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  imageClassName?: string;
  showText?: boolean;
  showSubText?: boolean;
  showSlogan?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  customTitle?: string;
  customSubTitle?: string;
  customLogoUrl?: string;
  customLogoIcon?: string;
  customGradientFrom?: string;
  customGradientTo?: string;
  customPrimaryColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  className = '',
  imageClassName = '',
  showText = false,
  showSubText = false,
  showSlogan = false,
  collapsed = false,
  onClick,
  customTitle,
  customSubTitle,
  customLogoUrl,
  customLogoIcon,
  customGradientFrom,
  customGradientTo,
  customPrimaryColor
}) => {
  const { branding } = useData();
  const { currentPalette } = useTheme();
  const [imageError, setImageError] = useState(false);

  // Dimension mapping
  const sizeMap = {
    xs: {
      box: 'w-6 h-6 rounded-lg text-xs',
      img: 'w-5 h-5 rounded-md',
      iconSize: 'w-3.5 h-3.5',
      title: 'text-xs font-black',
      sub: 'text-[9px]',
      slogan: 'text-[9px]'
    },
    sm: {
      box: 'w-8 h-8 rounded-xl text-sm',
      img: 'w-7 h-7 rounded-lg',
      iconSize: 'w-4 h-4',
      title: 'text-sm font-black',
      sub: 'text-[10px]',
      slogan: 'text-[10px]'
    },
    md: {
      box: 'w-10 h-10 rounded-xl text-base',
      img: 'w-8 h-8 rounded-lg',
      iconSize: 'w-5 h-5',
      title: 'text-base font-extrabold',
      sub: 'text-[11px]',
      slogan: 'text-xs'
    },
    lg: {
      box: 'w-14 h-14 rounded-2xl text-xl shadow-md',
      img: 'w-11 h-11 rounded-xl',
      iconSize: 'w-7 h-7',
      title: 'text-xl sm:text-2xl font-black',
      sub: 'text-xs',
      slogan: 'text-xs sm:text-sm'
    },
    xl: {
      box: 'w-20 h-20 rounded-3xl text-2xl shadow-xl',
      img: 'w-16 h-16 rounded-2xl',
      iconSize: 'w-10 h-10',
      title: 'text-2xl sm:text-3xl font-black',
      sub: 'text-xs sm:text-sm',
      slogan: 'text-sm'
    }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const renderIconByConfig = (iconName?: string, iconClass = 'w-5 h-5') => {
    switch (iconName) {
      case 'Music': return <Music className={iconClass} />;
      case 'Sparkles': return <Sparkles className={iconClass} />;
      case 'GraduationCap': return <GraduationCap className={iconClass} />;
      case 'Award': return <Award className={iconClass} />;
      case 'Headphones': return <Headphones className={iconClass} />;
      case 'Mic': return <Mic className={iconClass} />;
      case 'Radio': return <Radio className={iconClass} />;
      case 'Building': return <Building className={iconClass} />;
      default: return (
        // Standard high-quality Music Note Treble Emblem
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={iconClass}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    }
  };

  // Determine gradient colors from branding, custom props, or theme
  const gradientFrom = customGradientFrom || branding?.headerGradientFrom || currentPalette?.gradientFrom || '#d97706';
  const gradientTo = customGradientTo || branding?.headerGradientTo || currentPalette?.gradientTo || '#ea580c';
  const primaryColor = customPrimaryColor || branding?.primaryColor || currentPalette?.primaryColor || '#d97706';
  const centerTitle = customTitle || branding?.centerName || 'MINH MUSIC';
  const centerSubTitle = customSubTitle || branding?.subName || 'CENTER';
  const centerSlogan = branding?.slogan || 'Hệ thống Quản lý Trung tâm Âm nhạc Toàn diện';
  const logoIconToRender = customLogoIcon || branding?.logoIcon;
  const activeLogoUrl = customLogoUrl !== undefined ? customLogoUrl : (branding?.logoType === 'image' ? branding?.logoUrl : undefined);

  const hasValidCustomImage = Boolean(
    !imageError && 
    activeLogoUrl && 
    activeLogoUrl.trim().length > 0
  );

  return (
    <div 
      className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${onClick ? 'cursor-pointer hover:opacity-95' : ''} ${className}`}
      onClick={onClick}
    >
      {/* Logo Icon / Image Container */}
      <div
        className={`
          ${currentSize.box} flex items-center justify-center shrink-0 text-white overflow-hidden transition-transform
          ${onClick ? 'hover:scale-105 active:scale-95' : ''}
          ${imageClassName}
        `}
        style={{
          background: hasValidCustomImage ? 'transparent' : `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          boxShadow: hasValidCustomImage ? 'none' : `0 4px 12px -2px ${primaryColor}40`
        }}
      >
        {hasValidCustomImage ? (
          <img
            src={activeLogoUrl}
            alt={centerTitle}
            className={`${currentSize.img} object-contain max-h-full max-w-full drop-shadow-xs`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center text-white drop-shadow-xs">
            {renderIconByConfig(logoIconToRender, currentSize.iconSize)}
          </div>
        )}
      </div>

      {/* Brand Text labels */}
      {(!collapsed && (showText || showSubText || showSlogan)) && (
        <div className="min-w-0 flex flex-col justify-center">
          {showText && (
            <div className="flex items-center gap-1.5 flex-wrap leading-tight">
              <span 
                className={`${currentSize.title} font-heading tracking-tight text-slate-900 dark:text-white truncate`}
                style={{ color: !hasValidCustomImage ? undefined : primaryColor }}
              >
                {centerTitle}
              </span>
              {showSubText && centerSubTitle && (
                <span
                  className={`${currentSize.sub} px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider border`}
                  style={{
                    backgroundColor: branding?.brandTagBg || `${primaryColor}15`,
                    color: branding?.brandTagText || primaryColor,
                    borderColor: `${primaryColor}30`
                  }}
                >
                  {centerSubTitle}
                </span>
              )}
            </div>
          )}

          {showSlogan && centerSlogan && (
            <p className={`${currentSize.slogan} text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5`}>
              {centerSlogan}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
