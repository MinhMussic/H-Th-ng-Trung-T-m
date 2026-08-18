import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type SoundTheme = 'piano' | 'marimba' | 'modern_pop' | 'gentle_chime';
export type AmbientTrackId = string;

export interface AmbientTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  tempoBpm?: number;
  description?: string;
  audioUrl?: string;
  isCustom?: boolean;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'piano_calm',
    title: 'Giai Điệu Piano Thư Thái',
    artist: 'Minh Music Studio',
    genre: 'Piano Solo / Ambient',
    tempoBpm: 68,
    description: 'Tiếng đàn piano êm dịu giúp học viên và giáo viên tập trung.'
  },
  {
    id: 'classical_nocturne',
    title: 'Dạ Khúc Cổ Điển Ban Đêm',
    artist: 'Minh Music Academy',
    genre: 'Classical / Strings',
    tempoBpm: 72,
    description: 'Hòa âm cổ điển giao hưởng nhẹ nhàng mang lại cảm hứng nghệ thuật.'
  },
  {
    id: 'lofi_acoustic',
    title: 'Lo-Fi Acoustic Guitar & Beat',
    artist: 'Minh Music Chill',
    genre: 'Lo-Fi / Guitar',
    tempoBpm: 80,
    description: 'Âm hưởng guitar mộc ấm áp kết hợp giai điệu thư giãn.'
  },
  {
    id: 'gentle_breeze',
    title: 'Gió Thoảng Bên Cung Đàn',
    artist: 'Minh Music Ambient',
    genre: 'Ambient Soundscape',
    tempoBpm: 60,
    description: 'Không gian âm thanh êm dịu tựa làn gió sớm tại phòng hòa nhạc.'
  },
  {
    id: 'joyful_melody',
    title: 'Khúc Ca Vui Tươi Rộn Rã',
    artist: 'Minh Music Kids & Youth',
    genre: 'Acoustic Pop',
    tempoBpm: 92,
    description: 'Giai điệu vui tươi, tràn đầy năng lượng cho các giờ học năng khiếu.'
  }
];

interface SoundContextType {
  // Click Sounds
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  soundVolume: number;
  setSoundVolume: (vol: number) => void;
  soundTheme: SoundTheme;
  setSoundTheme: (theme: SoundTheme) => void;
  playClickSound: (pitchOffset?: number) => void;
  playSuccessSound: () => void;
  playRewardSound: () => void;
  playChimeSound: () => void;
  playToggleSound: () => void;

  // Background Music
  isMusicPlaying: boolean;
  setIsMusicPlaying: (playing: boolean) => void;
  toggleMusic: () => void;
  musicVolume: number;
  setMusicVolume: (vol: number) => void;
  currentTrackId: string;
  currentTrack: AmbientTrack;
  setCurrentTrackId: (id: string) => void;
  nextTrack: () => void;
  prevTrack: () => void;

