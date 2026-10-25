import React, { useState } from 'react';
import { Track, VisualizerMode, ABRepeat } from '../types/player';
import { VisualizerCanvas } from './VisualizerCanvas';
import { 
  Sliders, 
  FileText, 
  Disc, 
  Sparkles, 
  Info, 
  Repeat, 
  Radio, 
  Layers,
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
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white/50">
        <Disc className="w-16 h-16 mb-4 animate-spin-slow opacity-30" />
        <h3 className="text-base font-semibold text-white/80">No Track Selected</h3>
        <p className="text-xs text-white/40 mt-1">Select a song from your playlist or open a folder to begin playback.</p>
      </div>
    );
  }

  // Parse lyrics for the preview teaser
  const parsedLyrics = currentTrack.lyrics ? parseLrc(currentTrack.lyrics) : [];
  const currentLyricIdx = findCurrentLyricIndex(parsedLyrics, currentTime);
  const activeLyric = currentLyricIdx >= 0 ? parsedLyrics[currentLyricIdx].text : null;
  const nextLyric = currentLyricIdx + 1 < parsedLyrics.length ? parsedLyrics[currentLyricIdx + 1].text : null;

  return (
    <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 p-6 md:p-10 h-full overflow-y-auto">
      {/* Background ambient color bleed */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none blur-3xl transition-all duration-700 -z-10"
        style={{ background: currentTrack.coverGradient }}
      />

      {/* Left Column: Frosted Glass Album Art & Media Details */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-sm shrink-0">
        {/* Album Cover with Glass Reflection & Specular Edge & Gradient Border Hover */}
        <div className="relative group w-64 h-64 md:w-72 md:h-72 rounded-2xl p-1.5 shadow-2xl tile-hover-gradient cursor-pointer">
          {/* Outer Glass Rim */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-transparent border border-white/20 pointer-events-none" />
          
          {/* Cover Artwork Container */}
          <div 
            className="w-full h-full rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 relative shadow-inner"
            style={{ background: currentTrack.coverGradient }}
          >
            {/* Specular light highlight */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/25 rounded-full blur-2xl pointer-events-none" />

            {/* Subtle Grooved Vinyl Ring texture */}
            <div className="absolute inset-4 rounded-full border border-white/10 pointer-events-none" />
            <div className="absolute inset-10 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-16 rounded-full border border-white/10 pointer-events-none" />

            {/* Icon Graphic */}
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg mb-3">
              <Disc className={`w-8 h-8 text-white ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            </div>

            <span className="text-sm font-semibold tracking-wide text-white/95 text-center drop-shadow-md truncate max-w-[200px]">
              {currentTrack.album}
            </span>
            <span className="text-xs text-white/70 font-mono mt-0.5">
              {currentTrack.format}
            </span>

            {/* A-B Repeat Floating Flag if active */}
            {abRepeat.active && abRepeat.a !== null && abRepeat.b !== null && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-500/80 backdrop-blur-sm text-[10px] font-mono font-bold text-white border border-amber-300/40">
                A-B LOOP
              </div>
            )}
          </div>
        </div>

        {/* Title & Metadata (Clean Typography, No Pill Enclosures) */}
        <div className="mt-5 w-full">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white truncate text-balance">
              {currentTrack.title}
            </h2>
            {onToggleFavorite && (
              <button 
                onClick={() => onToggleFavorite(currentTrack.id)}
                className="text-white/60 hover:text-rose-400 transition-colors p-1"
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'text-rose-500 fill-rose-500' : ''}`} />
              </button>
            )}
          </div>
          
          <p className="text-sm font-medium text-white/70 mt-0.5 truncate">
            {currentTrack.artist}
          </p>

          {/* Clean Unboxed Metadata with Typographic Separators */}
          <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-white/50 mt-2 font-mono">
            <span>{currentTrack.album}</span>
            <span aria-hidden="true">·</span>
            <span>{currentTrack.format}</span>
            {currentTrack.bitrate && (
              <>
                <span aria-hidden="true">·</span>
                <span>{currentTrack.bitrate}</span>
              </>
            )}
            {currentTrack.year && (
              <>
                <span aria-hidden="true">·</span>
                <span>{currentTrack.year}</span>
              </>
            )}
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onNavigateToTab('equalizer')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors active:scale-95"
            title="Open 10-Band Graphic Equalizer"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Equalizer</span>
          </button>

          <button
            onClick={() => onNavigateToTab('lyrics')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors active:scale-95"
            title="Open Full Lyrics"
          >
            <FileText className="w-3.5 h-3.5 text-pink-400" />
            <span>Lyrics</span>
          </button>

          <button
            onClick={() => setShowTechInfo(!showTechInfo)}
            className={`p-1.5 text-xs rounded-lg border transition-colors ${
              showTechInfo 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-white/5 text-white/70 hover:text-white border-white/10'
            }`}
            title="Audio Specifications"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Technical Specs Popover/Drawer */}
        {showTechInfo && (
          <div className="mt-3 w-full p-3 bg-white/5 border border-white/10 rounded-xl text-left text-xs font-mono text-white/70 space-y-1">
            <div className="flex justify-between">
              <span className="text-white/40">Sample Rate:</span>
              <span>{currentTrack.sampleRate || '44.1 kHz'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Bitrate:</span>
              <span>{currentTrack.bitrate || '320 kbps'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Channels:</span>
              <span>2 (Stereo)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">File Size:</span>
              <span>{currentTrack.fileSize || '3.5 MB'}</span>
            </div>
            {currentTrack.folderPath && (
              <div className="flex justify-between truncate">
                <span className="text-white/40">Path:</span>
                <span className="truncate max-w-[160px] text-right" title={currentTrack.folderPath}>
                  {currentTrack.folderPath}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Column: Dynamic Visualizer & Apple-style Synced Lyrics Preview */}
      <div className="flex-1 w-full flex flex-col gap-5 min-h-[300px]">
        {/* Visualizer Glass Container with Gradient Border Hover */}
        <div className="relative glass-subpanel rounded-2xl p-4 flex flex-col h-56 md:h-64 overflow-hidden shadow-lg tile-hover-gradient">
          {/* Header & Mode Selector */}
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Spectrum Visualizer
              </span>
            </div>

            {/* Segmented Mode Selector */}
            <div className="flex items-center gap-1 p-0.5 bg-black/30 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setVisualizerMode('liquid')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  visualizerMode === 'liquid'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Liquid
              </button>
              <button
                onClick={() => setVisualizerMode('bars')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  visualizerMode === 'bars'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Bars
              </button>
              <button
                onClick={() => setVisualizerMode('wave')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  visualizerMode === 'wave'
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Wave
              </button>
              <button
                onClick={() => setVisualizerMode('circular')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
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
          <div className="flex-1 w-full relative">
            <VisualizerCanvas mode={visualizerMode} isPlaying={isPlaying} />
          </div>
        </div>

        {/* Live Synchronized Lyrics Teaser (Apple Style with glow) */}
        <div 
          onClick={() => onNavigateToTab('lyrics')}
          className="glass-subpanel hover:glass-subpanel-active rounded-2xl p-5 cursor-pointer transition-all border border-white/10 group flex flex-col justify-center min-h-[110px] tile-hover-gradient"
        >
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-pink-400" />
              <span className="font-medium text-white/70">Synced Lyrics</span>
            </div>
            <span className="text-[11px] text-sky-400 group-hover:underline">
              View All Lyrics →
            </span>
          </div>

          {activeLyric ? (
            <div className="space-y-1">
              <p className="text-base md:text-lg font-bold text-white transition-all drop-shadow">
                {activeLyric}
              </p>
              {nextLyric && (
                <p className="text-xs md:text-sm text-white/40 transition-all truncate">
                  {nextLyric}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-white/40 italic">
              {currentTrack.lyrics 
                ? 'Lyrics will synchronize with playback...' 
                : 'No lyrics available for this track. Click to view lyrics panel.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
