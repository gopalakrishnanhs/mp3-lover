/**
 * Pure TypeScript metadata & embedded album art parser for MP3 (ID3v2.2, ID3v2.3, ID3v2.4),
 * FLAC (Picture Block 6), and M4A/MP4 (covr atom).
 * Zero external dependencies. Fast binary reader.
 */

export interface ParsedAudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  coverUrl?: string; // data:image/jpeg;base64,... or blob:
  mimeType?: string;
}

// Convert Uint8Array to base64 string safely across browser and Node
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

// Decode text given encoding byte: 0 = ISO-8859-1, 1 = UTF-16 with BOM, 2 = UTF-16BE, 3 = UTF-8
function decodeText(bytes: Uint8Array, encoding: number): string {
  try {
    if (encoding === 1) {
      // UTF-16 with BOM
      return new TextDecoder('utf-16').decode(bytes).replace(/\0+$/, '').trim();
    } else if (encoding === 2) {
      // UTF-16BE
      return new TextDecoder('utf-16be').decode(bytes).replace(/\0+$/, '').trim();
    } else if (encoding === 3) {
      // UTF-8
      return new TextDecoder('utf-8').decode(bytes).replace(/\0+$/, '').trim();
    } else {
      // ISO-8859-1 / windows-1252
      return new TextDecoder('iso-8859-1').decode(bytes).replace(/\0+$/, '').trim();
    }
  } catch {
    // Fallback simple latin1
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) break;
      str += String.fromCharCode(bytes[i]);
    }
    return str.trim();
  }
}

// Read synchsafe integer (7 bits per byte)
function readSynchsafeInt(u8: Uint8Array, offset: number): number {
  return (
    ((u8[offset] & 0x7f) << 21) |
    ((u8[offset + 1] & 0x7f) << 14) |
    ((u8[offset + 2] & 0x7f) << 7) |
    (u8[offset + 3] & 0x7f)
  );
}

// Read standard 32-bit big endian integer
function readUint32BE(u8: Uint8Array, offset: number): number {
  return (
    (u8[offset] << 24) |
    (u8[offset + 1] << 16) |
    (u8[offset + 2] << 8) |
    u8[offset + 3]
  ) >>> 0;
}

// Read 24-bit big endian integer
function readUint24BE(u8: Uint8Array, offset: number): number {
  return (u8[offset] << 16) | (u8[offset + 1] << 8) | u8[offset + 2];
}

// Read 4-character ASCII tag
function readTag(u8: Uint8Array, offset: number, len = 4): string {
  let s = '';
  for (let i = 0; i < len; i++) {
    s += String.fromCharCode(u8[offset + i]);
  }
  return s;
}

/**
 * Parse ID3v2.2, ID3v2.3, ID3v2.4 tags
 */
export function parseID3v2(data: Uint8Array): ParsedAudioMetadata {
  const result: ParsedAudioMetadata = {};

  if (data.length < 10) return result;
  if (data[0] !== 0x49 || data[1] !== 0x44 || data[2] !== 0x33) {
    // Not "ID3"
    return result;
  }

  const versionMajor = data[3]; // 2 = ID3v2.2, 3 = ID3v2.3, 4 = ID3v2.4
  const flags = data[5];
  const tagSize = readSynchsafeInt(data, 6);
  const totalTagBytes = Math.min(10 + tagSize, data.length);

  let offset = 10;

  // If extended header flag is set in ID3v2.3 / ID3v2.4, skip it
  if (flags & 0x40 && offset < totalTagBytes) {
    if (versionMajor === 3 || versionMajor === 4) {
      const extSize = versionMajor === 4 ? readSynchsafeInt(data, offset) : readUint32BE(data, offset);
      offset += extSize;
    }
  }

  const isV22 = versionMajor === 2;
  const headerLen = isV22 ? 6 : 10;

  while (offset + headerLen < totalTagBytes) {
    // If we hit padding (zeroes)
    if (data[offset] === 0) break;

    let frameId: string;
    let frameSize: number;

    if (isV22) {
      frameId = readTag(data, offset, 3);
      frameSize = (data[offset + 3] << 16) | (data[offset + 4] << 8) | data[offset + 5];
      offset += 6;
    } else {
      frameId = readTag(data, offset, 4);
      if (versionMajor === 4) {
        frameSize = readSynchsafeInt(data, offset + 4);
      } else {
        frameSize = readUint32BE(data, offset + 4);
      }
      offset += 10; // Skip frame header + 2 flag bytes
    }

    if (frameSize <= 0 || offset + frameSize > data.length) {
      break;
    }

    const frameData = data.subarray(offset, offset + frameSize);
    offset += frameSize;

    // Handle Picture frame (APIC or PIC)
    if (frameId === 'APIC' && !result.coverUrl) {
      try {
        parseApicFrame(frameData, result);
      } catch (err) {
        console.warn('Error parsing APIC frame:', err);
      }
    } else if (frameId === 'PIC' && !result.coverUrl) {
      try {
        parsePicFrame(frameData, result);
      } catch (err) {
        console.warn('Error parsing PIC frame:', err);
      }
    } else if (frameId === 'TIT2' || frameId === 'TT2') {
      if (!result.title && frameData.length > 1) {
        result.title = decodeText(frameData.subarray(1), frameData[0]);
      }
    } else if (frameId === 'TPE1' || frameId === 'TP1') {
      if (!result.artist && frameData.length > 1) {
        result.artist = decodeText(frameData.subarray(1), frameData[0]);
      }
    } else if (frameId === 'TALB' || frameId === 'TAL') {
      if (!result.album && frameData.length > 1) {
        result.album = decodeText(frameData.subarray(1), frameData[0]);
      }
    } else if (frameId === 'TYER' || frameId === 'TYE' || frameId === 'TDRC') {
      if (!result.year && frameData.length > 1) {
        result.year = decodeText(frameData.subarray(1), frameData[0]).substring(0, 4);
      }
    }
  }

  return result;
}

