import { contextBridge, ipcRenderer, shell } from 'electron';

const api = {
  platform: process.platform,

  // Theme management
  setTheme: (theme: 'light' | 'dark' | 'system') => ipcRenderer.invoke('set-theme', theme),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  onThemeUpdated: (callback: (isDark: boolean) => void) => {
    ipcRenderer.on('theme-updated', (_, isDark) => callback(isDark));
  },
  removeThemeListener: () => {
    ipcRenderer.removeAllListeners('theme-updated');
  },

  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // Answer window
  openAnswer: () => ipcRenderer.send('open-answer'),

  // External links
  openExternal: (url: string) => shell.openExternal(url),

  // Unified window control interface
  windowControls: {
    minimize: () => ipcRenderer.send('window-control', 'minimize'),
    maximize: () => {
      if (process.platform === 'linux') {
        ipcRenderer.send('window-control', 'toggle-maximize');
      } else {
        ipcRenderer.send('window-control', 'maximize');
      }
    },
    close: () => ipcRenderer.send('window-control', 'close'),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  },

  // Optional: Add camera permission helper here
  requestCameraPermission: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch {
      return false;
    }
  }
};

// Safely expose to the renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', api);
  } catch (error) {
    console.error('Failed to expose electron API:', error);
  }
} else {
  // Fallback for non-context-isolated environments (dev mode etc.)
  // @ts-ignore
  window.electron = api;
}
