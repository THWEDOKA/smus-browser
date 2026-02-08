interface Window {
  electron: {
    // Tab management
    createTab: (tabId: number, url: string) => Promise<{ success: boolean; error?: string }>;
    switchTab: (tabId: number) => Promise<{ success: boolean; error?: string }>;
    closeTab: (tabId: number) => Promise<{ success: boolean; error?: string }>;
    hideAllViews: () => Promise<{ success: boolean; error?: string }>;

    // Navigation
    navigate: (tabId: number, url: string) => Promise<{ success: boolean; error?: string }>;
    goBack: (tabId: number) => Promise<{ success: boolean; error?: string }>;
    goForward: (tabId: number) => Promise<{ success: boolean; error?: string }>;
    reload: (tabId: number) => Promise<{ success: boolean; error?: string }>;

    // Window controls
    closeWindow: () => Promise<{ success: boolean; error?: string }>;
    minimizeWindow: () => Promise<{ success: boolean; error?: string }>;
    maximizeWindow: () => Promise<{ success: boolean; error?: string }>;

    // Zoom
    pageZoom: (action: 'zoom-in' | 'zoom-out') => void;
    zoomIn: (tabId: number) => Promise<{ success: boolean; error?: string }>;
    zoomOut: (tabId: number) => Promise<{ success: boolean; error?: string }>;
    zoomReset: (tabId: number) => Promise<{ success: boolean; error?: string }>;

    // VPN
    connectVPN: (vpnKey: string) => Promise<{ success: boolean; error?: string }>;
    disconnectVPN: () => Promise<{ success: boolean; error?: string }>;

    // Event listeners
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
    onEnterFullscreen: (callback: (data: { tabId: number }) => void) => void;
    onLeaveFullscreen: (callback: (data: { tabId: number }) => void) => void;
    onZoomChanged: (callback: (data: { tabId: number; zoomLevel: number }) => void) => void;
  };
}