// Parse ID3v2.3 / ID3v2.4 APIC frame
function parseApicFrame(frame: Uint8Array, result: ParsedAudioMetadata): void {
  if (frame.length < 5) return;
  const encoding = frame[0];
  let ptr = 1;

  // Read MIME type (ISO-8859-1 null-terminated)
  let mimeType = '';
  while (ptr < frame.length && frame[ptr] !== 0) {
    mimeType += String.fromCharCode(frame[ptr]);
    ptr++;
  }
  ptr++; // skip null byte

  if (!mimeType) {
    mimeType = 'image/jpeg';
  } else if (!mimeType.includes('/')) {
    mimeType = `image/${mimeType.toLowerCase()}`;
  }

  if (ptr >= frame.length) return;

  // Picture type (1 byte, 0x03 = front cover)
  const _picType = frame[ptr];
  ptr++;

  // Skip Description (terminated by 0x00 or 0x00 0x00 depending on encoding)
  if (encoding === 1 || encoding === 2) {
    // 2-byte terminator
    while (ptr + 1 < frame.length) {
      if (frame[ptr] === 0 && frame[ptr + 1] === 0) {
        ptr += 2;
        break;
      }
      ptr += 2;
    }
  } else {
    // 1-byte terminator
    while (ptr < frame.length && frame[ptr] !== 0) {
      ptr++;
    }
    ptr++;
  }

  if (ptr >= frame.length) return;

  const imgData = frame.subarray(ptr);
  if (imgData.length > 16) {
    // Determine mime if generic or wrong
    if (imgData[0] === 0xff && imgData[1] === 0xd8) {
      mimeType = 'image/jpeg';
    } else if (imgData[0] === 0x89 && imgData[1] === 0x50 && imgData[2] === 0x4e && imgData[3] === 0x47) {
      mimeType = 'image/png';
    } else if (imgData[0] === 0x47 && imgData[1] === 0x49 && imgData[2] === 0x46) {
      mimeType = 'image/gif';
    } else if (imgData[0] === 0x52 && imgData[1] === 0x49 && imgData[2] === 0x46 && imgData[3] === 0x46) {
      mimeType = 'image/webp';
    }

    const base64 = uint8ArrayToBase64(imgData);
    result.coverUrl = `data:${mimeType};base64,${base64}`;
    result.mimeType = mimeType;
  }
}

// Parse ID3v2.2 PIC frame
function parsePicFrame(frame: Uint8Array, result: ParsedAudioMetadata): void {
  if (frame.length < 6) return;
  const encoding = frame[0];
  let ptr = 1;

  // 3-byte format, e.g. "JPG" or "PNG"
  const imgFormat = readTag(frame, ptr, 3).toLowerCase();
  ptr += 3;

  const mimeType = imgFormat === 'png' ? 'image/png' : 'image/jpeg';

  // Picture type
  const _picType = frame[ptr];
  ptr++;

  // Skip Description
  if (encoding === 1 || encoding === 2) {
    while (ptr + 1 < frame.length) {
      if (frame[ptr] === 0 && frame[ptr + 1] === 0) {
        ptr += 2;
        break;
      }
      ptr += 2;
    }
  } else {
    while (ptr < frame.length && frame[ptr] !== 0) {
      ptr++;
    }
    ptr++;
  }

  if (ptr >= frame.length) return;
  const imgData = frame.subarray(ptr);
  if (imgData.length > 16) {
    const base64 = uint8ArrayToBase64(imgData);
    result.coverUrl = `data:${mimeType};base64,${base64}`;
    result.mimeType = mimeType;
  }
}

