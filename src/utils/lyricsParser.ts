export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export function parseLrc(lrcText: string): LyricLine[] {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let match;
    const timestamps: number[] = [];
    timeRegex.lastIndex = 0;

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      const totalSec = min * 60 + sec + ms / 1000;
      timestamps.push(totalSec);
    }

    const cleanText = trimmed.replace(/\[\d{2}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();

    if (cleanText) {
      if (timestamps.length > 0) {
        for (const t of timestamps) {
          result.push({ time: t, text: cleanText });
        }
      } else {
        result.push({ time: -1, text: cleanText });
      }
    }
  }

  // Sort by time for synchronized playback
  return result.sort((a, b) => a.time - b.time);
}

export function findCurrentLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (lyrics.length === 0) return -1;
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= currentTime && lyrics[i].time !== -1) {
      activeIndex = i;
    } else if (lyrics[i].time > currentTime) {
      break;
    }
  }
  return activeIndex;
}
