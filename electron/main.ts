import { app, BrowserWindow, BrowserView, ipcMain, session, DownloadItem } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

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
let vpnProxy: string | null = null;
let isVpnConnected = false;
let fullscreenTabId: number | null = null;

// Хранилище для скачиваний
interface Download {
  id: string;
  filename: string;
  url: string;
  filePath: string;
  totalBytes: number;
  receivedBytes: number;
  state: 'in-progress' | 'completed' | 'cancelled' | 'interrupted';
  startTime: number;
  finishTime?: number;
  speed: number; // bytes per second
  paused: boolean;
}

const downloads = new Map<string, Download>();
const downloadItems = new Map<string, DownloadItem>();
let downloadsFolderPath = '';

const isDev = !app.isPackaged;

// Высота панели (тайтлбар + адресная строка). Совпадает с UI для корректного resize.
const TOP_BAR_HEIGHT = 100;

function updateActiveViewBounds() {
  if (!mainWindow || activeTabId === null) return;
  const view = tabs.get(activeTabId);
  if (!view) return;
  const bounds = mainWindow.getBounds();
  
  // Если текущая вкладка в fullscreen - не отступ сверху
  const topOffset = fullscreenTabId === activeTabId ? 0 : TOP_BAR_HEIGHT;
  
  view.setBounds({
    x: 0,
    y: topOffset,
    width: Math.max(0, bounds.width),
    height: Math.max(0, bounds.height - topOffset),
  });
}

