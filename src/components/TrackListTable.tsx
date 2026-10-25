import React, { useState } from 'react';
import { Track, Playlist } from '../types/player';
import { 
  Play, 
  Pause, 
  Search, 
  FolderPlus, 
  Plus, 
  MoreVertical, 
  Clock, 
  Music, 
  Sparkles,
  ArrowUpDown,
  ListPlus,
  Trash2
} from 'lucide-react';

interface TrackListTableProps {
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onPause: () => void;
  playlists: Playlist[];
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
  onRemoveTrackFromPlaylist?: (trackId: string) => void;
  isCustomPlaylist?: boolean;
  onOpenFolder: () => void;
  onAddFiles: () => void;
}

export const TrackListTable: React.FC<TrackListTableProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onPause,
  playlists,
  onAddTrackToPlaylist,
  onRemoveTrackFromPlaylist,
  isCustomPlaylist = false,
  onOpenFolder,
  onAddFiles
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'artist' | 'duration'>('default');
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Filter & sort tracks
  const filteredTracks = tracks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q) ||
      t.format.toLowerCase().includes(q)
    );
  });

  const sortedTracks = [...filteredTracks].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
    if (sortBy === 'duration') return a.duration - b.duration;
    return 0;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Search & Sort Bar */}
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.02]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search tracks, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-sky-400 transition-colors"
          />
        </div>

        {/* Sort & Quick Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="default" className="bg-slate-900 text-white">Default order</option>
              <option value="title" className="bg-slate-900 text-white">Title (A-Z)</option>
              <option value="artist" className="bg-slate-900 text-white">Artist (A-Z)</option>
              <option value="duration" className="bg-slate-900 text-white">Duration</option>
            </select>
          </div>

          <button
            onClick={onAddFiles}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Files</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-y-auto">
        {sortedTracks.length > 0 ? (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 text-white/40 uppercase tracking-wider text-[11px] border-b border-white/10">
              <tr>
                <th className="py-2.5 pl-4 pr-2 w-12 font-medium">#</th>
                <th className="py-2.5 px-3 font-medium">Title</th>
                <th className="py-2.5 px-3 font-medium hidden md:table-cell">Album</th>
                <th className="py-2.5 px-3 font-medium hidden sm:table-cell">Format</th>
                <th className="py-2.5 px-3 font-medium text-right w-20">
                  <Clock className="w-3.5 h-3.5 inline ml-auto" />
                </th>
                <th className="py-2.5 pl-2 pr-4 w-12 text-center font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedTracks.map((track, idx) => {
                const isCurrent = track.id === currentTrackId;
                const isCurrentPlaying = isCurrent && isPlaying;

                return (
                  <tr
                    key={track.id}
                    onDoubleClick={() => onPlayTrack(track)}
                    className={`group hover:bg-white/10 transition-colors cursor-pointer select-none row-hover-gradient ${
                      isCurrent ? 'bg-sky-500/15' : ''
                    }`}
                  >
                    {/* Index / Play Button */}
                    <td className="py-2.5 pl-4 pr-2 font-mono text-white/40">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {isCurrentPlaying ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPause();
                            }}
                            className="text-sky-400 hover:scale-110 transition-transform"
                          >
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          </button>
                        ) : (
                          <div className="relative">
                            <span className="group-hover:hidden">
                              {isCurrent ? (
                                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                              ) : (
                                idx + 1
                              )}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlayTrack(track);
                              }}
                              className="hidden group-hover:flex items-center justify-center text-white hover:text-sky-300 transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Artist */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Mini Gradient Thumbnail */}
                        <div
                          className="w-7 h-7 rounded-md shrink-0 flex items-center justify-center shadow-sm"
                          style={{ background: track.coverGradient }}
                        >
                          <Music className="w-3.5 h-3.5 text-white/90" />
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`block font-semibold truncate ${
                              isCurrent ? 'text-sky-300' : 'text-white'
                            }`}
                          >
                            {track.title}
                          </span>
                          <span className="block text-[11px] text-white/50 truncate">
                            {track.artist}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Album */}
                    <td className="py-2.5 px-3 text-white/60 truncate max-w-[140px] hidden md:table-cell">
                      {track.album}
                    </td>

                    {/* Format / Bitrate */}
                    <td className="py-2.5 px-3 font-mono text-white/50 text-[11px] hidden sm:table-cell">
                      <span>{track.format}</span>
                      {track.bitrate && <span className="text-white/30 ml-1">· {track.bitrate}</span>}
                    </td>

                    {/* Duration */}
                    <td className="py-2.5 px-3 font-mono tabular-nums text-white/60 text-right">
                      {formatTime(track.duration)}
                    </td>

                    {/* Context menu actions */}
                    <td className="py-2.5 pl-2 pr-4 text-center relative">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuTrackId(
                              activeMenuTrackId === track.id ? null : track.id
                            );
                          }}
                          className="p-1 rounded text-white/30 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuTrackId === track.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-white/20 rounded-xl shadow-2xl p-1 z-30 text-left text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-2 py-1 text-[10px] uppercase font-bold text-white/40 tracking-wider">
                              Add to Playlist
                            </div>
                            {playlists
                              .filter((p) => p.id !== 'playlist-all')
                              .map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => {
                                    onAddTrackToPlaylist(p.id, track.id);
                                    setActiveMenuTrackId(null);
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white flex items-center gap-2 truncate"
                                >
                                  <ListPlus className="w-3 h-3 text-sky-400" />
                                  <span className="truncate">{p.name}</span>
                                </button>
                              ))}

                            {isCustomPlaylist && onRemoveTrackFromPlaylist && (
                              <button
                                onClick={() => {
                                  onRemoveTrackFromPlaylist(track.id);
                                  setActiveMenuTrackId(null);
                                }}
                                className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 flex items-center gap-2 mt-1 border-t border-white/10 pt-1.5"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove from Playlist</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-64 p-8 text-center text-white/40">
            <Music className="w-12 h-12 mb-3 opacity-20" />
            <h3 className="text-sm font-semibold text-white/70">
              {searchQuery ? 'No tracks matched your search' : 'No tracks in this playlist'}
            </h3>
            <p className="text-xs text-white/40 mt-1 max-w-xs">
              {searchQuery
                ? 'Try a different search keyword.'
                : 'Import your music folders or add audio files to fill this playlist.'}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={onOpenFolder}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-200 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 rounded-lg transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5 text-sky-300" />
                <span>Play Folder</span>
              </button>
              <button
                onClick={onAddFiles}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Files</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
