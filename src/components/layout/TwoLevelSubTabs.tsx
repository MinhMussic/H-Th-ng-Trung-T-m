import React, { useRef, useEffect } from 'react';
import { MainMenuItem, SubMenuItem } from '../../config/navigationData';
import { Sparkles, ChevronRight, Layers } from 'lucide-react';

interface TwoLevelSubTabsProps {
  mainNavConfig: MainMenuItem[];
  activeMainMenu: string;
  activeSubMenu: string;
  onSelectMainMenu: (mainId: string) => void;
  onSelectSubMenu: (subId: string) => void;
  titlePrefix?: string;
  className?: string;
}

export const TwoLevelSubTabs: React.FC<TwoLevelSubTabsProps> = ({
  mainNavConfig,
  activeMainMenu,
  activeSubMenu,
  onSelectMainMenu,
  onSelectSubMenu,
  titlePrefix = 'Menu Chức Năng',
  className = ''
}) => {
  const currentMain = mainNavConfig.find(m => m.id === activeMainMenu) || mainNavConfig[0];
  const currentSub = currentMain?.subItems?.find(s => s.id === activeSubMenu) || currentMain?.subItems?.[0];
  const ribbonScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto reset horizontal ribbon scroll position to start (scrollLeft: 0) on main menu change
  useEffect(() => {
    if (ribbonScrollRef.current) {
      ribbonScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeMainMenu]);

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all ${className}`}>
      {/* 1. Header Toolbar with Synchronized Badge: "Đang mở: [Tên tab con]" */}
      <div className="px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentMain?.label || 'Chức năng'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Real-time synchronized badge */}
          <span 
            id="active-subtab-badge"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-extrabold border border-emerald-300/50 dark:border-emerald-700/50 truncate"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Đang mở: <strong>{currentSub?.label || currentSub?.shortLabel}</strong></span>
          </span>
        </div>

        {/* Short description on desktop */}
        {currentSub?.description && (
          <span className="hidden md:inline-block text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-sm">
            {currentSub.description}
          </span>
        )}
      </div>

      {/* 2. Horizontal Sub-Tabs: ONLY renders the sub-tabs of current activeMainMenu */}
      <div 
        ref={ribbonScrollRef}
        className="p-1.5 sm:p-2 bg-slate-100/70 dark:bg-slate-950/60 overflow-x-auto no-scrollbar touch-pan-x flex items-center gap-1.5 sm:gap-2 scroll-smooth"
      >
        {(currentMain?.subItems || []).map((sub) => {
          const Icon = sub.icon;
          const isActive = activeSubMenu === sub.id;

          return (
            <button
              key={sub.id}
              id={`subtab-${currentMain?.id || 'main'}-${sub.id}`}
              onClick={() => onSelectSubMenu(sub.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 min-h-[40px] select-none ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs scale-100'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800/80 active:scale-98'
              }`}
              title={sub.description || sub.label}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span>{sub.label}</span>
              
              {sub.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  isActive 
                    ? 'bg-white text-emerald-800' 
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {sub.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