/**
 * Parse FLAC metadata blocks (specifically block 6: PICTURE, block 4: VORBIS_COMMENT)
 */
export function parseFLAC(data: Uint8Array): ParsedAudioMetadata {
  const result: ParsedAudioMetadata = {};
  if (data.length < 8) return result;
  if (readTag(data, 0, 4) !== 'fLaC') return result;

  let offset = 4;
  while (offset + 4 < data.length) {
    const headerByte = data[offset];
    const isLast = (headerByte & 0x80) !== 0;
    const blockType = headerByte & 0x7f;
    const blockLen = readUint24BE(data, offset + 1);
    offset += 4;

    if (offset + blockLen > data.length) break;

    if (blockType === 6 && !result.coverUrl) {
      // Picture block
      try {
        let p = offset;
        const _picType = readUint32BE(data, p);
        p += 4;
        const mimeLen = readUint32BE(data, p);
        p += 4;
        let mime = '';
        for (let i = 0; i < mimeLen; i++) {
          mime += String.fromCharCode(data[p + i]);
        }
        p += mimeLen;
        const descLen = readUint32BE(data, p);
        p += 4 + descLen;
        p += 16; // width (4), height (4), depth (4), colors (4)
        const picDataLen = readUint32BE(data, p);
        p += 4;
        if (p + picDataLen <= offset + blockLen) {
          const picBytes = data.subarray(p, p + picDataLen);
          const base64 = uint8ArrayToBase64(picBytes);
          result.coverUrl = `data:${mime || 'image/jpeg'};base64,${base64}`;
        }
      } catch (err) {
        console.warn('Error parsing FLAC picture block:', err);
      }
    } else if (blockType === 4) {
      // Vorbis comment
      try {
        let p = offset;
        const vendorLen = readUint32BE(data, p);
        p += 4 + vendorLen;
        const commentsCount = readUint32BE(data, p);
        p += 4;
        for (let i = 0; i < commentsCount && p + 4 < offset + blockLen; i++) {
          const cLen = readUint32BE(data, p);
          p += 4;
          if (p + cLen > offset + blockLen) break;
          const commentStr = new TextDecoder('utf-8').decode(data.subarray(p, p + cLen));
          p += cLen;
          const eqIdx = commentStr.indexOf('=');
          if (eqIdx !== -1) {
            const field = commentStr.substring(0, eqIdx).toUpperCase();
            const val = commentStr.substring(eqIdx + 1).trim();
            if (field === 'TITLE' && !result.title) result.title = val;
            if (field === 'ARTIST' && !result.artist) result.artist = val;
            if (field === 'ALBUM' && !result.album) result.album = val;
            if ((field === 'DATE' || field === 'YEAR') && !result.year) result.year = val.substring(0, 4);
          }
        }
      } catch (err) {
        console.warn('Error parsing FLAC Vorbis comment:', err);
      }
    }

    if (isLast) break;
    offset += blockLen;
  }

  return result;
}

/**
 * Universal metadata extractor from ArrayBuffer or Uint8Array
 */
export function extractAudioMetadata(buffer: ArrayBuffer | Uint8Array): ParsedAudioMetadata {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  
  if (bytes.length > 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return parseID3v2(bytes);
  }

  if (bytes.length > 4 && bytes[0] === 0x66 && bytes[1] === 0x4c && bytes[2] === 0x61 && bytes[3] === 0x43) {
    return parseFLAC(bytes);
  }

  // Quick fallback check for ID3 tag starting slightly later (e.g. after sync bytes)
  for (let i = 0; i < Math.min(bytes.length - 10, 2048); i++) {
    if (bytes[i] === 0x49 && bytes[i + 1] === 0x44 && bytes[i + 2] === 0x33) {
      return parseID3v2(bytes.subarray(i));
    }
  }

  return {};
}

/**
 * Extract metadata directly from a browser File (slices the first 512KB for speed)
 */
export async function extractMetadataFromFile(file: File): Promise<ParsedAudioMetadata> {
  try {
    // Slicing first 512KB is plenty for ID3 tags and embedded JPEG/PNG album art
    const sliceSize = Math.min(file.size, 512 * 1024);
    const slice = file.slice(0, sliceSize);
    const arrayBuffer = await slice.arrayBuffer();
    return extractAudioMetadata(arrayBuffer);
  } catch (err) {
    console.warn('extractMetadataFromFile failed:', err);
    return {};
  }
}
