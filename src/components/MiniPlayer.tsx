import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Music,
  Sliders
} from 'lucide-react';
import { Track } from '../types/player';
import { VintageCassetteLogo } from './VintageCassetteLogo';

interface MiniPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
  currentTime: number;
  duration: number;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestoreFullWindow: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onSeek,
  currentTime,
  duration,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  onRestoreFullWindow
}) => {
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 glass-panel rounded-2xl shadow-2xl border border-white/20 p-3 select-none animate-in slide-in-from-bottom-5 duration-300 tile-hover-gradient">
      {/* Top row: Track details & expand */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center shadow-md border border-white/15 overflow-hidden relative"
            style={{ background: currentTrack?.coverGradient || '#1e293b' }}
          >
            {currentTrack?.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Music className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-white truncate">
              {currentTrack?.title || 'No Track'}
            </span>
            <span className="block text-[11px] text-white/50 truncate">
              {currentTrack?.artist || 'Idle'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <VintageCassetteLogo size={16} isPlaying={isPlaying} />
          <button
            onClick={onRestoreFullWindow}
            className="p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            title="Restore Full Player Window"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrub Bar */}
      <div className="flex items-center gap-2 my-1.5">
        <span className="text-[10px] font-mono tabular-nums text-white/40">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-white/15 rounded-full cursor-pointer appearance-none"
          style={{
            background: `linear-gradient(to right, var(--theme-c1, #38bdf8) 0%, var(--theme-c2, #a855f7) ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`
          }}
        />
        <span className="text-[10px] font-mono tabular-nums text-white/40">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onPrev}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Previous"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-7 h-7 rounded-full bg-white text-slate-950 hover:bg-white/90 flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 fill-current" />
            ) : (
              <Play className="w-3 h-3 fill-current ml-0.5" />
            )}
          </button>
          <button
            onClick={onNext}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Next"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mini Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMute}
            className="text-white/50 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3 h-3 text-rose-400" />
            ) : (
              <Volume2 className="w-3 h-3" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16"
          />
        </div>
      </div>
    </div>
  );
};
