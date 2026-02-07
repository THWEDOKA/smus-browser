import { app, BrowserWindow, BrowserView, ipcMain, session } from 'electron';
import * as path from 'path';

// Базовый блокировщик рекламы: домены для блокировки (можно расширить)
const ADBLOCK_HOSTS = new Set([
  'doubleclick.net', 'googlesyndication.com', 'googleadservices.com', 'google-analytics.com',
  'googletagservices.com', 'adservice.google.com', 'adnxs.com', 'criteo.com', 'ads.twitch.tv',
  'advertising.com', 'amazon-adsystem.com', 'scorecardresearch.com', '2mdn.net', 'admeld.com',
  'adform.net', 'adzerk.net', 'exelator.com', 'outbrain.com', 'taboola.com', 'mgid.com',
  'an.yandex.ru', 'mc.yandex.ru', 'yandexadexchange.net',
  'facebook.com/tr', 'connect.facebook.net/signals',
]);
function shouldBlockRequest(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return [...ADBLOCK_HOSTS].some(block => host === block || host.endsWith('.' + block));
  } catch {
    return false;
  }
}

// Хранилище для вкладок
const tabs = new Map<number, BrowserView>();
let mainWindow: BrowserWindow | null = null;
let activeTabId: number | null = null;

const isDev = !app.isPackaged;

// Высота панели (тайтлбар + адресная строка). Совпадает с UI для корректного resize.
const TOP_BAR_HEIGHT = 100;

