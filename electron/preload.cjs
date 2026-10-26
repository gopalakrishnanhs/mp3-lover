const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  openFilesDialog: () => ipcRenderer.invoke('dialog-open-files'),
  openFolderDialog: () => ipcRenderer.invoke('dialog-open-folder'),
  getInitialFile: () => ipcRenderer.invoke('get-initial-file'),
  scanPath: (targetPath) => ipcRenderer.invoke('scan-path', targetPath),
  readMetadata: (filePath) => ipcRenderer.invoke('read-audio-metadata', filePath),
  getPathForFile: (file) => {
    try {
      if (webUtils && typeof webUtils.getPathForFile === 'function') {
        return webUtils.getPathForFile(file);
      }
    } catch (e) {
      console.warn('webUtils.getPathForFile error:', e);
    }
    return file?.path || '';
  },
  onOpenFile: (callback) => {
    ipcRenderer.on('open-file', (_event, filePath) => callback(filePath));
  }
});
