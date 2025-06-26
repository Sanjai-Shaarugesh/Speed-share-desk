import { app, shell, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset'

const isDark = nativeTheme.shouldUseDarkColors

let mainWindow: BrowserWindow | null = null;
let answerWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', 
    titleBarOverlay: {
    color: isDark ? '#0f172a' : '#f8fafc',        // very dark bg (slate-900)
    symbolColor: isDark ? '#f1f5f9' : '#334155',  // light text (slate-100 / slate-700)
    height: 32
  },

      ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Theme updates
  nativeTheme.on('updated', () => {
    if (mainWindow) {
      const isDark = nativeTheme.shouldUseDarkColors;
      mainWindow.setTitleBarOverlay({
        color: isDark ? '#1e293b' : '#f8fafc',
        symbolColor: isDark ? '#e2e8f0' : '#475569',
      });
      mainWindow.webContents.send('theme-updated', isDark);
    }
    // Also update answer window if it exists
    if (answerWindow) {
      const isDark = nativeTheme.shouldUseDarkColors;
      answerWindow.setTitleBarOverlay({
        color: isDark ? '#1e293b' : '#f8fafc',
        symbolColor: isDark ? '#e2e8f0' : '#475569',
      });
      answerWindow.webContents.send('theme-updated', isDark);
    }
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function createAnswerWindow(): void {
  // Check if answer window already exists and is not destroyed
  if (answerWindow && !answerWindow.isDestroyed()) {
    answerWindow.focus();
    return;
  }

  answerWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: nativeTheme.shouldUseDarkColors ? '#1e293b' : '#f8fafc',
      symbolColor: nativeTheme.shouldUseDarkColors ? '#e2e8f0' : '#475569',
      height: 32,
    },
    parent: mainWindow || undefined, // Make it a child of main window if exists
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  answerWindow.on('ready-to-show', () => {
    answerWindow?.show();
  });

  answerWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Handle window closed
  answerWindow.on('closed', () => {
    answerWindow = null;
  });

  // Load the answer page
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // In development, load with hash route
    answerWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/answer`);
  } else {
  
    answerWindow.loadFile(join(__dirname, '../renderer/index.html'));
    

    
    // After loading, navigate to answer route
    answerWindow.webContents.once('did-finish-load', () => {
      answerWindow?.webContents.executeJavaScript(`
        window.location.hash = '/answer';
      `);
    });
  }
}

// Theme handling
ipcMain.handle('set-theme', (_, theme: 'light' | 'dark' | 'system') => {
  nativeTheme.themeSource = theme;
});

ipcMain.handle('get-theme', () => {
  return {
    shouldUseDarkColors: nativeTheme.shouldUseDarkColors,
    themeSource: nativeTheme.themeSource,
  };
});

// main.ts
ipcMain.handle('get-gtk-theme', () => {
  if (process.platform !== 'linux') return null;
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

// Watch for theme changes
if (process.platform === 'linux') {
  nativeTheme.on('updated', () => {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    BrowserWindow.getAllWindows().forEach(win => {
      win.webContents.send('gtk-theme-changed', theme);
    });
  });
}

// Window controls
ipcMain.on('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  mainWindow?.close();
});

// Answer window handler
ipcMain.on('open-answer', () => {
  createAnswerWindow();
});

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});