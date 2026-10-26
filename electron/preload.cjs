const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  openFilesDialog: () => ipcRenderer.invoke('dialog-open-files'),
  openFolderDialog: () => ipcRenderer.invoke('dialog-open-folder'),
  onOpenFile: (callback) => {
    ipcRenderer.on('open-file', (_event, filePath) => callback(filePath));
  }
});
