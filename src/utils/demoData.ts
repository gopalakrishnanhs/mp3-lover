import { Playlist, Track } from '../types/player';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Neon Rain (Midnight Glass)',
    artist: 'Aero Collective',
    album: 'Liquid Horizons',
    duration: 48,
    url: '', // will be initialized dynamically or synthesized
    coverGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
    coverIcon: 'sparkles',
    format: 'FLAC',
    bitrate: '920 kbps',
    sampleRate: '48.0 kHz',
    fileSize: '6.4 MB',
    year: '2026',
    lyrics: `[00:00.00] (Liquid synth intro swells...)
[00:04.00] Refractions through the double glass
[00:08.50] City reflections that drift and pass
[00:12.50] In the midnight violet haze
[00:16.80] Lost inside the acrylic maze
[00:21.00] Floating above the neon glow
[00:25.50] Frequencies deep and tempos slow
[00:29.80] Clear as quartz, soft as rain
[00:34.00] Erasing every yesterday's pain
[00:38.50] Echoes fading in the dark
[00:43.00] Leaving just a golden spark`
  },
  {
    id: 'track-2',
    title: 'Mica Dreams (Aero Chill)',
    artist: 'Velvet Silica',
    album: 'Translucent Spaces',
    duration: 52,
    url: '',
    coverGradient: 'linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 50%, #10b981 100%)',
    coverIcon: 'disc',
    format: 'MP3',
    bitrate: '320 kbps',
    sampleRate: '44.1 kHz',
    fileSize: '2.1 MB',
    year: '2026',
    lyrics: `[00:00.00] (Soft vinyl warmth & Rhodes chords)
[00:05.50] Morning breeze across the frame
[00:11.00] Whispering an unspoken name
[00:16.50] Soft light spills on hardwood floors
[00:22.00] Gentle winds unlock closed doors
[00:28.00] Time slows down in tranquil blue
[00:34.00] Every harmonic pure and true
[00:40.00] Breathing in the quiet air
[00:46.00] Peace is lingering everywhere`
  },
  {
    id: 'track-3',
    title: 'Tokyo Velocity (Cyber Highway)',
    artist: 'Prism Circuit',
    album: 'Neon Pulse Drive',
    duration: 44,
    url: '',
    coverGradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)',
    coverIcon: 'zap',
    format: 'MP3',
    bitrate: '320 kbps',
    sampleRate: '44.1 kHz',
    fileSize: '1.9 MB',
    year: '2025',
    lyrics: `[00:00.00] (Cyber bass sequence kicks in)
[00:04.00] Shinjuku overpass in sight
[00:08.00] Slicing through the electric night
[00:12.00] Tachometer needle pinned on red
[00:16.00] Chasing the horizon straight ahead
[00:20.50] Laser ribbons in our rearview trail
[00:24.50] Fast lane speed that never fails
[00:29.00] Neon streak across the asphalt line
[00:33.50] Master of motion and design
[00:38.00] Outrun the dawn into the grid`
  },
  {
    id: 'track-4',
    title: 'Golden Hour Echoes',
    artist: 'Acoustic Glass Trio',
    album: 'Warm Reflections',
    duration: 50,
    url: '',
    coverGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 40%, #78350f 100%)',
    coverIcon: 'music',
    format: 'WAV',
    bitrate: '1411 kbps',
    sampleRate: '48.0 kHz',
    fileSize: '8.8 MB',
    year: '2026',
    lyrics: `[00:00.00] (Acoustic nylon & mellow upright bass)
[00:06.00] Amber rays through smoked glass pane
[00:12.00] Washing away the winter strain
[00:18.50] Chords of velvet, brass and wood
[00:24.50] Feeling life the way we should
[00:31.00] Coffee aroma in the afternoon
[00:37.00] Hummed along with a jazz refrain tune
[00:43.00] Twilight gently settles in`
  },
  {
    id: 'track-5',
    title: 'Northern Lights (Ambient Frost)',
    artist: 'Celestial Audio',
    album: 'Deep Acrylic',
    duration: 56,
    url: '',
    coverGradient: 'linear-gradient(135deg, #065f46 0%, #0d9488 40%, #38bdf8 100%)',
    coverIcon: 'cloud',
    format: 'FLAC',
    bitrate: '880 kbps',
    sampleRate: '48.0 kHz',
    fileSize: '5.9 MB',
    year: '2026',
    lyrics: `[00:00.00] (Glacial resonance & deep sub pads)
[00:08.00] Silent skies of emerald green
[00:16.00] The grandest wonder ever seen
[00:24.00] Dancing curtains of solar breath
[00:32.00] Floating above the frozen steppe
[00:40.00] Infinite crystal atmosphere
[00:48.00] Everything is still and clear`
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-all',
    name: 'All Tracks',
    description: 'Complete audio library with high-res audio tracks',
    coverGradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    trackIds: ['track-1', 'track-2', 'track-3', 'track-4', 'track-5'],
    createdAt: Date.now() - 3600000
  },
  {
    id: 'playlist-glass',
    name: 'Frosted Glass Lounge',
    description: 'Curated mellow beats, ambient pads and lofi chill',
    coverGradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
    trackIds: ['track-1', 'track-2', 'track-5'],
    createdAt: Date.now() - 1800000
  },
  {
    id: 'playlist-energy',
    name: 'Tokyo Neon Drive',
    description: 'High tempo synthwave and energetic rhythms',
    coverGradient: 'linear-gradient(135deg, #ea580c 0%, #ec4899 100%)',
    trackIds: ['track-3', 'track-4'],
    createdAt: Date.now() - 900000
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

