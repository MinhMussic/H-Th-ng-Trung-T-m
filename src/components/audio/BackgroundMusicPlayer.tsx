import React, { useState } from 'react';
import { useSound, AMBIENT_TRACKS, SoundTheme } from '../../context/SoundContext';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack, 
  Music, 
  Sparkles, 
  Sliders, 
  Volume1, 
  ChevronUp, 
  ChevronDown, 
  Disc3, 
  Headphones, 
  Radio, 
  Waves,
  MousePointerClick,
  X
} from 'lucide-react';

export const BackgroundMusicPlayer: React.FC = () => {
  const {
    isMusicPlaying,
    toggleMusic,
    musicVolume,
    setMusicVolume,
    currentTrackId,
    currentTrack,
    setCurrentTrackId,
    nextTrack,
    prevTrack,
    isSoundEnabled,
    toggleSound,
    soundVolume,
    setSoundVolume,
    soundTheme,
    setSoundTheme,
    playClickSound,
    playSuccessSound
  } = useSound();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <aside 
      aria-label="Trình phát nhạc nền và cài đặt âm thanh"
      className="fixed bottom-4 left-4 z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* 1. EXPANDED FULL AUDIO STUDIO MODAL / CARD */}
      {isExpanded && (
        <div className="mb-3 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-4 sm:p-5 space-y-4 animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-2xl ${isMusicPlaying ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                <Disc3 className={`w-5 h-5 ${isMusicPlaying ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 font-heading">
                  Minh Music Studio Sound
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Âm thanh nền & Hiệu ứng click chuột
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title="Thu gọn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Track Visualizer Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-indigo-500/10 dark:from-amber-950/40 dark:to-indigo-950/40 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold uppercase">
                {currentTrack.genre}
              </span>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isMusicPlaying ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {currentTrack.tempoBpm} BPM
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              <h5 className="font-black text-sm text-slate-900 dark:text-white font-heading truncate">
                {currentTrack.title}
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                {currentTrack.artist}
              </p>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {currentTrack.description}
            </p>

            {/* Sound Wave Animation */}
            <div className="h-6 flex items-center justify-center gap-1 pt-1">
              {[0.4, 0.9, 0.6, 1, 0.7, 0.3, 0.8, 0.5, 0.9, 0.4].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isMusicPlaying 
                      ? 'bg-gradient-to-t from-amber-500 to-orange-400' 
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  style={{
                    height: isMusicPlaying ? `${Math.max(4, h * 22)}px` : '4px',
                    animation: isMusicPlaying ? `bounce 1s infinite ${i * 0.1}s alternate` : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Music Playback Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={prevTrack}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                title="Bài trước"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={toggleMusic}
                className={`p-3.5 rounded-2xl font-black text-white shadow-lg transition-all cursor-pointer transform hover:scale-105 active:scale-95 ${
                  isMusicPlaying
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30'
                    : 'bg-slate-900 dark:bg-amber-600 shadow-slate-900/20'
                }`}
                title={isMusicPlaying ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
              >
                {isMusicPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
              </button>

              <button
                onClick={nextTrack}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                title="Bài tiếp theo"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Music Volume Slider */}
            <div className="flex items-center gap-2.5 px-2">
              <button
                onClick={() => setMusicVolume(musicVolume > 0 ? 0 : 0.25)}
                className="text-slate-500 dark:text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
              >
                {musicVolume === 0 ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-8 text-right">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>

          {/* Track Selection Pills */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Music className="w-3 h-3 text-amber-500" />
              <span>Danh sách bài nhạc nền:</span>
            </span>
            <div className="grid grid-cols-1 gap-1 max-h-28 overflow-y-auto pr-1">
              {AMBIENT_TRACKS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setCurrentTrackId(t.id);
                    if (!isMusicPlaying) toggleMusic();
                    playClickSound(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    currentTrackId === t.id
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{t.title}</span>
                  {currentTrackId === t.id && isMusicPlaying && (
                    <span className="text-[10px] font-mono animate-pulse">Đang phát ♫</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. CLICK SOUND FX SETTINGS TOGGLE */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                    Âm thanh khi Click chuột
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Hiệu ứng nốt nhạc tương tác cho nút & menu
                  </p>
                </div>
              </div>

              <button
                onClick={toggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isSoundEnabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                aria-label="Bật tắt âm thanh click"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                    isSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isSoundEnabled && (
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-150">
                {/* Sound theme selector */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Âm sắc:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'piano', label: 'Piano' },
                      { id: 'marimba', label: 'Mộc Cầm' },
                      { id: 'modern_pop', label: 'Pop' },
                      { id: 'gentle_chime', label: 'Chuông' }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => {
                          setSoundTheme(theme.id as SoundTheme);
                          playSuccessSound();
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                          soundTheme === theme.id
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Click volume */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Âm lượng click:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. COMPACT FLOATING BAR / PILL CONTROLLER */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-full border border-slate-200/90 dark:border-slate-800 shadow-xl ring-1 ring-black/5">
        
        {/* Play/Pause Button */}
        <button
          onClick={toggleMusic}
          className={`h-9 w-9 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-xs ${
            isMusicPlaying 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 ring-2 ring-amber-400/40' 
              : 'bg-slate-800 dark:bg-slate-700 hover:bg-amber-600'
          }`}
          title={isMusicPlaying ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền thư giãn'}
          aria-label={isMusicPlaying ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền'}
        >
          {isMusicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>

        {/* Track Info (Click to open studio) */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left max-w-[150px] sm:max-w-[200px]"
          title="Mở bảng điều khiển âm thanh & Nhạc nền"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate font-heading flex items-center gap-1">
              <Music className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate">{currentTrack.title}</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {isMusicPlaying ? '♫ Đang phát nhạc nền' : 'Nhạc nền: Tạm dừng'}
            </span>
          </div>

          <ChevronUp className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Next track button */}
        <button
          onClick={nextTrack}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          title="Bài tiếp theo"
          aria-label="Bài tiếp theo"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Click Sound Fast Toggle */}
        <button
          onClick={toggleSound}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isSoundEnabled 
              ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40' 
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isSoundEnabled ? 'Âm thanh click chuột: BẬT' : 'Âm thanh click chuột: TẮT'}
          aria-label="Bật tắt âm thanh click"
        >
          <MousePointerClick className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
