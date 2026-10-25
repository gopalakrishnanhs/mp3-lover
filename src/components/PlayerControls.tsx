import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Sliders, 
  FileText,
  FastForward,
  Rewind,
  Music
} from 'lucide-react';
import { ABRepeat, RepeatMode, Track } from '../types/player';

interface PlayerControlsProps {
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
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: RepeatMode;
  onCycleRepeatMode: () => void;
  abRepeat: ABRepeat;
  onSetPointA: () => void;
  onSetPointB: () => void;
  onClearAB: () => void;
  onJumpSeconds: (offset: number) => void;
  onNavigateToTab: (tab: 'player' | 'library' | 'equalizer' | 'lyrics') => void;
  currentTab: 'player' | 'library' | 'equalizer' | 'lyrics';
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
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
  playbackRate,
  onPlaybackRateChange,
  isShuffle,
  onToggleShuffle,
  repeatMode,
  onCycleRepeatMode,
  abRepeat,
  onSetPointA,
  onSetPointB,
  onClearAB,
  onJumpSeconds,
  onNavigateToTab,
  currentTab
}) => {
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 py-3 select-none flex flex-col gap-2 z-20 shadow-2xl">
      {/* Scrub Bar */}
      <div className="flex items-center gap-3 w-full">
        <span className="text-[11px] font-mono tabular-nums text-white/50 w-10 text-right">
          {formatTime(currentTime)}
        </span>

        {/* Custom Progress Bar with Hover Scrub */}
        <div className="relative flex-1 group flex items-center h-4">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-full cursor-pointer appearance-none group-hover:h-1.5 transition-all"
            style={{
              background: `linear-gradient(to right, var(--theme-c1, #38bdf8) 0%, var(--theme-c2, #a855f7) ${progressPercent}%, rgba(255,255,255,0.15) ${progressPercent}%, rgba(255,255,255,0.15) 100%)`
            }}
          />
        </div>

        <span className="text-[11px] font-mono tabular-nums text-white/50 w-10 text-left">
          {duration > 0 ? `-${formatTime(duration - currentTime)}` : '0:00'}
        </span>
      </div>

      {/* Main Controls Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Track Snapshot (Apple / WinUI mini-card) */}
        <div className="flex items-center gap-3 w-1/4 min-w-[180px] max-w-[260px] truncate">
          {currentTrack ? (
            <>
              <div
                className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center shadow-md border border-white/15"
                style={{ background: currentTrack.coverGradient }}
              >
                <Music className="w-5 h-5 text-white/95" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-white truncate">
                  {currentTrack.title}
                </span>
                <span className="block text-[11px] text-white/50 truncate">
                  {currentTrack.artist}
                </span>
              </div>
            </>
          ) : (
            <span className="text-xs text-white/30 italic">No track playing</span>
          )}
        </div>

        {/* Center Section: Core Playback & GOM Audio Controls */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Shuffle */}
            <button
              onClick={onToggleShuffle}
              className={`p-1.5 rounded-lg transition-colors ${
                isShuffle ? 'text-sky-400 bg-sky-500/20' : 'text-white/40 hover:text-white'
              }`}
              title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            {/* Jump -5 seconds (GOM Audio feature) */}
            <button
              onClick={() => onJumpSeconds(-5)}
              className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors hidden sm:block"
              title="Seek -5 seconds"
            >
              <Rewind className="w-3.5 h-3.5" />
            </button>

            {/* Previous */}
            <button
              onClick={onPrev}
              className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors active:scale-95"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Main Play / Pause Button (Apple Glass style) */}
            <button
              onClick={isPlaying ? onPause : onPlay}
              className="w-10 h-10 rounded-full bg-white text-slate-950 hover:bg-white/90 flex items-center justify-center shadow-lg shadow-white/20 transition-all hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={onNext}
              className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors active:scale-95"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Jump +5 seconds (GOM Audio feature) */}
            <button
              onClick={() => onJumpSeconds(5)}
              className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors hidden sm:block"
              title="Seek +5 seconds"
            >
              <FastForward className="w-3.5 h-3.5" />
            </button>

            {/* Repeat Mode */}
            <button
              onClick={onCycleRepeatMode}
              className={`p-1.5 rounded-lg transition-colors ${
                repeatMode !== 'off'
                  ? 'text-sky-400 bg-sky-500/20'
                  : 'text-white/40 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-3.5 h-3.5" />
              ) : (
                <Repeat className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* GOM Audio A-B Repeat Strip */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/50">
            <span className="text-white/30 mr-1 hidden sm:inline">A-B Repeat:</span>
            <button
              onClick={onSetPointA}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                abRepeat.a !== null
                  ? 'bg-sky-500/30 border-sky-400 text-sky-200'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
              }`}
              title="Set Loop Point A"
            >
              [A] {abRepeat.a !== null ? formatTime(abRepeat.a) : ''}
            </button>

            <button
              onClick={onSetPointB}
              className={`px-1.5 py-0.5 rounded border transition-colors ${
                abRepeat.b !== null
                  ? 'bg-sky-500/30 border-sky-400 text-sky-200'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
              }`}
              title="Set Loop Point B"
            >
              [B] {abRepeat.b !== null ? formatTime(abRepeat.b) : ''}
            </button>

            {(abRepeat.a !== null || abRepeat.b !== null) && (
              <button
                onClick={onClearAB}
                className="px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-400/40 text-rose-300 hover:bg-rose-500/30 transition-colors"
                title="Clear A-B Repeat"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Volume, Speed & Panel Switches */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px] max-w-[260px]">
          {/* Playback Speed selector */}
          <select
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none cursor-pointer"
            title="Playback Speed"
          >
            <option value="0.5" className="bg-slate-900 text-white">0.5x</option>
            <option value="0.75" className="bg-slate-900 text-white">0.75x</option>
            <option value="1.0" className="bg-slate-900 text-white">1.0x</option>
            <option value="1.25" className="bg-slate-900 text-white">1.25x</option>
            <option value="1.5" className="bg-slate-900 text-white">1.5x</option>
            <option value="2.0" className="bg-slate-900 text-white">2.0x</option>
          </select>

          {/* Volume Control with 150% boost capability */}
          <div className="flex items-center gap-1.5 group">
            <button
              onClick={onToggleMute}
              className="text-white/60 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1.5"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 md:w-20 cursor-pointer"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}% ${
                volume > 1.0 ? '(Boosted)' : ''
              }`}
            />

            {volume > 1.0 && !isMuted && (
              <span className="text-[9px] font-mono font-bold text-amber-400">
                +{Math.round((volume - 1.0) * 100)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