  // Custom Tracks & Playlist
  customTracks: AmbientTrack[];
  allTracks: AmbientTrack[];
  addCustomTrack: (track: Omit<AmbientTrack, 'id' | 'isCustom'>) => void;
  removeCustomTrack: (id: string) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings State
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('minh_music_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [soundVolume, setSoundVolume] = useState<number>(() => {
    const saved = localStorage.getItem('minh_music_sound_volume');
    return saved ? Number(saved) : 0.4;
  });

  const [soundTheme, setSoundTheme] = useState<SoundTheme>(() => {
    const saved = localStorage.getItem('minh_music_sound_theme') as SoundTheme;
    return saved || 'piano';
  });

  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(() => {
    const saved = localStorage.getItem('minh_music_bg_playing');
    return saved === 'true';
  });

  const [musicVolume, setMusicVolume] = useState<number>(() => {
    const saved = localStorage.getItem('minh_music_bg_volume');
    return saved ? Number(saved) : 0.25;
  });

  const [currentTrackId, setCurrentTrackId] = useState<string>(() => {
    const saved = localStorage.getItem('minh_music_bg_track');
    return saved || 'piano_calm';
  });

  const [customTracks, setCustomTracks] = useState<AmbientTrack[]>(() => {
    try {
      const saved = localStorage.getItem('minh_music_custom_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const allTracks: AmbientTrack[] = [
    ...AMBIENT_TRACKS,
    ...customTracks.map(t => ({ ...t, isCustom: true }))
  ];

  const currentTrack: AmbientTrack = allTracks.find(t => t.id === currentTrackId) || AMBIENT_TRACKS[0];

  const addCustomTrack = (trackData: Omit<AmbientTrack, 'id' | 'isCustom'>) => {
    const newTrack: AmbientTrack = {
      ...trackData,
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      isCustom: true
    };
    setCustomTracks(prev => {
      const updated = [newTrack, ...prev];
      localStorage.setItem('minh_music_custom_tracks', JSON.stringify(updated));
      return updated;
    });
    setCurrentTrackId(newTrack.id);
  };

  const removeCustomTrack = (id: string) => {
    setCustomTracks(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('minh_music_custom_tracks', JSON.stringify(updated));
      return updated;
    });
    if (currentTrackId === id) {
      setCurrentTrackId(AMBIENT_TRACKS[0].id);
    }
  };

  // Audio element reference for custom external/uploaded tracks
  const customAudioRef = useRef<HTMLAudioElement | null>(null);

  // Web Audio Context References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicGainNodeRef = useRef<GainNode | null>(null);
  const soundGainNodeRef = useRef<GainNode | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const isSynthRunningRef = useRef(false);

  // Initialize or get AudioContext
  const getAudioContext = (): AudioContext | null => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
      return null;
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('minh_music_sound_enabled', String(isSoundEnabled));
  }, [isSoundEnabled]);

  useEffect(() => {
    localStorage.setItem('minh_music_sound_volume', String(soundVolume));
    if (soundGainNodeRef.current && audioCtxRef.current) {
      soundGainNodeRef.current.gain.setTargetAtTime(soundVolume, audioCtxRef.current.currentTime, 0.05);
    }
  }, [soundVolume]);

  useEffect(() => {
    localStorage.setItem('minh_music_sound_theme', soundTheme);
  }, [soundTheme]);

  useEffect(() => {
    localStorage.setItem('minh_music_bg_playing', String(isMusicPlaying));
  }, [isMusicPlaying]);

  useEffect(() => {
    localStorage.setItem('minh_music_bg_volume', String(musicVolume));
    if (musicGainNodeRef.current && audioCtxRef.current) {
      musicGainNodeRef.current.gain.setTargetAtTime(musicVolume, audioCtxRef.current.currentTime, 0.1);
    }
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem('minh_music_bg_track', currentTrackId);
  }, [currentTrackId]);

  // ----------------------------------------------------
  // SOUND SYNTHESIS ENGINE (Click & FX)
  // ----------------------------------------------------

  const playClickSound = (pitchOffset = 0) => {
    if (!isSoundEnabled || soundVolume <= 0) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Master sound gain
      gain.gain.setValueAtTime(0.0001, now);

      if (soundTheme === 'piano') {
        // Acoustic piano-like bell harmonic
        const baseFreq = 523.25 * Math.pow(2, pitchOffset / 12); // C5
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.99, now + 0.12);

        gain.gain.exponentialRampToValueAtTime(0.3 * soundVolume, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        // Overtone
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(baseFreq * 2, now);
        gain2.gain.setValueAtTime(0.12 * soundVolume, now);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.09);
      } else if (soundTheme === 'marimba') {
        // Wooden marimba knock
        const baseFreq = 440 * Math.pow(2, pitchOffset / 12);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        gain.gain.exponentialRampToValueAtTime(0.4 * soundVolume, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
      } else if (soundTheme === 'modern_pop') {
        // Crisp bubbly pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600 + pitchOffset * 30, now);
        osc.frequency.exponentialRampToValueAtTime(1200 + pitchOffset * 30, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.35 * soundVolume, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      } else {
        // Gentle metallic chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880 * Math.pow(2, pitchOffset / 12), now);
        gain.gain.exponentialRampToValueAtTime(0.25 * soundVolume, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {
      console.warn('Error playing click sound:', e);
    }
  };

  const playSuccessSound = () => {
    if (!isSoundEnabled || soundVolume <= 0) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.28 * soundVolume, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.26);
      });
    } catch (e) {
      console.warn('Error playing success sound:', e);
    }
  };

  const playRewardSound = () => {
    if (!isSoundEnabled || soundVolume <= 0) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Joyful fan-fare: G5 -> C6 -> E6 -> G6
      const notes = [783.99, 1046.50, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.35 * soundVolume, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.36);
      });
    } catch (e) {
      console.warn('Error playing reward sound:', e);
    }
  };

  const playChimeSound = () => {
    if (!isSoundEnabled || soundVolume <= 0) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 880.00]; // E5 -> A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.25 * soundVolume, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteStart);
        osc.stop(noteStart + 0.42);
      });
    } catch (e) {
      console.warn('Error playing chime sound:', e);
    }
  };

  const playToggleSound = () => {
    playClickSound(3);
  };

  // ----------------------------------------------------
  // PROCEDURAL AMBIENT BACKGROUND MUSIC ENGINE
  // (Synthesizes soothing piano chords, calming scales, lo-fi pads)
  // ----------------------------------------------------

  const playHarmonicNote = (ctx: AudioContext, masterGain: GainNode, freq: number, duration: number, delay: number, type: OscillatorType = 'triangle', vel = 0.15) => {
    try {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      // Gentle attack & warm decay
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vel, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(vel * 0.4, now + duration * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (!isMusicPlaying) {
      if (musicTimerRef.current) {
        clearInterval(musicTimerRef.current);
        musicTimerRef.current = null;
      }
      isSynthRunningRef.current = false;
      return;
    }

    // Check if playing a custom track with audioUrl
    if (currentTrack?.audioUrl) {
      if (musicTimerRef.current) {
        clearInterval(musicTimerRef.current);
        musicTimerRef.current = null;
      }
      isSynthRunningRef.current = false;

      if (!customAudioRef.current) {
        customAudioRef.current = new Audio(currentTrack.audioUrl);
        customAudioRef.current.loop = true;
      } else {
        customAudioRef.current.src = currentTrack.audioUrl;
      }
      customAudioRef.current.volume = musicVolume;
      customAudioRef.current.play().catch(e => console.warn('Custom audio playback error:', e));

      return () => {
        if (customAudioRef.current) {
          customAudioRef.current.pause();
        }
      };
    } else {
      // Pause any custom audio element if switching to synth track
      if (customAudioRef.current) {
        customAudioRef.current.pause();
      }
    }

    const ctx = getAudioContext();
    if (!ctx) return;

    if (!musicGainNodeRef.current) {
      musicGainNodeRef.current = ctx.createGain();
      musicGainNodeRef.current.gain.setValueAtTime(musicVolume, ctx.currentTime);
      musicGainNodeRef.current.connect(ctx.destination);
    } else {
      musicGainNodeRef.current.gain.setValueAtTime(musicVolume, ctx.currentTime);
    }

    isSynthRunningRef.current = true;
    let step = 0;

    // Chord progressions per track
    // Frequencies mapping (Hz)
    const C3 = 130.81, E3 = 164.81, F3 = 174.61, G3 = 196.00, A3 = 220.00, B3 = 246.94;
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;

    const trackChordMap: Record<string, number[][]> = {
      piano_calm: [
        [C4, E4, G4, C5],
        [A4, C5, E5],
        [F4, A4, C5],
        [G4, B4, D5]
      ],
      classical_nocturne: [
        [C3, G3, E4, B4],
        [A3, E4, C5, E5],
        [F3, C4, A4, C5],
        [G3, D4, B4, D5]
      ],
      lofi_acoustic: [
        [D4, F4, A4, C5],
        [G3, B3, D4, F4],
        [C4, E4, G4, B4],
        [A3, C4, E4, G4]
      ],
      gentle_breeze: [
        [C4, G4, D5],
        [F4, C5, G5],
        [A4, E5, B4],
        [G4, D5, A5]
      ],
      joyful_melody: [
        [C4, E4, G4, C5],
        [F4, A4, C5, F5],
        [G4, B4, D5, G5],
        [C4, G4, E5, C5]
      ]
    };

    const playAmbientBar = () => {
      if (!isSynthRunningRef.current || !ctx || !musicGainNodeRef.current) return;
      const chords = trackChordMap[currentTrackId] || trackChordMap.piano_calm;
      const chord = chords[step % chords.length];
      const master = musicGainNodeRef.current;

      // Play rich chord arpeggio
      chord.forEach((freq, idx) => {
        playHarmonicNote(
          ctx,
          master,
          freq,
          2.6,
          idx * 0.35,
          currentTrackId === 'classical_nocturne' ? 'sine' : 'triangle',
          0.18
        );
      });

      // Subtle soft bass note
      const bassFreq = chord[0] / 2;
      playHarmonicNote(ctx, master, bassFreq, 3.2, 0, 'sine', 0.22);

      // Random gentle melody embellishment on higher octave
      if (step % 2 === 0) {
        const melodyNote = chord[Math.floor(Math.random() * chord.length)] * 2;
        playHarmonicNote(ctx, master, melodyNote, 1.8, 1.2, 'sine', 0.12);
      }

      step++;
    };

    // Run first bar immediately, then loop
    playAmbientBar();
    const intervalMs = currentTrackId === 'joyful_melody' ? 2400 : 3200;
    musicTimerRef.current = window.setInterval(playAmbientBar, intervalMs);

    return () => {
      if (musicTimerRef.current) {
        clearInterval(musicTimerRef.current);
        musicTimerRef.current = null;
      }
    };
  }, [isMusicPlaying, currentTrackId, currentTrack, musicVolume]);

  // ----------------------------------------------------
  // GLOBAL CLICK INTERCEPTOR (Sound on any user action)
  // ----------------------------------------------------
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      // AudioContext requires user gesture to resume
      getAudioContext();

      if (!isSoundEnabled) return;

      // Check if target or its parents are interactive
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, input, select, textarea, [role="button"], [role="tab"], .cursor-pointer');
      if (interactive) {
        // Subtle pitch variation based on element type
        if (interactive.tagName === 'BUTTON') {
          playClickSound(Math.floor(Math.random() * 3));
        } else if (interactive.getAttribute('role') === 'tab') {
          playClickSound(4);
        } else {
          playClickSound(1);
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, { passive: true });
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [isSoundEnabled, soundTheme, soundVolume]);

  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    if (next) playSuccessSound();
  };

  const toggleMusic = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    const next = !isMusicPlaying;
    setIsMusicPlaying(next);
    if (next && isSoundEnabled) {
      playSuccessSound();
    }
  };

  const nextTrack = () => {
    const currentIndex = allTracks.findIndex(t => t.id === currentTrackId);
    const nextIndex = (currentIndex + 1) % allTracks.length;
    setCurrentTrackId(allTracks[nextIndex].id);
    playClickSound(2);
  };

  const prevTrack = () => {
    const currentIndex = allTracks.findIndex(t => t.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + allTracks.length) % allTracks.length;
    setCurrentTrackId(allTracks[prevIndex].id);
    playClickSound(0);
  };

  return (
    <SoundContext.Provider
      value={{
        isSoundEnabled,
        setIsSoundEnabled,
        toggleSound,
        soundVolume,
        setSoundVolume,
        soundTheme,
        setSoundTheme,
        playClickSound,
        playSuccessSound,
        playRewardSound,
        playChimeSound,
        playToggleSound,
        isMusicPlaying,
        setIsMusicPlaying,
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
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
