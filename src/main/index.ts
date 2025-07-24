import { app, shell, BrowserWindow, ipcMain, nativeTheme, dialog } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';

const isDark = nativeTheme.shouldUseDarkColors;
const icon = join(__dirname, '../../resources/icon2.webp');

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
      color: isDark ? '#0f172a' : '#f8fafc',
      symbolColor: isDark ? '#f1f5f9' : '#334155',
      height: 32,
    },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Handle permission requests with a dialog
  mainWindow.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    if (permission === 'media') {
      // Show a native dialog to ask for camera permission
      dialog
        .showMessageBox(mainWindow!, {
          type: 'question',
          buttons: ['Allow', 'Deny'],
          defaultId: 0,
          title: 'Camera Access Request',
          message: 'This application wants to access your camera for QR code scanning. Do you want to allow this?',
          detail:
            process.platform === 'linux'
              ? 'Ensure Flatpak camera permissions are enabled in your system settings.'
              : process.platform === 'darwin'
                ? 'You may need to grant camera access in System Preferences > Security & Privacy.'
                : 'You may need to grant camera access in Windows Settings > Privacy > Camera.',
        })
        .then((response) => {
          callback(response.response === 0); // Allow if user clicks "Allow" (index 0)
        })
        .catch((err) => {
          console.error('Error showing permission dialog:', err);
          callback(false); // Deny on error
        });
    } else {
      callback(false); // Deny all other permissions
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    // Automatically trigger QR scanner on window load
    mainWindow?.webContents.send('auto-open-qr-scanner');
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Theme updates
  nativeTheme.on('updated', () => {
    const isDark = nativeTheme.shouldUseDarkColors;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setTitleBarOverlay({
        color: isDark ? '#1e293b' : '#f8fafc',
        symbolColor: isDark ? '#e2e8f0' : '#475569',
      });
      mainWindow.webContents.send('theme-updated', isDark);
    }
    if (answerWindow && !answerWindow.isDestroyed()) {
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
    parent: mainWindow || undefined,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Handle permission requests with a dialog for answer window
  answerWindow.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    if (permission === 'media') {
      dialog
        .showMessageBox(answerWindow!, {
          type: 'question',
          buttons: ['Allow', 'Deny'],
          defaultId: 0,
          title: 'Camera Access Request',
          message: 'This application wants to access your camera for QR code scanning. Do you want to allow this?',
          detail:
            process.platform === 'linux'
              ? 'Ensure Flatpak camera permissions are enabled in your system settings.'
              : process.platform === 'darwin'
                ? 'You may need to grant camera access in System Preferences > Security & Privacy.'
                : 'You may need to grant camera access in Windows Settings > Privacy > Camera.',
        })
        .then((response) => {
          callback(response.response === 0); // Allow if user clicks "Allow" (index 0)
        })
        .catch((err) => {
          console.error('Error showing permission dialog:', err);
          callback(false); // Deny on error
        });
    } else {
      callback(false);
    }
  });

  answerWindow.on('ready-to-show', () => {
    answerWindow?.show();
  });

  answerWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  answerWindow.on('closed', () => {
    answerWindow = null;
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    answerWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/answer`);
  } else {
    answerWindow.loadFile(join(__dirname, '../renderer/index.html'));
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

// GTK theme handling for Linux
ipcMain.handle('get-gtk-theme', () => {
  if (process.platform !== 'linux') return null;
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

if (process.platform === 'linux') {
  nativeTheme.on('updated', () => {
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send('gtk-theme-changed', theme);
      }
    });
  });
}

// Window controls
ipcMain.on('minimize-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.close();
  }
});

// Answer window handler
ipcMain.on('open-answer', () => {
  createAnswerWindow();
});

// QR scanner handler
ipcMain.on('qr-scanned', (_event, data: string) => {
  console.log('QR Code Scanned:', data);
  if (answerWindow && !answerWindow.isDestroyed()) {
    answerWindow.webContents.send('qr-scanned', data);
  } else if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('qr-scanned', data);
  }
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
