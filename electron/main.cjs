const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let fileToOpenOnLaunch = null;

// Parse file passed via Windows file association (e.g. double click .mp3)
function getFilePathFromArgs(argv) {
  const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.weba', '.wma'];
  for (const arg of argv) {
    if (arg && typeof arg === 'string') {
      const lower = arg.toLowerCase();
      if (audioExtensions.some(ext => lower.endsWith(ext))) {
        if (fs.existsSync(arg)) {
          return arg;
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
    minWidth: 900,
    minHeight: 600,
    title: 'AeroGlass Audio Player',
    autoHideMenuBar: true,
    frame: false, // Clean borderless window with WinUI titlebar
    backgroundColor: '#020617',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allows playing local audio files via file:// or custom protocol
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
      fileToOpenOnLaunch = null;
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

// Helper to scan directory recursively for audio files
function scanDirectoryForAudio(dirPath) {
  const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg', '.weba', '.wma', '.opus'];
  const results = [];

  function traverse(current) {
    try {
      const items = fs.readdirSync(current, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(current, item.name);
        if (item.isDirectory()) {
          traverse(fullPath);
        } else if (item.isFile()) {
          const lower = item.name.toLowerCase();
          if (audioExtensions.some(ext => lower.endsWith(ext))) {
            const stats = fs.statSync(fullPath);
            results.push({
              filePath: fullPath,
              fileName: item.name,
              size: stats.size
            });
          }
        }
      }
    } catch (e) {
      console.warn('Error reading dir:', current, e);
    }
  }

  traverse(dirPath);
  return results;
}

// Native Dialog: Open Audio Files
ipcMain.handle('dialog-open-files', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select MP3 & Audio Files',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'wma', 'opus'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths.map(filePath => {
    const stats = fs.statSync(filePath);
    return {
      filePath,
      fileName: path.basename(filePath),
      size: stats.size
    };
  });
});

// Native Dialog: Open Folder and play all songs
ipcMain.handle('dialog-open-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Folder with Music',
    properties: ['openDirectory']
  });

  if (result.canceled || result.filePaths.length === 0) {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
