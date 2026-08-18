import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Clock, X, ChevronRight, Sparkles, MessageSquare, Star, Phone, UserCheck } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { PushNotificationPayload, PushNotificationResult } from '../../utils/pushNotification';

interface ActivePushItem {
  id: string;
  payload: PushNotificationPayload;
  formatted: PushNotificationResult;
  receivedAt: string;
}

export const InAppPushBanner: React.FC = () => {
  const [activeNotification, setActiveNotification] = useState<ActivePushItem | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { playChimeSound, playSuccessSound, isSoundEnabled } = useSound();

  useEffect(() => {
    const handlePushReceived = (e: Event) => {
      const customEvent = e as CustomEvent<ActivePushItem>;
      if (customEvent && customEvent.detail) {
        setActiveNotification(customEvent.detail);
        setIsExpanded(false);

        // Play chime or alert sound
        if (isSoundEnabled) {
          if (customEvent.detail.payload.status === 'absent_unexcused') {
            playChimeSound();
          } else {
            playSuccessSound();
          }
        }

        // Auto dismiss after 7.5 seconds if not expanded
        const timer = setTimeout(() => {
          setActiveNotification(prev => (prev?.id === customEvent.detail.id && !isExpanded ? null : prev));
        }, 7500);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('minh_music_push_received', handlePushReceived);
    return () => {
      window.removeEventListener('minh_music_push_received', handlePushReceived);
    };
  }, [playChimeSound, playSuccessSound, isSoundEnabled, isExpanded]);

  if (!activeNotification) return null;

  const { payload, formatted } = activeNotification;
  const isAlert = payload.status === 'absent_unexcused' || payload.status === 'absent_no_leave';
  const isPresent = payload.status === 'present' || payload.status === 'makeup';

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-[420px] transition-all animate-in slide-in-from-top-6 fade-in duration-300">
      <div 
        className={`rounded-2xl shadow-2xl border backdrop-blur-md transition-all overflow-hidden ${
          isAlert 
            ? 'bg-rose-950/95 text-white border-rose-600/80 shadow-rose-900/30' 
            : isPresent
            ? 'bg-slate-900/95 text-white border-emerald-500/60 shadow-emerald-950/30'
            : 'bg-slate-900/95 text-white border-amber-500/60 shadow-amber-950/30'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/10 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isAlert ? 'bg-rose-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                isAlert ? 'bg-rose-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <span className="text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 text-amber-300">
              <Bell className="w-3.5 h-3.5" />
              <span>THÔNG BÁO ĐẨY PHỤ HUYNH • MINH MUSIC</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">Vừa xong</span>
            <button
              onClick={() => setActiveNotification(null)}
              className="p-1 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
              isAlert 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                : isPresent
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}>
              {isAlert ? (
                <AlertTriangle className="w-5 h-5" />
              ) : isPresent ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black text-white leading-snug break-words">
                {formatted.title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-amber-400">{payload.studentName}</span>
                <span>•</span>
                <span className="text-slate-300">{payload.className}</span>
                <span>•</span>
                <span className="font-bold text-emerald-400">
                  {payload.starsAwarded > 0 ? `+${payload.starsAwarded}⭐` : `${payload.starsAwarded}⭐`}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Details Preview */}
          <div className="p-3 bg-black/30 rounded-xl border border-white/10 text-xs space-y-1.5 text-slate-200">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Người xác nhận:</span>
              <span className="font-bold text-amber-300">{payload.verifiedBy || payload.recordedBy}</span>
            </div>
            {payload.guardianName && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Gửi tới Phụ huynh:</span>
                <span className="font-bold text-white">{payload.guardianName} ({payload.guardianPhone || 'App Push'})</span>
              </div>
            )}
            {(payload.evaluation || payload.note) && (
              <div className="pt-1.5 border-t border-white/10 text-[11px]">
                <span className="text-slate-400 block mb-0.5">Lời nhắn giáo viên:</span>
                <p className="italic text-amber-200/90 font-medium">"{payload.evaluation || payload.note}"</p>
              </div>
            )}
          </div>

          {/* Collapsible Full Message */}
          {isExpanded && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs whitespace-pre-line text-slate-200 leading-relaxed max-h-48 overflow-y-auto">
              {formatted.body}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isExpanded ? 'Thu gọn tin nhắn' : 'Xem nội dung tin nhắn đầy đủ'}</span>
            </button>

            <button
              onClick={() => setActiveNotification(null)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-xl font-black text-xs transition-all cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
