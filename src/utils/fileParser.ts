import { Playlist, Track } from '../types/player';

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.weba', '.wma', '.opus'];

const GRADIENT_PALETTES = [
  'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
  'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #0284c7 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #f43f5e 100%)',
  'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
  'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #1d4ed8 100%)',
  'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)'
];

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function cleanFilename(rawName: string): { title: string; artist: string } {
  // Remove extension
  const dotIndex = rawName.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? rawName.substring(0, dotIndex) : rawName;

  // Clean common prefix like "01 - ", "01. ", "01 "
  const strippedPrefix = baseName.replace(/^\d+[\s\.\-_]+/, '').trim();

  // Check if there is an "Artist - Title" separator
  if (strippedPrefix.includes(' - ')) {
    const parts = strippedPrefix.split(' - ');
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim()
    };
  }

  // Check if underscore separator
  if (strippedPrefix.includes('_-_')) {
    const parts = strippedPrefix.split('_-_');
    return {
      artist: parts[0].replace(/_/g, ' ').trim(),
      title: parts.slice(1).join('_-_').replace(/_/g, ' ').trim()
    };
  }

  // Fallback: title is cleaned filename, artist is Unknown
  return {
    title: strippedPrefix.replace(/_/g, ' '),
    artist: 'Local Artist'
  };
}

function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = url;
    audio.preload = 'metadata';
    const timer = setTimeout(() => {
      resolve(180); // fallback 3 minutes if unable to decode quickly
    }, 3000);

    audio.onloadedmetadata = () => {
      clearTimeout(timer);
      resolve(Math.round(audio.duration) || 180);
    };

    audio.onerror = () => {
      clearTimeout(timer);
      resolve(180);
    };
  });
}

export async function parseAudioFiles(
  files: FileList | File[]
): Promise<{ tracks: Track[]; folderName?: string }> {
  const fileArray = Array.from(files);
  const audioFiles = fileArray.filter((file) => {
    const name = file.name.toLowerCase();
    return AUDIO_EXTENSIONS.some((ext) => name.endsWith(ext)) || file.type.startsWith('audio/');
  });

  if (audioFiles.length === 0) {
    return { tracks: [] };
  }

  // Detect common folder name if imported via webkitRelativePath
  let detectedFolder: string | undefined;
  if (audioFiles[0].webkitRelativePath) {
    const pathParts = audioFiles[0].webkitRelativePath.split('/');
    if (pathParts.length > 1) {
      detectedFolder = pathParts[0];
    }
  }

  const tracks: Track[] = [];

  for (let i = 0; i < audioFiles.length; i++) {
    const file = audioFiles[i];
    const objectUrl = URL.createObjectURL(file);
    const { title, artist } = cleanFilename(file.name);
    const ext = file.name.split('.').pop()?.toUpperCase() || 'MP3';
    const duration = await getAudioDuration(objectUrl);
    const gradient = GRADIENT_PALETTES[i % GRADIENT_PALETTES.length];

    tracks.push({
      id: `uploaded-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      artist,
      album: detectedFolder || 'Local Music',
      duration,
      url: objectUrl,
      coverGradient: gradient,
      format: ext,
      fileSize: formatBytes(file.size),
      bitrate: ext === 'FLAC' ? '850 kbps' : '320 kbps',
      sampleRate: '44.1 kHz',
      folderPath: file.webkitRelativePath || file.name,
      year: new Date().getFullYear().toString(),
      isCustomUpload: true
    });
  }

  return {
    tracks,
    folderName: detectedFolder
  };
}

export function createPlaylistFromFolder(
  folderName: string,
  trackIds: string[]
): Playlist {
  return {
    id: `playlist-folder-${Date.now()}`,
    name: folderName || 'Imported Folder',
    description: `Contains ${trackIds.length} tracks imported from local folder`,
    coverGradient: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
    trackIds,
    createdAt: Date.now(),
    isFolderImport: true,
    folderName
  };
}
