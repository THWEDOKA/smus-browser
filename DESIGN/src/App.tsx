import { useState } from 'react';
import { Home, Plus, Settings, X } from 'lucide-react';
import svgPaths from './imports/svg-334w2an2at';

interface Tab {
  id: number;
  title: string;
  url: string;
  isHome: boolean;
}

interface FavoriteSlot {
  id: number;
  title: string;
  url: string | null;
}

function Background() {
  return (
    <div className="absolute h-[1399px] left-[-283px] top-[50px] w-[2551px]" data-name="Background">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2551 1399">
        <g id="Background">
          <rect fill="url(#paint0_linear_3_116)" height="1030" id="Rectangle 1" width="1920" x="283" />
          <circle cx="1830" cy="1017" fill="url(#paint1_linear_3_116)" id="Ellipse 1" r="325" />
          <circle cx="740" cy="1074" fill="url(#paint2_linear_3_116)" id="Ellipse 3" r="325" />
          <circle cx="325" cy="386" fill="url(#paint3_linear_3_116)" id="Ellipse 2" r="325" />
          <circle cx="2226" cy="367" fill="url(#paint4_linear_3_116)" id="Ellipse 4" r="325" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_3_116" x1="1243" x2="1243" y1="0" y2="1030">
            <stop offset="0.856815" stopColor="#7C7C7C" />
            <stop offset="0.861949" stopColor="#E2E2E2" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_3_116" x1="2028" x2="1182" y1="645" y2="1293">
            <stop stopColor="#32463D" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_3_116" x1="938" x2="92" y1="702" y2="1350">
            <stop stopColor="#32463D" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_3_116" x1="763.5" x2="-1260" y1="689.5" y2="-101.5">
            <stop stopColor="#32463D" />
            <stop offset="0.588883" stopColor="#D8DCDA" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint4_linear_3_116" x1="2424" x2="1578" y1="-5.00003" y2="643">
            <stop stopColor="#32463D" />
            <stop offset="1" stopColor="white" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <div className="absolute contents left-[715px] text-white top-[318px]" data-name="Logo">
      <p className="absolute font-['Jersey_20:Regular',sans-serif] leading-[normal] left-[824px] not-italic text-[128px] top-[318px]">SMUS</p>
      <p className="absolute font-['Montserrat:Thin',sans-serif] font-thin leading-[normal] left-[731px] text-[24px] top-[431px]">Браузер с открытым исходным кодом</p>
      <p className="absolute font-['Montserrat:Thin',sans-serif] font-thin leading-[0] left-[816px] text-[24px] top-[486px]">
        <span className="leading-[normal]">{`Создатель `}</span>
        <span className="font-['Montserrat:Black',sans-serif] font-black leading-[normal]">THWEDOKA</span>
      </p>
      <p className="absolute font-['Montserrat:Thin',sans-serif] font-thin leading-[normal] left-[715px] text-[24px] top-[457px]">Самый крутой, удобный и защищенный!</p>
    </div>
  );
}

function Search({ searchQuery, setSearchQuery, onSearch }: { searchQuery: string; setSearchQuery: (q: string) => void; onSearch: () => void }) {
  return (
    <div className="absolute contents left-[715px] top-[540px]" data-name="Search">
      <div className="absolute bg-[#d9d9d9] border border-black border-solid h-[70px] left-[715px] rounded-[68px] top-[540px] w-[490px]" data-name="Rounded rectangle" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder="Введите ваш запрос..."
        className="absolute bg-transparent font-['Montserrat:ExtraLight',sans-serif] font-extralight leading-[normal] left-[731px] text-[20px] text-black top-[563px] outline-none w-[450px]"
      />
      <p className="absolute font-['Montserrat:Medium',sans-serif] font-medium leading-[normal] left-[788px] text-[15px] text-white top-[635px]">Все данные защищены и никуда не уходят!</p>
    </div>
  );
}

