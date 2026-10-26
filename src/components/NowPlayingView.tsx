import React, { useState } from 'react';
import { Track, VisualizerMode, ABRepeat } from '../types/player';
import { VisualizerCanvas } from './VisualizerCanvas';
import { 
  Sliders, 
  FileText, 
  Disc, 
  Info, 
  Activity,
  Heart
} from 'lucide-react';
import { parseLrc, findCurrentLyricIndex } from '../utils/lyricsParser';

interface NowPlayingViewProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  abRepeat: ABRepeat;
  onNavigateToTab: (tab: 'player' | 'library' | 'equalizer' | 'lyrics') => void;
  onToggleFavorite?: (trackId: string) => void;
  isFavorite?: boolean;
}

export const NowPlayingView: React.FC<NowPlayingViewProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  abRepeat,
  onNavigateToTab,
  onToggleFavorite,
  isFavorite = false
}) => {
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('liquid');
  const [showTechInfo, setShowTechInfo] = useState(false);

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center text-white/50">
        <Disc className="w-16 h-16 mb-4 animate-spin-slow opacity-30" />
        <h3 className="text-base font-semibold text-white/80">No Track Selected</h3>
        <p className="text-xs text-white/40 mt-1 max-w-sm">
          Select an MP3 from your playlist, click "Play Folder" to open all music, or drop audio files anywhere.
        </p>
      </div>
    );
  }

  // Parse lyrics for the preview teaser
  const parsedLyrics = currentTrack.lyrics ? parseLrc(currentTrack.lyrics) : [];
  const currentLyricIdx = findCurrentLyricIndex(parsedLyrics, currentTime);
  const activeLyric = currentLyricIdx >= 0 ? parsedLyrics[currentLyricIdx].text : null;
  const nextLyric = currentLyricIdx + 1 < parsedLyrics.length ? parsedLyrics[currentLyricIdx + 1].text : null;

  return (
    <div className="relative flex flex-col md:flex-row items-center md:items-stretch justify-between gap-5 lg:gap-8 p-4 md:p-6 lg:p-8 h-full w-full overflow-y-auto">
      {/* Background ambient color bleed */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none blur-3xl transition-all duration-700 -z-10"
        style={{ 
          background: currentTrack.coverUrl ? undefined : currentTrack.coverGradient,
          backgroundImage: currentTrack.coverUrl ? `url(${currentTrack.coverUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Left Column: Frosted Glass Album Art & Media Details */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto md:max-w-xs shrink-0 justify-between">
        <div className="flex flex-col items-center md:items-start w-full">
          {/* Responsive Album Cover with Glass Reflection & Gradient Border Hover */}
          <div className="relative group w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-2xl p-1.5 shadow-2xl tile-hover-gradient cursor-pointer">
            {/* Outer Glass Rim */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-transparent border border-white/20 pointer-events-none z-10" />
            
            {/* Cover Artwork Container */}
            <div 
              className="w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 relative shadow-inner"
              style={{ background: currentTrack.coverGradient }}
            >
              {currentTrack.coverUrl ? (
                <>
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle glass reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/15 pointer-events-none" />
                </>
              ) : (
                <>
                  {/* Specular light highlight */}
                  <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/25 rounded-full blur-2xl pointer-events-none" />

                  {/* Subtle Grooved Vinyl Ring texture */}
                  <div className="absolute inset-3 sm:inset-4 rounded-full border border-white/10 pointer-events-none" />
                  <div className="absolute inset-8 sm:inset-10 rounded-full border border-white/5 pointer-events-none" />
                  <div className="absolute inset-14 sm:inset-16 rounded-full border border-white/10 pointer-events-none" />

                  {/* Icon Graphic */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg mb-2 sm:mb-3">
                    <Disc className={`w-6 h-6 sm:w-8 sm:h-8 text-white ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                  </div>

                  <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/95 text-center drop-shadow-md truncate max-w-[180px]">
                    {currentTrack.album}
                  </span>
                  <span className="text-[10px] sm:text-xs text-white/70 font-mono mt-0.5">
                    {currentTrack.format}
                  </span>
                </>
              )}

              {/* A-B Repeat Floating Flag if active */}
              {abRepeat.active && abRepeat.a !== null && abRepeat.b !== null && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-500/80 backdrop-blur-sm text-[9px] font-mono font-bold text-white border border-amber-300/40 z-20 shadow-md">
                  A-B LOOP
                </div>
              )}
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="mt-4 w-full">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                {currentTrack.title}
              </h2>
              {onToggleFavorite && (
                <button 
                  onClick={() => onToggleFavorite(currentTrack.id)}
                  className="text-white/60 hover:text-rose-400 transition-colors p-1"
                  title="Favorite"
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
                </button>
              )}
            </div>
            
            <p className="text-xs sm:text-sm font-medium text-white/70 mt-0.5 truncate">
              {currentTrack.artist}
            </p>

            {/* Metadata with Typographic Separators */}
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] text-white/50 mt-1.5 font-mono">
              <span className="truncate max-w-[100px]">{currentTrack.album}</span>
              <span aria-hidden="true">·</span>
              <span>{currentTrack.format}</span>
              {currentTrack.bitrate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{currentTrack.bitrate}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => onNavigateToTab('equalizer')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors active:scale-95"
              title="Open 10-Band Graphic Equalizer"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Equalizer</span>
            </button>

            <button
              onClick={() => onNavigateToTab('lyrics')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors active:scale-95"
              title="Open Full Lyrics"
            >
              <FileText className="w-3.5 h-3.5 text-pink-400" />
              <span>Lyrics</span>
            </button>

            <button
              onClick={() => setShowTechInfo(!showTechInfo)}
              className={`p-1 text-xs rounded-lg border transition-colors ${
                showTechInfo 
                  ? 'bg-white/20 text-white border-white/30' 
                  : 'bg-white/5 text-white/70 hover:text-white border-white/10'
              }`}
              title="Audio Specifications"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Technical Specs Popover */}
          {showTechInfo && (
            <div className="mt-2 w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-left text-[11px] font-mono text-white/70 space-y-1">
              <div className="flex justify-between">
                <span className="text-white/40">Sample Rate:</span>
                <span>{currentTrack.sampleRate || '44.1 kHz'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Bitrate:</span>
                <span>{currentTrack.bitrate || '320 kbps'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">File Size:</span>
                <span>{currentTrack.fileSize || 'Unknown'}</span>
              </div>
              {currentTrack.folderPath && (
                <div className="flex justify-between truncate">
                  <span className="text-white/40">File:</span>
                  <span className="truncate max-w-[140px] text-right" title={currentTrack.folderPath}>
                    {currentTrack.folderPath}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Dynamic Visualizer & Synced Lyrics Preview */}
      <div className="flex-1 w-full flex flex-col gap-4 min-h-0 h-full justify-between">
        {/* Visualizer Glass Container */}
        <div className="relative glass-subpanel rounded-2xl p-3 sm:p-4 flex flex-col flex-1 min-h-[160px] max-h-[380px] overflow-hidden shadow-lg tile-hover-gradient">
          {/* Header & Mode Selector */}
          <div className="flex items-center justify-between mb-2 z-10 shrink-0">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white/60">
                Spectrum Visualizer
              </span>
            </div>

            {/* Segmented Mode Selector */}
            <div className="flex items-center gap-0.5 p-0.5 bg-black/30 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setVisualizerMode('liquid')}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium transition-colors ${
                  visualizerMode === 'liquid'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Liquid
              </button>
              <button
                onClick={() => setVisualizerMode('bars')}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium transition-colors ${
                  visualizerMode === 'bars'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Bars
              </button>
              <button
                onClick={() => setVisualizerMode('wave')}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium transition-colors ${
                  visualizerMode === 'wave'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Wave
              </button>
              <button
                onClick={() => setVisualizerMode('circular')}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium transition-colors ${
                  visualizerMode === 'circular'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Radar
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 w-full relative min-h-0">
            <VisualizerCanvas mode={visualizerMode} isPlaying={isPlaying} />
          </div>
        </div>

        {/* Live Synchronized Lyrics Teaser */}
        <div 
          onClick={() => onNavigateToTab('lyrics')}
          className="glass-subpanel hover:glass-subpanel-active rounded-2xl p-3 sm:p-4 cursor-pointer transition-all border border-white/10 group flex flex-col justify-center shrink-0 min-h-[80px] sm:min-h-[96px] tile-hover-gradient"
        >
          <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-pink-400" />
              <span className="font-medium text-white/70">Synced Lyrics</span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-sky-400 group-hover:underline">
              View All Lyrics →
            </span>
          </div>

          {activeLyric ? (
            <div className="space-y-0.5">
              <p className="text-sm sm:text-base font-bold text-white transition-all drop-shadow truncate">
                {activeLyric}
              </p>
              {nextLyric && (
                <p className="text-[11px] sm:text-xs text-white/40 transition-all truncate">
                  {nextLyric}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-white/40 italic">
              {currentTrack.lyrics 
                ? 'Lyrics will synchronize with playback...' 
                : 'No lyrics available for this track. Click to view or add lyrics.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
