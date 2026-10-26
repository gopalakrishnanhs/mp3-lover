const { app, BrowserWindow, shell, ipcMain, dialog, protocol, net } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

// Supported audio extensions across Windows
const AUDIO_EXTENSIONS = [
  '.mp3', '.wav', '.flac', '.m4a', '.aac', 
  '.ogg', '.weba', '.wma', '.opus', '.aiff', '.alac', '.ape'
];

// Register custom privileged scheme for streaming local audio without CORS or file:// limitations
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: true
    }
  }
]);

let mainWindow = null;
let fileToOpenOnLaunch = null;

// Parse file passed via Windows file association (e.g. double click .mp3 or Open With)
function getFilePathFromArgs(argv) {
  if (!argv || !Array.isArray(argv)) return null;
  for (const arg of argv) {
    if (arg && typeof arg === 'string') {
      const clean = arg.replace(/^["']|["']$/g, '').trim();
      const lower = clean.toLowerCase();
      if (AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext))) {
        try {
          if (fs.existsSync(clean)) {
            return path.resolve(clean);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }
  return null;
}

fileToOpenOnLaunch = getFilePathFromArgs(process.argv);

// Single Instance Lock for Windows
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      const openedFile = getFilePathFromArgs(argv);
      if (openedFile) {
        mainWindow.webContents.send('open-file', openedFile);
      }
    }
  });

  app.whenReady().then(() => {
    // Register custom protocol handler to stream audio files with byte-range support
    protocol.handle('app-media', (request) => {
      try {
        // Expected format: app-media://load/<encoded-filepath>
        const url = new URL(request.url);
        let rawPath = url.pathname;
        if (rawPath.startsWith('/load/')) {
          rawPath = rawPath.slice(6);
        } else if (rawPath.startsWith('/')) {
          rawPath = rawPath.slice(1);
        }
        const decodedPath = decodeURIComponent(rawPath);
        if (fs.existsSync(decodedPath)) {
          const fileUrl = pathToFileURL(decodedPath).toString();
          return net.fetch(fileUrl);
        }
        return new Response('File not found', { status: 404 });
      } catch (err) {
        console.error('Error handling app-media request:', err);
        return new Response('Internal error', { status: 500 });
      }
    });

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 800,
    minHeight: 520,
    title: 'AeroGlass Audio Player',
    autoHideMenuBar: true,
    frame: false, // Borderless window with WinUI titlebar
    backgroundColor: '#020617',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }

  mainWindow.webContents.on('did-finish-load', () => {
    if (fileToOpenOnLaunch) {
      mainWindow.webContents.send('open-file', fileToOpenOnLaunch);
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Window control IPC
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Initial file check for React on mount
ipcMain.handle('get-initial-file', () => {
  const file = fileToOpenOnLaunch;
  fileToOpenOnLaunch = null;
  return file;
});

// Helper to scan directory recursively for audio files
function scanDirectoryForAudio(dirPath, maxDepth = 6) {
  const results = [];

  function traverse(current, depth = 0) {
    if (depth > maxDepth) return;
    try {
      const items = fs.readdirSync(current, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(current, item.name);
        if (item.isDirectory()) {
          // Skip hidden system directories
          if (!item.name.startsWith('.')) {
            traverse(fullPath, depth + 1);
          }
        } else if (item.isFile()) {
          const lower = item.name.toLowerCase();
          if (AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext))) {
            try {
              const stats = fs.statSync(fullPath);
              results.push({
                filePath: fullPath,
                fileName: item.name,
                size: stats.size
              });
            } catch (e) {
              results.push({
                filePath: fullPath,
                fileName: item.name,
                size: 0
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error reading directory:', current, e);
    }
  }

  traverse(dirPath);
  return results;
}

// Decode ID3 frame text
function decodeFrameText(buf) {
  try {
    const enc = buf[0];
    const payload = buf.subarray(1);
    if (enc === 1) {
      // utf-16 with bom
      return payload.toString('utf16le').replace(/\0+$/, '').trim();
    } else if (enc === 2) {
      return payload.swap16().toString('utf16le').replace(/\0+$/, '').trim();
    } else if (enc === 3) {
      return payload.toString('utf8').replace(/\0+$/, '').trim();
    } else {
      return payload.toString('latin1').replace(/\0+$/, '').trim();
    }
  } catch (e) {
    return '';
  }
}

// Fast synchronous audio metadata & embedded cover art reader for local files
function readAudioMetadataFromFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(512 * 1024);
    const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    if (bytesRead < 10) return null;

    const data = buf.subarray(0, bytesRead);
    const result = {};

    // ID3v2 check
    if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
      const versionMajor = data[3];
      const tagSize = ((data[6] & 0x7f) << 21) | ((data[7] & 0x7f) << 14) | ((data[8] & 0x7f) << 7) | (data[9] & 0x7f);
      const totalBytes = Math.min(10 + tagSize, data.length);
      let offset = 10;
      const isV22 = versionMajor === 2;

      while (offset + (isV22 ? 6 : 10) < totalBytes) {
        if (data[offset] === 0) break;
        let frameId, frameSize;
        if (isV22) {
          frameId = data.toString('latin1', offset, offset + 3);
          frameSize = (data[offset + 3] << 16) | (data[offset + 4] << 8) | data[offset + 5];
          offset += 6;
        } else {
          frameId = data.toString('latin1', offset, offset + 4);
          if (versionMajor === 4) {
            frameSize = ((data[offset + 4] & 0x7f) << 21) | ((data[offset + 5] & 0x7f) << 14) | ((data[offset + 6] & 0x7f) << 7) | (data[offset + 7] & 0x7f);
          } else {
            frameSize = data.readUInt32BE(offset + 4);
          }
          offset += 10;
        }

        if (frameSize <= 0 || offset + frameSize > data.length) break;
        const frameData = data.subarray(offset, offset + frameSize);
        offset += frameSize;

        // Parse APIC (Attached Picture)
        if (frameId === 'APIC' && !result.coverUrl) {
          try {
            const enc = frameData[0];
            let ptr = 1;
            while (ptr < frameData.length && frameData[ptr] !== 0) ptr++;
            let mime = frameData.toString('latin1', 1, ptr) || 'image/jpeg';
            if (!mime.includes('/')) mime = 'image/' + mime.toLowerCase();
            ptr++; // skip null
            ptr++; // skip pic type
            if (enc === 1 || enc === 2) {
              while (ptr + 1 < frameData.length) {
                if (frameData[ptr] === 0 && frameData[ptr + 1] === 0) { ptr += 2; break; }
                ptr += 2;
              }
            } else {
              while (ptr < frameData.length && frameData[ptr] !== 0) ptr++;
              ptr++;
            }
            if (ptr < frameData.length) {
              const imgBuf = frameData.subarray(ptr);
              if (imgBuf.length > 16) {
                if (imgBuf[0] === 0xff && imgBuf[1] === 0xd8) mime = 'image/jpeg';
                else if (imgBuf[0] === 0x89 && imgBuf[1] === 0x50) mime = 'image/png';
                result.coverUrl = `data:${mime};base64,${imgBuf.toString('base64')}`;
              }
            }
          } catch (e) {}
        } else if (frameId === 'PIC' && !result.coverUrl) {
          try {
            const enc = frameData[0];
            let ptr = 1;
            const imgFmt = frameData.toString('latin1', 1, 4).toLowerCase();
            const mime = imgFmt === 'png' ? 'image/png' : 'image/jpeg';
            ptr += 4; // format + pic type
            if (enc === 1 || enc === 2) {
              while (ptr + 1 < frameData.length) {
                if (frameData[ptr] === 0 && frameData[ptr + 1] === 0) { ptr += 2; break; }
                ptr += 2;
              }
            } else {
              while (ptr < frameData.length && frameData[ptr] !== 0) ptr++;
              ptr++;
            }
            if (ptr < frameData.length) {
              const imgBuf = frameData.subarray(ptr);
              if (imgBuf.length > 16) {
                result.coverUrl = `data:${mime};base64,${imgBuf.toString('base64')}`;
              }
            }
          } catch (e) {}
        } else if (frameId === 'TIT2' || frameId === 'TT2') {
          if (!result.title && frameData.length > 1) {
            result.title = decodeFrameText(frameData);
          }
        } else if (frameId === 'TPE1' || frameId === 'TP1') {
          if (!result.artist && frameData.length > 1) {
            result.artist = decodeFrameText(frameData);
          }
        } else if (frameId === 'TALB' || frameId === 'TAL') {
          if (!result.album && frameData.length > 1) {
            result.album = decodeFrameText(frameData);
          }
        } else if (frameId === 'TYER' || frameId === 'TYE' || frameId === 'TDRC') {
          if (!result.year && frameData.length > 1) {
            result.year = decodeFrameText(frameData).substring(0, 4);
          }
        }
      }
    } else if (data[0] === 0x66 && data[1] === 0x4c && data[2] === 0x61 && data[3] === 0x43) {
      // FLAC
      let offset = 4;
      while (offset + 4 < data.length) {
        const headerByte = data[offset];
        const isLast = (headerByte & 0x80) !== 0;
        const blockType = headerByte & 0x7f;
        const blockLen = (data[offset + 1] << 16) | (data[offset + 2] << 8) | data[offset + 3];
        offset += 4;
        if (offset + blockLen > data.length) break;

        if (blockType === 6 && !result.coverUrl) {
          try {
            let p = offset + 4;
            const mimeLen = data.readUInt32BE(p);
            p += 4;
            const mime = data.toString('latin1', p, p + mimeLen) || 'image/jpeg';
            p += mimeLen;
            const descLen = data.readUInt32BE(p);
            p += 4 + descLen + 16;
            const picLen = data.readUInt32BE(p);
            p += 4;
            if (p + picLen <= offset + blockLen) {
              const picBuf = data.subarray(p, p + picLen);
              result.coverUrl = `data:${mime};base64,${picBuf.toString('base64')}`;
            }
          } catch (e) {}
        } else if (blockType === 4) {
          try {
            let p = offset;
            const vendorLen = data.readUInt32BE(p);
            p += 4 + vendorLen;
            const commentsCount = data.readUInt32BE(p);
            p += 4;
            for (let i = 0; i < commentsCount && p + 4 < offset + blockLen; i++) {
              const cLen = data.readUInt32BE(p);
              p += 4;
              if (p + cLen > offset + blockLen) break;
              const commentStr = data.toString('utf8', p, p + cLen);
              p += cLen;
              const eq = commentStr.indexOf('=');
              if (eq !== -1) {
                const k = commentStr.slice(0, eq).toUpperCase();
                const v = commentStr.slice(eq + 1).trim();
                if (k === 'TITLE' && !result.title) result.title = v;
                if (k === 'ARTIST' && !result.artist) result.artist = v;
                if (k === 'ALBUM' && !result.album) result.album = v;
              }
            }
          } catch (e) {}
        }
        if (isLast) break;
        offset += blockLen;
      }
    }

    return result;
  } catch (err) {
    console.warn('Error reading metadata from file:', filePath, err);
    return null;
  }
}

// IPC handler to read metadata for any audio path
ipcMain.handle('read-audio-metadata', async (_event, filePath) => {
  return readAudioMetadataFromFile(filePath);
});

// Native Dialog: Open Audio Files
ipcMain.handle('dialog-open-files', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select MP3 & Audio Files',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio Files (*.mp3, *.wav, *.flac, *.m4a, *.aac, *.ogg, *.wma)', extensions: ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'wma', 'opus', 'weba', 'aiff', 'alac', 'ape'] },
      { name: 'MP3 Audio (*.mp3)', extensions: ['mp3'] },
      { name: 'All Files (*.*)', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths.map(filePath => {
    let size = 0;
    try {
      const stats = fs.statSync(filePath);
      size = stats.size;
    } catch (e) {}
    const metadata = readAudioMetadataFromFile(filePath);
    return {
      filePath,
      fileName: path.basename(filePath),
      size,
      metadata
    };
  });
});

// Native Dialog: Open Folder and scan all songs
ipcMain.handle('dialog-open-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Folder with Music',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
    return null;
  }

  const selectedFolder = result.filePaths[0];
  const folderName = path.basename(selectedFolder);
  const files = scanDirectoryForAudio(selectedFolder);

  return {
    folderName,
    folderPath: selectedFolder,
    files
  };
});

// Scan dropped path (file or directory) from drag-and-drop
ipcMain.handle('scan-path', async (_event, targetPath) => {
  try {
    if (!fs.existsSync(targetPath)) return null;
    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) {
      const files = scanDirectoryForAudio(targetPath);
      return {
        isFolder: true,
        folderName: path.basename(targetPath),
        folderPath: targetPath,
        files
      };
    } else if (stats.isFile()) {
      const lower = path.basename(targetPath).toLowerCase();
      if (AUDIO_EXTENSIONS.some(ext => lower.endsWith(ext))) {
        return {
          isFolder: false,
          files: [{
            filePath: targetPath,
            fileName: path.basename(targetPath),
            size: stats.size
          }]
        };
      }
    }
  } catch (e) {
    console.error('Error scanning path:', targetPath, e);
  }
  return null;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
