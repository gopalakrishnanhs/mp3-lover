/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Track, Playlist, ABRepeat, RepeatMode, ThemeConfig } from './types/player';
import { 
  INITIAL_TRACKS, 
  INITIAL_PLAYLISTS, 
  EQUALIZER_PRESETS,
  EQ_FREQUENCIES,
  THEME_PRESETS
} from './utils/demoData';
import { audioEngine } from './utils/audioEngine';
import { generateSynthesizedTrack } from './utils/synthesizer';
import { parseAudioFiles, createPlaylistFromFolder } from './utils/fileParser';
import { WindowHeader } from './components/WindowHeader';
import { NowPlayingView } from './components/NowPlayingView';
import { PlaylistSidebar } from './components/PlaylistSidebar';
import { TrackListTable } from './components/TrackListTable';
import { EqualizerView } from './components/EqualizerView';
import { LyricsView } from './components/LyricsView';
import { PlayerControls } from './components/PlayerControls';
import { NewPlaylistModal } from './components/NewPlaylistModal';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { MiniPlayer } from './components/MiniPlayer';
import { FolderPlus, UploadCloud, CheckCircle2, Music, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation & Window State
  const [currentTab, setCurrentTab] = useState<'player' | 'library' | 'equalizer' | 'lyrics'>('player');
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [isNewPlaylistModalOpen, setIsNewPlaylistModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Theme & 2-Color Gradient State
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('aeroglass_theme');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return THEME_PRESETS[0];
      }
    }
    return THEME_PRESETS[0];
  });

  // Synchronize CSS custom properties for tile hover borders & ambient glass lighting
  useEffect(() => {
    try {
      document.documentElement.style.setProperty('--theme-c1', theme.color1);
      document.documentElement.style.setProperty('--theme-c2', theme.color2);
      document.documentElement.style.setProperty('--theme-angle', `${theme.angle || 135}deg`);
      localStorage.setItem('aeroglass_theme', JSON.stringify(theme));
    } catch (e) {
      // ignore
    }
  }, [theme]);

  // Audio Playback State
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('aeroglass_playlists');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PLAYLISTS;
      }
    }
    return INITIAL_PLAYLISTS;
  });
  const [activePlaylistId, setActivePlaylistId] = useState<string>('playlist-all');
  const [currentTrackId, setCurrentTrackId] = useState<string>('track-1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(48);

  // Controls State
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [abRepeat, setAbRepeat] = useState<ABRepeat>({ a: null, b: null, active: false });

  // Equalizer State
  const [eqBands, setEqBands] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [currentPreset, setCurrentPreset] = useState('Flat');
  const [preampGain, setPreampGain] = useState(0.0);
  const [isSpatialAudio, setIsSpatialAudio] = useState(false);

  // Favorites & Toast
  const [favorites, setFavorites] = useState<string[]>(['track-1', 'track-2']);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File Inputs
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);
  const isDraggingRef = useRef(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Get active track object
  const currentTrack = tracks.find((t) => t.id === currentTrackId) || tracks[0] || null;

  // Get current active playlist tracks
  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) || playlists[0];
  const activePlaylistTracks = activePlaylist
    ? tracks.filter((t) => activePlaylist.trackIds.includes(t.id))
    : tracks;

  // Show Toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Initialize synthesized audio for demo tracks so user hears immediate sound!
  useEffect(() => {
    let isCancelled = false;

    async function initSynthTracks() {
      try {
        const synthTypes: Array<'synthwave' | 'lofi' | 'techno' | 'jazz' | 'ambient'> = [
          'synthwave',
          'lofi',
          'techno',
          'jazz',
          'ambient'
        ];

        const updated = await Promise.all(
          INITIAL_TRACKS.map(async (t, idx) => {
            if (!t.url) {
              const url = await generateSynthesizedTrack(synthTypes[idx % synthTypes.length], t.duration);
              return { ...t, url };
            }
            return t;
          })
        );

        if (!isCancelled) {
          setTracks((prev) => {
            return prev.map((t) => {
              const match = updated.find((u) => u.id === t.id);
              return match ? { ...t, url: match.url } : t;
            });
          });
        }
      } catch (e) {
        console.warn('Synthesizer initialization error:', e);
      }
    }

    initSynthTracks();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Save playlists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aeroglass_playlists', JSON.stringify(playlists));
    } catch (e) {
      // quota or local storage restriction
    }
  }, [playlists]);

  // Connect AudioEngine events
  useEffect(() => {
    audioEngine.onTimeUpdate((current, dur) => {
      setCurrentTime(current);
      if (dur > 0 && !isNaN(dur)) {
        setDuration(dur);
      }
    });

    audioEngine.onPlayState((playing) => {
      setIsPlaying(playing);
    });

    audioEngine.onEnded(() => {
      handleNextTrack();
    });

    audioEngine.onError((err) => {
      console.warn('Audio playback error:', err);
    });
  }, [currentTrackId, repeatMode, isShuffle, activePlaylistId, tracks]);

  // Play a specific track
  const handlePlayTrack = async (track: Track) => {
    setCurrentTrackId(track.id);
    setDuration(track.duration || 180);
    setCurrentTime(0);

    // If track URL is not yet synthesized, synthesize immediately
    let playUrl = track.url;
    if (!playUrl) {
      playUrl = await generateSynthesizedTrack('synthwave', track.duration || 45);
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, url: playUrl } : t))
      );
    }

    await audioEngine.setSource(playUrl, true);
    setIsPlaying(true);
  };

  const handlePlay = async () => {
    if (!currentTrack) return;
    if (!audioEngine.getCurrentTime()) {
      await handlePlayTrack(currentTrack);
    } else {
      await audioEngine.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    audioEngine.pause();
    setIsPlaying(false);
  };

  const handleNextTrack = () => {
    if (activePlaylistTracks.length === 0) return;

    if (repeatMode === 'one' && currentTrack) {
      audioEngine.seek(0);
      audioEngine.play();
      return;
    }

    let nextTrack: Track;
    if (isShuffle) {
      const remaining = activePlaylistTracks.filter((t) => t.id !== currentTrackId);
      nextTrack = remaining.length > 0 
        ? remaining[Math.floor(Math.random() * remaining.length)] 
        : activePlaylistTracks[0];
    } else {
      const currentIndex = activePlaylistTracks.findIndex((t) => t.id === currentTrackId);
      const nextIndex = (currentIndex + 1) % activePlaylistTracks.length;
      nextTrack = activePlaylistTracks[nextIndex];
    }

    handlePlayTrack(nextTrack);
  };

  const handlePrevTrack = () => {
    if (activePlaylistTracks.length === 0) return;

    // If more than 3 seconds in, restart track
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }

    const currentIndex = activePlaylistTracks.findIndex((t) => t.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + activePlaylistTracks.length) % activePlaylistTracks.length;
    handlePlayTrack(activePlaylistTracks[prevIndex]);
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const handleJumpSeconds = (offset: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + offset));
    handleSeek(newTime);
  };

  // Volume
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(false);
    audioEngine.setVolume(vol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  // Playback Rate
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    audioEngine.setPlaybackRate(rate);
  };

  // Repeat & Shuffle
  const handleCycleRepeatMode = () => {
    const next: Record<RepeatMode, RepeatMode> = {
      off: 'all',
      all: 'one',
      one: 'off'
    };
    setRepeatMode(next[repeatMode]);
  };

  const handleToggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  // A-B Repeat (GOM Audio signature)
  const handleSetPointA = () => {
    const a = Math.floor(currentTime);
    const newAB = { ...abRepeat, a, active: abRepeat.b !== null && abRepeat.b > a };
    setAbRepeat(newAB);
    audioEngine.setABRepeat(newAB.a, newAB.b, newAB.active);
    showToast(`Loop Point A set at ${Math.floor(a / 60)}:${(a % 60).toString().padStart(2, '0')}`);
  };

  const handleSetPointB = () => {
    const b = Math.ceil(currentTime);
    if (abRepeat.a !== null && b <= abRepeat.a) {
      showToast('Point B must be after Point A');
      return;
    }
    const newAB = { ...abRepeat, b, active: abRepeat.a !== null && b > abRepeat.a };
    setAbRepeat(newAB);
    audioEngine.setABRepeat(newAB.a, newAB.b, newAB.active);
    showToast(`Loop Point B set. A-B Loop active!`);
  };

  const handleClearAB = () => {
    const newAB = { a: null, b: null, active: false };
    setAbRepeat(newAB);
    audioEngine.setABRepeat(null, null, false);
    showToast('A-B Repeat cleared');
  };

  // Equalizer
  const handleBandChange = (index: number, gain: number) => {
    const newBands = [...eqBands];
    newBands[index] = gain;
    setEqBands(newBands);
    setCurrentPreset('Custom');
    audioEngine.setEqualizerBand(index, gain);
  };

  const handlePresetSelect = (presetName: string) => {
    setCurrentPreset(presetName);
    const preset = EQUALIZER_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setEqBands(preset.gains);
      audioEngine.setAllEqualizerBands(preset.gains);
    }
  };

  const handlePreampChange = (gain: number) => {
    setPreampGain(gain);
    // Convert preamp dB to linear gain multiplier
    const linearGain = Math.pow(10, gain / 20);
    audioEngine.setVolume(volume * linearGain);
  };

  const handleToggleSpatialAudio = () => {
    const next = !isSpatialAudio;
    setIsSpatialAudio(next);
    audioEngine.toggleSpatialAudio(next);
    showToast(next ? '3D Spatial Glass audio enabled' : '3D Spatial Glass disabled');
  };

  const handleResetEQ = () => {
    handlePresetSelect('Flat');
    setPreampGain(0);
  };

  // Favorites
  const handleToggleFavorite = (trackId: string) => {
    setFavorites((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  // Playlist Management
  const handleCreatePlaylist = (name: string, description: string) => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      coverGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      trackIds: [],
      createdAt: Date.now()
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    setActivePlaylistId(newPlaylist.id);
    setCurrentTab('library');
    showToast(`Created playlist "${name}"`);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    if (activePlaylistId === playlistId) {
      setActivePlaylistId('playlist-all');
    }
    showToast('Playlist deleted');
  };

  const handleAddTrackToPlaylist = (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [...p.trackIds, trackId] };
        }
        return p;
      })
    );
    showToast('Track added to playlist');
  };

  const handleRemoveTrackFromPlaylist = (trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === activePlaylistId) {
          return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
        }
        return p;
      })
    );
    showToast('Track removed from playlist');
  };

  // Update track lyrics
  const handleUpdateLyrics = (trackId: string, lyrics: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, lyrics } : t))
    );
    showToast('Lyrics updated');
  };

  // FOLDER IMPORT: Play all songs in folder (GOM Audio signature feature!)
  const handleFolderSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const { tracks: newTracks, folderName } = await parseAudioFiles(e.target.files);

    if (newTracks.length === 0) {
      showToast('No supported audio files found in selected folder');
      return;
    }

    const playlistName = folderName ? `📁 ${folderName}` : `Folder Import (${newTracks.length} songs)`;
    const newTrackIds = newTracks.map((t) => t.id);

    // Add to library
    setTracks((prev) => [...prev, ...newTracks]);

    // Create a dedicated playlist for this folder
    const folderPlaylist = createPlaylistFromFolder(playlistName, newTrackIds);
    setPlaylists((prev) => {
      // Also add to 'All Tracks'
      const updated = prev.map((pl) => {
        if (pl.id === 'playlist-all') {
          return { ...pl, trackIds: [...pl.trackIds, ...newTrackIds] };
        }
        return pl;
      });
      return [...updated, folderPlaylist];
    });

    // Select this playlist
    setActivePlaylistId(folderPlaylist.id);

    // Start playing the first track in the folder immediately!
    await handlePlayTrack(newTracks[0]);
    setCurrentTab('player');
    showToast(`Loaded folder "${playlistName}" (${newTracks.length} tracks). Playing now!`);

    // Reset input
    e.target.value = '';
  };

  // FILE IMPORT: Add audio files
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const { tracks: newTracks } = await parseAudioFiles(e.target.files);

    if (newTracks.length === 0) {
      showToast('No audio files found');
      return;
    }

    const newTrackIds = newTracks.map((t) => t.id);
    setTracks((prev) => [...prev, ...newTracks]);

    // Add to current playlist and All Tracks
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === activePlaylistId || pl.id === 'playlist-all') {
          const combined = Array.from(new Set([...pl.trackIds, ...newTrackIds]));
          return { ...pl, trackIds: combined };
        }
        return pl;
      })
    );

    showToast(`Added ${newTracks.length} tracks to library`);
    e.target.value = '';
  };

  // Drag and Drop Handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const { tracks: newTracks, folderName } = await parseAudioFiles(e.dataTransfer.files);
      if (newTracks.length > 0) {
        const title = folderName ? `📁 ${folderName}` : `Dropped Music (${newTracks.length})`;
        const newTrackIds = newTracks.map((t) => t.id);
        setTracks((prev) => [...prev, ...newTracks]);

        const folderPlaylist = createPlaylistFromFolder(title, newTrackIds);
        setPlaylists((prev) => [...prev, folderPlaylist]);
        setActivePlaylistId(folderPlaylist.id);
        handlePlayTrack(newTracks[0]);
        setCurrentTab('player');
        showToast(`Imported ${newTracks.length} dropped tracks and playing!`);
      }
    }
  };

  const isEqualizerActive = currentPreset !== 'Flat' || preampGain > 0 || isSpatialAudio;

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden flex items-center justify-center bg-slate-950 font-sans"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file inputs for "Play folder" and "Add files" */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderSelected}
        // @ts-ignore
        webkitdirectory="true"
        directory=""
        multiple
        accept="audio/*"
        className="hidden"
      />
      <input
        type="file"
        ref={filesInputRef}
        onChange={handleFilesSelected}
        multiple
        accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg,.weba"
        className="hidden"
      />

      {/* Modern Windows 11 / macOS Frosted Desktop Canvas with floating ambient orbs reacting to theme colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[130px] opacity-25 transition-all duration-700" 
          style={{ background: theme.color1 }}
        />
        <div 
          className="absolute top-1/4 -right-32 w-96 h-96 rounded-full blur-[140px] opacity-25 transition-all duration-700" 
          style={{ background: theme.color2 }}
        />
        <div 
          className="absolute -bottom-32 left-1/3 w-[520px] h-[520px] rounded-full blur-[150px] opacity-20 transition-all duration-700" 
          style={{ background: `linear-gradient(${theme.angle || 135}deg, ${theme.color1}, ${theme.color2})` }}
        />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-sky-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white border-2 border-dashed border-sky-400 m-6 rounded-3xl animate-in fade-in duration-200">
          <UploadCloud className="w-16 h-16 text-sky-400 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold">Drop Audio Files or Folders Here</h2>
          <p className="text-sm text-sky-200 mt-2">
            AeroGlass will automatically read all songs and start folder playback!
          </p>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-slate-900/90 text-white text-xs font-medium rounded-full shadow-2xl border border-white/20 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mini Player Mode Float */}
      {isMiniMode ? (
        <MiniPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onPause={handlePause}
          onNext={handleNextTrack}
          onPrev={handlePrevTrack}
          onSeek={handleSeek}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onRestoreFullWindow={() => setIsMiniMode(false)}
        />
      ) : (
        /* Full Desktop Window (WinUI Acrylic + Apple Glass Window Frame) */
        <main className="relative z-10 w-full h-full max-w-[1240px] max-h-[820px] m-0 md:m-6 flex flex-col rounded-none md:rounded-2xl glass-panel shadow-2xl overflow-hidden border border-white/15">
          {/* Window Header */}
          <WindowHeader
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            trackTitle={currentTrack?.title}
            artistName={currentTrack?.artist}
            isMiniMode={isMiniMode}
            onToggleMiniMode={() => setIsMiniMode(true)}
            onOpenFolderClick={() => folderInputRef.current?.click()}
            onAddFilesClick={() => filesInputRef.current?.click()}
            onNewPlaylistClick={() => setIsNewPlaylistModalOpen(true)}
            isEqualizerActive={isEqualizerActive}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
          />

          {/* Main Body Content based on Active Tab */}
          <div className="flex-1 overflow-hidden flex">
            {currentTab === 'player' && (
              <NowPlayingView
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                abRepeat={abRepeat}
                onNavigateToTab={setCurrentTab}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={currentTrack ? favorites.includes(currentTrack.id) : false}
              />
            )}

            {currentTab === 'library' && (
              <div className="flex-1 flex w-full h-full overflow-hidden">
                <PlaylistSidebar
                  playlists={playlists}
                  activePlaylistId={activePlaylistId}
                  onSelectPlaylist={setActivePlaylistId}
                  onNewPlaylist={() => setIsNewPlaylistModalOpen(true)}
                  onOpenFolder={() => folderInputRef.current?.click()}
                  onDeletePlaylist={handleDeletePlaylist}
                  totalTracksCount={tracks.length}
                />
                <TrackListTable
                  tracks={activePlaylistTracks}
                  currentTrackId={currentTrackId}
                  isPlaying={isPlaying}
                  onPlayTrack={handlePlayTrack}
                  onPause={handlePause}
                  playlists={playlists}
                  onAddTrackToPlaylist={handleAddTrackToPlaylist}
                  onRemoveTrackFromPlaylist={
                    activePlaylistId !== 'playlist-all' ? handleRemoveTrackFromPlaylist : undefined
                  }
                  isCustomPlaylist={activePlaylistId !== 'playlist-all'}
                  onOpenFolder={() => folderInputRef.current?.click()}
                  onAddFiles={() => filesInputRef.current?.click()}
                />
              </div>
            )}

            {currentTab === 'equalizer' && (
              <EqualizerView
                bands={eqBands}
                onBandChange={handleBandChange}
                onPresetSelect={handlePresetSelect}
                currentPreset={currentPreset}
                preampGain={preampGain}
                onPreampChange={handlePreampChange}
                isSpatialAudio={isSpatialAudio}
                onToggleSpatialAudio={handleToggleSpatialAudio}
                onReset={handleResetEQ}
              />
            )}

            {currentTab === 'lyrics' && (
              <LyricsView
                currentTrack={currentTrack}
                currentTime={currentTime}
                onSeek={handleSeek}
                onUpdateLyrics={handleUpdateLyrics}
              />
            )}
          </div>

          {/* Player Controls (Bottom Dock) */}
          <PlayerControls
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            onNext={handleNextTrack}
            onPrev={handlePrevTrack}
            onSeek={handleSeek}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            playbackRate={playbackRate}
            onPlaybackRateChange={handlePlaybackRateChange}
            isShuffle={isShuffle}
            onToggleShuffle={handleToggleShuffle}
            repeatMode={repeatMode}
            onCycleRepeatMode={handleCycleRepeatMode}
            abRepeat={abRepeat}
            onSetPointA={handleSetPointA}
            onSetPointB={handleSetPointB}
            onClearAB={handleClearAB}
            onJumpSeconds={handleJumpSeconds}
            onNavigateToTab={setCurrentTab}
            currentTab={currentTab}
          />
        </main>
      )}

      {/* New Playlist Modal */}
      <NewPlaylistModal
        isOpen={isNewPlaylistModalOpen}
        onClose={() => setIsNewPlaylistModalOpen(false)}
        onCreate={handleCreatePlaylist}
      />

      {/* Theme & 2-Color Gradient Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        onApplyTheme={setTheme}
      />
    </div>
  );
}
