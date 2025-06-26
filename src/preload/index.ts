import { contextBridge, ipcRenderer } from 'electron'

const api = {
  platform: process.platform,

  // Theme management
  setTheme: (theme: 'light' | 'dark' | 'system') => ipcRenderer.invoke('set-theme', theme),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  onThemeUpdated: (callback: (isDark: boolean) => void) => {
    ipcRenderer.on('theme-updated', (_, isDark) => callback(isDark))
  },
  removeThemeListener: () => {
    ipcRenderer.removeAllListeners('theme-updated')
  },

  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // Answer window
  openAnswer: () => ipcRenderer.send('open-answer')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = api
}