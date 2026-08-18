import React from 'react';

interface LaurelWreathFrameProps {
  avatarUrl?: string;
  studentName: string;
  rank?: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ribbonLabel?: string;
  subTitle?: string;
  showCrown?: boolean;
  className?: string;
}

export const LaurelWreathFrame: React.FC<LaurelWreathFrameProps> = ({
  avatarUrl,
  studentName,
  rank = 1,
  size = 'md',
  ribbonLabel,
  subTitle,
  showCrown = true,
  className = ''
}) => {
  const isRank1 = rank === 1;
  const isRank2 = rank === 2;
  const isRank3 = rank === 3;

  // Size configurations
  const sizeConfig = {
    sm: {
      width: 220,
      height: 250,
      avatarSize: 96,
      avatarOffset: { x: 152, y: 152 },
      ribbonFontSize: 11,
      subTitleFontSize: 9,
      containerClass: 'w-[180px] sm:w-[210px]'
    },
    md: {
      width: 280,
      height: 310,
      avatarSize: 124,
      avatarOffset: { x: 138, y: 138 },
      ribbonFontSize: 13,
      subTitleFontSize: 10,
      containerClass: 'w-[230px] sm:w-[270px]'
    },
    lg: {
      width: 340,
      height: 380,
      avatarSize: 154,
      avatarOffset: { x: 123, y: 123 },
      ribbonFontSize: 15,
      subTitleFontSize: 12,
      containerClass: 'w-[280px] sm:w-[330px]'
    },
    xl: {
      width: 400,
      height: 440,
      avatarSize: 180,
      avatarOffset: { x: 110, y: 110 },
      ribbonFontSize: 17,
      subTitleFontSize: 13,
      containerClass: 'w-[320px] sm:w-[390px]'
    }
  }[size];

  // Theme palettes (Rank 1: Imperial Gold matching the image, Rank 2: Silver/Platinum, Rank 3: Rose Bronze)
  const theme = isRank1
    ? {
        id: 'gold',
        glowColor: 'rgba(245, 185, 45, 0.65)',
        textFill: '#5C3806',
        textStroke: '#FFEAA7',
        subTextFill: '#FCE788',
        defaultRibbon: ribbonLabel || studentName.toUpperCase(),
        defaultSubTitle: subTitle || 'Học viên xuất sắc nhất',
        stops: {
          g0: '#FFFFFF',
          g1: '#FFF2A8',
          g2: '#F3C44A',
          g3: '#D99823',
          g4: '#A1660E',
          g5: '#5C3806',
          darkFold: '#4A2B04',
          ambientGlow: '#E5A523'
        }
      }
    : isRank2
    ? {
        id: 'silver',
        glowColor: 'rgba(215, 228, 245, 0.65)',
        textFill: '#1E293B',
        textStroke: '#FFFFFF',
        subTextFill: '#E2E8F0',
        defaultRibbon: ribbonLabel || studentName.toUpperCase(),
        defaultSubTitle: subTitle || 'Á quân xuất sắc',
        stops: {
          g0: '#FFFFFF',
          g1: '#F1F5F9',
          g2: '#CBD5E1',
          g3: '#94A3B8',
          g4: '#64748B',
          g5: '#334155',
          darkFold: '#1E293B',
          ambientGlow: '#CBD5E1'
        }
      }
    : {
        id: 'bronze',
        glowColor: 'rgba(235, 130, 60, 0.65)',
        textFill: '#431407',
        textStroke: '#FFEDD5',
        subTextFill: '#FED7AA',
        defaultRibbon: ribbonLabel || studentName.toUpperCase(),
        defaultSubTitle: subTitle || 'Quý quân xuất sắc',
        stops: {
          g0: '#FFF7ED',
          g1: '#FFEDD5',
          g2: '#FB923C',
          g3: '#EA580C',
          g4: '#9A3412',
          g5: '#431407',
          darkFold: '#320E05',
          ambientGlow: '#EA580C'
        }
      };

  const uid = `${theme.id}-${rank}-${size}`;

  // Dynamic font sizing for long student names
  const rawRibbonText = ribbonLabel || studentName.toUpperCase();
  const textLen = rawRibbonText.length;
  const calculatedRibbonFontSize = textLen > 24
    ? Math.max(10, sizeConfig.ribbonFontSize - 3)
    : textLen > 18
    ? Math.max(11, sizeConfig.ribbonFontSize - 1.5)
    : sizeConfig.ribbonFontSize + 1;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${sizeConfig.containerClass} ${className}`}>
      
      {/* Top Spotlight Rays Effect (Ánh hào quang chiếu từ trên xuống như ảnh mẫu) */}
      <div className="absolute -top-10 inset-x-0 h-40 bg-gradient-to-b from-amber-400/20 via-amber-400/5 to-transparent blur-xl pointer-events-none rounded-full" />

      {/* SVG Royal Honor Medallion with Crown, Laurel Wreath & 3D Ribbon */}
      <div className="relative w-full aspect-[400/440] flex items-center justify-center">
        <svg
          viewBox="0 0 400 440"
          className="w-full h-full drop-shadow-2xl overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Metallic Gold / Silver / Bronze Gradients */}
            <linearGradient id={`grad-metal-diag-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.stops.g0} />
              <stop offset="15%" stopColor={theme.stops.g1} />
              <stop offset="35%" stopColor={theme.stops.g2} />
              <stop offset="55%" stopColor={theme.stops.g3} />
              <stop offset="80%" stopColor={theme.stops.g4} />
              <stop offset="100%" stopColor={theme.stops.g5} />
            </linearGradient>

            <linearGradient id={`grad-metal-rev-${uid}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.stops.g1} />
              <stop offset="25%" stopColor={theme.stops.g3} />
              <stop offset="50%" stopColor={theme.stops.g0} />
              <stop offset="75%" stopColor={theme.stops.g4} />
              <stop offset="100%" stopColor={theme.stops.g2} />
            </linearGradient>

            <linearGradient id={`grad-leaf-light-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.stops.g0} />
              <stop offset="30%" stopColor={theme.stops.g1} />
              <stop offset="70%" stopColor={theme.stops.g2} />
              <stop offset="100%" stopColor={theme.stops.g3} />
            </linearGradient>

            <linearGradient id={`grad-leaf-dark-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme.stops.g2} />
              <stop offset="50%" stopColor={theme.stops.g3} />
              <stop offset="100%" stopColor={theme.stops.g4} />
            </linearGradient>

            <linearGradient id={`grad-ribbon-front-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={theme.stops.g3} />
              <stop offset="15%" stopColor={theme.stops.g1} />
              <stop offset="45%" stopColor={theme.stops.g0} />
              <stop offset="55%" stopColor={theme.stops.g1} />
              <stop offset="85%" stopColor={theme.stops.g2} />
              <stop offset="100%" stopColor={theme.stops.g4} />
            </linearGradient>

            <linearGradient id={`grad-ribbon-tail-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.stops.g2} />
              <stop offset="50%" stopColor={theme.stops.g4} />
              <stop offset="100%" stopColor={theme.stops.g5} />
            </linearGradient>

            <radialGradient id={`grad-pearl-${uid}`} cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor={theme.stops.g1} />
              <stop offset="80%" stopColor={theme.stops.g3} />
              <stop offset="100%" stopColor={theme.stops.g5} />
            </radialGradient>

            <radialGradient id={`grad-inner-disc-${uid}`} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor={theme.stops.g1} stopOpacity="0.35" />
              <stop offset="60%" stopColor={theme.stops.g3} stopOpacity="0.15" />
              <stop offset="100%" stopColor={theme.stops.g5} stopOpacity="0.85" />
            </radialGradient>

            {/* Filter for Golden Shimmer */}
            <filter id={`filter-glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={theme.glowColor} floodOpacity="0.7" />
            </filter>

            {/* Avatar Clip Path */}
            <clipPath id={`avatar-clip-${uid}`}>
              <circle cx="200" cy="190" r="86" />
            </clipPath>
          </defs>

          {/* ========================================================================= */}
          {/* 1. LAUREL WREATH BRANCHES (VÒNG NGUYỆT QUẾ VÀNG KIM 2 BÊN ÔM LẤY KHUNG TRÒN) */}
          {/* ========================================================================= */}
          <g id="laurel-wreath" filter={`url(#filter-glow-${uid})`}>
            {/* Left Branch */}
            <g id="left-wreath">
              {/* Main curved stem */}
              <path
                d="M 190,320 C 80,310 40,210 100,105 C 120,70 160,50 175,45"
                fill="none"
                stroke={`url(#grad-metal-diag-${uid})`}
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Left Leaves with 3D Center Crease */}
              {/* Pair 1 - Top */}
              <path d="M 175,45 C 160,30 135,38 140,55 C 148,65 170,55 175,45 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 175,45 C 155,42 145,55 158,68 C 168,70 178,55 175,45 Z" fill={`url(#grad-leaf-dark-${uid})`} />
              
              {/* Pair 2 */}
              <path d="M 148,65 C 128,50 106,62 114,80 C 124,90 144,78 148,65 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 148,65 C 130,68 120,84 135,95 C 145,95 152,78 148,65 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 3 */}
              <path d="M 122,92 C 98,78 80,95 90,115 C 102,125 120,110 122,92 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 122,92 C 102,98 94,118 110,128 C 122,128 128,110 122,92 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 4 - Middle */}
              <path d="M 102,126 C 75,115 60,135 72,158 C 85,170 102,150 102,126 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 102,126 C 82,135 76,160 95,170 C 108,168 112,145 102,126 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 5 */}
              <path d="M 90,166 C 62,160 50,185 64,208 C 78,220 95,198 90,166 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 90,166 C 72,178 68,206 88,216 C 100,212 102,188 90,166 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 6 */}
              <path d="M 88,212 C 62,212 55,240 72,260 C 88,270 102,245 88,212 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 88,212 C 72,228 72,256 94,264 C 105,258 104,232 88,212 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 7 - Lower */}
              <path d="M 98,258 C 76,265 74,295 94,312 C 110,320 120,292 98,258 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 98,258 C 86,278 92,306 114,312 C 124,302 120,278 98,258 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 8 - Bottom base */}
              <path d="M 120,300 C 100,312 106,340 128,350 C 144,354 150,328 120,300 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 120,300 C 110,322 122,345 144,346 C 150,334 142,312 120,300 Z" fill={`url(#grad-leaf-dark-${uid})`} />
            </g>

            {/* Right Branch */}
            <g id="right-wreath">
              {/* Main curved stem */}
              <path
                d="M 210,320 C 320,310 360,210 300,105 C 280,70 240,50 225,45"
                fill="none"
                stroke={`url(#grad-metal-diag-${uid})`}
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Right Leaves with 3D Center Crease */}
              {/* Pair 1 - Top */}
              <path d="M 225,45 C 240,30 265,38 260,55 C 252,65 230,55 225,45 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 225,45 C 245,42 255,55 242,68 C 232,70 222,55 225,45 Z" fill={`url(#grad-leaf-dark-${uid})`} />
              
              {/* Pair 2 */}
              <path d="M 252,65 C 272,50 294,62 286,80 C 276,90 256,78 252,65 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 252,65 C 270,68 280,84 265,95 C 255,95 248,78 252,65 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 3 */}
              <path d="M 278,92 C 302,78 320,95 310,115 C 298,125 280,110 278,92 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 278,92 C 298,98 306,118 290,128 C 278,128 272,110 278,92 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 4 - Middle */}
              <path d="M 298,126 C 325,115 340,135 328,158 C 315,170 298,150 298,126 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 298,126 C 318,135 324,160 305,170 C 292,168 288,145 298,126 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 5 */}
              <path d="M 310,166 C 338,160 350,185 336,208 C 322,220 305,198 310,166 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 310,166 C 328,178 332,206 312,216 C 300,212 298,188 310,166 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 6 */}
              <path d="M 312,212 C 338,212 345,240 328,260 C 312,270 298,245 312,212 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 312,212 C 328,228 328,256 306,264 C 295,258 296,232 312,212 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 7 - Lower */}
              <path d="M 302,258 C 324,265 326,295 306,312 C 290,320 280,292 302,258 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 302,258 C 314,278 308,306 286,312 C 276,302 280,278 302,258 Z" fill={`url(#grad-leaf-dark-${uid})`} />

              {/* Pair 8 - Bottom base */}
              <path d="M 280,300 C 300,312 294,340 272,350 C 256,354 250,328 280,300 Z" fill={`url(#grad-leaf-light-${uid})`} />
              <path d="M 280,300 C 290,322 278,345 256,346 C 250,334 258,312 280,300 Z" fill={`url(#grad-leaf-dark-${uid})`} />
            </g>
          </g>

          {/* ========================================================================= */}
          {/* 2. HEAVY CIRCULAR GOLD MEDALLION FRAME (VIỀN HUY CHƯƠNG VÀNG HOÀNG GIA) */}
          {/* ========================================================================= */}
          <g id="circular-medallion" filter={`url(#filter-glow-${uid})`}>
            {/* Outermost Beveled Ring */}
            <circle
              cx="200"
              cy="190"
              r="104"
              fill="none"
              stroke={`url(#grad-metal-diag-${uid})`}
              strokeWidth="16"
            />

            {/* Inset Specular Gold Ring */}
            <circle
              cx="200"
              cy="190"
              r="96"
              fill="none"
              stroke={`url(#grad-metal-rev-${uid})`}
              strokeWidth="4"
            />

            {/* Fine Engraved Inner Line */}
            <circle
              cx="200"
              cy="190"
              r="89"
              fill="none"
              stroke={theme.stops.g0}
              strokeWidth="1.5"
              opacity="0.85"
            />

            {/* Background disc inside photo frame */}
            <circle
              cx="200"
              cy="190"
              r="86"
              fill={`url(#grad-inner-disc-${uid})`}
            />
          </g>

          {/* ========================================================================= */}
          {/* 3. STUDENT AVATAR / PHOTO DISPLAY WITH REFLECTION HIGHLIGHT */}
          {/* ========================================================================= */}
          {avatarUrl ? (
            <g clipPath={`url(#avatar-clip-${uid})`}>
              <image
                href={avatarUrl}
                x="114"
                y="104"
                width="172"
                height="172"
                preserveAspectRatio="xMidYMid slice"
              />
              {/* Realistic glossy reflection on avatar */}
              <path
                d="M 114,140 C 150,110 240,110 286,140 L 286,104 L 114,104 Z"
                fill="url(#grad-leaf-light-gold-1-lg)"
                fillOpacity="0.15"
              />
            </g>
          ) : (
            <g clipPath={`url(#avatar-clip-${uid})`}>
              <rect x="114" y="104" width="172" height="172" fill="#1E293B" />
              <text
                x="200"
                y="205"
                textAnchor="middle"
                fill={theme.stops.g1}
                fontSize="48"
                fontWeight="900"
                fontFamily="sans-serif"
              >
                {studentName.charAt(0)}
              </text>
            </g>
          )}

          {/* Inner Medallion Rim Shadow */}
          <circle
            cx="200"
            cy="190"
            r="86"
            fill="none"
            stroke={theme.stops.darkFold}
            strokeWidth="3"
            opacity="0.6"
          />

          {/* ========================================================================= */}
          {/* 4. IMPERIAL GOLDEN CROWN ON TOP (VƯƠNG MIỆN VÀNG HOÀNG GIA 5 CHÓP) */}
          {/* ========================================================================= */}
          {showCrown && (
            <g id="imperial-crown" filter={`url(#filter-glow-${uid})`}>
              {/* Crown Base Curved Band */}
              <path
                d="M 148,80 C 175,74 225,74 252,80 L 254,90 C 225,84 175,84 146,90 Z"
                fill={`url(#grad-metal-diag-${uid})`}
                stroke={theme.stops.darkFold}
                strokeWidth="1"
              />

              {/* Crown Base Gemstones Inset */}
              <circle cx="165" cy="83" r="2.5" fill={`url(#grad-pearl-${uid})`} />
              <circle cx="182" cy="80" r="3" fill={`url(#grad-pearl-${uid})`} />
              <circle cx="200" cy="79" r="3.5" fill={`url(#grad-pearl-${uid})`} />
              <circle cx="218" cy="80" r="3" fill={`url(#grad-pearl-${uid})`} />
              <circle cx="235" cy="83" r="2.5" fill={`url(#grad-pearl-${uid})`} />

              {/* 5 Crown Peaks (3D Embossed Spikes) */}
              {/* Main Body */}
              <path
                d="M 146,80 
                   L 142,48 
                   L 165,65 
                   L 180,34 
                   L 200,58 
                   L 220,34 
                   L 235,65 
                   L 258,48 
                   L 254,80 
                   C 225,74 175,74 146,80 Z"
                fill={`url(#grad-metal-diag-${uid})`}
                stroke={theme.stops.darkFold}
                strokeWidth="1.5"
              />

              {/* Center Specular Ridge Highlights on Spikes */}
              <path d="M 200,20 L 200,58" stroke={theme.stops.g0} strokeWidth="2" strokeLinecap="round" />
              <path d="M 180,34 L 180,60" stroke={theme.stops.g0} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 220,34 L 220,60" stroke={theme.stops.g0} strokeWidth="1.5" strokeLinecap="round" />

              {/* 5 Round Golden Pearl Jewels on Spikes Tips */}
              {/* Center Tallest Peak */}
              <circle cx="200" cy="20" r="7.5" fill={`url(#grad-pearl-${uid})`} stroke={theme.stops.darkFold} strokeWidth="1" />
              <circle cx="198" cy="18" r="2.5" fill="#FFFFFF" opacity="0.9" />

              {/* Mid-Left Peak */}
              <circle cx="180" cy="34" r="5.5" fill={`url(#grad-pearl-${uid})`} stroke={theme.stops.darkFold} strokeWidth="0.8" />
              
              {/* Mid-Right Peak */}
              <circle cx="220" cy="34" r="5.5" fill={`url(#grad-pearl-${uid})`} stroke={theme.stops.darkFold} strokeWidth="0.8" />

              {/* Outer Left Peak */}
              <circle cx="142" cy="48" r="4.5" fill={`url(#grad-pearl-${uid})`} stroke={theme.stops.darkFold} strokeWidth="0.8" />

              {/* Outer Right Peak */}
              <circle cx="258" cy="48" r="4.5" fill={`url(#grad-pearl-${uid})`} stroke={theme.stops.darkFold} strokeWidth="0.8" />
            </g>
          )}

          {/* ========================================================================= */}
          {/* 5. 3D CURVED GOLDEN RIBBON BANNER (DẢI RUY BĂNG LỤA VÀNG UỐN LƯỢN 3D) */}
          {/* ========================================================================= */}
          <g id="ribbon-banner" filter={`url(#filter-glow-${uid})`}>
            
            {/* Crossed Ribbon Ties Underneath */}
            <path
              d="M 180,330 Q 150,365 130,370 Q 155,360 175,340 Z"
              fill={`url(#grad-leaf-dark-${uid})`}
            />
            <path
              d="M 220,330 Q 250,365 270,370 Q 245,360 225,340 Z"
              fill={`url(#grad-leaf-dark-${uid})`}
            />

            {/* Left Fishtail Ribbon Back Wing */}
            <path
              d="M 85,320 
                 L 40,325 
                 L 60,345 
                 L 35,365 
                 L 95,355 
                 L 110,325 Z"
              fill={`url(#grad-ribbon-tail-${uid})`}
              stroke={theme.stops.darkFold}
              strokeWidth="1"
            />

            {/* Right Fishtail Ribbon Back Wing */}
            <path
              d="M 315,320 
                 L 360,325 
                 L 340,345 
                 L 365,365 
                 L 305,355 
                 L 290,325 Z"
              fill={`url(#grad-ribbon-tail-${uid})`}
              stroke={theme.stops.darkFold}
              strokeWidth="1"
            />

            {/* Dark Fold Shadows Behind Main Banner */}
            <polygon points="90,316 112,324 95,355" fill={theme.stops.darkFold} />
            <polygon points="310,316 288,324 305,355" fill={theme.stops.darkFold} />

            {/* Main Center Curved Banner (Thân Ruy Băng Vàng 3D Lấp Lánh) */}
            <path
              d="M 82,312 
                 Q 200,288 318,312 
                 L 308,358 
                 Q 200,335 92,358 Z"
              fill={`url(#grad-ribbon-front-${uid})`}
              stroke={`url(#grad-metal-rev-${uid})`}
              strokeWidth="2"
            />

            {/* Top & Bottom Gold Inset Bevel Lines */}
            <path
              d="M 85,316 Q 200,292 315,316"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              opacity="0.9"
            />
            <path
              d="M 94,354 Q 200,332 306,354"
              fill="none"
              stroke={theme.stops.darkFold}
              strokeWidth="1.2"
              opacity="0.7"
            />

            {/* Ribbon Label Text (TÊN HỌC VIÊN HOẶC DANH HIỆU VINH DANH) */}
            <text
              x="200"
              y="336"
              textAnchor="middle"
              fill={theme.id === 'gold' ? '#2A1200' : theme.id === 'silver' ? '#0F172A' : '#2D0800'}
              fontSize={calculatedRibbonFontSize + 3}
              fontWeight="900"
              fontFamily="system-ui, -apple-system, 'Be Vietnam Pro', 'Montserrat', 'Segoe UI', Roboto, sans-serif"
              letterSpacing="0.5"
              style={{
                fontFamily: "system-ui, -apple-system, 'Be Vietnam Pro', 'Montserrat', 'Segoe UI', Roboto, sans-serif",
                fontWeight: 900,
                textTransform: 'uppercase',
                textRendering: 'geometricPrecision'
              }}
            >
              {rawRibbonText}
            </text>
          </g>

          {/* ========================================================================= */}
          {/* 6. SUBTITLE TEXT BELOW BANNER (DÒNG CHỮ VINH DANH PHÍA DƯỚI NHƯ MẪU) */}
          {/* ========================================================================= */}
          <text
            x="200"
            y="395"
            textAnchor="middle"
            fill={theme.subTextFill}
            fontSize={sizeConfig.subTitleFontSize + 3}
            fontWeight="800"
            fontFamily="system-ui, -apple-system, 'Be Vietnam Pro', 'Montserrat', 'Segoe UI', Roboto, sans-serif"
            letterSpacing="0.6"
            style={{
              fontFamily: "system-ui, -apple-system, 'Be Vietnam Pro', 'Montserrat', 'Segoe UI', Roboto, sans-serif",
              fontWeight: 800,
              textRendering: 'geometricPrecision'
            }}
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
          >
            {theme.defaultSubTitle}
          </text>

          {/* Sparkling golden wave dust at bottom */}
          <path
            d="M 40,418 Q 200,398 360,418"
            fill="none"
            stroke={`url(#grad-metal-diag-${uid})`}
            strokeWidth="1.5"
            strokeDasharray="6 3 2 3"
            opacity="0.75"
          />
        </svg>
      </div>

    </div>
  );
};
