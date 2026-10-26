import React from 'react';
import { Playlist } from '../types/player';
import { 
  FolderPlus, 
  Plus, 
  ListMusic, 
  Folder, 
  Trash2, 
  Music2
} from 'lucide-react';

interface PlaylistSidebarProps {
  playlists: Playlist[];
  activePlaylistId: string;
  onSelectPlaylist: (playlistId: string) => void;
  onNewPlaylist: () => void;
  onOpenFolder: () => void;
  onDeletePlaylist: (playlistId: string) => void;
  totalTracksCount: number;
}

export const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  onNewPlaylist,
  onOpenFolder,
  onDeletePlaylist,
  totalTracksCount
}) => {
  return (
    <aside className="w-48 sm:w-56 md:w-64 lg:w-72 shrink-0 border-r border-white/10 flex flex-col h-full bg-slate-900/40 backdrop-blur-md">
      {/* Folder Play Banner (GOM Audio feature) */}
      <div className="p-2.5 sm:p-3 md:p-4 border-b border-white/10 shrink-0">
        <button
          onClick={onOpenFolder}
          className="w-full flex items-center justify-between p-2 sm:p-2.5 md:p-3 rounded-xl bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 border border-sky-400/30 hover:border-sky-400/50 transition-all group shadow-sm text-left tile-hover-gradient"
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-500/30 flex items-center justify-center text-sky-300 group-hover:scale-105 transition-transform shrink-0">
              <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs font-bold text-white group-hover:text-sky-200 transition-colors truncate">
                Play Folder
              </span>
              <span className="block text-[10px] text-white/50 truncate">
                Load &amp; play all songs
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-sky-400 bg-sky-950/60 px-1 py-0.5 rounded border border-sky-500/30 shrink-0 hidden sm:inline">
            GOM
          </span>
        </button>
      </div>

      {/* Playlists Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <ListMusic className="w-3.5 h-3.5 text-white/60" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">
            Playlists
          </span>
        </div>
        <button
          onClick={onNewPlaylist}
          className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors px-1.5 py-0.5 rounded hover:bg-white/5"
          title="Create New Playlist"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>

      {/* Playlists List */}
      <div className="flex-1 overflow-y-auto px-1.5 sm:px-2 space-y-1 min-h-0">
        {playlists.map((pl) => {
          const isActive = pl.id === activePlaylistId;
          const isMaster = pl.id === 'playlist-all';

          return (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className={`group flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-all tile-hover-gradient ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                {/* Playlist Thumbnail Gradient */}
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg shrink-0 flex items-center justify-center text-white/90 shadow-sm"
                  style={{ background: pl.coverGradient }}
                >
                  {pl.isFolderImport ? (
                    <Folder className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  ) : (
                    <Music2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold truncate block">
                      {pl.name}
                    </span>
                    {pl.isFolderImport && (
                      <span className="text-[8px] font-mono bg-sky-500/20 text-sky-300 px-1 rounded shrink-0">
                        Dir
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/40 font-mono block">
                    {pl.trackIds.length} {pl.trackIds.length === 1 ? 'track' : 'tracks'}
                  </span>
                </div>
              </div>

              {/* Delete button (except for master playlist) */}
              {!isMaster && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePlaylist(pl.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-white/40 p-1 transition-all rounded hover:bg-white/10 shrink-0"
                  title="Delete playlist"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer library summary */}
      <div className="p-2.5 sm:p-3 border-t border-white/10 text-[11px] text-white/40 font-mono flex items-center justify-between shrink-0">
        <span>Library</span>
        <span>{totalTracksCount} tracks</span>
      </div>
    </aside>
  );
};
