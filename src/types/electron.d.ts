declare global {
  interface Window {
    electron: {
      createTab: (tabId: number, url: string) => Promise<{ success: boolean; error?: string }>;
      switchTab: (tabId: number) => Promise<{ success: boolean; error?: string }>;
      closeTab: (tabId: number) => Promise<{ success: boolean; error?: string }>;
      hideAllViews: () => Promise<{ success: boolean; error?: string }>;
      navigate: (tabId: number, url: string) => Promise<{ success: boolean; error?: string }>;
      goBack: (tabId: number) => Promise<{ success: boolean; error?: string }>;
      goForward: (tabId: number) => Promise<{ success: boolean; error?: string }>;
      reload: (tabId: number) => Promise<{ success: boolean; error?: string }>;
      closeWindow: () => Promise<{ success: boolean; error?: string }>;
      minimizeWindow: () => Promise<{ success: boolean; error?: string }>;
      maximizeWindow: () => Promise<{ success: boolean; error?: string }>;
      onTabLoading: (callback: (data: { tabId: number; loading: boolean }) => void) => void;
      onTabNavigated: (callback: (data: { tabId: number; url: string }) => void) => void;
      onTabTitleUpdated: (callback: (data: { tabId: number; title: string }) => void) => void;
      onTabError: (callback: (data: {
        tabId: number;
        error: {
          code: number;
          description: string;
          url: string;
          type: 'connection' | 'dns' | 'blocked' | 'timeout' | 'unknown';
        }
      }) => void) => void;
      onAppShortcut: (callback: (action: string) => void) => void;
    };
  }
}

export {};
