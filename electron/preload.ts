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
};

// Экспортируем API в window.electron
contextBridge.exposeInMainWorld('electron', electronAPI);

// Типы для TypeScript
export type ElectronAPI = typeof electronAPI;
