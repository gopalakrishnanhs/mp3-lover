import React, { useEffect, useRef, useState } from 'react';
import { Track } from '../types/player';
import { parseLrc, findCurrentLyricIndex } from '../utils/lyricsParser';
import { FileText, Edit3, Check, Disc, Play } from 'lucide-react';

interface LyricsViewProps {
  currentTrack: Track | null;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onUpdateLyrics?: (trackId: string, lyrics: string) => void;
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  currentTrack,
  currentTime,
  onSeek,
  onUpdateLyrics
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLyrics, setEditedLyrics] = useState('');
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentTrack?.lyrics) {
      setEditedLyrics(currentTrack.lyrics);
    } else {
      setEditedLyrics('');
    }
    setIsEditing(false);
  }, [currentTrack?.id]);

  const parsedLyrics = currentTrack?.lyrics ? parseLrc(currentTrack.lyrics) : [];
  const currentIdx = findCurrentLyricIndex(parsedLyrics, currentTime);

  // Auto-scroll active line into view smoothly
  useEffect(() => {
    if (activeLineRef.current && containerRef.current && !isEditing) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentIdx, isEditing]);

  const handleSaveLyrics = () => {
    if (currentTrack && onUpdateLyrics) {
      onUpdateLyrics(currentTrack.id, editedLyrics);
    }
    setIsEditing(false);
  };

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white/50">
        <FileText className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">Select a song to view synchronized lyrics</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden p-6 md:p-10">
      {/* Background ambient gradient glow */}
      <div 
        className="absolute inset-0 opacity-15 blur-3xl pointer-events-none -z-10"
        style={{ 
          background: currentTrack.coverUrl ? undefined : currentTrack.coverGradient,
          backgroundImage: currentTrack.coverUrl ? `url(${currentTrack.coverUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Lyrics</span>
            <span className="text-xs font-normal text-white/40">· {currentTrack.title}</span>
          </h2>
          <p className="text-xs text-white/50">
            Click any line to jump audio directly to that position
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleSaveLyrics}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Lyrics</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit / Paste LRC</span>
            </button>
          )}
        </div>
      </div>

      {/* Lyrics Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto py-8 px-2 md:px-12 space-y-6"
      >
        {isEditing ? (
          <div className="flex flex-col h-full gap-2">
            <span className="text-xs text-white/40">
              Format: Standard LRC timestamps like [00:12.50] Lyric line, or plain multi-line text:
            </span>
            <textarea
              value={editedLyrics}
              onChange={(e) => setEditedLyrics(e.target.value)}
              placeholder="[00:00.00] Song intro..."
              className="flex-1 w-full bg-black/40 border border-white/15 rounded-xl p-4 text-sm font-mono text-white/90 focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none min-h-[300px]"
            />
          </div>
        ) : parsedLyrics.length > 0 ? (
          parsedLyrics.map((line, idx) => {
            const isActive = idx === currentIdx;
            const isPast = idx < currentIdx;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => {
                  if (line.time >= 0) {
                    onSeek(line.time);
                  }
                }}
                className={`group cursor-pointer transition-all duration-300 transform ${
                  isActive
                    ? 'text-white text-xl md:text-2xl font-bold scale-[1.03] translate-x-1 drop-shadow-[0_4px_16px_rgba(255,255,255,0.35)]'
                    : isPast
                    ? 'text-white/40 hover:text-white/70 text-base md:text-lg font-medium'
                    : 'text-white/50 hover:text-white/80 text-base md:text-lg font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sky-400">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </span>
                  <span>{line.text}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center text-white/40">
            <Disc className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm font-medium">No synchronized lyrics available</p>
            <p className="text-xs text-white/30 mt-1">
              Click &quot;Edit / Paste LRC&quot; above to add timestamped lyrics to this track.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
