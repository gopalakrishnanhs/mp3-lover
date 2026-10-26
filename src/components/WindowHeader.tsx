import React from 'react';
import { 
  FolderPlus, 
  Plus, 
  Sliders, 
  Music, 
  ListMusic, 
  FileText, 
  Minimize2, 
  Maximize2, 
  X,
  Volume2,
  Sparkles,
  Palette
} from 'lucide-react';
import { VintageCassetteLogo } from './VintageCassetteLogo';

interface WindowHeaderProps {
  currentTab: 'player' | 'library' | 'equalizer' | 'lyrics';
  onTabChange: (tab: 'player' | 'library' | 'equalizer' | 'lyrics') => void;
  trackTitle?: string;
  artistName?: string;
  isMiniMode: boolean;
  onToggleMiniMode: () => void;
  onOpenFolderClick: () => void;
  onAddFilesClick: () => void;
  onNewPlaylistClick: () => void;
  isEqualizerActive: boolean;
  onOpenThemeModal: () => void;
  isPlaying?: boolean;
}

export const WindowHeader: React.FC<WindowHeaderProps> = ({
  currentTab,
  onTabChange,
  trackTitle,
  artistName,
  isMiniMode,
  onToggleMiniMode,
  onOpenFolderClick,
  onAddFilesClick,
  onNewPlaylistClick,
  isEqualizerActive,
  onOpenThemeModal,
  isPlaying = false
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 select-none bg-slate-900/60 backdrop-blur-md">
      {/* Zone 1: Window Controls (Apple Style traffic lights + Brand mark) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 mr-2">
          <button 
            title="Close" 
            onClick={() => {}}
            className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 border border-rose-600/30 transition-transform hover:scale-110 flex items-center justify-center group"
          >
            <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button 
            title="Minimize to Mini Player" 
            onClick={onToggleMiniMode}
            className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 border border-amber-600/30 transition-transform hover:scale-110 flex items-center justify-center group"
          >
            <Minimize2 className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button 
            title="Maximize" 
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              } else {
                document.documentElement.requestFullscreen().catch(() => {});
              }
            }}
            className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-600/30 transition-transform hover:scale-110 flex items-center justify-center group"
          >
            <Maximize2 className="w-2 h-2 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Vintage Cassette Logo & Brand Mark */}
        <div className="flex items-center gap-2.5">
          <VintageCassetteLogo size={22} isPlaying={isPlaying} />
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
              AeroGlass
            </span>
            <span className="text-[10px] text-white/40 font-mono tracking-wider">
              RETRO
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation Tabs (Segmented Glass Controls) */}
      <nav className="flex items-center gap-1 p-1 bg-white/[0.04] border border-white/10 rounded-lg">
        <button
          onClick={() => onTabChange('player')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            currentTab === 'player'
              ? 'bg-white/15 text-white shadow-sm shadow-black/20 font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Now Playing</span>
        </button>

        <button
          onClick={() => onTabChange('library')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            currentTab === 'library'
              ? 'bg-white/15 text-white shadow-sm shadow-black/20 font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Library & Playlists</span>
        </button>

        <button
          onClick={() => onTabChange('equalizer')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            currentTab === 'equalizer'
              ? 'bg-white/15 text-white shadow-sm shadow-black/20 font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Equalizer</span>
          {isEqualizerActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          )}
        </button>

        <button
          onClick={() => onTabChange('lyrics')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
            currentTab === 'lyrics'
              ? 'bg-white/15 text-white shadow-sm shadow-black/20 font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Lyrics</span>
        </button>
      </nav>

      {/* Zone 3: Quick Action Buttons (Play Folder & Add Music) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Play all songs in folder button */}
        <button
          onClick={onOpenFolderClick}
          title="Play all songs in folder (GOM Audio feature)"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-200 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 hover:border-sky-400/50 rounded-lg transition-all active:scale-95 whitespace-nowrap"
        >
          <FolderPlus className="w-3.5 h-3.5 text-sky-300" />
          <span>Play Folder</span>
        </button>

        <button
          onClick={onAddFilesClick}
          title="Add audio files"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 text-white/70" />
          <span>Add Songs</span>
        </button>

        {/* Theme & 2-Color Gradient Button */}
        <button
          onClick={onOpenThemeModal}
          title="Theme & 2-Color Gradient Customizer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white/90 bg-white/5 hover:bg-white/15 border border-white/15 rounded-lg transition-all active:scale-95 whitespace-nowrap"
        >
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <span>Theme</span>
        </button>

        <button
          onClick={onToggleMiniMode}
          title="Switch to Mini Player Mode"
          className="p-1.5 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all active:scale-95"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
