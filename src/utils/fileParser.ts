import { Playlist, Track } from '../types/player';
import { extractMetadataFromFile, ParsedAudioMetadata } from './id3Parser';

const AUDIO_EXTENSIONS = [
  '.mp3', '.wav', '.flac', '.m4a', '.aac', 
  '.ogg', '.weba', '.wma', '.opus', '.aiff', '.alac', '.ape'
];

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
  if (!bytes || bytes === 0) return 'Unknown size';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function cleanFilename(rawName: string): { title: string; artist: string } {
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

  // Fallback: title is cleaned filename, artist is Local Artist
  return {
    title: strippedPrefix.replace(/_/g, ' '),
    artist: 'Local Artist'
  };
}

export function isAudioFile(fileName: string, mimeType?: string): boolean {
  if (!fileName) return false;
  const lower = fileName.trim().toLowerCase();
  const hasAudioExt = AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext));
  const isAudioMime = mimeType ? mimeType.toLowerCase().startsWith('audio') : false;
  return hasAudioExt || isAudioMime;
}

export async function parseAudioFiles(
  files: FileList | File[]
): Promise<{ tracks: Track[]; folderName?: string }> {
  const fileArray = Array.from(files);
  const audioFiles = fileArray.filter((file) => isAudioFile(file.name, file.type));

  if (audioFiles.length === 0) {
    return { tracks: [] };
  }

  // Detect folder name if imported via webkitRelativePath
  let detectedFolder: string | undefined;
  if (audioFiles[0].webkitRelativePath) {
    const pathParts = audioFiles[0].webkitRelativePath.split('/');
    if (pathParts.length > 1) {
      detectedFolder = pathParts[0];
    }
  }

  const tracks: Track[] = await Promise.all(
    audioFiles.map(async (file, i) => {
      const objectUrl = URL.createObjectURL(file);
      const cleaned = cleanFilename(file.name);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'MP3';
      const gradient = GRADIENT_PALETTES[i % GRADIENT_PALETTES.length];

      // Extract ID3/FLAC metadata & embedded cover art
      let meta: ParsedAudioMetadata = {};
      try {
        meta = await extractMetadataFromFile(file);
      } catch (err) {
        console.warn('Metadata extraction failed for:', file.name, err);
      }

      return {
        id: `uploaded-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
        title: meta.title || cleaned.title,
        artist: meta.artist || cleaned.artist,
        album: meta.album || detectedFolder || 'Local Music',
        duration: 0, // Will be updated automatically on loadedmetadata
        url: objectUrl,
        coverGradient: gradient,
        coverUrl: meta.coverUrl,
        format: ext,
        fileSize: formatBytes(file.size),
        bitrate: ext === 'FLAC' ? '850 kbps' : '320 kbps',
        sampleRate: '44.1 kHz',
        folderPath: file.webkitRelativePath || file.name,
        year: meta.year || new Date().getFullYear().toString(),
        isCustomUpload: true
      };
    })
  );

  return {
    tracks,
    folderName: detectedFolder
  };
}

export function parseNativeFiles(
  nativeFiles: Array<{ 
    filePath: string; 
    fileName: string; 
    size: number;
    metadata?: ParsedAudioMetadata | null;
  }>,
  folderName?: string
): Track[] {
  return nativeFiles.map((item, i) => {
    const cleaned = cleanFilename(item.fileName);
    const ext = item.fileName.split('.').pop()?.toUpperCase() || 'MP3';
    const gradient = GRADIENT_PALETTES[i % GRADIENT_PALETTES.length];
    const meta = item.metadata || {};
    
    // In Electron, use our custom protocol app-media://load/<encodedPath>
    // This allows byte-range streaming, fast seek, and zero CORS restrictions!
    const fileUrl = `app-media://load/${encodeURIComponent(item.filePath)}`;

    return {
      id: `native-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      title: meta.title || cleaned.title,
      artist: meta.artist || cleaned.artist,
      album: meta.album || folderName || 'Local Music',
      duration: 0,
      url: fileUrl,
      coverGradient: gradient,
      coverUrl: meta.coverUrl,
      format: ext,
      fileSize: formatBytes(item.size),
      bitrate: ext === 'FLAC' ? '850 kbps' : '320 kbps',
      sampleRate: '44.1 kHz',
      folderPath: item.filePath,
      year: meta.year || new Date().getFullYear().toString(),
      isCustomUpload: true
    };
  });
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
