import { useState, useEffect, useRef } from 'react';
import { Home, Plus, Settings, X, ChevronLeft, ChevronRight, RotateCw, Lock, Unlock, Star, Minus, Maximize2, History, EyeOff, Download, Upload } from 'lucide-react';
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

type SettingsSection = 'favorites' | 'history' | 'bookmarks' | 'data';

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
      setTabs(prev => prev.map(tab =>
        tab.id === data.tabId ? {
          ...tab,
          url: data.url,
          isSecure: data.url.startsWith('https://')
        } : tab
      ));

      const tab = tabs.find(t => t.id === data.tabId);
      if (tab && !tab.isHome && !tab.isSettings && !tab.isHistory && !tab.isPrivate) {
        addToHistory(data.url, tab.title);
      }
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

    const newTab: Tab = {
      id: nextTabId,
      title: searchQuery.length > 20 ? searchQuery.substring(0, 20) + '...' : searchQuery,
      url: url,
      isHome: false,
      loading: false,
      isSecure: url.startsWith('https://'),
      error: null
    };

    setTabs([...tabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);
    setSearchQuery('');

    if (window.electron) {
      await window.electron.createTab(nextTabId, url);
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
      className="w-full min-w-0 min-h-screen h-screen max-h-screen bg-[#32463d] flex flex-col overflow-hidden relative"
      onDragStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#32463D">
                <animate attributeName="stop-color" values="#32463D;#4a5d54;#5a6d64;#32463D" dur="6s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#7C7C7C">
                <animate attributeName="stop-color" values="#7C7C7C;#8C8C8C;#9C9C9C;#7C7C7C" dur="6s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad1)" />
          <circle cx="300" cy="200" r="250" fill="#4a5d54" opacity="0.3" className="animate-float-1" />
          <circle cx="1600" cy="800" r="300" fill="#5a6d64" opacity="0.3" className="animate-float-2" />
          <circle cx="1200" cy="300" r="200" fill="#3d524a" opacity="0.3" className="animate-float-3" />
          <circle cx="600" cy="900" r="280" fill="#4a5d54" opacity="0.3" className="animate-float-4" />
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
                activeTabId === tab.id ? 'bg-[#d9d9d9]' : 'bg-[#b0b0b0] hover:bg-[#c0c0c0]'
              }`}
              onClick={() => handleTabClick(tab.id)}
              onMouseDown={(e) => {
                if (e.button === 1) {
                  e.preventDefault();
                  handleCloseTab(tab.id);
                }
              }}
            >
              {tab.isHome && <Home size={16} className="text-black flex-shrink-0" />}
              {tab.isSettings && <Settings size={16} className="text-black flex-shrink-0" />}
              {tab.isHistory && <History size={16} className="text-black flex-shrink-0" />}
              {tab.isPrivate && <EyeOff size={16} className="text-black flex-shrink-0" />}
              <span className="text-xs font-light text-black truncate max-w-[120px]">
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

        {/* Кнопки справа: Приватный режим, История, Настройки, Свернуть, Развернуть, Закрыть */}
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
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2">
            <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={18} className="text-black" />
            </button>
            <button onClick={handleForward} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronRight size={18} className="text-black" />
            </button>
            <button onClick={handleReload} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <RotateCw size={16} className="text-black" />
            </button>

            <div className="flex items-center pl-2">
              {activeTab?.isSecure ? (
                <Lock size={16} className="text-green-600" />
              ) : (
                <Unlock size={16} className="text-gray-400" />
              )}
            </div>

            <input
              type="text"
              value={addressBarValue}
              onChange={(e) => setAddressBarValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddressBarNavigate()}
              placeholder="Введите URL или поисковый запрос..."
              className="flex-1 px-2 py-1 text-sm text-black bg-transparent outline-none"
            />

            <button
              onClick={toggleFavorite}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              disabled={activeTab?.isHome || activeTab?.isSettings}
            >
              <Star
                size={18}
                className={`${isCurrentFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {showSettings && (
        <div className="relative z-10 flex-1 overflow-y-auto px-8 py-6 no-drag">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-light text-white mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Настройки
            </h1>

            {/* Вкладки настроек */}
            <div className="flex gap-2 mb-6 border-b border-white/20 pb-2">
              <button
                type="button"
                onClick={() => setSettingsSection('favorites')}
                className={`px-4 py-2 rounded-xl font-light transition-all ${
                  settingsSection === 'favorites' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Избранное
              </button>
              <button
                type="button"
                onClick={() => setSettingsSection('history')}
                className={`px-4 py-2 rounded-xl font-light transition-all ${
                  settingsSection === 'history' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                История
              </button>
              <button
                type="button"
                onClick={() => setSettingsSection('bookmarks')}
                className={`px-4 py-2 rounded-xl font-light transition-all ${
                  settingsSection === 'bookmarks' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Закладки
              </button>
              <button
                type="button"
                onClick={() => setSettingsSection('data')}
                className={`px-4 py-2 rounded-xl font-light transition-all ${
                  settingsSection === 'data' ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Данные сайтов
              </button>
            </div>

            {settingsSection === 'favorites' && (
              <>
                <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h2 className="text-2xl font-light text-white mb-4">Добавить в избранное</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-light text-white/90 mb-2">URL сайта</label>
                      <input
                        type="text"
                        value={newFavoriteUrl}
                        onChange={(e) => setNewFavoriteUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-4 py-3 bg-white/90 text-black rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-light text-white/90 mb-2">Название (необязательно)</label>
                      <input
                        type="text"
                        value={newFavoriteTitle}
                        onChange={(e) => setNewFavoriteTitle(e.target.value)}
                        placeholder="Мой сайт"
                        className="w-full px-4 py-3 bg-white/90 text-black rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      />
                    </div>
                    <button
                      onClick={addFavorite}
                      className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all font-light border border-white/30"
                    >
                      Добавить в избранное
                    </button>
                  </div>
                </div>
                <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h2 className="text-2xl font-light text-white mb-4">Избранные сайты</h2>
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
              <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-light text-white mb-4">История поиска</h2>
                <div className="bg-black/20 rounded-xl p-4 max-h-48 overflow-y-auto mb-4 border border-white/10">
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
          </div>
        </div>
      )}

      {/* History Tab (отдельная вкладка браузера) */}
      {showHistory && (
        <div className="relative z-10 flex-1 overflow-y-auto px-8 py-6 no-drag">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-light text-white mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              История
            </h1>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-light text-white mb-3">История поиска</h2>
              <div className="bg-black/20 rounded-xl p-4 max-h-48 overflow-y-auto mb-4 border border-white/10">
                {searchHistory.length === 0 ? (
                  <p className="text-white/60 text-sm text-center py-6">История поиска пуста</p>
                ) : (
                  <div className="space-y-2">
                    {searchHistory.map((item) => (
                      <div key={item.id} className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between items-center">
                        <span className="text-sm text-white truncate">{item.query}</span>
                        <span className="text-xs text-white/40">{new Date(item.timestamp).toLocaleString('ru-RU')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <h2 className="text-xl font-light text-white mb-3 mt-6">История посещений</h2>
              <div className="bg-black/20 rounded-xl p-4 max-h-96 overflow-y-auto border border-white/10">
                {history.length === 0 ? (
                  <p className="text-white/60 text-sm text-center py-8">История посещений пуста</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10">
                        <p className="text-sm font-medium text-white truncate">{item.title || item.url}</p>
                        <p className="text-xs text-white/60 truncate mt-1">{item.url}</p>
                        <p className="text-xs text-white/40 mt-1">{new Date(item.timestamp).toLocaleString('ru-RU')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={clearSearchHistory} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl text-sm border border-red-500/30">
                  Очистить поиск
                </button>
                <button onClick={clearHistory} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-xl text-sm border border-red-500/30">
                  Очистить посещения
                </button>
              </div>
            </div>
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

      {/* Loading Indicator */}
      {activeTab && activeTab.loading && !activeTab.error && !showHomeScreen && !showSettings && !showHistory && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#32463d]/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            {/* Spinning Logo */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Jersey 10', sans-serif" }}>S</span>
              </div>
            </div>
            <p className="text-white text-lg font-light animate-pulse">Загрузка...</p>
          </div>
        </div>
      )}

      {/* Home Screen */}
      {showHomeScreen && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 no-drag min-h-0">
          <div className="text-center mb-8">
            <h1 className="text-8xl font-bold text-white mb-4" style={{ fontFamily: "'Jersey 10', sans-serif" }}>
              SMUS
            </h1>
            <p className="text-white/90 text-xl font-thin">Браузер с открытым исходным кодом</p>
            <p className="text-white/90 text-xl font-thin">Самый крутой, удобный и защищенный!</p>
            <p className="text-white/90 text-lg font-thin mt-2">
              Создатель <span className="font-black">THWEDOKA</span>
            </p>
          </div>

          <form
            className="w-full max-w-lg mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Введите URL или поисковый запрос..."
                autoComplete="off"
                className="flex-1 px-6 py-4 rounded-full bg-[#d9d9d9] border border-black text-black text-lg font-light placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="px-6 py-4 rounded-full bg-[#4a5d54] hover:bg-[#5a6d64] text-white font-light shrink-0"
              >
                Найти
              </button>
            </div>
            <p className="text-white/80 text-sm text-center mt-2 font-medium">
              Все данные защищены и никуда не уходят!
            </p>
          </form>

          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl">
            <div className="grid grid-cols-6 gap-3 mb-2">
              {favorites.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleFavoriteClick(slot.id)}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-light transition-colors ${
                    slot.url
                      ? 'bg-[#4a5d54] hover:bg-[#5a6d64] text-white'
                      : 'bg-[#d9d9d9] hover:bg-[#c9c9c9] text-black'
                  }`}
                >
                  <span className="truncate px-1">{slot.url ? slot.title : 'Пусто'}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-black/60 mt-2">Избранные вкладки</p>
          </div>
        </div>
      )}
    </div>
  );
}
