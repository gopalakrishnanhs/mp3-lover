import { Playlist, Track } from '../types/player';

export const INITIAL_TRACKS: Track[] = [];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-all',
    name: 'All Tracks',
    description: 'Imported music tracks and folders',
    coverGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    trackIds: [],
    createdAt: Date.now()
  }
];

export const EQUALIZER_PRESETS = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Boost', gains: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  { name: 'Rock', gains: [4, 3, 1, -1, -2, -1, 1, 3, 4, 5] },
  { name: 'Pop', gains: [-1, 1, 3, 4, 3, 1, -1, 1, 2, 3] },
  { name: 'Jazz', gains: [3, 2, 0, 2, 3, 2, 1, 2, 3, 2] },
  { name: 'Electronic', gains: [5, 4, 2, 0, -2, 2, 1, 3, 4, 4] },
  { name: 'Vocal / Acoustic', gains: [-2, -1, 0, 2, 4, 4, 3, 1, 0, -1] },
  { name: 'Classical', gains: [4, 3, 2, 1, -1, -1, 0, 2, 3, 3] },
  { name: 'GOM Extreme Crisp', gains: [3, 1, -1, 0, 1, 2, 3, 5, 6, 7] }
];

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
export const EQ_LABELS = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

export const THEME_PRESETS = [
  { name: 'Apple Cyber Neon', color1: '#38bdf8', color2: '#a855f7', angle: 135 },
  { name: 'Sunset Peach & Pink', color1: '#f97316', color2: '#ec4899', angle: 135 },
  { name: 'Aurora Borealis', color1: '#10b981', color2: '#06b6d4', angle: 135 },
  { name: 'Electric Violet', color1: '#8b5cf6', color2: '#3b82f6', angle: 135 },
  { name: 'Champagne Gold', color1: '#f59e0b', color2: '#ef4444', angle: 135 },
  { name: 'Rose Quartz', color1: '#f43f5e', color2: '#d946ef', angle: 135 },
  { name: 'Deep Space Glass', color1: '#0284c7', color2: '#6366f1', angle: 135 },
  { name: 'Minimalist Platinum', color1: '#94a3b8', color2: '#e2e8f0', angle: 135 }
];