function LogoAndSearch({ searchQuery, setSearchQuery, onSearch }: { searchQuery: string; setSearchQuery: (q: string) => void; onSearch: () => void }) {
  return (
    <div className="absolute contents left-[715px] top-[318px]" data-name="logoAndSearch">
      <Logo />
      <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={onSearch} />
    </div>
  );
}

function CarbonNextFilled({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div className={className || "relative size-[25px]"} data-name="carbon:next-filled" onClick={onClick}>
      <div className="absolute inset-[6.25%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.875 21.875">
          <path d={svgPaths.p32bb2800} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-1/4" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function MdiReload({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div className={className || "absolute left-[79px] size-[24px] top-[13px]"} data-name="mdi:reload" onClick={onClick}>
      <div className="absolute inset-[12.5%_4.17%_12.5%_8.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 18">
          <path d={svgPaths.p1d70e200} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function PageManage({ onBack, onForward, onReload }: { onBack: () => void; onForward: () => void; onReload: () => void }) {
  return (
    <div className="absolute contents left-[11px] top-[9px]" data-name="PageManage">
      <div className="absolute bg-[#7c7c7c] h-[32px] left-[11px] rounded-[30px] top-[9px] w-[100px]" />
      <div className="absolute flex items-center justify-center left-[17px] size-[25px] top-[13px] cursor-pointer hover:opacity-70 transition-opacity" onClick={onBack}>
        <div className="-scale-y-100 flex-none rotate-180">
          <CarbonNextFilled />
        </div>
      </div>
      <div className="absolute left-[48px] size-[25px] top-[13px] cursor-pointer hover:opacity-70 transition-opacity" data-name="carbon:next-filled" onClick={onForward}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
          <g id="carbon:next-filled">
            <path d={svgPaths.p38842880} fill="var(--fill-0, black)" id="Vector" />
            <g id="Vector_2" />
          </g>
        </svg>
      </div>
      <MdiReload className="absolute left-[79px] size-[24px] top-[13px] cursor-pointer hover:opacity-70 transition-opacity" onClick={onReload} />
    </div>
  );
}

function CarbonCloseFilled({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div className={className || "absolute left-[1885px] size-[25px] top-[13px]"} data-name="carbon:close-filled" onClick={onClick}>
      <div className="absolute inset-[6.25%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.875 21.875">
          <path d={svgPaths.p37777b80} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function PixelarticonsHome({ className }: { className?: string }) {
  return (
    <div className={className || "absolute left-[132px] size-[24px] top-[13px]"} data-name="pixelarticons:home">
      <div className="absolute inset-[16.67%_20.83%_20.83%_16.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
          <path d={svgPaths.p187e1f90} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function SiCloseFill({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div className={className || "absolute left-[267px] size-[15px] top-[18px]"} data-name="si:close-fill" onClick={onClick}>
      <div className="absolute inset-[28.1%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.56911 6.56911">
          <path d={svgPaths.p32664900} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function TabItem({ tab, isActive, onClick, onClose }: { tab: Tab; isActive: boolean; onClick: () => void; onClose: () => void }) {
  return (
    <div className="absolute contents" data-name="tab">
      <div 
        className={`absolute h-[30px] rounded-[30px] w-[170px] cursor-pointer transition-all ${isActive ? 'bg-[#d9d9d9]' : 'bg-[#b0b0b0] hover:bg-[#c0c0c0]'}`}
        onClick={onClick}
      />
      <p className={`absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] text-[12px] text-black pointer-events-none`}>
        {tab.title}
      </p>
      {tab.isHome && <PixelarticonsHome className="absolute size-[24px] pointer-events-none" />}
      <SiCloseFill className="absolute size-[15px] cursor-pointer hover:opacity-70 transition-opacity z-10" onClick={(e) => { e.stopPropagation(); onClose(); }} />
    </div>
  );
}

function TabsBar({ tabs, activeTabId, onTabClick, onTabClose, onAddTab }: { 
  tabs: Tab[]; 
  activeTabId: number; 
  onTabClick: (id: number) => void; 
  onTabClose: (id: number) => void;
  onAddTab: () => void;
}) {
  return (
    <div className="absolute left-[127px] top-[10px] flex gap-2">
      {tabs.map((tab, index) => (
        <div key={tab.id} style={{ position: 'relative', left: `${index * 175}px` }}>
          <div className={`bg-[${activeTabId === tab.id ? '#d9d9d9' : '#b0b0b0'}] h-[30px] rounded-[30px] w-[170px] cursor-pointer transition-all hover:bg-[#c0c0c0]`} onClick={() => onTabClick(tab.id)} />
          <p className="absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[${tab.isHome ? '29' : '10'}px] text-[12px] text-black top-[7px] pointer-events-none">
            {tab.title}
          </p>
          {tab.isHome && <Home className="absolute left-[5px] size-[24px] top-[3px] pointer-events-none" />}
          <X className="absolute right-[10px] size-[15px] top-[8px] cursor-pointer hover:opacity-70 transition-opacity z-10" onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }} />
        </div>
      ))}
      <div 
        className="absolute left-[${tabs.length * 175 + 10}px] top-0"
        onClick={onAddTab}
      >
        <Plus className="size-[24px] top-[3px] cursor-pointer hover:opacity-70 transition-opacity" />
      </div>
    </div>
  );
}

function LucidePlus({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div className={className || "absolute left-[304px] size-[24px] top-[13px]"} data-name="lucide:plus" onClick={onClick}>
      <div className="absolute inset-[20.83%]" data-name="Vector">
        <div className="absolute inset-[-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d="M1 8H15M8 1V15" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function WidgetTabsFavorite() {
  return (
    <div className="absolute contents left-[692px] top-[657px]" data-name="widgetTabsFavorite">
      <div className="absolute bg-white h-[208px] left-[692px] rounded-[30px] top-[657px] w-[535px]" />
      <p className="absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[897px] text-[12px] text-black top-[844px]">Избранные вкладки</p>
    </div>
  );
}

function FavoriteSlotItem({ slot, index, onClick }: { slot: FavoriteSlot; index: number; onClick: () => void }) {
  const leftPositions = [718, 799, 880, 961, 1042, 1123];
  
  return (
    <div className="absolute contents" data-name={`tabFavorite${index + 1}`}>
      <div 
        className={`absolute left-[${leftPositions[index]}px] rounded-[20px] size-[70px] top-[680px] cursor-pointer transition-all ${slot.url ? 'bg-[#4a5d54] hover:bg-[#5a6d64]' : 'bg-[#d9d9d9] hover:bg-[#c9c9c9]'}`}
        onClick={onClick}
      />
      <p className={`absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] left-[${leftPositions[index] + 17}px] text-[12px] ${slot.url ? 'text-white' : 'text-black'} top-[707px] pointer-events-none`}>
        {slot.url ? slot.title : 'Пусто'}
      </p>
    </div>
  );
}

function TabsFavorite({ favorites, onFavoriteClick }: { favorites: FavoriteSlot[]; onFavoriteClick: (id: number) => void }) {
  return (
    <div className="absolute contents left-[692px] top-[657px]" data-name="TabsFavorite">
      <WidgetTabsFavorite />
      {favorites.map((slot, index) => (
        <FavoriteSlotItem key={slot.id} slot={slot} index={index} onClick={() => onFavoriteClick(slot.id)} />
      ))}
    </div>
  );
}

function MaterialSymbolsSettingsRounded({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div className={className || "absolute left-[1854px] size-[25px] top-[13px]"} data-name="material-symbols:settings-rounded" onClick={onClick}>
      <div className="absolute inset-[8.33%_12.33%_8.33%_8.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.8333 20.8333">
          <path d={svgPaths.p143f2a00} fill="var(--fill-0, black)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 1, title: 'Главная страница', url: 'home', isHome: true }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<FavoriteSlot[]>([
    { id: 1, title: 'GitHub', url: 'https://github.com' },
    { id: 2, title: 'Stack', url: 'https://stackoverflow.com' },
    { id: 3, title: 'Пусто', url: null },
    { id: 4, title: 'Пусто', url: null },
    { id: 5, title: 'Пусто', url: null },
    { id: 6, title: 'Пусто', url: null },
  ]);
  const [nextTabId, setNextTabId] = useState(2);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const newTab: Tab = {
        id: nextTabId,
        title: searchQuery.length > 15 ? searchQuery.substring(0, 15) + '...' : searchQuery,
        url: searchQuery,
        isHome: false
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(nextTabId);
      setNextTabId(nextTabId + 1);
      setSearchQuery('');
    }
  };

  const handleAddTab = () => {
    const newTab: Tab = {
      id: nextTabId,
      title: 'Новая вкладка',
      url: 'about:blank',
      isHome: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);
  };

  const handleCloseTab = (id: number) => {
    if (tabs.length === 1) return;
    
    const newTabs = tabs.filter(tab => tab.id !== id);
    setTabs(newTabs);
    
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleFavoriteClick = (id: number) => {
    const favorite = favorites.find(f => f.id === id);
    if (favorite && favorite.url) {
      const newTab: Tab = {
        id: nextTabId,
        title: favorite.title,
        url: favorite.url,
        isHome: false
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(nextTabId);
      setNextTabId(nextTabId + 1);
    }
  };

  const handleBack = () => {
    console.log('Navigate back');
  };

  const handleForward = () => {
    console.log('Navigate forward');
  };

  const handleReload = () => {
    console.log('Reload page');
  };

  const handleSettings = () => {
    console.log('Open settings');
  };

  const handleClose = () => {
    console.log('Close browser');
  };

  return (
    <div className="bg-[#32463d] overflow-clip relative rounded-[30px] size-full min-h-screen" data-name="Main window">
      <Background />
      <LogoAndSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={handleSearch} />
      <PageManage onBack={handleBack} onForward={handleForward} onReload={handleReload} />
      <CarbonCloseFilled className="absolute left-[1885px] size-[25px] top-[13px] cursor-pointer hover:opacity-70 transition-opacity" onClick={handleClose} />
      
      <div className="absolute left-[127px] top-[10px]">
        {tabs.map((tab, index) => (
          <div key={tab.id} className="absolute" style={{ left: `${index * 175}px` }}>
            <div 
              className={`h-[30px] rounded-[30px] w-[170px] cursor-pointer transition-all ${activeTabId === tab.id ? 'bg-[#d9d9d9]' : 'bg-[#b0b0b0] hover:bg-[#c0c0c0]'}`}
              onClick={() => setActiveTabId(tab.id)}
            />
            <p className={`absolute font-['Montserrat:Light',sans-serif] font-light leading-[normal] ${tab.isHome ? 'left-[29px]' : 'left-[10px]'} text-[12px] text-black top-[7px] pointer-events-none`}>
              {tab.title}
            </p>
            {tab.isHome && <Home className="absolute left-[5px] size-[24px] top-[3px] pointer-events-none" />}
            <X 
              className="absolute right-[10px] size-[15px] top-[8px] cursor-pointer hover:opacity-70 transition-opacity z-10" 
              onClick={(e) => { e.stopPropagation(); handleCloseTab(tab.id); }} 
            />
          </div>
        ))}
      </div>

      <LucidePlus 
        className={`absolute size-[24px] top-[13px] cursor-pointer hover:opacity-70 transition-opacity`}
        style={{ left: `${127 + tabs.length * 175 + 10}px` }}
        onClick={handleAddTab}
      />
      
      <TabsFavorite favorites={favorites} onFavoriteClick={handleFavoriteClick} />
      <MaterialSymbolsSettingsRounded className="absolute left-[1854px] size-[25px] top-[13px] cursor-pointer hover:opacity-70 transition-opacity" onClick={handleSettings} />
      
      <div className="absolute flex h-[50px] items-center justify-center left-[119px] top-0 w-0">
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[50px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 1">
                <line id="Line 1" stroke="var(--stroke-0, black)" x2="50" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute flex h-[50px] items-center justify-center left-[1843px] top-0 w-0">
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[50px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 1">
                <line id="Line 1" stroke="var(--stroke-0, black)" x2="50" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
