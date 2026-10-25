export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url: string; // ObjectURL or data URL or generated audio
  coverGradient: string; // CSS gradient string for luxury frosted glass cover
  coverIcon?: string;
  format: string; // 'MP3' | 'FLAC' | 'WAV' | 'AAC' | 'OGG'
  bitrate?: string; // e.g., '320 kbps'
  sampleRate?: string; // e.g., '44.1 kHz'
  fileSize?: string;
  folderPath?: string;
  lyrics?: string; // Synced LRC or multiline text
  year?: string;
  isCustomUpload?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverGradient: string;
  trackIds: string[];
  createdAt: number;
  isFolderImport?: boolean;
  folderName?: string;
}

export type VisualizerMode = 'bars' | 'wave' | 'liquid' | 'circular';

export type RepeatMode = 'off' | 'all' | 'one';

export interface ABRepeat {
  active: boolean;
  a: number | null;
  b: number | null;
}

export interface EqualizerPreset {
  name: string;
  gains: number[]; // 10 bands
}

export interface ThemeConfig {
  name: string;
  color1: string;
  color2: string;
  angle: number; // in degrees, e.g. 135
}
