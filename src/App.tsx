import { useState, useEffect, useRef } from 'react';
import { Home, Plus, Settings, X, ChevronLeft, ChevronRight, RotateCw, Lock, Unlock, Star, Minus, Maximize2, History, EyeOff, Download, Upload, Moon, Sun, CheckCircle, AlertCircle, Wifi, Link2, TrendingUp, Clock } from 'lucide-react';
import ErrorPage from './components/ErrorPage';

interface Tab {
  id: number;
  title: string;
  url: string;
  isHome: boolean;
  isSettings?: boolean;
  isHistory?: boolean;
  isPrivate?: boolean;
  loading?: boolean;
  isSecure?: boolean;
  error?: {
    code: number;
    description: string;
    url: string;
    type: 'connection' | 'dns' | 'blocked' | 'timeout' | 'unknown';
  } | null;
}

interface FavoriteSlot {
  id: number;
  title: string;
  url: string | null;
  favicon?: string;
}

interface HistoryItem {
  id: number;
  url: string;
  title: string;
  timestamp: number;
}

type SettingsSection = 'favorites' | 'history' | 'bookmarks' | 'data' | 'vpn';

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 1, title: 'Главная страница', url: 'home', isHome: true, loading: false, isSecure: true }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [addressBarValue, setAddressBarValue] = useState('');
  const [favorites, setFavorites] = useState<FavoriteSlot[]>([
    { id: 1, title: 'GitHub', url: 'https://github.com' },
    { id: 2, title: 'Stack', url: 'https://stackoverflow.com' },
    { id: 3, title: 'Пусто', url: null },
    { id: 4, title: 'Пусто', url: null },
    { id: 5, title: 'Пусто', url: null },
    { id: 6, title: 'Пусто', url: null },
  ]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [nextTabId, setNextTabId] = useState(2);
  const [newFavoriteUrl, setNewFavoriteUrl] = useState('');
  const [newFavoriteTitle, setNewFavoriteTitle] = useState('');
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('favorites');
  const [searchHistory, setSearchHistory] = useState<{ id: number; query: string; timestamp: number }[]>([]);
  const [bookmarks, setBookmarks] = useState<{ id: number; url: string; title: string }[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('smus_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [vpnKey, setVpnKey] = useState('');
  const [isVpnConnected, setIsVpnConnected] = useState(false);
  const [vpnStatus, setVpnStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string; duration?: number }>>([]);
  const tabsRef = useRef(tabs);
  const activeTabIdRef = useRef(activeTabId);
  tabsRef.current = tabs;
  activeTabIdRef.current = activeTabId;

  const activeTab = tabs.find(t => t.id === activeTabId);
  const showHomeScreen = activeTab?.isHome || false;
  const showSettings = activeTab?.isSettings || false;
  const showHistory = activeTab?.isHistory || false;
  const isCurrentFavorite = favorites.some(f => f.url === activeTab?.url);

  // Загружаем сохраненные данные
  useEffect(() => {
    const savedFavorites = localStorage.getItem('smus_favorites');
    const savedHistory = localStorage.getItem('smus_history');

    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }

    const savedSearchHistory = localStorage.getItem('smus_search_history');
    if (savedSearchHistory) {
      try {
        setSearchHistory(JSON.parse(savedSearchHistory));
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    }

    const savedBookmarks = localStorage.getItem('smus_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      }
    }

    const savedVpnKey = localStorage.getItem('smus_vpn_key');
    if (savedVpnKey) {
      try {
        setVpnKey(JSON.parse(savedVpnKey));
      } catch (e) {
        console.error('Failed to load VPN key:', e);
      }
    }
  }, []);

  // Сохраняем избранное
  useEffect(() => {
    localStorage.setItem('smus_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Сохраняем историю
  useEffect(() => {
    localStorage.setItem('smus_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('smus_search_history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('smus_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Сохраняем тему
  useEffect(() => {
    localStorage.setItem('smus_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Сохраняем VPN ключ
  useEffect(() => {
    localStorage.setItem('smus_vpn_key', JSON.stringify(vpnKey));
  }, [vpnKey]);

  // Обновляем адресную строку при смене вкладки
  useEffect(() => {
    if (activeTab) {
      setAddressBarValue(activeTab.url === 'home' || activeTab.url === 'settings' ? '' : activeTab.url);
    }
  }, [activeTabId, activeTab]);

  useEffect(() => {
    if (!window.electron) return;

    window.electron.onTabLoading((data) => {
      setTabs(prev => prev.map(tab =>
        tab.id === data.tabId ? { ...tab, loading: data.loading } : tab
      ));
    });

    window.electron.onTabNavigated((data) => {
       setTabs(prev => {
         const updatedTabs = prev.map(tab =>
           tab.id === data.tabId ? {
             ...tab,
             url: data.url,
             isSecure: data.url.startsWith('https://')
           } : tab
         );

         // Добавляем в историю после обновления
         const updatedTab = updatedTabs.find(t => t.id === data.tabId);
         if (updatedTab && !updatedTab.isHome && !updatedTab.isSettings && !updatedTab.isHistory && !updatedTab.isPrivate) {
           addToHistory(data.url, updatedTab.title);
         }

         return updatedTabs;
       });
     });

    window.electron.onTabTitleUpdated((data) => {
      setTabs(prev => prev.map(tab =>
        tab.id === data.tabId ? {
          ...tab,
          title: data.title.length > 20 ? data.title.substring(0, 20) + '...' : data.title
        } : tab
      ));
    });

    window.electron.onTabError((data) => {
      setTabs(prev => prev.map(tab =>
        tab.id === data.tabId ? {
          ...tab,
          loading: false,
          error: {
            code: data.error.code,
            description: data.error.description,
            url: data.error.url,
            type: data.error.type
          }
        } : tab
      ));
      window.electron.hideAllViews();
    });

    window.electron.onAppShortcut((action) => {
      const currentTabs = tabsRef.current;
      const currentActiveId = activeTabIdRef.current;
      switch (action) {
        case 'new-tab':
          handleAddTab();
          break;
        case 'new-private-tab':
          openPrivateTab();
          break;
        case 'close-tab':
          if (currentTabs.length > 1) handleCloseTab(currentActiveId);
          break;
        case 'next-tab': {
          const idx = currentTabs.findIndex(t => t.id === currentActiveId);
          if (idx >= 0 && idx < currentTabs.length - 1) handleTabClick(currentTabs[idx + 1].id);
          break;
        }
        case 'prev-tab': {
          const idx = currentTabs.findIndex(t => t.id === currentActiveId);
          if (idx > 0) handleTabClick(currentTabs[idx - 1].id);
          break;
        }
        case 'add-bookmark': {
          const tab = currentTabs.find(t => t.id === currentActiveId);
          if (tab && !tab.isHome && !tab.isSettings && !tab.isHistory && tab.url.startsWith('http')) {
            setBookmarks(prev => {
              if (prev.some(b => b.url === tab.url)) return prev;
              const newId = prev.length > 0 ? Math.max(...prev.map(b => b.id)) + 1 : 1;
              return [...prev, { id: newId, url: tab.url, title: tab.title }];
            });
          }
          break;
        }
        case 'back':
          handleBack();
          break;
        case 'forward':
          handleForward();
          break;
        default:
          break;
      }
    });
  }, []);

  const addToHistory = (url: string, title: string) => {
    setHistory(prev => {
      // Генерируем ID на основе текущей длины + timestamp для уникальности
      const newId = prev.length > 0 ? Math.max(...prev.map(h => h.id)) + 1 : 1;
      const newHistory = [
        { id: newId, url, title, timestamp: Date.now() },
        ...prev.slice(0, 99)
      ];
      return newHistory;
    });
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    } catch (_) {
      return false;
    }
  };

  const processSearchOrUrl = (input: string) => {
    if (!input.trim()) return '';

    if (input.includes('.') && !input.includes(' ') && isValidUrl(input)) {
      return input.startsWith('http') ? input : `https://${input}`;
    }

    return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    const url = processSearchOrUrl(query);
    if (!url) return;

    if (query) {
      setSearchHistory(prev => {
        const newId = prev.length > 0 ? Math.max(...prev.map(h => h.id)) + 1 : 1;
        return [{ id: newId, query, timestamp: Date.now() }, ...prev.slice(0, 99)];
      });
    }

    const tabId = nextTabId;
    const newTab: Tab = {
      id: tabId,
      title: searchQuery.length > 20 ? searchQuery.substring(0, 20) + '...' : searchQuery,
      url: url,
      isHome: false,
      loading: false,
      isSecure: url.startsWith('https://'),
      error: null
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(tabId);
    setNextTabId(tabId + 1);
    setSearchQuery('');

    if (window.electron) {
      await window.electron.createTab(tabId, url);
    }
  };

  const handleAddressBarNavigate = async () => {
    const url = processSearchOrUrl(addressBarValue);
    if (!url || !activeTab) return;

    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId ? {
        ...tab,
        url: url,
        isSecure: url.startsWith('https://'),
        loading: true,
        error: null
      } : tab
    ));

    if (window.electron) {
      await window.electron.navigate(activeTabId, url);
    }
  };

  const handleAddTab = async () => {
    // Создаем новую домашнюю вкладку вместо about:blank
    const newTab: Tab = {
      id: nextTabId,
      title: 'Главная страница',
      url: 'home',
      isHome: true,
      loading: false,
      isSecure: true
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);

    // Скрываем все BrowserView при переходе на домашнюю страницу
    if (window.electron) {
      await window.electron.hideAllViews();
    }
  };

  const openSettings = async () => {
    // Скрываем все BrowserView перед открытием настроек
    if (window.electron) {
      await window.electron.hideAllViews();
    }

    // Проверяем есть ли уже вкладка настроек
    const settingsTab = tabs.find(t => t.isSettings);
    if (settingsTab) {
      setActiveTabId(settingsTab.id);
      return;
    }

    // Создаем новую вкладку настроек
    const newTab: Tab = {
      id: nextTabId,
      title: 'Настройки',
      url: 'settings',
      isHome: false,
      isSettings: true,
      loading: false,
      isSecure: true
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);
  };

  const openHistory = async () => {
    // Скрываем все BrowserView перед открытием истории
    if (window.electron) {
      await window.electron.hideAllViews();
    }

    // Проверяем есть ли уже вкладка истории
    const historyTab = tabs.find(t => t.isHistory);
    if (historyTab) {
      setActiveTabId(historyTab.id);
      return;
    }

    // Создаем новую вкладку истории
    const newTab: Tab = {
      id: nextTabId,
      title: 'История',
      url: 'history',
      isHome: false,
      isHistory: true,
      loading: false,
      isSecure: true
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);
  };

  const handleCloseTab = async (id: number) => {
    if (tabs.length === 1) return;

    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);

    if (activeTabId === id) {
      const newActiveId = newTabs[newTabs.length - 1].id;
      setActiveTabId(newActiveId);
      if (window.electron) {
        await window.electron.switchTab(newActiveId);
      }
    }

    const closingTab = tabs.find(t => t.id === id);
    if (window.electron && !closingTab?.isHome && !closingTab?.isSettings && !closingTab?.isHistory) {
      await window.electron.closeTab(id);
    }
  };

  const handleTabClick = async (id: number) => {
    const newTab = tabs.find(t => t.id === id);

    setActiveTabId(id);

    if (window.electron) {
      // Если переключаемся на настройки, домашнюю или историю - скрываем все BrowserView
      if (newTab?.isHome || newTab?.isSettings || newTab?.isHistory) {
        await window.electron.hideAllViews();
      }
      // Если переключаемся на обычную вкладку - показываем её BrowserView
      else if (newTab && !newTab.isHome && !newTab.isSettings && !newTab.isHistory) {
        await window.electron.switchTab(id);
      }
    }
  };

  const handleFavoriteClick = async (id: number) => {
    const favorite = favorites.find(f => f.id === id);
    if (favorite && favorite.url) {
      const newTab: Tab = {
        id: nextTabId,
        title: favorite.title,
        url: favorite.url,
        isHome: false,
        loading: false,
        isSecure: favorite.url.startsWith('https://'),
        error: null
      };

      setTabs([...tabs, newTab]);
      setActiveTabId(nextTabId);
      setNextTabId(nextTabId + 1);

      if (window.electron) {
        await window.electron.createTab(nextTabId, favorite.url);
      }
    }
  };

  const toggleFavorite = () => {
    if (!activeTab || activeTab.isHome || activeTab.isSettings) return;

    if (isCurrentFavorite) {
      setFavorites(prev => prev.map(f =>
        f.url === activeTab.url ? { ...f, url: null, title: 'Пусто' } : f
      ));
    } else {
      const emptySlot = favorites.find(f => !f.url);
      if (emptySlot) {
        setFavorites(prev => prev.map(f =>
          f.id === emptySlot.id ? { ...f, url: activeTab.url, title: activeTab.title } : f
        ));
      }
    }
  };

  const addFavorite = () => {
    if (!newFavoriteUrl.trim()) return;

    const emptySlot = favorites.find(f => !f.url);
    if (emptySlot) {
      const url = processSearchOrUrl(newFavoriteUrl);
      const title = newFavoriteTitle.trim() || new URL(url).hostname;

      setFavorites(prev => prev.map(f =>
        f.id === emptySlot.id ? { ...f, url, title } : f
      ));

      setNewFavoriteUrl('');
      setNewFavoriteTitle('');
    } else {
      alert('Все слоты избранного заняты!');
    }
  };

  const removeFavorite = (id: number) => {
    setFavorites(prev => prev.map(f =>
      f.id === id ? { ...f, url: null, title: 'Пусто' } : f
    ));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('smus_history');
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('smus_search_history');
  };

  const removeBookmark = (id: number) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const exportBookmarks = () => {
    const data = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smus-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBookmarks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (Array.isArray(parsed) && parsed.every((x: unknown) => x && typeof x === 'object' && 'url' in x && 'title' in x)) {
          setBookmarks(prev => {
            const maxId = prev.length ? Math.max(...prev.map(x => x.id)) : 0;
            return [...prev, ...parsed.map((b: { url: string; title: string }, i: number) => ({ id: maxId + i + 1, url: b.url, title: b.title }))];
          });
        }
      } catch (_) {
        alert('Неверный формат файла закладок.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const openPrivateTab = async () => {
    if (window.electron) await window.electron.hideAllViews();
    const newTab: Tab = {
      id: nextTabId,
      title: 'Приватный режим',
      url: 'about:blank',
      isHome: false,
      isPrivate: true,
      loading: false,
      isSecure: false,
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(prev => prev + 1);
    if (window.electron) await window.electron.createTab(nextTabId, 'about:blank');
  };

  const clearCookies = async () => {
    alert('Функция очистки куки будет добавлена в следующей версии');
  };

  const connectVPN = async () => {
    if (!vpnKey.trim()) {
      showToast('error', 'Пожалуйста, введите Vless ключ');
      return;
    }

    setVpnStatus('connecting');
    
    try {
      // Отправляем VPN ключ в main процесс
      if (window.electron) {
         const result = await window.electron.connectVPN(vpnKey);
         if (result.success) {
           setIsVpnConnected(true);
           setVpnStatus('connected');
           showToast('success', 'VPN успешно подключен');
        } else {
          setVpnStatus('error');
          showToast('error', `Ошибка подключения VPN: ${result.error}`);
        }
      }
    } catch (error) {
      setVpnStatus('error');
      showToast('error', `Ошибка: ${error}`);
    }
  };

  const disconnectVPN = async () => {
    try {
      if (window.electron) {
        const result = await window.electron.disconnectVPN();
        if (result.success) {
          setIsVpnConnected(false);
          setVpnStatus('disconnected');
          showToast('success', 'VPN успешно отключен');
        }
      }
    } catch (error) {
      showToast('error', `Ошибка при отключении VPN: ${error}`);
    }
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message, duration }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const handleBack = async () => {
    if (window.electron) {
      await window.electron.goBack(activeTabId);
    }
  };

  const handleForward = async () => {
    if (window.electron) {
      await window.electron.goForward(activeTabId);
    }
  };

  const handleReload = async () => {
    if (window.electron) {
      await window.electron.reload(activeTabId);
    }
  };

  const handleMinimize = async () => {
    if (window.electron) {
      await window.electron.minimizeWindow();
    }
  };

  const handleMaximize = async () => {
    if (window.electron) {
      await window.electron.maximizeWindow();
    }
  };

  const handleClose = async () => {
    if (window.electron) {
      await window.electron.closeWindow();
    }
  };

  return (
    <div
      className={`w-full min-w-0 min-h-screen h-screen max-h-screen flex flex-col overflow-hidden relative transition-colors duration-300 ${
        isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#32463d]'
      }`}
      onDragStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
    >
       {/* Animated Background */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <svg className="w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
           <defs>
             <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor={isDarkMode ? "#0a0a0a" : "#32463D"}>
                 <animate attributeName="stop-color" values={isDarkMode ? "#0a0a0a;#1a1a1a;#2a2a2a;#0a0a0a" : "#32463D;#4a5d54;#5a6d64;#32463D"} dur="6s" repeatCount="indefinite" />
               </stop>
               <stop offset="100%" stopColor={isDarkMode ? "#2a2a2a" : "#7C7C7C"}>
                 <animate attributeName="stop-color" values={isDarkMode ? "#2a2a2a;#3a3a3a;#4a4a4a;#2a2a2a" : "#7C7C7C;#8C8C8C;#9C9C9C;#7C7C7C"} dur="6s" repeatCount="indefinite" />
               </stop>
             </linearGradient>
           </defs>
           <rect width="100%" height="100%" fill="url(#grad1)" />
           <circle cx="300" cy="200" r="250" fill={isDarkMode ? "#3a3a3a" : "#4a5d54"} opacity="0.3" className="animate-float-1" />
           <circle cx="1600" cy="800" r="300" fill={isDarkMode ? "#4a4a4a" : "#5a6d64"} opacity="0.3" className="animate-float-2" />
           <circle cx="1200" cy="300" r="200" fill={isDarkMode ? "#2a2a2a" : "#3d524a"} opacity="0.3" className="animate-float-3" />
           <circle cx="600" cy="900" r="280" fill={isDarkMode ? "#3a3a3a" : "#4a5d54"} opacity="0.3" className="animate-float-4" />
         </svg>
       </div>

      {/* Title Bar: вкладки слева, кнопки управления окном справа в одной строке */}
      <div
        className="relative z-10 flex items-center gap-2 px-3 py-2 min-h-[44px] drag-region"
        onDragStart={(e) => e.preventDefault()}
        onDrag={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 no-drag">
           {tabs.map((tab) => (
             <div
               key={tab.id}
               className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-all ${
                 isDarkMode
                   ? activeTabId === tab.id ? 'bg-[#404040]' : 'bg-[#2a2a2a] hover:bg-[#333333]'
                   : activeTabId === tab.id ? 'bg-[#d9d9d9]' : 'bg-[#b0b0b0] hover:bg-[#c0c0c0]'
               }`}
               onClick={() => handleTabClick(tab.id)}
               onMouseDown={(e) => {
                 if (e.button === 1) {
                   e.preventDefault();
                   handleCloseTab(tab.id);
                 }
               }}
             >
               {tab.isHome && <Home size={16} className={`${isDarkMode ? 'text-white' : 'text-black'} flex-shrink-0`} />}
               {tab.isSettings && <Settings size={16} className={`${isDarkMode ? 'text-white' : 'text-black'} flex-shrink-0`} />}
               {tab.isHistory && <History size={16} className={`${isDarkMode ? 'text-white' : 'text-black'} flex-shrink-0`} />}
               {tab.isPrivate && <EyeOff size={16} className={`${isDarkMode ? 'text-white' : 'text-black'} flex-shrink-0`} />}
               <span className={`text-xs font-light truncate max-w-[120px] ${isDarkMode ? 'text-white' : 'text-black'}`}>
                 {tab.loading ? 'Загрузка...' : tab.title}
               </span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }}
                  className="hover:bg-black/20 rounded-full p-0.5 transition-colors flex-shrink-0"
                >
                  <X size={12} className="text-black" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleAddTab}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>

        {/* Область перетаскивания окна (между вкладками и кнопками) */}
        <div
          className="flex-1 min-w-[60px] self-stretch drag-region"
          onDragStart={(e) => e.preventDefault()}
          onDrag={(e) => e.preventDefault()}
        />

         {/* Кнопки справа: Приватный режим, История, Настройки, Тема, Свернуть, Развернуть, Закрыть */}
         <div className="flex items-center gap-1 no-drag">
           <button
             onClick={openPrivateTab}
             className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
             title="Новая вкладка в приватном режиме (Ctrl+Shift+N)"
           >
             <EyeOff size={20} className="text-white" />
           </button>
           <button
             onClick={openHistory}
             className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
             title="История"
           >
             <History size={20} className="text-white" />
           </button>
           <button
             onClick={openSettings}
             className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
             title="Настройки"
           >
             <Settings size={20} className="text-white" />
           </button>
           <button
             onClick={() => setIsDarkMode(!isDarkMode)}
             className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
             title={isDarkMode ? "Светлая тема" : "Тёмная тема"}
           >
             {isDarkMode ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-white" />}
           </button>
           <button onClick={handleMinimize} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
             <Minus size={20} className="text-white" />
           </button>
           <button onClick={handleMaximize} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
             <Maximize2 size={20} className="text-white" />
           </button>
           <button onClick={handleClose} className="p-1.5 hover:bg-red-500/20 rounded-full transition-colors">
             <X size={20} className="text-white" />
           </button>
         </div>
      </div>

       {/* Address Bar */}
       {!showHomeScreen && !showSettings && !showHistory && (
         <div className="relative z-10 px-3 pb-2 no-drag">
           <div className={`flex items-center gap-2 rounded-full px-3 py-2 transition-colors ${isDarkMode ? 'bg-[#2a2a2a]' : 'bg-white'}`}>
             <button onClick={handleBack} className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#3a3a3a]' : 'hover:bg-gray-100'}`}>
               <ChevronLeft size={18} className={isDarkMode ? 'text-white' : 'text-black'} />
             </button>
             <button onClick={handleForward} className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#3a3a3a]' : 'hover:bg-gray-100'}`}>
               <ChevronRight size={18} className={isDarkMode ? 'text-white' : 'text-black'} />
             </button>
             <button onClick={handleReload} className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#3a3a3a]' : 'hover:bg-gray-100'}`}>
               <RotateCw size={16} className={isDarkMode ? 'text-white' : 'text-black'} />
             </button>

             <div className="flex items-center pl-2">
               {activeTab?.isSecure ? (
                 <Lock size={16} className="text-green-600" />
               ) : (
                 <Unlock size={16} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
               )}
             </div>

             <input
               type="text"
               value={addressBarValue}
               onChange={(e) => setAddressBarValue(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleAddressBarNavigate()}
               placeholder="Введите URL или поисковый запрос..."
               className={`flex-1 px-2 py-1 text-sm bg-transparent outline-none ${isDarkMode ? 'text-white placeholder:text-gray-500' : 'text-black placeholder:text-gray-400'}`}
             />

             <button
               onClick={toggleFavorite}
               className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-[#3a3a3a]' : 'hover:bg-gray-100'}`}
               disabled={activeTab?.isHome || activeTab?.isSettings}
             >
               <Star
                 size={18}
                 className={`${isCurrentFavorite ? 'text-yellow-500 fill-yellow-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
               />
             </button>
           </div>
         </div>
       )}

       {/* Settings Tab */}
       {showSettings && (
         <div className={`relative z-10 flex-1 overflow-y-auto px-8 py-6 no-drag transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#32463d]'}`}>
           <div className="max-w-4xl mx-auto">
             <h1 className={`text-4xl font-light mb-6 ${isDarkMode ? 'text-gray-100' : 'text-white'}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
               Настройки
             </h1>

             {/* Вкладки настроек */}
             <div className={`flex gap-2 mb-6 border-b pb-2 ${isDarkMode ? 'border-white/10' : 'border-white/20'}`}>
               <button
                 type="button"
                 onClick={() => setSettingsSection('favorites')}
                 className={`px-4 py-2 rounded-xl font-light transition-all ${
                   settingsSection === 'favorites' 
                     ? isDarkMode ? 'bg-white/20 text-white' : 'bg-white/20 text-white' 
                     : isDarkMode ? 'text-white/70 hover:bg-white/10' : 'text-white/70 hover:bg-white/10'
                 }`}
               >
                 Избранное
               </button>
               <button
                 type="button"
                 onClick={() => setSettingsSection('history')}
                 className={`px-4 py-2 rounded-xl font-light transition-all ${
                   settingsSection === 'history' 
                     ? isDarkMode ? 'bg-white/20 text-white' : 'bg-white/20 text-white' 
                     : isDarkMode ? 'text-white/70 hover:bg-white/10' : 'text-white/70 hover:bg-white/10'
                 }`}
               >
                 История
               </button>
               <button
                 type="button"
                 onClick={() => setSettingsSection('bookmarks')}
                 className={`px-4 py-2 rounded-xl font-light transition-all ${
                   settingsSection === 'bookmarks' 
                     ? isDarkMode ? 'bg-white/20 text-white' : 'bg-white/20 text-white' 
                     : isDarkMode ? 'text-white/70 hover:bg-white/10' : 'text-white/70 hover:bg-white/10'
                 }`}
               >
                 Закладки
               </button>
               <button
                 type="button"
                 onClick={() => setSettingsSection('data')}
                 className={`px-4 py-2 rounded-xl font-light transition-all ${
                   settingsSection === 'data' 
                     ? isDarkMode ? 'bg-white/20 text-white' : 'bg-white/20 text-white' 
                     : isDarkMode ? 'text-white/70 hover:bg-white/10' : 'text-white/70 hover:bg-white/10'
                 }`}
               >
                 Данные сайтов
               </button>
               <button
                 type="button"
                 onClick={() => setSettingsSection('vpn')}
                 className={`px-4 py-2 rounded-xl font-light transition-all ${
                   settingsSection === 'vpn' 
                     ? isDarkMode ? 'bg-white/20 text-white' : 'bg-white/20 text-white' 
                     : isDarkMode ? 'text-white/70 hover:bg-white/10' : 'text-white/70 hover:bg-white/10'
                 }`}
               >
                 VPN
               </button>
            </div>

             {settingsSection === 'favorites' && (
               <>
                 <div className={`mb-6 backdrop-blur-sm rounded-2xl p-6 border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                   <h2 className={`text-2xl font-light mb-4 ${isDarkMode ? 'text-gray-100' : 'text-white'}`}>Добавить в избранное</h2>
                   <div className="space-y-4">
                     <div>
                       <label className={`block text-sm font-light mb-2 ${isDarkMode ? 'text-gray-300' : 'text-white/90'}`}>URL сайта</label>
                       <input
                         type="text"
                         value={newFavoriteUrl}
                         onChange={(e) => setNewFavoriteUrl(e.target.value)}
                         placeholder="https://example.com"
                         className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                           isDarkMode
                             ? 'bg-white/10 text-white border-white/20 focus:ring-white/30 placeholder:text-gray-500'
                             : 'bg-white/90 text-black border-white/30 focus:ring-white/50 placeholder:text-gray-400'
                         }`}
                       />
                     </div>
                     <div>
                       <label className={`block text-sm font-light mb-2 ${isDarkMode ? 'text-gray-300' : 'text-white/90'}`}>Название (необязательно)</label>
                       <input
                         type="text"
                         value={newFavoriteTitle}
                         onChange={(e) => setNewFavoriteTitle(e.target.value)}
                         placeholder="Мой сайт"
                         className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                           isDarkMode
                             ? 'bg-white/10 text-white border-white/20 focus:ring-white/30 placeholder:text-gray-500'
                             : 'bg-white/90 text-black border-white/30 focus:ring-white/50 placeholder:text-gray-400'
                         }`}
                       />
                     </div>
                     <button
                       onClick={addFavorite}
                       className={`w-full px-6 py-3 rounded-xl transition-all font-light border ${
                         isDarkMode
                           ? 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                           : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
                       }`}
                     >
                       Добавить в избранное
                     </button>
                   </div>
                 </div>
                 <div className={`mb-6 backdrop-blur-sm rounded-2xl p-6 border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                   <h2 className={`text-2xl font-light mb-4 ${isDarkMode ? 'text-gray-100' : 'text-white'}`}>Избранные сайты</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {favorites.map((fav) => (
                      <div
                        key={fav.id}
                        className={`p-4 rounded-xl border transition-all ${
                          fav.url
                            ? 'bg-white/15 border-white/30 hover:bg-white/20'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        {fav.url ? (
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{fav.title}</p>
                              <p className="text-xs text-white/60 truncate mt-1">{fav.url}</p>
                            </div>
                            <button
                              onClick={() => removeFavorite(fav.id)}
                              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                            >
                              <X size={16} className="text-white/80" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-white/40 text-center text-sm">Пусто</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

             {settingsSection === 'history' && (
               <div className={`mb-6 backdrop-blur-sm rounded-2xl p-6 border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                 <h2 className={`text-2xl font-light mb-4 ${isDarkMode ? 'text-gray-100' : 'text-white'}`}>История поиска</h2>
                 <div className={`rounded-xl p-4 max-h-48 overflow-y-auto mb-4 border transition-colors ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-black/20 border-white/10'}`}>
                  {searchHistory.length === 0 ? (
                    <p className="text-white/60 text-sm text-center py-6">История поиска пуста</p>
                  ) : (
                    <div className="space-y-2">
                      {searchHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center"
                        >
                          <span className="text-sm text-white truncate">{item.query}</span>
                          <span className="text-xs text-white/40 shrink-0 ml-2">
                            {new Date(item.timestamp).toLocaleString('ru-RU')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={clearSearchHistory}
                  className="mr-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl text-sm border border-red-500/30"
                >
                  Очистить историю поиска
                </button>

                <h2 className="text-2xl font-light text-white mb-4 mt-8">История посещений</h2>
                <div className="bg-black/20 rounded-xl p-4 max-h-80 overflow-y-auto mb-4 border border-white/10">
                  {history.length === 0 ? (
                    <p className="text-white/60 text-sm text-center py-8">История посещений пуста</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                        >
                          <p className="text-sm font-medium text-white truncate">{item.title || item.url}</p>
                          <p className="text-xs text-white/60 truncate mt-1">{item.url}</p>
                          <p className="text-xs text-white/40 mt-1">
                            {new Date(item.timestamp).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={clearHistory}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl transition-all font-light border border-red-500/30"
                >
                  Очистить историю посещений
                </button>
              </div>
            )}

            {settingsSection === 'bookmarks' && (
              <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-light text-white mb-4">Закладки (Ctrl+D)</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    type="button"
                    onClick={exportBookmarks}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm border border-white/30"
                  >
                    <Download size={18} /> Экспорт
                  </button>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm border border-white/30 cursor-pointer">
                    <Upload size={18} /> Импорт
                    <input type="file" accept=".json,application/json" className="hidden" onChange={importBookmarks} />
                  </label>
                </div>
                <div className="bg-black/20 rounded-xl p-4 max-h-80 overflow-y-auto border border-white/10">
                  {bookmarks.length === 0 ? (
                    <p className="text-white/60 text-sm text-center py-8">Закладок пока нет</p>
                  ) : (
                    <div className="space-y-2">
                      {bookmarks.map((b) => (
                        <div key={b.id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white truncate">{b.title}</p>
                            <p className="text-xs text-white/60 truncate">{b.url}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => {
                                const newTab: Tab = { id: nextTabId, title: b.title, url: b.url, isHome: false, loading: false, isSecure: b.url.startsWith('https://'), error: null };
                                setTabs(prev => [...prev, newTab]);
                                setActiveTabId(nextTabId);
                                setNextTabId(prev => prev + 1);
                                window.electron?.createTab(nextTabId, b.url);
                              }}
                              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 text-xs"
                            >
                              Открыть
                            </button>
                            <button onClick={() => removeBookmark(b.id)} className="p-1.5 hover:bg-white/20 rounded-lg">
                              <X size={16} className="text-white/80" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {settingsSection === 'data' && (
               <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                 <h2 className="text-2xl font-light text-white mb-4">Данные сайтов</h2>
                 <button
                   onClick={clearCookies}
                   className="px-6 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-white rounded-xl transition-all font-light border border-orange-500/30"
                 >
                   Очистить куки и кэш
                 </button>
               </div>
             )}

             {settingsSection === 'vpn' && (
               <div className={`mb-6 backdrop-blur-sm rounded-2xl p-6 border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                 <h2 className={`text-2xl font-light mb-6 ${isDarkMode ? 'text-gray-100' : 'text-white'}`}>VPN Настройки</h2>
                 
                 <div className={`mb-6 p-4 rounded-xl border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                   <h3 className={`text-lg font-light mb-3 ${isDarkMode ? 'text-gray-200' : 'text-white'}`}>VPN Статус</h3>
                   <div className="flex items-center gap-3">
                     <div className={`w-3 h-3 rounded-full ${
                       vpnStatus === 'connected' ? 'bg-green-500' : 
                       vpnStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                       vpnStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                     }`}></div>
                      <span className={`text-sm font-light ${isDarkMode ? 'text-gray-300' : 'text-white/90'}`}>
                        {vpnStatus === 'connected' ? 'VPN Подключен' : 
                         vpnStatus === 'connecting' ? 'Подключение...' :
                         vpnStatus === 'error' ? 'Ошибка подключения' : 'VPN Отключен'}
                      </span>
                   </div>
                 </div>

                 <div className={`mb-4 p-4 rounded-xl border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                   <label className={`block text-sm font-light mb-3 ${isDarkMode ? 'text-gray-300' : 'text-white/90'}`}>
                     Vless Reality Ключ
                   </label>
                   <textarea
                     value={vpnKey}
                     onChange={(e) => setVpnKey(e.target.value)}
                     placeholder="vless://uuid@server:port?encryption=none&flow=xtls-rprx-vision&security=reality&sni=example.com&fp=chrome&pbk=key..."
                     className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all font-mono text-xs ${
                       isDarkMode
                         ? 'bg-white/10 text-white border-white/20 focus:ring-white/30 placeholder:text-gray-600'
                         : 'bg-white/90 text-black border-white/30 focus:ring-white/50 placeholder:text-gray-400'
                     }`}
                     rows={4}
                   />
                 </div>

                 <div className="flex gap-3">
                   <button
                     onClick={connectVPN}
                     disabled={vpnStatus === 'connected' || vpnStatus === 'connecting'}
                     className={`flex-1 px-6 py-3 rounded-xl transition-all font-light border ${
                       vpnStatus === 'connected' || vpnStatus === 'connecting'
                         ? isDarkMode 
                           ? 'bg-white/10 border-white/10 text-white/50 cursor-not-allowed' 
                           : 'bg-white/10 border-white/10 text-white/50 cursor-not-allowed'
                         : isDarkMode
                           ? 'bg-green-500/20 hover:bg-green-500/30 text-white border-green-500/30'
                           : 'bg-green-500/20 hover:bg-green-500/30 text-white border-green-500/30'
                     }`}
                   >
                     {vpnStatus === 'connecting' ? 'Подключение...' : 'Подключить VPN'}
                   </button>
                   <button
                     onClick={disconnectVPN}
                     disabled={vpnStatus !== 'connected'}
                     className={`flex-1 px-6 py-3 rounded-xl transition-all font-light border ${
                       vpnStatus !== 'connected'
                         ? isDarkMode 
                           ? 'bg-white/10 border-white/10 text-white/50 cursor-not-allowed' 
                           : 'bg-white/10 border-white/10 text-white/50 cursor-not-allowed'
                         : isDarkMode
                           ? 'bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/30'
                           : 'bg-red-500/20 hover:bg-red-500/30 text-white border-red-500/30'
                     }`}
                   >
                     Отключить VPN
                   </button>
                 </div>

                  <div className={`mt-4 p-4 rounded-lg border text-xs font-light ${
                    isDarkMode
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                      : 'bg-blue-100 border-blue-300 text-blue-900'
                  }`}>
                    VPN подключение работает только для браузера и не влияет на остальную систему.
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

       {/* History Tab - Firefox Style */}
       {showHistory && (
         <div className={`relative z-10 flex-1 overflow-y-auto no-drag transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-[#32463d]'}`}>
           <div className="max-w-6xl mx-auto px-6 py-6">
             {/* Header */}
             <div className="mb-8">
               <h1 className={`text-5xl font-bold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-300'}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                 История
               </h1>
               <p className={`text-sm font-light ${isDarkMode ? 'text-gray-400' : 'text-white/70'}`}>
                 {history.length > 0 ? `Всего посещений: ${history.length}` : 'История пуста'}
               </p>
             </div>

             <div className="grid grid-cols-3 gap-6 mb-8">
               {/* Statistics Cards */}
               {history.length > 0 && (
                 <>
                   {/* Most visited today */}
                   <div className={`rounded-2xl p-6 backdrop-blur-sm border transition-colors ${isDarkMode ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30' : 'bg-gradient-to-br from-blue-400/30 to-blue-500/20 border-blue-400/50'}`}>
                     <Link2 size={32} className={`mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-400'}`} />
                     <p className={`text-sm font-light ${isDarkMode ? 'text-blue-300' : 'text-blue-200'}`}>Уникальные сайты</p>
                     <p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-300'}`}>
                       {new Set(history.map(h => h.url)).size}
                     </p>
                   </div>

                   {/* Total visits */}
                   <div className={`rounded-2xl p-6 backdrop-blur-sm border transition-colors ${isDarkMode ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30' : 'bg-gradient-to-br from-green-400/30 to-green-500/20 border-green-400/50'}`}>
                     <TrendingUp size={32} className={`mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-400'}`} />
                     <p className={`text-sm font-light ${isDarkMode ? 'text-green-300' : 'text-green-200'}`}>Всего посещений</p>
                     <p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-green-400' : 'text-green-300'}`}>
                       {history.length}
                     </p>
                   </div>

                   {/* Last visit */}
                   <div className={`rounded-2xl p-6 backdrop-blur-sm border transition-colors ${isDarkMode ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30' : 'bg-gradient-to-br from-purple-400/30 to-purple-500/20 border-purple-400/50'}`}>
                     <Clock size={32} className={`mb-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-400'}`} />
                     <p className={`text-sm font-light ${isDarkMode ? 'text-purple-300' : 'text-purple-200'}`}>Последний визит</p>
                     <p className={`text-xs font-light mt-2 ${isDarkMode ? 'text-purple-300' : 'text-purple-200'}`}>
                       {new Date(history[0]?.timestamp || 0).toLocaleString('ru-RU')}
                     </p>
                   </div>
                 </>
               )}
             </div>

             {/* Grouped by Date */}
             {history.length === 0 ? (
               <div className={`rounded-2xl p-12 text-center backdrop-blur-sm border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                 <p className={`text-xl font-light ${isDarkMode ? 'text-gray-400' : 'text-white/70'}`}>
                   История пуста
                 </p>
                 <p className={`text-sm font-light mt-2 ${isDarkMode ? 'text-gray-500' : 'text-white/60'}`}>
                   Посещённые сайты будут отображаться здесь
                 </p>
               </div>
             ) : (
               <div className="space-y-6">
                 {(() => {
                   const grouped = {} as { [key: string]: typeof history };
                   history.forEach(item => {
                     const date = new Date(item.timestamp).toLocaleDateString('ru-RU', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric'
                     });
                     if (!grouped[date]) grouped[date] = [];
                     grouped[date].push(item);
                   });

                   return Object.entries(grouped).map(([date, items]) => (
                     <div key={date}>
                       {/* Date Header */}
                       <div className={`flex items-center gap-3 mb-4 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/10'}`}>
                         <div className={`h-px flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`} />
                         <span className={`font-light text-sm whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-white/70'}`}>
                           {date}
                         </span>
                         <div className={`h-px flex-1 ${isDarkMode ? 'bg-white/20' : 'bg-white/30'}`} />
                       </div>

                       {/* Items for this date */}
                       <div className="space-y-2 pl-4">
                         {items.map((item, idx) => (
                           <div
                             key={item.id}
                             className={`flex items-start gap-4 p-4 rounded-xl transition-all hover:scale-102 cursor-pointer backdrop-blur-sm border ${
                               isDarkMode
                                 ? 'bg-gradient-to-r from-white/5 to-white/0 hover:from-green-500/20 hover:to-green-500/0 border-white/10 hover:border-green-500/30'
                                 : 'bg-gradient-to-r from-white/10 to-white/0 hover:from-green-400/30 hover:to-green-400/0 border-white/20 hover:border-green-400/50'
                             }`}
                             style={{ animationDelay: `${idx * 0.05}s`, opacity: 0, animation: 'scale-in 0.6s ease-out forwards' }}
                           >
                             {/* Time */}
                             <div className={`text-xs font-light whitespace-nowrap pt-1 ${isDarkMode ? 'text-gray-500' : 'text-white/60'}`}>
                               {new Date(item.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                             </div>

                             {/* Content */}
                             <div className="flex-1 min-w-0">
                               <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-white'}`}>
                                 {item.title || 'Без названия'}
                               </p>
                               <p className={`text-xs truncate mt-1 ${isDarkMode ? 'text-gray-500' : 'text-white/60'}`}>
                                 {item.url}
                               </p>
                             </div>

                             {/* Visit count indicator */}
                             <div className={`text-xs font-light whitespace-nowrap px-3 py-1 rounded-full ${isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-white/20 text-white/80'}`}>
                               Посещено
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   ));
                 })()}
               </div>
             )}

             {/* Popular Sites - Top Right */}
             {history.length > 0 && (
               <div className="mt-12">
                 <h2 className={`text-2xl font-light mb-6 ${isDarkMode ? 'text-gray-100' : 'text-white'}`}>
                   Популярные сайты
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {(() => {
                     const siteCount = {} as { [key: string]: { count: number; title: string; url: string } };
                     history.forEach(item => {
                       if (!siteCount[item.url]) {
                         siteCount[item.url] = { count: 0, title: item.title, url: item.url };
                       }
                       siteCount[item.url].count++;
                     });
                     
                     return Object.values(siteCount)
                       .sort((a, b) => b.count - a.count)
                       .slice(0, 6)
                       .map((site, idx) => (
                         <div
                           key={site.url}
                           className={`p-4 rounded-xl backdrop-blur-sm border transition-all hover:scale-105 ${
                             isDarkMode
                               ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/50'
                               : 'bg-gradient-to-br from-amber-400/30 to-amber-500/20 border-amber-400/50 hover:border-amber-400/70'
                           }`}
                           style={{ animationDelay: `${idx * 0.1}s`, opacity: 0, animation: 'scale-in 0.6s ease-out forwards' }}
                         >
                           <p className={`font-medium truncate ${isDarkMode ? 'text-amber-300' : 'text-amber-200'}`}>
                             {site.title || new URL(site.url).hostname}
                           </p>
                           <p className={`text-xs truncate mt-1 ${isDarkMode ? 'text-amber-500/60' : 'text-amber-600/60'}`}>
                             {site.url}
                           </p>
                           <p className={`text-sm font-bold mt-3 ${isDarkMode ? 'text-amber-400' : 'text-amber-300'}`}>
                             {site.count} {site.count === 1 ? 'посещение' : 'посещений'}
                           </p>
                         </div>
                       ));
                   })()}
                 </div>
               </div>
             )}

             {/* Clear Button */}
             {history.length > 0 && (
               <div className="mt-12 flex justify-center">
                 <button
                   onClick={clearHistory}
                   className={`px-8 py-3 rounded-xl font-light transition-all transform hover:scale-105 border ${
                     isDarkMode
                       ? 'bg-red-500/20 hover:bg-red-500/40 text-red-300 border-red-500/40 hover:border-red-500/60'
                       : 'bg-red-500/30 hover:bg-red-500/50 text-red-200 border-red-400/50 hover:border-red-400/70'
                   }`}
                 >
                   Очистить всю историю
                 </button>
               </div>
             )}
           </div>
         </div>
       )}

      {/* Error Page */}
      {activeTab && activeTab.error && !showHomeScreen && !showSettings && !showHistory && (
        <ErrorPage
          errorType={activeTab.error.type}
          url={activeTab.error.url}
          onRetry={async () => {
            setTabs(prev => prev.map(tab =>
              tab.id === activeTabId ? { ...tab, error: null, loading: true } : tab
            ));
            await window.electron.switchTab(activeTabId);
            await new Promise(resolve => setTimeout(resolve, 100));
            handleAddressBarNavigate();
          }}
          onGoHome={async () => {
            await window.electron.hideAllViews();
            handleAddTab();
          }}
        />
      )}

       {/* Loading Indicator - Enhanced */}
       {activeTab && activeTab.loading && !activeTab.error && !showHomeScreen && !showSettings && !showHistory && (
         <div className={`absolute top-[calc(44px+2.5rem)] left-0 right-0 bottom-0 z-50 flex items-center justify-center backdrop-blur-md transition-colors ${isDarkMode ? 'bg-gradient-to-b from-[#1a1a1a]/90 to-[#0a0a0a]/95' : 'bg-gradient-to-b from-[#32463d]/90 to-[#1a2a24]/95'}`}>
           <div className="flex flex-col items-center gap-8 max-w-md">
             {/* Animated Logo with Glow */}
             <div className="relative mb-4">
               <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${isDarkMode ? 'bg-green-500/30' : 'bg-green-500/40'}`} />
               <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/40' : 'bg-gradient-to-br from-green-400/30 to-green-500/20 border border-green-400/50'}`}>
                 <div className="absolute inset-2 rounded-full border-3 border-transparent border-t-green-400 border-r-green-400 animate-spin" />
                 <span className="text-5xl font-black" style={{ fontFamily: "'Jersey 10', sans-serif", color: isDarkMode ? '#4ade80' : '#86efac' }}>S</span>
               </div>
             </div>

             {/* Loading Text with Animation */}
             <div className="text-center">
               <h2 className={`text-2xl font-light mb-2 tracking-widest ${isDarkMode ? 'text-green-400' : 'text-green-300'}`}>
                 Загрузка
                 <span className="inline-block ml-1">
                   <span className="animate-bounce inline-block" style={{ animationDelay: '0s' }}>.</span>
                   <span className="animate-bounce inline-block" style={{ animationDelay: '0.2s' }}>.</span>
                   <span className="animate-bounce inline-block" style={{ animationDelay: '0.4s' }}>.</span>
                 </span>
               </h2>
               <p className={`text-sm font-light ${isDarkMode ? 'text-gray-400' : 'text-white/70'}`}>
                 Пожалуйста, подождите
               </p>
             </div>

             {/* Progress Bar */}
             <div className="w-full space-y-3">
               <div className={`h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-white/15'}`}>
                 <div
                   className={`h-full rounded-full transition-all duration-1000 ${isDarkMode ? 'bg-gradient-to-r from-green-500/60 to-green-400/80' : 'bg-gradient-to-r from-green-400/70 to-green-300/90'}`}
                   style={{
                     animation: 'progress 2s ease-in-out infinite',
                     width: '30%'
                   }}
                 />
               </div>
               <p className={`text-xs text-center font-light ${isDarkMode ? 'text-gray-500' : 'text-white/60'}`}>
                 Загружаем страницу...
               </p>
             </div>

             {/* Loading Tips */}
             <div className={`text-center text-xs font-light max-w-xs ${isDarkMode ? 'text-gray-500' : 'text-white/60'}`}>
               <p>Совет: используйте Ctrl+R для перезагрузки</p>
             </div>
           </div>

           <style>{`
             @keyframes progress {
               0% { width: 10%; }
               50% { width: 85%; }
               100% { width: 10%; }
             }
           `}</style>
         </div>
       )}

       {/* Home Screen - Beautiful & Animated */}
       {showHomeScreen && (
         <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 no-drag min-h-0 overflow-hidden">
           {/* Animated decorative elements */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animation: 'float-slow 8s ease-in-out infinite' }} />
             <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animation: 'float-slow 10s ease-in-out infinite reverse' }} />
             <div className="absolute -bottom-1/3 left-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animation: 'float-slow 12s ease-in-out infinite' }} />
           </div>

           {/* Main content */}
           <div className="relative z-20 w-full max-w-3xl">
             {/* Logo & Title with animation */}
             <style>{`
               @keyframes float-slow {
                 0%, 100% { transform: translateY(0px); }
                 50% { transform: translateY(30px); }
               }
               @keyframes pulse-glow {
                 0%, 100% { text-shadow: 0 0 20px rgba(74, 222, 128, 0.3); }
                 50% { text-shadow: 0 0 40px rgba(74, 222, 128, 0.6); }
               }
               @keyframes scale-in {
                 from { opacity: 0; transform: scale(0.8); }
                 to { opacity: 1; transform: scale(1); }
               }
               @keyframes slide-in-left {
                 from { opacity: 0; transform: translateX(-30px); }
                 to { opacity: 1; transform: translateX(0); }
               }
               @keyframes slide-in-up {
                 from { opacity: 0; transform: translateY(30px); }
                 to { opacity: 1; transform: translateY(0); }
               }
               .animate-scale-in { animation: scale-in 0.8s ease-out; }
               .animate-slide-left { animation: slide-in-left 0.8s ease-out; }
               .animate-slide-up { animation: slide-in-up 0.8s ease-out; }
               .glow-text { animation: pulse-glow 3s ease-in-out infinite; }
             `}</style>

             <div className="text-center mb-10 animate-scale-in">
               <div className="mb-6 flex justify-center">
                 <div className="relative">
                   <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                   <h1 className={`text-9xl font-black mb-2 glow-text ${isDarkMode ? 'text-green-400' : 'text-green-300'}`} style={{ fontFamily: "'Jersey 10', sans-serif", letterSpacing: '4px' }}>
                     SMUS
                   </h1>
                 </div>
               </div>

               <div className="space-y-3 mb-6">
                 <p className={`text-2xl font-light tracking-wide animate-slide-left ${isDarkMode ? 'text-gray-200' : 'text-white'}`}>
                   Браузер нового поколения
                 </p>
                 <p className={`text-lg font-extralight ${isDarkMode ? 'text-gray-400' : 'text-white/80'}`}>
                   Быстрый • Безопасный • Красивый
                 </p>
                  <div className="pt-2">
                    <p className={`inline-block px-4 py-1 rounded-full ${isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-500/30 text-green-200'} text-sm font-light`}>
                      Open Source by THWEDOKA
                    </p>
                  </div>
               </div>
             </div>

             {/* Search Form with animation */}
             <form
               className="w-full mb-8 animate-slide-up"
               onSubmit={(e) => {
                 e.preventDefault();
                 handleSearch();
               }}
               style={{ animationDelay: '0.2s', opacity: 0, animation: 'slide-in-up 0.8s ease-out 0.2s forwards' }}
             >
               <div className="flex gap-3 w-full mb-4">
                 <div className="flex-1 relative group">
                   <div className={`absolute inset-0 rounded-full blur-xl transition-all ${isDarkMode ? 'bg-green-500/20 group-focus-within:bg-green-500/40' : 'bg-green-500/30 group-focus-within:bg-green-500/50'}`} />
                   <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                     placeholder="Введите URL или поисковый запрос..."
                     autoComplete="off"
                     className={`relative w-full px-6 py-4 rounded-full border-2 text-lg font-light outline-none transition-all duration-300 ${
                       isDarkMode
                         ? 'bg-[#2a2a2a] border-green-500/30 text-white placeholder:text-gray-600 focus:border-green-500/60 focus:ring-2 focus:ring-green-500/20'
                         : 'bg-white border-green-400/40 text-black placeholder:text-gray-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/30'
                     }`}
                   />
                 </div>
                  <button
                    type="submit"
                    className={`px-8 py-4 rounded-full font-light shrink-0 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      isDarkMode
                        ? 'bg-green-500/30 hover:bg-green-500/50 text-green-200 border border-green-500/40'
                        : 'bg-green-500/40 hover:bg-green-500/60 text-white border border-green-400/50'
                    }`}
                  >
                    Найти
                  </button>
               </div>
                <p className={`text-xs text-center font-light ${isDarkMode ? 'text-gray-500' : 'text-white/70'}`}>
                  Все данные остаются на вашем устройстве
                </p>
             </form>

             {/* Favorites section with enhanced design */}
             <div
               className={`rounded-3xl p-8 w-full shadow-2xl border transition-colors animate-slide-up ${
                 isDarkMode
                   ? 'bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-green-500/20'
                   : 'bg-gradient-to-br from-white to-gray-50 border-green-400/30'
               }`}
               style={{ animationDelay: '0.4s', opacity: 0, animation: 'slide-in-up 0.8s ease-out 0.4s forwards' }}
             >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-light tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Избранные сайты
                  </h2>
                 <div className={`h-px flex-1 ml-4 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-400/20'}`} />
               </div>

               <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                 {favorites.map((slot, idx) => (
                   <button
                     key={slot.id}
                     onClick={() => handleFavoriteClick(slot.id)}
                     className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-light transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 ${
                       slot.url
                         ? isDarkMode
                           ? 'bg-gradient-to-br from-green-500/30 to-green-600/20 hover:from-green-500/50 hover:to-green-600/30 text-green-100 border border-green-500/40'
                           : 'bg-gradient-to-br from-green-400/40 to-green-500/30 hover:from-green-400/60 hover:to-green-500/50 text-white border border-green-400/50'
                         : isDarkMode
                         ? 'bg-[#3a3a3a]/50 hover:bg-[#4a4a4a]/50 text-gray-500 border border-gray-600/30'
                         : 'bg-gray-200/50 hover:bg-gray-300/50 text-gray-400 border border-gray-300'
                     } shadow-md`}
                     style={{ animationDelay: `${0.5 + idx * 0.05}s`, opacity: 0, animation: 'scale-in 0.6s ease-out forwards' }}
                   >
                     <span className="truncate px-1 font-medium">{slot.url ? slot.title : '+'}</span>
                   </button>
                 ))}
               </div>

               <p className={`text-center text-xs mt-6 font-light ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                 Нажмите на звёздочку в адресной строке, чтобы добавить сайт в избранное
               </p>
             </div>

             {/* Quick features */}
             <div
               className="grid grid-cols-3 gap-4 mt-8 px-4"
               style={{ animationDelay: '0.6s', opacity: 0, animation: 'slide-in-up 0.8s ease-out 0.6s forwards' }}
             >
               <div className={`p-4 rounded-xl text-center ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-400/10 border border-blue-400/30'}`}>
                 <div className="text-2xl mb-2">🌙</div>
                 <p className={`text-xs font-light ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Тёмная тема</p>
               </div>
               <div className={`p-4 rounded-xl text-center ${isDarkMode ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-400/10 border border-purple-400/30'}`}>
                 <div className="text-2xl mb-2">🔐</div>
                 <p className={`text-xs font-light ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>VPN поддержка</p>
               </div>
               <div className={`p-4 rounded-xl text-center ${isDarkMode ? 'bg-orange-500/10 border border-orange-500/30' : 'bg-orange-400/10 border border-orange-400/30'}`}>
                 <div className="text-2xl mb-2">📂</div>
                 <p className={`text-xs font-light ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`}>История</p>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Toast Notifications */}
       <div className="fixed bottom-6 right-6 z-[9999] space-y-3 pointer-events-none">
         {toasts.map((toast) => (
           <div
             key={toast.id}
             className={`flex items-center gap-3 px-5 py-4 rounded-lg shadow-2xl backdrop-blur-sm border pointer-events-auto animate-in fade-in slide-in-from-right-4 transition-all ${
               toast.type === 'success'
                 ? 'bg-green-500/20 border-green-500/40 text-green-100'
                 : toast.type === 'error'
                 ? 'bg-red-500/20 border-red-500/40 text-red-100'
                 : 'bg-blue-500/20 border-blue-500/40 text-blue-100'
             }`}
           >
             <div className="flex-shrink-0">
               {toast.type === 'success' && <CheckCircle size={20} className="text-green-400" />}
               {toast.type === 'error' && <AlertCircle size={20} className="text-red-400" />}
               {toast.type === 'info' && <Wifi size={20} className="text-blue-400" />}
             </div>
             <span className="text-sm font-light max-w-xs">{toast.message}</span>
           </div>
         ))}
       </div>
     </div>
   );
}