function createWindow() {
   // Инициализируем папку скачиваний
   downloadsFolderPath = path.join(app.getPath('downloads'), 'SMUS Browser');
   if (!fs.existsSync(downloadsFolderPath)) {
     fs.mkdirSync(downloadsFolderPath, { recursive: true });
   }

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

    // Обработка zoom (Ctrl + колесико) через JavaScript injection
    view.webContents.on('dom-ready', () => {
      view.webContents.executeJavaScript(`
        (function() {
          document.addEventListener('wheel', function(e) {
            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
              e.preventDefault();
              // Отправляем информацию о scroll через window.electron API
              const isZoomIn = e.deltaY < 0; // вверх = уменьшение deltaY = zoom in
              const action = isZoomIn ? 'zoom-in' : 'zoom-out';
              if (window.electron && window.electron.pageZoom) {
                window.electron.pageZoom(action);
              }
            }
          }, { passive: false });
        })();
      `);
    });

    // Обработка fullscreen
    view.webContents.on('enter-html-full-screen', () => {
      fullscreenTabId = tabId;
      updateActiveViewBounds();
      mainWindow?.webContents.send('enter-fullscreen', { tabId });
    });

     view.webContents.on('leave-html-full-screen', () => {
       fullscreenTabId = null;
       updateActiveViewBounds();
       mainWindow?.webContents.send('leave-fullscreen', { tabId });
     });

      // Обработка скачиваний - отправляем запрос подтверждения
      view.webContents.session.on('will-download', (event, item, webContents) => {
        event.preventDefault(); // Пауза до подтверждения
        
        const downloadId = `download-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const filename = item.getFilename();
        const filePath = path.join(downloadsFolderPath, filename);
        const fileSize = item.getTotalBytes();

        // Отправляем запрос подтверждения в React
        mainWindow?.webContents.send('download-requested', {
          id: downloadId,
          filename,
          url: item.getURL(),
          fileSize,
          item, // Передаем item для последующей обработки
        });

        // Сохраняем item для доступа после подтверждения
        downloadItems.set(downloadId, item);
      });

      // IPC обработчик для подтверждения загрузки
      ipcMain.handle('confirm-download', async (event, { downloadId, filename, url, fileSize }) => {
        const item = downloadItems.get(downloadId);
        if (!item) return { success: false, error: 'Download item not found' };

        const filePath = path.join(downloadsFolderPath, filename);

        const download: Download = {
          id: downloadId,
          filename,
          url,
          filePath,
          totalBytes: fileSize,
          receivedBytes: 0,
          state: 'in-progress',
          startTime: Date.now(),
          speed: 0,
          paused: false,
        };

        downloads.set(downloadId, download);
        item.setSavePath(filePath);

        // Обработчики скачивания
        setupDownloadHandlers(downloadId, item, download, filename, filePath);

        return { success: true };
      });

      // Функция для настройки обработчиков скачивания
      const setupDownloadHandlers = (downloadId: string, item: DownloadItem, download: Download, filename: string, filePath: string) => {
        item.on('updated', () => {
          const received = item.getReceivedBytes();
          const total = item.getTotalBytes();
          const elapsed = (Date.now() - download.startTime) / 1000;
          const speed = elapsed > 0 ? received / elapsed : 0;

          download.receivedBytes = received;
          download.speed = speed;

          mainWindow?.webContents.send('download-progress', {
            id: downloadId,
            filename,
            totalBytes: total,
            receivedBytes: received,
            progress: total > 0 ? (received / total) * 100 : 0,
            speed,
            state: download.state,
            paused: item.isPaused(),
          });
        });

        item.on('done', (event, state) => {
          download.state = state as any;
          download.finishTime = Date.now();

          mainWindow?.webContents.send('download-done', {
            id: downloadId,
            filename,
            filePath,
            state,
            totalBytes: download.totalBytes,
          });
        });
      };

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

// Zoom handlers
ipcMain.handle('zoom-in', async (event, { tabId }) => {
  try {
    const view = tabs.get(tabId);
    if (view) {
      const currentZoom = view.webContents.getZoomFactor();
      const newZoom = Math.min(currentZoom + 0.1, 3);
      view.webContents.setZoomFactor(newZoom);
    }
    return { success: true };
  } catch (error) {
    console.error('Error zooming in:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('zoom-out', async (event, { tabId }) => {
  try {
    const view = tabs.get(tabId);
    if (view) {
      const currentZoom = view.webContents.getZoomFactor();
      const newZoom = Math.max(currentZoom - 0.1, 0.3);
      view.webContents.setZoomFactor(newZoom);
    }
    return { success: true };
  } catch (error) {
    console.error('Error zooming out:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('zoom-reset', async (event, { tabId }) => {
  try {
    const view = tabs.get(tabId);
    if (view) {
      view.webContents.setZoomFactor(1);
    }
    return { success: true };
  } catch (error) {
    console.error('Error resetting zoom:', error);
    return { success: false, error: String(error) };
  }
});

// Обработчик zoom с клавиатуры (Ctrl + колесико)
ipcMain.on('page-zoom', (event, { action }) => {
  if (activeTabId === null) return;
  
  const view = tabs.get(activeTabId);
  if (!view) return;
  
  const currentZoom = view.webContents.getZoomFactor();
  let newZoom = currentZoom;
  
  if (action === 'zoom-in') {
    newZoom = Math.min(currentZoom + 0.1, 3.0);
  } else if (action === 'zoom-out') {
    newZoom = Math.max(currentZoom - 0.1, 0.3);
  }
  
  if (newZoom !== currentZoom) {
    view.webContents.setZoomFactor(newZoom);
    mainWindow?.webContents.send('tab-zoom-changed', { tabId: activeTabId, zoomLevel: newZoom });
   }
});

// Cancel download request - отклонить скачивание
ipcMain.handle('cancel-download-request', async (event, { downloadId }) => {
  try {
    const item = downloadItems.get(downloadId);
    if (item) {
      item.cancel();
    }
    downloadItems.delete(downloadId);
    return { success: true };
  } catch (error) {
    console.error('Error cancelling download request:', error);
    return { success: false, error: String(error) };
  }
});

// Confirm download - начать скачивание после подтверждения
ipcMain.handle('confirm-download', async (event, { downloadId, filename, url, fileSize }) => {
  try {
    const item = downloadItems.get(downloadId);
    if (!item) return { success: false, error: 'Download item not found' };

    const filePath = path.join(downloadsFolderPath, filename);

    const download: Download = {
      id: downloadId,
      filename,
      url,
      filePath,
      totalBytes: fileSize,
      receivedBytes: 0,
      state: 'in-progress',
      startTime: Date.now(),
      speed: 0,
      paused: false,
    };

    downloads.set(downloadId, download);
    item.setSavePath(filePath);

    // Обработчики для отслеживания прогресса
    item.on('updated', () => {
      const received = item.getReceivedBytes();
      const total = item.getTotalBytes();
      const elapsed = (Date.now() - download.startTime) / 1000;
      const speed = elapsed > 0 ? received / elapsed : 0;

      download.receivedBytes = received;
      download.speed = speed;

      mainWindow?.webContents.send('download-progress', {
        id: downloadId,
        filename,
        totalBytes: total,
        receivedBytes: received,
        progress: total > 0 ? (received / total) * 100 : 0,
        speed,
        state: download.state,
        paused: item.isPaused(),
      });
    });

    // Обработчик завершения
    item.on('done', (event, state) => {
      download.state = state as any;
      download.finishTime = Date.now();

      mainWindow?.webContents.send('download-done', {
        id: downloadId,
        filename,
        filePath,
        state,
        totalBytes: download.totalBytes,
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Error confirming download:', error);
    return { success: false, error: String(error) };
  }
});

// Downloads обработчики
ipcMain.handle('get-downloads', async () => {
  const downloadsList = Array.from(downloads.values()).map(d => ({
    id: d.id,
    filename: d.filename,
    url: d.url,
    totalBytes: d.totalBytes,
    receivedBytes: d.receivedBytes,
    state: d.state,
    progress: d.totalBytes > 0 ? (d.receivedBytes / d.totalBytes) * 100 : 0,
    speed: d.speed,
    startTime: d.startTime,
    finishTime: d.finishTime,
    paused: d.paused,
  }));
  return downloadsList;
});

ipcMain.handle('pause-download', async (event, { id }) => {
  const item = downloadItems.get(id);
  if (item) {
    item.pause();
    const download = downloads.get(id);
    if (download) {
      download.paused = true;
    }
    return { success: true };
  }
  return { success: false, error: 'Download not found' };
});

ipcMain.handle('resume-download', async (event, { id }) => {
  const item = downloadItems.get(id);
  if (item && item.canResume()) {
    item.resume();
    const download = downloads.get(id);
    if (download) {
      download.paused = false;
    }
    return { success: true };
  }
  return { success: false, error: 'Cannot resume download' };
});

ipcMain.handle('cancel-download', async (event, { id }) => {
  const item = downloadItems.get(id);
  if (item) {
    item.cancel();
    const download = downloads.get(id);
    if (download) {
      download.state = 'cancelled';
    }
    downloadItems.delete(id);
    return { success: true };
  }
  return { success: false, error: 'Download not found' };
});

ipcMain.handle('open-downloads-folder', async () => {
  const { shell } = require('electron');
  await shell.openPath(downloadsFolderPath);
  return { success: true };
});

ipcMain.handle('remove-download', async (event, { id }) => {
  downloads.delete(id);
  downloadItems.delete(id);
  return { success: true };
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

// VPN функции
function parseVlessKey(vlessKey: string): { proxy: string; error?: string } {
  try {
    // Парсим Vless ключ формата: vless://uuid@server:port?parameters
    if (!vlessKey.startsWith('vless://')) {
      return { proxy: '', error: 'Ключ должен начинаться с vless://' };
    }

    const url = new URL(vlessKey);
    const server = url.hostname;
    const port = url.port || '443';
    
    if (!server) {
      return { proxy: '', error: 'Не удалось получить адрес сервера из ключа' };
    }

    // Используем SOCKS5 прокси через ssh-like туннель
    // Для браузера мы используем простой прокси формат
    const proxyUrl = `socks5://${server}:${port}`;
    return { proxy: proxyUrl };
  } catch (error) {
    return { proxy: '', error: `Ошибка парсинга ключа: ${error}` };
  }
}

function applyVPNProxy(proxyUrl: string): void {
  try {
    // Применяем прокси к сессии для новых вкладок
    const electronSession = session.defaultSession;
    const proxyAddress = proxyUrl.replace('socks5://', '');
    
    electronSession.setProxy({
      proxyRules: `socks5://${proxyAddress}`
    }).catch(err => {
      console.error('Ошибка установки прокси:', err);
    });

    vpnProxy = proxyUrl;
    isVpnConnected = true;
    console.log('✓ VPN прокси успешно применен:', proxyUrl);
  } catch (error) {
    console.error('Ошибка при применении VPN прокси:', error);
  }
}

function removeVPNProxy(): void {
  try {
    // Удаляем прокси
    const electronSession = session.defaultSession;
    electronSession.setProxy({ mode: 'direct' }).catch(err => {
      console.error('Ошибка удаления прокси:', err);
    });

    vpnProxy = null;
    isVpnConnected = false;
    console.log('✓ VPN прокси удален');
  } catch (error) {
    console.error('Ошибка при удалении VPN прокси:', error);
  }
}

// IPC обработчики для VPN
ipcMain.handle('connect-vpn', async (event, { vpnKey }) => {
  try {
    const { proxy, error } = parseVlessKey(vpnKey);
    
    if (error) {
      return { success: false, error };
    }

    applyVPNProxy(proxy);
    return { success: true, message: 'VPN подключен' };
  } catch (error) {
    console.error('Ошибка подключения VPN:', error);
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('disconnect-vpn', async () => {
  try {
    removeVPNProxy();
    return { success: true, message: 'VPN отключен' };
  } catch (error) {
    console.error('Ошибка отключения VPN:', error);
    return { success: false, error: String(error) };
  }
});

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
