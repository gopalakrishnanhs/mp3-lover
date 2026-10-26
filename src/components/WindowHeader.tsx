import React from 'react';
import { 
  FolderPlus, 
  Plus, 
  Sliders, 
  Music, 
  ListMusic, 
  FileText, 
  Minus,
  Square,
  X,
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
  const electronAPI = (window as unknown as { electronAPI?: { minimize: () => void; maximize: () => void; close: () => void; isElectron?: boolean } }).electronAPI;

  const handleMinimize = () => {
    if (electronAPI?.minimize) {
      electronAPI.minimize();
    } else {
      onToggleMiniMode();
    }
  };

  const handleMaximize = () => {
    if (electronAPI?.maximize) {
      electronAPI.maximize();
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleClose = () => {
    if (electronAPI?.close) {
      electronAPI.close();
    }
  };

  return (
    <header className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 select-none bg-slate-950/80 backdrop-blur-md shrink-0 gap-2 min-h-[42px]">
      {/* Zone 1: Vintage Cassette Logo & Brand Mark */}
      <div className="flex items-center gap-2 shrink-0">
        <VintageCassetteLogo size={20} isPlaying={isPlaying} />
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white whitespace-nowrap">
            AeroGlass MP3
          </span>
          <span className="text-[10px] text-white/40 font-mono tracking-wider hidden lg:inline">
            WIN-UI
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Tabs (WinUI Segmented Controls with responsive labels) */}
      <nav className="flex items-center gap-0.5 sm:gap-1 p-0.5 bg-white/[0.04] border border-white/10 rounded shrink-0">
        <button
          onClick={() => onTabChange('player')}
          title="Now Playing View"
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
            currentTab === 'player'
              ? 'bg-white/15 text-white shadow-sm font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Now Playing</span>
          <span className="sm:hidden">Player</span>
        </button>

        <button
          onClick={() => onTabChange('library')}
          title="Library & Playlists"
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
            currentTab === 'library'
              ? 'bg-white/15 text-white shadow-sm font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Library &amp; Playlists</span>
          <span className="md:hidden">Library</span>
        </button>

        <button
          onClick={() => onTabChange('equalizer')}
          title="10-Band Graphic Equalizer"
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
            currentTab === 'equalizer'
              ? 'bg-white/15 text-white shadow-sm font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Equalizer</span>
          <span className="sm:hidden">EQ</span>
          {isEqualizerActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          )}
        </button>

        <button
          onClick={() => onTabChange('lyrics')}
          title="Synchronized Lyrics"
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
            currentTab === 'lyrics'
              ? 'bg-white/15 text-white shadow-sm font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Lyrics</span>
        </button>
      </nav>

      {/* Zone 3: Quick Action Buttons & Native Windows Square Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Play all songs in folder button (GOM Audio signature) */}
        <button
          onClick={onOpenFolderClick}
          title="Play all songs in folder (GOM Audio feature)"
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-medium text-sky-200 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 hover:border-sky-400/50 rounded transition-all active:scale-95 whitespace-nowrap"
        >
          <FolderPlus className="w-3.5 h-3.5 text-sky-300" />
          <span className="hidden md:inline">Play Folder</span>
        </button>

        {/* Add audio files button */}
        <button
          onClick={onAddFilesClick}
          title="Add audio files (*.mp3, *.flac, *.wav, etc.)"
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-medium text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 text-white/70" />
          <span className="hidden lg:inline">Add Songs</span>
        </button>

        {/* Theme & 2-Color Gradient Button */}
        <button
          onClick={onOpenThemeModal}
          title="Theme & 2-Color Gradient Customizer"
          className="flex items-center gap-1 px-2 sm:px-2 py-1 text-xs font-medium text-white/90 bg-white/5 hover:bg-white/15 border border-white/15 rounded transition-all active:scale-95 whitespace-nowrap"
        >
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          <span className="hidden xl:inline">Theme</span>
        </button>

        {/* Native Windows 11 Square Titlebar Buttons */}
        <div className="flex items-center border-l border-white/15 pl-1.5 sm:pl-2 ml-0.5 sm:ml-1">
          {/* Windows Minimize (—) */}
          <button
            onClick={handleMinimize}
            title="Minimize"
            className="w-7 h-7 sm:w-8 sm:h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Windows Maximize/Restore (□) */}
          <button
            onClick={handleMaximize}
            title="Maximize"
            className="w-7 h-7 sm:w-8 sm:h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>

          {/* Windows Close (✕ with red hover) */}
          <button
            onClick={handleClose}
            title="Close"
            className="w-7 h-7 sm:w-8 sm:h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-[#e81123] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
