import { contextBridge, ipcRenderer } from 'electron';

// API для взаимодействия с главным процессом
const electronAPI = {
  // Управление вкладками
  createTab: (tabId: number, url: string) =>
    ipcRenderer.invoke('create-tab', { tabId, url }),

  switchTab: (tabId: number) =>
    ipcRenderer.invoke('switch-tab', { tabId }),

  closeTab: (tabId: number) =>
    ipcRenderer.invoke('close-tab', { tabId }),

  hideAllViews: () =>
    ipcRenderer.invoke('hide-all-views'),

  // Навигация
  navigate: (tabId: number, url: string) =>
    ipcRenderer.invoke('navigate', { tabId, url }),

  goBack: (tabId: number) =>
    ipcRenderer.invoke('go-back', { tabId }),

  goForward: (tabId: number) =>
    ipcRenderer.invoke('go-forward', { tabId }),

  reload: (tabId: number) =>
    ipcRenderer.invoke('reload', { tabId }),

  // Управление окном
  closeWindow: () =>
    ipcRenderer.invoke('close-window'),

  minimizeWindow: () =>
    ipcRenderer.invoke('minimize-window'),

  maximizeWindow: () =>
    ipcRenderer.invoke('maximize-window'),

  // События от главного процесса
  onTabLoading: (callback: (data: { tabId: number; loading: boolean }) => void) => {
    ipcRenderer.on('tab-loading', (event, data) => callback(data));
  },

  onTabNavigated: (callback: (data: { tabId: number; url: string }) => void) => {
    ipcRenderer.on('tab-navigated', (event, data) => callback(data));
  },

  onTabTitleUpdated: (callback: (data: { tabId: number; title: string }) => void) => {
    ipcRenderer.on('tab-title-updated', (event, data) => callback(data));
  },

  onTabError: (callback: (data: {
    tabId: number;
    error: {
      code: number;
      description: string;
      url: string;
      type: 'connection' | 'dns' | 'blocked' | 'timeout' | 'unknown';
    }
  }) => void) => {
    ipcRenderer.on('tab-error', (event, data) => callback(data));
  },

  onAppShortcut: (callback: (action: string) => void) => {
     ipcRenderer.on('app-shortcut', (event, action: string) => callback(action));
   },

   // VPN управление
   connectVPN: (vpnKey: string) =>
     ipcRenderer.invoke('connect-vpn', { vpnKey }),

   disconnectVPN: () =>
     ipcRenderer.invoke('disconnect-vpn'),

   // Zoom управление
   pageZoom: (action: 'zoom-in' | 'zoom-out') =>
     ipcRenderer.send('page-zoom', { action }),

   zoomIn: (tabId: number) =>
     ipcRenderer.invoke('zoom-in', { tabId }),

   zoomOut: (tabId: number) =>
     ipcRenderer.invoke('zoom-out', { tabId }),

   zoomReset: (tabId: number) =>
     ipcRenderer.invoke('zoom-reset', { tabId }),

   // Fullscreen события
   onEnterFullscreen: (callback: (data: { tabId: number }) => void) => {
     ipcRenderer.on('enter-fullscreen', (event, data) => callback(data));
   },

   onLeaveFullscreen: (callback: (data: { tabId: number }) => void) => {
     ipcRenderer.on('leave-fullscreen', (event, data) => callback(data));
   },

    onZoomChanged: (callback: (data: { tabId: number; zoomLevel: number }) => void) => {
      ipcRenderer.on('tab-zoom-changed', (event, data) => callback(data));
    },

    // Downloads управление
    getDownloads: () =>
      ipcRenderer.invoke('get-downloads'),

    pauseDownload: (id: string) =>
      ipcRenderer.invoke('pause-download', { id }),

    resumeDownload: (id: string) =>
      ipcRenderer.invoke('resume-download', { id }),

    cancelDownload: (id: string) =>
      ipcRenderer.invoke('cancel-download', { id }),

    openDownloadsFolder: () =>
      ipcRenderer.invoke('open-downloads-folder'),

    removeDownload: (id: string) =>
      ipcRenderer.invoke('remove-download', { id }),

    // Download события
    onDownloadRequested: (callback: (data: any) => void) => {
      ipcRenderer.on('download-requested', (event, data) => callback(data));
    },

    confirmDownload: (id: string, filename: string, url: string, fileSize: number) =>
      ipcRenderer.invoke('confirm-download', { downloadId: id, filename, url, fileSize }),

    cancelDownloadRequest: (id: string) =>
      ipcRenderer.invoke('cancel-download-request', { downloadId: id }),

    onDownloadProgress: (callback: (data: any) => void) => {
      ipcRenderer.on('download-progress', (event, data) => callback(data));
    },

    onDownloadDone: (callback: (data: any) => void) => {
      ipcRenderer.on('download-done', (event, data) => callback(data));
    },
  };

// Экспортируем API в window.electron
contextBridge.exposeInMainWorld('electron', electronAPI);

// Типы для TypeScript
export type ElectronAPI = typeof electronAPI;
