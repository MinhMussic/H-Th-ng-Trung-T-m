import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Sunrise, 
  SunMedium, 
  Coffee, 
  Sunset, 
  Moon, 
  Sparkles, 
  Music, 
  RefreshCw, 
  Clock, 
  Smile, 
  Heart,
  Calendar
} from 'lucide-react';
import { getTimeGreeting, getRandomWish, formatVietnameseDate, TimeGreetingData } from '../../utils/greetingHelper';

interface RealtimeGreetingCardProps {
  userName?: string;
  className?: string;
  variant?: 'banner' | 'card' | 'compact';
  showClock?: boolean;
}

export const RealtimeGreetingCard: React.FC<RealtimeGreetingCardProps> = ({
  userName,
  className = '',
  variant = 'card',
  showClock = true
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [greetingData, setGreetingData] = useState<TimeGreetingData>(() => getTimeGreeting(new Date()));
  const [activeWish, setActiveWish] = useState<string>(() => {
    const greeting = getTimeGreeting(new Date());
    return greeting.defaultWishes[0] || getRandomWish();
  });
  const [isRotatingWish, setIsRotatingWish] = useState(false);

  // Live timer update every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(now);
      // Update greeting period if hour changed
      setGreetingData(getTimeGreeting(now));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefreshWish = () => {
    setIsRotatingWish(true);
    const newWish = getRandomWish(activeWish);
    setActiveWish(newWish);
    setTimeout(() => setIsRotatingWish(false), 400);
  };

  const { dayOfWeek, dateFormatted, timeFormatted } = formatVietnameseDate(currentDate);

  const renderIcon = (type: TimeGreetingData['iconType']) => {
    switch (type) {
      case 'sunrise':
        return <Sunrise className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />;
      case 'sun-medium':
        return <SunMedium className="w-5 h-5 text-yellow-500" />;
      case 'coffee':
        return <Coffee className="w-5 h-5 text-orange-500" />;
      case 'sunset':
        return <Sunset className="w-5 h-5 text-indigo-400" />;
      case 'moon':
        return <Moon className="w-5 h-5 text-indigo-300" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`p-3 rounded-2xl bg-gradient-to-r ${greetingData.gradientBg} border backdrop-blur-md flex items-center justify-between gap-2.5 ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-xs flex items-center justify-center shrink-0">
            {renderIcon(greetingData.iconType)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {userName ? `Chào ${userName}!` : greetingData.periodLabel}
              </span>
              {showClock && (
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                  • {timeFormatted}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[280px]">
              {activeWish}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefreshWish}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
          title="Đổi lời chúc vui vẻ khác"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRotatingWish ? 'animate-spin' : ''}`} />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${greetingData.gradientBg} border p-4 sm:p-5 shadow-lg backdrop-blur-md transition-all duration-300 ${className}`}>
      
      {/* Decorative ambient background shape */}
      <div 
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
        style={{ backgroundColor: greetingData.accentColor }}
      />

      {/* Top Row: Period Badge, Real-time Clock & Date */}
      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
        
        {/* Period badge */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-xl bg-white/90 dark:bg-slate-900/90 shadow-xs flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-800/60">
            {renderIcon(greetingData.iconType)}
          </div>
          <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs ${greetingData.badgeBg} ${greetingData.badgeText}`}>
            {greetingData.periodLabel}
          </span>
        </div>

        {/* Real-time Digital Clock & Calendar Date */}
        {showClock && (
          <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 px-3 py-1 rounded-full border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
            <span className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{dayOfWeek}</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1 font-mono text-xs font-black text-amber-700 dark:text-amber-400">
              <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>{timeFormatted}</span>
            </span>
          </div>
        )}
      </div>

      {/* Greeting Title */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black font-heading tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
          <span>{userName ? `Chào ${userName}! ${greetingData.greetingTitle.slice(5)}` : greetingData.greetingTitle}</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          {greetingData.greetingSubtitle}
        </p>
      </div>

      {/* Joyful Wish & Mood Booster Box */}
      <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-start sm:items-center justify-between gap-3 bg-white/60 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xs">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Music className="w-3.5 h-3.5 animate-bounce" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <Smile className="w-3 h-3 text-amber-500" />
              <span>Lời chúc vui vẻ hôm nay</span>
            </div>
            <p className={`text-xs text-slate-800 dark:text-slate-200 font-medium mt-0.5 leading-snug transition-all ${isRotatingWish ? 'opacity-30 scale-98' : 'opacity-100 scale-100'}`}>
              {activeWish}
            </p>
          </div>
        </div>

        {/* Refresh wish button */}
        <button
          type="button"
          onClick={handleRefreshWish}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold shadow-2xs transition-all shrink-0 cursor-pointer"
          title="Bấm để đổi một lời chúc vui vẻ khác"
        >
          <RefreshCw className={`w-3 h-3 text-amber-500 ${isRotatingWish ? 'animate-spin' : ''}`} />
          <span className="hidden xs:inline">Đổi lời chúc</span>
        </button>
      </div>
    </div>
  );
};