function updateActiveViewBounds() {
  if (!mainWindow || activeTabId === null) return;
  const view = tabs.get(activeTabId);
  if (!view) return;
  const bounds = mainWindow.getBounds();
  view.setBounds({
    x: 0,
    y: TOP_BAR_HEIGHT,
    width: Math.max(0, bounds.width),
    height: Math.max(0, bounds.height - TOP_BAR_HEIGHT),
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: '#32463d',
    center: true,
    show: false, // Не показываем пока не загрузится
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  // Показываем окно когда оно готово
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Загружаем UI
  if (isDev) {
    // Пытаемся загрузить с повторными попытками
    const loadWithRetry = async (retries = 5) => {
      for (let i = 0; i < retries; i++) {
        try {
          await mainWindow!.loadURL('http://localhost:5173');
          console.log('✅ Successfully loaded Vite dev server');
          return;
        } catch (error) {
          console.log(`⏳ Attempt ${i + 1}/${retries} failed, retrying in 2s...`);
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            console.error('❌ Failed to load Vite dev server after', retries, 'attempts');
            throw error;
          }
        }
      }
    };

    loadWithRetry().catch(err => {
      console.error('Failed to load dev server:', err);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Контекстное меню
  mainWindow.webContents.on('context-menu', (event, params) => {
    const { Menu, MenuItem } = require('electron');
    const menu = new Menu();

    // Добавляем стандартные опции для текста
    if (params.selectionText) {
      menu.append(new MenuItem({
        label: 'Копировать',
        role: 'copy',
      }));
      menu.append(new MenuItem({
        label: 'Вырезать',
        role: 'cut',
      }));
      menu.append(new MenuItem({
        label: 'Вставить',
        role: 'paste',
      }));
      menu.append(new MenuItem({ type: 'separator' }));
    }

    // Добавляем опции навигации
    menu.append(new MenuItem({
      label: 'Назад',
      enabled: params.editFlags.canGoBack,
      click: () => {
        const view = tabs.get(activeTabId!);
        if (view && view.webContents.canGoBack()) {
          view.webContents.goBack();
        }
      },
    }));

    menu.append(new MenuItem({
      label: 'Вперед',
      enabled: params.editFlags.canGoForward,
      click: () => {
        const view = tabs.get(activeTabId!);
        if (view && view.webContents.canGoForward()) {
          view.webContents.goForward();
        }
      },
    }));

    menu.append(new MenuItem({
      label: 'Перезагрузить',
      click: () => {
        const view = tabs.get(activeTabId!);
        if (view) {
          view.webContents.reload();
        }
      },
    }));

    menu.append(new MenuItem({ type: 'separator' }));

    // Инструменты разработчика
    menu.append(new MenuItem({
      label: 'Инспектировать элемент',
      click: () => {
        const view = tabs.get(activeTabId!);
        if (view) {
          view.webContents.inspectElement(params.x, params.y);
          if (!view.webContents.isDevToolsOpened()) {
            view.webContents.openDevTools();
          }
        }
      },
    }));

    menu.append(new MenuItem({
      label: 'Открыть DevTools',
      accelerator: 'F12',
      click: () => {
        const view = tabs.get(activeTabId!);
        if (view) {
          if (view.webContents.isDevToolsOpened()) {
            view.webContents.closeDevTools();
          } else {
            view.webContents.openDevTools();
          }
        } else if (mainWindow) {
          // Для главного окна (UI)
          if (mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.webContents.closeDevTools();
          } else {
            mainWindow.webContents.openDevTools();
          }
        }
      },
    }));

    menu.popup();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Адаптивность: при изменении размера/положения окна обновляем bounds BrowserView
  mainWindow.on('resize', () => updateActiveViewBounds());
  mainWindow.on('move', () => updateActiveViewBounds());
}

// Создание BrowserView для вкладки
function createTab(tabId: number, url: string): BrowserView {
  if (!mainWindow) throw new Error('Main window not initialized');

  const view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  mainWindow.addBrowserView(view);

  const bounds = mainWindow.getBounds();
  view.setBounds({
    x: 0,
    y: TOP_BAR_HEIGHT,
    width: bounds.width,
    height: Math.max(0, bounds.height - TOP_BAR_HEIGHT),
  });

  view.setAutoResize({
    width: true,
    height: true,
  });

  // Загружаем URL
  if (url && url !== 'home' && url !== 'about:blank') {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    view.webContents.loadURL(fullUrl).catch(err => {
      console.error('Failed to load URL:', err);
    });
  }

  // События навигации
  view.webContents.on('did-start-loading', () => {
    mainWindow?.webContents.send('tab-loading', { tabId, loading: true });
  });

  view.webContents.on('did-stop-loading', () => {
    mainWindow?.webContents.send('tab-loading', { tabId, loading: false });
  });

  view.webContents.on('did-navigate', (event, url) => {
    mainWindow?.webContents.send('tab-navigated', { tabId, url });
  });

  view.webContents.on('page-title-updated', (event, title) => {
    mainWindow?.webContents.send('tab-title-updated', { tabId, title });
  });

  view.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (isMainFrame) {
      const errorType = getErrorType(errorCode, errorDescription);
      mainWindow?.webContents.send('tab-error', {
        tabId,
        error: {
          code: errorCode,
          description: errorDescription,
          url: validatedURL,
          type: errorType
        }
      });
    }
  });

  tabs.set(tabId, view);
  return view;
}

function getErrorType(errorCode: number, errorDescription: string): 'connection' | 'dns' | 'blocked' | 'timeout' | 'unknown' {
  const desc = errorDescription.toLowerCase();
  const code = errorCode;

  if (code === -7 || code === -3 || code === -2 || desc.includes('connection') || desc.includes('refused') || desc.includes('timed out')) {
    if (desc.includes('dns') || desc.includes('name') || desc.includes('host')) {
      return 'dns';
    }
    if (desc.includes('timeout') || desc.includes('timed out') || code === -7 || code === -3) {
      return 'timeout';
    }
    return 'connection';
  }
  if (code === -21 || desc.includes('block') || desc.includes('denied') || desc.includes('forbidden')) {
    return 'blocked';
  }
  return 'unknown';
}

// Скрыть все BrowserView (для настроек и главной страницы)
function hideAllViews() {
  if (!mainWindow) return;

  tabs.forEach((view) => {
    mainWindow?.removeBrowserView(view);
  });
  activeTabId = null;
}

// Переключение активной вкладки
function switchTab(tabId: number) {
  if (!mainWindow) return;

  // Скрываем все вкладки
  tabs.forEach((view) => {
    mainWindow?.removeBrowserView(view);
  });

  // Показываем активную
  const view = tabs.get(tabId);
  if (view) {
    mainWindow.addBrowserView(view);
    activeTabId = tabId;
    updateActiveViewBounds();
  }
}

// IPC обработчики
ipcMain.handle('create-tab', async (event, { tabId, url }) => {
  try {
    createTab(tabId, url);
    switchTab(tabId);
    return { success: true };
  } catch (error) {
    console.error('Error creating tab:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('switch-tab', async (event, { tabId }) => {
  try {
    switchTab(tabId);
    return { success: true };
  } catch (error) {
    console.error('Error switching tab:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('hide-all-views', async () => {
  try {
    hideAllViews();
    return { success: true };
  } catch (error) {
    console.error('Error hiding views:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('close-tab', async (event, { tabId }) => {
  try {
    const view = tabs.get(tabId);
    if (view && mainWindow) {
      mainWindow.removeBrowserView(view);
      (view.webContents as any).destroy();
      tabs.delete(tabId);
    }
    return { success: true };
  } catch (error) {
    console.error('Error closing tab:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('navigate', async (event, { tabId, url }) => {
  try {
    const view = tabs.get(tabId);
    if (view) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      await view.webContents.loadURL(fullUrl);
    }
    return { success: true };
  } catch (error) {
    console.error('Error navigating:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('go-back', async (event, { tabId }) => {
  try {
    const view = tabs.get(tabId);
    if (view && view.webContents.canGoBack()) {
      view.webContents.goBack();
    }
    return { success: true };
  } catch (error) {
    console.error('Error going back:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('go-forward', async (event, { tabId }) => {
  try {
    const view = tabs.get(tabId);
    if (view && view.webContents.canGoForward()) {
      view.webContents.goForward();
    }
    return { success: true };
  } catch (error) {
    console.error('Error going forward:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('reload', async (event, { tabId }) => {
  try {
    const view = tabs.get(tabId);
    if (view) {
      view.webContents.reload();
    }
    return { success: true };
  } catch (error) {
    console.error('Error reloading:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('close-window', async () => {
  try {
    if (mainWindow) {
      mainWindow.close();
    }
    return { success: true };
  } catch (error) {
    console.error('Error closing window:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('minimize-window', async () => {
  try {
    if (mainWindow) {
      mainWindow.minimize();
    }
    return { success: true };
  } catch (error) {
    console.error('Error minimizing window:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('maximize-window', async () => {
  try {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Error maximizing window:', error);
    return { success: false, error: String(error) };
  }
});

// Горячие клавиши
function registerShortcuts() {
  const { globalShortcut } = require('electron');

  // F12 - DevTools
  globalShortcut.register('F12', () => {
    if (mainWindow) {
      if (activeTabId !== null) {
        const view = tabs.get(activeTabId);
        if (view) {
          if (view.webContents.isDevToolsOpened()) {
            view.webContents.closeDevTools();
          } else {
            view.webContents.openDevTools();
          }
        }
      } else {
        // Для главного окна
        if (mainWindow.webContents.isDevToolsOpened()) {
          mainWindow.webContents.closeDevTools();
        } else {
          mainWindow.webContents.openDevTools();
        }
      }
    }
  });

  // Ctrl+Shift+I - DevTools (альтернатива)
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow) {
      if (activeTabId !== null) {
        const view = tabs.get(activeTabId);
        if (view) {
          view.webContents.toggleDevTools();
        }
      } else {
        mainWindow.webContents.toggleDevTools();
      }
    }
  });

  // Ctrl+R / F5 - Перезагрузка
  globalShortcut.register('CommandOrControl+R', () => {
    const view = tabs.get(activeTabId!);
    if (view) {
      view.webContents.reload();
    }
  });

  globalShortcut.register('F5', () => {
    const view = tabs.get(activeTabId!);
    if (view) {
      view.webContents.reload();
    }
  });

  // Управление вкладками и навигация — передаём в рендерер
  const sendShortcut = (action: string) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('app-shortcut', action);
    }
  };

  globalShortcut.register('CommandOrControl+T', () => sendShortcut('new-tab'));
  globalShortcut.register('CommandOrControl+Shift+N', () => sendShortcut('new-private-tab'));
  globalShortcut.register('CommandOrControl+W', () => sendShortcut('close-tab'));
  globalShortcut.register('CommandOrControl+Tab', () => sendShortcut('next-tab'));
  globalShortcut.register('CommandOrControl+Shift+Tab', () => sendShortcut('prev-tab'));
  globalShortcut.register('CommandOrControl+D', () => sendShortcut('add-bookmark'));
  globalShortcut.register('Alt+Left', () => sendShortcut('back'));
  globalShortcut.register('Alt+Right', () => sendShortcut('forward'));
}

// События приложения
app.whenReady().then(() => {
  // Блокировка рекламы (сессия по умолчанию для всех вкладок)
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    callback(shouldBlockRequest(details.url) ? { cancel: true } : {});
  });

  createWindow();
  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Отключаем глобальные горячие клавиши
  const { globalShortcut } = require('electron');
  globalShortcut.unregisterAll();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Дублируем обновление bounds по запросу рендерера (резерв)
ipcMain.on('window-resize', () => updateActiveViewBounds());
